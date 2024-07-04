export const leave_type_day_unit = 1;
export const leave_type_hour_unit = 2;

export const single_day_type_leave = 1;
export const multiple_day_type_leave = 2;

export const form_default_input_types = ["text", "radio", "number", "checkbox"];
export const form_date_type = "date";
export const form_select_type = "option";
export const form_file_type = "file";
export const custom_field_types = [
  { id: "text", label: "Text", value: "text" },
  { id: "number", label: "Number", value: "number" },
  { id: "date", label: "Date", value: "date" },
  { id: "option", label: "Option", value: "option" },
  { id: "file", label: "File", value: "file" },
];

export const custom_field_applicable_modules = [
  { id: "employee", label: "Employee", value: "employee" },
  { id: "organization", label: "Organization", value: "organization" },
];
export const payroll_policy_calculation_type = [
  { id: 1, label: "Flat Amount", value: 1 },
  { id: 2, label: "Percentage", value: 2 },
];

export const payroll_policy_period = [
  { id: 1, label: "Weekly", value: 1, calculation_type: 1 },
  { id: 2, label: "Monthly", value: 2, calculation_type: 1 },
  { id: 3, label: "Yearly", value: 3, calculation_type: 2 },
];

export const earnings_module_name = "earnings";
export const allowances_module_name = "allowances";
export const deductions_module_name = "deductions";

export const timzone_options = [
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
];

export const gender_options = [
  { id: 1, label: "Male", value: 1 },
  { id: 2, label: "Female", value: 2 },
];

export const leave_types_options = [
  { id: 1, label: "Paid", value: 1 },
  { id: 2, label: "UnPaid", value: 2 },
  { id: 3, label: "On Duty", value: 3 },
  { id: 4, label: "Comp Off", value: 4 },
];

export const leave_reset_options = [
  { id: 1, label: "January To December", value: 1 },
  { id: 2, label: "May To April", value: 2 },
];

export const hr_status_options = [
  { id: "0", label: "All Status", value: "0", class: "primary" },
  { id: "1", label: "Auto Approval", value: "1", class: "info" },
  { id: "2", label: "Approved", value: "2", class: "success" },
  { id: "3", label: "Pending", value: "3", class: "warning" },
  { id: "4", label: "Rejected", value: "4", class: "danger" },
];

export const record_options = [
  {
    id: "0",
    label: "All Record",
    value: "0",
  },
  {
    id: "1",
    label: "Missing IN/Out",
    value: "1",
  },
  {
    id: "2",
    label: "Edited Paid Time",
    value: "2",
  },
  {
    id: "3",
    label: "Edited OT",
    value: "3",
  },
  {
    id: "4",
    label: "Check IN on Holiday/Leave/Non-Working Days",
    value: "4",
  },
];

export const attendance_type_options = [
  {
    id: "1",
    label: "My Attendance",
    value: "1",
  },
  {
    id: "2",
    label: "Team Attendance",
    value: "2",
  },
  {
    id: "3",
    label: "All Attendance",
    value: "3",
  },
];

export const short_months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const map_radius_options = [
  { id: 1, label: "10 Meters", value: 10, zoom: 21 },
  { id: 2, label: "20 Meters", value: 20, zoom: 20 },
  { id: 3, label: "30 Meters", value: 30, zoom: 19 },
  { id: 4, label: "50 Meters", value: 50, zoom: 18.5 },
  { id: 5, label: "100 Meters", value: 100, zoom: 17.5 },
  { id: 6, label: "200 Meters", value: 200, zoom: 16.5 },
  { id: 7, label: "300 Meters", value: 300, zoom: 16 },
  { id: 8, label: "500 Meters", value: 500, zoom: 15.5 },
];

export const organization_component_name = "organization";
export const department_component_name = "department";
export const branch_component_name = "BranchForm";
export const employee_component_name = "employee";
export const role_component_name = "role";
export const work_schedule_component_name = "work_schedule";
export const holiday_component_name = "holiday";
export const attendance_component_name = "attendance";
export const leave_application_component_name = "leave_application";
export const leave_type_component_name = "leave_types";
export const leave_approval_component_name = "leave_approval";
export const attendance_approval_component_name = "attendance_approval";
export const custom_field_component_name = "custom_fields";
export const payroll_component_name = "payroll";
export const payroll_configuration_component_name = "payroll_configuration";
export const profile_view_component_name = "profile_view";
export const epf_wage_form_component_name = "epf_wage_form";
export const professional_tax_form_component_name = "professional_tax_form";
export const salary_form_component_name = "salary_form";
export const salary_policy_form_component_name = "salary_policy_form";
export const location_edit_form_component_name = "location_edit_form";
export const attendance_pending_table = "attendance_pending_table";
export const leave_pending_table = "leave_pending_table";
export const branch_location_form = "BranchLocationForm";

export const component_list_for_import_btn_access = [
  department_component_name,
  employee_component_name,
  leave_type_component_name,
  holiday_component_name,
];

export const component_list_for_import_form_access = [
  employee_component_name,
  leave_type_component_name,
  holiday_component_name,
];

export const export_sample_data_info = [
  {
    module_name: employee_component_name,
    api_url: "employee/get-sample-employee-data/",
    export_file_name: "Employee Sample",
  },
];

export const path_list_for_timer_hide = ["/attendance"];

export const employee_view_component_name = ["/employee/view"];

export const week_list = [
  { id: 0, label: "Sunday", value: 0 },
  { id: 1, label: "Monday", value: 1 },
  { id: 2, label: "Tuesday", value: 2 },
  { id: 3, label: "Wednesday", value: 3 },
  { id: 4, label: "Thursday", value: 4 },
  { id: 5, label: "Friday", value: 5 },
  { id: 6, label: "Saturday", value: 6 },
];

export const attendance_report_day_status = [
  { id: 1, label: "Working Day", value: 1 },
  { id: 2, label: "WeekOff", value: 2 },
  { id: 3, label: "Leave", value: 3 },
  { id: 4, label: "Leave Without Approval", value: 4 },
  { id: 5, label: "Holiday", value: 5 },
];
export const day_type = [
  { id: 1, label: "Full Day", value: 1 },
  { id: 2, label: "Half Day", value: 2 },
];

export const DateFormat = "DD-MM-YYYY";
export const MonthFormat = "YYYY-MM";
export const DateTimeFormat = "DD-MM-YYYY HH:mm";

export const IndiaStates = [
  {
    id: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
    value: "Andaman and Nicobar Islands",
  },
  { id: "Andhra Pradesh", label: "Andhra Pradesh", value: "Andhra Pradesh" },
  {
    id: "Arunachal Pradesh",
    label: "Arunachal Pradesh",
    value: "Arunachal Pradesh",
  },
  { id: "Assam", label: "Assam", value: "Assam" },
  { id: "Bihar", label: "Bihar", value: "Bihar" },
  { id: "Chandigarh", label: "Chandigarh", value: "Chandigarh" },
  { id: "Chhattisgarh", label: "Chhattisgarh", value: "Chhattisgarh" },
  {
    id: "Dadra and Nagar Haveli",
    label: "Dadra and Nagar Haveli",
    value: "Dadra and Nagar Haveli",
  },
  { id: "Daman and Diu", label: "Daman and Diu", value: "Daman and Diu" },
  { id: "Delhi", label: "Delhi", value: "Delhi" },
  { id: "Goa", label: "Goa", value: "Goa" },
  { id: "Gujarat", label: "Gujarat", value: "Gujarat" },
  { id: "Haryana", label: "Haryana", value: "Haryana" },
  {
    id: "Himachal Pradesh",
    label: "Himachal Pradesh",
    value: "Himachal Pradesh",
  },
  {
    id: "Jammu and Kashmir",
    label: "Jammu and Kashmir",
    value: "Jammu and Kashmir",
  },
  { id: "Jharkhand", label: "Jharkhand", value: "Jharkhand" },
  { id: "Karnataka", label: "Karnataka", value: "Karnataka" },
  { id: "Kerala", label: "Kerala", value: "Kerala" },
  { id: "Lakshadweep", label: "Lakshadweep", value: "Lakshadweep" },
  { id: "Madhya Pradesh", label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { id: "Maharashtra", label: "Maharashtra", value: "Maharashtra" },
  { id: "Manipur", label: "Manipur", value: "Manipur" },
  { id: "Meghalaya", label: "Meghalaya", value: "Meghalaya" },
  { id: "Mizoram", label: "Mizoram", value: "Mizoram" },
  { id: "Nagaland", label: "Nagaland", value: "Nagaland" },
  { id: "Orissa", label: "Orissa", value: "Orissa" },
  { id: "Pondicherry", label: "Pondicherry", value: "Pondicherry" },
  { id: "Punjab", label: "Punjab", value: "Punjab" },
  { id: "Rajasthan", label: "Rajasthan", value: "Rajasthan" },
  { id: "Sikkim", label: "Sikkim", value: "Sikkim" },
  { id: "Tamil Nadu", label: "Tamil Nadu", value: "Tamil Nadu" },
  { id: "Tripura", label: "Tripura", value: "Tripura" },
  { id: "Uttar Pradesh", label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { id: "Uttaranchal", label: "Uttaranchal", value: "Uttaranchal" },
  { id: "West Bengal", label: "West Bengal", value: "West Bengal" },
];

export const SwitzerlandStates = [
  { id: "Aargau", label: "Aargau", value: "Aargau" },
  { id: "Ausser-Rhoden", label: "Ausser-Rhoden", value: "Ausser-Rhoden" },
  {
    id: "Basel-Landschaft",
    label: "Basel-Landschaft",
    value: "Basel-Landschaft",
  },
  { id: "Basel-Stadt", label: "Basel-Stadt", value: "Basel-Stadt" },
  { id: "Bern", label: "Bern", value: "Bern" },
  { id: "Fribourg", label: "Fribourg", value: "Fribourg" },
  { id: "Geneve", label: "Geneve", value: "Geneve" },
  { id: "Glarus", label: "Glarus", value: "Glarus" },
  { id: "Graubunden", label: "Graubunden", value: "Graubunden" },
  { id: "Inner-Rhoden", label: "Inner-Rhoden", value: "Inner-Rhoden" },
  { id: "Jura", label: "Jura", value: "Jura" },
  { id: "Luzern", label: "Luzern", value: "Luzern" },
  { id: "Neuchatel", label: "Neuchatel", value: "Neuchatel" },
  { id: "Nidwalden", label: "Nidwalden", value: "Nidwalden" },
  { id: "Obwalden", label: "Obwalden", value: "Obwalden" },
  { id: "Sankt Gallen", label: "Sankt Gallen", value: "Sankt Gallen" },
  { id: "Schaffhausen", label: "Schaffhausen", value: "Schaffhausen" },
  { id: "Schwyz", label: "Schwyz", value: "Schwyz" },
  { id: "Solothurn", label: "Solothurn", value: "Solothurn" },
  { id: "Thurgau", label: "Thurgau", value: "Thurgau" },
  { id: "Ticino", label: "Ticino", value: "Ticino" },
  { id: "Uri", label: "Uri", value: "Uri" },
  { id: "Valais", label: "Valais", value: "Valais" },
  { id: "Vaud", label: "Vaud", value: "Vaud" },
  { id: "Zug", label: "Zug", value: "Zug" },
  { id: "Zurich", label: "Zurich", value: "Zurich" },
];
export const SriLankaStates = [
  {
    id: "Central Province",
    label: "Central Province",
    value: "Central Province",
  },
  {
    id: "Eastern Province",
    label: "Eastern Province",
    value: "Eastern Province",
  },
  {
    id: "Northern Province",
    label: "Northern Province",
    value: "Northern Province",
  },
  {
    id: "North Central Province",
    label: "North Central Province",
    value: "North Central Province",
  },
  {
    id: "North Western Province",
    label: "North Western Province",
    value: "North Western Province",
  },
  {
    id: "Sabaragamuwa Province",
    label: "Sabaragamuwa Province",
    value: "Sabaragamuwa Province",
  },
  {
    id: "Southern Province",
    label: "Southern Province",
    value: "Southern Province",
  },
  { id: "Uva Province", label: "Uva Province", value: "Uva Province" },
  {
    id: "Western Province",
    label: "Western Province",
    value: "Western Province",
  },
];


export const leave_approval_status_options = [
  { id: "0", label: "All Status", value: "0" },
  { id: "1", label: "Pending", value: "1" },
  { id: "2", label: "Approved", value: "2" },
  { id: "3", label: "Rejected", value: "3" },
];

export const leave_type_options = [
  { id: 1, label: "Leave Type", value: "0" },
  { id: 2, label: "Permission Type", value: "1" },
];

export const leave_approval_table_filter_options = [
  { id: 1, label: "Pending", value: 1 },
  { id: 2, label: "Approved", value: 2 },
  { id: 3, label: "Rejected", value: 3 },
];

export const custom_field_input_types = [
  { id: "text", label: "Text", value: "text" },
  { id: "number", label: "Number", value: "number" },
  { id: "date", label: "Date", value: "date" },
  { id: "option", label: "Option", value: "option" },
  { id: "file", label: "File", value: "file" },
];
export const custom_field_module_lists = [
  { id: "employee", label: "Employee", value: "employee" },
  { id: "organization", label: "Organization", value: "organization" },
];

export const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString().padStart(2, "0"),
  value: i.toString().padStart(2, "0"),
}));

export const minuteOptions = Array.from({ length: 6 }, (_, i) => ({
  label: (i * 10).toString().padStart(2, "0"),
  value: (i * 10).toString().padStart(2, "0"),
}));

export const AllMinuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, "0"),
  value: i.toString().padStart(2, "0"),
}));

export const late_entry_display = {
  class: "warning",
  text: "Late",
};

export const on_time_entry_display = {
  class: "success",
  text: "OnTime",
};

export const holiday_display = {
  class: "secondary",
  text: "Holiday",
};

export const week_off_display = {
  class: "primary",
  text: "W/O",
};

export const leave_display = {
  class: "body",
  text: "Leave",
};

export const absent_display = {
  class: "danger",
  text: "Absent",
};

export const earlyout_display = {
  class: "warning",
  text: "Early Out",
};

export const earlyin_display = {
  class: "success",
  text: "Early In",
};

export const not_applicable = {
  class: "black",
  text: "N/A",
};

export const employeeTypeOptions = [
  { id: "0", label: "All Employee", value: "0" },
  { id: "1", label: "My Team Members", value: "1" },
];

export const attendanceStasticsOptions = [
  { id: 0, label: "All", value: "All" },
  { id: 1, label: "My Team", value: "My Team" },
];
