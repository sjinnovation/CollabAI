import React, { useContext, useEffect, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { axiosOpen,axiosSecure,axiosSecureInstance } from "../../../api/axios";
import logo from "../../../assests/images/product-logo.png";
import { SidebarContext } from "../../../contexts/SidebarContext";
import { getUserID } from "../../../Utility/service";
import { FiUsers } from 'react-icons/fi';
import { SlOrganization } from 'react-icons/sl';
import "./Sidebar.css";
import "./Sidebar.scss";
const Sidebar = () => {
  const [role, setRole] = useState('');
  const { activeMenu, setActiveMenu } = useContext(SidebarContext);
  const userId = getUserID();

  useEffect(() => {
    async function fetchData() {
      const userid = {
        userId: userId
      }
      const response = await axiosSecureInstance.post("api/user/getSingleUser", userid);
      setRole(response?.data?.user?.role);
    } fetchData();


  }, [])

  return (
    <div
      className={
        activeMenu ? "sidebar d-flex bg-dark hide" : "sidebar d-flex bg-dark"
      }
    >
      <div className="d-flex flex-column flex-shrink-0 px-3 text-white w-100">
        <a
          href="/"
          className="d-flex align-items-center justify-content-center mt-3 mb-4"
        >
          <img alt="Sorted Rack" src={logo} width="140px" />
        </a>
        <nav className="h-100vh">
          <ul className="nav nav-pills flex-column mb-auto">
            {/* <li className="nav-item">
              <NavLink
                end={true}
                to="/"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span>  Dashboard</span>
              </NavLink>
            </li> */}
            <li>
              {role === 'admin' ? (
                //               <NavLink
                //               to="/apikey"
                //               className={({ isActive }) =>
                //                 `nav-link text-white ${isActive ? "active" : undefined}`
                //               }
                //             >
                //  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                //               <span>  ChatGPT API Key</span>
                //             </NavLink>
                (null)
              ) : (null)}

            </li>
            {/* Normal User and not Super Admin */}
            {role !== "superadmin" ? (<>
            
            <li>
              <NavLink
                to="/prompt"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" /><circle cx="12" cy="10" r="3" /><circle cx="12" cy="12" r="10" /></svg>
                  <span>Ask Anything</span>
                </div>
              </NavLink>
            </li>
            {/* <li>
              <NavLink
                to="/promptlist"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
                  <span>Saved Queries</span>
                </div>
              </NavLink>
            </li>

            
            <li>
              <NavLink
                to="/proposalform"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >

                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                  <span>Proposal</span>
                </div>
              </NavLink>
            </li>
            <li>
            <NavLink
                    to="/feedback"
                    className={({ isActive }) =>
                      `nav-link text-white ${isActive ? "active" : undefined}`
                    } isActive
                  >
                   <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg> */}
            {/*<svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 128 128" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"><path class="cls-1" d="M126.03175,23.0913v-.00012a1.694,1.694,0,0,0-1.394-1.17444l-9.04778-1.31192-4.04869-8.19837a1.726,1.726,0,0,0-3.09558.00086l-4.044,8.20009-9.04778,1.31722a1.72629,1.72629,0,0,0-.95558,2.94454l6.549,6.3803L99.404,40.26137a1.69349,1.69349,0,0,0,.68678,1.688,1.71678,1.71678,0,0,0,1.81843.13058l8.091-4.25658,8.09418,4.25275a1.7259,1.7259,0,0,0,2.50349-1.82016l-1.54816-9.01129,6.54577-6.38363A1.69418,1.69418,0,0,0,126.03175,23.0913Z"/><path class="cls-1" d="M54.95051,31.24922l-1.54323,9.0119a1.69362,1.69362,0,0,0,.687,1.68774,1.71593,1.71593,0,0,0,1.81769.13107l8.092-4.25658,8.09393,4.25251a1.72572,1.72572,0,0,0,2.50349-1.81979l-1.54791-9.01166,6.54528-6.38363a1.72593,1.72593,0,0,0-.95681-2.944l-9.04852-1.31192L65.545,12.40646a1.7261,1.7261,0,0,0-3.09558.00062l-4.04425,8.20034-9.04778,1.31722a1.72619,1.72619,0,0,0-.95558,2.94454Z"/><path class="cls-1" d="M32.64477,21.91674l-9.048-1.31192L19.5483,12.40646a1.726,1.726,0,0,0-3.09558.00086l-4.044,8.20009-9.048,1.31722a1.72622,1.72622,0,0,0-.95558,2.94454l6.549,6.38043L7.41061,40.26137a1.73364,1.73364,0,0,0,1.69612,2.02176h.00049a1.72231,1.72231,0,0,0,.8091-.2032l8.09122-4.25633,8.09418,4.25251a1.72584,1.72584,0,0,0,2.50349-1.82078L27.057,31.24441l6.54577-6.38363a1.72633,1.72633,0,0,0-.958-2.944Z"/><path class="cls-2" d="M95.81357,80.26779,70.679,72.13466,68.76023,51.58545a4.08882,4.08882,0,0,0-1.21214-3.03425l-.05-.05031a4.33542,4.33542,0,0,0-7.48017,2.95819L59.864,91.56471l-.31181,4.33023-6.56474-5.78556c-.19876-.19768-4.94831-4.852-9.84307-1.84536l-.00986.00649a1.12951,1.12951,0,0,0-.29436,1.64457c3.12748,4.10624,15.13841,19.16413,15.13841,19.16413a19.52621,19.52621,0,0,0,15.02192,7.34853l8.69063.12615A13.34243,13.34243,0,0,0,94.956,105.85829L99.18782,84.895A4.85037,4.85037,0,0,0,95.81357,80.26779Z"/></svg>
                <span>Feedback</span>
                </div>
                  </NavLink>
            </li>
            <li>
              <NavLink
                to="/portfolio"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                  <span>Portfolio</span>
                </div>
              </NavLink>
             </li>/ */}
            </>):null}
            {/* <li>
              <NavLink
                to="/list/company"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon></svg>
                <span>  Company</span>
              </NavLink>
            </li> */}

            {/* <li>
              {role === 'admin' ? (
                <>
                  <NavLink
                    to="plan-list"
                    className={({ isActive }) =>
                      `nav-link text-white ${isActive ? "active" : undefined}`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
                    <span> Choose Plan</span>
                  </NavLink>
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `nav-link text-white ${isActive ? "active" : undefined}`
                    } isActive
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span>  User</span>
                  </NavLink>

                    

                  <NavLink
                to="/proposal-list"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                <span>Proposal List</span>
                </div>
              </NavLink>
            
              <NavLink
                to="/feedbacklist"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 128 128" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"><path class="cls-1" d="M126.03175,23.0913v-.00012a1.694,1.694,0,0,0-1.394-1.17444l-9.04778-1.31192-4.04869-8.19837a1.726,1.726,0,0,0-3.09558.00086l-4.044,8.20009-9.04778,1.31722a1.72629,1.72629,0,0,0-.95558,2.94454l6.549,6.3803L99.404,40.26137a1.69349,1.69349,0,0,0,.68678,1.688,1.71678,1.71678,0,0,0,1.81843.13058l8.091-4.25658,8.09418,4.25275a1.7259,1.7259,0,0,0,2.50349-1.82016l-1.54816-9.01129,6.54577-6.38363A1.69418,1.69418,0,0,0,126.03175,23.0913Z"/><path class="cls-1" d="M54.95051,31.24922l-1.54323,9.0119a1.69362,1.69362,0,0,0,.687,1.68774,1.71593,1.71593,0,0,0,1.81769.13107l8.092-4.25658,8.09393,4.25251a1.72572,1.72572,0,0,0,2.50349-1.81979l-1.54791-9.01166,6.54528-6.38363a1.72593,1.72593,0,0,0-.95681-2.944l-9.04852-1.31192L65.545,12.40646a1.7261,1.7261,0,0,0-3.09558.00062l-4.04425,8.20034-9.04778,1.31722a1.72619,1.72619,0,0,0-.95558,2.94454Z"/><path class="cls-1" d="M32.64477,21.91674l-9.048-1.31192L19.5483,12.40646a1.726,1.726,0,0,0-3.09558.00086l-4.044,8.20009-9.048,1.31722a1.72622,1.72622,0,0,0-.95558,2.94454l6.549,6.38043L7.41061,40.26137a1.73364,1.73364,0,0,0,1.69612,2.02176h.00049a1.72231,1.72231,0,0,0,.8091-.2032l8.09122-4.25633,8.09418,4.25251a1.72584,1.72584,0,0,0,2.50349-1.82078L27.057,31.24441l6.54577-6.38363a1.72633,1.72633,0,0,0-.958-2.944Z"/><path class="cls-2" d="M95.81357,80.26779,70.679,72.13466,68.76023,51.58545a4.08882,4.08882,0,0,0-1.21214-3.03425l-.05-.05031a4.33542,4.33542,0,0,0-7.48017,2.95819L59.864,91.56471l-.31181,4.33023-6.56474-5.78556c-.19876-.19768-4.94831-4.852-9.84307-1.84536l-.00986.00649a1.12951,1.12951,0,0,0-.29436,1.64457c3.12748,4.10624,15.13841,19.16413,15.13841,19.16413a19.52621,19.52621,0,0,0,15.02192,7.34853l8.69063.12615A13.34243,13.34243,0,0,0,94.956,105.85829L99.18782,84.895A4.85037,4.85037,0,0,0,95.81357,80.26779Z"/></svg>
             
                  <span>Feedbacklists</span>
                </div>
              </NavLink>
             */}
                  {/* <NavLink
                                            to="/plans"
                                            className={({ isActive }) =>
                                              `nav-link text-white ${isActive ? "active" : undefined}`
                                            }
                                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                            <span>  Subscription Plans</span>
                                          </NavLink>                               */}
                  {/* <span><DropdownButton className="sidemenulist" id="dropdown-basic-button" title="Settings">


                    <Dropdown.Item ><NavLink to="/list/company">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon></svg>
                      <span> Company</span></NavLink></Dropdown.Item> */}

                    {/* <Dropdown.Item ><NavLink to="/apikey">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>  Open AI Api Key</span></NavLink></Dropdown.Item> */}



                  {/* </DropdownButton>
                  </span> */}


                  {/* <NavLink
                                                 to="/from"
                                                 className={({ isActive }) =>
                                                   `nav-link text-white ${isActive ? "active" : undefined}`

                                                 }

                                               >
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                                 <span>  Configuration </span>

                                               </NavLink> */}


                {/* </>

              ) : (null)}

            </li>

            {
              role === "superadmin" && (
                <>
                  <li>
                    <NavLink
                      to="/superadmin/users"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active" : undefined}`
                      }
                    >
                      <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                        <FiUsers style={{
                          "fontSize": "1.5rem"
                        }} />
                        <span>Users</span>
                      </div>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/superadmin/companies"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active" : undefined}`
                      }
                    >
                      <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                        <SlOrganization style={{
                          "fontSize": "1.5rem"
                        }} />
                        <span>Companies</span>
                      </div>
                    </NavLink>
                  </li>

                </>



              )
            } */}

            {/* <li>
              <NavLink
                to="/techstack"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active" : undefined}`
                }
              >
                <div className="d-flex align-items-center" style={{ "columnGap": "0.5rem" }}>
                  <FiUsers style={{
                    "fontSize": "1.5rem"
                  }} />
                  <span>Tech stack</span>
                </div>
              </NavLink>
            </li> */}

          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
