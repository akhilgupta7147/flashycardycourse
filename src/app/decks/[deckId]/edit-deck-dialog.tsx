"use client";

import { PencilIcon } from "lucide-react";
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
import { updateDeck } from "./actions";

export function EditDeckDialog({
  deckId,
  name,
  description,
}: {
  deckId: number;
  name: string;
  description: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(name);
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setTitle(name);
      setDescriptionValue(description ?? "");
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateDeck({
        deckId,
        name: title,
        description: descriptionValue,
      });
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <PencilIcon data-icon="inline-start" />
        Edit
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Edit deck</DialogTitle>
            <DialogDescription>
              Change the title and description of this deck. Both are required and must be at least {MIN_DECK_TEXT_LENGTH} characters.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deck-title">Title</Label>
            <Input
              id="deck-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={MIN_DECK_TEXT_LENGTH}
              maxLength={255}
              required
              autoFocus
              aria-invalid={error ? true : undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deck-description">Description</Label>
            <Textarea
              id="deck-description"
              value={descriptionValue}
              onChange={(event) => setDescriptionValue(event.target.value)}
              minLength={MIN_DECK_TEXT_LENGTH}
              maxLength={2000}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={
                isPending ||
                title.trim().length < MIN_DECK_TEXT_LENGTH ||
                descriptionValue.trim().length < MIN_DECK_TEXT_LENGTH
              }>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
