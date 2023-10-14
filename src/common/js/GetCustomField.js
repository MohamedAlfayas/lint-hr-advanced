import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

export const GetCustomField = (formname) => {
    // Custom Field Option

    let customFieldOptions = ((GetLocalStorageData('custom_fields')).filter(obj => {
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