/* #region header */
/**************************************************************************************************
//
//  Description: OneScotland special designation data tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   03.11.23 Sean Flook                 If the type has not been selected default to Special designation.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings.
//    007   10.01.24 Sean Flook                 Fix warnings.
//    008   11.01.24 Sean Flook                 Fix warnings.
//    009   16.01.24 Sean Flook                 Changes required to fix warnings.
//    010   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    011   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    012   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    013   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    014   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
//    015   20.02.24 Joel Benford     IMANN-299 Toolbar changes
//    016   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import MapContext from "./../context/mapContext";
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { GetLookupLabel, ConvertDate, isAfter1stApril2015, filteredLookup } from "../utils/HelperUtils";
import ObjectComparison, { specialDesignationKeysToIgnore } from "../utils/ObjectComparison";

import SwaOrgRef from "../data/SwaOrgRef";
import SpecialDesignationCode from "./../data/SpecialDesignationCode";

import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { SpecialDesignationIcon } from "../utils/ADSIcons";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSTextToggleControl from "../components/ADSTextToggleControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import { useTheme } from "@mui/styles";
import { adsBlack, adsYellow } from "../utils/ADSColours";
import { toolbarStyle, dataFormStyle } from "../utils/ADSStyles";

OSSpecialDesignationDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function OSSpecialDesignationDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [specialDesignationCodeLookup, setSpecialDesignationCodeLookup] = useState(
    filteredLookup(SpecialDesignationCode, true)
  );
  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, true));

  const [specialDesignation, setSpecialDesignation] = useState(null);
  const [custodian, setCustodian] = useState(null);
  const [authority, setAuthority] = useState(null);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [state, setState] = useState(null);
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specificLocation, setSpecificLocation] = useState("");

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

  const [designationCategoryError, setDesignationCategoryError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [custodianError, setCustodianError] = useState(null);
  const [authorityError, setAuthorityError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specificLocationError, setSpecificLocationError] = useState(null);

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "asd-information-popper" : undefined;

  /**
   * Method to return the current special designation record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current special designation record.
   */
  function GetCurrentData(field, newValue) {
    return {
      lastUpdated: data.osSpecialDesignationData.lastUpdated,
      lastUser: data.osSpecialDesignationData.lastUser,
      pkId: data.osSpecialDesignationData.pkId,
      changeType:
        field && field === "changeType"
          ? newValue
          : !data.osSpecialDesignationData.pkId || data.osSpecialDesignationData.pkId < 0
          ? "I"
          : "U",
      usrn: data.osSpecialDesignationData.usrn,
      seqNum: data.osSpecialDesignationData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation: field && field === "specificLocation" ? newValue : specificLocation,
      neverExport: data.osSpecialDesignationData.neverExport,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      lastUpdateDate: data.osSpecialDesignationData.lastUpdateDate,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      isLocal: data.osSpecialDesignationData.isLocal,
      custodianCode: field && field === "custodian" ? newValue : custodian,
      authorityCode: field && field === "authority" ? newValue : authority,
      specialDesig: field && field === "designationType" ? newValue : specialDesignation,
      entryDate: data.osSpecialDesignationData.entryDate,
      wktGeometry: data.osSpecialDesignationData.wktGeometry,
      description: field && field === "description" ? newValue : description,
      state: field && field === "state" ? newValue : state,
    };
  }

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newOsSpecialDesignationData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("osSpecialDesignation", newOsSpecialDesignationData);
  };

  /**
   * Event to handle when the designation type is changed.
   *
   * @param {number|null} newValue The new designation type.
   */
  const handleDesignationTypeChangeEvent = (newValue) => {
    setSpecialDesignation(newValue);
    UpdateSandbox("designationType", newValue);
  };

  /**
   * Event to handle when the custodian is changed.
   *
   * @param {number|null} newValue The new custodian.
   */
  const handleCustodianChangeEvent = (newValue) => {
    setCustodian(newValue);
    UpdateSandbox("custodian", newValue);
  };

  /**
   * Event to handle when the authority is changed.
   *
   * @param {number|null} newValue The new authority.
   */
  const handleAuthorityChangeEvent = (newValue) => {
    setAuthority(newValue);
    UpdateSandbox("authority", newValue);
  };

  /**
   * Event to handle when the description is changed.
   *
   * @param {string|null} newValue The new description.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
    UpdateSandbox("description", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number|null} newValue The new state.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    UpdateSandbox("state", newValue);
  };

  /**
   * Event to handle when the whole road flag is changed.
   *
   * @param {boolean} newValue The new whole road flag.
   */
  const handleWholeRoadChangeEvent = (newValue) => {
    if (newValue && !wholeRoad) {
      setShowWholeRoadWarning(true);
    } else {
      setWholeRoad(newValue);
      UpdateSandbox("wholeRoad", newValue);
      if (newValue) {
        mapContext.onEditMapObject(null, null);
        informationContext.onClearInformation();
      } else {
        mapContext.onEditMapObject(53, data && data.osSpecialDesignationData && data.osSpecialDesignationData.pkId);
        informationContext.onDisplayInformation("partRoadASD", "OSSpecialDesignationDataTab");
      }
    }
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecificLocationChangeEvent = (newValue) => {
    setSpecificLocation(newValue);
    UpdateSandbox("specificLocation", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceSpecialDesignation =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.specialDesignations.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
            ? "check"
            : "discard"
          : "discard",
        sourceSpecialDesignation,
        sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.osSpecialDesignationData) {
        setSpecialDesignation(data.osSpecialDesignationData.specialDesig);
        setDescription(data.osSpecialDesignationData.description ? data.osSpecialDesignationData.description : "");
        setCustodian(data.osSpecialDesignationData.custodianCode);
        setAuthority(data.osSpecialDesignationData.authorityCode);
        setStartDate(data.osSpecialDesignationData.startDate);
        setEndDate(data.osSpecialDesignationData.endDate);
        setState(data.osSpecialDesignationData.state);
        setWholeRoad(data.osSpecialDesignationData.wholeRoad);
        setSpecificLocation(
          data.osSpecialDesignationData.specificLocation ? data.osSpecialDesignationData.specificLocation : ""
        );
      }
    }
    if (onHomeClick) onHomeClick("discard", data.osSpecialDesignationData, null);
  };

  /**
   * Event to handle when the add special designation button is clicked.
   */
  const handleAddSpecialDesignation = () => {
    if (onAdd) onAdd();
  };

  /**
   * Event to handle when the delete special designation button is clicked.
   */
  const handleDeleteSpecialDesignation = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && pkId && pkId > 0) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
  };

  /**
   * Event to handle when the message dialog is closed.
   *
   * @param {string} action The action taken from the message dialog.
   */
  const handleCloseMessageDialog = (action) => {
    if (action === "continue") {
      setWholeRoad(true);
      UpdateSandbox("wholeRoad", true);

      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();
    }

    setShowWholeRoadWarning(false);
  };

  /**
   * Method to get the text for the supplied designation type code.
   *
   * @param {number} designationType The designation type code that we need the text for.
   * @returns {string} The text for the supplied designation type code.
   */
  function getType(designationType) {
    const desigRecord = SpecialDesignationCode.filter((x) => x.id === designationType);

    if (desigRecord && desigRecord.length > 0) return desigRecord[0][GetLookupLabel(true)];
    else return "Special designation";
  }

  useEffect(() => {
    if (!loading && data && data.osSpecialDesignationData) {
      setSpecialDesignation(data.osSpecialDesignationData.specialDesig);
      setDescription(data.osSpecialDesignationData.description ? data.osSpecialDesignationData.description : "");
      setCustodian(data.osSpecialDesignationData.custodianCode);
      setAuthority(data.osSpecialDesignationData.authorityCode);
      setStartDate(data.osSpecialDesignationData.startDate);
      setEndDate(data.osSpecialDesignationData.endDate);
      setState(data.osSpecialDesignationData.state);
      setWholeRoad(data.osSpecialDesignationData.wholeRoad);
      setSpecificLocation(
        data.osSpecialDesignationData.specificLocation ? data.osSpecialDesignationData.specificLocation : ""
      );

      setSpecialDesignationCodeLookup(filteredLookup(SpecialDesignationCode, true));
      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, true));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "OSSpecialDesignationDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
    ) {
      const sourceSpecialDesignation = sandboxContext.currentSandbox.sourceStreet.specialDesignations.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation.pkId
      );

      if (sourceSpecialDesignation) {
        setDataChanged(
          !ObjectComparison(
            sourceSpecialDesignation,
            sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation,
            specialDesignationKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation.pkId < 0) setDataChanged(true);
    }
  }, [
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    if (
      informationContext.informationSource &&
      informationContext.informationSource === "OSSpecialDesignationDataTab"
    ) {
      setInformationAnchorEl(document.getElementById("os-special-designation-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setDesignationCategoryError(null);
    setDescriptionError(null);
    setCustodianError(null);
    setAuthorityError(null);
    setStartDateError(null);
    setEndDateError(null);
    setWholeRoadError(null);
    setSpecificLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "specialdesignation":
            setDesignationCategoryError(error.errors);
            break;
          case "description":
            setDescriptionError(error.errors);
            break;

          case "custodian":
            setCustodianError(error.errors);
            break;

          case "authority":
            setAuthorityError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "enddate":
            setEndDateError(error.errors);
            break;

          case "state":
            setStateError(error.errors);
            break;

          case "wholeroad":
            setWholeRoadError(error.errors);
            break;

          case "specificlocation":
            setSpecificLocationError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id={"os-special-designation-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 53 && streetContext.currentRecord.newRecord ? (
              <ADSActionButton
                variant="close"
                tooltipTitle="Close"
                tooltipPlacement="bottom"
                onClick={handleCancelClicked}
              />
            ) : (
              <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            )}
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
              |
            </Typography>
            <Avatar
              variant="rounded"
              sx={{
                height: theme.spacing(2),
                width: theme.spacing(2),
                color: adsBlack,
                backgroundColor: adsYellow,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: `${adsBlack}  !important`,
              }}
            >
              <SpecialDesignationIcon
                sx={{
                  height: theme.spacing(2),
                  width: theme.spacing(2),
                }}
              />
            </Avatar>
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
              {streetContext.currentRecord.type === 53 && streetContext.currentRecord.newRecord
                ? `Add new ${getType(specialDesignation)}`
                : `${getType(specialDesignation)} (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 61 && streetContext.currentRecord.newRecord) && (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <ADSActionButton
                variant="delete"
                disabled={!userCanEdit}
                tooltipTitle="Delete special designation record"
                tooltipPlacement="right"
                onClick={handleDeleteSpecialDesignation}
              />
              <ADSActionButton
                variant="add"
                disabled={!userCanEdit}
                tooltipTitle="Add new special designation record"
                tooltipPlacement="right"
                onClick={handleAddSpecialDesignation}
              />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StreetSpecialDesigCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={specialDesignationCodeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={specialDesignation}
          errorText={designationCategoryError}
          onChange={handleDesignationTypeChangeEvent}
          helperText="A code to indicate the type special designation applying to the street."
        />
        <ADSSelectControl
          label="Custodian"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Custodian" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={custodian}
          errorText={custodianError}
          onChange={handleCustodianChangeEvent}
          helperText="Code for the organisation providing the data."
        />
        <ADSSelectControl
          label="Authority"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Authority" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={authority}
          errorText={authorityError}
          onChange={handleAuthorityChangeEvent}
          helperText="A code indicating the authority responsible for the special designation."
        />
        <ADSTextControl
          label="Description"
          isEditable={userCanEdit}
          isRequired={isAfter1stApril2015(startDate)}
          isFocused={focusedField ? focusedField === "Description" : false}
          loading={loading}
          value={description}
          maxLength={250}
          minLines={3}
          maxLines={5}
          characterSet="GeoPlaceStreet1"
          id="os_special_designation_description"
          errorText={descriptionError}
          helperText="Description providing additional information for certain Special Designations."
          onChange={handleDescriptionChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "RecordStartDate" : false}
          loading={loading}
          value={startDate}
          helperText="The date on which the special designation started to apply in the real world."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {state === 2 && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "endDate" : false}
            loading={loading}
            value={endDate}
            helperText="Date on which this reinstatement category ceased to exist in the real world."
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
        <ADSTextToggleControl
          label="State"
          button1Text="Current"
          button2Text="Historic"
          button1Value={1}
          button2Value={2}
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "State" : false}
          loading={loading}
          errorText={stateError}
          helperText="Current state of the special designation record."
          value={state}
          onChange={handleStateChangeEvent}
        />
        <ADSWholeRoadControl
          variant="WholeRoad"
          label="Applied to"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "WholeRoad" : false}
          loading={loading}
          value={wholeRoad}
          helperText="Indicator as to whether the Special Designation applies to the Whole Road."
          errorText={wholeRoadError}
          onChange={handleWholeRoadChangeEvent}
        />
        {!wholeRoad && (
          <ADSTextControl
            label="Specify location"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "SpecificLocation" : false}
            loading={loading}
            value={specificLocation}
            maxLength={250}
            minLines={3}
            maxLines={5}
            id="os_special_designation_specify_location"
            characterSet="GeoPlaceStreet1"
            errorText={specificLocationError}
            helperText="Description of the location of the Special Designation within the Street."
            onChange={handleSpecificLocationChangeEvent}
          />
        )}
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="special designation"
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
        <MessageDialog isOpen={showWholeRoadWarning} variant="cancelASDPartRoad" onClose={handleCloseMessageDialog} />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"partRoadASD"} />
      </Popper>
    </Fragment>
  );
}

export default OSSpecialDesignationDataTab;
