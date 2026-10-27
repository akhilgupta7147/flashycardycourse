import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-center text-2xl font-semibold sm:text-3xl tracking-tight text-foreground">
        Pricing
      </h1>
      <p className="mt-2 mb-8 text-center text-muted-foreground">
        Choose a monthly or yearly plan. Prices come from billing.
      </p>
      <PricingTable />
    </main>
  );
}
