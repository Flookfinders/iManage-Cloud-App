//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: One-way exemption data tab
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
//    002   16.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   03.11.23 Sean Flook                 Added hyphen to one-way.
//    005   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings.
//    007   11.01.24 Sean Flook                 Fix warnings.
//    008   25.01.24 Sean Flook                 Changes required after UX review.
//    009   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    010   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    011   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    012   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    013   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    014   21.06.24 Sean Flook       IMANN-636 Fixed warnings.
//    015   27.06.24 Joel Benford     IMANN-685 OWE sequence numbers -> seqNum
//    016   22.07.24 Sean Flook       IMANN-811 Added record end date.
//    017   23.07.24 Sean Flook       IMANN-811 Corrected field names.
//    018   25.07.24 Sean Flook       IMANN-834 Use ConvertDate on recordEndDate in GetCurrentData to ensure the correct date is used.
//    019   26.07.24 Sean Flook       IMANN-856 Correctly handle deleting newly added record.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import { GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import ObjectComparison, { oneWayExemptionKeysToIgnore } from "../utils/ObjectComparison";
import OneWayExemptionType from "../data/OneWayExemptionType";
import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateTimeControl from "../components/ADSDateTimeControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";

OneWayExemptionDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function OneWayExemptionDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [oweType, setOweType] = useState(null);
  const [oweStartDate, setOweStartDate] = useState(null);
  const [oweEndDate, setOweEndDate] = useState(null);
  const [oweStartTime, setOweStartTime] = useState(null);
  const [oweEndTime, setOweEndTime] = useState(null);
  const [periodicity, setPeriodicity] = useState(null);
  const [recordEndDate, setRecordEndDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [oneWayExemptionTypeError, setOneWayExemptionTypeError] = useState(null);
  const [oweStartDateError, setOweStartDateError] = useState(null);
  const [oweEndDateError, setOweEndDateError] = useState(null);
  const [oweStartTimeError, setOweStartTimeError] = useState(null);
  const [oweEndTimeError, setOweEndTimeError] = useState(null);
  const [periodicityError, setPeriodicityError] = useState(null);
  const [recordEndDateError, setRecordEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newOneWayExemptionData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("oneWayExemption", newOneWayExemptionData);
  };

  /**
   * Event to handle when the one-way exemption type is changed.
   *
   * @param {number|null} newValue The new one-way exemption type.
   */
  const handleOneWayExemptionTypeChangeEvent = (newValue) => {
    setOweType(newValue);
    UpdateSandbox("oweType", newValue);
  };

  /**
   * Event to handle when the one-way exemption start date is changed.
   *
   * @param {Date|null} newValue The new one-way exemption start date.
   */
  const handleOweStartDateChangeEvent = (newValue) => {
    setOweStartDate(newValue);
    UpdateSandbox("oweStartDate", newValue);
  };

  /**
   * Event to handle when the one-way exemption end date is changed.
   *
   * @param {Date|null} newValue The new one-way exemption end date.
   */
  const handleOweEndDateChangeEvent = (newValue) => {
    setOweEndDate(newValue);
    UpdateSandbox("oweEndDate", newValue);
  };

  /**
   * Event to handle when the one-way exemption start time is changed.
   *
   * @param {Time|null} newValue The new one-way exemption start time.
   */
  const handleOweStartTimeChangeEvent = (newValue) => {
    setOweStartTime(newValue);
    UpdateSandbox("oweStartTime", newValue);
  };

  /**
   * Event to handle when the one-way exemption end time is changed.
   *
   * @param {Time|null} newValue The new one-way exemption end time.
   */
  const handleOweEndTimeChangeEvent = (newValue) => {
    setOweEndTime(newValue);
    UpdateSandbox("oweEndTime", newValue);
  };

  /**
   * Event to handle when the periodicity is changed.
   *
   * @param {number|null} newValue The new periodicity.
   */
  const handlePeriodicityChangeEvent = (newValue) => {
    setPeriodicity(newValue);
    UpdateSandbox("periodicity", newValue);
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
    const sourceOneWayExemption =
      data.pkId > 0 && contextStreet
        ? contextStreet.esus
            .find((esu) => esu.esuId === data.oweData.esuId)
            .oneWayExemptions.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption
            ? "check"
            : "discard"
          : "discard",
        sourceOneWayExemption,
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.oweData) {
        setOweType(data.oweData.oneWayExemptionType);
        setOweStartDate(data.oweData.oneWayExemptionStartDate);
        setOweEndDate(data.oweData.oneWayExemptionEndDate);
        setOweStartTime(data.oweData.oneWayExemptionStartTime);
        setOweEndTime(data.oweData.oneWayExemptionEndTime);
        setPeriodicity(data.oweData.oneWayExemptionPeriodicityCode);
        setRecordEndDate(data.oweData.recordEndDate);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.oweData, null);
  };

  /**
   * Method to return the current one-way exemption record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current one-way exemption record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.oweData.pkId || data.oweData.pkId < 0 ? "I" : "U",
      oneWayExemptionType: field && field === "oweType" ? newValue : oweType,
      recordEndDate:
        field && field === "recordEndDate"
          ? newValue && ConvertDate(newValue)
          : recordEndDate && ConvertDate(recordEndDate),
      oneWayExemptionStartDate:
        field && field === "oweStartDate"
          ? newValue && ConvertDate(newValue)
          : oweStartDate && ConvertDate(oweStartDate),
      oneWayExemptionEndDate:
        field && field === "oweEndDate" ? newValue && ConvertDate(newValue) : oweEndDate && ConvertDate(oweEndDate),
      oneWayExemptionStartTime: field && field === "oweStartTime" ? newValue : oweStartTime,
      oneWayExemptionEndTime: field && field === "oweEndTime" ? newValue : oweEndTime,
      oneWayExemptionPeriodicityCode: field && field === "periodicity" ? newValue : periodicity,
      pkId: data.oweData.pkId,
      esuId: data.oweData.esuId,
      seqNum: data.oweData.seqNum,
    };
  }

  /**
   * Event to handle when the delete button is clicked.
   */
  const handleDeleteOneWayExemption = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the add button is clicked.
   */
  const handleAddOneWayExemption = () => {
    if (onAdd) onAdd(data.oweData.esuId, data.esuIndex);
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
      if (onDelete) onDelete(data.oweData.esuId, pkId);
    }
  };

  useEffect(() => {
    if (!loading && data && data.oweData) {
      setOweType(data.oweData.oneWayExemptionType);
      setOweStartDate(data.oweData.oneWayExemptionStartDate);
      setOweEndDate(data.oweData.oneWayExemptionEndDate);
      setOweStartTime(data.oweData.oneWayExemptionStartTime);
      setOweEndTime(data.oweData.oneWayExemptionEndTime);
      setPeriodicity(data.oweData.oneWayExemptionPeriodicityCode);
      setRecordEndDate(data.oweData.recordEndDate);
    }
  }, [loading, data]);

  useEffect(() => {
    const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
    if (contextStreet && sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption) {
      const sourceOneWayExemption =
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId > 0 && contextStreet
          ? contextStreet.esus
              .find((esu) => esu.esuId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.esuId)
              .oneWayExemptions.find(
                (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId
              )
          : null;

      if (sourceOneWayExemption) {
        setDataChanged(
          !ObjectComparison(
            sourceOneWayExemption,
            sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption,
            oneWayExemptionKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId < 0) setDataChanged(true);
    }
  }, [
    sandboxContext.currentSandbox.currentStreet,
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editStreet);
  }, [userContext]);

  useEffect(() => {
    setOneWayExemptionTypeError(null);
    setOweStartDateError(null);
    setOweEndDateError(null);
    setOweStartTimeError(null);
    setOweEndTimeError(null);
    setPeriodicityError(null);
    setRecordEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "onewayexemptiontype":
            setOneWayExemptionTypeError(error.errors);
            break;

          case "onewayexemptionstartdate":
            setOweStartDateError(error.errors);
            break;

          case "onewayexemptionenddate":
            setOweEndDateError(error.errors);
            break;

          case "onewayexemptionstarttime":
            setOweStartTimeError(error.errors);
            break;

          case "onewayexemptionendtime":
            setOweEndTimeError(error.errors);
            break;

          case "onewayexemptionperiodicitycode":
            setPeriodicityError(error.errors);
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
              {`| ${data.oweData.esuId}: One-way exemption (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ADSActionButton
              variant="delete"
              disabled={!userCanEdit}
              tooltipTitle="Delete one-way exemption"
              tooltipPlacement="right"
              onClick={handleDeleteOneWayExemption}
            />
            <ADSActionButton
              variant="add"
              disabled={!userCanEdit}
              tooltipTitle="Add new one-way exemption record"
              tooltipPlacement="right"
              onClick={handleAddOneWayExemption}
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("OneWayExemptionDataTab")}>
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "oneWayExemptionType" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={OneWayExemptionType}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          lookupIcon="avatar_icon"
          value={oweType}
          errorText={oneWayExemptionTypeError}
          onChange={handleOneWayExemptionTypeChangeEvent}
          helperText="Type of traffic which is exempt from one-way restrictions."
        />
        <ADSDateTimeControl
          label="Start"
          isEditable={userCanEdit}
          isRequired={(periodicity && periodicity === 15) || !!oweEndDate || !!oweEndTime}
          isDateFocused={focusedField ? focusedField === "OneWayExemptionStartDate" : false}
          isTimeFocused={focusedField ? focusedField === "OneWayExemptionStartTime" : false}
          loading={loading}
          dateValue={oweStartDate}
          timeValue={oweStartTime}
          dateHelperText="Date when the Exemption starts."
          timeHelperText="If the Exemption has a specified time period, time when the Exemption starts."
          dateErrorText={oweStartDateError}
          timeErrorText={oweStartTimeError}
          onDateChange={handleOweStartDateChangeEvent}
          onTimeChange={handleOweStartTimeChangeEvent}
        />
        <ADSDateTimeControl
          label="End"
          isEditable={userCanEdit}
          isRequired={(periodicity && periodicity === 15) || !!oweStartDate || !!oweStartTime}
          isDateFocused={focusedField ? focusedField === "OneWayExemptionEndDate" : false}
          isTimeFocused={focusedField ? focusedField === "OneWayExemptionEndTime" : false}
          loading={loading}
          dateValue={oweEndDate}
          timeValue={oweEndTime}
          dateHelperText="Date when the Exemption ends."
          timeHelperText="If the Exemption has a specified time period, time when the Exemption ends."
          dateErrorText={oweEndDateError}
          timeErrorText={oweEndTimeError}
          onDateChange={handleOweEndDateChangeEvent}
          onTimeChange={handleOweEndTimeChangeEvent}
        />
        <ADSSelectControl
          label="Periodicity"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "OneWayExemptionPeriodicityCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={OneWayExemptionPeriodicity}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          lookupIcon="avatar_icon"
          value={periodicity}
          errorText={periodicityError}
          onChange={handlePeriodicityChangeEvent}
          helperText="Code to identify the periodicity of the restriction."
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
        <ConfirmDeleteDialog variant="owe" open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} />
      </div>
    </Fragment>
  );
}

export default OneWayExemptionDataTab;
