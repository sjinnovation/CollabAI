import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Layout, Menu, Typography } from 'antd';
import DalleConfig from './DalleConfig';
import OpenAIConfig from './OpenAIConfig';
import GeminiConfig from './GeminiAIConfig';
import ClaudeAIConfig from './ClaudeAIConfig';
import DeepseekConfig from './DeepseekConfig';
import UsersTokenConfig from './UsersTokenConfig';
import AdvanceAiParametersConfig from './AdvanceAiParametersConfig';
import { ThemeContext } from "../../contexts/themeConfig";
import LinkedInUserConfig from './LinkedInUserConfig';
import './Configuration.css';
import { AdminDefinedApps } from '../../component/AddApiEndpoint/AdminDefinedApps';
import { useNavigate } from 'react-router-dom';
import AssistantSettings from '../../component/Assistant/AssistantSettings';
import useAssistantPage from '../../Hooks/useAssistantPage';
import FluxConfig from './FluxConfig';
import { LuSettings2 } from "react-icons/lu";
import HuggingFaceConfigForm from "../../component/huggingfacecomp/huggingFaceConfig";

// Import SVG as React components
import { ReactComponent as ClaudeAiIcon } from '../../assests/images/setting-page-icons/claude-ai-icon.svg';
import { ReactComponent as GoogleGeminiIcon } from '../../assests/images/setting-page-icons/google-gemini-icon.svg';
import { ReactComponent as MaxTokenIcon } from '../../assests/images/setting-page-icons/max-token.svg';
import { ReactComponent as OpenAiIcon } from '../../assests/images/setting-page-icons/openai.svg';
import { ReactComponent as OpenAiIconDark } from '../../assests/images/setting-page-icons/chatgptDark.svg';
import { ReactComponent as HuggingFaceIcon} from "../../assests/images/huggingface.svg";
import { SidebarContext } from '../../contexts/SidebarContext';
import BrandLogoConfig from './BrandLogoConfig';
import VsCodeApiConfig from './VsCodeApiConfig';

const { Sider, Content } = Layout;
const { Text } = Typography;

const Configuration = () => {
  const [selectedMenu, setSelectedMenu] = useState('advanceAiParametersConfig');
  const { theme } = useContext(ThemeContext);
  const { setOrganizationSettingsMenu, organizationSettingsMenu } = useContext(SidebarContext);

  useEffect(()=>{
    handleFetchTeams();
  },[]);

  const {
    teamList,
    loader,
    handleFetchTeams,
    updateLoader
  } = useAssistantPage();
  const navigate = useNavigate();

  const menuItems = useMemo(() => [
    { key: 'advanceAiParametersConfig', label: 'AI Model Configuration', component: AdvanceAiParametersConfig, icon: LuSettings2 },
    { key: 'vsCodeApiConfig', label: 'Vs Code API Configuration', component: VsCodeApiConfig, icon: LuSettings2 },
    { key: 'flux', label: 'FLUX Settings', component: FluxConfig },
    { key: 'brandLogo', label: 'Logo Settings', component: BrandLogoConfig },
    { key: 'linkedin', label: 'LinkedIn Settings', component: LinkedInUserConfig },
    { key: 'Organization', label: 'Agent Settings', component: () => <AssistantSettings data={{ loader, teamList, handleFetchTeams, updateLoader }} /> },
    { key: 'maxtoken', label: 'Max Token Configuration', component: UsersTokenConfig, icon: MaxTokenIcon },
    { key: 'addapis', label: 'Apps and Integrations', component: AdminDefinedApps },
    { key: 'huggingfaceInference', label: 'HuggingFace Inference', component: HuggingFaceConfigForm, icon: HuggingFaceIcon}

  ], [handleFetchTeams, loader, teamList, updateLoader]);

  const selectedComponent = useMemo(() => {
    const item = menuItems.find(item => item.key === selectedMenu);
    return item ? <item.component /> : null;
  }, [selectedMenu, menuItems]);

  const menuItemsWithWrappedLabels = menuItems.map(item => ({
    key: item.key,
    icon: item.icon ? React.createElement(item.icon, { className: 'menu-icon' }) : null,
    label: (
      <Text className="menu-label">
        {item.label}
      </Text>
    )
  }));

  return (
    <Layout className="parentLayout">
      <Sider width={256} trigger={null} collapsible collapsed={organizationSettingsMenu} className={`configuration-sider ${theme}`}>
        <div className="configuration-sidemenu">
          <Menu
            onClick={({ key }) => setSelectedMenu(key)}
            defaultSelectedKeys={['advanceAiParametersConfig']}
            mode="inline"
            items={menuItemsWithWrappedLabels}
          />
        </div>
      </Sider>
      <Layout className="content-layout">
        <Content className="tableContent">
          {selectedComponent}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Configuration;