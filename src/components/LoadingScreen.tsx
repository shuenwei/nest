import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  progress?: number | null;
}


const LoadingScreen = ({ progress }: LoadingScreenProps) => {
    const showRing = progress === undefined;
    const [isTakingTooLong, setIsTakingTooLong] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTakingTooLong(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#F8F8F8] backdrop-blur-sm">
      <div className="flex-1 flex items-center justify-center w-full">
        <span className="text-3xl font-semibold text-black">nest</span>
      </div>

      <div className="w-full flex flex-col items-center justify-center mb-20">
        <span className="text-muted-foreground text-sm mb-2">
          {isTakingTooLong ? "Check your internet connection" : "Getting your transactions"}
        </span>

        {/* Fixed height for loader area to prevent layout shift */}
        <div style={{ height: 48 }} className="flex items-center justify-center">
          {showRing ? (
            <Ring2
              size={40}
              stroke={6}
              strokeLength={0.25}
              bgOpacity={0.12}
              speed={1}
              color={"black"}
            />
          ) : (
            <div className="w-64">
              <Progress value={progress} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
