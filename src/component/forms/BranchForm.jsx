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
import { useDispatch, useSelector } from "react-redux";
import { CountryCodeDisplayInSelect } from "../../common/js/CountryCodeDisplayInSelect";
import { PostApi } from "../../common/api/PostApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
// import WebCheckInOutBtn from "../attendance/WebCheckInOutBtn";

const BranchForm = () => {
  const dispatch = useDispatch();

  const [stateListOptions, setStateListOptions] = useState([]);

  const [CountryCodeListOptions, setCountryCodeListOptions] = useState([]);
  const [CountryListOptions, setCountryListOptions] = useState([]);

  useEffect(() => {
    let country_code_list = [];
    let country_list = [];

    CountryList.filter((c) => c.show === true).map((d) => {
      country_code_list.push({
        ...d,
        label: d.countryCode,
        value: d.countryCode,
      });
      country_list.push({
        ...d,
        label: d.countryName,
        value: d.countryName,
      });
    });
    setCountryCodeListOptions(country_code_list);
    setCountryListOptions(country_list);
  }, []);

  // const CountryListOptions1 = CountryList.filter((c) => c.show === true).map(
  //   (d) => {
  //     return {
  //       ...d,
  //       label: d.countryName,
  //       value: d.countryName,
  //     };
  //   }
  // );

  // const CountryCodeListOptions1 = CountryList.filter((c) => c.show === true).map(
  //   (d) => {
  //     return {
  //       ...d,
  //       label: d.countryCode,
  //       value: d.countryCode,
  //     };
  //   }
  // );

  const inputRef = useRef();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    console.log("Form Obj = ", form_obj);
    setBranchObj(form_obj);
    if (!!form_obj?.country && form_obj?.country !== "") {
      setStateListOptions(
        CountryList.find((d) => d.countryName === form_obj?.country).states ||
          []
      );
    }
  }, [form_obj]);

  const [branchObj, setBranchObj] = useState({});

  const updateBranchObj = (e) => {
    const { name, value } = e.target;

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

    setBranchObj({
      ...branchObj,
      country_code: e.value,
    });
  };

  const handleCountryChange = (e) => {
    console.log("Country Change = ", e);

    setBranchObj({
      ...branchObj,
      country: e.value,
    });

    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value).states || []
    );
  };

  const submitBranchForm = async (e) => {
    e.preventDefault();
    console.log("Branch Form Submit = ", branchObj);

    dispatch(setLoaderVisible(true));

    const Api = await PostApi("branch/add-new/", branchObj, false);
    console.log("API RES = ", Api);
    if (Api.status && Api.status === 200) {
      toast.success(Api?.data?.message);
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }

    dispatch(setLoaderVisible(false));
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
                      <Label htmlFor="name" className="form-label">
                        Branch Name
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="name"
                          name="name"
                          placeholder="New Branch"
                          value={branchObj.name || ""}
                          onChange={updateBranchObj}
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
                            options={CountryCodeListOptions || []}
                            components={{
                              Option: CountryCodeDisplayInSelect,
                            }}
                            className="basic-multi-select"
                            value={
                              branchObj?.country_code !== ""
                                ? CountryCodeListOptions.find(
                                    (d) =>
                                      d.countryCode === branchObj.country_code
                                  )
                                : []
                            }
                            onChange={handleCountryCodeChange}
                          />
                        </Col>
                        <Col md={9}>
                          <Input
                            type="number"
                            name="contact_number"
                            className="form-control rounded-end flag-input"
                            placeholder="Enter number"
                            value={branchObj.contact_number || ""}
                            onChange={updateBranchObj}
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
                      <Label htmlFor="contact_email" className="form-label">
                        Contact Email*
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="email"
                          name="contact_email"
                          className="form-control form-control-icon"
                          id="contact_email"
                          placeholder="user@company.com"
                          value={branchObj.contact_email || ""}
                          onChange={updateBranchObj}
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
                      <Label htmlFor="about" className="form-label">
                        Company Overview
                      </Label>
                      <textarea
                        className="form-control"
                        id="about"
                        name="about"
                        rows="3"
                        value={branchObj.about || ""}
                        onChange={updateBranchObj}
                      ></textarea>
                      <div id="passwordHelpBlock" className="form-text">
                        Company Overview.
                      </div>
                    </div>
                  </Col>

                  <LocationSearch
                    branchObj={branchObj}
                    setBranchObj={setBranchObj}
                  />

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="address" className="form-label">
                        Address
                      </Label>
                      <textarea
                        className="form-control"
                        id="address"
                        name="address"
                        rows="2"
                        value={branchObj.address || ""}
                        onChange={updateBranchObj}
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
                          branchObj?.country !== ""
                            ? CountryListOptions.find(
                                (d) => d.value === branchObj.country
                              )
                            : []
                        }
                        onChange={handleCountryChange}
                      />
                      <div id="passwordHelpBlock" className="form-text">
                        Enter Country.
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
                            (d) => d.value === branchObj.state
                          ) || []
                        }
                        onChange={(e) =>
                          setBranchObj({ ...branchObj, state: e.value })
                        }
                      />

                      <div id="passwordHelpBlock" className="form-text">
                        Select State.
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="city" className="form-label">
                        City
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="city"
                          name="city"
                          placeholder="City"
                          value={branchObj.city || ""}
                          onChange={updateBranchObj}
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
                      <Label htmlFor="pincode" className="form-label">
                        Pincode
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="number"
                          className="form-control form-control-icon"
                          id="pincode"
                          name="pincode"
                          placeholder="666666"
                          value={branchObj.pincode || ""}
                          onChange={updateBranchObj}
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
                        <Select
                          name="timezone"
                          id="timezone"
                          value={
                            branchObj.timezone &&
                            timzone_options.find(
                              (e) => e.value === branchObj.timezone
                            )
                          }
                          onChange={(e) =>
                            setBranchObj({
                              ...branchObj,
                              timezone: e.value,
                            })
                          }
                          options={timzone_options}
                          placeholder="Select a time zone"
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
