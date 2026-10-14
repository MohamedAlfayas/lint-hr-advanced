import React from "react";
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import SimpleBar from "simplebar-react";
import { useSelector } from "react-redux";
import ImportForm from "../../forms/ImportForm";
import { component_list_for_import_form_access } from "../../../common/constant/Constants";
const ImportExportForms = ({ open, toggleImportCanvas }) => {
  const { form_title, form_width_percentage, component_to_show } = useSelector(
    (state) => state.RightSideBarReducer,
  );

  return (
    <div>
      <Offcanvas
        style={{ width: form_width_percentage, maxWidth: "100vw" }}
        isOpen={open}
        toggle={toggleImportCanvas}
        direction="end"
      >
        <OffcanvasHeader
          toggle={toggleImportCanvas}
          style={{ textTransform: "capitalize" }}
        >
          {form_title.split("_").join(" ")}
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimpleBar className="h-100">
            <div className="p-4">
              {component_list_for_import_form_access.includes(
                component_to_show,
              ) ? (
                <ImportForm />
              ) : (
                <></>
              )}
              {/* {component_to_show === "employee" ? (
                <ImportForm />
                )  : component_to_show === "leave_types" ? (
                    <ImportForm/>
                ): component_to_show === "holiday" ? (
                  <ImportForm/>
              ):(
                    <></>
                  )} */}
            </div>
          </SimpleBar>
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
};

export default ImportExportForms;
