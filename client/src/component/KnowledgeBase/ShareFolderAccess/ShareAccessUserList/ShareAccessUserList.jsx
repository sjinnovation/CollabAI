import { Avatar, Button, Checkbox, Input, List, message, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { getUsersForGrantAccess, grantAccessToUsers } from '../../../../api/knowledgeBase';
import user from "../../../../assests/images/user-icon.png"

const ShareAccessUserList = ({isShowShareAccessModal, selectedFolderData, selectedUserIds, setSelectedUserIds, mount}) => {
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [initLoading, setInitLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isShowShareAccessModal && selectedFolderData?._id) {
      fetchData();
    }
  }, [isShowShareAccessModal, selectedFolderData?._id, mount]);

  const fetchData = () => {
    setInitLoading(true);
    getUsersForGrantAccess(selectedFolderData?._id, page, limit, searchTerm)
      .then((res) => {
        setInitLoading(false);
        setList(res.response.data.data);
        setData(res.response.data.data);
        setTotalPages(res.response.data.totalPages);
        window.dispatchEvent(new Event('resize'));
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setInitLoading(false);
      });
  };

  const onLoadMore = () => {
    if (page < totalPages) {
      setLoading(true);
      const nextPage = page + 1;

      getUsersForGrantAccess(selectedFolderData?._id, nextPage, limit, searchTerm)
        .then((res) => {
          const newData = data.concat(res.response.data.data);
          setData(newData);
          setList(newData);
          setTotalPages(res.response.data.totalPages);
          setPage(nextPage);
          setLoading(false);
          window.dispatchEvent(new Event('resize'));
        })
        .catch((error) => {
          console.error("Error loading more data:", error);
          setLoading(false);
        });
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId) 
        : [...prevSelected, userId]
    );
  };

  const loadMore =
    !initLoading && !loading && page < totalPages ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button onClick={onLoadMore}>Load more</Button>
      </div>
    ) : null;

    const handleSearch = (e) => {
      setSearchTerm(e.target.value); 
      setPage(1); 
      fetchData(); 
    };

  return (
   <>
      <div style={{ margin: "0 10px 0 0" }}>
      <Input placeholder="Search users" onChange={handleSearch} value={searchTerm} />
      </div>
       <List
        className="demo-loadmore-list"
        loading={initLoading}
        itemLayout="horizontal"
        loadMore={loadMore}
        dataSource={list}
        renderItem={(item) => (
        <List.Item style={{ display: "flex", alignItems: "center" }} actions={[<Checkbox onChange={() => handleCheckboxChange(item._id)} checked={selectedUserIds.includes(item._id)} key={item._id}></Checkbox>]}>
            <Skeleton avatar title={false} loading={item.loading} active>
                <List.Item.Meta
                avatar={<Avatar src={item?.userAvatar ?? user} />}
                title={<div style={{ display: "flex", alignItems: "self-start", flexDirection: "column" }}>
                  <span style={{ textTransform: "capitalize" }}>{item?.fname} {item?.lname}</span>
                  <span  style={{ textTransform: "lowercase", color: "gray", fontSize: "12px" }}>{item?.email}</span>
                </div>}
                />
            </Skeleton>
        </List.Item>
        )}
    />
    
   </>
  )
}

export default ShareAccessUserList