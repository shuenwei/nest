import { Request, Response } from "express";
import { User } from "../../models/User";

const renameCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { telegramId, categoryId } = req.params;
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: "Category name is required" });
            return;
        }

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

        // Check for duplicates (excluding current category)
        const categoryExists = user.categories.some(
            (cat) => cat.name.toLowerCase() === name.toLowerCase() && cat._id.toString() !== categoryId
        );

        if (categoryExists) {
            res.status(400).json({ message: "Category with this name already exists" });
            return;
        }

        category.name = name;
        await user.save();

        res.status(200).json({
            message: "Category renamed successfully",
            category: category,
        });
    } catch (error) {
        console.error("Error renaming category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default renameCategory;
