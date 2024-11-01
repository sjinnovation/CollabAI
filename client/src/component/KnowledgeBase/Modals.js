import { deleteKnowledgeBase } from "../../api/knowledgeBase";
import { Layout, Table, Button, Dropdown, Menu, message, Space, Tree, Input, Modal, Tooltip, Tabs,Tag } from 'antd';
import './RAGTree.css'; 
const { confirm } = Modal;

const deleteItem = async (key) => {
  const deleteFileOrFolder = await deleteKnowledgeBase(key)
  message.success('Item deleted successfully');
};


export const deleteModal = (record) => {
  confirm({
    title: `Are you sure you want to delete ${record.type}?`,
    content: `You are deleting ${record?.name}.`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk() {
      deleteItem(record?.key)
    },
    onCancel() {
      console.log('Cancel');

    },
  });

};

export const removeItemFromFolder = (structure, itemKey) => {
  return structure.filter(folder => {
    if (folder.key === itemKey) {
      return false;
    }
    if (folder.children) {
      folder.children = removeItemFromFolder(folder.children, itemKey);
    }
    return true;
  });
};


  export const assistantListModal = (assistantNameList,isVisible) => {

    Modal.info({
      title:  (
        <div className='modalTitle'>Associate Agents</div>
      ),
      content: <>
              <div className="d-flex align-items-center flex-wrap gap-1">
            {(assistantNameList || []).flatMap((name, index) => {
              if (typeof name === 'string') {
                // Handle case where name is a comma-separated string
                return name.split(',').map((item, idx) => (
                  <Tag color="geekblue" key={`${name}-${index}-${idx}`}>
                    {item.trim()}
                  </Tag>
                ));
              } else if (Array.isArray(name)) {
                // Handle case where name is an array
                return name.map((item, idx) => (
                  <Tag color="geekblue" key={`${index}-${idx}`}>
                    {item} 
                  </Tag>
                ));
              } else {
                // Handle unexpected cases
                console.warn('Unexpected name type:', name);
                return [];
              }
            })}
          </div>
      </>,
      okText:'close',
    okButtonProps: { style: { backgroundColor: 'black' } },
      onCancel() {
        console.log('Cancel');
  
      },
    });
  
  
  };  
