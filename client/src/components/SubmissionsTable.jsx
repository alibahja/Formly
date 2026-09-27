import React from "react";
import { MailOpenIcon, MailIcon, ArchiveIcon, TrashIcon, ArrowRightIcon } from "lucide-react";
import moment from "moment";

const STATUS_META = {
  new:      { label: "New",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
  read:     { label: "Read",     cls: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  archived: { label: "Archived", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

const SubmissionsTable = ({ submissions, onSelect, onDelete }) => {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center mb-3 rounded-full size-12 bg-zinc-100 text-zinc-400">
          <MailIcon size={20} />
        </div>
        <p className="text-sm font-medium text-zinc-700">No responses yet</p>
        <p className="mt-1 text-xs text-zinc-400">
          Share your published form to start collecting responses.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-zinc-200 bg-zinc-50">
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Submitted
            </th>
            <th className="hidden px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:table-cell">
              Summary
            </th>
            <th className="w-20 px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const meta = STATUS_META[sub.status] || STATUS_META.new;
            // Take first 2 string-ish values as summary
            const preview = Object.values(sub.values || {})
              .filter((v) => typeof v === "string" && v.trim() !== "")
              .slice(0, 2)
              .join(" · ")
              .slice(0, 80);

            return (
              <tr
                key={sub._id}
                onClick={() => onSelect(sub)}
                className="transition border-b cursor-pointer border-zinc-100 hover:bg-zinc-50 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${meta.cls}`}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-zinc-500">
                  {moment(sub.createdAt).fromNow()}
                </td>
                <td className="hidden px-4 py-3 text-xs truncate sm:table-cell text-zinc-600">
                  {preview || <span className="italic text-zinc-400">No preview</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sub._id);
                      }}
                      aria-label="Delete submission"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <TrashIcon size={14} />
                    </button>
                    <ArrowRightIcon size={14} className="text-zinc-300" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionsTable;