import { Api } from "../common/api/Api"
import { setVersion } from "../redux/reducers/ChildReducer/MetaReducer";

export const GetGlobalVersion = (dispatch) =>{
    Api({
        method: "GET",
        url : "/api/get/global-meta-version/",
    })
    .then(res =>{
        if (localStorage.getItem("lint_hr_v") == null || localStorage.getItem("lint_hr_v") == "" || parseInt(res?.data?.version) != parseInt(localStorage.getItem("lint_hr_v")) || localStorage.getItem("lint_hr_globaldata") == null){
             Api({
                method : 'GET',
                url : "/api/get/global-meta-data/",
             })
             .then(master =>{
                localStorage.setItem("lint_hr_globaldata", JSON.stringify(master?.data));
                localStorage.setItem("lint_hr_v",res?.data?.version);
                dispatch(setVersion(res?.data?.version))
             })
             .catch(error =>{
                console.log("ERRor == ",error);
             })
        }
    })
    .catch(err =>{
        console.log("err = ",err);
    })
}