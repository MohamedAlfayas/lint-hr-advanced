import { Route, Routes } from "react-router";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { privateRoutes, publicRoutes } from "./AllRoutes";
import Layout from "../layout/Layout";
import React, { useEffect, useMemo } from "react";
import Basic404 from "../pages/error/Basic404";


const Index = () => {

    const filteredPrivateRoutes = useMemo(() => {
        const user_perm_list = JSON.parse(localStorage.getItem('user_perm_list'));
        console.log("user_perm_list = ", user_perm_list);
        if (!!user_perm_list) {
            return privateRoutes.filter(route => user_perm_list.includes(route?.perm) || route.perm === "all");
        }
        else {
            return privateRoutes
        }

    }, []);

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