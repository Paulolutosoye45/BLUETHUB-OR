import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogFooter,
} from "@bluethub/ui-kit";
import { Link } from "react-router-dom";
import Marked from '@/assets/gifs/success.gif'

interface PasswordVerifyProps {
    openVerify: boolean;
    onOpenChange?: (open: boolean) => void;
}

const PasswordVerify = ({ openVerify, onOpenChange }: PasswordVerifyProps) => {
    return (
        <AlertDialog open={openVerify} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border border-white/20 backdrop-blur-xl  shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="size-64.25  mx-auto border border-white/20 ">
                        <img src={Marked} alt="" />
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center  text-blck-b2  font-bold  text-xl">
                        Check your mail for password
                    </AlertDialogDescription>
                    <AlertDialogDescription className="text-center text-blck-b2 font-Poppins font-medium  text-[13px] mb-4">
                        Please check back in a few minutes. Password will be sent
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="space-y-2 flex items-center justify-center sm:flex-col p-4  sm:justify-center">
                    <Link to="/admin/registration/teacher/assign/Teacher-Role">
                        <AlertDialogAction className="text-white bg-chestnut hover:bg-  hover:text-  cursor-pointer px-16 py-6  font-poppins  font-bold text-xl">
                            ok
                        </AlertDialogAction>
                    </Link>
                    <AlertDialogCancel className="text-blck-b2 font-poppins font-normal text-[13px] border-none outline-none ring-0 cursor-pointer">
                        Dismiss
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default PasswordVerify;
