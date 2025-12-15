export { };

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        requestFullscreen?: () => void;
        isExpanded?: boolean;
        disableVerticalSwipes?: () => void;
        enableVerticalSwipes?: () => void;
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
            photo_url?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred?: (type: "error" | "success" | "warning") => void;
          selectionChanged?: () => void;
        };
        LocationManager?: {
          init: (callback?: () => void) => void;
          getLocation: (callback: (data: LocationData) => void) => void;
          openSettings: () => void;
          isLocationAvailable: boolean;
          isAccessRequested: boolean;
          isAccessGranted: boolean;
        };
      };
    };
  }

  interface LocationData {
    latitude: number;
    longitude: number;
    altitude: number | null;
    course: number | null;
    speed: number | null;
    horizontal_accuracy: number | null;
    vertical_accuracy: number | null;
    course_accuracy: number | null;
    speed_accuracy: number | null;
  }
}