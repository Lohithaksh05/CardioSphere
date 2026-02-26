"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Loader2,
  ShieldAlert, Smile, Activity, Stethoscope, ChevronRight, Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { predictRisk } from "@/lib/api";

type FormData = {
  high_bp: string; high_cholesterol: string; cholesterol_check: string;
  bmi: string; smoker: string; stroke: string; diabetes: string;
  physical_activity: string; fruits: string; veggies: string;
  heavy_alcohol: string; general_health: string; difficulty_walking: string;
  sex: string; age: string;
};

const initialForm: FormData = {
  high_bp: "", high_cholesterol: "", cholesterol_check: "1",
  bmi: "", smoker: "", stroke: "0", diabetes: "0",
  physical_activity: "", fruits: "", veggies: "",
  heavy_alcohol: "0", general_health: "3", difficulty_walking: "0",
  sex: "", age: "",
};

const steps = [
  { title: "Basic Info", desc: "Personal details", icon: "", fields: ["sex", "age", "bmi"] },
  { title: "Health Status", desc: "Current conditions", icon: "", fields: ["high_bp", "high_cholesterol", "cholesterol_check", "diabetes", "stroke"] },
  { title: "Lifestyle", desc: "Daily habits", icon: "", fields: ["smoker", "physical_activity", "fruits", "veggies", "heavy_alcohol"] },
  { title: "General", desc: "Overall health", icon: "", fields: ["general_health", "difficulty_walking"] },
];

export default function RiskAssessmentPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload: Record<string, number> = {};
      for (const [key, val] of Object.entries(form)) payload[key] = parseFloat(val);
      const res = await predictRisk(payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Prediction failed. Please try again.");
    } finally { setLoading(false); }
  };

  const BinarySelect = ({ field, label }: { field: string; label: string }) => (
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">{label}</Label>
      <Select value={(form as any)[field]} onValueChange={(v) => updateField(field, v)}>
        <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>
          <SelectItem value="0">No</SelectItem>
          <SelectItem value="1">Yes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (result) {
    const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      Low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500" },
      Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", gradient: "from-amber-500 to-orange-500" },
      High: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", gradient: "from-red-500 to-rose-500" },
    };
    const c = colors[result.risk_category] || colors.Low;
    const rec = result.recommendations;
    const priorityColors: Record<string, string> = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      low: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <Card className={`glass-card rounded-2xl border-0 overflow-hidden`}>
          <div className={`h-2 bg-gradient-to-r ${c.gradient}`} />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto mb-4">
              {result.risk_category === "Low" ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              ) : (
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${c.bg} mx-auto`}>
                  <AlertTriangle className={`h-10 w-10 ${c.text}`} />
                </div>
              )}
            </div>
            <CardTitle className={`text-4xl font-bold ${c.text}`}>{result.risk_percentage}% Risk</CardTitle>
            <CardDescription className={`${c.text} font-semibold text-base mt-1`}>{result.risk_category} Risk Category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-white/20">
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="text-2xl font-bold">{(result.probability * 100).toFixed(2)}%</p>
              </div>
              <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-white/20">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{(result.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>
            {rec?.summary && (
              <p className={`text-sm ${c.text} bg-white/60 backdrop-blur-sm rounded-xl p-4 leading-relaxed border border-white/20`}>{rec.summary}</p>
            )}
          </CardContent>
        </Card>

        {rec && (
          <>
            {rec.risk_factors?.length > 0 && (
              <Card className="glass-card rounded-2xl border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><ShieldAlert className="h-5 w-5 text-red-500" /> Your Risk Factors</CardTitle>
                  <CardDescription>Factors contributing to your elevated risk</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rec.risk_factors.map((rf: any, i: number) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-red-800">{rf.factor}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{rf.explanation}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {rec.positive_factors?.length > 0 && (
              <Card className="glass-card rounded-2xl border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><Smile className="h-5 w-5 text-emerald-500" /> What You&apos;re Doing Right</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rec.positive_factors.map((pf: string, i: number) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <p className="text-sm text-emerald-800">{pf}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {rec.lifestyle_changes?.length > 0 && (
              <Card className="glass-card rounded-2xl border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-blue-500" /> Recommended Lifestyle Changes</CardTitle>
                  <CardDescription>Personalized steps to reduce your risk</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rec.lifestyle_changes.map((lc: any, i: number) => (
                    <div key={i} className="rounded-xl border bg-white/50 p-4 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{lc.action}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 ${priorityColors[lc.priority] || priorityColors.medium}`}>{lc.priority}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{lc.impact}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {rec.medical_recommendations?.length > 0 && (
              <Card className="glass-card rounded-2xl border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><Stethoscope className="h-5 w-5 text-purple-500" /> Talk to Your Doctor About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rec.medical_recommendations.map((mr: string, i: number) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <p className="text-sm text-purple-900">{mr}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="flex gap-3 justify-center pb-8">
          <Button variant="outline" onClick={() => { setResult(null); setStep(0); setForm(initialForm); }} className="rounded-xl">New Assessment</Button>
          <Button className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl" asChild><Link href="/dashboard">View Dashboard</Link></Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text-subtle">Heart Risk Assessment</h1>
        <p className="text-muted-foreground mt-1">Answer a few questions to predict your heart disease risk</p>
      </div>

      {/* Modern step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
              i === step ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200/50" :
              i < step ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/50" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : <span>{s.icon}</span>}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-1 w-8 rounded-full transition-all ${i < step ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="glass-card rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{steps[step].title}</CardTitle>
          <CardDescription>{steps[step].desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Sex</Label>
                    <Select value={form.sex} onValueChange={(v) => updateField("sex", v)}>
                      <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue placeholder="Select sex..." /></SelectTrigger>
                      <SelectContent><SelectItem value="0">Female</SelectItem><SelectItem value="1">Male</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Age Category</Label>
                    <Select value={form.age} onValueChange={(v) => updateField("age", v)}>
                      <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue placeholder="Select age range..." /></SelectTrigger>
                      <SelectContent>
                        {["18-24","25-29","30-34","35-39","40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80+"].map((label, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">BMI</Label>
                    <Input type="number" placeholder="e.g. 25.4" min={10} max={80} value={form.bmi} onChange={(e) => updateField("bmi", e.target.value)} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                    <p className="text-xs text-muted-foreground">Body Mass Index (10-80)</p>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <BinarySelect field="high_bp" label="Do you have high blood pressure?" />
                  <BinarySelect field="high_cholesterol" label="Do you have high cholesterol?" />
                  <BinarySelect field="cholesterol_check" label="Cholesterol check in last 5 years?" />
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Diabetes Status</Label>
                    <Select value={form.diabetes} onValueChange={(v) => updateField("diabetes", v)}>
                      <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="0">No diabetes</SelectItem><SelectItem value="1">Pre-diabetes</SelectItem><SelectItem value="2">Diabetes</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <BinarySelect field="stroke" label="Have you ever had a stroke?" />
                </>
              )}
              {step === 2 && (
                <>
                  <BinarySelect field="smoker" label="Have you smoked 100+ cigarettes in your life?" />
                  <BinarySelect field="physical_activity" label="Physical activity in past 30 days?" />
                  <BinarySelect field="fruits" label="Do you consume fruit daily?" />
                  <BinarySelect field="veggies" label="Do you consume vegetables daily?" />
                  <BinarySelect field="heavy_alcohol" label="Heavy alcohol consumption?" />
                </>
              )}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">General Health (1=Excellent to 5=Poor)</Label>
                    <Select value={form.general_health} onValueChange={(v) => updateField("general_health", v)}>
                      <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="1">Excellent</SelectItem><SelectItem value="2">Very Good</SelectItem><SelectItem value="3">Good</SelectItem><SelectItem value="4">Fair</SelectItem><SelectItem value="5">Poor</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <BinarySelect field="difficulty_walking" label="Serious difficulty walking or climbing stairs?" />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="text-sm text-red-600 mt-3 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {error}</p>}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-200/50">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Predict Risk</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}