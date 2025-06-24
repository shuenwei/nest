import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Download, ArrowDown, ArrowUp } from "lucide-react";

export default function InstallPwaGuide() {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const excludedPaths = ["/splitbill"];
  const [platform, setPlatform] = useState<"safari" | "ios-chrome" | "other">(
    "other"
  );

  useEffect(() => {
    if (excludedPaths.includes(location.pathname)) return;

    const dismissed = localStorage.getItem("pwa-guide-dismissed");
    if (dismissed === "true") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      setShow(true);
    }

    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      !ua.includes("crios") &&
      !ua.includes("fxios");

    if (isiOS && isSafari) {
      setPlatform("safari");
    } else if (isiOS && (ua.includes("crios") || ua.includes("fxios"))) {
      setPlatform("ios-chrome");
    } else {
      setPlatform("other");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-black p-6">
      {platform === "safari" && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <ArrowDown className="w-8 h-8 text-black" />
        </div>
      )}
      {platform === "ios-chrome" && (
        <div className="absolute top-4 right-4">
          <ArrowUp className="w-7 h-7 text-black" />
        </div>
      )}

      <Download className="mb-4 w-8 h-8" />
      <h1 className="text-2xl font-bold">Install nest as an app</h1>

      <div className="mt-15 text-center text-base leading-relaxed max-w-md space-y-2">
        {platform === "safari" && (
          <>
            <p>
              1. Tap the <strong>Share icon</strong> (found at the bottom)
            </p>
            <p>
              2. Select <strong>"Add to Home Screen"</strong>
            </p>
          </>
        )}
        {platform === "ios-chrome" && (
          <>
            <p>
              1. Tap the <strong>Share icon</strong> (found at the top-right)
            </p>
            <p>
              2. Select <strong>"Add to Home Screen"</strong>
            </p>
          </>
        )}
        {platform === "other" && (
          <>
            <p>
              1. Tap the <strong>menu</strong> (⋮ or top-right)
            </p>
            <p>
              2. Choose <strong>"Add to Home screen"</strong>
            </p>
          </>
        )}
      </div>

      <Button
        onClick={() => {
          setShow(false);
        }}
        className="mt-20 w-full max-w-md text-sm"
      >
        I'll do it later
      </Button>
      <Button
        variant="link"
        onClick={() => {
          setShow(false);
          localStorage.setItem("pwa-guide-dismissed", "true");
        }}
        className="mt-3 text-sm text-muted-foreground font-normal"
      >
        Never show me this again
      </Button>
    </div>
  );
}
