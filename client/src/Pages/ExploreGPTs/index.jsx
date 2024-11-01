import { useEffect, useState, React } from 'react';
import { MdFavoriteBorder } from "react-icons/md";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import { BsRobot } from "react-icons/bs";
import "./index.css";
import { getUserID } from '../../Utility/service';
import { Spin, Button, Empty , Pagination, Typography, Col, Row, Select, Avatar, Card } from "antd";
import { getPublicAssistantWithCategory } from '../../api/publicAssistant';
import { getAllAssistantType } from '../../api/assistantType';
import DebouncedSearchInput from '../SuperAdmin/Organizations/DebouncedSearchInput';
import { useNavigate } from 'react-router-dom';
import { addFavoriteAssistant } from '../../api/favoriteAssistant';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeConfig';
import ExploreAssistantModal from './ExploredAssistantModal';
import { personalizeAssistant } from '../../api/personalizeAssistant';
import { getPersonalizeAssistantSetting } from '../../api/settings';
import { FileContext } from '../../contexts/FileContext';
import { DoubleRightOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Meta } = Card;
const PublicAssistant = () => {
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [assistantTypes, setAssistantTypes] = useState([]);
    const [selectAssistantType, setSelectAssistantType] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assistantsByCategory, setAssistantsByCategory] = useState([]);
    const [featuredAssistants, setFeaturedAssistants] = useState({});
    const {enablePersonalize,setEnablePersonalize} = useContext(FileContext);
    const [page,setPage]= useState(1);
    const [loadMorePageAndType,setLoadMorePageAndType] = useState([]);

    const userId = getUserID()


    useEffect(() => {
        getAllAssistantType(setAssistantTypes);
        getPersonalizeAssistantSetting().then(response =>{
            let isPersonalizeAssistantEnabled= false;
            if(response!== undefined){
              isPersonalizeAssistantEnabled = JSON.parse(response?.personalizeAssistant);
        
            }
              setEnablePersonalize(isPersonalizeAssistantEnabled);
            });
    }, []);

    const isSelectAssistantType = selectAssistantType === '';
    const isSelectAssistantTypeNotEmpty = selectAssistantType !== '';
    const isSearchQueryNotEmpty = searchQuery !== '';
    useEffect(()=>{
        if(assistantTypes.length > 0){
            for(const type of assistantTypes){
                setLoadMorePageAndType((prev)=>[...prev,{type:type.name,page :1}]);
            }
            setLoadMorePageAndType((prev)=>[...prev,{type:"featured",page :1}]);

        }
    },[assistantTypes]);
    useEffect(() => {
        handleFetchPublicAssistantWithCategory(loadMorePageAndType)
    }, [searchQuery, selectAssistantType,loadMorePageAndType]);

    const handleFetchPublicAssistantWithCategory = async (loadMorePageAndType) => {
        try {
            if(loadMorePageAndType.length === 0){
                setLoading(true);
            }
            const { success, assistantsByCategory, featuredAssistants } = await getPublicAssistantWithCategory(searchQuery, selectAssistantType,loadMorePageAndType);
            if (success) {
                setAssistantsByCategory(assistantsByCategory);
                setFeaturedAssistants(featuredAssistants);
                setLoading(false)
            } else {
                setLoading(false)

            }
        } finally {
            setLoading(false)
        }
    };

    const handleSelectType = event => {
        setSelectAssistantType(event);

    };


    const handleCardClick = card => {
        setSelectedCard(card);
        showModal()
    };

    const typeArray = [];
    for (let type in assistantTypes) {
        typeArray.push(assistantTypes[type].name);

    }
    const chatWithAssistant = (id, title) => {
        navigate(`/agents/${id}`);
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleLoadMore = (type)=>{
        const indexOfType = loadMorePageAndType.findIndex((info)=>info.type === type.categoryName);
        const loadPage =indexOfType !==-1?loadMorePageAndType[indexOfType].page + 1 :1;
        const typeWithPage = {type:type.categoryName,page:loadPage}
        setLoadMorePageAndType((prev) => {
            if (indexOfType !== -1) {
                return prev.map((item, i) => i === indexOfType ? typeWithPage : item);
            } else {
                return [...prev, typeWithPage];
            }
        });
    }
    return (

        <>
            <div className="mt-5 container" >
                <div className="ms-3 custom-page-size">
                    <div>
                        <Title level={2}>Agents </Title>
                        <Typography>Find Agents that can enhance your productivity.</Typography>
                    </div>

                    <div className='mt-3'>
                        <DebouncedSearchInput

                            data={{
                                search: searchQuery,
                                setSearch: setSearchQuery,
                                placeholder: "Search",
                                customStyle: {
                                    width: 300
                                }
                            }}
                        />
                        <Select style={{ width: "220px" }} allowClear placeholder='All' value={selectAssistantType} onChange={handleSelectType} className='ms-3'>

                            {typeArray?.map((types) => (
                                <Select.Option key={types} value={types}>
                                    {types}
                                </Select.Option>
                            ))}
                        </Select>


                    </div>

                    <div className="all-assistant-container">
                    
                        <div>
                            {
                                featuredAssistants?.assistants?.length === 0 && assistantsByCategory?.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : !loading&&<Title level={4}>{featuredAssistants?.assistants?.length ? "👑Featured Agents" : ''}</Title>
                            }
                        </div>
                        {
                            loading ? <div className="loading">
                                <Spin />
                            </div> : <>
                                
                                <div className='featured-assistant-container' >
                                    {
                                        featuredAssistants?.assistants?.map(assistant => <>
                                            <Card
                                                key={assistant}
                                                style={{
                                                    width: 350,
                                                }}

                                                actions={[
                                                    <MdFavoriteBorder key="favorite" onClick={() => addFavoriteAssistant(assistant?.assistant_id, userId)} />,
                                                    <IoChatboxEllipsesOutline key="chat" onClick={() => chatWithAssistant(assistant?.assistant_id)} />,
                                                    <IoIosMore key="more"
                                                        onClick={() => {
                                                            handleCardClick(assistant)
                                                        }}
                                                    />,
                                                ]}
                                            >
                                                <Meta
                                                    avatar={<Avatar src={assistant?.image_url ? assistant.image_url : <BsRobot
                                                        size={22}
                                                        style={{ color: theme === "light" ? "#000" : "#fff" }}
                                                    />} />}
                                                    title={assistant.name}
                                                    description={assistant.description.length > 30 ? `${assistant.description.slice(0, 30)} ...` : assistant.description}

                                                />
                                            </Card>
                                        </>)
                                    }
                                </div>
                                    {featuredAssistants?.assistants?.length > 0 && featuredAssistants?.assistants?.length !== featuredAssistants?.totalAssistantCount
                                        && <div style={{ marginTop: "15px" }}>
                                            <span >Load More </span> <Button icon={<DoubleRightOutlined />} onClick={() => handleLoadMore({ categoryName: "featured" })}></Button>
                                        </div>
                                    }


                                <div>
                                    { 
                                        
                                        assistantsByCategory?.assistants?.length > 0  || assistantsByCategory?.map((category, i) => (
                                            <div style={{ maxWidth: "1100px", }} key={category}>
                                                {category?.categoryInfo?.assistants?.length > 0 ? <Title className='mt-3' level={4}>{category?.categoryName}</Title> : ((searchQuery?.trim() || selectAssistantType?.trim())&&<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />) }
                                                <div className='category-assistant-container'>
                                                    {
                                                        category?.categoryInfo?.assistants?.length > 0 && (
                                                            category?.categoryInfo?.assistants?.map(assistant => <Card
                                                                key={assistant}
                                                                style={{
                                                                    width: 350,
                                                                }}
                                                                actions={[
                                                                    <MdFavoriteBorder key="favorite" onClick={() => addFavoriteAssistant(assistant.assistant_id, userId)} />,
                                                                    <IoChatboxEllipsesOutline key="chat" onClick={() => chatWithAssistant(assistant.assistant_id)} />,
                                                                    <IoIosMore key="more"

                                                                        onClick={() => {
                                                                            handleCardClick(assistant)

                                                                        }}
                                                                    />,
                                                                ]}
                                                            >
                                                                <Meta
                                                                    avatar={<Avatar src={assistant?.image_url ? assistant?.image_url : <BsRobot
                                                                        size={22}
                                                                        style={{ color: theme === "light" ? "#000" : "#fff" }}
                                                                    />} />}
                                                                    title={assistant.name}
                                                                    description={assistant?.description.length > 30 ? `${assistant?.description.slice(0, 30)} ...` : assistant?.description}
                                                                    createBy="This is the description"
                                                                />
                                                            </Card>)
                                                        )
                                                    }

                                                </div>
                                                {category.categoryInfo.assistants.length > 0 && category.categoryInfo.assistants.length !== category.categoryInfo?.totalAssistantCount &&<div style={{ marginTop: "15px" }}>
                                                    <span>Load More </span> <Button icon={<DoubleRightOutlined />} onClick={() => handleLoadMore(category)}></Button>
                                                </div>}
                                            </div>
                                        ))
                                    }
                                </div>
                            </>
                        }
                        {/* Modal  */}
                        {isModalOpen && (
                            <ExploreAssistantModal
                                selectedCard={selectedCard}
                                theme={theme}
                                onCancel={handleCancel}
                                onChat={chatWithAssistant}
                                handleShowModal={showModal}
                                personalizeAssistant = {personalizeAssistant}
                                enablePersonalize = {enablePersonalize}
                            />
                        )}

                    </div>

                </div>
            </div>
        </>

    );
}

export default PublicAssistant;
