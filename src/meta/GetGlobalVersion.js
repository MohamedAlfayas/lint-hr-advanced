import { Api } from "../common/api/Api";
import { setVersion } from "../redux/reducers/ChildReducer/MetaReducer";
import { setMyProfileDataReducer } from "../redux/reducers/ChildReducer/MyProfileReducer";

export const GetGlobalVersion = async (dispatch) => {
  Api({
    type: "GET",
    url: "/api/get/global-meta-version/",
  })
    .then((res) => {
      if (
        localStorage.getItem("lint_hr_v") == null ||
        localStorage.getItem("lint_hr_v") == "" ||
        parseInt(res?.data?.version) !=
          parseInt(localStorage.getItem("lint_hr_v")) ||
        localStorage.getItem("lint_hr_globaldata") == null
      ) {
        Api({
          method: "GET",
          url: "/api/get/global-meta-data/v2/",
        })
          .then((master) => {
            localStorage.setItem(
              "lint_hr_globaldata",
              JSON.stringify(master?.data),
            );
            localStorage.setItem("lint_hr_v", res?.data?.version);
            dispatch(setVersion(res?.data?.version));
            localStorage.setItem(
              "lint_hr_profile_data",
              JSON.stringify(master?.data?.my_profile),
            );
            dispatch(setMyProfileDataReducer(master?.data?.my_profile));
          })
          .catch((error) => {
            console.log("ERRor");
          });
      }
    })
    .catch((err) => {
      console.log("Meta Version Error");
    });
};
