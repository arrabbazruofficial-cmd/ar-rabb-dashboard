import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router";
import { api } from "@/lib/api";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
  role: z.enum(["AGENCY", "CUSTOMER"]),
  company_name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "AGENCY" && (!data.company_name || data.company_name.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Agency Name is required",
  path: ["company_name"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "AGENCY"
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register/", {
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === "AGENCY" && data.company_name ? { company_name: data.company_name } : {})
      });
      
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.detail || "Failed to register. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans relative overflow-hidden py-10">
      {/* Decorative Brand Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#855300]/5 to-[#0051d5]/5 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md card-panel p-10">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Al-Rabb Tours" className="w-16 h-16 object-contain mb-4 drop-shadow-sm" />
          <h1 className="text-3xl font-bold font-heading text-primary">
            Create an Account
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 tracking-wide">ENTERPRISE PORTAL</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 border border-destructive/20 text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-800 text-sm font-medium p-3 rounded-lg mb-6 border border-green-200 text-center">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer p-3 border rounded-xl text-center font-medium text-sm transition-all ${selectedRole === 'CUSTOMER' ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:bg-secondary/50'}`}>
              <input type="radio" value="CUSTOMER" {...register("role")} className="hidden" />
              Customer
            </label>
            <label className={`cursor-pointer p-3 border rounded-xl text-center font-medium text-sm transition-all ${selectedRole === 'AGENCY' ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:bg-secondary/50'}`}>
              <input type="radio" value="AGENCY" {...register("role")} className="hidden" />
              Agency
            </label>
          </div>

          {selectedRole === 'AGENCY' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Agency / Company Name</label>
              <input 
                type="text" 
                {...register("company_name")}
                className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                placeholder="Al-Rabb Travels Ltd."
              />
              {errors.company_name && <p className="text-destructive text-xs">{errors.company_name.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              {...register("email")}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              {...register("password")}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <input 
              type="password" 
              {...register("confirmPassword")}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || success}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-md"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
