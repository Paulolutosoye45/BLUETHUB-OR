import {
    Upload,
    Camera,
    ChevronRight,
    Check,
    ChevronDown,
    Tag,
    X,
} from "lucide-react";
import {
    Button,
    Input,
    Label,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Card,
    CardContent,
    ScrollArea,
    Separator,
} from "@bluethub/ui-kit";

import { useState } from "react";

const AssignRoles = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectRole, setSelectRole] = useState<string>("");
    const [tagSubject, setTagSubject] = useState([
        "Mathematics",
        "English Language",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "History",
        "Geography",
    ]);

    const removeTagSubject = (tagToRemove: string) => {
        setTagSubject(tagSubject.filter((subject) => subject !== tagToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleCheckboxChange = (course: string) => {
        console.log(course)
    };

    const roles = [{ label: "subject-teacher" }, { label: "head-Teacher" }];

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFileName(e.dataTransfer.files[0].name);
        }
    };
    return (
        <div className="space-y-4 px-6 max-w-full min-w-[90%] mx-auto  min-h-[96vh]">
            <div className=" backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                <div className="bg-linear-to-r from-chestnut to-chestnut/90 p-4">
                    <div className="flex items-center gap-1">
                        <h2 className="font-bold text-base text-white">
                            Register Teacher’s Role
                        </h2>
                        <p className="text-white/80 text-sm">
                            <ChevronRight />
                        </p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8  h-[90vh] bg-linear-to-br from-white/95 to-white/85">
                    <div className="flex gap-12">
                        {/* Profile Picture Upload */}
                        <div className="space-y-3">
                            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Profile Picture*
                            </Label>

                            <label
                                htmlFor="fileInput"
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`group relative flex items-center justify-center flex-col gap-4 
                  border-2 border-dashed w-60 h-50 rounded-2xl cursor-pointer 
                  transition-all duration-300 overflow-hidden
                  ${dragActive
                                        ? "border-chestnut bg-chestnut/10 scale-105"
                                        : fileName
                                            ? "border-green-500 bg-green-50"
                                            : "border-chestnut/40 hover:border-chestnut bg-chestnut/5 hover:bg-chestnut/10"
                                    }`}
                            >
                                <Input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />

                                <div className="absolute inset-0 bg-linear-to-br from-chestnut/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div
                                    className={`p-4 rounded-full transition-all duration-300 ${fileName
                                        ? "bg-green-500"
                                        : "bg-chestnut/10 group-hover:bg-chestnut/20"
                                        }`}
                                >
                                    {fileName ? (
                                        <Camera className="w-8 h-8 text-white" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-chestnut" />
                                    )}
                                </div>

                                <div className="text-center px-4 space-y-1">
                                    <p
                                        className={`font-semibold text-sm transition-colors ${fileName
                                            ? "text-green-700"
                                            : "text-chestnut group-hover:text-chestnut/80"
                                            }`}
                                    >
                                        {fileName ? "Image Selected" : "Upload Image"}
                                    </p>
                                    <p className="text-xs text-chestnut/60 font-medium">
                                        {fileName || "Click or drag to select file"}
                                    </p>
                                    {fileName && (
                                        <p className="text-xs text-green-600 font-medium truncate max-w-50">
                                            {fileName}
                                        </p>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-8">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-3 w-full">
                                    <label className="text-chestnut font-semibold text-base flex items-center gap-2">
                                        Role*
                                    </label>

                                    <DropdownMenu onOpenChange={setIsDropdownOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${selectRole
                                                    ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                                                    : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                                                    } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                                            >
                                                <span
                                                    className={
                                                        selectRole ? "text-chestnut font-semibold" : ""
                                                    }
                                                >
                                                    {selectRole || "Select Role"}
                                                </span>

                                                <div
                                                    className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
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
                                                {roles.map((role) => (
                                                    <DropdownMenuItem
                                                        key={role.label}
                                                        className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selectRole === role.label
                                                            ? "bg-chestnut text-white"
                                                            : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                                                            }`}
                                                        onClick={() => {
                                                            setSelectRole(role.label);
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{role.label}</span>
                                                            {selectRole === role.label && (
                                                                <Check className="w-5 h-5 ml-2 text-white" />
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                                        Class*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Jss1 love"
                                        className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 placeholder:font-semibold placeholder:pl-2 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                                        Register Subject*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="mathematics, english, physics"
                                        className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                                    />

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="flex justify-end">
                                                <Button className="bg-linear-to-r from-chestnut font-poppins cursor-pointer to-chestnut/90 hover:from-chestnut/90 hover:to-chestnut text-white font-bold text-sm   p-4 rounded-md transition-all duration-300 transform hover:scale-105">
                                                    Add subject
                                                </Button>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-106.25 border border-white/20 backdrop-blur-xl  rounded-sm shadow-2xl">
                                            <DialogHeader className="font-bold text-xl tex-[#343434] border-b-2 border-chestnut pb-4">
                                                <DialogTitle className="text-center">
                                                    Select Subject
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 gap-4 ">
                                                <div className="p-0 m-0">
                                                    <h2 className="font-semibold text-base text-[#4A5D58] mb-10 ">  Major course </h2>
                                                    {" "}
                                                    {tagSubject.map((courseItem, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-0 mb-3"
                                                        >
                                                            <Label className="flex items-center cursor-pointer relative">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`course-${idx}`}
                                                                    onChange={() =>
                                                                        handleCheckboxChange(courseItem)
                                                                    }
                                                                    className="peer size-5 mr-2.5 appearance-none rounded border border-slate-300 checked:bg-chestnut checked:border-chestnut"
                                                                />
                                                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-[84%] -translate-y-1/2">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                        className="w-full"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                            </Label>
                                                            <p className="text-[#4A5D58] font-medium text-base font-poppins">
                                                                {courseItem}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-0 m-0">
                                                    <h2 className=" font-semibold text-base text-[#4A5D58] mb-10 ">  Minor course </h2>
                                                    {tagSubject.map((courseItem, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-0 mb-3"
                                                        >
                                                            <Label className="flex items-center cursor-pointer relative">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`course-${idx}`}
                                                                    onChange={() =>
                                                                        handleCheckboxChange(courseItem)
                                                                    }
                                                                    className="peer size-5 mr-2.5 appearance-none rounded border border-slate-300 checked:bg-chestnut checked:border-chestnut"
                                                                />
                                                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-[84%] -translate-y-1/2">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                        className="w-full"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                            </Label>
                                                            <p className="text-[#4A5D58] font-medium text-base font-poppins">
                                                                {courseItem}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <DialogFooter className="">
                                                <DialogClose asChild>
                                                    <Button
                                                        variant="outline"
                                                        className=" w-28 h-8.5 hover:bg-transparent cursor-pointer rounded-[3px] border border-[#C4C4C4] font-semibold text-[12px]"
                                                    >
                                                        Back
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    className=" w-28 h-8.5 bg-chestnut text-white rounded-[3px]  font-semibold text-[12px] hover:bg-chestnut cursor-pointer"
                                                >
                                                    Submit
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                                        Register Subject*
                                    </Label>
                                    <Card className="relative w-full h-50 ring-2 ring-chestnut/20 focus-within:ring-chestnut/40 border-0 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300  overflow-hidden">
                                        <CardContent className="p-0 h-full">
                                            <div className="">
                                                <span className="absolute top-2 right-2 text-xs font-medium text-chestnut/60 bg-chestnut/10 px-2 py-1 rounded-full">
                                                    {tagSubject.length} subjects
                                                </span>
                                            </div>

                                            <ScrollArea className="h-72 px-4">
                                                <div className="py-3 space-y-2">
                                                    {tagSubject.length > 0 ? (
                                                        tagSubject.map((tag, index) => (
                                                            <div key={tag}>
                                                                <div className="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-chestnut/5 transition-all duration-200">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-2 h-2 rounded-full bg-chestnut/40"></div>
                                                                        <span className="text-sm font-medium text-chestnut/80 group-hover:text-chestnut">
                                                                            {tag}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeTagSubject(tag)}
                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 rounded-md"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-500" />
                                                                    </button>
                                                                </div>
                                                                {index < tagSubject.length - 1 && (
                                                                    <Separator className="my-1 bg-chestnut/10" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                                            <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mb-3">
                                                                <Tag className="w-6 h-6 text-chestnut/40" />
                                                            </div>
                                                            <p className="text-sm text-chestnut/60 font-medium">
                                                                No subjects added yet.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end mt-12 ">
                        <Button className="w-50 h-10  rounded-md bg-chestnut  hover:bg-chestnut/90 cursor-pointer hover:to-chestnut text-white font-semibold text-xl font-poppins  transition-all duration-300 transform hover:scale-105">
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignRoles;
