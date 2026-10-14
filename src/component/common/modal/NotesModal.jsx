import React from "react";
import { Modal, ModalBody } from "reactstrap";
import { format } from "date-fns";
import { GetAmPmDateTime } from "../../../common/js/ConvertDateTimeToAmPm";

const AVATAR_TONES = ["primary", "success", "info", "warning", "danger", "secondary"];

const toneFor = (name = "") => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
};

const safeDate = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? "" : format(d, "EEEE, dd MMM yyyy");
};

const NotesModal = ({
  isOpen,
  onClose,
  date,
  notes = [],
  resolveEmployee = () => null,
  canWrite = false,
  value = "",
  onChange,
  onSave,
}) => {
  const list = Array.isArray(notes) ? notes : [];
  const trimmed = (value || "").trim();

  return (
    <Modal data-testid="notes-dialog" isOpen={isOpen} toggle={onClose} centered className="nm-modal">
      <div className="nm-head">
        <div className="nm-head-icon">
          <i className="ri-sticky-note-line" />
        </div>
        <div className="nm-head-text">
          <h5 className="nm-title">
            Notes
            <span className="nm-count">{list.length}</span>
          </h5>
          <div className="nm-sub">
            <i className="ri-calendar-line" />
            {safeDate(date)}
          </div>
        </div>
        <button type="button" className="nm-close" onClick={onClose} aria-label="Close" data-testid="notes-close-button">
          <i className="ri-close-line" />
        </button>
      </div>

      <ModalBody className="nm-body">
        {list.length > 0 ? (
          <div className="nm-list">
            {list.map((note, idx) => {
              const emp = resolveEmployee(note) || {};
              const name = emp.first_name || "Unknown";
              const tone = toneFor(name);
              return (
                <div className="nm-item" key={note?.id ?? idx}>
                  <div className="nm-avatar-col">
                    {emp.profile_url ? (
                      <img src={emp.profile_url} alt="" className="nm-avatar" />
                    ) : (
                      <div className={`nm-avatar nm-avatar-${tone}`} title={name}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {idx < list.length - 1 && <span className="nm-line" />}
                  </div>
                  <div className="nm-bubble">
                    <div className="nm-meta">
                      <span className="nm-name">{name}</span>
                      <span className="nm-time">
                        <i className="ri-time-line" />
                        {GetAmPmDateTime(note?.created_time)}
                      </span>
                    </div>
                    <p className="nm-msg">{note?.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="nm-empty">
            <div className="nm-empty-icon">
              <i className="ri-chat-off-line" />
            </div>
            <h6>No notes yet</h6>
            <p>
              {canWrite
                ? "Be the first to add a note for this day."
                : "Nothing has been noted for this day."}
            </p>
          </div>
        )}

        {canWrite && (
          <div className="nm-composer">
            <label className="nm-label" htmlFor="nm-textarea">
              <i className="ri-edit-2-line" /> Add a note
            </label>
            <textarea
              data-testid="notes-textarea"
              id="nm-textarea"
              rows="3"
              placeholder="Write your note here..."
              value={value || ""}
              onChange={(e) => onChange && onChange(e.target.value)}
            />
            <div className="nm-composer-foot">
              <span>{trimmed.length} characters</span>
            </div>
          </div>
        )}
      </ModalBody>

      <div className="nm-foot">
        <button type="button" className="nm-btn nm-btn-ghost" onClick={onClose} data-testid="notes-footer-close-button">
          Close
        </button>
        {canWrite && (
          <button
            data-testid="notes-save-note-button"
            type="button"
            className="nm-btn nm-btn-primary"
            onClick={onSave}
            disabled={!trimmed}
          >
            <i className="ri-send-plane-2-line" /> Save Note
          </button>
        )}
      </div>

      <style>{`
        .nm-modal .modal-content{border:1px solid var(--vz-border-color);border-radius:18px;overflow:hidden;
          box-shadow:0 24px 60px -12px rgba(15,23,42,.35)}
        .nm-head{position:relative;display:flex;align-items:center;gap:14px;padding:18px 20px 16px;
          background:linear-gradient(135deg,rgba(var(--vz-primary-rgb),.12),rgba(var(--vz-info-rgb),.06) 60%,transparent);
          border-bottom:1px solid var(--vz-border-color)}
        .nm-head::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;
          background:linear-gradient(90deg,var(--vz-primary),var(--vz-info))}
        .nm-head-icon{width:44px;height:44px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;
          font-size:21px;color:#fff;background:linear-gradient(135deg,var(--vz-primary),var(--vz-info));
          box-shadow:0 8px 18px -6px rgba(var(--vz-primary-rgb),.6)}
        .nm-head-text{flex:1;min-width:0}
        .nm-title{margin:0;font-size:16px;font-weight:700;color:var(--vz-heading-color);display:flex;align-items:center;gap:8px}
        .nm-count{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;
          background:rgba(var(--vz-primary-rgb),.14);color:var(--vz-primary)}
        .nm-sub{margin-top:3px;font-size:12.5px;color:var(--vz-secondary-color);display:flex;align-items:center;gap:5px}
        .nm-close{width:34px;height:34px;border-radius:10px;border:1px solid var(--vz-border-color);
          background:var(--vz-secondary-bg);color:var(--vz-secondary-color);display:grid;place-items:center;
          font-size:18px;transition:all .18s ease}
        .nm-close:hover{color:var(--vz-danger);border-color:rgba(var(--vz-danger-rgb),.4);
          background:rgba(var(--vz-danger-rgb),.08);transform:rotate(90deg)}

        .nm-modal .nm-body{padding:18px 20px 6px;max-height:60vh;overflow-y:auto}
        .nm-list{display:flex;flex-direction:column}
        .nm-item{display:flex;gap:12px}
        .nm-avatar-col{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
        .nm-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;display:grid;place-items:center;
          font-weight:700;font-size:14px;color:#fff;box-shadow:0 0 0 3px var(--vz-secondary-bg),0 0 0 4px var(--vz-border-color)}
        .nm-avatar-primary{background:linear-gradient(135deg,var(--vz-primary),#6a7bd6)}
        .nm-avatar-success{background:linear-gradient(135deg,var(--vz-success),#34d3b9)}
        .nm-avatar-info{background:linear-gradient(135deg,var(--vz-info),#6fd0f5)}
        .nm-avatar-warning{background:linear-gradient(135deg,var(--vz-warning),#ffc977)}
        .nm-avatar-danger{background:linear-gradient(135deg,var(--vz-danger),#ff8a7a)}
        .nm-avatar-secondary{background:linear-gradient(135deg,#7c5cff,#a58bff)}
        .nm-line{flex:1;width:2px;min-height:14px;margin:6px 0;border-radius:2px;
          background:linear-gradient(var(--vz-border-color),transparent)}
        .nm-bubble{flex:1;min-width:0;margin-bottom:14px;padding:10px 14px;border-radius:4px 14px 14px 14px;
          background:var(--vz-tertiary-bg);border:1px solid var(--vz-border-color)}
        .nm-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px}
        .nm-name{font-weight:600;font-size:13.5px;color:var(--vz-heading-color)}
        .nm-time{font-size:11.5px;color:var(--vz-secondary-color);display:inline-flex;align-items:center;gap:4px}
        .nm-msg{margin:0;font-size:13.5px;line-height:1.55;color:var(--vz-body-color);white-space:pre-wrap;word-break:break-word}

        .nm-empty{text-align:center;padding:22px 10px 18px}
        .nm-empty-icon{width:64px;height:64px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;
          font-size:28px;color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.1);
          box-shadow:0 0 0 8px rgba(var(--vz-primary-rgb),.05)}
        .nm-empty h6{margin:0 0 4px;font-weight:700;color:var(--vz-heading-color)}
        .nm-empty p{margin:0;font-size:13px;color:var(--vz-secondary-color)}

        .nm-composer{margin:6px 0 12px;padding:12px;border-radius:14px;border:1px dashed var(--vz-border-color);
          background:var(--vz-secondary-bg)}
        .nm-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;
          color:var(--vz-secondary-color);margin-bottom:8px;display:flex;align-items:center;gap:6px}
        .nm-composer textarea{width:100%;min-height:84px;resize:vertical;border-radius:10px;padding:10px 12px;
          font-size:13.5px;color:var(--vz-body-color);background:var(--vz-tertiary-bg);
          border:1px solid var(--vz-border-color);outline:none;transition:border-color .18s,box-shadow .18s}
        .nm-composer textarea:focus{border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15);
          background:var(--vz-secondary-bg)}
        .nm-composer-foot{display:flex;justify-content:flex-end;margin-top:4px;font-size:11px;color:var(--vz-secondary-color)}

        .nm-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;
          border-top:1px solid var(--vz-border-color);background:var(--vz-tertiary-bg)}
        .nm-btn{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 18px;border-radius:10px;
          font-size:13.5px;font-weight:600;border:1px solid transparent;transition:all .18s ease}
        .nm-btn-ghost{background:var(--vz-secondary-bg);border-color:var(--vz-border-color);color:var(--vz-body-color)}
        .nm-btn-ghost:hover{border-color:var(--vz-secondary-color)}
        .nm-btn-primary{color:#fff;background:linear-gradient(135deg,var(--vz-primary),var(--vz-info));
          box-shadow:0 8px 18px -8px rgba(var(--vz-primary-rgb),.8)}
        .nm-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 22px -8px rgba(var(--vz-primary-rgb),.9)}
        .nm-btn-primary:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
      `}</style>
    </Modal>
  );
};

export default NotesModal;
