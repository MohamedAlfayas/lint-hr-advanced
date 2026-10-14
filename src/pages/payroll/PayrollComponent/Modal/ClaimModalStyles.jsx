import React from "react";

const ClaimModalStyles = () => (
  <style>{`
    .rc-modal .modal-content{overflow:hidden}
    .rc-modal .rc-head{padding:18px 20px}
    .rc-modal .rc-head .modal-title{gap:14px}
    .rc-modal .rc-head .modal-title::before{display:none}
    .rc-head-icon{width:44px;height:44px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;font-size:21px;color:#fff;
      background:linear-gradient(135deg,var(--vz-success),#34d3b9);box-shadow:0 8px 18px -6px rgba(var(--vz-success-rgb),.6)}
    .rc-head-text{display:flex;flex-direction:column;min-width:0}
    .rc-head-title{font-size:16px;font-weight:700;color:var(--vz-heading-color);line-height:1.3}
    .rc-head-sub{font-size:12.5px;font-weight:400;color:var(--vz-secondary-color);margin-top:2px}

    .rc-modal .modal-body{padding:20px 22px 8px}
    .rc-modal .form-label{font-size:12.5px;font-weight:600;color:var(--vz-heading-color);margin-bottom:6px}
    .rc-modal .form-control,.rc-modal .form-select{height:42px;border-radius:10px;font-size:13.5px;
      background-color:var(--vz-tertiary-bg);border-color:var(--vz-border-color);transition:border-color .18s,box-shadow .18s,background-color .18s}
    .rc-modal textarea.form-control{height:auto;min-height:84px;padding-top:10px}
    .rc-modal .form-control:focus,.rc-modal .form-select:focus{background-color:var(--vz-secondary-bg);border-color:var(--vz-success);
      box-shadow:0 0 0 3px rgba(var(--vz-success-rgb),.15)}
    .rc-modal .form-control.is-invalid,.rc-modal .form-select.is-invalid{border-color:var(--vz-danger)}
    .rc-modal .mb-3,.rc-modal .form-group{margin-bottom:16px}

    .rc-type-card{position:relative;margin-bottom:16px;padding:14px 16px;border-radius:14px;
      border:1px solid rgba(var(--vz-success-rgb),.25);background:linear-gradient(135deg,rgba(var(--vz-success-rgb),.07),transparent 70%)}
    .rc-type-card .badge{border-radius:999px;padding:4px 9px;letter-spacing:.04em}
    .rc-type-card .form-control{background-color:var(--vz-secondary-bg)}
    .rc-amount{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:10px 12px;border-radius:10px;
      background:rgba(var(--vz-success-rgb),.1)}
    .rc-amount > span:first-child{font-size:12.5px;font-weight:600;color:var(--vz-secondary-color)}
    .rc-amount > span:last-child{font-size:17px;font-weight:700;color:var(--vz-success)}
    .rc-amount small{font-size:11.5px}

    .rc-period{display:flex;align-items:center;gap:10px;height:42px;padding:0 12px;border-radius:10px;
      border:1px dashed var(--vz-border-color);background:var(--vz-tertiary-bg)}
    .rc-period i{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:15px;
      color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.12)}
    .rc-period span{font-weight:600;font-size:13.5px;color:var(--vz-heading-color)}
    .rc-date.ant-picker{width:100%;height:42px;border-radius:10px}
    .rc-hint{display:flex;align-items:center;gap:4px;margin-top:6px;font-size:11.5px;color:var(--vz-secondary-color)}

    .rc-drop{border:1.5px dashed var(--vz-border-color);border-radius:14px;background:var(--vz-tertiary-bg);cursor:pointer;
      transition:all .18s ease}
    .rc-drop:hover,.rc-drop.is-active{border-color:var(--vz-success);background:rgba(var(--vz-success-rgb),.06)}
    .rc-drop.is-error{border-color:var(--vz-danger)}
    .rc-drop .dz-message{margin:0;padding:18px;text-align:center}
    .rc-drop-icon{width:48px;height:48px;margin:0 auto 8px;border-radius:50%;display:grid;place-items:center;font-size:22px;
      color:var(--vz-success);background:rgba(var(--vz-success-rgb),.12)}
    .rc-drop-title{font-weight:600;font-size:13.5px;color:var(--vz-heading-color)}
    .rc-drop-sub{font-size:12px;color:var(--vz-secondary-color)}
    .rc-file{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:12px;
      border:1px solid var(--vz-border-color);background:var(--vz-tertiary-bg)}

    .rc-modal .rc-foot{padding:14px 22px}
    .rc-modal .rc-foot .btn{height:40px;padding:0 18px;font-weight:600;border-radius:10px}
    .rc-modal .rc-foot .rc-btn-cancel{background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color);color:var(--vz-body-color);box-shadow:none}
    .rc-modal .rc-foot .rc-btn-cancel:hover{border-color:var(--vz-secondary-color);color:var(--vz-heading-color)}
    .rc-modal .rc-foot .rc-btn-submit{border:0;color:#fff;background:linear-gradient(135deg,var(--vz-success),#34d3b9);
      box-shadow:0 8px 18px -8px rgba(var(--vz-success-rgb),.8)}
    .rc-modal .rc-foot .rc-btn-submit:hover:not(:disabled){transform:translateY(-1px)}
    .rc-modal .rc-foot .rc-btn-submit:disabled{opacity:.5;box-shadow:none}
  `}</style>
);

export default ClaimModalStyles;
