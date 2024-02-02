import React, { useState, useEffect } from "react";

// libraries
import { Button, Table, Typography } from "antd";
import { Link } from "react-router-dom";

// components
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";

// api
import { fetchUsersPrompt  } from "../../api/usersPrompt"

//constants 
const { Title } = Typography;
const initialLoaderState = {
  PROMPT_LOADING: true,
  PROMPT_SEARCHING: false,
};
const initialUsersPromptState = {
  prompt: [],
  pagination: "",
  totalCount: "",
};
const limit = 10;

// Component Definition
const PromptUsersList = () => {

 // ----- STATES ----- //
  const [userPromptList, setUsersPromptList] = useState({
    ...initialUsersPromptState,
  });
  const [loader, setLoader] = useState({ ...initialLoaderState });
  const [searchInputValue, setSearchInputValue] = useState("");

 // -------------------Side Effects-------------------//
  useEffect(() => {
    fetchData(1);
  }, [searchInputValue]);
 
 // ----- ASYNCHRONOUS DATA FETCHING ----- //
  const fetchData = async (page) => {
    try {
      setLoader((prevLoader) => ({
        ...prevLoader,
        PROMPT_LOADING: true,
        PROMPT_SEARCHING: searchInputValue ? true : false,
    }));

      const result = await fetchUsersPrompt({
        page,
        limit,
        searchInputValue,
      });
      setUsersPromptList(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoader((prevLoader) => ({
        ...prevLoader,
        PROMPT_LOADING: false,
        PROMPT_SEARCHING: false,
    }));
    }
  };
  
 // ----- TABLE COLUMNS DEFINITION ----- //
  const columns = [
    {
      title: "First Name",
      dataIndex: "fname",
      key: "fname",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Prompt Counts",
      dataIndex: "promptsCount",
      key: "promptsCount",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Link to={`/promptlistview/${record._id}`}>
          <Button>
            <span >
              <i className="bi bi-arrow-up-right-circle "></i>
            </span>
          </Button>
        </Link>
      ),
    },
  ];

  console.log("userPromptList:", userPromptList)
  
 // ----- RENDER COMPONENT ----- //
  return (
    <>
      <div className="mt-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-12 d-flex align-items-center justify-content-between">
              <Title level={2}>Chat Prompt Lists</Title>
            </div>
          </div>  
              <div className="col-12 d-flex justify-content-between py-4">
                <DebouncedSearchInput
                  data={{
                    search: searchInputValue,
                    setSearch: setSearchInputValue,
                    loading: loader.PROMPT_SEARCHING,
                    placeholder: "Search by name",
                  }}
                />
              </div>
           
     

    {/* TABLE COMPONENT */}
          <Table
            loading={loader.PROMPT_LOADING}
            bordered={true}
            columns={columns}
            dataSource={userPromptList.prompt}
            scroll={{ y: "50vh" }}
            pagination={{
              current: userPromptList.pagination,
              pageSize: 10,
              total: userPromptList?.totalcount,
              showTotal: (total) => `Total ${total} items`,
              showQuickJumper: true,
              onChange: (page, pageSize) => {
                fetchData (page);
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PromptUsersList;
