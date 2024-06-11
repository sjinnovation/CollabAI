import { Route, Navigate, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Spin } from "antd";
import { getRoleOfUser } from "../../api/userApiFunctions";
import { getAssistantInfo } from "../../api/assistantApiFunctions";
import { getUserID, isLoggedIn } from "../../Utility/service";
import { CustomSpinner } from "../common/CustomSpinner";
// ProtectedRoute component
const ProtectedRoutes = () => {
    const [userRole, setUserRole] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkUser, setCheckUser] = useState(false);
    const [organizational, setIsOrganizational] = useState(false);

    const { assistant_id } = useParams();
    const userId = getUserID();


    useEffect(() => {
        getRoleOfUser(userId, userRole, setUserRole, setIsPublic);

    }, []);

    useEffect(() => {
        getAssistantInfo(userId, assistant_id, setCheckUser, setIsPublic, setLoading, setIsOrganizational);
    }, []);

    if (userRole === null) {
        return <CustomSpinner/>
    }

    return (
        <div>
            {(loading && isLoggedIn()) ? (
                <CustomSpinner/>
            ) : (
                ((checkUser == true || userRole == "superadmin" || isPublic == true || organizational === true) ? <Outlet /> : ((isLoggedIn()) ? <Navigate to="*" /> : <Navigate to="/login" />))


            )}
        </div>


    );
};

export default ProtectedRoutes;
