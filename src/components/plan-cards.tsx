"use client";

import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen, Check, Crown, Layers, Minus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const comparison = [
  { feature: "Create decks", free: "Up to 3 decks", pro: "Unlimited decks" },
  { feature: "Flip, quiz, and type", free: true, pro: true },
  { feature: "Spaced repetition", free: true, pro: true },
  { feature: "Streaks and mastery", free: true, pro: true },
  { feature: "AI flashcard generation", free: false, pro: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <>{value}</>;
  return value ? (
    <Check className="size-4 text-primary" aria-label="Included" />
  ) : (
    <Minus
      className="size-4 text-muted-foreground"
      aria-label="Not included"
    />
  );
}

function ComparePlansButton() {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" className="w-full" />}
      >
        Compare plans
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Free vs Pro</DialogTitle>
          <DialogDescription>
            See what you get with each plan. Monthly and yearly prices are on
            the pricing page.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Free</TableHead>
              <TableHead>Pro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.map((row) => (
              <TableRow key={row.feature}>
                <TableCell className="font-medium">{row.feature}</TableCell>
                <TableCell>
                  <Cell value={row.free} />
                </TableCell>
                <TableCell>
                  <Cell value={row.pro} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button nativeButton={false} render={<Link href="/pricing" />}>
            View pricing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlanCards() {
  return (
    <section id="pricing" className="grid w-full scroll-mt-24 gap-4 text-left sm:grid-cols-2">
      <Card>
        <CardHeader>
          <Badge variant="outline">
            <BookOpen />
            Free
          </Badge>
          <CardTitle className="mt-2 flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Up to 3 decks
          </CardTitle>
          <CardDescription>$0 per month, forever.</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Create up to 3 decks and study with flip cards, quizzes, typed
            answers, and spaced repetition.
          </CardDescription>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <SignUpButton mode="modal">
            <Button className="w-full">Get Started Free</Button>
          </SignUpButton>
          <ComparePlansButton />
        </CardFooter>
      </Card>

      <Card className="ring-2 ring-primary">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge>Most Popular</Badge>
            <Badge variant="outline">
              <Crown />
              Pro
            </Badge>
          </div>
          <CardTitle className="mt-2 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Unlimited decks
          </CardTitle>
          <CardDescription>Monthly or yearly billing.</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Everything in Free, with no deck cap and AI flashcards generated
            from notes you paste. Current prices are on the pricing page.
          </CardDescription>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            Upgrade to Pro
          </Button>
          <ComparePlansButton />
        </CardFooter>
      </Card>
    </section>
  );
}
