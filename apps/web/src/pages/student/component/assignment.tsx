import AssignmentList from "./assignment-list"



const Assignment = () => {
  return (
    <div className="overflow-hidden rounded-md border border-white/75 bg-white/82">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="font-poppins text-sm font-semibold text-slate-900 capitalize">Recent Assignments</h2>
            <p className="mt-0.5 text-xs text-slate-500">Deadlines and submission status.</p>
          </div>
          <button type="button" className="rounded-full bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#b97700] transition-colors hover:bg-[#ffecbf]">View all</button>
        </div>
        <section className="px-4 py-3 md:px-4 md:py-3">
            <AssignmentList/>
        </section>
    </div>
  )
}

export default Assignment