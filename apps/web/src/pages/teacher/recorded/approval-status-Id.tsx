import { Button } from "@bluethub/ui-kit";
import {Clock5 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import W_icon from "@/assets/svg/w-vect.svg?react";

import { ClassSubmissionSummary } from "@/shared/class-submission-summary";
import StepperItemShared from "@/shared/stepper-item";
import AttachedMedia from "./attached-media";
import TitleBar from "@/shared/title-bar";

const ApprovalStatusId = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="max-w-6xl mx-auto rounded-xl shadow-lg bg-white overflow-hidden mt-5">
        <TitleBar title="Check Class Approval Portal" hasBackIcons={true} onBack={() => navigate(-1)} />

        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-chestnut text-xl">
              Approval Status{" "}
            </h2>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 rounded-md bg-[#FFC983] border-none hover:bg-[#FFB956] p-2.5"
            >
              <Clock5 className="w-4 h-4 text-[#B66E10]" />
              <span className="text-[#AC6100] font-semibold text-sm">
                Pending Approval
              </span>
            </Button>
          </div>

          <div className="p-2">
            <p className="font-medium text-chestnut text-base leading-7.5">
              Your class submission is under review.
            </p>
          </div>

          <div className="my-6.25 flex items-start gap-3 bg-[#2118921A] border border-[#21189226] rounded-lg p-4">
            <W_icon className="w-6 h-6" />
            <p className="text-[#211892] font-medium text-sm leading-7.5">
              Your class materials have been submitted successfully. Our admin
              team is reviewing them. You'll be notified once approved.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="rounded-xl border border-[#21189226] mt-7.75">
                <ClassSubmissionSummary
                  title="Basic 8 Love"
                  topic="Algebra"
                  subject="Mathematics"
                  aim={[
                    "The aim of teaching algebra is to build students’ understanding of mathematical symbols, expressions, and relationships.",
                    "It helps learners develop logical thinking and problem-solving skills.",
                    "Students learn to model real-life situations using equations and formulas.",
                    "The goal is to make abstract thinking accessible and useful.",
                    "Algebra also prepares students for advanced math and everyday applications.",
                  ]}
                  media={{ videos: 3, pdfs: 1 }}
                  submittedOn="Aug 28, 2025"
                  dateTime="Sept 15, 2025/10:am"
                  status="Pending"
                />
              </div>
            </div>

            <div>
              <StepperItemShared />
            </div>

            <div>
              <AttachedMedia />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button className=" border border-[#AC6100]   px-6 py-3 font-medium text-sm rounded-md cursor-pointer">
                <span className="text-[#AC6100] font-medium text-base">
                  Cancel Class
                </span>
              </button>

              <button className="bg-chestnut  px-4 py-3  font-medium text-sm rounded-md cursor-pointer">
                <span className="text-white font-medium text-base">
                  Submitted For Approval
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatusId;
