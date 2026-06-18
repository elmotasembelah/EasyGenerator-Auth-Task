import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/register.schema";

export function useRegisterForm() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { user } = await authService.register(values);
      setUser(user);
      toast.success("Account created successfully!");
      navigate("/profile");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  };
}
