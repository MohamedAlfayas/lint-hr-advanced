import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Col, Form, Input, Label, Row } from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLeaveApplication,
  editLeaveApplication,
} from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { toast } from "react-toastify";

const ApplyLeaveForm = () => {
    
  const dispatch = useDispatch();
  const [leaveApplicationObj, setLeaveApplicationObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    setLeaveApplicationObj(form_obj);
    
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveApplicationObj({
      ...leaveApplicationObj,
      [name]: value,
    });
  };

 

  const handleSubmit = async () => {
    console.log("Leave Application Obj = ",leaveApplicationObj);
    // Api({
    //   method: "POST",
    //   url: "leave/leave-application/create/",
    //   data: leaveApplicationObj,
    // })
    //   .then((res) => {
    //     console.log("REs = ", res);
    //     leaveApplicationObj.id === 0
    //       ? dispatch(addLeaveApplication(res?.data.data))
    //       : dispatch(editLeaveApplication(res?.data?.data));
    //     dispatch(toggleRSBView(false));
    //     toast.success(res?.data?.message);
    //   })
    //   .catch((err) => {
    //     console.log("ERr == ", err);
    //     toast.success(err?.response?.data?.message);
    //   });
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} action="javascript:void(0)">
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="leaveapplicationName" className="form-label">
                  LeaveApplication Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  id="leaveapplicationName"
                  placeholder="Enter leaveapplication name"
                  value={leaveApplicationObj.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label>Date</Label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className="form-control"
                    value={leaveApplicationObj.date || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </Col>
              <Col lg={12}>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  type="text"
                  name="description"
                  className="form-control"
                  id="description"
                  placeholder="Enter description"
                  value={leaveApplicationObj.description || ""}
                  onChange={handleInputChange}></textarea>
              </Col>

              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ApplyLeaveForm;
