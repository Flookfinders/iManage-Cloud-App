/* #region header */
/**************************************************************************************************
//
//  Description: Navigation Bar Header component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.07.21 Sean Flook          WI39??? Initial Revision.
//    002   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    003   27.10.23 Sean Flook                  Updated call to SavePropertyAndUpdate.
//    004   05.01.24 Sean Flook                  Use CSS shortcuts.
//    005   08.03.24 Sean Flook        IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    006   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    007   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    008   24.06.24 Sean Flook        IMANN-170 Changes required for cascading parent PAO changes to children.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.5.0 changes
//    009   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useRef, Fragment } from "react";
// import { useNavigate } from "react-router";
import { useHistory } from "react-router";
import { Grid2 } from "@mui/material";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import SandboxContext from "../context/sandboxContext";
import SearchContext from "../context/searchContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import { GetChangedAssociatedRecords, ResetContexts } from "../utils/HelperUtils";
import { GetCurrentStreetData, SaveStreet, hasStreetChanged } from "../utils/StreetUtils";
import {
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  hasParentPaoChanged,
  hasPropertyChanged,
} from "../utils/PropertyUtils";
import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import { Snackbar, Alert } from "@mui/material";
import { HomeRoute } from "../PageRouting";
import { useTheme } from "@mui/styles";
import { GetAlertStyle, GetAlertIcon, GetAlertSeverity } from "../utils/ADSStyles";

/* #endregion imports */

const ADSNavHeader = () => {
  const theme = useTheme();

  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const sandboxContext = useContext(SandboxContext);
  const searchContext = useContext(SearchContext);
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  // const navigate = useNavigate();
  const history = useHistory();

  const [saveOpen, setSaveOpen] = useState(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);

  const saveConfirmDialog = useSaveConfirmation();

  /**
   * Event to handle when the button is clicked.
   */
  const handleClickEvent = () => {
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
          saveConfirmDialog(true)
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
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              // navigate(HomeRoute);
              history.push(HomeRoute);
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet);
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              // navigate(HomeRoute);
              history.push(HomeRoute);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        // navigate(HomeRoute);
        history.push(HomeRoute);
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
                  HandleSaveProperty(currentPropertyData, result === "saveCascade");
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              // navigate(HomeRoute);
              history.push(HomeRoute);
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true, parentPaoChanged)
            .then((result) => {
              if (result === "save" || result === "saveCascade") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty, result === "saveCascade");
              }
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              // navigate(HomeRoute);
              history.push(HomeRoute);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        // navigate(HomeRoute);
        history.push(HomeRoute);
      }
    } else {
      ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
      // navigate(HomeRoute);
      history.push(HomeRoute);
    }
  };

  /**
   * Event to handle when the save property alert is closed.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is being closed.
   * @returns
   */
  const handleSavePropertyClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle when the street is saved.
   *
   * @param {object} currentStreet The current street data.
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
   * Event to handle when the property is saved.
   *
   * @param {Object} currentProperty The current property data.
   * @param {Boolean} cascadeParentPaoChanges If true the child property PAO details need to be changed; otherwise they are not changed.
   */
  function HandleSaveProperty(currentProperty, cascadeParentPaoChanges) {
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
      } else {
        saveResult.current = false;
        saveType.current = "property";
        setSaveOpen(true);
      }
    });
  }

  return (
    <Fragment>
      <Grid2 size={12}>
        <img
          sx={{ ml: theme.spacing(2) }}
          src="/images/aligned_assets_logo.svg"
          alt="Idox Software Limited"
          width="32"
          height="32"
          onClick={handleClickEvent}
        />
      </Grid2>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleSavePropertyClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handleSavePropertyClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            saveResult.current
              ? `The ${saveType.current} has been successfully saved.`
              : `Failed to save the ${saveType.current}.`
          }`}</Alert>
        </Snackbar>
      </div>
    </Fragment>
  );
};

export default ADSNavHeader;
