import { CheckCircle2, Copy, ExternalLink, X } from "lucide-react";

export default function RedemptionSuccessModal({ transaction, onClose }) {
  if (!transaction) return null;

  async function copyTxid() {
    await navigator.clipboard.writeText(transaction.txid);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={34} /><div><h2 className="text-2xl font-bold">Reward redeemed</h2><p className="mt-1 text-sm text-slate-500">Your transaction was broadcast successfully.</p></div></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="mt-7 space-y-4 rounded-2xl bg-slate-50 p-5">
          <Detail label="Reward" value={transaction.title} />
          <Detail label="Value" value={`${transaction.rewardSats.toLocaleString()} sats`} />
          {transaction.stampsBurned && <Detail label="Stamps burned" value={transaction.stampsBurned} />}
          <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Transaction ID</p><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs">{transaction.txid}</code><button type="button" onClick={copyTxid} title="Copy transaction ID" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white"><Copy size={16} /></button></div></div>
        </div>

        <a href={`https://chipnet.bchexplorer.info/tx/${transaction.txid}`} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"><ExternalLink size={17} />View on explorer</a>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">Done</button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-sm text-slate-500">{label}</span><span className="text-right font-semibold text-slate-900">{value}</span></div>;
}
