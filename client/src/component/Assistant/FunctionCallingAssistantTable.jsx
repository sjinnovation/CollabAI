import React, { useEffect, useState } from "react";
import { Button, Space, Table, Tag, Modal, Tooltip, Switch } from "antd";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineArrowUp,
} from "react-icons/ai";
import { getAllFunctionDefinitions } from "../../Pages/SuperAdmin/api/functionDefinition";

//-----Helper----------//
import { redirectToAssistant} from "../../Utility/assistant-helper"

const { confirm } = Modal;

const FunctionCallingAssistantTable = ({ data }) => {
  const {
    functionCallingAssistants,
    setFunctionCallingAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchFunctionCallingAssistants,
    updateLoader,
    setActiveKey,
    toggleDefineFunctionsModal,
  } = data;

  const [functionDefinitions, setFunctionDefinitions] = useState([]);

  const getAllfunctions = () => {
    getAllFunctionDefinitions(setFunctionDefinitions);
  }

  useEffect(() => {
    getAllfunctions();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Description",
      key: "description",
      align: "center",
      dataIndex: "description",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Definition",
      key: "definition",
      align: "center",
      dataIndex: "definition",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Parameters",
      key: "parameters",
      align: "center",
      dataIndex: "parameters",
      render: (text) => <span className="text-left">{text?.properties ? Object.keys(text.properties).join(', ') : ""}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-3">
        <div className="col-2 d-flex justify-content-start">
          <Button className="" onClick={toggleDefineFunctionsModal}>
            Create Functions
          </Button>
        </div>
      </div>
      <Table
        bordered={true}
        columns={columns}
        dataSource={functionDefinitions}
        scroll={{ y: "50vh" }}
      />
    </div>
  );
};

export default FunctionCallingAssistantTable;
