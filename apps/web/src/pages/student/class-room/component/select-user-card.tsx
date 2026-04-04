import { useState } from "react"
import { Checkbox } from "@bluethub/ui-kit"
import test_profile from "@/assets/png/test_profile.png"

const SelectUserCard = ({ name }: { name: string }) => {
  const [selected, setSelected] = useState(false)

  return (
    <div
      onClick={() => setSelected(!selected)}
      className={`border-2 rounded-lg px-4 py-2 cursor-pointer transition-all duration-200 
        ${selected ? "border-student-chestnut" : "border-[#3A3A3A40]"}`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => setSelected(!!checked)}
          className="cursor-pointer"
        />
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full overflow-hidden">
            <img
              src={test_profile}
              alt={name}
              className="object-cover w-full h-full"
            />
          </div>
          <p className="font-normal text-sm text-gray-800">{name}</p>
        </div>
      </div>
    </div>
  )
}

export default SelectUserCard