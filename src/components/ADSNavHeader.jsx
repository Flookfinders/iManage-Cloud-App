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
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.07.21 Sean Flook         WI39??? Initial Revision.
//    002   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    003   27.10.23 Sean Flook                 Updated call to SavePropertyAndUpdate.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   08.03.24 Sean Flook       IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    006   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useRef, Fragment } from "react";
import { useHistory } from "react-router";
import { Grid } from "@mui/material";
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
import { GetCurrentPropertyData, SavePropertyAndUpdate, hasPropertyChanged } from "../utils/PropertyUtils";
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
      const streetChanged = hasStreetChanged(streetContext.currentStreet.newStreet, sandboxContext.currentSandbox);

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
                    settingsContext.isScottish
                  );
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
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
              history.push(HomeRoute);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        history.push(HomeRoute);
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged = hasPropertyChanged(
        propertyContext.currentProperty.newProperty,
        sandboxContext.currentSandbox
      );

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
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              history.push(HomeRoute);
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty);
              }
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              history.push(HomeRoute);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        history.push(HomeRoute);
      }
    } else {
      ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
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
   * @param {object} currentProperty The current property data.
   */
  function HandleSaveProperty(currentProperty) {
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

  return (
    <Fragment>
      <Grid item xs={12}>
        <img
          sx={{ ml: theme.spacing(2) }}
          src="/images/aligned_assets_logo.svg"
          alt="Idox Software Limited"
          width="32"
          height="32"
          onClick={handleClickEvent}
        />
      </Grid>
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
