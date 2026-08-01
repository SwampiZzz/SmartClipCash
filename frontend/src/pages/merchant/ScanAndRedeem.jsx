import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Stamp } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { getCustomerPunchCards } from "../../lib/token";
import { redeemPunchCard } from "../../lib/contract";
import { getPunchCardConfig, getPunchCardName } from "../../lib/metadata";
import { wallets } from "../../constants/wallets";

export default function ScanAndRedeem() {
  const { wallet, refreshKey, refreshWalletData } = useWallet();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const refreshCards = useCallback(async () => {
    try {
      setLoading(true);
      setCards(await getCustomerPunchCards(wallets.customer.address));
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to load customer punch cards.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(refreshCards); }, [refreshCards, refreshKey]);

  async function redeem(card) {
    const config = getPunchCardConfig(card.category);
    const key = `${card.txid}:${card.vout}`;
    try {
      setPending(key);
      await redeemPunchCard({
        businessWif: wallet.wif,
        businessAddress: wallet.address,
        customerWif: wallets.customer.wif,
        customerAddress: wallets.customer.address,
        category: card.category,
        requiredStamps: config.requiredStamps,
        rewardValue: config.rewardSats,
      });
      refreshWalletData();
    } catch (error) {
      console.error(error);
      alert(error.message || "Punch-card redemption failed.");
    } finally { setPending(""); }
  }

  return <div className="space-y-8"><div><h1 className="text-3xl font-bold text-slate-900">Scan & Redeem</h1><p className="mt-2 text-slate-500">Redeem completed punch cards from the configured customer wallet.</p></div>
    {loading ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">Loading customer stamps...</div> : <div className="grid gap-5 lg:grid-cols-2">{cards.length ? cards.map((card) => { const config = getPunchCardConfig(card.category); const ready = card.stamps >= config.requiredStamps; const key = `${card.txid}:${card.vout}`; return <article key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Stamp className="text-blue-600" /><h2 className="mt-4 text-lg font-semibold">{getPunchCardName(card.category)}</h2><p className="mt-2 text-sm text-slate-500">Customer progress: {card.stamps}/{config.requiredStamps} stamps</p><button disabled={!ready || Boolean(pending)} onClick={() => redeem(card)} className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{pending === key && <LoaderCircle size={16} className="animate-spin" />}{ready ? "Redeem completed card" : "Not completed"}</button></article>; }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">No customer stamp UTXOs found.</div>}</div>}</div>;
}
