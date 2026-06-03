import AssignmentList from "./assignment-list"



const Assignment = () => {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/75 bg-white/82 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-poppins text-lg font-semibold text-slate-900 capitalize">Recent Assignments</h2>
            <p className="mt-1 text-sm text-slate-500">Keep an eye on deadlines and submission status.</p>
          </div>
          <button type="button" className="rounded-full bg-[#fff4dc] px-4 py-2 text-sm font-semibold text-[#b97700] transition-colors hover:bg-[#ffecbf]">View all</button>
        </div>
        <section className="px-5 py-5 md:px-6 md:py-6">
            <AssignmentList/>
        </section>
    </div>
  )
}

export default Assignment