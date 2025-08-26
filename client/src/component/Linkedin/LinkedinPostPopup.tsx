import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Input } from 'antd';
import './linkedinPostPopup.css'

const { TextArea } = Input;

const LinkedInPostPopup = ({ 
  isOpen, 
  onClose, 
  onShare, 
  initialText, 
  chatPrompt 
}) => {

  const [editedText, setEditedText] = useState(initialText);
  const characterLimit = 2999;

  useEffect(() => {
    setEditedText(initialText);
  }, [initialText]);

  const handleShare = () => {
    onShare(chatPrompt, editedText);
    onClose();
  };

  const characterCount = editedText.length;
  const isOverLimit = characterCount > characterLimit;

  return (
    <Modal
      title="Share to LinkedIn"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button 
          key="cancel" 
          onClick={onClose}
          className='post-footer-bttn'
        >
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleShare}
          className='post-footer-bttn'
          disabled={isOverLimit}
        >
          Post
        </Button>
      ]}
      maskClosable={false}
      width={600}
    >
      <div style={{ color: 'red', marginBottom: '10px' }}>Note: Same article cannot be posted multiple times. It can cause error.</div>
      {isOverLimit && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Warning: You are over the character limit. Character limit is {characterLimit}.
        </div>
      )}
      <TextArea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        rows={8}
      />
    </Modal>
  );
};

export default LinkedInPostPopup;