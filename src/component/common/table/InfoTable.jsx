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

import Select from "react-select";
import dayjs from "dayjs";
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
import * as Yup from "yup";
import "../../../common/./css/lc_style.css";
import { ExportSampleData } from "../../../common/js/ExportSampleData";
import {
  attendance_approval_component_name,
  component_list_for_import_btn_access,
  employee_component_name,
  work_schedule_component_name,
  holiday_component_name,
  leave_approval_component_name,
  leave_type_component_name,
  attendance_pending_table,
  leave_pending_table,
  leave_application_component_name,
  custom_field_component_name,
  task_list_component_name,
  project_component_name,
  client_component_name,
  status_component_name,
  priorities_component_name,
  custom_status_form_component_name,
  role_component_name,
} from "../../../common/constant/Constants";
import { removeProject } from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import { removeClient } from "../../../redux/reducers/ChildReducer/ClientReducer";
import { removeTask } from "../../../redux/reducers/ChildReducer/TaskReducer";
import {
  CREATE_CLIENT_ACCESS_KEY,
  EDIT_CLIENT_ACCESS_KEY,
  CREATE_EMPLOYEE_ACCESS_KEY,
  CREATE_CUSTOM_FIELD_ACCESS_KEY,
  EDIT_EMPLOYEE_ACCESS_KEY,
  EDIT_CUSTOM_FIELD_ACCESS_KEY,
  CREATE_ROLES_ACCESS_KEY,
  EDIT_ROLES_ACCESS_KEY,
  APPROVE_REJECT_HIERARCHY_LEAVE_ACCESS_KEY,
  APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY,
  APPROVE_REJECT_HIERARCHY_ATTENDANCE_ACCESS_KEY,
  APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY,
} from "../../../common/constant/RoleConstants";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { PostApi } from "../../../common/api/PostApi";
import { editLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { updateAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { setTableDataReducer } from "../../../redux/reducers/ChildReducer/TableDataReducer";
import { Api } from "../../../common/api/Api";
import {
  editEmployee,
  setEmployeeActiveStatus,
} from "../../../redux/reducers/ChildReducer/EmployeeReducer";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import {
  setCurrentApprovalComponent,
  setDashPendingApprovalCom,
} from "../../../redux/reducers/ChildReducer/ApprovalComponentReducer";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import TableSkeleton from "../skeleton/TableSkeloton";
import { DeleteApi } from "../../../common/api/DeleteApi";
import { editLeaveApplication } from "../../../redux/reducers/ChildReducer/LeaveApplyReducer";
import {
  editHoliday,
  removeHoliday,
} from "../../../redux/reducers/ChildReducer/HolidayReducer";
import { removeLeaveType } from "../../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { RemoveLocalStorageData } from "../../../meta/RemoveLocalStorageData";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { setStatus } from "../../../redux/reducers/ChildReducer/StatusReducer";
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
  initialActiveTab,
  onChangeLeave, // ✅ ADD THIS
  ...props
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
    task_list_filter_keys,
    leave_type_table_filter_keys,
    attendance_approval_table_filter_keys,
  } = useSelector((state) => state.TableFilterReducer);

  const table_filter_keys =
    formname === employee_component_name
      ? employee_table_filter_keys
      : formname === task_list_component_name
        ? task_list_filter_keys
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
  // ✅ Status table: id 1 always first, id 3 always last, rest by `order`
  const sortedTableData = useMemo(() => {
    if (formname !== status_component_name) return tabledata || [];

    const list = tabledata || [];
    const firstItem = list.filter((d) => d.id === 1);
    const lastItem = list.filter((d) => d.id === 3);
    const middle = list
      .filter((d) => d.id !== 1 && d.id !== 3)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return [...firstItem, ...middle, ...lastItem];
  }, [tabledata, formname]);
  const [activeTab, setActiveTab] = useState(
    !!initialActiveTab ? initialActiveTab : 1,
  );

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
  const [isLoading, setIsLoading] = useState(true);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderList, setReorderList] = useState([]);

  const getValidColor = (color) => {
    const option = new Option();
    option.style.color = color;

    return option.style.color ? color : "#000000";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setDataList([]);
      } catch (error) {
        console.error(error);
        setDataList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteHandler = async (id) => {
    let url = "";
    let entityName = "";
    let storageKey = "";
    let removeAction = null;

    if (formname === project_component_name) {
      url = "/projects/";
      entityName = "Project";
      storageKey = "projects";
      removeAction = removeProject;
    } else if (formname === client_component_name) {
      url = "/clients/";
      entityName = "Client";
      storageKey = "clients";
      removeAction = removeClient;
    } else if (formname === task_list_component_name) {
      url = "/task/";
      entityName = "Task";
      storageKey = "tasks";
      removeAction = removeTask;
    } else {
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${entityName}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await Api.delete(url, {
        data: { id },
      });

      Swal.close();

      // Redux Update
      dispatch(removeAction(id));

      // LocalStorage Update
      RemoveLocalStorageData(storageKey, id);

      await Swal.fire({
        title: "Deleted!",
        text: response?.data?.message || `${entityName} Deleted Successfully`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      Swal.close();

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          `Failed to delete ${entityName}.`,
        icon: "error",
        confirmButtonColor: "#d33",
      });

      console.error(`${entityName} Delete Error:`, error);
    }
  };

  const tog_list = () => {
    setmodal_list(!modal_list);
  };
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(new Date(currentYear, 0, 1));

  // Checked All
  const checkedAll = useCallback((e) => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".dataCheckBox:not(:disabled)");
    const checkboxesArray = Array.from(ele);

    checkboxesArray.forEach((checkbox) => {
      if (e.target.checked) {
        checkbox.checked = true;
        setSelectedGroupIds((prevIds) => [
          ...prevIds,
          parseInt(checkbox.value),
        ]);
      } else {
        checkbox.checked = false;
        setSelectedGroupIds([]);
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

  const resetCheckBox = () => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".dataCheckBox:not(:disabled)");
    const checkboxesArray = Array.from(ele);
    checkboxesArray.forEach((checkbox) => {
      checkbox.checked = false;
      setSelectedGroupIds([]);
    });
    deleteCheckbox();
    approveRejectCheckbox();
  };

  const handleApproval = async (orderData) => {
    let employee_first_name =
      EmployeeData.find((e) => e.id === orderData.employee_id)?.first_name ||
      "";

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
        ? `<span>Are You Sure to <strong style='color:green'>Accept </strong> ${orderData.leave_type_name} To <strong style='color:#7066e0'>  ${employee_first_name}</strong>  on  ${orderData.start} to  ${orderData.end} </span> `
        : orderData.is_present === false
          ? `<span>Oops, <strong style='color:#7066e0'>${employee_first_name}</strong> didn't show up on <strong style='color:grey'>${format(
              new Date(orderData.date),
              "dd MMM, yyyy",
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
          : `<span><strong style='color:#7066e0'>${employee_first_name}</strong> missed checkout on <strong style='color:grey'>${format(
              new Date(orderData.date),
              "dd MMM, yyyy",
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
            resetCheckBox();
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
              false,
            );
            if (Api.status && Api.status === 200) {
              resetCheckBox();
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
    let employee_first_name =
      EmployeeData.find((e) => e.id === orderData.employee_id)?.first_name ||
      "";
    // const unitLabel = orderData.unit === 1 ? 'day' : 'hour';

    let content =
      formname === leave_approval_component_name ||
      formname === leave_pending_table
        ? `<span>Are You Sure to <strong style='color:red'>Reject</strong> ${orderData.leave_type_name} To <strong style='color:#7066e0'> ${employee_first_name} </strong> on ${orderData.start} to  ${orderData.end} </span>`
        : `<span>Confirm Action : <strong style='color:red'>Reject</strong> pending status and mark <strong style='color:#7066e0'>  ${employee_first_name}</strong>  as absent on   <strong style='color:grey'>${format(
            new Date(orderData.date),
            "dd MMM, yyyy",
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
            resetCheckBox();
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
            false,
          );
          if (Api.status && Api.status === 200) {
            resetCheckBox();
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
          ? "Enter reason for Bulk Approve"
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
            resetCheckBox();
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
            false,
          );
          if (Api.status && Api.status === 200) {
            resetCheckBox();
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
            resetCheckBox();
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
            false,
          );
          if (Api.status && Api.status === 200) {
            resetCheckBox();
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

  const handleActionClick = async (orderData) => {
    const result = await Swal.fire({
      title: "Cancel Leave Request",
      html: "Are you sure you want to <b>raise a cancel leave request?</b>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, raise request!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await PostApi(
        `leave/raise-cancel-request/`,
        { id: orderData.id },
        false,
      );

      console.log("CANCEL REQUEST RESPONSE:", Api);

      // ✅ Check success
      if (
        Api?.status === 200 &&
        Api?.data?.data?.leave_cancellation_details?.status === 1
      ) {
        // ✅ Update Redux (same pattern as edit)
        dispatch(editLeaveApplication(Api?.data?.data));

        // ✅ Toast
        toast.success(Api?.data?.message || "Cancel request raised");

        // ✅ SweetAlert
        await Swal.fire(
          "Request Sent!",
          Api?.data?.message || "Cancel request raised successfully",
          "success",
        );
      } else {
        toast.error(
          Api?.data?.message || Api?.data?.detail || "Request failed",
        );
      }
    } catch (error) {
      console.error("CANCEL REQUEST ERROR:", error);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (orderData) => {
    const result = await Swal.fire({
      title: "Delete Leave Application",
      text: "Are you sure you want to delete this leave application?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await DeleteApi(
        `leave/leave-application/delete/${orderData.id}`,
        false,
      );

      console.log("DELETE RESPONSE:", Api);

      // ✅ API returns { message, data, leave_type_for_employee }
      // ✅ success is determined by status 200 + data.is_deleted === true
      if (Api?.status === 200 && Api?.data?.data?.is_deleted === true) {
        // ✅ Redux: remove deleted item from list
        dispatch(editLeaveApplication(Api?.data?.data));

        // ✅ Toast
        toast.success(Api?.data?.message || "Deleted successfully");

        // ✅ SweetAlert success
        await Swal.fire(
          "Deleted!",
          Api?.data?.message || "Leave Application Deleted Successfully",
          "success",
        );
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail || "Delete failed");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      toast.error("Something went wrong");
    }
  };
  const handleHolidayDelete = async (orderData) => {
    const result = await Swal.fire({
      title: "Delete Holiday",
      text: "Are you sure you want to delete this Holiday?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await DeleteApi(`holiday/delete/${orderData.id}`);

      console.log("DELETE RESPONSE:", Api);

      if (Api?.status === 200) {
        dispatch(removeHoliday(orderData.id));
        RemoveLocalStorageData("holiday", orderData.id);

        toast.success(Api?.data?.message || "Holiday deleted successfully");

        await Swal.fire({
          title: "Deleted!",
          text: Api?.data?.message || "Holiday deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0AB39C",
        });
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);

      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleLeaveTypeDelete = async (leaveTypeData) => {
    const result = await Swal.fire({
      title: "Delete Leave Type",
      text: "Are you sure you want to delete this Leave Type?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const Api = await DeleteApi(
        `leave/leave_type/delete/${leaveTypeData.id}`,
      );

      console.log("DELETE RESPONSE:", Api);

      if (Api?.status === 200) {
        // Update Redux store if applicable
        dispatch(removeLeaveType(leaveTypeData.id));

        // Clear cached data if applicable
        RemoveLocalStorageData("leave_type");

        toast.success(Api?.data?.message || "Leave Type deleted successfully");

        await Swal.fire({
          title: "Deleted!",
          text: Api?.data?.message || "Leave Type deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0AB39C",
        });
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);

      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const handleReorderDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(reorderList);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setReorderList(reordered);
  };

  const openReorderModal = () => {
    const middle = [...(tabledata || [])]
      .filter((d) => d.id !== 1 && d.id !== 3)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setReorderList(middle);
    setShowReorderModal(true);
  };

  const handleSaveReorder = async () => {
    const order_payload = reorderList.map((obj, idx) => ({
      id: obj.id,
      order: idx + 1,
    }));

    const Api = await PostApi("task-status/reorder/", order_payload, false);

    if (Api.status && Api.status === 200) {
      const updatedFull = (tabledata || []).map((obj) => {
        const found = order_payload.find((p) => p.id === obj.id);
        return found ? { ...obj, order: found.order } : obj;
      });
      console.log("uppp", updatedFull);

      dispatch(setStatus(updatedFull));
      SetLocalStorage("task_status", updatedFull, 1);
      toast.success(Api?.data?.message || "Order updated");
      setShowReorderModal(false);
    } else {
      toast.error(Api?.data?.message || "Failed to update order");
    }
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
      text: ` Are you sure to ${orderInfo?.text} Employee (${orderData.first_name} ${orderData.last_name})?`,
      icon: `${orderInfo?.icon}`,
      showCancelButton: true,
      confirmButtonColor: `${orderInfo?.confirmBtnColor}`,
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, ${orderInfo?.text}`,
      // On deactivation, capture the last working day so payroll still pays
      // this employee for the month they worked. Optional — can be left blank.
      ...(orderData?.is_active === true
        ? {
            input: "date",
            inputLabel: "Last working day (optional)",
            inputValue: new Date().toISOString().slice(0, 10),
            inputAttributes: { max: new Date().toISOString().slice(0, 10) },
          }
        : {}),
    }).then(async (result) => {
      if (result.isConfirmed) {
        orderInfo.lastWorkingDay =
          orderData?.is_active === true ? result.value || null : null;
        setActiveInactiveAPIOrderData(orderData);
        setActiveInactiveAPIOrderInfo(orderInfo);
        ActivateOrDeactivate(orderData, orderInfo);
      }
    });
  };

  const [activeInactiveAPIOrderData, setActiveInactiveAPIOrderData] =
    useState(null);
  const [activeInactiveAPIOrderInfo, setActiveInactiveAPIOrderInfo] =
    useState(null);

  const ActivateOrDeactivate = async (orderData, orderInfo) => {
    console.log("ORder Data === ", orderData);
    console.log("ORder Info === ", orderInfo);

    // return false;

    if (!!orderData && !!orderData?.is_active && orderData.is_active === true) {
      DeactivateEmployeeAPI(orderData, orderInfo);
    } else {
      setShowActivateEmpModal(true);
      setActivateEmpName(orderData?.first_name);
      setActivateEmpObj({
        emp_uuid: orderData?.emp_uuid,
        primary_department_id_list: [],
        reporting_manager_id: 0,
      });
    }
  };

  const DeactivateEmployeeAPI = async (orderData, orderInfo) => {
    dispatch(setLoaderVisible(true));

    const payload = {
      emp_uuid: orderData?.emp_uuid,
      status: orderInfo?.statusCode,
      last_working_day: orderInfo?.lastWorkingDay || null,
    };

    const Api = await PostApi(
      "employee/activate-or-deactivate-employee/",
      payload,
      false,
    );

    if (!!Api.status && Api.status === 200) {
      dispatch(
        setEmployeeActiveStatus({
          id: orderData.id,
          is_active: orderInfo?.statusToChange,
        }),
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
        JSON.stringify(GlobalMetaData),
      );

      dispatch(setLoaderVisible(false));
      toast.success(Api?.data?.message);
    } else {
      dispatch(setLoaderVisible(false));
      if (
        !!Api?.data?.is_rep_man_error &&
        Api?.data?.is_rep_man_error === true
      ) {
        console.log(
          "team_employees_to_be_updated = ",
          Api?.data?.team_employees_to_be_updated,
        );

        setRMEmpName(orderData?.first_name);

        setTeamsToBeUpdated(Api?.data?.team_employees_to_be_updated);

        setShowRMModal(true);

        console.log("HEHEHEHEEH");
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    }
  };

  const resetPasswordValidationSchema = Yup.object({
    admin_password: Yup.string().required("Please enter Admin Password"),
    new_password: Yup.string()
      .min(8, "Minimum 8 characters required")
      .max(20, "Maximum 20 characters allowed")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).*$/,
        "Must include uppercase, lowercase, number & special character",
      )
      .required("New Password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("new_password")], "Passwords do not match")
      .required("Please Confirm Password"),
  });

  const handleResetPassword = (orderData) => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data") || "{}",
    );

    const first_name = profile_data?.first_name || "";
    const last_name = profile_data?.last_name || "";

    Swal.fire({
      title: "Reset Password",
      html: `
      <style>
        .label-lc {
          display: block;
          text-align: left;
          width: 90%;
          margin: 8px auto 10px;
          font-weight: 500;
        }

        .password-wrapper {
          position: relative;
          width: 90%;
          margin: 0 auto 5px;
        }

        .password-wrapper .swal2-input {
          width: 100% !important;
          margin: 0 !important;
          padding-right: 45px !important;
          box-sizing: border-box;
        }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 15px;
          transform: translateY(-50%);
          cursor: pointer;
          z-index: 9999;
          color: #6c757d;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-message {
          color: #f06548;
          font-size: 12px;
          text-align: left;
          min-height: 18px;
          width: 90%;
          margin: 2px auto 8px;
        }
      </style>

      <form id="resetPasswordForm">
        <label class="label-lc">
          Admin Password (${first_name} ${last_name})
        </label>
        <div class="password-wrapper">
          <input
            type="password"
            id="adminPassword"
            class="swal2-input"
            placeholder="Enter Admin Password"
          />
          <span class="password-toggle" data-target="adminPassword">
             <i class="las la-eye"></i>
          </span>
        </div>
        <div id="adminPasswordError" class="error-message"></div>

        <label class="label-lc">
          New Password (${orderData.first_name || ""} ${orderData.last_name || ""})
        </label>
        <div class="password-wrapper">
          <input
            type="password"
            id="newPassword"
            class="swal2-input"
            placeholder="Enter New Password"
          />
          <span class="password-toggle" data-target="newPassword">
             <i class="las la-eye"></i>
          </span>
        </div>
        <div id="newPasswordError" class="error-message"></div>

        <label class="label-lc">
          Confirm Password (${orderData.first_name || ""} ${orderData.last_name || ""})
        </label>
        <div class="password-wrapper">
          <input
            type="password"
            id="confirmPassword"
            class="swal2-input"
            placeholder="Enter Confirm Password"
          />
          <span class="password-toggle" data-target="confirmPassword">
            <i class="las la-eye"></i>
          </span>
        </div>
        <div id="confirmPasswordError" class="error-message"></div>
      </form>
    `,
      icon: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#f06548",
      confirmButtonText: "Reset Password",

      preConfirm: async () => {
        const adminPasswordValue = document
          .getElementById("adminPassword")
          .value.trim();
        const newPasswordValue = document
          .getElementById("newPassword")
          .value.trim();
        const confirmPasswordValue = document
          .getElementById("confirmPassword")
          .value.trim();

        const adminPasswordError =
          document.getElementById("adminPasswordError");
        const newPasswordError = document.getElementById("newPasswordError");
        const confirmPasswordError = document.getElementById(
          "confirmPasswordError",
        );

        // Reset previous error messages
        adminPasswordError.textContent = "";
        newPasswordError.textContent = "";
        confirmPasswordError.textContent = "";

        let isValid = true;

        // Validate all fields on submit
        try {
          await resetPasswordValidationSchema.validate(
            {
              admin_password: adminPasswordValue,
              new_password: newPasswordValue,
              confirm_password: confirmPasswordValue,
            },
            { abortEarly: false },
          );
        } catch (err) {
          isValid = false;
          if (err.inner) {
            err.inner.forEach((error) => {
              if (error.path === "admin_password")
                adminPasswordError.textContent = error.message;
              if (error.path === "new_password")
                newPasswordError.textContent = error.message;
              if (error.path === "confirm_password")
                confirmPasswordError.textContent = error.message;
            });
          }
        }

        if (!isValid) {
          return false;
        }

        const data = {
          admin_password: adminPasswordValue,
          emp_uuid: orderData.emp_uuid,
          new_password: newPasswordValue,
          confirm_password: confirmPasswordValue,
        };

        try {
          const Api = await PostApi("employee/reset-password/", data, false);

          if (Api.status && Api.status === 200) {
            return {
              adminPassword: adminPasswordValue,
              newPassword: newPasswordValue,
              confirmPassword: confirmPasswordValue,
              apiResponse: Api,
            };
          } else {
            toast.error(
              Api?.data?.message ||
                Api?.data?.detail ||
                "Reset Password Failed",
            );
            return false;
          }
        } catch (error) {
          toast.error("Something went wrong. Please try again.");
          return false;
        }
      },

      didOpen: () => {
        document.querySelectorAll(".password-toggle").forEach((button) => {
          button.onclick = () => {
            const input = document.getElementById(button.dataset.target);
            if (input.type === "password") {
              input.type = "text";
              button.innerHTML = '<i class="las la-eye-slash"></i>';
            } else {
              input.type = "password";
              button.innerHTML = '<i class="las la-eye"></i>';
            }
          };
        });

        const adminPasswordInput = document.getElementById("adminPassword");
        const newPasswordInput = document.getElementById("newPassword");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        const adminPasswordError =
          document.getElementById("adminPasswordError");
        const newPasswordError = document.getElementById("newPasswordError");
        const confirmPasswordError = document.getElementById(
          "confirmPasswordError",
        );

        const validateField = async (fieldName, values, errorElement) => {
          try {
            await resetPasswordValidationSchema.validateAt(fieldName, values);
            errorElement.textContent = "";
          } catch (err) {
            errorElement.textContent = err.message;
          }
        };

        // Realtime validation
        adminPasswordInput.addEventListener("input", () => {
          validateField(
            "admin_password",
            { admin_password: adminPasswordInput.value },
            adminPasswordError,
          );
        });

        newPasswordInput.addEventListener("input", () => {
          const values = {
            admin_password: adminPasswordInput.value,
            new_password: newPasswordInput.value,
            confirm_password: confirmPasswordInput.value,
          };

          validateField("new_password", values, newPasswordError);

          if (confirmPasswordInput.value) {
            validateField("confirm_password", values, confirmPasswordError);
          }
        });

        confirmPasswordInput.addEventListener("input", () => {
          validateField(
            "confirm_password",
            {
              admin_password: adminPasswordInput.value,
              new_password: newPasswordInput.value,
              confirm_password: confirmPasswordInput.value,
            },
            confirmPasswordError,
          );
        });

        adminPasswordInput.focus();
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Password Reset!",
          result.value?.apiResponse?.data?.message ||
            "Password has been reset successfully.",
          "success",
        );
      }
    });
  };
  // Column
  const initialColumns = [
    {
      Header: (
        <input
          type="checkbox"
          id="checkBoxAll"
          className="form-check-input"
          onClick={(e) => {
            checkedAll(e);
          }}
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
                  prevIds.filter((id) => id !== orderDataChecked),
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
          (orderData.status === 1 ||
            (orderData.status === 4 &&
              orderData?.leave_cancellation_details &&
              orderData?.leave_cancellation_details.status === 1))
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
          (formname === leave_approval_component_name ||
            formname === leave_pending_table) &&
          orderData.status === 4 &&
          orderData?.leave_cancellation_details &&
          orderData?.leave_cancellation_details.status != 1
        ) {
          <li className="list-inline-item">
            <Link to="#" className="text-primary d-inline-block">
              <i className="ri-eye-fill fs-16"></i>
            </Link>
          </li>;
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
        } else if (formname === leave_application_component_name) {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              {/* ✏️ EDIT + DELETE ONLY WHEN status === 1 AND NOT DELETED */}
              {orderData.status === 1 && orderData.is_deleted === false && (
                <>
                  {/* EDIT */}
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

                  {/* DELETE */}
                  <li className="list-inline-item delete">
                    <Link
                      to="javascript:void(0)"
                      className="text-danger d-inline-block delete-item-btn"
                      onClick={() => {
                        handleDelete(orderData);
                      }}
                    >
                      <i className="ri-delete-bin-5-fill fs-16"></i>
                    </Link>
                  </li>
                </>
              )}

              {/* ⋮ THREE DOT MENU */}
              {orderData.allowed_to_cancel_request && (
                <li className="list-inline-item">
                  <button
                    type="button"
                    className="btn btn-soft-warning btn-border btn-sm"
                    onClick={() => handleActionClick(orderData)}
                  >
                    Raise Cancel Leave Request
                  </button>
                </li>
              )}
            </ul>
          );
        } else if (formname === holiday_component_name) {
          return (
            <>
              <li className="list-inline-item edit">
                <Link
                  to="javascript:void(0)"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => handleCreateAndUpdate(orderData.id, orderData)}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>

              <li className="list-inline-item delete">
                <Link
                  to="javascript:void(0)"
                  className="text-danger d-inline-block delete-item-btn"
                  onClick={() => handleHolidayDelete(orderData)}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li>
            </>
          );
        } else if (formname === leave_type_component_name) {
          return (
            <>
              <li className="list-inline-item edit">
                <Link
                  to="javascript:void(0)"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => handleCreateAndUpdate(orderData.id, orderData)}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>

              {/* <li className="list-inline-item delete">
                <Link
                  to="javascript:void(0)"
                  className="text-danger d-inline-block delete-item-btn"
                  onClick={() => handleLeaveTypeDelete(orderData)}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li> */}
            </>
          );
        } else if (
          formname === project_component_name ||
          formname === client_component_name ||
          formname === status_component_name ||
          formname === priorities_component_name ||
          formname === task_list_component_name ||
          formname === custom_status_form_component_name ||
          formname === custom_field_component_name ||
          formname === work_schedule_component_name
        ) {
          const rowData = cellProps.row.original;

          const isLockedStatusRow =
            formname === status_component_name &&
            (rowData.id === 1 || rowData.id === 2 || rowData.id === 3);

          return (
            <>
              <li className="list-inline-item edit">
                {isLockedStatusRow ? (
                  <span
                    className="text-muted d-inline-block edit-item-btn"
                    style={{ cursor: "not-allowed", opacity: 0.5 }}
                    title="This status cannot be edited"
                  >
                    <i className="ri-pencil-fill fs-16"></i>
                  </span>
                ) : (
                  <Link
                    to="javascript:void(0)"
                    className="text-primary d-inline-block edit-item-btn"
                    onClick={() => handleCreateAndUpdate(rowData.id, rowData)}
                  >
                    <i className="ri-pencil-fill fs-16"></i>
                  </Link>
                )}
              </li>

              {/* <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => deleteHandler(rowData.id, formname)}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li> */}
            </>
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
              {/* <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => {
                    const orderData = cellProps.row.original;
                  }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li> */}
            </ul>
          );
        } else if (formname === work_schedule_component_name) {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
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
            </ul>
          );
        } else {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              {orderData.status === 2 ||
              orderData.status === 3 ||
              orderData.hr_status === 2 ||
              orderData.hr_status === 4 ? null : ( // ✅ IMPORTANT FIX
                <>
                  {/* EDIT */}
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

                  {/* DELETE */}
                  <li className="list-inline-item">
                    <Link
                      to="#"
                      className="text-danger d-inline-block remove-item-btn"
                      onClick={() => {
                        const rowData = cellProps.row.original;
                        // 👉 your delete logic here
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
      localStorage.getItem("lint_hr_profile_data"),
    );
    if (
      formname === leave_approval_component_name ||
      attendance_approval_component_name
    ) {
      setShowAllLeaveApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_HIERARCHY_LEAVE_ACCESS_KEY,
        ),
      );
      setShowTeamLeaveApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY,
        ),
      );

      setShowAllAttendanceApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_HIERARCHY_ATTENDANCE_ACCESS_KEY,
        ),
      );
      setShowTeamAttendanceApprovalBtn(
        profile_data.permission_list.includes(
          APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY,
        ),
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
    console.log("Form Name:", thisFormName);
    console.log("Permissions:", profile_data.permission_list);
    console.log(
      "Has Create Client:",
      profile_data.permission_list.includes(CREATE_CLIENT_ACCESS_KEY),
    );
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
              CREATE_EMPLOYEE_ACCESS_KEY,
            )) ||
          (thisFormName === custom_field_component_name &&
            profile_data.permission_list.includes(
              CREATE_CUSTOM_FIELD_ACCESS_KEY,
            )) ||
          (thisFormName === client_component_name &&
            profile_data.permission_list.includes(CREATE_CLIENT_ACCESS_KEY)) ||
          (thisFormName === role_component_name &&
            profile_data.permission_list.includes(CREATE_ROLES_ACCESS_KEY))
        ) {
          console.log("Create Access Granted");
          setShowCreateBtn(true);
        } else if (thisFormName === leave_application_component_name) {
          console.log("Leave Application Access Granted");
          setShowCreateBtn(true);
        } else {
          console.log("Create Access Denied");
          setShowCreateBtn(false);
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
            profile_data.permission_list.includes(
              EDIT_CUSTOM_FIELD_ACCESS_KEY,
            )) ||
          (thisFormName === client_component_name &&
            profile_data.permission_list.includes(EDIT_CLIENT_ACCESS_KEY)) ||
          (thisFormName === role_component_name &&
            profile_data.permission_list.includes(EDIT_ROLES_ACCESS_KEY))
        ) {
          setShowEditBtn(true);
        } else if (thisFormName === leave_application_component_name) {
          setShowEditBtn(true);
        } else {
          setShowEditBtn(false);
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

  const toggleTab = (tab, type, condition) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      let filteredDatas = [...sortedTableData];
      if (type !== "all") {
        filteredDatas = [...sortedTableData].filter(
          (data) => data[filterKey] == type,
        );
      }
      setDataList(filteredDatas);
    }
    dispatch(setActiveTableTab(null));
  };

  useEffect(() => {
    if (tabledata && tabledata.length) {
      let type = "";
      if (activeTab === undefined || parseInt(activeTab) === 1) {
        type = "all";
      } else {
        type = tabOptions.length
          ? tabOptions.find((e) => e.idx === parseInt(activeTab))?.option
          : "all";
      }
      let filtered_table_data =
        type === "all"
          ? [...sortedTableData]
          : [...sortedTableData].filter((data) => data[filterKey] == type);

      setDataList(filtered_table_data);
    } else {
      setDataList([]);
    }
  }, [tabledata, sortedTableData]);

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

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".dataCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const approveRejectCheckbox = () => {
    const ele = document.querySelectorAll(".dataCheckBox:checked");
    ele.length > 0
      ? setSelectApproveReject(true)
      : setSelectApproveReject(false);
    setSelectedCheckBoxApproveReject(ele);
  };

  const handleDeleteData = (data) => {};

  // CUSTOM FORM

  const handleCreateAndUpdate = ($id, table_obj) => {
    console.log("table_obj === ", table_obj);
    console.log("id === ", $id);

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
    dispatch(setFormTitle("Employee Bulk Import"));
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

  const [rmEmpName, setRMEmpName] = useState("");
  const [showRMModal, setShowRMModal] = useState(false);
  const onRMModalCloseClick = () => {
    setShowRMModal(false);
  };

  const [TeamsToBeUpdated, setTeamsToBeUpdated] = useState([]);

  const handleNewReportingManager = (e, d_id) => {
    const { value } = e;

    console.log("Handle New Rep Man = ", value);

    const new_rm = [...TeamsToBeUpdated].map((d) => {
      if (d.id === d_id) {
        return {
          ...d,
          new_reporting_manager_id: value,
        };
      } else {
        return d;
      }
    });

    setTeamsToBeUpdated(new_rm);
  };

  const assignNewReportingManager = async () => {
    const f = TeamsToBeUpdated.filter(
      (d) => parseInt(d.new_reporting_manager_id) === 0,
    );
    if (f.length > 0) {
      toast.error("Please Select New Reporting Manager");
    } else {
      dispatch(setLoaderVisible(true));
      const Payload = TeamsToBeUpdated.map((d) => {
        return {
          employee_id: d?.employee_id,
          new_reporting_manager_id: d?.new_reporting_manager_id,
          sub_child_details: d?.employee_details,
        };
      });

      console.log("API Payload = ", Payload);

      const Api = await PostApi(
        "employee/assign-new-reporting-manager/",
        Payload,
        false,
      );

      if (Api.status && Api.status === 200) {
        dispatch(setLoaderVisible(false));
        DeactivateEmployeeAPI(
          activeInactiveAPIOrderData,
          activeInactiveAPIOrderInfo,
        );
        setShowRMModal(false);
      } else {
        dispatch(setLoaderVisible(false));
        console.log("API Exception === ", Api);
        toast.error("Something Went Wrong");
      }
    }
  };

  // Activate employee

  const [activateEmpName, setActivateEmpName] = useState("");
  const [showActivateEmpModal, setShowActivateEmpModal] = useState(false);
  const onActivateEmpModalClick = () => {
    setShowActivateEmpModal(false);
  };

  const initialActivateEmpObj = useMemo(() => {
    return {
      emp_uuid: 0,
      primary_department_id_list: [],
      reporting_manager_id: 0,
    };
  });

  const [activateEmpObj, setActivateEmpObj] = useState(initialActivateEmpObj);
  const dep_options = GetLocalStorageData("department") || [];
  const [reportingManagerOptions, setReportingManagerOptions] = useState([]);

  const handlePrimaryDepChange = async (e) => {
    let valid_dep_obj = [];
    let valid_dep_ids = [];

    for (var i = 0; i < e.length; i++) {
      var is_child = false;
      for (var j = 0; j < e.length; j++) {
        if (i !== j) {
          if (e[j].child_id_list.includes(e[i].id)) {
            is_child = true;
          }
        }
      }
      if (is_child === false) {
        valid_dep_obj.push(e[i]);
        valid_dep_ids.push(e[i].id);
      }
    }

    if (valid_dep_ids.length) {
      GetReportingManager(valid_dep_ids);
    } else {
      setReportingManagerOptions([]);
    }

    setActivateEmpObj({
      ...activateEmpObj,
      primary_department_id_list: valid_dep_ids,
      reporting_manager_id: 0,
    });
  };

  const GetReportingManager = async (valid_dep_ids) => {
    const Api = await PostApi(
      "employee/get-employee-list-for-reporting-manager/",
      { dep_id: valid_dep_ids },
      false,
    );
    if (Api.status && Api.status === 200) {
      const response = Api?.data?.data;
      setReportingManagerOptions(
        EmployeeData.filter(
          (d) => d.id !== activateEmpObj.id && response.includes(d.id),
        ),
      );
    } else {
      console.log("ERRR");
    }
  };

  const ActivateEmployeeAPI = async () => {
    if (
      !!activateEmpObj?.reporting_manager_id &&
      activateEmpObj?.reporting_manager_id !== 0
    ) {
      dispatch(setLoaderVisible(true));
      activateEmpObj["status"] = 1;

      console.log("ACITVATE EMP OBJ === ", activateEmpObj);

      const Api = await PostApi(
        "employee/activate-or-deactivate-employee/",
        activateEmpObj,
        false,
      );
      if (!!Api.status && Api.status === 200) {
        dispatch(setLoaderVisible(false));
        dispatch(editEmployee(Api?.data?.data));
        SetLocalStorage("employee", Api?.data.data, 3);
        setShowActivateEmpModal(false);
        toast.success(Api?.data?.message);
      } else {
        dispatch(setLoaderVisible(false));
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    } else {
      toast.error("Please Select Reporting Manager");
    }
  };

  return (
    <Col lg={table_col || 12}>
      <div className={table_class || "page-content"}>
        <ExportCSV
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          formname={formname} // ✅ use the page's own formname
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
                        {formname === status_component_name && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            id="reorder-btn"
                            onClick={openReorderModal}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="#fff"
                              style={{
                                marginRight: 6,
                                verticalAlign: "middle",
                              }}
                            >
                              <circle cx="5" cy="3" r="1.3" />
                              <circle cx="11" cy="3" r="1.3" />
                              <circle cx="5" cy="8" r="1.3" />
                              <circle cx="11" cy="8" r="1.3" />
                              <circle cx="5" cy="13" r="1.3" />
                              <circle cx="11" cy="13" r="1.3" />
                            </svg>
                            Reorder
                          </button>
                        )}{" "}
                        <div className="d-flex gap-1 flex-wrap">
                          {formname &&
                            component_list_for_import_btn_access.includes(
                              formname,
                            ) &&
                            formname !== holiday_component_name && (
                              <button
                                type="button"
                                className="btn btn-primary align-bottom me-1"
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
                          {formname &&
                            formname !== attendance_pending_table &&
                            formname !== leave_pending_table &&
                            formname !== custom_field_component_name &&
                            formname !== leave_application_component_name &&
                            formname !== priorities_component_name &&
                            formname !== status_component_name &&
                            formname !== project_component_name &&
                            formname !== task_list_component_name &&
                            formname !== client_component_name &&
                            formname !== custom_status_form_component_name &&
                            formname !== holiday_component_name && (
                              <button
                                type="button"
                                className="btn btn-info"
                                onClick={() => setIsExportCSV(true)}
                              >
                                <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                                Export
                              </button>
                            )}{" "}
                          {isMultiDeleteButton && <div></div>}
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
                                        className="btn btn-success custom-toggle active"
                                        id="bulk-approve-btn"
                                        onClick={() => handleBulkApproval()}
                                      >
                                        <i class="ri-check-fill align-bottom me-1"></i>{" "}
                                        Bulk Approve
                                      </button>{" "}
                                      <button
                                        type="button"
                                        className="btn btn-danger custom-toggle active"
                                        id="bulk-reject-btn"
                                        onClick={() => handleBulkReject()}
                                      >
                                        <i className="ri-close-line align-bottom me-1"></i>{" "}
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
                          "fw-semibold",
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
                            "fw-semibold",
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
                {isLoading ? (
                  <TableSkeleton />
                ) : (
                  // ✅ FIX: TableContainer (which renders the filter row, e.g.
                  // TaskListFilter) is now ALWAYS rendered, even when dataList
                  // is empty. Previously this whole block was swapped out for
                  // a plain "No Result Found" div whenever a filter produced
                  // zero matches — which made the filter selects themselves
                  // disappear the moment you picked a filter with no results.
                  // The empty-state message is now rendered *inside*
                  // TableContainer, below the filter row, via its `noResults`
                  // prop.
                  <TableContainer
                    columns={tableColumn}
                    data={
                      dataList
                        ?.filter((obj) => {
                          return Object.entries(table_filter_keys || {}).every(
                            ([key, value]) => {
                              // ─────────────────────────────
                              // Skip Empty Filters
                              // ─────────────────────────────
                              if (
                                value === 0 ||
                                value === null ||
                                value === undefined ||
                                value === "" ||
                                (Array.isArray(value) && value.length === 0)
                              ) {
                                return true;
                              }

                              // ─────────────────────────────
                              // Multi Select Array Filter
                              // collaborator_id
                              // ─────────────────────────────
                              if (Array.isArray(value)) {
                                const taskValues =
                                  obj?.collaborators_id_list ||
                                  obj?.[key] ||
                                  [];

                                return value.some((id) =>
                                  taskValues
                                    .map((v) => Number(v))
                                    .includes(Number(id)),
                                );
                              }

                              // ─────────────────────────────
                              // Nested Object ID
                              // role_id → role.id
                              // ─────────────────────────────
                              if (key.endsWith("_id")) {
                                const objectKey = key.replace("_id", "");

                                if (
                                  obj?.[objectKey] &&
                                  typeof obj[objectKey] === "object" &&
                                  "id" in obj[objectKey]
                                ) {
                                  return (
                                    Number(obj[objectKey].id) === Number(value)
                                  );
                                }
                              }

                              // ─────────────────────────────
                              // Direct Compare
                              // ─────────────────────────────
                              return Number(obj?.[key]) === Number(value);
                            },
                          );
                        })

                        // ─────────────────────────────
                        // Year + Month Filter
                        // ─────────────────────────────
                        .filter((obj) => {
                          const selectedYear =
                            attendance_approval_table_filter_keys?.year;

                          const selectedMonth =
                            attendance_approval_table_filter_keys?.month;

                          // No year selected -> show all
                          if (!selectedYear) return true;

                          const holidayDate = dayjs(obj.date);

                          const yearMatch =
                            holidayDate.year().toString() === selectedYear;

                          const monthMatch =
                            selectedMonth === 0 ||
                            selectedMonth === undefined ||
                            selectedMonth === null ||
                            holidayDate.month() + 1 === selectedMonth;

                          return yearMatch && monthMatch;
                        })

                        // ─────────────────────────────
                        // Search Filter
                        // ─────────────────────────────
                        .filter((d) => {
                          if (!search?.trim()) return true;

                          return Object.entries(d).some(([key, value]) => {
                            // Ignore ID fields
                            if (
                              key === "id" ||
                              key.endsWith("_id") ||
                              key === "created_by" ||
                              key === "updated_by" ||
                              key === "work_schedule_id_list"
                            ) {
                              return false;
                            }

                            if (value == null) return false;

                            let searchValue = String(value);

                            if (key === "date") {
                              const formattedDate =
                                dayjs(value).format("DD-MM-YYYY");

                              const normalizedDate = formattedDate.replace(
                                /[-/]/g,
                                "",
                              );
                              const normalizedSearch = search.replace(
                                /[-/]/g,
                                "",
                              );

                              const matched =
                                formattedDate
                                  .toLowerCase()
                                  .includes(search.toLowerCase()) ||
                                normalizedDate.includes(normalizedSearch);

                              return matched;
                            }

                            const matched = searchValue
                              .toLowerCase()
                              .includes(search.toLowerCase());

                            return matched;
                          });
                        }) || []
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
                      />
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
                      />
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="productname-field" className="form-label">
                        Product
                      </Label>

                      <Input
                        name="product"
                        type="select"
                        className="form-select"
                        required
                      ></Input>
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="date-field" className="form-label">
                        Order Date
                      </Label>
                    </div>
                    <div className="row gy-4 mb-3">
                      <div className="col-md-6">
                        <div>
                          <Label htmlFor="amount-field" className="form-label">
                            Amount
                          </Label>
                          <Input name="amount" type="text" />
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
                          ></Input>
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
                      ></Input>
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
                    </div>
                  </div>
                </Form>
              </Modal>

              <Modal
                fade={true}
                isOpen={showRMModal}
                toggle={onRMModalCloseClick}
                centered={true}
              >
                <ModalBody className="py-2 px-3">
                  <div className="mt-2 text-center">
                    <div className="mt-4 pt-2 fs-15 mx-4">
                      <h4>Assign New Reporting Manager</h4>
                    </div>
                    <div className="mt-3 pt-1">
                      <p>
                        <b>{rmEmpName}</b> is The Reporting Manager For The
                        Following Employees
                      </p>
                    </div>
                    <div className="mt-3 pt-1">
                      {TeamsToBeUpdated &&
                        TeamsToBeUpdated.map((d) => {
                          return (
                            <React.Fragment>
                              <Row className="mt-2">
                                <Col lg={12} style={{ textAlign: "left" }}>
                                  <h5>{d?.name}</h5>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={6}>
                                  <Select
                                    name={`rep_man_select_${d.id}`}
                                    id={`rep_man_id_${d.id}`}
                                    options={d.rep_man_options}
                                    components={{
                                      Option: EmployeeDisplayInSelect,
                                    }}
                                    value={
                                      d.rep_man_options.find(
                                        (e) =>
                                          e.id ===
                                          parseInt(d.new_reporting_manager_id),
                                      ) || []
                                    }
                                    onChange={(e) =>
                                      handleNewReportingManager(e, d?.id)
                                    }
                                    className="basic-multi-select"
                                  />
                                </Col>
                                <Col lg={6}>
                                  <h5>Employees</h5>
                                  {(d?.employee_details).map((m) => (
                                    <>
                                      <h6>{m?.name}</h6>
                                    </>
                                  ))}
                                </Col>
                              </Row>
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      type="button"
                      className="btn w-sm btn-light"
                      data-bs-dismiss="modal"
                      onClick={() => setShowRMModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn w-sm btn-danger"
                      id="assign-record"
                      onClick={assignNewReportingManager}
                    >
                      Assign
                    </button>
                  </div>
                </ModalBody>
              </Modal>

              <Modal
                fade={true}
                isOpen={showActivateEmpModal}
                toggle={onActivateEmpModalClick}
                centered={true}
              >
                <ModalBody className="py-2 px-3">
                  <div className="mt-2 text-center">
                    <div className="mt-4 pt-2 fs-15 mx-4">
                      <h4>
                        Assign New Department & Reporting Manager For{" "}
                        <b>{activateEmpName}</b>
                      </h4>
                    </div>
                  </div>
                  <div className="mt-3 pt-1">
                    <React.Fragment>
                      <Row>
                        <Col lg={12}>
                          <div>
                            <Label
                              htmlFor="primary_department_id_list"
                              className="form-label"
                            >
                              Primary Department
                            </Label>
                            <Select
                              id="primary_department_id_list"
                              name="primary_department_id_list"
                              isMulti={true}
                              options={dep_options || []}
                              className="basic-multi-select"
                              closeMenuOnSelect={false}
                              placeholder={"Select Primary Department"}
                              value={
                                activateEmpObj?.primary_department_id_list
                                  ? dep_options.filter((d) =>
                                      (activateEmpObj?.primary_department_id_list).includes(
                                        d.id,
                                      ),
                                    )
                                  : []
                              }
                              onChange={handlePrimaryDepChange}
                            />
                          </div>
                        </Col>

                        <Col lg={12}>
                          <div>
                            <Label htmlFor="reporting_manager_id">
                              Reporting Manager
                            </Label>
                            <Select
                              id="reporting_manager_id"
                              name="reporting_manager_id"
                              isMulti={false}
                              isClearable={true} // Enable clearable feature
                              options={reportingManagerOptions || []}
                              components={{ Option: EmployeeDisplayInSelect }}
                              className="basic-multi-select"
                              value={
                                (activateEmpObj.reporting_manager_id &&
                                  reportingManagerOptions.find(
                                    (e) =>
                                      e.id ===
                                      activateEmpObj.reporting_manager_id,
                                  )) ||
                                null // Set value to null initially
                              }
                              onChange={(selectedOption) => {
                                if (selectedOption) {
                                  // Check if an option is selected
                                  setActivateEmpObj({
                                    ...activateEmpObj,
                                    reporting_manager_id: selectedOption.id,
                                  });
                                } else {
                                  // Clear selection if null (clear button clicked)
                                  setActivateEmpObj({
                                    ...activateEmpObj,
                                    reporting_manager_id: 0,
                                  });
                                }
                              }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </React.Fragment>
                  </div>

                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      type="button"
                      className="btn w-sm btn-light"
                      data-bs-dismiss="modal"
                      onClick={() => setShowActivateEmpModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn w-sm btn-danger"
                      id="assign-record"
                      onClick={ActivateEmployeeAPI}
                    >
                      Assign
                    </button>
                  </div>
                </ModalBody>
              </Modal>
              <Modal
                isOpen={showReorderModal}
                toggle={() => setShowReorderModal(false)}
                centered
              >
                <ModalHeader toggle={() => setShowReorderModal(false)}>
                  Reorder Status
                </ModalHeader>
                <ModalBody>
                  <div
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      paddingRight: "6px",
                    }}
                  >
                    <DragDropContext onDragEnd={handleReorderDragEnd}>
                      <Droppable droppableId="reorder-status-list">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {reorderList.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={String(item.id)}
                                index={index}
                              >
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    style={{
                                      ...dragProvided.draggableProps.style,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      padding: "10px 12px",
                                      marginBottom: "8px",
                                      borderRadius: "6px",
                                      border: "1px solid #e3e3e3",
                                      background: dragSnapshot.isDragging
                                        ? "#f0f4ff"
                                        : "#fff",
                                      cursor: "grab",
                                    }}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="#8a8a8a"
                                    >
                                      <circle cx="5" cy="3" r="1.3" />
                                      <circle cx="11" cy="3" r="1.3" />
                                      <circle cx="5" cy="8" r="1.3" />
                                      <circle cx="11" cy="8" r="1.3" />
                                      <circle cx="5" cy="13" r="1.3" />
                                      <circle cx="11" cy="13" r="1.3" />
                                    </svg>
                                    <span
                                      className="badge text-uppercase"
                                      style={{
                                        backgroundColor: getValidColor(
                                          item.color,
                                        ),
                                        color: "#fff",
                                        padding: "6px 10px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.name}
                                    </span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </ModalBody>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowReorderModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSaveReorder}
                  >
                    Save
                  </button>
                </div>
              </Modal>
            </CardBody>
          </Card>
        </Container>
      </div>
    </Col>
  );
};

export default InfoTable;
