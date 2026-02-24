import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 🔐 Token & Role Detection
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  let role: string | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch {
      role = null;
    }
  }

  // 🔗 Dynamic Links
  const links = [
    { to: "/", label: "Home" },
    { to: "/enroll", label: "Enroll" },
    !isLoggedIn && { to: "/login", label: "Login" },
    isLoggedIn &&
      (role === "admin"
        ? { to: "/admin-dashboard", label: "Admin Panel" }
        : { to: "/dashboard", label: "Dashboard" }),
  ].filter(Boolean) as { to: string; label: string }[];

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // force UI refresh
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      {/* Tricolor stripe */}
      <div className="h-1 bg-tricolor-stripe" />

      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <img
              src={logo}
              alt="National Emblem"
              className="h-9 w-9 rounded-full object-cover"
            />
            <Shield className="absolute -bottom-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full p-[2px]" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">
              BharatID Secure
            </span>
            <span className="text-[10px] text-muted-foreground">
              AI-Quantum National Identity Architecture
            </span>
            <span className="text-[9px] text-green-600 font-semibold mt-0.5">
              Quantum-Resilient Enabled
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isLoggedIn && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleLogout}
              className="ml-2"
            >
              Logout
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="flex flex-col p-4 gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleLogout}
                className="mt-2"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
