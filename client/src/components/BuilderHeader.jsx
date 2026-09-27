import React from "react";
import {
  ArrowLeftIcon, GlobeIcon, Loader2Icon,
  EyeIcon, InboxIcon, SaveIcon,
} from "lucide-react";

const BuilderHeader = ({
  formName,
  version,
  published,
  publishing,
  savingFields,
  onBack,
  onPreview,
  onPublish,
  onOpenSubmissions,
  onLogout,
}) => {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-white shrink-0 border-zinc-200">
      {/* Left */}
      <div className="flex items-center min-w-0 gap-3">
        <button
          onClick={onBack}
          aria-label="Back to home"
          className="flex items-center justify-center transition rounded-md size-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
        >
          <ArrowLeftIcon size={16} />
        </button>
        <img src="/logo.svg" alt="Formly" className="size-5" />
        <div className="flex items-center min-w-0 gap-2">
          <span className="text-sm font-medium truncate text-zinc-900">
            {formName}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 rounded bg-zinc-100 border border-zinc-200 shrink-0">
            v{version}
          </span>
          {published && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Published
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Save indicator */}
        {savingFields && (
          <span className="hidden items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 sm:flex">
            <Loader2Icon size={12} className="animate-spin" />
            Saving…
          </span>
        )}

        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 transition bg-white border rounded-md border-zinc-200 hover:bg-zinc-50"
        >
          <EyeIcon size={14} /> Preview
        </button>

        <button
          onClick={onOpenSubmissions}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 transition bg-white border rounded-md border-zinc-200 hover:bg-zinc-50"
        >
          <InboxIcon size={14} /> Responses
        </button>

        <button
          onClick={onPublish}
          disabled={publishing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {publishing ? (
            <Loader2Icon size={14} className="animate-spin" />
          ) : (
            <GlobeIcon size={14} />
          )}
          {published ? "Republish" : "Publish"}
        </button>

        <div className="w-px h-5 mx-1 bg-zinc-200" />

        <button
          onClick={onLogout}
          className="px-3 py-1.5 text-xs font-medium transition rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
        >
          Sign out
        </button>
      </div>
    </header>
  );
};

export default BuilderHeader;