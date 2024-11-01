import { useLocation, Navigate, Outlet } from "react-router-dom";
import SidebarContextProvider, {
  SidebarContext,
} from "../../contexts/SidebarContext";
import PromptTemplateContextProvider from "../../contexts/PromptTemplateContext";
import AssistantContextProvider from "../../contexts/AssistantContext";
import { Footer, Header, MainContent } from "../../component";
import { isLoggedIn } from "../../Utility/service";
import NewSidebar from "../../component/layout/NewSidebar/NewSidebar";
import WelcomeCard from "../../component/Welcome-Card/WelcomeCard.js";
import { AssistantFetchContextProvider } from "../../contexts/AssistantsFetchContext";
import { FileContextProvider } from "../../contexts/FileContext";
import "./main-layout.scss";
import { useContext } from "react";
import TitleContextProvider from "../../contexts/TitleContext";

const Layout = () => {
  const location = useLocation();
  // const { showMenu } = useContext(SidebarContext);

  return isLoggedIn() ? (
    <AssistantFetchContextProvider>
      <SidebarContextProvider>
        <FileContextProvider>
          <AssistantContextProvider>
            <PromptTemplateContextProvider>
            <TitleContextProvider>
                <main className="d-flex flex-nowrap w-100">
                  <WelcomeCard />
                    {/* <Sidebar /> */}
                    <NewSidebar />
                    <MainContent />
                  </main>
              </TitleContextProvider>
            </PromptTemplateContextProvider>
          </AssistantContextProvider>
        </FileContextProvider>
      </SidebarContextProvider>
    </AssistantFetchContextProvider>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default Layout;
