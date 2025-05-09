import { type FC } from "react";
interface OTPPageProps {
    username: string;
    otp: string;
    setOtp: (v: string) => void;
    onBack: () => void;
    onNext: () => void;
}
declare const OTPPage: FC<OTPPageProps>;
export default OTPPage;
