/* #region header */
/**************************************************************************************************
//
//  Description: Maintenance responsibility data tab
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
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
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "./../context/mapContext";

import { GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import { FilteredRoadStatusCode, FilteredSwaOrgRef } from "../utils/StreetUtils";
import ObjectComparison from "../utils/ObjectComparison";

import { Avatar, Grid, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSTextToggleControl from "../components/ADSTextToggleControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import { People } from "@mui/icons-material";

import { adsWhite, adsBrown } from "../utils/ADSColours";
import { streetToolbarStyle, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MaintenanceResponsibilityDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function MaintenanceResponsibilityDataTab({
  data,
  errors,
  loading,
  focusedField,
  onDataChanged,
  onHomeClick,
  onAdd,
  onDelete,
}) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [roadStatusCodeLookup, setRoadStatusCodeLookup] = useState(FilteredRoadStatusCode(true));
  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(FilteredSwaOrgRef(true));

  const [streetStatus, setStreetStatus] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.streetStatus : null
  );
  const [custodian, setCustodian] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.custodianCode : null
  );
  const [authority, setAuthority] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.maintainingAuthorityCode : null
  );
  const [startDate, setStartDate] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.startDate : null
  );
  const [endDate, setEndDate] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.endDate : null
  );
  const [state, setState] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.state : null
  );
  const [wholeRoad, setWholeRoad] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.wholeRoad : true
  );
  const [specificLocation, setSpecificLocation] = useState(
    data && data.maintenanceResponsibilityData ? data.maintenanceResponsibilityData.specificLocation : null
  );

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [streetStatusError, setStreetStatusError] = useState(null);
  const [custodianError, setCustodianError] = useState(null);
  const [authorityError, setAuthorityError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specifyLocationError, setSpecifyLocationError] = useState(null);

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
      specificLocation: field && field === "specificLocation" ? newValue : specificLocation,
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
    if (!dataChanged) {
      setDataChanged(streetStatus !== newValue);
      if (onDataChanged && streetStatus !== newValue) onDataChanged();
    }
    UpdateSandbox("streetStatus", newValue);
  };

  /**
   * Event to handle when the custodian is changed.
   *
   * @param {number|null} newValue The new custodian.
   */
  const handleCustodianChangeEvent = (newValue) => {
    setCustodian(newValue);
    if (!dataChanged) {
      setDataChanged(custodian !== newValue);
      if (onDataChanged && custodian !== newValue) onDataChanged();
    }
    UpdateSandbox("custodian", newValue);
  };

  /**
   * Event to handle when the authority is changed.
   *
   * @param {number|null} newValue The new authority.
   */
  const handleAuthorityChangeEvent = (newValue) => {
    setAuthority(newValue);
    if (!dataChanged) {
      setDataChanged(authority !== newValue);
      if (onDataChanged && authority !== newValue) onDataChanged();
    }
    UpdateSandbox("authority", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    if (!dataChanged) {
      setDataChanged(startDate !== newValue);
      if (onDataChanged && startDate !== newValue) onDataChanged();
    }
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    if (!dataChanged) {
      setDataChanged(endDate !== newValue);
      if (onDataChanged && endDate !== newValue) onDataChanged();
    }
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number|null} newValue The new state.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    if (!dataChanged) {
      setDataChanged(state !== newValue);
      if (onDataChanged && state !== newValue) onDataChanged();
    }
    UpdateSandbox("state", newValue);
  };

  /**
   * Event to handle when the whole road flag is changed.
   *
   * @param {boolean|null} newValue The new whole road flag.
   */
  const handleWholeRoadChangeEvent = (newValue) => {
    setWholeRoad(newValue);
    if (!dataChanged) {
      setDataChanged(wholeRoad !== newValue);
      if (onDataChanged && wholeRoad !== newValue) onDataChanged();
    }
    UpdateSandbox("wholeRoad", newValue);
    if (newValue) mapContext.onEditMapObject(null, null);
    else
      mapContext.onEditMapObject(
        51,
        data && data.maintenanceResponsibilityData && data.maintenanceResponsibilityData.pkId
      );
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecificLocationChangeEvent = (newValue) => {
    setSpecificLocation(newValue);
    if (!dataChanged) {
      setDataChanged(specificLocation !== newValue);
      if (onDataChanged && specificLocation !== newValue) onDataChanged();
    }
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
      setDataChanged(
        onHomeClick(
          dataChanged
            ? sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
              ? "check"
              : "discard"
            : "discard",
          sourceMaintenanceResponsibility,
          sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      setDataChanged(
        onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility)
      );
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
        setSpecificLocation(data.maintenanceResponsibilityData.specificLocation);
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.maintenanceResponsibilityData, null);
  };

  /**
   * Event to handle when the add maintenance responsibility button is clicked.
   */
  const handleAddMaintenanceResponsibility = () => {
    if (onAdd) onAdd();
    if (!dataChanged) setDataChanged(true);
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

    if (deleteConfirmed && pkId && pkId > 0) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
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
      setSpecificLocation(data.maintenanceResponsibilityData.specificLocation);

      setRoadStatusCodeLookup(FilteredRoadStatusCode(true));
      setSwaOrgRefLookup(FilteredSwaOrgRef(true));
    }
  }, [loading, data]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && data && data.maintenanceResponsibilityData) {
      const sourceMaintenanceResponsibility =
        sandboxContext.currentSandbox.sourceStreet.maintenanceResponsibilities.find((x) => x.pkId === data.id);

      if (sourceMaintenanceResponsibility) {
        setDataChanged(
          !ObjectComparison(sourceMaintenanceResponsibility, data.maintenanceResponsibilityData, [
            "changeType",
            "recordEntryDate",
            "recordEndDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        );
      } else if (data.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.sourceStreet, data]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

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
      <Box sx={streetToolbarStyle}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item>
                <ADSActionButton
                  variant="home"
                  tooltipTitle="Home"
                  tooltipPlacement="bottom"
                  onClick={handleHomeClick}
                />
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
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
                      backgroundColor: adsBrown,
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
                    {` Maintenance responsibility (${data.index + 1} of ${data.totalRecords})`}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item>
                <ADSActionButton
                  variant="delete"
                  disabled={!userCanEdit}
                  tooltipTitle="Delete maintenance responsibility record"
                  tooltipPlacement="right"
                  onClick={handleDeleteMaintenanceResponsibility}
                />
              </Grid>
              <Grid item>
                <ADSActionButton
                  variant="add"
                  disabled={!userCanEdit}
                  tooltipTitle="Add new maintenance responsibility record"
                  tooltipPlacement="right"
                  onClick={handleAddMaintenanceResponsibility}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
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
      </div>
    </Fragment>
  );
}

export default MaintenanceResponsibilityDataTab;
