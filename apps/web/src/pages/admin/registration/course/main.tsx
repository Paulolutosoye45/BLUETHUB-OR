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
import { Check, ChevronDown } from "lucide-react";
import { ClassCategory, type course, type SubjectType } from "@/utils/constant";
import Tabs from "@/component/tabs";

const CoursesMain = () => {
  const options = [
    { label: "MAJOR", value: 1 },
    { label: "MINOR", value: 2 },
  ] satisfies { label: string; value: SubjectType }[];
  const [selected, setSelected] = useState<SubjectType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [subjectName, setSubjectName] = useState<string>("");
  const [courses, setCourses] = useState<course[]>([]);
  const [classType, setClassType] = useState<ClassCategory>(ClassCategory.Primary)

  const handleSelect = (value: SubjectType) => {
    setSelected(value);
    setIsOpen(false);
  };

  const status = true;
  const handleCourse = () => {
    if (selected && subjectName.trim()) {
      setCourses((prev) => [
        ...prev,
        { category: selected, subject: subjectName, isActive: status, classCategory: classType },
      ]);
      setSubjectName("");
      // setSelected(null);
    }
  };



  return (
    <div>
      <section className="max-w-7xl mx-auto flex flex-col md:flex-row md:space-x-10 justify-between my-7 md:px-7 pb-7">
        {/* Left Column */}
        <div className="w-full md:w-95.5 relative mb-6 md:mb-0">
          <div className="space-y-3 w-full max-w-105">
            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
              Category
            </Label>

            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${selected
                    ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                    : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                    } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                >
                  <span className={selected ? "text-chestnut font-semibold" : ""}>
                    {selected
                      ? options.find((o) => o.value === selected)?.label
                      : "Select subject type"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-chestnut/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuGroup className="space-y-1">
                  {options.map(({ label, value }) => (
                    <DropdownMenuItem
                      key={label}
                      className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selected === value
                        ? "bg-chestnut text-white"
                        : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                        }`}
                      onClick={() => handleSelect(value)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{label} </span>
                        {selected === value && (
                          <Check className="w-5 h-5 ml-2 text-white" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Subject Name Input */}
          <div>
            <h2 className="text-chestnut  text-xl font-medium my-4">
              Subject Name
            </h2>
            <input
              placeholder="E.g. Mathematics"
              className="relative ring-2 ring-chestnut/40 w-full justify-between font-medium transition-all duration-300 border-0 p-4 text-base rounded-xl group shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-semibold placeholder:font-hand outline-none"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>

          <div className=" py-6 rounded-lg">
            <div>
              <Label className="text-chestnut font-medium mb-3 block">
                Class Category
              </Label>
              <RadioGroup
                value={String(classType)}
                onValueChange={(value) => setClassType(Number(value) as ClassCategory)}
                className="flex"
              >
                {Object.entries(ClassCategory).map(([label, value]) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem className="text-chestnut" value={String(value)} id={`r${value}`} />
                    <Label className="text-chestnut" htmlFor={`r${value}`}>{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <Button
            className="py-4 px-7 cursor-pointer rounded-[10px] float-end mr-2 my-7 hover:opacity-75 hover:bg-[#EC1B2C] bg-[#EC1B2C] border font-poppins font-semibold text-base leading-[18.67px]"
            onClick={handleCourse}
          >
            Add subject{" "}
          </Button>
        </div>

        {/* Right Column (Tabs) */}
        <div className="w-full md:basis-180 shadow-inner">
          <Tabs tabs={courses} selected={selected} />
        </div>
      </section>
    </div>
  );
};

export default CoursesMain;
// PickaTestApp2305$
