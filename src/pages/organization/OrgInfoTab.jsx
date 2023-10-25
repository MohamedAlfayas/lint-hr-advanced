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

const OrgInfoTab = () => {
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
        <Col xl={9} lg={8}>
          <Card>
            <CardBody>
              <div>
                <h6 className="mb-3 fw-semibold text-uppercase">
                  Company Info
                </h6>

                <form onSubmit={submitProfileForm}>
                  <div className="live-preview">
                    <Row className="gy-4">
                      {/* <WebCheckInOutBtn /> */}

                      <Col xxl={8} md={7}>
                        <div>
                          <Label htmlFor="orgwebsite" className="form-label">
                            Company Website
                          </Label>
                          <div className="form-icon right">
                            <Input
                              type="text"
                              className="form-control form-control-icon"
                              id="orgwebsite"
                              placeholder="www.company.com"
                              value={profileData.website || ""}
                              onChange={(e) =>
                                updateProfileData("website", e.target.value)
                              }
                            />
                            <i className="ri-global-line"></i>
                          </div>
                          <div id="passwordHelpBlock" className="form-text">
                            Enter Your Company Website.
                          </div>
                        </div>
                      </Col>

                      <Col xxl={8} md={7}>
                        <div>
                          <Label>Contact Number*</Label>
                          <Dropdown
                            className="input-group"
                            isOpen={dropdownOpen4}
                            toggle={toggle4}>
                            <DropdownToggle
                              as="button"
                              className="btn btn-light border arrow-none">
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
                                updateProfileData(
                                  "contact_number",
                                  e.target.value
                                )
                              }
                            />
                            <DropdownMenu
                              as="ul"
                              className="list-unstyled w-100 dropdown-menu-list mb-0">
                              <SimpleBar
                                style={{ maxHeight: "220px" }}
                                className="px-3">
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
                                    className="dropdown-item d-flex">
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

                      <Col xxl={8} md={7}>
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
                                updateProfileData(
                                  "contact_email",
                                  e.target.value
                                )
                              }
                            />
                            <i className="ri-mail-line"></i>
                          </div>
                          <div id="passwordHelpBlock" className="form-text">
                            Enter Your Email.
                          </div>
                        </div>
                      </Col>

                      <Col xxl={8} md={7}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
                            Company Overview
                          </Label>
                          <textarea
                            className="form-control"
                            id="exampleFormControlTextarea5"
                            rows="3"
                            value={profileData.about || ""}
                            onChange={(e) =>
                              updateProfileData("about", e.target.value)
                            }></textarea>
                          <div id="passwordHelpBlock" className="form-text">
                            Company Overview.
                          </div>
                        </div>
                      </Col>

                      <Col xxl={8} md={12}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
                            Address
                          </Label>
                          <textarea
                            className="form-control"
                            id="exampleFormControlTextarea5"
                            rows="2"
                            value={profileData.address || ""}
                            onChange={(e) =>
                              updateProfileData("address", e.target.value)
                            }></textarea>
                          <div id="passwordHelpBlock" className="form-text">
                            Address.
                          </div>
                        </div>
                      </Col>

                      <Col xxl={8} md={6}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
                            Country
                          </Label>
                          <Dropdown isOpen={dropdownOpen3} toggle={toggle3}>
                            <DropdownToggle
                              tag="div"
                              className="form-control rounded-end flag-input form-select"
                              style={{ cursor: "pointer" }}>
                              {selectedCountry.countryName || "Select country"}
                            </DropdownToggle>
                            <DropdownMenu
                              as="ul"
                              className="list-unstyled w-100 dropdown-menu-list mb-0">
                              <SimpleBar
                                style={{ maxHeight: "220px" }}
                                className="px-3">
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
                                    className="dropdown-item d-flex">
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

                      <Col xxl={8} md={6}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
                            State
                          </Label>
                          <Dropdown isOpen={stateDD} toggle={stateToggle}>
                            <DropdownToggle
                              tag="div"
                              className="form-control rounded-end flag-input form-select"
                              style={{ cursor: "pointer" }}>
                              {stateList.find((obj) => obj === state) ||
                                "Select State"}
                            </DropdownToggle>
                            <DropdownMenu
                              as="ul"
                              className="list-unstyled w-100 dropdown-menu-list mb-0">
                              <SimpleBar
                                style={{ maxHeight: "220px" }}
                                className="px-3">
                                {(stateList || []).map((item, key) => (
                                  <DropdownItem
                                    as="li"
                                    onClick={() => setState(item)}
                                    key={key}
                                    className="dropdown-item d-flex">
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

                      <Col xxl={8} md={6}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
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

                      <Col xxl={8} md={6}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
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

                      <Col xxl={8} md={6}>
                        <div>
                          <Label
                            htmlFor="exampleFormControlTextarea5"
                            className="form-label">
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
                            <Col xxl={8} md={6}>
                              <div>
                                <Label htmlFor="lname" className="form-label">
                                  {obj.name}
                                </Label>
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
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text">
                                  Enter {obj.name}
                                </div>
                              </div>
                            </Col>
                          ))
                        : null}

                      <Col xxl={8} md={12}>
                        <Row>
                          {/* Dark Logo Section */}
                          <Col xxl={6} md={6}>
                            <div>
                              <Label
                                htmlFor="exampleFormControlTextarea5"
                                className="form-label">
                                Dark Logo
                              </Label>
                              <Dropzone
                                multiple={false}
                                onDrop={(acceptedFiles) => {
                                  handleAcceptedFiles(acceptedFiles, "dark");
                                }}>
                                {({ getRootProps, getInputProps }) => (
                                  <div className="dropzone dz-clickable">
                                    <div
                                      className="dz-message needsclick"
                                      {...getRootProps()}>
                                      <div className="mb-3">
                                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                                      </div>
                                      <h5>
                                        Drop files here or click to upload Dark
                                        Logo.
                                      </h5>
                                    </div>
                                  </div>
                                )}
                              </Dropzone>
                              <div
                                className="list-unstyled mb-0"
                                id="file-previews">
                                {darkLogoFile && (
                                  <Card
                                    className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                                    key={darkLogoFile + "-file"}>
                                    <div className="p-2">
                                      <Row className="align-items-center">
                                        <Col className="col-auto">
                                          <img
                                            data-dz-thumbnail=""
                                            height="80"
                                            className="avatar-sm rounded bg-light"
                                            alt={darkLogoFile.name}
                                            src={darkLogoFile.preview}
                                          />
                                        </Col>
                                        <Col>
                                          <Link
                                            to="#"
                                            className="text-muted font-weight-bold">
                                            {darkLogoFile.name}
                                          </Link>
                                          <p className="mb-0">
                                            <strong>
                                              {darkLogoFile.formattedSize}
                                            </strong>
                                          </p>
                                        </Col>
                                      </Row>
                                    </div>
                                  </Card>
                                )}
                              </div>

                              {profileData.dark_logo_image && (
                                <div className="p-2 m-3">
                                  <Row className="align-items-center">
                                    <Col className="col-auto">
                                      <img
                                        data-dz-thumbnail=""
                                        height="80"
                                        className="avatar-sm rounded bg-light"
                                        alt={profileData.dark_logo_image}
                                        src={profileData.dark_logo_image}
                                      />
                                    </Col>
                                  </Row>
                                </div>
                              )}
                            </div>
                          </Col>

                          {/* Light Logo Section */}

                          <Col xxl={6} md={6}>
                            <div>
                              <Label
                                htmlFor="exampleFormControlTextarea5"
                                className="form-label">
                                Light Logo
                              </Label>
                              <Dropzone
                                multiple={false}
                                onDrop={(acceptedFiles) => {
                                  handleAcceptedFiles(acceptedFiles, "light");
                                }}>
                                {({ getRootProps, getInputProps }) => (
                                  <div className="dropzone dz-clickable">
                                    <div
                                      className="dz-message needsclick"
                                      {...getRootProps()}>
                                      <div className="mb-3">
                                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                                      </div>
                                      <h5>
                                        Drop files here or click to upload Light
                                        Logo.
                                      </h5>
                                    </div>
                                  </div>
                                )}
                              </Dropzone>
                              <div
                                className="list-unstyled mb-0"
                                id="file-previews">
                                {lightLogoFile && (
                                  <Card
                                    className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                                    key={lightLogoFile + "-file"}>
                                    <div className="p-2">
                                      <Row className="align-items-center">
                                        <Col className="col-auto">
                                          <img
                                            data-dz-thumbnail=""
                                            height="80"
                                            className="avatar-sm rounded bg-light"
                                            alt={lightLogoFile.name}
                                            src={lightLogoFile.preview}
                                          />
                                        </Col>
                                        <Col>
                                          <Link
                                            to="#"
                                            className="text-muted font-weight-bold">
                                            {lightLogoFile.name}
                                          </Link>
                                          <p className="mb-0">
                                            <strong>
                                              {lightLogoFile.formattedSize}
                                            </strong>
                                          </p>
                                        </Col>
                                      </Row>
                                    </div>
                                  </Card>
                                )}
                              </div>
                            </div>

                            {profileData.light_logo_image && (
                              <div className="p-2 m-3">
                                <Row className="align-items-center">
                                  <Col className="col-auto">
                                    <img
                                      data-dz-thumbnail=""
                                      height="80"
                                      className="avatar-sm rounded bg-light"
                                      alt={profileData.light_logo_image}
                                      src={profileData.light_logo_image}
                                    />
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </Col>

                      <Col xxl={12} md={12}>
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </div>
                </form>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={3} lg={4}>
          <Card>
            <CardBody>
              <h5 className="card-title mb-4">Skills</h5>
              <div className="d-flex flex-wrap gap-2 fs-16">
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  UI/UX
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  Figma
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  HTML
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  CSS
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  Javascript
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  C#
                </div>
                <div className="badge fw-medium bg-secondary-subtle text-secondary">
                  Nodejs
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="align-items-center d-flex border-bottom-dashed">
              <h4 className="card-title mb-0 flex-grow-1">Members</h4>
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-soft-danger btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#inviteMembersModal">
                  <i className="ri-share-line me-1 align-bottom"></i> Invite
                  Member
                </button>
              </div>
            </CardHeader>

            <CardBody>
              <SimpleBar
                data-simplebar
                style={{ height: "235px" }}
                className="mx-n3 px-3">
                <div className="vstack gap-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar2}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Nancy Martino
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <div className="avatar-title bg-danger-subtle text-danger rounded-circle">
                        HB
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Henry Baird
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar3}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Frank Hook
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar4}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Jennifer Carter
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            type="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            tag="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <div className="avatar-title bg-success-subtle text-success rounded-circle">
                        AC
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Alexis Clarke
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <img
                        src={avatar7}
                        alt=""
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fs-13 mb-0">
                        <Link to="#" className="text-body d-block">
                          Joseph Parker
                        </Link>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex align-items-center gap-1">
                        <button type="button" className="btn btn-light btn-sm">
                          Message
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon btn-sm fs-16 text-muted dropdown">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                View
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                Favourite
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </SimpleBar>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="align-items-center d-flex border-bottom-dashed">
              <h4 className="card-title mb-0 flex-grow-1">Attachments</h4>
              <div className="flex-shrink-0">
                <button type="button" className="btn btn-soft-info btn-sm">
                  <i className="ri-upload-2-fill me-1 align-bottom"></i> Upload
                </button>
              </div>
            </CardHeader>

            <CardBody>
              <div className="vstack gap-2">
                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-folder-zip-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          App-pages.zip
                        </Link>
                      </h5>
                      <div>2.2MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-file-ppt-2-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          Velzon-admin.ppt
                        </Link>
                      </h5>
                      <div>2.4MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-folder-zip-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          Images.zip
                        </Link>
                      </h5>
                      <div>1.2MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded border-dashed p-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                          <i className="ri-image-2-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="fs-13 mb-1">
                        <Link
                          to="#"
                          className="text-body text-truncate d-block">
                          bg-pattern.png
                        </Link>
                      </h5>
                      <div>1.1MB</div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-icon text-muted btn-sm fs-18">
                          <i className="ri-download-2-line"></i>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                            type="button">
                            <i className="ri-more-fill"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <li>
                              <DropdownItem>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                Rename
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                Delete
                              </DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <button type="button" className="btn btn-success">
                    View more
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default OrgInfoTab;
