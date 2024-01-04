export const EmployeeDisplayInSelect = ({ innerProps, label, data }) => (
    <div {...innerProps}>
        {data?.profile_url ? (
            <div className="flex-shrink-0">
                <img
                    src={data.profile_url}
                    alt=""
                    className="avatar-xs rounded-circle"
                    style={{ objectFit: "cover" }}
                />
            </div>
        ) : (
            <div
                className="avatar-xs rounded-circle"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={data.fname}
            >
                <span className="first_letter" style={{ color: "white" }}>
                    {data.fname.charAt(0)}
                </span>
            </div>
        )}

        {data?.emp_id && (
            <span># {data.emp_id}</span>
        )} {" - "}
        <span>{label}</span>
    </div>
);