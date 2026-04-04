import VideoLessonList from "./component/video-list"


const ClassView = () => {
    return (
        <div className="space-y-7 pb-5">
            {/* Sub-Topic */}
            <section className="border border-blck-b2/20 rounded-[10px] bg-white shadow-[0_5px_10px_0_rgba(41,35,130,0.1)]">
                <div className="flex items-center justify-between px-10 py-4">
                    <h2 className="font-poppins font-medium text-base text-blck-b2 capitalize">Sub-Topic </h2>
                    <p className="font-poppins font-medium text-sm leading-[100%] text-student-chestnut">View all </p>
                </div>
            </section>
            <div className="h-screen overflow-y-scroll pb-7   [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar]:h-2.5 
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-400
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <VideoLessonList />
            </div>
            
        </div>
    )
}

export default ClassView