import React, { useMemo, useState } from "react";
import { Modal } from "reactstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import "./ReorderStatusModal.scss";

const toValidColor = (color) => {
  const option = new Option();
  option.style.color = color;
  return option.style.color ? color : "#64748b";
};

const move = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Drag-and-drop ordering for statuses. `items` is the working list owned by
 * the parent; `onSave` may be async — the button shows a spinner meanwhile.
 */
const ReorderStatusModal = ({ isOpen, onClose, items = [], onChange, onSave, tidModule }) => {
  const [initialIds, setInitialIds] = useState([]);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [saving, setSaving] = useState(false);

  // Snapshot the order once per opening, so "moved" badges and Reset compare
  // against what the dialog opened with.
  if (isOpen && !snapshotTaken) {
    setSnapshotTaken(true);
    setInitialIds(items.map((i) => i.id));
  } else if (!isOpen && snapshotTaken) {
    setSnapshotTaken(false);
  }

  const initialIndex = useMemo(
    () => Object.fromEntries(initialIds.map((id, i) => [id, i])),
    [initialIds],
  );
  const changedCount = items.filter((item, i) => initialIndex[item.id] !== i).length;

  const handleDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    onChange(move(items, result.source.index, result.destination.index));
  };

  const nudge = (index, delta) => {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    onChange(move(items, index, to));
  };

  const reset = () => {
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    onChange(initialIds.map((id) => byId[id]).filter(Boolean));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      data-testid={testId(tidModule, "reorder-dialog")}
      isOpen={isOpen}
      toggle={onClose}
      centered
      className="rsm-modal"
    >
      <div className="rsm-head">
        <span className="rsm-head-icon">
          <i className="ri-list-ordered"></i>
        </span>
        <div className="rsm-head-text">
          <h5>Reorder Status</h5>
          <p>Drag the cards, or use the arrows, to set the order.</p>
        </div>
        <button
          data-testid={testId(tidModule, "reorder-close-button")}
          type="button"
          className="rsm-close"
          aria-label="Close"
          onClick={onClose}
        >
          <i className="ri-close-line"></i>
        </button>
      </div>

      <div className="rsm-body">
        {items.length === 0 ? (
          <div className="rsm-empty">
            <i className="ri-inbox-line"></i>
            No statuses to reorder.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="reorder-status-list">
              {(provided, dropSnapshot) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rsm-list${dropSnapshot.isDraggingOver ? " is-over" : ""}`}
                >
                  {items.map((item, index) => {
                    const color = toValidColor(item.color);
                    const from = initialIndex[item.id];
                    const shift = from === undefined ? 0 : from - index;
                    return (
                      <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <li
                            data-testid={testId(tidModule, "reorder-item", itemTestKey(item))}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`rsm-item${dragSnapshot.isDragging ? " is-dragging" : ""}${
                              shift ? " is-moved" : ""
                            }`}
                            style={{ ...dragProvided.draggableProps.style, "--c": color }}
                          >
                            <span className="rsm-grip">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                <circle cx="5" cy="3" r="1.4" />
                                <circle cx="11" cy="3" r="1.4" />
                                <circle cx="5" cy="8" r="1.4" />
                                <circle cx="11" cy="8" r="1.4" />
                                <circle cx="5" cy="13" r="1.4" />
                                <circle cx="11" cy="13" r="1.4" />
                              </svg>
                            </span>
                            <span className="rsm-pos">{index + 1}</span>
                            <span className="rsm-chip">
                              <span className="rsm-dot" />
                              <span className="rsm-name">{item.name}</span>
                            </span>
                            {shift !== 0 && (
                              <span className={`rsm-shift ${shift > 0 ? "is-up" : "is-down"}`}>
                                <i className={shift > 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
                                {Math.abs(shift)}
                              </span>
                            )}
                            <span className="rsm-nudge">
                              <button
                                data-testid={testId(tidModule, "reorder-item", itemTestKey(item), "up-button")}
                                type="button"
                                aria-label="Move up"
                                disabled={index === 0}
                                onClick={() => nudge(index, -1)}
                              >
                                <i className="ri-arrow-up-s-line"></i>
                              </button>
                              <button
                                data-testid={testId(tidModule, "reorder-item", itemTestKey(item), "down-button")}
                                type="button"
                                aria-label="Move down"
                                disabled={index === items.length - 1}
                                onClick={() => nudge(index, 1)}
                              >
                                <i className="ri-arrow-down-s-line"></i>
                              </button>
                            </span>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <div className="rsm-foot">
        <div className="rsm-foot-info">
          {changedCount > 0 ? (
            <>
              <span className="rsm-badge">{changedCount}</span>
              {changedCount === 1 ? "status moved" : "statuses moved"}
              <button
                data-testid={testId(tidModule, "reorder-reset-button")}
                type="button"
                className="rsm-reset"
                onClick={reset}
                disabled={saving}
              >
                <i className="ri-arrow-go-back-line"></i>
                Reset
              </button>
            </>
          ) : (
            <span className="rsm-muted">
              <i className="ri-information-line"></i>
              No changes yet
            </span>
          )}
        </div>
        <div className="rsm-foot-actions">
          <button
            data-testid={testId(tidModule, "reorder-footer-close-button")}
            type="button"
            className="btn rsm-btn is-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            data-testid={testId(tidModule, "reorder-save-button")}
            type="button"
            className="btn rsm-btn is-primary"
            onClick={save}
            disabled={saving || changedCount === 0}
          >
            <i className={saving ? "ri-loader-4-line rsm-spin" : "ri-check-line"}></i>
            {saving ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReorderStatusModal;
