import { Layout } from "antd";

const CommonMainSection = ({ children }) => {
  return (
    <Layout
      style={{
        overflowY: "auto",
        backgroundColor: "var(--main-bg-color)",
        marginBottom: "55px",
        padding: "20px",
      }}
    >
      {children}
    </Layout>
  );
};

export default CommonMainSection;
