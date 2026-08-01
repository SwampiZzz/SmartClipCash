export default function ConnectWalletModal({
  isOpen,
  walletAddress,
  setWalletAddress,
  onClose,
  onConnect,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <h2 className="text-2xl font-bold text-slate-900">
          Connect Wallet
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Enter a Chipnet wallet address to continue.
        </p>

        <div className="mt-6">

          <label className="mb-2 block text-sm font-medium">
            Wallet Address
          </label>

          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="chipnet:..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none"
          />

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConnect}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700"
          >
            Connect
          </button>

        </div>

      </div>

    </div>
  );
}