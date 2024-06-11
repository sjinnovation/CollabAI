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
    const [featuredAssistants, setFeaturedAssistants] = useState({})
    const userId = getUserID()


    useEffect(() => {
        getAllAssistantType(setAssistantTypes);
    }, []);

    useEffect(() => {
        handleFetchPublicAssistantWithCategory()
    }, [searchQuery, selectAssistantType]);

    const handleFetchPublicAssistantWithCategory = async () => {
        try {
            setLoading(true)
            const { success, assistantsByCategory, featuredAssistants } = await getPublicAssistantWithCategory(searchQuery, selectAssistantType);
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
        navigate(`/assistants/${id}`);
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    return (

        <>
            <div className="mt-5 container" >
                <div className="ms-3 custom-page-size">
                    <div>
                        <Title level={2}>Assistants </Title>
                        <Typography>Find assistants that can enhance your productivity.</Typography>
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
                                featuredAssistants?.assistants?.length === 0 && assistantsByCategory?.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : <Title level={4}>Featured Assistants </Title>
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

                                <div>
                                    {
                                        assistantsByCategory?.map((category, i) => (
                                            <div style={{ maxWidth: "1100px", }} key={category}>
                                                <Title className='mt-3' level={4}>{category.categoryName}</Title>
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
                                                    {
                                                        category.categoryInfo.assistants.length === 0 && (
                                                            <p>No assistants found for this category</p>
                                                        )
                                                    }
                                                </div>
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
                            />
                        )}

                    </div>

                </div>
            </div>
        </>

    );
}

export default PublicAssistant;
