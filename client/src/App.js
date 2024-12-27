import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import {
  LoginForm,
  PageNotFound,
  ListUser,
  AddUser,
  EditUser,
  Profile,
  ResetPassword,
  UsersAssistant,
  PromptList,
  PrompotUsersList,
  TemplateList,
  // OrganizationsComponent,
  TagsComponent,
  TeamList,
  AssistantsList,
  AssistantsChatPage,
  ChatPage,
  AssistantFileDownloadPage,
  Form,
  ProjectDetails,
  Upload 
} from "./Pages";

import PortfolioHome from "./Pages/PortfolioHome";
import PlatformManagementfeature from "./Pages/PlatformMangemenrfeature/PlatformMangamentfeature";
import Layout from "./Pages/Layout";
import AssistantLayout from "./Pages/Layout/AssistantLayout";
import ConfigurationTabs from "./Pages/configration/index";
import Configration from "./Pages/configration";
import SuperAdminRoutes from "./component/RoutesData/SuperAdminRoutes";
import Templates from "./component/Prompt/Templates";
import TrackUsage from "./Pages/SuperAdmin/TrackUsage/TrackUsage";
import TrackUsageComponent from "./Pages/SuperAdmin/TrackUsage/TrackUsageComponent";
import PublicAssistant from "./Pages/ExploreGPTs";
import ProtectedRoutes from "./component/ProtectedRoute/ProtectedRoute";
import ProtectedRouteFeature from "./component/ProtectedRoute/ProtectedRouteFeature";
import AssistantTypeList from "./Pages/AssistantType/index";
import TaskCommands from "./Pages/SuperAdmin/TaskCommands/TaskCommands";import KnowledgeBase from "./Pages/KnowledgeBase";
import { IntegrateApplications } from "./component/IntegrateApplications/IntegrateApplications";
// import { IntegrateApplications } from "./component/Assistant/IntegrateApplications/IntegrateApplications";

import ConnectionWithWorkboard from "./Pages/configration/ConnectionWithWorkboard";
import ClientInfo from "./Pages/PortfolioManagement/ClientInfo";
import PodInfo from "./Pages/PortfolioManagement/PodInfo";
import ReviewsPage from "./Pages/PortfolioManagement/Reviews";

function App() {
  // Hook to get the current location
  const location = useLocation();

  // Redirect to chat page if the user is on the root path
  if (location.pathname === "/") {
    return <Navigate to="/chat" />;
  }

  return (
    <Routes>
      <Route path="login" element={<LoginForm />} />
      <Route path="passwordReset/:token/:id" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />
      <Route path="/Form" element={<Form/>}></Route>
      <Route element={<ProtectedRouteFeature />}>
      <Route
                path="/platform-management-feature/*"
                element={
                    <PlatformManagementfeature>
                        <Routes>
                            <Route path="portfolio" element={<PortfolioHome />} />
                            <Route path="projectdetails/:id" element={<ProjectDetails />} />
                            <Route path="Client/:id" element={<ClientInfo />} /> 
                            <Route path="PodInfo" element={<PodInfo />} />
                            <Route path="Pod/:id" element={<PodInfo />} />
                            <Route path="PodInfo" element={<PodInfo />} />
                            <Route path="portfoliomanagement/Reviews" element={<ReviewsPage />} />
                            <Route path="import" element={<Upload/>}/>
                        </Routes>
                    </PlatformManagementfeature>
                }
            /></Route>
   {/* For connecting workboard */}
      <Route path="ConnectionWithWorkboard" element={<ConnectionWithWorkboard />} />
 


      <Route path="/" element={<Layout />}>
        <Route path="config/" element={<ConfigurationTabs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users-agents" element={<UsersAssistant />} />

        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:thread_id" element={<ChatPage />} />
        <Route path="promptlist/" element={<PromptList />} />
        <Route path="promptlistview/:id" element={<PromptList />} />
        <Route path="promptuserview" element={<PrompotUsersList />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} /> 
        <Route path="/integrate-apps" element={<IntegrateApplications/>} /> 
     


        <Route element={<ProtectedRoutes />}>
            <Route
              path="agents/:assistant_id"
              element={<AssistantsChatPage />}
            />
            <Route
              path="agents/:assistant_id/:thread_id"
              element={<AssistantsChatPage />}
            />
        </Route>


        <Route path="/agent-types" element={<AssistantTypeList />} />


        <Route path="/templates" element={<Templates />} />
        <Route path="/public-agent" element={<PublicAssistant />} />

        {/* Protected Routes of SuperAdmin */}
        <Route element={<SuperAdminRoutes />}>
          <Route path="/teams" element={<TeamList />} />
          {/* [TODO : commenting for now, will be added later when organization functionality will be enabled ] */}
          {/* <Route path="/organizations" element={<OrganizationsComponent />} /> */}
          <Route path="/tags" element={<TagsComponent />} />

          <Route path="users/" element={<ListUser />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />

          <Route path="/templist" element={<TemplateList />} />
          <Route path="/tags" element={<TagsComponent />} />
          <Route path="/teams" element={<TeamList />} />

          <Route path="/agentsList" element={<AssistantsList />} />
          <Route path="/trackUsage" element={<TrackUsageComponent />} />
          <Route path="/taskCommands" element={<TaskCommands />} />
        </Route>
      </Route>
      {/* <Route path="/assistants" element={<AssistantLayout />}>
        <Route
          path=":assistant_name/:assistant_id"
          element={<AssistantsChatPage />}
        />
        <Route
          path=":assistant_name/:assistant_id/:thread_id"
          element={<AssistantsChatPage />}
        />
      </Route> */}
      <Route
        path="assistants/download/:file_id"
        element={<AssistantFileDownloadPage />}
      />
     

</Routes>
  );
}
export default App;
