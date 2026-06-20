import type { UiNodeInput } from "@ludoweave/core";

/**
 * Props accepted by a renderer-agnostic pure component.
 *
 * @public
 */
export type ComponentProps = Readonly<Record<string, unknown>>;

/**
 * Pure component render function. It must derive UiNodeInput only from props.
 *
 * @public
 */
export type PureComponent<Props extends ComponentProps = ComponentProps> = (
  props: Readonly<Props>,
) => UiNodeInput;

/**
 * Metadata attached to a pure component definition.
 *
 * @public
 */
export interface PureComponentMetadata {
  readonly displayName: string;
}

/**
 * Renderer-agnostic component definition consumed by LudoWeave packages.
 *
 * @public
 */
export interface DefinedPureComponent<Props extends ComponentProps = ComponentProps> {
  readonly kind: "ludoweave.pure-component";
  readonly metadata: PureComponentMetadata;
  render(props: Readonly<Props>): UiNodeInput;
}

/**
 * Defines a pure component without binding it to a renderer, framework, or host.
 *
 * @public
 */
export function definePureComponent<Props extends ComponentProps>(
  metadata: PureComponentMetadata,
  render: PureComponent<Props>,
): DefinedPureComponent<Props> {
  const displayName = normalizeDisplayName(metadata.displayName);

  return Object.freeze({
    kind: "ludoweave.pure-component" as const,
    metadata: Object.freeze({
      displayName,
    }),
    render,
  });
}

function normalizeDisplayName(displayName: string): string {
  const normalized = displayName.trim();
  if (normalized.length === 0) {
    throw new TypeError("Pure component displayName must not be empty.");
  }
  return normalized;
}
