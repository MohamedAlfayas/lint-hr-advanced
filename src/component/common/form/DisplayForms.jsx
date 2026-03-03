import React from "react";
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import SimpleBar from "simplebar-react";
import DepartmentForm from "../../forms/DepartmentForm";
import { useSelector } from "react-redux";
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
import SalaryCmpntForm from "../../forms/Common/SalaryCmpntForm";
import SalaryPloiciesForm from "../../forms/Common/SalaryPoliciesForm";
import LocationEditForm from "../../forms/Common/LocationEditForm";
import BranchLocationForm from "../../forms/Common/BranchLocationForm";
import StatusForm from "../../forms/Common/StatusForm";
import PirioritiesForm from "../../forms/Common/PirioritiesForm";
import {
  branch_component_name,
  custom_field_component_name,
  department_component_name,
  employee_component_name,
  epf_wage_form_component_name,
  holiday_component_name,
  leave_application_component_name,
  leave_type_component_name,
  professional_tax_form_component_name,
  profile_view_component_name,
  role_component_name,
  salary_form_component_name,
  salary_policy_form_component_name,
  work_schedule_component_name,
  location_edit_form_component_name,
  branch_location_form,
  status_component_name,
  piriorities_component_name,
  contact_group_component_name,
  contacts_component_name,
  custom_form_component_name,
} from "../../../common/constant/Constants";
import BranchForm from "../../forms/BranchForm";
import ContactGroupForm from "../../forms/Common/ContactGroupForm";
import ContactsForm from "../../forms/Common/ContactsForm";
import CustomForm from "../../forms/Common/CustomForm";


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
        direction="end"
      >
        <OffcanvasHeader
          toggle={toggleLeftCanvas}
          style={{ textTransform: "capitalize" }}
        >
          {form_title.split("_").join(" ")}
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimpleBar className="h-100">
            <div className="p-4">
              {component_to_show === department_component_name ? (
                <DepartmentForm />
              ) : component_to_show === branch_component_name ? (
                <BranchForm />
              ) : component_to_show === employee_component_name ? (
                <EmployeeForm />
              ) : component_to_show === role_component_name ? (
                <RoleForm />
              ) : component_to_show === work_schedule_component_name ? (
                <WorkScheduleForm />
              ) : component_to_show === holiday_component_name ? (
                <HolidayForm />
              ) : component_to_show === leave_type_component_name ? (
                <LeaveTypeForm />
              ) : component_to_show === leave_application_component_name ? (
                <ApplyLeaveForm />
              ) : component_to_show === custom_field_component_name ? (
                <CustomFieldForm />
              ) : component_to_show === profile_view_component_name ? (
                <ProfileViewMin />
              ) : component_to_show === epf_wage_form_component_name ? (
                <EPFWageForm />
              ) : component_to_show === professional_tax_form_component_name ? (
                <ProfessionalTaxForm />
              ) : component_to_show === salary_form_component_name ? (
                <SalaryCmpntForm />
              ) : component_to_show === salary_policy_form_component_name ? (
                <SalaryPloiciesForm />
              ) : component_to_show === location_edit_form_component_name ? (
                <LocationEditForm />
              ) :  component_to_show === branch_location_form ? (
                <BranchLocationForm />
                ) :
                    component_to_show === status_component_name ? (
                    <StatusForm/>
                    ) : component_to_show === piriorities_component_name ? (
                      <PirioritiesForm/>
                      ) :  component_to_show === contact_group_component_name ? (
                        <ContactGroupForm/>
                        ) : component_to_show === contacts_component_name ? (
                          <ContactsForm/>
                          ) : component_to_show === custom_form_component_name ? (
                          <CustomForm/>
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
