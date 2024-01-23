export const EmployeeDisplayInSelect = ({ innerProps, label, data }) => (
<div {...innerProps} className="d-flex align-items-center">
  {data?.profile_url ? (
    <img
      src={data.profile_url}
      alt=""
      className="avatar-xs rounded-circle"
      style={{ objectFit: "cover", marginRight: "10px",  marginBottom: "5px",marginLeft: "5px" }} 
    />
  ) : (
    <div
      className="avatar-xs rounded-circle"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0ab39c",
        marginRight: "10px", 
      }}
      data-bs-toggle="tooltip"
      title={data.fname}
    >
      <span className="first_letter" style={{ color: "white" }}>
        {data.fname.charAt(0)}
      </span>
    </div>
  )}

  {data?.emp_id && <div style={{ marginRight: "10px" }}># {data.emp_id}</div>}
  <div>{label}</div>
</div>
);