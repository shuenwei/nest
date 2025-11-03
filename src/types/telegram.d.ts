export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        // Core WebApp methods
        ready?: () => void;
        expand?: () => void;
        close?: () => void;

        // Optional properties
        initData?: string;
        initDataUnsafe?: any;
        colorScheme?: "light" | "dark";
        isExpanded?: boolean;

        // Haptic Feedback (you already had this)
        HapticFeedback?: {
          impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred?: (type: "error" | "success" | "warning") => void;
          selectionChanged?: () => void;
        };
      };
    };
  }
}
