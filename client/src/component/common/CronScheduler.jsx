import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Space,
    Button,
    Select,
    Checkbox,
    Input,
    Row,
    Col,
    Tabs,
    message,
    Tooltip,
    Divider
} from 'antd';
import {
    ClockCircleOutlined,
    CopyOutlined,
    CheckOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    ScheduleOutlined,
    FieldTimeOutlined,
    StopOutlined,
    SettingOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const CronScheduler = ({ value, onChange, style }) => {
    const [currentCron, setCurrentCron] = useState(value || '* * * * *');
    const [currentType, setCurrentType] = useState('minute');
    const [copySuccess, setCopySuccess] = useState(false);
    const [nextRuns, setNextRuns] = useState([]);

    // Helper function for preset colors - theme-aware
    const getPresetColor = (color) => {
        const colors = {
            blue: {
                light: 'rgba(24, 144, 255, 0.1)',
                lighter: 'rgba(24, 144, 255, 0.05)',
                dark: '#1890ff',
                medium: '#1890ff',
                border: 'rgba(24, 144, 255, 0.3)'
            },
            green: {
                light: 'rgba(82, 196, 26, 0.1)',
                lighter: 'rgba(82, 196, 26, 0.05)',
                dark: '#52c41a',
                medium: '#52c41a',
                border: 'rgba(82, 196, 26, 0.3)'
            },
            purple: {
                light: 'rgba(114, 46, 209, 0.1)',
                lighter: 'rgba(114, 46, 209, 0.05)',
                dark: '#722ed1',
                medium: '#722ed1',
                border: 'rgba(114, 46, 209, 0.3)'
            },
            orange: {
                light: 'rgba(250, 140, 22, 0.1)',
                lighter: 'rgba(250, 140, 22, 0.05)',
                dark: '#fa8c16',
                medium: '#fa8c16',
                border: 'rgba(250, 140, 22, 0.3)'
            },
            red: {
                light: 'rgba(255, 77, 79, 0.1)',
                lighter: 'rgba(255, 77, 79, 0.05)',
                dark: '#ff4d4f',
                medium: '#ff4d4f',
                border: 'rgba(255, 77, 79, 0.3)'
            },
            indigo: {
                light: 'rgba(89, 126, 247, 0.1)',
                lighter: 'rgba(89, 126, 247, 0.05)',
                dark: '#597ef7',
                medium: '#597ef7',
                border: 'rgba(89, 126, 247, 0.3)'
            }
        };
        return colors[color] || colors.blue;
    };

    // Schedule type options - removed 'custom'
    const scheduleTypes = [
        { type: 'minute', icon: <StopOutlined />, label: 'Every Minute' },
        { type: 'hourly', icon: <ClockCircleOutlined />, label: 'Hourly' },
        { type: 'daily', icon: <FieldTimeOutlined />, label: 'Daily' },
        { type: 'weekly', icon: <ScheduleOutlined />, label: 'Weekly' },
        { type: 'monthly', icon: <CalendarOutlined />, label: 'Monthly' }
    ];

    // Advanced inputs state
    const [advancedInputs, setAdvancedInputs] = useState({
        minute: '*',
        hour: '*',
        day: '*',
        month: '*',
        weekday: '*'
    });

    // Custom selections state
    const [customSelections, setCustomSelections] = useState({
        minutes: [],
        hours: []
    });

    // Function to determine current type based on cron expression
    const getCurrentTypeFromCron = (cron) => {
        const parts = cron.split(' ');
        const [minute, hour, day, month, weekday] = parts;

        // Every minute
        if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return 'minute';
        }
        
        // Hourly
        if (hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return 'hourly';
        }
        
        // Daily
        if (day === '*' && month === '*' && weekday === '*') {
            return 'daily';
        }
        
        // Weekly
        if (day === '*' && month === '*' && weekday !== '*') {
            return 'weekly';
        }
        
        // Monthly
        if (month === '*' && weekday === '*') {
            return 'monthly';
        }
        
        // Default to daily if no match
        return 'daily';
    };

    useEffect(() => {
        // Set the current type based on the initial cron value
        const initialType = getCurrentTypeFromCron(value || '* * * * *');
        setCurrentType(initialType);
        updateDisplay();
        calculateNextRuns();
    }, [value]);

    useEffect(() => {
        updateDisplay();
        calculateNextRuns();
    }, [currentCron]);

    useEffect(() => {
        if (onChange) {
            onChange(currentCron);
        }
    }, [currentCron, onChange]);

    const updateCron = (newCron) => {
        setCurrentCron(newCron);
    };

    const handleScheduleTypeChange = (type) => {
        setCurrentType(type);
        showScheduleOptions(type);
    };

    const showScheduleOptions = (type) => {
        switch (type) {
            case 'minute':
                updateCron('* * * * *');
                break;
            case 'hourly':
                updateCron('0 * * * *');
                break;
            case 'daily':
                updateCron('0 0 * * *');
                break;
            case 'weekly':
                updateCron('0 0 * * 0');
                break;
            case 'monthly':
                updateCron('0 0 1 * *');
                break;
        }
    };

    const handleHourlyChange = (minute) => {
        updateCron(`${minute} * * * *`);
    };

    const handleDailyChange = (hour, minute) => {
        updateCron(`${minute} ${hour} * * *`);
    };

    const handleWeeklyChange = (day, hour, minute) => {
        updateCron(`${minute} ${hour} * * ${day}`);
    };

    const handleMonthlyChange = (day, hour, minute) => {
        updateCron(`${minute} ${hour} ${day} * *`);
    };

    const handleCopyCron = async () => {
        try {
            await navigator.clipboard.writeText(currentCron);
            setCopySuccess(true);
            message.success('Cron expression copied to clipboard!');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            message.error('Failed to copy to clipboard');
        }
    };

    const getHumanReadable = () => {
        const parts = currentCron.split(' ');
        const [minute, hour, day, month, weekday] = parts;

        if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return 'Every minute';
        }

        if (minute === '0' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return 'Every hour at minute 0';
        }

        if (minute === '0' && hour === '0' && day === '*' && month === '*' && weekday === '*') {
            return 'Every day at midnight';
        }

        let description = '';

        if (minute.includes('/')) {
            const step = minute.split('/')[1];
            description = `Every ${step} minute${step > 1 ? 's' : ''}`;
        } else if (minute !== '*') {
            description = `At minute ${minute}`;
        }

        if (hour !== '*' && hour.includes(',')) {
            description += (description ? ' at hours ' : 'At hours ') + hour;
        } else if (hour !== '*' && !hour.includes('/')) {
            description += (description ? ' at ' : 'At ') + hour.padStart(2, '0') + ':00';
        }

        if (day !== '*' && day !== '?') {
            description += (description ? ' on day ' : 'On day ') + day + ' of the month';
        }

        if (weekday !== '*' && weekday !== '?') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (weekday.includes('-')) {
                const [start, end] = weekday.split('-').map(n => parseInt(n));
                description += (description ? ' from ' : 'From ') + days[start] + ' to ' + days[end];
            } else {
                description += (description ? ' on ' : 'On ') + days[parseInt(weekday)];
            }
        }

        return description || 'Custom schedule';
    };

    const calculateNextRuns = () => {
        const runs = [];
        const now = new Date();

        for (let i = 0; i < 5; i++) {
            const next = new Date(now);
            next.setMinutes(next.getMinutes() + (i + 1));
            next.setSeconds(0);
            next.setMilliseconds(0);
            runs.push(next);
        }

        setNextRuns(runs);
    };

    const updateDisplay = () => {
        calculateNextRuns();
    };

    const renderScheduleOptions = () => {
        switch (currentType) {
            case 'minute':
                return (
                    <div style={{ textAlign: 'center', color: 'inherit' }}>
                        <InfoCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                        Runs every minute
                    </div>
                );

            case 'hourly':
                return (
                    <div>
                        <Text strong className="block mb-2">At minute</Text>
                        <Select
                            defaultValue="0"
                            style={{ width: '100%' }}
                            onChange={handleHourlyChange}
                        >
                            {Array.from({ length: 60 }, (_, i) => (
                                <Option key={i} value={i.toString()}>
                                    {i.toString().padStart(2, '0')}
                                </Option>
                            ))}
                        </Select>
                    </div>
                );

            case 'daily':
                return (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text strong className="block mb-2">At hour</Text>
                            <Select
                                defaultValue="0"
                                style={{ width: '100%' }}
                                onChange={(hour) => handleDailyChange(hour, '0')}
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <Option key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}:00
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={12}>
                            <Text strong className="block mb-2">At minute</Text>
                            <Select
                                defaultValue="0"
                                style={{ width: '100%' }}
                                onChange={(minute) => handleDailyChange('0', minute)}
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <Option key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                );

            case 'weekly':
                const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Text strong className="block mb-2">On day</Text>
                            <Select
                                defaultValue="0"
                                style={{ width: '100%' }}
                                onChange={(day) => handleWeeklyChange(day, '0', '0')}
                            >
                                {weekdays.map((day, i) => (
                                    <Option key={i} value={i.toString()}>
                                        {day}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong className="block mb-2">At hour</Text>
                                <Select
                                    defaultValue="0"
                                    style={{ width: '100%' }}
                                    onChange={(hour) => handleWeeklyChange('0', hour, '0')}
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <Option key={i} value={i.toString()}>
                                            {i.toString().padStart(2, '0')}:00
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={12}>
                                <Text strong className="block mb-2">At minute</Text>
                                <Select
                                    defaultValue="0"
                                    style={{ width: '100%' }}
                                    onChange={(minute) => handleWeeklyChange('0', '0', minute)}
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <Option key={i} value={i.toString()}>
                                            {i.toString().padStart(2, '0')}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </Space>
                );

            case 'monthly':
                return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Text strong className="block mb-2">On day</Text>
                            <Select
                                defaultValue="1"
                                style={{ width: '100%' }}
                                onChange={(day) => handleMonthlyChange(day, '0', '0')}
                            >
                                {Array.from({ length: 31 }, (_, i) => (
                                    <Option key={i + 1} value={(i + 1).toString()}>
                                        {i + 1}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong className="block mb-2">At hour</Text>
                                <Select
                                    defaultValue="0"
                                    style={{ width: '100%' }}
                                    onChange={(hour) => handleMonthlyChange('1', hour, '0')}
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <Option key={i} value={i.toString()}>
                                            {i.toString().padStart(2, '0')}:00
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={12}>
                                <Text strong className="block mb-2">At minute</Text>
                                <Select
                                    defaultValue="0"
                                    style={{ width: '100%' }}
                                    onChange={(minute) => handleMonthlyChange('1', '0', minute)}
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <Option key={i} value={i.toString()}>
                                            {i.toString().padStart(2, '0')}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </Space>
                );

            default:
                return null;
        }
    };

    return (
        <div style={style}>
            <Row gutter={24}>
                {/* Main Scheduler Panel */}
                <Col xs={24} lg={16}>
                    <Card>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Schedule Type */}
                            <div>
                                <Text strong className="block mb-3">Schedule Type</Text>
                                <Row gutter={[12, 12]}>
                                    {scheduleTypes.map(({ type, icon, label }) => (
                                        <Col xs={12} md={8} key={type}>
                                            <Card
                                                size="small"
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    borderColor: currentType === type ? '#1890ff' : undefined,
                                                    backgroundColor: currentType === type ? 'rgba(24, 144, 255, 0.1)' : 'transparent'
                                                }}
                                                onClick={() => handleScheduleTypeChange(type)}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-1 text-blue-600">{icon}</div>
                                                    <Text className="text-sm font-medium">{label}</Text>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>

                            {/* Dynamic Options Container */}
                            <Card size="small" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                {renderScheduleOptions()}
                            </Card>
                        </Space>
                    </Card>
                </Col>

                {/* Cron Expression Display */}
                <Col xs={24} lg={8}>
                    <Card className="sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <Title level={4} className="mb-0">
                                <ClockCircleOutlined className="text-blue-600 mr-2" />
                                Cron Expression
                            </Title>
                        </div>

                        {/* Cron Display */}
                        <Card size="small" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <code style={{ color: '#52c41a', fontFamily: 'monospace', fontSize: '18px' }}>{currentCron}</code>
                                <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={handleCopyCron}
                                    style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)', fontFamily: 'monospace' }}>
                                <span>minute</span>
                                <span>hour</span>
                                <span>day</span>
                                <span>month</span>
                                <span>weekday</span>
                            </div>
                        </Card>

                        {/* Human Readable */}
                        <Card size="small" style={{ backgroundColor: 'rgba(24, 144, 255, 0.1)', marginBottom: '16px' }}>
                            <Text strong style={{ color: '#1890ff', display: 'block', marginBottom: '8px' }}>Description</Text>
                            <Text style={{ color: '#1890ff' }}>{getHumanReadable()}</Text>
                        </Card>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CronScheduler; 