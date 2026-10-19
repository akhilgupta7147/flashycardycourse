import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <Card className="mb-10 w-full max-w-xl">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            This is a fun learning app created by Akhil Gupta while learning
            Vibecoding with Cursor.ai.
          </CardDescription>
        </CardHeader>
      </Card>
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">
        FlashyCardy
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Your personal flashcard platform
      </p>
      <div className="mt-8 flex items-center justify-center gap-2">
        <AuthNavButtons />
      </div>
    </main>
  );
}
