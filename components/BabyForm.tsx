"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/LanguageProvider";
import type { Baby } from "@/app/api/babies/route";

const ALLERGENS = ["Egg", "Dairy", "Peanut", "Tree Nuts", "Wheat", "Soy", "Fish", "Shellfish"];

interface BabyFormProps {
  baby?: Baby;
  onClose?: () => void;
}

export function BabyForm({ baby, onClose }: BabyFormProps) {
  const t = useLanguage();
  const router = useRouter();
  const [name, setName] = useState(baby?.name ?? "");
  const [birthDate, setBirthDate] = useState(baby?.birth_date ?? "");
  const [dietType, setDietType] = useState(baby?.diet_type ?? "all");
  const [allergies, setAllergies] = useState<string[]>(baby?.allergies ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleAllergen(item: string) {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { name, birth_date: birthDate, diet_type: dietType, allergies };
    const url = baby ? `/api/babies/${baby.id}` : "/api/babies";
    const method = baby ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t.somethingWrong);
      setLoading(false);
      return;
    }

    router.refresh();
    onClose?.();
    setLoading(false);
  }

  async function handleDelete() {
    if (!baby) return;
    if (!confirm(t.removeConfirm(baby.name))) return;
    await fetch(`/api/babies/${baby.id}`, { method: "DELETE" });
    router.refresh();
    onClose?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          {t.babyName}
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.babyNamePlaceholder}
          required
          className="rounded-2xl border-border"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          {t.dateOfBirth}
        </label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          className="rounded-2xl border-border"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          {t.dietaryStyle}
        </label>
        <Select value={dietType} onValueChange={(v) => v && setDietType(v)}>
          <SelectTrigger className="rounded-2xl border-border bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-max">
            <SelectItem value="all">{t.diets.all}</SelectItem>
            <SelectItem value="pescatarian">{t.diets.pescatarian}</SelectItem>
            <SelectItem value="lacto-ovo">{t.diets["lacto-ovo"]}</SelectItem>
            <SelectItem value="lacto">{t.diets.lacto}</SelectItem>
            <SelectItem value="ovo">{t.diets.ovo}</SelectItem>
            <SelectItem value="vegan">{t.diets.vegan}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          {t.allergiesLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAllergen(a)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                allergies.includes(a)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {t.allergens[a as keyof typeof t.allergens] ?? a}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2 pt-1">
        {baby && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            className="flex-1 rounded-2xl border-destructive text-destructive hover:bg-destructive/5"
          >
            {t.remove}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-2xl bg-primary text-white hover:bg-primary/90"
        >
          {loading ? t.saving : baby ? t.saveChanges : t.addBaby}
        </Button>
      </div>
    </form>
  );
}
