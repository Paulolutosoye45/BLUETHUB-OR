import { useState } from "react";
import { UserCircle, BookOpen, GraduationCap } from "lucide-react";
import FileUpload from "@/shared/file-upload";
import CustomDropdown from "@/shared/custom-dropdown";
import SubjectSelection from "@/shared/subject-selection";

// Data constants
const CLASS_OPTIONS = [
    { label: "JSS1", value: "jss1" },
    { label: "JSS2", value: "jss2" },
    { label: "JSS3", value: "jss3" },
    { label: "SS1", value: "ss1" },
    { label: "SS2", value: "ss2" },
    { label: "SS3", value: "ss3" },
];

const TEACHER_OPTIONS = [
    { label: "Dr. Stevenson", value: "stevenson" },
    { label: "Mrs. Johnson", value: "johnson" },
    { label: "Mr. Williams", value: "williams" },
    { label: "Ms. Anderson", value: "anderson" },
];

const SUBJECT_OPTIONS = [
    { label: "Mathematics", value: "mathematics" },
    { label: "English", value: "english" },
    { label: "Physics", value: "physics" },
    { label: "Chemistry", value: "chemistry" },
    { label: "Biology", value: "biology" },
    { label: "Computer Science", value: "computer_science" },
];

const Enrollment = () => {
    const [selectClass, setSelectClass] = useState("");
    const [selectTeacher, setSelectTeacher] = useState("");
    const [selectSubject, setSelectSubject] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setFileName(e.dataTransfer.files[0].name);
        }
    };

    return (
        <div className="space-y-8">
            {/* Main Content Area - Two Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">

                <div className="space-y-6">
                    <div className="flex gap-6 flex-wrap md:flex-nowrap shrink-0">
                        {/* File Upload */}
                        <FileUpload
                            fileName={fileName}
                            onFileChange={handleFileChange}
                            onDrag={handleDrag}
                            onDrop={handleDrop}
                            dragActive={dragActive}
                        />

                        {/* Form Dropdowns */}
                        <div className="flex-1 space-y-6">
                            <CustomDropdown
                                label="Class*"
                                icon={<GraduationCap className="w-4 h-4" />}
                                placeholder="Select Class"
                                options={CLASS_OPTIONS}
                                value={selectClass}
                                onChange={setSelectClass}
                            />

                            <CustomDropdown
                                label="Class Teacher*"
                                icon={<UserCircle className="w-4 h-4" />}
                                placeholder="Select Teacher"
                                options={TEACHER_OPTIONS}
                                value={selectTeacher}
                                onChange={setSelectTeacher}
                            />

                            <CustomDropdown
                                label="Subject"
                                icon={<BookOpen className="w-4 h-4" />}
                                placeholder="Select Subject"
                                options={SUBJECT_OPTIONS}
                                value={selectSubject}
                                onChange={setSelectSubject}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Subject Selection */}
                <div className="shrink">
                    <SubjectSelection selectClass={selectClass} />
                </div>
            </div>

        </div>
    );
};

export default Enrollment;
