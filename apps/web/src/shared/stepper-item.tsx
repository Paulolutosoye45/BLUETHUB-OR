import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@bluethub/ui-kit";
import {
  BadgeInfo,
  Check,
  CircleCheckBig,
} from "lucide-react";

type StepperItemStatus = "Submitted" | "Under-Review" | "Approved" | "rejected";

interface Step {
  id: number;
  status: StepperItemStatus;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    status: "Submitted",
    icon: <CircleCheckBig className="w-4 h-4 text-white" />,
  },
  {
    id: 2,
    status: "Under-Review",
    icon: <BadgeInfo className="w-4 h-4  text-white" />,
  },
  {
    id: 3,
    status: "Approved",
    icon: <Check className="w-4 h-4 " />,
  },
];

const StepperItemShared = () => {
  return (
    <div className="rounded-xl border border-[#21189226] bg-white">
      <div className="p-4 border-b border-[#29238233]">
        <h2 className="text-chestnut font-medium text-base">Review Process</h2>
      </div>

      <div className="px-6 py-8">
        <Stepper defaultValue={2} className="relative w-full overflow-hidden">
          <StepperNav className="relative flex items-center justify-between w-full">
            {steps.map((step, index) => (
              <div key={index} className="relative  flex justify-center">
                <StepperItem
                  step={index + 1}
                  className="relative flex flex-col items-center text-center flex-1"
                >
                  <StepperTrigger className="flex flex-col items-center gap-">
                    <StepperIndicator
                      className="
    flex items-center justify-center
    w-10 h-10 rounded-full font-medium border-2 transition-all duration-200
    bg-white text-[#8B5E34] border-gray-500
    data-[state=active]:border-chestnut data-[state=active]:bg-[#F3E6DC] data-[state=active]:text-[#8B5E34] data-[state=active]:shadow-[0_0_8px_2px_rgba(139,94,52,0.3)]
    data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=completed]:border-[#21189226]
  "
                    >
                      {step.icon}
                    </StepperIndicator>

                    <StepperTitle className="text-sm font-medium text-gray-700 mt-1">
                      {step.status}
                    </StepperTitle>
                  </StepperTrigger>

                  {index < steps.length - 1 && (
                    <StepperSeparator className=" absolute top-5 left-[calc(50%+1.5rem)]  w-111.75 h-0.5 bg-gray-200 group-data-[state=completed]/step:bg-green-500 " />
                  )}
                </StepperItem>
              </div>
            ))}
          </StepperNav>
        </Stepper>
      </div>
    </div>
  );
};

export default StepperItemShared;
