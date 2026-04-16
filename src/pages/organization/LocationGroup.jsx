import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  Label,
} from "reactstrap";

import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";

import { setLocationGroup } from "../../redux/reducers/ChildReducer/LocationGroupReducer";

import {
  CREATE_BRANCH_ACCESS_KEY,
  EDIT_BRANCH_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";
import { GetApi } from "../../common/api/GetApi";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const LocationGroup = () => {
  const dispatch = useDispatch();

  const { location_group_data } = useSelector(
    (state) => state.LocationGroupReducer
  );

  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showEditBtn, setShowEditBtn] = useState(false);

  useEffect(() => {
    setShowCreateBtn(CheckRoleAccess(CREATE_BRANCH_ACCESS_KEY));
    setShowEditBtn(CheckRoleAccess(EDIT_BRANCH_ACCESS_KEY));

    fetchGroups();
  }, []);

  // ✅ Fetch API
  const fetchGroups = async () => {
    dispatch(setLocationGroup(GetLocalStorageData('location_groups')))
  };

  // ✅ Initial Form
  const initialFormObj = useMemo(
    () => ({
      id: 0,
      name: "",
      description: "",
    }),
    []
  );

  // ✅ Create / Edit
  const handleCreateOrEdit = (id, obj = null) => {
    let formObj = id === 0 ? initialFormObj : { ...obj };

    dispatch(setFormTitle("Location Group Form"));
    dispatch(setFormObj(formObj));
    dispatch(setFormWidthPercentage("35%"));
    dispatch(setComponentToShow("LocationGroupForm"));
    dispatch(toggleRSBView(true));
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          {showCreateBtn && (
            <span className="float-end">
              <button
                className="btn btn-success add-btn"
                onClick={() => handleCreateOrEdit(0)}
              >
                <i className="ri-add-line align-bottom me-1"></i>
                New Location Group
              </button>
            </span>
          )}
          <h4 className="card-title mb-0">Location Group</h4>
        </CardHeader>

        <CardBody>
          <Row>
            {!!location_group_data &&
              location_group_data.length > 0 &&
              location_group_data.map((lg) => (
                <Col xxl={6} key={lg.id}>
                  <Card className="border card-border-success">
                    <CardBody>
                      {/* HEADER */}
                      <div className="p-3 mt-n3 mx-n3 bg-success-subtle rounded-top">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <h5 className="mb-0 fs-14">
                              {lg?.name}
                            </h5>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="d-flex gap-1 align-items-center my-n2">
                              
                              {/* SWITCH (UI ONLY) */}
                              <div className="form-check form-switch form-switch-success">
                                <Input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={true}
                                  readOnly
                                />
                                <Label className="form-check-label">
                                  Active
                                </Label>
                              </div>

                              {/* EDIT ONLY */}
                              {showEditBtn && (
                                <button
                                  onClick={() =>
                                    handleCreateOrEdit(lg?.id, lg)
                                  }
                                  className="btn btn-link text-primary d-inline-block ms-2 p-0"
                                >
                                  <i className="ri-pencil-fill fs-16"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BODY */}
                      <div className="py-3">
                        <Row className="gy-3">
                          <Col xs={12}>
                            <div>
                              <h5 className="fs-14">
                                {lg?.description || "—"}
                              </h5>
                            </div>
                            <hr />
                          </Col>
                        </Row>

                        <Row className="gy-3">
                          <Col xs={12}>
                            <div>
                              <p className="text-muted mb-1">
                                Created On
                              </p>
                              <h5 className="fs-14">
                                {lg?.created_on
                                  ? new Date(
                                      lg.created_on
                                    ).toLocaleDateString()
                                  : "—"}
                              </h5>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}

            {/* EMPTY STATE */}
            {(!location_group_data ||
              location_group_data.length === 0) && (
              <div className="text-center py-5 text-muted w-100">
                <i className="ri-map-pin-line fs-48 mb-2 d-block" />
                No location groups found
              </div>
            )}
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default LocationGroup;