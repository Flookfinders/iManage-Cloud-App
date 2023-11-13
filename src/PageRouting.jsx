/* #region imports */

import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";
// import { Routes, Route } from "react-router-dom";
import UserContext from "./context/userContext";

import HomePage from "./pages/HomePage";
import GazetteerPage from "./pages/GazetteerPage";
import StreetPage from "./pages/StreetPage";
import PropertyPage from "./pages/PropertyPage";
import UserAdminPage from "./pages/UserAdminPage";
import SettingsPage from "./pages/SettingsPage";

/* #endregion imports */

export const HomeRoute = "/";
export const GazetteerRoute = "/gazetteer";
export const StreetRoute = "/street";
export const TaskRoute = "/task";
export const ReportRoute = "/report";
export const PropertyRoute = "/property";
export const UserAdminRoute = "/userAdmin";
export const AdminSettingsRoute = "/settings";

const PageRouting = () => {
  const userContext = useContext(UserContext);
  return (
    userContext.currentUser && (
      <Switch>
        <Route path={GazetteerRoute} component={GazetteerPage} />
        <Route exact path={`${StreetRoute}/:usrn`} component={StreetPage} />
        <Route exact path={`${PropertyRoute}/:uprn`} component={PropertyPage} />
        <Route path={UserAdminRoute} component={UserAdminPage} />
        <Route path={AdminSettingsRoute} component={SettingsPage} />
        <Route path="*" exact component={HomePage} />
      </Switch>
      // <Routes>
      //   <Route path={GazetteerRoute} element={<GazetteerPage />} />
      //   <Route exact path={`${StreetRoute}/:usrn`} element={<StreetPage />} />
      //   <Route
      //     exact
      //     path={`${PropertyRoute}/:uprn`}
      //     element={<PropertyPage />}
      //   />
      //   <Route path={UserAdminRoute} element={<UserAdminPage />} />
      //   <Route path={AdminSettingsRoute} element={<SettingsPage />} />
      //   <Route path="*" exact element={<HomePage />} />
      // </Routes>
    )
  );
};

export default PageRouting;
