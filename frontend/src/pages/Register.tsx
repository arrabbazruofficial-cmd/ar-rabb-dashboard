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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
      {/* Left Pane - Hero Image */}
      <div className="hidden lg:block relative overflow-hidden bg-primary/10">
        <img 
          src="/login-bg.jpg" 
          alt="Corporate Travel" 
          className="absolute inset-0 w-full h-full object-cover animate-fade-up" 
          style={{ animationDuration: '1.2s' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-16 left-16 right-16 text-white animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight drop-shadow-lg">
            Join the Premier Network
          </h2>
          <p className="text-lg text-white/90 max-w-lg drop-shadow-md">
            Register your agency or corporate account to access exclusive travel tools and seamless request management.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex items-center justify-center p-8 lg:p-16 relative overflow-y-auto">
        {/* Decorative background element for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0 lg:hidden" />
        
        <div className="w-full max-w-md relative z-10 animate-fade-up my-auto" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col mb-8">
            <img src="/logo.png" alt="AR-RABB Tours and Travels" className="w-16 h-16 object-contain mb-6 drop-shadow-sm" />
            <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Create an Account</h1>
            <p className="text-sm font-semibold text-primary mt-2 tracking-widest uppercase">Enterprise Portal</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-xl mb-6 border border-destructive/20 text-center animate-fade-up">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-800 text-sm font-medium p-4 rounded-xl mb-6 border border-green-200 text-center animate-fade-up">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer p-4 border rounded-xl text-center font-bold text-sm transition-all shadow-sm ${selectedRole === 'CUSTOMER' ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20' : 'bg-card border-border hover:bg-secondary/5 text-muted-foreground'}`}>
                <input type="radio" value="CUSTOMER" {...register("role")} className="hidden" />
                Customer
              </label>
              <label className={`cursor-pointer p-4 border rounded-xl text-center font-bold text-sm transition-all shadow-sm ${selectedRole === 'AGENCY' ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20' : 'bg-card border-border hover:bg-secondary/5 text-muted-foreground'}`}>
                <input type="radio" value="AGENCY" {...register("role")} className="hidden" />
                Agency
              </label>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Email Address</label>
              <input
                type="email"
                {...register("email")}
                className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-destructive text-xs font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-xs font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-destructive text-xs font-medium">{errors.confirmPassword.message}</p>}
            </div>

            {selectedRole === "AGENCY" && (
              <div className="space-y-2 group animate-fade-up">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Company Name</label>
                <input
                  type="text"
                  {...register("company_name")}
                  className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Acme Travels"
                />
                {errors.company_name && <p className="text-destructive text-xs font-medium">{errors.company_name.message}</p>}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || success} 
              className="w-full bg-primary text-primary-foreground mt-8 py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-muted-foreground mt-8">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
