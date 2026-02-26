"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart, CheckCircle2, AlertTriangle, ArrowLeft,
  ShieldAlert, Smile, Activity, Stethoscope, ChevronRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPrediction } from "@/lib/api";

/* Age category labels matching the model encoding */
const AGE_LABELS: Record<number, string> = {
  1: "18–24", 2: "25–29", 3: "30–34", 4: "35–39",
  5: "40–44", 6: "45–49", 7: "50–54", 8: "55–59",
  9: "60–64", 10: "65–69", 11: "70–74", 12: "75–79", 13: "80+",
};

const HEALTH_LABELS: Record<number, string> = {
  1: "Excellent", 2: "Very Good", 3: "Good", 4: "Fair", 5: "Poor",
};

function InputSummary({ data }: { data: Record<string, number> }) {
  const rows = [
    { label: "Sex", value: data.sex === 1 ? "Male" : "Female" },
    { label: "Age", value: AGE_LABELS[data.age] ?? String(data.age) },
    { label: "BMI", value: data.bmi?.toFixed(1) },
    { label: "High Blood Pressure", value: data.high_bp === 1 ? "Yes" : "No" },
    { label: "High Cholesterol", value: data.high_cholesterol === 1 ? "Yes" : "No" },
    { label: "Diabetes", value: data.diabetes === 2 ? "Diabetic" : data.diabetes === 1 ? "Pre-diabetic" : "No" },
    { label: "Smoker", value: data.smoker === 1 ? "Yes" : "No" },
    { label: "History of Stroke", value: data.stroke === 1 ? "Yes" : "No" },
    { label: "Physically Active", value: data.physical_activity === 1 ? "Yes" : "No" },
    { label: "Eats Fruit Daily", value: data.fruits === 1 ? "Yes" : "No" },
    { label: "Eats Veggies Daily", value: data.veggies === 1 ? "Yes" : "No" },
    { label: "Heavy Alcohol", value: data.heavy_alcohol === 1 ? "Yes" : "No" },
    { label: "General Health", value: HEALTH_LABELS[data.general_health] ?? String(data.general_health) },
    { label: "Difficulty Walking", value: data.difficulty_walking === 1 ? "Yes" : "No" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PredictionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPrediction(id)
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load this assessment. It may not exist or belong to another account."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <p className="text-muted-foreground">{error || "Assessment not found."}</p>
        <Button asChild variant="outline"><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    High: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };
  const c = colors[data.risk_category] || colors.Low;
  const rec = data.recommendations;

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" className="gap-1 -ml-2" asChild>
        <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Assessment Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(data.created_at).toLocaleString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      {/* Risk Score Card */}
      <Card className={`${c.bg} ${c.border} border-2`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {data.risk_category === "Low" ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            ) : (
              <AlertTriangle className={`h-16 w-16 ${c.text}`} />
            )}
          </div>
          <CardTitle className={`text-3xl ${c.text}`}>{data.risk_percentage}% Risk</CardTitle>
          <CardDescription className={`${c.text} font-medium`}>
            {data.risk_category} Risk Category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-white/60 p-4">
              <p className="text-sm text-muted-foreground">Probability</p>
              <p className="text-xl font-bold">{(data.probability * 100).toFixed(2)}%</p>
            </div>
            <div className="rounded-lg bg-white/60 p-4">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-xl font-bold">{(data.confidence_score * 100).toFixed(1)}%</p>
            </div>
          </div>
          {rec?.summary && (
            <p className={`text-sm ${c.text} bg-white/60 rounded-lg p-4 leading-relaxed`}>
              {rec.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {rec ? (
        <>
          {rec.risk_factors?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldAlert className="h-5 w-5 text-red-500" /> Your Risk Factors
                </CardTitle>
                <CardDescription>Factors contributing to your elevated risk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rec.risk_factors.map((rf: any, i: number) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-red-800">{rf.factor}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{rf.explanation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {rec.positive_factors?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smile className="h-5 w-5 text-emerald-500" /> What You&apos;re Doing Right
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rec.positive_factors.map((pf: string, i: number) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-800">{pf}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {rec.lifestyle_changes?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-blue-500" /> Recommended Lifestyle Changes
                </CardTitle>
                <CardDescription>Personalized steps to reduce your risk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rec.lifestyle_changes.map((lc: any, i: number) => (
                  <div key={i} className="rounded-lg border bg-gray-50/50 p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{lc.action}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${priorityColors[lc.priority] || priorityColors.medium}`}>
                        {lc.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lc.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {rec.medical_recommendations?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-purple-500" /> Talk to Your Doctor About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rec.medical_recommendations.map((mr: string, i: number) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-purple-100 bg-purple-50/50 p-3">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <p className="text-sm text-purple-900">{mr}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground text-sm">
            No AI recommendations were generated for this assessment.
            <div className="mt-3">
              <Button asChild size="sm">
                <Link href="/risk-assessment">
                  <Heart className="h-4 w-4 mr-1" /> Run a new assessment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Data Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Assessment Inputs</CardTitle>
          <CardDescription>The values you submitted for this assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <InputSummary data={data.input_data} />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center pb-8">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/risk-assessment">
            <Heart className="h-4 w-4 mr-2" /> New Assessment
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
