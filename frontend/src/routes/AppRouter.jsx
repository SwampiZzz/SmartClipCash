import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout.jsx";
import MerchantLayout from "../layouts/MerchantLayout.jsx";
import CustomerLayout from "../layouts/CustomerLayout.jsx";


// Public Pages
import Home from "../pages/public/Home.jsx";
import HowItWorks from "../pages/public/HowItWorks.jsx";
import ConnectWallet from "../pages/public/ConnectWallet.jsx";

// Merchant Pages
import MerchantDashboard from "../pages/merchant/MerchantDashboard.jsx";
import ManageRewards from "../pages/merchant/ManageRewards.jsx";
import ScanAndRedeem from "../pages/merchant/ScanAndRedeem.jsx";

// Customer Pages
import CustomerDashboard from "../pages/customer/CustomerDashboard.jsx";
import MyRewards from "../pages/customer/MyRewards.jsx";
// import TransferRewards from "../pages/customer/TransferRewards.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/connect-wallet" element={<ConnectWallet />} />
        </Route>

        {/* Merchant */}
        <Route element={<MerchantLayout />}>
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/manage" element={<ManageRewards />} />
          <Route path="/merchant/scan" element={<ScanAndRedeem />} />
          {/* <Route path="/merchant/settings" element={<MerchantSettings />} /> */}
      </Route>

        {/* Customer */}
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/rewards" element={<MyRewards />} />
          {/* <Route path="/customer/transfer" element={<TransferRewards />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}