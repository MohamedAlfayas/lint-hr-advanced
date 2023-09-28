export const GetLocalStorageData = (key) =>{

    let data = null

    if((localStorage.getItem("lint_hr_globaldata") !== null) && key in (JSON.parse(localStorage.getItem('lint_hr_globaldata')))){
        data = (JSON.parse(localStorage.getItem('lint_hr_globaldata')))[key]
    }

    console.log("LS Data = ",data);

    return data
}