
const Card = () => {
  return (
    <div>
         <div className="px-[18px] space-y-1 pt-[17px]">
           <div className="flex items-center justify-between">
                <h3 className="text-[#0A5C43] font-bold text-[10px] rounded-[6px] bg-[#E6F7F2] py-1 px-2">SYL-2025-019</h3>
                <div className="flex items-center gap-1.5 bg-[#E6F7F2] rounded-[20px] py-1 px-2.5">
                    <span className="w-[5px] h-[5px]  rounded-full p-[5px]"></span>
                        <h3 className="text-[#0A5C43] font-medium text-xs">Attached </h3>
                </div>
           </div>

           <div className="py-[5px]">
             <h2 className="text-[#0F0F0E]  font-semibold text-sm leading-5">Basic Science Mid-term</h2>
           </div>
           <div>
            <p className="text-[#A0A09C] font-normal text-xs">Photosynethsis  ·  JSS 2A  ·  30mintues </p>
           </div>
           <div className="pt-2 flex items-center gap-2">
                <div className="bg-[#F4F4F0] rounded-[8px] py-2  px-2.5">
                    <h2 className="text-[#0F0F0E] font-bold text-[15px]">10</h2>
                    <p className="text-[#A0A09C] font-normal  text-[10px]">Questions </p>
              </div>
                <div className="bg-[#F4F4F0] rounded-[8px] py-2  px-2.5">
                    <h2 className="text-[#0F0F0E] font-bold text-[15px]">30</h2>
                    <p className="text-[#A0A09C] font-normal  text-[10px]">Students  </p>
              </div>
                <div className="bg-[#F4F4F0] rounded-[8px] py-2  px-2.5">
                    <h2 className="text-[#0F0F0E] font-bold text-[15px]">12 Apr 2026</h2>
                    <p className="text-[#A0A09C] font-normal  text-[10px]">Date </p>
              </div>
           </div>
         </div> 
            <div className="bg-[#F4F4F0] border border-[#E8E8E3] flex justify-end items-center py-3 px-[18px] gap-[30px]">
                    <button className="bg-white  border border-[#E8E8E3] rounded-[7px] py-[5px] px-3">
                        <span className="text-[#5A5A5A] font-medium text-xs">View Details</span>
                </button>
                    <button className="bg-chestnut   rounded-[7px] py-[5px] px-3">
                        <span className="text-white font-medium text-xs">Copy ID</span>
                </button>
         </div>
    </div>
  )
}

export default Card