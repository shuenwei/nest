import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/lib/toast";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const ManageCategoriesPage = () => {
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem("token");
    const apiUrl = import.meta.env.VITE_API_URL;

    const categorySchema = z.object({
        name: z.string().min(1, "Category name is required"),
    });

    const createForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    const renameForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    const handleCreateCategory = async (data: z.infer<typeof categorySchema>) => {
        if (!user) return;
        setIsLoading(true);
        try {
            await axios.post(
                `${apiUrl}/user/categories/${user.telegramId}`,
                { name: data.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await refreshUser();
            toast.success("Category created successfully");
            setIsCreateDialogOpen(false);
            createForm.reset();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRenameCategory = async (data: z.infer<typeof categorySchema>) => {
        if (!user || !selectedCategory) return;
        setIsLoading(true);
        try {
            await axios.patch(
                `${apiUrl}/user/categories/${user.telegramId}/${selectedCategory.id}`,
                { name: data.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await refreshUser();
            toast.success("Category renamed successfully");
            setIsRenameDialogOpen(false);
            setSelectedCategory(null);
            renameForm.reset();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to rename category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!user || !selectedCategory) return;
        setIsLoading(true);
        try {
            await axios.delete(
                `${apiUrl}/user/categories/${user.telegramId}/${selectedCategory.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await refreshUser();
            toast.success("Category deleted successfully");
            setIsDeleteDialogOpen(false);
            setSelectedCategory(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete category");
        } finally {
            setIsLoading(false);
        }
    };

    const openRenameDialog = (category: { id: string; name: string }) => {
        setSelectedCategory(category);
        renameForm.setValue("name", category.name);
        setIsRenameDialogOpen(true);
    };

    const openDeleteDialog = (category: { id: string; name: string }) => {
        setSelectedCategory(category);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
            <div className="w-full max-w-sm pt-5 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="size-5" />
                        <span className="text-base font-medium">Back</span>
                    </Button>
                </div>

                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Manage Categories</h1>
                    <p className="text-muted-foreground text-sm">
                        Create and manage your transaction categories.
                    </p>
                </div>

                <Button
                    className="w-full mb-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <Plus className="size-4 mr-2" />
                    Create Category
                </Button>

                {user?.categories?.map((category) => (
                    <Card key={category.id} className="mb-3 py-4 shadow-xs">
                        <CardContent className="px-4 flex items-center justify-between">
                            <div className="font-semibold pl-2">{category.name}</div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openRenameDialog(category)}
                                >
                                    <Pencil className="size-4 text-muted-foreground" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => openDeleteDialog(category)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!user?.categories || user.categories.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                        You have not added any categories.
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                    if (!open) createForm.reset();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new category.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form
                            onSubmit={createForm.handleSubmit(handleCreateCategory)}
                            className="space-y-4"
                        >
                            <FormField
                                control={createForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Food, Transport, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? "Creating..." : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog
                open={isRenameDialogOpen}
                onOpenChange={(open) => {
                    setIsRenameDialogOpen(open);
                    if (!open) {
                        setSelectedCategory(null);
                        renameForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Category</DialogTitle>
                        <DialogDescription>
                            Enter a new name for this category.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...renameForm}>
                        <form
                            onSubmit={renameForm.handleSubmit(handleRenameCategory)}
                            className="space-y-4"
                        >
                            <FormField
                                control={renameForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Category Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? "Renaming..." : "Rename"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setSelectedCategory(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will delete the category "
                            {selectedCategory?.name}" and remove it from all your transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={handleDeleteCategory}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageCategoriesPage;
