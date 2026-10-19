"use client";

import { PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MIN_DECK_TEXT_LENGTH } from "@/lib/deck-schema";
import { createDeck } from "./actions";

export function CreateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName("");
      setDescription("");
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createDeck({ name, description });
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Create New Deck
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Give your deck a name and a description, each at least {MIN_DECK_TEXT_LENGTH} characters. The AI card generator uses them.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-deck-name">Deck Name</Label>
            <Input
              id="new-deck-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={MIN_DECK_TEXT_LENGTH}
              maxLength={255}
              required
              autoFocus
              aria-invalid={error ? true : undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-deck-description">Deck Description</Label>
            <Textarea
              id="new-deck-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={MIN_DECK_TEXT_LENGTH}
              maxLength={2000}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={
                isPending ||
                name.trim().length < MIN_DECK_TEXT_LENGTH ||
                description.trim().length < MIN_DECK_TEXT_LENGTH
              }>
              {isPending ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
