/* #region header */
/**************************************************************************************************
//
//  Description: Street descriptor tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
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
//    004   19.12.23 Sean Flook                 Various bug fixes.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings.
//    006   10.01.24 Sean Flook                 Fix warnings.
//    007   11.01.24 Sean Flook                 Fix warnings.
//    008   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    009   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    010   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    011   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    012   02.04.24 Joshua McCormick IMANN-277 Show displayCharactersLeft on descriptor input
//    013   09.04.24 Sean Flook       IMANN-376 Allow lookups to be added on the fly.
//    014   09.04.24 Sean Flook       IMANN-376 Removed for administrative area.
//    015   25.04.24 Joel Benford     IMANN-275 Allow any language in lookups
//    016   29.04.24 Sean Flook       IMANN-413 Only filter lookups on language for Welsh authorities.
//    017   03.05.24 Joel Benford               Fix index on new descriptors
//    018   29.05.24 Sean Flook       IMANN-489 Prevent the user from changing the language.
//    019   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    020   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    021   18.07.24 Sean Flook       IMANN-678 After adding a new lookup call UpdateSandbox.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.0.0 changes
//    022   03.10.24 Sean Flook      IMANN-1002 Corrected character set to use for descriptor.
//    023   10.10.24 Sean Flook      IMANN-1018 Allow LLPG editors to edit streets.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import SettingsContext from "../context/settingsContext";

import { addLookup, getLookupVariantString } from "../utils/HelperUtils";
import { streetToTitleCase } from "../utils/StreetUtils";
import ObjectComparison, { streetDescriptorKeysToIgnore } from "./../utils/ObjectComparison";

import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSLanguageControl from "../components/ADSLanguageControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import AddLookupDialog from "../dialogs/AddLookupDialog";

import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

StreetDescriptorDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
};

function StreetDescriptorDataTab({ data, errors, loading, focusedField, onHomeClick }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [language, setLanguage] = useState("ENG");
  const [description, setDescription] = useState("");
  const [locality, setLocality] = useState(null);
  const [town, setTown] = useState(null);
  const [island, setIsland] = useState(null);
  const [administrativeArea, setAdministrativeArea] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [languageError, setLanguageError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [localityError, setLocalityError] = useState(null);
  const [townError, setTownError] = useState(null);
  const [islandError, setIslandError] = useState(null);
  const [administrativeAreaError, setAdministrativeAreaError] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const addResult = useRef(null);
  const currentVariant = useRef(null);

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
   * Event to handle when the description changes.
   *
   * @param {string|null} newValue The new description value.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
    UpdateSandbox("description", newValue);
  };

  /**
   * Event to handle the locality changes.
   *
   * @param {number|null} newValue The new locality reference.
   */
  const handleLocalityChangeEvent = (newValue) => {
    setLocality(newValue);
    UpdateSandbox("locality", newValue);
  };

  /**
   * Event to handle when a new locality is added.
   */
  const handleAddLocalityEvent = () => {
    setLookupType("locality");
    setShowAddDialog(true);
  };

  /**
   * Event to handle the town changes.
   *
   * @param {number|null} newValue The new town reference.
   */
  const handleTownChangeEvent = (newValue) => {
    setTown(newValue);
    UpdateSandbox("town", newValue);
  };

  /**
   * Event to handle when a new town is added.
   */
  const handleAddTownEvent = () => {
    setLookupType("town");
    setShowAddDialog(true);
  };

  /**
   * Event to handle the island changes.
   *
   * @param {number|null} newValue The new island reference
   */
  const handleIslandChangeEvent = (newValue) => {
    setIsland(newValue);
    UpdateSandbox("island", newValue);
  };

  /**
   * Event to handle when a new island is added.
   */
  const handleAddIslandEvent = () => {
    setLookupType("island");
    setShowAddDialog(true);
  };

  /**
   * Event to handle the administrative area changes.
   *
   * @param {number|null} newValue The new administrative area reference.
   */
  const handleAdministrativeAreaChangeEvent = (newValue) => {
    setAdministrativeArea(newValue);
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
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
            ? "check"
            : "discard"
          : "discard",
        sourceDescriptor,
        sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.sdData) {
        setLanguage(data.sdData.language ? data.sdData.language : "ENG");
        setDescription(data.sdData.streetDescriptor ? data.sdData.streetDescriptor : "");
        setLocality(data.sdData.locRef);
        setTown(data.sdData.townRef);
        setIsland(data.sdData.islandName);
        setAdministrativeArea(data.sdData.adminAreaRef);
      }
    }
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

  /**
   * Method used to add the new lookup.
   *
   * @param {object} data The data returned from the add lookup dialog.
   */
  const handleDoneAddLookup = async (data) => {
    currentVariant.current = getLookupVariantString(data.variant);

    const addResults = await addLookup(
      data,
      settingsContext.authorityCode,
      userContext,
      settingsContext.isWelsh,
      lookupContext.currentLookups
    );

    if (addResults && addResults.result) {
      if (addResults.updatedLookups && addResults.updatedLookups.length > 0)
        lookupContext.onUpdateLookup(data.variant, addResults.updatedLookups);

      switch (data.variant) {
        case "locality":
          setLocality(addResults.newLookup.localityRef);
          UpdateSandbox("locality", addResults.newLookup.localityRef);
          break;

        case "town":
          setTown(addResults.newLookup.townRef);
          UpdateSandbox("town", addResults.newLookup.townRef);
          break;

        case "island":
          setIsland(addResults.newLookup.islandRef);
          UpdateSandbox("island", addResults.newLookup.islandRef);
          break;

        case "administrativeArea":
          setAdministrativeArea(addResults.newLookup.adminAreaRef);
          UpdateSandbox("administrativeArea", addResults.newLookup.adminAreaRef);
          break;

        default:
          break;
      }

      addResult.current = true;
    } else addResult.current = false;
    setEngError(addResults ? addResults.engError : null);
    setAltLanguageError(addResults ? addResults.altLanguageError : null);

    setShowAddDialog(!addResult.current);
  };

  /**
   * Event to handle when the add lookup dialog is closed.
   */
  const handleCloseAddLookup = () => {
    setShowAddDialog(false);
  };

  useEffect(() => {
    if (!loading && data && data.sdData) {
      setLanguage(data.sdData.language ? data.sdData.language : "ENG");
      setDescription(data.sdData.streetDescriptor ? data.sdData.streetDescriptor : "");
      setLocality(data.sdData.locRef);
      setTown(data.sdData.townRef);
      setIsland(data.sdData.islandRef);
      setAdministrativeArea(data.sdData.adminAreaRef);
    }
  }, [loading, data]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
    ) {
      const sourceDescriptor = sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.pkId
      );

      if (sourceDescriptor) {
        setDataChanged(
          !ObjectComparison(
            sourceDescriptor,
            sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor,
            streetDescriptorKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor, sandboxContext.currentSandbox.sourceStreet]);

  useEffect(() => {
    setUserCanEdit(
      userContext.currentUser && (userContext.currentUser.editStreet || userContext.currentUser.editProperty)
    );
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
      <Box sx={toolbarStyle}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={dataTabToolBar}>
          <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
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
            {`| ${data.index + 1} of ${data.totalRecords}: ${streetToTitleCase(description) || ""}`}
          </Typography>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("StreetDescriptorDataTab")}>
        <ADSLanguageControl
          label="Language"
          loading={loading}
          value={language}
          errorText={languageError}
          helperText="The language in use for the descriptive identifier."
        />
        <ADSTextControl
          id="street_descriptor"
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
              : data.streetType === 3
              ? "GeoPlaceStreet2"
              : "GeoPlaceStreet1"
          }
          helperText="This is the name/descriptor for this street."
          maxLength={100}
          onChange={handleDescriptionChangeEvent}
          displayCharactersLeft
        />
        <ADSSelectControl
          label="Locality"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "LocRef" || focusedField === "Locality" : false}
          loading={loading}
          useRounded
          allowAddLookup
          lookupData={lookupContext.currentLookups.localities
            .filter((x) => x.language === (settingsContext.isWelsh ? language : "ENG") && !x.historic)
            .sort(function (a, b) {
              return a.locality.localeCompare(b.locality, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            })}
          lookupId="localityRef"
          lookupLabel="locality"
          value={locality}
          errorText={localityError}
          onChange={handleLocalityChangeEvent}
          onAddLookup={handleAddLocalityEvent}
          helperText="Locality name."
        />
        <ADSSelectControl
          label="Town"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "TownRef" || focusedField === "Town" : false}
          loading={loading}
          useRounded
          allowAddLookup
          lookupData={lookupContext.currentLookups.towns
            .filter((x) => x.language === (settingsContext.isWelsh ? language : "ENG") && !x.historic)
            .sort(function (a, b) {
              return a.town.localeCompare(b.town, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            })}
          lookupId="townRef"
          lookupLabel="town"
          value={town}
          errorText={townError}
          onChange={handleTownChangeEvent}
          onAddLookup={handleAddTownEvent}
          helperText="Town name."
        />
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="Island"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "IslandRef" || focusedField === "Island" : false}
            loading={loading}
            useRounded
            allowAddLookup
            lookupData={lookupContext.currentLookups.islands
              .filter((x) => !x.historic)
              .sort(function (a, b) {
                return a.island.localeCompare(b.island, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
            lookupId="islandRef"
            lookupLabel="island"
            value={island}
            errorText={islandError}
            onChange={handleIslandChangeEvent}
            onAddLookup={handleAddIslandEvent}
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
          lookupData={lookupContext.currentLookups.adminAuthorities
            .filter((x) => x.language === (settingsContext.isWelsh ? language : "ENG") && !x.historic)
            .sort(function (a, b) {
              return a.administrativeArea.localeCompare(b.administrativeArea, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            })}
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
      <AddLookupDialog
        isOpen={showAddDialog}
        variant={lookupType}
        errorEng={engError}
        errorAltLanguage={altLanguageError}
        onDone={(data) => handleDoneAddLookup(data)}
        onClose={handleCloseAddLookup}
      />
    </Fragment>
  );
}

export default StreetDescriptorDataTab;
