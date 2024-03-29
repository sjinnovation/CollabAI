import { FaGraduationCap } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../Hooks/useAuth";
import { logout } from "../../../Utility/service";
const TUTORIAL_LEADSLIFT_URL = "https://app.leadslift.io/v2/preview/xMSsbHd2lmnOHaZXBadB?notrack=true";


const CommonNavLinks = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const handleLogout = () => {
        setAuth({
            role: "",
            loggedIn: false,
        });
        logout();
        navigate("/login", { replace: true });
    };
    return (
        <div>
            <a
                href={TUTORIAL_LEADSLIFT_URL}
                className="text-decoration-none"
                target="_blank"
            >
                <div className="navPrompt small">
                    <FaGraduationCap size={25} color="white"/>
                    <p>Tutorial </p>
                </div>
            </a>
            <a
                href="https://connect.sjinnovation.us/widget/form/4URspcWxEmhPBoUEz7Q7 "
                className="text-decoration-none"
                target="_blank"
            >
                <div className="navPrompt small">
                    <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        width={25}
                        height={25}
                    >
                        <path
                            stroke="#fff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5m-6 0 7.5-7.5M15 3h6v6"
                        />
                    </svg>
                    <p>
                        Submit Feedback{" "}
                        <i className="bi bi-heart-fill"></i>
                    </p>
                </div>
            </a>

            <Link className="text-decoration-none" onClick={handleLogout}>
                <div className="navPrompt small">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width={22}
                        height={22}

                    >
                        <path
                            d="m16 17 5-5m0 0-5-5m5 5H9m0-9H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21H9"
                            stroke="#fff"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <p>Log Out</p>
                </div>
            </Link>
        </div>
    )
}

export default CommonNavLinks;
