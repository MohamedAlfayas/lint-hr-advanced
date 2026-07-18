import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setHoliday } from "../../redux/reducers/ChildReducer/HolidayReducer";

const HolidayCalenderAPi = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHoliday(GetLocalStorageData("holiday")));
  }, [dispatch]);

  const { holiday_data } = useSelector((state) => state.HolidayReducer);

  const holidays = holiday_data || [];

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const filteredHolidays = holidays.filter((item) => {
    const holidayDate = new Date(item.date);
    return (
      holidayDate.getMonth() === currentMonth &&
      holidayDate.getFullYear() === currentYear
    );
  });

  return (
    <React.Fragment>
      <div className="col-xxl-4 col-xl-4">
        <div className="card">
          <div className="card-header border-0">
            <h4 className="card-title mb-0">Schedules</h4>
          </div>
          <div className="card-body pt-0">
            <div className="upcoming-scheduled">
              <Flatpickr
                className="form-control"
                options={{
                  dateFormat: "d M, Y",
                  inline: true,

                  onMonthChange: (selectedDates, dateStr, instance) => {
                    setCurrentMonth(instance.currentMonth);
                    setCurrentYear(instance.currentYear);
                  },

                  onYearChange: (selectedDates, dateStr, instance) => {
                    setCurrentMonth(instance.currentMonth);
                    setCurrentYear(instance.currentYear);
                  },

                  onDayCreate: (dObj, dStr, fp, dayElem) => {
                    const year = dayElem.dateObj.getFullYear();
                    const month = String(
                      dayElem.dateObj.getMonth() + 1,
                    ).padStart(2, "0");
                    const day = String(dayElem.dateObj.getDate()).padStart(
                      2,
                      "0",
                    );

                    const currentDate = `${year}-${month}-${day}`;

                    const holiday = holidays.find(
                      (item) => item.date === currentDate,
                    );

                    if (holiday) {
                      dayElem.style.background = "#405189";
                      dayElem.style.color = "#fff";
                      dayElem.style.borderRadius = "8%";
                      dayElem.style.fontWeight = "600";
                      dayElem.title = holiday.name;
                    }
                  },
                }}
              />
            </div>

            <h6 className="text-uppercase fw-semibold mt-4 mb-3 text-muted">
              Holidays
            </h6>

            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="mini-stats-wid d-flex align-items-center mt-3"
                >
                  <div className="flex-shrink-0 avatar-sm">
                    <span className="mini-stat-icon avatar-title rounded-circle text-success bg-success-subtle fs-6">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">{holiday.name}</h6>

                    <p className="text-muted mb-0">{holiday.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No Holidays Found</p>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default HolidayCalenderAPi;
