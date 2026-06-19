import { useRegisterForm } from "../hooks/useRegisterForm";
import { RegisterForm } from "../components/RegisterForm";

export function Component() {
  const { register, handleSubmit, errors, isSubmitting } = useRegisterForm();

  return (
    <RegisterForm
      register={register}
      onSubmit={handleSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
}
