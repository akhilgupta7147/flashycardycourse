import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
        Pricing
      </h1>
      <p className="mt-2 mb-8 text-center text-muted-foreground">
        Choose the plan that fits how you study.
      </p>
      <PricingTable />
    </main>
  );
}
