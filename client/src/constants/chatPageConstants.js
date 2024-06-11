import chatgptIcon from '../assests/images/chatgpt.png';
import ChatUserIcon from '../assests/images/user-icon.png';
import ClaudeAiIcon from '../assests/images/claude-ai-icon.png';
import GeminiAiIcon from '../assests/images/gemini-ai-icon.png';
import NewChatIcon from '../assests/images/new-chat-icon.png';
import {
  EditOutlined,
  CheckCircleOutlined,
  ArrowsAltOutlined,
  CompressOutlined,
  ReadOutlined,
} from '@ant-design/icons';

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
	user: {
		name: "User",
		icon: ChatUserIcon,
	},
	newChat: {
		name: "New Chat",
		icon: NewChatIcon,
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
];
