import { Route, Routes } from "react-router";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { privateRoutes, publicRoutes } from "./AllRoutes";
import Layout from "../layout/Layout";
import React from "react";
import Basic404 from "../pages/error/Basic404";


const Index = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route>
                    {publicRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={
                                <PublicRoute>
                                    {route.component}
                                </PublicRoute>
                            }
                            key={idx}
                            exact={true}
                        />
                    ))}
                </Route>

                <Route>
                    {privateRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={
                                <PrivateRoute>
                                    <Layout>{route.component}</Layout>
                                </PrivateRoute>}
                            key={idx}
                            exact={true}
                        />
                    ))}
                </Route>

                <Route path="*" element={<Basic404 />} />
                <Route path="/404" element={<Basic404 />} />

            </Routes>
        </React.Fragment>
    );
};

export default Index;