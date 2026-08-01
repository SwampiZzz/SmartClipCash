import { useState } from "react";
import AppRouter from "./routes/AppRouter";
import ConnectWalletModal from "./components/modals/ConnectWalletModal";

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <>
      <AppRouter
        openWalletModal={() => setShowWalletModal(true)}
      />

      <ConnectWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}

export default App;