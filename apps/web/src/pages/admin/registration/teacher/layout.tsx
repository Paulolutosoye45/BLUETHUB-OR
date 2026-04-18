import { Outlet } from "react-router-dom"

const Teacherlayout = () => {
    return (
        <div>
            <div className="flex-1 p-8 min-h-screen bg-white/70 backdrop-blur-sm">
                <Outlet />
            </div>
        </div>
    )
}

export default Teacherlayout