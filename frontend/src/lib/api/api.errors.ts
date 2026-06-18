import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  messages: Partial<Record<number, string>>,
  fallback: string,
): string {
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    return messages[status] ?? fallback;
  }
  return fallback;
}
