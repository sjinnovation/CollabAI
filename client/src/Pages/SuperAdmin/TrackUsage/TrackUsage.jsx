import React, { useState } from 'react'
import { Typography, DatePicker, Button, Avatar } from 'antd'
import { useEffect } from 'react';
import { getDailyUsageReport, getMonthlyUsageReport } from '../../../api/track-usage-api-functions';
import UserTrackUsageTable from '../../Account/TrackUsageComponent/UserTrackUsageTable';
import moment from 'moment';
import './TrackUsage.css';
import { UserOutlined } from '@ant-design/icons';

const { MonthPicker } = DatePicker;
const { Title } = Typography;

const TrackUsage = () => {
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalUsageReport, setTotalUsageReport] = useState({})
  const [aggregatedData, setAggregatedData] = useState([])
  const [usageReport, setUsageReport] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); 

  const handleDateChange = (date, dateString) => {
    console.log(dateString);
    setSelectedDate(dateString);
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
      width: '20%',
      render: (day) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar style={{ marginRight: "20px" }} icon={<UserOutlined />} />
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

return (
    <div className=''>
      <div className='usage-report-container'>
        <MonthPicker
          format="YYYY-MM"
          onChange={handleDateChange}
          placeholder="Select month"
        />
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
            data: aggregatedData,
            columns
          }}
        />

      </div>
    </div>
  )
}

export default TrackUsage
