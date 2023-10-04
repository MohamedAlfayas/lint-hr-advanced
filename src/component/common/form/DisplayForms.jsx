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
        <OffcanvasHeader toggle={toggleLeftCanvas}>
          {form_title}
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
              ) 
              : component_to_show === "workschedule" ? (
                <WorkScheduleForm />
              ) 
              : component_to_show === "holiday" ? (
                <HolidayForm />
              ) 
              : (
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
