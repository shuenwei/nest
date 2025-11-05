import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import InstallPwaGuide from "./components/InstallPwaGuide";

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
import SettleUpPage from "./pages/SettleUpPage";
import AddRecurringPage from "./pages/AddRecurringPage";
import ManageRecurringPage from "./pages/ManageRecurringPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ViewTransactionPage from "./pages/ViewTransactionPage";
import ViewRecurringPage from "./pages/ViewRecurringPage";
import UsageLimitsPage from "./pages/UsageLimitsPage";
import BlockUsersPage from "./pages/BlockUsersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingIndicator from "./components/LoadingIndicator";
import LoadingScreen from "./components/LoadingScreen";
import { useUser } from "./contexts/UserContext";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useUser();
  const [isTelegramApp, setIsTelegramApp] = useState(
    () => Boolean(window.Telegram?.WebApp)
  );

  useEffect(() => {
    const telegramId = localStorage.getItem("telegramId");
    const unprotectedPaths = ["/", "/onboarding"];

    if (telegramId && unprotectedPaths.includes(location.pathname)) {
      navigate("/dashboard");
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    const isInTelegram = Boolean(tg?.initDataUnsafe?.user);
    setIsTelegramApp(isInTelegram);

    if (!isInTelegram) {
      document.body.classList.remove("telegram-webapp");
      return;
    }

    tg?.ready?.();
    tg?.expand?.();

    try {
      tg?.requestFullscreen?.();
    } catch (err) {
      console.warn("requestFullscreen not supported:", err);
    }

    try {
      tg?.disableVerticalSwipes?.();
    } catch (err) {
      console.warn("disableVerticalSwipes not supported:", err);
    }

    document.body.classList.add("telegram-webapp");

    return () => {
      document.body.classList.remove("telegram-webapp");
    };
  }, []);


  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  if (isTelegramApp && loading) {
    return (
      <>
        <LoadingScreen />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <LoadingIndicator />
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
          <Route
            path="/history/:transactionId"
            element={<ViewTransactionPage />}
          />
          <Route path="/friends/:friendId" element={<ViewFriendPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/splitpurchase" element={<SplitPurchasePage />} />
          <Route
            path="/splitpurchase/edit/:transactionId"
            element={<SplitPurchasePage />}
          />
          <Route path="/splitbill" element={<SplitBillPage />} />
          <Route
            path="/splitbill/edit/:transactionId"
            element={<SplitBillPage />}
          />
          <Route path="/settleup" element={<SettleUpPage />} />
          <Route
            path="/settleup/edit/:transactionId"
            element={<SettleUpPage />}
          />
          <Route path="/recurring" element={<ManageRecurringPage />} />
          <Route path="/recurring/add" element={<AddRecurringPage />} />
          <Route
            path="/recurring/:recurringId"
            element={<ViewRecurringPage />}
          />
          <Route
            path="/recurring/edit/:recurringId"
            element={<AddRecurringPage />}
          />
          <Route path="/settings/account" element={<AccountSettingsPage />} />
          <Route path="/settings/limits" element={<UsageLimitsPage />} />
          <Route path="/settings/block" element={<BlockUsersPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
