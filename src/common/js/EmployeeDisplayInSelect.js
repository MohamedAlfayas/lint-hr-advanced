export const EmployeeDisplayInSelect = ({ innerProps, label, data }) => (
  <div {...innerProps} className="d-flex align-items-center" >
    {data?.id === "0" ? (
      <div style={{ display: "flex", flexDirection: "column", marginRight: "10px" }}>
        <div style={{ fontWeight: "bold" }}>{label}</div>
      </div>
    ) : (
      <>
        {data?.profile_url ? (
          <img
            src={data.profile_url}
            alt=""
            className="avatar-xs rounded-circle"
            style={{
              objectFit: "cover",
              marginRight: "10px",
              marginBottom: "10px",
              marginLeft: "5px",
              marginTop: "5px"
            }}
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
            <span className="first_letter" style={{ color: "white", fontWeight: "bold" }}>
              {data.fname.charAt(0)}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", marginRight: "10px" }}>
          <div style={{ fontWeight: "bold" }}>{label}</div>
          {data?.emp_id && <div style={{ marginTop: "-2px", fontSize: "10px" }}>#{data.emp_id}</div>}
        </div>
      </>
    )}
  </div>
);