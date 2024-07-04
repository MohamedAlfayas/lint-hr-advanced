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
import { format } from "date-fns";
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
  attendance_approval_component_name,
  component_list_for_import_btn_access,
  employee_component_name,
  holiday_component_name,
  leave_approval_component_name,
  leave_type_component_name,
  attendance_pending_table,
  leave_pending_table,
  leave_application_component_name,
  custom_field_component_name,
} from "../../../common/constant/Constants";

import {
  CREATE_EMPLOYEE_ACCESS_KEY,
  CREATE_CUSTOM_FIELD_ACCESS_KEY,
  EDIT_EMPLOYEE_ACCESS_KEY,
  EDIT_CUSTOM_FIELD_ACCESS_KEY,
  APPROVE_REJECT_ALL_LEAVE_ACCESS_KEY,
  APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY,
  APPROVE_REJECT_ALL_ATTENDANCE_ACCESS_KEY,
  APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY,
} from "../../../common/constant/RoleConstants";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { PostApi } from "../../../common/api/PostApi";
import { editLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { updateAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { setTableDataReducer } from "../../../redux/reducers/ChildReducer/TableDataReducer";
import { Api } from "../../../common/api/Api";
import { setEmployeeActiveStatus } from "../../../redux/reducers/ChildReducer/EmployeeReducer";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import {
  setCurrentApprovalComponent,
  setDashPendingApprovalCom,
} from "../../../redux/reducers/ChildReducer/ApprovalComponentReducer";
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
  const dispatch = useDispatch();

  const EmployeeData = GetLocalStorageData("employee");

  const { activeTableTab } = useSelector((state) => state.TableReducer);
  const {
    currentApprovalComponent,
    approvalEmployeeTypeFilter,
    dashPendingApprovalCom,
  } = useSelector((state) => state.ApprovalComponentReducer);

  // useEffect(() => {
  //   !!activeTableTab && setActiveTab(activeTableTab);
  // }, [activeTableTab]);

  const {
    search,
    employee_table_filter_keys,
    leave_type_table_filter_keys,
    attendance_approval_table_filter_keys,
  } = useSelector((state) => state.TableFilterReducer);

  const table_filter_keys =
    formname === employee_component_name
      ? employee_table_filter_keys
      : formname === leave_type_component_name
      ? leave_type_table_filter_keys
      : formname === attendance_approval_component_name
      ? attendance_approval_table_filter_keys
      : {};

  const tabOptions = filterOptions
    ? filterOptions.map((obj, idx) => {
        return {
          ...obj,
          idx: idx + 2,
        };
      })
    : [];

  const [activeTab, setActiveTab] = useState(1);
  const [dataList, setDataList] = useState([]);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);
  const [modal, setModal] = useState(false);
  const [modal_list, setmodal_list] = useState(false);
  // const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showContainer, setShowContainer] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const tog_list = () => {
    setmodal_list(!modal_list);
  };
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(new Date(currentYear, 0, 1));

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".dataCheckBox:not(:disabled)");
    const checkboxesArray = Array.from(ele);

    checkboxesArray.forEach((checkbox) => {
      if (checkall.checked) {
        checkbox.checked = true;
        setSelectedGroupIds((prevIds) => [
          ...prevIds,
          parseInt(checkbox.value),
        ]);
      } else {
        checkbox.checked = false;
      }
    });

    deleteCheckbox();
    approveRejectCheckbox();
  }, []);

  function generateOptions(maxValue, selectedValue) {
    let options = "";
    for (let i = 0; i < maxValue; i++) {
      const selected = selectedValue && i === selectedValue ? "selected" : "";
      options += `<option value="${i}" ${selected}>${i}</option>`;
    }
    return options;
  }

  const handleApproval = async (orderData) => {
    let employee_fname =
      EmployeeData.find((e) => e.id === orderData.employee_id)?.fname || "";

    const totalSeconds =
      orderData.final_paid_hr_in_seconds === 0
        ? orderData.work_schedule_duration_without_break
        : orderData.final_paid_hr_in_seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let selectedHour = hours;
    let selectedMinute = minutes;
    let textValue;

    let content =
      formname === leave_approval_component_name ||
      formname === leave_pending_table
        ? `<span>Are You Sure to <strong style='color:green'>Accept </strong> Leave To <strong style='color:#7066e0'>  ${employee_fname}</strong>  on  ${orderData.start} to  ${orderData.end} </span> `
        : orderData.is_present === false
        ? `<span>Oops, <strong style='color:#7066e0'>${employee_fname}</strong> didn't show up on <strong style='color:grey'>${format(
            new Date(orderData.date),
            "dd MMM, yyyy"
          )}</strong>, Ready to regularize and approve?</span>
          <div>
            ${
              formname === attendance_approval_component_name ||
              formname === attendance_pending_table
                ? `<span style="display: inline-block; margin-top: 20px;">
                  <label for="select-hour" style="display: inline-block; margin-right: 5px;">Edit Paid Hr:</label>      
                  <b className="mt-2 me-1 ms-2">H</b>
                  <Select id="select-hour" class="swal2-input" style="display: inline-block; width: auto; margin-left: 5px;">
                    ${generateOptions(24, hours)}
                  </Select>
                  <b className="mt-2 me-1 ms-2">M</b>
                  <Select id="select-minute" class="swal2-input" style="display: inline-block; width: auto; margin-left: 5px;">
                    ${generateOptions(60, minutes)}
                  </Select>
                </span>`
                : undefined
            }
          </div>`
        : `<span><strong style='color:#7066e0'>${employee_fname}</strong> missed checkout on <strong style='color:grey'>${format(
            new Date(orderData.date),
            "dd MMM, yyyy"
          )}, Would you like to regularize?</span>
          <div>
            ${
              formname === attendance_approval_component_name ||
              formname === attendance_pending_table
                ? `<span style="display: inline-block; margin-top: 20px;">
                  <label for="select-hour" style="display: inline-block; margin-right: 5px;">Edit Paid Hr:</label>      
                  <b className="mt-2 me-1 ms-2">H</b>
                  <Select id="select-hour" class="swal2-input" style="display: inline-block; width: auto; margin-left: 5px;">
                    ${generateOptions(24, hours)}
                  </Select>
                  <b className="mt-2 me-1 ms-2">M</b>
                  <Select id="select-minute" class="swal2-input" style="display: inline-block; width: auto; margin-left: 5px;">
                    ${generateOptions(60, minutes)}
                  </Select>
                </span>`
                : undefined
            }
          </div>`;
    let btnText = "Yes, Approve";

    Swal.fire({
      title: "Confirmation",
      html: content,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      input:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? "text"
          : undefined,

      inputPlaceholder:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? "Enter reason"
          : undefined,
      inputAttributes:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? {
              style:
                "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
            }
          : undefined,
      inputValidator:
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
          ? (value) => {
              if (!value) {
                return "Reason is required!";
              }
            }
          : undefined,
    }).then(async (result) => {
      if (
        formname === leave_approval_component_name ||
        formname === leave_pending_table
      ) {
        if (result.value) {
          const data = {
            leave_application_id_list: [orderData.id],
            status: 2,
            reason_from_authority: "",
          };

          dispatch(editLeaveApproval(data));

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (
        formname === attendance_approval_component_name ||
        formname === attendance_pending_table
      ) {
        if (result.value) {
          selectedHour = document.getElementById("select-hour").value;
          selectedMinute = document.getElementById("select-minute").value;

          const finalHr =
            parseInt(selectedHour) * 3600 + parseInt(selectedMinute) * 60;

          if (finalHr === 0) {
            toast.error("Final Hour Can't Be Zero");
          } else {
            const data = {
              id: [orderData.id],
              hr_status: 2,
              notes: result.value,
              final_paid_hr_in_seconds: finalHr,
              is_single_approval: true,
            };

            const Api = await PostApi(
              "attendance/approve-or-reject/",
              data,
              false
            );
            if (Api.status && Api.status === 200) {
              dispatch(updateAttendanceApprovalData(data));
              toast.success(Api?.data?.message);
            } else {
              toast.error(Api?.data?.message || Api?.data?.detail);
            }
          }
        }
      } else {
        toast.error("Something Went Wrong");
      }
    });
  };

  const handleReject = async (orderData) => {
    let employee_fname =
      EmployeeData.find((e) => e.id === orderData.employee_id)?.fname || "";
    // const unitLabel = orderData.unit === 1 ? 'day' : 'hour';

    let content =
      formname === leave_approval_component_name ||
      formname === leave_pending_table
        ? `<span>Are You Sure to <strong style='color:red'>Reject</strong> Leave To <strong style='color:#7066e0'> ${employee_fname} </strong> on ${orderData.start} to  ${orderData.end} </span>`
        : `<span>Confirm Action : <strong style='color:red'>Reject</strong> pending status and mark <strong style='color:#7066e0'>  ${employee_fname}</strong>  as absent on   <strong style='color:grey'>${format(
            new Date(orderData.date),
            "dd MMM, yyyy"
          )}</strong></span> `;
    let btnText = "Yes, Reject";

    Swal.fire({
      title: "Confirmation",
      html: content,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-danger",
      cancelButtonClass: "btn btn-secondary",
      input: "text",
      inputPlaceholder: "Enter reason for rejection",
      inputAttributes: {
        style:
          "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
      },
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    }).then(async (result) => {
      if (
        formname === leave_approval_component_name ||
        formname === leave_pending_table
      ) {
        if (result.value) {
          const data = {
            leave_application_id_list: [orderData.id],
            status: 3,
            reason_from_authority: result.value,
          };

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (
        formname == attendance_approval_component_name ||
        formname === attendance_pending_table
      ) {
        if (result.value) {
          const data = {
            id: [orderData.id],
            final_paid_hr_in_seconds: 0,
            hr_status: 4,
            notes: result.value,
            is_single_approval: false,
          };
          const Api = await PostApi(
            "attendance/approve-or-reject/",
            data,
            false
          );
          if (Api.status && Api.status === 200) {
            dispatch(updateAttendanceApprovalData(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else {
        toast.error("Something Went Wrong");
      }
    });
  };

  const handleBulkApproval = async () => {
    let content =
      formname === leave_approval_component_name
        ? "Are You Sure to <strong style='color:green'>Accept </strong>  Leave To Selected Employees?"
        : "Are you Sure to <strong style='color:green'>Approve</strong> Attendance To Selected Employees?";
    let btnText = "Yes, Approve";

    Swal.fire({
      title: "Confirmation",
      html: content,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      input:
        formname === attendance_approval_component_name ? "text" : undefined,
      inputPlaceholder:
        formname === attendance_approval_component_name
          ? "Enter reason for rejection"
          : undefined,
      inputAttributes:
        formname === attendance_approval_component_name
          ? {
              style:
                "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
            }
          : undefined,
      inputValidator:
        formname === attendance_approval_component_name
          ? (value) => {
              if (!value) {
                return "Reason is required!";
              }
            }
          : undefined,
    }).then(async (result) => {
      if (formname === leave_approval_component_name) {
        if (result.value) {
          const data = {
            leave_application_id_list: selectedGroupIds,
            status: 2,
            reason_from_authority: "",
          };

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (formname === attendance_approval_component_name) {
        if (result.value) {
          const data = {
            id: selectedGroupIds,
            hr_status: 2,
            notes: result.value,
            final_paid_hr_in_seconds: 0,
            is_single_approval: false,
          };
          const Api = await PostApi(
            "attendance/approve-or-reject/",
            data,
            false
          );
          if (Api.status && Api.status === 200) {
            dispatch(updateAttendanceApprovalData(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else {
        toast.error("Something Went Wrong");
      }
    });
  };
  const handleBulkReject = async () => {
    let content =
      formname === leave_approval_component_name
        ? "Are You Sure to <strong style='color:red'>Reject</strong> Leave To Selected Employees?"
        : "Are You Sure to <strong style='color:red'>Reject</strong> Attendance To Selected Employees?";
    let btnText = "Yes, Reject";

    Swal.fire({
      title: "Confirmation",
      html: content,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: btnText,
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-danger",
      cancelButtonClass: "btn btn-secondary",
      input: "text",
      inputPlaceholder: "Enter reason for rejection",
      inputAttributes: {
        style:
          "margin: 10px auto; padding: 10px; border-radius: 5px; display: block;",
      },
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    }).then(async (result) => {
      if (formname === leave_approval_component_name) {
        if (result.value) {
          const data = {
            leave_application_id_list: selectedGroupIds,
            status: 3,
            reason_from_authority: result.value,
          };

          const Api = await PostApi("leave/approve-or-reject/", data, false);
          if (Api.status && Api.status === 200) {
            dispatch(editLeaveApproval(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else if (formname === attendance_approval_component_name) {
        if (result.value) {
          const data = {
            id: selectedGroupIds,
            hr_status: 4,
            notes: result.value,
            final_paid_hr_in_seconds: 0,
            is_single_approval: false,
          };
          const Api = await PostApi(
            "attendance/approve-or-reject/",
            data,
            false
          );
          if (Api.status && Api.status === 200) {
            dispatch(updateAttendanceApprovalData(data));
            toast.success(Api?.data?.message);
          } else {
            toast.error(Api?.data?.message || Api?.data?.detail);
          }
        }
      } else {
        toast.error("Something Went Wrong!");
      }
    });
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };
  const handleActiveStatus = (orderData) => {
    let orderInfo = {
      text: orderData?.is_active === true ? "Deactivate" : "Activate",
      icon: orderData?.is_active === true ? "warning" : "success",
      confirmBtnColor: orderData?.is_active === true ? "#f06548" : "#0ab39c",
      statusCode: orderData?.is_active === true ? 2 : 1,
      statusToChange: orderData?.is_active === true ? false : true,
    };

    Swal.fire({
      title: orderInfo.text,
      text: ` Are you sure to ${orderInfo?.text} Employee (${orderData.fname} ${orderData.lname})?`,
      icon: `${orderInfo?.icon}`,
      showCancelButton: true,
      confirmButtonColor: `${orderInfo?.confirmBtnColor}`,
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, ${orderInfo?.text}`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        dispatch(setLoaderVisible(true));
        const payload = {
          emp_uuid: orderData?.emp_uuid,
          status: orderInfo?.statusCode,
        };

        const Api = await PostApi(
          "employee/activate-or-deactivate-employee/",
          payload,
          false
        );

        if (!!Api.status && Api.status === 200) {
          dispatch(
            setEmployeeActiveStatus({
              id: orderData.id,
              is_active: orderInfo?.statusToChange,
            })
          );

          const thisMetaData = GetLocalStorageData("employee");
          let updated_md = [...thisMetaData].map((d) => {
            if (d.id === orderData.id) {
              return {
                ...d,
                is_active: orderInfo?.statusToChange,
              };
            } else {
              return d;
            }
          });

          let GlobalMetaData =
            localStorage.getItem("lint_hr_globaldata") !== null
              ? JSON.parse(localStorage.getItem("lint_hr_globaldata"))
              : {};
          GlobalMetaData["employee"] = updated_md;
          localStorage.setItem(
            "lint_hr_globaldata",
            JSON.stringify(GlobalMetaData)
          );

          dispatch(setLoaderVisible(false));
          toast.success(Api?.data?.message);
        } else {
          dispatch(setLoaderVisible(false));
          toast.error(Api?.data?.message || Api?.data?.detail);
        }
      }
    });
  };

  const handleResetPassword = (orderData) => {
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
        <div class="position-relative">
        <label for="adminPassword" class="label-lc">Admin Password (${fname} ${lname})</label>
        <div class="input-group">
          <input type="password" id="adminPassword" class="form-control swal2-input" placeholder="Enter Admin Password" required>
        </div>
      </div>
      <label for="newPassword" class="label-lc">New Password (${orderData.fname} ${orderData.lname})</label>
      <div class="input-group">
        <input type="password" id="newPassword" class="form-control swal2-input" placeholder="Enter New Password" required>
      </div>
      <label for="confirmPassword" class="label-lc">Confirm Password (${orderData.fname} ${orderData.lname})</label>
      <div class="input-group">
        <input type="password" id="confirmPassword" class="form-control swal2-input" placeholder="Enter Confirm Password" required>    

      </div>
      
      
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
        const pattern =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
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
        if (!pattern.test(newPasswordValue)) {
          Swal.showValidationMessage(
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
          );
          return false;
        }
        const adminPassword = document.getElementById("adminPassword");
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword =
          document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage("Passwords do not match");
        }

        return { adminPassword, newPassword, confirmPassword };
      },
      didOpen: () => {
        // Add event listener to the eye buttons for each password input
        const passwordToggleButtons =
          document.querySelectorAll(".password-toggle");
        passwordToggleButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const passwordInput = button.previousElementSibling;
            togglePasswordVisibility(passwordInput);
          });
        });

        // Focus on the Admin Password input field
        const adminPasswordInput = document.getElementById("adminPassword");
        if (adminPasswordInput) {
          adminPasswordInput.focus();
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { adminPassword, newPassword, confirmPassword } = result.value;
        const data = {
          admin_password: adminPassword.value,
          emp_uuid: orderData.emp_uuid,
          new_password: newPassword,
          confirm_password: confirmPassword,
        };

        const Api = await PostApi("employee/reset-password/", data, false);
        if (Api.status && Api.status === 200) {
          Swal.fire(
            "Password Reset!",
            "Password has been reset successfully.",
            "success"
          );
        } else {
          toast.error(Api?.data?.message);
        }
      }
    });
  };
  function togglePasswordVisibility(passwordInput) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  }
  // Column
  const initialColumns = [
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
        const orderDataChecked = cellProps.row.original.id;
        const orderData = cellProps.row.original;
        return (
          <input
            type="checkbox"
            className="dataCheckBox form-check-input"
            disabled={
              (formname === leave_approval_component_name &&
                orderData?.status !== 1) ||
              (formname === attendance_approval_component_name &&
                orderData?.hr_status !== 3)
            }
            id={`checkbox-${cellProps.row.original.id}`}
            value={cellProps.row.original.id}
            onClick={(event) => {
              const isChecked = event.target.checked;

              if (isChecked) {
                setSelectedGroupIds((prevIds) => [
                  ...prevIds,
                  orderDataChecked,
                ]);
              } else {
                setSelectedGroupIds((prevIds) =>
                  prevIds.filter((id) => id !== orderDataChecked)
                );
              }

              deleteCheckbox(`checkbox-${cellProps.row.original.id}`);
              approveRejectCheckbox(`checkbox-${cellProps.row.original.id}`);
            }}
          />
        );
      },
      id: "#",
      is_action: false,
    },
    {
      Header: "Action",
      Cell: (cellProps) => {
        const orderData = cellProps.row.original;
        if (
          formname &&
          (formname === leave_approval_component_name ||
            formname === leave_pending_table) &&
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
        } else if (
          formname &&
          (formname === attendance_approval_component_name ||
            formname === attendance_pending_table) &&
          orderData.hr_status === 3
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
                  {!!orderData && (
                    <DropdownItem
                      onClick={() => {
                        handleActiveStatus(orderData);
                      }}
                    >
                      <i className="ri-shut-down-line"></i>{" "}
                      {orderData?.is_active === true
                        ? "Deactivate"
                        : "Activate"}
                    </DropdownItem>
                  )}
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
              {orderData.status === 2 ||
              orderData.status === 3 ||
              orderData.hr_status === 2 ||
              orderData.hr_status === 4 ? (
                <li className="list-inline-item">
                  <Link to="#" className="text-primary d-inline-block">
                    <i className="ri-eye-fill fs-16"></i>
                  </Link>
                </li>
              ) : (
                <>
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
                </>
              )}
            </ul>
          );
        }
      },
      is_action: true,
    },
  ];

  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showEditBtn, setShowEditBtn] = useState(false);
  const [showAllLeaveApprovalBtn, setShowAllLeaveApprovalBtn] = useState(false);
  const [showTeamLeaveApprovalBtn, setShowTeamLeaveApprovalBtn] =
    useState(false);
  const [showAllAttendanceApprovalBtn, setShowAllAttendanceApprovalBtn] =
    useState(false);
  const [showTeamAttendanceApprovalBtn, setShowTeamAttendanceApprovalBtn] =
    useState(false);
  const firstEffectExecutedRef = useRef(false);
  useEffect(() => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data")
    );
    if (
      formname === leave_approval_component_name ||
      attendance_approval_component_name
    ) {
      setShowAllLeaveApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_ALL_LEAVE_ACCESS_KEY
        )
      );
      setShowTeamLeaveApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY
        )
      );

      setShowAllAttendanceApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_ALL_ATTENDANCE_ACCESS_KEY
        )
      );
      setShowTeamAttendanceApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY
        )
      );
    }
    firstEffectExecutedRef.current = true;
    CheckCreateAccess(profile_data, formname);
    CheckEditAccess(profile_data, formname);
  }, [formname]);

  useEffect(() => {
    if (
      formname === attendance_approval_component_name ||
      formname === leave_approval_component_name
    ) {
      if (firstEffectExecutedRef.current) {
        if (currentApprovalComponent === "attendance_approval_component_name") {
          approvalEmployeeTypeFilter === 0 && showAllAttendanceApprovalBtn
            ? setShowEditBtn(true)
            : approvalEmployeeTypeFilter === 1 && showTeamAttendanceApprovalBtn
            ? setShowEditBtn(true)
            : setShowEditBtn(false);
        }
        if (currentApprovalComponent === "leave_approval_component_name") {
          approvalEmployeeTypeFilter === 0 && showAllLeaveApprovalBtn
            ? setShowEditBtn(true)
            : approvalEmployeeTypeFilter === 1 && showTeamLeaveApprovalBtn
            ? setShowEditBtn(true)
            : setShowEditBtn(false);
        }
      }
    }
    if (
      formname === attendance_pending_table ||
      formname === leave_pending_table
    ) {
      if (firstEffectExecutedRef.current) {
        if (dashPendingApprovalCom === "attendance_pending_table") {
          showTeamAttendanceApprovalBtn === true
            ? setShowEditBtn(true)
            : setShowEditBtn(false);
        }
        if (dashPendingApprovalCom === "leave_pending_table") {
          showTeamLeaveApprovalBtn === true
            ? setShowEditBtn(true)
            : setShowEditBtn(false);
        }
      }
    }
  }, [
    currentApprovalComponent,
    showAllAttendanceApprovalBtn,
    showTeamAttendanceApprovalBtn,
    showAllLeaveApprovalBtn,
    showTeamLeaveApprovalBtn,
    firstEffectExecutedRef.current,
    approvalEmployeeTypeFilter,
    dashPendingApprovalCom,
  ]);

  const CheckCreateAccess = (profile_data, thisFormName) => {
    if (
      !!profile_data &&
      !!profile_data.is_admin &&
      profile_data?.is_admin === true
    ) {
      setShowCreateBtn(true);
    } else if (!!profile_data && !!profile_data.permission_list) {
      if (!!thisFormName) {
        if (
          (thisFormName === employee_component_name &&
            profile_data.permission_list.includes(
              CREATE_EMPLOYEE_ACCESS_KEY
            )) ||
          (thisFormName === custom_field_component_name &&
            profile_data.permission_list.includes(
              CREATE_CUSTOM_FIELD_ACCESS_KEY
            ))
        ) {
          setShowCreateBtn(true);
        } else if (thisFormName === leave_application_component_name) {
          setShowCreateBtn(true);
        }
      }
    } else {
      setShowCreateBtn(true);
    }
  };

  const CheckEditAccess = (profile_data, thisFormName) => {
    if (
      !!profile_data &&
      !!profile_data.is_admin &&
      profile_data?.is_admin === true
    ) {
      setShowEditBtn(true);
    } else if (!!profile_data && !!profile_data.permission_list) {
      if (!!thisFormName) {
        if (
          (thisFormName === employee_component_name &&
            profile_data.permission_list.includes(EDIT_EMPLOYEE_ACCESS_KEY)) ||
          (thisFormName === custom_field_component_name &&
            profile_data.permission_list.includes(EDIT_CUSTOM_FIELD_ACCESS_KEY))
        ) {
          setShowEditBtn(true);
        } else if (thisFormName === leave_application_component_name) {
          setShowEditBtn(true);
        }
      }
    } else {
      setShowEditBtn(false);
    }
  };

  const [tableColumn, setTableColumn] = useState(initialColumns);

  useEffect(() => {
    if (showEditBtn === true) {
      const newColumns = [...initialColumns];
      newColumns.splice(1, 0, ...additionalColumn);
      setTableColumn(newColumns);
    } else {
      const newColumns = [...additionalColumn];
      // newColumns.splice(1, 1, ...additionalColumn);
      setTableColumn(newColumns);
    }
  }, [showEditBtn]);

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
  const [selectedCheckBoxApproveReject, setSelectedCheckBoxApproveReject] =
    useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);
  const [selectApproveReject, setSelectApproveReject] = useState(false);

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

  const approveReject = () => {
    const checkall = document.getElementById("checkBoxAll");
    selectedCheckBoxApproveReject.forEach((element) => {
      setTimeout(() => {
        toast.clearWaitingQueue();
      }, 3000);
    });
    checkall.checked = false;
    setSelectApproveReject(false);
  };

  const deleteCheckbox = (id) => {
    const ele = document.querySelectorAll(".dataCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const approveRejectCheckbox = (id) => {
    const ele = document.querySelectorAll(".dataCheckBox:checked");
    ele.length > 0
      ? setSelectApproveReject(true)
      : setSelectApproveReject(false);
    setSelectedCheckBoxApproveReject(ele);
  };

  const handleDeleteData = (data) => {};

  // CUSTOM FORM

  const handleCreateAndUpdate = ($id, table_obj) => {
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
            {formname &&
              formname !== attendance_pending_table &&
              formname !== leave_pending_table && (
                <CardHeader className="bdata-0">
                  <Row className="align-items-center gy-3">
                    <div className="col-sm">
                      {formname &&
                        formname !== attendance_pending_table &&
                        formname !== leave_pending_table && (
                          <h5
                            className="card-title mb-0"
                            style={{ textTransform: "capitalize" }}
                          >
                            {formname.split("_").join(" ")}
                          </h5>
                        )}
                      {/* {formname && formname === holiday_component_name && (
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
                  )} */}
                    </div>
                    <div className="col-sm-auto">
                      <div className="d-flex gap-1 flex-wrap">
                        {formname &&
                          formname !== leave_approval_component_name &&
                          formname !== attendance_approval_component_name &&
                          formname !== attendance_pending_table &&
                          formname !== leave_pending_table &&
                          showCreateBtn && (
                            <button
                              type="button"
                              className="btn btn-success add-btn"
                              id="create-btn"
                              style={{ textTransform: "capitalize" }}
                              onClick={() => {
                                handleCreateAndUpdate(0);
                              }}
                            >
                              <i className="ri-add-line align-bottom me-1"></i>{" "}
                              Create {formname.split("_").join(" ")}
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
                          {formname &&
                            formname !== attendance_pending_table &&
                            formname !== leave_pending_table && (
                              <button
                                type="button"
                                className="btn btn-info"
                                onClick={() => setIsExportCSV(true)}
                              >
                                <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                                Export
                              </button>
                            )}{" "}
                          {isMultiDeleteButton && (
                            <div>
                              <button
                                className="btn btn-soft-danger"
                                onClick={() => setDeleteModalMulti(true)}
                              >
                                <i className="ri-delete-bin-2-line"></i>
                              </button>{" "}
                              {/* {formname === leave_approval_component_name && (
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
                          )} */}
                            </div>
                          )}
                          {selectApproveReject &&
                            (formname === leave_approval_component_name ||
                              formname ===
                                attendance_approval_component_name) && (
                              <div>
                                {formname ===
                                  attendance_approval_component_name &&
                                  showAllAttendanceApprovalBtn &&
                                  showTeamAttendanceApprovalBtn && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn btn-success add-btn"
                                        id="bulk-approve-btn"
                                        onClick={() => handleBulkApproval()}
                                      >
                                        <i className="ri-check-line fs-16"></i>{" "}
                                        Bulk Approve
                                      </button>{" "}
                                      <button
                                        type="button"
                                        className="btn btn-danger add-btn"
                                        id="bulk-reject-btn"
                                        onClick={() => handleBulkReject()}
                                      >
                                        <i className="ri-close-line fs-16"></i>{" "}
                                        Bulk Reject
                                      </button>{" "}
                                    </>
                                  )}
                                {formname === leave_approval_component_name &&
                                  showAllLeaveApprovalBtn &&
                                  showTeamLeaveApprovalBtn && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn btn-success add-btn"
                                        id="bulk-approve-btn"
                                        onClick={() => handleBulkApproval()}
                                      >
                                        <i className="ri-check-line fs-16"></i>{" "}
                                        Bulk Approve
                                      </button>{" "}
                                      <button
                                        type="button"
                                        className="btn btn-danger add-btn"
                                        id="bulk-reject-btn"
                                        onClick={() => handleBulkReject()}
                                      >
                                        <i className="ri-close-line fs-16"></i>{" "}
                                        Bulk Reject
                                      </button>{" "}
                                    </>
                                  )}
                              </div>
                            )}
                          {/* {selectApproveReject &&
                        formname === attendance_approval_component_name && (
                          <div>
                            <button
                              type="button"
                              className="btn btn-success add-btn"
                              id="bulk-approve-btn"
                              onClick={() => handleBulkApproval()}
                            >
                              <i className="ri-check-line fs-16"></i> Bulk
                              Approve
                            </button>{" "}
                            <button
                              type="button"
                              className="btn btn-danger add-btn"
                              id="bulk-reject-btn"
                              onClick={() => handleBulkReject()}
                            >
                              <i className="ri-close-line fs-16"></i> Bulk
                              Reject
                            </button>{" "}
                          </div>
                        )} */}
                        </div>
                      </div>
                    </div>
                  </Row>
                </CardHeader>
              )}

            <CardBody className="pt-0">
              <div>
                <Nav
                  className="nav-tabs nav-tabs-custom nav-success"
                  role="tablist"
                >
                  {formname === attendance_pending_table ? null : formname ===
                    leave_pending_table ? null : (
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
                        <i className="ri-store-2-fill me-1 align-bottom"></i>{" "}
                        All Datas
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
                  )}

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
                    columns={tableColumn}
                    data={
                      (search.trim().length
                        ? dataList
                            .filter((obj) => {
                              return Object.entries(table_filter_keys).every(
                                ([key, value]) => {
                                  // Exclude keys with value 0 from filtering
                                  if (value === 0) {
                                    return true; // Skip filtering for keys with value 0
                                  }

                                  // Check if the key exists in the employee object and the values match
                                  return (
                                    obj[key] !== undefined &&
                                    (Array.isArray(obj[key])
                                      ? obj[key].includes(value)
                                      : obj[key] === value)
                                  );
                                }
                              );
                            })
                            .filter((d) =>
                              Object.values(d).some(
                                (value) =>
                                  typeof value === "string" &&
                                  value
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                              )
                            )
                        : dataList.filter((obj) => {
                            return Object.entries(table_filter_keys).every(
                              ([key, value]) => {
                                // Exclude keys with value 0 from filtering
                                if (value === 0) {
                                  return true; // Skip filtering for keys with value 0
                                }

                                // Check if the key exists in the obj object and the values match
                                return (
                                  obj[key] !== undefined &&
                                  (Array.isArray(obj[key])
                                    ? obj[key].includes(value)
                                    : obj[key] === value)
                                );
                              }
                            );
                          })) || []
                    }
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
                    showInfo={true}
                  />
                ) : (
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
