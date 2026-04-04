import People from '@/assets/svg/people.svg?react'
import { Input, Label , Button, Slider} from '@bluethub/ui-kit'
import PlusIcon from '@/assets/svg/plus.svg?react'
import Upload from "@/assets/svg/upload.svg?react"
import Pdf from "@/assets/png/Pdf.png"
import { useState } from 'react'
import { X, CalendarDays } from "lucide-react"
import UnderReview from './component/under-review'
import SelectUserCard from './component/select-user-card'



const CreateclassRoom = () => {
 const [openVerify, setOpenVerify] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(2)
  const [maxUploads] = useState(3)
  const [usedSpace, setUsedSpace] = useState(15)
  const [totalSpace] = useState(20)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const uploaded = Math.min(uploadedCount + files.length, maxUploads)
    setUploadedCount(uploaded)
    setUsedSpace(Math.min(usedSpace + files.length * 5, totalSpace)) // dummy calc
  }
  const MAX_CLASSES = 5;
  const createdClasses = 3
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 my-2.5">
      <div className="flex items-center justify-center flex-col text-center">
        <div className="my-2.5 p-1.75 rounded-[17.15px] text bg-[#4F61E833]">
          <People className='text-student-chestnut' />
        </div>
        <div>
          <h2 className='font-semibold text-base'>Create a New Class Group </h2>
          <p className='font-medium text-xs'>Set up your classroom with students and resources</p>
        </div>
      </div>

      <div className='my-2'>
        <h1 className='font-semibold text-base text-student-chestnut'>Class Details</h1>
        <div className='my-2.5 p-1 grid grid-cols-2 w-full  items-center gap-3'>
          <div>
            <Label htmlFor="Scholars_Squad" className="font-normal text-sm text-zinc-950 mb-2.5 block">
              Class Group Name <span className='text-red-700'>*</span>
            </Label>
            <Input
              id="Scholars_Squad"
              type="Scholars_Squad"
              className="border border-zinc-200 font-normal text-sm placeholder:text-[#71717A]"
              placeholder="Scholars Squad"
            />
          </div>

          <div>
            <Label htmlFor="Scholars_Squad" className="font-normal text-sm text-zinc-950 mb-2.5 block">
              Subject or Focus Area <span className='text-red-700'>*</span>
            </Label>
            <Input
              id="Scholars_Squad"
              type="Scholars_Squad"
              className="border border-zinc-200 font-normal text-sm placeholder:text-[#71717A]"
              placeholder="Scholars Squad"
            />
          </div>
        </div>
      </div>


      <div className='p-1.25'>
        <div className='p-2.5 mb-2.5'>
          <p className='font-medium text-blck-b2 text-xs leading-[100%]'>
            Number Of ClassRooms (Max:5)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[createdClasses / MAX_CLASSES * 100]}
            max={100}
            step={1}
            className="text-student-chestnut flex-1"
            disabled
          />
          <Button
            className="bg-student-chestnut hover:bg-[#3A4FE8] text-white rounded-md px-4 py-2 font-Poppins flex items-center gap-1"
          >
            <span>{createdClasses} Class Created</span>
            <span>/ {MAX_CLASSES} Max</span>
          </Button>
        </div>
      </div>


      <div className='my-2.5'>
        <div className='p-2.5 mb-2.5 font-semibold text-base leading-[100%] text-student-chestnut'><p>Select Student</p> </div>
        <div className='mb-2 flex items-center justify-between py-1'>
          <h3 className=' font-medium text-xs '>Select Student to Add</h3>
          <h3 className=' font-medium text-xs '>Selected 12 out of 60 Students</h3>
        </div>

        <div className='rounded-lg border border-[#3A3A3A80] mb-6.75 p-6'>
          <div className="flex w-175 items-center gap-2 mb-3">
            <Input type="email" placeholder="Search student by name or grad...." className='font-normal tex-[#3A3A3A80]' />
            <Button className="bg-student-chestnut hover:bg-[#3A4FE8] text-white rounded-md px-4 py-2 font-Poppins flex items-center gap-1">

              <PlusIcon className='font-medium size-3' />
              <span>
                Add All
              </span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4  bg-gray-50 mt-4">
            {Array.from({ length: 4 }).map(() => (<SelectUserCard name="Stella Williams" />))}
          </div>
        </div>
      </div>



      <div className="mb-6">
        <div className="p-2.5 my-2.5">
          <h2 className="font-semibold text-student-chestnut text-base">
            Upload Media <span className="text-gray-400 font-normal">(optional)</span>
          </h2>
        </div>

        <h2 className="font-medium text-xs leading-5 text-blck-b2` mb-1.5">
          Upload Media
        </h2>

        <label
          htmlFor="file-upload"
          className="cursor-pointer block border-2 border-dashed border-[#D1D5DB] rounded-lg hover:border-student-chestnut transition-all"
        >
          <div className="max-w-sm mx-auto px-4 py-10 text-center">
            <Upload className="mx-auto text-[#0FAFFF] w-8 h-8 mb-3" />
            <p className="text-xs">
              <span className="font-medium text-student-chestnut hover:underline">
                Click to upload
              </span>{" "}
              <span className="text-[#4B5563] font-normal">or drag and drop</span>
            </p>
            <p className="text-[#6B7280] font-medium text-xs mt-1">
              Supported: Images, PDF, Videos
            </p>

            <div className="flex justify-center items-center gap-3 mt-4">
              <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-md">
                ✅ {uploadedCount} / {maxUploads} Uploaded
              </span>
              <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-md">
                ✅ Used {usedSpace}Mb / {totalSpace}Mb
              </span>
            </div>
          </div>
        </label>

        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="space-y-4 mt-4">
        {/* ===== Uploaded File Card ===== */}
        <div className="flex items-center justify-between bg-[#4F61E80D] border border-[#E5E7EB] rounded-md p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0">
              <img src={Pdf} alt="PDF Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1F2937]">Physics_Notes.PDF</p>
              <p className="text-xs text-gray-500">2.5 MB</p>
            </div>
          </div>

          <button
            className="text-red-500 hover:text-red-600 transition"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        <div className="mb-6">
          <div className="p-2.5 my-2.5">
            <h2 className="font-semibold text-student-chestnut text-base">
              Class Expiration
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F1E7] border border-[#FFAB3E] px-7 py-4 rounded-md">
            <CalendarDays className="w-5 h-5 text-[#D97706]" />
            <p className="text-sm text-[#92400E] font-medium">
              This class will automatically expire in{" "}
              <span className="font-semibold">10 days</span>
            </p>
          </div>
        </div>
      </div>


      <div className='flex items-center justify-end gap-2 mt-10 '>
        <Button className='rounded-lg  text-[#EC1B2C] bg-white border border-[#EC1B2C] py-5 px-11.25 hover:bg-white cursor-pointer'>Cancel </Button>
        <Button onClick={() => setOpenVerify(true)} className="bg-student-chestnut hover:bg-[#3A4FE8] text-white rounded-md p-5 font-Poppins flex items-center gap-1 cursor-pointer ">

          <PlusIcon className='font-medium size-3' />
          <span>
            Create Class
          </span>
        </Button>
      </div>

       <UnderReview openVerify={openVerify} onOpenChange={setOpenVerify} />
    </div>
  )
}

export default CreateclassRoom