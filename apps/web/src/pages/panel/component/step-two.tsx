import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CircleChevronLeft, User } from "lucide-react";
import { Field } from "./field";
import { Input } from "./input";
import { step2Schema, type Step2FormData } from "./schemas";
import type { Step2Form } from "../register-schoolpage";

const StepTwo = ({
  form,
  onNext,
  onBack,
  schoolName,
}: {
  form: Step2Form;
  onNext: (data: Step2Form) => void;
  onBack: () => void;
  schoolName: string;
}) => {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: yupResolver(step2Schema) as any,
    defaultValues: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      roleDescription: form.roleDescription,
      username: form.username,
      secretPhrase: form.secretPhrase,
      phraseAnswer: form.phraseAnswer,
      acknowledged: form.acknowledged,
    },
    mode: "onChange",
  });

  const watchedAck = watch("acknowledged");

  const onSubmit = (data: Step2FormData) => {
    onNext({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? "",
      roleDescription: data.roleDescription ?? "",
      username: data.username,
      secretPhrase: data.secretPhrase,
      phraseAnswer: data.phraseAnswer,
      acknowledged: data.acknowledged ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold font-space-grotesk text-gray-800">Create admin credentials</h2>
        <p className="text-xs font-space-grotesk text-gray-400 mt-1">
          This account will have full administrative control over your school. You can add other users and roles later from the dashboard.
        </p>
      </div>

      {/* Personal Identity */}
      <div className="flex flex-col gap-4">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">Personal Identity</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" required error={errors.firstName?.message}>
            <Input
              placeholder="eg Amara"
              value={watch("firstName")}
              onChange={(v) => setValue("firstName", v, { shouldValidate: true })}
              error={!!errors.firstName}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName?.message}>
            <Input
              placeholder="eg Bob"
              value={watch("lastName")}
              onChange={(v) => setValue("lastName", v, { shouldValidate: true })}
              error={!!errors.lastName}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email address" required error={errors.email?.message}>
            <Input
              placeholder="eg amarabob@blutthub.com"
              type="email"
              value={watch("email")}
              onChange={(v) => setValue("email", v, { shouldValidate: true })}
              error={!!errors.email}
            />
          </Field>
          <Field label="Phone" optional>
            <Input
              placeholder="+234 9000 0000 00"
              type="tel"
              value={watch("phone") ?? ""}
              onChange={(v) => setValue("phone", v)}
            />
          </Field>
        </div>

        <Field label="Role description" optional>
          <Input
            placeholder="eg super admin, head-teacher and principal"
            value={watch("roleDescription") ?? ""}
            onChange={(v) => setValue("roleDescription", v)}
          />
        </Field>

        <Field label="Username" required error={errors.username?.message}>
          <Input
            placeholder="eg amara.bop"
            icon={<User size={13} />}
            value={watch("username")}
            onChange={(v) => setValue("username", v, { shouldValidate: true })}
            error={!!errors.username}
          />
        </Field>
      </div>

      <div className="h-px bg-gray-100" />

      {/* School attachment */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">School attachment</p>
        <Field label="Attach admin to school" required>
          <Input
            placeholder={schoolName || "Greenwood College"}
            icon={<User size={13} />}
            value={schoolName}
            onChange={() => {}}
          />
        </Field>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Secret phrase */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">Secret phrase &amp; answer</p>
        <p className="text-xs text-gray-400">
          Your secret phrase is used instead of a password to verify your identity. Generate one automatically or write your own — then set a personal answer only you know. Keep both safe.
        </p>

        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-normal text-[#4F61E8] flex items-center gap-1.5">🔐 Secret phrase &amp; answer</p>

          <Field label="Write your own question" required hint="Use a word or phrase that is meaningful to you but hard for others to guess" error={errors.secretPhrase?.message}>
            <Input
              placeholder="e.g. type your Secret Phrase"
              value={watch("secretPhrase")}
              onChange={(v) => setValue("secretPhrase", v, { shouldValidate: true })}
              error={!!errors.secretPhrase}
            />
          </Field>

          <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-[11px] text-gray-400 leading-relaxed">
            Think of a question — your answer is your secret phrase.<br />
            If your phrase is "river stones" then your answer could be something different.<br />
            The answer will be shown verbatim to verify you during sign-ins and recovery.
          </div>

          <Field label="Set your phrase answer" required error={errors.phraseAnswer?.message}>
            <Input
              placeholder="Enter your answer"
              value={watch("phraseAnswer")}
              onChange={(v) => setValue("phraseAnswer", v, { shouldValidate: true })}
              error={!!errors.phraseAnswer}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={watchedAck}
              onChange={(e) => setValue("acknowledged", e.target.checked, { shouldValidate: true })}
              className="mt-0.5 accent-[#4F61E8]"
            />
            <span className="text-[11px] text-gray-500">
              I have saved my secret phrase &amp; answer<br />
              <span className="text-gray-400">I understand this cannot be recovered if lost</span>
            </span>
          </label>
          {errors.acknowledged && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 ml-5">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {errors.acknowledged.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 flex items-center gap-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <CircleChevronLeft /> Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-[#292382] hover:bg-indigo-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors text-sm"
        >
          Continue to Approval
        </button>
      </div>
    </form>
  );
};

export default StepTwo;
