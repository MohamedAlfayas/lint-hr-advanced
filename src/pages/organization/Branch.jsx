import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";
// import { Table } from 'rsuite';
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Link } from "react-router-dom";
import { GetCustomField } from "../../common/js/GetCustomField";
import { organization_component_name } from "../../common/constant/Constants";

import {
  CREATE_BRANCH_ACCESS_KEY,
  EDIT_BRANCH_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setBranch } from "../../redux/reducers/ChildReducer/BranchReducer";
import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";

// const { Column, HeaderCell, Cell } = Table;

//import images

const Branch = () => {
  const dispatch = useDispatch();

  const { branch_data } = useSelector((state) => state.BranchReducer);

  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showEditBtn, setShowEditBtn] = useState(false);

  useEffect(() => {
    setShowCreateBtn(CheckRoleAccess(CREATE_BRANCH_ACCESS_KEY));
    setShowEditBtn(CheckRoleAccess(EDIT_BRANCH_ACCESS_KEY));

    dispatch(setBranch(GetLocalStorageData("branch")));
  }, []);

  // Custom Field Option

  const CustomFieldsForThisForm = GetCustomField("organization") || [];

  // Set Empty Data To form

  const initialFormObj = useMemo(() => {
    return {
      location_details: [],
      id: 0,
      name: "",
      country: "",
      state: "",
      address: "",
      city: "",
      pincode: "",
      contact_number: "",
      country_code: "",
      contact_email: "",
      about: "",

      cf_values: CustomFieldsForThisForm || [],
    };
  }, []);

  const handleBranchCreateOrEdit = (id, obj) => {
    console.log(obj, "obbbjjj");

    let FormObj = {};

    if (parseInt(id) === 0) {
      FormObj = initialFormObj;
    } else {
      let thisCFValues = "cf_values" in obj ? [...obj?.cf_values] : [];
      let cf = [];
      let CustomFieldsForThisForm = GetCustomField(organization_component_name);
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

      FormObj = { ...obj, state: obj?.state || "", cf_values: cf };
    }

    dispatch(setFormTitle("Branch Form"));
    dispatch(setFormObj(FormObj));
    dispatch(setFormWidthPercentage("35%"));
    dispatch(setComponentToShow("BranchForm"));
    dispatch(toggleRSBView(true));
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          {showCreateBtn && (
            <span className="float-end">
              <button
                type="button"
                className="btn btn-success add-btn"
                id="create-btn"
                style={{ textTransform: "capitalize" }}
                onClick={() => {
                  handleBranchCreateOrEdit(0);
                }}
              >
                <i className="ri-add-line align-bottom me-1"></i>New Branch{" "}
              </button>
            </span>
          )}

          <h4 className="card-title mb-0">Branch</h4>
        </CardHeader>
        <CardBody>
          <Row>
            {!!branch_data &&
              branch_data.length &&
              branch_data.map((bd) => (
                <Col xxl={12}>
                  <Card key={1} className="border card-border-success">
                    <CardBody>
                      <div
                        className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}
                      >
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <h5 className="mb-0 fs-14">
                              <Link to="#" className="text-body">
                                {bd?.name}
                                {bd?.type === 1 && (
                                  <span className="badge border border-dark text-body ms-2">
                                    HEADQUARTER
                                  </span>
                                )}
                              </Link>
                            </h5>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="d-flex gap-1 align-items-center my-n2">
                              {/* <div className="form-check form-switch form-switch-success  ">
                                <Input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="enableEPF"
                                  checked="true"
                                />
                                <Label
                                  className="form-check-label"
                                  for="enableEPF"
                                >
                                  Active
                                </Label>
                              </div> */}
                              {showEditBtn && (
                                <a
                                  onClick={() =>
                                    handleBranchCreateOrEdit(bd?.id, bd)
                                  }
                                  className="text-primary d-inline-block edit-item-btn ms-2"
                                  href="javascript:void(0)"
                                >
                                  <i class="ri-pencil-fill fs-16"></i>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-3">
                        <Row className="gy-3">
                          <Col xs={12}>
                            <div>
                              <h5 className="fs-14">{bd?.about}</h5>
                            </div>
                            <hr />
                          </Col>
                        </Row>
                        <Row className="gy-3">
                          <Col xs={2}>
                            <div>
                              <p className="text-muted mb-1">Employees</p>
                              <h5 className="fs-14">
                                {bd?.no_of_employees || 0}
                              </h5>
                            </div>
                          </Col>
                          <Col xs={2}>
                            <div>
                              <p className="text-muted mb-1">Locations</p>
                              <h5 className="fs-14">
                                {bd?.location_details.length}
                              </h5>
                            </div>
                          </Col>
                          <Col xs={2}>
                            <div>
                              <p className="text-muted mb-1">City</p>
                              <h5 className="fs-14">{bd?.city} </h5>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div>
                              <p className="text-muted mb-1">Contact Number</p>
                              <h5 className="fs-14">
                                {bd?.country_code} {bd?.contact_number}{" "}
                              </h5>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div>
                              <p className="text-muted mb-1">Contact Email</p>
                              <h5 className="fs-14">{bd?.contact_email}</h5>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            {/* <Col xxl={6}>
              <Card key={1} className="border card-border-success">
                <CardBody>
                  <div
                    className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h5 className="mb-0 fs-14">
                          <Link to="#" className="text-body">
                            Lintcloud It Service Pvt Ltd
                            <span className="badge border border-dark text-body ms-2">
                              HEADQUARTER
                            </span>
                          </Link>
                        </h5>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="d-flex gap-1 align-items-center my-n2">
                          <div className="form-check form-switch form-switch-success  ">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="enableEPF"
                              checked="true"
                            />
                            <Label className="form-check-label" for="enableEPF">
                              Active
                            </Label>
                          </div>
                          <a
                            //onClick={() => handleTaxEdit(item.slabs)}
                            className="text-primary d-inline-block edit-item-btn ms-2"
                            href="javascript:void(0)"
                          >
                            <i class="ri-pencil-fill fs-16"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <Row className="gy-3">
                      <Col xs={12}>
                        <div>
                          <p className="text-muted mb-1">Address </p>
                          <h5 className="fs-14">
                            694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL,
                            OPP BUS STAND, VALLIOOR - 627117
                          </h5>
                        </div>
                        <hr />
                      </Col>
                    </Row>
                    <Row className="gy-3">
                      <Col xs={2}>
                        <div>
                          <p className="text-muted mb-1">Employees</p>
                          <h5 className="fs-14">25</h5>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div>
                          <p className="text-muted mb-1">Timezone</p>
                          <h5 className="fs-14">GMT +05:30 Asia/Kolkata</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Number</p>
                          <h5 className="fs-14">+91 999999999</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Email</p>
                          <h5 className="fs-14">elan@lintcloud.com</h5>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xxl={6}>
              <Card key={1} className="border card-border-success">
                <CardBody>
                  <div
                    className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h5 className="mb-0 fs-14">
                          <Link to="#" className="text-body">
                            Lintcloud It Service Pvt Ltd
                            <span className="badge border border-dark text-body ms-2">
                              HEADQUARTER
                            </span>
                          </Link>
                        </h5>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="d-flex gap-1 align-items-center my-n2">
                          <div className="form-check form-switch form-switch-success  ">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="enableEPF"
                              checked="true"
                            />
                            <Label className="form-check-label" for="enableEPF">
                              Active
                            </Label>
                          </div>
                          <a
                            //onClick={() => handleTaxEdit(item.slabs)}
                            className="text-primary d-inline-block edit-item-btn ms-2"
                            href="javascript:void(0)"
                          >
                            <i class="ri-pencil-fill fs-16"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <Row className="gy-3">
                      <Col xs={12}>
                        <div>
                          <p className="text-muted mb-1">Address </p>
                          <h5 className="fs-14">
                            694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL,
                            OPP BUS STAND, VALLIOOR - 627117
                          </h5>
                        </div>{" "}
                        <hr />
                      </Col>
                    </Row>
                    <Row className="gy-3">
                      <Col xs={2}>
                        <div>
                          <p className="text-muted mb-1">Employees</p>
                          <h5 className="fs-14">25</h5>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div>
                          <p className="text-muted mb-1">Timezone</p>
                          <h5 className="fs-14">GMT +05:30 Asia/Kolkata</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Number</p>
                          <h5 className="fs-14">+91 999999999</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Email</p>
                          <h5 className="fs-14">elan@lintcloud.com</h5>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col> */}
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Branch;
