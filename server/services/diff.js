/**
 * Apply AI-generated field operations to a form's fields array.
 *
 * @param {Array} currentFields  - existing fields from the Form doc
 * @param {Array} operations     - ops returned by reviseForm
 * @returns {{ fields: Array, applied: string[], errors: string[] }}
 */

export function applyFieldOperations(currentFields,operations){
    // clone so we don't mutate the caller array
    let fields=[...(currentFields || [])];
    const applied=[];
    const errors=[];

    if(!Array.isArray(operations)){
        return {fields,applied,errors:["operations must be an array"]};
    }

    // Track ids so we can enforce uniqueness across add_field ops
    const userIds=new Set(fields.map((f)=>f.id));

    for (const op of operations){
        if(!op || typeof op !=="object"){
            errors.push(`invalid operation: ${JSON.stringify(op)}`);
            continue;
        }
        try {
          switch(op.op){
            case "add_field":{
                if (!op.field || typeof op.field !== "object") {
                errors.push("add_field: missing field object");
                break;
                }
                 const field = { ...op.field };

                // Ensure a valid id
                if (!field.id || typeof field.id !== "string") {
                    errors.push(`add_field: missing id for "${field.label || "unnamed"}"`);
                    break;
                }
                // Enforce unique id
                if (usedIds.has(field.id)) {
                    let suffix = 1;
                    let newId = `${field.id}_${suffix}`;
                    while (usedIds.has(newId)) {
                    newId = `${field.id}_${++suffix}`;
                    }
                    errors.push(`add_field: id "${field.id}" already exists, renamed to "${newId}"`);
                    field.id = newId;
                }

                 usedIds.add(field.id);
                 fields.push(field);
                 applied.push(`added ${field.id}`);
                 break;
            }
            case "update_field": {
                if (!op.fieldId || typeof op.fieldId !== "string") {
                    errors.push("update_field: missing fieldId");
                    break;
                }
                if (!op.field || typeof op.field !== "object") {
                    errors.push(`update_field ${op.fieldId}: missing field object`);
                    break;
                }

                const index = fields.findIndex((f) => f.id === op.fieldId);
                if (index === -1) {
                    errors.push(`update_field ${op.fieldId}: field not found`);
                    break;
                }

                // Preserve the original id (the AI might have changed it — we don't allow that)
                const updated = { ...op.field, id: op.fieldId };
                fields[index] = updated;
                applied.push(`updated ${op.fieldId}`);
                break;
            }
            case "remove_field": {
                if (!op.fieldId || typeof op.fieldId !== "string") {
                    errors.push("remove_field: missing fieldId");
                    break;
                }

                const index = fields.findIndex((f) => f.id === op.fieldId);
                if (index === -1) {
                    errors.push(`remove_field ${op.fieldId}: field not found`);
                    break;
                }

                fields.splice(index, 1);
                usedIds.delete(op.fieldId);
                applied.push(`removed ${op.fieldId}`);
                break;
            }
            default:
                errors.push(`unknown op: ${op.op}`);
          }
        } catch (err) {
            errors.push(`${op.op} ${op.fieldId || op.field?.id || "?"}: ${err.message}`);
        }
    }
    // Safety: never leave the form with zero fields
    if (fields.length === 0) {
        errors.push("revision would leave the form with zero fields — reverting to original");
        fields = [...(currentFields || [])];
        applied.length = 0;
    }

    return { fields, applied, errors };
}