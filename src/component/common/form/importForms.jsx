import React from "react";
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import SimpleBar from "simplebar-react";
import { useSelector } from "react-redux";
const ImportForms = ({ open, toggleImportCanvas }) => {
    const { form_title, form_width_percentage, component_to_show } = useSelector(
      (state) => state.RightSideBarReducer
    );
  
    return (
      <div>
        <Offcanvas
          style={{ width: form_width_percentage }}
          isOpen={open}
          toggle={toggleImportCanvas}
          direction="end">
       <OffcanvasHeader toggle={toggleImportCanvas} style={{ textTransform: "capitalize" }}>
            {(form_title).split("_").join(" ")}
          </OffcanvasHeader>
          <OffcanvasBody className="p-0">
            <SimpleBar className="h-100">
             
            </SimpleBar>
          </OffcanvasBody>
        </Offcanvas>
      </div>
    );
  };
  
  export default ImportForms;
  