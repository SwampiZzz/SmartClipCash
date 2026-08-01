import { useState } from "react";
import { Plus } from "lucide-react";

import RewardTabs from "../../components/rewards/RewardTabs";
import RewardCard from "../../components/rewards/RewardCard";

export default function ManageRewards() {
  const [activeTab, setActiveTab] = useState("coupons");

  // Temporary data until blockchain integration
  const coupons = [
    {
      id: 1,
      title: "10% Discount",
      description: "Receive 10% off your purchase.",
      transferable: true,
      reward: "10% OFF",
    },
    {
      id: 2,
      title: "Free Coffee",
      description: "Redeem one free brewed coffee.",
      transferable: false,
      reward: "FREE ITEM",
    },
  ];

  const punchCards = [
    {
      id: 1,
      title: "Coffee Loyalty",
      description: "Collect 5 stamps and receive a free drink.",
      required: 5,
      reward: "Free Coffee",
    },
    {
      id: 2,
      title: "Burger Club",
      description: "Collect 8 stamps and receive a free burger.",
      required: 8,
      reward: "Free Burger",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Manage Rewards
        </h1>

        <p className="mt-2 text-slate-500">
          Create, manage and issue blockchain-powered loyalty rewards.
        </p>

      </div>

      {/* Tabs */}

      <RewardTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Coupons */}

      {activeTab === "coupons" && (

        <>

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                Coupons
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Issue one-time NFT coupons to customers.
              </p>

            </div>

            <button
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              New Coupon
            </button>

          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {coupons.map((coupon) => (

              <RewardCard
                key={coupon.id}
                type="coupon"
                reward={coupon}
              />

            ))}

          </div>

        </>

      )}

      {/* Punch Cards */}

      {activeTab === "punchcards" && (

        <>

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                Punch Cards
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Reward loyal customers with blockchain stamps.
              </p>

            </div>

            <button
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              New Punch Card
            </button>

          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {punchCards.map((card) => (

              <RewardCard
                key={card.id}
                type="punchcard"
                reward={card}
              />

            ))}

          </div>

        </>

      )}

      {/* Vouchers */}

      {activeTab === "vouchers" && (

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">

          <h2 className="text-2xl font-semibold text-slate-700">
            Vouchers
          </h2>

          <p className="mt-3 text-slate-500">
            Voucher contracts are still under development and will be
            available in a future update.
          </p>

        </div>

      )}

    </div>
  );
}