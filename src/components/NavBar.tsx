import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Home,
  UsersRound,
  SquarePlus,
  History,
  Settings,
  ShoppingBag,
  Utensils,
  CalendarSync,
  ArrowRightLeft,
} from "lucide-react";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: "/dashboard", action: () => navigate("/dashboard") },
    { icon: UsersRound, path: "/friends", action: () => navigate("/friends") },
    { icon: SquarePlus, isTrigger: true },
    { icon: History, path: "/history", action: () => navigate("/history") },
    { icon: Settings, path: "/settings", action: () => navigate("/settings") },
  ];

  return (
    <Card
      className="fixed bottom-7 left-1/2 -translate-x-1/2 
             w-[90%] max-w-sm 
             rounded-full
             bg-neutral-300/20 backdrop-blur-sm 
             border border-white/0 
             px-6 py-4 
             grid grid-cols-5 
             text-muted-foreground 
             shadow-xl"
    >
      {navItems.map(({ icon: Icon, isTrigger, action, path }, index) => {
        const isActive = path && location.pathname === path;

        return (
          <div key={index} className="flex items-center justify-center">
            {isTrigger ? (
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <button>
                    <Icon className="w-7 h-7" />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="pb-10 px-0">
                  <div className="px-4 pt-7">
                    <div className="text-xl font-semibold mb-4 ml-3">
                      Select transaction type
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                        onClick={() => {
                          setDrawerOpen(false);
                        }}
                      >
                        <ShoppingBag className="size-5 mr-2" />
                        Purchase
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                      >
                        <Utensils className="size-5 mr-2" />
                        Restaurant Bill
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                      >
                        <CalendarSync className="size-5 mr-2" />
                        Recurring Subscription
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                      >
                        <ArrowRightLeft className="size-5 mr-2" />
                        Settle Up
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <button onClick={action}>
                <Icon
                  className={`w-7 h-7 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                />
              </button>
            )}
          </div>
        );
      })}
    </Card>
  );
};

export default NavBar;
