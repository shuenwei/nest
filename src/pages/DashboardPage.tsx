import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import Navbar from "@/components/NavBar";
import FriendCard from "@/components/FriendCard";
import { MoveDownLeft, MoveUpRight, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/contexts/LocationContext";
import { CategorySelectDrawer } from "@/components/CategorySelectDrawer";
import TutorialOverlay from "@/components/Tutorial/TutorialOverlay";

const greetings = [
  "Hi",
  "Hey",
  "Hello",
  "Heya",
  "Yo",
  "What's up",
  "Looking fine",
  "Ahoy",
  "Howdy",
  "Good to see ya",
  "Bonjour",
  "Hola amigo",
  "Wassup",
  "Nice to see you",
  "Oh hey",
  "Konnichiwa",
];
const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    user,
    spending,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedCategoryIds,
    setSelectedCategoryIds,
    hasSeenTutorial,
    completeTutorial
  } = useUser();

  const { imageUrl, imageLoading } = useLocation();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  if (!user) return null;

  const getCategoryFilterText = () => {
    if (selectedCategoryIds.length === 0) return "All Categories";
    if (selectedCategoryIds.length === 1) {
      return (
        user.categories.find((c) => c.id === selectedCategoryIds[0])?.name ||
        "1 Category"
      );
    }
    return `${selectedCategoryIds.length} Categories`;
  };

  const getDateRangeText = () => {
    if (!startDate && !endDate) {
      return "All time";
    }
    if (startDate && endDate && startDate.getDate() === endDate.getDate()) {
      return `on ${format(startDate, "dd MMM yyyy")}`;
    }
    if (startDate && endDate) {
      return `${format(startDate, "dd MMM")} - ${format(endDate, "dd MMM")}`;
    }
  };

  const friendsOwe = user.friends
    .reduce((sum, f) => sum + (f.balance && f.balance > 0 ? f.balance : 0), 0)
    .toFixed(2);

  const youOwe = Math.abs(
    user.friends.reduce(
      (sum, f) => sum + (f.balance && f.balance < 0 ? f.balance : 0),
      0
    )
  ).toFixed(2);

  const filteredFriends = user.friends.filter((f) => (f.balance ?? 0) !== 0);

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit relative">
      {!hasSeenTutorial && <TutorialOverlay onComplete={completeTutorial} />}
      {/* Hero Section */}
      <div className="relative w-full min-h-[50vh] bg-gray-200 pb-16">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${imageUrl})`,
            opacity: imageLoading ? 0 : 1
          }}
        />

        <div className="relative z-10 px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] [.telegram-webapp_&]:pt-[calc(3.75rem+env(safe-area-inset-top))] text-white flex flex-col h-full w-full max-w-md mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold drop-shadow-md">
                nest
              </h1>
              <p className="text-white text-sm drop-shadow-md">
                {randomGreeting}, {user.displayName}!
              </p>
            </div>
            <Avatar className="h-11 w-11 shadow-md" onClick={() => navigate("/settings")}>
              <AvatarImage
                src={user.profilePhoto ? user.profilePhoto : ""}
                alt={user.displayName}
              />
              <AvatarFallback className="bg-muted-foreground/10 text-black">
                {user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-8 text-white shadow-lg">
            <p className="text-white/80 text-sm font-medium mb-1">Total Spent</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">
                ${spending.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <span className="text-white/90 text-xs bg-black/10 px-2 py-1 rounded-full border border-white/10 cursor-pointer hover:bg-black/20 transition-colors">
                    {getDateRangeText()}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={new Date()}
                    selected={{
                      from: startDate,
                      to: endDate,
                    }}
                    onSelect={(range) => {
                      const from = range?.from;
                      const to = range?.to;

                      setStartDate(from);

                      if (from) {
                        localStorage.setItem("startDate", from.toISOString());
                      } else {
                        localStorage.removeItem("startDate");
                      }

                      if (to) {
                        const endOfDay = new Date(to);
                        endOfDay.setHours(23, 59, 59, 999);
                        localStorage.setItem(
                          "endDate",
                          endOfDay.toISOString()
                        );
                        setEndDate(endOfDay);
                      } else {
                        localStorage.removeItem("endDate");
                        setEndDate(to);
                      }
                    }}
                  />
                  <div className="border-t px-4 py-3 space-y-2">
                    <div className="flex gap-2">
                      {[
                        {
                          label: "Today",
                          from: new Date(new Date().setHours(0, 0, 0, 0)),
                          to: new Date(new Date().setHours(23, 59, 59, 999)),
                        },
                        {
                          label: "This Week",
                          from: (() => {
                            const now = new Date();
                            const day = now.getDay();
                            const mondayOffset = day === 0 ? -6 : 1 - day;
                            const monday = new Date(now);
                            monday.setDate(now.getDate() + mondayOffset);
                            monday.setHours(0, 0, 0, 0);
                            return monday;
                          })(),
                          to: (() => {
                            const now = new Date();
                            const day = now.getDay();
                            const sundayOffset = day === 0 ? 0 : 7 - day;
                            const sunday = new Date(now);
                            sunday.setDate(now.getDate() + sundayOffset);
                            sunday.setHours(23, 59, 59, 999);
                            return sunday;
                          })(),
                        },
                      ].map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setStartDate(preset.from);
                            setEndDate(preset.to);
                            localStorage.setItem(
                              "startDate",
                              preset.from.toISOString()
                            );
                            localStorage.setItem(
                              "endDate",
                              preset.to.toISOString()
                            );
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {[
                        {
                          label: "This Month",
                          from: new Date(
                            new Date(new Date().setDate(1)).setHours(
                              0,
                              0,
                              0,
                              0
                            )
                          ),
                          to: new Date(
                            new Date(
                              new Date().getFullYear(),
                              new Date().getMonth() + 1,
                              0,
                              23,
                              59,
                              59,
                              999
                            )
                          ),
                        },
                        {
                          label: "This Year",
                          from: new Date(
                            new Date().getFullYear(),
                            0,
                            1,
                            0,
                            0,
                            0,
                            0
                          ),
                          to: new Date(
                            new Date().getFullYear(),
                            11,
                            31,
                            23,
                            59,
                            59,
                            999
                          ),
                        },
                      ].map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setStartDate(preset.from);
                            setEndDate(preset.to);
                            localStorage.setItem(
                              "startDate",
                              preset.from.toISOString()
                            );
                            localStorage.setItem(
                              "endDate",
                              preset.to.toISOString()
                            );
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <span
                className="text-white/90 text-xs bg-black/10 px-2 py-1 rounded-full border border-white/10 cursor-pointer hover:bg-black/20 transition-colors"
                onClick={() => setIsCategoryDrawerOpen(true)}
              >
                {getCategoryFilterText()}
              </span>

              <CategorySelectDrawer
                title="Filter Categories"
                description="Select categories to filter by."
                open={isCategoryDrawerOpen}
                onOpenChange={setIsCategoryDrawerOpen}
                selectedCategoryIds={selectedCategoryIds}
                onSelect={(ids) => setSelectedCategoryIds(ids)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-3xl p-4 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-2 rounded-full text-white">
                  <MoveDownLeft className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Friends Owe</p>
                <p className="text-xl font-bold mt-1 text-white">${friendsOwe}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-3xl p-4 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-2 rounded-full text-white">
                  <MoveUpRight className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">You Owe</p>
                <p className="text-xl font-bold mt-1 text-white">${youOwe}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-[2rem] min-h-[calc(50vh+2rem)] -mt-8 relative z-20 px-6 pt-8 pb-24">
        <div className="w-full max-w-sm mx-auto">

          <div className="space-y-3">
            {filteredFriends.map((f) => (
              <FriendCard key={f.id} userId={f.id} variant="flat" />
            ))}

            {filteredFriends.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p>You are all settled up!</p>
              </div>
            )}
          </div>
        </div>
        <Navbar />
      </div>
    </div>
  );
};

export default DashboardPage;
