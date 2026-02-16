"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRecord } from "@/lib/types";

const TYPE_STYLES: Record<string, string> = {
  match: "bg-emerald-50 text-emerald-700",
  message: "bg-sky-50 text-sky-700",
  partnership_update: "bg-violet-50 text-violet-700",
  verification: "bg-amber-50 text-amber-700",
  system: "bg-slate-50 text-slate-700",
};

export default function NotificationBell() {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id && mounted) {
          setUserId(session.user.id);
        }
      } catch {
        // ignore
      }
    };
    init();
    return () => { mounted = false; };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data && mounted) setNotifications(data as NotificationRecord[]);
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (mounted) {
            setNotifications((prev) => [payload.new as NotificationRecord, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-50 mt-2 w-80 rounded-xl shadow-lg ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-sky-600 hover:text-sky-700">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 ${!n.read ? "bg-sky-50/30" : ""}`}
                  >
                    <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_STYLES[n.type] ?? TYPE_STYLES.system}`}>
                      {n.type.replace("_", " ")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      {n.link && (
                        <a href={n.link} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
