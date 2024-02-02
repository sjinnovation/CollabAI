import { useEffect, useState, useContext } from "react";
import { getUserID } from "../../Utility/service";
import { CgProfile } from "react-icons/cg";
import { Dropdown, Menu } from 'antd';
import { AssistantContext } from "../../contexts/AssistantContext";
import AssistantList from "../layout/NewSidebar/AssistantList";
import CommonNavLinks from "../layout/NewSidebar/CommonNavLinks";
import UserNavLinks from "../layout/NewSidebar/UserNavLinks";
import AdminNavLinks from "../layout/NewSidebar/AdminNavLinks";
import SuperAdminNavLinks from "../layout/NewSidebar/SuperAdminNavLinks";
import { getUserData } from "../../api/userApiFunctions";
import { getAssistants } from "../../api/assistantApiFunctions";



const NavLinksContainer = ({ chatLog, setChatLog }) => {

    const userName = localStorage.userName && localStorage.userName;
    const [role, setRole] = useState("");

    const userId = getUserID();

    // -------------------- Hooks/Contexts -----------------------
    const {
      assistants,
      setAssistants,
      totalPage,
      setTotalPage,
      page,
      setPage,
      loading,
      setLoading,
      handleFetchAssistants,
    } = useContext(AssistantContext);
      console.log("🚀 ~ NavLinksContainer ~ assistants:", assistants)

    // -------------------- Side Effects -----------------------

    useEffect(() => {
        handleFetchUserData();
    }, []);

    //------------------ API Calls -----------------------------

    const handleFetchUserData = async () => {
        try {
          const { success, data, error } = await getUserData(userId, setRole);
          if (success) {
            console.log("User Role:", data);
          } else {
            console.error("Error fetching user data:", error);
          }
        } finally {
          
        }
      };

    //---------------------- Nav Links ---------------------
    const menu = (
        <Menu>
            {role === 'superadmin' && (
                <>
                    <Menu.Item key="superadmin">
                        <SuperAdminNavLinks />
                    </Menu.Item>
                </>
            )}

            {role === 'admin' && (
                <>
                    <Menu.Item key="admin">
                        <AdminNavLinks />
                    </Menu.Item>
                </>
            )}

            {role === 'user' && (
                <>
                    <Menu.Item key="user">
                        <UserNavLinks />
                    </Menu.Item>
                </>
            )}

            
            <Menu.Item key="common">
                <CommonNavLinks />
            </Menu.Item>
        </Menu>
    );



    return (
        <div
            className="navLinks bottom-navLinks"
            style={{
                padding: "0.875rem",
                width: "100%",
            }}
        >
            <div>
                <AssistantList propsData={{
                    assistants,
                    page,
                    totalPage,
                    loading,
                    actions: {
                        setPage
                    }
                }}
                />
            </div>

            <Dropdown 
            overlay={menu} 
            placement="top"  
            className="user-btn"
            trigger={['click']}
            >
                <div className="ant-dropdown">
                <>
                <CgProfile size={22} color="white"/>
                    {userName && userName}
                
                </>  
                </div>
            </Dropdown>
         
        </div>
    );
};

export default NavLinksContainer;
