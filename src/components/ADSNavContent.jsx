/* #region header */
/**************************************************************************************************
//
//  Description: Navigation Bar component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.07.21 Sean Flook         WI39??? Initial Revision.
//    002   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    003   03.07.23 Sean Flook                 Hide Users & permissions, Export and Import options.
//    004   17.08.23 Sean Flook       IMANN-156 Modified to allow the login dialog to be displayed again after user has clicked cancel.
//    005   06.10.23 Sean Flook                 Use colour variables.
//    006   27.10.23 Sean Flook                 Updated call to SavePropertyAndUpdate.
//    007   10.11.23 Sean Flook                 Modified call to StringAvatar.
//    008   24.11.23 Sean Flook                 Moved Stack to @mui/system and pass the correct parameter to StringAvatar.
//    009   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    010   29.01.24 Sean Flook       IMANN-262 Changed from a Popper control to a Popover control, so we can handle closing when clicking away.
//    011   29.01.24 Sean Flook       IMANN-262 Do not display the users settings card if no user is logged in.
//    012   30.01.24 Sean Flook                 Updated to use new Idox logo.
//    013   05.02.24 Sean Flook                 Tweaked position of logo.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import { useHistory, useLocation } from "react-router";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import SandboxContext from "../context/sandboxContext";
import SearchContext from "../context/searchContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import { StreetComparison, PropertyComparison } from "../utils/ObjectComparison";
import { GetChangedAssociatedRecords, StringAvatar, stringToSentenceCase, ResetContexts } from "../utils/HelperUtils";
import { GetCurrentStreetData, SaveStreet } from "../utils/StreetUtils";
import { GetCurrentPropertyData, SavePropertyAndUpdate } from "../utils/PropertyUtils";
import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import {
  Tooltip,
  Drawer,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Popover,
  Typography,
  Card,
  CardActions,
  CardContent,
  Avatar,
} from "@mui/material";
import { Stack } from "@mui/system";
import ADSActionButton from "./ADSActionButton";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ExploreIcon from "@mui/icons-material/Explore";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ADSWhatsNewAvatar from "./ADSWhatsNewAvatar";
import ADSNotificationsAvatar from "./ADSNotificationsAvatar";
import ADSUserAvatar from "./ADSUserAvatar";

import {
  HomeRoute,
  GazetteerRoute,
  StreetRoute,
  PropertyRoute,
  TaskRoute,
  ReportRoute,
  AdminSettingsRoute,
} from "../PageRouting";

import { adsBlueA, adsMidGreyA, adsLightGreyB, adsLightGreyA50 } from "../utils/ADSColours";
import { navBarWidth, GetAlertStyle, GetAlertIcon, GetAlertSeverity, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

const ADSNavContent = (props) => {
  const theme = useTheme();

  const history = useHistory();
  const location = useLocation();

  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const sandboxContext = useContext(SandboxContext);
  const searchContext = useContext(SearchContext);
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [homeActive, setHomeActive] = useState(location.pathname === HomeRoute);
  const [gazetteerActive, setGazetteerActive] = useState(
    location.pathname === GazetteerRoute ||
      location.pathname.includes(StreetRoute) ||
      location.pathname.includes(PropertyRoute)
  );
  const [taskActive, setTaskActive] = useState(location.pathname === TaskRoute);
  const [reportActive, setReportActive] = useState(location.pathname === ReportRoute);

  const [saveOpen, setSaveOpen] = useState(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const settingsOpen = Boolean(anchorEl);
  const settingsPopoverId = settingsOpen ? "ads-settings-popover" : undefined;

  const saveConfirmDialog = useSaveConfirmation();

  /**
   * Event to handle when the user button is clicked.
   */
  const handleUserClick = () => {
    if (userContext.currentUser && userContext.currentUser.active) {
      setAnchorEl(document.getElementById("imanage-user-settings"));
    } else {
      userContext.onDisplayLogin();
    }
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  /**
   * Method to get the settings cards.
   *
   * @returns {JSX.Element} The settings cards.
   */
  function GetSettingCards() {
    return (
      <Stack direction="row" spacing={0.5}>
        {userContext.currentUser && (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Avatar {...StringAvatar(userContext.currentUser.auditName, false)} />
                {userContext.currentUser && (
                  <Typography sx={{ fontWeight: "bold" }}>{`${stringToSentenceCase(
                    userContext.currentUser.firstName
                  )} ${stringToSentenceCase(userContext.currentUser.lastName)}`}</Typography>
                )}
              </Stack>
            </CardContent>
            <CardActions>
              <Stack
                sx={{ ml: theme.spacing(2), mr: theme.spacing(2), mb: theme.spacing(2) }}
                direction="column"
                spacing={1}
                alignItems="flex-start"
              >
                {process.env.NODE_ENV === "development" && (
                  <ADSActionButton variant="user" buttonLabel="My profile" onClick={handleMyProfileClick} />
                )}
                <ADSActionButton variant="logout" buttonLabel="Log out" onClick={handleLogout} />
              </Stack>
            </CardActions>
          </Card>
        )}
        {userContext.currentUser && userContext.currentUser.isAdministrator && (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Avatar variant="rounded" {...StringAvatar(settingsContext ? settingsContext.authorityName : null)} />
                <Typography sx={{ fontWeight: "bold" }}>
                  {settingsContext ? settingsContext.authorityName : null}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions>
              <Stack
                sx={{ ml: theme.spacing(2), mr: theme.spacing(2), mb: theme.spacing(2) }}
                direction="column"
                spacing={1}
                alignItems="flex-start"
              >
                <ADSActionButton variant="settings" buttonLabel="Settings" onClick={handleSettingsClick} />
                {process.env.NODE_ENV === "development" && (
                  <ADSActionButton
                    variant="users"
                    buttonLabel="Users & permissions"
                    onClick={handleUsersPermissionsClick}
                  />
                )}
                {process.env.NODE_ENV === "development" && (
                  <ADSActionButton variant="import" buttonLabel="Import" onClick={handleImportClick} />
                )}
                {process.env.NODE_ENV === "development" && (
                  <ADSActionButton variant="export" buttonLabel="Export" onClick={handleExportClick} />
                )}
              </Stack>
            </CardActions>
          </Card>
        )}
      </Stack>
    );
  }

  /**
   * Method to set the currently active button.
   */
  const setActiveButton = () => {
    setHomeActive(location.pathname === HomeRoute);
    setGazetteerActive(
      location.pathname === GazetteerRoute ||
        location.pathname.includes(StreetRoute) ||
        location.pathname.includes(PropertyRoute)
    );
    setTaskActive(location.pathname === TaskRoute);
    setReportActive(location.pathname === ReportRoute);
  };

  /**
   * Event to handle th closing of the property save alert.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   * @returns
   */
  const handlePropertySaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle saving the street.
   *
   * @param {object} currentStreet The data for the current street.
   */
  function HandleSaveStreet(currentStreet) {
    SaveStreet(
      currentStreet,
      streetContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "street";
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        saveType.current = "street";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle saving the property.
   *
   * @param {object} currentProperty The data for the current property.
   */
  function HandleSaveProperty(currentProperty) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext.currentUser.token,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "property";
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        saveType.current = "property";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Method to change the current page.
   *
   * @param {string} page The page we want to go to.
   */
  const GoToPage = (page) => {
    switch (page) {
      case "gazetteer":
        handleGazetteerClick();
        break;

      case "task":
        handleTaskManagementClick();
        break;

      case "report":
        handleReportsClick();
        break;

      default:
        // Home
        handleHomeClick();
        break;
    }
  };

  /**
   * Event to handle when the page changes.
   *
   * @param {string} page The page we are changing to.
   */
  const handlePageChangeClick = (page) => {
    if (sandboxContext.currentSandbox.sourceStreet) {
      const streetChanged =
        sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor ||
        sandboxContext.currentSandbox.currentStreetRecords.esu ||
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication ||
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption ||
        sandboxContext.currentSandbox.currentStreetRecords.interest ||
        sandboxContext.currentSandbox.currentStreetRecords.construction ||
        sandboxContext.currentSandbox.currentStreetRecords.specialDesignation ||
        sandboxContext.currentSandbox.currentStreetRecords.hww ||
        sandboxContext.currentSandbox.currentStreetRecords.prow ||
        sandboxContext.currentSandbox.currentStreetRecords.note ||
        (sandboxContext.currentSandbox.currentStreet &&
          !StreetComparison(sandboxContext.currentSandbox.sourceStreet, sandboxContext.currentSandbox.currentStreet));

      if (streetChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("street", sandboxContext, streetContext.esuDataChanged);

        const streetData = sandboxContext.currentSandbox.currentStreet
          ? sandboxContext.currentSandbox.currentStreet
          : sandboxContext.currentSandbox.sourceStreet;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  const currentStreetData = GetCurrentStreetData(
                    streetData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
              GoToPage(page);
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet);
              }
              ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
              GoToPage(page);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
        GoToPage(page);
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged =
        sandboxContext.currentSandbox.currentPropertyRecords.lpi ||
        sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef ||
        sandboxContext.currentSandbox.currentPropertyRecords.provenance ||
        sandboxContext.currentSandbox.currentPropertyRecords.note ||
        (sandboxContext.currentSandbox.currentProperty &&
          !PropertyComparison(
            sandboxContext.currentSandbox.sourceProperty,
            sandboxContext.currentSandbox.currentProperty
          ));

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const propertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  const currentPropertyData = GetCurrentPropertyData(
                    propertyData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveProperty(currentPropertyData);
                  ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
                  GoToPage(page);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
                GoToPage(page);
              }
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty);
              }
              ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
              GoToPage(page);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
        GoToPage(page);
      }
    } else {
      ResetContexts("all", false, mapContext, streetContext, propertyContext, sandboxContext);
      GoToPage(page);
    }
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    streetContext.resetStreet();
    propertyContext.resetProperty();
    history.push(HomeRoute);
    // navigate(HomeRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the gazetteer button is clicked.
   */
  const handleGazetteerClick = () => {
    history.push(GazetteerRoute);
    // navigate(GazetteerRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the task management button is clicked.
   */
  const handleTaskManagementClick = () => {
    history.push(TaskRoute);
    // navigate(TaskRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the reports button is clicked.
   */
  const handleReportsClick = () => {
    history.push(ReportRoute);
    // navigate(ReportRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the notification button is clicked.
   */
  const handleNotificationClick = () => {};

  /**
   * Event to handle when the what's new button is clicked.
   */
  const handleWhatsNewClick = () => {};

  /**
   * Event to handle when the my profile button is clicked.
   */
  const handleMyProfileClick = () => {};

  /**
   * Event to handle logging out of the system.
   */
  const handleLogout = () => {
    setAnchorEl(null);
    handleHomeClick();
    userContext.onUserChange(null);
    window.location.reload();
  };

  /**
   * Method to display the administrator settings page.
   *
   * @param {number} initialNodeId The initial node to be displayed.
   */
  const displayAdminSettingsPage = (initialNodeId) => {
    setAnchorEl(null);
    settingsContext.onNodeChange(initialNodeId);
    history.push(AdminSettingsRoute);
    // navigate(AdminSettingsRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the settings button is clicked.
   */
  const handleSettingsClick = () => {
    displayAdminSettingsPage("2.1");
  };

  /**
   * Event to handle when the users permissions button is clicked.
   */
  const handleUsersPermissionsClick = () => {
    displayAdminSettingsPage("3.0");
  };

  /**
   * Event to handle when the import button is clicked.
   */
  const handleImportClick = () => {};

  /**
   * Event to handle when the export button is clicked.
   */
  const handleExportClick = () => {};

  /**
   * Method to get the navigation icon styling.
   *
   * @param {boolean} open True if the navigation group is open; otherwise false.
   * @returns {object} The styling for the navigation icon.
   */
  function navigationIconStyle(open) {
    if (open) return { color: adsBlueA };
    else return { color: adsMidGreyA };
  }

  useEffect(() => {
    setActiveButton();
  });

  return (
    <Fragment>
      <Drawer
        sx={{
          width: navBarWidth,
          borderRight: "1px",
          borderRightColor: adsLightGreyB,
          boxShadow: `4px 0px 9px ${adsLightGreyA50}`,
        }}
        variant="permanent"
        anchor="left"
      >
        <Grid
          sx={{
            pt: theme.spacing(0.3),
            width: navBarWidth,
            height: "98vh",
          }}
          container
          direction="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Grid container direction="column" alignItems="center" justifyContent="flex-start">
              <Grid item xs sx={{ mb: theme.spacing(2) }}>
                <img sx={{ ml: theme.spacing(2) }} src="/images/Idox_Logo.svg" alt="Idox" width="36" />
              </Grid>
              <Grid item xs>
                <Tooltip title="Home" arrow placement="right" sx={tooltipStyle}>
                  <IconButton aria-label="home" onClick={() => handlePageChangeClick("home")} size="large">
                    <DashboardIcon fontSize="large" sx={navigationIconStyle(homeActive)} />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs>
                <Tooltip title="Gazetteer" arrow placement="right" sx={tooltipStyle}>
                  <IconButton aria-label="gazetteer" onClick={() => handlePageChangeClick("gazetteer")} size="large">
                    <ExploreIcon fontSize="large" sx={navigationIconStyle(gazetteerActive)} />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs>
                {process.env.NODE_ENV === "development" && (
                  <Tooltip title="Task management" arrow placement="right" sx={tooltipStyle}>
                    <span>
                      <IconButton
                        aria-label="task management"
                        disabled
                        onClick={() => handlePageChangeClick("task")}
                        size="large"
                      >
                        <AssignmentTurnedInIcon fontSize="large" sx={navigationIconStyle(taskActive)} />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Grid>
              <Grid item xs>
                {process.env.NODE_ENV === "development" && (
                  <Tooltip title="Reports" arrow placement="right" sx={tooltipStyle}>
                    <span>
                      <IconButton
                        aria-label="reports"
                        disabled
                        onClick={() => handlePageChangeClick("report")}
                        size="large"
                      >
                        <InsertChartIcon fontSize="large" sx={navigationIconStyle(reportActive)} />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="column" alignItems="center" justifyContent="flex-end">
              {process.env.NODE_ENV === "development" && (
                <ADSWhatsNewAvatar count={0} handleClick={handleWhatsNewClick} />
              )}
              {process.env.NODE_ENV === "development" && (
                <ADSNotificationsAvatar count={0} handleClick={handleNotificationClick} />
              )}
              <ADSUserAvatar onUserClick={handleUserClick} />
            </Grid>
          </Grid>
        </Grid>
      </Drawer>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handlePropertySaveClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handlePropertySaveClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            saveResult.current
              ? `The ${saveType.current} has been successfully saved.`
              : failedValidation.current
              ? `Failed to validate the ${saveType.current} record.`
              : `Failed to save the ${saveType.current}.`
          }`}</Alert>
        </Snackbar>
        <Popover
          id={settingsPopoverId}
          open={settingsOpen}
          anchorEl={anchorEl}
          onClose={handleSettingsClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          {GetSettingCards()}
        </Popover>
      </div>
    </Fragment>
  );
};

ADSNavContent.propTypes = {};
ADSNavContent.defaultProps = {};

export default ADSNavContent;
