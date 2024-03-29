import React, { useContext, useEffect, useState } from 'react';
import { axiosSecureInstance } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { PromptTemplateContext } from '../../contexts/PromptTemplateContext';
import { Modal, Spin } from 'antd';
import { ALL_USER_GET_PROMPT_TEMPLATES_SLUG } from '../../constants/Api_constants';

const Templates = () => {
  const { updateCurrentPromptTemplate } = useContext(PromptTemplateContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(true);
  const lowerCaseSearch = searchTerm.toLowerCase();
  const [loading, setLoading] = useState(false)


  const handleChooseTemplate = (description) => {
    updateCurrentPromptTemplate(description);
    toggleModal();
  };


  const toggleModal = () => {
    if (window.location.pathname === "/chat") {
      setShowModal(!showModal);
    } else {
      navigate("/chat");
      setShowModal(!showModal);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const response = await axiosSecureInstance.get(ALL_USER_GET_PROMPT_TEMPLATES_SLUG());
        const result = response?.data?.templates;
        console.log("Templates:", result);
        setTemplates(result);
        setLoading(false)
      } catch (error) {
        console.log(error);
        setLoading(false)
      } finally {
        setLoading(false)
      }
    };
    fetchTemplates();
  }, []);


  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    navigate("/chat");
  };

  return (
    <div className=''>

      <Modal
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        centered
        width={1000}
      >

        <div className=''>
          <div class="input-group justify-content-center">
            <div class="form-outline w-75 mb-5">
              <input
                type="search"
                id="form1"
                class="form-control "
                placeholder="Search here ..."
                style={{ border: "1px solid grey" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

            </div>
          </div>

        </div>
        {
          loading ? <div className='templates-loading-container'><Spin /></div>
            :
            <div className='template-content-container'>

              <div>
                {templates.length ? <>
                {
                   templates?.map((item) => (
                    <div key={item._id}>
  
                      <ul style={{ padding: "none" }}>
                        {item?.templates
                          ?.filter((template) => {
                            return template.title
                              .toLowerCase()
                              .includes(lowerCaseSearch)
                              ||
                              template.description
                                .toLowerCase()
                                .includes(lowerCaseSearch)
                          })
                          ?.map((template) => (
                            <>
                              <li key={template._id} style={{ listStyle: 'none' }}>
                                <h4>{template.title}</h4>
                              </li>
                              <div className='template-description-container'>
                                <p>{template.description}</p>
                                <button
                                  style={{ height: '3rem' }}
                                  className="btn btn-outline-light"
                                  onClick={() => handleChooseTemplate(template.description)}
                                >
                                  Choose
                                </button>
                              </div>
                            </>
                          ))}
                      </ul>
                    </div>
                  ))
                }
                </> : null}
              </div>
            </div>
        }

      </Modal>


    </div>
  );
};

export default Templates;