//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Navigation Bar component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   02.07.21 Sean Flook          WI39??? Initial Revision.
//    002   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    003   03.07.23 Sean Flook                  Hide Users & permissions, Export and Import options.
//    004   17.08.23 Sean Flook        IMANN-156 Modified to allow the login dialog to be displayed again after user has clicked cancel.
//    005   06.10.23 Sean Flook                  Use colour variables.
//    006   27.10.23 Sean Flook                  Updated call to SavePropertyAndUpdate.
//    007   10.11.23 Sean Flook                  Modified call to StringAvatar.
//    008   24.11.23 Sean Flook                  Moved Stack to @mui/system and pass the correct parameter to StringAvatar.
//    009   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    010   29.01.24 Sean Flook        IMANN-262 Changed from a Popper control to a Popover control, so we can handle closing when clicking away.
//    011   29.01.24 Sean Flook        IMANN-262 Do not display the users settings card if no user is logged in.
//    012   30.01.24 Sean Flook                  Updated to use new Idox logo.
//    013   05.02.24 Sean Flook                  Tweaked position of logo.
//    014   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    015   05.03.24 Sean Flook        IMANN-338 Check for changes when clicking any of the buttons which would cause to navigate away from a record.
//    016   07.03.24 Sean Flook        IMANN-338 Always clear any errors if we are leaving the current page.
//    017   08.03.24 Sean Flook        IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    018   08.03.24 Sean Flook        IMANN-338 If the save fails do not leave the current page.
//    019   11.03.24 Sean Flook            GLB12 Correctly set widths.
//    020   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    021   10.06.24 Sean Flook        IMANN-509 Allow a user to change their password.
//    022   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    023   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    024   21.06.24 Sean Flook        IMANN-642 Changes required to redisplay the change password dialog after previously cancelling out.
//    025   24.06.24 Sean Flook        IMANN-170 Changes required for cascading parent PAO changes to children.
//    026   04.07.24 Sean Flook        IMANN-705 Use displayName for the user icon.
//    027   15.07.24 Sean Flook        IMANN-762 If user cannot see properties default to street template when opening the settings.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    028   24.10.24 Sean Flook       IMANN-1040 Call the logoff endpoint when logging a user off the system.
//    029   07.01.25 Joshua McCormick IMANN-1050 Initial Check Notifications with changeset 65608
//endregion Version 1.0.1.0
//region Version 1.0.4.0
//    030   11.02.25 Sean Flook       IMANN-1680 Set the search string when clicking on the gazetteer button and we do not already have one.
//endregion Version 1.0.4.0
//region Version 1.0.5.0
//    031   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
// import { useNavigate, useLocation } from "react-router";
import { useHistory, useLocation } from "react-router";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import SandboxContext from "../context/sandboxContext";
import SearchContext from "../context/searchContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import InformationContext from "../context/informationContext";
import {
  GetChangedAssociatedRecords,
  StringAvatar,
  stringToSentenceCase,
  ResetContexts,
  FormatDateTime,
  blankGazetteerSearchString,
} from "../utils/HelperUtils";
import { GetCurrentStreetData, SaveStreet, hasStreetChanged } from "../utils/StreetUtils";
import {
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  hasParentPaoChanged,
  hasPropertyChanged,
} from "../utils/PropertyUtils";
import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import {
  Tooltip,
  Drawer,
  Grid2,
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
import { Box, Stack } from "@mui/system";
import ADSActionButton from "./ADSActionButton";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ExploreIcon from "@mui/icons-material/Explore";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import CheckIcon from "@mui/icons-material/Check";
import ADSWhatsNewAvatar from "./ADSWhatsNewAvatar";
import ADSNotificationsAvatar from "./ADSNotificationsAvatar";
import ADSUserAvatar from "./ADSUserAvatar";
import CircleIcon from "@mui/icons-material/Circle";

import {
  HomeRoute,
  GazetteerRoute,
  StreetRoute,
  PropertyRoute,
  TaskRoute,
  ReportRoute,
  AdminSettingsRoute,
} from "../PageRouting";

import {
  adsBlueA,
  adsMidGreyA,
  adsLightGreyB,
  adsLightGreyA50,
  adsMagenta,
  adsPaleBlueA,
  adsRed,
} from "../utils/ADSColours";
import {
  navBarWidth,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  tooltipStyle,
  dataFormStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import LoginDialog from "../dialogs/LoginDialog";
import { PostUserLogoffUrl } from "../configuration/ADSConfig";

//endregion imports

const ADSNavContent = (props) => {
  const theme = useTheme();

  // const navigate = useNavigate();
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
  const informationContext = useContext(InformationContext);

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
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const settingsOpen = Boolean(anchorEl);
  const notificationsOpen = Boolean(anchorElNotifications);
  const settingsPopoverId = settingsOpen ? "ads-settings-popover" : undefined;
  const saveConfirmDialog = useSaveConfirmation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

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

  /**
   * Event to handle closing the settings.
   */
  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle closing the notifications.
   */
  const handleNotificationsClose = () => {
    setAnchorElNotifications(null);
  };

  /**
   * Event to handle when the login dialog closes.
   */
  const handleLoginDialogClose = () => {
    setChangePassword(false);
    setLoginOpen(false);
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
                <Avatar {...StringAvatar(userContext.currentUser.displayName, false)} />
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
                <ADSActionButton variant="password" buttonLabel="Change password" onClick={handleChangePassword} />
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
   * Test data for notifications, can be removed once API is in place
   */
  const notifications = [
    // { message: "Cross reference sync ran successfully", date: 1734601302728, variant: "default", unread: true },
    // { message: "Cross reference sync failed", date: 1734001910622, variant: "failure", unread: true },
    // { message: "Cross reference sync ran successfully", date: 1733501000000, variant: "default", unread: false },
  ];
  /**
   * Method to get the notifications cards.
   *
   * @returns {JSX.Element} The notifications cards.
   */
  function GetNotificationsCard() {
    return (
      <Stack direction="row" spacing={0.5} width={440}>
        {userContext.currentUser && (
          <Card variant="outline" sx={{ width: "100%" }}>
            <Box>
              <Stack variant="subtitle2" textAlign="left" fontSize={18}>
                <CardContent sx={{ mt: theme.spacing(0.5), p: theme.spacing(0.5), pl: theme.spacing(2) }}>
                  Notifications
                  <Typography
                    right={theme.spacing(2)}
                    position={"absolute"}
                    top={theme.spacing(1.5)}
                    fontSize={12}
                    sx={{ color: adsMagenta }}
                  >
                    {notifications.length > 0 && (
                      <>
                        <CheckIcon fontSize="10" />
                        Mark all as read
                      </>
                    )}
                  </Typography>
                </CardContent>

                <Stack direction="column" alignItems="left">
                  {notifications.map((data) => {
                    return (
                      <NotificationMessageHolder
                        message={data.message}
                        date={data.date}
                        unread={data.unread}
                        variant={data.variant}
                      />
                    );
                  })}

                  {!notifications.length && <NotificationMessageHolder message={"No notifications"} />}
                </Stack>
              </Stack>
            </Box>
          </Card>
        )}
      </Stack>
    );
  }

  const NotificationMessageHolder = (props) => {
    return (
      <Typography>
        <Grid2
          sx={{
            background: props.unread ? adsPaleBlueA : "inherit",
            cursor: "pointer",
            padding: theme.spacing(2),
            width: "100%",
            borderTop: `1px solid ${adsLightGreyB}`,
            "&:hover": { background: adsLightGreyB },
          }}
        >
          <Typography sx={{ fontSize: 14 }}>
            {props.message}
            <Typography display={"inline"} sx={{ position: "absolute", right: theme.spacing(2) }}>
              <CircleIcon
                sx={{
                  width: "12px",
                  mt: theme.spacing(2),
                  height: "12px",
                  color: props.variant === "failure" ? adsRed : adsMagenta,
                  display: props.unread || props.variant === "failure" ? "block" : "none",
                }}
              />
            </Typography>
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 200, color: adsMidGreyA, fontSize: 12 }}>
            {FormatDateTime(props.date)}
          </Typography>
        </Grid2>
      </Typography>
    );
  };

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
   * @param {boolean} resetRequired True if all the contexts need to be reset; otherwise false.
   * @param {string} page The page we are changing to.
   */
  function HandleSaveStreet(currentStreet, resetRequired, page) {
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
        if (resetRequired) ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        else streetContext.resetStreetErrors();
        GoToPage(page);
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
   * @param {Object} currentProperty The data for the current property.
   * @param {Boolean} resetRequired True if all the contexts need to be reset; otherwise false.
   * @param {String} page The page we are changing to.
   * @param {Boolean} cascadeParentPaoChanges If true the child property PAO details need to be changed; otherwise they are not changed.
   */
  function HandleSaveProperty(currentProperty, resetRequired, page, cascadeParentPaoChanges) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh,
      cascadeParentPaoChanges
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "property";
        setSaveOpen(true);
        if (resetRequired) ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        else propertyContext.resetPropertyErrors();
        GoToPage(page);
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
    informationContext.onClearInformation();

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

      case "whatsNew":
        handleWhatsNewClick();
        break;

      case "notification":
        handleNotificationClick();
        break;

      case "user":
        handleUserClick();
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
    const resetRequired = ["gazetteer", "home"].includes(page);
    if (sandboxContext.currentSandbox.sourceStreet) {
      const streetChanged = hasStreetChanged(
        streetContext.currentStreet.newStreet,
        sandboxContext.currentSandbox,
        userContext.currentUser && userContext.currentUser.hasASD
      );

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
                    settingsContext.isScottish,
                    userContext.currentUser && userContext.currentUser.hasASD
                  );
                  HandleSaveStreet(currentStreetData, resetRequired, page);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              if (resetRequired) ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              else streetContext.resetStreetErrors();
              GoToPage(page);
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet, resetRequired, page);
              } else {
                if (resetRequired) ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
                else streetContext.resetStreetErrors();
                GoToPage(page);
              }
            })
            .catch(() => {});
        }
      } else {
        if (resetRequired) ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        else streetContext.resetStreetErrors();
        GoToPage(page);
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged = hasPropertyChanged(
        propertyContext.currentProperty.newProperty,
        sandboxContext.currentSandbox
      );

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const parentPaoChanged = hasParentPaoChanged(
          propertyContext.childCount,
          sandboxContext.currentSandbox.sourceProperty,
          sandboxContext.currentSandbox.currentProperty
        );

        const propertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current, parentPaoChanged)
            .then((result) => {
              if (result === "save" || result === "saveCascade") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  const currentPropertyData = GetCurrentPropertyData(
                    propertyData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveProperty(currentPropertyData, resetRequired, page, result === "saveCascade");
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                if (resetRequired)
                  ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                else propertyContext.resetPropertyErrors();
                GoToPage(page);
              }
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true, parentPaoChanged)
            .then((result) => {
              if (result === "save" || result === "saveCascade") {
                HandleSaveProperty(
                  sandboxContext.currentSandbox.currentProperty,
                  resetRequired,
                  page,
                  result === "saveCascade"
                );
              } else {
                if (resetRequired)
                  ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                else propertyContext.resetPropertyErrors();
                GoToPage(page);
              }
            })
            .catch(() => {});
        }
      } else {
        if (resetRequired) ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        else propertyContext.resetPropertyErrors();
        GoToPage(page);
      }
    } else {
      if (resetRequired) ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
      else {
        streetContext.resetStreetErrors();
        propertyContext.resetPropertyErrors();
      }
      GoToPage(page);
    }
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    streetContext.resetStreet();
    propertyContext.resetProperty();
    // navigate(HomeRoute);
    history.push(HomeRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the gazetteer button is clicked.
   */
  const handleGazetteerClick = () => {
    // navigate(GazetteerRoute);
    if (
      !searchContext.currentSearchData.searchString ||
      searchContext.currentSearchData.searchString === "!+reload+!"
    ) {
      searchContext.onSearchDataChange(blankGazetteerSearchString, []);
    }
    history.push(GazetteerRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the task management button is clicked.
   */
  const handleTaskManagementClick = () => {
    // navigate(TaskRoute);
    history.push(TaskRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the reports button is clicked.
   */
  const handleReportsClick = () => {
    // navigate(ReportRoute);
    history.push(ReportRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the notification button is clicked.
   */
  const handleNotificationClick = () => {
    // informationContext.onClearInformation();
    if (userContext.currentUser && userContext.currentUser.active) {
      setAnchorElNotifications(document.getElementById("imanage-user-settings"));
    } else {
      userContext.onDisplayLogin();
    }
  };

  /**
   * Event to handle when the what's new button is clicked.
   */
  const handleWhatsNewClick = () => {
    informationContext.onClearInformation();
  };

  /**
   * Event to handle when the my profile button is clicked.
   */
  const handleMyProfileClick = () => {
    informationContext.onClearInformation();
  };

  /**
   * Event to handle logging out of the system.
   */
  const handleLogout = async () => {
    const apiUrl = PostUserLogoffUrl(userContext.currentUser.token);
    if (apiUrl) {
      const logoffResult = await fetch(`${apiUrl.url}`, {
        cache: "no-cache",
        headers: apiUrl.headers,
        crossDomain: true,
        method: apiUrl.type,
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.text())
        .then((result) => {
          return "Logged off";
        })
        .catch((error) => {
          if (userContext.currentUser.showMessages) {
            console.error("[ERROR] User logoff", error);
          }
          return null;
        });

      if (!!logoffResult) {
        setAnchorEl(null);
        handleHomeClick();
        informationContext.onClearInformation();
        userContext.onUserChange(null);
        window.location.reload();
      }
    }
  };

  /**
   * Event to handle logging out of the system.
   */
  const handleChangePassword = () => {
    setAnchorEl(null);
    informationContext.onClearInformation();
    setChangePassword(true);
    setLoginOpen(true);
  };

  /**
   * Method to display the administrator settings page.
   *
   * @param {number} initialNodeId The initial node to be displayed.
   */
  const displayAdminSettingsPage = (initialNodeId) => {
    setAnchorEl(null);
    settingsContext.onNodeChange(initialNodeId);
    // navigate(AdminSettingsRoute);
    history.push(AdminSettingsRoute);
    setActiveButton();
  };

  /**
   * Event to handle when the settings button is clicked.
   */
  const handleSettingsClick = () => {
    displayAdminSettingsPage(userContext.currentUser && userContext.currentUser.hasProperty ? "2.1" : "2.2");
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
          width: `${navBarWidth}px`,
          borderRight: "1px",
          borderRightColor: adsLightGreyB,
          boxShadow: `4px 0px 9px ${adsLightGreyA50}`,
        }}
        variant="permanent"
        anchor="left"
      >
        <Grid2
          sx={dataFormStyle("ADSNavContent")}
          container
          direction="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid2>
            <Grid2 container direction="column" alignItems="center" justifyContent="flex-start">
              <Grid2 sx={{ mb: theme.spacing(2) }} size="grow">
                <img sx={{ ml: theme.spacing(2) }} src="/images/Idox_Logo.svg" alt="Idox" width="36" />
              </Grid2>
              <Grid2 size="grow">
                <Tooltip title="Home" arrow placement="right" sx={tooltipStyle}>
                  <IconButton aria-label="home" onClick={() => handlePageChangeClick("home")} size="large">
                    <DashboardIcon fontSize="large" sx={navigationIconStyle(homeActive)} />
                  </IconButton>
                </Tooltip>
              </Grid2>
              <Grid2 size="grow">
                <Tooltip title="Gazetteer" arrow placement="right" sx={tooltipStyle}>
                  <IconButton aria-label="gazetteer" onClick={() => handlePageChangeClick("gazetteer")} size="large">
                    <ExploreIcon fontSize="large" sx={navigationIconStyle(gazetteerActive)} />
                  </IconButton>
                </Tooltip>
              </Grid2>
              <Grid2 size="grow">
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
              </Grid2>
              <Grid2 size="grow">
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
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2>
            <Grid2 container direction="column" alignItems="center" justifyContent="flex-end">
              {process.env.NODE_ENV === "development" && (
                <ADSWhatsNewAvatar count={0} handleClick={() => handlePageChangeClick("whatsNew")} />
              )}
              {process.env.NODE_ENV === "development" && (
                <ADSNotificationsAvatar
                  count={notifications.length}
                  handleClick={() => handlePageChangeClick("notification")}
                />
              )}
              <ADSUserAvatar onUserClick={() => handlePageChangeClick("user")} />
            </Grid2>
          </Grid2>
        </Grid2>
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

        <Popover
          id={settingsPopoverId}
          open={notificationsOpen}
          anchorEl={anchorElNotifications}
          onClose={handleNotificationsClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          {GetNotificationsCard()}
        </Popover>

        <LoginDialog
          isOpen={loginOpen}
          title="Change Password"
          message=""
          changePassword={changePassword}
          onClose={handleLoginDialogClose}
        />
      </div>
    </Fragment>
  );
};

ADSNavContent.propTypes = {};
ADSNavContent.defaultProps = {};

export default ADSNavContent;
