import { Link } from "react-router-dom";

import { useState } from "react";
import { Check, ChevronDown, Clock4 } from "lucide-react";
import {
  Label,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from "@bluethub/ui-kit";
import TitleBar from "@/shared/title-bar";

const Scheduleclass = () => {
  const [selectClass, setSelectClass] = useState<string>("");
  const [selectSubject, setSelectSubject] = useState<string>("");
  const [tutor, setTutor] = useState<string>("");
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isTutorDropdownOpen, setTutorsDropdownOpen] = useState(false);

  const classes = [
    { label: "JSS 1 PEACE" },
    { label: "JSS 2 UNITY" },
    { label: "JSS 3 LOVE" },
  ];

  const subjects = [
    { label: "BASIC TECH" },
    { label: "PHYSICS" },
    { label: "TECHNICAL D." },
    { label: "IT" },
  ];
  const Tutors = [
    { label: "DR ROY" },
    { label: "MR SAM" },
    { label: "TECHNICAL D." },
    { label: "FELIX TU" },
  ];

  return (
    <div>
      <div>
        <div className="rounded-lg shadow bg-white">
          {/* Header Section */}
         <TitleBar title="Schedule A class" />

          <div className="flex justify-center gap-20 mt-7 px-4 pb-7">
            {/* Left Side - Dropdowns */}
            <div className="space-y-6 w-105">
              {/* Class Dropdown */}
              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base">
                  Class*
                </Label>

                <DropdownMenu onOpenChange={setIsClassDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${selectClass
                          ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                          : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                        } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                    >
                      <span
                        className={
                          selectClass ? "text-chestnut font-semibold" : ""
                        }
                      >
                        {selectClass || "JSS 1 PEACE"}
                      </span>

                      <div
                        className={`transition-transform duration-300 ${isClassDropdownOpen ? "rotate-180" : ""
                          }`}
                      >
                        <ChevronDown className="w-5 h-5 text-chestnut/70" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                    align="start"
                    sideOffset={8}
                  >
                    <DropdownMenuGroup className="space-y-1">
                      {classes.map((classItem) => (
                        <DropdownMenuItem
                          key={classItem.label}
                          className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selectClass === classItem.label
                              ? "bg-chestnut text-white"
                              : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                            }`}
                          onClick={() => {
                            setSelectClass(classItem.label);
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{classItem.label}</span>
                            {selectClass === classItem.label && (
                              <Check className="w-5 h-5 ml-2 text-white" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base">
                  Subject*
                </Label>

                <DropdownMenu onOpenChange={setIsSubjectDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${selectSubject
                          ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                          : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                        } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                    >
                      <span
                        className={
                          selectSubject ? "text-chestnut font-semibold" : ""
                        }
                      >
                        {selectSubject || "PHYSICS"}
                      </span>

                      <div
                        className={`transition-transform duration-300 ${isSubjectDropdownOpen ? "rotate-180" : ""
                          }`}
                      >
                        <ChevronDown className="w-5 h-5 text-chestnut/70" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                    align="start"
                    sideOffset={8}
                  >
                    <DropdownMenuGroup className="space-y-1">
                      {subjects.map((subject) => (
                        <DropdownMenuItem
                          key={subject.label}
                          className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selectSubject === subject.label
                              ? "bg-chestnut text-white"
                              : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                            }`}
                          onClick={() => {
                            setSelectSubject(subject.label);
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{subject.label}</span>
                            {selectSubject === subject.label && (
                              <Check className="w-5 h-5 ml-2 text-white" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* tutor */}
              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base">
                  Tutor*
                </Label>

                <DropdownMenu onOpenChange={setTutorsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${tutor
                          ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                          : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                        } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                    >
                      <span
                        className={tutor ? "text-chestnut font-semibold" : ""}
                      >
                        {tutor || "DR ROY"}
                      </span>

                      <div
                        className={`transition-transform duration-300 ${isTutorDropdownOpen ? "rotate-180" : ""
                          }`}
                      >
                        <ChevronDown className="w-5 h-5 text-chestnut/70" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                    align="start"
                    sideOffset={8}
                  >
                    <DropdownMenuGroup className="space-y-1">
                      {Tutors.map((tutors) => (
                        <DropdownMenuItem
                          key={tutors.label}
                          className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selectSubject === tutors.label
                              ? "bg-chestnut text-white"
                              : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                            }`}
                          onClick={() => {
                            setTutor(tutors.label);
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{tutors.label}</span>
                            {tutor === tutors.label && (
                              <Check className="w-5 h-5 ml-2 text-white" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="h-[70vh] w-180 rounded-xl bg-white flex flex-col items-center justify-center shadow-lg">
              <Button className="flex items-center justify-center gap-3 font-poppins font-semibold text-xl leading-[27.78px] cursor-pointer px-8 py-7 rounded-lg w-3/4 bg-white border-2 border-chestnut/30 text-chestnut hover:bg-chestnut/10 transition-all duration-200 capitalize">
                <Clock4 className="size-6" />
                <Link to="/teacher/recorded-class/class-submission-portal">Live Class</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduleclass;
