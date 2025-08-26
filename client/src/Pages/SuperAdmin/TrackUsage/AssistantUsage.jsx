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
import {
  getAssistantMonthlyUsageReport,
  getUsersListForAnAssistant,
} from "../../../api/track-usage-api-functions";
import { ThemeContext } from "../../../contexts/themeConfig";
import AssistantUsageTable from "../../../Pages/Account/TrackUsageComponent/AssistantUsageTable";
import "./TrackUsage.css";
import ProfileHeader from "../../../component/Proflie/ProfileHeader";

const { MonthPicker } = DatePicker;

const AssistantUsage = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [assistantUsage, setAssistantUsage] = useState([]);
  const [assistantUserList, setAssistantUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    handleFetchAssistantMonthlyReport(currentPage, pageSize);
  }, [
    selectedDate,
    ownerName,
    sortBy,
    sortOrder,
    searchTerm,
    currentPage,
    pageSize,
  ]);

  const handleFetchAssistantMonthlyReport = async (
    page,
    limit = pageSize,
    isExport = false
  ) => {
    setLoading(true);
    try {
      const { success, data, totalDataCount } =
        await getAssistantMonthlyUsageReport(
          selectedDate,
          page,
          limit,
          ownerName.trim(),
          sortBy,
          sortOrder,
          searchTerm.trim()
        );
      if (success) {
        const formattedData = data.map((entry) => {
          const timestamp = new Date(entry.createdAt);
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
            assistantName: entry.assistantName || "Unknown Assistant",
            ownerName: entry.ownerName || "Unknown Owner",
            uniqueUserCount: entry.userUsageDetails
              ? entry.userUsageDetails.length
              : 0,
            totalUsageCount: entry.totalUsageCount || 0,
          };
        });

        setTotalDataCount(totalDataCount);
        setAssistantUsage(formattedData);

        if (isExport || page === 1) {
          setAllData(formattedData);
        } else {
          setAllData((prevData) => [...prevData, ...formattedData]);
        }
      }
    } catch (error) {
      console.error("Error fetching assistant monthly report:", error);
      message.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAllUsersForAnAssistant = async (assistantId) => {
    setIsFetchingUsers(true);
    setIsModalOpen(true);
    try {
      const { success, data } = await getUsersListForAnAssistant(
        selectedDate,
        assistantId
      );
      if (success) setAssistantUserList(data);
    } catch (error) {
      console.error("Error fetching users for assistant:", error);
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

  const handleOwnerNameChange = (e) => {
    const value = e.target.value;
    setOwnerName(value);
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

  const exportToCSV = async (data) => {
    setLoading(true);
    try {
      let dataToExport = data;
      if (data === allData && allData.length < totalDataCount) {
        const totalPages = Math.ceil(totalDataCount / pageSize);
        for (let i = 2; i <= totalPages; i++) {
          const { success, data } = await getAssistantMonthlyUsageReport(
            selectedDate,
            i,
            pageSize,
            ownerName.trim(),
            sortBy,
            sortOrder,
            searchTerm.trim()
          );
          if (success) {
            const formattedPageData = data.map((entry) => {
              const timestamp = new Date(entry.createdAt);
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
                assistantName: entry.assistantName || "Unknown Assistant",
                ownerName: entry.ownerName || "Unknown Owner",
                uniqueUserCount: entry.userUsageDetails || 0,
                totalUsageCount: entry.totalUsageCount || 0,
              };
            });
            dataToExport = [...dataToExport, ...formattedPageData];
          }
        }
      }

      const assistantUserDetails = await Promise.all(
        dataToExport.map(async (item) => {
          const { success, data } = await getUsersListForAnAssistant(
            selectedDate,
            item.assistantId
          );
          let userNamesWithUsage = "No Users";
          if (success && data.length > 0) {
            userNamesWithUsage = item.userUsageDetails
              .map((userDetail) => {
                const user = data.find((u) => u.userId === userDetail.userId);
                return user
                  ? `${user.fname} ${user.lname}: ${userDetail.usageCount}`
                  : null;
              })
              .filter(Boolean)
              .join(", ");
          }
          return {
            ...item,
            userNamesWithUsage,
          };
        })
      );

      const headers = [
        "Month",
        "Assistant Name",
        "Owner Name",
        "Total Usage Count",
        "Users (Name: UsageCount)",
      ];
      const csvData = assistantUserDetails.map((item) => [
        item.monthName,
        item.assistantName,
        item.ownerName,
        item.totalUsageCount.toString(),
        item.userNamesWithUsage,
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
        `assistant_usage_report_${selectedDate || "all"}.csv`
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
        key="totalUsageCount-desc"
        className={sortBy === "totalUsageCount" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Top Usage
      </Menu.Item>
      <Menu.Item 
        key="totalUsageCount-asc"
        className={sortBy === "totalUsageCount" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Lowest Usage
      </Menu.Item>
      <Menu.Item 
        key="uniqueUserCount-desc"
        className={sortBy === "uniqueUserCount" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Top Users
      </Menu.Item>
      <Menu.Item 
        key="uniqueUserCount-asc"
        className={sortBy === "uniqueUserCount" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Fewest Users
      </Menu.Item>
      <Menu.Item 
        key="assistantName-asc"
        className={sortBy === "assistantName" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Assistant Name (A-Z)
      </Menu.Item>
      <Menu.Item 
        key="assistantName-desc"
        className={sortBy === "assistantName" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Assistant Name (Z-A)
      </Menu.Item>
      <Menu.Item 
        key="ownerName-asc"
        className={sortBy === "ownerName" && sortOrder === "asc" ? "ant-menu-item-active" : ""}
      >
        Owner Name (A-Z)
      </Menu.Item>
      <Menu.Item 
        key="ownerName-desc"
        className={sortBy === "ownerName" && sortOrder === "desc" ? "ant-menu-item-active" : ""}
      >
        Owner Name (Z-A)
      </Menu.Item>
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
        title="Assistant Report"
        subHeading="Track your assistant usage."
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
            placeholder="Search by assistant name"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 200 }}
          />
          <Input
            placeholder="Filter by owner name"
            value={ownerName}
            onChange={handleOwnerNameChange}
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
        <AssistantUsageTable
          dataProps={{
            data: assistantUsage,
            loading,
            actions: {
              handleFetchAllUsersForAnAssistant,
              handleFetchAssistantMonthlyReport,
            },
            totalDataCount,
            pageSize,
            currentPage,
            handlePageChange,
            handlePageSizeChange,
            selectionMode,
            onSelectionChange,
            selectedRowKeys,
            selectedRows,
          }}
        />
      </div>
      <Modal
        footer={null}
        title="User List"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <List
          loading={isFetchingUsers}
          itemLayout="horizontal"
          dataSource={assistantUserList}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={<FaUserCircle />} size={35} />}
                title={`${user?.fname} ${user?.lname}`}
                description={user?.userEmail}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default AssistantUsage;
