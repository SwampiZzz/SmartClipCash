import {
  Store,
  Gift,
  Wallet,
  Coins,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="space-y-24 pb-20">

      {/* ================= HERO ================= */}

      <section className="text-center">

        <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
          How SmartClipCash Works
        </span>

        <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
          From Purchase
          <span className="block text-emerald-600">
            to Reward Redemption
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          SmartClipCash replaces traditional paper loyalty cards with
          secure blockchain-powered digital reward stamps using
          Bitcoin Cash CashTokens.
        </p>

      </section>

      {/* ================= FLOW ================= */}

      <section>

        <h2 className="mb-14 text-center text-3xl font-bold text-slate-900">
          Customer Journey
        </h2>

        <div className="grid gap-10 lg:grid-cols-4">

          {/* Step 1 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <Store className="mb-6 text-emerald-600" size={36} />

            <span className="text-sm font-semibold text-emerald-600">
              STEP 1
            </span>

            <h3 className="mt-2 text-xl font-semibold">
              Make a Purchase
            </h3>

            <p className="mt-4 text-slate-600">
              The customer buys from a participating merchant.
            </p>

          </div>

          {/* Step 2 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <Coins className="mb-6 text-emerald-600" size={36} />

            <span className="text-sm font-semibold text-emerald-600">
              STEP 2
            </span>

            <h3 className="mt-2 text-xl font-semibold">
              Receive Digital Stamp
            </h3>

            <p className="mt-4 text-slate-600">
              The merchant issues a CashToken reward directly to the customer's wallet.
            </p>

          </div>

          {/* Step 3 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <Wallet className="mb-6 text-emerald-600" size={36} />

            <span className="text-sm font-semibold text-emerald-600">
              STEP 3
            </span>

            <h3 className="mt-2 text-xl font-semibold">
              Collect Rewards
            </h3>

            <p className="mt-4 text-slate-600">
              Every purchase adds more digital stamps until the required amount is reached.
            </p>

          </div>

          {/* Step 4 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <Gift className="mb-6 text-emerald-600" size={36} />

            <span className="text-sm font-semibold text-emerald-600">
              STEP 4
            </span>

            <h3 className="mt-2 text-xl font-semibold">
              Redeem Reward
            </h3>

            <p className="mt-4 text-slate-600">
              Redeem completed punch cards for exclusive rewards offered by the merchant.
            </p>

          </div>

        </div>

      </section>

      {/* ================= WHY BLOCKCHAIN ================= */}

      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          <div>

            <h2 className="text-3xl font-bold text-slate-900">
              Why Bitcoin Cash?
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Instead of paper punch cards that can be lost, damaged,
              or duplicated, SmartClipCash stores loyalty rewards as
              blockchain-based CashTokens.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex items-start gap-4">

                <ShieldCheck className="mt-1 text-emerald-600" />

                <div>

                  <h3 className="font-semibold">
                    Secure Ownership
                  </h3>

                  <p className="text-slate-600">
                    Rewards belong to the customer's wallet.
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-4">

                <Coins className="mt-1 text-emerald-600" />

                <div>

                  <h3 className="font-semibold">
                    Powered by CashTokens
                  </h3>

                  <p className="text-slate-600">
                    Digital loyalty stamps are issued on Bitcoin Cash.
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-slate-50 p-8">

            <h3 className="text-lg font-semibold">
              Reward Flow
            </h3>

            <div className="mt-8 space-y-6">

              <div className="flex items-center justify-between">

                <span>Merchant</span>

                <ArrowRight />

                <span>Issue Stamp</span>

              </div>

              <div className="flex items-center justify-between">

                <span>CashToken</span>

                <ArrowRight />

                <span>Customer Wallet</span>

              </div>

              <div className="flex items-center justify-between">

                <span>Collect</span>

                <ArrowRight />

                <span>Redeem</span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= BENEFITS ================= */}

      <section>

        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
          Benefits
        </h2>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <h3 className="text-xl font-semibold">
              For Businesses
            </h3>

            <ul className="mt-5 space-y-3 text-slate-600">
              <li>• Paperless loyalty program</li>
              <li>• Faster customer retention</li>
              <li>• Easy reward distribution</li>
            </ul>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <h3 className="text-xl font-semibold">
              For Customers
            </h3>

            <ul className="mt-5 space-y-3 text-slate-600">
              <li>• Never lose reward cards</li>
              <li>• Secure ownership</li>
              <li>• Easy reward tracking</li>
            </ul>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <h3 className="text-xl font-semibold">
              For Everyone
            </h3>

            <ul className="mt-5 space-y-3 text-slate-600">
              <li>• Transparent transactions</li>
              <li>• Environment friendly</li>
              <li>• Powered by Bitcoin Cash</li>
            </ul>

          </div>

        </div>

      </section>

    </div>
  );
}