import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ScanText, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const UsageLimitsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const scanLimit = user?.limits?.scans ?? 0;
  const translateLimit = user?.limits?.translations ?? 0;

  const scansUsed = user?.monthlyUsage?.scans ?? 0;
  const translationsUsed = user?.monthlyUsage?.translations ?? 0;

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
      <div className="w-full max-w-sm pt-5 pb-24">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 has-[>svg]:pr-0 mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
          <span className="text-base font-medium">Back</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Monthly Usage Limits</h1>
          <p className="text-muted-foreground text-sm text-justify">
            To prevent abuse, there is a monthly usage limit for several
            features of nest. These limits resets on the 1st of every month.
          </p>
        </div>

        <Card className="mb-4 shadow-xs">
          <CardContent className="px-4 space-y-2">
            <ScanText />
            <div className="flex justify-between">
              <span className="font-medium">Receipt Scans</span>

              <span className="text-sm text-muted-foreground">
                {scansUsed} / {scanLimit}
              </span>
            </div>
            <Progress value={scanLimit ? (scansUsed / scanLimit) * 100 : 0} />
          </CardContent>
        </Card>

        <Card className="mb-4 shadow-xs">
          <CardContent className="px-4 space-y-2">
            <Languages />
            <div className="flex justify-between">
              <span className="font-medium">Translations</span>
              <span className="text-sm text-muted-foreground">
                {translationsUsed} / {translateLimit}
              </span>
            </div>
            <Progress
              value={
                translateLimit ? (translationsUsed / translateLimit) * 100 : 0
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsageLimitsPage;
