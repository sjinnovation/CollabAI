import React, { useState } from 'react'
import UserTrackUsageTable from '../../Account/TrackUsageComponent/UserTrackUsageTable'
import { Avatar, DatePicker, Typography } from 'antd';
import './TrackUsage.css'
import { getDailyUsageReport } from '../../../api/track-usage-api-functions';
import { useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';

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
          title: "Date",
          dataIndex: "_id",
          width: '20%',
          render: (_id) => <p>{_id?.month}/{_id?.day}/{_id?.year}</p>,
          onHeaderCell: () => {
            return {
              style: {
                textAlign: 'center',
              }
            };
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
                <DatePicker
                    format="YYYY-MM-DD"
                    onChange={handleDateChange}
                    placeholder="Select Date"
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

export default DailyUsage
