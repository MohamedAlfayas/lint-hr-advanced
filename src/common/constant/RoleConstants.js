export const CONFIGURATION_VIEW_ACCESS_KEY = "dac690d1-6712-4aa6-9b4f-7d71bc4f8eb1";
export const COMPANY_PROFILE_VIEW_ACCESS_KEY = "f78e6312-92f6-434d-aa7d-8bfb168fb12e";
export const DEPARTMENT_VIEW_ACCESS_KEY = "da36512d-78a4-44b3-977e-0c5f39979ac6";
export const BRANCH_VIEW_ACCESS_KEY = "d7b7a1d5-d267-4640-9eb6-b82dc5a84f16";
export const CUSTOM_FIELD_VIEW_ACCESS_KEY = "9057d872-1f18-42c8-b2fb-89b29f2c05cf";

export const UPDATE_COMPANY_PROFILE_ACCESS_KEY =
    "83b54d4e-dcf5-42ff-8d88-d7a3df38b4c4";

export const CREATE_DEPARTMENT_ACCESS_KEY =
    "9b6c1940-9007-4cf0-9d3b-ecb9d7e3dab0";
export const EDIT_DEPARTMENT_ACCESS_KEY =
    "b2643df5-07f1-4b10-bc02-c8b130e3c34b";

export const CREATE_BRANCH_ACCESS_KEY = "be79d1b3-3cc4-4a6d-b3c3-64e5a9d1c645";
export const EDIT_BRANCH_ACCESS_KEY = "a78aa075-88e0-4c52-a503-b8de29ff45b2";

export const CREATE_CUSTOM_FIELD_ACCESS_KEY =
    "5bb4b5d2-1913-4fd0-bcb0-fc0d95035f02";
export const EDIT_CUSTOM_FIELD_ACCESS_KEY =
    "ac083d58-1cf4-4568-84f3-76f5506e8df3";

export const CREATE_EMPLOYEE_ACCESS_KEY =
    "26c44a29-9b81-45cf-84ab-6d9f22a0b8a7";
export const EDIT_EMPLOYEE_ACCESS_KEY = "723820ec-1fb9-472e-a64a-f526146c9b40";

export const VIEW_TEAM_EMPLOYEE_ACCESS_KEY =
    "d08e5377-09a6-42a5-8164-eb2af451bce3";
export const VIEW_ALL_EMPLOYEE_ACCESS_KEY =
    "17db6d86-bd6a-4150-bf40-5600a67a49f1";

export const APPROVE_REJECT_ALL_LEAVE_ACCESS_KEY =
    "15c51336-a05b-488b-af43-29061deec942";
export const APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY =
    "d6bbf8dd-ccd3-4866-9c57-afdc1cc9268a";

export const APPROVE_REJECT_ALL_ATTENDANCE_ACCESS_KEY =
    "99cb748f-2de4-4fe7-9b47-77b9d929f5f1";
export const APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY =
    "80c29697-0343-4c71-8556-0df10652b3f7";

export const VIEW_ALL_ATTENDANCE_ACCESS_KEY =
    "2ebd3c5d-dca8-45cc-8334-5a32f2451893";
export const VIEW_TEAM_ATTENDANCE_ACCESS_KEY =
    "8d33a155-2d7e-4a5d-8608-35431a44662c";

export const EDIT_TEAM_ATTENDANCE_ACCESS_KEY = "cc87c7e2-7a80-4d7f-b083-971bd25c9f6d";
export const EDIT_ALL_ATTENDANCE_ACCESS_KEY = "6aa0e447-7a32-4664-a53b-ae8c729d05af";

export const VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY =
    "5ac47d4f-3063-4730-a9da-c4f403ca7853";
export const VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY =
    "034d87cc-a1dd-42b0-9c20-f1163d4a5716";
export const VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY =
    "1b5d106f-f3e8-41f3-8041-d3f71a19d27d";
export const VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY =
    "08cd201a-d20d-45d3-8b60-3a6fb7e4acc0";



export const CAN_VIEW_REPORT_ACCESS_KEY = "c77528b2-5d9f-49ad-b6d1-5f95e61a66a0";
export const CAN_VIEW_TEAM_REPORT_ACCESS_KEY = "5cd1e062-cf44-4b45-8f9b-784f82b15dc5";
export const CAN_VIEW_ALL_REPORT_ACCESS_KEY = "7152dbf3-263f-4d7e-9c28-3f147fc0357a";

export const default_roles_list = [
    {
        id: 1,
        name: "Organization",
        priority: 1,
        note: "",
        permission: [
            {
                id: 101,
                role_uuid: CONFIGURATION_VIEW_ACCESS_KEY,
                dependency_for_uuid_list: [
                    COMPANY_PROFILE_VIEW_ACCESS_KEY,
                    UPDATE_COMPANY_PROFILE_ACCESS_KEY,
                    DEPARTMENT_VIEW_ACCESS_KEY,
                    CREATE_DEPARTMENT_ACCESS_KEY,
                    EDIT_DEPARTMENT_ACCESS_KEY,
                    BRANCH_VIEW_ACCESS_KEY,
                    CREATE_BRANCH_ACCESS_KEY,
                    EDIT_BRANCH_ACCESS_KEY,
                    CUSTOM_FIELD_VIEW_ACCESS_KEY,
                    CREATE_CUSTOM_FIELD_ACCESS_KEY,
                    EDIT_CUSTOM_FIELD_ACCESS_KEY,
                ],
                notes: "User Can View Configuration",
                element: "per_configuration_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            {
                id: 102,
                role_uuid: COMPANY_PROFILE_VIEW_ACCESS_KEY,
                dependency_for_uuid_list: [UPDATE_COMPANY_PROFILE_ACCESS_KEY],
                notes: "User Can View Company Profile",
                element: "per_company_profile_view",
                dependency_to_element_list: ["per_configuration_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 103,
                role_uuid: UPDATE_COMPANY_PROFILE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Update Company Profile",
                element: "per_company_profile_update",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_company_profile_view",
                ],
                checked: false,
                disabled: false,
            },
            {
                id: 104,
                role_uuid: DEPARTMENT_VIEW_ACCESS_KEY,
                dependency_for_uuid_list: [
                    CREATE_DEPARTMENT_ACCESS_KEY,
                    EDIT_DEPARTMENT_ACCESS_KEY,
                ],
                notes: "User Can View Department",
                element: "per_department_view",
                dependency_to_element_list: ["per_configuration_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 105,
                role_uuid: CREATE_DEPARTMENT_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Create Department",
                element: "per_department_create",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_department_view",
                ],
                checked: false,
                disabled: false,
            },
            {
                id: 106,
                role_uuid: EDIT_DEPARTMENT_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Update Department",
                element: "per_department_update",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_department_view",
                ],
                checked: false,
                disabled: false,
            },
            {
                id: 107,
                role_uuid: BRANCH_VIEW_ACCESS_KEY,
                dependency_for_uuid_list: [
                    CREATE_BRANCH_ACCESS_KEY,
                    EDIT_BRANCH_ACCESS_KEY,
                ],
                notes: "User Can View Branch",
                element: "per_branch_view",
                dependency_to_element_list: ["per_configuration_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 108,
                role_uuid: CREATE_BRANCH_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Create Branch",
                element: "per_branch_create",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_branch_view",
                ],
                checked: false,
                disabled: false,
            },
            {
                id: 109,
                role_uuid: EDIT_BRANCH_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Update Branch",
                element: "per_branch_update",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_branch_view",
                ],
                checked: false,
                disabled: false,
            },
            {
                id: 110,
                role_uuid: CUSTOM_FIELD_VIEW_ACCESS_KEY,
                dependency_for_uuid_list: [
                    CREATE_CUSTOM_FIELD_ACCESS_KEY,
                    EDIT_CUSTOM_FIELD_ACCESS_KEY,
                ],
                notes: "User Can View Custom field",
                element: "per_custom_field_view",
                dependency_to_element_list: ["per_configuration_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 111,
                role_uuid: CREATE_CUSTOM_FIELD_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Create Custom field",
                element: "per_custom_field_create",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_custom_field_view",
                ],
                checked: false,
                disabled: false,
            },
            {
                id: 112,
                role_uuid: EDIT_CUSTOM_FIELD_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Update Custom field",
                element: "per_custom_field_update",
                dependency_to_element_list: [
                    "per_configuration_view",
                    "per_custom_field_view",
                ],
                checked: false,
                disabled: false,
            },
        ],
    },
    {
        id: 2,
        name: "Employee",
        priority: 2,
        note: "",
        permission: [
            {
                id: 202,
                role_uuid: CREATE_EMPLOYEE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Create Employee",
                element: "per_employee_create",
                dependency_to_element_list: ["per_team_employee_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 203,
                role_uuid: EDIT_EMPLOYEE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Update Employee",
                element: "per_employee_update",
                dependency_to_element_list: ["per_team_employee_view"],
                checked: false,
                disabled: false,
            },
            // Can View Team Employee
            {
                id: 204,
                role_uuid: VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
                dependency_for_uuid_list: [
                    CREATE_EMPLOYEE_ACCESS_KEY,
                    EDIT_EMPLOYEE_ACCESS_KEY,
                    VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
                    EDIT_TEAM_ATTENDANCE_ACCESS_KEY
                ],
                notes: "User Can View Team Employee",
                element: "per_team_employee_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            // Can View All Employee\
            {
                id: 205,
                role_uuid: VIEW_ALL_EMPLOYEE_ACCESS_KEY,
                dependency_for_uuid_list: [
                    VIEW_ALL_ATTENDANCE_ACCESS_KEY,
                    EDIT_ALL_ATTENDANCE_ACCESS_KEY,
                ],
                notes: "User Can View All Employee",
                element: "per_all_employee_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
        ],
    },
    {
        id: 3,
        name: "Attendance",
        priority: 3,
        note: "",
        permission: [
            {
                id: 302,
                role_uuid: VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
                dependency_for_uuid_list: [EDIT_TEAM_ATTENDANCE_ACCESS_KEY],
                notes: "User Can View Team Attendance",
                element: "per_attendance_view_team",
                dependency_to_element_list: ["per_team_employee_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 303,
                role_uuid: EDIT_TEAM_ATTENDANCE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Edit Team Attendance",
                element: "per_attendance_edit_team",
                dependency_to_element_list: ["per_attendance_view_team", "per_team_employee_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 312,
                role_uuid: VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
                dependency_for_uuid_list: [APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY],
                notes: "User Can View Team's Attendance Approval",
                element: "per_team_attendance_approval_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            {
                id: 304,
                role_uuid: APPROVE_REJECT_TEAM_ATTENDANCE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Approve/Reject Team Attendance",
                element: "per_approve_reject_team",
                dependency_to_element_list: ["per_team_attendance_approval_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 305,
                role_uuid: VIEW_ALL_ATTENDANCE_ACCESS_KEY,
                dependency_for_uuid_list: [EDIT_ALL_ATTENDANCE_ACCESS_KEY],
                notes: "User Can View All Attendance",
                element: "per_attendance_view_all",
                dependency_to_element_list: ["per_all_employee_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 306,
                role_uuid: EDIT_ALL_ATTENDANCE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Edit All Attendance",
                element: "per_attendance_edit_all",
                dependency_to_element_list: ["per_attendance_view_all", "per_all_employee_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 313,
                role_uuid: VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY,
                dependency_for_uuid_list: [APPROVE_REJECT_ALL_ATTENDANCE_ACCESS_KEY],
                notes: "User Can View All Attendance Approval",
                element: "per_all_attendance_approval_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            {
                id: 307,
                role_uuid: APPROVE_REJECT_ALL_ATTENDANCE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Approve/Reject All Attendance",
                element: "per_approve_reject_all",
                dependency_to_element_list: ["per_all_attendance_approval_view"],
                checked: false,
                disabled: false,
            },

            {
                id: 308,
                role_uuid: VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
                dependency_for_uuid_list: [APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY],
                notes: "User Can View Team's Leave Approval",
                element: "per_teams_leave_approval_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            {
                id: 309,
                role_uuid: APPROVE_REJECT_TEAM_LEAVE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Approve/Reject Team's Leave",
                element: "per_approve_reject_teams_leave",
                dependency_to_element_list: ["per_teams_leave_approval_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 310,
                role_uuid: VIEW_ALL_LEAVE_APPROVAL_ACCESS_KEY,
                dependency_for_uuid_list: [APPROVE_REJECT_ALL_LEAVE_ACCESS_KEY],
                notes: "User Can View All Leave Approval",
                element: "per_all_leave_approval_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            {
                id: 311,
                role_uuid: APPROVE_REJECT_ALL_LEAVE_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can Approve/Reject All Leave",
                element: "per_approve_reject_all_leave",
                dependency_to_element_list: ["per_all_leave_approval_view"],
                checked: false,
                disabled: false,
            },
        ],
    },
    {
        id: 4,
        name: "Report",
        priority: 4,
        note: "",
        permission: [
            {
                id: 401,
                role_uuid: CAN_VIEW_REPORT_ACCESS_KEY,
                dependency_for_uuid_list: [
                    CAN_VIEW_TEAM_REPORT_ACCESS_KEY,
                    CAN_VIEW_ALL_REPORT_ACCESS_KEY,
                ],
                notes: "User Can View Report",
                element: "per_report_view",
                dependency_to_element_list: [],
                checked: false,
                disabled: false,
            },
            {
                id: 402,
                role_uuid: CAN_VIEW_TEAM_REPORT_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can View Team Report",
                element: "per_team_report_view",
                dependency_to_element_list: ["per_report_view"],
                checked: false,
                disabled: false,
            },
            {
                id: 403,
                role_uuid: CAN_VIEW_ALL_REPORT_ACCESS_KEY,
                dependency_for_uuid_list: [],
                notes: "User Can View All Report",
                element: "per_all_report_view",
                dependency_to_element_list: ["per_report_view"],
                checked: false,
                disabled: false,
            },
        ],
    },
];