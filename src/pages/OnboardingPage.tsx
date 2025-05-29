import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TelegramUsernamePage from "./TelegramUsernamePage";
import OTPPage from "./OTPPage";
import DisplayNamePage from "./DisplayNamePage";
import AllSetPage from "./AllSetPage";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const apiUrl = import.meta.env.VITE_API_URL;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [step, setStep] = useState<
    "telegram" | "otp" | "displayname" | "allset"
  >("telegram");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");

  if (step === "telegram") {
    return (
      <TelegramUsernamePage
        username={username}
        setUsername={setUsername}
        onBack={() => (window.location.href = "/")}
        onNext={(u) => {
          setUsername(u);
          setStep("otp");
        }}
      />
    );
  }

  if (step === "otp") {
    return (
      <OTPPage
        username={username}
        otp={otp}
        setOtp={setOtp}
        onBack={() => setStep("telegram")}
        onNext={async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${apiUrl}/user/username/${username}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const {
              displayName: fetchedName,
              hasSignedUp,
              telegramId,
            } = res.data;

            localStorage.setItem("telegramId", telegramId);

            if (hasSignedUp) {
              toast.success("You are now logged in!");
              refreshUser();
              navigate("/dashboard");
            } else {
              setDisplayName(fetchedName);
              setStep("displayname");
            }
          } catch (err) {
            console.error("Error fetching user after OTP:", err);
          }
        }}
      />
    );
  }

  if (step === "displayname") {
    return (
      <DisplayNamePage
        telegramId={localStorage.getItem("telegramId")!}
        displayName={displayName}
        setDisplayName={setDisplayName}
        onBack={() => setStep("otp")}
        onNext={() => setStep("allset")}
      />
    );
  }

  return (
    <AllSetPage
      displayName={displayName}
      username={username}
      onFinish={() => {
        toast.success("You are now logged in!");
        window.location.href = "/dashboard";
      }}
    />
  );
};

export default OnboardingPage;
