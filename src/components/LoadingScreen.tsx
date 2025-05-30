import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";
import { Progress } from "@/components/ui/progress"

interface LoadingScreenProps {
  progress?: number | null;
}

const LoadingScreen = ({ progress }: LoadingScreenProps) => {
    const showRing = progress === undefined;
  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8F8F8] backdrop-blur-sm pt-safe-top">
    {showRing ? (<Ring2
        size={80}
        stroke={10}
        strokeLength={0.25}
        bgOpacity={0.12}
        speed={1}
        color={"black"}
      />): (
        <Progress value={progress} className="w-64" />
      )}
    </div>
  );
};

export default LoadingScreen;
