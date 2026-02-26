"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Activity, Shield, Brain, ArrowRight, Sparkles, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const features = [
  {
    icon: Activity,
    title: "AI Risk Prediction",
    desc: "Advanced ML model analyzes 15+ health parameters to predict heart disease risk with clinical-grade accuracy.",
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: Brain,
    title: "Smart Fitness Plans",
    desc: "GPT-powered workout and nutrition plans tailored to your heart health status and fitness goals.",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Shield,
    title: "Medication Tracker",
    desc: "Never miss a dose. Track medications, set SMS reminders, and monitor adherence streaks over time.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const stats = [
  { value: "98%", label: "Accuracy Rate", icon: Zap },
  { value: "15+", label: "Health Params", icon: Activity },
  { value: "24/7", label: "AI Monitoring", icon: Sparkles },
  { value: "1K+", label: "Users Trust Us", icon: Users },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 glass">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-200/50">
              <Heart className="h-4.5 w-4.5 text-white fill-white/80" />
            </div>
            <span className="text-xl font-bold gradient-text">CardioSphere</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-200/50 rounded-xl" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/20 to-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-200/15 to-blue-200/15 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/4 w-2 h-2 rounded-full bg-rose-400 animate-float opacity-60" />
        <div className="absolute top-60 right-1/3 w-3 h-3 rounded-full bg-violet-300 animate-float-slow opacity-40" />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-pink-400 animate-float opacity-50" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-8 shadow-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">AI-Powered Heart Health</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-gray-900">Your Heart&apos;s</span>
                <br />
                <span className="gradient-text">Intelligence</span>
                <br />
                <span className="text-gray-900">Platform</span>
              </h1>
              <p className="mt-8 text-lg text-gray-500 leading-relaxed max-w-lg">
                Predict heart disease risk with AI, get personalized fitness and
                nutrition plans, track medications, and join a community of
                health-conscious individuals.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Button size="lg" className="gap-2 text-base bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-xl shadow-rose-200/50 rounded-xl px-8 h-12" asChild>
                  <Link href="/sign-up">
                    Start Free Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-base rounded-xl h-12 border-gray-200 hover:border-gray-300" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>

              {/* Stats bar */}
              <div className="mt-14 flex flex-wrap gap-6">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                      <s.icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200/40 to-violet-200/40 animate-pulse-glow" />
                {/* Main sphere */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-violet-600 flex flex-col items-center justify-center text-white shadow-2xl shadow-rose-300/30">
                  <Heart className="h-16 w-16 fill-white/80 mb-3" />
                  <span className="text-5xl font-bold">98%</span>
                  <span className="text-sm opacity-80 mt-1">Accuracy Rate</span>
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -right-4 top-12 glass-card rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Risk Level</p>
                      <p className="text-sm text-emerald-600 font-bold">Low — 12%</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute -left-6 bottom-16 glass-card rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
                      <Heart className="h-5 w-5 text-white fill-white/80" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">BMI</p>
                      <p className="text-sm text-rose-600 font-bold">24.5 — Normal</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold text-rose-600 tracking-wider uppercase mb-3">Features</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Everything for{" "}
                <span className="gradient-text">heart wellness</span>
              </h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">
                Comprehensive AI-powered tools to monitor, predict, and improve
                your cardiovascular health.
              </p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative"
              >
                <div className="glass-card-hover rounded-3xl p-8">
                  <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`h-7 w-7 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 p-12 lg:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-60" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to take control of your heart health?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                Join thousands of users who trust CardioSphere for AI-powered health insights.
              </p>
              <Button size="lg" className="bg-white text-rose-600 hover:bg-white/90 shadow-xl rounded-xl px-8 h-12 text-base font-semibold" asChild>
                <Link href="/sign-up">
                  Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
              <Heart className="h-3.5 w-3.5 text-white fill-white/80" />
            </div>
            <span>CardioSphere &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-gray-400">
            For educational purposes. Not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}