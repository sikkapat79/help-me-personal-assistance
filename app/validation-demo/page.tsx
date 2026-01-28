import { ValidationDemoForm } from "./ValidationDemoForm";

export default function ValidationDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          Server Action Validation Demo
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          This form validates on the server with Zod and returns field errors.
        </p>

        <div className="mt-6">
          <ValidationDemoForm />
        </div>
      </div>
    </div>
  );
}

