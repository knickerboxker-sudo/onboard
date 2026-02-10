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
      <div className="max-w-3xl mx-auto relative min-w-0">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Message sortir…"
          disabled={disabled}
          className="w-full min-h-[48px] max-h-40 resize-none rounded-2xl border border-border bg-base pl-4 pr-14 py-3.5 text-sm leading-5 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="absolute right-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <p className="text-center text-[11px] text-muted/50 mt-2 max-w-3xl mx-auto">
        Powered by Cohere · Conversations stored locally in your browser
      </p>
    </div>
  );
}
