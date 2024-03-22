/* #region header */
/**************************************************************************************************
//
//  Description: Interest data tab
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
//    002   10.08.23 Sean Flook                 Corrected field name.
//    003   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    004   16.10.23 Sean Flook                 Hide the button for the coordinates.
//    005   27.10.23 Sean Flook                 Use new dataFormStyle and removed start and end coordinates as no longer required.
//    006   03.11.23 Sean Flook                 Make labels the same within application.
//    007   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    008   02.01.24 Sean Flook       IMANN-205 Added end date.
//    009   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    010   11.01.24 Sean Flook                 Fix warnings.
//    011   16.01.24 Sean Flook                 Changes required to fix warnings.
//    012   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    013   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    014   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    015   05.02.24 Sean Flook                 Filter available districts by the organisation.
//    016   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    017   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
//    018   13.02.24 Sean Flook                 Updated to new colour.
//    019   14.02.24 Joel Benford     IMANN-299 Toolbar changes
//    020   04.03.24 Sean Flook            COL3 Changed the colour for type 51/61 ASD records.
//    021   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    022   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    023   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    024   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "./../context/mapContext";
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { GetLookupLabel, ConvertDate, filteredLookup } from "../utils/HelperUtils";
import { filteredOperationalDistricts } from "../utils/StreetUtils";
import ObjectComparison, { interestKeysToIgnore } from "../utils/ObjectComparison";

import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import SwaOrgRef from "../data/SwaOrgRef";
import InterestType from "../data/InterestType";
import RoadStatusCode from "../data/RoadStatusCode";

import { People } from "@mui/icons-material";
import { adsWhite, adsMidBlueA } from "../utils/ADSColours";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

InterestDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function InterestDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [roadStatusCodeLookup, setRoadStatusCodeLookup] = useState(filteredLookup(RoadStatusCode, false));
  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, false));

  const [streetStatus, setStreetStatus] = useState(null);
  const [interestedOrganisation, setInterestedOrganisation] = useState(null);
  const [interestType, setInterestedType] = useState(null);
  const [district, setDistrict] = useState(null);
  const [maintainingOrganisation, setMaintainingOrganisation] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specificLocation, setSpecificLocation] = useState("");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

  const [streetStatusError, setStreetStatusError] = useState(null);
  const [interestedOrganisationError, setInterestedOrganisationError] = useState(null);
  const [interestTypeError, setInterestedTypeError] = useState(null);
  const [districtError, setDistrictError] = useState(null);
  const [maintainingOrganisationError, setMaintainingOrganisationError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specifyLocationError, setSpecifyLocationError] = useState(null);

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "asd-information-popper" : undefined;

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newInterestData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("interest", newInterestData);
  };

  /**
   * Event to handle when the street status is changed.
   *
   * @param {number|null} newValue The new street status.
   */
  const handleStreetStatusChangeEvent = (newValue) => {
    setStreetStatus(newValue);
    UpdateSandbox("streetStatus", newValue);
  };

  /**
   * Event to handle when the interested organisation is changed.
   *
   * @param {number|null} newValue The new interested organisation.
   */
  const handleInterestedOrganisationChangeEvent = (newValue) => {
    setInterestedOrganisation(newValue);
    UpdateSandbox("interestedOrganisation", newValue);
  };

  /**
   * Event to handle when the interest type is changed.
   *
   * @param {number|null} newValue The new interest type.
   */
  const handleInterestTypeChangeEvent = (newValue) => {
    setInterestedType(newValue);
    UpdateSandbox("interestType", newValue);
  };

  /**
   * Event to handle when the district is changed.
   *
   * @param {number|null} newValue The new district.
   */
  const handleDistrictChangeEvent = (newValue) => {
    setDistrict(newValue);
    UpdateSandbox("district", newValue);
  };

  /**
   * Event to handle when the maintaining organisation changes.
   *
   * @param {number|null} newValue The new maintaining organisation.
   */
  const handleMaintainingOrganisationChangeEvent = (newValue) => {
    setMaintainingOrganisation(newValue);
    UpdateSandbox("maintainingOrganisation", newValue);
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
        mapContext.onEditMapObject(61, data && data.interestData && data.interestData.pkId);
        informationContext.onDisplayInformation("partRoadASD", "InterestDataTab");
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
    const sourceInterest =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.interests.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged ? (sandboxContext.currentSandbox.currentStreetRecords.interest ? "check" : "discard") : "discard",
        sourceInterest,
        sandboxContext.currentSandbox.currentStreetRecords.interest
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.interest);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.interestData) {
        setStreetStatus(data.interestData.streetStatus);
        setInterestedOrganisation(data.interestData.swaOrgRefAuthority);
        setInterestedType(data.interestData.interestType);
        setDistrict(data.interestData.districtRefAuthority);
        setMaintainingOrganisation(data.interestData.swaOrgRefAuthMaintaining);
        setStartDate(data.interestData.recordStartDate);
        setEndDate(data.interestData.recordEndDate);
        setWholeRoad(data.interestData.wholeRoad);
        setSpecificLocation(data.interestData.specificLocation ? data.interestData.specificLocation : "");
        setStartX(data.interestData.startX ? data.interestData.startX : 0);
        setStartY(data.interestData.startY ? data.interestData.startY : 0);
        setEndX(data.interestData.endX ? data.interestData.endX : 0);
        setEndY(data.interestData.endY ? data.interestData.endY : 0);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.interestData, null);
  };

  /**
   * Method to return the current interest record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current interest record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType:
        field && field === "changeType" ? newValue : !data.interestData.pkId || data.interestData.pkId < 0 ? "I" : "U",
      usrn: data.interestData.usrn,
      seqNum: data.interestData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation: field && field === "specificLocation" ? newValue : specificLocation,
      neverExport: data.interestData.neverExport,
      swaOrgRefAuthority: field && field === "interestedOrganisation" ? newValue : interestedOrganisation,
      districtRefAuthority: field && field === "district" ? newValue : district,
      recordStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      recordEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      asdCoordinate: data.interestData.asdCoordinate,
      asdCoordinateCount: data.interestData.asdCoordinateCount,
      swaOrgRefAuthMaintaining: field && field === "maintainingOrganisation" ? newValue : maintainingOrganisation,
      streetStatus: field && field === "streetStatus" ? newValue : streetStatus,
      interestType: field && field === "interestType" ? newValue : interestType,
      startX: field && field === "startX" ? newValue : startX,
      startY: field && field === "startY" ? newValue : startY,
      endX: field && field === "endX" ? newValue : endX,
      endY: field && field === "endY" ? newValue : endY,
      wktGeometry: data.interestData.wktGeometry,
      pkId: data.interestData.pkId,
      entryDate: data.interestData.entryDate,
      lastUpdateDate: data.interestData.lastUpdateDate,
    };
  }

  /**
   * Event to handle when the add interest button is clicked.
   */
  const handleAddInterest = () => {
    if (onAdd) onAdd();
  };

  /**
   * Event to handle when the delete interest button is clicked.
   */
  const handleDeleteInterest = () => {
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

  useEffect(() => {
    if (!loading && data && data.interestData) {
      setStreetStatus(data.interestData.streetStatus);
      setInterestedOrganisation(data.interestData.swaOrgRefAuthority);
      setInterestedType(data.interestData.interestType);
      setDistrict(data.interestData.districtRefAuthority);
      setMaintainingOrganisation(data.interestData.swaOrgRefAuthMaintaining);
      setStartDate(data.interestData.recordStartDate);
      setEndDate(data.interestData.recordEndDate);
      setWholeRoad(data.interestData.wholeRoad);
      setSpecificLocation(data.interestData.specificLocation ? data.interestData.specificLocation : "");
      setStartX(data.interestData.startX ? data.interestData.startX : 0);
      setStartY(data.interestData.startY ? data.interestData.startY : 0);
      setEndX(data.interestData.endX ? data.interestData.endX : 0);
      setEndY(data.interestData.endY ? data.interestData.endY : 0);

      setRoadStatusCodeLookup(filteredLookup(RoadStatusCode, false));
      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, false));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "InterestDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && sandboxContext.currentSandbox.currentStreetRecords.interest) {
      const sourceInterest = sandboxContext.currentSandbox.sourceStreet.interests.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.interest.pkId
      );

      if (sourceInterest) {
        setDataChanged(
          !ObjectComparison(
            sourceInterest,
            sandboxContext.currentSandbox.currentStreetRecords.interest,
            interestKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.interest.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.sourceStreet, sandboxContext.currentSandbox.currentStreetRecords.interest]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "InterestDataTab") {
      setInformationAnchorEl(document.getElementById("interest-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setStreetStatusError(null);
    setInterestedOrganisationError(null);
    setInterestedTypeError(null);
    setDistrictError(null);
    setMaintainingOrganisationError(null);
    setStartDateError(null);
    setEndDateError(null);
    setWholeRoadError(null);
    setSpecifyLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "streetstatus":
            setStreetStatusError(error.errors);
            break;

          case "swaorgrefauthority":
            setInterestedOrganisationError(error.errors);
            break;

          case "interesttype":
            setInterestedTypeError(error.errors);
            break;

          case "districtrefauthority":
            setDistrictError(error.errors);
            break;

          case "swaorgrefauthmaintaining":
            setMaintainingOrganisationError(error.errors);
            break;

          case "recordstartdate":
            setStartDateError(error.errors);
            break;

          case "recordenddate":
            setEndDateError(error.errors);
            break;

          case "wholeroad":
            setWholeRoadError(error.errors);
            break;

          case "specificlocation":
            setSpecifyLocationError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id={"interest-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 61 && streetContext.currentRecord.newRecord ? (
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
                backgroundColor: adsMidBlueA,
                color: adsWhite,
              }}
            >
              <People
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
              {streetContext.currentRecord.type === 61 && streetContext.currentRecord.newRecord
                ? "Add new interested organisation"
                : `Interested organisation (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 61 && streetContext.currentRecord.newRecord) && (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <ADSActionButton
                variant="delete"
                disabled={!userCanEdit}
                tooltipTitle="Delete interested organisation record"
                tooltipPlacement="right"
                onClick={handleDeleteInterest}
              />
              <ADSActionButton
                variant="add"
                disabled={!userCanEdit}
                tooltipTitle="Add new interested organisation record"
                tooltipPlacement="right"
                onClick={handleAddInterest}
              />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("InterestDataTab")}>
        <ADSSelectControl
          label="Street status"
          isEditable={userCanEdit}
          isRequired={interestType === 1}
          isFocused={focusedField ? focusedField === "StreetStatus" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={roadStatusCodeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={streetStatus}
          errorText={streetStatusError}
          onChange={handleStreetStatusChangeEvent}
          helperText="Street status as defined within the Street Maintenance Responsibility table."
        />
        <ADSSelectControl
          label="Interested organisation"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "SwaOrgRefAuthority" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={interestedOrganisation}
          errorText={interestedOrganisationError}
          onChange={handleInterestedOrganisationChangeEvent}
          helperText="Code to identify the authority which has an interest in the Street."
        />
        <ADSSelectControl
          label="Interest type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "InterestType" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={InterestType}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={interestType}
          errorText={interestTypeError}
          onChange={handleInterestTypeChangeEvent}
          helperText="Code to identify the nature of the interest that the organisation has in the Street. Defined within the SWA Data Capture Codes."
        />
        <ADSSelectControl
          label="District"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "DistrictRefAuthority" : false}
          loading={loading}
          useRounded
          includeHistoric
          lookupData={filteredOperationalDistricts(
            lookupContext.currentLookups.operationalDistricts,
            interestedOrganisation
          )}
          lookupId="districtId"
          lookupLabel="districtName"
          value={district}
          errorText={districtError}
          onChange={handleDistrictChangeEvent}
          helperText="Code to identify the Operational District within the authority."
        />
        <ADSSelectControl
          label="Maintaining organisation"
          isEditable={userCanEdit}
          isRequired={streetStatus === 4}
          isFocused={focusedField ? focusedField === "SwaOrgRefAuthMaintaining" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup.filter((x) => x.maintainingAuthority)}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={maintainingOrganisation}
          errorText={maintainingOrganisationError}
          onChange={handleMaintainingOrganisationChangeEvent}
          helperText="Code to identify the Street Authority that is legally responsible for maintaining the street where this is not the Local Highway Authority. For example, TfL, Highways England and Welsh Government."
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "recordStartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date when the Record started."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "recordEndDate" : false}
          loading={loading}
          value={endDate}
          helperText="Date when the Record ends."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSWholeRoadControl
          variant="WholeRoad"
          label="Applied to"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "WholeRoad" : false}
          loading={loading}
          value={wholeRoad}
          helperText="Indicator as to whether the interested organisation information applies to the Whole Road."
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
            id="interest-specify-location"
            characterSet="GeoPlaceStreet1"
            errorText={specifyLocationError}
            helperText="Description of the location of the parts of the Street to which this additional Street Record applies."
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
          variant="interested organisation"
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

export default InterestDataTab;
