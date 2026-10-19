"use client";

import Link from "next/link";
import { BookOpen, Check, Crown, Layers, Minus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
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
  { feature: "Add flashcards", free: true, pro: true },
  { feature: "Study sessions", free: true, pro: true },
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

function ComparisonDialog({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: React.ReactElement;
}) {
  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={trigger}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Free vs Pro</DialogTitle>
          <DialogDescription>
            See what you get with each plan.
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

const clickableCard = (
  <Card className="cursor-pointer transition-colors hover:bg-muted/50" />
);

export function PlanCards() {
  return (
    <section className="grid w-full gap-4 text-left sm:grid-cols-2">
      <ComparisonDialog trigger={clickableCard}>
        <CardHeader>
          <Badge variant="outline">
            <BookOpen />
            Free
          </Badge>
          <CardTitle className="mt-2 flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Up to 3 decks
          </CardTitle>
          <CardDescription>
            Log in to create up to 3 decks for free and start learning right
            away. Click to compare plans.
          </CardDescription>
        </CardHeader>
      </ComparisonDialog>
      <ComparisonDialog trigger={clickableCard}>
        <CardHeader>
          <Badge>
            <Crown />
            Pro
          </Badge>
          <CardTitle className="mt-2 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Unlimited decks
          </CardTitle>
          <CardDescription>
            Get on a Pro plan to create as many decks as you want, plus
            AI-generated flashcards. Click to compare plans.
          </CardDescription>
        </CardHeader>
      </ComparisonDialog>
    </section>
  );
}
