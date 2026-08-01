import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { issueStamps } from "../../lib/contract";

export default function IssuePunchCardModal({ open, reward, onClose, onIssued }) {
  const { wallet, refreshWalletData } = useWallet();
  const [customerAddress, setCustomerAddress] = useState("");
  const [stamps, setStamps] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleIssue(event) {
    event.preventDefault();
    if (!customerAddress.trim()) {
      alert("Customer address is required.");
      return;
    }
    try {
      setLoading(true);
      await issueStamps({
        businessWif: wallet.wif,
        businessAddress: wallet.address,
        customerAddress: customerAddress.trim(),
        category: reward.category,
        stamps,
      });
      setCustomerAddress("");
      setStamps(1);
      refreshWalletData();
      onIssued?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to issue stamps.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={handleIssue} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <h2 className="text-2xl font-bold">Issue Stamps</h2>
            <p className="mt-1 text-sm text-slate-500">{reward.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-8">
          <label className="block text-sm font-semibold">Customer Address
            <input required value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="bchtest:q..." className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500" />
          </label>
          <label className="block text-sm font-semibold">Stamps to issue
            <input type="number" min="1" max={reward.supply} value={stamps} onChange={(event) => setStamps(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500" />
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-6 py-3 font-medium">Cancel</button>
            <button disabled={loading} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-60">
              {loading && <LoaderCircle size={18} className="animate-spin" />} Issue Stamps
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
