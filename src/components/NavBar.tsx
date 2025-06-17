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
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface NavBarProps {
  type?: "active" | "disabled";
}

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

  const activeIndex = navItems.findIndex(
    (item) => item.path && location.pathname === item.path
  );

  return (
    <Card
      className="fixed bottom-7 left-1/2 -translate-x-1/2 
             w-[90%] max-w-sm 
             rounded-full
             bg-neutral-100/20 backdrop-blur-md
             px-6 py-4 
             grid grid-cols-5 
             text-muted-foreground 
             border border-neutral-200
             shadow-xl"
    >
      {navItems.map(({ icon: Icon, isTrigger, action, path }, index) => {
        const isActive = path && location.pathname === path;

        return (
          <div key={index} className="flex items-center justify-center">
            {index === activeIndex && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute w-18 h-12 z-0 bg-neutral-400/20 backdrop-blur-md rounded-full border border-neutral-300 shadow-md"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
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
                          navigate("/splitpurchase");
                        }}
                      >
                        <ShoppingBag className="size-5 mr-2" />
                        Purchase
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate("/splitbill");
                        }}
                      >
                        <Utensils className="size-5 mr-2" />
                        Restaurant Bill
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate("/recurring");
                        }}
                      >
                        <CalendarSync className="size-5 mr-2" />
                        <span className="flex items-center gap-2">
                          Recurring
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-lg font-medium h-10 px-3"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate("/settleup");
                        }}
                      >
                        <ArrowRightLeft className="size-5 mr-2" />
                        Settle Up
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <button
                onClick={action}
                className="transition hover:scale-105 active:scale-75 z-10"
              >
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
