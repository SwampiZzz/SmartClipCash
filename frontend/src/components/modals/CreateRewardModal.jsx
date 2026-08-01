import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { createRewardCategory } from "../../lib/contract";
import { saveRewardMetadata } from "../../lib/metadata";

export default function CreateRewardModal({ open, type, onClose, onCreated }) {
  const { wallet, refreshWalletData } = useWallet();
  const [name, setName] = useState("");
  const [initialSupply, setInitialSupply] = useState(1000);
  const [requiredStamps, setRequiredStamps] = useState(5);
  const [rewardSats, setRewardSats] = useState(1000);
  const [loading, setLoading] = useState(false);

  if (!open) return null;
  const isCoupon = type === "coupon";

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    try {
      setLoading(true);
      const result = await createRewardCategory({
        businessWif: wallet.wif,
        businessAddress: wallet.address,
        type,
        initialSupply: isCoupon ? 0 : initialSupply,
      });
      saveRewardMetadata(result.category, {
        name: cleanName,
        rewardSats: Number(rewardSats),
        ...(isCoupon ? {} : { requiredStamps: Number(requiredStamps) }),
      });
      refreshWalletData();
      await onCreated?.(result);
      setName("");
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to create reward category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
          <div><h2 className="text-2xl font-bold">New {isCoupon ? "Coupon" : "Punch Card"}</h2><p className="mt-1 text-sm text-slate-500">Create a new on-chain CashToken category.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-5 p-5 sm:p-8">
          <label className="block text-sm font-semibold">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500" /></label>
          {!isCoupon && <label className="block text-sm font-semibold">Initial stamp supply<input required type="number" min="1" step="1" value={initialSupply} onChange={(e) => setInitialSupply(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>}
          {!isCoupon && <label className="block text-sm font-semibold">Stamps required<input required type="number" min="1" step="1" value={requiredStamps} onChange={(e) => setRequiredStamps(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>}
          <label className="block text-sm font-semibold">Reward value (sats)<input required type="number" min="800" step="1" value={rewardSats} onChange={(e) => setRewardSats(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Creation requires a BCH-only wallet coin whose output index is 0. The resulting minting authority stays in the merchant wallet.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-6 py-3 font-medium">Cancel</button><button disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-60">{loading && <LoaderCircle size={18} className="animate-spin" />}Create on-chain</button></div>
        </div>
      </form>
    </div>
  );
}
