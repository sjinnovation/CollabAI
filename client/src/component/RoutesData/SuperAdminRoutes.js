import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import { getUserRole } from "../../Utility/service";


const SuperAdminRoutes = () => {
    //  [TODO] : have to change later on to context, localstorage is not a safe idea
    const role = getUserRole();
    const location = useLocation();

    return (
        role && role === "superadmin" ? <Outlet /> : <Navigate to="/404" state={{ from: location }} replace /> 
    );
}

export default SuperAdminRoutes;