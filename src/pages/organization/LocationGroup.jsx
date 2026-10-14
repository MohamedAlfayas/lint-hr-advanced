import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody } from "reactstrap";

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
import "./LocationGroup.scss";
import { testId, itemTestKey } from "../../shared/testing/testId";

const LG_TONES = ["success", "primary", "info", "warning", "danger"];

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

  const [query, setQuery] = useState("");

  const groups = location_group_data || [];
  const q = query.trim().toLowerCase();
  const visibleGroups = q
    ? groups.filter((g) =>
        [g?.name, g?.description]
          .filter(Boolean)
          .some((v) => String(v).trim().toLowerCase().startsWith(q)))
    : groups;

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <React.Fragment>
      <Card className="apv-card it-card lgp">
        <CardBody>
          <div className="lgp-top">
            <div className="apv-head">
              <span className="apv-head-icon tone-success">
                <i className="ri-map-pin-range-line"></i>
              </span>
              <div>
                <h5 className="apv-head-title">Location Group</h5>
                <span className="apv-head-sub">
                  {groups.length} {groups.length === 1 ? "group" : "groups"} · Bundle office locations for attendance rules
                </span>
              </div>
            </div>

            <div className="lgp-actions">
              {groups.length > 0 && (
                <div className="lgp-search">
                  <i className="ri-search-line"></i>
                  <input
                    data-testid="location-group-list-search-groups-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search groups…"
                  />
                  {query && (
                    <button data-testid="location-group-list-clear-search-button" type="button" onClick={() => setQuery("")} aria-label="Clear search">
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              )}
              {showCreateBtn && (
                <button data-testid="location-group-list-new-location-group-button" type="button" className="it-btn is-primary" onClick={() => handleCreateOrEdit(0)}>
                  <i className="ri-add-line"></i>New Location Group
                </button>
              )}
            </div>
          </div>

          {visibleGroups.length > 0 && (
            <div className="lgp-grid">
              {visibleGroups.map((lg, i) => (
                <div key={lg.id} className={`lgp-item tone-${LG_TONES[i % LG_TONES.length]}`}>
                  <div className="lgp-item-head">
                    <span className="lgp-item-icon">
                      {(lg?.name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="lgp-item-title">
                      <h6 title={lg?.name}>{lg?.name}</h6>
                      <span className="lgp-pill"><span></span>Active</span>
                    </div>
                    {showEditBtn && (
                      <button
                        data-testid={testId("location-group-list-edit-group", itemTestKey(lg), "button")}
                        type="button"
                        className="lgp-edit"
                        onClick={() => handleCreateOrEdit(lg?.id, lg)}
                        title="Edit group"
                      >
                        <i className="ri-pencil-line"></i>
                      </button>
                    )}
                  </div>

                  <p className={`lgp-desc ${lg?.description ? "" : "is-empty"}`}>
                    {lg?.description || "No description added"}
                  </p>

                  <div className="lgp-meta">
                    <span><i className="ri-calendar-2-line"></i>Created {fmtDate(lg?.created_on)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {groups.length > 0 && visibleGroups.length === 0 && (
            <div className="lgp-empty">
              <span className="lgp-empty-icon"><i className="ri-search-line"></i></span>
              <h6>No groups match “{query}”</h6>
              <p>Try a different name or clear the search.</p>
            </div>
          )}

          {groups.length === 0 && (
            <div className="lgp-empty">
              <span className="lgp-empty-icon"><i className="ri-map-pin-2-line"></i></span>
              <h6>No location groups yet</h6>
              <p>Group your office locations to apply attendance rules together.</p>
              {showCreateBtn && (
                <button data-testid="location-group-list-create-your-first-group-button" type="button" className="it-btn is-primary mt-2" onClick={() => handleCreateOrEdit(0)}>
                  <i className="ri-add-line"></i>Create your first group
                </button>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default LocationGroup;
