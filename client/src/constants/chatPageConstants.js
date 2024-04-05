import chatgptIcon from '../assests/images/chatgpt.png';
import claudeIcon from '../assests/images/claudeAi.png';

const geminiIcon =
	'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg';

export const botOptions = [
	{
		value: 'openai',
		label: (
			<div>
				<img
					src={chatgptIcon}
					alt="chatgpt"
					style={{
						width: '20px',
						height: '20px',
						marginBottom: '5px',
					}}
				/>{' '}
				ChatGPT
			</div>
		),
	},
	{
		value: 'gemini',
		label: (
			<div>
				<img
					src={geminiIcon}
					alt="gemini"
					style={{
						width: '20px',
						height: '20px',
						marginBottom: '5px',
					}}
				/>{' '}
				Gemini
			</div>
		),
	},
	{
		value: 'claude',
		label: (
			<div>
				<img
					src={claudeIcon}
					alt="claudeIcon"
					style={{
						width: '20px',
						height: '20px',
						marginBottom: '5px',
					}}
				/>{' '}
				Claude
			</div>
		),
	},
];
