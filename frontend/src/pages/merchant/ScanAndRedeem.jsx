import { useCallback, useState } from "react";
import { LoaderCircle, ScanLine, Stamp, TicketPercent } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { getCustomerCoupons, getCustomerPunchCards } from "../../lib/token";
import { redeemCoupon, redeemPunchCard } from "../../lib/contract";
import { getCouponRewardSats, getCouponName, getPunchCardConfig, getPunchCardName } from "../../lib/metadata";
import { wallets } from "../../constants/wallets";
import RedemptionSuccessModal from "../../components/modals/RedemptionSuccessModal";
import { parseCouponReference } from "../../lib/redemptionReference";
import ScanCouponQrModal from "../../components/modals/ScanCouponQrModal";

export default function ScanAndRedeem() {
  const { wallet, refreshWalletData, recordTransaction } = useWallet();
  const [customerAddress, setCustomerAddress] = useState("");
  const [loadedAddress, setLoadedAddress] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState("");
  const [successTransaction, setSuccessTransaction] = useState(null);
  const [couponReference, setCouponReference] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const loadReference = useCallback(async (value) => {
    const enteredValue = value.trim();
    if (!enteredValue) return;
    const reference = parseRedemptionReference(enteredValue);
    const address = reference?.address ?? enteredValue;
    try {
      setLoading(true);
      const [nextCoupons, nextCards] = await Promise.all([
        getCustomerCoupons(address),
        getCustomerPunchCards(address),
      ]);
      const selectedCoupons = reference?.type === "coupon"
        ? nextCoupons.filter((coupon) => coupon.txid.toLowerCase() === reference.txid && coupon.vout === reference.vout)
        : reference ? [] : nextCoupons;
      const selectedCards = reference?.type === "punchcard"
        ? nextCards.filter((card) => card.category.toLowerCase() === reference.category)
        : reference ? [] : nextCards;
      if (reference && selectedCoupons.length === 0 && selectedCards.length === 0) {
        throw new Error("This reward reference is no longer available in the customer's wallet.");
      }
      setLoadedAddress(address);
      setRedemptionReference(reference);
      setCoupons(selectedCoupons);
      setCards(selectedCards);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to load this customer's rewards.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadRewards(event) {
    event.preventDefault();
    await loadReference(customerAddress);
  }

  const handleQrScan = useCallback((value) => {
    setCustomerAddress(value);
    setScannerOpen(false);
    void loadReference(value);
  }, [loadReference]);

  function requireDemoCustomerSigner() {
    if (loadedAddress.toLowerCase() !== wallets.customer.address.toLowerCase()) {
      throw new Error("This reward requires the customer's signature. Connect the customer signing flow before redeeming an address other than the configured demo customer.");
    }
    return wallets.customer.wif;
  }

  async function redeemSelectedCoupon(coupon) {
    const key = `coupon:${coupon.txid}:${coupon.vout}`;
    try {
      setPending(key);
      const result = await redeemCoupon({
        businessWif: wallet.wif,
        businessAddress: wallet.address,
        customerWif: requireDemoCustomerSigner(),
        customerAddress: loadedAddress,
        category: coupon.category,
        discountValue: getCouponRewardSats(coupon.category),
        couponTxid: coupon.txid,
        couponVout: coupon.vout,
      });
      const transaction = { txid: result.txid, type: "Coupon redemption", title: getCouponName(coupon.category, coupon.commitment), rewardSats: getCouponRewardSats(coupon.category) };
      recordTransaction(transaction);
      setSuccessTransaction(transaction);
      setCoupons((current) => current.filter((item) => item.txid !== coupon.txid || item.vout !== coupon.vout));
      refreshWalletData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Coupon redemption failed.");
    } finally {
      setPending("");
    }
  }

  async function redeemSelectedPunchCard(card) {
    const config = getPunchCardConfig(card.category);
    const key = `punch:${card.category}`;
    try {
      setPending(key);
      const result = await redeemPunchCard({ businessWif: wallet.wif, businessAddress: wallet.address, customerWif: requireDemoCustomerSigner(), customerAddress: loadedAddress, category: card.category, requiredStamps: config.requiredStamps, rewardValue: config.rewardSats });
      const transaction = { txid: result.txid, type: "Punch-card redemption", title: getPunchCardName(card.category), rewardSats: config.rewardSats, stampsBurned: result.stampsBurned };
      recordTransaction(transaction);
      setSuccessTransaction(transaction);
      setCards((current) => current.map((item) => item.category === card.category ? { ...item, stamps: item.stamps - result.stampsBurned } : item).filter((item) => item.stamps > 0));
      refreshWalletData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Punch-card redemption failed.");
    } finally {
      setPending("");
    }
  }

  return <div className="space-y-8">
    <div><h1 className="text-3xl font-bold text-slate-900">Scan &amp; Redeem</h1><p className="mt-2 text-slate-500">Scan the customer’s coupon QR code to load and verify the exact on-chain coupon.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <button type="button" onClick={() => setScannerOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"><ScanLine size={20} />Scan coupon QR</button>
      <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" />or enter manually<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={loadRewards}><label className="block text-sm font-semibold">Customer address or coupon reference<input required value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="SCC1|bchtest:q...|transaction-id|0" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500" /></label><button disabled={loading} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 px-5 py-3 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 sm:w-auto">{loading && <LoaderCircle size={17} className="animate-spin" />}{couponReference ? "Find coupon" : "Find rewards"}</button></form>
    </div>
    {loadedAddress && <div className="space-y-7">
      <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Showing rewards for <code className="break-all font-mono text-xs">{loadedAddress}</code></p>
      <RewardSection title="Coupons" empty="No redeemable coupons found at this address.">{coupons.map((coupon) => <article key={`${coupon.txid}:${coupon.vout}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><TicketPercent className="text-emerald-600" /><h2 className="mt-4 text-lg font-semibold">{getCouponName(coupon.category, coupon.commitment)}</h2><p className="mt-2 text-sm text-slate-500">One-time coupon &middot; {getCouponRewardSats(coupon.category)} sats reward</p><button disabled={Boolean(pending)} onClick={() => redeemSelectedCoupon(coupon)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{pending === `coupon:${coupon.txid}:${coupon.vout}` && <LoaderCircle size={16} className="animate-spin" />}Redeem coupon</button></article>)}</RewardSection>
      <RewardSection title="Punch Cards" empty="No punch-card stamps found at this address.">{cards.map((card) => { const config = getPunchCardConfig(card.category); const ready = card.stamps >= config.requiredStamps; return <article key={card.category} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Stamp className="text-blue-600" /><h2 className="mt-4 text-lg font-semibold">{getPunchCardName(card.category)}</h2><p className="mt-2 text-sm text-slate-500">Customer progress: {card.stamps}/{config.requiredStamps} stamps</p><button disabled={!ready || Boolean(pending)} onClick={() => redeemSelectedPunchCard(card)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{pending === `punch:${card.category}` && <LoaderCircle size={16} className="animate-spin" />}{ready ? "Redeem completed card" : "Not completed"}</button></article>; })}</RewardSection>
    </div>}
    <RedemptionSuccessModal transaction={successTransaction} onClose={() => setSuccessTransaction(null)} />
    {scannerOpen && <ScanCouponQrModal open onClose={() => setScannerOpen(false)} onScan={handleQrScan} />}
  </div>;
}

function RewardSection({ title, empty, children }) {
  const rewards = Array.isArray(children) ? children : [children];
  return <section><h2 className="mb-4 text-xl font-semibold">{title}</h2><div className="grid gap-5 lg:grid-cols-2">{rewards.length ? rewards : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">{empty}</div>}</div></section>;
}
