import { Navigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";

export default function ProtectedRoute({
  children,
  allowedRole,
}) {
  const { wallet } = useWallet();

  // No wallet connected
  if (!wallet) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (allowedRole && wallet.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}