import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, LoaderCircle, Stamp, TicketPercent } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { getCustomerCoupons, getCustomerPunchCards } from "../../lib/token";
import { getCouponExpiry, redeemCoupon, redeemPunchCard } from "../../lib/contract";
import { getCouponName, getCouponRewardSats, getPunchCardConfig, getPunchCardName } from "../../lib/metadata";
import { wallets } from "../../constants/wallets";
import RedemptionSuccessModal from "../../components/modals/RedemptionSuccessModal";

export default function MyRewards() {
  const {
    wallet,
    refreshKey,
    refreshWalletData,
    transactionHistory,
    recordTransaction,
  } = useWallet();
  const [coupons, setCoupons] = useState([]);
  const [punchCards, setPunchCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const [showExpired, setShowExpired] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [successTransaction, setSuccessTransaction] = useState(null);

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
      setCurrentTime(Math.floor(Date.now() / 1000));
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

  const { activeCoupons, archivedCoupons } = useMemo(() => {
    return coupons.reduce((result, coupon) => {
      const expiry = getCouponExpiry(coupon.commitment);
      if (expiry !== null && expiry > currentTime) {
        result.activeCoupons.push({ ...coupon, expiry });
      } else {
        result.archivedCoupons.push({ ...coupon, expiry });
      }
      return result;
    }, { activeCoupons: [], archivedCoupons: [] });
  }, [coupons, currentTime]);

  async function handleCouponRedeem(coupon) {
    const key = `${coupon.txid}:${coupon.vout}`;
    try {
      setPending(key);
      const result = await redeemCoupon({
        businessWif: wallets.business.wif,
        businessAddress: wallets.business.address,
        customerWif: wallet.wif,
        customerAddress: wallet.address,
        category: coupon.category,
        discountValue: getCouponRewardSats(coupon.category),
        couponTxid: coupon.txid,
        couponVout: coupon.vout,
      });
      const transaction = {
        txid: result.txid,
        type: "Coupon redemption",
        title: getCouponName(coupon.category, coupon.commitment),
        rewardSats: getCouponRewardSats(coupon.category),
      };
      recordTransaction(transaction);
      setSuccessTransaction(transaction);
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
      const result = await redeemPunchCard({
        businessWif: wallets.business.wif,
        businessAddress: wallets.business.address,
        customerWif: wallet.wif,
        customerAddress: wallet.address,
        category: card.category,
        requiredStamps: config.requiredStamps,
        rewardValue: config.rewardSats,
      });
      const transaction = {
        txid: result.txid,
        type: "Punch-card redemption",
        title: getPunchCardName(card.category),
        rewardSats: config.rewardSats,
        stampsBurned: result.stampsBurned,
      };
      recordTransaction(transaction);
      setSuccessTransaction(transaction);
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Rewards</h1>
        <p className="mt-2 text-slate-500">Live CashTokens held by your connected wallet.</p>
      </div>

      {loading ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">Loading on-chain rewards...</div> : <>
        <section>
          <h2 className="mb-4 text-xl font-semibold">Active Coupons</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {activeCoupons.length ? activeCoupons.map((coupon) => <CouponCard key={`${coupon.txid}-${coupon.vout}`} coupon={coupon} busy={isBusy(coupon)} onRedeem={handleCouponRedeem} />) : <Empty label="No active coupons in this wallet." />}
          </div>
        </section>

        {archivedCoupons.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white">
          <button type="button" onClick={() => setShowExpired((value) => !value)} className="flex w-full items-center justify-between px-6 py-5 text-left">
            <span><span className="font-semibold">Expired & legacy coupons</span><span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{archivedCoupons.length}</span></span>
            {showExpired ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showExpired && <div className="grid gap-5 border-t border-slate-200 p-6 lg:grid-cols-2">
            {archivedCoupons.map((coupon) => <ArchivedCouponCard key={`${coupon.txid}-${coupon.vout}`} coupon={coupon} />)}
          </div>}
        </section>}

        <section>
          <h2 className="mb-4 text-xl font-semibold">Punch Cards</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {punchCards.length ? punchCards.map((card) => {
              const config = getPunchCardConfig(card.category);
              const ready = card.stamps >= config.requiredStamps;
              return <article key={`${card.txid}-${card.vout}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Stamp className="text-blue-600" /><h3 className="mt-4 text-lg font-semibold">{getPunchCardName(card.category)}</h3><p className="mt-2 text-sm text-slate-500">{card.stamps}/{config.requiredStamps} stamps · {config.rewardSats} sats reward</p><button disabled={!ready || Boolean(pending)} onClick={() => handlePunchRedeem(card)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{isBusy(card) && <LoaderCircle size={16} className="animate-spin" />}{ready ? "Redeem punch card" : "More stamps needed"}</button></article>;
            }) : <Empty label="No punch-card stamps in this wallet." />}
          </div>
        </section>

        {transactionHistory.length > 0 && <section>
          <h2 className="mb-4 text-xl font-semibold">Transaction History</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {transactionHistory.map((transaction) => <div key={`${transaction.txid}-${transaction.createdAt}`} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><div className="min-w-0"><p className="font-semibold">{transaction.type}</p><p className="mt-1 truncate font-mono text-xs text-slate-500">{transaction.txid}</p></div><div className="shrink-0 text-right"><p className="font-semibold">{Number(transaction.rewardSats).toLocaleString()} sats</p><p className="mt-1 text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</p></div></div>)}
          </div>
        </section>}
      </>}
      <RedemptionSuccessModal transaction={successTransaction} onClose={() => setSuccessTransaction(null)} />
    </div>
  );
}

function CouponCard({ coupon, busy, onRedeem }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><TicketPercent className="text-emerald-600" /><h3 className="mt-4 text-lg font-semibold">{getCouponName(coupon.category, coupon.commitment)}</h3><p className="mt-2 text-sm text-slate-500">One-time NFT · {getCouponRewardSats(coupon.category)} sats reward</p><p className="mt-1 text-xs text-slate-500">Expires {new Date(coupon.expiry * 1000).toLocaleString()}</p><button disabled={busy} onClick={() => onRedeem(coupon)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{busy && <LoaderCircle size={16} className="animate-spin" />}Redeem coupon</button></article>;
}

function ArchivedCouponCard({ coupon }) {
  const label = coupon.expiry === null ? "Legacy coupon — reissue required" : `Expired ${new Date(coupon.expiry * 1000).toLocaleString()}`;
  return <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 opacity-75"><TicketPercent className="text-slate-400" /><h3 className="mt-4 font-semibold">{getCouponName(coupon.category, coupon.commitment)}</h3><p className="mt-2 text-sm text-slate-500">{label}</p></article>;
}

function Empty({ label }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">{label}</div>;
}
