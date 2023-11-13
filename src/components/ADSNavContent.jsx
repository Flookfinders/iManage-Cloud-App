/* #region header */
/**************************************************************************************************
//
//  Description: Navigation Bar component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
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
  Popper,
  Fade,
  Paper,
  Typography,
  Card,
  CardActions,
  CardContent,
  Stack,
  Avatar,
} from "@mui/material";
import ADSActionButton from "./ADSActionButton";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ExploreIcon from "@mui/icons-material/Explore";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ADSWhatsNewAvatar from "./ADSWhatsNewAvatar";
import ADSNotificationsAvatar from "./ADSNotificationsAvatar";
import ADSUserAvatar from "./ADSUserAvatar";
// import LoginDialog from "../dialogs/LoginDialog";

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
  // const navigate = useNavigate();
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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  // const [loginOpen, setLoginOpen] = useState(false);

  const saveConfirmDialog = useSaveConfirmation();

  /**
   * Event to handle when the user button is clicked.
   */
  const handleUserClick = () => {
    if (userContext.currentUser && userContext.currentUser.active) {
      setAnchorEl(document.getElementById("imanage-user-settings"));
      setSettingsOpen((prev) => !prev);
    } else {
      userContext.onDisplayLogin();
    }
  };

  /**
   * Method to get the settings cards.
   *
   * @returns {JSX.Element} The settings cards.
   */
  function GetSettingCards() {
    return (
      <Stack direction="row" spacing={0.5}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <Avatar {...StringAvatar(userContext.currentUser, false)} />
              {userContext.currentUser && (
                <Typography sx={{ fontWeight: "bold" }}>{`${stringToSentenceCase(
                  userContext.currentUser.firstName
                )} ${stringToSentenceCase(userContext.currentUser.lastName)}`}</Typography>
              )}
            </Stack>
          </CardContent>
          <CardActions>
            <Stack
              sx={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2), marginBottom: theme.spacing(2) }}
              direction="column"
              spacing={1}
              alignItems="flex-start"
            >
              <ADSActionButton variant="user" buttonLabel="My profile" onClick={handleMyProfileClick} />
              <ADSActionButton variant="logout" buttonLabel="Log out" onClick={handleLogout} />
            </Stack>
          </CardActions>
        </Card>
        {userContext.currentUser && userContext.currentUser.isAdministrator && (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Avatar
                  variant="rounded"
                  {...StringAvatar({
                    firstName: settingsContext ? settingsContext.authorityName : null,
                    lastName: "",
                    auditName: settingsContext ? settingsContext.authorityName : null,
                  })}
                />
                <Typography sx={{ fontWeight: "bold" }}>
                  {settingsContext ? settingsContext.authorityName : null}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions>
              <Stack
                sx={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2), marginBottom: theme.spacing(2) }}
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
    setSettingsOpen(false);
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
    setSettingsOpen(false);
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

  // useEffect(() => {
  //   if (!userContext.currentUser && loginOpen) {
  //     setLoginOpen(false);
  //   }
  // }, [userContext.currentUser, loginOpen]);

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
            paddingTop: theme.spacing(2),
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
              <Grid item xs>
                {/* <img sx={{ marginLeft: theme.spacing(2) }} src="/images/IdoxCube.svg" alt="Idox" width="32" /> */}
                <img sx={{ marginLeft: theme.spacing(2) }} src="/images/iManage-Cloud-2.svg" alt="Idox" width="32" />
              </Grid>
              <Grid item xs>
                <IconButton aria-label="home" onClick={() => handlePageChangeClick("home")} size="large">
                  <Tooltip title="Home" arrow placement="right" sx={tooltipStyle}>
                    <DashboardIcon fontSize="large" sx={navigationIconStyle(homeActive)} />
                  </Tooltip>
                </IconButton>
              </Grid>
              <Grid item xs>
                <IconButton aria-label="gazetteer" onClick={() => handlePageChangeClick("gazetteer")} size="large">
                  <Tooltip title="Gazetteer" arrow placement="right" sx={tooltipStyle}>
                    <ExploreIcon fontSize="large" sx={navigationIconStyle(gazetteerActive)} />
                  </Tooltip>
                </IconButton>
              </Grid>
              <Grid item xs>
                {process.env.NODE_ENV === "development" && (
                  <IconButton
                    aria-label="task management"
                    disabled
                    onClick={() => handlePageChangeClick("task")}
                    size="large"
                  >
                    <Tooltip title="Task management" arrow placement="right" sx={tooltipStyle}>
                      <AssignmentTurnedInIcon fontSize="large" sx={navigationIconStyle(taskActive)} />
                    </Tooltip>
                  </IconButton>
                )}
              </Grid>
              <Grid item xs>
                {process.env.NODE_ENV === "development" && (
                  <IconButton
                    aria-label="reports"
                    disabled
                    onClick={() => handlePageChangeClick("report")}
                    size="large"
                  >
                    <Tooltip title="Reports" arrow placement="right" sx={tooltipStyle}>
                      <InsertChartIcon fontSize="large" sx={navigationIconStyle(reportActive)} />
                    </Tooltip>
                  </IconButton>
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
        <Popper open={settingsOpen} anchorEl={anchorEl} placement={"right-end"} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper sx={{ marginLeft: theme.spacing(3) }}>{GetSettingCards()}</Paper>
            </Fade>
          )}
        </Popper>
      </div>
      {/* <LoginDialog isOpen={loginOpen} title="iManage Cloud Login" message="Enter your credentials." /> */}
    </Fragment>
  );
};

ADSNavContent.propTypes = {};
ADSNavContent.defaultProps = {};

export default ADSNavContent;
