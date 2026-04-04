import People from '@/assets/svg/people.svg?react'
import PlusIcon from '@/assets/svg/plus.svg?react'
import { Link } from 'react-router-dom'
import ClassRoomList from './class-room-list'
const StudentClassRoom = () => {
  return (
    <div className="my-10 border border-white  rounded-2xl">
      <div className="flex items-center justify-between border-b border-[#D9D9D9] py-3 px-4">
        <div className="flex items-center gap-2">
          <People className="text-student-chestnut/75 w-5 h-5" />
          <h2 className="font-Poppins font-medium text-base leading-[100%] text-student-chestnut">Class-Room</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-student-chestnut">
            <People className="w-5 h-5" />
            <span className="font-Poppins font-medium text-sm">Existing Class</span>
          </div>
          <Link to="/student/class-room/create" className="bg-student-chestnut hover:bg-[#3A4FE8] text-white rounded-md px-4 py-2 font-Poppins flex items-center gap-1">
            
            <PlusIcon className='font-medium size-3' />
            <span>
              New Class
            </span>
            </Link>
        </div>
      </div>

      <div>
        <ClassRoomList />
      </div>
    </div>
  )
}

export default StudentClassRoom