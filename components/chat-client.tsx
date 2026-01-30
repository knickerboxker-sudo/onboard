"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Send, Mic, Loader2 } from "lucide-react";
import type { Message } from "@prisma/client";
import { cn } from "@/lib/utils";

const defaultPrompt = "Ask OnboardAI about your new role, tools, or people.";

export default function ChatClient({
  initialMessages
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioSummary, setAudioSummary] = useState("");
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (audioChunks.length === 0 || !mediaRecorder) {
      return;
    }

    if (mediaRecorder.state === "inactive") {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob);

      fetch("/api/audio", { method: "POST", body: formData })
        .then((response) => response.json())
        .then((data) => setAudioPath(data.path ?? null))
        .catch(() => setAudioPath(null));
      setAudioChunks([]);
    }
  }, [audioChunks, mediaRecorder]);

  const sendMessage = async (content: string, options?: { isNote?: boolean; audioPath?: string }) => {
    if (!content.trim()) {
      return;
    }
    setIsLoading(true);
    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      userId: "local",
      role: "user",
      content,
      createdAt: new Date(),
      isNote: options?.isNote ?? false,
      audioPath: options?.audioPath ?? null
    } as Message;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAudioSummary("");
    setAudioPath(null);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        isNote: options?.isNote,
        audioPath: options?.audioPath
      })
    });

    if (!response.body) {
      setIsLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      assistantContent += decoder.decode(value, { stream: true });
      setMessages((prev) => {
        const existing = prev.find((msg) => msg.id === "assistant-temp");
        if (existing) {
          return prev.map((msg) =>
            msg.id === "assistant-temp"
              ? { ...msg, content: assistantContent }
              : msg
          );
        }
        return [
          ...prev,
          {
            id: "assistant-temp",
            userId: "local",
            role: "assistant",
            content: assistantContent,
            createdAt: new Date(),
            isNote: false,
            audioPath: null
          } as Message
        ];
      });
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    const finalResponse = await fetch("/api/chat", {
      method: "PUT"
    });
    const data = await finalResponse.json();
    if (data?.messages) {
      setMessages(data.messages);
    }
    setIsLoading(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleNote = () => {
    if (!input.trim()) {
      return;
    }
    void sendMessage(input, { isNote: true });
  };

  const handleAudioSummary = () => {
    if (!audioSummary.trim() || !audioPath) {
      return;
    }
    void sendMessage(audioSummary, { audioPath, isNote: true });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setAudioChunks((prev) => [...prev, event.data]);
      }
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
    };
    recorder.start();
    setIsRecording(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-110px)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border bg-white px-4 py-6 shadow-soft">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-highlight p-4 text-sm text-muted">
            {defaultPrompt}
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              message.role === "assistant"
                ? "bg-highlight text-ink"
                : "bg-ink text-white"
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.isNote && (
              <p className="mt-2 text-[11px] uppercase tracking-wide text-muted/80">
                Note
              </p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            OnboardAI is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {audioPath && (
        <div className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">
            Add a quick summary for your audio note
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={audioSummary}
              onChange={(event) => setAudioSummary(event.target.value)}
              className="flex-1 rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Summarize what you recorded..."
            />
            <button
              onClick={handleAudioSummary}
              className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-5 mt-4 flex flex-col gap-2 rounded-3xl border border-border bg-white p-3 shadow-soft"
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={2}
          className="w-full resize-none rounded-2xl border border-border px-3 py-2 text-sm outline-none"
          placeholder="Type a note, question, or reminder..."
        />
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActions((prev) => !prev)}
              className="flex items-center gap-1 rounded-xl border border-border px-2 py-1 text-xs text-muted"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
            {showActions && (
              <div className="absolute bottom-10 left-0 flex flex-col gap-2 rounded-2xl border border-border bg-white p-2 shadow-soft">
                <button
                  type="button"
                  onClick={handleNote}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-highlight"
                >
                  Add Note
                </button>
                <button
                  type="button"
                  onClick={() => void toggleRecording()}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                    isRecording ? "bg-ink text-white" : "text-ink hover:bg-highlight"
                  )}
                >
                  <Mic className="h-4 w-4" />
                  {isRecording ? "Stop Recording" : "Record Audio"}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Send
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
