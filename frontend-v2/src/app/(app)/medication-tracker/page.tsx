"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Plus, Check, Clock, Trash2, Loader2, X, RotateCcw, Bell, BellOff,
  CalendarDays, Flame, SkipForward, Heart, Droplets, Activity, Zap, Sparkles,
  Phone, Pencil,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TimeWheelPicker from "@/components/TimeWheelPicker";
import {
  getMedications, addMedication, markMedicationTaken, skipMedication,
  resetMedication, deleteMedication, toggleMedicationSMS,
  getProfile, updateProfile, updateMedication,
} from "@/lib/api";

/* ---------- constants ---------- */
const CATEGORIES: Record<string, { label: string; color: string; gradient: string; icon: any }> = {
  heart:          { label: "Heart",          color: "bg-rose-100 text-rose-700",      gradient: "from-rose-500 to-pink-500",    icon: Heart },
  blood_pressure: { label: "Blood Pressure", color: "bg-orange-100 text-orange-700",  gradient: "from-orange-500 to-amber-500", icon: Activity },
  cholesterol:    { label: "Cholesterol",    color: "bg-amber-100 text-amber-700",    gradient: "from-amber-500 to-yellow-500", icon: Droplets },
  diabetes:       { label: "Diabetes",       color: "bg-blue-100 text-blue-700",      gradient: "from-blue-500 to-cyan-500",    icon: Zap },
  pain:           { label: "Pain Relief",    color: "bg-red-100 text-red-700",        gradient: "from-red-500 to-rose-500",     icon: Sparkles },
  supplement:     { label: "Supplement",     color: "bg-emerald-100 text-emerald-700",gradient: "from-emerald-500 to-teal-500", icon: Plus },
  general:        { label: "General",        color: "bg-gray-100 text-gray-700",      gradient: "from-gray-500 to-slate-500",   icon: Pill },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOSAGE_UNITS = ["mg", "ml", "tablet", "capsule", "drop", "patch", "puff"];

/* ---------- PhoneSetupBanner ---------- */
function PhoneSetupBanner({ phone, onSave }: { phone: string | null; onSave: (p: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(phone || "");
  const [saving, setSaving] = useState(false);

  if (phone && !editing) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shrink-0 shadow-lg shadow-violet-200/50">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-sm text-gray-900">Enable SMS Medication Reminders</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We&apos;ll send you SMS alerts at each scheduled time. Your number is stored securely and used only for reminders.
              </p>
              <div className="flex gap-2 pt-1">
                <Input placeholder="+91XXXXXXXXXX" value={val} onChange={(e) => setVal(e.target.value)} className="max-w-[220px] h-9 text-sm rounded-xl border-gray-200 bg-white/80" />
                <Button size="sm" className="h-9 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl" disabled={!val || saving}
                  onClick={async () => { setSaving(true); await onSave(val); setSaving(false); setEditing(false); }}>
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ---------- Main Page ---------- */
export default function MedicationTrackerPage() {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [smsLoading, setSmsLoading] = useState<string | null>(null);

  // edit modal state
  const [editingMed, setEditingMed] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editTimeSlots, setEditTimeSlots] = useState<string[]>(["08:00"]);
  const [editShowTimePicker, setEditShowTimePicker] = useState<number | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // form state
  const [form, setForm] = useState({
    medication_name: "", dosage: "", dosage_unit: "mg", category: "general",
    frequency: "daily" as "daily" | "specific_days" | "as_needed",
    specific_days: [] as string[],
    start_date: new Date().toISOString().split("T")[0], end_date: "", notes: "",
    sms_reminders_enabled: false,
  });

  const [timeSlots, setTimeSlots] = useState<string[]>(["08:00"]);
  const [showTimePicker, setShowTimePicker] = useState<number | null>(null);

  const fetchMeds = useCallback(async () => {
    try { const res = await getMedications(); setMedications(res.data); } catch (err) { console.error("Failed to fetch medications:", err); } finally { setLoading(false); }
  }, []);

  const fetchPhone = useCallback(async () => {
    try { const res = await getProfile(); setUserPhone(res.data.phone_number || null); } catch {}
  }, []);

  useEffect(() => { fetchMeds(); fetchPhone(); }, [fetchMeds, fetchPhone]);

  const handleSavePhone = async (phone: string) => {
    try { await updateProfile({ phone_number: phone }); setUserPhone(phone); } catch (err) { console.error("Save phone failed:", err); }
  };

  const resetForm = () => {
    setForm({ medication_name: "", dosage: "", dosage_unit: "mg", category: "general", frequency: "daily", specific_days: [], start_date: new Date().toISOString().split("T")[0], end_date: "", notes: "", sms_reminders_enabled: false });
    setTimeSlots(["08:00"]); setShowTimePicker(null);
  };

  const handleAdd = async () => {
    if (!form.medication_name || !form.dosage || timeSlots.length === 0) return;
    setSubmitting(true);
    try {
      await addMedication({ medication_name: form.medication_name, dosage: form.dosage, dosage_unit: form.dosage_unit, time_schedule: timeSlots, frequency: form.frequency, specific_days: form.specific_days, start_date: form.start_date, end_date: form.end_date || null, category: form.category, notes: form.notes, sms_reminders_enabled: form.sms_reminders_enabled });
      resetForm(); setShowForm(false); await fetchMeds();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleTake = async (id: string) => { try { await markMedicationTaken(id); await fetchMeds(); } catch (err) { console.error(err); } };
  const handleSkip = async (id: string) => { try { await skipMedication(id); await fetchMeds(); } catch (err) { console.error(err); } };
  const handleReset = async (id: string) => { try { await resetMedication(id); await fetchMeds(); } catch (err) { console.error(err); } };
  const handleDelete = async (id: string) => { try { await deleteMedication(id); await fetchMeds(); } catch (err) { console.error(err); } };

  const handleToggleSMS = async (id: string, enabled: boolean) => {
    if (enabled && !userPhone) return;
    setSmsLoading(id);
    try { await toggleMedicationSMS(id, { enabled }); await fetchMeds(); } catch (err) { console.error(err); } finally { setSmsLoading(null); }
  };

  const openEditModal = (med: any) => {
    setEditingMed(med);
    setEditForm({ medication_name: med.medication_name, dosage: med.dosage, dosage_unit: med.dosage_unit || "mg", category: med.category || "general", frequency: med.frequency || "daily", specific_days: med.specific_days || [], start_date: med.start_date || "", end_date: med.end_date || "", notes: med.notes || "" });
    setEditTimeSlots(med.time_schedule?.length ? med.time_schedule : ["08:00"]);
    setEditShowTimePicker(null);
  };

  const handleUpdate = async () => {
    if (!editingMed || !editForm.medication_name || !editForm.dosage || editTimeSlots.length === 0) return;
    setEditSubmitting(true);
    try {
      await updateMedication(editingMed.id, { medication_name: editForm.medication_name, dosage: editForm.dosage, dosage_unit: editForm.dosage_unit, time_schedule: editTimeSlots, frequency: editForm.frequency, specific_days: editForm.specific_days, start_date: editForm.start_date, end_date: editForm.end_date || null, category: editForm.category, notes: editForm.notes });
      setEditingMed(null); await fetchMeds();
    } catch (err) { console.error(err); } finally { setEditSubmitting(false); }
  };

  const toggleEditDay = (day: string) => setEditForm((f: any) => ({ ...f, specific_days: f.specific_days.includes(day) ? f.specific_days.filter((d: string) => d !== day) : [...f.specific_days, day] }));
  const toggleDay = (day: string) => setForm((f) => ({ ...f, specific_days: f.specific_days.includes(day) ? f.specific_days.filter((d) => d !== day) : [...f.specific_days, day] }));

  const addTimeSlot = () => setTimeSlots((ts) => [...ts, "12:00"]);
  const removeTimeSlot = (idx: number) => setTimeSlots((ts) => ts.filter((_, i) => i !== idx));
  const updateTimeSlot = (idx: number, val: string) => setTimeSlots((ts) => ts.map((t, i) => (i === idx ? val : t)));

  /* derived stats */
  const activeMeds = medications.filter((m) => { if (!m.end_date) return true; return new Date(m.end_date) >= new Date(new Date().toISOString().split("T")[0]); });
  const takenCount = activeMeds.filter((m) => m.adherence_status).length;
  const adherenceRate = activeMeds.length > 0 ? Math.round((takenCount / activeMeds.length) * 100) : 0;
  const bestStreak = medications.reduce((max, m) => Math.max(max, m.streak || 0), 0);
  const remindersOn = medications.filter((m) => m.sms_reminders_enabled).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200/50 animate-pulse">
          <Pill className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">Loading medications...</p>
      </div>
    );
  }

  /* ---------- TimePicker block (reused in add & edit) ---------- */
  const renderTimeSlots = (slots: string[], showPicker: number | null, onTogglePicker: (i: number | null) => void, onUpdate: (i: number, v: string) => void, onRemove: (i: number) => void, onAdd: () => void) => (
    <div className="flex flex-wrap gap-3 items-start">
      {slots.map((t, idx) => (
        <div key={idx} className="relative">
          <button type="button" onClick={() => onTogglePicker(showPicker === idx ? null : idx)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-mono font-semibold transition-all ${showPicker === idx ? "border-violet-500 bg-violet-50 text-violet-700 shadow-lg shadow-violet-100/50" : "border-gray-200 bg-white/80 text-gray-700 hover:border-violet-300"}`}>
            <Clock className="h-4 w-4" />{t}
          </button>
          {slots.length > 1 && (
            <button type="button" onClick={() => onRemove(idx)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition shadow-sm">
              <X className="h-3 w-3" />
            </button>
          )}
          <AnimatePresence>
            {showPicker === idx && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-full left-0 mt-2 z-50">
                <TimeWheelPicker value={t} onChange={(v) => onUpdate(idx, v)} />
                <Button size="sm" className="w-full mt-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl" onClick={() => onTogglePicker(null)}>Done</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="flex items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 transition">
        <Plus className="h-4 w-4" /> Add Time
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-subtle">Medication Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage your daily medications &amp; reminders</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className={`gap-2 rounded-xl shadow-lg transition-all ${showForm ? "bg-gray-600 hover:bg-gray-700" : "bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-200/50"}`}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Medication"}
        </Button>
      </div>

      <PhoneSetupBanner phone={userPhone} onSave={handleSavePhone} />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active Meds", value: activeMeds.length, icon: Pill, gradient: "from-violet-500 to-purple-500", glow: "shadow-violet-200/50" },
          { label: "Taken Today", value: `${takenCount}/${activeMeds.length}`, icon: Check, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-200/50" },
          { label: "Adherence", value: `${adherenceRate}%`, icon: Activity, gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-200/50", progress: adherenceRate },
          { label: "Best Streak", value: bestStreak, icon: Flame, gradient: "from-orange-500 to-amber-500", glow: "shadow-orange-200/50", suffix: "days" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card-hover rounded-2xl border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                {stat.progress !== undefined && <Progress value={stat.progress} className="h-1.5 mt-3" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ======== ADD MEDICATION FORM ======== */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card rounded-2xl border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                    <Pill className="h-4 w-4 text-white" />
                  </div>
                  New Medication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Row 1: name + dosage + unit */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Medication Name *</Label>
                    <Input placeholder="e.g. Atorvastatin" value={form.medication_name} onChange={(e) => setForm({ ...form, medication_name: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Dosage *</Label>
                    <Input placeholder="e.g. 20" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Unit</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {DOSAGE_UNITS.map((u) => (
                        <button key={u} type="button" onClick={() => setForm({ ...form, dosage_unit: u })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.dosage_unit === u ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORIES).map(([key, { label, color, icon: Icon }]) => (
                      <button key={key} type="button" onClick={() => setForm({ ...form, category: key })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.category === key ? `${color} ring-2 ring-violet-400 ring-offset-1` : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                        <Icon className="h-3 w-3" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Schedule */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium"><Clock className="h-4 w-4 text-violet-500" /> Reminder Times *</Label>
                  {renderTimeSlots(timeSlots, showTimePicker, setShowTimePicker, updateTimeSlot, removeTimeSlot, addTimeSlot)}
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Frequency</Label>
                  <div className="flex gap-2">
                    {([["daily", "Every Day"], ["specific_days", "Specific Days"], ["as_needed", "As Needed"]] as const).map(([val, lab]) => (
                      <button key={val} type="button" onClick={() => setForm({ ...form, frequency: val })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.frequency === val ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200/50" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {lab}
                      </button>
                    ))}
                  </div>
                  {form.frequency === "specific_days" && (
                    <div className="flex gap-1.5 pt-1">
                      {DAYS.map((d) => (
                        <button key={d} type="button" onClick={() => toggleDay(d)}
                          className={`w-10 h-10 rounded-full text-xs font-semibold transition-all ${form.specific_days.includes(d) ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-gray-700 font-medium"><CalendarDays className="h-3.5 w-3.5" /> Start Date *</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-gray-700 font-medium"><CalendarDays className="h-3.5 w-3.5" /> End Date <span className="text-xs text-muted-foreground ml-1">(leave empty for ongoing)</span></Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Notes</Label>
                  <Input placeholder="e.g. Take with food, before bed, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                </div>

                {/* SMS toggle */}
                <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">SMS Reminders</span>
                        {!userPhone && <p className="text-xs text-amber-600">(add phone above first)</p>}
                      </div>
                    </div>
                    <button type="button" disabled={!userPhone}
                      onClick={() => setForm({ ...form, sms_reminders_enabled: !form.sms_reminders_enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.sms_reminders_enabled ? "bg-gradient-to-r from-violet-500 to-purple-600" : "bg-gray-200"} ${!userPhone ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.sms_reminders_enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  {form.sms_reminders_enabled && userPhone && (
                    <p className="text-xs text-muted-foreground mt-2 ml-11">Reminders will be sent to <strong>{userPhone}</strong> at each scheduled time.</p>
                  )}
                </div>

                <Button onClick={handleAdd}
                  disabled={submitting || !form.medication_name || !form.dosage || timeSlots.length === 0}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-200/60 transition-all">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Medication
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== EDIT MODAL ======== */}
      <AnimatePresence>
        {editingMed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditingMed(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl border-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
              <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-2xl">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                    <Pencil className="h-4 w-4 text-white" />
                  </div>
                  Edit Medication
                </h2>
                <button onClick={() => setEditingMed(null)} className="p-2 rounded-xl hover:bg-gray-100 transition"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Medication Name *</Label>
                    <Input value={editForm.medication_name} onChange={(e) => setEditForm({ ...editForm, medication_name: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Dosage *</Label>
                    <Input value={editForm.dosage} onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Unit</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {DOSAGE_UNITS.map((u) => (
                        <button key={u} type="button" onClick={() => setEditForm({ ...editForm, dosage_unit: u })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${editForm.dosage_unit === u ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORIES).map(([key, { label, color, icon: Icon }]) => (
                      <button key={key} type="button" onClick={() => setEditForm({ ...editForm, category: key })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${editForm.category === key ? `${color} ring-2 ring-violet-400 ring-offset-1` : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                        <Icon className="h-3 w-3" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium"><Clock className="h-4 w-4 text-violet-500" /> Reminder Times *</Label>
                  {renderTimeSlots(editTimeSlots, editShowTimePicker, setEditShowTimePicker,
                    (i, v) => setEditTimeSlots((ts) => ts.map((s, idx) => idx === i ? v : s)),
                    (i) => setEditTimeSlots((ts) => ts.filter((_, idx) => idx !== i)),
                    () => setEditTimeSlots((ts) => [...ts, "12:00"]))}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Frequency</Label>
                  <div className="flex gap-2">
                    {(["daily", "specific_days", "as_needed"] as const).map((val) => (
                      <button key={val} type="button" onClick={() => setEditForm({ ...editForm, frequency: val })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${editForm.frequency === val ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200/50" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {val === "daily" ? "Every Day" : val === "specific_days" ? "Specific Days" : "As Needed"}
                      </button>
                    ))}
                  </div>
                  {editForm.frequency === "specific_days" && (
                    <div className="flex gap-1.5 pt-1">
                      {DAYS.map((d) => (
                        <button key={d} type="button" onClick={() => toggleEditDay(d)}
                          className={`w-10 h-10 rounded-full text-xs font-semibold transition-all ${editForm.specific_days?.includes(d) ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{d}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-gray-700 font-medium"><CalendarDays className="h-3.5 w-3.5" /> Start Date *</Label>
                    <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-gray-700 font-medium"><CalendarDays className="h-3.5 w-3.5" /> End Date</Label>
                    <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Notes</Label>
                  <Input placeholder="e.g. Take with food" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleUpdate}
                    disabled={editSubmitting || !editForm.medication_name || !editForm.dosage || editTimeSlots.length === 0}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-200/50 flex-1">
                    {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingMed(null)} className="flex-1 rounded-xl">Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== MEDICATION LIST ======== */}
      {medications.length > 0 ? (
        <div className="space-y-3">
          {medications.map((med, i) => {
            const cat = CATEGORIES[med.category] || CATEGORIES.general;
            const CatIcon = cat.icon;
            const isExpired = med.end_date && new Date(med.end_date) < new Date(new Date().toISOString().split("T")[0]);
            return (
              <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`glass-card-hover rounded-2xl border-0 transition-all group ${isExpired ? "opacity-60" : ""} ${med.adherence_status ? "ring-2 ring-emerald-200" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
                          med.adherence_status ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200/50" : `bg-gradient-to-br ${cat.gradient} shadow-${cat.color.split("-")[1] || "gray"}-200/50`
                        }`}>
                          {med.adherence_status ? <Check className="h-5 w-5 text-white" /> : <CatIcon className="h-5 w-5 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900">{med.medication_name}</p>
                            {isExpired && <Badge variant="secondary" className="text-[10px] rounded-lg">Completed</Badge>}
                            {med.adherence_status && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] rounded-lg gap-0.5"><Check className="h-2.5 w-2.5" /> Taken</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs rounded-lg bg-white/60">{med.dosage} {med.dosage_unit || ""}</Badge>
                            <Badge className={`text-[10px] border-0 rounded-lg ${cat.color}`}>{cat.label}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded-lg">
                              <Clock className="h-3 w-3" />{med.time_schedule?.join(", ")}
                            </span>
                            {med.sms_reminders_enabled && (
                              <Badge className="gap-0.5 text-violet-700 bg-violet-100 border-0 text-[10px] rounded-lg"><Bell className="h-2.5 w-2.5" /> SMS On</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                            {med.start_date && (
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{med.start_date}{med.end_date ? `  ${med.end_date}` : "  Ongoing"}</span>
                            )}
                            {med.frequency === "specific_days" && med.specific_days?.length > 0 && <span>{med.specific_days.join(", ")}</span>}
                            {(med.streak || 0) > 0 && (
                              <span className="flex items-center gap-1 text-orange-600 font-semibold"><Flame className="h-3 w-3" /> {med.streak} day streak</span>
                            )}
                          </div>
                          {med.notes && <p className="text-xs text-muted-foreground mt-1 italic">{med.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="ghost" size="icon" title={med.sms_reminders_enabled ? "Disable reminders" : "Enable reminders"}
                          disabled={smsLoading === med.id || (!userPhone && !med.sms_reminders_enabled)}
                          onClick={() => handleToggleSMS(med.id, !med.sms_reminders_enabled)}
                          className={`rounded-xl ${med.sms_reminders_enabled ? "text-violet-600 hover:text-violet-700 hover:bg-violet-50" : "text-gray-400 hover:text-violet-500 hover:bg-violet-50"}`}>
                          {smsLoading === med.id ? <Loader2 className="h-4 w-4 animate-spin" /> : med.sms_reminders_enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </Button>

                        {!isExpired && (
                          med.adherence_status ? (
                            <Button variant="outline" size="sm" onClick={() => handleReset(med.id)} className="gap-1 text-xs rounded-xl"><RotateCcw className="h-3 w-3" /> Undo</Button>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => handleTake(med.id)} className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-xs rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-xl">
                                <Check className="h-3 w-3" /> Taken
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleSkip(med.id)} className="gap-1 text-xs rounded-xl"><SkipForward className="h-3 w-3" /> Skip</Button>
                            </>
                          )
                        )}

                        <Button variant="ghost" size="icon" title="Edit medication" onClick={() => openEditModal(med)} className="rounded-xl text-gray-400 hover:text-violet-600 hover:bg-violet-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id)} className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card rounded-2xl border-0 flex flex-col items-center justify-center h-52 text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 mb-4">
            <Pill className="h-8 w-8 text-violet-400" />
          </div>
          <p className="font-medium">No medications added yet</p>
          <Button variant="link" onClick={() => setShowForm(true)} className="text-violet-600">Add your first medication</Button>
        </Card>
      )}

      {remindersOn > 0 && userPhone && (
        <p className="text-xs text-center text-muted-foreground pb-4">
          {remindersOn} medication{remindersOn > 1 ? "s" : ""} with active reminders  {userPhone}
        </p>
      )}
    </div>
  );
}