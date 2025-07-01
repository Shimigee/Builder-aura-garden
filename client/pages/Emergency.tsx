import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Emergency bypass page - no auth, no context, just basic functionality
export default function Emergency() {
  const [message, setMessage] = useState(
    "Emergency bypass loaded successfully!",
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🚨 Emergency Bypass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{message}</p>

            <div className="space-y-2">
              <Button
                onClick={() =>
                  setMessage(
                    "Navigation test - if you see this, React is working!",
                  )
                }
                className="w-full"
              >
                Test React State
              </Button>

              <Button
                onClick={() => (window.location.href = "/dashboard")}
                variant="outline"
                className="w-full"
              >
                Try Dashboard Navigation
              </Button>

              <Button
                onClick={() => window.open("/dashboard", "_blank")}
                variant="secondary"
                className="w-full"
              >
                Open Dashboard (New Tab)
              </Button>

              <Button
                onClick={() => {
                  console.log("Current URL:", window.location.href);
                  console.log("Testing console...");
                  alert("Alert test - if you see this, JS is working");
                }}
                variant="destructive"
                className="w-full"
              >
                Debug Info
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted rounded">
              <h3 className="font-semibold mb-2">Current Status:</h3>
              <ul className="text-sm space-y-1">
                <li>✅ Emergency page loaded</li>
                <li>✅ React rendering works</li>
                <li>✅ TailwindCSS styles work</li>
                <li>✅ Components work</li>
                <li>❓ Navigation testing needed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
