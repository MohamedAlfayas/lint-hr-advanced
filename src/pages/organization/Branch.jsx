import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card, CardBody } from "reactstrap";
// import { Table } from 'rsuite';
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import "./Branch.scss";
import { GetCustomField } from "../../common/js/GetCustomField";
import { organization_component_name } from "../../common/constant/Constants";

import {
  CREATE_BRANCH_ACCESS_KEY,
  EDIT_BRANCH_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setBranch } from "../../redux/reducers/ChildReducer/BranchReducer";
import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";
import { testId, itemTestKey } from "../../shared/testing/testId";

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

  const [query, setQuery] = useState("");

  const branches = Array.isArray(branch_data) ? branch_data : [];
  const q = query.trim().toLowerCase();
  const visibleBranches = q
    ? branches.filter((b) =>
        [b?.name, b?.city, b?.state, b?.contact_email, b?.about]
          .filter(Boolean)
          .some((v) => String(v).trim().toLowerCase().startsWith(q)))
    : branches;

  const totalEmployees = branches.reduce((s, b) => s + (Number(b?.no_of_employees) || 0), 0);
  const totalLocations = branches.reduce((s, b) => s + (b?.location_details?.length || 0), 0);

  const initials = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "B";

  return (
    <React.Fragment>
      <Card className="apv-card it-card brp">
        <CardBody>
          <div className="brp-top">
            <div className="apv-head">
              <span className="apv-head-icon tone-primary">
                <i className="ri-building-2-line"></i>
              </span>
              <div>
                <h5 className="apv-head-title">Branch</h5>
                <span className="apv-head-sub">
                  {branches.length} {branches.length === 1 ? "branch" : "branches"} · {totalEmployees} employees · {totalLocations} locations
                </span>
              </div>
            </div>

            <div className="brp-actions">
              {branches.length > 1 && (
                <div className="brp-search">
                  <i className="ri-search-line"></i>
                  <input data-testid="branch-list-search-branches-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search branches…" />
                  {query && (
                    <button data-testid="branch-list-clear-search-button" type="button" onClick={() => setQuery("")} aria-label="Clear search">
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              )}
              {showCreateBtn && (
                <button
                  data-testid="branch-list-new-branch-button"
                  type="button"
                  id="create-btn"
                  className="it-btn is-primary"
                  onClick={() => handleBranchCreateOrEdit(0)}
                >
                  <i className="ri-add-line"></i>New Branch
                </button>
              )}
            </div>
          </div>

          <div className="brp-list">
            {visibleBranches.map((bd) => {
              const isHQ = bd?.type === 1;
              const locations = bd?.location_details || [];
              const address = [bd?.city, bd?.state, bd?.country, bd?.pincode].filter(Boolean).join(", ");
              const phone = [bd?.country_code, bd?.contact_number].filter(Boolean).join(" ");
              return (
                <div key={bd?.id} className={`brp-item ${isHQ ? "is-hq" : ""}`}>
                  <div className="brp-band">
                    <span className="brp-avatar">{initials(bd?.name)}</span>
                    <div className="brp-title">
                      <div className="brp-name-row">
                        <h5 title={bd?.name}>{bd?.name}</h5>
                        {isHQ && (
                          <span className="brp-hq"><i className="ri-vip-crown-2-fill"></i>Headquarter</span>
                        )}
                      </div>
                      {address && (
                        <span className="brp-address"><i className="ri-map-pin-line"></i>{address}</span>
                      )}
                    </div>
                    {showEditBtn && (
                      <button
                        data-testid={testId("branch-list-edit", itemTestKey(bd), "button")}
                        type="button"
                        className="brp-edit"
                        onClick={() => handleBranchCreateOrEdit(bd?.id, bd)}
                      >
                        <i className="ri-pencil-line"></i>Edit
                      </button>
                    )}
                  </div>

                  <div className="brp-body">
                    {bd?.about && <p className="brp-about">{bd.about}</p>}

                    <div className="brp-stats">
                      <div className="brp-stat tone-info">
                        <span className="brp-stat-icon"><i className="ri-team-line"></i></span>
                        <div>
                          <b>{bd?.no_of_employees || 0}</b>
                          <small>Employees</small>
                        </div>
                      </div>
                      <div className="brp-stat tone-success">
                        <span className="brp-stat-icon"><i className="ri-map-pin-2-line"></i></span>
                        <div>
                          <b>{locations.length}</b>
                          <small>Locations</small>
                        </div>
                      </div>
                      <div className="brp-stat tone-warning">
                        <span className="brp-stat-icon"><i className="ri-community-line"></i></span>
                        <div>
                          <b>{bd?.city || "—"}</b>
                          <small>City</small>
                        </div>
                      </div>

                      <div className="brp-contacts">
                        {phone && (
                          <a data-testid={testId("branch-list-contact-number", itemTestKey(bd), "link")} className="brp-contact" href={`tel:${phone.replace(/\s+/g, "")}`}>
                            <span><i className="ri-phone-line"></i></span>
                            <div>
                              <small>Contact number</small>
                              <b>{phone}</b>
                            </div>
                          </a>
                        )}
                        {bd?.contact_email && (
                          <a data-testid={testId("branch-list-contact-email", itemTestKey(bd), "link")} className="brp-contact" href={`mailto:${bd.contact_email}`}>
                            <span><i className="ri-mail-line"></i></span>
                            <div>
                              <small>Contact email</small>
                              <b>{bd.contact_email}</b>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>

                    {locations.length > 0 && (
                      <div className="brp-locs">
                        <span className="brp-locs-label">Locations</span>
                        {locations.slice(0, 5).map((loc, i) => (
                          <span key={loc?.id ?? i} className="brp-loc" title={loc?.accurate_address || loc?.name}>
                            <i className="ri-map-pin-2-line"></i>{loc?.name || `Location ${i + 1}`}
                            {loc?.radius_range ? <em>{loc.radius_range} m</em> : null}
                          </span>
                        ))}
                        {locations.length > 5 && <span className="brp-loc is-more">+{locations.length - 5} more</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {branches.length > 0 && visibleBranches.length === 0 && (
            <div className="brp-empty">
              <span className="brp-empty-icon"><i className="ri-search-line"></i></span>
              <h6>No branches match “{query}”</h6>
              <p>Try a different name or city.</p>
            </div>
          )}

          {branches.length === 0 && (
            <div className="brp-empty">
              <span className="brp-empty-icon"><i className="ri-building-2-line"></i></span>
              <h6>No branches yet</h6>
              <p>Add your first office to start organising employees and locations.</p>
              {showCreateBtn && (
                <button data-testid="branch-list-create-branch-button" type="button" className="it-btn is-primary mt-2" onClick={() => handleBranchCreateOrEdit(0)}>
                  <i className="ri-add-line"></i>Create branch
                </button>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Branch;
