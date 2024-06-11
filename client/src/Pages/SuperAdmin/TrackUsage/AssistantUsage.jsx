import React from 'react'
import AssistantUsageTable from '../../Account/TrackUsageComponent/AssistantUsageTable'
import { Avatar, List, DatePicker,Modal } from 'antd'
import { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { getAssistantMonthlyUsageReport, getUsersListForAnAssistant } from '../../../api/track-usage-api-functions';
import { useEffect } from 'react';
const { MonthPicker } = DatePicker;


const AssistantUsage = () => {
  // ------------ States -------------------------------------
  const [selectedDate, setSelectedDate] = useState(null);
  const [assistantUsage, setAssistantUsage] = useState([]);
  const [assistantUserList, setAssistantUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);


  // ----------------- Side Effect ---------------------------
  useEffect(() => {
    handleFetchAssistantMonthlyReport()
  }, [selectedDate])


  // --------------------- API calls ---------------------------

  const handleFetchAssistantMonthlyReport = async () => {
   setLoading(true)
    try {
      const {
        success,
        data,
      } = await getAssistantMonthlyUsageReport(selectedDate)
      if (success) {
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
            actions: {
              handleFetchAllUsersForAnAssistant
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
                  avatar={<Avatar src={<FaUserCircle />} size={35} />}
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
