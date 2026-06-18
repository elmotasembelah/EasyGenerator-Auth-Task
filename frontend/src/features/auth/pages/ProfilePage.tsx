import { useAuthStore } from "../store/auth.store";
import { useLogout } from "../hooks/useLogout";
import { ProfileCard } from "../components/ProfileCard";

export function Component() {
  const user = useAuthStore((s) => s.user);
  const { logout, isLoggingOut } = useLogout();

  if (!user) return null;

  return <ProfileCard user={user} onLogout={logout} isLoggingOut={isLoggingOut} />;
}
