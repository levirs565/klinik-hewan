import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input } from "../components";
import { useAuth } from "../context/AuthContext";
import { useLogin } from "../hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { trigger: loginTrigger, isMutating: isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await loginTrigger({ email, password });
      setUser(response.user);
      navigate("/");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        setErrors({ general: "Invalid email or password" });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-lg border border-surface-variant">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-variant mb-4">
              <span className="material-symbols-outlined text-4xl text-primary fill-1">
                pets
              </span>
            </div>
            <h1 className="text-headline-lg text-on-surface">VetConnect</h1>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-headline-md text-on-surface mb-2">
              Welcome back
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Please enter your details to access your portal.
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="owner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              icon={<span className="material-symbols-outlined">mail</span>}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                icon={<span className="material-symbols-outlined">lock</span>}
              />
              <button
                type="button"
                className="absolute right-4 top-10 text-on-surface-variant hover:text-on-surface"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-outline-variant"
              />
              <span className="text-body-md text-on-surface">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-body-md text-on-surface">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-600 hover:underline"
            >
              Register for an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
