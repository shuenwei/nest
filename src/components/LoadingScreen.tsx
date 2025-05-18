import { Ring2 } from "ldrs/react";
import "ldrs/react/ring2.css";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Ring2
        size={80}
        stroke={10}
        strokeLength={0.25}
        bgOpacity={0.12}
        speed={1}
        color={"black"}
      />
    </div>
  );
};

export default LoadingScreen;
