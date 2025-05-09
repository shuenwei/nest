import { type FC } from "react";
interface TelegramUsernamePageProps {
    username: string;
    setUsername: (v: string) => void;
    onBack: () => void;
    onNext: (username: string) => void;
}
declare const TelegramUsernamePage: FC<TelegramUsernamePageProps>;
export default TelegramUsernamePage;
