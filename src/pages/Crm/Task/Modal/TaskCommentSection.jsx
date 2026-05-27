import React, { useState, useRef, useMemo } from "react";
import { Spinner } from "reactstrap";
import JoditEditor from "jodit-react";

const TaskCommentSection = ({ taskId }) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const editor = useRef(null);

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: "Write a comment or note about this task...",
      height: 220,
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "blockquote",
        "|",
        "undo",
        "redo",
      ],
    }),
    [],
  );

  const isCommentEmpty = (html) => {
    if (!html) return true;
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text === "";
  };

  const canSave =
    !savingComment && (!isCommentEmpty(comment) || uploadedFiles.length > 0);

  const handleSaveComment = async () => {
    setSavingComment(true);
    try {
      console.log("taskId :", taskId);
      console.log("comment (HTML):", comment);
      console.log("files  :", uploadedFiles);
    } finally {
      setSavingComment(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size,
      file: f,
    }));
    setUploadedFiles((prev) => [...prev, ...mapped]);
    e.target.value = "";
  };

  const handleRemoveFile = (id) =>
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCancel = () => {
    setComment("");
    setUploadedFiles([]);
    setEditorOpen(false);
  };

  const handleClear = () => {
    setComment("");
    setUploadedFiles([]);
    if (editor.current) editor.current.value = "";
  };

  return (
    <div className="p-4 border-bottom bg-white">
      <h6
        className="fw-bold mb-3 d-flex align-items-center gap-2"
        style={{
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: ".6px",
          color: "#6c757d",
        }}
      >
        <i className="ri-chat-3-line text-primary" />
        Add Comment / Note
      </h6>

      {!editorOpen && (
        <div
          onClick={() => setEditorOpen(true)}
          style={{
            border: "1px solid #dee2e6",
            borderRadius: 8,
            padding: "10px 14px",
            background: "#f8fafc",
            cursor: "text",
            color: "#adb5bd",
            fontSize: "0.85rem",
            userSelect: "none",
          }}
        >
          <i className="ri-edit-2-line me-2" />
          Write a comment or note about this task…
        </div>
      )}

      {editorOpen && (
        <>
          <JoditEditor
            ref={editor}
            value={comment}
            config={editorConfig}
            onChange={(newContent) => setComment(newContent)}
          />

          {/* FILE + ACTIONS ROW (FIXED) */}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            {/* LEFT: Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-light btn-sm d-flex align-items-center gap-1"
              >
                <i className="ri-attachment-2" />
                Upload File
              </button>
            </div>

            {/* RIGHT: Clear + Save */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleClear}
                disabled={!comment && uploadedFiles.length === 0}
              >
                Clear
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                onClick={handleSaveComment}
                disabled={!canSave}
              >
                {savingComment ? (
                  <Spinner size="sm" />
                ) : (
                  <i className="ri-send-plane-line" />
                )}
                Post Comment
              </button>
            </div>
          </div>

          {/* FILE LIST */}
          {uploadedFiles.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  className="border rounded px-2 py-1 d-flex align-items-center gap-2"
                  style={{ fontSize: "0.78rem" }}
                >
                  <i className="ri-file-line text-primary" />
                  <span>{f.name}</span>
                  <small className="text-muted">{formatFileSize(f.size)}</small>
                  <button
                    className="btn btn-link p-0 text-danger"
                    onClick={() => handleRemoveFile(f.id)}
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskCommentSection;
