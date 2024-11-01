import React from 'react'
import AssistantUsageTable from '../../Account/TrackUsageComponent/AssistantUsageTable'
import { Avatar, List, DatePicker,Modal } from 'antd'
import { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { getAssistantMonthlyUsageReport, getUsersListForAnAssistant } from '../../../api/track-usage-api-functions';
import { useEffect } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/themeConfig';

const { MonthPicker } = DatePicker;


const AssistantUsage = () => {
  // ------------ States -------------------------------------
  const { theme } = useContext(ThemeContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [assistantUsage, setAssistantUsage] = useState([]);
  const [assistantUserList, setAssistantUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState(0)


  // ----------------- Side Effect ---------------------------
  useEffect(() => {
    handleFetchAssistantMonthlyReport(1)
  }, [selectedDate])


  // --------------------- API calls ---------------------------

  const handleFetchAssistantMonthlyReport = async (page) => {
   setLoading(true)
    try {
      const {
        success,
        data,
        totalDataCount
      } = await getAssistantMonthlyUsageReport(selectedDate, page)
      if (success) {
        data?.forEach(entry => {
          const timestamp = new Date(entry.createdAt);
          const monthNumber = timestamp.getUTCMonth();
          // Convert the month number to the month name
          const monthNames = ["January", "February", "March", "April", "May", "June", 
                              "July", "August", "September", "October", "November", "December"];
          const monthName = monthNames[monthNumber];
          // Add the monthName field to the entry
          entry.monthName = monthName;
      });
        setTotalDataCount(totalDataCount)
        setAssistantUsage(data)
        setLoading(false)
      } else {
        setLoading(false)
      }
    } finally {
    }
  };

  const handleFetchAllUsersForAnAssistant = async (assistantId) => {
    setIsFetchingUsers(true)
    setIsModalOpen(true)
    try {
      const {
        success,
        data,
      } = await getUsersListForAnAssistant(assistantId)
      if (success) {
        setAssistantUserList(data)
        setIsFetchingUsers(false)
      } else {
        setIsFetchingUsers(false)
      }
    } finally {
    }
  }

 // ------------------- Local functions ------------------------ 
 
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setAssistantUserList([])
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
  };

  
  return (
    <div>
      <div className='mt-3 mb-4'>
        <MonthPicker
          format="YYYY-MM"
          onChange={handleDateChange}
          placeholder="Select month"
        />
      </div>
      <div className='mt-4'>
        <AssistantUsageTable
          dataProps={{
            loading,
            data: assistantUsage,
            totalDataCount,
            actions: {
              handleFetchAllUsersForAnAssistant,
              handleFetchAssistantMonthlyReport
            }
          }}
        />
      </div>
      <div>
        <Modal footer={null} title="User List" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <List
            loading={isFetchingUsers}
            itemLayout="horizontal"
            dataSource={assistantUserList}
            renderItem={(user, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ color: theme === "light" ? "#000" : "#fff" }} src={<FaUserCircle />} size={35} />}
                  title={<>{user?.fname} {user?.lname}</>}
                  description={user?.userEmail}
                />
              </List.Item>
            )}
          />
        </Modal>
      </div>
    </div>
  )
}

export default AssistantUsage
