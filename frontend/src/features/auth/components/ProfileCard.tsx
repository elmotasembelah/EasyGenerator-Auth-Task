import { type User } from "../types/auth.types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  user: User;
  onLogout: () => void;
}

export function ProfileCard({ user, onLogout }: ProfileCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Name</span>
              <span className="text-sm text-gray-900">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Email</span>
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
          </div>
          <Button
            className="w-full bg-red-800 hover:bg-red-900 text-white"
            onClick={onLogout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
