import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import PublicLayout from "../layouts/PublicLayout.jsx";
import MerchantLayout from "../layouts/MerchantLayout.jsx";
import CustomerLayout from "../layouts/CustomerLayout.jsx";


// Public Pages
import Home from "../pages/public/Home.jsx";
import HowItWorks from "../pages/public/HowItWorks.jsx";

// Merchant Pages
import MerchantDashboard from "../pages/merchant/MerchantDashboard.jsx";
import ManageRewards from "../pages/merchant/ManageRewards.jsx";
import ScanAndRedeem from "../pages/merchant/ScanAndRedeem.jsx";

// Customer Pages
import CustomerDashboard from "../pages/customer/CustomerDashboard.jsx";
import MyRewards from "../pages/customer/MyRewards.jsx";
// import TransferRewards from "../pages/customer/TransferRewards.jsx";

export default function AppRouter({ openWalletModal }) {
  return (
    <Routes>

      {/* Public */}
      <Route element={<PublicLayout openWalletModal={openWalletModal} />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>

      {/* Merchant */}
      <Route
        element={
          <ProtectedRoute allowedRole="merchant">
            <MerchantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        <Route path="/merchant/manage" element={<ManageRewards />} />
        <Route path="/merchant/scan" element={<ScanAndRedeem />} />
      </Route>

      {/* Customer */}
      <Route
        element={
          <ProtectedRoute allowedRole="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/rewards" element={<MyRewards />} />
      </Route>

    </Routes>
  );
}