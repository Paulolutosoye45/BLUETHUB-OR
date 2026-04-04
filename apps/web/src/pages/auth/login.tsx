import { loginSchema } from "@/utils/validate";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { authService } from "@/services/auth";
import { getDeviceIp, getDeviceType, localData,} from "@/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getParsedToken } from "@/utils/decode";
import { useAuthContext } from "@/contexts/auth-context";



export interface UserLoginInput {
    userName: string;
    password: string;
}

// const getSchoolName = () => {
//     const hostname = window.location.hostname;

//     if (hostname === "localhost") return "pair"; // dev fallback

//     // pair.new-bluethub.com → ["pair", "new-bluethub", "com"]
//     return hostname.split(".")[0]; // always "pair"
// };


function Login() {
    const navigate = useNavigate();
    const { login: loginAuth } = useAuthContext();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(loginSchema) });


    const handleLogin = async (data: UserLoginInput) => {
        // const hashPassword = await Hashing(data.password);
        const deviceIp = await getDeviceIp();

        const inst = "pearl01";

        const payload = {
            username: data.userName,
            hashPassword: data.password,
            inst,
            deviceType: getDeviceType(),
            deviceIp,
        };

        try {
            setLoading(true);
            const response = await authService.login(payload);
            const result = response.data;

            if (result.firstTimeLogin) {
                navigate("/auth/new-password");
            } else {
                const user = getParsedToken(result.token);

                if (!user) {
                    toast.error("Invalid token received");
                    return;
                }
                localData.save('user', user)
                localData.save('schoolInfo', result.schoolInfo)
                // loginAuth(result.token, user);
                loginAuth(result.token, {
                    ...user,
                    roleName: user.role,  // ← are you sure this line is saved?
                });

                // redirect based on role
                if (user.role === "SuperAdministrator" || user.role === "Administrator") {
                    navigate("/admin");
                } else if (user.role === "Teacher") {
                    navigate("/teacher");
                } else if (user.role === "Student") {
                    navigate("/student");
                } else {
                    navigate("/admin");
                }
            }
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
        <div>
            <div>
                <svg width="82" height="42" viewBox="0 0 82 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.3553 15.6459V27.2319H20.1633V15.6459H22.3553ZM32.7094 18.558V27.2319H30.5018V26.1359C30.22 26.5117 29.8494 26.8091 29.3901 27.0283C28.9413 27.2371 28.4507 27.3415 27.9184 27.3415C27.24 27.3415 26.6398 27.2006 26.1179 26.9187C25.596 26.6265 25.1837 26.2037 24.881 25.6505C24.5888 25.0869 24.4426 24.4189 24.4426 23.6465V18.558H26.6346V23.3333C26.6346 24.0222 26.8068 24.5546 27.1512 24.9303C27.4957 25.2957 27.9654 25.4783 28.5603 25.4783C29.1657 25.4783 29.6407 25.2957 29.9851 24.9303C30.3295 24.5546 30.5018 24.0222 30.5018 23.3333V18.558H32.7094ZM42.9353 22.7071C42.9353 23.0202 42.9144 23.302 42.8727 23.5525H36.5317C36.5839 24.1788 36.8031 24.6694 37.1893 25.0243C37.5755 25.3792 38.0504 25.5566 38.614 25.5566C39.4282 25.5566 40.0075 25.2069 40.3519 24.5076H42.7161C42.4656 25.3426 41.9854 26.0315 41.2757 26.5743C40.5659 27.1066 39.6943 27.3728 38.661 27.3728C37.826 27.3728 37.0745 27.1901 36.4064 26.8248C35.7489 26.449 35.2322 25.9219 34.8564 25.2435C34.4911 24.565 34.3084 23.7822 34.3084 22.895C34.3084 21.9973 34.4911 21.2093 34.8564 20.5308C35.2217 19.8523 35.7332 19.3304 36.3908 18.9651C37.0484 18.5998 37.8051 18.4171 38.661 18.4171C39.4856 18.4171 40.2215 18.5946 40.8686 18.9495C41.5262 19.3044 42.0324 19.8106 42.3873 20.4682C42.7526 21.1153 42.9353 21.8616 42.9353 22.7071ZM40.6651 22.0808C40.6546 21.5172 40.4511 21.0683 40.0545 20.7343C39.6578 20.3899 39.1725 20.2177 38.5984 20.2177C38.0556 20.2177 37.5963 20.3847 37.2206 20.7187C36.8553 21.0422 36.6309 21.4963 36.5473 22.0808H40.6651ZM47.0873 20.3586V24.5546C47.0873 24.8468 47.1551 25.0608 47.2908 25.1965C47.4369 25.3218 47.677 25.3844 48.011 25.3844H49.0287V27.2319H47.6509C45.8034 27.2319 44.8797 26.3342 44.8797 24.5389V20.3586H43.8463V18.558H44.8797V16.4131H47.0873V18.558H49.0287V20.3586H47.0873ZM55.4901 18.4328C56.1477 18.4328 56.7322 18.5789 57.2437 18.8712C57.7552 19.153 58.1518 19.5757 58.4336 20.1394C58.7259 20.6926 58.872 21.3606 58.872 22.1434V27.2319H56.6801V22.4409C56.6801 21.752 56.5078 21.2249 56.1634 20.8596C55.8189 20.4838 55.3492 20.2959 54.7543 20.2959C54.1489 20.2959 53.6687 20.4838 53.3139 20.8596C52.9694 21.2249 52.7972 21.752 52.7972 22.4409V27.2319H50.6053V15.6459H52.7972V19.6384C53.079 19.2626 53.4548 18.9703 53.9245 18.7616C54.3942 18.5424 54.9161 18.4328 55.4901 18.4328ZM69.1449 18.558V27.2319H66.9373V26.1359C66.6555 26.5117 66.2849 26.8091 65.8257 27.0283C65.3768 27.2371 64.8863 27.3415 64.3539 27.3415C63.6755 27.3415 63.0753 27.2006 62.5534 26.9187C62.0315 26.6265 61.6192 26.2037 61.3165 25.6505C61.0243 25.0869 60.8781 24.4189 60.8781 23.6465V18.558H63.0701V23.3333C63.0701 24.0222 63.2423 24.5546 63.5867 24.9303C63.9312 25.2957 64.4009 25.4783 64.9959 25.4783C65.6012 25.4783 66.0762 25.2957 66.4206 24.9303C66.7651 24.5546 66.9373 24.0222 66.9373 23.3333V18.558H69.1449ZM73.4995 19.8262C73.7814 19.4087 74.1676 19.0695 74.6581 18.8086C75.1591 18.5476 75.728 18.4171 76.3647 18.4171C77.1058 18.4171 77.7738 18.5998 78.3688 18.9651C78.9742 19.3304 79.4491 19.8523 79.7935 20.5308C80.1484 21.1988 80.3259 21.9764 80.3259 22.8636C80.3259 23.7509 80.1484 24.5389 79.7935 25.2278C79.4491 25.9063 78.9742 26.4334 78.3688 26.8091C77.7738 27.1849 77.1058 27.3728 76.3647 27.3728C75.7176 27.3728 75.1487 27.2475 74.6581 26.997C74.178 26.7361 73.7918 26.4021 73.4995 25.995V27.2319H71.3076V15.6459H73.4995V19.8262ZM78.087 22.8636C78.087 22.3418 77.9774 21.8929 77.7582 21.5172C77.5494 21.131 77.2676 20.8387 76.9127 20.6404C76.5683 20.4421 76.1925 20.3429 75.7854 20.3429C75.3888 20.3429 75.013 20.4473 74.6581 20.656C74.3137 20.8544 74.0319 21.1466 73.8127 21.5328C73.6039 21.919 73.4995 22.3731 73.4995 22.895C73.4995 23.4169 73.6039 23.8709 73.8127 24.2571C74.0319 24.6433 74.3137 24.9408 74.6581 25.1495C75.013 25.3478 75.3888 25.447 75.7854 25.447C76.1925 25.447 76.5683 25.3426 76.9127 25.1339C77.2676 24.9251 77.5494 24.6276 77.7582 24.2414C77.9774 23.8552 78.087 23.396 78.087 22.8636Z" fill="url(#paint0_linear_3091_1858)" />
                    <path d="M8.96274 30.3487C7.96301 30.3487 6.9749 30.2325 5.99841 30C5.04518 29.7675 4.19656 29.4188 3.45257 28.9538C3.19683 28.7678 3.02246 28.5004 2.92946 28.1517C2.83646 27.7797 2.78996 27.3379 2.78996 26.8264C2.78996 25.9197 2.96433 24.8502 3.31308 23.618C3.66182 22.3625 4.10357 21.0721 4.63831 19.7469C5.17305 18.4217 5.73104 17.1662 6.31228 15.9805C6.89352 14.7947 7.41664 13.8182 7.88163 13.051C8.32338 12.3768 8.86975 11.9118 9.52074 11.656C10.1717 11.377 10.8576 11.2375 11.5783 11.2375C13.1361 11.2375 13.7987 11.377 13.5662 11.656C13.0779 12.214 12.5664 12.9464 12.0317 13.8531C11.497 14.7598 10.9971 15.6898 10.5321 16.6431C10.0671 17.5731 9.67186 18.3868 9.34636 19.0843C8.57912 20.7118 7.90488 22.3044 7.32364 23.8621C6.7424 25.3966 6.34716 26.6404 6.13791 27.5937C6.09141 27.7797 6.06816 27.9308 6.06816 28.047C6.06816 28.3028 6.14954 28.5353 6.31228 28.7445C6.47503 28.9305 6.76565 29.0584 7.18415 29.1281C7.34689 29.1514 7.49802 29.1746 7.63751 29.1979C7.80026 29.1979 7.96301 29.1979 8.12576 29.1979C9.00924 29.1979 9.82298 28.977 10.567 28.5353C11.311 28.0935 11.776 27.4542 11.962 26.6172C12.0317 26.3382 12.0549 26.0359 12.0317 25.7104C12.0317 25.1524 11.9503 24.5363 11.7876 23.8621C11.6248 23.1878 11.3807 22.5601 11.0552 21.9789C10.753 21.3976 10.3577 20.9675 9.86948 20.6885C9.63698 20.549 9.52074 20.3863 9.52074 20.2003C9.52074 19.991 9.64861 19.8631 9.90436 19.8166C10.4623 19.8166 11.032 19.5958 11.6132 19.154C12.2177 18.7123 12.7641 18.131 13.2523 17.4103C13.7638 16.6896 14.1707 15.9107 14.4729 15.0737C14.7984 14.2135 14.9612 13.3881 14.9612 12.5976C14.9612 11.4816 14.624 10.7144 13.9498 10.2959C13.2988 9.85417 12.5199 9.6333 11.6132 9.6333C10.846 9.6333 10.0555 9.74955 9.24174 9.98204C8.428 10.1913 7.71889 10.4354 7.1144 10.7144C5.81241 11.3189 4.71968 12.0978 3.83619 13.051C2.97596 14.0042 2.47609 14.9342 2.33659 15.841C2.22034 15.7945 1.99947 15.7363 1.67398 15.6666C1.34848 15.5968 1.02299 15.4573 0.69749 15.2481C0.395244 15.0388 0.220872 14.7366 0.174372 14.3414C0.104623 13.5276 0.302246 12.8069 0.767239 12.1791C1.25548 11.5281 1.9181 10.9818 2.75508 10.54C3.61532 10.075 4.55693 9.69142 5.57992 9.38918C6.62615 9.08693 7.68401 8.86606 8.7535 8.72656C9.82298 8.58706 10.8227 8.51731 11.7527 8.51731C12.1479 8.51731 12.5199 8.52894 12.8687 8.55219C13.2174 8.57544 13.5313 8.61031 13.8103 8.65681C15.6703 8.95906 17.0071 9.56355 17.8209 10.4703C18.6346 11.3538 19.0415 12.3419 19.0415 13.4346C19.0415 14.4111 18.7509 15.376 18.1696 16.3292C17.5884 17.2592 16.7863 18.0497 15.7633 18.7007C14.7635 19.3284 13.6127 19.6772 12.3107 19.7469C13.6592 20.0491 14.6938 20.7001 15.4145 21.6999C16.1585 22.6764 16.5305 23.7342 16.5305 24.8735C16.5305 25.8267 16.2515 26.745 15.6935 27.6285C15.1355 28.512 14.2404 29.1863 13.0082 29.6513C11.7992 30.1162 10.4507 30.3487 8.96274 30.3487Z" fill="url(#paint1_linear_3091_1858)" />
                    <path d="M23.3861 11.7715L26.1389 13.4328L30.266 10.9409L26.1389 8.44894L22.0117 10.9409H26.1389V11.7715H23.3861ZM22.0117 11.7715V15.094L22.8371 14.172V12.2699L22.0117 11.7715ZM26.1389 16.7553L24.0753 15.5094L23.2499 15.011V12.5191L26.1389 14.2634L29.0279 12.5191V15.011L26.1389 16.7553Z" fill="#6C30D4" />
                    <defs>
                        <linearGradient id="paint0_linear_3091_1858" x1="20.1618" y1="32.584" x2="78.6193" y2="33.2017" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#4F61E8" />
                            <stop offset="1" stop-color="#E924A1" />
                        </linearGradient>
                        <linearGradient id="paint1_linear_3091_1858" x1="0.2958" y1="40.8169" x2="16.3262" y2="40.8423" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#4F61E8" />
                            <stop offset="1" stop-color="#E924A1" />
                        </linearGradient>
                    </defs>
                </svg>

            </div>
            <div className="flex flex-col justify-center  py-12">

                {/* Top tab row */}
                <div className="flex justify-center mb-2">
                    <span
                        className="text-sm font-semibold text-chestnut"
                    >
                        Welcome to Bluethub
                    </span>
                </div>

                {/* Active tab pill */}
                <div className="flex justify-center mb-6">
                    <button
                        disabled={loading}
                        className=" bg-chestnut px-10 py-2 rounded-full text-white text-sm font-semibold shadow">
                        Login
                    </button>
                </div>

                <p className="text-center text-gray-400 text-sm mb-8 tracking-widest">
                    Login into your school portal ............
                </p>

                <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User name
                        </label>
                        <input
                            {...register("userName")}
                            type="text"
                            placeholder="Enter your  email address"
                            className="w-full border ring-chestnut border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 transition"
                            onFocus={(e) => (e.target.style.borderColor = "#292382")}
                            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                        />
                        {errors.userName && (
                            <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your Password"
                                className="w-full border ring-chestnut border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 transition"
                                onFocus={(e) => (e.target.style.borderColor = "#292382")}
                                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Remember me + Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="rounded accent-chestnut"
                            />
                            Remember me
                        </label>
                        <button
                            type="button"
                            className="text-sm hover:underline accent-chestnut">
                            Forgot Password?
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className=" bg-chestnut w-full py-3 rounded-full text-white text-sm font-semibold shadow hover:opacity-90 transition">
                        {loading ? (
                            <Loader2 className="size-5 mx-auto animate-spin text-white" />
                        ) : (
                            <span>login</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login