import React, { useState } from "react";
import FormRenderer from "./FormRenderer";

const FormPreview = ({ form }) => {
  const [values, setValues] = useState({});

  if (!form) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500">
          Preview
        </span>
        <span className="text-[11px] text-zinc-400">Non-interactive demo</span>
      </div>

      {/* Body — device-like frame */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* Form card */}
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-zinc-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">{form.name}</h2>
              {form.description && (
                <p className="mt-1 text-sm text-zinc-500">{form.description}</p>
              )}
            </div>

            <FormRenderer
              fields={form.fields}
              values={values}
              onChange={setValues}
            />

            <button
              type="button"
              disabled
              className="w-full px-4 py-2.5 mt-6 text-sm font-medium text-white rounded-lg bg-zinc-900 opacity-40 cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;