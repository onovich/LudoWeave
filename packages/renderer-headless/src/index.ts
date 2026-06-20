import type { ResolvedUiFrame } from "@ludoweave/core";

/**
 * Result returned by the headless renderer after consuming a full frame.
 *
 * @public
 */
export interface HeadlessRenderResult {
  readonly rendererId: string;
  readonly frameId: number;
  readonly frame: ResolvedUiFrame;
  readonly snapshot: string;
}

/**
 * Minimal headless renderer interface for deterministic frame snapshots.
 *
 * @public
 */
export interface HeadlessRenderer {
  readonly id: string;
  render(frame: ResolvedUiFrame): HeadlessRenderResult;
  dispose(): void;
}

/**
 * Options for {@link createHeadlessRenderer}.
 *
 * @public
 */
export interface HeadlessRendererOptions {
  readonly id?: string;
}

/**
 * Serializes a frame using stable object key ordering for deterministic snapshots.
 *
 * @public
 */
export function serializeHeadlessFrame(frame: ResolvedUiFrame): string {
  return `${JSON.stringify(toCanonicalJson(frame), null, 2)}\n`;
}

/**
 * Creates a renderer that records frame consumption without touching DOM or canvas APIs.
 *
 * @public
 */
export function createHeadlessRenderer(options: HeadlessRendererOptions = {}): HeadlessRenderer {
  const id = options.id ?? "ludoweave.headless";
  let disposed = false;

  return {
    id,
    render(frame) {
      if (disposed) {
        throw new Error("HeadlessRenderer has been disposed.");
      }

      return {
        rendererId: id,
        frameId: frame.frameId,
        frame,
        snapshot: serializeHeadlessFrame(frame),
      };
    },
    dispose() {
      disposed = true;
    },
  };
}

type CanonicalJson =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalJson[]
  | { readonly [key: string]: CanonicalJson };

function toCanonicalJson(value: unknown): CanonicalJson {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toCanonicalJson(entry));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, CanonicalJson> = {};
    for (const key of Object.keys(record).sort()) {
      const child = record[key];
      if (child !== undefined) {
        normalized[key] = toCanonicalJson(child);
      }
    }
    return normalized;
  }

  throw new TypeError("Headless snapshots only support JSON-serializable frames.");
}
