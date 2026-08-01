import { useState } from "react";
import { User, Store } from "lucide-react";
import { wallets } from "../../constants/wallets";

export default function ConnectWallet() {
  const [selectedWallet, setSelectedWallet] = useState(null);

  return (
    <main className="mx-auto max-w-3xl py-20">

      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <div className="text-center">

          <h1 className="text-4xl font-bold">
            Connect Wallet
          </h1>

          <p className="mt-3 text-slate-600">
            Select one of the demo Chipnet wallets to continue.
          </p>

        </div>

        {/* Wallet Cards */}

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          <button
            onClick={() => setSelectedWallet(wallets.business)}
            className={`rounded-2xl border p-6 text-left transition ${
              selectedWallet?.role === "Business"
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-emerald-300"
            }`}
          >
            <Store className="mb-5 text-emerald-600" size={36} />

            <h2 className="text-xl font-semibold">
              Business
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Merchant demo wallet
            </p>

          </button>

          <button
            onClick={() => setSelectedWallet(wallets.customer)}
            className={`rounded-2xl border p-6 text-left transition ${
              selectedWallet?.role === "Customer"
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-emerald-300"
            }`}
          >
            <User className="mb-5 text-emerald-600" size={36} />

            <h2 className="text-xl font-semibold">
              Customer
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Customer demo wallet
            </p>

          </button>

        </div>

        {/* Preview */}

        {selectedWallet && (

          <div className="mt-10 space-y-5">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Selected Wallet
              </label>

              <input
                readOnly
                value={selectedWallet.address}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Role
              </label>

              <input
                readOnly
                value={selectedWallet.role}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3"
              />

            </div>

            <button
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Connect to Wallet
            </button>

          </div>

        )}

      </div>

    </main>
  );
}