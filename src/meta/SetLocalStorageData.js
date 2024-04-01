import { GetLocalStorageData } from "./GetLocalStorageData";

export const SetLocalStorage = (key, obj, type) => {
    const thisMetaData = GetLocalStorageData(key);
    let updated_md = []

    if (type === 1) {
        updated_md = obj
    } else if (type === 2) {
        updated_md = [...thisMetaData, obj]
    } else if (type === 3) {
        updated_md = [...thisMetaData].map(d => {
            if (d.id === obj.id) {
                return obj
            } else {
                return d
            }
        })
    }
    let GlobalMetaData = localStorage.getItem("lint_hr_globaldata") !== null ? JSON.parse(localStorage.getItem("lint_hr_globaldata")) : {};
    GlobalMetaData[key] = updated_md;
    localStorage.setItem("lint_hr_globaldata", JSON.stringify(GlobalMetaData))
}