import React, { useState, useEffect, useContext } from "react";
import "./Prompt.scss";
// import { getDescription} from './TemplateContext'
// import { Table } from 'react-bootstrap';
import { axiosOpen,axiosSecureInstance } from "../../api/axios";
import Layout from "antd/es/layout/layout";
import { PromptTemplateContext } from "../../contexts/PromptTemplateContext";
import { useNavigate } from "react-router-dom";
const Modal = () => {
  // const wino
  const { updateCurrentPromptTemplate } = useContext(PromptTemplateContext);
  const navigate = useNavigate();
  const handleTest = (description) => {
    updateCurrentPromptTemplate(description);
    // getDescription(description);
    toggleModal();
  };
  const [showModal, setShowModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
        const response = await axiosSecureInstance.get("api/template/get-templates");
        const result = response?.data?.templates;
        console.log("Templates:", result);
        setTemplates(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplates();
  }, []);

  const lowerCaseSearch = searchTerm.toLowerCase();
  const filteredData = templates.filter((item) => {
    return (
      // item._id.toLowerCase().includes(lowerCaseSearch) ||
      item.templates.filter((template) => {
        return template.title.toLowerCase().includes(lowerCaseSearch);
        // template.description.toLowerCase().includes(lowerCaseSearch)
      }).length > 0
    );
  });

  // const filteredTemplates = templates.filter((template) => {
  //   return (
  //     (template._id &&
  //       template._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //     (template.description &&
  //       template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  //   );
  // });

  return (
    <>
      <a
        onClick={toggleModal}
        className="text-white navPrompt small"
        style={{ textDecoration: "none" }}
      >
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          width={25}
          height={25}
        >
          <path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5m-6 0 7.5-7.5M15 3h6v6"
          />
        </svg>
        Prompt Templates
      </a>
      {showModal && (
        <div className="modal123">
          <div className="modal-content-123">
            <span className="close-123" onClick={toggleModal}>
              &times;
            </span>
            <div class="input-group justify-content-center">
              <div class="form-outline w-75 ">
                <input
                  type="search"
                  id="form1"
                  class="form-control "
                  placeholder="Search"
                  style={{ border: "1px solid grey" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* <label class="form-label text-white" for="form1">Search</label> */}
              </div>
              <center></center>
              <button type="button" class="btn btn-primary">
                <i class="bi bi-search"></i>
              </button>
            </div>
            <div
              className="row mt-3 "
              style={{ maxHeight: "80%", overflowY: "auto", color: "white" }}
            >
              {/* test code  */}

              {templates.map((item) => (
                <div key={item._id}>
                  {/* <h3>{item._id}</h3> */}
                  <ul>
                    {item.templates
                      .filter((template) => {
                        return template.title
                          .toLowerCase()
                          .includes(lowerCaseSearch);
                        // ||
                        // template.description.toLowerCase().includes(lowerCaseSearch)
                      })
                      .map((template) => (
                        <>
                          <li key={template._id} style={{listStyle:'none'}}>
                            <h4>{template.title}</h4>
                          </li>
                          <div style={{display: 'flex', justifyContent: "space-between", gap: '1rem'}}>
                            <p>{template.description}</p>
                            <button
                            style={{height: '3rem'}}
                              className="btn btn-outline-light"
                              onClick={() => handleTest(template.description)}
                            >
                              Choose
                            </button>
                          </div>
                        </>
                      ))}
                  </ul>
                </div>
              ))}

              {/* {filteredData?.map((template) => (
                  <li key={template.id} className="">
                    <div className="col-md-12 ">
                      <div className="card my-3 bg-dark">
                        <div className="card-body border border-secondary rounded">
                          <div className="row">
                            <div className="">
                              <h4 className="text-white">{template._id}</h4>
                              <div className="text-white">
                                {template.templates.length > 0 &&
                                  template.templates.map((temp) => (
                                    <div
                                      style={{
                                        backgroundColor: "black",
                                        width: "100%",
                                        padding: "1rem",
                                        margin: "1rem auto",
                                      }}
                                    >
                                      <h6>{temp.title}</h6>
                                      <div
                                        style={{ display: "flex", gap: "1rem" }}
                                      >
                                        <p className="text-gray">
                                          {temp.description}
                                        </p>
                                        <button
                                          className="btn btn-outline-light"
                                          onClick={() =>
                                            handleTest(temp.description)
                                          }
                                        >
                                          Choose
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className="col-md-2">
                              <button
                                className="btn btn-outline-light"
                                onClick={() => handleTest(template._id)}
                              >
                                Choose
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))} */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
