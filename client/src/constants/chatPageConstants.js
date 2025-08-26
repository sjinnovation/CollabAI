import chatgptIcon from '../assests/images/chatgpt.png';
import ChatUserIcon from '../assests/images/user-icon.png';
import ClaudeAiIcon from '../assests/images/claude-ai-icon.png';
import DeepSeekIcon from '../assests/images/DeepSeekIcon.png';
import GeminiAiIcon from '../assests/images/gemini-ai-icon.png';
import NewChatIcon from '../assests/images/new-chat-icon.png';
import HuggingFaceIcon from '../assests/images/huggingface.png';
import { getUserRole } from '../Utility/service';
import {
  EditOutlined,
  CheckCircleOutlined,
  ArrowsAltOutlined,
  CompressOutlined,
  ReadOutlined,
} from '@ant-design/icons';
const role = getUserRole();
export const botIconsMap = {
	openai: {
		name: 'ChatGPT',
		icon: chatgptIcon,
	},
	gemini: {
		name: 'Gemini',
		icon: GeminiAiIcon,
	},
	claude: {
		name: 'Claude',
		icon: ClaudeAiIcon,
	},
	deepseek: {
		name: 'DeepSeek',
		icon: DeepSeekIcon,
	},
	user: {
		name: "User",
		icon: ChatUserIcon,
	},
	newChat: {
		name: "New Chat",
		icon: NewChatIcon,
	},
	huggingface: {
		name:"HuggingFace",
		icon: HuggingFaceIcon,
	}
};

export const botOptions = [
	{
		value: 'openai',
		label: (
			<div className='d-flex align-items-center gap-2'>
				<img
					src={chatgptIcon}
					alt="chatgpt"
					style={{
						width: '20px',
						height: '20px',
					}}
				/>{' '}
				ChatGPT
			</div>
		),
	},
	{
		value: 'gemini',
		label: (
			<div className='d-flex align-items-center gap-2'>
				<img
					src={GeminiAiIcon}
					alt="gemini"
					style={{
						width: '20px',
						height: '20px',
					}}
				/>{' '}
				Gemini
			</div>
		),
	},
	{
		value: 'claude',
		label: (
			<div className='d-flex align-items-center gap-2'>
				<img
					src={ClaudeAiIcon}
					alt="claudeIcon"
					style={{
						width: '20px',
						height: '20px',
					}}
				/>{' '}
				Claude
			</div>
		),
	},
	{
		value: 'deepseek',
		label: (
			<div className='d-flex align-items-center gap-2'>
				<img
					src={DeepSeekIcon}
					alt="DeepSeekIcon"
					style={{
						width: '20px',
						height: '20px',
					}}
				/>{' '}
				DeepSeek
			</div>
		),
	},
];

export const buildModelOptions = (dynamicBotOptions = []) => {
	const staticModelOptions = {
	  openai: [
		{ value: "gpt-4o", label: "GPT-4o", description: "Best for complex tasks" },
		{ value: "gpt-4o-mini", label: "GPT-4o-mini", description: "Smaller, faster, supports large outputs" },
		// { value: "gpt-4.1", label: "GPT-4.1", description: "Good reasoning capabilities" },
		{ value: "gpt-4.1-nano", label: "GPT-4.1-nano", description: "Great for most tasks (No web search)" }
	  ],
	  claude: [
		{ value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 Sonnet", description: "Improved speed and reasoning" },
		{ value: "claude-3-7-sonnet-20250219", label: "Claude 3.7 Sonnet", description: "Extra speed, deeper reasoning, larger context window" },
		{ value: "claude-sonnet-4-20250514", label: "Claude sonnet 4",description: "Next-gen model—better creativity, accuracy, and memory" },
		{ value: "claude-opus-4-20250514", label: "Claude Opus 4", description: "Flagship intelligence with state-of-the-art performance"}
	  ],
	  deepseek: [
		{ value: "deepseek-ai/DeepSeek-R1", label: "DeepSeek R1", description: "Best for complex problems" },
		{ value: "deepseek-ai/DeepSeek-V3", label: "DeepSeek V3", description: "Latest and fastest version" }
	  ],
	  gemini: [
		{ value: "gemini-2.0-flash-001", label: "Gemini 2.0 Flash", description: "Multimodal capabilities" }
	  ],
	//   huggingface :dynamicBotOptions.map(({ value, label, provider }) => {
	// 	return {
	// 	 value,
	// 	 label,
	// 	 description: "Dynamic Model",
	//    };
	//  })
	};

	if(role === "admin" || role === "superadmin"){
		staticModelOptions.openai.push({ value: "gpt-4.1", label: "GPT-4.1", description: "Good reasoning capabilities" });
	}

	return staticModelOptions;
  };

export const editableBotValues = botOptions.map(bot => bot.value);