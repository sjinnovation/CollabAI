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

const AssistantLayout = () => {
    const location = useLocation();

    return isLoggedIn() ? (
        <AssistantFetchContextProvider>
            <SidebarContextProvider>
                <AssistantContextProvider>
                    <PromptTemplateContextProvider>
                        <main className="d-flex flex-nowrap">
                            {/* ----- Sidebar ----- */}
                            <AssistantSidebar />
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
            </SidebarContextProvider>
            </AssistantFetchContextProvider>
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default AssistantLayout;
