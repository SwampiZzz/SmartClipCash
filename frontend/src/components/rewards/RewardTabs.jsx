export default function RewardTabs({
  activeTab,
  onChange,
}) {
  const tabs = [
    {
      id: "coupons",
      label: "Coupons/Vouchers",
      disabled: false,
    },
    {
      id: "punchcards",
      label: "Punch Cards",
      disabled: false,
    },
  ];

  return (
    <div className="flex max-w-full items-center gap-2 overflow-x-auto border-b border-slate-200 pb-4 sm:gap-3">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={`
            shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:px-5

            ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }

            ${
              tab.disabled
                ? "cursor-not-allowed opacity-50 hover:bg-slate-100"
                : ""
            }
          `}
        >
          {tab.label}

          {tab.disabled && (
            <span className="ml-2 text-[10px] uppercase">
              Soon
            </span>
          )}
        </button>
      ))}

    </div>
  );
}
