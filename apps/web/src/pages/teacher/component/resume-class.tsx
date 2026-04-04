import {
    ArrowLeft,
    AlertCircle,
    ArrowRight,
    TriangleAlertIcon,
} from "lucide-react";
import Time from "@/assets/svg/time-fill.svg?react";
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    Textarea
} from "@bluethub/ui-kit";
import { Link } from "react-router-dom";
import TeacherAppBar from "../dashboard/teacher-app-bar";

const ResumeClass = () => {
    return (
        <div className="min-h-screen  px-4 py-6 space-y-6">
            <TeacherAppBar />
            <div className="rounded-lg shadow bg-white">
                {/* Header Section */}
                <div className="bg-linear-to-r from-chestnut to-chestnut/90 px-6 py-5 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="flex items-center gap-3">
                            <ArrowLeft className="text-white" />
                            <span className="font-semibold text-base text-white">
                                Upload Recorded Class
                            </span>
                        </h2>
                    </div>
                    <div>
                        <h2 className="flex items-center gap-3">
                            <AlertCircle className="text-white" />
                            <span className="font-semibold text-base text-white">
                                Fill all required fields to enable Submit.
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 rounded-b-lg space-y-6">
                    <div>
                        <h2 className="font-bold text-2xl text-chestnut mb-2">
                            Upload Class
                        </h2>
                        <h2 className="font-medium text-base text-chestnut">
                            Your class submission is under review.
                        </h2>
                    </div>

                    {/* Class Details and Form */}
                    <div className="space-y-6 border border-[#29238280] rounded-lg bg-white p-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-chestnut">
                                Class Details
                            </h3>
                            <Button
                                variant="outline"
                                className="bg-[#02770E] hover:bg-[#02660d] text-white flex items-center gap-2 border-none"
                            >
                                <Time className="text-white" />
                                <span className="font-semibold text-sm">Autosave</span>
                            </Button>
                        </div>

                        {/* Form */}
                        <section className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class */}
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="Class"
                                        className="font-semibold text-sm text-chestnut"
                                    >
                                        Class*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Jss1 Love"
                                        className="placeholder:text-chestnut border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-chestnut"
                                    />
                                </div>
                                {/* Subject */}
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="Subject"
                                        className="font-semibold text-sm text-chestnut"
                                    >
                                        Subject*
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="border rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-chestnut w-full">
                                            <SelectValue
                                                placeholder="Mathematics"
                                                className="placeholder:text-chestnut"
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="border bg-white border-chestnut">
                                            <SelectGroup>
                                                <SelectLabel className="font-normal text-sm text-chestnut">
                                                    Property Owner
                                                </SelectLabel>
                                                <SelectItem
                                                    value="owner"
                                                    className="font-normal text-sm text-chestnut"
                                                >
                                                    Property Owner
                                                </SelectItem>
                                                <SelectItem
                                                    value="agent"
                                                    className="font-normal text-sm text-chestnut"
                                                >
                                                    Agent
                                                </SelectItem>
                                                <SelectItem
                                                    value="tenant"
                                                    className="font-normal text-sm text-chestnut"
                                                >
                                                    Tenant
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Topic */}
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="Topic*"
                                        className="font-semibold text-sm text-chestnut"
                                    >
                                        Topic*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Algebra"
                                        className="placeholder:text-chestnut border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-chestnut"
                                    />
                                </div>
                                {/* Sub-topic */}
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="Sub-topic*"
                                        className="font-semibold text-sm text-chestnut"
                                    >
                                        Sub-topic*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Linear Equation: solving x"
                                        className="placeholder:text-chestnut border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-chestnut"
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class Duration */}
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="Class Duration"
                                        className="font-semibold text-sm text-chestnut"
                                    >
                                        Class Duration*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="40mins"
                                        className="placeholder:text-chestnut border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-chestnut"
                                    />
                                </div>
                                {/* Memory Size */}
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="Memory Size"
                                        className="font-semibold text-sm text-chestnut"
                                    >
                                        Memory Size*
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="40mb"
                                        className="placeholder:text-chestnut border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-chestnut"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Class Aim */}
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="Class Aim"
                                    className="font-semibold text-sm text-chestnut"
                                >
                                    Class Aim*
                                </Label>
                                <Textarea
                                    placeholder="Describe the main purpose of this class..."
                                    className="placeholder:text-chestnut border rounded-md px-3 py-3 text-sm h-27.5 focus:ring-2 focus:ring-chestnut"
                                />
                            </div>

                            {/* Row 5: Learning Objectives */}
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="Learning Objectives"
                                    className="font-semibold text-sm text-chestnut"
                                >
                                    Learning Objectives *
                                </Label>
                                <Textarea
                                    placeholder="List 3-5 measurable learning objectives..."
                                    className="placeholder:text-chestnut border rounded-md px-3 py-3 text-sm  h-27.5 focus:ring-2 focus:ring-chestnut"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    className="border border-red-800 text-red-800 px-6 py-3 hover:bg-red-800  cursor-pointer hover:text-white"
                                >
                                    Cancel Class
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 bg-chestnut hover:bg-chestnut/90 text-white px-6 py-3 cursor-pointer hover:text-white"
                                >
                                    <span className="font-semibold text-sm">
                                        <Link to="/teacher/class-info">Upload Class</Link>
                                    </span>
                                    <ArrowRight className="text-white" />
                                </Button>
                            </div>
                        </section>

                        {/* Errors & Info */}
                        <div className="flex items-center gap-3 mt-6">
                            <TriangleAlertIcon className="text-[#29238280]" />
                            <p className="font-medium text-[#29238280] text-xs">
                                Complete all required fields. Errors will appear below the
                                fields.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeClass;
