import { Outlet } from "react-router-dom"

const AdminLayout = () => {
    return (
        <div>
            <div>
                <div>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout