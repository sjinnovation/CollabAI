import React, { useState, useEffect, useContext } from "react";
import {
  Avatar,
  List,
  DatePicker,
  Modal,
  Input,
  Button,
  Menu,
  Dropdown,
  message,
} from "antd";
import { ExportOutlined, DownOutlined } from "@ant-design/icons";
import { FaUserCircle } from "react-icons/fa";
import { ThemeContext } from "../../../contexts/themeConfig";
import ProfileHeader from "../../../component/Proflie/ProfileHeader";
import DevUsageTable from "../../Account/TrackUsageComponent/DevUsageTable";
import "./TrackUsage.css"; // Reusing the same CSS for consistency
import {getVsPluginUsageReport,getVsPluginUserUsage} from "../../../api/track-usage-api-functions";
const { MonthPicker } = DatePicker;

const DevUsage = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [devUsage, setDevUsage] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalPromptCount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    handleFetchDevUsage(currentPage, pageSize);
  }, [selectedDate, sortBy, sortOrder, searchTerm, currentPage, pageSize]);

  const handleFetchDevUsage = async (page, limit = pageSize, isExport = false) => {
    setLoading(true);
    try {
      const { success, data, totalDataCount } = await getVsPluginUsageReport(
        selectedDate,
        page,
        limit,
        sortBy,
        sortOrder,
        searchTerm.trim()
      );
      if (success) {
        const formattedData = data.map((entry) => {
          const timestamp = new Date(entry.updatedAt);
          const monthNumber = timestamp.getUTCMonth();
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return {
            ...entry,
            monthName: monthNames[monthNumber],
            email: entry.email || "Unknown User",
            totalPromptCount: entry.total_prompt_count || 0,
            totalTokenCount: entry.total_tokens || 0,
            totalOpenAICount: entry.openAi_count || 0,
            totalClaudeCount: entry.claude_count || 0,
          };
        });

        setTotalDataCount(totalDataCount);
        setDevUsage(formattedData);

        if (isExport || page === 1) {
          setAllData(formattedData);
        } else {
          setAllData((prevData) => [...prevData, ...formattedData]);
        }
      } else {
        message.error("Failed to fetch usage data.");
      }
    } catch (error) {
      console.error("Error fetching VS Plugin usage:", error);
      message.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUserDetails = async (userId) => {
    setIsFetchingUsers(true);
    setIsModalOpen(true);
    try {
        const { success, data } = await getVsPluginUserUsage(
            userId,
      );
      if (success) {
        setUserDetails([data]); // Single user details
      } else {
        message.error("Failed to fetch user details.");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      message.error("Failed to fetch user details. Please try again.");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) setCurrentPage(1);
  };

  const handleSortChange = ({ key }) => {
    const [newSortBy, newSortOrder] = key.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exportToCSV = async (usagedata) => {
    setLoading(true);
    try {
      let dataToExport = usagedata;
      if (usagedata === allData && allData.length < totalDataCount) {
        const totalPages = Math.ceil(totalDataCount / pageSize);
        for (let page = 2; page <= totalPages; page++) {
          const { success, data }= await getVsPluginUsageReport(
            selectedDate,
            page,
            pageSize,
            sortBy,
            sortOrder,
            searchTerm.trim()
          );
          if (success) {
            const formattedPageData = data.map((entry) => {
              const timestamp = new Date(entry.updatedAt);
              const monthNumber = timestamp.getUTCMonth();
              const monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];
              return {
                ...entry,
                monthName: monthNames[monthNumber],
                email: entry.email || "Unknown User",
                totalPromptCount: entry.total_prompt_count || 0,
                totalTokenCount: entry.total_tokens || 0,
                totalOpenAICount: entry.openAi_count || 0,
                totalClaudeCount: entry.claude_count || 0,
              };
            });
            dataToExport = [...dataToExport, ...formattedPageData];
          }
        }
      }

      const headers = [
        "Month",
        "Email",
        "Total Prompts",
        "Total Tokens",
        "OpenAI Tokens",
        "Claude Tokens",
      ];
      const csvData = dataToExport.map((item) => [
        item.monthName,
        item.email,
        item.totalPromptCount.toString(),
        item.totalTokenCount.toString(),
        item.totalOpenAICount.toString(),
        item.totalClaudeCount.toString(),
      ]);
      const csvContent = [headers, ...csvData]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `dev_usage_report_${selectedDate || "all"}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
      message.error("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportMenuClick = ({ key }) => {
    if (key === "selected") {
      setSelectionMode(true);
    } else {
      exportToCSV(allData);
    }
  };

  const handleExportSelected = () => {
    exportToCSV(selectedRows);
    setSelectionMode(false);
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  const onSelectionChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const sortMenu = (
    <Menu onClick={handleSortChange} className="custom-sort-menu">
      <Menu.Item
        key="updatedAt-desc"
        className={sortBy === "updatedAt" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Recent First
      </Menu.Item>
      <Menu.Item
        key="updatedAt-asc"
        className={sortBy === "updatedAt" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Oldest First
      </Menu.Item>
      <Menu.Item
        key="totalPromptCount-desc"
        className={sortBy === "totalPromptCount" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Top Prompts
      </Menu.Item>
      <Menu.Item
        key="totalPromptCount-asc"
        className={sortBy === "totalPromptCount" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Lowest Prompts
      </Menu.Item>
      <Menu.Item
        key="totalTokenCount-desc"
        className={sortBy === "totalTokenCount" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Top Tokens
      </Menu.Item>
      <Menu.Item
        key="totalTokenCount-asc"
        className={sortBy === "totalTokenCount" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Fewest Tokens
      </Menu.Item>

  {/* Uncomment the following lines if you want to add sorting by email   */}
      {/* 
      <Menu.Item
        key="email-asc"
        className={sortBy === "email" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Email (A-Z)
      </Menu.Item>
      <Menu.Item
        key="email-desc"
        className={sortBy === "email" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Email (Z-A)
      </Menu.Item> */}
      
    </Menu>
  );

  const exportMenu = (
    <Menu onClick={handleExportMenuClick}>
      <Menu.Item key="selected">Export Selected Data</Menu.Item>
      <Menu.Item key="all">Export All Data</Menu.Item>
    </Menu>
  );

  return (
    <div className="track-usage-styles">
      <ProfileHeader
        title="VS Plugin Report"
        subHeading="Track your VS Plugin usage."
      />
      <div className="mt-3 mb-4">
        <div
          className="controls-container"
          style={{ display: "flex", gap: "10px" }}
        >
          <MonthPicker
            format="YYYY-MM"
            onChange={handleDateChange}
            placeholder="Select month"
          />
          <Input
            placeholder="Search by user email"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 200 }}
          />
          <Dropdown overlay={sortMenu} placement="bottomRight">
            <Button>
              Sort By <DownOutlined />
            </Button>
          </Dropdown>
          {selectionMode ? (
            <Button
              className="export-btn"
              onClick={handleExportSelected}
              icon={<ExportOutlined />}
            >
              Export Selected
            </Button>
          ) : (
            <Dropdown overlay={exportMenu} placement="bottomRight">
              <Button className="export-btn" icon={<ExportOutlined />}>
                Export to CSV <DownOutlined />
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
      <div className="mt-4">
        <DevUsageTable
          dataProps={{
            data: devUsage,
            loading,
            actions: {
              handleFetchUserDetails,
              handleFetchDevUsage,
            },
            totalDataCount,
            pageSize,
            currentPage,
            handlePageChange,
            handlePageSizeChange,
            selectionMode,
            onSelectionChange,
            selectedRowKeys,
          }}
        />
      </div>

      {/* Uncomment the following section if you want to display user details in a modal */}
      {/* <div
        footer={null}
        title="User Details"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <List
          loading={isFetchingUsers}
          itemLayout="horizontal"
          dataSource={userDetails}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={<FaUserCircle />} size={35} />}
                title={user.email}
                description={`Prompts: ${user.total_prompt_count}, Tokens: ${user.total_tokens}`}
              />
            </List.Item>
          )}
        />
      </div> */}
    </div>
  );
};

export default DevUsage;