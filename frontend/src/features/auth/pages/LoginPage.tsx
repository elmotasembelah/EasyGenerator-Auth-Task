import { useLoginForm } from "../hooks/useLoginForm";
import { LoginForm } from "../components/LoginForm";

export function Component() {
  const { register, handleSubmit, errors, isSubmitting } = useLoginForm();

  return (
    <LoginForm
      register={register}
      onSubmit={handleSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
}
