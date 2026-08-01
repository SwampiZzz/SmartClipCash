import { useState } from "react";
import { X, LoaderCircle } from "lucide-react";

import { useWallet } from "../../hooks/useWallet";
import { issueCoupon } from "../../lib/contract";

export default function IssueCouponModal({
  open,
  onClose,
  reward,
  onIssued,
}) {
  const { wallet, refreshWalletData } = useWallet();

  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPubKey, setCustomerPubKey] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleIssue(e) {
    e.preventDefault();

    if (!customerAddress.trim()) {
      alert("Customer address is required.");
      return;
    }

    if (!/^(02|03)[0-9a-fA-F]{64}$/.test(customerPubKey.trim())) {
      alert("Enter the customer's 33-byte compressed public key.");
      return;
    }
    if (!Number.isInteger(Number(expiryMinutes)) || Number(expiryMinutes) < 1) {
      alert("Expiry must be at least one minute.");
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

      alert("Coupon issued successfully!");

      setCustomerAddress("");
      setCustomerPubKey("");
      setExpiryMinutes(60);
      refreshWalletData();
      onIssued?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to issue coupon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">

          <div>

            <h2 className="text-2xl font-bold">
              Issue Coupon
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Send a coupon NFT to a customer.
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
          className="space-y-6 p-8"
        >

          {/* Coupon */}

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Coupon
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
              Customer Address
            </label>

            <input
              type="text"
              value={customerAddress}
              onChange={(e) =>
                setCustomerAddress(e.target.value)
              }
              placeholder="bchtest:q..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
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
              Customer Public Key
            </label>
            <input
              type="text"
              value={customerPubKey}
              onChange={(e) => setCustomerPubKey(e.target.value)}
              placeholder="02... or 03..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Demo Notice */}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

            <p className="text-sm text-amber-700">
              The coupon embeds its expiry and the recipient public-key hash, so
              the contract can enforce both expiry and non-transferable ownership.
            </p>

          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-3">

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

              Issue Coupon
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
