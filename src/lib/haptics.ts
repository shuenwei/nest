export type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type NotificationType = "error" | "success" | "warning";
export type HapticSetting = false | true | ImpactStyle | "selection";

const getHapticApi = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.Telegram?.WebApp?.HapticFeedback;
};

export const triggerHapticImpact = (style: ImpactStyle = "light") => {
  const api = getHapticApi();

  if (!api) {
    return;
  }

  api.impactOccurred?.(style);
};

export const triggerHapticSelection = () => {
  const api = getHapticApi();

  if (!api) {
    return;
  }

  api.selectionChanged?.();
};

export const triggerHapticNotification = (type: NotificationType) => {
  const api = getHapticApi();

  if (!api) {
    return;
  }

  api.notificationOccurred?.(type);
};

export const triggerHapticFeedback = (setting: HapticSetting) => {
  if (!setting) {
    return;
  }

  if (setting === true) {
    triggerHapticImpact("light");
    return;
  }

  if (setting === "selection") {
    triggerHapticSelection();
    return;
  }

  triggerHapticImpact(setting);
};