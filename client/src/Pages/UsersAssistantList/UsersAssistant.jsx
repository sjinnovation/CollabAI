import React, { useEffect, useState } from "react";

//Libraries
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Switch,
  Tabs,
  message
} from "antd";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineArrowUp } from "react-icons/ai";

//Component imports
import CreateAssistantModal from "../../component/Assistant/Assistantmodal/CreateAssistantModal";

//hooke
import useAssistantPage from "../../Hooks/useAssistantPage";

//-----Helper----------//
import { showDeleteConfirm } from "../../Utility/assistant-helper"
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import { axiosSecureInstance } from "../../api/axios";
import { SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG } from "../../constants/Api_constants";
import { getUserID } from "../../Utility/service";
import FavoriteAssistantList from "../../component/Assistant/FavoriteAssistantList"; 
import SingleUserAssistants from "../../component/Assistant/PersonalAssistantList"; 
import { usePublicAssistant } from "../../Hooks/usePublicAssistantPage";
import { useFavoriteAssistant } from "../../Hooks/useFavoriteAssistantPage";
import { fetchSingleFavoriteAssistant, getFavoriteAssistant } from "../../api/favoriteAssistant";
import { MdOutlineAssistant } from "react-icons/md";
import { getAssistantInfo } from "../../Utility/assistant-helper";

import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
  GlobalOutlined ,
  HeartOutlined
} from "@ant-design/icons";
import AdminAssistantList from "../../component/Assistant/AdminAssistantList";
import { getAllKnowledgeBase } from "../../api/knowledgeBase";
import { formatToTreeData } from "../../component/KnowledgeBase/RAGTree";
const { Title } = Typography;
const userId = getUserID();

const IconComponent = ({ label }) => {
  switch (label) {
    case "My Assistants":
      return <MdOutlineAssistant className="me-2" />;
    case "Favorite Assistants":
      return <HeartOutlined  className="me-2" />;  

  }
};
const renderTabPane = (key, label, Component, data) => (
  <Tabs.TabPane
    key={key}
    tab={
      <span>
        <IconComponent label={label} />
        {label}
      </span>
    }
  >
    <Component data={data} />
  </Tabs.TabPane>
);

//constants
const initialAssistantState = {
  name: "",
  instructions: "",
  description: "",
  files: [],
  assistantId: "",
  tools: [],
  model: "",
  category: "",
  static_questions: [],
};


const UserAssistants = () => {
  const {
    loader,
    adminUserAssistants,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchAllAssistants,
    handleDeleteAssistant,
    totalCount,
    setAdminUserAssistants,
    updateLoader,
    searchPersonalAssistants,
    handlePublicAssistantAdd,
  } = useAssistantPage();
  //-----States ------//
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState("unoptimized-data");
  const [isFunctionCallingAssistant, setIsFunctionCallingAssistant] =
    useState(false);
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [formattedRAGdData, setFormattedRAGdData] = useState([]);
  const [formattedPublicFilesData, setFormattedPublicFilesData] = useState([]);


  const [isLoading, setIsLoading] = useState(true);
  const [favoriteAssistant, setFavoriteAssistant] = useState([]);
  //------Side Effects ---------//

  useEffect(() => {
    handleFetchUserCreatedAssistants();
        // Fetch all the favorite assistants
    fetchSingleFavoriteAssistant(setFavoriteAssistant, setIsLoading);
    getAllKnowledgeBase()
      .then(response => {
        const fetchedRAGData = response;
        const fetchPublicRAGFiles = fetchedRAGData.allPublicKnowledgeBase;
        const formattedRAGFiles = formatToTreeData(fetchedRAGData.data);
        const formattedPublicFiles = formatToTreeData(fetchPublicRAGFiles);
        if (formattedRAGFiles && formattedRAGFiles.length > 0) {
          setFormattedRAGdData(formattedRAGFiles);

        } else {
          console.warn("Formatted RAG Files are empty or undefined");
        }

        if (formattedPublicFiles && formattedPublicFiles.length > 0) {
          setFormattedPublicFilesData(formattedPublicFiles);

        } else {
          console.warn("Formatted Public Files are empty or undefined");
        }


      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });

  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    handleFetchUserCreatedAssistants(1);
    handleFetchAllAssistants(1);
    setIsLoading(false);
  }, [showModal]);
  //----------Hooks--------------//

  const [isModalClosed, setIsModalClosed] = useState(false);

  const { handleDeleteFavoriteAssistant } = useFavoriteAssistant();


  const showEditModalHandler = async (assistant) => {
    setIsLoading(true);

    if (assistant.functionCalling == undefined) {
      setIsFunctionCallingAssistant(false);
    }
    else {
      setIsFunctionCallingAssistant(assistant.functionCalling);
    }

    if (assistant.functionCalling === false || assistant.functionCalling == undefined) {

      let myAssistant;

      try {
        const response = await axiosSecureInstance.get(
          `/api/assistants/getAssistantInfo/${assistant?.assistant_id}`
        );
        if (response) {
          myAssistant = response?.data;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          message.error("Assistant not found in openAI");
        } else {
          message.error(error);

        }
        setEditMode(false);
        setShowModal(false);
        setIsLoading(false);

      }

      const insertedFunctions = myAssistant?.tools?.filter(tool => tool?.type === "function") || [];
      const functionNames = insertedFunctions?.map((func) => func?.function?.name);
      const functionList =  [];
      let knowledgeBaseInfo = [];
      if (myAssistant?.knowledgeBaseInfo) {
        for (let info of myAssistant?.knowledgeBaseInfo) {
          knowledgeBaseInfo.push({ key: info.key, title: info.title });

        }

      }
      const file_ids = myAssistant?.file_ids.filter((id) => !myAssistant.knowledgeBaseFileIds.includes(id));
      let filteredAssistantData = {
        assistant_id: myAssistant?.id,
        name: assistant?.name,
        instructions: myAssistant?.instructions,
        description: assistant?.description,
        userId: userId,
        model: myAssistant?.model,
        tools: myAssistant?.tools?.map(({ type }) => type) || [],
        category: myAssistant?.category,
        assistantTypes: myAssistant?.assistantTypes,
        static_questions: myAssistant?.static_questions,
        functions: functionList,
        knowledgeSource: myAssistant?.knowledgeSource,
        knowledgeBaseInfo: knowledgeBaseInfo,
        fileNames: myAssistant?.fileNames,
        file_ids: file_ids,
        fileIdsWithKeysOfKnowledgeBase: myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName : myAssistant?.fileIdsWithName

      };
      setAssistantData(filteredAssistantData);

      setEditMode(true);
      setShowModal(true);
      setIsLoading(false);

    } else {
      const response = await axiosSecureInstance.get(
        `/api/assistants/getAssistantInfo/${assistant?.assistant_id}`
      );
      let myAssistant;
      if (response) {
        myAssistant = response?.data;
      }

      const insertedFunctions = myAssistant?.tools?.filter(tool => tool?.type === "function");
      const functionNames = insertedFunctions?.map((func) => func?.function?.name);

      const functionList = []


      let filteredAssistantData = {
        assistant_id: myAssistant?.id,
        name: assistant?.name,
        instructions: myAssistant?.instructions,
        description: assistant?.description,
        userId: userId,
        model: myAssistant?.model,
        tools: myAssistant?.tools?.map(({ type }) => type) || [],
        category: myAssistant?.category,
        assistantTypes: myAssistant?.assistantTypes,
        static_questions: myAssistant?.static_questions,
        functions: functionList,
        knowledgeSource: myAssistant?.knowledgeSource
      };


      // Update the state with the new data
      setAssistantData(filteredAssistantData);

      setEditMode(true);
      setShowModal(true);
      setIsLoading(false);

    }
  };

  const handleClose = () => {
    setAssistantData(() => ({ ...initialAssistantState }));
    setShowModal((value) => !value);
    setEditMode(false);
    setIsModalClosed(true);

  };

  useEffect(() => {
    if(!showModal){
      setIsModalClosed(true);

    }
    
  }, [showModal]);


  const redirectToAssistant = (record) => {
    
    const assistantId = record.assistant_id;
    const url = `/agents/${assistantId}`;
    window.open(url, "_blank");
  };

  //------Columns----------//

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
              onClick={() => redirectToAssistant(record)}
              icon={<AiOutlineArrowUp />}
          ></Button>
          <Button
            onClick={async() => {
              const isExisting = await getAssistantInfo(record?.assistant_id);
              if(isExisting === true){
                await showEditModalHandler(record);
              }

            }}
            icon={<AiOutlineEdit />}
          ></Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record.is_active}
              onChange={(checked) =>
                handleUpdateAssistant(record._id, {
                  is_active: checked,
                })
              }
            />
          </Tooltip>
          <Button
            onClick={() => showDeleteConfirm(record.assistant_id, record.name, handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    searchPersonalAssistants(searchQuery)
  }, [searchQuery]);

  

  return (
    <>
      <div className="mt-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8 d-flex align-items-center justify-content-between">
              <Title level={2}>Agent Lists</Title>
            </div>
            <div className="col-2 d-flex justify-content-end">
              <Button className="" onClick={handleClose}>
                + Agent
              </Button>
            </div>
          </div>
          <Tabs defaultActiveKey="1">
          {renderTabPane("1", "My Agents", SingleUserAssistants, {
              adminUserAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              handlePublicAssistantAdd,
              getFavoriteAssistant,
              handleDeleteFavoriteAssistant,
              getAssistantInfo,
              isLoading, 
              setIsLoading,
              totalCount,

            })}

            {renderTabPane("2", "Favorite Agents", FavoriteAssistantList, {
              adminUserAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              handlePublicAssistantAdd,
              getFavoriteAssistant,
              handleDeleteFavoriteAssistant,
              favoriteAssistant,
              setFavoriteAssistant,        
              isLoading, 
              setIsLoading
            })}

          </Tabs>

          <CreateAssistantModal
            data={{
              handleClose,
              showModal,
              editMode,
              setEditMode,
              assistantData,
              setAssistantData,
              isAdmin: false,
              handleFetchUserCreatedAssistants,
              handleFetchAllAssistants,
              isFunctionCallingAssistant,
              activeKey,
              setActiveKey,
              formattedRAGdData,
              formattedPublicFilesData,
              isModalClosed,
            }}
          />

        </div>
      </div>
    </>
  );
};

export default UserAssistants;
