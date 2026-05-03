"use client";

import { CheckCircle2 } from "lucide-react";
import type { Notification as NotificationType } from "@/lib/types";

interface NotificationProps {
  notification: NotificationType | null;
}

export function Notification({ notification }: NotificationProps) {
  if (!notification) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-12 py-6 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.5)] border backdrop-blur-2xl bg-blue-600 text-white font-black animate-slide flex items-center gap-3 border-white/20">
      <CheckCircle2 className="w-6 h-6" /> {notification.msg}
    </div>
  );
}
