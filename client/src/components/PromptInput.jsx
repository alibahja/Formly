import React, { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";

const PromptInput = ({
  onSubmit,
  loading = false,
  placeholder = "Describe the form you want to build...",
  large = false,
  autoFocus = false,
  variant = "default",
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus();
  }, [autoFocus]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Glass variant for the landing hero (dark background)
  if (variant === "glass") {
    return (
      <form
        onSubmit={handleSubmit}
        className="p-3 transition bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl shadow-black/40 focus-within:border-white/30 focus-within:bg-white/15"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          rows={3}
          className="w-full px-2 pt-2 text-base bg-transparent resize-none text-white placeholder:text-white/40 focus:outline-none"
        />
        <div className="flex items-center justify-end px-1 pt-2 mt-1 border-t border-white/10">
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="flex items-center justify-center text-black transition rounded-full size-9 bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2Icon size={18} className="animate-spin" /> : <ArrowRightIcon size={18} />}
          </button>
        </div>
      </form>
    );
  }

  // Default variant (light)
  return (
    <div
      className={`flex items-end gap-2 bg-white border border-zinc-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 ${
        large ? "p-4" : "p-3"
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        rows={large ? 5 : 1}
        className={`flex-1 bg-transparent resize-none focus:outline-none text-zinc-800 placeholder:text-zinc-400 ${
          large ? "text-base" : "text-sm"
        }`}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || loading}
        className="flex items-center justify-center text-white transition rounded-full size-9 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {loading ? <Loader2Icon size={18} className="animate-spin" /> : <ArrowRightIcon size={18} />}
      </button>
    </div>
  );
};

export default PromptInput;