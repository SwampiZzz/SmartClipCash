import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { issueStamps } from "../../lib/contract";
import { getCustomerPunchCards } from "../../lib/token";
import { parseRedemptionReference } from "../../lib/redemptionReference";
import { useFeedback } from "../../hooks/useFeedback";

export default function IssuePunchCardModal({ open, reward, mode, onClose, onIssued }) {
  const { wallet, refreshWalletData } = useWallet();
  const { showFeedback } = useFeedback();
  const [customerAddress, setCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleIssue(event) {
    event.preventDefault();
    const enteredValue = customerAddress.trim();
    if (!enteredValue) {
      showFeedback({ type: "error", title: "Customer required", message: "Customer address is required." });
      return;
    }
    try {
      setLoading(true);
      const reference = parseRedemptionReference(enteredValue);
      if (reference && reference.type !== "punchcard") {
        throw new Error("Use a punch-card reference or the customer's CashAddr when issuing stamps.");
      }
      if (reference && reference.category !== reward.category.toLowerCase()) {
        throw new Error("This punch-card reference belongs to a different program.");
      }
      const recipientAddress = reference?.address ?? enteredValue;
      const customerCards = await getCustomerPunchCards(recipientAddress);
      const alreadyHasCard = customerCards.some(
        (card) => card.category.toLowerCase() === reward.category.toLowerCase(),
      );
      if (mode === "card" && alreadyHasCard) {
        throw new Error("This customer already has this punch card. Use Issue 1 Stamp instead.");
      }
      if (mode === "stamp" && !alreadyHasCard) {
        throw new Error("The customer must receive this punch card before another stamp can be issued.");
      }
      await issueStamps({
        businessWif: wallet.wif,
        businessAddress: wallet.address,
        customerAddress: recipientAddress,
        category: reward.category,
        stamps: 1,
      });
      setCustomerAddress("");
      refreshWalletData();
      onIssued?.();
      onClose();
      showFeedback({
        type: "success",
        title: mode === "card" ? "Punch card issued" : "Stamp issued",
        message: mode === "card" ? "The customer received the punch card and its first stamp." : "One stamp was issued to the customer's punch card.",
      });
    } catch (error) {
      console.error(error);
      showFeedback({ type: "error", title: "Stamp issuance failed", message: error.message || "Unable to issue stamps." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={handleIssue} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <h2 className="text-2xl font-bold">{mode === "card" ? "Issue Punch Card" : "Issue 1 Stamp"}</h2>
            <p className="mt-1 text-sm text-slate-500">{reward.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-8">
          <label className="block text-sm font-semibold">{mode === "stamp" ? "Customer address or punch-card reference" : "Customer address"}
            <input required value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder={mode === "stamp" ? "SCC1|PUNCH|bchtest:q...|category-id" : "bchtest:q..."} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500" />
          </label>
          <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{mode === "card" ? "Issuing a punch card enrolls the customer with its first stamp." : "The customer must present the address that holds this punch card. This action sends exactly 1 stamp."}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-6 py-3 font-medium">Cancel</button>
            <button disabled={loading} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-60">
              {loading && <LoaderCircle size={18} className="animate-spin" />} {mode === "card" ? "Issue Punch Card" : "Issue 1 Stamp"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
