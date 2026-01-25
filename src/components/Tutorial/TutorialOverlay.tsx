import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, CircleCheck } from "lucide-react";

interface Step {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Welcome to nest!",
    description: "Splitting bills and tracking expenses just got a whole lot easier.",
    icon: <span className="text-4xl">👋🏻</span>,
  },
  {
    title: "Transactions are converted to Singapore Dollars",
    description: "The app converts all transactions to SGD using Mastercard rates, the same rates you'll see on YouTrip, Trust, GXS or MariBank. Everything in the app is displayed in SGD, making it easy to settle up with PayNow.",
    icon: <span className="text-4xl">🇸🇬</span>,
  },
  {
    title: "Split purchases",
    description: "Split purchases equally, or enter custom split amounts.",
    icon: <span className="text-4xl">🛒</span>,
  },
  {
    title: "Split resturant bills",
    description: "Had a meal with friends? Scan the reciept in the app or send a picture of the reciept to the Telegram bot. All you'll have to do after is select the items consumed by each person and nest will calculate the splits for you.",
    icon: <span className="text-4xl">🍽️</span>,
  },
  {
    title: "Split recurring transactions",
    description: "Sharing a YouTube Premium, Netflix or Spotify family subscription plan with friends? Nest automatically splits the transaction every month so you'll never have to go \"When was the last time you transferred me?\" ever again.",
    icon: <span className="text-4xl">📅</span>,
  },
  {
    title: "Settle up",
    description: "Sent or received money from a friend? Record the transfer as a settle up.",
    icon: <span className="text-4xl">💸</span>,
  },
  {
    title: "Smart Settle Up",
    description: "Travelled as a group? Do a smart settle up at the end of the trip to minimise the number of transfers needed.",
    icon: <span className="text-4xl">🧳</span>,
  },
  {
    title: "Record transactions automatically",
    description: "Too lazy to log every transaction manually? Set up auto email forwarding and let nest record transactions for you to split later or for expense tracking.",
    icon: <span className="text-4xl">🧾</span>,
  },
  {
    title: "You're ready!",
    description: "Splitting bills should have never been this difficult. If you’ve got questions or feedback, just drop me a message on Telegram @shuenwei.",
    icon: <span className="text-4xl">🎉</span>,
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const hasCompletedRef = useRef(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      hasCompletedRef.current = true;
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (hasCompletedRef.current) {
          onComplete();
        }
      }}
    >
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-white/10" onClick={() => setIsVisible(false)} />
          
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(10px)" }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="relative w-full max-w-sm overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2rem]"
            style={{
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1), 0 0 20px 0 rgba(255,255,255,0.2) inset"
            }}
          >
            {/* Glass sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative p-8 flex flex-col items-center text-center space-y-6">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 flex items-center justify-center bg-white/50 rounded-full shadow-inner border border-white/60 mb-2"
              >
                {steps[currentStep].icon}
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="flex gap-1 pt-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep ? "w-6 bg-black" : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                className="w-full text-white bg-black hover:bg-gray-800 rounded-xl py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 && (
                  <CircleCheck className="w-5 h-5 mr-1" />
                )}
                <span>
                  {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                </span>
                {currentStep !== steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 ml-1" />
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
