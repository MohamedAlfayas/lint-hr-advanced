export const leave_type_day_unit = 1
export const leave_type_hour_unit = 2
export const input_types = ['text', 'radio', 'number', 'date', 'file', 'checkbox']
export const select_type = 'option'
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
]

export const payroll_policy_period = [
    { id: 1, label: "Weekly", value: 1, calculation_type: 1 },
    { id: 2, label: "Monthly", value: 2, calculation_type: 1 },
    { id: 3, label: "Yearly", value: 3, calculation_type: 2 },
]

export const earnings_module_name = 'earnings'
export const allowances_module_name = 'allowances'
export const deductions_module_name = 'deductions'