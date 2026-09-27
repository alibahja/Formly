import {z} from "zod"

// A single form field — enforces the exact shape our frontend expects
const FieldSchema=z.object({
    id:z.string(),
    type:z.enum([
    "text", "email", "number", "textarea",
    "select", "radio", "checkbox", "date",
    ]),
    label:z.string(),
    placeholder:z.string().optional().default(""),
    helperText: z.string().optional().default(""),
    required: z.boolean().optional().default(false),
    options: z.array(z.string()).optional().default([]),
    validation:z.object({
        min:z.number().nullable().optional(),
        max:z.number().nullable().optional(),
        pattern:z.string().nullable().optional(),
    })
    .optional()
    .default({}),
})

// What generateForm returns
export const FormGenerationSchema=z.object({
    name:z.string(),
    description:z.string().optional().default(""),
    fields:z.array(FieldSchema).min(1).max(20),
});

// For revisions (used later by reviseForm)
const FieldOperationSchema=z.object({
    op:z.enum(["add_field","update_field","remove_field"]),
    fieldId:z.string().nullable().optional(),   // for update/remove
    field: FieldSchema.nullable().optional(),   // for add/update
});

export const FormRevisionSchema=z.object({
    operations:z.array(FieldOperationSchema),
    description:z.string().optional().default("Applied Revision"),
});