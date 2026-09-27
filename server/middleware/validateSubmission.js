import {Form} from '../models/form.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -- Helpers --

function isEmpty(value){
    if(value===undefined || value === null) return true;
    if(typeof value ==="string" && value.trim()==="") return true;
    if(Array.isArray(value) && value.length===0) return true;
    return false;
}

// Sanitize a value before validating it (trim strings, drop unexpected shapes)
function normalizeValue(rawValue, type) {
  if (type === "checkbox") {
    if (!Array.isArray(rawValue)) return [];
    return rawValue.filter((v) => typeof v === "string").map((v) => v.trim());
  }
  if (typeof rawValue === "string") return rawValue.trim();
  return rawValue;
}

// Validate one field's value against its schema. Returns error message or null.
function validateFieldValue(field, value) {
  const type = field.type;
  const validation = field.validation || {};

  // Required check
  if (field.required && isEmpty(value)) {
    return "This field is required";
  }
  // Optional + empty → no further checks
  if (isEmpty(value)) return null;

  switch (type) {
    case "email": {
      if (typeof value !== "string" || !EMAIL_REGEX.test(value)) {
        return "Invalid email address";
      }
      break;
    }

    case "number": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return "Must be a number";
      if (typeof validation.min === "number" && num < validation.min) {
        return `Must be at least ${validation.min}`;
      }
      if (typeof validation.max === "number" && num > validation.max) {
        return `Must be at most ${validation.max}`;
      }
      break;
    }

    case "date": {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "Invalid date";
      break;
    }

    case "select":
    case "radio": {
      if (typeof value !== "string") return "Must be a single choice";
      if (!field.options.includes(value)) {
        return "Invalid option";
      }
      break;
    }

    case "checkbox": {
      if (!Array.isArray(value)) return "Must be an array of choices";
      for (const v of value) {
        if (!field.options.includes(v)) {
          return `Invalid option: "${v}"`;
        }
      }
      break;
    }

    case "text":
    case "textarea":
    default: {
      if (typeof value !== "string") return "Must be text";
      if (typeof validation.min === "number" && value.length < validation.min) {
        return `Must be at least ${validation.min} characters`;
      }
      if (typeof validation.max === "number" && value.length > validation.max) {
        return `Must be at most ${validation.max} characters`;
      }
      if (validation.pattern) {
        try {
          const re = new RegExp(validation.pattern);
          if (!re.test(value)) return "Invalid format";
        } catch {
          // Bad regex stored on the field — ignore rather than crash
        }
      }
    }
  }

  return null;
}

// --Middleware--

export async function validateSubmission(req,res,next){
    try {
        //1.Load the form
        let form;
        try {
            form = await Form.findOne({ _id: req.params.id, published: true });
        } catch {
            return res.status(400).json({ error: "Invalid form id" });
        }
        if(!form){
            return res.status(404).json({ error: "Form not found or not published" });
        }

        // 2. Honeypot — must be empty
        const honeypot = req.body?.__hp;
        if (typeof honeypot === "string" && honeypot.trim() !== "") {
        // Silently pretend success? Or reject? Silent success confuses attackers less.
        // But for clarity we return 400 here (or you can fake a 200).
        return res.status(400).json({ error: "Submission rejected" });
        }
        
        // 3. Validate body shape
        const rawValues=req.body?.values;
        if(!rawValues || typeof rawValues !== "object" || Array.isArray(rawValues)){
            return res.status(400).json({ error: "'values' must be an object" });
        }

        // 4. Validate each field
        const errors = [];
        const cleanValues = {};

        for (const field of form.fields) {
        const rawValue = rawValues[field.id];
        const normalized = normalizeValue(rawValue, field.type);

        const message = validateFieldValue(field, normalized);
        if (message) {
            errors.push({ field: field.id, message });
            continue;
        }

        // Only store non-empty values (keeps submission docs lean)
        if (!isEmpty(normalized)) {
            cleanValues[field.id] = normalized;
        }
        }

        if (errors.length > 0) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors,
        });
        }

        // 5. Attach to req so the controller doesn't re-fetch
        req.form = form;
        req.cleanValues = cleanValues;
        req.clientMeta = {
        ip: req.ip || null,
        userAgent: req.get("user-agent") || null,
        };

        next();




    } catch (err) {
        console.error("validateSubmission error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}