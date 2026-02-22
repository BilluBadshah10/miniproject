import { Link } from "react-router-dom";
import { Shield, UserCheck, FileCheck, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.jpg";

const features = [
  {
    icon: UserCheck,
    title: "Quick Enrollment",
    description: "Register your identity in minutes with our streamlined digital process.",
  },
  {
    icon: FileCheck,
    title: "Document Verification",
    description: "AI-powered verification of Aadhaar, PAN, and other government-issued IDs.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "256-bit encryption ensures your personal data remains safe and private.",
  },
  {
    icon: Shield,
    title: "Trusted by Government",
    description: "Official national verification portal compliant with all data protection norms.",
  },
];

const stats = [
  { value: "50Cr+", label: "Identities Verified" },
  { value: "99.9%", label: "Accuracy Rate" },
  { value: "less than 2 min", label: "Average Processing" },
  { value: "36", label: "States & UTs Covered" },
];

const Index = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center animate-fade-in">
              <img src={logo} alt="National Emblem" className="h-24 w-24 rounded-full object-cover shadow-lg" />
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-up">
              India's National
              <span className="text-gradient-green"> Digital Identity </span>
              Verification
            </h1>

            <p
              className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Secure, instant, and trusted identity verification for every citizen.
              Enroll once, verify anywhere.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Link to="/enroll">
                <Button size="lg" className="gap-2 shadow-[var(--shadow-saffron)] transition-all duration-200 hover:scale-105">
                  Start Enrollment <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="gap-2 transition-all duration-200 hover:scale-105">
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Why Choose DigiVerify?
          </h2>
          <p className="mt-2 text-muted-foreground">
            A secure national platform built for Bharat
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className="group border-border shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                  <feature.icon className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl">
            How It Works
          </h2>
          <div className="mx-auto max-w-2xl space-y-6">
            {[
              { step: "1", text: "Create your account with basic details" },
              { step: "2", text: "Upload your government-issued identity proof" },
              { step: "3", text: "Our system verifies your identity in real-time" },
              { step: "4", text: "Access your verified digital identity anywhere" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {item.step}
                </div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-secondary" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
