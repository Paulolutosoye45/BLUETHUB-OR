import CourseList from "./course-list"



const MyCourse = () => {
  return (
    <div className="border border-blck-b2/20 rounded-[10px] bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]">
        <div className="flex items-center justify-between p-6 border-b border-blck-b2/20 pb-7">
          <h2 className="font-poppins font-medium text-base text-blck-b2 capitalize">My Course </h2>
          <p className="font-poppins font-medium text-sm leading-[100%] text-student-chestnut">View all </p>
        </div>
        <section className="px-10 py-7">
            <CourseList/>
        </section>
    </div>
  )
}

export default MyCourse