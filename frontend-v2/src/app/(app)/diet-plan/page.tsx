"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Salad, Loader2, AlertTriangle, Flame, Egg, Wheat, Droplets, Leaf, XCircle,
  History, ExternalLink, Sparkles,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { generateDiet, getSavedDiets } from "@/lib/api";

export default function DietPlanPage() {
  const [tab, setTab] = useState<"generate" | "saved">("generate");
  const [form, setForm] = useState({
    age: "", weight_kg: "", height_cm: "", heart_risk: "Low",
    dietary_restrictions: "", goal: "heart health",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState("");
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => { if (tab === "saved") loadSaved(); }, [tab]);

  const loadSaved = async () => {
    setSavedLoading(true);
    try { const res = await getSavedDiets(20); setSavedPlans(res.data); } catch {} finally { setSavedLoading(false); }
  };

  const handleGenerate = async () => {
    if (!form.age || !form.weight_kg || !form.height_cm) return setError("Please fill in all required fields");
    setLoading(true); setError("");
    try {
      const payload = { age: parseInt(form.age), weight_kg: parseFloat(form.weight_kg), height_cm: parseFloat(form.height_cm), heart_risk: form.heart_risk, dietary_restrictions: form.dietary_restrictions ? form.dietary_restrictions.split(",").map((s) => s.trim()) : [], goal: form.goal };
      const res = await generateDiet(payload);
      setPlan(res.data);
    } catch (err: any) { setError(err?.response?.data?.detail || "Failed to generate diet plan."); } finally { setLoading(false); }
  };

  const mealColors = [
    { bg: "from-amber-500 to-orange-500", glow: "shadow-amber-200/50" },
    { bg: "from-emerald-500 to-teal-500", glow: "shadow-emerald-200/50" },
    { bg: "from-indigo-500 to-blue-500", glow: "shadow-indigo-200/50" },
    { bg: "from-rose-500 to-pink-500", glow: "shadow-rose-200/50" },
  ];

  const mealIcons: Record<string, string> = { Breakfast: "", Lunch: "", Dinner: "", Snack: "" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text-subtle">Nutrition Planner</h1>
        <p className="text-muted-foreground mt-1">Heart-healthy meal plans crafted by AI</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-1">
          <TabsTrigger value="generate" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <Salad className="h-4 w-4" /> Generate Plan
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
            <History className="h-4 w-4" /> Saved Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="glass-card rounded-2xl border-0 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600"><Salad className="h-4 w-4 text-white" /></div>
                  Your Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Age *</Label>
                  <Input type="number" placeholder="30" min={10} max={100} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Weight (kg) *</Label>
                    <Input type="number" placeholder="70" min={20} max={300} value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Height (cm) *</Label>
                    <Input type="number" placeholder="170" min={100} max={250} value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Heart Risk Level</Label>
                  <Select value={form.heart_risk} onValueChange={(v) => setForm({ ...form, heart_risk: v })}>
                    <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Goal</Label>
                  <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}>
                    <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white/80"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="heart health">Heart Health</SelectItem><SelectItem value="weight loss">Weight Loss</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="muscle building">Muscle Building</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Dietary Restrictions</Label>
                  <Input placeholder="vegetarian, gluten-free..." value={form.dietary_restrictions} onChange={(e) => setForm({ ...form, dietary_restrictions: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                </div>

                {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {error}</p>}

                <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-all">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Plan</>}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {plan ? (
                <>
                  <Card className="glass-card rounded-2xl border-0 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl font-bold">{plan.plan_name}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 font-semibold text-rose-600">
                              <Flame className="h-4 w-4" /> {plan.daily_calories} cal/day
                            </span>
                          </CardDescription>
                        </div>
                        {plan.id && (
                          <Button variant="outline" size="sm" className="gap-1 shrink-0 rounded-xl" asChild>
                            <Link href={`/diet-plan/${plan.id}`}><ExternalLink className="h-3.5 w-3.5" /> View Saved</Link>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="space-y-4">
                    {plan.meals?.map((meal: any, i: number) => {
                      const mc = mealColors[i % mealColors.length];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                          <Card className="glass-card-hover rounded-2xl border-0">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mc.bg} shadow-lg ${mc.glow}`}>
                                    <span className="text-lg">{mealIcons[meal.meal_type] || ""}</span>
                                  </div>
                                  <div>
                                    <p className="font-bold">{meal.meal_type}</p>
                                    <p className="text-sm font-normal text-muted-foreground">{meal.name}</p>
                                  </div>
                                </CardTitle>
                                <Badge variant="outline" className="gap-1 rounded-lg bg-white/60"><Flame className="h-3 w-3 text-rose-500" /> {meal.calories} cal</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{meal.description}</p>
                              <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 rounded-xl bg-blue-50/80 backdrop-blur-sm px-3 py-2 text-xs font-medium text-blue-700 border border-blue-100/50">
                                  <Egg className="h-3 w-3" /> {meal.protein_g}g protein
                                </div>
                                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50/80 backdrop-blur-sm px-3 py-2 text-xs font-medium text-amber-700 border border-amber-100/50">
                                  <Wheat className="h-3 w-3" /> {meal.carbs_g}g carbs
                                </div>
                                <div className="flex items-center gap-1.5 rounded-xl bg-rose-50/80 backdrop-blur-sm px-3 py-2 text-xs font-medium text-rose-700 border border-rose-100/50">
                                  <Droplets className="h-3 w-3" /> {meal.fat_g}g fat
                                </div>
                              </div>
                              {meal.ingredients?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {meal.ingredients.map((ing: string, j: number) => (
                                    <Badge key={j} variant="secondary" className="text-xs rounded-lg bg-white/60">{ing}</Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {plan.heart_healthy_tips?.length > 0 && (
                    <Card className="glass-card rounded-2xl border-0 overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                      <CardHeader>
                        <CardTitle className="text-emerald-800 text-base flex items-center gap-2"><Leaf className="h-4 w-4" /> Heart-Healthy Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.heart_healthy_tips.map((tip: string, i: number) => (
                            <li key={i} className="text-sm text-emerald-700 flex items-start gap-3 rounded-xl bg-emerald-50/50 p-3 border border-emerald-100/40">
                              <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {plan.foods_to_avoid?.length > 0 && (
                    <Card className="glass-card rounded-2xl border-0 overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-red-400 to-rose-400" />
                      <CardHeader>
                        <CardTitle className="text-red-800 text-base flex items-center gap-2"><XCircle className="h-4 w-4" /> Foods to Avoid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {plan.foods_to_avoid.map((food: string, i: number) => (
                            <Badge key={i} variant="destructive" className="text-xs rounded-lg">{food}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="glass-card rounded-2xl border-0 flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
                    <Salad className="h-10 w-10 text-emerald-400" />
                  </div>
                  <p className="text-lg font-medium">No plan generated yet</p>
                  <p className="text-sm">Fill in your details and click Generate</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          {savedLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50 animate-pulse">
                <Salad className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Loading saved plans...</p>
            </div>
          ) : savedPlans.length === 0 ? (
            <Card className="glass-card rounded-2xl border-0 flex flex-col items-center justify-center h-64 text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
                <Salad className="h-8 w-8 text-emerald-400" />
              </div>
              <p className="text-lg font-medium">No saved plans yet</p>
              <p className="text-sm">Generate your first plan to see it here</p>
              <Button className="mt-4 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-200/50" onClick={() => setTab("generate")}>
                <Salad className="h-4 w-4" /> Generate a Plan
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedPlans.map((p: any, i: number) => {
                const mc = mealColors[i % mealColors.length];
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="glass-card-hover rounded-2xl border-0 group">
                      <CardContent className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mc.bg} shadow-lg ${mc.glow} shrink-0 transition-transform group-hover:scale-105`}>
                            <Salad className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{p.plan_name}</p>
                            {p.daily_calories && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-rose-500" /> {p.daily_calories} cal/day</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {p.request?.goal && <Badge variant="secondary" className="text-xs capitalize rounded-lg">{p.request.goal}</Badge>}
                              {p.request?.heart_risk && (
                                <Badge variant={p.request.heart_risk === "High" ? "destructive" : p.request.heart_risk === "Medium" ? "warning" : "success"} className="text-xs rounded-lg">{p.request.heart_risk} risk</Badge>
                              )}
                              {p.request?.dietary_restrictions?.length > 0 && (
                                <Badge variant="outline" className="text-xs rounded-lg">{p.request.dietary_restrictions.join(", ")}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          <Button size="sm" variant="outline" className="gap-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                            <Link href={`/diet-plan/${p.id}`}><ExternalLink className="h-3 w-3" /> View Plan</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}