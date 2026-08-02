import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const styles = {
  success: { icon: CheckCircle2, iconClass: "bg-emerald-100 text-emerald-600", buttonClass: "bg-emerald-600 hover:bg-emerald-700" },
  error: { icon: AlertCircle, iconClass: "bg-red-100 text-red-600", buttonClass: "bg-red-600 hover:bg-red-700" },
  info: { icon: Info, iconClass: "bg-blue-100 text-blue-600", buttonClass: "bg-blue-600 hover:bg-blue-700" },
};

export default function FeedbackModal({ feedback, onClose }) {
  useEffect(() => {
    if (!feedback) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [feedback, onClose]);

  if (!feedback) return null;
  const current = styles[feedback.type] ?? styles.info;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${current.iconClass}`}><Icon size={26} /></div>
          <button type="button" onClick={onClose} aria-label="Close message" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <h2 id="feedback-title" className="mt-5 text-xl font-bold text-slate-900">{feedback.title}</h2>
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">{feedback.message}</p>
        <button type="button" onClick={onClose} autoFocus className={`mt-6 w-full rounded-xl px-4 py-3 font-semibold text-white transition ${current.buttonClass}`}>{feedback.actionLabel ?? "OK"}</button>
      </div>
    </div>
  );
}
