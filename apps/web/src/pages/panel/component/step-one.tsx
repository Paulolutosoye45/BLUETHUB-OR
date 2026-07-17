import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { User } from "lucide-react";
import { Field } from "./field";
import { Input } from "./input";
import { Combobox } from "./combobox";
import LogoUpload from "./logo-upload";
import { step1Schema, type Step1FormData } from "./schemas";
import type { Step1Form } from "../register-schoolpage";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@bluethub/ui-kit";
import { ChevronDown } from "lucide-react";

interface CountryEntry {
    country: string;
    cities: string[];
}

const BRANCH_OPTIONS = [
    "Yes",
    "No"
];

const StepOne = ({
    form,
    onNext,
}: {
    form: Step1Form;
    onNext: (data: Step1Form) => void;
}) => {
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
    const [states, setStates] = useState<{ label: string; value: string }[]>([]);
    const [countriesData, setCountriesData] = useState<CountryEntry[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(true);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Step1FormData>({
        resolver: yupResolver(step1Schema) as any,
        defaultValues: {
            schoolName: form.schoolName,
            schoolLogo: form.schoolLogo,
            schoolAddress: form.schoolAddress,
            country: form.country,
            state: form.state,
            city: form.city,
            branch: form.branch,
        },
        mode: "onChange",
    });

    const watchedCountry = watch("country");
    const watchedLogo = watch("schoolLogo");
    const watchedState = watch("state");

    // Fetch countries + cities on mount
    useEffect(() => {
        setCountriesLoading(true);
        fetch("https://countriesnow.space/api/v0.1/countries")
            .then((r) => r.json())
            .then((res: { data: CountryEntry[] }) => {
                const sorted = res.data
                    .map((c) => ({ label: c.country, value: c.country }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                setCountries(sorted);
                setCountriesData(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch countries:", err);
                const fallback: CountryEntry[] = [
                    { country: "Nigeria", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna", "Enugu"] },
                    { country: "Ghana", cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Tema", "Cape Coast"] },
                    { country: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"] },
                    { country: "South Africa", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"] },
                    { country: "United States", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"] },
                    { country: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool"] },
                ];
                setCountries(fallback.map((c) => ({ label: c.country, value: c.country })));
                setCountriesData(fallback);
            })
            .finally(() => setCountriesLoading(false));
    }, []);

    // Derive cities (as state options) when country changes
    useEffect(() => {
        if (!watchedCountry) {
            setStates([]);
            return;
        }

        const entry = countriesData.find((c) => c.country === watchedCountry);
        if (entry?.cities?.length) {
            setStates(
                entry.cities
                    .map((c) => ({ label: c, value: c }))
                    .sort((a, b) => a.label.localeCompare(b.label))
            );
        } else {
            setStates([]);
        }

        // Reset state when country changes
        setValue("state", "", { shouldValidate: true });
    }, [watchedCountry, countriesData, setValue]);

    const onSubmit = (data: Step1FormData) => {
        onNext({
            schoolName: data.schoolName,
            schoolLogo: (data.schoolLogo as File | null) ?? null,
            schoolAddress: data.schoolAddress,
            country: data.country,
            state: data.state,
            city: data.city ?? "",
            branch: data.branch ?? "",
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div>
                <h2 className="text-xl font-bold text-gray-800 font-space-grotesk">Tell us about your school</h2>
                <p className="text-xs text-[#3A3A3A] mt-1 font-space-grotesk">
                    This information will appear on your school's Bleutthub profile and help us set up your account correctly
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">School Identity</p>

                <Field label="School Name" required error={errors.schoolName?.message}>
                    <Input
                        placeholder="eg GreenWood College"
                        icon={<User size={13} />}
                        value={watch("schoolName")}
                        onChange={(v) => setValue("schoolName", v, { shouldValidate: true })}
                        error={!!errors.schoolName}
                    />
                </Field>

                <Field label="School Logo" optional error={errors.schoolLogo?.message}>
                    <LogoUpload
                        value={(watchedLogo as File | null) ?? null}
                        onChange={(f) => setValue("schoolLogo", f, { shouldValidate: true })}
                    />
                </Field>

                <Field label="School address" required error={errors.schoolAddress?.message}>
                    <Input
                        placeholder="eg Street address, building name"
                        value={watch("schoolAddress")}
                        onChange={(v) => setValue("schoolAddress", v, { shouldValidate: true })}
                        error={!!errors.schoolAddress}
                    />
                </Field>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex flex-col gap-4">
                <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">Location details</p>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Country" required error={errors.country?.message}>
                        <Combobox
                            options={countries}
                            value={watchedCountry}
                            onChange={(v) => setValue("country", v, { shouldValidate: true })}
                            placeholder={countriesLoading ? "Loading countries..." : "Select country..."}
                            searchPlaceholder="Search countries..."
                            emptyText="No country found."
                            disabled={countriesLoading}
                        />
                    </Field>
                    <Field label="State/Province" required error={errors.state?.message}>
                        <Combobox
                            options={states}
                            value={watchedState}
                            onChange={(v) => setValue("state", v, { shouldValidate: true })}
                            placeholder={!watchedCountry ? "Select a country first" : "Select or type state..."}
                            searchPlaceholder="Search states..."
                            emptyText="Type to enter a state."
                            allowCustom
                        />
                    </Field>
                </div>

                <Field label="Location (City / Area)" optional>
                    <Input
                        placeholder="eg Victoria Island / Ikeja"
                        value={watch("city") ?? ""}
                        onChange={(v) => setValue("city", v)}
                    />
                </Field>

                <Field label="School branch" optional>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className={`w-full flex h-10 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F61E8]/20 focus:border-[#4F61E8]
                  ${watch("branch") ? "text-gray-700" : "text-gray-300"}`}
                            >
                                <span className="truncate">{watch("branch") || "Select a branch..."}</span>
                                <ChevronDown size={14} className="shrink-0 opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                            align="start"
                        >
                            {BRANCH_OPTIONS.map((branch) => (
                                <DropdownMenuItem
                                    key={branch}
                                    onSelect={() => setValue("branch", branch)}
                                    className={watch("branch") === branch ? "bg-indigo-50 text-[#292382] font-semibold" : ""}
                                >
                                    {branch}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Field>
            </div>

            <button
                type="submit"
                className="w-full bg-[#292382] hover:bg-indigo-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md font-space-grotesk transition-colors text-sm"
            >
                Continue to account setup
            </button>
        </form>
    );
};

export default StepOne;
