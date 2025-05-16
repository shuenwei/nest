import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import SplitBillPage from "./pages/SplitBillPage";
import CurrencyPreferencesPage from "./pages/CurrencyPreferencesPage";
import SettleUpPage from "./pages/SettleUpPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const telegramId = localStorage.getItem("telegramId");
    const unprotectedPaths = ["/", "/onboarding"];

    if (telegramId && unprotectedPaths.includes(location.pathname)) {
      navigate("/dashboard");
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Unprotected Routes */}
        <Route
          path="/"
          element={
            <WelcomePage
              onNext={() => (window.location.href = "/onboarding")}
            />
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected Routes (Requires sign in) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/friends/:friendId" element={<ViewFriendPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/splitpurchase" element={<SplitPurchasePage />} />
          <Route path="/splitbill" element={<SplitBillPage />} />
          <Route path="/settleup" element={<SettleUpPage />} />
          <Route
            path="/settings/currency"
            element={<CurrencyPreferencesPage />}
          />
          <Route path="/settings/account" element={<AccountSettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
