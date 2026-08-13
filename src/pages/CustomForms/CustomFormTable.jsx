import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfoTable from "../../component/common/table/InfoTable";
import { Api } from "../../common/api/Api";
import { setCustomForm } from "../../redux/reducers/ChildReducer/CustomFormReducer";
import { custom_form_component_name } from "../../common/constant/Constants";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";

const CustomFormTable = () => {
  const dispatch = useDispatch();
  const { custom_form_data } = useSelector((state) => state.CustomFormReducer);

  useEffect(() => {
    // show cached data instantly while the API call is in flight
    const cached = GetLocalStorageData("custom_form");
    if (cached) {
      dispatch(setCustomForm(cached));
    }

    Api({
      method: "GET",
      url: "/custom/custom-form/",
    })
      .then((res) => {
        const data = res?.data?.data || [];
        dispatch(setCustomForm(data));
        SetLocalStorage("custom_form", data, 1);
      })
      .catch((err) => {
        console.log("ERR", err);
      });
  }, []);

  const additionalColumn = [
    {
      Header: "Name",
      filterable: false,
      id: "name",
      accessor: (obj) => <b>{obj.name}</b>,
    },
    {
      Header: "Description",
      accessor: "description",
      filterable: false,
      id: "description",
    },
    {
      Header: "Fields",
      filterable: false,
      id: "fields",
      accessor: (obj) => <b>{obj.schema?.length || 0}</b>,
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.status ? "Active" : "Inactive";
        let statusClass = obj.status ? "success" : "danger";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const initialFormObj = {
    id: 0,
    name: "",
    description: "",
    schema: [],
    status: true,
  };

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: custom_form_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: custom_form_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={custom_form_data}
        formname={custom_form_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"100%"}
        table_class={"Lc_leave_apply_table me-n3 ms-n3"}
      />
    </React.Fragment>
  );
};

export default CustomFormTable;
