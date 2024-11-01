import React, { useContext, useEffect } from "react";
import Header from "../Header/Header";
import ThreadSidebarWrapper from "../../Prompt/ThreadSidebar/ThreadSidebarWrapper";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../footer/footer";
import { SidebarContext } from "../../../contexts/SidebarContext";

const MainContent = () => {
  const location = useLocation();
  const { showMenu, setShowMenu } = useContext(SidebarContext);

  useEffect(() => {
    if (
      // location?.pathname === "/public-assistant" ||
      location.pathname === "/chat" ||
      location.pathname.startsWith("/chat/") ||
      location.pathname.startsWith("/agents/")
    ) {
      return
    } else {
      setShowMenu(false);
    }
  }, [location, setShowMenu]);

  return (
    <>
      <div className="w-100 main-wrapper min-vh-100 d-flex flex-column justify-content-between flex-grow-1">
        <Header />
        <section className="flex-grow-1 d-flex z-0">
          {/* Sidebar for chat thread */}
          <div className={`thread-sidebar ${showMenu ? "open-sidebar" : ""}`}>
            <ThreadSidebarWrapper />
          </div>

          <div
            className={`main-chat-area-section flex-grow-1 ${
              showMenu ? "move-main-layout" : ""
            }`}
          >
            <Outlet />
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default MainContent;
