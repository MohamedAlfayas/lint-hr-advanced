// ==============================
// TaskChecklist.jsx
// ==============================

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PostApi } from "../../../../common/api/PostApi";
import {
  setChecklists,
  addChecklist,
  editChecklist,
  deleteChecklist,
} from "../../../../redux/reducers/ChildReducer/CheckListReducer";
import { testId, itemTestKey } from "../../../../shared/testing/testId"; // ✅ adjust path as needed

const TaskChecklist = ({
  taskId,
  checklistData = [], // ✅ task detail api data
}) => {
  const dispatch = useDispatch();

  // ✅ Read items from Redux store
  const reduxItems = useSelector(
    (state) => state.CheckListReducer.checklist_data,
  );

  const [sortable, setSortable] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const [checklistError, setChecklistError] = useState("");

  // drag states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // =========================
  // SET CHECKLIST FROM TASK DETAIL API
  // =========================
  useEffect(() => {
    if (Array.isArray(checklistData)) {
      const formatted = checklistData.map((item) => ({
        id: item.id,
        text: item.subject,
        checked: item.is_completed,
        sort_order: item.sort_order,
      }));

      // ✅ Seed Redux store from prop
      dispatch(setChecklists(formatted));
    }
  }, [checklistData]);

  // =========================
  // COMPLETED COUNT
  // =========================
  const completedCount = useMemo(() => {
    return reduxItems.filter((i) => i.checked).length;
  }, [reduxItems]);

  // =========================
  // ADD CHECKLIST
  // =========================
  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    if (newItemText.length > 100) {
      setChecklistError("Checklist cannot exceed 100 characters");
      return;
    }

    try {
      const payload = {
        task: taskId,
        subject: newItemText,
      };

      const response = await PostApi("/task/add-task-checklist/", payload);

      const data = response?.data?.data;

      const newItem = {
        id: data.id,
        text: data.subject,
        checked: data.is_completed,
        sort_order: data.sort_order,
      };

      // ✅ Push only new item into Redux store
      dispatch(addChecklist(newItem));

      toast.success(response?.data?.message || "Checklist Added");

      setNewItemText("");
      setChecklistError("");
      setShowAddForm(false);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to add checklist");
    }
  };

  // =========================
  // TOGGLE CHECKLIST
  // =========================
  const handleToggle = async (id) => {
    try {
      const currentItem = reduxItems.find((i) => i.id === id);

      const payload = {
        id: id,
        task: taskId,
        is_completed: !currentItem.checked,
      };

      const response = await PostApi("/task/update-task-checklist/", payload);

      // ✅ Update only the toggled item in Redux store
      const updatedItem = {
        ...currentItem,
        checked: !currentItem.checked,
      };

      dispatch(editChecklist(updatedItem));

      toast.success(response?.data?.message || "Checklist Updated");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to update checklist",
      );
    }
  };

  // =========================
  // DELETE CHECKLIST
  // =========================
  const handleRemove = async (id) => {
    try {
      const payload = {
        id: id,
        task: taskId,
      };

      const response = await PostApi("/task/delete-task-checklist/", payload);

      // ✅ Delete API response not needed — remove item from Redux store by ID
      dispatch(deleteChecklist(id));

      toast.success(response?.data?.message || "Checklist Deleted");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete checklist",
      );
    }
  };

  // =========================
  // DRAG HANDLERS
  // =========================
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null) return;

    const updated = [...reduxItems];
    const draggedItem = updated[draggedIndex];

    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    // ✅ Re-seed Redux store with reordered list
    dispatch(setChecklists(updated));

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="p-4 border-bottom">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6
          className="fw-bold mb-0 d-flex align-items-center gap-2"
          style={{
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: ".6px",
            color: "var(--vz-secondary-color)",
          }}
        >
          <i className="ri-checkbox-multiple-line text-primary" />
          Checklist
          <span
            className="badge badge-surface text-secondary border"
            style={{
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {completedCount}/{reduxItems.length}
          </span>
        </h6>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted" style={{ fontSize: "0.78rem" }}>
            Sortable
          </span>

          <div
            onClick={() => setSortable((s) => !s)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: sortable ? "var(--vz-primary)" : "rgba(var(--vz-secondary-rgb), .3)",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: sortable ? 19 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress */}
      {reduxItems.length > 0 && (
        <div
          className="mb-3"
          style={{
            height: 4,
            background: "var(--vz-border-color)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${
                reduxItems.length
                  ? (completedCount / reduxItems.length) * 100
                  : 0
              }%`,
              background: "var(--vz-success)",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Empty */}
      {reduxItems.length === 0 && !showAddForm && (
        <div
          className="text-center py-3 text-muted"
          style={{
            fontSize: "0.82rem",
            border: "1px dashed var(--vz-border-color)",
            borderRadius: 6,
          }}
        >
          <i className="ri-checkbox-blank-line d-block mb-1 fs-5" />
          No checklist items yet
        </div>
      )}

      {/* Checklist */}
      {reduxItems.length > 0 && (
        <div
          className="mb-2"
          style={{
            border: "1px solid var(--vz-border-color)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {reduxItems.map((item, index) => (
            <div
              key={item.id}
              draggable={sortable}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className="d-flex align-items-center gap-2 px-3"
              style={{
                padding: "9px 12px",
                borderBottom:
                  index < reduxItems.length - 1 ? "1px solid var(--vz-border-color)" : "none",
                background:
                  dragOverIndex === index
                    ? "rgba(var(--vz-primary-rgb), .08)"
                    : item.checked
                      ? "rgba(var(--vz-success-rgb), .06)"
                      : "var(--vz-secondary-bg)",
                cursor: sortable ? "grab" : "default",
                transition: "background 0.15s",
              }}
            >
              {sortable && (
                <i
                  className="ri-drag-move-2-line text-muted"
                  style={{
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                />
              )}

              <input
                data-testid={testId("task-checklist-checked", itemTestKey(item), "checkbox")}
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                style={{
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  cursor: "pointer",
                  accentColor: "var(--vz-primary)",
                }}
              />

              <span
                className="flex-grow-1"
                style={{
                  fontSize: "0.85rem",
                  textDecoration: item.checked ? "line-through" : "none",
                  color: item.checked ? "var(--vz-secondary-color)" : "var(--vz-body-color)",
                }}
              >
                {item.text}
              </span>

              <button
                data-testid={testId("task-checklist-close", itemTestKey(item), "button")}
                type="button"
                className="btn btn-link p-0 text-muted"
                onClick={() => handleRemove(item.id)}
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1,
                }}
              >
                <i className="ri-close-line" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div
          className="mt-2"
          style={{
            border: "1px solid var(--vz-border-color)",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--vz-tertiary-bg)",
          }}
        >
          <div className="p-2">
            <input
              type="text"
              className={`form-control form-control-sm ${
                checklistError ? "is-invalid" : ""
              }`}
              placeholder="Add item"
              value={newItemText}
              onChange={(e) => {
                const value = e.target.value.replace(
                  /[^A-Za-z0-9\s.,&()'-]/g,
                  "",
                );

                setNewItemText(value);

                if (value.length > 100) {
                  setChecklistError("Checklist cannot exceed 100 characters");
                } else {
                  setChecklistError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") setShowAddForm(false);
              }}
              autoFocus
              style={{ fontSize: "0.85rem" }}
            />
            {checklistError && (
              <div className="invalid-feedback d-block">{checklistError}</div>
            )}
          </div>

          <div className="d-flex gap-2 px-2 pb-2">
            <button
              data-testid="task-checklist-add-button"
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddItem}
              disabled={!newItemText.trim() || !!checklistError}
            >
              Add
            </button>

            <button
              data-testid="task-checklist-cancel-button"
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setShowAddForm(false);
                setNewItemText("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showAddForm && (
        <button
          data-testid="task-checklist-add-item-button"
          type="button"
          className="btn btn-outline-primary btn-sm mt-2 d-flex align-items-center gap-1"
          onClick={() => setShowAddForm(true)}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="ri-add-line" />
          Add Item
        </button>
      )}
    </div>
  );
};

export default TaskChecklist;
