import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stamp, TicketPercent } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { getCustomerPunchCards, getCustomerSummary } from "../../lib/token";
import { getPunchCardConfig, getPunchCardName } from "../../lib/metadata";

export default function CustomerDashboard() {
  const { wallet, refreshKey } = useWallet();
  const [summary, setSummary] = useState({ coupons: 0, punchCards: 0 });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!wallet?.address) return;
      try {
        const [nextSummary, nextCards] = await Promise.all([
          getCustomerSummary(wallet.address),
          getCustomerPunchCards(wallet.address),
        ]);
        setSummary(nextSummary);
        setCards(nextCards);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    void loadDashboard();
  }, [wallet, refreshKey]);

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-slate-900">Customer Dashboard</h1><p className="mt-2 text-slate-500">Live reward balances from your connected wallet.</p></div>

      <div className="grid gap-6 md:grid-cols-2">
        <SummaryCard label="Active Coupons" value={loading ? "--" : summary.coupons} icon={<TicketPercent className="text-emerald-600" size={34} />} />
        <SummaryCard label="Punch Card Stamps" value={loading ? "--" : summary.punchCards} icon={<Stamp className="text-emerald-600" size={34} />} />
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
          {loading ? <p className="text-sm text-slate-500">Loading on-chain stamp balances...</p> : cards.length ? cards.map((card) => {
            const config = getPunchCardConfig(card.category);
            const progress = Math.min(100, Math.round((card.stamps / config.requiredStamps) * 100));
            return <div key={card.category} className="rounded-xl bg-slate-50 p-5"><div className="flex items-center justify-between gap-4"><div><h3 className="font-semibold">{getPunchCardName(card.category)}</h3><p className="mt-1 text-sm text-slate-500">{card.stamps}/{config.requiredStamps} stamps · {config.rewardSats} sats reward</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.stamps >= config.requiredStamps ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{card.stamps >= config.requiredStamps ? "Ready" : "In progress"}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} /></div></div>;
          }) : <p className="text-sm text-slate-500">No punch-card stamps in this wallet.</p>}
        </div>
      </section>
    </div>
  );
}
