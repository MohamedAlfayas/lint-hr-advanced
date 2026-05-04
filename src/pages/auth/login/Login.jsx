import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Alert,
  Spinner,
} from "reactstrap";
import * as Yup from "yup";
import logoLight from "../../../assets/images/logo-light.png";
import AuthParticles from "../../../component/authparticles/AuthParticles";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { validate } from "../../../common/js/EmailValidate";

import avatar1 from "../../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../../assets/images/users/avatar-7.jpg";
import { Api } from "../../../common/api/Api";
import { BaseURL, getBaseUrlFromDomain } from "../../../common/api/BaseURL";
import axios from "axios";
import { GetGlobalVersion } from "../../../meta/GetGlobalVersion";
import { toast } from "react-toastify";
import {
  layoutModeTypes,
  leftsidbarSizeTypes,
} from "../../../layout/Constants";
import { changeLeftsidebarSizeTypeAction } from "../../../redux/reducers/ChildReducer/LayoutReducer";
import { setMyProfileDataReducer } from "../../../redux/reducers/ChildReducer/MyProfileReducer";
import AuthLoader from "../loader/AuthLoader";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { generateToken, messaging } from "../../../firebase";
import { deleteToken } from "firebase/messaging";
import { setShowAttendanceTimer } from "../../../redux/reducers/ChildReducer/ClockReducer";
import { changeLayoutMode } from "../../../layout/HtmlLayoutHelpers";

const Login = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState([]);
  const [passwordShow, setPasswordShow] = useState(false);

  const { showLoader } = useSelector((state) => state.LoaderReducer);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: userLogin.email || "",
      password: userLogin.password || "",
    },
    validate,
    validationSchema: Yup.object({
      email: Yup.string().trim().required("Please Enter Your Email"),
      password: Yup.string().trim().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      dispatch(setLoaderVisible(true));

      // localStorage.setItem("token", "abc");
      values["username"] = values.email;
      values["device_type"] = 1;

      const domain = window.location.hostname.split(".")[0];

      let login_url = "";
      let subscribe_topic_url = "";

      if (
        !!process.env.REACT_APP_LC_PLATFORM &&
        process.env.REACT_APP_LC_PLATFORM === "local"
      ) {
        login_url = `${getBaseUrlFromDomain()}employee/auth/login/`;
        subscribe_topic_url = `${getBaseUrlFromDomain()}employee/subscribe-topic/`;
      } else {
        login_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/employee/auth/login/`;
        subscribe_topic_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/employee/subscribe-topic/`;
      }

      axios({
        method: "POST",
        url: login_url,
        data: values,
      })
        .then(async (res) => {
          try {
            await deleteToken(messaging);
          } catch (deleteError) {}

          let res_data = res?.data;
          let profile_data = res_data?.profile_data;

          try {
            const newFCMToken = await generateToken();

            axios({
              method: "POST",
              url: subscribe_topic_url,
              headers: {
                Authorization: `Bearer ${res_data?.token?.access}`,
              },
              data: {
                fcm_token: newFCMToken,
              },
            })
              .then()
              .catch((error) => {
                dispatch(setLoaderVisible(false));
                // toast.error(error?.response?.data?.message);
              });
          } catch (err) {}

          localStorage.setItem(
            "lint_hr_globaldata",
            JSON.stringify(res_data?.meta_data),
          );
          localStorage.setItem(
            "lint_hr_token",
            JSON.stringify(res_data?.token),
          );
          localStorage.setItem(
            "lint_hr_profile_data",
            JSON.stringify(profile_data),
          );
          localStorage.setItem(
            "user_perm_list",
            JSON.stringify([
              "organization",
              "employee",
              "leave_type",
              "custom_field",
            ]),
          );
          dispatch(setMyProfileDataReducer(profile_data));
          dispatch(setShowAttendanceTimer(profile_data?.can_web_checkin));
          // localStorage.setItem(
          //   "left_side_bar_type",
          //   leftsidbarSizeTypes.DEFAULT
          // );
          dispatch(
            changeLeftsidebarSizeTypeAction(leftsidbarSizeTypes.DEFAULT),
          );

          localStorage.setItem("layoutMode", layoutModeTypes?.LIGHTMODE);
          dispatch(changeLayoutMode(layoutModeTypes?.LIGHTMODE));

          setTimeout(() => {
            toast.success(res?.data?.message);
            navigate("/dashboard");
            dispatch(setLoaderVisible(false));
          }, 1000);
        })
        .catch((err) => {
          dispatch(setLoaderVisible(false));
          toast.error(err?.response?.data?.message);
        });
    },
  });

  document.title = `Login | ${MetaTitle || "Lint HR"}`;

  useEffect(() => {
    const domain = window.location.hostname.split(".")[0];
    if (!!domain) {
      let validate_domain_url = "";

      if (
        !!process.env.REACT_APP_LC_PLATFORM &&
        process.env.REACT_APP_LC_PLATFORM === "local"
      ) {
        validate_domain_url = `${getBaseUrlFromDomain()}api/auth/validate-domain/`;
      } else {
        validate_domain_url = `https://${domain}.${process.env.REACT_APP_BASE_URL}/api/auth/validate-domain/`;
      }

      axios({
        method: "POST",
        url: validate_domain_url,
        data: {
          domain: domain,
        },
      })
        .then((res) => {
          // window.location.href = "/dashboard";
        })
        .catch((error) => {
          console.log("Validate Domain Error - ", error);
          if (!!error?.response && error.response.status === 404) {
            window.location.href = "/auth/workspace";
          } else {
            toast?.error(error?.response?.data?.message);
          }
        });
    }
  }, []);

  return (
    <React.Fragment>
      {showLoader === false ? (
        <AuthParticles>
          <div className="auth-page-content mt-lg-5">
            <Container>
              <Row>
                <Col lg={12}>
                  <div className="text-center mt-sm-5 mb-4 text-white-50">
                    <div>
                      <Link to="/" className="d-inline-block auth-logo">
                        <img src={logoLight} alt="" height="20" />
                      </Link>
                    </div>
                    <p className="mt-3 fs-15 fw-medium">Lint HR Dashboard</p>
                  </div>
                </Col>
              </Row>

              <Row className="justify-content-center">
                <Col md={8} lg={6} xl={5}>
                  <Card className="mt-4">
                    <CardBody className="p-4">
                      <div className="text-center mt-2">
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p className="text-muted">
                          Sign in to continue to Lint HR.
                        </p>
                      </div>
                      <div className="p-2 mt-4">
                        <Form
                          onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                          }}
                          action="#"
                        >
                          <div className="mb-3">
                            <Label htmlFor="email" className="form-label">
                              Email
                            </Label>
                            <Input
                              name="email"
                              className="form-control"
                              placeholder="Enter email"
                              type="email"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.email || ""}
                              invalid={
                                validation.touched.email &&
                                validation.errors.email
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.email &&
                            validation.errors.email ? (
                              <FormFeedback type="invalid">
                                {validation.errors.email}
                              </FormFeedback>
                            ) : null}
                          </div>

                          <div className="mb-3">
                            <div className="float-end">
                              <Link
                                to="/auth/forgot-password"
                                className="text-muted"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <Label
                              className="form-label"
                              htmlFor="password-input"
                            >
                              Password
                            </Label>
                            <div className="position-relative auth-pass-inputgroup mb-3">
                              <Input
                                name="password"
                                value={validation.values.password || ""}
                                type={passwordShow ? "text" : "password"}
                                className="form-control pe-5"
                                placeholder="Enter Password"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.password &&
                                  validation.errors.password
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.password &&
                              validation.errors.password ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.password}
                                </FormFeedback>
                              ) : null}
                              <button
                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                type="button"
                                id="password-addon"
                                onClick={() => setPasswordShow(!passwordShow)}
                              >
                                <i className="ri-eye-fill align-middle"></i>
                              </button>
                            </div>
                          </div>

                          {/* <div className="form-check">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              value=""
                              id="auth-remember-check"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="auth-remember-check"
                            >
                              Remember me
                            </Label>
                          </div> */}

                          <div className="mt-4">
                            <Button
                              color="success"
                              className="btn btn-success w-100 text-center"
                              type="submit"
                            >
                              Sign In
                            </Button>
                          </div>

                          {/* <div className="mt-4 text-center">
                            <div className="signin-other-title">
                              <h5 className="fs-13 mb-4 title">Sign In with</h5>
                            </div>
                            <div>
                              <Link
                                to="#"
                                className="btn btn-primary btn-icon me-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                }}
                              >
                                <i className="ri-facebook-fill fs-16" />
                              </Link>
                              <Link
                                to="#"
                                className="btn btn-danger btn-icon me-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                }}
                              >
                                <i className="ri-google-fill fs-16" />
                              </Link>
                              <Button color="dark" className="btn-icon">
                                <i className="ri-github-fill fs-16"></i>
                              </Button>{" "}
                              <Button color="info" className="btn-icon">
                                <i className="ri-twitter-fill fs-16"></i>
                              </Button>
                            </div>
                          </div> */}
                        </Form>
                      </div>
                    </CardBody>
                  </Card>

                  {/* <div className="mt-4 text-center">
                    <p className="mb-0">
                      Don't have an account ?{" "}
                      <Link
                        to="/auth/register"
                        className="fw-semibold text-primary text-decoration-underline"
                      >
                        {" "}
                        Signup{" "}
                      </Link>{" "}
                    </p>
                  </div> */}
                </Col>
              </Row>
            </Container>
          </div>
        </AuthParticles>
      ) : (
        <Container>
          <AuthLoader />
        </Container>
      )}
    </React.Fragment>
  );
};

export default Login;
