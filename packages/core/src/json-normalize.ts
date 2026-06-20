import type { JsonValue } from "./json-value.js";

export function normalizeJsonObject(
  value: Record<string, unknown>,
  path: string,
): Readonly<Record<string, JsonValue>> {
  return normalizePlainJsonObject(value, path, new WeakSet<object>());
}

export function normalizeJsonValue(value: unknown, path: string): JsonValue {
  return normalizeUnknownJsonValue(value, path, new WeakSet<object>());
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeUnknownJsonValue(value: unknown, path: string, seen: WeakSet<object>): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${path} must be a finite JSON number.`);
    }
    return value;
  }

  if (Array.isArray(value)) {
    guardCircular(value, path, seen);
    return value.map((entry, index) => normalizeUnknownJsonValue(entry, `${path}[${index}]`, seen));
  }

  if (isPlainRecord(value)) {
    return normalizePlainJsonObject(value, path, seen);
  }

  throw new TypeError(`${path} must be a JsonValue.`);
}

function normalizePlainJsonObject(
  value: Record<string, unknown>,
  path: string,
  seen: WeakSet<object>,
): Readonly<Record<string, JsonValue>> {
  guardCircular(value, path, seen);

  const normalized: Record<string, JsonValue> = {};
  for (const [key, child] of Object.entries(value)) {
    normalized[key] = normalizeUnknownJsonValue(child, `${path}.${key}`, seen);
  }

  return normalized;
}

function guardCircular(value: object, path: string, seen: WeakSet<object>): void {
  if (seen.has(value)) {
    throw new TypeError(`${path} must not contain circular references.`);
  }
  seen.add(value);
}
