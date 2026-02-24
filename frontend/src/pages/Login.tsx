import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import emblem from "@/assets/ashoka-emblem.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({
        title: "Authentication Error",
        description: "Please enter your Aadhaar/Email and password.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {

       localStorage.setItem("token", data.token);

// Decode JWT to extract role
const payload = JSON.parse(atob(data.token.split(".")[1]));

toast({
  title: "Access Granted",
  description: "Welcome to BharatID Secure Dashboard."
});

// Role-based redirect
if (payload.role === "admin") {
  navigate("/admin-dashboard");
} else {
  navigate("/dashboard");
}
      } else {
        toast({
          title: "Access Denied",
          description: data.message || "Invalid credentials.",
          variant: "destructive"
        });
      }

    } catch (error) {

    
      toast({
        title: "Server Error",
        description: "Unable to connect to secure authentication server.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <>
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-[var(--shadow-elevated)] animate-fade-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <img src={emblem} alt="Emblem" className="h-14 w-14 mx-auto opacity-70" />
            </div>
            <CardTitle className="text-2xl">BharatID Secure Access</CardTitle>
		<CardDescription>
  			AI-Driven Biometric & Quantum-Protected Authentication
		</CardDescription>

          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Aadhaar Number</Label>
		<Input
  		id="identifier"
  		type="text"
  		placeholder="Enter your registered Email or Aadhaar ID"
  		value={identifier}
  		onChange={(e) => setIdentifier(e.target.value)}
		/>

              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2 shadow-[var(--shadow-saffron)] transition-all duration-200 hover:scale-[1.02]" disabled={loading}>
                {loading ? "Authenticating..." : <><LogIn className="h-4 w-4" /> Secure Login</>}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
  		Don't have an account?{" "}
  		<Link to="/enroll" className="font-medium text-primary hover:underline transition-colors">
    			Enroll Now
  		</Link>
	    </p>

<p className="mt-3 text-xs text-center text-muted-foreground opacity-80">
  This system follows AI-driven identity verification with future-ready quantum-safe protection mechanisms.
</p>


          </CardContent>
        </Card>
      </div>
      </>
  );
};

export default Login;
