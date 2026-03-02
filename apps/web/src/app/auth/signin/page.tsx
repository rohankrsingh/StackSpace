"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, clearError } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store";
import { Eye, EyeOff } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

export default function SignIn() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationError, setValidationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError("Invalid email format");
      return;
    }
    if (!formData.password) {
      setValidationError("Password is required");
      return;
    }

    const result = await dispatch(signIn({ email: formData.email, password: formData.password }));

    if (result.meta.requestStatus === "fulfilled") {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Dark Theme with Content */}
      <div className="hidden w-full lg:flex flex-col items-center justify-center bg-black relative overflow-hidden p-12 h-full">
        {/* Animated Meteors */}
        <Meteors number={50} angle={60} className="bg-green-400 mt-20 " />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Discover the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Collaborative</span> Coding
          </h2>

        </div>
      </div>

      {/* Right Side - Light Theme with Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-gray-50">
        <div className="w-full max-w-md">
          {/* <h1 className="text-4xl font-bold text-black mb-8">
            Join Now for Success
          </h1> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="courtney.henry11@gmail.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Input with Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="pxrDQsXxxJ"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" checked={formData.password.length >= 8} readOnly className="w-4 h-4" />
                  <span>8+ characters</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" checked={/[0-9]/.test(formData.password)} readOnly className="w-4 h-4" />
                  <span>Must contain one number</span>
                </div>
              </div>
            </div>



            {/* Error Messages */}
            {(validationError || error) && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {validationError || error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8 space-y-3">
            <p className="text-center text-gray-600 text-sm">Or continue with</p>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-8">
            Already have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-black hover:underline">
              signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
