import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth-ultra-simple";
import { Loader2, Car, Shield } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login, signUp, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData & { fullName?: string }>();

  const onSubmit = async (data: LoginFormData & { fullName?: string }) => {
    try {
      setError(null);
      if (showSignUp) {
        if (!data.fullName) {
          setError("Full name is required");
          return;
        }
        await signUp(data.email, data.password, data.fullName);
        setError(null);
        alert("Check your email to confirm your account!");
      } else {
        await login(data.email, data.password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Car className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              ParkMaster
            </h1>
            <p className="text-muted-foreground">
              Secure Parking Permit Management
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {showSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {showSignUp
                ? "Create an account to manage parking permits"
                : "Sign in to access your parking permits"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {showSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-11"
                    {...register("fullName", {
                      required: showSignUp ? "Full name is required" : false,
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-11"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {showSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : showSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Toggle Sign Up/Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {showSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setShowSignUp(!showSignUp)}
                  className="text-primary hover:underline"
                >
                  {showSignUp ? "Sign in" : "Sign up here"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
