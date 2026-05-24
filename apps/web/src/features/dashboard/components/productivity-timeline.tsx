import { Card } from "@/components/ui/card";

const slots = [
  { period: "Morning", item: "Deep work block · 90 min" },
  { period: "Afternoon", item: "Project check-in and planning" },
  { period: "Evening", item: "Habit routine and reflection" },
];

export function ProductivityTimeline() {
  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Productivity timeline</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {slots.map((slot) => (
          <div key={slot.period} className="rounded-2xl border border-border bg-surface-elevated p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{slot.period}</p>
            <p className="mt-2 text-sm">{slot.item}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
