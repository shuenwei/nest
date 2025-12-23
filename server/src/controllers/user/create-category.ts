import { Request, Response } from "express";
import { User } from "../../models/User";

const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { telegramId } = req.params;
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

        const categoryExists = user.categories.some(
            (cat) => cat.name.toLowerCase() === name.toLowerCase()
        );

        if (categoryExists) {
            res.status(400).json({ message: "Category with this name already exists" });
            return;
        }

        user.categories.push({ name });
        await user.save();

        const createdCategory = user.categories[user.categories.length - 1];

        res.status(201).json({
            message: "Category created successfully",
            category: createdCategory,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default createCategory;
