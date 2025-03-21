//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Maintenance responsibility data tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   19.12.23 Sean Flook                 Various bug fixes.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    007   11.01.24 Sean Flook                 Fix warnings.
//    008   16.01.24 Sean Flook                 Changes required to fix warnings.
//    009   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    010   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    011   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    012   07.02.24 Sean Flook       IMANN-289 Corrected error field name.
//    013   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    014   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
//    015   13.02.24 Sean Flook                 Updated to new colour.
//    016   20.02.24 Joel Benford     IMANN-299 Toolbar changes
//    017   04.03.24 Sean Flook            COL3 Changed the colour for type 51/61 ASD records.
//    018   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    019   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    020   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    021   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    022   27.03.24 Sean Flook                 Clear specific location if going back to whole road.
//    023   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    024   26.07.24 Sean Flook       IMANN-856 Correctly handle deleting newly added record.
//    025   20.08.24 Sean Flook       IMANN-941 Corrected field name used for focused field.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "./../context/mapContext";
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { GetLookupLabel, ConvertDate, filteredLookup } from "../utils/HelperUtils";
import ObjectComparison, { maintenanceResponsibilityKeysToIgnore } from "../utils/ObjectComparison";

import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
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

import RoadStatusCode from "../data/RoadStatusCode";
import SwaOrgRef from "../data/SwaOrgRef";

import { People } from "@mui/icons-material";

import { adsWhite, adsMidBlueA } from "../utils/ADSColours";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MaintenanceResponsibilityDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function MaintenanceResponsibilityDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [roadStatusCodeLookup, setRoadStatusCodeLookup] = useState(filteredLookup(RoadStatusCode, true));
  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, true));

  const [streetStatus, setStreetStatus] = useState(null);
  const [custodian, setCustodian] = useState(null);
  const [authority, setAuthority] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [state, setState] = useState(null);
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specificLocation, setSpecificLocation] = useState("");

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

  const [streetStatusError, setStreetStatusError] = useState(null);
  const [custodianError, setCustodianError] = useState(null);
  const [authorityError, setAuthorityError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specifyLocationError, setSpecifyLocationError] = useState(null);

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "asd-information-popper" : undefined;

  /**
   * Method to return the current maintenance responsibility record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current maintenance responsibility record.
   */
  function GetCurrentData(field, newValue) {
    return {
      lastUpdated: data.maintenanceResponsibilityData.lastUpdated,
      lastUser: data.maintenanceResponsibilityData.lastUser,
      pkId: data.maintenanceResponsibilityData.pkId,
      changeType:
        field && field === "changeType"
          ? newValue
          : !data.maintenanceResponsibilityData.pkId || data.maintenanceResponsibilityData.pkId < 0
          ? "I"
          : "U",
      usrn: data.maintenanceResponsibilityData.usrn,
      seqNum: data.maintenanceResponsibilityData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation:
        field && field === "specificLocation"
          ? newValue
          : field && field === "wholeRoad" && newValue
          ? ""
          : specificLocation,
      neverExport: data.maintenanceResponsibilityData.neverExport,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      lastUpdateDate: data.maintenanceResponsibilityData.lastUpdateDate,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      streetStatus: field && field === "streetStatus" ? newValue : streetStatus,
      isLocal: data.maintenanceResponsibilityData.isLocal,
      custodianCode: field && field === "custodian" ? newValue : custodian,
      maintainingAuthorityCode: field && field === "authority" ? newValue : authority,
      state: field && field === "state" ? newValue : state,
      entryDate: data.maintenanceResponsibilityData.entryDate,
      wktGeometry: data.maintenanceResponsibilityData.wktGeometry,
    };
  }

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newMaintenanceResponsibilityData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("maintenanceResponsibility", newMaintenanceResponsibilityData);
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
   * @param {boolean|null} newValue The new whole road flag.
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
        mapContext.onEditMapObject(
          51,
          data && data.maintenanceResponsibilityData && data.maintenanceResponsibilityData.pkId
        );
        informationContext.onDisplayInformation("partRoadASD", "MaintenanceResponsibilityDataTab");
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
    const sourceMaintenanceResponsibility =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.maintenanceResponsibilities.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
            ? "check"
            : "discard"
          : "discard",
        sourceMaintenanceResponsibility,
        sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.maintenanceResponsibilityData) {
        setStreetStatus(data.maintenanceResponsibilityData.streetStatus);
        setCustodian(data.maintenanceResponsibilityData.custodianCode);
        setAuthority(data.maintenanceResponsibilityData.maintainingAuthorityCode);
        setStartDate(data.maintenanceResponsibilityData.startDate);
        setEndDate(data.maintenanceResponsibilityData.endDate);
        setState(data.maintenanceResponsibilityData.state);
        setWholeRoad(data.maintenanceResponsibilityData.wholeRoad);
        setSpecificLocation(
          data.maintenanceResponsibilityData.specificLocation ? data.maintenanceResponsibilityData.specificLocation : ""
        );
      }
    }
    if (onHomeClick) onHomeClick("discard", data.maintenanceResponsibilityData, null);
  };

  /**
   * Event to handle when the add maintenance responsibility button is clicked.
   */
  const handleAddMaintenanceResponsibility = () => {
    if (onAdd) onAdd();
  };

  /**
   * Event to handle when the delete maintenance responsibility button is clicked.
   */
  const handleDeleteMaintenanceResponsibility = () => {
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

    if (deleteConfirmed && pkId) {
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
      setSpecificLocation("");
      UpdateSandbox("wholeRoad", true);

      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();
    }

    setShowWholeRoadWarning(false);
  };

  useEffect(() => {
    if (!loading && data && data.maintenanceResponsibilityData) {
      setStreetStatus(data.maintenanceResponsibilityData.streetStatus);
      setCustodian(data.maintenanceResponsibilityData.custodianCode);
      setAuthority(data.maintenanceResponsibilityData.maintainingAuthorityCode);
      setStartDate(data.maintenanceResponsibilityData.startDate);
      setEndDate(data.maintenanceResponsibilityData.endDate);
      setState(data.maintenanceResponsibilityData.state);
      setWholeRoad(data.maintenanceResponsibilityData.wholeRoad);
      setSpecificLocation(
        data.maintenanceResponsibilityData.specificLocation ? data.maintenanceResponsibilityData.specificLocation : ""
      );

      setRoadStatusCodeLookup(filteredLookup(RoadStatusCode, true));
      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, true));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "MaintenanceResponsibilityDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
    ) {
      const sourceMaintenanceResponsibility =
        sandboxContext.currentSandbox.sourceStreet.maintenanceResponsibilities.find(
          (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility.pkId
        );

      if (sourceMaintenanceResponsibility) {
        setDataChanged(
          !ObjectComparison(
            sourceMaintenanceResponsibility,
            sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility,
            maintenanceResponsibilityKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility.pkId < 0)
        setDataChanged(true);
    }
  }, [
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editASD);
  }, [userContext]);

  useEffect(() => {
    if (
      informationContext.informationSource &&
      informationContext.informationSource === "MaintenanceResponsibilityDataTab"
    ) {
      setInformationAnchorEl(document.getElementById("maintenance-responsibility-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setStreetStatusError(null);
    setCustodianError(null);
    setAuthorityError(null);
    setStartDateError(null);
    setEndDateError(null);
    setStateError(null);
    setWholeRoadError(null);
    setSpecifyLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "streetstatus":
            setStreetStatusError(error.errors);
            break;

          case "custodiancode":
            setCustodianError(error.errors);
            break;

          case "maintainingauthoritycode":
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
      <Box sx={toolbarStyle} id={"maintenance-responsibility-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 51 && streetContext.currentRecord.newRecord ? (
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
              {streetContext.currentRecord.type === 51 && streetContext.currentRecord.newRecord
                ? "Add new maintenance responsibility"
                : `Maintenance responsibility (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 51 && streetContext.currentRecord.newRecord) && (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <ADSActionButton
                variant="delete"
                disabled={!userCanEdit}
                tooltipTitle="Delete maintenance responsibility record"
                tooltipPlacement="right"
                onClick={handleDeleteMaintenanceResponsibility}
              />
              <ADSActionButton
                variant="add"
                disabled={!userCanEdit}
                tooltipTitle="Add new maintenance responsibility record"
                tooltipPlacement="right"
                onClick={handleAddMaintenanceResponsibility}
              />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("MaintenanceResponsibilityDataTab")}>
        <ADSSelectControl
          label="Street status"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StreetStatus" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={roadStatusCodeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={streetStatus}
          errorText={streetStatusError}
          onChange={handleStreetStatusChangeEvent}
          helperText="A code to indicate the status of the street."
        />
        <ADSSelectControl
          label="Custodian"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "CustodianCode" : false}
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
          isFocused={focusedField ? focusedField === "MaintainingAuthorityCode" : false}
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
          helperText="Code for the organisation maintaining the street."
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "startDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date on which this organisation commenced maintaining the street."
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
            helperText="Date on which this organisation ceased maintaining the street."
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
          helperText="Current state of the maintenance responsibility record."
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
            id="maintenance_responsibility_specify_location"
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

export default MaintenanceResponsibilityDataTab;
