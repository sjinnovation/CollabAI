import { useContext } from "react";
import NewAuthContext from "../contexts/NewAuthProvider";

const useAuth = () => {
    return useContext(NewAuthContext);
}

export default useAuth;