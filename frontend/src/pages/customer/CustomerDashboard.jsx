import { useEffect, useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import { getCustomerSummary } from "../../lib/token";

import {
  TicketPercent,
  Stamp,
  ChevronRight,
  Clock3,
} from "lucide-react";

export default function CustomerDashboard() {
  const { wallet } = useWallet();

  const [summary, setSummary] = useState({
    coupons: 0,
    punchCards: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!wallet?.address) return;

      try {
        const data = await getCustomerSummary(wallet.address);
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [wallet]);

  const redeemables = [
    {
      title: "Free Coffee",
      merchant: "Lumina Café",
      status:
        summary.punchCards >= 5
          ? "Ready to Redeem"
          : `${summary.punchCards}/5 Stamps`,
      ready: summary.punchCards >= 5,
    },
    {
      title: "10% Discount Coupon",
      merchant: "Lumina Café",
      status:
        summary.coupons > 0
          ? "Available"
          : "No Coupons",
      ready: summary.coupons > 0,
    },
  ];

  const activity = [
    "Connected to SmartClipCash",
    "Waiting for blockchain activity...",
  ];

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Customer Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          View your blockchain rewards and loyalty progress.
        </p>

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Coupons
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Punch Card Stamps
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {loading ? "--" : summary.punchCards}
              </h2>

            </div>

            <Stamp
              className="text-emerald-600"
              size={34}
            />

          </div>

        </div>

      </div>

      {/* Redeemables */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="text-lg font-semibold">
            Redeemables
          </h2>

        </div>

        <div>

          {redeemables.map((reward, index) => (

            <div
              key={index}
              className="flex flex-col items-start gap-3 border-b border-slate-100 px-5 py-5 last:border-none sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >

              <div>

                <h3 className="font-semibold">
                  {reward.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {reward.merchant}
                </p>

              </div>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-5">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    reward.ready
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {reward.status}
                </span>

                <ChevronRight
                  size={18}
                  className="text-slate-400"
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Recent Activity */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="text-lg font-semibold">
            Recent Activity
          </h2>

        </div>

        <div className="space-y-4 p-6">

          {activity.map((item, index) => (

            <div
              key={index}
              className="flex items-center gap-4"
            >

              <Clock3
                size={18}
                className="text-slate-400"
              />

              <p className="text-sm text-slate-700">
                {item}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
