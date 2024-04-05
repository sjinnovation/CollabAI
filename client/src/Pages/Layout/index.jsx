import { useLocation, Navigate, Outlet } from "react-router-dom";
import SidebarContextProvider from "../../contexts/SidebarContext";
import PromptTemplateContextProvider from "../../contexts/PromptTemplateContext";
import AssistantContextProvider from "../../contexts/AssistantContext";
import { Footer, Header} from "../../component";
import { isLoggedIn } from "../../Utility/service";
import NewSidebar from "../../component/layout/NewSidebar/NewSidebar";
import { AssistantFetchContextProvider } from "../../contexts/AssistantsFetchContext";

const Layout = () => {
  const location = useLocation();
  return isLoggedIn() ? (
    <AssistantFetchContextProvider>
    <SidebarContextProvider>
      <AssistantContextProvider>
        <PromptTemplateContextProvider>
          <main className="d-flex flex-nowrap">
            {/* <Sidebar /> */}
            <NewSidebar />
            <div className="w-100 main-wrapper min-vh-100 d-flex flex-column justify-content-between">
              <Header />
              <section className="flex-grow-1">
                <Outlet />
              </section>
              <Footer />
            </div>
          </main>
        </PromptTemplateContextProvider>
      </AssistantContextProvider>
    </SidebarContextProvider>
    </AssistantFetchContextProvider>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default Layout;
