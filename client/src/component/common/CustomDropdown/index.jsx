import React from 'react'
import "./style.scss"
const CustomDropdown = ({children, openCustomDropdown, setOpenCustomDropdown}) => {
  return (
    <div onMouseOver={() => setOpenCustomDropdown(true)} onMouseLeave={() => setOpenCustomDropdown(false)} className={`custom-dropdown-wrapper ${openCustomDropdown ? 'show-main-wrapper ' : ''}`}>
        {children}
    </div>
  )
}

export default CustomDropdown