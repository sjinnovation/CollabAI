import React, { useEffect, useState } from "react";
import { axiosSecureInstance } from "../../api/axios";
import { ALL_USER_GET_PROMPT_TEMPLATES_SLUG } from "../../constants/Api_constants";

const IntroSection = ({ setInputPrompt, staticQuestions }) => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axiosSecureInstance.get(
          ALL_USER_GET_PROMPT_TEMPLATES_SLUG()
        );
        const result = response.data;
        console.log("Templates:", result);
        setTemplates(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplates();
  }, []);


  const staticQuestionsWithTemplates = staticQuestions
    ? staticQuestions.map((question, index) => ({
      _id: `Your Questions${" "}${index}`,
      templates: [{ description: question }],
    }))
    : [];

  return (
    <div id="introsection">
      <div className="predefinedprompts-container">
        {(staticQuestions?.length > 0 ? staticQuestionsWithTemplates : templates)
          ?.slice(0, 3)
          ?.map((item) => (
            <div key={item._id}>
              <h2 className="mb-3 text-center">
                <b>{item._id}</b>
              </h2>
              <div>
                <ul className="" style={{ listStyle: "none" }}>
                  {item.templates &&
                    item.templates.map((temp) => (
                      <li
                      style={{width: "100%"}}
                        key={temp.description}
                        className="btn btn-dark p-3 rounded my-1 px-4"
                        onClick={() => setInputPrompt(temp.description)}
                      >
                        {temp.description.length > 80
                          ? temp.description.substring(0, 80) + "..."
                          : temp.description}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default IntroSection;

