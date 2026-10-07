import { resetAttendanceReportChart, setAttendanceReportChartData, setAttendanceReportChartInfo } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { format } from "date-fns";


export const BuildAttendanceReportChart = (individual_attendance_report_data, dispatch) => {
    if (!!individual_attendance_report_data) {
        let reversed_report_data =
            individual_attendance_report_data.slice().reverse() || [];

        if (reversed_report_data.length > 0) {
            let dates = [];

            let in_hours = [];
            let balance_hours = [];
            let holiday_hours = [];
            let leave_hours = [];
            let weekend_hours = [];
            let inactive_hours = [];
            let break_hours = [];
            let permisson_hours = [];
            let halfday_hours = [];

            let totalWsHours = 0;
            let totalCheckInHours = 0;
            let totalOtHours = 0;
            let totalPaidHours = 0;
            let totalLeaveHours = 0;
            let totalBalanceHours = 0;

            reversed_report_data.map((d) => {
                // dates.push(format(new Date(d.date), "dd MMM"));
                dates.push([
                    format(new Date(d.date), "EEE"),     // Sun
                    format(new Date(d.date), "dd MMM"),  // 04 Oct
                ]);

                let final_paid_hr_count = 0;
                let balance_hr_count = 0;
                let holiday_hours_count = 0;
                let weekend_hours_count = 0;
                let leave_hours_count = 0;
                let inactive_hours_count = 0;
                let break_hours_count = 0;
                let permisson_hours_count = 0;
                let halfday_hours_count = 0;

                let daily_work_hour_duration_without_break =
                    !!d.daily_work_hour_duration_without_break
                        ? (d.daily_work_hour_duration_without_break / 3600).toFixed(1)
                        : 0;

                if (d.is_leave_approved === true) {
                    final_paid_hr_count = 0;
                    balance_hr_count = 0;
                    holiday_hours_count = 0;
                    weekend_hours_count = 0;
                    inactive_hours_count = 0;
                    break_hours_count = 0;
                    leave_hours_count = d.maximum_full_day_work_duration/3600;
                     permisson_hours_count = 0;
                     halfday_hours_count = 0;
                } else if (d.is_holiday === true) {
                    final_paid_hr_count = 0;
                    balance_hr_count = 0;
                    holiday_hours_count = d.maximum_full_day_work_duration/3600;
                    weekend_hours_count = 0;
                    leave_hours_count = 0;
                    inactive_hours_count = 0;
                    break_hours_count = 0;
                     permisson_hours_count = 0;
                     halfday_hours_count = 0;
                } else if (d.is_week_off === true) {
                    final_paid_hr_count = 0;
                    balance_hr_count = 0;
                    holiday_hours_count = 0;
                    weekend_hours_count = d.maximum_full_day_work_duration/3600;
                    leave_hours_count = 0;
                    inactive_hours_count = 0;
                    break_hours_count = 0;
                     permisson_hours_count = 0;
                     halfday_hours_count= 0;
                } else if (d.leave_taken_without_approval === true) {
                    final_paid_hr_count = 0;
                    balance_hr_count = 0;
                    holiday_hours_count = 0;
                    weekend_hours_count = 0;
                    leave_hours_count = 0;
                    inactive_hours_count = d.maximum_full_day_work_duration/3600;
                    break_hours_count = 0;
                     permisson_hours_count = 0;
                     halfday_hours_count = 0;
                } else if (d.is_present === true) {
                    final_paid_hr_count =
                        parseInt(d.final_paid_hr_in_seconds/3600);

                    let balance_hours_diff =
                        parseFloat(d.balance_hours) 

                    if (d.is_holiday === true || d.is_week_off === true) {
                        balance_hr_count = 0;
                    } else {
                        balance_hr_count =
                            parseFloat(balance_hours_diff) > 0 ? balance_hours_diff : 0;
                    }

                    holiday_hours_count = 0;
                    weekend_hours_count = 0;
                    leave_hours_count = 0;
                    inactive_hours_count = 0;
                    break_hours_count = parseFloat(d.total_valid_break_duration/3600);
                     permisson_hours_count = parseFloat(d.permission_hours);
                    //  halfday_hours_count = parseFloat(d.half_day_hours/3600);
                     halfday_hours_count = parseFloat(d.half_day_hours*8);
                }  else {
                    final_paid_hr_count = 0;
                    balance_hr_count = 0;
                    holiday_hours_count = 0;
                    weekend_hours_count = 0;
                    leave_hours_count = 0;
                    inactive_hours_count = d.maximum_full_day_work_duration;
                    break_hours_count = 0;
                     permisson_hours_count = parseFloat(d.permission_hours);
                    //  halfday_hours_count = parseFloat(d.half_day_hours/3600);
                     halfday_hours_count = parseFloat(d.half_day_hours*8);
                }

                in_hours.push(final_paid_hr_count);
                balance_hours.push(balance_hr_count);
                holiday_hours.push(holiday_hours_count);
                leave_hours.push(leave_hours_count);
                weekend_hours.push(weekend_hours_count);
                inactive_hours.push(inactive_hours_count);
                break_hours.push(break_hours_count);
                permisson_hours.push( permisson_hours_count);
                halfday_hours.push(halfday_hours_count);

                totalWsHours += parseInt(d.work_schedule_duration_without_break);
                totalCheckInHours += parseInt(d.final_checked_in_hr_in_seconds);
                totalOtHours += parseInt(d.final_ot_hr_in_seconds);
                totalPaidHours += parseInt(d.final_paid_hr_in_seconds);

                if (d.is_leave_approved === true) {
                    totalLeaveHours += parseInt(d.daily_work_hour_duration_without_break);
                }

                let balance_hr_for_this_day =
                    parseInt(d.work_schedule_duration_without_break) -
                        parseInt(d.final_paid_hr_in_seconds) >
                        0
                        ? parseInt(d.work_schedule_duration_without_break) -
                        parseInt(d.final_paid_hr_in_seconds)
                        : 0;

                totalBalanceHours += balance_hr_for_this_day;
            });

            let series = [
                {
                    name: "IN Hour",
                    data: in_hours,
                },
                {
                    name: "Pending",
                    data: balance_hours,
                },
                {
                    name: "Holiday",
                    data: holiday_hours,
                },
                {
                    name: "Leave",
                    data: leave_hours,
                },
                {
                    name: "Weekend",
                    data: weekend_hours,
                },
                {
                    name: "Absent",
                    data: inactive_hours,
                },
                {
                    name: "Break",
                    data: break_hours,
                },
                {
                    name: "Permission",
                    data: permisson_hours,
                },
                {
                    name: "Half Day",
                    data: halfday_hours,
                },
            ];

            const chart_data = {
                categories: dates,
                series: series
            }
            dispatch(setAttendanceReportChartData(chart_data));

            const chart_info = {
                wsHours: totalWsHours,
                checkInHours: totalCheckInHours,
                otHours: totalOtHours,
                paidHours: totalPaidHours,
                leaveHours: totalLeaveHours,
                balanceHours: totalBalanceHours,
            }

            dispatch(setAttendanceReportChartInfo(chart_info));
        }
        else {
            dispatch(resetAttendanceReportChart())
        }

    }
}