export default function RewardTabs({
  activeTab,
  onChange,
}) {
  const tabs = [
    {
      id: "coupons",
      label: "Coupons",
      disabled: false,
    },
    {
      id: "punchcards",
      label: "Punch Cards",
      disabled: false,
    },
    {
      id: "vouchers",
      label: "Vouchers",
      disabled: true,
    },
  ];

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={`
            rounded-xl px-5 py-2.5 text-sm font-semibold transition

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