import React, { useEffect, useState } from 'react'
import { Typography } from 'antd';
import { DatePicker } from 'antd';
import { getUserID } from '../../Utility/service';
import { getMonthlyUsageReport } from '../../api/track-usage-api-functions';
import UserTrackUsageTable from './TrackUsageComponent/UserTrackUsageTable';
import './Usage.css'

const { MonthPicker } = DatePicker;

const Usage = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(false)
  const [totalUsageReport, setTotalUsageReport] = useState({})
  const [aggregatedData, setAggregatedData] = useState([])

  const userid = getUserID()

  const handleMonthChange = (date, dateString) => {
    // console.log("Type:", typeof (dateString))
    setSelectedMonth(dateString)
    console.log("SelectedMonth:", selectedMonth)
  };

  const handleFetchMonthlyReport = async () => {
    setLoading(true)
    try {
      const {
        success,
        trackUsage,
        aggregatedData,
        aggregatedDataTotal
      } = await getMonthlyUsageReport(userid, selectedMonth)
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
        setAggregatedData(result)
        setLoading(false)
      } else {
        setTotalUsageReport({})
        setAggregatedData([])
        setLoading(false)
      }
      // console.log(result)
    } finally {
      // setLoader(false);
    }
  };

  useEffect(() => {
    handleFetchMonthlyReport()
  }, [selectedMonth])


  const columns = [
    {
      title: "Month",
      dataIndex: "_id",
      render: (_id) => {
        const date = new Date(_id.year, _id.month - 1);
        return <p>{date.toLocaleString('default', { month: 'long' })}</p>;
      },
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      }
    },
    {
      title: 'Prompt Count',
      dataIndex: 'count',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: 'Total Token',
      dataIndex: 'total_tokens',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: 'Cost',
      dataIndex: 'total_token_cost',
      render: (value) => <p>${Number(value).toFixed(5)}</p>,
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
  ]

  return (
    <div>
      <div className='usage-container'>
        <MonthPicker
          defaultValue={selectedMonth}
          onChange={handleMonthChange}
        />
        <div className='usage-report-container'>
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
      <div className="track-usage-table">
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

export default Usage
