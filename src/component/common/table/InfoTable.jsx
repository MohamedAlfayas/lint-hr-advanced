import React from "react";
UncontrolledDropdown;
import { useState } from "react";
import { useRef } from "react";

import {
  Card,
  swal,
  CardBody,
  Col,
  Container,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Label,
  Modal,
  ModalHeader,
  Form,
  ModalBody,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "reactstrap";

import TableContainer from "../../../component/common/table/TableContainer";
import DeleteModal from "../../../component/common/modal/DeleteModal";
import Loader from "../../../component/common/loader/Loader";
import ExportCSV from "../../../component/common/export/ExportCSV";

import { useEffect } from "react";
import { useCallback } from "react";

import classnames from "classnames";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
  toggleISBView,
} from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { useDispatch, useSelector } from "react-redux";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Status } from "filepond";
import { setActiveTableTab } from "../../../redux/reducers/ChildReducer/TableReducer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { GetCustomField } from "../../../common/js/GetCustomField";
import { SweetAlert } from "../sweetAlert/SweetAlert";
import Swal from "sweetalert2";
import "../../../common/./css/lc_style.css";
import { ExportSampleData } from "../../../common/js/ExportSampleData";
import {
  component_list_for_import_btn_access,
  employee_component_name,
  holiday_component_name,
  leave_approval_component_name,
} from "../../../common/constant/Constants";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
defineElement(loadAnimation);

const InfoTable = ({
  additionalColumn,
  tabledata,
  formname,
  initialFormObj,
  filterKey,
  filterOptions,
  width_per,
  import_width_per,
  table_col,
  table_class,
}) => {
  // console.log("Page Refreshing !!!!", tabledata);

  const dispatch = useDispatch();

  const EmployeeData = GetLocalStorageData("employee");
  // console.log("fsfa", EmployeeData);

  const { activeTableTab } = useSelector((state) => state.TableReducer);

  // useEffect(() => {
  //   !!activeTableTab && setActiveTab(activeTableTab);
  // }, [activeTableTab]);

  const tabOptions = filterOptions
    ? filterOptions.map((obj, idx) => {
      return {
        ...obj,
        idx: idx + 2,
      };
    })
    : [];

  const [activeTab, setActiveTab] = useState("2");
  const [dataList, setDataList] = useState([]);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);
  const [modal, setModal] = useState(false);
  const [modal_list, setmodal_list] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showContainer, setShowContainer] = useState(false);

  const tog_list = () => {
    setmodal_list(!modal_list);
  };
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(new Date(currentYear, 0, 1));

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".dataCheckBox");
    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  const handleApproval = (orderData) => {
    let employee_fname =
      EmployeeData.find((e) => e.id === orderData.employee)?.fname || "";

    let content = `<span>Are You Sure to <strong style='color:green'>Accept </strong> Leave To Employee <strong style='color:#7066e0'>  ${employee_fname}</strong>  ? ${orderData.start} to  ${orderData.end} (${orderData.total})</span> `;
    let btnText = "Yes, Approve";

    Swal.fire({
      title: 'Confirmation',
      html: content,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: 'Cancel',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
    }).then((result) => {
      if (result.value) {
        console.log(`[${orderData.id}]`);
       
      }
    });
  }
  
  const handleReject = (orderData) => {
    console.log("Click Reject");
    console.log("Click Approve", orderData);
    let employee_fname =
      EmployeeData.find((e) => e.id === orderData.employee).fname || "";
    let content = `<span>Are You Sure to <strong style='color:red'>Reject</strong> Leave To Employee<strong style='color:#7066e0'> ${employee_fname} </strong> ? ${orderData.start} to  ${orderData.end} (${orderData.total})</span>`;
    let btnText = "Yes, Reject";
    let btnClass = "Danger";
    let input = "text";
    let inputValue = "";
    SweetAlert(true, content, btnText, btnClass, input, inputValue);
  };

  const handleBulkAction = (actionType) => {
    let content;
    let btnText;
    let btnClass;
    let input;
    let inputValue;
    
    if (actionType === "approve") {
      content = "Are You Sure to <strong style='color:green'>Accept </strong>  Leave To Selected Employees?";
      btnText = "Yes, Approve";
      btnClass = "Success";
    } else if (actionType === "reject") {
      content = "Are You Sure to <strong style='color:red'>Reject</strong> Leave To Selected Employees?";
      btnText = "Yes, Reject";
      btnClass = "Danger";
      input = "text";
      inputValue = "";
    }
  
    SweetAlert(true, content, btnText, btnClass, input, inputValue);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };
  const handleDeactivate = (orderData) => {
    Swal.fire({
      title: "Deactivate",
      text: ` Are you sure to deactivate Agent (${orderData.fname} ${orderData.lname})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f06548",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, deactivate!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Deactivated!",
          "Your account has been deactivated.",
          "success"
        );
      }
    });
  };

  const handleResetPassword = (orderData) => {
    console.log("Deactivaet OD = ", orderData);

    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data")
    );

    const fname =
      Object.keys(profile_data).length > 0 ? profile_data.fname : "";
    const lname =
      Object.keys(profile_data).length > 0 ? profile_data.lname : "";

    Swal.fire({
      title: "Reset Password",
      html: `
        <form id="resetPasswordForm">
          <label for="adminPassword" class="label-lc">Admin Password (${fname} ${lname})</label>
          <input type="password" id="adminPassword" class="swal2-input"  placeholder="Enter Admin Password" required >
          <label for="newPassword" class="label-lc">New Password (${orderData.fname} ${orderData.lname})</label>
          <input type="password" id="newPassword" class="swal2-input"  placeholder="Enter New Password" required >
          <label for="confirmPassword" class="label-lc">Confirm Password (${orderData.fname} ${orderData.lname})</label>
          <input type="password" id="confirmPassword" class="swal2-input"  placeholder="Enter Confirm Password" required>
        </form>
      `,
      icon: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#f06548",
      confirmButtonText: "Reset Password",
      preConfirm: () => {
        const adminPasswordInput = document.getElementById("adminPassword");
        const adminPasswordValue = adminPasswordInput.value.trim();
        const newPasswordInput = document.getElementById("newPassword");
        const newPasswordValue = newPasswordInput.value.trim();
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const confirmPasswordValue = confirmPasswordInput.value.trim();
        if (!adminPasswordValue) {
          Swal.showValidationMessage("Please enter Admin Password");
          return false;
        }
        if (!newPasswordValue) {
          Swal.showValidationMessage("Please enter New Password");
          return false;
        }
        if (!confirmPasswordValue) {
          Swal.showValidationMessage("Please enter Confirm Password");
          return false;
        }
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword =
          document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage("Passwords do not match");
        }

        return { newPassword, confirmPassword };
      },
      didOpen: () => {
        // Focus on the Admin Password input field
        const adminPasswordInput = document.getElementById("adminPassword");
        if (adminPasswordInput) {
          adminPasswordInput.focus();
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { newPassword, confirmPassword } = result.value;
        // Handle reset password logic with newPassword and confirmPassword
        Swal.fire(
          "Password Reset!",
          "Your password has been reset.",
          "success"
        );
      }
    });
  };

  // Column
  const columns = useMemo(
    () => [
      {
        Header: (
          <input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onClick={() => checkedAll()}
          />
        ),
        Cell: (cellProps) => {
          const orderDataChecked = cellProps.row.original;
          
          
          return (
            <input
            type="checkbox"
            className="dataCheckBox form-check-input"
            id={`checkbox-${cellProps.row.original.id}`}
            value={cellProps.row.original.id}
            onClick={(event) => {
              const isChecked = event.target.checked;
      
              if (isChecked) {
                console.log("OrderData Checked:", orderDataChecked);
              } else {
                // Checkbox is unchecked
                console.log("Checkbox unchecked");
              }
      
              deleteCheckbox(`checkbox-${cellProps.row.original.id}`);
            }}
          />
          );
        },
        id: "#",
      },
      {
        Header: "Action",
        Cell: (cellProps) => {
          const orderData = cellProps.row.original;

          if (
            formname &&
            formname === leave_approval_component_name &&
            orderData.status === 1
          ) {
            return (
              <ul className="list-inline hstack gap-2 mb-0">
                <li className="list-inline-item edit">
                  <Link
                    to="javascript:void(0)"
                    className="text-success d-inline-block edit-item-btn"
                    onClick={() => {
                      handleApproval(orderData);
                    }}
                  >
                    <i className="ri-check-line fs-16"></i>
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link
                    to="javascript:void(0)"
                    className="text-danger d-inline-block remove-item-btn"
                    onClick={() => handleReject(orderData)}
                  >
                    <i className="ri-close-line fs-16"></i>
                  </Link>
                </li>
              </ul>
            );
          } else if (formname && formname === employee_component_name) {
            return (
              <ul className="list-inline hstack gap-2 mb-0">
                <UncontrolledDropdown className="float-end">
                  <DropdownToggle
                    tag="a"
                    className="text-reset dropdown-btn"
                    href=""
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="text-primary d-inline-block edit-item-btn fs-16">
                      <i className="mdi mdi-dots-horizontal"></i>
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    <DropdownItem
                      onClick={() => {
                        handleDeactivate(orderData);
                      }}
                    >
                      <i className="ri-shut-down-line"></i> Deactivate
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        handleResetPassword(orderData);
                      }}
                    >
                      <i className="ri-refresh-line"></i> Reset Password
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>

                <li className="list-inline-item edit">
                  <Link
                    to="javascript:void(0)"
                    className="text-primary d-inline-block edit-item-btn"
                    onClick={() => {
                      handleCreateAndUpdate(orderData.id, orderData);
                    }}
                  >
                    <i className="ri-pencil-fill fs-16"></i>
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link
                    to="#"
                    className="text-danger d-inline-block remove-item-btn"
                    onClick={() => {
                      const orderData = cellProps.row.original;
                    }}
                  >
                    <i className="ri-delete-bin-5-fill fs-16"></i>
                  </Link>
                </li>
              </ul>
            );
          } else {
            return (
              <ul className="list-inline hstack gap-2 mb-0">
                <li className="list-inline-item">
                  <Link to="#" className="text-primary d-inline-block">
                    <i className="ri-eye-fill fs-16"></i>
                  </Link>
                </li>
                <li className="list-inline-item edit">
                  <Link
                    to="javascript:void(0)"
                    className="text-primary d-inline-block edit-item-btn"
                    onClick={() => {
                      handleCreateAndUpdate(orderData.id, orderData);
                    }}
                  >
                    <i className="ri-pencil-fill fs-16"></i>
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link
                    to="#"
                    className="text-danger d-inline-block remove-item-btn"
                    onClick={() => {
                      const orderData = cellProps.row.original;
                    }}
                  >
                    <i className="ri-delete-bin-5-fill fs-16"></i>
                  </Link>
                </li>
              </ul>
            );
          }
        },
      },
    ],
    []
  );

  useEffect(() => {
    columns.splice(1, 0, ...additionalColumn);
  }, []);

  const toggleTab = (tab, type) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      let filteredDatas = [...tabledata];
      if (type !== "all") {
        filteredDatas = [...tabledata].filter(
          (data) => data[filterKey] == type
        );
      }
      setDataList(filteredDatas);
    }
    dispatch(setActiveTableTab(null));
  };

  useEffect(() => {
    if (tabledata && tabledata.length) {
      let type = "";
      if (parseInt(activeTab) === 1) {
        type = "all";
      } else {
        type = tabOptions.length
          ? tabOptions.find((e) => e.idx === parseInt(activeTab))?.option
          : "all";
      }
      let filtered_table_data =
        type === "all"
          ? [...tabledata]
          : [...tabledata].filter((data) => data[filterKey] == type);

      setDataList(filtered_table_data);
    } else {
      setDataList([]);
    }
  }, [tabledata]);

  const handleDataClicks = () => {
    setData("");
  };

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);
  const [selectApproveReject, setSelectApproveReject] = useState(false)

  const deleteMultiple = () => {
    const checkall = document.getElementById("checkBoxAll");
    selectedCheckBoxDelete.forEach((element) => {
      setTimeout(() => {
        toast.clearWaitingQueue();
      }, 3000);
    });
    checkall.checked = false;
    setIsMultiDeleteButton(false);
  };

  

  const deleteCheckbox = (id) => {
    const ele = document.querySelectorAll(".dataCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const handleDeleteData = (data) => {
    console.log("data",data);
  };

  // const module_list_for_create_btn_access = [
  //   "employee",
  //   "leave_types",
  //   "holiday",
  //   "department",
  // ];

  // CUSTOM FORM

  const handleCreateAndUpdate = ($id, table_obj) => {
    console.log("tabObj", $id, table_obj);

    let FormObj = {};

    if ($id === 0) {
      FormObj = initialFormObj;
    } else {
      let thisCFValues =
        "cf_values" in table_obj ? [...table_obj?.cf_values] : [];
      let cf = [];
      let CustomFieldsForThisForm = GetCustomField(formname);
      if (thisCFValues && thisCFValues.length) {
        cf = CustomFieldsForThisForm.map((obj) => {
          return {
            ...obj,
            value:
              thisCFValues.find((t) => t.id === obj.id)?.value || obj.value,
          };
        });
      } else {
        cf = CustomFieldsForThisForm;
      }

      FormObj = { ...table_obj, cf_values: cf };
    }

    dispatch(setFormTitle(formname));
    dispatch(setFormObj(FormObj));
    dispatch(setFormWidthPercentage(width_per));
    dispatch(setComponentToShow(formname));
    dispatch(toggleRSBView(true));
  };

  const HandleImportExport = () => {
    dispatch(toggleISBView(true));
    dispatch(setComponentToShow(formname));
    dispatch(setFormWidthPercentage(import_width_per));
  };

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setOrder(null);
    } else {
      setModal(true);
      setDate(defaultdate());
    }
  }, [modal]);

  return (
    <Col lg={table_col || 12}>
      <div className={table_class || "page-content"}>
        <ExportCSV
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          data={dataList}
        />

        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteData}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
        <Container fluid>
          <Card id="dataList">
            <CardHeader className="bdata-0">
              <Row className="align-items-center gy-3">
                <div className="col-sm">
                  <h5
                    className="card-title mb-0"
                    style={{ textTransform: "capitalize" }}
                  >
                    {formname.split("_").join(" ")}
                  </h5>

                  {formname && formname === holiday_component_name && (
                    // <Datetime
                    //   className="w-20"
                    //   value={selectedYear}
                    //   onChange={(date) => {
                    //     if (date.isValid()) {
                    //       const year = date.year();
                    //       setSelectedYear(new Date(year, 0, 1));
                    //     } else {
                    //       setSelectedYear(null);
                    //     }
                    //   }}
                    //   dateFormat="YYYY"
                    //   timeFormat={false}
                    //   viewMode="years"
                    // />

                    <center>
                      <div className="flex-shrink-0 ms-5 mt-0">
                        <UncontrolledDropdown className="card-header-dropdown">
                          <DropdownToggle
                            tag="a"
                            className="text-reset dropdown-btn"
                            role="button"
                          >
                            <span className="text-muted">
                              01 Jan 2023 to 31 Dec 2023
                              <i className="mdi mdi-chevron-down ms-1"></i>
                            </span>
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem>
                              01 Jan 2022 to 31 Dec 2022
                            </DropdownItem>
                            <DropdownItem>
                              01 Jan 2023 to 31 Dec 2023
                            </DropdownItem>
                            <DropdownItem>
                              01 Jan 2024 to 31 Dec 2024
                            </DropdownItem>
                            <DropdownItem>
                              01 Jan 2025 to 31 Dec 2025
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </center>
                  )}
                </div>
                <div className="col-sm-auto">
                  <div className="d-flex gap-1 flex-wrap">
                    {formname && formname !== leave_approval_component_name && (
                      <button
                        type="button"
                        className="btn btn-success add-btn"
                        id="create-btn"
                        style={{ textTransform: "capitalize" }}
                        onClick={() => {
                          handleCreateAndUpdate(0);
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i> Create{" "}
                        {formname.split("_").join(" ")}
                      </button>
                    )}{" "}
                    <div className="d-flex gap-1 flex-wrap">
                      {formname &&
                        component_list_for_import_btn_access.includes(
                          formname
                        ) && (
                          <button
                            type="button"
                            className="btn btn-primary add-btn"
                            id="create-btn"
                            style={{ textTransform: "capitalize" }}
                            onClick={() => {
                              HandleImportExport();
                            }}
                          >
                            <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                            Import
                          </button>
                        )}{" "}
                      {/* <div>
                        {formname &&
                          formname === leave_approval_component_name && (
                            <div
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <div style={{ marginBottom: "10px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      position: "relative",
                                      width: "200px",
                                    }}
                                  >
                                    <i
                                      className="bx bx-search-alt search-icon"
                                      style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "10px",
                                        transform: "translateY(-50%)",
                                      }}
                                    ></i>
                                    <input
                                      type="text"
                                      placeholder="Search"
                                      value={search}
                                      onChange={handleSearchChange}
                                      style={{
                                        padding: "6px 30px 6px 30px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        width: "100%",
                                        outline: "none",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div
                                style={{
                                  marginLeft: "10px",
                                  marginRight: "5px",
                                }}
                              >
                                <label
                                  htmlFor="roleName"
                                  className="form-label"
                                >
                                  Status:
                                </label>
                                <select
                                  value={statusFilter}
                                  onChange={handleStatusFilterChange}
                                  style={{
                                    padding: "6px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "170px",
                                    outline: "none",
                                  }}
                                >
                                  <option value="all">All Status</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                              <div
                                style={{
                                  marginLeft: "10px",
                                  marginRight: "5px",
                                }}
                              >
                                <label
                                  htmlFor="roleName"
                                  className="form-label"
                                >
                                  Type:
                                </label>
                                <select
                                  value={typeFilter}
                                  onChange={handleTypeFilterChange}
                                  style={{
                                    padding: "6px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "170px",
                                    outline: "none",
                                  }}
                                >
                                  <option value="all">All Types</option>
                                  <option value="type1">Type 1</option>
                                  <option value="type2">Type 2</option>
                                </select>
                              </div>
                              <div></div>
                            </div>
                          )}
                      </div>
                      {formname &&
                        formname === leave_approval_component_name && (
                          <div>
                            <button
                              type="button"
                              className="btn btn-success add-btn"
                              id="bulk-approve-btn"
                              style={{
                                textTransform: "capitalize",
                                marginRight: "5px",
                              }}
                              onClick={() => handleBulkAction("approve")}
                            >
                              <i className="ri-check-line fs-16"></i> Bulk
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger add-btn"
                              id="bulk-reject-btn"
                              style={{ textTransform: "capitalize" }}
                              onClick={() => handleBulkAction("reject")}
                            >
                              <i className="ri-close-line fs-16"></i> Bulk
                              Reject
                            </button>
                          </div>
                        )} */}
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => setIsExportCSV(true)}
                      >
                        <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                        Export
                      </button>{" "}
                      {isMultiDeleteButton && (
                        <div>
                          <button
                            className="btn btn-soft-danger"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            <i className="ri-delete-bin-2-line"></i>
                          </button>{" "}
                          {formname === leave_approval_component_name && (
                            <>
                              <button
                                type="button"
                                className="btn btn-success add-btn"
                                id="bulk-approve-btn"
                                onClick={() => handleBulkAction("approve")}
                              >
                                <i className="ri-check-line fs-16"></i> Bulk Approve
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-danger add-btn"
                                id="bulk-reject-btn"
                                onClick={() => handleBulkAction("reject")}
                              >
                                <i className="ri-close-line fs-16"></i> Bulk Reject
                              </button>{" "}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Row>
            </CardHeader>

            <CardBody className="pt-0">
              <div>
                <Nav
                  className="nav-tabs nav-tabs-custom nav-success"
                  role="tablist"
                >
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === 1 },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab(1, "all");
                      }}
                      href="#"
                    >
                      <i className="ri-store-2-fill me-1 align-bottom"></i> All
                      Datas
                      {tabledata && tabledata.length > 0 && (
                        <Badge
                          color={activeTab === 1 ? "success" : "primary"}
                          style={{ marginLeft: "5px" }}
                        >
                          {tabledata.length}
                        </Badge>
                      )}
                    </NavLink>
                  </NavItem>
                  {!!filterOptions &&
                    filterOptions.map((obj, idx) => (
                      <NavItem>
                        <NavLink
                          className={classnames(
                            { active: activeTab === String(idx + 2) },
                            "fw-semibold"
                          )}
                          onClick={() => {
                            toggleTab(String(idx + 2), obj.option);
                          }}
                          href="#"
                        >
                          <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                          {obj.label}
                          {obj.count > 0 && (
                            <Badge
                              color={
                                activeTab === String(idx + 2)
                                  ? "success"
                                  : "primary"
                              }
                              style={{ marginLeft: "5px" }}
                            >
                              {obj.count}
                            </Badge>
                          )}
                        </NavLink>
                      </NavItem>
                    ))}
                </Nav>
                {dataList.length ? (
                  <TableContainer
                    columns={columns}
                    data={dataList || []}
                    isPagination={true}
                    isGlobalFilter={true}
                    formname={formname}
                    customPageSize={50}
                    divClass="table-responsive table-card"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted"
                    handleDataClick={handleDataClicks}
                    isDataFilter={true}
                    SearchPlaceholder="Search for data ID, customer, data status or something..."
                  />
                ) : (
                  <React.Fragment>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "25vh",
                      }}
                    >
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#405189,secondary:#0ab39c"
                        style={{
                          marginTop: "20px",
                          width: "150px",
                          height: "80px",
                          marginBottom: "20px",
                        }}
                      ></lord-icon>
                      <p
                        style={{
                          width: "300px",
                          color: "#405189",
                          fontSize: "20px",
                          textAlign: "center",
                        }}
                      >
                        Sorry! No Result Found
                      </p>
                    </div>
                  </React.Fragment>
                )}
              </div>
              <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                <ModalHeader className="bg-light p-3" toggle={toggle}>
                  {/* {!!isEdit ? "Edit Order" : "Add Order"} */}
                </ModalHeader>
                <Form
                  className="tablelist-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // validation.handleSubmit();
                    return false;
                  }}
                >
                  <ModalBody>
                    <input type="hidden" id="id-field" />

                    <div className="mb-3">
                      <Label htmlFor="id-field" className="form-label">
                        Order Id
                      </Label>
                      <Input
                        name="orderId"
                        id="id-field"
                        className="form-control"
                        placeholder="Enter Order Id"
                        type="text"
                      // validate={{
                      //     required: { value: true },
                      // }}
                      // onChange={validation.handleChange}
                      // onBlur={validation.handleBlur}
                      // value={validation.values.orderId || ""}
                      // invalid={
                      //     validation.touched.orderId && validation.errors.orderId ? true : false
                      // }
                      />
                      {/* {validation.touched.orderId && validation.errors.orderId ? (
                                                    <FormFeedback type="invalid">{validation.errors.orderId}</FormFeedback>
                                                ) : null} */}
                    </div>

                    <div className="mb-3">
                      <Label
                        htmlFor="customername-field"
                        className="form-label"
                      >
                        Customer Name
                      </Label>
                      <Input
                        name="customer"
                        id="customername-field"
                        className="form-control"
                        placeholder="Enter Name"
                        type="text"
                      // validate={{
                      //     required: { value: true },
                      // }}
                      // onChange={validation.handleChange}
                      // onBlur={validation.handleBlur}
                      // value={validation.values.customer || ""}
                      // invalid={
                      //     validation.touched.customer && validation.errors.customer ? true : false
                      // }
                      />
                      {/* {validation.touched.customer && validation.errors.customer ? (
                                                    <FormFeedback type="invalid">{validation.errors.customer}</FormFeedback>
                                                ) : null} */}
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="productname-field" className="form-label">
                        Product
                      </Label>

                      <Input
                        name="product"
                        type="select"
                        className="form-select"
                        // onChange={validation.handleChange}
                        // onBlur={validation.handleBlur}
                        // value={
                        //     validation.values.product || ""
                        // }
                        required
                      >
                        {/* {productname.map((item, key) => (
                                                        <React.Fragment key={key}>
                                                            {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                                                        </React.Fragment>
                                                    ))} */}
                      </Input>
                      {/* {validation.touched.product &&
                                                    validation.errors.product ? (
                                                    <FormFeedback type="invalid">
                                                        {validation.errors.product}
                                                    </FormFeedback>
                                                ) : null} */}
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="date-field" className="form-label">
                        Order Date
                      </Label>
                      {/* 
                                                <Flatpickr
                                                    name="orderDate"
                                                    className="form-control"
                                                    id="datepicker-publish-input"
                                                    placeholder="Select a date"
                                                    options={{
                                                        enableTime: true,
                                                        altInput: true,
                                                        altFormat: "d M, Y, G:i K",
                                                        dateFormat: "d M, Y, G:i K",
                                                    }}
                                                    onChange={(e) =>
                                                        dateformate(e)
                                                    }
                                                    value={validation.values.orderDate || ""}
                                                /> */}

                      {/* {validation.touched.orderDate && validation.errors.orderDate ? (
                                                    <FormFeedback type="invalid">{validation.errors.orderDate}</FormFeedback>
                                                ) : null} */}
                    </div>
                    <div className="row gy-4 mb-3">
                      <div className="col-md-6">
                        <div>
                          <Label htmlFor="amount-field" className="form-label">
                            Amount
                          </Label>
                          <Input
                            name="amount"
                            type="text"
                          // onChange={validation.handleChange}
                          // onBlur={validation.handleBlur}
                          // value={validation.values.amount || ""}
                          // invalid={
                          //     validation.touched.amount && validation.errors.amount ? true : false
                          // }
                          />
                          {/* {validation.touched.amount && validation.errors.amount ? (
                                                            <FormFeedback type="invalid">{validation.errors.amount}</FormFeedback>
                                                        ) : null} */}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <Label htmlFor="payment-field" className="form-label">
                            Payment Method
                          </Label>

                          <Input
                            name="payment"
                            type="select"
                            className="form-select"
                          // onChange={validation.handleChange}
                          // onBlur={validation.handleBlur}
                          // value={
                          //     validation.values.payment || ""
                          // }
                          >
                            {/* {orderpayement.map((item, key) => (
                                                                <React.Fragment key={key}>
                                                                    {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                                                                </React.Fragment>
                                                            ))} */}
                          </Input>
                          {/* {validation.touched.payment &&
                                                            validation.errors.payment ? (
                                                            <FormFeedback type="invalid">
                                                                {validation.errors.payment}
                                                            </FormFeedback>
                                                        ) : null} */}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="delivered-status" className="form-label">
                        Delivery Status
                      </Label>

                      <Input
                        name="status"
                        type="select"
                        className="form-select"
                      // onChange={validation.handleChange}
                      // onBlur={validation.handleBlur}
                      // value={
                      //     validation.values.status || ""
                      // }
                      >
                        {/* {orderstatus.map((item, key) => (
                                                        <React.Fragment key={key}>
                                                            {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                                                        </React.Fragment>
                                                    ))} */}
                      </Input>
                      {/* {validation.touched.status &&
                                                    validation.errors.status ? (
                                                    <FormFeedback type="invalid">
                                                        {validation.errors.status}
                                                    </FormFeedback>
                                                ) : null} */}
                    </div>
                  </ModalBody>
                  <div className="modal-footer">
                    <div className="hstack gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => {
                          setModal(false);
                        }}
                      >
                        Close
                      </button>

                      {/* <button type="submit" className="btn btn-success">
                                                    {!!isEdit
                                                        ? "Update"
                                                        : "Add Customer"}
                                                </button> */}
                    </div>
                  </div>
                </Form>
              </Modal>
            </CardBody>
          </Card>
        </Container>
      </div>
    </Col>
  );
};

export default InfoTable;
