"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="border-t border-border bg-card px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="max-w-3xl mx-auto flex items-end gap-3 min-w-0">
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message sortir…"
            disabled={disabled}
            className="w-full min-h-[44px] max-h-40 resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm leading-5 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all disabled:opacity-50"
          />
        </div>
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white shadow-soft hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </div>
      <p className="text-center text-[11px] text-muted/50 mt-2 max-w-3xl mx-auto">
        Powered by Cohere &middot; Conversations stored locally in your browser
      </p>
    </div>
  );
}
