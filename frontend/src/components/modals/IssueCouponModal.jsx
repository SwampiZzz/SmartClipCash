import { useState } from "react";
import { X, LoaderCircle } from "lucide-react";

import { useWallet } from "../../hooks/useWallet";
import { issueCoupon } from "../../lib/contract";
import { useFeedback } from "../../hooks/useFeedback";
import { wallets } from "../../constants/wallets";

export default function IssueCouponModal({
  open,
  onClose,
  reward,
  onIssued,
}) {
  const { wallet, refreshWalletData } = useWallet();
  const { showFeedback } = useFeedback();

  const [customerAddress, setCustomerAddress] = useState(wallets.customer.address);
  const [customerPubKey, setCustomerPubKey] = useState(wallets.customer.pubkeyHex);
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleIssue(e) {
    e.preventDefault();

    if (!customerAddress.trim()) {
      showFeedback({ type: "error", title: "Customer required", message: "Customer address is required." });
      return;
    }

    if (!/^(02|03)[0-9a-fA-F]{64}$/.test(customerPubKey.trim())) {
      showFeedback({ type: "error", title: "Invalid public key", message: "Enter the customer's 33-byte compressed public key." });
      return;
    }
    if (!Number.isInteger(Number(expiryMinutes)) || Number(expiryMinutes) < 1) {
      showFeedback({ type: "error", title: "Invalid expiry", message: "Expiry must be at least one minute." });
      return;
    }

    try {
      setLoading(true);

      await issueCoupon({
        businessWif: wallet.wif,
        businessAddress: wallet.address,
        customerAddress: customerAddress.trim(),
        customerPubKey: customerPubKey.trim(),
        category: reward.category,
        expiryUnixSeconds: Math.floor(Date.now() / 1000) + (Number(expiryMinutes) * 60),
      });

      setCustomerAddress(wallets.customer.address);
      setCustomerPubKey(wallets.customer.pubkeyHex);
      setExpiryMinutes(60);
      refreshWalletData();
      onIssued?.();
      onClose();
      showFeedback({ type: "success", title: "Coupon issued", message: "The coupon NFT was issued to the customer successfully." });
    } catch (err) {
      console.error(err);
      showFeedback({ type: "error", title: "Coupon issuance failed", message: err.message || "Unable to issue coupon." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">

      <div className="my-auto w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl max-h-[calc(100dvh-2rem)]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">

          <div>

            <h2 className="text-2xl font-bold">
              Issue Coupon/Voucher
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Send a coupon/voucher NFT to a customer.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={handleIssue}
          className="space-y-5 p-5 sm:space-y-6 sm:p-8"
        >

          {/* Coupon */}

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Coupon/Voucher
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <h3 className="font-semibold">
                {reward.name ?? reward.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {reward.description}
              </p>

            </div>

          </div>

          {/* Customer */}

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Demo Customer Address
            </label>

            <input
              type="text"
              value={customerAddress}
              readOnly
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
            />

          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Expires in (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Demo Customer Public Key
            </label>
            <input
              type="text"
              value={customerPubKey}
              readOnly
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600 outline-none"
            />
          </div>

          {/* Demo Notice */}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

            <p className="text-sm text-amber-700">
              Demo mode uses the preconfigured customer address and matching
              compressed public key. The coupon embeds its expiry and the
              recipient public-key hash for ownership enforcement.
            </p>

          </div>

          {/* Buttons */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-6 py-3 font-medium"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              )}

              Issue Coupon/Voucher
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
