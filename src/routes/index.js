import { Route, Routes } from "react-router";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { defaultRoutes, privateRoutes, publicRoutes, workSpaceRoutes } from "./AllRoutes";
import Layout from "../layout/Layout";
import React, { useEffect, useMemo, lazy, Suspense, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { useLocation } from 'react-router-dom';
// import Basic404 from "../pages/error/Basic404";

import { useDispatch, useSelector } from "react-redux";
import { setLoaderVisible } from "../redux/reducers/ChildReducer/LoaderReducer";

const Basic404 = lazy(() => import("../pages/error/Basic404"));
const AccessDenied = lazy(() => import("../pages/accessDenied/AccessDenied"));

const Index = () => {

  const { pathname } = useLocation();

  const dispatch = useDispatch();

  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [deniedRoutes, setDeniedRoutes] = useState([]);

  useEffect(() => {
    dispatch(setLoaderVisible(true))

    const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

    if (!!profile_data && !!profile_data.is_admin && profile_data?.is_admin === true) {
      setAllowedRoutes(privateRoutes);
      setDeniedRoutes([]);
      dispatch(setLoaderVisible(false));
    }
    else if (!!profile_data && !!profile_data.permission_list) {
      let allowed_r = [];
      let denied_r = [];

      privateRoutes.map((route) => {
        if ((Array.isArray(route?.perm) && ((route?.perm).some(d => profile_data?.permission_list.includes(d)))) || (typeof (route?.perm) === 'string' && route?.perm === 'all')) {
          allowed_r.push(route);
        }
        else {
          denied_r.push(route);
        }
      });

      setAllowedRoutes(allowed_r);
      setDeniedRoutes(denied_r);
      dispatch(setLoaderVisible(false));
    }
    else {
      setAllowedRoutes(privateRoutes);
      setDeniedRoutes([])
      dispatch(setLoaderVisible(false));
    }
  }, [pathname])


  return (
    <React.Fragment>
      <Routes>
        <Route>
          {publicRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <PublicRoute>
                  <Suspense
                    fallback={<LoadingBar progress={100} color="#405189" />}
                  >
                    {route.component}
                  </Suspense>
                  {/* {route.component} */}
                </PublicRoute>
              }
              key={idx}
              exact={true}
            />
          ))}
        </Route>

        <Route>
          {allowedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <PrivateRoute>
                  <Layout>
                    <Suspense
                      fallback={<LoadingBar progress={100} color="#405189" />}
                    >
                      {route.component}
                    </Suspense>
                    {/* {route.component} */}
                  </Layout>
                </PrivateRoute>
              }
              key={idx}
              exact={true}
            />
          ))}
        </Route>

        <Route>
          {deniedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <Suspense
                  fallback={<LoadingBar progress={100} color="#405189" />}
                >
                  <AccessDenied />
                </Suspense>
              }
              key={idx}
              exact={true}
            />
          ))}
        </Route>

        <Route>
          {workSpaceRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <Suspense
                  fallback={<LoadingBar progress={100} color="#405189" />}
                >
                  {route.component}
                </Suspense>
              }
              key={idx}
              exact={true}
            />
          ))}
        </Route>

        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingBar progress={100} color="#405189" />}>
              <Basic404 />
            </Suspense>
            // <Basic404 />
          }
        />
        <Route
          path="/404"
          element={
            <Suspense fallback={<LoadingBar progress={100} color="#405189" />}>
              <Basic404 />
            </Suspense>
            // <Basic404 />
          }
        />
      </Routes>
    </React.Fragment>
  );
};

export default Index;
