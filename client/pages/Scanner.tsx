import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { QRScanner } from "@/components/QRScanner";
import { usePermits } from "@/hooks/use-permits-supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Scanner() {
  const navigate = useNavigate();
  const { getPermitById } = usePermits();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [lastScannedPermit, setLastScannedPermit] = useState<any>(null);

  const handleScan = (result: string) => {
    setScanResult(result);

    // Try to extract permit ID from the scanned result
    // The QR code should contain either just the permit ID or a URL with the permit ID
    let permitId = result;

    // If it's a URL, extract the permit ID from it
    if (result.includes("/permit/")) {
      const match = result.match(/\/permit\/([^/?]+)/);
      if (match) {
        permitId = match[1];
      }
    }

    // Look up the permit
    const permit = getPermitById(permitId);

    if (permit) {
      setLastScannedPermit(permit);
      toast.success("Permit found!", {
        description: `${permit.permitNumber} - ${permit.holderName}`,
      });
    } else {
      setLastScannedPermit(null);
      toast.error("Permit not found", {
        description:
          "The scanned QR code doesn't match any permit in the system.",
      });
    }
  };

  const handleError = (error: string) => {
    toast.error("Scanner Error", {
      description: error,
    });
  };

  const viewPermitDetails = () => {
    if (lastScannedPermit) {
      navigate(`/permit/${lastScannedPermit.id}`);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-semibold">QR Code Scanner</h1>
            <div className="w-20"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-2xl mx-auto space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Permit QR Code</CardTitle>
              <CardDescription>
                Use your device camera to scan QR codes on parking permit
                stickers to quickly access permit information.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Scanner */}
          <QRScanner
            onScan={handleScan}
            onError={handleError}
            className="w-full"
          />

          {/* Scan Result */}
          {scanResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {lastScannedPermit ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <span>Scan Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Scanned Data:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {scanResult}
                  </p>
                </div>

                {lastScannedPermit ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Permit Number</p>
                        <p className="text-sm text-muted-foreground">
                          {lastScannedPermit.permitNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Holder</p>
                        <p className="text-sm text-muted-foreground">
                          {lastScannedPermit.holderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Vehicle</p>
                        <p className="text-sm text-muted-foreground">
                          {lastScannedPermit.vehicle.make}{" "}
                          {lastScannedPermit.vehicle.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge
                          className={
                            lastScannedPermit.isActive
                              ? "bg-permit-active text-white"
                              : "bg-gray-500 text-white"
                          }
                        >
                          {lastScannedPermit.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={viewPermitDetails}
                      className="w-full"
                      size="lg"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Permit Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <X className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p>
                      This QR code doesn't match any permit in your accessible
                      lots.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
