import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="h-1 bg-tricolor-stripe" />
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">DigiVerify</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} National Identity Verification Portal. Government of India. All rights reserved.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-foreground transition-colors">Help</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
