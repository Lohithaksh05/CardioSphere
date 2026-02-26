"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Loader2, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp,
  History, ExternalLink,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { generateWorkout, getSavedWorkouts } from "@/lib/api";

export default function WorkoutPlanPage() {
  const [tab, setTab] = useState<"generate" | "saved">("generate");
  const [form, setForm] = useState({
    age: "",
    heart_risk: "Low",
    equipment: "",
    injuries: "",
    fitness_goal: "general fitness",
    fitness_level: "beginner",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  // Saved plans
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    if (tab === "saved") loadSaved();
  }, [tab]);

  const loadSaved = async () => {
    setSavedLoading(true);
    try {
      const res = await getSavedWorkouts(20);
      setSavedPlans(res.data);
    } catch {
      // silently ignore
    } finally {
      setSavedLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!form.age) return setError("Please enter your age");
    setLoading(true);
    setError("");
    try {
      const payload = {
        age: parseInt(form.age),
        heart_risk: form.heart_risk,
        equipment: form.equipment ? form.equipment.split(",").map((s) => s.trim()) : [],
        injuries: form.injuries,
        fitness_goal: form.fitness_goal,
        fitness_level: form.fitness_level,
      };
      const res = await generateWorkout(payload);
      setPlan(res.data);
      setExpandedDay(0);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate workout plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workout Plan Generator</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered fitness plans tailored to your heart health
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="generate" className="gap-2">
            <Dumbbell className="h-4 w-4" /> Generate Plan
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <History className="h-4 w-4" /> Saved Plans
          </TabsTrigger>
        </TabsList>

        {/* ── GENERATE TAB ── */}
        <TabsContent value="generate" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number" placeholder="30" min={10} max={100}
                    value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heart Risk Level</Label>
                  <Select value={form.heart_risk} onValueChange={(v) => setForm({ ...form, heart_risk: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fitness Level</Label>
                  <Select value={form.fitness_level} onValueChange={(v) => setForm({ ...form, fitness_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fitness Goal</Label>
                  <Select value={form.fitness_goal} onValueChange={(v) => setForm({ ...form, fitness_goal: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general fitness">General Fitness</SelectItem>
                      <SelectItem value="weight loss">Weight Loss</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="heart health">Heart Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Available Equipment</Label>
                  <Input
                    placeholder="dumbbells, resistance bands"
                    value={form.equipment}
                    onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated, or leave empty for bodyweight</p>
                </div>
                <div className="space-y-2">
                  <Label>Injuries / Limitations</Label>
                  <Textarea
                    placeholder="e.g. lower back pain, bad knee..."
                    value={form.injuries}
                    onChange={(e) => setForm({ ...form, injuries: e.target.value })}
                    rows={2}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> {error}
                  </p>
                )}

                <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Dumbbell className="h-4 w-4" /> Generate Plan</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Plan output */}
            <div className="lg:col-span-2 space-y-4">
              {plan ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{plan.plan_name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        {plan.id && (
                          <Button variant="outline" size="sm" className="gap-1 shrink-0" asChild>
                            <Link href={`/workout-plan/${plan.id}`}>
                              <ExternalLink className="h-3.5 w-3.5" /> View Saved
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Weekly plan */}
                  <div className="space-y-3">
                    {plan.weekly_plan?.map((day: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <button
                            onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
                                <Calendar className="h-5 w-5 text-rose-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium">{day.day}</p>
                                <p className="text-sm text-muted-foreground">{day.focus}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" /> {day.duration_minutes} min
                              </Badge>
                              {expandedDay === i ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                          {expandedDay === i && (
                            <CardContent className="pt-0 pb-4">
                              <div className="space-y-2 mt-2">
                                {day.exercises?.map((ex: any, j: number) => (
                                  <div key={j} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2.5">
                                    <span className="font-medium text-sm">{ex.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {ex.sets && `${ex.sets} sets`} {ex.reps && `× ${ex.reps}`}
                                      {ex.rest_seconds && ` · ${ex.rest_seconds}s rest`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {day.notes && (
                                <p className="mt-3 text-sm text-muted-foreground italic">💡 {day.notes}</p>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Safety Notes */}
                  {plan.safety_notes?.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardHeader>
                        <CardTitle className="text-amber-800 text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> Safety Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {plan.safety_notes.map((note: string, i: number) => (
                            <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                              <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <Dumbbell className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No plan generated yet</p>
                  <p className="text-sm">Fill in your details and click Generate</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── SAVED PLANS TAB ── */}
        <TabsContent value="saved" className="mt-4">
          {savedLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : savedPlans.length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-lg font-medium">No saved plans yet</p>
              <p className="text-sm">Generate your first plan to see it here</p>
              <Button className="mt-4 gap-2" variant="outline" onClick={() => setTab("generate")}>
                <Dumbbell className="h-4 w-4" /> Generate a Plan
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedPlans.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 shrink-0">
                          <Dumbbell className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-medium">{p.plan_name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {p.request?.fitness_goal && (
                              <Badge variant="secondary" className="text-xs">{p.request.fitness_goal}</Badge>
                            )}
                            {p.request?.fitness_level && (
                              <Badge variant="outline" className="text-xs">{p.request.fitness_level}</Badge>
                            )}
                            {p.request?.heart_risk && (
                              <Badge
                                variant={p.request.heart_risk === "High" ? "destructive" : p.request.heart_risk === "Medium" ? "warning" : "success"}
                                className="text-xs"
                              >
                                {p.request.heart_risk} risk
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                        <Button size="sm" variant="outline" className="gap-1" asChild>
                          <Link href={`/workout-plan/${p.id}`}>
                            <ExternalLink className="h-3 w-3" /> View Plan
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
