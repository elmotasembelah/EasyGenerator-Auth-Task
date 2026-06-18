import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../lib/api/api.errors";
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
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, {
          400: "Invalid details. Please check your inputs.",
          401: "Invalid email or password.",
          429: "Too many attempts. Please wait before trying again.",
        }, "Login failed. Please try again."),
      );
    }
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  };
}
