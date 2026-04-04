import { Button } from "@bluethub/ui-kit";
import { Link } from "react-router-dom";

const ResendEmail = () => {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100  rounded-tl-xl rounded-tr-xl overflow-hidden">
            <div className="relative bg-linear-to-r from-chestnut via-chestnut/90 to-chestnut/80 px-8 py-4 mb-5">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                </div>

                <div className="relative">
                    <div>
                        <h2 className="font-bold text-xl text-white leading-tight">
                            Email Verification
                        </h2>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-2xl mx-auto mt-12">
                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[18px] shadow-2xl border border-white/20 overflow-hidden h-128.25">
                    {/* Header */}

                    {/* Content */}
                    <div className="px-8 py-12">
                        {/* Icon Section */}
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-chestnut mb-2 bg-linear-to-r from-chestnut to-chestnut/80 bg-clip-text">
                                Please Enter Your Email
                            </h3>
                            <p className="text-chestnut/60 font-medium">
                                <span className="block">
                                    We’ve sent an email to{" "}
                                    <span className="text-base text-chestnut ">
                                        @stevebabajide@mail.com
                                    </span>
                                </span>
                                <span>
                                    6 digits code wiil be sent to your mail to verify your
                                    account.{" "}
                                </span>
                            </p>
                        </div>

                        {/* Form */}
                        <section className="mt-20 w-full max-w-sm mx-auto">
                            {/* Submit Button */}
                            <div className="grid grid-cols-2 w-full gap-4 items-center font-poppins">
                                <Button
                                    type="submit"
                                    className=" w-full py-7 text-base font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-linear-to-r from-chestnut to-chestnut/90 hover:from-chestnut/90 hover:bg- shadow-lg hover:shadow-xl bg-chestnut  text-white"
                                >
                                    <Link to="/admin/registration/teacher/email-verification">
                                        Resend code
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    className=" w-full py-7 text-base font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ring  hover:bg-  shadow-lg hover:shadow-xl bg-white  text-chestnut"
                                >
                                    <div>
                                        <Link to="/admin/registration/teacher/verification-otp">
                                            Update email
                                        </Link>
                                    </div>
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResendEmail;
