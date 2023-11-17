import React from "react";
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import SimpleBar from "simplebar-react";
import DepartmentForm from "../../forms/DepartmentForm";
import { useSelector } from "react-redux";
import BranchForm from "../../forms/BranchForm";
import EmployeeForm from "../../forms/EmployeeForm";
import RoleForm from "../../forms/RoleForm";
import WorkScheduleForm from "../../forms/WorkScheduleForm";
import HolidayForm from "../../forms/HolidayForm";
import LeaveTypeForm from "../../forms/LeaveTypeForm";
import ApplyLeaveForm from "../../forms/ApplyLeaveForm";
import CustomFieldForm from "../../forms/CustomFieldForm";
import ProfileViewMin from "../../forms/ProfileViewMin";
import EPFWageForm from "../../forms/EPFWageForm";
import ProfessionalTaxForm from "../../forms/ProfessionalTaxForm";

const DisplayForms = ({ open, toggleLeftCanvas }) => {
  const { form_title, form_width_percentage, component_to_show } = useSelector(
    (state) => state.RightSideBarReducer
  );

  return (
    <div>
      <Offcanvas
        style={{ width: form_width_percentage }}
        isOpen={open}
        toggle={toggleLeftCanvas}
        direction="end">
        <OffcanvasHeader
          toggle={toggleLeftCanvas}
          style={{ textTransform: "capitalize" }}>
          {form_title.split("_").join(" ")}
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimpleBar className="h-100">
            <div className="p-4">
              {component_to_show === "department" ? (
                <DepartmentForm />
              ) : component_to_show === "branch" ? (
                <BranchForm />
              ) : component_to_show === "employee" ? (
                <EmployeeForm />
              ) : component_to_show === "role" ? (
                <RoleForm />
              ) : component_to_show === "workschedule" ? (
                <WorkScheduleForm />
              ) : component_to_show === "holiday" ? (
                <HolidayForm />
              ) : component_to_show === "leave_types" ? (
                <LeaveTypeForm />
              ) : component_to_show === "leave_apply" ? (
                <ApplyLeaveForm />
              ) : component_to_show === "custom_fields" ? (
                <CustomFieldForm />
              ) : component_to_show === "profileViewMin" ? (
                <ProfileViewMin />
              ) : component_to_show === "EPFWageForm" ? (
                <EPFWageForm />
              ) : component_to_show === "ProfessionalTaxForm" ? (
                <ProfessionalTaxForm />
              ) : (
                <></>
              )}
            </div>
          </SimpleBar>
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
};

export default DisplayForms;
