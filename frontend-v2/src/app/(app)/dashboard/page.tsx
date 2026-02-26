"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Heart,
  Activity,
  TrendingUp,
  Pill,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats, getRiskHistory, getProgressTrend } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { ExternalLink } from "lucide-react";

/* ---------- Risk Gauge Component ---------- */
function RiskGauge({ percentage, category }: { percentage: number | null; category: string | null }) {
  const value = percentage ?? 0;
  const colors: Record<string, string> = {
    Low: "#10b981",
    Medium: "#f59e0b",
    High: "#ef4444",
  };
  const color = colors[category || "Low"] || "#6b7280";
  // SVG arc for gauge
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Center text */}
        <text x="100" y="80" textAnchor="middle" className="text-3xl font-bold" fill={color}>
          {percentage !== null ? `${value.toFixed(1)}%` : "—"}
        </text>
        <text x="100" y="105" textAnchor="middle" className="text-sm" fill="#6b7280">
          {category || "No data"}
        </text>
      </svg>
    </div>
  );
}

/* ---------- BMI Indicator Component ---------- */
function BMIIndicator({ bmi }: { bmi: number | null }) {
  if (bmi === null) return <p className="text-sm text-muted-foreground">No BMI data</p>;

  let label = "Normal";
  let color = "bg-emerald-500";
  let textColor = "text-emerald-700";

  if (bmi < 18.5) { label = "Underweight"; color = "bg-blue-500"; textColor = "text-blue-700"; }
  else if (bmi < 25) { label = "Normal"; color = "bg-emerald-500"; textColor = "text-emerald-700"; }
  else if (bmi < 30) { label = "Overweight"; color = "bg-amber-500"; textColor = "text-amber-700"; }
  else { label = "Obese"; color = "bg-red-500"; textColor = "text-red-700"; }

  // Position on scale 10-50
  const position = Math.min(Math.max(((bmi - 10) / 40) * 100, 0), 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>50</span>
      </div>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-gray-800 shadow-md transition-all duration-700"
          style={{ left: `calc(${position}% - 10px)` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${textColor}`}>{bmi.toFixed(1)}</span>
        <Badge variant={bmi >= 30 ? "destructive" : bmi >= 25 ? "warning" : "success"}>
          {label}
        </Badge>
      </div>
    </div>
  );
}

/* ---------- Dashboard Page ---------- */
export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return; // wait until Clerk has a valid session
    async function fetchData() {
      try {
        const [statsRes, historyRes, trendRes] = await Promise.all([
          getDashboardStats(),
          getRiskHistory(10),
          getProgressTrend(),
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);
        setTrend(trendRes.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Heart className="h-10 w-10 text-rose-500 animate-pulse" />
          <p className="text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    );
  }

  const latestRisk = stats?.latest_risk;
  const medAdherence = stats?.medication_adherence;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your heart health overview</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/risk-assessment">
            New Assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Risk</CardTitle>
              <Heart className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestRisk?.percentage != null ? `${latestRisk.percentage}%` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestRisk?.category ? `${latestRisk.category} risk` : "Take your first assessment"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BMI</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.latest_bmi != null ? stats.latest_bmi.toFixed(1) : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Body Mass Index</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_assessments ?? 0}</div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Med Adherence</CardTitle>
              <Pill className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medAdherence?.rate ?? 0}%</div>
              <Progress value={medAdherence?.rate ?? 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Current heart disease risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskGauge
              percentage={latestRisk?.percentage ?? null}
              category={latestRisk?.category ?? null}
            />
            {latestRisk?.percentage != null && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                {latestRisk.category === "Low" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-muted-foreground">
                  Last assessed on{" "}
                  {new Date(latestRisk.date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BMI Card */}
        <Card>
          <CardHeader>
            <CardTitle>Body Mass Index</CardTitle>
            <CardDescription>Your BMI classification</CardDescription>
          </CardHeader>
          <CardContent>
            <BMIIndicator bmi={stats?.latest_bmi ?? null} />
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>Your risk percentage trend across assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avg_risk"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                  name="Avg Risk %"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <TrendingUp className="h-10 w-10 mb-2 opacity-30" />
              <p>No trend data yet. Complete multiple assessments to see your progress.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
          <CardDescription>Your latest risk assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.risk_category === "Low"
                          ? "bg-emerald-500"
                          : item.risk_category === "Medium"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{item.risk_percentage}% Risk</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.risk_category === "Low"
                          ? "success"
                          : item.risk_category === "Medium"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {item.risk_category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {(item.confidence_score * 100).toFixed(0)}% conf.
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      asChild
                    >
                      <Link href={`/risk-assessment/${item.id}`}>
                        <ExternalLink className="h-3 w-3" />
                        {item.has_recommendations ? "View Report" : "View"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No predictions yet.</p>
              <Button variant="link" asChild className="mt-1">
                <Link href="/risk-assessment">Take your first assessment</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
