import { useState } from "react";
import { User, Clock } from "lucide-react";

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
        {optional && (
          <span className="text-slate-400"> (optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}


export default function CreateAdmin({ onNext, onPrev }: { onNext: () => void , onPrev: () => void}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      {/* Right panel - form */}
      <div className="">
        <div className="mx-auto max-w-xl">
          <h2 className="text-xl font-bold text-slate-900">
            Create admin credentials
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            This account will have full administrative control over your
            school. You can add other users and roles later from the
            dashboard.
          </p>

          {/* Personal identity */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700">
              Personal identity
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First Name" required>
                <input
                  type="text"
                  placeholder="eg. amara"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  type="text"
                  placeholder="eg Bob"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </Field>

              <Field label="Email address" required>
                <input
                  type="email"
                  placeholder="eg. amarabob@bluthub.com"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
              <Field label="Phone" optional>
                <input
                  type="tel"
                  placeholder="+234 9000 0000 00"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Role description" optional>
                <input
                  type="text"
                  placeholder="eg super admin, head-teacher and principal"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Username" required>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                  <User size={15} className="shrink-0 text-slate-400" />
                  <input
                    type="text"
                    placeholder="eg amara.bop"
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </Field>
            </div>
          </div>

          <hr className="my-8 border-slate-100" />

          {/* School attachment */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              School attachment
            </h3>
            <div className="mt-4">
              <Field label="Attach admin to school" required>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                  <User size={15} className="shrink-0 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Greenwood College"
                    defaultValue="Greenwood College"
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Secret phrase & answer */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700">
              Secret phrase &amp; answer
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Your secret phrase is used instead of a password to verify your
              identity. Generate one automatically or write your own — then
              set a personal answer only you know. Keep both safe.
            </p>

            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                <Clock size={13} />
                Secret phrase &amp; answer
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Write your own question <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. type your Secret Phrase"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                  Use a sentence or phrase that is meaningful to you but hard
                  for others to guess.
                </p>
              </div>

              <div className="mt-4 rounded-lg bg-white p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Set your phrase answer <span className="text-rose-500">*</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  Think of your phrase as a question — your answer is your
                  secret. For example, if your phrase is &quot;river amber
                  falcon&quot;, your answer could be something personal you
                  associate with it. This is used to verify you during login
                  and recovery.
                </p>
                <input
                  type="text"
                  placeholder="Enter your  answer"
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <label className="mt-6 flex items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
            />
            <span>
              I have saved my secret phrase &amp; answer
              <br />
              <span className="text-xs text-slate-400">
                I understand this cannot be recovered if lost.
              </span>
            </span>
          </label>

          <div className="mt-8 flex justify-end gap-3 pb-10">
            <button
            onClick={onPrev}
              type="button"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!confirmed}
              className="rounded-lg bg-indigo-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
