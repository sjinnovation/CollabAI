import { Modal } from "antd";
import { WebCrawlForm } from "../WebCrawl/webCrawlForm";
import { WorkBoardForm } from "./workBoardForm";

export const ActionItemModalComponent = ({ title, form, SubmitText, isAddActionItem, setIsActionItemSyncing, setIsAddActionItem, url, setBaseUrlOfWBforSync, setIsLoading, syncingRecordId, setSyncingRecordId ,parentId = null }) => {
  return (
    <Modal
      title={title}
      visible={isAddActionItem}
      onOk={() => {
        setIsAddActionItem(false);
        setBaseUrlOfWBforSync('');
        setIsLoading(false);
        form.resetFields();

      }}
      onCancel={() => {
        setIsAddActionItem(false);
        setIsActionItemSyncing(false);
        setIsLoading(false);
        setBaseUrlOfWBforSync('');
        form.resetFields();

      }}
      footer={null}
    >
      <WorkBoardForm
        form={form}
        SubmitText={SubmitText}
        setIsAddActionItem={setIsAddActionItem}
        setIsActionItemSyncing={setIsActionItemSyncing}
        url={url}
        setBaseUrlOfWBforSync={setBaseUrlOfWBforSync}
        setIsLoading={setIsLoading}
        syncingRecordId={syncingRecordId}
        setSyncingRecordId={setSyncingRecordId}
        parentId={parentId}
        />
    </Modal>
  );
};
export default ActionItemModalComponent;