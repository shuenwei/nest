import type { FC } from "react";
interface YouAreAllSetPageProps {
    displayName: string;
    username: string;
    onFinish: () => void;
}
declare const AllSetPage: FC<YouAreAllSetPageProps>;
export default AllSetPage;
