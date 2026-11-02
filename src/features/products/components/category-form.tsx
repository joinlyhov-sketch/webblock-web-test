"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { Add, Category } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategoryAction } from "../actions";
import { categoryNameError, PRODUCT_LIMITS } from "../schemas";
import { ProductDialogHeader } from "./product-parts";

const fieldClasses = "h-[38px] rounded-xl px-3 text-sm";
/** Anything that isn't a letter, a space or & ' - (the full rule is in `schemas.ts`). */
const BAD_CHARACTER = /[^\p{L}\p{M} &'’-]/u;

/** Sends one category name to the server; keeps the pending state and the field error. */
function useCreateCategory(websiteId: string, onAdded: (name: string) => void) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(name: string, after?: () => void) {
    // Same rules as the server, checked here first so the message shows without a round trip.
    const problem = categoryNameError(name);
    if (problem) {
      setError(problem);
      return;
    }
    const formData = new FormData();
    formData.set("name", name);
    startTransition(async () => {
      const result = await createCategoryAction(websiteId, formData);
      if (result.ok) {
        setError(null);
        onAdded(result.data);
        toast.success("Category added", result.message);
        after?.();
      } else {
        setError(result.fieldErrors?.name?.[0] ?? result.message);
      }
    });
  }

  /** While typing, only flag characters that can never be used (digits, emoji, symbols). */
  function check(name: string) {
    setError(BAD_CHARACTER.test(name) ? "Use letters only. Spaces, & and - between words are fine." : null);
  }

  return { add, check, pending, error, clearError: () => setError(null) };
}

/** "New category" popup body, opened from the Products toolbar. */
export function NewCategoryForm({
  websiteId,
  onAdded,
  onDone,
}: {
  websiteId: string;
  onAdded: (name: string) => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const { add, check, pending, error } = useCreateCategory(websiteId, onAdded);

  return (
    <form
      noValidate
      className="p-[22px]"
      onSubmit={(event) => {
        event.preventDefault();
        add(name, onDone);
      }}
    >
      <ProductDialogHeader
        icon={<Category variant="Outline" />}
        title="New category"
        subtitle="Categories become the filter tabs on your website."
        onClose={onDone}
      />
      <div className="border-b border-border py-4">
        <label htmlFor="category-name" className="block pb-1.5 text-[13px] leading-5 font-semibold text-foreground">
          Category name
        </label>
        <Input
          id="category-name"
          value={name}
          maxLength={PRODUCT_LIMITS.category}
          autoFocus
          placeholder="e.g. Wedding flowers"
          onChange={(event) => {
            setName(event.target.value);
            check(event.target.value);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "category-name-error" : undefined}
          className={fieldClasses}
        />
        {error && (
          <p id="category-name-error" role="alert" className="pt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 pt-4">
        <Button variant="secondary" size="sm" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="shadow-upload" loading={pending}>
          Create category
        </Button>
      </div>
    </form>
  );
}

/**
 * Inside the product form: a "New category" link that turns into a name field and an Add button.
 * It is not a nested form, so Enter adds the category instead of saving the product.
 */
export function InlineCategoryCreator({
  websiteId,
  hasCategories,
  onAdded,
}: {
  websiteId: string;
  /** With no categories yet the field is always shown: a product can't be saved without one. */
  hasCategories: boolean;
  onAdded: (name: string) => void;
}) {
  const [opened, setOpen] = useState(false);
  const open = opened || !hasCategories;
  const canCancel = hasCategories;
  const [name, setName] = useState("");
  const { add, check, pending, error, clearError } = useCreateCategory(websiteId, onAdded);

  function submit() {
    add(name, () => {
      setName("");
      setOpen(false);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter adds the category; without this it would submit (save) the product form around it.
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 inline-flex items-center gap-1 rounded-md text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <Add variant="Outline" aria-hidden className="size-3.5" /> New category
      </button>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <Input
          aria-label="New category name"
          value={name}
          maxLength={PRODUCT_LIMITS.category}
          autoFocus={opened}
          placeholder="New category name"
          onChange={(event) => {
            setName(event.target.value);
            check(event.target.value);
          }}
          onKeyDown={onKeyDown}
          aria-invalid={!!error}
          aria-describedby={error ? "inline-category-error" : undefined}
          className={fieldClasses}
        />
        <Button variant="soft" size="sm" onClick={submit} loading={pending} className="h-[38px] shrink-0 rounded-xl">
          Add
        </Button>
        {canCancel && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel new category"
            onClick={() => {
              setOpen(false);
              clearError();
            }}
            className="shrink-0"
          >
            <Add variant="Outline" aria-hidden className="rotate-45" />
          </Button>
        )}
      </div>
      {error && (
        <p id="inline-category-error" role="alert" className="pt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
