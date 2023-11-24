/* #region header */
/**************************************************************************************************
//
//  Description: Street descriptor tab
//
//  Copyright:    � 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial version.
//    002   27.10.23 Sean Flook                 Use new dataFormStyle.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import SettingsContext from "../context/settingsContext";
import { streetToTitleCase } from "../utils/StreetUtils";
import ObjectComparison from "./../utils/ObjectComparison";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSLanguageControl from "../components/ADSLanguageControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import { useTheme } from "@mui/styles";
import { streetToolbarStyle, dataFormStyle } from "../utils/ADSStyles";

StreetDescriptorDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
};

function StreetDescriptorDataTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [language, setLanguage] = useState(data && data.sdData ? data.sdData.language : null);
  const [description, setDescription] = useState(data && data.sdData ? data.sdData.streetDescriptor : null);
  const [locality, setLocality] = useState(data && data.sdData ? data.sdData.locRef : null);
  const [town, setTown] = useState(data && data.sdData ? data.sdData.townRef : null);
  const [island, setIsland] = useState(data && data.sdData ? data.sdData.islandName : null);
  const [administrativeArea, setAdministrativeArea] = useState(data && data.sdData ? data.sdData.adminAreaRef : null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [languageError, setLanguageError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [localityError, setLocalityError] = useState(null);
  const [townError, setTownError] = useState(null);
  const [islandError, setIslandError] = useState(null);
  const [administrativeAreaError, setAdministrativeAreaError] = useState(null);

  /**
   * Update the sandbox street descriptor record.
   *
   * @param {string} field The name of the field to update with the new value.
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   */
  const UpdateSandbox = (field, newValue) => {
    const newDescriptorData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("streetDescriptor", newDescriptorData);
  };

  /**
   * Event to handle when the language flag changes.
   *
   * @param {string|null} newValue The new language flag.
   */
  const handleLanguageChangeEvent = (newValue) => {
    setLanguage(newValue);
    if (!dataChanged) {
      setDataChanged(language !== newValue);
      if (onDataChanged && language !== newValue) onDataChanged();
    }
    UpdateSandbox("language", newValue);
  };

  /**
   * Event to handle when the description changes.
   *
   * @param {string|null} newValue The new description value.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
    if (!dataChanged) {
      setDataChanged(description !== newValue);
      if (onDataChanged && description !== newValue) onDataChanged();
    }
    UpdateSandbox("description", newValue);
  };

  /**
   * Event to handle the locality changes.
   *
   * @param {number|null} newValue The new locality reference.
   */
  const handleLocalityChangeEvent = (newValue) => {
    setLocality(newValue);
    if (!dataChanged) {
      setDataChanged(locality !== newValue);
      if (onDataChanged && locality !== newValue) onDataChanged();
    }
    UpdateSandbox("locality", newValue);
  };

  /**
   * Event to handle the town changes.
   *
   * @param {number|null} newValue The new town reference.
   */
  const handleTownChangeEvent = (newValue) => {
    setTown(newValue);
    if (!dataChanged) {
      setDataChanged(town !== newValue);
      if (onDataChanged && town !== newValue) onDataChanged();
    }
    UpdateSandbox("town", newValue);
  };

  /**
   * Event to handle the island changes.
   *
   * @param {number|null} newValue The new island reference
   */
  const handleIslandChangeEvent = (newValue) => {
    setIsland(newValue);
    if (!dataChanged) {
      setDataChanged(island !== newValue);
      if (onDataChanged && island !== newValue) onDataChanged();
    }
    UpdateSandbox("island", newValue);
  };

  /**
   * Event to handle the administrative area changes.
   *
   * @param {number|null} newValue The new administrative area reference.
   */
  const handleAdministrativeAreaChangeEvent = (newValue) => {
    setAdministrativeArea(newValue);
    if (!dataChanged) {
      setDataChanged(administrativeArea !== newValue);
      if (onDataChanged && island !== newValue) onDataChanged();
    }
    UpdateSandbox("administrativeArea", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceDescriptor =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged
            ? sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
              ? "check"
              : "discard"
            : "discard",
          sourceDescriptor,
          sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      setDataChanged(onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor));
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.sdData) {
        setLanguage(data.sdData.language);
        setDescription(data.sdData.streetDescriptor);
        setLocality(data.sdData.locRef);
        setTown(data.sdData.townRef);
        setIsland(data.sdData.islandName);
        setAdministrativeArea(data.sdData.adminAreaRef);
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.sdData, null);
  };

  /**
   * Function to return the current descriptor record.
   *
   * @param {string} field The name of the field to update with the new value.
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   * @returns {object} The current descriptor record.
   */
  function GetCurrentData(field, newValue) {
    if (settingsContext.isScottish)
      return {
        pkId: data.sdData.pkId,
        changeType: field && field === "changeType" ? newValue : data.sdData.pkId <= -10 ? "I" : "U",
        usrn: data.sdData.usrn,
        streetDescriptor: field && field === "description" ? newValue : description,
        locRef: field && field === "locality" ? newValue : locality,
        locality: data.sdData.locality,
        townRef: field && field === "town" ? newValue : town,
        town: data.sdData.town,
        islandRef: field && field === "island" ? newValue : island,
        island: data.sdData.island,
        adminAreaRef: field && field === "administrativeArea" ? newValue : administrativeArea,
        administrativeArea: data.sdData.administrativeArea,
        language: field && field === "language" ? newValue : language,
        neverExport: data.sdData.neverExport,
      };
    else
      return {
        pkId: data.sdData.pkId,
        changeType: field && field === "changeType" ? newValue : data.sdData.pkId <= -10 ? "I" : "U",
        usrn: data.sdData.usrn,
        streetDescriptor: field && field === "description" ? newValue : description,
        locRef: field && field === "locality" ? newValue : locality,
        locality: data.sdData.locality,
        townRef: field && field === "town" ? newValue : town,
        town: data.sdData.town,
        adminAreaRef: field && field === "administrativeArea" ? newValue : administrativeArea,
        administrativeArea: data.sdData.administrativeArea,
        language: field && field === "language" ? newValue : language,
        neverExport: data.sdData.neverExport,
      };
  }

  useEffect(() => {
    if (!loading && data && data.sdData) {
      setLanguage(data.sdData.language);
      setDescription(data.sdData.streetDescriptor);
      setLocality(data.sdData.locRef);
      setTown(data.sdData.townRef);
      setIsland(data.sdData.islandRef);
      setAdministrativeArea(data.sdData.adminAreaRef);
    }
  }, [loading, data]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && data && data.sdData) {
      const sourceDescriptor = sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find(
        (x) => x.pkId === data.pkId
      );

      if (sourceDescriptor) {
        setDataChanged(
          !ObjectComparison(sourceDescriptor, data.sdData, ["changeType", "locality", "town", "administrativeArea"])
        );
      } else if (data.pkId < 0) setDataChanged(true);
    }
  }, [data, sandboxContext.currentSandbox.sourceStreet]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setLanguageError(null);
    setDescriptionError(null);
    setLocalityError(null);
    setTownError(null);
    setIslandError(null);
    setAdministrativeAreaError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "language":
            setLanguageError(error.errors);
            break;

          case "streetdescriptor":
            setDescriptionError(error.errors);
            break;

          case "locref":
          case "locality":
            setLocalityError(error.errors);
            break;

          case "townref":
          case "town":
            setTownError(error.errors);
            break;

          case "islandref":
          case "island":
            setIslandError(error.errors);
            break;

          case "adminarearef":
          case "administrativearea":
            setAdministrativeAreaError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={streetToolbarStyle}>
        <Grid container justifyContent="flex-start" alignItems="center">
          <Grid item>
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
          </Grid>
          <Grid item>
            <Typography
              sx={{
                flexGrow: 1,
                display: "none",
                [theme.breakpoints.up("sm")]: {
                  display: "block",
                },
              }}
              variant="subtitle1"
              noWrap
              align="left"
            >
              {`| ${data.index + 1} of ${data.totalRecords}: ${streetToTitleCase(data.sdData.streetDescriptor)}`}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSLanguageControl
          label="Language"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Language" : false}
          loading={loading}
          value={language}
          errorText={languageError}
          helperText="The language in use for the descriptive identifier."
          onChange={handleLanguageChangeEvent}
        />
        <ADSTextControl
          label="Name or descriptor"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StreetDescriptor" : !description || description.length === 0}
          loading={loading}
          value={description}
          errorText={descriptionError}
          characterSet={
            settingsContext.isScottish
              ? "OneScotlandStreet"
              : data.streetType === 1
              ? "GeoPlaceStreet2"
              : "GeoPlaceStreet1"
          }
          helperText="This is the name/descriptor for this street."
          onChange={handleDescriptionChangeEvent}
        />
        <ADSSelectControl
          label="Locality"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "LocRef" || focusedField === "Locality" : false}
          loading={loading}
          useRounded
          lookupData={lookupContext.currentLookups.localities.filter((x) => x.language === language && !x.historic)}
          lookupId="localityRef"
          lookupLabel="locality"
          value={locality}
          errorText={localityError}
          onChange={handleLocalityChangeEvent}
          helperText="Locality name."
        />
        <ADSSelectControl
          label="Town"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "TownRef" || focusedField === "Town" : false}
          loading={loading}
          useRounded
          lookupData={lookupContext.currentLookups.towns.filter((x) => x.language === language && !x.historic)}
          lookupId="townRef"
          lookupLabel="town"
          value={town}
          errorText={townError}
          onChange={handleTownChangeEvent}
          helperText="Town name."
        />
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="Island"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "IslandRef" || focusedField === "Island" : false}
            loading={loading}
            useRounded
            lookupData={lookupContext.currentLookups.islands.filter((x) => x.language === language && !x.historic)}
            lookupId="islandRef"
            lookupLabel="island"
            value={island}
            errorText={islandError}
            onChange={handleIslandChangeEvent}
            helperText="Island name."
          />
        )}
        <ADSSelectControl
          label="Admin area"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "AdminAreaRef" || focusedField === "AdministrativeArea" : false}
          loading={loading}
          useRounded
          lookupData={lookupContext.currentLookups.adminAuthorities.filter(
            (x) => x.language === language && !x.historic
          )}
          lookupId="administrativeAreaRef"
          lookupLabel="administrativeArea"
          value={administrativeArea}
          errorText={administrativeAreaError}
          onChange={handleAdministrativeAreaChangeEvent}
          helperText="Administrative area name."
        />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
    </Fragment>
  );
}

export default StreetDescriptorDataTab;
