import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useWallet } from "../../hooks/useWallet";

import RewardTabs from "../../components/rewards/RewardTabs";
import RewardCard from "../../components/rewards/RewardCard";
import IssueCouponModal from "../../components/modals/IssueCouponModal";
import IssuePunchCardModal from "../../components/modals/IssuePunchCardModal";
import CreateRewardModal from "../../components/modals/CreateRewardModal";

import {
  getMerchantCouponInventory,
  getMerchantPunchInventory,
} from "../../lib/inventory";

export default function ManageRewards() {
  const { wallet, refreshKey } = useWallet();

  const [activeTab, setActiveTab] = useState("coupons");

  const [loading, setLoading] = useState(true);

  const [coupons, setCoupons] = useState([]);
  const [punchCards, setPunchCards] = useState([]);

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedPunchCard, setSelectedPunchCard] = useState(null);
  const [createType, setCreateType] = useState(null);

  const refreshInventory = useCallback(async () => {
    if (!wallet?.address) return;

    setLoading(true);

    try {
      const [couponInventory, punchInventory] =
        await Promise.all([
          getMerchantCouponInventory(wallet.address),
          getMerchantPunchInventory(wallet.address),
        ]);

      setCoupons(couponInventory);
      setPunchCards(punchInventory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void Promise.resolve().then(refreshInventory);
  }, [refreshInventory, refreshKey]);

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

      {/* ================= COUPONS ================= */}

      {activeTab === "coupons" && (
        <>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                Coupons/Vouchers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                One-time redeemable NFT coupons/vouchers.
              </p>

            </div>

            <button
              type="button"
              onClick={() => setCreateType("coupon")}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              New Coupon/Voucher
            </button>

          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {loading ? (

              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">

                <p className="text-slate-500">
                  Loading coupons/vouchers...
                </p>

              </div>

            ) : coupons.length === 0 ? (

              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">

                <h3 className="text-lg font-semibold">
                  No Coupons/Vouchers Found
                </h3>

                <p className="mt-2 text-slate-500">
                  Create your first coupon/voucher NFT to start issuing rewards.
                </p>

              </div>

            ) : (

              coupons.map((coupon) => (

                <RewardCard
                  key={`${coupon.txid}-${coupon.vout}`}
                  type="coupon"
                  reward={coupon}
                  onIssue={setSelectedCoupon}
                />

              ))

            )}

          </div>

        </>
      )}

      {/* ================= PUNCH CARDS ================= */}

      {activeTab === "punchcards" && (
        <>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-semibold">Punch Cards</h2>
              <p className="mt-1 text-sm text-slate-500">
                Loyalty stamp collections stored on-chain.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateType("punchcard")}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              New Punch Card
            </button>

          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {loading ? (

              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">

                <p className="text-slate-500">
                  Loading punch cards...
                </p>

              </div>

            ) : punchCards.length === 0 ? (

              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">

                <h3 className="text-lg font-semibold">
                  No Punch Cards Found
                </h3>

                <p className="mt-2 text-slate-500">
                  Create a stamp reserve with the genesis CLI, then it will appear here for issuing.
                </p>

              </div>

            ) : (

              punchCards.map((card) => (

                <RewardCard
                  key={card.category}
                  type="punchcard"
                  reward={card}
                  onIssuePunchCard={(reward) => setSelectedPunchCard({ reward, mode: "card" })}
                  onIssueStamp={(reward) => setSelectedPunchCard({ reward, mode: "stamp" })}
                />

              ))

            )}

          </div>

        </>
      )}

      <IssueCouponModal
        open={selectedCoupon !== null}
        reward={selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
        onIssued={refreshInventory}
      />
      <IssuePunchCardModal
        open={selectedPunchCard !== null}
        reward={selectedPunchCard?.reward}
        mode={selectedPunchCard?.mode}
        onClose={() => setSelectedPunchCard(null)}
        onIssued={refreshInventory}
      />
      <CreateRewardModal
        open={createType !== null}
        type={createType}
        onClose={() => setCreateType(null)}
        onCreated={refreshInventory}
      />

    </div>
  );
}
