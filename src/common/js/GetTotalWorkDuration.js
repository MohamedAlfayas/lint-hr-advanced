import { toast } from "react-toastify";
import { setTimer } from "../../redux/reducers/ChildReducer/ClockReducer";
import { Api } from "../api/Api";
import { setTotalWorkDuration } from "../../redux/reducers/ChildReducer/TimeTrackingReducer";

export const GetTotalWorkDuration = async (dispatch) => {
  Api({
    type: "GET",
    url: "attendance/get-total-work-duration/",
  })
    // .then((res) => {
    //   let total_seconds = res?.data?.data?.total_work_duration;
    //   let currently_checked_in = res?.data?.data?.currently_checked_in;
    //   dispatch(
    //     setTimer({
    //       total_seconds: total_seconds,
    //       currently_checked_in: currently_checked_in,
    //     })
    //   );

    .then((res) => {
      const data = res?.data?.data;

      // dispatch(
      //   setTimer({
      //     total_seconds: data.total_work_duration,
      //     currently_checked_in: data.currently_checked_in,
      //     total_break_duration: data.total_break_duration,
      //     is_on_break: data.is_on_break,
      //     maximum_break_duration: data.maximum_break_duration,
      //   })
      // );

      const excessBreak =
        data.total_break_duration > data.maximum_break_duration
          ? data.total_break_duration - data.maximum_break_duration
          : 0;

      const adjustedWorkDuration =
        data.total_work_duration - excessBreak;

      dispatch(
        setTimer({
          total_seconds: adjustedWorkDuration,
          currently_checked_in: data.currently_checked_in,
          total_break_duration: data.total_break_duration,
          is_on_break: data.is_on_break,
          maximum_break_duration: data.maximum_break_duration,
        })
      );

      dispatch(setTotalWorkDuration(data));
    })


    .catch((err) => {
      console.log("Something Went Wrong");
    });
};
