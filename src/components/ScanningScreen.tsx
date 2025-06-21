import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Lightbulb } from "lucide-react";

interface FullScreenScanLoaderProps {
  imageSrc: string;
  complete: boolean;
  show: boolean;
  onFinish?: () => void;
}

export default function FullScreenScanLoader({
  imageSrc,
  complete,
  show,
  onFinish,
}: FullScreenScanLoaderProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(show);

  // Reset internal visibility when show is true
  useEffect(() => {
    if (show) setIsVisible(true);
  }, [show, imageSrc]);

  // Trigger hide when scan is complete
  useEffect(() => {
    if (complete) {
      setTimeout(() => setIsVisible(false), 0);
    }
  }, [complete]);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        if (onFinish) onFinish();
      }}
    >
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm"
        >
          <div className="relative rounded-[2rem] p-1 mt-[-12vh]">
            {/* Rainbow pulsing border */}
            <motion.div
              className="absolute inset-0 rounded-[2rem] pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, #ec4899, #facc15, #4ade80, #3b82f6, #8b5cf6, #ec4899)",
                filter: "blur(40px)",
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Image with blur and zoom */}
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {!complete && (
                  <motion.img
                    key="loading-image"
                    ref={imageRef}
                    src={imageSrc}
                    alt="Processing..."
                    initial={{ filter: "blur(12px)", scale: 1.2, opacity: 0 }}
                    animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
                    exit={{ filter: "blur(12px)", scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="max-h-[60vh] max-w-[70vw] object-contain rounded-3xl"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom alert */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
            <Alert className="bg-white border-black text-black">
              <Lightbulb />
              <AlertTitle className="font-semibold">Did you know?</AlertTitle>
              <AlertDescription className="text-black">
                You can also send pictures of your receipts to the 'nest'
                Telegram bot to be scanned!
              </AlertDescription>
            </Alert>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
