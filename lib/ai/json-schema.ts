import { z } from "zod"

// Validation constraints we drop from the schema sent to the provider. Strict
// structured outputs only guarantee shape; Zod still enforces these afterwards.
const CONSTRAINT_KEYS = new Set([
  "$schema",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "pattern",
  "format",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
])

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

function strictify(node: JsonValue): JsonValue {
  if (Array.isArray(node)) return node.map(strictify)
  if (node === null || typeof node !== "object") return node

  const result: { [key: string]: JsonValue } = {}
  for (const [key, value] of Object.entries(node)) {
    if (!CONSTRAINT_KEYS.has(key)) result[key] = strictify(value)
  }

  const properties = result.properties
  if (result.type === "object" && properties && typeof properties === "object") {
    // Strict mode requires every property listed as required and no extras.
    result.required = Object.keys(properties)
    result.additionalProperties = false
  }
  return result
}

/** Converts a Zod schema into the JSON Schema shape Groq's strict mode accepts. */
export function toProviderJsonSchema(schema: z.ZodType): { [key: string]: JsonValue } {
  const jsonSchema = z.toJSONSchema(schema, { io: "output", unrepresentable: "any" })
  return strictify(jsonSchema as JsonValue) as { [key: string]: JsonValue }
}
