import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Test dashboard with NO auth, NO context, NO guards
export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎉 SUCCESS! Dashboard Loaded (No Auth)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-600 font-semibold">
              ✅ You successfully navigated to the dashboard!
            </p>
            <p>This proves navigation works when auth is bypassed.</p>

            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = "/dashboard-no-auth")}
                className="w-full"
                variant="default"
              >
                🚀 Try Real Dashboard (No Auth)
              </Button>

              <Button
                onClick={() => (window.location.href = "/emergency")}
                variant="outline"
                className="w-full"
              >
                Back to Emergency
              </Button>

              <Button
                onClick={() => (window.location.href = "/login")}
                variant="secondary"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Diagnosis:</h3>
              <p className="text-green-700 text-sm">
                If you can see this page, the problem is definitely the auth
                system blocking navigation, not a fundamental routing issue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
