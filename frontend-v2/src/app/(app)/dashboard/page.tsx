"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Heart, Activity, TrendingUp, Pill, AlertTriangle, CheckCircle2, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats, getRiskHistory, getProgressTrend } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { ExternalLink } from "lucide-react";

/* ---------- Risk Gauge Component ---------- */
function RiskGauge({ percentage, category }: { percentage: number | null; category: string | null }) {
  const value = percentage ?? 0;
  const colors: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };
  const color = colors[category || "Low"] || "#6b7280";
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M 25 110 A 85 85 0 0 1 195 110" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
        <path d="M 25 110 A 85 85 0 0 1 195 110" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${circumference}`} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" filter="url(#glow)" />
        <text x="110" y="85" textAnchor="middle" className="text-4xl font-bold" fill={color}>
          {percentage !== null ? `${value.toFixed(1)}%` : "—"}
        </text>
        <text x="110" y="115" textAnchor="middle" className="text-sm font-medium" fill="#94a3b8">
          {category || "No data"}
        </text>
      </svg>
    </div>
  );
}

/* ---------- BMI Indicator Component ---------- */
function BMIIndicator({ bmi }: { bmi: number | null }) {
  if (bmi === null) return <p className="text-sm text-muted-foreground">No BMI data</p>;
  let label = "Normal"; let textColor = "text-emerald-600";
  if (bmi < 18.5) { label = "Underweight"; textColor = "text-blue-600"; }
  else if (bmi < 25) { label = "Normal"; textColor = "text-emerald-600"; }
  else if (bmi < 30) { label = "Overweight"; textColor = "text-amber-600"; }
  else { label = "Obese"; textColor = "text-red-600"; }
  const position = Math.min(Math.max(((bmi - 10) / 40) * 100, 0), 100);
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>50</span>
      </div>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400 shadow-inner">
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-gray-800 shadow-lg transition-all duration-700 ring-4 ring-white/50"
          style={{ left: `calc(${position}% - 10px)` }} />
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className={`text-3xl font-bold ${textColor}`}>{bmi.toFixed(1)}</span>
        <Badge variant={bmi >= 30 ? "destructive" : bmi >= 25 ? "warning" : "success"} className="rounded-lg font-semibold">
          {label}
        </Badge>
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

/* ---------- Dashboard Page ---------- */
export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;
    async function fetchData() {
      try {
        const [statsRes, historyRes, trendRes] = await Promise.all([
          getDashboardStats(), getRiskHistory(10), getProgressTrend(),
        ]);
        setStats(statsRes.data); setHistory(historyRes.data); setTrend(trendRes.data);
      } catch (err) { console.error("Dashboard fetch failed:", err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
            <Heart className="h-12 w-12 text-rose-500 relative" />
          </div>
          <p className="text-muted-foreground font-medium">Loading your health data...</p>
        </div>
      </div>
    );
  }

  const latestRisk = stats?.latest_risk;
  const medAdherence = stats?.medication_adherence;

  const statCards = [
    {
      title: "Heart Risk",
      value: latestRisk?.percentage != null ? `${latestRisk.percentage}%` : "—",
      subtitle: latestRisk?.category ? `${latestRisk.category} risk` : "Take your first assessment",
      icon: Heart,
      gradient: "from-rose-500 to-pink-500",
      bg: "bg-rose-50",
    },
    {
      title: "BMI",
      value: stats?.latest_bmi != null ? stats.latest_bmi.toFixed(1) : "—",
      subtitle: "Body Mass Index",
      icon: Activity,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
    },
    {
      title: "Assessments",
      value: String(stats?.total_assessments ?? 0),
      subtitle: "Total completed",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
    },
    {
      title: "Med Adherence",
      value: `${medAdherence?.rate ?? 0}%`,
      subtitle: "Medication adherence",
      icon: Pill,
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      hasProgress: true,
      progressValue: medAdherence?.rate ?? 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-subtle">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your heart health overview</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-200/40 rounded-xl" asChild>
          <Link href="/risk-assessment">New Assessment <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.title} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="glass-card-hover rounded-2xl border-0 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{card.title}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                {card.hasProgress && <Progress value={card.progressValue} className="mt-3 h-2" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card rounded-2xl border-0">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Risk Assessment</CardTitle>
              <CardDescription>Current heart disease risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskGauge percentage={latestRisk?.percentage ?? null} category={latestRisk?.category ?? null} />
              {latestRisk?.percentage != null && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  {latestRisk.category === "Low" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-muted-foreground">
                    Last assessed on{" "}
                    {new Date(latestRisk.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card rounded-2xl border-0">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Body Mass Index</CardTitle>
              <CardDescription>Your BMI classification</CardDescription>
            </CardHeader>
            <CardContent>
              <BMIIndicator bmi={stats?.latest_bmi ?? null} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Progress Over Time</CardTitle>
            <CardDescription>Your risk percentage trend across assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#cbd5e1" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Area type="monotone" dataKey="avg_risk" stroke="#e11d48" strokeWidth={2.5}
                    fill="url(#riskGradient)" name="Avg Risk %" dot={{ fill: "#e11d48", r: 4, strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mb-4">
                  <TrendingUp className="h-8 w-8 opacity-30" />
                </div>
                <p className="font-medium">No trend data yet</p>
                <p className="text-sm">Complete multiple assessments to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Prediction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="glass-card rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Predictions</CardTitle>
            <CardDescription>Your latest risk assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item: any, idx: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-white/80 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        item.risk_category === "Low" ? "bg-emerald-500" :
                        item.risk_category === "Medium" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                      <div>
                        <p className="font-semibold">{item.risk_percentage}% Risk</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={item.risk_category === "Low" ? "success" : item.risk_category === "Medium" ? "warning" : "destructive"} className="rounded-lg">
                        {item.risk_category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{(item.confidence_score * 100).toFixed(0)}% conf.</span>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                        <Link href={`/risk-assessment/${item.id}`}>
                          <ExternalLink className="h-3 w-3" />
                          {item.has_recommendations ? "View Report" : "View"}
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p>No predictions yet.</p>
                <Button variant="link" asChild className="mt-1"><Link href="/risk-assessment">Take your first assessment</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}