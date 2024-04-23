export const CheckRoleAccess = (access_key) => {
    const profile_data = JSON.parse(
        localStorage.getItem("lint_hr_profile_data")
    );

    if (!!profile_data) {
        console.log("IFFFF");
        if (!!profile_data.is_admin && profile_data?.is_admin === true) {
            console.log("IFF Show the Btn FOR ADMIN");
            return true
        } else {
            if (!!profile_data.permission_list && profile_data.permission_list.includes(access_key)) {
                console.log("Show the Btn FOR EMP");
                return true
            }
            else {
                console.log("Do Not Show the Btn FOR EMP");
                return false
            }
        }
    } else {
        console.log("ELSE Show the Btn");
        return true
    }

}