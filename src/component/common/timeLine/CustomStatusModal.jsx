import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";

const CustomStatusModal = ({ show, handleClose, onSave, existingData }) => {
  const [status, setStatus] = useState("");
  const [emoji, setEmoji] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (existingData) {
      setStatus(existingData.status || "");
      setEmoji(existingData.emoji || "");
    }
  }, [existingData]);

  const handleEmojiClick = (emojiData) => {
    setEmoji(emojiData.emoji);
    setShowPicker(false);
  };

  const handleDone = () => {
    if (!status.trim()) return;

    onSave({
      status,
      emoji
    });

    handleClose();
  };

  return (
    <Modal isOpen={show} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>
        What’s your Custom Status
      </ModalHeader>

      <ModalBody>
        <FormGroup>
          <Label>Custom Status</Label>
          <Input
            type="text"
            placeholder="Enter Custom Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label className="d-flex align-items-center gap-2">
            <Smile size={16} /> Status Icon
          </Label>

          <div className="d-flex gap-2 align-items-center">
            <Input
              type="text"
              value={emoji}
              placeholder="Select Emoji"
              readOnly
            />
            <Button
              color="light"
              onClick={() => setShowPicker(!showPicker)}
            >
              😊
            </Button>
          </div>

          {showPicker && (
            <div style={{ marginTop: 10 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </FormGroup>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleDone}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomStatusModal;