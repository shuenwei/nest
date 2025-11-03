export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        requestFullscreen?: () => void; // ✅ new method
        isExpanded?: boolean;
        HapticFeedback?: {
          impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred?: (type: "error" | "success" | "warning") => void;
          selectionChanged?: () => void;
        };
      };
    };
  }
}
