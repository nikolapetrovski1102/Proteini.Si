// Site-wide replacements for window.alert / window.confirm, rendered by <SiteFeedbackHost /> (mounted once in App).
//
//   notify(translate("favoritesUpdateFailed"), { tone: "error" });
//   notify(translate("favoritesLoginRequired"), { action: { label: translate("login"), to: "/login" } });
//   if (await confirmDialog({ title, message, confirmLabel, tone: "danger" })) …
//
// Plain module functions (no hook), so they work from any handler; the admin keeps its own useToast/useConfirm.

let state = { toast: null, dialog: null };
const listeners = new Set();
let nextId = 1;

const emit = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

export const subscribeFeedback = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getFeedback = () => state;

/** Short message in the corner. tone: "info" | "success" | "error"; action: { label, to } or { label, onClick }. */
export function notify(message, { tone = "info", title, action, duration } = {}) {
  if (!message && !title) return;
  emit({ toast: { id: nextId++, message, tone, title, action, duration } });
}
export const dismissNotify = () => emit({ toast: null });

/** Asks a yes/no question in a modal; resolves true on confirm, false on cancel / Esc / backdrop. */
export function confirmDialog(options) {
  const opts = typeof options === "string" ? { message: options } : options || {};
  // A second question replaces the first, which counts as cancelled.
  state.dialog?.resolve(false);
  return new Promise((resolve) => {
    emit({ dialog: { id: nextId++, ...opts, resolve } });
  });
}
export const settleDialog = (answer) => {
  const dialog = state.dialog;
  if (!dialog) return;
  emit({ dialog: null });
  dialog.resolve(answer);
};
