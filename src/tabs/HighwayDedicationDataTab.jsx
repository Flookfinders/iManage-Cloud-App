//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Highway dedication data tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   16.10.23 Sean Flook                  Ensure the OK button is enabled when creating a new record and use colour variables.
//    004   27.10.23 Sean Flook                  Use new dataFormStyle.
//    005   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    006   20.12.23 Sean Flook        IMANN-201 Corrected controls and form layout.
//    007   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    008   11.01.24 Sean Flook                  Fix warnings.
//    009   25.01.24 Sean Flook                  Changes required after UX review.
//    010   07.03.24 Sean Flook        IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    011   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    012   13.03.24 Joshua McCormick  IMANN-280 Added dataTabToolBar for inner toolbar styling
//    013   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    014   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    015   26.07.24 Sean Flook        IMANN-856 Correctly handle deleting newly added record.
//    016   06.08.24 Sean Flook        IMANN-893 Check we have a source ESU before getting the highway dedication record.
//    017   06.08.24 Sean Flook        IMANN-905 When determining if the record has changed and we do not have it in the sourceStreet use the currentStreet.
//    018   20.08.24 Sean Flook        IMANN-818 Use the new ADSHDCheckbox controls and handle errors for those controls.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    019   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";

import { GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import ObjectComparison, { highwayDedicationKeysToIgnore } from "../utils/ObjectComparison";

import { Grid2, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateTimeControl from "../components/ADSDateTimeControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import HighwayDedicationCode from "../data/HighwayDedicationCode";

import { useTheme } from "@mui/styles";
import { toolbarStyle, dataTabToolBar, dataFormStyle, FormRowStyle } from "../utils/ADSStyles";
import ADSHDCheckbox from "../components/ADSHDCheckbox";

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

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [highwayDedicationCodeError, setHighwayDedicationCodeError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [startTimeError, setStartTimeError] = useState(null);
  const [endTimeError, setEndTimeError] = useState(null);
  const [prowError, setProwError] = useState(null);
  const [ncrError, setNcrError] = useState(null);
  const [quietRouteError, setQuietRouteError] = useState(null);
  const [obstructionError, setObstructionError] = useState(null);
  const [planningOrderError, setPlanningOrderError] = useState(null);
  const [vehiclesProhibitedError, setVehiclesProhibitedError] = useState(null);
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
   * @param {Boolean} newValue The new public rights of way flag.
   */
  const handleProwChangeEvent = (newValue) => {
    setProw(newValue);
    UpdateSandbox("prow", newValue);
  };

  /**
   * Event to handle when the national cycle route flag is changed.
   *
   * @param {Boolean} newValue The new national cycle route flag.
   */
  const handleNcrChangeEvent = (newValue) => {
    setNcr(newValue);
    UpdateSandbox("ncr", newValue);
  };

  /**
   * Event to handle when the quiet route flag is changed.
   *
   * @param {Boolean} newValue The new quiet route flag.
   */
  const handleQuietRouteChangeEvent = (newValue) => {
    setQuietRoute(newValue);
    UpdateSandbox("quietRoute", newValue);
  };

  /**
   * Event to handle when the obstruction flag is changed.
   *
   * @param {Boolean} newValue The new obstruction flag.
   */
  const handleObstructionChangeEvent = (newValue) => {
    setObstruction(newValue);
    UpdateSandbox("obstruction", newValue);
  };

  /**
   * Event to handle when the planning order flag is changed.
   *
   * @param {Boolean} newValue The new planning order flag.
   */
  const handlePlanningOrderChangeEvent = (newValue) => {
    setPlanningOrder(newValue);
    UpdateSandbox("planningOrder", newValue);
  };

  /**
   * Event to handle when the vehicles prohibited flag is changed.
   *
   * @param {Boolean} newValue The new vehicles prohibited flag.
   */
  const handleVehiclesProhibitedChangeEvent = (newValue) => {
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
      if (onDelete) onDelete(data.hdData.esuId, pkId);
    }
  };

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
          ? sandboxContext.currentSandbox.sourceStreet.esus.find(
              (esu) => esu.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId
            )
            ? sandboxContext.currentSandbox.sourceStreet.esus
                .find((esu) => esu.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId)
                .highwayDedications.find(
                  (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId
                )
            : sandboxContext.currentSandbox.currentStreet.esus.find(
                (esu) => esu.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId
              )
            ? sandboxContext.currentSandbox.currentStreet.esus
                .find((esu) => esu.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId)
                .highwayDedications.find(
                  (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId
                )
            : null
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
    sandboxContext.currentSandbox.currentStreet,
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
    setProwError(null);
    setNcrError(null);
    setQuietRouteError(null);
    setObstructionError(null);
    setPlanningOrderError(null);
    setVehiclesProhibitedError(null);
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

          case "hdprow":
            setProwError(error.errors);
            break;

          case "hdncr":
            setNcrError(error.errors);
            break;

          case "hdquietroute":
            setQuietRouteError(error.errors);
            break;

          case "hdobstruction":
            setObstructionError(error.errors);
            break;

          case "hdplanningorder":
            setPlanningOrderError(error.errors);
            break;

          case "hdvehiclesprohibited":
            setVehiclesProhibitedError(error.errors);
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
        <Grid2 container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
          <Grid2 size={3}>
            <Typography variant="body2" align="left" id="indicator-label" color="textPrimary">
              Indicator
            </Typography>
          </Grid2>
          <Grid2 size={9}>
            <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
              <ADSHDCheckbox
                variant={"PRoW"}
                checked={prow}
                isEditable={userCanEdit}
                isFocused={focusedField ? focusedField === "HdProw" : false}
                loading={loading}
                errorText={prowError}
                onChange={handleProwChangeEvent}
              />
              <ADSHDCheckbox
                variant={"NCR"}
                checked={ncr}
                isEditable={userCanEdit}
                isFocused={focusedField ? focusedField === "HdNcr" : false}
                loading={loading}
                errorText={ncrError}
                onChange={handleNcrChangeEvent}
              />
              <ADSHDCheckbox
                variant={"Quiet route"}
                checked={quietRoute}
                isEditable={userCanEdit}
                isFocused={focusedField ? focusedField === "HdQuietRoute" : false}
                loading={loading}
                errorText={quietRouteError}
                onChange={handleQuietRouteChangeEvent}
              />
              <ADSHDCheckbox
                variant={"Obstruction"}
                checked={obstruction}
                isEditable={userCanEdit}
                isFocused={focusedField ? focusedField === "HdObstruction" : false}
                loading={loading}
                errorText={obstructionError}
                onChange={handleObstructionChangeEvent}
              />
              <ADSHDCheckbox
                variant={"Planning order"}
                checked={planningOrder}
                isEditable={userCanEdit}
                isFocused={focusedField ? focusedField === "HdPlanningOrder" : false}
                loading={loading}
                errorText={planningOrderError}
                onChange={handlePlanningOrderChangeEvent}
              />
              <ADSHDCheckbox
                variant={"Vehicles prohibited"}
                checked={vehiclesProhibited}
                isEditable={userCanEdit}
                isFocused={focusedField ? focusedField === "HdVehiclesProhibited" : false}
                loading={loading}
                errorText={vehiclesProhibitedError}
                onChange={handleVehiclesProhibitedChangeEvent}
              />
            </Grid2>
          </Grid2>
        </Grid2>
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
