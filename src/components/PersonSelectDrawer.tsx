import { Check } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { triggerHapticSelection } from "@/lib/haptics";

export type PersonOption = {
  id: string;
  name: string;
  username?: string;
  profilePhoto?: string | null;
  isYou?: boolean;
};

interface PersonSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  people: PersonOption[];
  selection: string[];
  onSelectionChange: (selection: string[]) => void;
  mode?: "single" | "multiple";
  emptyStateText?: string;
}

export const PersonSelectDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  people,
  selection,
  onSelectionChange,
  mode = "multiple",
  emptyStateText = "No people available.",
}: PersonSelectDrawerProps) => {
  const handleSelect = (id: string) => {
    if (mode === "single") {
      onSelectionChange([id]);
      onOpenChange(false);
      return;
    }

    const isSelected = selection.includes(id);
    if (isSelected) {
      onSelectionChange(selection.filter((value) => value !== id));
    } else {
      onSelectionChange([...selection, id]);
    }
    triggerHapticSelection();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[55vh]">
          {people.length === 0 ? (
            <p className="text-sm">
                <Badge variant="destructive">
                    {emptyStateText}
                </Badge></p>
            
          ) : (
            people.map((person) => {
              const isSelected = selection.includes(person.id);
              return (
                <button
                  type="button"
                  key={person.id}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                    "flex items-center justify-between gap-4",
                    isSelected
                      ? "border-primary/60 bg-primary/5"
                      : "border-border"
                  )}
                  onClick={() => handleSelect(person.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={person.profilePhoto ?? undefined} />
                      <AvatarFallback>
                        {person.name?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {person.name}
                        {person.isYou ? (
                        
                          <span className="ml-2">
                            <Badge className="font-semibold">
                                You
                            </Badge>
                          </span>
                        ) : null}
                      </p>
                      {person.username ? (
                        <p className="text-xs text-muted-foreground">
                          @{person.username}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted"
                    )}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </span>
                </button>
              );
            })
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" className="mb-10 w-full">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};