//#region header */
/**************************************************************************************************
//
//  Description: Successor cross reference Tab
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   19.09.23 Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ConvertDate } from "../utils/HelperUtils";
import ObjectComparison from "./../utils/ObjectComparison";
import ADSActionButton from "../components/ADSActionButton";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

SuccessorTab.propTypes = {
  data: PropTypes.object,
  variant: PropTypes.oneOf(["property", "street"]).isRequired,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function SuccessorTab({ data, variant, errors, loading, focusedField, onDataChanged, onHomeClick, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);

  const [dataChanged, setDataChanged] = useState(false);
  const currentId = useRef(0);

  const [successor, setSuccessor] = useState(
    data && data.successorCrossRefData ? data.successorCrossRefData.successor : null
  );
  const [predecessor, setPredecessor] = useState(
    data && data.successorCrossRefData ? data.successorCrossRefData.predecessor : null
  );
  const [startDate, setStartDate] = useState(
    data && data.successorCrossRefData ? data.successorCrossRefData.startDate : null
  );
  const [endDate, setEndDate] = useState(
    data && data.successorCrossRefData ? data.successorCrossRefData.endDate : null
  );

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [successorError, setSuccessorError] = useState(null);
  const [predecessorError, setPredecessorError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newSuccessorCrossRef = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("successorCrossRef", newSuccessorCrossRef);
  };

  /**
   * Event to handle when the successor is changed.
   *
   * @param {string|null} newValue The new successor.
   */
  const handleSuccessorChangeEvent = (newValue) => {
    setSuccessor(newValue);
    if (!dataChanged) {
      setDataChanged(successor !== newValue);
      if (onDataChanged && successor !== newValue) onDataChanged();
    }
    UpdateSandbox("successor", newValue);
  };

  /**
   * Event to handle when the predecessor is changed.
   *
   * @param {string|null} newValue The new predecessor.
   */
  const handlePredecessorChangeEvent = (newValue) => {
    setPredecessor(newValue);
    if (!dataChanged) {
      setDataChanged(predecessor !== newValue);
      if (onDataChanged && predecessor !== newValue) onDataChanged();
    }
    UpdateSandbox("predecessor", newValue);
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
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    let sourceSuccessorCrossRef = null;
    let currentSuccessorCrossRefRecords = null;

    if (variant === "property") {
      sourceSuccessorCrossRef =
        data.id > 0 && sandboxContext.currentSandbox.sourceProperty
          ? sandboxContext.currentSandbox.sourceProperty.successorCrossRefs.find((x) => x.pkId === data.id)
          : null;
      currentSuccessorCrossRefRecords = sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef;
    } else {
      sourceSuccessorCrossRef =
        data.id > 0 && sandboxContext.currentSandbox.sourceStreet
          ? sandboxContext.currentSandbox.sourceStreet.successorCrossRefs.find((x) => x.pkId === data.id)
          : null;
      currentSuccessorCrossRefRecords = sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef;
    }

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged ? (currentSuccessorCrossRefRecords ? "check" : "discard") : "discard",
          sourceSuccessorCrossRef,
          currentSuccessorCrossRefRecords
        )
      );
  };

  /**
   * Event to handle when the user selects to delete the provenance.
   */
  const handleDeleteClick = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          "save",
          null,
          variant === "property"
            ? sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef
            : sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef
        )
      );
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.successorCrossRefData) {
        setSuccessor(data.successorCrossRefData.successor);
        setPredecessor(data.successorCrossRefData.predecessor);
        setStartDate(data.successorCrossRefData.startDate);
        setEndDate(data.successorCrossRefData.endDate);
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.successorCrossRefData, null);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const id = data && data.id ? data.id : -1;

    if (deleteConfirmed && id && id > 0) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(id);
    }
  };

  /**
   * Method to return the current successor cross reference record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|Date|null} newValue The value used to update the given field.
   * @returns {object} The current successor cross reference record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.successorCrossRefData.succKey ? "I" : "U",
      successor: field && field === "successor" ? newValue : successor,
      successorType: data.successorCrossRefData.successorType,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      entryDate: data.successorCrossRefData.entryDate,
      pkId: data.successorCrossRefData.id,
      lastUpdateDate: data.successorCrossRefData.lastUpdateDate,
      predecessor: field && field === "predecessor" ? newValue : predecessor,
      succKey: data.successorCrossRefData.succKey,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
    };
  }

  useEffect(() => {
    if (data && data.successorCrossRefData) {
      setSuccessor(data.successorCrossRefData.successor);
      setPredecessor(data.successorCrossRefData.predecessor);
      setStartDate(data.successorCrossRefData.startDate);
      setEndDate(data.successorCrossRefData.endDate);
    }
  }, [data]);

  useEffect(() => {
    const sourceObject =
      variant === "property"
        ? sandboxContext.currentSandbox.sourceProperty
        : sandboxContext.currentSandbox.sourceStreet;
    if (sourceObject && data && data.successorCrossRefData) {
      const sourceSuccessorCrossRef = sourceObject.successorCrossRefs.find((x) => x.pkId === data.id);

      if (sourceSuccessorCrossRef) {
        setDataChanged(
          !ObjectComparison(sourceSuccessorCrossRef, data.successorCrossRefData, [
            "changeType",
            "entryDate",
            "pkId",
            "id",
            "lastUpdateDate",
            "neverExport",
          ])
        );
      } else if (data.id < 0) setDataChanged(true);
    }
  }, [data, variant, sandboxContext.currentSandbox.sourceProperty, sandboxContext.currentSandbox.sourceStreet]);

  useEffect(() => {
    if (
      variant === "property" &&
      data &&
      data.id < 0 &&
      !sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef &&
      currentId.current !== data.id
    ) {
      sandboxContext.onSandboxChange("successorCrossRef", data.successorCrossRefData);
      currentId.current = data.id;
    }
  }, [variant, data, sandboxContext, sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef]);

  useEffect(() => {
    if (
      variant === "street" &&
      data &&
      data.id < 0 &&
      !sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef &&
      currentId.current !== data.id
    ) {
      sandboxContext.onSandboxChange("successorCrossRef", data.successorCrossRefData);
      currentId.current = data.id;
    }
  }, [variant, data, sandboxContext, sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setSuccessorError(null);
    setPredecessorError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "successor":
            setSuccessorError(error.errors);
            break;

          case "predecessor":
            setPredecessorError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "enddate":
            setEndDateError(error.errors);
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
          <Stack direction="row" spacing={0.5} justifyContent="flex-start" alignItems="center">
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
              {`| Successor cross reference (${data.index + 1} of ${data.totalRecords}): ${successor}`}
            </Typography>
            {errors && errors.length > 0 && <ErrorIcon sx={errorIconStyle} />}
          </Stack>
          <ADSActionButton
            variant="delete"
            disabled={!userCanEdit}
            tooltipTitle="Delete"
            tooltipPlacement="right"
            onClick={handleDeleteClick}
          />
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSNumberControl
          label="Successor"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Successor" : false}
          loading={loading}
          value={successor}
          errorText={successorError}
          helperText={variant === "property" ? "UPRN of successor BLPU." : "USRN of successor street."}
          onChange={handleSuccessorChangeEvent}
        />
        <ADSNumberControl
          label="Predecessor"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Predecessor" : false}
          loading={loading}
          value={predecessor}
          errorText={predecessorError}
          helperText={`Unique identifier (${variant === "property" ? "UPRN" : "USRN"}) for the predecessor.`}
          onChange={handlePredecessorChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date this successor cross reference originated."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "EndDate" : false}
          loading={loading}
          value={endDate}
          helperText="Date on which this successor cross reference ceased to exist or became a rejected record."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSReadOnlyControl label="successor key" loading={loading} value={data.successorCrossRefData.succKey} />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant={`${variant}Successor`}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default SuccessorTab;
