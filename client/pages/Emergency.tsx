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
                onClick={() => {
                  console.log("React State button clicked!");
                  alert("React State button clicked!");
                  setMessage(
                    "Navigation test - if you see this, React is working!",
                  );
                }}
                className="w-full"
              >
                Test React State
              </Button>

              <Button
                onClick={() => {
                  console.log("Dashboard nav button clicked!");
                  alert(
                    "Dashboard nav button clicked - attempting navigation...",
                  );
                  try {
                    window.location.href = "/dashboard";
                  } catch (e) {
                    console.error("Navigation error:", e);
                    alert("Navigation failed: " + e);
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Try Dashboard Navigation
              </Button>

              <Button
                onClick={() => {
                  console.log("New tab button clicked!");
                  alert("New tab button clicked - attempting to open...");
                  try {
                    window.open("/dashboard", "_blank");
                  } catch (e) {
                    console.error("New tab error:", e);
                    alert("New tab failed: " + e);
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                Open Dashboard (New Tab)
              </Button>

              <Button
                onClick={() => {
                  console.log("Debug button clicked!");
                  console.log("Current URL:", window.location.href);
                  console.log("User agent:", navigator.userAgent);
                  console.log("Window object:", window);
                  alert("Debug button clicked! Check console for details.");
                }}
                variant="destructive"
                className="w-full"
              >
                Debug Info
              </Button>

              {/* Raw HTML button test */}
              <button
                onClick={() => {
                  alert("Raw HTML button works!");
                  window.location.replace("/test-dashboard");
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "purple",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Raw HTML Navigation Test
              </button>
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
