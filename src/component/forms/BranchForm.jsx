import React, { useEffect, useMemo, useState } from "react";
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

//import images
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import avatar10 from "../../assets/images/users/avatar-10.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import image4 from "../../assets/images/small/img-4.jpg";
import image5 from "../../assets/images/small/img-5.jpg";

import indflag from "../../assets/images/flags/in.svg";
//SimpleBar
import SimpleBar from "simplebar-react";
import CountryList from "../../common/data/CountryList";
import Dropzone from "react-dropzone";
import axios from "axios";
import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { GetCustomField } from "../../common/js/GetCustomField";
// import WebCheckInOutBtn from "../attendance/WebCheckInOutBtn";

const BranchForm = () => {
  const [stateList, setStateList] = useState([]);
  const [contactCountry, setContactCountry] = useState({
    id: 240,
    flagImg: indflag,
    countryName: "India",
    countryCode: "+91",
  });

  const [selectedCountry, setSelectedCountry] = useState({});

  const [dropdownOpen3, setDropdownOpen3] = useState(false);
  const [dropdownOpen4, setDropdownOpen4] = useState(false);
  const [stateDD, setStateDD] = useState(false);

  const toggle3 = () => setDropdownOpen3((prevState) => !prevState);
  const toggle4 = () => setDropdownOpen4((prevState) => !prevState);
  const stateToggle = () => setStateDD((prevState) => !prevState);

  // Custom Field Option

  const CustomFieldsForThisForm = GetCustomField("organization") || [];

  // Set Empty Data To form

  const initialData = useMemo(() => {
    return {
      id: "0",
      website: "",
      contact_number: "",
      country_code: "+91",
      contact_email: "",
      about: "",
      address: "",
      city: "",
      pincode: "",
      cf_values: CustomFieldsForThisForm || [],
    };
  }, []);

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [timezone, setTimeZone] = useState("");
  const [profileData, setProfileData] = useState(initialData);

  useEffect(() => {
    Api({
      method: "GET",
      url: "/company/get-profile/",
    })
      .then((res) => {
        console.log("res = ", res);
        let thisCFValues = [...res?.data?.data?.cf_values];
        let cf = [];
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
        console.log("CF === ", cf);
        setCountry(res?.data?.data?.country);
        setProfileData({ ...res?.data?.data, cf_values: cf });
        setState(res?.data?.data?.state);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (country !== "" && country !== undefined && country !== null) {
      let CountryObj = CountryList.find((obj) => obj.countryName === country);
      setSelectedCountry(CountryObj);
      setContactCountry(CountryObj);
      setStateList(CountryObj?.states);
      setTimeZone(CountryObj?.timezone);
      if (changeId === 0) {
        setState("");
      }
    }
  }, [country]);

  const updateProfileData = (name, value) => {
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  console.log("hhh", profileData);

  const [changeId, setChangeId] = useState(1);

  const [darkLogoFile, setDarkLogoFile] = useState(null);
  const [lightLogoFile, setLightLogoFile] = useState(null);

  function handleAcceptedFiles(file, logo_type) {
    let chosenFile = Object.assign(file[0], {
      preview: URL.createObjectURL(file[0]),
      formattedSize: formatBytes(file[0].size),
    });
    logo_type === "dark"
      ? setDarkLogoFile(chosenFile)
      : setLightLogoFile(chosenFile);
  }

  /**
   * Formats the size
   */
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  const handleCFInputChange = (e, cf_id) => {
    const newPD = {
      ...profileData,
      cf_values: [...profileData.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.target.value } : item
      ),
    };
    setProfileData(newPD);
  };
  const handleCFDateChange = (e, dateStr, cf_id) => {
    setProfileData({
      ...profileData,
      cf_values: [...profileData.cf_values].map((item) =>
        item.id === cf_id
          ? { ...item, value: ConvertISODateFormat(ConvertDateFormat(dateStr)) }
          : item
      ),
    });
  };

  const submitProfileForm = (e) => {
    e.preventDefault();
    let tempKey = ["country", "state", "timezone"];
    tempKey.map((obj) => {
      if (obj in profileData) {
        delete profileData.obj;
      }
    });

    let form_data = new FormData();
    darkLogoFile !== null &&
      form_data.append("dark_logo", darkLogoFile, darkLogoFile.name);
    lightLogoFile !== null &&
      form_data.append("light_logo", lightLogoFile, lightLogoFile.name);

    Object.entries(profileData).map((key, idx) => {
      if (key[0] === "cf_values") {
        form_data.append(key[0], JSON.stringify(key[1]));
      } else {
        form_data.append(key[0], key[1]);
      }
    });

    form_data.append("country", country);
    form_data.append("timezone", timezone);
    form_data.append("state", state);

    Api({
      method: "POST",
      url: "/company/save-profile/",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: form_data,
    })
      .then((res) => {
        console.log("RES ==== ", res);
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        console.log("ERRR === ", err);
        toast.error(err?.response?.data?.message);
      });
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} lg={12}>
          <div>
            <h6 className="mb-3 fw-semibold text-uppercase">Company Info</h6>

            <form onSubmit={submitProfileForm}>
              <div className="live-preview">
                <Row className="gy-4">
                  {/* <WebCheckInOutBtn /> */}

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
                      <Dropdown
                        className="input-group"
                        isOpen={dropdownOpen4}
                        toggle={toggle4}
                      >
                        <DropdownToggle
                          as="button"
                          className="btn btn-light border arrow-none"
                        >
                          <img
                            src={contactCountry.flagImg}
                            alt="country flag"
                            className="options-flagimg"
                            height="20"
                          />
                          <span className="countrylist-codeno text-muted">
                            {contactCountry.countryCode}
                          </span>
                        </DropdownToggle>
                        <input
                          type="number"
                          className="form-control rounded-end flag-input"
                          placeholder="Enter number"
                          value={profileData.contact_number || ""}
                          onChange={(e) =>
                            updateProfileData("contact_number", e.target.value)
                          }
                        />
                        <DropdownMenu
                          as="ul"
                          className="list-unstyled w-100 dropdown-menu-list mb-0"
                        >
                          <SimpleBar
                            style={{ maxHeight: "220px" }}
                            className="px-3"
                          >
                            {(
                              CountryList.filter((obj) => obj.show).sort(
                                (a, b) =>
                                  a.countryName.localeCompare(b.countryName)
                              ) || []
                            ).map((item, key) => (
                              <DropdownItem
                                as="li"
                                onClick={() => {
                                  updateProfileData(
                                    "country_code",
                                    item.countryCode
                                  );
                                  setContactCountry(item);
                                }}
                                key={key}
                                className="dropdown-item d-flex"
                              >
                                <div className="flex-shrink-0 me-2">
                                  <img
                                    src={item.flagImg}
                                    alt="country flag"
                                    className="options-flagimg"
                                    height="20"
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex">
                                    <div className="country-name me-1">
                                      {item.countryName}
                                    </div>
                                    <span className="countrylist-codeno text-muted">
                                      {item.countryCode}
                                    </span>
                                  </div>
                                </div>
                              </DropdownItem>
                            ))}
                          </SimpleBar>
                        </DropdownMenu>
                      </Dropdown>

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
                          value={profileData.contact_email || ""}
                          onChange={(e) =>
                            updateProfileData("contact_email", e.target.value)
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
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        Company Overview
                      </Label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea5"
                        rows="3"
                        value={profileData.about || ""}
                        onChange={(e) =>
                          updateProfileData("about", e.target.value)
                        }
                      ></textarea>
                      <div id="passwordHelpBlock" className="form-text">
                        Company Overview.
                      </div>
                    </div>
                  </Col>

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
                        value={profileData.address || ""}
                        onChange={(e) =>
                          updateProfileData("address", e.target.value)
                        }
                      ></textarea>
                      <div id="passwordHelpBlock" className="form-text">
                        Address.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label
                        htmlFor="exampleFormControlTextarea5"
                        className="form-label"
                      >
                        Country
                      </Label>
                      <Dropdown isOpen={dropdownOpen3} toggle={toggle3}>
                        <DropdownToggle
                          tag="div"
                          className="form-control rounded-end flag-input form-select"
                          style={{ cursor: "pointer" }}
                        >
                          {selectedCountry.countryName || "Select country"}
                        </DropdownToggle>
                        <DropdownMenu
                          as="ul"
                          className="list-unstyled w-100 dropdown-menu-list mb-0"
                        >
                          <SimpleBar
                            style={{ maxHeight: "220px" }}
                            className="px-3"
                          >
                            {(
                              CountryList.filter((obj) => obj.show).sort(
                                (a, b) =>
                                  a.countryName.localeCompare(b.countryName)
                              ) || []
                            ).map((item, key) => (
                              <DropdownItem
                                as="li"
                                onClick={() => {
                                  setChangeId(0);
                                  setCountry(item.countryName);
                                }}
                                key={key}
                                className="dropdown-item d-flex"
                              >
                                <div className="flex-shrink-0 me-2">
                                  <img
                                    src={item.flagImg}
                                    alt="country flag"
                                    className="options-flagimg"
                                    height="20"
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex">
                                    <div className="country-name me-1">
                                      {item.countryName}
                                    </div>
                                    <span className="countrylist-codeno text-muted">
                                      {item.countryCode}
                                    </span>
                                  </div>
                                </div>
                              </DropdownItem>
                            ))}
                          </SimpleBar>
                        </DropdownMenu>
                      </Dropdown>
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
                      <Dropdown isOpen={stateDD} toggle={stateToggle}>
                        <DropdownToggle
                          tag="div"
                          className="form-control rounded-end flag-input form-select"
                          style={{ cursor: "pointer" }}
                        >
                          {stateList.find((obj) => obj === state) ||
                            "Select State"}
                        </DropdownToggle>
                        <DropdownMenu
                          as="ul"
                          className="list-unstyled w-100 dropdown-menu-list mb-0"
                        >
                          <SimpleBar
                            style={{ maxHeight: "220px" }}
                            className="px-3"
                          >
                            {(stateList || []).map((item, key) => (
                              <DropdownItem
                                as="li"
                                onClick={() => setState(item)}
                                key={key}
                                className="dropdown-item d-flex"
                              >
                                <div className="flex-grow-1">
                                  <div className="d-flex">
                                    <div className="country-name me-1">
                                      {item}
                                    </div>
                                  </div>
                                </div>
                              </DropdownItem>
                            ))}
                          </SimpleBar>
                        </DropdownMenu>
                      </Dropdown>
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
                          value={profileData.city || ""}
                          onChange={(e) =>
                            updateProfileData("city", e.target.value)
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
                          value={profileData.pincode || ""}
                          onChange={(e) =>
                            updateProfileData("pincode", e.target.value)
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

                  {profileData.cf_values && profileData.cf_values.length
                    ? profileData.cf_values.map((obj) => (
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
