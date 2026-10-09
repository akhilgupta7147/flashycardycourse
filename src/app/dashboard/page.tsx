import { currentUser } from "@clerk/nextjs/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your decks</CardTitle>
            <CardDescription>
              You don&apos;t have any flashcard decks yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
