import React, { useEffect, useState } from 'react'
import { Typography } from 'antd';
import { DatePicker } from 'antd';
import { getUserID, getUserRole } from '../../Utility/service';
import { getDailyUsageReport, getMonthlyUsageReport } from '../../api/track-usage-api-functions';
import UserTrackUsageTable from './TrackUsageComponent/UserTrackUsageTable';
import moment from 'moment';
import './Usage.css'

const { MonthPicker } = DatePicker;

const Usage = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(false)
  const [usageReport, setUsageReport] = useState([]);
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

        setTotalUsageReport(aggregatedDataTotal)
        setUsageReport(trackUsage)
        setAggregatedData(aggregatedData)
        setLoading(false)
      } else {
        setTotalUsageReport({})
        setUsageReport([])
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
      title: 'Date',
      dataIndex: '_id',
      render: day => <p>{day?.day}</p>
    },
    {
      title: 'Prompt Count',
      dataIndex: 'count',
    },
    {
      title: 'Total Token',
      dataIndex: 'total_tokens',
    },
    {
      title: 'Cost',
      dataIndex: 'total_token_cost',
      render: value => Number(value).toFixed(5)
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
          <p>Total Token: {totalUsageReport?.total_tokens}</p>
          <p>Total Cost: $ {totalUsageReport?.total_cost}</p>
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
