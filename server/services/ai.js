import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { FormGenerationSchema, FormRevisionSchema } from "./aiSchemas.js";
import { FORM_GENERATION_SYSTEM, FORM_REVISION_SYSTEM } from "./prompt.js";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY must be set in environment variables");
}

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = openrouter.chat(MODEL);

// ---------------------------------------------------------------------------
// Field Post-Processing
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set([
  "text", "email", "number", "textarea",
  "select", "radio", "checkbox", "date",
]);

const TYPE_ALIASES = {
  input: "text",
  string: "text",
  long_text: "textarea",
  longtext: "textarea",
  paragraph: "textarea",
  dropdown: "select",
  choice: "radio",
  multiselect: "checkbox",
  multiple_choice: "checkbox",
  checkbox_group: "checkbox",
  datepicker: "date",
  datetime: "date",
};

function normalizeType(rawType) {
  const t = String(rawType || "").trim().toLowerCase();
  if (ALLOWED_TYPES.has(t)) return t;
  if (TYPE_ALIASES[t]) return TYPE_ALIASES[t];
  return "text";
}

function slugifyLabel(label, fallbackIndex) {
  const base = String(label || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `field_${base || `q${fallbackIndex + 1}`}`;
}

function normalizeField(field, index, usedIds) {
  const type = normalizeType(field.type);

  let id = slugifyLabel(field.label, index);
  let suffix = 1;
  while (usedIds.has(id)) {
    id = `${id}_${suffix++}`;
  }
  usedIds.add(id);

  const normalized = {
    id,
    type,
    label: (field.label || `Field ${index + 1}`).trim(),
    placeholder: field.placeholder || "",
    helperText: field.helperText || "",
    required: Boolean(field.required),
    options: [],
    validation: {},
  };

  if (["select", "radio", "checkbox"].includes(type)) {
    const opts = Array.isArray(field.options) ? field.options : [];
    normalized.options = opts
      .filter((o) => typeof o === "string" && o.trim().length > 0)
      .map((o) => o.trim());

    if (normalized.options.length === 0) {
      normalized.options = ["Option 1", "Option 2", "Option 3"];
    }
  }

  if (["text", "textarea", "number", "date"].includes(type)) {
    const v = field.validation || {};
    const next = {};
    if (typeof v.min === "number") next.min = v.min;
    if (typeof v.max === "number") next.max = v.max;
    if (typeof v.pattern === "string" && v.pattern.trim()) {
      if (type === "text" || type === "textarea") next.pattern = v.pattern;
    }
    normalized.validation = next;
  }

  return normalized;
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return [];               
  const usedIds = new Set();
  return fields.map((f, i) => normalizeField(f, i, usedIds));
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

export async function generateForm(prompt) {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("Prompt is required");
  }

  console.log(`[AI] Generating form for: "${prompt.slice(0, 80)}..."`);

  const { object } = await generateObject({        
    model,
    schema: FormGenerationSchema,
    system: FORM_GENERATION_SYSTEM,
    prompt: prompt.trim(),
    maxRetries: 2,
  });

  const rawFields = Array.isArray(object?.fields) ? object.fields : [];  
  if (rawFields.length === 0) {
    console.error("[AI] Model returned no fields. Raw:", JSON.stringify(object));
    throw new Error("AI returned no fields. Try a more specific prompt.");
  }

  const normalizedFields = normalizeFields(rawFields);

  if (normalizedFields.length === 0) {               
    throw new Error("AI did not return any usable fields");
  }

  console.log(`[AI] Generated form "${object.name}" with ${normalizedFields.length} fields`);

  return {
    name: (object.name || "Untitled Form").trim(),
    description: (object.description || "").trim(),
    fields: normalizedFields,
  };
}

export async function reviseForm(prompt, currentForm, recentMessages = []) {
  const contextParts = [];

  contextParts.push("## Current Form");
  contextParts.push(`Name: ${currentForm.name}`);
  contextParts.push(`Description: ${currentForm.description || "(none)"}`);
  contextParts.push("Fields:");
  contextParts.push("```json");
  contextParts.push(JSON.stringify(currentForm.fields, null, 2));
  contextParts.push("```");

  if (recentMessages.length > 0) {
    contextParts.push("\n## Recent Conversation");
    for (const msg of recentMessages.slice(-4)) {
      contextParts.push(`${msg.role}: ${msg.content}`);
    }
  }
  contextParts.push(`\n## Revision Request\n${prompt}`);

  console.log(`[AI] Revising form ${currentForm._id}: "${prompt.slice(0, 80)}..."`);

  const { object } = await generateObject({
    model,
    schema: FormRevisionSchema,                        //  correct schema
    system: FORM_REVISION_SYSTEM,
    prompt: contextParts.join("\n"),
    maxRetries: 2,
  });

  const operations = Array.isArray(object?.operations) ? object.operations : [];  //  guard
  console.log(`[AI] Got ${operations.length} operations`);

  return {
    operations,
    description: object.description || "Applied revisions",
  };
}