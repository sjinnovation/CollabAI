import DalleConfig from './DalleConfig';
import OpenAIConfig from './OpenAIConfig';
import GeminiConfig from './GeminiAIConfig';
import ClaudeAIConfig from './ClaudeAIConfig';
import { Tabs } from 'antd';

const Configration = () => {
	const { TabPane } = Tabs;

	return (
		<div className="m-5">
			<Tabs defaultActiveKey="openai" tabPosition="top">
				<TabPane tab="OpenAI Settings" key="openai">
					<OpenAIConfig />
				</TabPane>
				<TabPane tab="Dall-E Settings" key="dalle">
					<DalleConfig />
				</TabPane>
				<TabPane tab="Gemini Settings" key="gemini">
					<GeminiConfig />
				</TabPane>
				<TabPane tab="Claude Settings" key="claude">
					<ClaudeAIConfig />
				</TabPane>
			</Tabs>
		</div>
	);
};

export default Configration;
