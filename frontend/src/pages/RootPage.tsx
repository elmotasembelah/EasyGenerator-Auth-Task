import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function Component() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6">
      <h1 className="text-4xl font-bold text-gray-900">
        {isAuthenticated ? `Hello, ${user?.name}` : "Welcome"}
      </h1>
      <p className="text-gray-500">
        {isAuthenticated
          ? "You are signed in."
          : "Get started by signing in or creating an account."}
      </p>
      <div className="flex gap-4">
        {isAuthenticated ? (
          <Button asChild>
            <Link to="/profile">Go to Profile</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="default">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
