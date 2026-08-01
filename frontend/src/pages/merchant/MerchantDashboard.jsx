import { useEffect, useState } from "react";
import { useWallet } from "../../hooks/useWallet";

import { getMerchantSummary } from "../../lib/token";

import {
  Stamp,
  TicketPercent,
  Activity,
  CircleDollarSign,
} from "lucide-react";

import { NETWORK } from "../../config/appConfig";

export default function MerchantDashboard() {
  const { wallet, refreshKey } = useWallet();

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    balance: 0,
    stamps: 0,
    coupons: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      if (!wallet?.address) return;

      try {
        const data = await getMerchantSummary(wallet.address);
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [wallet, refreshKey]);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Merchant Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor your SmartClipCash reward inventory.
        </p>
      </div>

      {/* Summary */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Stamp Supply */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Stamp Supply
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {loading ? "--" : summary.stamps}
              </h2>

            </div>

            <Stamp
              className="text-emerald-600"
              size={34}
            />

          </div>

        </div>

        {/* Coupons */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

            <p className="text-sm text-slate-500">
              NFTs in Wallet
            </p>

              <h2 className="mt-2 text-4xl font-bold">
                {loading ? "--" : summary.coupons}
              </h2>

            </div>

            <TicketPercent
              className="text-emerald-600"
              size={34}
            />

          </div>

        </div>

        {/* Wallet */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                BCH Balance
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {loading ? "--" : `${summary.balance.toLocaleString()} sats`}
              </h2>

            </div>

            <CircleDollarSign
              className="text-emerald-600"
              size={34}
            />

          </div>

        </div>

      </div>

      {/* Network Information */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="font-semibold">
              Blockchain Information
            </h2>

          </div>

          <div className="space-y-5 p-6">

            <div className="flex justify-between">

              <span className="text-slate-500">
                Network
              </span>

              <span className="font-medium capitalize">
                {NETWORK}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Wallet
              </span>

              <span className="max-w-xs truncate font-medium">
                {wallet?.address}
              </span>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Live inventory</h2>
          <p className="mt-3 text-sm text-slate-500">
            Token categories and balances are read from the connected wallet’s UTXOs.
          </p>
        </div>

      </div>

      {/* Activity */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="font-semibold">
            Recent Activity
          </h2>

        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">

          <Activity
            size={40}
            className="mb-4 text-slate-300"
          />

          <p className="font-medium text-slate-700">
            No activity yet
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Issuing stamps, coupons and redemptions will appear here.
          </p>

        </div>

      </div>

    </div>
  );
}
