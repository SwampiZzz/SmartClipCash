import { useCallback, useMemo, useState } from "react";
import FeedbackModal from "../components/modals/FeedbackModal";
import { FeedbackContext } from "./FeedbackContext";

export default function FeedbackProvider({ children }) {
  const [feedback, setFeedback] = useState(null);
  const showFeedback = useCallback((nextFeedback) => {
    setFeedback({ type: "info", title: "Message", message: "", ...nextFeedback });
  }, []);
  const closeFeedback = useCallback(() => setFeedback(null), []);
  const value = useMemo(() => ({ showFeedback, closeFeedback }), [closeFeedback, showFeedback]);

  return <FeedbackContext.Provider value={value}>{children}<FeedbackModal feedback={feedback} onClose={closeFeedback} /></FeedbackContext.Provider>;
}
