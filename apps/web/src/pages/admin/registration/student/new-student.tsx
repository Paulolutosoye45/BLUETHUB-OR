import { Label, Input, Button } from "@bluethub/ui-kit";
import {
  Upload,
  User,
  Camera,
  UserRound,
  Users,
  Calendar,
  AtSign,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const NewStudent = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div>
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
                  ${
                    dragActive
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
                className={`p-4 rounded-full transition-all duration-300 ${
                  fileName
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
                  className={`font-semibold text-sm transition-colors ${
                    fileName
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
              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name*
                </Label>
                <Input
                  type="text"
                  placeholder="Enter first name"
                  className="ring-2  font-medium placeholder:font-poppins placeholder:font-normal ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name*
                </Label>
                <Input
                  type="text"
                  placeholder="Enter last name"
                  className="ring-2  font-medium placeholder:font-poppins placeholder:font-normal ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                  <UserRound className="w-4 h-4" />
                  Middle Name
                </Label>
                <Input
                  type="text"
                  placeholder="Enter middle name"
                  className="ring-2 font-medium placeholder:font-poppins placeholder:font-normal ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Username*
                </Label>
                <Input
                  type="text"
                  placeholder="maybabs.12222"
                  className="ring-2  font-medium placeholder:font-poppins placeholder:font-normal ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Guardian Name{" "}
                  <span className="text-chestnut/70">(Optional)</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Olufunmi Babajide"
                  className="ring-2  font-medium placeholder:font-poppins placeholder:font-normal ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Of Birth
                </Label>
                <Input
                  type="text"
                  placeholder="22 May, 2002"
                  className="ring-2  font-medium placeholder:font-poppins placeholder:font-normal ring-chestnut/20 focus:ring-chestnut/40 border-0 py-6 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mt-12 ">
          <Button
            type="submit"
            className=" cursor-pointer bg-linear-to-r from-chestnut to-chestnut/90 hover:from-chestnut/90 hover:to-chestnut text-white font-bold text-lg py-7 px-12 rounded-md  transition-all duration-300 transform hover:scale-105"
          >
            <Link to="/admin/registration/student/enrollment">
              Save and Continue
            </Link>
          </Button>
        </div>

    </div>
  );
};

export default NewStudent;
