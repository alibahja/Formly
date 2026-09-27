import React from "react";
import { XIcon, TrashIcon, ArchiveIcon, MailOpenIcon, MailIcon } from "lucide-react";
import moment from "moment";

const SubmissionDrawer = ({ submission, fields, onClose, onStatusChange, onDelete }) => {
  if (!submission) return null;

  const values = submission.values || {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md bg-white border-l shadow-2xl border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">Response details</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {moment(submission.createdAt).format("MMM D, YYYY · h:mm A")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center transition rounded-md size-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Meta strip */}
        <div className="flex items-center gap-3 px-4 py-2 text-[11px] border-b bg-zinc-50 text-zinc-500 border-zinc-200">
          {submission.ip && (
            <span className="truncate">IP: {submission.ip}</span>
          )}
          {submission.userAgent && (
            <span className="hidden truncate sm:inline" title={submission.userAgent}>
              · {submission.userAgent.slice(0, 40)}
            </span>
          )}
        </div>

        {/* Values */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {fields.map((field) => {
            const raw = values[field.id];
            let display = "—";
            if (Array.isArray(raw)) display = raw.join(", ");
            else if (typeof raw === "string" && raw.trim()) display = raw;

            return (
              <div key={field.id}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {field.label}
                </p>
                <p className="mt-1 text-sm break-words whitespace-pre-wrap text-zinc-800">
                  {display}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 p-3 border-t border-zinc-200 bg-zinc-50/60">
          <button
            onClick={() => onDelete(submission._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 transition rounded-md hover:bg-red-50"
          >
            <TrashIcon size={13} /> Delete
          </button>

          <div className="flex items-center gap-1.5">
            {submission.status !== "read" && (
              <button
                onClick={() => onStatusChange(submission._id, "read")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition bg-white border rounded-md text-zinc-700 border-zinc-200 hover:bg-zinc-50"
              >
                <MailOpenIcon size={13} /> Mark read
              </button>
            )}
            {submission.status !== "archived" ? (
              <button
                onClick={() => onStatusChange(submission._id, "archived")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition rounded-md bg-zinc-900 hover:bg-zinc-800"
              >
                <ArchiveIcon size={13} /> Archive
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(submission._id, "new")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition rounded-md bg-zinc-900 hover:bg-zinc-800"
              >
                <MailIcon size={13} /> Mark unread
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SubmissionDrawer;