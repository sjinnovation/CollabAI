import { useLocation, Navigate, Outlet } from "react-router-dom";
import SidebarContextProvider, {
    SidebarContext,
} from "../../contexts/SidebarContext";
import PromptTemplateContextProvider from "../../contexts/PromptTemplateContext";
import { Footer, Header, Sidebar } from "../../component";
import { isLoggedIn } from "../../Utility/service";
import AssistantSidebar from "../../component/layout/AssistantSidebar/AssistantSidebar";
import AssistantContextProvider from "../../contexts/AssistantContext";
import { AssistantFetchContextProvider } from "../../contexts/AssistantsFetchContext";
import NewSidebar from "../../component/layout/NewSidebar/NewSidebar";
import { FileContextProvider } from "../../contexts/FileContext";

const AssistantLayout = () => {
    const location = useLocation();

    return isLoggedIn() ? (
        <AssistantFetchContextProvider>
            <SidebarContextProvider>
                <FileContextProvider>
                <AssistantContextProvider>
                    <PromptTemplateContextProvider>
                        <main className="d-flex flex-nowrap">
                            {/* ----- Sidebar ----- */}
                            <NewSidebar />
                            <div className="w-100 overflow-auto main-wrapper min-vh-100 d-flex flex-column">
                                <Header />
                                <section
                                    style={{ width: "100%", height: "100vh" }}
                                >
                                    <Outlet />
                                </section>
                                <Footer />
                            </div>
                        </main>
                    </PromptTemplateContextProvider>
                </AssistantContextProvider>
                </FileContextProvider>
            </SidebarContextProvider>
            </AssistantFetchContextProvider>
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default AssistantLayout;
