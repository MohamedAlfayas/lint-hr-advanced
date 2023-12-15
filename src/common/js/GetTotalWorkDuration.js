import { toast } from "react-toastify";
import { setTimer } from "../../redux/reducers/ChildReducer/ClockReducer"
import { GetApi } from "../api/GetApi"

export const GetTotalWorkDuration = async (dispatch) => {
    const Api = await GetApi("attendance/get-total-work-duration/");
    console.log("GET TOTAL DURATION WORK API RES = ", Api);
    if (Api?.status && Api?.status === 200) {
        let total_seconds = Api?.data?.data?.total_work_duration;
        let currently_checked_in = Api?.data?.data?.currently_checked_in
        dispatch(setTimer({ 'total_seconds': total_seconds, 'currently_checked_in': currently_checked_in }))
    } else {
        toast.error('Something Went Wrong')
    }
}