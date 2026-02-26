"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dumbbell, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp,
  ArrowLeft, Loader2, RefreshCw,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getSavedWorkout } from "@/lib/api";

export default function WorkoutPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await getSavedWorkout(id);
        setPlan(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load workout plan.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="h-10 w-10 text-rose-500 animate-pulse" />
          <p className="text-muted-foreground">Loading workout plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-lg font-medium">{error || "Plan not found"}</p>
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const req = plan.request || {};
  const createdAt = plan.created_at
    ? new Date(plan.created_at).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" asChild>
              <Link href="/workout-plan">
                <ArrowLeft className="h-4 w-4" /> Workout Plans
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.plan_name}</h1>
          <p className="text-muted-foreground mt-1">{plan.description}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" asChild>
          <Link href="/workout-plan">
            <RefreshCw className="h-4 w-4" /> New Plan
          </Link>
        </Button>
      </div>

      {/* Meta info */}
      <Card className="bg-gray-50 border-0">
        <CardContent className="p-4 flex flex-wrap gap-3">
          {req.fitness_goal && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Goal</span>
              <Badge variant="secondary" className="mt-1 capitalize">{req.fitness_goal}</Badge>
            </div>
          )}
          {req.fitness_level && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Level</span>
              <Badge variant="outline" className="mt-1 capitalize">{req.fitness_level}</Badge>
            </div>
          )}
          {req.heart_risk && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Heart Risk</span>
              <Badge
                variant={req.heart_risk === "High" ? "destructive" : req.heart_risk === "Medium" ? "warning" : "success"}
                className="mt-1"
              >
                {req.heart_risk}
              </Badge>
            </div>
          )}
          {req.age && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Age</span>
              <span className="mt-1 text-sm font-medium">{req.age} yrs</span>
            </div>
          )}
          {req.equipment?.length > 0 && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Equipment</span>
              <span className="mt-1 text-sm font-medium">{req.equipment.join(", ")}</span>
            </div>
          )}
          {createdAt && (
            <div className="flex flex-col items-start ml-auto">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Generated</span>
              <span className="mt-1 text-sm">{createdAt}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Plan */}
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
                      <div
                        key={j}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2.5"
                      >
                        <span className="font-medium text-sm">{ex.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {ex.sets && `${ex.sets} sets`}{" "}
                          {ex.reps && `× ${ex.reps}`}
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
    </div>
  );
}
