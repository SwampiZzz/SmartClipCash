import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, X } from "lucide-react";
import { createCouponReference } from "../../lib/redemptionReference";

export default function PresentCouponModal({ coupon, address, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const reference = useMemo(() => coupon ? createCouponReference({
    address,
    txid: coupon.txid,
    vout: coupon.vout,
  }) : "", [address, coupon]);

  useEffect(() => {
    if (!reference || !canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, reference, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  }, [reference]);

  if (!coupon) return null;

  async function copyAddress() {
    await navigator.clipboard.writeText(reference);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Present coupon/voucher to merchant</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Let the merchant scan this code to load this exact on-chain coupon/voucher.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5">
          <div className="flex justify-center rounded-xl bg-white p-3">
            <canvas ref={canvasRef} className="h-auto w-full max-w-[280px]" aria-label="Coupon/voucher redemption QR code" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Manual fallback</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-3 text-xs text-slate-700">{reference}</code>
            <button type="button" onClick={copyAddress} title="Copy coupon/voucher reference" className="shrink-0 rounded-lg border border-slate-200 p-3 text-slate-600 hover:bg-white">{copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}</button>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600">Scanning only identifies the coupon/voucher. It is burned only after the required signatures and a successful redemption transaction.</p>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">Done</button>
      </div>
    </div>
  );
}
