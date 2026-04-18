import { useRef, useState } from "react";
import { EllipsisVertical, Camera, PlusIcon, CircleAlert, CalendarIcon } from "lucide-react";
import { format } from "date-fns"
import { Calendar, Input, Label, Popover, PopoverContent, PopoverTrigger } from "@bluethub/ui-kit";
import { cn } from "@/lib/utils";


const Enrollment = () => {
    // const [fileName, setFileName] = useState<string | null>(null);
    // const [dragActive, setDragActive] = useState(false);
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [classDialogOpen, setClassDialogOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [successfully, setSuccessfully]=useState(false)

    const handleClick = () => fileRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoPreview(URL.createObjectURL(file));
    };

    // const handleDrag = (e: React.DragEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     setDragActive(e.type === "dragenter" || e.type === "dragover");
    // };

    // const handleDrop = (e: React.DragEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     setDragActive(false);
    //     if (e.dataTransfer.files?.[0]) {
    //         setFileName(e.dataTransfer.files[0].name);
    //     }

    // };

    return (
        <>
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/70  overflow-hidden">
                <div
                    className="flex items-center justify-between px-5 h-12 sticky top-0 z-30 bg-chestnut">
                    <div className="flex items-center gap-2.5">
                        {/* Grid icon */}
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                        </svg>
                        <span className="text-white font-semibold text-sm">Register Subject</span>
                    </div>
                    <EllipsisVertical />
                </div>

                {successfully ? (
                    <StudentRegisteredSuccessfully  setSuccessfully={setSuccessfully}/>
                    ) : (
                <div className="bg-white/35 backdrop-blur-sm px-8 pb-8 pt-6">

                    {/* Step badge */}
                    <div className="inline-flex items-center gap-2 bg-chestnut/8 rounded-full pl-1.5 pr-3 py-1 mb-5">
                        <span className="w-5 h-5 rounded-full bg-chestnut text-white text-[10px] font-bold flex items-center justify-center">
                            1
                        </span>
                        <span className="text-[11px] font-bold text-chestnut tracking-wide uppercase">
                            Personal Information
                        </span>
                    </div>

                    {/* ── Avatar ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-4 pb-5 border-b border-chestnut/10 mb-6">
                        <div
                            onClick={handleClick}
                            className="relative w-[72px] h-[72px] rounded-full border-[2.5px] border-chestnut bg-chestnut/5 flex items-center justify-center cursor-pointer group overflow-hidden flex-shrink-0"
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-7 h-7 text-chestnut/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="text-white w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-chestnut mb-0.5">Profile Picture</h3>
                            <p className="text-xs text-gray-400">JPG or PNG · max 2MB · passport-style photo</p>
                            <span className="mt-1.5 inline-block text-[10px] font-bold text-chestnut bg-chestnut/8 border border-chestnut/20 rounded-full px-3 py-0.5 tracking-wide uppercase">
                                Click to upload
                            </span>
                        </div>
                        <input
                            type="file"
                            ref={fileRef}
                            accept="image/png, image/jpeg"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="w-[766px] mx-auto space-y-2.5 mt-[50px]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">First Name</Label>
                                <Input placeholder="student name " className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-base rounded-md shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-normal outline-none" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">Last  Name</Label>
                                <Input placeholder="student last name " className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-base rounded-md shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-normal outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-chestnut text-sm font-semibold">Middle Name </Label>
                            <Input placeholder="student middle name " className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-base rounded-md shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-normal outline-none" />
                        </div>

                        <div className="grid grid-cols-2 items-center gap-4">
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">Username</Label>
                                <Input placeholder="student username " className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-base rounded-md shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-normal outline-none" />
                            </div>
                            <div className="space-y-1.5 mt-1.5">
                                <Label className="text-chestnut text-xs font-bold">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={cn(
                                                "w-full ring-2 ring-chestnut/40 bg-transparent rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 outline-none hover:ring-chestnut/50 transition",
                                                dob ? "text-chestnut" : "text-chestnut/30"
                                            )}
                                        >
                                            <CalendarIcon className="w-4 h-4 text-chestnut/50 shrink-0" />
                                            {dob ? format(dob, "dd MMM yyyy") : "Select date of birth"}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dob}
                                            onSelect={setDob}
                                            initialFocus
                                            captionLayout="dropdown"   // shows month/year dropdowns
                                            fromYear={1990}
                                            toYear={new Date().getFullYear()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-chestnut text-sm font-semibold">Guardian  Name</Label>
                            <Input placeholder="student Guardian  name" className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-base rounded-md shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-normal outline-none" />
                        </div>

                        <div className="mt-7 flex items-center justify-center flex-col">
                            {/* Register button */}
                            <button onClick={() => setClassDialogOpen(true) } className="flex items-center cursor-pointer  gap-2 text-white font-semibold text-sm px-8 py-3 rounded-md transition-opacity hover:opacity-90 mb-3 bg-chestnut">
                                <PlusIcon />
                                Continue
                            </button>

                            {/* Hint */}
                            <div className="flex items-center gap-1.5">
                                <CircleAlert className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="text-[11px] text-gray-400">
                                    You can add multiple student one after another
                                </span>
                            </div>
                        </div>

                    </div>
                </div>)}
            </div>
        </div>

        <ClassDialog
    open={classDialogOpen}
    onOpenChange={setClassDialogOpen}
    studentName="Tee Wealth"
    studentUsername="@tee-wealth"
    studentDob="DOB: 22 Apr 2010"
    onSave={(data) => {
        setSuccessfully(true)
        console.log(data); // { assignedClass, levels, subjects }
    }}
/>
        </>
    )
};
export default Enrollment;


import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import ClassDialog from "./class-dialog";
import { useNavigate } from "react-router-dom";

const AnimatedSuccessIcon = () => {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, filter: "blur(6px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 12,
      }}
      className="relative flex items-center justify-center"
    >
      {/* Glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.4],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        className="absolute w-28 h-28 rounded-full bg-green-400/30"
      />

      {/* Circle */}
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
        <svg viewBox="0 0 52 52" className="w-10 h-10" fill="none">
          <motion.path
            d="M14 27 L22 35 L38 19"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: 1,
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

const StudentRegisteredSuccessfully = ({setSuccessfully}: {setSuccessfully: (boolean: false) => void}) => {
    const navigate = useNavigate()
  return (
    <div className="min-h-[80vh] bg-white/35 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">

        {/* 🔥 Animated Success Icon */}
        <AnimatedSuccessIcon />

        {/* TEXT */}
        <div className="space-y-2">
          <h3 className="text-gray-900 font-semibold text-xl">
            Student registered successfully!
          </h3>

          <p className="text-gray-500 text-sm leading-relaxed">
            Tee Wealth has been added to{" "}
            <span className="font-medium text-gray-700">
              JSS 1A Section
            </span>{" "}
            for the{" "}
            <span className="font-medium text-gray-700">
              2026 / 2027
            </span>{" "}
            session.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3 pt-2">
          <button onClick={() => setSuccessfully(false)} className="w-full flex items-center justify-center gap-2.5 border border-gray-200 text-gray-600 font-medium text-sm py-3 rounded-xl hover:bg-gray-50 transition">
            <Plus className="w-4 h-4" />
            Add Another Student
          </button>

          <button onClick={() => navigate("/admin/registration/student/students")} className="w-full py-3 rounded-xl bg-chestnut text-white font-medium text-sm hover:opacity-90 transition">
            View All Students
          </button>
        </div>
      </div>
    </div>
  );
};

