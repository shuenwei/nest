import { Request, Response } from "express";
import { BalanceService } from "../../services/balance-service";
import { User } from "../../models/User";

const recalculateBalances = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const authUserId = req.auth?.id;
        if (!authUserId) {
            res.status(401).json({ error: "Unauthorised" });
            return;
        }

        const requester = await User.findById(authUserId);
        if (!requester || !requester.get("isAdmin")) {
            res.status(403).json({ error: "Unauthorised" });
            return;
        }

        await BalanceService.recalculateAllBalances();

        res.status(200).json({ message: "Balances recalculated successfully" });
    } catch (err) {
        console.error("Error recalculating balances:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export default recalculateBalances;
