import { useMemo, useState } from "react";
import { Check, Search, Plus, FolderOpen } from "lucide-react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { triggerHapticImpact } from "@/lib/haptics";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

interface CategorySelectDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCategoryIds: string[];
    onSelect: (categoryIds: string[]) => void;
}

export const CategorySelectDrawer = ({
    open,
    onOpenChange,
    selectedCategoryIds,
    onSelect,
}: CategorySelectDrawerProps) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const categories = user?.categories || [];

    const sortedCategories = useMemo(() => {
        const filtered = categories.filter(
            (c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [categories, searchQuery]);

    const handleSelect = (id: string) => {
        if (selectedCategoryIds.includes(id)) {
            // Deselect
            onSelect(selectedCategoryIds.filter((cid) => cid !== id));
        } else {
            // Select
            onSelect([...selectedCategoryIds, id]);
        }
        triggerHapticImpact("medium");
    };

    const handleManageCategories = () => {
        onOpenChange(false);
        navigate("/settings/categories");
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
            <DrawerContent className="max-h-[95vh]">
                <DrawerHeader className="text-left">
                    <DrawerTitle>Select Categories</DrawerTitle>
                    <DrawerDescription>
                        Select one or more categories for this transaction.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.25 h-4.5 w-4.5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search Category"
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-2">

                        {sortedCategories.length === 0 && searchQuery !== "" ? (
                            <p className="text-sm text-center py-4 text-muted-foreground">
                                No category found.
                            </p>
                        ) : (
                            sortedCategories.map((category) => {
                                const isSelected = selectedCategoryIds.includes(category.id);

                                return (
                                    <button
                                        type="button"
                                        key={category.id}
                                        className={cn(
                                            "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                                            "flex items-center justify-between gap-4",
                                            isSelected
                                                ? "border-primary/60 bg-primary/3"
                                                : "border-border hover:bg-secondary/50"
                                        )}
                                        onClick={() => handleSelect(category.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium py-2">{category.name}</span>
                                        </div>
                                        <span
                                            className={cn(
                                                "flex h-6 w-6 items-center justify-center rounded-full border",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-gray-200"
                                            )}
                                        >
                                            {isSelected ? <Check className="h-4 w-4" /> : null}
                                        </span>
                                    </button>
                                );
                            })
                        )}

                        {sortedCategories.length === 0 && searchQuery === "" && categories.length === 0 && (
                            <div className="text-center py-8 px-4">
                                <p className="text-muted-foreground text-sm mb-2">You have not added any categories. Add one in settings.</p>
                            </div>
                        )}
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button className="mb-7">Done</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};
