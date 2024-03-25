import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import Flatpickr from "react-flatpickr";
import {setMyProfileDataReducer} from "../../redux/reducers/ChildReducer/MyProfileReducer";


import { useDispatch, useSelector } from "react-redux";
const Section = (props) => {

  const { profile_data } = useSelector((state) => state.MyProfileReducer);
  console.log("hfuynjgs",profile_data);
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const date = new Date();
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening');
    } else {
      setGreeting('Good Night');
    }
  }, []);
  
  const capitalizedFirstName = capitalizeFirstLetter(profile_data.fname);
  return (
    <React.Fragment>
      <Row className="mb-3 pb-1">
        <Col xs={12}>
          <div className="d-flex align-items-lg-center flex-lg-row flex-column">
            <div className="flex-grow-1">
              <h4 className="fs-16 mb-1">{greeting}, {capitalizedFirstName}</h4>
              <p className="text-muted mb-0">
                Here's what's happening with your Product today.
              </p>
            </div>
            <div className="mt-3 mt-lg-0">
              <form action="#">
                <Row className="g-3 mb-0 align-items-center">
                  <div className="col-sm-auto">
                    {/* <div className="input-group">
                      <Flatpickr
                        className="form-control border-0 dash-filter-picker shadow"
                        options={{
                          mode: "range",
                          dateFormat: "d M, Y",
                          defaultDate: ["01 Jan 2022", "31 Jan 2022"],
                        }}
                      />
                      <div className="input-group-text bg-primary border-primary text-white">
                        <i className="ri-calendar-2-line"></i>
                      </div>
                    </div> */}
                  </div>
                  {/* <div className="col-auto">
                                        <button type="button" className="btn btn-soft-success"><i className="ri-add-circle-line align-middle me-1"></i> Add Product</button>
                                    </div> */}
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn btn-soft-info btn-icon waves-effect waves-light layout-rightside-btn"
                      onClick={props.rightClickBtn}
                    >
                      <i className="ri-pulse-line"></i>
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Section;
