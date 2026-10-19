"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createCard, updateCard } from "./actions";

type CardDialogProps =
  | {
      mode: "create";
      deckId: number;
      /** When set, the trigger is disabled and this explains why. */
      disabledReason?: string;
    }
  | {
      mode: "edit";
      deckId: number;
      card: { id: number; front: string; back: string };
    };

export function CardDialog(props: CardDialogProps) {
  const { deckId } = props;
  const initialFront = props.mode === "edit" ? props.card.front : "";
  const initialBack = props.mode === "edit" ? props.card.back : "";

  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setFront(initialFront);
      setBack(initialBack);
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result =
        props.mode === "edit"
          ? await updateCard({ deckId, cardId: props.card.id, front, back })
          : await createCard({ deckId, front, back });
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  const isEdit = props.mode === "edit";

  if (props.mode === "create" && props.disabledReason) {
    return (
      <Tooltip>
        {/* Disabled buttons don't receive hover, so the span is the trigger. */}
        <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
          <Button variant="outline" disabled>
            <PlusIcon data-icon="inline-start" />
            Add card
          </Button>
        </TooltipTrigger>
        <TooltipContent>{props.disabledReason}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {isEdit ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <PencilIcon data-icon="inline-start" />
          Edit
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="outline" />}>
          <PlusIcon data-icon="inline-start" />
          Add card
        </DialogTrigger>
      )}
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit card" : "Add card"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the front and back of this card. Editing a card resets its learned status."
                : "Add a new card to this deck."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`card-front-${isEdit ? props.card.id : "new"}`}>
              Front
            </Label>
            <Textarea
              id={`card-front-${isEdit ? props.card.id : "new"}`}
              value={front}
              onChange={(event) => setFront(event.target.value)}
              maxLength={2000}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`card-back-${isEdit ? props.card.id : "new"}`}>
              Back
            </Label>
            <Textarea
              id={`card-back-${isEdit ? props.card.id : "new"}`}
              value={back}
              onChange={(event) => setBack(event.target.value)}
              maxLength={2000}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || !front.trim() || !back.trim()}
            >
              {isPending ? "Saving..." : isEdit ? "Save" : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
