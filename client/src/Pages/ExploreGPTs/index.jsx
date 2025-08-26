import { useEffect, useState, React } from "react";
import "./index.css";
import { getUserID } from "../../Utility/service";
import {
  Select,
} from "antd";
import { getPublicAssistantWithCategory } from "../../api/publicAssistant";
import { getAllAssistantType } from "../../api/assistantType";
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import { useNavigate } from "react-router-dom";
import {
  addFavoriteAssistant,
  fetchFavoriteAssistantByUser,
} from "../../api/favoriteAssistant";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/themeConfig";
import ExploreAssistantModal from "./ExploredAssistantModal";
import { personalizeAssistant } from "../../api/personalizeAssistant";
import { getPersonalizeAssistantSetting } from "../../api/settings";
import { FileContext } from "../../contexts/FileContext";
import CommonLayout from "../../component/layout/CommonStructure";
import { ExploreAgentsSideItems } from "../../Utility/SideMenuItems/ExploreAgentsSideItems";
import AllExploreAgents from "../../component/ExploreAgent/AllAgents";
import FeaturedAgents from "../../component/ExploreAgent/FeaturedAgents";
import FavoriteAgents from "../../component/ExploreAgent/FavoriteAgents";

const PublicAssistant = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assistantTypes, setAssistantTypes] = useState([]);
  const [selectAssistantType, setSelectAssistantType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assistantsByCategory, setAssistantsByCategory] = useState([]);
  const [featuredAssistants, setFeaturedAssistants] = useState({});
  const { enablePersonalize, setEnablePersonalize } = useContext(FileContext);
  const [page, setPage] = useState(1);
  const [loadMorePageAndType, setLoadMorePageAndType] = useState([]);
  const [activeKey, setActiveKey] = useState("1");
  const [favoriteAssistant, setFavoriteAssistant] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [favoritePage, setFavoritePage] = useState(1);
  const [favoritePageSize, setFavoritePageSize] = useState(10);
  const [favoriteTotalCount, setFavoriteTotalCount] = useState(0);
  const userId = getUserID();
  const pageSize = 10;

  useEffect(() => {
    getAllAssistantType(setAssistantTypes);
    getPersonalizeAssistantSetting().then((response) => {
      let isPersonalizeAssistantEnabled = false;
      if (response !== undefined) {
        isPersonalizeAssistantEnabled = JSON.parse(
          response?.personalizeAssistant
        );
      }
      setEnablePersonalize(isPersonalizeAssistantEnabled);
    });
  }, []);

  const isSelectAssistantType = selectAssistantType === "";
  const isSelectAssistantTypeNotEmpty = selectAssistantType !== "";
  const isSearchQueryNotEmpty = searchQuery !== "";
  useEffect(() => {
    if (assistantTypes.length > 0) {
      for (const type of assistantTypes) {
        setLoadMorePageAndType((prev) => [
          ...prev,
          { type: type.name, page: 1 },
        ]);
      }
      setLoadMorePageAndType((prev) => [
        ...prev,
        { type: "featured", page: 1 },
      ]);
    }
  }, [assistantTypes]);
  useEffect(() => {
    handleFetchPublicAssistantWithCategory(loadMorePageAndType);
  }, [searchQuery, selectAssistantType, loadMorePageAndType]);

  const handleFetchPublicAssistantWithCategory = async (
    loadMorePageAndType
  ) => {
    try {
      // if (loadMorePageAndType.length === 0) {
      //   setLoading(true);
      // }
      setLoading(true);
      const { success, assistantsByCategory, featuredAssistants } =
        await getPublicAssistantWithCategory(
          searchQuery,
          selectAssistantType,
          loadMorePageAndType
        );
      if (success) {
        setAssistantsByCategory(assistantsByCategory);
        setFeaturedAssistants(featuredAssistants);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (event) => {
    setSelectAssistantType(event);
    setActiveKey("1");
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    showModal();
  };

  const typeArray = [];
  for (let type in assistantTypes) {
    typeArray.push(assistantTypes[type].name);
  }
  const chatWithAssistant = (id, title) => {
    navigate(`/agents/${id}`, {
      state: {
        assistantId: id
      }
    });
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleLoadMore = (type) => {
    const indexOfType = loadMorePageAndType.findIndex(
      (info) => info.type === type.categoryName
    );
    const loadPage =
      indexOfType !== -1 ? loadMorePageAndType[indexOfType].page + 1 : 1;
    const typeWithPage = { type: type.categoryName, page: loadPage };
    setLoadMorePageAndType((prev) => {
      if (indexOfType !== -1) {
        return prev.map((item, i) => (i === indexOfType ? typeWithPage : item));
      } else {
        return [...prev, typeWithPage];
      }
    });
  };

  useEffect(() => {
    fetchFavoriteAssistantByUser(
      setFavoriteAssistant,
      setIsLoading,
      setFavoriteTotalCount,
      favoritePage,
      favoritePageSize
    );
  }, [favoritePage, favoritePageSize]);

  const renderContent = () => {
    switch (activeKey) {
      case "1":
        return (
          <AllExploreAgents
            assistantsByCategory={assistantsByCategory}
            chatWithAssistant={chatWithAssistant}
            addFavoriteAssistant={addFavoriteAssistant}
            userId={userId}
            handleLoadMore={handleLoadMore}
            searchQuery={searchQuery}
            selectAssistantType={selectAssistantType}
            handleCardClick={handleCardClick}
            theme={theme}
            featuredAssistants={featuredAssistants}
            loading={loading}
            favoriteAssistant={favoriteAssistant}
            setRefresh={setRefresh}
            setFavoriteAssistant={setFavoriteAssistant}
            enablePersonalize={enablePersonalize}
            HeaderContentChildren={
              <div className="d-flex gap-2 mt-4">
                <DebouncedSearchInput
                  data={{
                    search: searchQuery,
                    setSearch: setSearchQuery,
                    placeholder: "Search",
                    
                  }}
                />
                <Select
                  allowClear
                  placeholder={!selectAssistantType && "Filter by Category"}
                  value={selectAssistantType || undefined}
                  onChange={handleSelectType}
                  className="filter-select"  
                >
                  {typeArray?.map((types) => (
                    <Select.Option key={types} value={types}>
                      {types}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            }
          />
        );
      case "2":
        return (
          <FeaturedAgents
            featuredAssistants={featuredAssistants}
            chatWithAssistant={chatWithAssistant}
            addFavoriteAssistant={addFavoriteAssistant}
            userId={userId}
            handleLoadMore={handleLoadMore}
            handleCardClick={handleCardClick}
            favoriteAssistant={favoriteAssistant}
            setRefresh={setRefresh}
            setFavoriteAssistant={setFavoriteAssistant}
          />
        );
      case "3":
        return (
          <FavoriteAgents
            chatWithAssistant={chatWithAssistant}
            addFavoriteAssistant={addFavoriteAssistant}
            userId={userId}
            handleLoadMore={handleLoadMore}
            handleCardClick={handleCardClick}
            favoriteAssistant={favoriteAssistant}
            setFavoriteAssistant={setFavoriteAssistant}
          />
        );
      default:
        return null;
    }
  };

  const handleChangeSideMenu = ({ key }) => {
    setActiveKey(key);
  };

  return (
    <>
      <div className="explore-agent-container">
        <CommonLayout
          handleChangeSideMenu={handleChangeSideMenu}
          sideMenuItems={ExploreAgentsSideItems}
          activeKey={activeKey}
        >
          {renderContent()}
          <div className="custom-page-size">
            <div className="all-assistant-container">
              {isModalOpen && (
                <ExploreAssistantModal
                  selectedCard={selectedCard}
                  theme={theme}
                  onCancel={handleCancel}
                  onChat={chatWithAssistant}
                  handleShowModal={showModal}
                  personalizeAssistant={personalizeAssistant}
                  enablePersonalize={enablePersonalize}
                />
              )}
            </div>
          </div>
        </CommonLayout>
      </div>
    </>
  );
};

export default PublicAssistant;