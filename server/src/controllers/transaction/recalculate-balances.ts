import { Request, Response } from "express";
import { BalanceService } from "../../services/balance-service";

const recalculateBalances = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // Optional: Add authorization check here if not already covered by middleware
        // For now, relying on the router's auth middleware.

        await BalanceService.recalculateAllBalances();

        res.status(200).json({ message: "Balances recalculated successfully" });
    } catch (err) {
        console.error("Error recalculating balances:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export default recalculateBalances;
