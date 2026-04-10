import schoolProfile from "@/assets/png/School.png";
import { authService } from "@/services/auth";
import { Hashing } from "@/utils";
import type { Tuser } from "@/utils/decode";
import { regUserSchema, UserRole, type RegisterFormData } from "@/utils/validate";
import { Label, Input, Button } from "@bluethub/ui-kit";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { Upload, User, Lock, Camera, Mail, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const SubjectTeacher = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState<boolean>(false)
  const [user, setUser] = useState<Tuser | null>(null);
  

  // Load user from localStorage when component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser: Tuser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('user'); // clear corrupted data
      }
    }
  }, []);


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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(regUserSchema) });


  const firstName = watch("firstName");
  const lastName = watch("lastName");

  // Auto-generate username whenever firstName or lastName changes
  useEffect(() => {
    if (firstName || lastName) {
      const generated = `${firstName ?? ''}.${lastName ?? ''}`.toLowerCase().trim();
      setValue("username", generated);
      setValue("password", generated);
    }
  }, [firstName, lastName, setValue]);

  const handleRegister = async (data: RegisterFormData) => {
    if (!user?.schoolId && !user?.id) return
    
    let role = UserRole.SuperAdministrator;           // 1            // 4
    const hashPassword = await Hashing(data.password);
    const payload = {
      createdby: user?.id,
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.email,
      hashPassword,
      isActive: true,
      hasAccess: true,
      userName: data.username,
      schoolId: user?.schoolId,
      role
    }
    setLoading(true);
    try {
      const res = authService.createUser(payload)
      //  navigate('/admin')
      console.log(res)

    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : (error as Error).message;

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    // "space-y-4 px-6 max-w-full min-w-[80%] mx-auto"
    <div className="space-y-4 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex  items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-chestnut bg-linear-to-r from-chestnut to-chestnut/80 bg-clip-text">
            Register Teacher
          </h1>
          <p className="text-chestnut/60 text-sm font-medium">
            Add a new teacher to your school system
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-r from-chestnut/20 to-chestnut/10 rounded-full blur"></div>
            <img
              src={schoolProfile}
              alt="School Profile"
              className="relative bg-white border-3 border-chestnut/20 w-14 h-14 rounded-full cursor-pointer object-cover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        {/* Section Header */}
        <div className="bg-linear-to-r from-chestnut to-chestnut/90 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">
                Teacher's Details
              </h2>
              <p className="text-white/80 text-sm">
                Fill in the required information
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 px-6 py-2.5 font-semibold text-sm rounded-xl backdrop-blur-sm transition-all duration-300"
          >
            Edit Profile
          </Button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleRegister)} className="p-8 bg-linear-to-br from-white/95 to-white/85">
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
                <div className="space-y-3">
                  <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("firstName")}
                      type="text"
                      placeholder="Enter first name"
                      className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-4 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    {...register("lastName")}
                    type="text"
                    placeholder="Enter last name"
                    className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-4 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Middle Name
                  </Label>
                  <Input
                    {...register("middleName")}
                    type="text"
                    placeholder="Enter middle name"
                    className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-4 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                  />
                  {errors.middleName && (
                    <p className="text-red-500 text-sm mt-1">{errors.middleName.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    {...register("username")}
                    type="text"
                    readOnly
                    placeholder="Auto-generated"
                    className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-4 px-4 
             text-base placeholder:text-chestnut/50 bg-chestnut/5 rounded-xl 
             cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    {...register("email")}
                    type="text"
                    placeholder="Enter  email address"
                    className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-4 px-4 text-base placeholder:text-chestnut/50 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:ring-chestnut/30"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    {...register("password")}
                    readOnly
                    type="password"
                    placeholder="Auto-generated"
                    className="ring-2 ring-chestnut/20 focus:ring-chestnut/40 border-0 py-4 px-4 
                    text-base placeholder:text-chestnut/50 bg-chestnut/5 rounded-xl 
                    cursor-not-allowed opacity-70"

                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-12 pt-8 border-t border-chestnut/10">
            <Button disabled={loading} className="bg-linear-to-r from-chestnut to-chestnut/90 hover:from-chestnut/90 hover:to-chestnut text-white font-bold text-lg py-7 px-12 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {loading ? (
                <Loader2 className="size-5 mx-auto animate-spin text-white" />
              ) : (
                <span>                Save and Continue</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectTeacher;
