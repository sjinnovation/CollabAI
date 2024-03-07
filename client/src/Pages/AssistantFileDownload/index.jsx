import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosSecureInstance } from "../../api/axios";
import { Button, Result, Spin, message } from "antd";

const AssistantFileDownload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { file_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const downloadFile = async () => {
      try {
        setIsLoading(true);
        const response = await axiosSecureInstance({
          url: `api/assistants/download/${file_id}`,
          method: "GET",
          responseType: "blob",
        });

        console.log(response.headers); // Check all the headers

        // Create a URL for the blob
        const contentDisposition = response.headers["content-disposition"];
        let filename = "download.pdf";
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="([^"]+)"/i);
          filename = (matches && matches[1]) || filename;
        }
        const downloadUrl = window.URL.createObjectURL(
          new Blob([response.data])
        );
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Error during file download", error);
        message.error("There was a problem downloading the file.");
      } finally {
        setIsLoading(false);
        navigate(-1);
      }
    };

    downloadFile();
  }, [file_id, navigate]);

  return (
    <div>
      <Result
        status="info"
        title={<>
          {
            isLoading ? <Spin size="large" /> : null
          }
        </>}
        subTitle="Your download is in progress! Please wait and after the file is downloaded, you will be navigated back to your previous page."
        extra={[
          <Button onClick={() => navigate(-1)} type="primary" key="console">
            Back To Previous Page.
          </Button>,
        ]}
      />
    </div>
  );
};

export default AssistantFileDownload;
