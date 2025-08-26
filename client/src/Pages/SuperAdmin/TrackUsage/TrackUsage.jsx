import React, { useState, useEffect } from 'react'
import { Typography, DatePicker, Button, Avatar,Dropdown,Menu, Input } from 'antd'
import { getDailyUsageReport, getMonthlyUsageReport } from '../../../api/track-usage-api-functions';
import UserTrackUsageTable from '../../Account/TrackUsageComponent/UserTrackUsageTable';
import moment from 'moment';
import {ExportOutlined } from "@ant-design/icons"
import './TrackUsage.css';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { tractusageheaders } from "../../../constants/export_constants"
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const { MonthPicker } = DatePicker;
const { Title } = Typography;

const TrackUsage = () => {
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalUsageReport, setTotalUsageReport] = useState({})
  const [aggregatedData, setAggregatedData] = useState([])
  const [usageReport, setUsageReport] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRows, setSelectedRows] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFetchMonthlyReport = async () => {
    setLoading(true)
    try {
      const {
        success,
        trackUsage,
        aggregatedData,
        aggregatedDataTotal
      } = await getMonthlyUsageReport("",selectedDate)
      if (success) {

        let result = [];
        aggregatedData.reduce((res, value) => {
          if (!res[value._id.user_id]) {
            res[value._id.user_id] = {
              _id: value._id,
              total_tokens: 0,
              total_token_cost: 0,
              count: 0,
              user_info: value.user_info,
            };
            result.push(res[value._id.user_id]);
          }
          res[value._id.user_id].total_tokens += value.total_tokens;
          res[value._id.user_id].total_token_cost += value.total_token_cost;
          res[value._id.user_id].count += value.count;
          return res;
        }, {});
        setTotalUsageReport(aggregatedDataTotal)
        setUsageReport(trackUsage)
        setAggregatedData(result)
        setLoading(false)
      } else {
        setTotalUsageReport({})
        setUsageReport([])
        setAggregatedData([])
        setLoading(false)
      }
    } finally {
      // setLoader(false);
    }
  };

  useEffect(() => {
    handleFetchMonthlyReport()
  }, [selectedDate])

  const filteredData = aggregatedData.filter(item => {
    const fullName = `${item.user_info.fname} ${item.user_info.lname}`.toLowerCase();
    const email = item.user_info.email.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const exportToCSV = (data) => {

    const csvData = data.map((item) => [
      `${item._id.month}`,
      `${item.user_info.fname} ${item.user_info.lname}`,
      item.user_info.email,
      item.count,
      item.total_tokens,
      `$${Number(item.total_token_cost).toFixed(5)}`,
    ])

    const csvContent = [tractusageheaders, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `monthly_usage_report_${selectedDate || "all"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportMenuClick = ({ key }) => {
    if (key === "selected") {
      setSelectionMode(true)
    } else {
      exportToCSV(aggregatedData)
    }
  }

  const handleExportSelected = () => {
    const selectedData = aggregatedData.filter((item) =>
      selectedRows.some(
        (row) =>
          `${row._id.year}-${row._id.month}-${row._id.day}-${row.user_info.email}` ===
          `${item._id.year}-${item._id.month}-${item._id.day}-${item.user_info.email}`,
      ),
    )
    exportToCSV(selectedData)
    setSelectionMode(false)
    setSelectedRows([])
  }



  const columns = [
    {
      title: "Month",
      dataIndex: "_id",
      width: '20%',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
      render: (_id) => {
        const date = new Date(_id.year, _id.month - 1);
        return <p>{date.toLocaleString('default', { month: 'long' })}</p>;
      },
    },
    {
      title: "User",
      dataIndex: "user_info",
      width: '30%',
      render: (day) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar style={{ marginRight: "20px" }} icon={<UserOutlined />} className="track-usage-icon-size"/>
          <div style={{ textAlign: "left" }}>
            <Typography>{`${day?.fname} ${day?.lname}`}</Typography>
            <Typography>{day?.email}</Typography>
          </div>
        </div>
      ),
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: "Prompt Count",
      dataIndex: "count",
      width: '20%',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: "Total Token",
      dataIndex: "total_tokens",
      width: '20%',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: "Cost",
      dataIndex: "total_token_cost",
      width: '20%',
      render: (value) => <p>${Number(value).toFixed(5)}</p>,
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
  ];

  const exportMenu = (
    <Menu onClick={handleExportMenuClick}>
      <Menu.Item key="selected">Export Selected Data</Menu.Item>
      <Menu.Item key="all">Export All Data</Menu.Item>
    </Menu>
  )

return (
    <div className='track-usage-styles'>
      <ProfileHeader title="Monthly Report" subHeading=" Track your montly usage." />
      <div className='usage-report-container'>
      <div className="controls-container">
        <MonthPicker
          format="YYYY-MM"
          onChange={handleDateChange}
          placeholder="Select month"
        />
        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ margin: '0 10px' }}
        />
        {selectionMode ? (
            <Button className="export-btn" onClick={handleExportSelected} icon={<ExportOutlined />}>
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
        <div className='total-usage-report-container'>
          <Typography><b>Total Token: {totalUsageReport?.total_tokens ? totalUsageReport?.total_tokens : 0 }</b></Typography>
          <Typography>
              <b>
              Total Cost: $
              {totalUsageReport && !isNaN(Number(totalUsageReport.total_cost))
                  ? Number(totalUsageReport.total_cost).toFixed(5)
                  : "0.00000"
              }
              </b>
          </Typography>
        </div>
      </div>

      <div className="table-container mt-4">
        <UserTrackUsageTable
          dataProps={{
            loading,
            data: filteredData,
            columns,
            selectionMode,
            onSelectionChange: (selectedRowKeys, selectedRows) => setSelectedRows(selectedRows),
            selectedRows,
          }}
        />

      </div>
    </div>
  )
}

export default TrackUsage
