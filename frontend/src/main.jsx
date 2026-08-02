import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import { WalletProvider } from "./context/WalletContext";
import FeedbackProvider from "./context/FeedbackProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <FeedbackProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </FeedbackProvider>
    </BrowserRouter>
  </StrictMode>
);
