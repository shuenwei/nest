import { Request, Response } from "express";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";

const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { telegramId, categoryId } = req.params;

        const user = await User.findOne({ telegramId });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const category = user.categories.id(categoryId);

        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }

        // Remove category from user
        category.deleteOne();
        await user.save();

        // Remove category from transactions
        await Transaction.updateMany(
            { "userCategories.userId": user._id },
            { $pull: { "userCategories.$[elem].categoryIds": categoryId } },
            { arrayFilters: [{ "elem.userId": user._id }] }
        );

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default deleteCategory;
