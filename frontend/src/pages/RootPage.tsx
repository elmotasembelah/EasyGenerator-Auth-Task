import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6">
      <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
      <p className="text-gray-500">Get started by signing in or creating an account.</p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
