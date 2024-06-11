import React, { useContext } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { ThemeContext } from "../../contexts/themeConfig";

const Loading = () => {
  const { theme } = useContext(ThemeContext);
  const override = {
    color: theme === "light" ? "#000" : "#fff",
    loading: true,
  };

  return (
    <div>
      <PulseLoader
        color={override.color}
        loading={override.loading}
        cssOverride={override}
        size={5}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Loading;
