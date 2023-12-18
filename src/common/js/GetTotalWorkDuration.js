import { toast } from "react-toastify";
import { setTimer } from "../../redux/reducers/ChildReducer/ClockReducer"
import { Api } from "../api/Api";

export const GetTotalWorkDuration = async (dispatch) => {
    Api({
        type: 'GET',
        url: "attendance/get-total-work-duration/"
    }).then(res => {
        let total_seconds = res?.data?.data?.total_work_duration;
        let currently_checked_in = res?.data?.data?.currently_checked_in
        dispatch(setTimer({ 'total_seconds': total_seconds, 'currently_checked_in': currently_checked_in }))
    }).catch(err => {
        console.log('Something Went Wrong - ', err);
    })

}