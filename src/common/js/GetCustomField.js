import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

export const GetCustomField = (formname) => {
    // Custom Field Option

    let custom_field_data = GetLocalStorageData('custom_fields') || []

    let customFieldOptions = (custom_field_data.filter(obj => {
        if ((obj.status === true) && (obj.applicable_for_modules).includes(formname)) {
            return obj
        }
    })) || [];

    const CustomFieldsForThisForm = customFieldOptions.map(({ status, applicable_for_modules, ...rest }) => {
        return {
            ...rest,
            value: ""
        }
    });

    return CustomFieldsForThisForm
}