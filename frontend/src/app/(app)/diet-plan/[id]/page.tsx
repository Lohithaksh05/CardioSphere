"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Salad, AlertTriangle, Flame, Egg, Wheat, Droplets, Leaf, XCircle,
  ArrowLeft, Loader2, RefreshCw,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getSavedDiet } from "@/lib/api";

export default function DietPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getSavedDiet(id);
        setPlan(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load diet plan.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const mealIcons: Record<string, string> = {
    Breakfast: "🌅",
    Lunch: "☀️",
    Dinner: "🌙",
    Snack: "🍎",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Salad className="h-10 w-10 text-rose-500 animate-pulse" />
          <p className="text-muted-foreground">Loading diet plan...</p>
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
              <Link href="/diet-plan">
                <ArrowLeft className="h-4 w-4" /> Diet Plans
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.plan_name}</h1>
          <p className="text-rose-700 font-semibold flex items-center gap-1 mt-1">
            <Flame className="h-4 w-4" /> {plan.daily_calories} cal/day
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" asChild>
          <Link href="/diet-plan">
            <RefreshCw className="h-4 w-4" /> New Plan
          </Link>
        </Button>
      </div>

      {/* Meta info */}
      <Card className="bg-gray-50 border-0">
        <CardContent className="p-4 flex flex-wrap gap-4">
          {req.goal && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Goal</span>
              <Badge variant="secondary" className="mt-1 capitalize">{req.goal}</Badge>
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
          {req.weight_kg && req.height_cm && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Stats</span>
              <span className="mt-1 text-sm font-medium">{req.weight_kg} kg · {req.height_cm} cm</span>
            </div>
          )}
          {req.dietary_restrictions?.length > 0 && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Restrictions</span>
              <span className="mt-1 text-sm font-medium">{req.dietary_restrictions.join(", ")}</span>
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

      {/* Meals */}
      <div className="space-y-4">
        {plan.meals?.map((meal: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{mealIcons[meal.meal_type] || "🍽️"}</span>
                    {meal.meal_type}: {meal.name}
                  </CardTitle>
                  <Badge variant="outline" className="gap-1">
                    <Flame className="h-3 w-3" /> {meal.calories} cal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                    <Egg className="h-3 w-3" /> {meal.protein_g}g protein
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                    <Wheat className="h-3 w-3" /> {meal.carbs_g}g carbs
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
                    <Droplets className="h-3 w-3" /> {meal.fat_g}g fat
                  </div>
                </div>
                {meal.ingredients?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {meal.ingredients.map((ing: string, j: number) => (
                      <Badge key={j} variant="secondary" className="text-xs">{ing}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Heart-healthy tips */}
      {plan.heart_healthy_tips?.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
              <Leaf className="h-4 w-4" /> Heart-Healthy Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {plan.heart_healthy_tips.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                  <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Foods to avoid */}
      {plan.foods_to_avoid?.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 text-base flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Foods to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.foods_to_avoid.map((food: string, i: number) => (
                <Badge key={i} variant="destructive" className="text-xs">{food}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
