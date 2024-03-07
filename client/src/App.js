import React from "react";
import { Route, Routes } from "react-router-dom";
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
} from "./Pages";

import Layout from "./Pages/Layout";
import AssistantLayout from "./Pages/Layout/AssistantLayout";
import Configration from "./Pages/configration/promtcomfig";
import SuperAdminRoutes from "./component/RoutesData/SuperAdminRoutes";
import Templates from "./component/Prompt/Templates";

function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginForm />} />
      <Route path="passwordReset/:token/:id" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />

      <Route path="/" element={<Layout />}>
        <Route path="config/" element={<Configration />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="usersassistantlist" element={<UsersAssistant />} />

        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:thread_id" element={<ChatPage />} />
        <Route path="promptlist/" element={<PromptList />} />
        <Route path="promptlistview/:id" element={<PromptList />} />
        <Route path="promptuserview" element={<PrompotUsersList />} />

        <Route path="/templates" element={<Templates />} />

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

          <Route path="/assistantsList" element={<AssistantsList />} />
        </Route>
      </Route>
      <Route path="/assistants" element={<AssistantLayout />}>
        <Route
          path=":assistant_name/:assistant_id"
          element={<AssistantsChatPage />}
        />
        <Route
          path=":assistant_name/:assistant_id/:thread_id"
          element={<AssistantsChatPage />}
        />
      </Route>
      <Route
          path="assistants/download/:file_id"
          element={<AssistantFileDownloadPage />}
        />
    </Routes>
  );
}

export default App;
