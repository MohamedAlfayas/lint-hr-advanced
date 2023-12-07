import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { setActiveTableTab } from "../../redux/reducers/ChildReducer/TableReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import indflag from "../../assets/images/flags/in.svg";
import SimpleBar from "simplebar-react";
import CountryList from "../../common/data/CountryList";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { join } from "lodash";
import { PostApi } from "../../common/api/PostApi";

// Register the plugins
// registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);
const EmployeeForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  // console.log("fgdf",form_obj);
  const [employeeObj, setEmployeeObj] = useState({});

  const dep_options = GetLocalStorageData("department") || [];
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const role_option = GetLocalStorageData("role") || [];

  const [employeeImage, setEmployeeImage] = useState(null);
  const [subDepOptions, setSubDeptOptions] = useState(dep_options);
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
  const [files, setFiles] = useState([]);

  const timzone_options = useMemo(
    () => [
      {
        label: "Africa/Abidjan",
        value: "Africa/Abidjan",
      },
      {
        label: "Africa/Accra",
        value: "Africa/Accra",
      },
      {
        label: "Africa/Addis_Ababa",
        value: "Africa/Addis_Ababa",
      },
      {
        label: "Africa/Algiers",
        value: "Africa/Algiers",
      },
      {
        label: "Africa/Asmara",
        value: "Africa/Asmara",
      },
      {
        label: "Africa/Bamako",
        value: "Africa/Bamako",
      },
      {
        label: "Africa/Bangui",
        value: "Africa/Bangui",
      },
      {
        label: "Africa/Banjul",
        value: "Africa/Banjul",
      },
      {
        label: "Africa/Bissau",
        value: "Africa/Bissau",
      },
      {
        label: "Africa/Blantyre",
        value: "Africa/Blantyre",
      },
      {
        label: "Africa/Brazzaville",
        value: "Africa/Brazzaville",
      },
      {
        label: "Africa/Bujumbura",
        value: "Africa/Bujumbura",
      },
      {
        label: "Africa/Cairo",
        value: "Africa/Cairo",
      },
      {
        label: "Africa/Casablanca",
        value: "Africa/Casablanca",
      },
      {
        label: "Africa/Ceuta",
        value: "Africa/Ceuta",
      },
      {
        label: "Africa/Conakry",
        value: "Africa/Conakry",
      },
      {
        label: "Africa/Dakar",
        value: "Africa/Dakar",
      },
      {
        label: "Africa/Dar_es_Salaam",
        value: "Africa/Dar_es_Salaam",
      },
      {
        label: "Africa/Djibouti",
        value: "Africa/Djibouti",
      },
      {
        label: "Africa/Douala",
        value: "Africa/Douala",
      },
      {
        label: "Africa/El_Aaiun",
        value: "Africa/El_Aaiun",
      },
      {
        label: "Africa/Freetown",
        value: "Africa/Freetown",
      },
      {
        label: "Africa/Gaborone",
        value: "Africa/Gaborone",
      },
      {
        label: "Africa/Harare",
        value: "Africa/Harare",
      },
      {
        label: "Africa/Johannesburg",
        value: "Africa/Johannesburg",
      },
      {
        label: "Africa/Juba",
        value: "Africa/Juba",
      },
      {
        label: "Africa/Kampala",
        value: "Africa/Kampala",
      },
      {
        label: "Africa/Khartoum",
        value: "Africa/Khartoum",
      },
      {
        label: "Africa/Kigali",
        value: "Africa/Kigali",
      },
      {
        label: "Africa/Kinshasa",
        value: "Africa/Kinshasa",
      },
      {
        label: "Africa/Lagos",
        value: "Africa/Lagos",
      },
      {
        label: "Africa/Libreville",
        value: "Africa/Libreville",
      },
      {
        label: "Africa/Lome",
        value: "Africa/Lome",
      },
      {
        label: "Africa/Luanda",
        value: "Africa/Luanda",
      },
      {
        label: "Africa/Lubumbashi",
        value: "Africa/Lubumbashi",
      },
      {
        label: "Africa/Lusaka",
        value: "Africa/Lusaka",
      },
      {
        label: "Africa/Malabo",
        value: "Africa/Malabo",
      },
      {
        label: "Africa/Maputo",
        value: "Africa/Maputo",
      },
      {
        label: "Africa/Maseru",
        value: "Africa/Maseru",
      },
      {
        label: "Africa/Mbabane",
        value: "Africa/Mbabane",
      },
      {
        label: "Africa/Mogadishu",
        value: "Africa/Mogadishu",
      },
      {
        label: "Africa/Monrovia",
        value: "Africa/Monrovia",
      },
      {
        label: "Africa/Nairobi",
        value: "Africa/Nairobi",
      },
      {
        label: "Africa/Ndjamena",
        value: "Africa/Ndjamena",
      },
      {
        label: "Africa/Niamey",
        value: "Africa/Niamey",
      },
      {
        label: "Africa/Nouakchott",
        value: "Africa/Nouakchott",
      },
      {
        label: "Africa/Ouagadougou",
        value: "Africa/Ouagadougou",
      },
      {
        label: "Africa/Porto-Novo",
        value: "Africa/Porto-Novo",
      },
      {
        label: "Africa/Sao_Tome",
        value: "Africa/Sao_Tome",
      },
      {
        label: "Africa/Tripoli",
        value: "Africa/Tripoli",
      },
      {
        label: "Africa/Tunis",
        value: "Africa/Tunis",
      },
      {
        label: "Africa/Windhoek",
        value: "Africa/Windhoek",
      },
      {
        label: "America/Adak",
        value: "America/Adak",
      },
      {
        label: "America/Anchorage",
        value: "America/Anchorage",
      },
      {
        label: "America/Anguilla",
        value: "America/Anguilla",
      },
      {
        label: "America/Antigua",
        value: "America/Antigua",
      },
      {
        label: "America/Araguaina",
        value: "America/Araguaina",
      },
      {
        label: "America/Argentina/Buenos_Aires",
        value: "America/Argentina/Buenos_Aires",
      },
      {
        label: "America/Argentina/Catamarca",
        value: "America/Argentina/Catamarca",
      },
      {
        label: "America/Argentina/Cordoba",
        value: "America/Argentina/Cordoba",
      },
      {
        label: "America/Argentina/Jujuy",
        value: "America/Argentina/Jujuy",
      },
      {
        label: "America/Argentina/La_Rioja",
        value: "America/Argentina/La_Rioja",
      },
      {
        label: "America/Argentina/Mendoza",
        value: "America/Argentina/Mendoza",
      },
      {
        label: "America/Argentina/Rio_Gallegos",
        value: "America/Argentina/Rio_Gallegos",
      },
      {
        label: "America/Argentina/Salta",
        value: "America/Argentina/Salta",
      },
      {
        label: "America/Argentina/San_Juan",
        value: "America/Argentina/San_Juan",
      },
      {
        label: "America/Argentina/San_Luis",
        value: "America/Argentina/San_Luis",
      },
      {
        label: "America/Argentina/Tucuman",
        value: "America/Argentina/Tucuman",
      },
      {
        label: "America/Argentina/Ushuaia",
        value: "America/Argentina/Ushuaia",
      },
      {
        label: "America/Aruba",
        value: "America/Aruba",
      },
      {
        label: "America/Asuncion",
        value: "America/Asuncion",
      },
      {
        label: "America/Atikokan",
        value: "America/Atikokan",
      },
      {
        label: "America/Bahia",
        value: "America/Bahia",
      },
      {
        label: "America/Bahia_Banderas",
        value: "America/Bahia_Banderas",
      },
      {
        label: "America/Barbados",
        value: "America/Barbados",
      },
      {
        label: "America/Belem",
        value: "America/Belem",
      },
      {
        label: "America/Belize",
        value: "America/Belize",
      },
      {
        label: "America/Blanc-Sablon",
        value: "America/Blanc-Sablon",
      },
      {
        label: "America/Boa_Vista",
        value: "America/Boa_Vista",
      },
      {
        label: "America/Bogota",
        value: "America/Bogota",
      },
      {
        label: "America/Boise",
        value: "America/Boise",
      },
      {
        label: "America/Cambridge_Bay",
        value: "America/Cambridge_Bay",
      },
      {
        label: "America/Campo_Grande",
        value: "America/Campo_Grande",
      },
      {
        label: "America/Cancun",
        value: "America/Cancun",
      },
      {
        label: "America/Caracas",
        value: "America/Caracas",
      },
      {
        label: "America/Cayenne",
        value: "America/Cayenne",
      },
      {
        label: "America/Cayman",
        value: "America/Cayman",
      },
      {
        label: "America/Chicago",
        value: "America/Chicago",
      },
      {
        label: "America/Chihuahua",
        value: "America/Chihuahua",
      },
      {
        label: "America/Ciudad_Juarez",
        value: "America/Ciudad_Juarez",
      },
      {
        label: "America/Costa_Rica",
        value: "America/Costa_Rica",
      },
      {
        label: "America/Creston",
        value: "America/Creston",
      },
      {
        label: "America/Cuiaba",
        value: "America/Cuiaba",
      },
      {
        label: "America/Curacao",
        value: "America/Curacao",
      },
      {
        label: "America/Danmarkshavn",
        value: "America/Danmarkshavn",
      },
      {
        label: "America/Dawson",
        value: "America/Dawson",
      },
      {
        label: "America/Dawson_Creek",
        value: "America/Dawson_Creek",
      },
      {
        label: "America/Denver",
        value: "America/Denver",
      },
      {
        label: "America/Detroit",
        value: "America/Detroit",
      },
      {
        label: "America/Dominica",
        value: "America/Dominica",
      },
      {
        label: "America/Edmonton",
        value: "America/Edmonton",
      },
      {
        label: "America/Eirunepe",
        value: "America/Eirunepe",
      },
      {
        label: "America/El_Salvador",
        value: "America/El_Salvador",
      },
      {
        label: "America/Fort_Nelson",
        value: "America/Fort_Nelson",
      },
      {
        label: "America/Fortaleza",
        value: "America/Fortaleza",
      },
      {
        label: "America/Glace_Bay",
        value: "America/Glace_Bay",
      },
      {
        label: "America/Goose_Bay",
        value: "America/Goose_Bay",
      },
      {
        label: "America/Grand_Turk",
        value: "America/Grand_Turk",
      },
      {
        label: "America/Grenada",
        value: "America/Grenada",
      },
      {
        label: "America/Guadeloupe",
        value: "America/Guadeloupe",
      },
      {
        label: "America/Guatemala",
        value: "America/Guatemala",
      },
      {
        label: "America/Guayaquil",
        value: "America/Guayaquil",
      },
      {
        label: "America/Guyana",
        value: "America/Guyana",
      },
      {
        label: "America/Halifax",
        value: "America/Halifax",
      },
      {
        label: "America/Havana",
        value: "America/Havana",
      },
      {
        label: "America/Hermosillo",
        value: "America/Hermosillo",
      },
      {
        label: "America/Indiana/Indianapolis",
        value: "America/Indiana/Indianapolis",
      },
      {
        label: "America/Indiana/Knox",
        value: "America/Indiana/Knox",
      },
      {
        label: "America/Indiana/Marengo",
        value: "America/Indiana/Marengo",
      },
      {
        label: "America/Indiana/Petersburg",
        value: "America/Indiana/Petersburg",
      },
      {
        label: "America/Indiana/Tell_City",
        value: "America/Indiana/Tell_City",
      },
      {
        label: "America/Indiana/Vevay",
        value: "America/Indiana/Vevay",
      },
      {
        label: "America/Indiana/Vincennes",
        value: "America/Indiana/Vincennes",
      },
      {
        label: "America/Indiana/Winamac",
        value: "America/Indiana/Winamac",
      },
      {
        label: "America/Inuvik",
        value: "America/Inuvik",
      },
      {
        label: "America/Iqaluit",
        value: "America/Iqaluit",
      },
      {
        label: "America/Jamaica",
        value: "America/Jamaica",
      },
      {
        label: "America/Juneau",
        value: "America/Juneau",
      },
      {
        label: "America/Kentucky/Louisville",
        value: "America/Kentucky/Louisville",
      },
      {
        label: "America/Kentucky/Monticello",
        value: "America/Kentucky/Monticello",
      },
      {
        label: "America/Kralendijk",
        value: "America/Kralendijk",
      },
      {
        label: "America/La_Paz",
        value: "America/La_Paz",
      },
      {
        label: "America/Lima",
        value: "America/Lima",
      },
      {
        label: "America/Los_Angeles",
        value: "America/Los_Angeles",
      },
      {
        label: "America/Lower_Princes",
        value: "America/Lower_Princes",
      },
      {
        label: "America/Maceio",
        value: "America/Maceio",
      },
      {
        label: "America/Managua",
        value: "America/Managua",
      },
      {
        label: "America/Manaus",
        value: "America/Manaus",
      },
      {
        label: "America/Marigot",
        value: "America/Marigot",
      },
      {
        label: "America/Martinique",
        value: "America/Martinique",
      },
      {
        label: "America/Matamoros",
        value: "America/Matamoros",
      },
      {
        label: "America/Mazatlan",
        value: "America/Mazatlan",
      },
      {
        label: "America/Menominee",
        value: "America/Menominee",
      },
      {
        label: "America/Merida",
        value: "America/Merida",
      },
      {
        label: "America/Metlakatla",
        value: "America/Metlakatla",
      },
      {
        label: "America/Mexico_City",
        value: "America/Mexico_City",
      },
      {
        label: "America/Miquelon",
        value: "America/Miquelon",
      },
      {
        label: "America/Moncton",
        value: "America/Moncton",
      },
      {
        label: "America/Monterrey",
        value: "America/Monterrey",
      },
      {
        label: "America/Montevideo",
        value: "America/Montevideo",
      },
      {
        label: "America/Montserrat",
        value: "America/Montserrat",
      },
      {
        label: "America/Nassau",
        value: "America/Nassau",
      },
      {
        label: "America/New_York",
        value: "America/New_York",
      },
      {
        label: "America/Nome",
        value: "America/Nome",
      },
      {
        label: "America/Noronha",
        value: "America/Noronha",
      },
      {
        label: "America/North_Dakota/Beulah",
        value: "America/North_Dakota/Beulah",
      },
      {
        label: "America/North_Dakota/Center",
        value: "America/North_Dakota/Center",
      },
      {
        label: "America/North_Dakota/New_Salem",
        value: "America/North_Dakota/New_Salem",
      },
      {
        label: "America/Nuuk",
        value: "America/Nuuk",
      },
      {
        label: "America/Ojinaga",
        value: "America/Ojinaga",
      },
      {
        label: "America/Panama",
        value: "America/Panama",
      },
      {
        label: "America/Paramaribo",
        value: "America/Paramaribo",
      },
      {
        label: "America/Phoenix",
        value: "America/Phoenix",
      },
      {
        label: "America/Port-au-Prince",
        value: "America/Port-au-Prince",
      },
      {
        label: "America/Port_of_Spain",
        value: "America/Port_of_Spain",
      },
      {
        label: "America/Porto_Velho",
        value: "America/Porto_Velho",
      },
      {
        label: "America/Puerto_Rico",
        value: "America/Puerto_Rico",
      },
      {
        label: "America/Punta_Arenas",
        value: "America/Punta_Arenas",
      },
      {
        label: "America/Rankin_Inlet",
        value: "America/Rankin_Inlet",
      },
      {
        label: "America/Recife",
        value: "America/Recife",
      },
      {
        label: "America/Regina",
        value: "America/Regina",
      },
      {
        label: "America/Resolute",
        value: "America/Resolute",
      },
      {
        label: "America/Rio_Branco",
        value: "America/Rio_Branco",
      },
      {
        label: "America/Santarem",
        value: "America/Santarem",
      },
      {
        label: "America/Santiago",
        value: "America/Santiago",
      },
      {
        label: "America/Santo_Domingo",
        value: "America/Santo_Domingo",
      },
      {
        label: "America/Sao_Paulo",
        value: "America/Sao_Paulo",
      },
      {
        label: "America/Scoresbysund",
        value: "America/Scoresbysund",
      },
      {
        label: "America/Sitka",
        value: "America/Sitka",
      },
      {
        label: "America/St_Barthelemy",
        value: "America/St_Barthelemy",
      },
      {
        label: "America/St_Johns",
        value: "America/St_Johns",
      },
      {
        label: "America/St_Kitts",
        value: "America/St_Kitts",
      },
      {
        label: "America/St_Lucia",
        value: "America/St_Lucia",
      },
      {
        label: "America/St_Thomas",
        value: "America/St_Thomas",
      },
      {
        label: "America/St_Vincent",
        value: "America/St_Vincent",
      },
      {
        label: "America/Swift_Current",
        value: "America/Swift_Current",
      },
      {
        label: "America/Tegucigalpa",
        value: "America/Tegucigalpa",
      },
      {
        label: "America/Thule",
        value: "America/Thule",
      },
      {
        label: "America/Tijuana",
        value: "America/Tijuana",
      },
      {
        label: "America/Toronto",
        value: "America/Toronto",
      },
      {
        label: "America/Tortola",
        value: "America/Tortola",
      },
      {
        label: "America/Vancouver",
        value: "America/Vancouver",
      },
      {
        label: "America/Whitehorse",
        value: "America/Whitehorse",
      },
      {
        label: "America/Winnipeg",
        value: "America/Winnipeg",
      },
      {
        label: "America/Yakutat",
        value: "America/Yakutat",
      },
      {
        label: "Antarctica/Casey",
        value: "Antarctica/Casey",
      },
      {
        label: "Antarctica/Davis",
        value: "Antarctica/Davis",
      },
      {
        label: "Antarctica/DumontDUrville",
        value: "Antarctica/DumontDUrville",
      },
      {
        label: "Antarctica/Macquarie",
        value: "Antarctica/Macquarie",
      },
      {
        label: "Antarctica/Mawson",
        value: "Antarctica/Mawson",
      },
      {
        label: "Antarctica/McMurdo",
        value: "Antarctica/McMurdo",
      },
      {
        label: "Antarctica/Palmer",
        value: "Antarctica/Palmer",
      },
      {
        label: "Antarctica/Rothera",
        value: "Antarctica/Rothera",
      },
      {
        label: "Antarctica/Syowa",
        value: "Antarctica/Syowa",
      },
      {
        label: "Antarctica/Troll",
        value: "Antarctica/Troll",
      },
      {
        label: "Antarctica/Vostok",
        value: "Antarctica/Vostok",
      },
      {
        label: "Arctic/Longyearbyen",
        value: "Arctic/Longyearbyen",
      },
      {
        label: "Asia/Aden",
        value: "Asia/Aden",
      },
      {
        label: "Asia/Almaty",
        value: "Asia/Almaty",
      },
      {
        label: "Asia/Amman",
        value: "Asia/Amman",
      },
      {
        label: "Asia/Anadyr",
        value: "Asia/Anadyr",
      },
      {
        label: "Asia/Aqtau",
        value: "Asia/Aqtau",
      },
      {
        label: "Asia/Aqtobe",
        value: "Asia/Aqtobe",
      },
      {
        label: "Asia/Ashgabat",
        value: "Asia/Ashgabat",
      },
      {
        label: "Asia/Atyrau",
        value: "Asia/Atyrau",
      },
      {
        label: "Asia/Baghdad",
        value: "Asia/Baghdad",
      },
      {
        label: "Asia/Bahrain",
        value: "Asia/Bahrain",
      },
      {
        label: "Asia/Baku",
        value: "Asia/Baku",
      },
      {
        label: "Asia/Bangkok",
        value: "Asia/Bangkok",
      },
      {
        label: "Asia/Barnaul",
        value: "Asia/Barnaul",
      },
      {
        label: "Asia/Beirut",
        value: "Asia/Beirut",
      },
      {
        label: "Asia/Bishkek",
        value: "Asia/Bishkek",
      },
      {
        label: "Asia/Brunei",
        value: "Asia/Brunei",
      },
      {
        label: "Asia/Chita",
        value: "Asia/Chita",
      },
      {
        label: "Asia/Choibalsan",
        value: "Asia/Choibalsan",
      },
      {
        label: "Asia/Colombo",
        value: "Asia/Colombo",
      },
      {
        label: "Asia/Damascus",
        value: "Asia/Damascus",
      },
      {
        label: "Asia/Dhaka",
        value: "Asia/Dhaka",
      },
      {
        label: "Asia/Dili",
        value: "Asia/Dili",
      },
      {
        label: "Asia/Dubai",
        value: "Asia/Dubai",
      },
      {
        label: "Asia/Dushanbe",
        value: "Asia/Dushanbe",
      },
      {
        label: "Asia/Famagusta",
        value: "Asia/Famagusta",
      },
      {
        label: "Asia/Gaza",
        value: "Asia/Gaza",
      },
      {
        label: "Asia/Hebron",
        value: "Asia/Hebron",
      },
      {
        label: "Asia/Ho_Chi_Minh",
        value: "Asia/Ho_Chi_Minh",
      },
      {
        label: "Asia/Hong_Kong",
        value: "Asia/Hong_Kong",
      },
      {
        label: "Asia/Hovd",
        value: "Asia/Hovd",
      },
      {
        label: "Asia/Irkutsk",
        value: "Asia/Irkutsk",
      },
      {
        label: "Asia/Jakarta",
        value: "Asia/Jakarta",
      },
      {
        label: "Asia/Jayapura",
        value: "Asia/Jayapura",
      },
      {
        label: "Asia/Jerusalem",
        value: "Asia/Jerusalem",
      },
      {
        label: "Asia/Kabul",
        value: "Asia/Kabul",
      },
      {
        label: "Asia/Kamchatka",
        value: "Asia/Kamchatka",
      },
      {
        label: "Asia/Karachi",
        value: "Asia/Karachi",
      },
      {
        label: "Asia/Kathmandu",
        value: "Asia/Kathmandu",
      },
      {
        label: "Asia/Khandyga",
        value: "Asia/Khandyga",
      },
      {
        label: "Asia/Kolkata",
        value: "Asia/Kolkata",
      },
      {
        label: "Asia/Krasnoyarsk",
        value: "Asia/Krasnoyarsk",
      },
      {
        label: "Asia/Kuala_Lumpur",
        value: "Asia/Kuala_Lumpur",
      },
      {
        label: "Asia/Kuching",
        value: "Asia/Kuching",
      },
      {
        label: "Asia/Kuwait",
        value: "Asia/Kuwait",
      },
      {
        label: "Asia/Macau",
        value: "Asia/Macau",
      },
      {
        label: "Asia/Magadan",
        value: "Asia/Magadan",
      },
      {
        label: "Asia/Makassar",
        value: "Asia/Makassar",
      },
      {
        label: "Asia/Manila",
        value: "Asia/Manila",
      },
      {
        label: "Asia/Muscat",
        value: "Asia/Muscat",
      },
      {
        label: "Asia/Nicosia",
        value: "Asia/Nicosia",
      },
      {
        label: "Asia/Novokuznetsk",
        value: "Asia/Novokuznetsk",
      },
      {
        label: "Asia/Novosibirsk",
        value: "Asia/Novosibirsk",
      },
      {
        label: "Asia/Omsk",
        value: "Asia/Omsk",
      },
      {
        label: "Asia/Oral",
        value: "Asia/Oral",
      },
      {
        label: "Asia/Phnom_Penh",
        value: "Asia/Phnom_Penh",
      },
      {
        label: "Asia/Pontianak",
        value: "Asia/Pontianak",
      },
      {
        label: "Asia/Pyongyang",
        value: "Asia/Pyongyang",
      },
      {
        label: "Asia/Qatar",
        value: "Asia/Qatar",
      },
      {
        label: "Asia/Qostanay",
        value: "Asia/Qostanay",
      },
      {
        label: "Asia/Qyzylorda",
        value: "Asia/Qyzylorda",
      },
      {
        label: "Asia/Riyadh",
        value: "Asia/Riyadh",
      },
      {
        label: "Asia/Sakhalin",
        value: "Asia/Sakhalin",
      },
      {
        label: "Asia/Samarkand",
        value: "Asia/Samarkand",
      },
      {
        label: "Asia/Seoul",
        value: "Asia/Seoul",
      },
      {
        label: "Asia/Shanghai",
        value: "Asia/Shanghai",
      },
      {
        label: "Asia/Singapore",
        value: "Asia/Singapore",
      },
      {
        label: "Asia/Srednekolymsk",
        value: "Asia/Srednekolymsk",
      },
      {
        label: "Asia/Taipei",
        value: "Asia/Taipei",
      },
      {
        label: "Asia/Tashkent",
        value: "Asia/Tashkent",
      },
      {
        label: "Asia/Tbilisi",
        value: "Asia/Tbilisi",
      },
      {
        label: "Asia/Tehran",
        value: "Asia/Tehran",
      },
      {
        label: "Asia/Thimphu",
        value: "Asia/Thimphu",
      },
      {
        label: "Asia/Tokyo",
        value: "Asia/Tokyo",
      },
      {
        label: "Asia/Tomsk",
        value: "Asia/Tomsk",
      },
      {
        label: "Asia/Ulaanbaatar",
        value: "Asia/Ulaanbaatar",
      },
      {
        label: "Asia/Urumqi",
        value: "Asia/Urumqi",
      },
      {
        label: "Asia/Ust-Nera",
        value: "Asia/Ust-Nera",
      },
      {
        label: "Asia/Vientiane",
        value: "Asia/Vientiane",
      },
      {
        label: "Asia/Vladivostok",
        value: "Asia/Vladivostok",
      },
      {
        label: "Asia/Yakutsk",
        value: "Asia/Yakutsk",
      },
      {
        label: "Asia/Yangon",
        value: "Asia/Yangon",
      },
      {
        label: "Asia/Yekaterinburg",
        value: "Asia/Yekaterinburg",
      },
      {
        label: "Asia/Yerevan",
        value: "Asia/Yerevan",
      },
      {
        label: "Atlantic/Azores",
        value: "Atlantic/Azores",
      },
      {
        label: "Atlantic/Bermuda",
        value: "Atlantic/Bermuda",
      },
      {
        label: "Atlantic/Canary",
        value: "Atlantic/Canary",
      },
      {
        label: "Atlantic/Cape_Verde",
        value: "Atlantic/Cape_Verde",
      },
      {
        label: "Atlantic/Faroe",
        value: "Atlantic/Faroe",
      },
      {
        label: "Atlantic/Madeira",
        value: "Atlantic/Madeira",
      },
      {
        label: "Atlantic/Reykjavik",
        value: "Atlantic/Reykjavik",
      },
      {
        label: "Atlantic/South_Georgia",
        value: "Atlantic/South_Georgia",
      },
      {
        label: "Atlantic/St_Helena",
        value: "Atlantic/St_Helena",
      },
      {
        label: "Atlantic/Stanley",
        value: "Atlantic/Stanley",
      },
      {
        label: "Australia/Adelaide",
        value: "Australia/Adelaide",
      },
      {
        label: "Australia/Brisbane",
        value: "Australia/Brisbane",
      },
      {
        label: "Australia/Broken_Hill",
        value: "Australia/Broken_Hill",
      },
      {
        label: "Australia/Darwin",
        value: "Australia/Darwin",
      },
      {
        label: "Australia/Eucla",
        value: "Australia/Eucla",
      },
      {
        label: "Australia/Hobart",
        value: "Australia/Hobart",
      },
      {
        label: "Australia/Lindeman",
        value: "Australia/Lindeman",
      },
      {
        label: "Australia/Lord_Howe",
        value: "Australia/Lord_Howe",
      },
      {
        label: "Australia/Melbourne",
        value: "Australia/Melbourne",
      },
      {
        label: "Australia/Perth",
        value: "Australia/Perth",
      },
      {
        label: "Australia/Sydney",
        value: "Australia/Sydney",
      },
      {
        label: "Canada/Atlantic",
        value: "Canada/Atlantic",
      },
      {
        label: "Canada/Central",
        value: "Canada/Central",
      },
      {
        label: "Canada/Eastern",
        value: "Canada/Eastern",
      },
      {
        label: "Canada/Mountain",
        value: "Canada/Mountain",
      },
      {
        label: "Canada/Newfoundland",
        value: "Canada/Newfoundland",
      },
      {
        label: "Canada/Pacific",
        value: "Canada/Pacific",
      },
      {
        label: "Europe/Amsterdam",
        value: "Europe/Amsterdam",
      },
      {
        label: "Europe/Andorra",
        value: "Europe/Andorra",
      },
      {
        label: "Europe/Astrakhan",
        value: "Europe/Astrakhan",
      },
      {
        label: "Europe/Athens",
        value: "Europe/Athens",
      },
      {
        label: "Europe/Belgrade",
        value: "Europe/Belgrade",
      },
      {
        label: "Europe/Berlin",
        value: "Europe/Berlin",
      },
      {
        label: "Europe/Bratislava",
        value: "Europe/Bratislava",
      },
      {
        label: "Europe/Brussels",
        value: "Europe/Brussels",
      },
      {
        label: "Europe/Bucharest",
        value: "Europe/Bucharest",
      },
      {
        label: "Europe/Budapest",
        value: "Europe/Budapest",
      },
      {
        label: "Europe/Busingen",
        value: "Europe/Busingen",
      },
      {
        label: "Europe/Chisinau",
        value: "Europe/Chisinau",
      },
      {
        label: "Europe/Copenhagen",
        value: "Europe/Copenhagen",
      },
      {
        label: "Europe/Dublin",
        value: "Europe/Dublin",
      },
      {
        label: "Europe/Gibraltar",
        value: "Europe/Gibraltar",
      },
      {
        label: "Europe/Guernsey",
        value: "Europe/Guernsey",
      },
      {
        label: "Europe/Helsinki",
        value: "Europe/Helsinki",
      },
      {
        label: "Europe/Isle_of_Man",
        value: "Europe/Isle_of_Man",
      },
      {
        label: "Europe/Istanbul",
        value: "Europe/Istanbul",
      },
      {
        label: "Europe/Jersey",
        value: "Europe/Jersey",
      },
      {
        label: "Europe/Kaliningrad",
        value: "Europe/Kaliningrad",
      },
      {
        label: "Europe/Kirov",
        value: "Europe/Kirov",
      },
      {
        label: "Europe/Kyiv",
        value: "Europe/Kyiv",
      },
      {
        label: "Europe/Lisbon",
        value: "Europe/Lisbon",
      },
      {
        label: "Europe/Ljubljana",
        value: "Europe/Ljubljana",
      },
      {
        label: "Europe/London",
        value: "Europe/London",
      },
      {
        label: "Europe/Luxembourg",
        value: "Europe/Luxembourg",
      },
      {
        label: "Europe/Madrid",
        value: "Europe/Madrid",
      },
      {
        label: "Europe/Malta",
        value: "Europe/Malta",
      },
      {
        label: "Europe/Mariehamn",
        value: "Europe/Mariehamn",
      },
      {
        label: "Europe/Minsk",
        value: "Europe/Minsk",
      },
      {
        label: "Europe/Monaco",
        value: "Europe/Monaco",
      },
      {
        label: "Europe/Moscow",
        value: "Europe/Moscow",
      },
      {
        label: "Europe/Oslo",
        value: "Europe/Oslo",
      },
      {
        label: "Europe/Paris",
        value: "Europe/Paris",
      },
      {
        label: "Europe/Podgorica",
        value: "Europe/Podgorica",
      },
      {
        label: "Europe/Prague",
        value: "Europe/Prague",
      },
      {
        label: "Europe/Riga",
        value: "Europe/Riga",
      },
      {
        label: "Europe/Rome",
        value: "Europe/Rome",
      },
      {
        label: "Europe/Samara",
        value: "Europe/Samara",
      },
      {
        label: "Europe/San_Marino",
        value: "Europe/San_Marino",
      },
      {
        label: "Europe/Sarajevo",
        value: "Europe/Sarajevo",
      },
      {
        label: "Europe/Saratov",
        value: "Europe/Saratov",
      },
      {
        label: "Europe/Simferopol",
        value: "Europe/Simferopol",
      },
      {
        label: "Europe/Skopje",
        value: "Europe/Skopje",
      },
      {
        label: "Europe/Sofia",
        value: "Europe/Sofia",
      },
      {
        label: "Europe/Stockholm",
        value: "Europe/Stockholm",
      },
      {
        label: "Europe/Tallinn",
        value: "Europe/Tallinn",
      },
      {
        label: "Europe/Tirane",
        value: "Europe/Tirane",
      },
      {
        label: "Europe/Ulyanovsk",
        value: "Europe/Ulyanovsk",
      },
      {
        label: "Europe/Vaduz",
        value: "Europe/Vaduz",
      },
      {
        label: "Europe/Vatican",
        value: "Europe/Vatican",
      },
      {
        label: "Europe/Vienna",
        value: "Europe/Vienna",
      },
      {
        label: "Europe/Vilnius",
        value: "Europe/Vilnius",
      },
      {
        label: "Europe/Volgograd",
        value: "Europe/Volgograd",
      },
      {
        label: "Europe/Warsaw",
        value: "Europe/Warsaw",
      },
      {
        label: "Europe/Zagreb",
        value: "Europe/Zagreb",
      },
      {
        label: "Europe/Zurich",
        value: "Europe/Zurich",
      },
      {
        label: "GMT",
        value: "GMT",
      },
      {
        label: "Indian/Antananarivo",
        value: "Indian/Antananarivo",
      },
      {
        label: "Indian/Chagos",
        value: "Indian/Chagos",
      },
      {
        label: "Indian/Christmas",
        value: "Indian/Christmas",
      },
      {
        label: "Indian/Cocos",
        value: "Indian/Cocos",
      },
      {
        label: "Indian/Comoro",
        value: "Indian/Comoro",
      },
      {
        label: "Indian/Kerguelen",
        value: "Indian/Kerguelen",
      },
      {
        label: "Indian/Mahe",
        value: "Indian/Mahe",
      },
      {
        label: "Indian/Maldives",
        value: "Indian/Maldives",
      },
      {
        label: "Indian/Mauritius",
        value: "Indian/Mauritius",
      },
      {
        label: "Indian/Mayotte",
        value: "Indian/Mayotte",
      },
      {
        label: "Indian/Reunion",
        value: "Indian/Reunion",
      },
      {
        label: "Pacific/Apia",
        value: "Pacific/Apia",
      },
      {
        label: "Pacific/Auckland",
        value: "Pacific/Auckland",
      },
      {
        label: "Pacific/Bougainville",
        value: "Pacific/Bougainville",
      },
      {
        label: "Pacific/Chatham",
        value: "Pacific/Chatham",
      },
      {
        label: "Pacific/Chuuk",
        value: "Pacific/Chuuk",
      },
      {
        label: "Pacific/Easter",
        value: "Pacific/Easter",
      },
      {
        label: "Pacific/Efate",
        value: "Pacific/Efate",
      },
      {
        label: "Pacific/Fakaofo",
        value: "Pacific/Fakaofo",
      },
      {
        label: "Pacific/Fiji",
        value: "Pacific/Fiji",
      },
      {
        label: "Pacific/Funafuti",
        value: "Pacific/Funafuti",
      },
      {
        label: "Pacific/Galapagos",
        value: "Pacific/Galapagos",
      },
      {
        label: "Pacific/Gambier",
        value: "Pacific/Gambier",
      },
      {
        label: "Pacific/Guadalcanal",
        value: "Pacific/Guadalcanal",
      },
      {
        label: "Pacific/Guam",
        value: "Pacific/Guam",
      },
      {
        label: "Pacific/Honolulu",
        value: "Pacific/Honolulu",
      },
      {
        label: "Pacific/Kanton",
        value: "Pacific/Kanton",
      },
      {
        label: "Pacific/Kiritimati",
        value: "Pacific/Kiritimati",
      },
      {
        label: "Pacific/Kosrae",
        value: "Pacific/Kosrae",
      },
      {
        label: "Pacific/Kwajalein",
        value: "Pacific/Kwajalein",
      },
      {
        label: "Pacific/Majuro",
        value: "Pacific/Majuro",
      },
      {
        label: "Pacific/Marquesas",
        value: "Pacific/Marquesas",
      },
      {
        label: "Pacific/Midway",
        value: "Pacific/Midway",
      },
      {
        label: "Pacific/Nauru",
        value: "Pacific/Nauru",
      },
      {
        label: "Pacific/Niue",
        value: "Pacific/Niue",
      },
      {
        label: "Pacific/Norfolk",
        value: "Pacific/Norfolk",
      },
      {
        label: "Pacific/Noumea",
        value: "Pacific/Noumea",
      },
      {
        label: "Pacific/Pago_Pago",
        value: "Pacific/Pago_Pago",
      },
      {
        label: "Pacific/Palau",
        value: "Pacific/Palau",
      },
      {
        label: "Pacific/Pitcairn",
        value: "Pacific/Pitcairn",
      },
      {
        label: "Pacific/Pohnpei",
        value: "Pacific/Pohnpei",
      },
      {
        label: "Pacific/Port_Moresby",
        value: "Pacific/Port_Moresby",
      },
      {
        label: "Pacific/Rarotonga",
        value: "Pacific/Rarotonga",
      },
      {
        label: "Pacific/Saipan",
        value: "Pacific/Saipan",
      },
      {
        label: "Pacific/Tahiti",
        value: "Pacific/Tahiti",
      },
      {
        label: "Pacific/Tarawa",
        value: "Pacific/Tarawa",
      },
      {
        label: "Pacific/Tongatapu",
        value: "Pacific/Tongatapu",
      },
      {
        label: "Pacific/Wake",
        value: "Pacific/Wake",
      },
      {
        label: "Pacific/Wallis",
        value: "Pacific/Wallis",
      },
      {
        label: "US/Alaska",
        value: "US/Alaska",
      },
      {
        label: "US/Arizona",
        value: "US/Arizona",
      },
      {
        label: "US/Central",
        value: "US/Central",
      },
      {
        label: "US/Eastern",
        value: "US/Eastern",
      },
      {
        label: "US/Hawaii",
        value: "US/Hawaii",
      },
      {
        label: "US/Mountain",
        value: "US/Mountain",
      },
      {
        label: "US/Pacific",
        value: "US/Pacific",
      },
      {
        label: "UTC",
        value: "UTC",
      },
    ],
    []
  );

  const gender_option = useMemo(
    () => [
      { id: "Male", label: "Male", value: "Male" },
      { id: "Female", label: "Female", value: "Female" },
      { id: "Other", label: "Other", value: "Other" },
    ],
    []
  );

  const [dob, setDob] = useState([]);
  const [joining_date, setJoinDate] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [selectedFileName, setSelectedFileName] = React.useState("");
  const [selectedFileName1, setSelectedFileName1] = React.useState("");
  const [selectedFileName2, setSelectedFileName2] = React.useState("");
  const [selectedFileName3, setSelectedFileName3] = React.useState("");
  const [selectedFileName4, setSelectedFileName4] = React.useState("");
  const [selectedFileName5, setSelectedFileName5] = React.useState("");

  const showFileNameIfSelected = () => {
    const idProofUrl = form_obj.id_proof_url;
    console.log("Selected File Name 0:", idProofUrl);
    const fileName = idProofUrl ? idProofUrl.split("/").pop() : "";
    console.log("Extracted File Name:", fileName);
    setSelectedFileName(fileName);
  };
  const handleClearFile = () => {
    setSelectedFileName("");
  };
  const handleClearFile1 = () => {
    setSelectedFileName1("");
  };
  const handleClearFile2 = () => {
    setSelectedFileName2("");
  };
  const handleClearFile3 = () => {
    setSelectedFileName3("");
  };
  const handleClearFile4 = () => {
    setSelectedFileName4("");
  };
  const handleClearFile5 = () => {
    setSelectedFileName5("");
  };

  const showFile1NameIfSelected = () => {
    const file1Url = form_obj.file_1_url;
    console.log("Selected File Name 1:", file1Url);
    const fileName1 = file1Url ? file1Url.split("/").pop() : "";
    console.log("Extracted File Name1:", fileName1);
    setSelectedFileName1(fileName1);
  };

  const showFile2NameIfSelected = () => {
    const file2Url = form_obj.file_2_url;
    console.log("Selected File Name 2:", file2Url);
    const fileName2 = file2Url ? file2Url.split("/").pop() : "";
    console.log("Extracted File Name2:", fileName2);
    setSelectedFileName2(fileName2);
  };

  const showFile3NameIfSelected = () => {
    const file3Url = form_obj.file_3_url;
    console.log("Selected File Name 1:", file3Url);
    const fileName3 = file3Url ? file3Url.split("/").pop() : "";
    console.log("Extracted File Name1:", fileName3);
    setSelectedFileName3(fileName3);
  };
  const showFile4NameIfSelected = () => {
    const file4Url = form_obj.file_4_url;
    console.log("Selected File Name 4:", file4Url);
    const fileName4 = file4Url ? file4Url.split("/").pop() : "";
    console.log("Extracted File Name4:", fileName4);
    setSelectedFileName4(fileName4);
  };
  const showFile5NameIfSelected = () => {
    const file5Url = form_obj.file_5_url;
    console.log("Selected File Name 5:", file5Url);
    const fileName5 = file5Url ? file5Url.split("/").pop() : "";
    console.log("Extracted File Name5:", fileName5);
    setSelectedFileName5(fileName5);
  };

  useEffect(() => {
    console.log("Form Obj = ", form_obj);
    setEmployeeObj({
      ...form_obj,
      dob: ConvertISODateFormat(form_obj.dob),
      joining_date: ConvertISODateFormat(form_obj.joining_date),
    });
    let sub_dep_options = dep_options.filter(
      (obj) => obj.id !== form_obj.primary_department
    );
    setSubDeptOptions(sub_dep_options);
    setDob([new Date(form_obj.dob)]);
    setJoinDate([new Date(form_obj.joining_date)]);
    showFileNameIfSelected();
    showFile1NameIfSelected();
    showFile2NameIfSelected();
    showFile3NameIfSelected();
    showFile4NameIfSelected();
    showFile5NameIfSelected();
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeObj({
      ...employeeObj,
      [name]: value,
    });
  };

  const handleProfileChange = (e) => {
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

  const handleDateChange = (selectedDates, dateStr, instance) => {
    setDob(selectedDates);
    setEmployeeObj({
      ...employeeObj,
      dob: ConvertISODateFormat(selectedDates[0]),
    });
  };
  const handleJoinDateChange = (selectedJoinDate, dateStr, instance) => {
    setJoinDate(selectedJoinDate);
    setEmployeeObj({
      ...employeeObj,
      joining_date: ConvertISODateFormat(selectedJoinDate[0]),
    });
  };
  const handleTimeZoneChange = (selectedTimezone) => {
    setEmployeeObj({
      ...employeeObj,
      profile_timezone: selectedTimezone.value,
    });
  };
  const updateProfileData = (name, value) => {
    setEmployeeObj({
      ...employeeObj,
      [name]: value,
    });
  };

  const handleFileUpload = (e, name) => {
    const file = e.target.files[0];

    setEmployeeObj((oldObj) => ({
      ...oldObj,
      [name]: file,
    }));
  };
  const handleCFInputChange = (e, cf_id) => {
    setEmployeeObj({
      ...employeeObj,
      cf_values: [...employeeObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.target.value } : item
      ),
    });
  };

  const handleSubmit = async () => {
    dispatch(setLoaderVisible(true));

    console.log("emp Obj = ", employeeObj);
    let form_data = new FormData();
    employeeImage !== null &&
      form_data.append("profile", employeeImage, employeeImage.name);
    Object.entries(employeeObj).map((key, idx) => {
      if (key[0] === "cf_values") {
        form_data.append(key[0], JSON.stringify(key[1]));
      } else {
        form_data.append(key[0], key[1]);
      }
    });

    const Api = await PostApi("employee/add-new/", form_data, true);
    console.log("API RES = ", Api);
    if (Api.status && Api.status === 200) {
      employeeObj.id === 0
        ? dispatch(addEmployee(Api?.data.data))
        : dispatch(editEmployee(Api?.data?.data));
      dispatch(toggleRSBView(false));
      toast.success(Api?.data?.message);
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }

    dispatch(setLoaderVisible(false));

    // Api({
    //   method: "POST",
    //   url: "employee/add-new/",
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    //   data: form_data,
    // })
    //   .then((res) => {
    //     console.log("REs = ", res);
    //     employeeObj.id === 0
    //       ? dispatch(addEmployee(res?.data.data))
    //       : dispatch(editEmployee(res?.data?.data));
    //     dispatch(toggleRSBView(false));
    //     // dispatch(setActiveTableTab("all"));
    //     dispatch(setLoaderVisible(false));
    //     toast.success(res?.data?.message);
    //   })
    //   .catch((err) => {
    //     console.log("ERr == ", err);
    //     dispatch(setLoaderVisible(false));
    //     toast.error(
    //       err?.response?.data?.message || err?.response?.data?.detail
    //     );
    //   });
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
                    accept="image/*"
                    className="profile-img-file-input"
                    onChange={handleProfileChange}
                  />
                  <Label
                    htmlFor="profile-img-file-input"
                    className="profile-photo-edit avatar-xs"
                  >
                    <span className="avatar-title rounded-circle bg-light text-body">
                      <i className="ri-camera-fill"></i>
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="emailid" className="form-label">
                    Employee ID
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="emp_id"
                      id="employeeid"
                      className="form-control"
                      placeholder="Employee ID"
                      value={employeeObj.emp_id || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-user-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Enter Employee ID.
                  </div>
                </div>
              </Col>
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
                  <div id="passwordHelpBlock" className="form-text mb-3">
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
                  <div id="passwordHelpBlock" className="form-text mb-3">
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
                    <i className="ri-at-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Enter Email.
                  </div>
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="emp_gender" className="form-label">
                    Gender
                  </Label>

                  <Select
                    id="emp_gender"
                    isMulti={false}
                    options={gender_option || []}
                    className="basic-multi-select"
                    value={
                      (employeeObj.gender &&
                        gender_option.find(
                          (e) => e.value === employeeObj.gender
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setEmployeeObj({ ...employeeObj, gender: e.value });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Gender.
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="dob" className="form-label">
                    DOB
                  </Label>
                  <Flatpickr
                    className="form-control"
                    id="dob"
                    value={dob}
                    options={{
                      dateFormat: "d M, Y",
                    }}
                    onChange={handleDateChange}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Date Of Birth.
                </div>
              </Col>

              <Col lg={12}>
                <div>
                  <Label className="form-label">Contact Number*</Label>
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
                      value={employeeObj.contact_number || ""}
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
                          CountryList.filter((obj) => obj.show).sort((a, b) =>
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
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Enter Your Contact number with country code.
                </div>
              </Col>

              <Col lg={12}>
                <div>
                  <Label htmlFor="role" className="form-label">
                    Role
                  </Label>
                  <Select
                    id="role"
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
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Role
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="parentDepartment" className="form-label">
                    Primary Department
                  </Label>
                  <Select
                    id="parentDepartment"
                    isMulti={false}
                    options={dep_options || []}
                    className="basic-multi-select"
                    placeholder={"Select Primary Department"}
                    value={
                      employeeObj.primary_department
                        ? dep_options.find(
                            (obj) => obj.id === employeeObj.primary_department
                          )
                        : []
                    }
                    onChange={(e) => {
                      handlePrimaryDepChange(e);
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Primary Department
                </div>
              </Col>
              {employeeObj.primary_department !== 0 ? (
                <Col md={12} lg={12} xxl={12}>
                  <div>
                    <Label htmlFor="isManager" className="form-label">
                      Is Manager
                    </Label>
                    <div className="mb-2">
                      <div
                        className="form-check form-switch form-switch-md form-switch-success"
                        dir="ltr"
                      >
                        {" "}
                        <Input
                          id="isManager"
                          name="is_manager"
                          type="checkbox"
                          className="form-check-input"
                          checked={employeeObj.is_manager}
                          onChange={(e) =>
                            setEmployeeObj({
                              ...employeeObj,
                              is_manager: e.target.checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {dep_options.length && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Check if{" "}
                      <b>
                        <i>{employeeObj.fname}</i>
                      </b>{" "}
                      is Manager of{" "}
                      <b>
                        <i>
                          {dep_options.find(
                            (obj) => obj.id === employeeObj.primary_department
                          )?.name || ""}
                        </i>
                      </b>{" "}
                      Department ?
                    </div>
                  )}
                </Col>
              ) : (
                ""
              )}

              <Col lg={12}>
                <div>
                  <Label htmlFor="subDepartment" className="form-label">
                    Sub Department
                  </Label>
                  <Select
                    isMulti={true}
                    options={subDepOptions || []}
                    className="basic-multi-select"
                    value={
                      employeeObj.sub_department
                        ? subDepOptions.filter((obj) =>
                            employeeObj.sub_department.includes(obj.id)
                          )
                        : []
                    }
                    onChange={(e) => {
                      setEmployeeObj({
                        ...employeeObj,
                        sub_department: e.map((obj) => obj.id),
                      });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Sub Department
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="empWs">Work Schedule</Label>
                  <Select
                    id="empWs"
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
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Work Schedule
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="joindate" className="form-label">
                    Joining Date
                  </Label>
                  <Flatpickr
                    className="form-control"
                    id="joining_date"
                    value={joining_date}
                    options={{
                      dateFormat: "d M, Y",
                    }}
                    onChange={handleJoinDateChange}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Your Joining Date.
                </div>
              </Col>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    ID Proof
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "id_proof")}
                  />
                </div>
              </Col> */}

              {/* <div>{selectedFileName && `Selected File Name: ${selectedFileName}`}</div> */}

              {selectedFileName ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ID Proof</td>
                      <td>{selectedFileName}</td>
                      <td>
                        <button onClick={handleClearFile}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      ID Proof
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "id_proof")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName && <p>Select ID Proof.</p>}
              </div>

              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 1
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_1")}
                  />
                </div>
              </Col> */}

              {selectedFileName1 ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>File 1</td>
                      <td>{selectedFileName1}</td>
                      <td>
                        <button onClick={handleClearFile1}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 1
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_1")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName1 && <p>Select File 1.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 2
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_2")}
                  />
                </div>
              </Col> */}

              {selectedFileName2 ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>File 2</td>
                      <td>{selectedFileName2}</td>
                      <td>
                        <button onClick={handleClearFile2}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 2
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_2")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName2 && <p>Select File 2.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 3
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_3")}
                  />
                </div>
              </Col> */}
              {selectedFileName3 ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>File 3</td>
                      <td>{selectedFileName3}</td>
                      <td>
                        <button onClick={handleClearFile3}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 3
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_3")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName3 && <p>Select File 3.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 4
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_4")}
                  />
                </div>
              </Col> */}
              {selectedFileName4 ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>File 4</td>
                      <td>{selectedFileName4}</td>
                      <td>
                        <button onClick={handleClearFile4}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 4
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_4")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName4 && <p>Select File 4.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 5
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_5")}
                  />
                </div>
              </Col> */}
              {selectedFileName5 ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>File 5</td>
                      <td>{selectedFileName5}</td>
                      <td>
                        <button onClick={handleClearFile5}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 5
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_5")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName5 && <p>Select File 5.</p>}
              </div>
              {/* <Col lg={12}>
              <Label htmlFor="formFile" className="form-label"> Other Documents</Label>
                <FilePond
                  files={files}
                  onupdatefiles={handleFileUpdate}
                  allowMultiple={true}
                  maxFiles={3}
                  name="filepond"
                  className="filepond filepond-input-multiple mb-0"
                />
              </Col>
              <div id="passwordHelpBlock" className="form-text mb-3">
                Select Other Documents.
              </div> */}
              <Col lg={12}>
                <div>
                  <Label htmlFor="profile_timezone" className="form-label">
                    Time Zone
                  </Label>
                  <div className="form-icon right">
                    <Select
                      name="profile_timezone"
                      id="profile_timezone"
                      value={
                        employeeObj.profile_timezone &&
                        timzone_options.find(
                          (e) => e.value === employeeObj.profile_timezone
                        )
                      }
                      onChange={handleTimeZoneChange}
                      options={timzone_options}
                      placeholder="Select a time zone"
                    />
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Time Zone
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="isActive" className="form-label">
                    Is Active
                  </Label>

                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      {" "}
                      <Input
                        id="isActive"
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
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Check if{" "}
                  <b>
                    <i>{employeeObj.fname}</i>
                  </b>{" "}
                  is Active State.
                </div>
              </Col>

              <hr></hr>
              {employeeObj.cf_values && employeeObj.cf_values.length
                ? employeeObj.cf_values.map((obj) => (
                    <Col lg={12}>
                      <div className="mb-3">
                        <Label htmlFor="obj.input_name" className="form-label">
                          {obj.name}
                        </Label>
                        <div className="form-icon right">
                          <Input
                            type={obj.type || "text"}
                            name={obj.input_name}
                            id={obj.input_name}
                            className="form-control"
                            placeholder={`Enter ${obj.name}`}
                            required={obj.is_required || false}
                            value={obj.value || ""}
                            onChange={(e) => handleCFInputChange(e, obj.id)}
                          />
                          <i className="ri-user-2-line"></i>
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Enter {obj.name}
                        </div>
                      </div>
                    </Col>
                  ))
                : null}

              <Col lg={12}>
                <div className="text-end">
                  <Button type="submit" color="success" className="btn-label">
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

export default EmployeeForm;
