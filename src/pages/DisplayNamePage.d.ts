import { type FC } from "react";
interface DisplayNamePageProps {
    onBack: () => void;
    onNext: () => void;
    displayName: string;
    setDisplayName: (value: string) => void;
}
declare const DisplayNamePage: FC<DisplayNamePageProps>;
export default DisplayNamePage;
