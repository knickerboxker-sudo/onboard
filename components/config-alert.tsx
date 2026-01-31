import { describeEnvUsage, type RequiredEnv } from "@/lib/env";

const railwaysSteps = [
  "Open your Railway project → Variables.",
  "Add the missing environment variables.",
  "Redeploy the service once variables are saved."
];

export default function ConfigAlert({
  title,
  description,
  missing
}: {
  title: string;
  description: string;
  missing: RequiredEnv[];
}) {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <div className="mt-5 rounded-2xl border border-border bg-highlight p-4">
        <p className="text-sm font-medium">Missing environment variables</p>
        <ul className="mt-3 space-y-2 text-sm text-ink">
          {missing.map((key) => (
            <li key={key} className="flex flex-col gap-1">
              <code className="w-fit rounded bg-white px-2 py-1 text-xs font-semibold text-ink shadow-sm">
                {key}
              </code>
              <span className="text-xs text-muted">{describeEnvUsage(key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium">Next steps</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          {railwaysSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
