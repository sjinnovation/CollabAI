import { CgProfile } from "react-icons/cg";
import { FaRegTrashAlt } from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { LuSettings2 } from "react-icons/lu";
import { TbApps } from "react-icons/tb";

export const getProfilePageSideMenuItems = (role) => {
    const items = [
        {
            key: '1',
            icon: <CgProfile className="me-2" />,
            label: 'My Profile',
        },
        {
            key: '2',
            icon: <FaRegTrashAlt className="me-2" />,
            label: 'Deleted Threads',
        },
        {
            key: '3',
            icon: <HiOutlineDocumentReport className="me-2" />,
            label: 'Personal Usage Reports',
        },
        {
            key: '4',
            icon: <IoChatboxEllipsesOutline className="me-2" />,
            label: 'Customize Chat',
        },
        {
            key: '5',
            icon: <LuSettings2 className="me-2" />,
            label: 'AI Model Configuration',
        },
        {
            key: '6',
            icon: <TbApps className="me-2" />,
            label: 'Integrated Apps',
        }
    ];

    return items;
}; 