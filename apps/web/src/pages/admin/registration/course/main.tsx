import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label,
  Button,
  RadioGroup,
  RadioGroupItem,
} from "@bluethub/ui-kit";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { ClassCategory, type course, type SubjectType } from "@/utils/constant";
import { localData } from "@/utils";
import { adminService } from "@/services/admin";
import type { SchoolInfo } from "@/services";
import Tabs from "@/component/tabs";
import toast from "react-hot-toast";

const SUBJECT_TYPE_OPTIONS = [
  { label: "MAJOR", value: 1 as SubjectType },
  { label: "MINOR", value: 2 as SubjectType },
];

const CoursesMain = () => {
  const [selected, setSelected] = useState<SubjectType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [courses, setCourses] = useState<course[]>([]);
  const [classType, setClassType] = useState<ClassCategory>(ClassCategory.Primary);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (value: SubjectType) => {
    setSelected(value);
    setIsOpen(false);
  };

  const handleAddToList = () => {
    if (!selected || !subjectName.trim()) return;
    setCourses((prev) => [
      ...prev,
      { category: selected, subject: subjectName.trim(), isActive: true, classCategory: classType },
    ]);
    setSubjectName("");
  };

  const handleSubmit = async () => {
    if (courses.length === 0) {
      toast.error("Add at least one subject before submitting.");
      return;
    }

    const schoolInfo = localData.retrieve<SchoolInfo>("schoolInfo");
    if (!schoolInfo?.id) {
      toast.error("School information missing. Please log in again.");
      return;
    }

    const userRaw = localData.retrieve<{ id: string }>("user");
    if (!userRaw?.id) {
      toast.error("User information missing. Please log in again.");
      return;
    }

    const payload = {
      createdBy: userRaw.id,
      schoolId: schoolInfo.id,
      subjects: courses.map((c) => ({
        subject: c.subject,
        category: c.category,
        isActive: c.isActive,
      })),
    };

    try {
      setSubmitting(true);
      await adminService.addCourses(payload);
      toast.success(`${courses.length} subject(s) registered successfully!`);
      setCourses([]);
      setSelected(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.responseMessage ?? err?.message ?? "Failed to register subjects.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="max-w-7xl mx-auto flex flex-col md:flex-row md:space-x-10 justify-between my-7 md:px-7 pb-7">
        {/* Left Column */}
        <div className="w-full md:w-95.5 relative mb-6 md:mb-0">
          {/* Subject Type */}
          <div className="space-y-3 w-full max-w-105">
            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
              Category
            </Label>
            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`relative ring-2 w-full justify-between font-medium border-0 py-6 px-4 text-base rounded-xl group ${
                    selected
                      ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                      : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                  } hover:ring-chestnut/40 hover:bg-chestnut/5`}
                >
                  <span className={selected ? "text-chestnut font-semibold" : ""}>
                    {selected
                      ? SUBJECT_TYPE_OPTIONS.find((o) => o.value === selected)?.label
                      : "Select subject type"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-chestnut/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuGroup className="space-y-1">
                  {SUBJECT_TYPE_OPTIONS.map(({ label, value }) => (
                    <DropdownMenuItem
                      key={label}
                      className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer ${
                        selected === value
                          ? "bg-chestnut text-white"
                          : "text-chestnut hover:bg-chestnut/10"
                      }`}
                      onClick={() => handleSelect(value)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{label}</span>
                        {selected === value && <Check className="w-5 h-5 ml-2 text-white" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Subject Name */}
          <div>
            <h2 className="text-chestnut text-xl font-medium my-4">Subject Name</h2>
            <input
              placeholder="E.g. Mathematics"
              className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 p-4 text-base rounded-xl shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-semibold outline-none"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddToList()}
            />
          </div>

          {/* Class Category */}
          <div className="py-6 rounded-lg">
            <Label className="text-chestnut font-medium mb-3 block">Class Category</Label>
            <RadioGroup
              value={String(classType)}
              onValueChange={(value) => setClassType(Number(value) as ClassCategory)}
              className="flex gap-4"
            >
              {Object.entries(ClassCategory).map(([label, value]) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem className="text-chestnut" value={String(value)} id={`r${value}`} />
                  <Label className="text-chestnut" htmlFor={`r${value}`}>{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3 justify-end mr-2 my-7">
            <Button
              className="py-4 px-7 cursor-pointer rounded-[10px] hover:opacity-75 bg-[#EC1B2C] border font-poppins font-semibold text-base"
              onClick={handleAddToList}
              disabled={!selected || !subjectName.trim()}
            >
              Add subject
            </Button>
            <Button
              className="py-4 px-7 cursor-pointer rounded-[10px] hover:opacity-75 bg-chestnut border font-poppins font-semibold text-base flex items-center gap-2"
              onClick={handleSubmit}
              disabled={submitting || courses.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save all"
              )}
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:basis-180 shadow-inner">
          <Tabs tabs={courses} selected={selected} />
        </div>
      </section>
    </div>
  );
};

export default CoursesMain;
