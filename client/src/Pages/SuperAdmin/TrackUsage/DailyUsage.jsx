import React, { useState } from 'react'
import UserTrackUsageTable from '../../Account/TrackUsageComponent/UserTrackUsageTable'
import { DatePicker } from 'antd';
import './TrackUsage.css'
import { getDailyUsageReport } from '../../../api/track-usage-api-functions';
import { useEffect } from 'react';

const DailyUsage = () => {
    const [loading, setLoading] = useState(false)
    const [totalUsageReport, setTotalUsageReport] = useState({})
    const [aggregatedData, setAggregatedData] = useState([])
    const [usageReport, setUsageReport] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);


    const handleDateChange = (date, dateString) => {
        console.log(dateString);
        setSelectedDate(dateString);
    };

    console.log("Date:", selectedDate)

    const handleFetchDailyReport = async () => {
        setLoading(true)
        try {
            const {
                success,
                trackUsage,
                aggregatedData,
                aggregatedDataTotal
            } = await getDailyUsageReport('', selectedDate)
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
        } finally {
            // setLoader(false);
        }
    };

    useEffect(() => {
        handleFetchDailyReport()

    }, [selectedDate])

    const columns = [
        {
            title: 'Date',
            dataIndex: '_id',
            render: day => <p>{day?.day}</p>
        },
        {
            title: 'User ID',
            dataIndex: '_id',
            render: day => <p>{day?.user_id}</p>
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
        <div className=''>
            <div className='usage-report-container'>
                <DatePicker
                    format="YYYY-MM-DD"
                    onChange={handleDateChange}
                    placeholder="Select Date"
                />
                <div className='total-usage-report-container'>
                    <p>Total Token: {totalUsageReport?.total_tokens}</p>
                    <p>Total Cost: $ {totalUsageReport?.total_cost}</p>
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

export default DailyUsage
