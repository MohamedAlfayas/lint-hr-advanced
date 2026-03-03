import React, { useState } from "react";
import { Button } from "reactstrap";
import StatusBottomSheet from "./StatusBottomSheet";
import CustomStatusModal from "./CustomStatusModal";
import TimelineModal from "./TimelineModal";

const TimeLineList = () => {
  const [showSheet, setShowSheet] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <>
      {/* <Button color="primary" onClick={() => setShowSheet(true)}>
        Status
      </Button> */}
        <button
      onClick={() => setShowSheet(true)}
        type="button"
        className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
      >
        <i className="bx bx-plus fs-22"></i>
      </button>

      <StatusBottomSheet
        show={showSheet}
        onClose={() => setShowSheet(false)}
        onOpenCustom={() => {
          setShowSheet(false);
          setShowCustom(true);
        }}
        onOpenTimeline={() => {
          setShowSheet(false);
          setShowTimeline(true);
        }}
      />

      <CustomStatusModal
        show={showCustom}
        onClose={() => setShowCustom(false)}
      />

      <TimelineModal
        show={showTimeline}
        onClose={() => setShowTimeline(false)}
      />
    </>
  );
};

export default TimeLineList;