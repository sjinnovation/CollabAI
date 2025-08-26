import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Alert, 
  Button, 
  Table, 
  Switch, 
  Checkbox, 
  Select, 
  Input, 
  Avatar, 
  Tag, 
  Modal, 
  message,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  DownOutlined, 
  UserOutlined, 
  CheckOutlined, 
  CloseOutlined,
  ExportOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { 
  getUsersWithAISuggestions, 
  toggleUserAISuggestions, 
  bulkToggleAISuggestions, 
  exportAISuggestionsReport 
} from '../../../api/aiSuggestionsApiFunctions';
import DebouncedSearchInput from '../../SuperAdmin/Organizations/DebouncedSearchInput';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const AiSuggestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Load users data on component mount and when filters change
  useEffect(() => {
    const loadUsers = async () => {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };

      await getUsersWithAISuggestions(params, setUsers, setPagination, setIsLoading);
    };

    loadUsers();
  }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter, sortConfig]);

  // Handle search with debounced input
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery]);

  // Use users data directly from API (filtering and sorting handled by backend)
  const filteredAndSortedData = users;

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return "↕";
    return sortConfig.direction === 'asc' ? "↑" : "↓";
  };

  const handleToggleUser = async (userId, enabled) => {
    const result = await toggleUserAISuggestions(
      userId, 
      enabled, 
      setIsLoading,
      () => {
        // Refresh the data after successful toggle
        const params = {
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          role: roleFilter,
          status: statusFilter,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction
        };
        getUsersWithAISuggestions(params, setUsers, setPagination, () => {});
      }
    );

    if (!result.success) {
      message.error("Failed to update user settings.");
    }
  };

  const handleBulkToggle = async (enable) => {
    if (selectedUsers.length === 0) {
      message.warning("Please select users to update.");
      return;
    }

    const result = await bulkToggleAISuggestions(
      selectedUsers,
      enable,
      setIsLoading,
      () => {
        // Refresh the data after successful bulk toggle
        const params = {
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          role: roleFilter,
          status: statusFilter,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction
        };
        getUsersWithAISuggestions(params, setUsers, setPagination, () => {});
        setSelectedUsers([]);
      }
    );

    if (!result.success) {
      message.error("Failed to update users.");
    }
  };

  const showBulkConfirm = (enable) => {
    confirm({
      title: `${enable ? 'Enable' : 'Disable'} AI Suggestions`,
      content: `This will ${enable ? 'enable' : 'disable'} AI suggestions for ${selectedUsers.length} selected users. Are you sure?`,
      onOk() {
        handleBulkToggle(enable);
      },
    });
  };

  const handleExport = async () => {
    const result = await exportAISuggestionsReport(
      'csv',
      searchQuery,
      roleFilter,
      statusFilter,
      setIsExporting,
      (data) => {
        console.log('Export data:', data);
      }
    );

    if (!result.success) {
      message.error("Unable to generate report. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Helper function to extract suggestions from the complex data structure
  const extractSuggestions = (suggestionData) => {
    if (!suggestionData) return null;
        
    // Handle array of suggestions
    if (Array.isArray(suggestionData)) {
      console.log("Data is an array, length:", suggestionData.length);
      
      // If it's an array of strings, return the first few
      if (suggestionData.length > 0 && typeof suggestionData[0] === 'string') {
        const result = suggestionData.slice(0, 4).join(' ');
        return result;
      }
      
      // If it's an array of objects with suggestion property (your case)
      if (suggestionData.length > 0 && suggestionData[0]?.suggestion) {
        const suggestions = suggestionData[0].suggestion;
        if (Array.isArray(suggestions)) {
          const result = suggestions.slice(0, 4).join(' ');
          return result;
        }
        return suggestions;
      }
      
      // If it's an array of objects, try to extract meaningful text
      const result = suggestionData.slice(0, 2).map(item => 
        typeof item === 'string' ? item : JSON.stringify(item)
      ).join(' ');
      return result;
    }
    
    // Handle object with suggestion property
    if (suggestionData?.suggestion) {
      console.log("Found suggestion property in object:", suggestionData.suggestion);
      const suggestions = suggestionData.suggestion;
      if (Array.isArray(suggestions)) {
        const result = suggestions.slice(0, 4).join(' ');
        return result;
      }
      return suggestions;
    }
    
    // Handle plain string
    if (typeof suggestionData === 'string') {
      return suggestionData;
    }
    
    // Fallback: stringify the object
    const result = JSON.stringify(suggestionData);
    return result;
  };

  // Table columns configuration
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedUsers.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers(filteredAndSortedData.map(user => user?.id).filter(Boolean));
            } else {
              setSelectedUsers([]);
            }
          }}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      align: 'center',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedUsers.includes(record?.id)}
          onChange={(e) => {
            if (e.target.checked && record?.id) {
              setSelectedUsers([...selectedUsers, record.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== record?.id));
            }
          }}
        />
      ),
    },
    {
      title: (
        <span 
          style={{ cursor: 'pointer' }}
          onClick={() => handleSort('name')}
        >
          Name {getSortIcon('name')}
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{ backgroundColor: '#1890ff' }}>{record?.avatar || 'U'}</Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record?.name || 'Unknown User'}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record?.email || 'No email'}</div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span 
          style={{ cursor: 'pointer' }}
          onClick={() => handleSort('role')}
        >
          Role {getSortIcon('role')}
        </span>
      ),
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">{role || 'user'}</Tag>
      ),
    },
    {
      title: 'Enable',
      dataIndex: 'enabled',
      key: 'enabled',
      align: 'center',
      render: (enabled, record) => (
        <Switch
          checked={enabled || false}
          onChange={(checked) => handleToggleUser(record?.id, checked)}
        />
      ),
    },
    // {
    //   title: (
    //     <span 
    //       style={{ cursor: 'pointer' }}
    //       onClick={() => handleSort('lastLogin')}
    //     >
    //       Last Login {getSortIcon('lastLogin')}
    //     </span>
    //   ),
    //   dataIndex: 'lastLogin',
    //   key: 'lastLogin',
    //   render: (date) => date ? formatDate(date) : '-',
    // },
    {
      title: 'AI Suggestions',
      dataIndex: 'suggestion',
      key: 'suggestion',
      width: 350,
      render: (suggestion, record) => {
        const extractedSuggestions = extractSuggestions(suggestion);
        
        if (extractedSuggestions) {
          return (
            <Tooltip title={extractedSuggestions}>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                {/* <div style={{ fontWeight: 500, marginBottom: '4px', color: '#1890ff' }}>
                  AI Suggestions ({record?.isAccepted ? 'Accepted' : 'Pending'})
                </div> */}
                <div style={{ color: '#595959' }}>
                  {truncateText(extractedSuggestions, 120)}
                </div>
              </div>
            </Tooltip>
          );
        } else {
          return (
            <div style={{ fontSize: '12px' }}>
              <Text type="secondary" italic>
                {record?.enabled ? 'No suggestions available' : 'Not enabled for this user'}
              </Text>
            </div>
          );
        }
      },
    },
    {
      title: (
        <span 
          style={{ cursor: 'pointer' }}
          onClick={() => handleSort('suggestionDate')}
        >
          Generated Date {getSortIcon('suggestionDate')}
        </span>
      ),
      dataIndex: 'suggestionDate',
      key: 'suggestionDate',
      render: (date) => date ? formatDate(date) : '-',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>AI Suggestions</Title>
        <Paragraph type="secondary">
          Manage suggestion status and view generated AI suggestions for users
        </Paragraph>
      </div>

      {/* Filters and Actions */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={24} lg={16}>
          <Space wrap>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <DebouncedSearchInput
              data={{
                search: searchQuery,
                setSearch: setSearchQuery,
                placeholder: "Search by name or email...",
                loading: isLoading,
                customStyle: { width: 300, height: 10}
              }}
            />
            </div>

            <Select 
              value={roleFilter} 
              onChange={setRoleFilter}
              style={{ width: 150 }}
              placeholder="Filter by role"
            >
              <Option value="all">All Roles</Option>
              <Option value="user">User</Option>
              <Option value="superadmin">Super Admin</Option>
            </Select>

            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: 150 }}
              placeholder="Filter by status"
            >
              <Option value="all">All Status</Option>
              <Option value="enabled">Enabled</Option>
              <Option value="disabled">Disabled</Option>
            </Select>
          </Space>
        </Col>
        <Col xs={24} lg={8} style={{ textAlign: 'right' }}>
          <Button 
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
            loading={isExporting}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </Col>
      </Row>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Alert
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <span style={{ fontWeight: 500 }}>
                  {selectedUsers.length} users selected
                </span>
              </div>
              <Space>
                <Button 
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => showBulkConfirm(true)}
                >
                  Bulk Enable
                </Button>
                <Button 
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => showBulkConfirm(false)}
                >
                  Bulk Disable
                </Button>
              </Space>
            </div>
          }
          type="info"
          style={{ marginBottom: '16px' }}
        />
      )}

            {/* Data Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAndSortedData}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
          }}
          loading={isLoading}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <BulbOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  No users found
                </div>
                <div style={{ fontSize: '14px', color: '#bfbfbf', marginTop: '8px' }}>
                  Try adjusting your search or filter criteria
                </div>
              </div>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default AiSuggestions; 