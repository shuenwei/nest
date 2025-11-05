import { toast as sonnerToast } from "sonner";

import {
  triggerHapticNotification,
  triggerHapticSelection,
} from "@/lib/haptics";

const toast = ((...args: Parameters<typeof sonnerToast>) => {
  triggerHapticSelection();
  return sonnerToast(...args);
}) as typeof sonnerToast;

Object.assign(toast, sonnerToast);

toast.success = ((...args: Parameters<typeof sonnerToast.success>) => {
  triggerHapticNotification("success");
  return sonnerToast.success(...args);
}) as typeof sonnerToast.success;

toast.error = ((...args: Parameters<typeof sonnerToast.error>) => {
  triggerHapticNotification("error");
  return sonnerToast.error(...args);
}) as typeof sonnerToast.error;

export { toast };