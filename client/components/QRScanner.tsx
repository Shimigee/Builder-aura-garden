import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, CameraOff, RotateCcw } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className = "" }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setHasPermission(false);
      setError(
        "Camera permission denied. Please allow camera access to scan QR codes.",
      );
    }
  };

  const startScanning = async () => {
    if (!videoRef.current || !hasPermission) return;

    try {
      setError(null);
      setIsScanning(true);

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      }

      const videoConstraints = {
        facingMode: "environment", // Use back camera if available
        width: { ideal: 640 },
        height: { ideal: 480 },
      };

      await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log("QR Code scanned:", scannedText);
            onScan(scannedText);
            stopScanning();
          }
          if (error && !error.name.includes("NotFoundException")) {
            console.error("Scanning error:", error);
          }
        },
      );
    } catch (err) {
      console.error("Failed to start scanning:", err);
      setError(
        "Failed to start camera. Please ensure camera permissions are granted.",
      );
      setIsScanning(false);
      onError?.("Failed to start camera");
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  };

  const retry = () => {
    setError(null);
    checkCameraPermission();
  };

  if (hasPermission === null) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Checking camera permissions...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center">Camera Access Required</CardTitle>
          <CardDescription className="text-center">
            Please allow camera access to scan QR codes
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <CameraOff className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={retry} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">QR Code Scanner</CardTitle>
        <CardDescription className="text-center">
          Position the QR code within the camera view
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Camera className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-center text-red-500 text-sm">{error}</div>
        )}

        <div className="flex justify-center space-x-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Start Scanning
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="w-full"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Scanning
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
