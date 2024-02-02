import React, { useContext } from 'react'
import NavContent from '../../Prompt/NavContent'
import { SidebarContext } from '../../../contexts/SidebarContext'
import './NewSidebar.css'
import NavContentDuplicate from '../../Prompt/NavContentDuplicate'

const NewSidebar = () => {
    const { triggerNavContent , showMenu } = useContext(SidebarContext);
    return (
        <>
            <aside className={ showMenu ? "sideMenuResponsive" : "sideMenu"}>
                {/* <NavContent
                    triggerUpdate={triggerNavContent}
                /> */}
                <NavContentDuplicate
                    triggerUpdate={triggerNavContent}
                />
            </aside>
        </>
    )
}

export default NewSidebar