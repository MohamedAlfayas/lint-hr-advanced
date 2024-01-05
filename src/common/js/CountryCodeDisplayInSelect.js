export const CountryCodeDisplayInSelect = ({ innerProps, label, data }) => (
  <div {...innerProps}>
    <div className="flex-shrink-0">
      <img
        src={data.flagImg}
        alt=""
        className="avatar-xs rounded-circle"
        style={{ objectFit: "cover" }}
      />{" "}
      {data?.countryCode}
    </div>
  </div>
);

export const CountryCodeDisplayStyles = {
  option: (provided, state) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
    padding: 2,
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: 2,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
  }),
};
