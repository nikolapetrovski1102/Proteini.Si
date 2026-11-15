import { createContext, useContext } from "react";
import { confirmDialog, notify } from "../Components/Feedback/siteFeedback";

/* Toast / confirm / prompt context. The provider lives in AdminKit.jsx (AdminFeedbackProvider). */
export const FeedbackContext = createContext(null);

// Outside the admin provider: the site's own toast / confirm (no native browser dialogs). Prompts need the provider.
const fallback = {
  toast: {
    success: (m) => notify(m, { tone: "success" }),
    error: (m) => notify(m, { tone: "error" }),
    info: (m) => notify(m),
  },
  confirm: (o) => confirmDialog(o),
  prompt: async () => null,
};

export const useToast = () => (useContext(FeedbackContext) || fallback).toast;
export const useConfirm = () => (useContext(FeedbackContext) || fallback).confirm;
export const usePrompt = () => (useContext(FeedbackContext) || fallback).prompt;

