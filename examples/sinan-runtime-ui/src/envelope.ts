import type { RuntimeUIViewModel } from "./view-model.js";

export const runtimeUIViewModelEnvelopeVersion = "ludoweave.sinan-gate-demo.v0.4";

export const runtimeUIViewModelEnvelopeCapabilities = [
  "renderer.dom",
  "renderer.canvas2d.trace",
  "renderer.fallback",
  "overlay.text-input",
  "action-registry",
  "validation-hook",
] as const;

export type RuntimeUIViewModelEnvelopeVersion = typeof runtimeUIViewModelEnvelopeVersion;
export type RuntimeUIViewModelEnvelopeCapability =
  (typeof runtimeUIViewModelEnvelopeCapabilities)[number];
export type RuntimeUIViewModelEnvelopeSurface = "gate-demo";

export interface RuntimeUIViewModelFallbackPolicy {
  readonly renderer: "sinan-owned-fallback";
  readonly missingCapability: "emit-diagnostic";
  readonly unsupportedSurface: "use-host-runtime-ui";
}

export interface RuntimeUIViewModelEnvelope {
  readonly version: RuntimeUIViewModelEnvelopeVersion;
  readonly frameId: string;
  readonly surface: RuntimeUIViewModelEnvelopeSurface;
  readonly capabilities: readonly RuntimeUIViewModelEnvelopeCapability[];
  readonly fallbackPolicy: RuntimeUIViewModelFallbackPolicy;
  readonly viewModel: RuntimeUIViewModel;
}

export type RuntimeUIViewModelEnvelopeDiagnosticCode =
  | "sinan-envelope.missing-required-field"
  | "sinan-envelope.unknown-field"
  | "sinan-envelope.unsupported-version";

export interface RuntimeUIViewModelEnvelopeDiagnostic {
  readonly code: RuntimeUIViewModelEnvelopeDiagnosticCode;
  readonly severity: "error" | "warning";
  readonly path: string;
  readonly message: string;
}

export interface RuntimeUIViewModelEnvelopeValidationResult {
  readonly valid: boolean;
  readonly diagnostics: readonly RuntimeUIViewModelEnvelopeDiagnostic[];
  readonly envelope?: RuntimeUIViewModelEnvelope;
}

const requiredEnvelopeFields = [
  "version",
  "frameId",
  "surface",
  "capabilities",
  "fallbackPolicy",
  "viewModel",
] as const;

const allowedEnvelopeFields = new Set<string>(requiredEnvelopeFields);

export function validateRuntimeUIViewModelEnvelope(
  input: unknown,
): RuntimeUIViewModelEnvelopeValidationResult {
  if (!isRecord(input)) {
    return {
      valid: false,
      diagnostics: [
        {
          code: "sinan-envelope.missing-required-field",
          severity: "error",
          path: "$",
          message: "RuntimeUIViewModel envelope must be an object.",
        },
      ],
    };
  }

  const diagnostics: RuntimeUIViewModelEnvelopeDiagnostic[] = [];

  for (const field of requiredEnvelopeFields) {
    if (!(field in input)) {
      diagnostics.push({
        code: "sinan-envelope.missing-required-field",
        severity: "error",
        path: `$.${field}`,
        message: `Missing required envelope field "${field}".`,
      });
    }
  }

  for (const field of Object.keys(input)) {
    if (!allowedEnvelopeFields.has(field)) {
      diagnostics.push({
        code: "sinan-envelope.unknown-field",
        severity: "warning",
        path: `$.${field}`,
        message: `Unknown envelope field "${field}" will be ignored.`,
      });
    }
  }

  if ("version" in input && input.version !== runtimeUIViewModelEnvelopeVersion) {
    diagnostics.push({
      code: "sinan-envelope.unsupported-version",
      severity: "error",
      path: "$.version",
      message: `Unsupported RuntimeUIViewModel envelope version "${String(input.version)}".`,
    });
  }

  const valid = !diagnostics.some((diagnostic) => diagnostic.severity === "error");

  if (!valid) {
    return {
      valid,
      diagnostics,
    };
  }

  return {
    valid,
    diagnostics,
    envelope: input as unknown as RuntimeUIViewModelEnvelope,
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
