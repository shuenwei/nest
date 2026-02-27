import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { UserProvider } from "@/contexts/UserContext";
import { LocationProvider } from "@/contexts/LocationContext";

const TelegramStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    .tg-layout-padding {
      padding-top: env(safe-area-inset-top) !important;
    }
    body.telegram-ios .tg-layout-padding {
      padding-top: calc(env(safe-area-inset-top) + 80px) !important;
    }
    body.telegram-android .tg-layout-padding {
      padding-top: 86px !important;
    }

    .tg-dashboard-padding {
      padding-top: calc(2.5rem + env(safe-area-inset-top)) !important;
    }
    body.telegram-ios .tg-dashboard-padding {
      padding-top: calc(3.75rem + env(safe-area-inset-top)) !important;
    }
    body.telegram-android .tg-dashboard-padding {
      padding-top: 96px !important;
    }
  `}} />
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <LocationProvider>
        <BrowserRouter>
          <TelegramStyles />
          <App />
        </BrowserRouter>
      </LocationProvider>
    </UserProvider>
  </StrictMode>
);
