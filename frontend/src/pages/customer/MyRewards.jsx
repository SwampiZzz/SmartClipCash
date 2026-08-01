import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, TicketPercent, Stamp } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { getCustomerCoupons, getCustomerPunchCards } from "../../lib/token";
import { redeemCoupon, redeemPunchCard } from "../../lib/contract";
import { getCouponName, getCouponRewardSats, getPunchCardConfig, getPunchCardName } from "../../lib/metadata";
import { wallets } from "../../constants/wallets";

export default function MyRewards() {
  const { wallet, refreshKey, refreshWalletData } = useWallet();
  const [coupons, setCoupons] = useState([]);
  const [punchCards, setPunchCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");

  const refreshRewards = useCallback(async () => {
    if (!wallet?.address) return;
    setLoading(true);
    try {
      const [nextCoupons, nextPunchCards] = await Promise.all([
        getCustomerCoupons(wallet.address),
        getCustomerPunchCards(wallet.address),
      ]);
      setCoupons(nextCoupons);
      setPunchCards(nextPunchCards);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to load rewards.");
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void Promise.resolve().then(refreshRewards);
  }, [refreshKey, refreshRewards]);

  async function handleCouponRedeem(coupon) {
    const key = `${coupon.txid}:${coupon.vout}`;
    try {
      setPending(key);
      await redeemCoupon({
        businessWif: wallets.business.wif,
        businessAddress: wallets.business.address,
        customerWif: wallet.wif,
        customerAddress: wallet.address,
        category: coupon.category,
        discountValue: getCouponRewardSats(coupon.category),
      });
      refreshWalletData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Coupon redemption failed.");
    } finally {
      setPending("");
    }
  }

  async function handlePunchRedeem(card) {
    const config = getPunchCardConfig(card.category);
    const key = `${card.txid}:${card.vout}`;
    try {
      setPending(key);
      await redeemPunchCard({
        businessWif: wallets.business.wif,
        businessAddress: wallets.business.address,
        customerWif: wallet.wif,
        customerAddress: wallet.address,
        category: card.category,
        requiredStamps: config.requiredStamps,
        rewardValue: config.rewardSats,
      });
      refreshWalletData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Punch-card redemption failed.");
    } finally {
      setPending("");
    }
  }

  const isBusy = (item) => pending === `${item.txid}:${item.vout}`;
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-slate-900">My Rewards</h1><p className="mt-2 text-slate-500">Live CashTokens held by your connected wallet.</p></div>
      {loading ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">Loading on-chain rewards...</div> : <>
        <section><h2 className="mb-4 text-xl font-semibold">Coupons</h2><div className="grid gap-5 lg:grid-cols-2">
          {coupons.length ? coupons.map((coupon) => <article key={`${coupon.txid}-${coupon.vout}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><TicketPercent className="text-emerald-600" /><h3 className="mt-4 text-lg font-semibold">{getCouponName(coupon.category, coupon.commitment)}</h3><p className="mt-2 text-sm text-slate-500">One-time NFT · {getCouponRewardSats(coupon.category)} sats reward</p><button disabled={Boolean(pending)} onClick={() => handleCouponRedeem(coupon)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{isBusy(coupon) && <LoaderCircle size={16} className="animate-spin" />}Redeem coupon</button></article>) : <Empty label="No coupons in this wallet." />}
        </div></section>
        <section><h2 className="mb-4 text-xl font-semibold">Punch Cards</h2><div className="grid gap-5 lg:grid-cols-2">
          {punchCards.length ? punchCards.map((card) => { const config = getPunchCardConfig(card.category); const ready = card.stamps >= config.requiredStamps; return <article key={`${card.txid}-${card.vout}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Stamp className="text-blue-600" /><h3 className="mt-4 text-lg font-semibold">{getPunchCardName(card.category)}</h3><p className="mt-2 text-sm text-slate-500">{card.stamps}/{config.requiredStamps} stamps · {config.rewardSats} sats reward</p><button disabled={!ready || Boolean(pending)} onClick={() => handlePunchRedeem(card)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{isBusy(card) && <LoaderCircle size={16} className="animate-spin" />}{ready ? "Redeem punch card" : "More stamps needed"}</button></article>; }) : <Empty label="No punch-card stamps in this wallet." />}
        </div></section>
      </>}
    </div>
  );
}

function Empty({ label }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">{label}</div>; }
