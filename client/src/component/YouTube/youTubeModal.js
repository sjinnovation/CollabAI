import { Modal } from "antd";
import { YouTubeForm } from "./youTubeForm";

export const YouTubeModalComponent = ({title,form,SubmitText, isImportYouTubeTranscript, setIsImportYouTubeTranscript,url,setIsLoading,parentId}) => {
                                        
  return (
      <Modal
        title={title}
        visible={isImportYouTubeTranscript}
        onOk={() => {
          setIsImportYouTubeTranscript(false);
          setIsLoading(false);
          form.resetFields();
  
        }}
        onCancel={() => {
          setIsImportYouTubeTranscript(false);
          setIsLoading(false);
          form.resetFields();
  
        }}
        footer={null}
      >
        <YouTubeForm form={form} SubmitText={SubmitText} setIsImportYouTubeTranscript={setIsImportYouTubeTranscript} url={url} setIsLoading={setIsLoading} parentId={parentId}/>
      </Modal>
    );
  };
  
  export default YouTubeModalComponent;