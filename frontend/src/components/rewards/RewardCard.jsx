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

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${current.color}`}
        >
          {current.icon}
        </div>

        <BadgeCheck
          size={20}
          className="text-slate-300"
        />

      </div>

      {/* Content */}

      <div className="mt-6">

        <h3 className="text-xl font-semibold text-slate-900">
          {reward.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {reward.description}
        </p>

      </div>

      {/* Details */}

      <div className="mt-6 space-y-3">

        {type === "coupon" && (
          <>
            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Reward
              </span>

              <span className="font-semibold">
                {reward.reward}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Transferable
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  reward.transferable
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {reward.transferable ? "Yes" : "No"}
              </span>

            </div>
          </>
        )}

        {type === "punchcard" && (
          <>
            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Required Stamps
              </span>

              <span className="font-semibold">
                {reward.required}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Reward
              </span>

              <span className="font-semibold">
                {reward.reward}
              </span>

            </div>
          </>
        )}

        {type === "voucher" && (
          <>
            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Value
              </span>

              <span className="font-semibold">
                {reward.reward}
              </span>

            </div>
          </>
        )}

      </div>

      {/* Footer */}

      <div className="mt-8 flex items-center justify-between">

        <span className="text-xs uppercase tracking-wide text-slate-400">
          Blockchain Reward
        </span>

        <button
          onClick={() => onIssue?.(reward)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {current.button}

          <ArrowRight size={16} />
        </button>

      </div>

    </div>
  );
}