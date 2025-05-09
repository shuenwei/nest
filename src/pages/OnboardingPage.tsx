import { useState } from "react";
import TelegramUsernamePage from "./TelegramUsernamePage";
import OTPPage from "./OTPPage";
import DisplayNamePage from "./DisplayNamePage";
import AllSetPage from "./AllSetPage";

const OnboardingPage = () => {
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
        onNext={() => setStep("displayname")}
      />
    );
  }

  if (step === "displayname") {
    return (
      <DisplayNamePage
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
      onFinish={() => (window.location.href = "/dashboard")}
    />
  );
};

export default OnboardingPage;
