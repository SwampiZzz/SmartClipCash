import { Store, User, X } from "lucide-react";
import { wallets } from "../../constants/wallets";
import { useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import { useNavigate } from "react-router-dom";

export default function ConnectWalletModal({
  isOpen,
  onClose,
}) {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { setWallet } = useWallet();
  const navigate = useNavigate();

  if (!isOpen) return null;

  function handleConnect() {
    if (!selectedWallet) return;

    setWallet(selectedWallet);

    onClose();

    if (selectedWallet.role === "merchant") {
      navigate("/merchant/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold">
              Connect Wallet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a demo Chipnet wallet.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Wallet Selection */}

        <div className="space-y-4">

          <button
            onClick={() => setSelectedWallet(wallets.business)}
            className={`w-full rounded-2xl border p-5 text-left transition ${
              selectedWallet?.role === "merchant"
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center gap-4">

              <Store
                className="text-emerald-600"
                size={28}
              />

              <div>

                <h3 className="font-semibold">
                  Merchant Wallet
                </h3>

                <p className="text-sm text-slate-500">
                  Demo Business Account
                </p>

              </div>

            </div>

          </button>

          <button
            onClick={() => setSelectedWallet(wallets.customer)}
            className={`w-full rounded-2xl border p-5 text-left transition ${
              selectedWallet?.role === "customer"
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center gap-4">

              <User
                className="text-emerald-600"
                size={28}
              />

              <div>

                <h3 className="font-semibold">
                  Customer Wallet
                </h3>

                <p className="text-sm text-slate-500">
                  Demo Customer Account
                </p>

              </div>

            </div>

          </button>

        </div>

        {/* Wallet Preview */}

        {selectedWallet && (

          <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-5">

            <div>

              <label className="text-sm font-medium">
                Wallet Address
              </label>

              <input
                readOnly
                value={selectedWallet.address}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                Selected Role
              </label>

              <input
                readOnly
                value={selectedWallet.role}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
              />

            </div>

          </div>

        )}

        {/* Footer */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2 font-medium hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            disabled={!selectedWallet}
            onClick={handleConnect}
            className="rounded-xl bg-emerald-600 px-5 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Connect Wallet
          </button>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo Mode • Uses preconfigured Chipnet wallets for the hackathon.
        </p>

      </div>

    </div>
  );
}