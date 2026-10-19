import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthNavButtons } from "@/components/auth-nav-buttons";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 text-center text-foreground">
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
