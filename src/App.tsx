import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import FriendsPage from "./pages/FriendsPage";
import HistoryPage from "./pages/HistoryPage";
import ViewFriendPage from "./pages/ViewFriendPage";
import NotificationPage from "./pages/NotificationPage";
import SplitPurchasePage from "./pages/SplitPurchasePage";
import CurrencyPreferencesPage from "./pages/CurrencyPreferencesPage";
import SettleUpPage from "./pages/SettleUpPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <WelcomePage
              onNext={() => (window.location.href = "/onboarding")}
            />
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/friends/:friendId" element={<ViewFriendPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/splitpurchase" element={<SplitPurchasePage />} />
        <Route path="/settleup" element={<SettleUpPage />} />
        <Route
          path="/settings/currency"
          element={<CurrencyPreferencesPage />}
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
