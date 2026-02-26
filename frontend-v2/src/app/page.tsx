"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Activity, Shield, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const features = [
  {
    icon: Activity,
    title: "AI Risk Prediction",
    desc: "Advanced ML model analyzes 15+ health parameters to predict heart disease risk with clinical-grade accuracy.",
  },
  {
    icon: Brain,
    title: "Smart Fitness Plans",
    desc: "GPT-powered workout and nutrition plans tailored to your heart health status and fitness goals.",
  },
  {
    icon: Shield,
    title: "Medication Tracker",
    desc: "Never miss a dose. Track medications, set reminders, and monitor adherence over time.",
  },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-600 fill-rose-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              CardioSphere
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm text-rose-700 font-medium mb-6">
                <Heart className="h-4 w-4 fill-rose-600 text-rose-600" />
                AI-Powered Heart Health
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                Your Heart&apos;s
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {" "}Intelligence{" "}
                </span>
                Platform
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                Predict heart disease risk with AI, get personalized fitness and
                nutrition plans, track medications, and join a community of
                health-conscious individuals.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Button size="lg" className="gap-2 text-base" asChild>
                  <Link href="/sign-up">
                    Start Free Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-base" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </motion.div>

            {/* Hero visual — animated heart gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-80 h-80">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-[6px] border-rose-100 animate-pulse-glow" />
                {/* Inner circle */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col items-center justify-center text-white shadow-2xl shadow-rose-200">
                  <Heart className="h-16 w-16 fill-white/80 mb-2" />
                  <span className="text-4xl font-bold">98%</span>
                  <span className="text-sm opacity-80">Accuracy Rate</span>
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -right-4 top-16 rounded-xl bg-white p-3 shadow-lg border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Risk Level</p>
                      <p className="text-xs text-emerald-600 font-bold">Low — 12%</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute -left-4 bottom-16 rounded-xl bg-white p-3 shadow-lg border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">BMI</p>
                      <p className="text-xs text-rose-600 font-bold">24.5 — Normal</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need for{" "}
              <span className="text-rose-600">heart wellness</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Comprehensive tools powered by artificial intelligence to monitor,
              predict, and improve your cardiovascular health.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group rounded-2xl border p-8 hover:shadow-lg hover:border-rose-200 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-5 group-hover:bg-rose-100 transition-colors">
                  <f.icon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            CardioSphere &copy; {new Date().getFullYear()}
          </div>
          <p className="text-xs text-gray-400">
            For educational purposes. Not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
