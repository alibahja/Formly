import React, { useEffect, useRef } from "react";
import { BotMessageSquareIcon, UserIcon, SparklesIcon } from "lucide-react";
import PromptInput from "./PromptInput";

const ChatPanel = ({ messages, onSend, loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200">
        <SparklesIcon size={14} className="text-zinc-500" />
        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500">
          AI Assistant
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-[220px] text-center">
              <p className="text-xs text-zinc-400">
                Ask AI to modify your form
              </p>
              <p className="mt-2 text-[11px] text-zinc-400">
                Try: "make email required", "add a phone field", "reorder fields"
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2.5">
            <div
              className={`flex items-center justify-center rounded-md size-6 shrink-0 ${
                msg.role === "user"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 border border-zinc-200"
              }`}
            >
              {msg.role === "user" ? <UserIcon size={12} /> : <BotMessageSquareIcon size={12} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-zinc-500 mb-1">
                {msg.role === "user" ? "You" : "AI"}
              </p>
              <p className="text-xs leading-relaxed break-words whitespace-pre-wrap text-zinc-700">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="flex items-center justify-center border rounded-md size-6 shrink-0 bg-zinc-100 text-zinc-700 border-zinc-200">
              <BotMessageSquareIcon size={12} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-zinc-500 mb-1">AI</p>
              <div className="flex items-center gap-1 py-1">
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50/60">
        <PromptInput
          onSubmit={onSend}
          loading={loading}
          placeholder="Ask AI to modify"
          autoFocus
        />
      </div>
    </div>
  );
};

export default ChatPanel;