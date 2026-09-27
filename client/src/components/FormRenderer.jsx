import React, { useState } from "react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm transition focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 disabled:opacity-60";

const labelClass = "block mb-1.5 text-sm font-medium text-zinc-700";

const FormRenderer = ({ fields, values, onChange, errors = {}, disabled = false }) => {
  if (!fields || fields.length === 0) {
    return (
      <div className="flex items-center justify-center p-10 text-sm border border-dashed rounded-xl text-zinc-400 border-zinc-200">
        No fields yet
      </div>
    );
  }

  const setValue = (id, v) => {
    if (!onChange || disabled) return;
    onChange({ ...values, [id]: v });
  };

  const toggleCheckbox = (id, option) => {
    const current = Array.isArray(values[id]) ? values[id] : [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setValue(id, next);
  };

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const value = values[field.id];
        const error = errors[field.id];

        return (
          <div key={field.id}>
            <label htmlFor={field.id} className={labelClass}>
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>

            {field.type === "textarea" && (
              <textarea
                id={field.id}
                value={value || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                disabled={disabled}
                className={`${inputClass} resize-none`}
              />
            )}

            {field.type === "select" && (
              <select
                id={field.id}
                value={value || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
                disabled={disabled}
                className={inputClass}
              >
                <option value="">{field.placeholder || "Select an option..."}</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "radio" && (
              <div className="space-y-2">
                {field.options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm cursor-pointer text-zinc-700"
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      checked={value === opt}
                      onChange={() => setValue(field.id, opt)}
                      disabled={disabled}
                      className="size-4 accent-zinc-900"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.type === "checkbox" && (
              <div className="space-y-2">
                {field.options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm cursor-pointer text-zinc-700"
                  >
                    <input
                      type="checkbox"
                      value={opt}
                      checked={Array.isArray(value) && value.includes(opt)}
                      onChange={() => toggleCheckbox(field.id, opt)}
                      disabled={disabled}
                      className="size-4 rounded accent-zinc-900"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {["text", "email", "number", "date"].includes(field.type) && (
              <input
                id={field.id}
                type={field.type}
                value={value || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className={inputClass}
              />
            )}

            {field.helperText && !error && (
              <p className="mt-1.5 text-xs text-zinc-400">{field.helperText}</p>
            )}
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default FormRenderer;