import People from '@/assets/svg/people.svg?react'
import ClassRoomList from './class-room-list'
import { useEffect, useMemo, useState } from 'react'
import studentService, { type StudentSubjectItem } from '@/services/student'
import toast from 'react-hot-toast'
import { isStudentRoleData, useAuthContext } from '@/contexts/auth-context'
import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const StudentClassRoom = () => {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<StudentSubjectItem[]>([])

  const roleData = user?.roleData
  const studentRoleData = roleData && isStudentRoleData(roleData) ? roleData : null

  const roleBasedSubjects = useMemo<StudentSubjectItem[]>(() => {
    if (!studentRoleData) return []

    const major = (studentRoleData.majorSubjects ?? []).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      category: subject.subjectCategory,
      subjectType: 'Major' as const,
    }))

    const minor = (studentRoleData.minorSubjects ?? []).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      category: subject.subjectCategory,
      subjectType: 'Minor' as const,
    }))

    if (major.length + minor.length > 0) {
      const byId = new Map<string, StudentSubjectItem>()
        ;[...major, ...minor].forEach((subject) => {
          if (!byId.has(subject.subjectId)) {
            byId.set(subject.subjectId, subject)
          }
        })
      return Array.from(byId.values())
    }

    return (studentRoleData.subjects ?? []).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      category: subject.subjectCategory,
      subjectType: 'Major' as const,
    }))
  }, [studentRoleData])

  useEffect(() => {
    if (roleBasedSubjects.length > 0) {
      setSubjects(roleBasedSubjects)
      setLoading(false)
      return
    }

    const loadStudentSubjects = async () => {
      try {
        setLoading(true)
        const response = await studentService.getRegisteredSubjects()
        const data = response?.data?.data
        const mergedSubjects = [...(data?.major ?? []), ...(data?.minor ?? [])]
        setSubjects(mergedSubjects)
      } catch (error) {
        console.error('Failed to load student subjects:', error)
        toast.error('Unable to load your subjects from server. Showing profile data when available.')
        setSubjects(roleBasedSubjects)
      } finally {
        setLoading(false)
      }
    }

    void loadStudentSubjects()
  }, [roleBasedSubjects])

  const existingClassLabel = useMemo(() => {
    if (loading) return 'Loading...'
    return `${subjects.length} Subject${subjects.length === 1 ? '' : 's'}`
  }, [loading, subjects.length])

  return (
    <div className="border border-white rounded-2xl bg-white/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#D9D9D9] py-3 px-4">
        <div className="flex items-center gap-2">
          <People className="text-student-chestnut/75 w-5 h-5" />
          <h2 className="font-Poppins font-medium text-base leading-[100%] text-student-chestnut">Class-Room</h2>
        </div>
        <div className="flex items-center gap-4 justify-between md:justify-end">
          <div className="flex items-center gap-1 text-student-chestnut">
            <People className="w-5 h-5" />
            <span className="font-Poppins font-medium text-sm break-words">{existingClassLabel} </span>
          </div>
          <Link to="create" className="inline-flex items-center gap-1.5 bg-[#5C5FEF] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#4B4EDE] transition-colors cursor-pointer">
            <PlusIcon className="w-4 h-4" />
            New Class
          </Link>
        </div>
      </div>

      <div>
        <ClassRoomList loading={loading} subjects={subjects} />
      </div>
    </div>
  )
}

export default StudentClassRoom