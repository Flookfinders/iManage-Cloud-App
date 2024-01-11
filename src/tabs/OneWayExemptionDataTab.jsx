/* #region header */
/**************************************************************************************************
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
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   16.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   03.11.23 Sean Flook                 Added hyphen to one-way.
//    005   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings.
//    007   11.01.24 Sean Flook                 Fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import { GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import ObjectComparison from "../utils/ObjectComparison";
import OneWayExemptionType from "../data/OneWayExemptionType";
import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateTimeControl from "../components/ADSDateTimeControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataFormStyle } from "../utils/ADSStyles";

OneWayExemptionDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function OneWayExemptionDataTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick, onAdd, onDelete }) {
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

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [oneWayExemptionTypeError, setOneWayExemptionTypeError] = useState(null);
  const [oweStartDateError, setOweStartDateError] = useState(null);
  const [oweEndDateError, setOweEndDateError] = useState(null);
  const [oweStartTimeError, setOweStartTimeError] = useState(null);
  const [oweEndTimeError, setOweEndTimeError] = useState(null);
  const [periodicityError, setPeriodicityError] = useState(null);

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
    if (!dataChanged) {
      setDataChanged(oweType !== newValue);
      if (onDataChanged && oweType !== newValue) onDataChanged();
    }
    UpdateSandbox("oweType", newValue);
  };

  /**
   * Event to handle when the one-way exemption start date is changed.
   *
   * @param {Date|null} newValue The new one-way exemption start date.
   */
  const handleOweStartDateChangeEvent = (newValue) => {
    setOweStartDate(newValue);
    if (!dataChanged) {
      setDataChanged(oweStartDate !== newValue);
      if (onDataChanged && oweStartDate !== newValue) onDataChanged();
    }
    UpdateSandbox("oweType", newValue);
  };

  /**
   * Event to handle when the one-way exemption end date is changed.
   *
   * @param {Date|null} newValue The new one-way exemption end date.
   */
  const handleOweEndDateChangeEvent = (newValue) => {
    setOweEndDate(newValue);
    if (!dataChanged) {
      setDataChanged(oweEndDate !== newValue);
      if (onDataChanged && oweEndDate !== newValue) onDataChanged();
    }
    UpdateSandbox("oweEndDate", newValue);
  };

  /**
   * Event to handle when the one-way exemption start time is changed.
   *
   * @param {Time|null} newValue The new one-way exemption start time.
   */
  const handleOweStartTimeChangeEvent = (newValue) => {
    setOweStartTime(newValue);
    if (!dataChanged) {
      setDataChanged(oweStartTime !== newValue);
      if (onDataChanged && oweStartTime !== newValue) onDataChanged();
    }
    UpdateSandbox("oweStartTime", newValue);
  };

  /**
   * Event to handle when the one-way exemption end time is changed.
   *
   * @param {Time|null} newValue The new one-way exemption end time.
   */
  const handleOweEndTimeChangeEvent = (newValue) => {
    setOweEndTime(newValue);
    if (!dataChanged) {
      setDataChanged(oweEndTime !== newValue);
      if (onDataChanged && oweEndTime !== newValue) onDataChanged();
    }
    UpdateSandbox("oweEndTime", newValue);
  };

  /**
   * Event to handle when the periodicity is changed.
   *
   * @param {number|null} newValue The new periodicity.
   */
  const handlePeriodicityChangeEvent = (newValue) => {
    setPeriodicity(newValue);
    if (!dataChanged) {
      setDataChanged(periodicity !== newValue);
      if (onDataChanged && periodicity !== newValue) onDataChanged();
    }
    UpdateSandbox("periodicity", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceOneWayExemption =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus
            .find((esu) => esu.esuId === data.oweData.esuId)
            .oneWayExemptions.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged
            ? sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption
              ? "check"
              : "discard"
            : "discard",
          sourceOneWayExemption,
          sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      setDataChanged(onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption));
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.oweData) {
        setOweType(data.oweData.oneWayExemptionTypeCode);
        setOweStartDate(data.oweData.oneWayExemptionStartDate);
        setOweEndDate(data.oweData.oneWayExemptionEndDate);
        setOweStartTime(data.oweData.oneWayExemptionStartTime);
        setOweEndTime(data.oweData.oneWayExemptionEndTime);
        setPeriodicity(data.oweData.oneWayExemptionPeriodicityCode);
      }
    }
    setDataChanged(false);
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
      oneWayExemptionTypeCode: field && field === "oweType" ? newValue : oweType,
      recordEndDate: data.oweData.recordEndDate,
      oneWayExemptionStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : oweStartDate && ConvertDate(oweStartDate),
      oneWayExemptionEndDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : oweEndDate && ConvertDate(oweEndDate),
      oneWayExemptionStartTime: field && field === "oweStartTime" ? newValue : oweStartTime,
      oneWayExemptionEndTime: field && field === "oweEndTime" ? newValue : oweEndTime,
      oneWayExemptionPeriodicityCode: field && field === "periodicity" ? newValue : periodicity,
      pkId: data.oweData.pkId,
      esuId: data.oweData.esuId,
      sequenceNumber: data.oweData.sequenceNumber,
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
    if (!dataChanged) setDataChanged(true);
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
      if (onDelete) onDelete(data.oweData.esuId, pkId);
    }
  };

  useEffect(() => {
    if (!loading && data && data.oweData) {
      setOweType(data.oweData.oneWayExemptionTypeCode);
      setOweStartDate(data.oweData.oneWayExemptionStartDate);
      setOweEndDate(data.oweData.oneWayExemptionEndDate);
      setOweStartTime(data.oweData.oneWayExemptionStartTime);
      setOweEndTime(data.oweData.oneWayExemptionEndTime);
      setPeriodicity(data.oweData.oneWayExemptionPeriodicityCode);
    }
  }, [loading, data]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && data && data.oweData) {
      const sourceOneWayExemption =
        data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
          ? sandboxContext.currentSandbox.sourceStreet.esus
              .find((esu) => esu.esuId === data.oweData.esuId)
              .oneWayExemptions.find((x) => x.pkId === data.pkId)
          : null;

      if (sourceOneWayExemption) {
        setDataChanged(
          !ObjectComparison(sourceOneWayExemption, data.oweData, [
            "changeType",
            "recordEntryDate",
            "recordEndDate",
            "lastUpdateDate",
          ])
        );
      } else if (data.oweData.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.sourceStreet, data]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setOneWayExemptionTypeError(null);
    setOweStartDateError(null);
    setOweEndDateError(null);
    setOweStartTimeError(null);
    setOweEndTimeError(null);
    setPeriodicityError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "onewayexemptiontypecode":
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

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "OneWayExemptionTypeCode" : false}
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
          isRequired={(periodicity && periodicity === 15) || oweEndDate || oweEndTime}
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
          isRequired={(periodicity && periodicity === 15) || oweStartDate || oweStartTime}
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
