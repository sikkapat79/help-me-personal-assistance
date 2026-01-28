"use client";

import { useActionState } from "react";

import {
  submitValidationDemo,
  type ValidationDemoFormState,
} from "@/app/_actions/validation-demo";

const initialState: ValidationDemoFormState = {
  ok: false,
  fieldErrors: {},
  values: {
    name: "",
    email: "",
    prompt: "",
  },
};

 function FieldError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function ValidationDemoForm() {
  const [state, action, isPending] = useActionState(
    submitValidationDemo,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      {state.formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.formError}
        </div>
      ) : null}

      {state.ok && state.message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="validation-demo-name"
          className="text-sm font-medium text-zinc-900"
        >
          Name
        </label>
        <input
          id="validation-demo-name"
          name="name"
          defaultValue={state.values?.name ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-zinc-400"
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div>
        <label
          htmlFor="validation-demo-email"
          className="text-sm font-medium text-zinc-900"
        >
          Email
        </label>
        <input
          id="validation-demo-email"
          name="email"
          type="email"
          defaultValue={state.values?.email ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-zinc-400"
          placeholder="jane@example.com"
          autoComplete="email"
        />
        <FieldError message={state.fieldErrors?.email} />
      </div>

      <div>
        <label
          htmlFor="validation-demo-prompt"
          className="text-sm font-medium text-zinc-900"
        >
          Prompt
        </label>
        <textarea
          id="validation-demo-prompt"
          name="prompt"
          defaultValue={state.values?.prompt ?? ""}
          className="mt-1 min-h-28 w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-zinc-400"
          placeholder="Ask something..."
        />
        <FieldError message={state.fieldErrors?.prompt} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Validating..." : "Submit"}
      </button>
    </form>
  );
}

