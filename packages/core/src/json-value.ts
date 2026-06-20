/**
 * Serializable JSON object value accepted by LudoWeave public contracts.
 *
 * @public
 */
export type JsonObject = {
  readonly [key: string]: JsonValue;
};

/**
 * Serializable JSON array value accepted by LudoWeave public contracts.
 *
 * @public
 */
export type JsonArray = readonly JsonValue[];

/**
 * Serializable value boundary for runtime UI props, actions, frames, and snapshots.
 *
 * @public
 */
export type JsonValue = null | boolean | number | string | JsonArray | JsonObject;
