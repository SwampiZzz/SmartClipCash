import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

import {
  Wallet,
  Gift,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { openWalletModal } = useOutletContext();
  return (
    <div className="space-y-28 pb-20">

      {/* ================= HERO ================= */}
      <section className="grid items-center gap-14 lg:grid-cols-2">

        {/* Left */}
        <div>

          <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
            Powered by Bitcoin Cash & CashTokens
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Digital Loyalty Rewards
            <span className="block text-emerald-600">
              Made Simple.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Replace traditional paper punch cards with secure blockchain
            loyalty stamps. Businesses reward customers instantly,
            customers truly own their rewards.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <button
              onClick={openWalletModal}
              className="rounded-xl outline-2 outline-emerald-600 px-6 py-3 font-semibold text-emerald-600 transition hover:bg-emerald-700 hover:text-white focus:outline-offset-2 focus:outline-emerald-600"
            >
              Connect Wallet
            </button>

            <Link
              to="/how-it-works"
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Learn More
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

        {/* Right */}
        <div className="flex justify-center">

          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h3 className="text-lg font-semibold">
                Customer Rewards
              </h3>

              <Wallet className="text-emerald-600" />

            </div>

            <div className="space-y-5">

              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span>Reward Progress</span>

                  <span>4 / 5</span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                  <div className="h-full w-4/5 rounded-full bg-emerald-500" />

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  Next Reward
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  Free Coffee
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 p-4">

                <p className="text-sm text-emerald-700">
                  Digital stamps are stored securely
                  on the Bitcoin Cash blockchain.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section>

        <div className="mb-12 text-center">

          <h2 className="text-3xl font-bold text-slate-900">
            Why SmartClipCash?
          </h2>

          <p className="mt-3 text-slate-600">
            A modern loyalty platform built for businesses and customers.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">

              <Zap className="text-emerald-600" />

            </div>

            <h3 className="text-xl font-semibold">
              Instant Rewards
            </h3>

            <p className="mt-3 text-slate-600">
              Reward customers immediately after every purchase with
              blockchain-powered digital stamps.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">

              <ShieldCheck className="text-emerald-600" />

            </div>

            <h3 className="text-xl font-semibold">
              Secure Ownership
            </h3>

            <p className="mt-3 text-slate-600">
              Rewards belong to the customer and are secured by Bitcoin Cash
              CashTokens.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">

              <Gift className="text-emerald-600" />

            </div>

            <h3 className="text-xl font-semibold">
              Paperless Loyalty
            </h3>

            <p className="mt-3 text-slate-600">
              No more damaged or forgotten punch cards. Rewards are always
              available inside the customer's wallet.
            </p>

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section>

        <div className="mb-12 text-center">

          <h2 className="text-3xl font-bold text-slate-900">
            How It Works
          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
              1
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              Shop
            </h3>

            <p className="mt-2 text-slate-600">
              Purchase from participating merchants.
            </p>

          </div>

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
              2
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              Receive Stamps
            </h3>

            <p className="mt-2 text-slate-600">
              Earn digital loyalty stamps directly into your wallet.
            </p>

          </div>

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
              3
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              Redeem Rewards
            </h3>

            <p className="mt-2 text-slate-600">
              Exchange completed punch cards for exclusive rewards.
            </p>

          </div>

        </div>

      </section>

      {/* ================= TECH STACK ================= */}

      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <div className="text-center">

          <h2 className="text-3xl font-bold text-slate-900">
            Built Using
          </h2>

          <p className="mt-3 text-slate-600">
            Developed for the Bitcoin Cash Hackathon.
          </p>

        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          {[
            "Bitcoin Cash",
            "CashTokens",
            "CashScript",
            "React",
            "Vite",
            "Tailwind CSS",
          ].map((tech) => (
            <div
              key={tech}
              className="rounded-full bg-slate-100 px-6 py-3 font-medium text-slate-700"
            >
              {tech}
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}
