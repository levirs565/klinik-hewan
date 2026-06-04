import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../hooks/useAuth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { trigger: registerTrigger, isMutating: isLoading } = useRegister();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!email.trim()) newErrors.email = "Email Address is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length > 0 && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!agreeTerms) newErrors.terms = "You must agree to the terms";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await registerTrigger({
        email,
        password,
        full_name: fullName,
        phone_number: "",
        address: "",
      });

      navigate("/login");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 409) {
        setErrors({ email: "Email already registered" });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      console.error("Register error:", error);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row font-body-md">
      <div className="hidden md:flex md:w-1/2 relative bg-surface-container-low items-center justify-center overflow-hidden">
        <img
          alt="Veterinary clinic setting"
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply grayscale-[20%]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC39tejnRVrvsq1_kpTM43xa_EHVsaWSI_CWz8wNdMSvhp2DUt40_IVamUNL7yG2sSgEYftzQi761zW0YmjjKRHrsAbyMqT4B_zohtn1b6HlWm0OdnsTY77cqmrFhnM7IFG9DEYnHMTdfHgd7PIkHMLySZFgkdOcdcGVkpRHE0tqYxshIC60fdUhqV0NPJFeMSjLZgh4TzpOWOw7ySKB0tAdNWdIAySscEr_sLEowCxXWctN7dsRnONi5CsnNpgrjr95mHRAzmA3tM"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface/90 via-surface/60 to-transparent" />
        <div className="relative z-10 max-w-lg p-section-gap">
          <div className="flex items-center gap-base mb-container-margin">
            <span
              className="material-symbols-outlined text-primary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_hospital
            </span>
            <span className="font-display-lg text-display-lg text-primary">
              VetConnect
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-gutter">
            Compassionate care, organized precisely.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-section-gap">
            Join our network to manage your pet's health records, schedule
            appointments seamlessly, and connect with top-tier veterinary
            professionals.
          </p>
          <div className="inline-flex items-center gap-base bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-full px-4 py-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-on-tertiary-fixed text-xs font-bold">
                V1
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-on-secondary-fixed text-xs font-bold">
                V2
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-on-primary-fixed text-xs font-bold">
                +
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant ml-2">
              Trusted by 500+ Clinics
            </span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-container-margin sm:p-section-gap bg-surface-bright">
        <div className="w-full max-w-[480px]">
          <div className="md:hidden flex items-center gap-base mb-container-margin justify-center">
            <span
              className="material-symbols-outlined text-primary text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_hospital
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              VetConnect
            </span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-margin sm:p-section-gap shadow-sm">
            <div className="mb-container-margin">
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-base">
                Create an account
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Enter your details to register as a new pet owner.
              </p>
            </div>

            {errors.general && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-gutter">
              <div className="flex flex-col">
                <label
                  className="font-label-md text-label-md text-on-surface-variant mb-2"
                  htmlFor="fullName"
                >
                  Full Name <span className="text-primary">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                {errors.fullName && (
                  <p className="mt-2 text-error text-body-sm">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label
                  className="font-label-md text-label-md text-on-surface-variant mb-2"
                  htmlFor="email"
                >
                  Email Address <span className="text-primary">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                {errors.email && (
                  <p className="mt-2 text-error text-body-sm">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label
                  className="font-label-md text-label-md text-on-surface-variant mb-2"
                  htmlFor="password"
                >
                  Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-4 pr-12 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-error text-body-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col mb-base">
                <label
                  className="font-label-md text-label-md text-on-surface-variant mb-2"
                  htmlFor="confirmPassword"
                >
                  Repeat Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-4 pr-12 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-error text-body-sm">
                    {errors.confirmPassword}
                  </p>
                )}
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Must be at least 8 characters long.
                </p>
              </div>

              <div className="flex items-start gap-3 mb-base">
                <div className="flex items-center h-6">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest bg-surface-bright cursor-pointer"
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="font-body-sm text-body-sm text-on-surface-variant leading-tight cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    className="text-primary font-semibold hover:underline"
                    to="#"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="text-primary font-semibold hover:underline"
                    to="#"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              {errors.terms && (
                <p className="text-error text-body-sm mb-base">
                  {errors.terms}
                </p>
              )}

              <div className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-container-margin text-center pt-container-margin border-t border-outline-variant/30">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?
                <Link
                  to="/login"
                  className="text-primary font-bold hover:underline transition-colors ml-1"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant/70">
              Secure and confidential portal. Designed for clinical precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
