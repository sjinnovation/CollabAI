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
  // UsersAssistant,
  PromptList,
  PrompotUsersList,
  TemplateList,
  // OrganizationsComponent,
  TagsComponent,
  TeamList,
  // AssistantsList,
  AssistantsChatPage,
  ChatPage,
  AssistantFileDownloadPage,
  LinkedInCallback,
  MyAgents,
  CreateAgent,
  EditAgent,
  PublicAgents,
  OrganizationalAgents,
  UserAgents,
  IndividualAgents,
  MyFunctions,
  CreateFunction,
  EditFunction,
  AllFunctions,
} from "./Pages";


import Layout from "./Pages/Layout";
import AssistantLayout from "./Pages/Layout/AssistantLayout";
import ConfigurationTabs from "./Pages/configration/index";
import Configration from "./Pages/configration";
import SuperAdminRoutes from "./component/RoutesData/SuperAdminRoutes";
import Templates from "./component/Prompt/Templates";
import {
  TrackUsageComponent,
  MonthlyUsagePage,
  DailyUsagePage,
  AssistantUsagePage,
  DeveloperUsagePage,
  AiSuggestionsPage,
  AiSuggestionSettingsPage
} from "./Pages";
import PublicAssistant from "./Pages/ExploreGPTs";
import ProtectedRoutes from "./component/ProtectedRoute/ProtectedRoute";
import AssistantTypeList from "./Pages/AssistantType/index";
import TaskCommands from "./Pages/SuperAdmin/TaskCommands/TaskCommands";import KnowledgeBase from "./Pages/KnowledgeBase";
import { IntegrateApplications } from "./component/IntegrateApplications/IntegrateApplications";
import ConnectionWithWorkboard from "./Pages/configration/ConnectionWithWorkboard";
import AuthorizeEmailDomain from "./Pages/AuthorizeEmailDomain/AuthorizeEmailDomain";
import AuthCheck from "./component/AuthCheck/AuthCheck";
import Projects from "./Pages/Projects";
import AiPersona from "./Pages/SuperAdmin/AiPersona/AiPersona";
import WorkBoardSync from "./Pages/WorkBoard/WorkBoard";

function App() {
  // Hook to get the current location
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  // Redirect to chat page if the user is on the root path
  if (location.pathname === "/") {
    return <Navigate to="/chat" />;
  }

  return (
    <Routes>
      <Route path="/login" element={
          <AuthCheck>
            <LoginForm />
          </AuthCheck>
        } />
      <Route path="passwordReset/:token/:id" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />

  
   {/* For connecting workboard */}
      <Route path="ConnectionWithWorkboard" element={<ConnectionWithWorkboard />} />
 


      <Route path="/" element={<Layout />}>
        <Route path="config/" element={<ConfigurationTabs />} />
        <Route path="/profile" element={<Profile />} />
        {/* <Route path="/users-agents" element={<UsersAssistant />} /> */}

        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:thread_id" element={<ChatPage />} />
        <Route path="promptlist/" element={<PromptList />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<Projects />} />
        <Route path="projects/:projectId/:thread_id" element={<Projects />} />
        <Route path="promptlistview/:id" element={<PromptList />} />
        <Route path="promptuserview" element={<PrompotUsersList />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} /> 
        <Route path="/integrate-apps" element={<IntegrateApplications/>} /> 
          <Route path="/linkedin-callback" element={<LinkedInCallback />} />

        <Route path="/myAgents" element={<MyAgents />} />
        <Route path="/createAgent" element={<CreateAgent />} />
        <Route path="/editAgent/:assistant_id" element={<EditAgent />} />

        <Route path="/myFunctions" element={<MyFunctions />} />
        <Route path="/createFunction" element={<CreateFunction />} />
        <Route path="/editFunction/:function_id" element={<EditFunction />} />
        <Route path="/work-board-sync" element={<WorkBoardSync />} />


        
        
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
          

          <Route path="users/" element={<ListUser />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="authorizeEmailDomain/" element={<AuthorizeEmailDomain/>}/>
          <Route path="users/edit/:id" element={<EditUser />} />

          <Route path="/templist" element={<TemplateList />} />
          <Route path="/teams" element={<TeamList />} />

          <Route path="/reports" element={<TrackUsageComponent />} />
          <Route path="/reports/monthly" element={<MonthlyUsagePage />} />
          <Route path="/reports/daily" element={<DailyUsagePage />} />
          <Route path="/reports/assistant" element={<AssistantUsagePage />} />
          <Route path="/reports/developer" element={<DeveloperUsagePage />} />
          <Route path="/reports/ai-suggestions" element={<AiSuggestionsPage />} />
          <Route path="/reports/ai-suggestion-settings" element={<AiSuggestionSettingsPage />} />
          <Route path="/taskCommands" element={<TaskCommands />} />
          <Route path="/instructions" element={<AiPersona/>} />

          {/* <Route path="/myAgents" element={<AssistantsList />} /> */}
          <Route path="/publicAgents" element={<PublicAgents />} />
          <Route path="/organizationalAgents" element={<OrganizationalAgents />} />
          <Route path="/userAgents" element={<UserAgents />} />
          <Route path="/userAgents/:username" element={<IndividualAgents />} />
          <Route path="/allFunctions" element={<AllFunctions />} />
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
