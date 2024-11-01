import { useState, createContext } from "react";

export const PageTitleContext = createContext();

function TitleContextProvider(props) {
  const [pageTitle, setPageTitle] = useState({});


  const contextData = {
    pageTitle, setPageTitle
  };

  return (
    <PageTitleContext.Provider value={contextData}>
      {props.children}
    </PageTitleContext.Provider>
  );
}

export default TitleContextProvider;