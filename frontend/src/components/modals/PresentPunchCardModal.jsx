import { Copy, X } from "lucide-react";
import { createPunchCardReference } from "../../lib/redemptionReference";

export default function PresentPunchCardModal({ card, address, requiredStamps, onClose }) {
  if (!card) return null;

  const reference = createPunchCardReference({ address, category: card.category });

  async function copyReference() {
    await navigator.clipboard.writeText(reference);
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">Present punch card to merchant</h2><p className="mt-2 text-sm leading-6 text-slate-500">Show this reference to the merchant when your card is complete. It identifies this exact punch-card program.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X size={20} /></button></div><div className="mt-6 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Punch-card redemption reference</p><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-3 text-xs text-slate-700">{reference}</code><button type="button" onClick={copyReference} title="Copy punch-card reference" className="shrink-0 rounded-lg border border-slate-200 p-3 text-slate-600 hover:bg-white"><Copy size={16} /></button></div></div><p className="mt-5 text-sm text-slate-600">You have {card.stamps} of {requiredStamps} required stamps. The merchant can redeem this card only once the requirement is met.</p><button type="button" onClick={onClose} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">Done</button></div></div>;
}
