import React, { useState } from "react";
import StatusBottomSheet from "./StatusBottomSheet";
import TimelineModal from "./TimelineModal";
import { stubFalse } from "lodash";

const TimeLineList = () => {
  const [showSheet, setShowSheet] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  // ✅ FIX: removed showCustom — StatusBottomSheet has no onOpenCustom handler

  return (
    <>
      <button
        style={{ display: "none" }}
        data-testid="timeline-close-sheet-button"
        onClick={() => setShowSheet(false)}
        type="button"
        className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
      >
        <i className="bx bx-category-alt fs-22"></i>
      </button>

      <StatusBottomSheet
        show={showSheet}
        onClose={() => setShowSheet(false)}
        // ✅ FIX: removed onOpenCustom (unused prop)
        onOpenTimeline={() => {
          setShowSheet(false);
          setShowTimeline(true);
        }}
        // onCheckInOut not passed here — button hidden automatically
      />

      <TimelineModal
        show={showTimeline}
        onClose={() => setShowTimeline(false)}
      />
    </>
  );
};

export default TimeLineList;
