import { Api } from "../common/api/Api"
import { setVersion } from "../redux/reducers/ChildReducer/MetaReducer";

export const GetGlobalVersion = async (dispatch) => {
    Api({
        type: 'GET',
        url: "/api/get/global-meta-version/",
    }).then(res => {
        Api({
            method: 'GET',
            url: "/api/get/global-meta-data/",
        })
            .then(master => {
                localStorage.setItem("lint_hr_globaldata", JSON.stringify(master?.data));
                localStorage.setItem("lint_hr_v", res?.data?.version);
                dispatch(setVersion(res?.data?.version))
            })
            .catch(error => {
                console.log("ERRor == ", error);
            })
    }).catch(err => {
        console.log("Meta Version Error = ", err);
    })
}


