import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  Input,
  Label,
  Row,
} from "reactstrap";
import Select from "react-select";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import DummyUserImg from "../../assets/images/users/user.png";

import Flatpickr from "react-flatpickr";

import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import {
  addEmployee,
  editEmployee,
} from "../../redux/reducers/ChildReducer/EmployeeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { ConvertISODateFormat } from "../../common/js/ConvertDateFormat";
const EmployeeForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [employeeObj, setEmployeeObj] = useState({});

  const dep_options = GetLocalStorageData("department") || [];
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const role_option = GetLocalStorageData("role") || [];

  const [employeeImage, setEmployeeImage] = useState(null);
  const [subDepOptions, setSubDeptOptions] = useState(dep_options);
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const timezones = [
    

    "Africa/Abidjan",

    "Africa/Accra",

    "Africa/Addis_Ababa",

    "Africa/Algiers",

    "Africa/Asmara",

    "Africa/Bamako",

    "Africa/Bangui",

    "Africa/Banjul",

    "Africa/Bissau",

    "Africa/Blantyre",

    "Africa/Brazzaville",

    "Africa/Bujumbura",

    "Africa/Cairo",

    "Africa/Casablanca",

    "Africa/Ceuta",

    "Africa/Conakry",

    "Africa/Dakar",

    "Africa/Dar_es_Salaam",

    "Africa/Djibouti",

    "Africa/Douala",

    "Africa/El_Aaiun",

    "Africa/Freetown",

    "Africa/Gaborone",

    "Africa/Harare",

    "Africa/Johannesburg",

    "Africa/Juba",

    "Africa/Kampala",

    "Africa/Khartoum",

    "Africa/Kigali",

    "Africa/Kinshasa",

    "Africa/Lagos",

    "Africa/Libreville",

    "Africa/Lome",

    "Africa/Luanda",

    "Africa/Lubumbashi",

    "Africa/Lusaka",

    "Africa/Malabo",

    "Africa/Maputo",

    "Africa/Maseru",

    "Africa/Mbabane",

    "Africa/Mogadishu",

    "Africa/Monrovia",

    "Africa/Nairobi",

    "Africa/Ndjamena",

    "Africa/Niamey",

    "Africa/Nouakchott",

    "Africa/Ouagadougou",

    "Africa/Porto-Novo",

    "Africa/Sao_Tome",

    "Africa/Tripoli",

    "Africa/Tunis",

    "Africa/Windhoek",

    "America/Adak",

    "America/Anchorage",

    "America/Anguilla",

    "America/Antigua",

    "America/Araguaina",

    "America/Argentina/Buenos_Aires",

    "America/Argentina/Catamarca",

    "America/Argentina/Cordoba",

    "America/Argentina/Jujuy",

    "America/Argentina/La_Rioja",

    "America/Argentina/Mendoza",

    "America/Argentina/Rio_Gallegos",

    "America/Argentina/Salta",

    "America/Argentina/San_Juan",

    "America/Argentina/San_Luis",

    "America/Argentina/Tucuman",

    "America/Argentina/Ushuaia",

    "America/Aruba",

    "America/Asuncion",

    "America/Atikokan",

    "America/Bahia",

    "America/Bahia_Banderas",

    "America/Barbados",

    "America/Belem",

    "America/Belize",

    "America/Blanc-Sablon",

    "America/Boa_Vista",

    "America/Bogota",

    "America/Boise",

    "America/Cambridge_Bay",

    "America/Campo_Grande",

    "America/Cancun",

    "America/Caracas",

    "America/Cayenne",

    "America/Cayman",

    "America/Chicago",

    "America/Chihuahua",

    "America/Ciudad_Juarez",

    "America/Costa_Rica",

    "America/Creston",

    "America/Cuiaba",

    "America/Curacao",

    "America/Danmarkshavn",

    "America/Dawson",

    "America/Dawson_Creek",

    "America/Denver",

    "America/Detroit",

    "America/Dominica",

    "America/Edmonton",

    "America/Eirunepe",

    "America/El_Salvador",

    "America/Fort_Nelson",

    "America/Fortaleza",

    "America/Glace_Bay",

    "America/Goose_Bay",

    "America/Grand_Turk",

    "America/Grenada",

    "America/Guadeloupe",

    "America/Guatemala",

    "America/Guayaquil",

    "America/Guyana",

    "America/Halifax",

    "America/Havana",

    "America/Hermosillo",

    "America/Indiana/Indianapolis",

    "America/Indiana/Knox",

    "America/Indiana/Marengo",

    "America/Indiana/Petersburg",

    "America/Indiana/Tell_City",

    "America/Indiana/Vevay",

    "America/Indiana/Vincennes",

    "America/Indiana/Winamac",

    "America/Inuvik",

    "America/Iqaluit",

    "America/Jamaica",

    "America/Juneau",

    "America/Kentucky/Louisville",

    "America/Kentucky/Monticello",

    "America/Kralendijk",

    "America/La_Paz",

    "America/Lima",

    "America/Los_Angeles",

    "America/Lower_Princes",

    "America/Maceio",

    "America/Managua",

    "America/Manaus",

    "America/Marigot",

    "America/Martinique",

    "America/Matamoros",

    "America/Mazatlan",

    "America/Menominee",

    "America/Merida",

    "America/Metlakatla",

    "America/Mexico_City",

    "America/Miquelon",

    "America/Moncton",

    "America/Monterrey",

    "America/Montevideo",

    "America/Montserrat",

    "America/Nassau",

    "America/New_York",

    "America/Nome",

    "America/Noronha",

    "America/North_Dakota/Beulah",

    "America/North_Dakota/Center",

    "America/North_Dakota/New_Salem",

    "America/Nuuk",

    "America/Ojinaga",

    "America/Panama",

    "America/Paramaribo",

    "America/Phoenix",

    "America/Port-au-Prince",

    "America/Port_of_Spain",

    "America/Porto_Velho",

    "America/Puerto_Rico",

    "America/Punta_Arenas",

    "America/Rankin_Inlet",

    "America/Recife",

    "America/Regina",

    "America/Resolute",

    "America/Rio_Branco",

    "America/Santarem",

    "America/Santiago",

    "America/Santo_Domingo",

    "America/Sao_Paulo",

    "America/Scoresbysund",

    "America/Sitka",

    "America/St_Barthelemy",

    "America/St_Johns",

    "America/St_Kitts",

    "America/St_Lucia",

    "America/St_Thomas",

    "America/St_Vincent",

    "America/Swift_Current",

    "America/Tegucigalpa",

    "America/Thule",

    "America/Tijuana",

    "America/Toronto",

    "America/Tortola",

    "America/Vancouver",

    "America/Whitehorse",

    "America/Winnipeg",

    "America/Yakutat",

    "Antarctica/Casey",

    "Antarctica/Davis",

    "Antarctica/DumontDUrville",

    "Antarctica/Macquarie",

    "Antarctica/Mawson",

    "Antarctica/McMurdo",

    "Antarctica/Palmer",

    "Antarctica/Rothera",

    "Antarctica/Syowa",

    "Antarctica/Troll",

    "Antarctica/Vostok",

    "Arctic/Longyearbyen",

    "Asia/Aden",

    "Asia/Almaty",

    "Asia/Amman",

    "Asia/Anadyr",

    "Asia/Aqtau",

    "Asia/Aqtobe",

    "Asia/Ashgabat",

    "Asia/Atyrau",

    "Asia/Baghdad",

    "Asia/Bahrain",

    "Asia/Baku",

    "Asia/Bangkok",

    "Asia/Barnaul",

    "Asia/Beirut",

    "Asia/Bishkek",

    "Asia/Brunei",

    "Asia/Chita",

    "Asia/Choibalsan",

    "Asia/Colombo",

    "Asia/Damascus",

    "Asia/Dhaka",

    "Asia/Dili",

    "Asia/Dubai",

    "Asia/Dushanbe",

    "Asia/Famagusta",

    "Asia/Gaza",

    "Asia/Hebron",

    "Asia/Ho_Chi_Minh",

    "Asia/Hong_Kong",

    "Asia/Hovd",

    "Asia/Irkutsk",

    "Asia/Jakarta",

    "Asia/Jayapura",

    "Asia/Jerusalem",

    "Asia/Kabul",

    "Asia/Kamchatka",

    "Asia/Karachi",

    "Asia/Kathmandu",

    "Asia/Khandyga",

    "Asia/Kolkata",

    "Asia/Krasnoyarsk",

    "Asia/Kuala_Lumpur",

    "Asia/Kuching",

    "Asia/Kuwait",

    "Asia/Macau",

    "Asia/Magadan",

    "Asia/Makassar",

    "Asia/Manila",

    "Asia/Muscat",

    "Asia/Nicosia",

    "Asia/Novokuznetsk",

    "Asia/Novosibirsk",

    "Asia/Omsk",

    "Asia/Oral",

    "Asia/Phnom_Penh",

    "Asia/Pontianak",

    "Asia/Pyongyang",

    "Asia/Qatar",

    "Asia/Qostanay",

    "Asia/Qyzylorda",

    "Asia/Riyadh",

    "Asia/Sakhalin",

    "Asia/Samarkand",

    "Asia/Seoul",

    "Asia/Shanghai",

    "Asia/Singapore",

    "Asia/Srednekolymsk",

    "Asia/Taipei",

    "Asia/Tashkent",

    "Asia/Tbilisi",

    "Asia/Tehran",

    "Asia/Thimphu",

    "Asia/Tokyo",

    "Asia/Tomsk",

    "Asia/Ulaanbaatar",

    "Asia/Urumqi",

    "Asia/Ust-Nera",

    "Asia/Vientiane",

    "Asia/Vladivostok",

    "Asia/Yakutsk",

    "Asia/Yangon",

    "Asia/Yekaterinburg",

    "Asia/Yerevan",

    "Atlantic/Azores",

    "Atlantic/Bermuda",

    "Atlantic/Canary",

    "Atlantic/Cape_Verde",

    "Atlantic/Faroe",

    "Atlantic/Madeira",

    "Atlantic/Reykjavik",

    "Atlantic/South_Georgia",

    "Atlantic/St_Helena",

    "Atlantic/Stanley",

    "Australia/Adelaide",

    "Australia/Brisbane",

    "Australia/Broken_Hill",

    "Australia/Darwin",

    "Australia/Eucla",

    "Australia/Hobart",

    "Australia/Lindeman",

    "Australia/Lord_Howe",

    "Australia/Melbourne",

    "Australia/Perth",

    "Australia/Sydney",

    "Canada/Atlantic",

    "Canada/Central",

    "Canada/Eastern",

    "Canada/Mountain",

    "Canada/Newfoundland",

    "Canada/Pacific",

    "Europe/Amsterdam",

    "Europe/Andorra",

    "Europe/Astrakhan",

    "Europe/Athens",

    "Europe/Belgrade",

    "Europe/Berlin",

    "Europe/Bratislava",

    "Europe/Brussels",

    "Europe/Bucharest",

    "Europe/Budapest",

    "Europe/Busingen",

    "Europe/Chisinau",

    "Europe/Copenhagen",

    "Europe/Dublin",

    "Europe/Gibraltar",

    "Europe/Guernsey",

    "Europe/Helsinki",

    "Europe/Isle_of_Man",

    "Europe/Istanbul",

    "Europe/Jersey",

    "Europe/Kaliningrad",

    "Europe/Kirov",

    "Europe/Kyiv",

    "Europe/Lisbon",

    "Europe/Ljubljana",

    "Europe/London",

    "Europe/Luxembourg",

    "Europe/Madrid",

    "Europe/Malta",

    "Europe/Mariehamn",

    "Europe/Minsk",

    "Europe/Monaco",

    "Europe/Moscow",

    "Europe/Oslo",

    "Europe/Paris",

    "Europe/Podgorica",

    "Europe/Prague",

    "Europe/Riga",

    "Europe/Rome",

    "Europe/Samara",

    "Europe/San_Marino",

    "Europe/Sarajevo",

    "Europe/Saratov",

    "Europe/Simferopol",

    "Europe/Skopje",

    "Europe/Sofia",

    "Europe/Stockholm",

    "Europe/Tallinn",

    "Europe/Tirane",

    "Europe/Ulyanovsk",

    "Europe/Vaduz",

    "Europe/Vatican",

    "Europe/Vienna",

    "Europe/Vilnius",

    "Europe/Volgograd",

    "Europe/Warsaw",

    "Europe/Zagreb",

    "Europe/Zurich",

    "GMT",

    "Indian/Antananarivo",

    "Indian/Chagos",

    "Indian/Christmas",

    "Indian/Cocos",

    "Indian/Comoro",

    "Indian/Kerguelen",

    "Indian/Mahe",

    "Indian/Maldives",

    "Indian/Mauritius",

    "Indian/Mayotte",

    "Indian/Reunion",

    "Pacific/Apia",

    "Pacific/Auckland",

    "Pacific/Bougainville",

    "Pacific/Chatham",

    "Pacific/Chuuk",

    "Pacific/Easter",

    "Pacific/Efate",

    "Pacific/Fakaofo",

    "Pacific/Fiji",

    "Pacific/Funafuti",

    "Pacific/Galapagos",

    "Pacific/Gambier",

    "Pacific/Guadalcanal",

    "Pacific/Guam",

    "Pacific/Honolulu",

    "Pacific/Kanton",

    "Pacific/Kiritimati",

    "Pacific/Kosrae",

    "Pacific/Kwajalein",

    "Pacific/Majuro",

    "Pacific/Marquesas",

    "Pacific/Midway",

    "Pacific/Nauru",

    "Pacific/Niue",

    "Pacific/Norfolk",

    "Pacific/Noumea",

    "Pacific/Pago_Pago",

    "Pacific/Palau",

    "Pacific/Pitcairn",

    "Pacific/Pohnpei",

    "Pacific/Port_Moresby",

    "Pacific/Rarotonga",

    "Pacific/Saipan",

    "Pacific/Tahiti",

    "Pacific/Tarawa",

    "Pacific/Tongatapu",

    "Pacific/Wake",

    "Pacific/Wallis",

    "US/Alaska",

    "US/Arizona",

    "US/Central",

    "US/Eastern",

    "US/Hawaii",

    "US/Mountain",

    "US/Pacific",

    "UTC"

    

  ];

  const gender_option = useMemo(() => [
    { id: 'Male', label: 'Male', value: 'Male' },
    { id: 'Female', label: 'Female', value: 'Female' },
    { id: 'Other', label: 'Other', value: 'Other' },
  ], []);

  const [dob, setDob] = useState([])

  useEffect(() => {
    console.log("emp Form Obj = ", form_obj);
    setEmployeeObj(form_obj);
    let sub_dep_options = dep_options.filter(
      (obj) => obj.id !== form_obj.primary_department
    );
    setSubDeptOptions(sub_dep_options);
    setDob([new Date(form_obj.dob)])
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name = ", name, "   value = ", value);
    setEmployeeObj({
      ...employeeObj,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    console.log("E.target.files = ", e.target.files);
    if (e.target.files && e.target.files[0]) {
      setEmployeeImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const newImageSrc = readerEvent.target.result;
        setEmployeeObj({
          ...employeeObj,
          profile_url: newImageSrc,
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePrimaryDepChange = (obj) => {
    if (obj.id !== employeeObj.primary_department) {
      setEmployeeObj({
        ...employeeObj,
        primary_department: obj.id,
        sub_department: [],
      });
      let sub_dep_options = dep_options.filter((data) => data.id !== obj.id);
      setSubDeptOptions(sub_dep_options);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting  Data = ", employeeObj);
    console.log("Profile = ", employeeImage);

    let formData = new FormData();
    employeeImage !== null &&
      formData.append("profile", employeeImage, employeeImage.name);
    Object.entries(employeeObj).map((key, idx) => {
      formData.append(key[0], key[1]);
      
    });
    formData.append("timezone", selectedTimezone)

    Api({
      method: "POST",
      url: "employee/add-new/",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    })
      .then((res) => {
        console.log("REs = ", res);
        employeeObj.id === 0
          ? dispatch(addEmployee(res?.data.data))
          : dispatch(editEmployee(res?.data?.data));
        dispatch(toggleRSBView(false));
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        console.log("ERr == ", err);
        toast.error(err?.response?.data?.message);
      });
  };
  

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} action="javascript:void(0)">
            <div className="text-center">
              <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                <img
                  src={
                    employeeObj.profile_url
                      ? employeeObj.profile_url
                      : DummyUserImg
                  }
                  className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                  alt="user-profile"
                />
                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <Input
                    id="profile-img-file-input"
                    type="file"
                    className="profile-img-file-input"
                    onChange={handleFileChange}
                  />
                  <Label
                    htmlFor="profile-img-file-input"
                    className="profile-photo-edit avatar-xs">
                    <span className="avatar-title rounded-circle bg-light text-body">
                      <i className="ri-camera-fill"></i>
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            <Row>
              <Col md={6} lg={6} xxl={6}>
                <div>
                  <Label htmlFor="fname" className="form-label">
                    First Name
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="fname"
                      id="fname"
                      className="form-control"
                      placeholder="Elon"
                      value={employeeObj.fname || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-user-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Enter First Name.
                  </div>
                </div>
              </Col>
              <Col md={6} lg={6} xxl={6}>
                <div>
                  <Label htmlFor="lname" className="form-label">
                    Last Name
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="lname"
                      id="lname"
                      className="form-control"
                      placeholder="Musk"
                      value={employeeObj.lname || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-user-2-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Enter Last Name.
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="emailid" className="form-label">
                    Email
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="email"
                      name="email"
                      id="emailid"
                      className="form-control"
                      placeholder="name@company.com"
                      value={employeeObj.email || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-mail-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Enter Email.
                  </div>
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label>DOB</Label>
                  <Flatpickr
                    className="form-control"
                    value={dob}
                    options={{
                      dateFormat: "d M, Y"
                    }}
                    onChange={handleDateChange}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Select Date Of Birth.
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="gender" className="form-label">
                    Gender
                  </Label>

                  <Select
                    isMulti={false}
                    options={gender_option || []}
                    className="basic-multi-select"
                    value={(employeeObj.gender && gender_option.find(e => e.value === employeeObj.gender)) || []}
                    onChange={(e) => {
                      setEmployeeObj({ ...employeeObj, gender: e.value });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Select Gender.
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="parentDepartment" className="form-label">
                    Role
                  </Label>
                  <Select
                    isMulti={false}
                    options={role_option || []}
                    className="basic-multi-select"
                    value={
                      (employeeObj.role &&
                        role_option.find((e) => e.id === employeeObj.role)) ||
                      []
                    }
                    onChange={(e) => {
                      setEmployeeObj({ ...employeeObj, role: e.id });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Select Role
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="parentDepartment" className="form-label">
                    Primary Department
                  </Label>
                  <Select
                    isMulti={false}
                    options={dep_options || []}
                    placeholder={"Select Primary Department"}
                    className="basic-multi-select"
                    value={
                      (employeeObj.primary_department &&
                        dep_options.find(
                          (obj) => obj.id === employeeObj.primary_department
                        )) ||
                      []
                    }
                    onChange={(e) => handlePrimaryDepChange(e)}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Select Primary Department
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="parentDepartment" className="form-label">
                    Sub Department
                  </Label>
                  <Select
                    isMulti={true}
                    options={subDepOptions || []}
                    placeholder={"Select Sub Department"}
                    className="basic-multi-select"
                    value={
                      (employeeObj.sub_department &&
                        subDepOptions.filter((obj) =>
                          employeeObj.sub_department.includes(obj.id)
                        )) ||
                      []
                    }
                    onChange={(e) =>
                      setEmployeeObj({
                        ...employeeObj,
                        sub_department: e.map((obj) => obj.id),
                      })
                    }
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Select Sub Department
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label>Work Schedule</Label>
                  <Select
                    required
                    isMulti={false}
                    options={ws_options || []}
                    className="basic-multi-select"
                    value={
                      (employeeObj.work_schedule &&
                        ws_options.find(
                          (e) => e.id === employeeObj.work_schedule
                        )) ||
                      []
                    }
                    onChange={(e) =>
                      setEmployeeObj({ ...employeeObj, work_schedule: e.id })
                    }
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Select Work Schedule
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
                      id="profile_timezone"
                      name="profile_timezone"
                      placeholder="Asia/Kolkata"
                      value={employeeObj.profile_timezone || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-time-line"></i>
                  </div>
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label>Is Active</Label>
                  <div
                    className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                    dir="ltr">
                    <Input
                      id=""
                      name="is_active"
                      type="checkbox"
                      className="form-check-input"
                      checked={employeeObj.is_active}
                      onChange={(e) =>
                        setEmployeeObj({
                          ...employeeObj,
                          is_active: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button type="submit">Submit</Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default EmployeeForm;
