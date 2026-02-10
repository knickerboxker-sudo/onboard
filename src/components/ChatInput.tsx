"use client";

import { useState, useRef, KeyboardEvent } from "react";

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
      <div className="max-w-3xl mx-auto min-w-0">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-base p-1.5 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message sortir…"
            disabled={disabled}
            className="min-h-[44px] max-h-40 w-full min-w-0 resize-none bg-transparent px-3 py-2.5 text-base leading-6 text-ink caret-ink placeholder:text-muted/60 focus:outline-none disabled:opacity-50 sm:text-sm sm:leading-5"
          />
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="mb-0.5 flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 13V3M8 3L3 8M8 3L13 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted/50">
        Powered by Cohere · Conversations stored locally in your browser
      </p>
    </div>
  );
}
