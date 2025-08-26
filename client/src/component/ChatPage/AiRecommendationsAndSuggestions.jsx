import React, { useState, useContext } from "react";
import { Card, Button, Typography, Space, Divider, Spin, Empty } from "antd";
import { 
  CodeOutlined, 
  BarChartOutlined, 
  GlobalOutlined, 
  FileTextOutlined,
  CloseOutlined,
  BulbOutlined,
  RobotOutlined
} from "@ant-design/icons";
import { ThemeContext } from "../../contexts/themeConfig";
import "./AiRecommendationsAndSuggestions.css";
import { getAIUserAgentSuggestions, getAIUserSuggestions } from "../../api/aiSuggestionApiFunctions";
import { getUserID } from "../../Utility/service";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const AiRecommendationsAndSuggestions = ({ setInputPrompt }) => {
  const { theme } = useContext(ThemeContext);
  const [promptTips, setPromptTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendedAgents, setRecommendedAgents] = useState([]);
  const navigate = useNavigate();
  
  // Separate loading states for each section
  const [tipsLoading, setTipsLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);
  
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      emoji: "🚀",
      title: "Try the new Assistant Builder",
      description: "Create custom AI assistants tailored to your team's workflow in just 5 minutes.",
      action: "Try Now",
      dismissed: false
    },
    {
      id: 2,
      emoji: "📊",
      title: "Review your usage analytics",
      description: "See how your team is using CollabAI and discover optimization opportunities.",
      action: "View Report",
      dismissed: false
    },
    {
      id: 3,
      emoji: "💡",
      title: "Enable AI Suggestions",
      description: "Get personalized productivity tips based on your usage patterns.",
      action: "Enable Now",
      dismissed: false
    },
    {
      id: 4,
      emoji: "🤖",
      title: "Explore Agent Templates",
      description: "Browse pre-built agents for common workflows like code review and documentation.",
      action: "See How",
      dismissed: false
    }
  ]);
  
  const fetchSuggestions = async () => {
    try {
      setTipsLoading(true);
      const userId = getUserID();
      const response = await getAIUserSuggestions(userId, setLoading);

      if (response && response?.data?.data?.feedback?.[0]?.suggestion) {
        setPromptTips(response.data.data.feedback[0].suggestion);
      } else {
        console.error("No suggestions found for user");
        setPromptTips([]);
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setPromptTips([]);
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);
  
  useEffect(() => {
    const fetchRecommendedAgents = async () => {
      try {
        setAgentsLoading(true);
        const {data} = await getAIUserAgentSuggestions(getUserID(), setLoading);
        if (data && data.length > 0) {
          setRecommendedAgents(data);
        } else {
          setRecommendedAgents([]);
        }
      } catch (error) {
        console.error("Error fetching recommended agents:", error);
        setRecommendedAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    };
    fetchRecommendedAgents();
  }, []);
  useEffect(() => {
    console.log("Prompt Tips:", promptTips ," and type of promptTips:", typeof promptTips);
    }, [promptTips]);
  // const activeSuggestions = suggestions.filter(s => !s.dismissed);

  const handleDismiss = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? {
      ...s,
      dismissed: true
    } : s));
  };

  const handleSnooze = (id) => {
    console.log(`Snoozed suggestion ${id}`);
  };

  const handleAction = (suggestion) => {
    console.log(`Action clicked for: ${suggestion.title}`);
  };

  const handleUseAgent = (agentId) => {
    console.log(`Use agent: ${agentId}`);
    navigate(`/agents/${agentId}`);
  };

  const handlePromptTipClick = (tip) => {
    if (setInputPrompt) {
      setInputPrompt(tip.description);
    }
  };

  
  return (
    <div className={`ai-recommendations-container ${theme === "dark" && "dark-mode"}`}>
      {/* Welcome Greeting */}
      <div className="welcome-greeting">
        <Title level={2} className={`welcome-title ${theme === "dark" && "dark-mode"}`}>
          Welcome back! 👋
        </Title>
        <Text type="secondary" className={`welcome-subtitle ${theme === "dark" && "dark-mode"}`}>
          Here's how you can get more from CollabAI
        </Text>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Prompt Improvement Tips */}
        <Card className={`prompt-tips-card ${theme === "dark" && "dark-mode"}`}>
          <div className="card-header">
            <div className="card-icon-container card-icon-blue">
              <BulbOutlined className="card-icon" />
            </div>
            <Title level={4} className={`card-title ${theme === "dark" && "dark-mode"}`}>
              Prompt Improvement Tips
            </Title>
          </div>
          
          {tipsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">Loading personalized tips...</Text>
              </div>
            </div>
          ) : promptTips.length > 0 && promptTips !=="[object object]"? (
            
            <Space direction="vertical" size="middle" className="tips-space">
              {promptTips?.map((tip, index) => (
                <div 
                  key={index} 
                  className={`tip-item ${theme === "dark" && "dark-mode"}`}
                  onClick={() => handlePromptTipClick(tip)}
                >
                  <Text className={`tip-description ${theme === "dark" && "dark-mode"}`}>
                    {tip}
                  </Text>
                </div>
              ))}
            </Space>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className={theme === "dark" && "dark-mode"}>
                  No personalized tips available
                </span>
              }
              style={{ padding: '40px 20px' }}
            />
          )}
        </Card>

        {/* Recommended Agents */}
        <Card className={`recommended-agents-card ${theme === "dark" && "dark-mode"}`}>
          <div className="card-header">
            <div className="card-icon-container card-icon-purple">
              <RobotOutlined className="card-icon" />
            </div>
            <Title level={4} className={`card-title ${theme === "dark" && "dark-mode"}`}>
              Recommended Agents
            </Title>
          </div>
          
          {agentsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">Finding agents for you...</Text>
              </div>
            </div>
          ) : recommendedAgents.length > 0 ? (
            
            <div className="agents-grid">
              {recommendedAgents.map((agent, index) => (
                <div 
                  key={index} 
                  className={`agent-card ${theme === "dark" && "dark-mode"}`}
                >
                  <div className="agent-icon-container">
                    {agent.image_url ? (
                      <img src={agent.image_url} alt={agent.name} className="agent-icon" style={{ borderRadius: "50%", height: "40px", width: "40px" }} />
                    ) : (
                      <RobotOutlined className="agent-icon" />
                    )}
                  </div>
                  
                  <Title level={5} className={`agent-title ${theme === "dark" && "dark-mode"}`}>
                    {agent.name}
                  </Title>
                  <Text className={`agent-description ${theme === "dark" && "dark-mode"}`}>
                    {agent.description}
                  </Text>
                  
                  <Button 
                    type="primary" 
                    size="small" 
                    className="agent-action-btn"
                    onClick={() => handleUseAgent(agent.assistant_id)}
                  >
                    Use this Agent
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className={theme === "dark" && "dark-mode"}>
                  No recommended agents found
                </span>
              }
              style={{ padding: '40px 20px' }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AiRecommendationsAndSuggestions; 