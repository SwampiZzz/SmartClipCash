import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, X } from "lucide-react";
import { parseCouponReference } from "../../lib/redemptionReference";

export default function ScanCouponQrModal({ open, onClose, onScan }) {
  const videoRef = useRef(null);
  const handledRef = useRef(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    if (!open) return undefined;
    let controls;
    let cancelled = false;
    handledRef.current = false;
    void import("@zxing/browser").then(({ BrowserQRCodeReader }) => {
      if (cancelled) return;
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 200 });
      return reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        videoRef.current,
        (result) => {
          if (!result || handledRef.current) return;
          const value = result.getText();
          if (!parseCouponReference(value)) {
            setError("That QR code is not a valid SmartClipCash coupon.");
            return;
          }
          handledRef.current = true;
          controls?.stop();
          onScan(value);
        },
      );
    }).then((nextControls) => {
      if (!nextControls) return;
      controls = nextControls;
      if (cancelled) controls.stop();
      else setStarting(false);
    }).catch((cameraError) => {
      console.error(cameraError);
      if (!cancelled) {
        setStarting(false);
        setError("Camera access failed. Allow camera permission or use the manual reference field.");
      }
    });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [onScan, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-2xl font-bold">Scan coupon QR</h2><p className="mt-2 text-sm text-slate-500">Point the camera at the customer’s SmartClipCash coupon.</p></div>
          <button type="button" onClick={onClose} aria-label="Close scanner" className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="relative mt-6 aspect-square overflow-hidden rounded-2xl bg-slate-950">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(0,0,0,0.25)]" />
          {starting && <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/70 text-white"><LoaderCircle className="animate-spin" size={20} />Starting camera…</div>}
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Camera size={17} />Camera access is used only while this scanner is open.</p>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
      </div>
    </div>
  );
}
