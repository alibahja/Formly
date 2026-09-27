import React, { useEffect, useState } from "react";
import { XIcon, PlusIcon, TrashIcon } from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Single choice" },
  { value: "checkbox", label: "Multiple choice" },
];

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

const labelCls = "block mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500";

const FieldInspector = ({ field, onUpdate, onClose, onDelete }) => {
  // Local draft — apply only when the user clicks "Apply changes"
  const [draft, setDraft] = useState(field);

  // Reset draft when a different field is selected
  useEffect(() => {
    setDraft(field);
  }, [field]);

  if (!field || !draft) return null;

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const isChoice = ["select", "radio", "checkbox"].includes(draft.type);
  const hasOptions = isChoice;

  const handleApply = () => {
    // Trim label, filter empty options
    const cleaned = {
      ...draft,
      label: draft.label.trim() || "Untitled field",
      options: draft.options.filter((o) => o.trim().length > 0),
    };
    onUpdate(cleaned);
  };

  const updateOption = (index, value) => {
    const next = [...draft.options];
    next[index] = value;
    set({ options: next });
  };

  const addOption = () => set({ options: [...draft.options, ""] });

  const removeOption = (index) =>
    set({ options: draft.options.filter((_, i) => i !== index) });

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Edit field</p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[200px]">
            {field.label}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close inspector"
          className="flex items-center justify-center transition rounded-md size-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
        >
          <XIcon size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* Label */}
        <div>
          <label className={labelCls}>Label</label>
          <input
            type="text"
            value={draft.label}
            onChange={(e) => set({ label: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Type */}
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={draft.type}
            onChange={(e) =>
              set({
                type: e.target.value,
                options: ["select", "radio", "checkbox"].includes(e.target.value)
                  ? draft.options.length > 0
                    ? draft.options
                    : ["Option 1", "Option 2"]
                  : [],
              })
            }
            className={inputCls}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Placeholder (not for choice types) */}
        {!isChoice && (
          <div>
            <label className={labelCls}>Placeholder</label>
            <input
              type="text"
              value={draft.placeholder || ""}
              onChange={(e) => set({ placeholder: e.target.value })}
              placeholder="Hint shown inside the input"
              className={inputCls}
            />
          </div>
        )}

        {/* Helper text */}
        <div>
          <label className={labelCls}>Helper text</label>
          <input
            type="text"
            value={draft.helperText || ""}
            onChange={(e) => set({ helperText: e.target.value })}
            placeholder="Small hint shown under the field"
            className={inputCls}
          />
        </div>

        {/* Required */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!draft.required}
            onChange={(e) => set({ required: e.target.checked })}
            className="rounded size-4 accent-zinc-900"
          />
          <span className="text-sm text-zinc-700">Required field</span>
        </label>

        {/* Options editor (choice types only) */}
        {hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls} style={{ marginBottom: 0 }}>
                Options
              </label>
              <button
                onClick={addOption}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                <PlusIcon size={12} /> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {draft.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className={inputCls}
                  />
                  <button
                    onClick={() => removeOption(i)}
                    aria-label="Remove option"
                    className="p-2 transition rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              ))}
              {draft.options.length === 0 && (
                <p className="text-xs text-zinc-400">No options yet</p>
              )}
            </div>
          </div>
        )}

        {/* Validation (for text-based fields) */}
        {["text", "textarea", "number"].includes(draft.type) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                {draft.type === "number" ? "Min value" : "Min length"}
              </label>
              <input
                type="number"
                value={draft.validation?.min ?? ""}
                onChange={(e) =>
                  set({
                    validation: {
                      ...draft.validation,
                      min: e.target.value === "" ? null : Number(e.target.value),
                    },
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                {draft.type === "number" ? "Max value" : "Max length"}
              </label>
              <input
                type="number"
                value={draft.validation?.max ?? ""}
                onChange={(e) =>
                  set({
                    validation: {
                      ...draft.validation,
                      max: e.target.value === "" ? null : Number(e.target.value),
                    },
                  })
                }
                className={inputCls}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-zinc-200 bg-zinc-50/60">
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs font-medium text-red-600 transition rounded-md hover:bg-red-50"
        >
          Delete field
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium transition rounded-md text-zinc-600 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3.5 py-1.5 text-xs font-medium text-white transition rounded-md bg-zinc-900 hover:bg-zinc-800"
          >
            Apply changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldInspector;