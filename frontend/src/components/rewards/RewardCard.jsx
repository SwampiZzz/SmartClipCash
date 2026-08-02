import {
  TicketPercent,
  Stamp,
  Gift,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

export default function RewardCard({
  type,
  reward,
  onIssue,
  onIssuePunchCard,
  onIssueStamp,
}) {
  const config = {
    coupon: {
      icon: <TicketPercent size={26} />,
      color: "bg-emerald-100 text-emerald-600",
      button: "Issue Coupon",
    },

    punchcard: {
      icon: <Stamp size={26} />,
      color: "bg-blue-100 text-blue-600",
      button: "Issue Stamp",
    },

    voucher: {
      icon: <Gift size={26} />,
      color: "bg-amber-100 text-amber-600",
      button: "Issue Voucher",
    },
  };

  const current = config[type];
  const canIssue = type !== "coupon" || reward.capability === "minting";

  return (
    <div className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${current.color}`}
        >
          {current.icon}
        </div>

        <BadgeCheck
          size={20}
          className="text-emerald-500"
        />

      </div>

      {/* Content */}

      <div className="mt-6">

        <h3 className="text-xl font-semibold text-slate-900">
          {reward.name ?? reward.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {reward.description ?? "Blockchain reward"}
        </p>

      </div>

      {/* Details */}

      <div className="mt-6 space-y-3">

        {type === "coupon" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Category
              </span>

              <span className="font-mono text-xs">
                {reward.category
                  ? `${reward.category.slice(0, 10)}...`
                  : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                NFT Capability
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {reward.capability ?? "none"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Commitment
              </span>

              <span className="font-mono text-xs">
                {reward.commitment
                  ? `${reward.commitment.slice(0, 12)}...`
                  : "-"}
              </span>
            </div>
          </>
        )}

        {type === "punchcard" && (
          <>
            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Supply Remaining
              </span>

              <span className="font-semibold">
                {reward.supply}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Category
              </span>

              <span className="font-mono text-xs">
                {reward.category
                  ? `${reward.category.slice(0, 10)}...`
                  : "-"}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Redemption
              </span>

              <span className="font-semibold">
                {reward.required} stamps · {reward.rewardSats} sats
              </span>

            </div>

          </>
        )}

        {type === "voucher" && (

          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-500">
              Status
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
              Coming Soon
            </span>

          </div>

        )}

      </div>

      {/* Footer */}

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">

        <span className="text-xs uppercase tracking-wide text-slate-400">
          Blockchain Reward
        </span>

        {type === "punchcard" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => onIssuePunchCard?.(reward)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Issue Punch Card</button>
            <button type="button" onClick={() => onIssueStamp?.(reward)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Issue 1 Stamp <ArrowRight size={16} /></button>
          </div>
        ) : <button
          type="button"
          disabled={!canIssue}
          onClick={() => onIssue?.(reward)}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canIssue ? current.button : "Issued Coupon"}
          <ArrowRight size={16} />
        </button>}

      </div>

    </div>
  );
}
