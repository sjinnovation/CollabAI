import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { isLoggedIn } from "../../Utility/service";
import { CustomSpinner } from "../common/CustomSpinner";

const ProtectedRouteFeature = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate an async check if needed
        const checkLoginState = async () => {
            setLoading(false); // Assume no additional checks for roles or assistants
        };
        checkLoginState();
    }, []);

    if (loading) {
        return <CustomSpinner />;
    }

    // Redirect to login if the user is not logged in
    return isLoggedIn() ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRouteFeature;
