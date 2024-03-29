import { Modal } from "antd";

const CustomModal = ({ onOk, title, content, okText, okType, cancelText, visible, onCancel }) => {

    return (
        <>
             <Modal
                title={title}
                open={visible}
                onOk={onOk}
                okText={okText || "Yes"}
                okType={okType || "danger"}
                cancelText={cancelText || "No"}
                onCancel={onCancel}
            >
                {content}
            </Modal>
        </>
    );
};

export default CustomModal;

// Use case example:
// import { useState } from 'react';
// import { Button } from 'antd';
// import { modalData } from '../../data/ExampleModal';
// import CustomModal from './CustomModal';

// const [visible, setVisible] = useState(false);

// const handleOk = () => {
//     setVisible(false);
// };

// const handleCancel = () => {
//     setVisible(false);
// };

// const handleDelete = () => {
//     setVisible(true);
// };

// <Button onClick={handleDelete}>Delete</Button>
// <CustomModal
//     title="Delete"
//     content="Are you sure you want to delete this?"
//     visible={visible}
//     onOk={handleOk}
//     onCancel={handleCancel}
// />