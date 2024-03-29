import { createContext, useState } from "react";
import { getUserRole } from "../Utility/service";

const NewAuthContext = createContext({});

export const NewAuthProvider = ({ children }) => {
    let role = getUserRole();
    const [auth, setAuth] = useState({
        role,
    });

    return (
        <NewAuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </NewAuthContext.Provider>
    )
}

export default NewAuthContext;