"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveResource, type ActionResult } from "@/lib/actions/resource";
import type { ResourceDef, ResourceField } from "@/lib/resources";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ImageInput } from "@/components/ui/ImageInput";
import { useToast } from "@/components/ui/Toaster";

export function ResourceForm({
  resource,
  record,
}: {
  resource: ResourceDef;
  record?: Record<string, any> | null;
}) {
  const action = saveResource.bind(null, resource.slug);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? "success" : "error", state.message);
    if (state.ok) router.push(`/${resource.slug}`);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="card max-w-2xl space-y-5 p-6">
      {record?.id && <input type="hidden" name="id" value={record.id} />}
      {resource.fields.map((field) => (
        <Field key={field.name} field={field} value={record?.[field.name]} />
      ))}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>{record ? "Save changes" : `Create ${resource.singular.toLowerCase()}`}</SubmitButton>
        <Link href={`/${resource.slug}`} className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ field, value }: { field: ResourceField; value: any }) {
  switch (field.type) {
    case "textarea":
      return (
        <div>
          <label className="label" htmlFor={field.name}>{field.label}</label>
          <textarea id={field.name} name={field.name} defaultValue={value ?? ""} rows={5} className="input resize-y" />
          {field.help && <p className="mt-1 text-xs text-espresso-500">{field.help}</p>}
        </div>
      );
    case "number":
      return (
        <div>
          <label className="label" htmlFor={field.name}>{field.label}</label>
          <input id={field.name} name={field.name} type="number" step="any" defaultValue={value ?? ""} required={field.required} className="input" />
        </div>
      );
    case "switch":
      return <Switch field={field} value={!!value} />;
    case "status":
      return (
        <div>
          <label className="label" htmlFor={field.name}>{field.label}</label>
          <select id={field.name} name={field.name} defaultValue={value === false ? "false" : "true"} className="input">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      );
    case "image":
      return (
        <div>
          <label className="label">{field.label}</label>
          <ImageInput name={field.name} defaultValue={value ?? null} required={field.required} help={field.help} />
        </div>
      );
    default:
      return (
        <div>
          <label className="label" htmlFor={field.name}>{field.label}</label>
          <input id={field.name} name={field.name} type="text" defaultValue={value ?? ""} required={field.required} className="input" />
        </div>
      );
  }
}

function Switch({ field, value }: { field: ResourceField; value: boolean }) {
  const [on, setOn] = useState(value);
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-espresso-500/10 bg-cream px-4 py-3">
      <span className="text-sm font-semibold text-espresso-600">{field.label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" name={field.name} checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-espresso-500/20 transition peer-checked:bg-caramel" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

