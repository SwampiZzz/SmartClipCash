import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Logo({ clickable = true }) {
  const content = (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="SmartClipCash"
        className="h-10 w-10 object-contain"
      />

      <div>
        <h1 className="text-lg font-bold text-slate-900">
          SmartClipCash
        </h1>

        <p className="text-xs text-slate-500">
          Bitcoin Cash Rewards
        </p>
      </div>
    </div>
  );

  if (!clickable) {
    return content;
  }

  return <Link to="/">{content}</Link>;
}