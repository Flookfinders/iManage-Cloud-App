/* #region header */
/**************************************************************************************************
//
//  Description: Highway dedication data tab
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   16.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    004   27.10.23 Sean Flook                 Use new dataFormStyle.
//    005   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    006   20.12.23 Sean Flook       IMANN-201 Corrected controls and form layout.
//    007   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    008   11.01.24 Sean Flook                 Fix warnings.
//    009   25.01.24 Sean Flook                 Changes required after UX review.
//    010   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    011   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    012   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    013   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    014   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";

import { GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import ObjectComparison, { highwayDedicationKeysToIgnore } from "../utils/ObjectComparison";

import { Grid, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateTimeControl from "../components/ADSDateTimeControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import HighwayDedicationCode from "../data/HighwayDedicationCode";

import { DirectionsBike as NCRIcon } from "@mui/icons-material";
import {
  PRoWIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";

import { useTheme } from "@mui/styles";
import { adsBlueA, adsMidGreyA } from "../utils/ADSColours";
import { toolbarStyle, dataTabToolBar, dataFormStyle, FormRowStyle } from "../utils/ADSStyles";

HighwayDedicationDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function HighwayDedicationDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [highwayDedicationCode, setHighwayDedicationCode] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [prow, setProw] = useState(false);
  const [ncr, setNcr] = useState(false);
  const [quietRoute, setQuietRoute] = useState(false);
  const [obstruction, setObstruction] = useState(false);
  const [planningOrder, setPlanningOrder] = useState(false);
  const [vehiclesProhibited, setVehiclesProhibited] = useState(false);
  const [seasonalStartDate, setSeasonalStartDate] = useState(null);
  const [seasonalEndDate, setSeasonalEndDate] = useState(null);
  const [recordEndDate, setRecordEndDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [prowHover, setProwHover] = useState(false);
  const [ncrHover, setNcrHover] = useState(false);
  const [quietRouteHover, setQuietRouteHover] = useState(false);
  const [obstructionHover, setObstructionHover] = useState(false);
  const [planningOrderHover, setPlanningOrderHover] = useState(false);
  const [vehiclesProhibitedHover, setVehiclesProhibitedHover] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [highwayDedicationCodeError, setHighwayDedicationCodeError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [startTimeError, setStartTimeError] = useState(null);
  const [endTimeError, setEndTimeError] = useState(null);
  const [seasonalStartDateError, setSeasonalStartDateError] = useState(null);
  const [seasonalEndDateError, setSeasonalEndDateError] = useState(null);
  const [recordEndDateError, setRecordEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newHighwayDedicationData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("highwayDedication", newHighwayDedicationData);
  };

  /**
   * Event to handle when the highway dedication code is changed.
   *
   * @param {number} newValue The new highway dedication code.
   */
  const handleHighwayDedicationCodeChangeEvent = (newValue) => {
    setHighwayDedicationCode(newValue);
    UpdateSandbox("highwayDedicationCode", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the start time is changed.
   *
   * @param {Time} newValue The new start time.
   */
  const handleStartTimeChangeEvent = (newValue) => {
    setStartTime(newValue);
    UpdateSandbox("startTime", newValue);
  };

  /**
   * Event to handle when the end time is changed.
   *
   * @param {Time} newValue The new end time.
   */
  const handleEndTimeChangeEvent = (newValue) => {
    setEndTime(newValue);
    UpdateSandbox("endTime", newValue);
  };

  /**
   * Event to handle when the public rights of way flag is changed.
   *
   * @param {object} event The event object.
   */
  const handleProwChangeEvent = (event) => {
    const newValue = event.target.checked;
    setProw(newValue);
    UpdateSandbox("prow", newValue);
  };

  /**
   * Event to handle when the national cycle route flag is changed.
   *
   * @param {object} event The event object.
   */
  const handleNcrChangeEvent = (event) => {
    const newValue = event.target.checked;
    setNcr(newValue);
    UpdateSandbox("ncr", newValue);
  };

  /**
   * Event to handle when the quiet route flag is changed.
   *
   * @param {object} event The event object.
   */
  const handleQuietRouteChangeEvent = (event) => {
    const newValue = event.target.checked;
    setQuietRoute(newValue);
    UpdateSandbox("quietRoute", newValue);
  };

  /**
   * Event to handle when the obstruction flag is changed.
   *
   * @param {object} event The event object.
   */
  const handleObstructionChangeEvent = (event) => {
    const newValue = event.target.checked;
    setObstruction(newValue);
    UpdateSandbox("obstruction", newValue);
  };

  /**
   * Event to handle when the planning order flag is changed.
   *
   * @param {object} event The event object.
   */
  const handlePlanningOrderChangeEvent = (event) => {
    const newValue = event.target.checked;
    setPlanningOrder(newValue);
    UpdateSandbox("planningOrder", newValue);
  };

  /**
   * Event to handle when the vehicles prohibited flag is changed.
   *
   * @param {object} event The event object.
   */
  const handleVehiclesProhibitedChangeEvent = (event) => {
    const newValue = event.target.checked;
    setVehiclesProhibited(newValue);
    UpdateSandbox("vehiclesProhibited", newValue);
  };

  /**
   * Event to handle when the seasonal start date is changed.
   *
   * @param {Date} newValue The new seasonal start date.
   */
  const handleSeasonalStartDateChangeEvent = (newValue) => {
    setSeasonalStartDate(newValue);
    UpdateSandbox("seasonalStartDate", newValue);
  };

  /**
   * Event to handle when the seasonal end date is changed.
   *
   * @param {Date} newValue The new seasonal end date.
   */
  const handleSeasonalEndDateChangeEvent = (newValue) => {
    setSeasonalEndDate(newValue);
    UpdateSandbox("seasonalEndDate", newValue);
  };

  /**
   * Event to handle when the record end date is changed.
   *
   * @param {Date} newValue The new record end date.
   */
  const handleRecordEndDateChangeEvent = (newValue) => {
    setRecordEndDate(newValue);
    UpdateSandbox("recordEndDate", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
    const sourceHighwayDedication =
      data.pkId > 0 && contextStreet
        ? contextStreet.esus
            .find((esu) => esu.esuId === data.hdData.esuId)
            .highwayDedications.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.highwayDedication
            ? "check"
            : "discard"
          : "discard",
        sourceHighwayDedication,
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.highwayDedication);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.hdData) {
        setHighwayDedicationCode(data.hdData.highwayDedicationCode);
        setStartDate(data.hdData.hdStartDate);
        setEndDate(data.hdData.hdEndDate);
        setStartTime(data.hdData.hdStartTime);
        setEndTime(data.hdData.hdEndTime);
        setProw(data.hdData.hdProw ? data.hdData.hdProw : false);
        setNcr(data.hdData.hdNcr ? data.hdData.hdNcr : false);
        setQuietRoute(data.hdData.hdQuietRoute ? data.hdData.hdQuietRoute : false);
        setObstruction(data.hdData.hdObstruction ? data.hdData.hdObstruction : false);
        setPlanningOrder(data.hdData.hdPlanningOrder ? data.hdData.hdPlanningOrder : false);
        setVehiclesProhibited(data.hdData.hdVehiclesProhibited ? data.hdData.hdVehiclesProhibited : false);
        setSeasonalStartDate(data.hdData.hdSeasonalStartDate);
        setSeasonalEndDate(data.hdData.hdSeasonalEndDate);
        setRecordEndDate(data.hdData.recordEndDate);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.hdData, null);
  };

  /**
   * Method to return the current highway dedication record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current highway dedication record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.hdData.pkId || data.hdData.pkId < 0 ? "I" : "U",
      highwayDedicationCode: field && field === "highwayDedicationCode" ? newValue : highwayDedicationCode,
      hdStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      hdEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      hdStartTime: field && field === "startTime" ? newValue : startTime,
      hdEndTime: field && field === "endTime" ? newValue : endTime,
      hdProw: field && field === "prow" ? newValue : prow,
      hdNcr: field && field === "ncr" ? newValue : ncr,
      hdQuietRoute: field && field === "quietRoute" ? newValue : quietRoute,
      hdObstruction: field && field === "obstruction" ? newValue : obstruction,
      hdPlanningOrder: field && field === "planningOrder" ? newValue : planningOrder,
      hdVehiclesProhibited: field && field === "vehiclesProhibited" ? newValue : vehiclesProhibited,
      hdSeasonalStartDate:
        field && field === "seasonalStartDate"
          ? newValue && ConvertDate(newValue)
          : seasonalStartDate && ConvertDate(seasonalStartDate),
      hdSeasonalEndDate:
        field && field === "seasonalEndDate"
          ? newValue && ConvertDate(newValue)
          : seasonalEndDate && ConvertDate(seasonalEndDate),
      recordEndDate:
        field && field === "recordEndDate"
          ? newValue && ConvertDate(newValue)
          : recordEndDate && ConvertDate(recordEndDate),
      pkId: data.hdData.pkId,
      esuId: data.hdData.esuId,
      seqNum: data.hdData.seqNum,
    };
  }

  /**
   * Event to handle when the add highway dedication button is clicked.
   */
  const handleAddHighwayDedication = () => {
    if (onAdd) onAdd(data.hdData.esuId, data.esuIndex);
  };

  /**
   * Event to handle when the delete highway dedication button is clicked.
   */
  const handleDeleteHighwayDedication = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the mouse enters the PRoW.
   */
  const handleProwMouseEnter = () => {
    setProwHover(true);
  };

  /**
   * Event to handle when the mouse leaves the PRoW.
   */
  const handleProwMouseLeave = () => {
    setProwHover(false);
  };

  /**
   * Event to handle when the mouse enters the NCR.
   */
  const handleNcrMouseEnter = () => {
    setNcrHover(true);
  };

  /**
   * Event to handle when the mouse leaves the NCR.
   */
  const handleNcrMouseLeave = () => {
    setNcrHover(false);
  };

  /**
   * Event to handle when the mouse enters the quiet route.
   */
  const handleQuietRouteMouseEnter = () => {
    setQuietRouteHover(true);
  };

  /**
   * Event to handle when the mouse leaves the quiet route.
   */
  const handleQuietRouteMouseLeave = () => {
    setQuietRouteHover(false);
  };

  /**
   * Event to handle when the mouse enters the obstruction.
   */
  const handleObstructionMouseEnter = () => {
    setObstructionHover(true);
  };

  /**
   * Event to handle when the mouse leaves the obstruction.
   */
  const handleObstructionMouseLeave = () => {
    setObstructionHover(false);
  };

  /**
   * Event to handle when the mouse enters the planning order.
   */
  const handlePlanningOrderMouseEnter = () => {
    setPlanningOrderHover(true);
  };

  /**
   * Event to handle when the mouse leaves the planning order.
   */
  const handlePlanningOrderMouseLeave = () => {
    setPlanningOrderHover(false);
  };

  /**
   * Event to handle when the mouse enters the vehicles prohibited.
   */
  const handleVehiclesProhibitedMouseEnter = () => {
    setVehiclesProhibitedHover(true);
  };

  /**
   * Event to handle when the mouse leaves the vehicles prohibited.
   */
  const handleVehiclesProhibitedMouseLeave = () => {
    setVehiclesProhibitedHover(false);
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
      if (onDelete) onDelete(data.hdData.esuId, pkId);
    }
  };

  /**
   * Method to get the styling to be used for the indicator.
   *
   * @param {boolean} isChecked True if the item is checked; otherwise false.
   * @param {boolean} isHover True if the mouse is hovering over the item; otherwise false.
   * @returns {object} The styling to be used for the indicator.
   */
  function getIndicatorStyle(isChecked, isHover) {
    if (isChecked || isHover)
      return {
        mr: theme.spacing(1),
        color: adsBlueA,
      };
    else
      return {
        mr: theme.spacing(1),
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
  }

  useEffect(() => {
    if (!loading && data && data.hdData) {
      setHighwayDedicationCode(data.hdData.highwayDedicationCode);
      setStartDate(data.hdData.hdStartDate);
      setEndDate(data.hdData.hdEndDate);
      setStartTime(data.hdData.hdStartTime);
      setEndTime(data.hdData.hdEndTime);
      setProw(data.hdData.hdProw ? data.hdData.hdProw : false);
      setNcr(data.hdData.hdNcr ? data.hdData.hdNcr : false);
      setQuietRoute(data.hdData.hdQuietRoute ? data.hdData.hdQuietRoute : false);
      setObstruction(data.hdData.hdObstruction ? data.hdData.hdObstruction : false);
      setPlanningOrder(data.hdData.hdPlanningOrder ? data.hdData.hdPlanningOrder : false);
      setVehiclesProhibited(data.hdData.hdVehiclesProhibited ? data.hdData.hdVehiclesProhibited : false);
      setSeasonalStartDate(data.hdData.hdSeasonalStartDate);
      setSeasonalEndDate(data.hdData.hdSeasonalEndDate);
      setRecordEndDate(data.hdData.recordEndDate);
    }
  }, [loading, data]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.highwayDedication
    ) {
      const sourceHighwayDedication =
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId > 0 &&
        sandboxContext.currentSandbox.sourceStreet
          ? sandboxContext.currentSandbox.sourceStreet.esus
              .find((esu) => esu.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId)
              .highwayDedications.find(
                (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId
              )
          : null;

      if (sourceHighwayDedication) {
        setDataChanged(
          !ObjectComparison(
            sourceHighwayDedication,
            sandboxContext.currentSandbox.currentStreetRecords.highwayDedication,
            highwayDedicationKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId < 0) setDataChanged(true);
    }
  }, [
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.highwayDedication,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editStreet);
  }, [userContext]);

  useEffect(() => {
    setHighwayDedicationCodeError(null);
    setStartDateError(null);
    setEndDateError(null);
    setStartTimeError(null);
    setEndTimeError(null);
    setSeasonalStartDateError(null);
    setSeasonalEndDateError(null);
    setRecordEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "highwaydedicationcode":
            setHighwayDedicationCodeError(error.errors);
            break;

          case "hdstartdate":
            setStartDateError(error.errors);
            break;

          case "hdenddate":
            setEndDateError(error.errors);
            break;

          case "hdstarttime":
            setStartTimeError(error.errors);
            break;

          case "hdendtime":
            setEndTimeError(error.errors);
            break;

          case "hdseasonalstartdate":
            setSeasonalStartDateError(error.errors);
            break;

          case "hdseasonalenddate":
            setSeasonalEndDateError(error.errors);
            break;

          case "recordenddate":
            setRecordEndDateError(error.errors);
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
          <Stack direction="row" alignItems="center" justifyContent="flex-start">
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
              <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
              {`| ${data.hdData.esuId}: Highway dedication (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ADSActionButton
              variant="delete"
              disabled={!userCanEdit}
              tooltipTitle="Delete highway dedication"
              tooltipPlacement="right"
              onClick={handleDeleteHighwayDedication}
            />
            <ADSActionButton
              variant="add"
              disabled={!userCanEdit}
              tooltipTitle="Add new highway dedication record"
              tooltipPlacement="right"
              onClick={handleAddHighwayDedication}
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("HighwayDedicationDataTab")}>
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "HighwayDedicationCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={HighwayDedicationCode}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          lookupIcon="avatar_icon"
          value={highwayDedicationCode}
          errorText={highwayDedicationCodeError}
          onChange={handleHighwayDedicationCodeChangeEvent}
          helperText="The type of Highway Dedication that applies to this section of the Street."
        />
        <ADSDateTimeControl
          label="Dedication start"
          isEditable={userCanEdit}
          isDateRequired
          isTimeRequired={!!endTime}
          isDateFocused={focusedField ? focusedField === "HdStartDate" : false}
          isTimeFocused={focusedField ? focusedField === "HdStartTime" : false}
          loading={loading}
          dateValue={startDate}
          timeValue={startTime}
          dateHelperText="The date the Highway Dedication legally starts."
          timeHelperText="If the Highway Dedication has a specified time period, time when the designation starts."
          dateErrorText={startDateError}
          timeErrorText={startTimeError}
          allowFutureDates
          onDateChange={handleStartDateChangeEvent}
          onTimeChange={handleStartTimeChangeEvent}
        />
        <ADSDateTimeControl
          label="Dedication end"
          isEditable={userCanEdit}
          isTimeRequired={!!startTime}
          isDateFocused={focusedField ? focusedField === "HdEndDate" : false}
          isTimeFocused={focusedField ? focusedField === "HdEndTime" : false}
          loading={loading}
          dateValue={endDate}
          timeValue={endTime}
          dateHelperText="The date the Highway Dedication legally ends."
          timeHelperText="If the Highway Dedication has a specified time period, time when the designation ends."
          dateErrorText={endDateError}
          timeErrorText={endTimeError}
          allowFutureDates
          onDateChange={handleEndDateChangeEvent}
          onTimeChange={handleEndTimeChangeEvent}
        />
        <Grid container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
          <Grid item xs={3}>
            <Typography variant="body2" align="left" id="indicator-label" color="textPrimary">
              Indicator
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start">
              <Grid item>
                <FormControlLabel
                  control={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox checked={prow} disabled={!userCanEdit} onChange={handleProwChangeEvent} />
                      <PRoWIcon sx={getIndicatorStyle(prow, prowHover)} />
                    </Box>
                  }
                  label="PRoW"
                  onMouseEnter={handleProwMouseEnter}
                  onMouseLeave={handleProwMouseLeave}
                  sx={getIndicatorStyle(prow, prowHover)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox checked={ncr} disabled={!userCanEdit} onChange={handleNcrChangeEvent} />
                      <NCRIcon sx={getIndicatorStyle(ncr, ncrHover)} />
                    </Box>
                  }
                  label="NCR"
                  onMouseEnter={handleNcrMouseEnter}
                  onMouseLeave={handleNcrMouseLeave}
                  sx={getIndicatorStyle(ncr, ncrHover)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox checked={quietRoute} disabled={!userCanEdit} onChange={handleQuietRouteChangeEvent} />
                      <QuietRouteIcon sx={getIndicatorStyle(quietRoute, quietRouteHover)} />
                    </Box>
                  }
                  label="Quiet route"
                  onMouseEnter={handleQuietRouteMouseEnter}
                  onMouseLeave={handleQuietRouteMouseLeave}
                  sx={getIndicatorStyle(quietRoute, quietRouteHover)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox checked={obstruction} disabled={!userCanEdit} onChange={handleObstructionChangeEvent} />
                      <ObstructionIcon sx={getIndicatorStyle(obstruction, obstructionHover)} />
                    </Box>
                  }
                  label="Obstruction"
                  onMouseEnter={handleObstructionMouseEnter}
                  onMouseLeave={handleObstructionMouseLeave}
                  sx={getIndicatorStyle(obstruction, obstructionHover)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        checked={planningOrder}
                        disabled={!userCanEdit}
                        onChange={handlePlanningOrderChangeEvent}
                      />
                      <PlanningOrderIcon sx={getIndicatorStyle(planningOrder, planningOrderHover)} />
                    </Box>
                  }
                  label="Planning order"
                  onMouseEnter={handlePlanningOrderMouseEnter}
                  onMouseLeave={handlePlanningOrderMouseLeave}
                  sx={getIndicatorStyle(planningOrder, planningOrderHover)}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        checked={vehiclesProhibited}
                        disabled={!userCanEdit}
                        onChange={handleVehiclesProhibitedChangeEvent}
                      />
                      <VehiclesProhibitedIcon sx={getIndicatorStyle(vehiclesProhibited, vehiclesProhibitedHover)} />
                    </Box>
                  }
                  label="Vehicles prohibited"
                  onMouseEnter={handleVehiclesProhibitedMouseEnter}
                  onMouseLeave={handleVehiclesProhibitedMouseLeave}
                  sx={getIndicatorStyle(vehiclesProhibited, vehiclesProhibitedHover)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <ADSDateControl
          label="Seasonal start"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "HdSeasonalStartDate" : false}
          loading={loading}
          value={seasonalStartDate}
          helperText="If the Highway Dedication is seasonal or periodical, date when the Highway Dedication starts."
          errorText={seasonalStartDateError}
          allowFutureDates
          hideYear
          onChange={handleSeasonalStartDateChangeEvent}
        />
        <ADSDateControl
          label="Seasonal end"
          isEditable={userCanEdit}
          isRequired={seasonalStartDate}
          isFocused={focusedField ? focusedField === "HdSeasonalEndDate" : false}
          loading={loading}
          value={seasonalEndDate}
          helperText="If the Highway Dedication is seasonal or periodical, date when the Highway Dedication ends."
          errorText={seasonalEndDateError}
          allowFutureDates
          hideYear
          onChange={handleSeasonalEndDateChangeEvent}
        />
        <ADSDateControl
          label="Record end"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "RecordEndDate" : false}
          loading={loading}
          value={recordEndDate}
          helperText="Date when the Record ended."
          errorText={recordEndDateError}
          onChange={handleRecordEndDateChangeEvent}
        />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog variant="hd" open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} />
      </div>
    </Fragment>
  );
}

export default HighwayDedicationDataTab;
