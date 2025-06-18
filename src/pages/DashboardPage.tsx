import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/NavBar";
import FriendCard from "@/components/FriendCard";
import { MoveDownLeft, MoveUpRight, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Velustro } from "uvcanvas";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

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
const emojis = ["😎", "👀", "👋🏼"];
const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    user,
    spending,
    isLoadingSpending,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = useUser();

  if (!user) return null;

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
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-10 pb-24">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {randomGreeting}! {randomEmoji}
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user.displayName}
            </p>
          </div>
          <Avatar className="h-11 w-11" onClick={() => navigate("/settings")}>
            <AvatarImage
              src={user.profilePhoto ? user.profilePhoto : ""}
              alt={user.displayName}
            />
            <AvatarFallback>
              {user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="my-6">
          <Card className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute inset-0">
              <Velustro />
            </div>
            <CardContent className="relative z-10 px-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white/80">
                    Total Spent
                  </p>
                  <div className="flex items-baseline gap-2">
                    {isLoadingSpending ? (
                      <Skeleton className="h-9 w-32 bg-white/30 backdrop-blur-md rounded-md" />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        ${spending.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">
                  {getDateRangeText()}
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 backdrop-blur-xs border-white/20 text-white hover:bg-white/20 hover:text-white"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
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
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-green-50 border-green-200 px-4 py-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0">
                <p className="text-sm text-muted-foreground">Friends owe</p>
                <p className="text-green-600 font-bold text-lg">
                  ${friendsOwe}
                </p>
              </div>
              <div className="bg-green-200 text-green-700 rounded-full p-3">
                <MoveDownLeft className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-red-50 border-red-100 px-4 py-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0">
                <p className="text-sm text-muted-foreground">You owe</p>
                <p className="text-red-600 font-bold text-lg">${youOwe}</p>
              </div>
              <div className="bg-red-200 text-red-700 rounded-full p-3">
                <MoveUpRight className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Balances
          </h2>
        </div>

        {filteredFriends.map((f) => (
          <FriendCard key={f.id} userId={f.id} />
        ))}

        {filteredFriends.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            You are all settled up!
          </div>
        )}
        <Navbar />
      </div>
    </div>
  );
};

export default DashboardPage;
