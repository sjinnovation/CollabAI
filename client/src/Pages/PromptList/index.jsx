import React, { useState, useEffect } from "react";
import "./Promptlist.scss";

//libraries
import { Link, useParams } from "react-router-dom";
import { AiOutlineInfo } from "react-icons/ai";
import { Button, Table, DatePicker, Typography } from "antd";

//components imports 
import PromptDetailViewModal from "./PromptDetailViewModal"

//api calls
import { fetchSingleUserPrompts } from "../../api/usersPrompt";

//constants 
const { Title } = Typography;
const initialUsersPromptState = {
  prompt: [],
  pagination: "",
  totalCount: "",
};
const limit = 10;

// Component Definition
const UserPromptList = () => {
  // ----- STATES ----- //
  const [prompts, setPrompts] = useState({ ...initialUsersPromptState });
  const [show, setShow] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [loader, setLoader] = useState(true);
  

  // ----- PARAMETERS ----- //
  const { id } = useParams();

  // -------------------Side Effects-------------------//
  useEffect(() => {
    
    fetchData(1, null, true);
  }, []);



  // ----- ASYNCHRONOUS DATA FETCHING ----- //
  const fetchData = async (page, date, initFetch) => {
    try {
      setLoader(true);
      const result = await fetchSingleUserPrompts({
        id,
        page,
        date,
        initFetch,
        limit,
      });
      setPrompts(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };


  // ----- HELPER FUNCTIONS ----- //
  const handleFullView = (prompts) => {
    setShow(true);
    setViewDetails(prompts);
  };

  const onChange = (page = null, date, dateString) => {
    fetchData(page, date, false);
  };

  // ----- TABLE COLUMNS DEFINITION ----- //
  const columns = [
    {
      title: "Question",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span className="text-left" title={text}>
          {text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      ),
    },
    {
      title: "Response",
      dataIndex: "promptresponse",
      key: "promptresponse",
      render: (text) => (
        <span className="text-left" title={text}>
          {text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          onClick={() => handleFullView(record)}
          icon={<AiOutlineInfo />}
        ></Button>
      ),
    },
  ];

  
  // ----- RENDER COMPONENT ----- //

  return (
    <div className="mt-5">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <div className="col-12 d-flex align-items-center justify-content-between">
            <Title level={2}>Users Prompt</Title>
            <Link to="/promptuserview">
              <Button danger>Back</Button>
            </Link>
          </div>
        </div>
        <div className="col-12 d-flex justify-content-between">
          <DatePicker onChange={onChange} className=" mb-4 " />
        </div>

        <div>
          {/* TABLE COMPONENT */}
          <Table
            loading={loader}
            bordered={true}
            columns={columns}
            dataSource={prompts.prompt}
            scroll={{ y: "50vh" }}
            pagination={{
              current: prompts.pagination,
              pageSize: 10,
              total: prompts?.totalCount,
              showTotal: (total) => `Total ${total} items`,
              showQuickJumper: true,
              onChange: (page, pageSize) => {
                fetchData(page);
              },
            }}
          />

          {/* MODAL COMPONENT */}
          <PromptDetailViewModal
            show={show}
            handleClose={() => setShow(false)}
            viewDetails={viewDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default UserPromptList;
