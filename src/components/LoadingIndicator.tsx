import { useUser } from "@/contexts/UserContext";
import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";

export default function LoadingIndicator() {
  const { loading } = useUser();
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (loading) {
      setVisible(true);
      setDone(false);
    } else if (visible) {
      setDone(true);
      timeout = setTimeout(() => {
        setVisible(false);
        setDone(false);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            type: "tween",
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="fixed top-0 left-0 w-full z-40 bg-green-300"
          style={{
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <div className="text-primary font-semibold text-sm flex items-center justify-center gap-2 px-3 py-1 w-full">
            {done ? (
              <>
                <CircleCheck className="w-4 h-4" />
                All caught up!
              </>
            ) : (
              <>
                <Ring2
                  size={16}
                  stroke={4}
                  strokeLength={0.25}
                  bgOpacity={0}
                  speed={1}
                />
                Updating...
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
