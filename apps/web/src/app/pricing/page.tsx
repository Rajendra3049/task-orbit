import { Card } from "@/components/ui/card";

const plans = [
  { name: "Starter", price: "$0", features: ["Tasks", "Projects", "Habits", "Calendar"] },
  { name: "Pro", price: "$9/mo", features: ["AI Assistant", "Advanced analytics", "Priority support"] },
  { name: "Team", price: "$19/user/mo", features: ["Shared workspaces", "Role-based access", "Team dashboards"] },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <Card>
        <h1 className="text-2xl font-semibold">TaskOrbit pricing</h1>
        <p className="mt-2 text-sm text-muted-foreground">Monetization phase scaffold with upgrade-ready plan model.</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="space-y-3">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="text-2xl font-bold">{plan.price}</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </main>
  );
}
