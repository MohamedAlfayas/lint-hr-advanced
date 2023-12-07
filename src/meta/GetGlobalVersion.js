import { Api } from "../common/api/Api"
import { GetApi } from "../common/api/GetApi";
import { setVersion } from "../redux/reducers/ChildReducer/MetaReducer";

export const GetGlobalVersion = async (dispatch) => {
    const MetaVersionApi = await GetApi("/api/get/global-meta-version/");
    if (MetaVersionApi.status && MetaVersionApi.status === 200) {
        if (localStorage.getItem("lint_hr_v") == null || localStorage.getItem("lint_hr_v") == "" || parseInt(MetaVersionApi?.data?.version) != parseInt(localStorage.getItem("lint_hr_v")) || localStorage.getItem("lint_hr_globaldata") == null) {
            Api({
                method: 'GET',
                url: "/api/get/global-meta-data/",
            })
                .then(master => {
                    localStorage.setItem("lint_hr_globaldata", JSON.stringify(master?.data));
                    localStorage.setItem("lint_hr_v", MetaVersionApi?.data?.version);
                    dispatch(setVersion(MetaVersionApi?.data?.version))
                })
                .catch(error => {
                    console.log("ERRor == ", error);
                })
        }
    } else {
        console.log("err = ", err);
    }
}