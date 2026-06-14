import CourseList from "./course-list"



const MyCourse = () => {
  return (
    <div className="overflow-hidden rounded-md border border-white/75 bg-white/82  backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-poppins text-lg font-semibold text-slate-900 capitalize">My Courses</h2>
            <p className="mt-1 text-sm text-slate-500">Track progress across your active subjects.</p>
          </div>
          <button type="button" className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-[#4F61E8] transition-colors hover:bg-[#e0e7ff]">View all</button>
        </div>
        <section className="px-5 py-5 md:px-6 md:py-6">
            <CourseList/>
        </section>
    </div>
  )
}

export default MyCourse