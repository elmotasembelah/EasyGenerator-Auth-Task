import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

export function useLoginForm() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { user } = await authService.login(values);
      setUser(user);
      toast.success("Welcome back!");
      navigate("/profile");
    } catch {
      toast.error("Invalid email or password.");
    }
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  };
}
