import { useEffect, useMemo, useState } from "react";
import { Check, Heart } from "lucide-react";

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
import { triggerHapticImpact } from "@/lib/haptics";

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
  showFavouritesSection?: boolean;
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
  showFavouritesSection = true,
}: PersonSelectDrawerProps) => {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [favouritesInitialized, setFavouritesInitialized] = useState(false);

  const favouriteStorageKey = "person-select-favourites";
  const favouriteSyncEvent = "person-select-favourites-updated";

  useEffect(() => {
    const storedFavourites = localStorage.getItem(favouriteStorageKey);

    if (storedFavourites) {
      try {
        const parsed = JSON.parse(storedFavourites);
        if (Array.isArray(parsed)) {
          setFavourites(parsed);
        }
      } catch (error) {
        console.error("Failed to parse favourites from local storage", error);
      }
    }

    setFavouritesInitialized(true);
  }, []);

  useEffect(() => {
    const syncFavourites = () => {
      const storedFavourites = localStorage.getItem(favouriteStorageKey);
      if (!storedFavourites) return;

      try {
        const parsed = JSON.parse(storedFavourites);
        if (Array.isArray(parsed)) {
          setFavourites((prev) =>
            JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed
          );
        }
      } catch (error) {
        console.error("Failed to sync favourites from local storage", error);
      }
    };

    window.addEventListener("storage", syncFavourites);
    window.addEventListener(favouriteSyncEvent, syncFavourites as EventListener);

    return () => {
      window.removeEventListener("storage", syncFavourites);
      window.removeEventListener(
        favouriteSyncEvent,
        syncFavourites as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!favouritesInitialized) return;

    localStorage.setItem(favouriteStorageKey, JSON.stringify(favourites));
    window.dispatchEvent(new Event(favouriteSyncEvent));
  }, [favourites, favouritesInitialized]);

  const handleSelect = (id: string) => {
    if (mode === "single") {
      onSelectionChange([id]);
      triggerHapticImpact("medium");
      onOpenChange(false);
      return;
    }

    const isSelected = selection.includes(id);
    if (isSelected) {
      onSelectionChange(selection.filter((value) => value !== id));
    } else {
      onSelectionChange([...selection, id]);
    }
    triggerHapticImpact("light");
  };

  const handleToggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const isFavourited = prev.includes(id);
      const updatedFavourites = isFavourited
        ? prev.filter((value) => value !== id)
        : [...prev, id];

      triggerHapticImpact(isFavourited ? "light" : "medium");
      return updatedFavourites;
    });
  };

  const sortedPeople = useMemo(() => {
    if (!showFavouritesSection) {
      return {
        favouritePeople: [],
        nonFavouritePeople: people,
      };
    }

    const favouritePeople = favourites
      .map((favouriteId) => people.find((person) => person.id === favouriteId))
      .filter((person): person is PersonOption => Boolean(person));

    const nonFavouritePeople = people.filter(
      (person) => !favourites.includes(person.id)
    );

    return {
      favouritePeople,
      nonFavouritePeople,
    };
  }, [favourites, people, showFavouritesSection]);

  const renderPersonRow = (person: PersonOption) => {
    const isSelected = selection.includes(person.id);
    const isFavourited = favourites.includes(person.id);
    return (
      <button
        type="button"
        key={person.id}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-left transition-colors",
          "flex items-center justify-between gap-4",
          isSelected ? "border-primary/60 bg-primary/3" : "border-border"
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
                  <Badge className="font-semibold">You</Badge>
                </span>
              ) : null}
            </p>
            {person.username ? (
              <p className="text-xs text-muted-foreground">@{person.username}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cn(
              "flex h-8 w-8 items-center justify-center transition-colors",
              isFavourited
                ? "text-red-500"
                : "text-gray-200 hover:text-gray-300"
            )}
            onClick={(event) => {
              event.stopPropagation();
              handleToggleFavourite(person.id);
            }}
            aria-label={
              isFavourited ? "Remove from favourites" : "Add to favourites"
            }
          >
            <Heart
              className={cn(
                "h-6 w-6",
                isFavourited ? "fill-red-500" : "fill-gray-200"
              )}
            />
          </button>
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
        </div>
      </button>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-[90vh]">
          {people.length === 0 ? (
            <p className="text-sm">
              <Badge variant="destructive">{emptyStateText}</Badge>
            </p>
          ) : (
            <>
              {sortedPeople.favouritePeople.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Favourited friends
                  </p>
                  <div className="space-y-2">
                    {sortedPeople.favouritePeople.map((person) =>
                      renderPersonRow(person)
                    )}
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                {sortedPeople.favouritePeople.length > 0 ? (
                  <p className="text-xs font-semibold text-muted-foreground">
                    All friends
                  </p>
                ) : null}
                <div className="space-y-2">
                  {sortedPeople.nonFavouritePeople.map((person) =>
                    renderPersonRow(person)
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" className="mb-7">
              Confirm Selection
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};