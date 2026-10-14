import { Route, Routes } from "react-router";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { privateRoutes, publicRoutes, workSpaceRoutes } from "./AllRoutes";
import Layout from "../layout/Layout";
import React, { useMemo, lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthSkeleton, PageSkeleton } from "../component/common/skeleton/Skeleton";

const Basic404 = lazy(() => import("../pages/error/Basic404"));
const AccessDenied = lazy(() => import("../pages/accessDenied/AccessDenied"));

const PageFallback = () => (
  <div className="page-content">
    <div className="container-fluid">
      <PageSkeleton />
    </div>
  </div>
);

const splitRoutesByPermission = () => {
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};

  if (!profile_data || profile_data.is_admin === true || !profile_data.permission_list) {
    return { allowed: privateRoutes, denied: [] };
  }

  const allowed = [];
  const denied = [];
  privateRoutes.forEach((route) => {
    const hasPerm =
      (Array.isArray(route?.perm) &&
        route.perm.some((d) => profile_data.permission_list.includes(d))) ||
      route?.perm === "all";
    (hasPerm ? allowed : denied).push(route);
  });
  return { allowed, denied };
};

/** Shell shared by every private page, so header / sidebar stay mounted across navigation. */
const PrivateShell = () => (
  <PrivateRoute>
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </Layout>
  </PrivateRoute>
);

const Index = () => {
  const { pathname } = useLocation();

  // Re-read on navigation so permissions picked up after login / profile refresh apply.
  const { allowed: allowedRoutes, denied: deniedRoutes } = useMemo(
    splitRoutesByPermission,
    [pathname],
  );

  return (
    <React.Fragment>
      <Routes>
        {publicRoutes.map((route) => (
          <Route
            path={route.path}
            element={
              <PublicRoute>
                <Suspense fallback={<AuthSkeleton />}>{route.component}</Suspense>
              </PublicRoute>
            }
            key={route.path}
          />
        ))}

        <Route element={<PrivateShell />}>
          {allowedRoutes.map((route) => (
            <Route path={route.path} element={route.component} key={route.path} />
          ))}
        </Route>

        {deniedRoutes.map((route) => (
          <Route
            path={route.path}
            element={
              <Suspense fallback={<AuthSkeleton />}>
                <AccessDenied />
              </Suspense>
            }
            key={route.path}
          />
        ))}

        {workSpaceRoutes.map((route) => (
          <Route
            path={route.path}
            element={<Suspense fallback={<AuthSkeleton />}>{route.component}</Suspense>}
            key={route.path}
          />
        ))}

        <Route
          path="*"
          element={
            <Suspense fallback={<AuthSkeleton />}>
              <Basic404 />
            </Suspense>
          }
        />
        <Route
          path="/404"
          element={
            <Suspense fallback={<AuthSkeleton />}>
              <Basic404 />
            </Suspense>
          }
        />
      </Routes>
    </React.Fragment>
  );
};

export default Index;
