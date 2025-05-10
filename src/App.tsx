import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import FriendsPage from "./pages/FriendsPage";
import HistoryPage from "./pages/HistoryPage";
import ViewFriendPage from "./pages/ViewFriendPage";

function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;
