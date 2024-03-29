import React from "react";

const PromptTemplatesIntro = ({ setInputPrompt, templateCategories }) => {
  // -- LOCAL-COMPONENT / TEMPLATE CATEGORY -- //
  const TemplateCategory = ({ templateCategory }) => {
    return (
      <div key={templateCategory._id}>
        <h2 className="mb-3 text-center">
          <b>{templateCategory._id}</b>
        </h2>
        <div>
          <ul className="" style={{ listStyle: "none" }}>
            {templateCategory.templates &&
              templateCategory.templates.map((template) => (
                <Template key={template._id} template={template} />
              ))}
          </ul>
        </div>
      </div>
    );
  };

  // -- LOCAL-COMPONENT / TEMPLATE ITEM -- //
  const Template = ({ template }) => {
    return (
      <li
        key={template._id}
        className="btn btn-dark p-3 rounded my-1 px-4 w-100"
        style={{ height: "90px", position: "relative" }}
        onClick={() => setInputPrompt(template.description)}
      >
        <div
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {template.description}
        </div>
      </li>
    );
  };

  return (
    <div id="introsection">
      <div className="predefinedprompts-container">
        {templateCategories?.length
          ? templateCategories
              .slice(0, 3)
              ?.map((templateCategory) => (
                <TemplateCategory
                  key={templateCategory._id}
                  templateCategory={templateCategory}
                />
              ))
          : null}
      </div>
    </div>
  );
};

export default PromptTemplatesIntro;
