import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import Select from "react-select";
import {
  gender_options,
  form_default_input_types,
  form_select_type,
  timzone_options,
  form_date_type,
  DateFormat,
} from "../../common/constant/Constants";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker } from "antd";
dayjs.extend(customParseFormat);

import indflag from "../../assets/images/flags/in.svg";
//SimpleBar
import SimpleBar from "simplebar-react";
import CountryList from "../../common/data/CountryList";
import Dropzone from "react-dropzone";
import axios from "axios";
import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { GoogleMap, Marker } from "@react-google-maps/api";
import LocationSearch from "../../pages/organization/LocationSearch";
import LocationSearch2 from "../../pages/organization/LocationSearch2";
import { useSelector } from "react-redux";
// import WebCheckInOutBtn from "../attendance/WebCheckInOutBtn";

const BranchForm = () => {
  const [stateList, setStateList] = useState([]);

  const CountryListOptions = CountryList.map((d) => {
    return {
      ...d,
      label: d.countryName,
      value: d.countryName,
    };
  });

  console.log("CountryListOptions = ", CountryListOptions);

  const inputRef = useRef();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  console.log("Branch Form Obj = ", form_obj);

  const [branchObj, setBranchObj] = useState({});

  const updateBranchObj = (name, value) => {
    setBranchObj({
      ...branchObj,
      [name]: value,
    });
  };

  const handleCFInputChange = (e, cf_id) => {
    const newPD = {
      ...branchObj,
      cf_values: [...branchObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.target.value } : item
      ),
    };
    setBranchObj(newPD);
  };

  const handleCFDateChange = (e, dateStr, cf_id) => {
    setBranchObj({
      ...branchObj,
      cf_values: [...branchObj.cf_values].map((item) =>
        item.id === cf_id
          ? { ...item, value: ConvertISODateFormat(ConvertDateFormat(dateStr)) }
          : item
      ),
    });
  };

  const handleCFSelectChange = (e, cf_id) => {
    setBranchObj({
      ...branchObj,
      cf_values: [...branchObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.value } : item
      ),
    });
  };

  const handleCountryCodeChange = (e) => {
    console.log("COUntry Code = ", e);

    setProfileData({
      ...profileData,
      country: e.value,
      country_code: e.countryCode,
    });

    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value).states || []
    );
  };

  const handleCountryChange = (e) => {
    console.log("Country Change = ", e);

    setProfileData({
      ...profileData,
      country: e.value,
      country_code: e.countryCode,
      state: "",
    });

    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value).states || []
    );
  };

  const submitBranchForm = (e) => {
    e.preventDefault();
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} lg={12}>
          <div>
            <form onSubmit={submitBranchForm}>
              <div className="live-preview">
                <Row className="gy-4">
                  <Col lg={12}>
                    <div>
                      <Label htmlFor="branchName" className="form-label">
                        Branch Name
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="branchName"
                          placeholder="New Branch"
                        />
                        <i className="ri-building-2-line"></i>
                      </div>
                      <div id="passwordHelpBlock" className="form-text">
                        Enter Your Branch Name.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label>Contact Number*</Label>
                      <Row>
                        <Col md={3}>
                          <Select
                            id="country_code"
                            name="country_code"
                            isMulti={false}
                            options={CountryListOptions || []}
                            styles={CountryCodeDisplayStyles}
                            components={{
                              Option: CountryCodeDisplayInSelect,
                              SingleValue: CountryCodeDisplayInSelect,
                            }}
                            className="basic-multi-select"
                            value={
                              profileData?.country_code !== ""
                                ? CountryListOptions.find(
                                    (d) =>
                                      d.countryCode === profileData.country_code
                                  )
                                : []
                            }
                            onChange={handleCountryCodeChange}
                          />
                        </Col>
                        <Col md={9}>
                          <Input
                            type="number"
                            className="form-control rounded-end flag-input"
                            placeholder="Enter number"
                            value={profileData.contact_number || ""}
                            onChange={(e) =>
                              updateProfileData(
                                "contact_number",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                      </Row>

                      <div id="passwordHelpBlock" className="form-text">
                        Enter Your Contact number with country code.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="companyemail" className="form-label">
                        Contact Email*
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="email"
                          className="form-control form-control-icon"
                          id="companyemail"
                          placeholder="user@company.com"
                          value={branchObj.contact_email || ""}
                          onChange={(e) =>
                            updateBranchObj("contact_email", e.target.value)
                          }
                        />
                        <i className="ri-mail-line"></i>
                      </div>
                      <div id="passwordHelpBlock" className="form-text">
                        Enter Your Email.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="branchOverview" className="form-label">
                        Company Overview
                      </Label>
                      <textarea
                        className="form-control"
                        id="branchOverview"
                        rows="3"
                        value={branchObj.about || ""}
                        onChange={(e) =>
                          updateBranchObj("about", e.target.value)
                        }
                      ></textarea>
                      <div id="passwordHelpBlock" className="form-text">
                        Company Overview.
                      </div>
                    </div>
                  </Col>

                  <LocationSearch />

                  <Col lg={12}>
                    <div>
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        Address
                      </Label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea5"
                        rows="2"
                        value={branchObj.address || ""}
                        onChange={(e) =>
                          updateBranchObj("address", e.target.value)
                        }
                      ></textarea>
                      <div id="passwordHelpBlock" className="form-text">
                        Address.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="country" className="form-label">
                        Country
                      </Label>
                      <Select
                        id="country"
                        name="country"
                        isMulti={false}
                        options={CountryListOptions || []}
                        className="basic-multi-select"
                        value={
                          profileData?.country !== ""
                            ? CountryListOptions.find(
                                (d) => d.value === profileData.country
                              )
                            : []
                        }
                        onChange={handleCountryChange}
                      />

                      <div id="passwordHelpBlock" className="form-text">
                        Select Country.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        State
                      </Label>
                      <Select
                        id="state"
                        name="state"
                        isMulti={false}
                        options={stateListOptions || []}
                        className="basic-multi-select"
                        value={
                          stateListOptions.find(
                            (d) => d.value === profileData.state
                          ) || []
                        }
                        onChange={(e) =>
                          setProfileData({ ...profileData, state: e.value })
                        }
                      />

                      <div id="passwordHelpBlock" className="form-text">
                        Select State.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        City
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="companycity"
                          placeholder="Chennai"
                          value={branchObj.city || ""}
                          onChange={(e) =>
                            updateBranchObj("city", e.target.value)
                          }
                        />
                        <i className="ri-mail-line"></i>
                      </div>
                      <div id="passwordHelpBlock" className="form-text">
                        Select City.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        Pincode
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="number"
                          className="form-control form-control-icon"
                          id="companypincode"
                          placeholder="666666"
                          value={branchObj.pincode || ""}
                          onChange={(e) =>
                            updateBranchObj("pincode", e.target.value)
                          }
                        />
                        <i className="ri-mail-line"></i>
                      </div>
                      <div id="passwordHelpBlock" className="form-text">
                        Pincode.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        Time Zone
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="timezone"
                          placeholder="Asia/Kolkata"
                          value={timezone || ""}
                          onChange={(e) => setTimeZone(e.target.value)}
                        />
                        <i className="ri-time-line"></i>
                      </div>
                      <div id="passwordHelpBlock" className="form-text">
                        Time Zone.
                      </div>
                    </div>
                  </Col>

                  {branchObj.cf_values && branchObj.cf_values.length
                    ? branchObj.cf_values.map((obj) => (
                        <Col lg={12}>
                          <div>
                            <Label htmlFor="lname" className="form-label">
                              {obj.name}
                            </Label>
                            {form_default_input_types.includes(obj.type) && (
                              <div className="form-icon right">
                                <Input
                                  type={obj.type || "text"}
                                  name={obj.input_name}
                                  id={obj.input_name}
                                  className="form-control"
                                  placeholder={`Enter ${obj.name}`}
                                  value={obj.value || ""}
                                  required={obj.is_required || false}
                                  onChange={(e) =>
                                    handleCFInputChange(e, obj.id)
                                  }
                                />
                              </div>
                            )}
                            {obj.type === form_date_type && (
                              <DatePicker
                                name={obj.input_name}
                                id={obj.input_name}
                                className="form-control"
                                format={DateFormat}
                                value={
                                  obj.value === ""
                                    ? null
                                    : dayjs(
                                        ConvertDateFormat(obj.value),
                                        DateFormat
                                      )
                                }
                                allowClear={false}
                                onChange={(e, dateStr) =>
                                  handleCFDateChange(e, dateStr, obj.id)
                                }
                              />
                            )}
                            <div id="passwordHelpBlock" className="form-text">
                              Enter {obj.name}
                            </div>
                          </div>
                        </Col>
                      ))
                    : null}

                  <Col lg={12}>
                    <div className="text-end">
                      <Button
                        color="success"
                        type="submit"
                        className="btn-label"
                      >
                        {" "}
                        <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                        Save{" "}
                      </Button>{" "}
                    </div>
                  </Col>
                </Row>
              </div>
            </form>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BranchForm;
