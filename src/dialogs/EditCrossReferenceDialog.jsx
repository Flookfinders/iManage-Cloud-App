//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Edit Cross Reference Dialog
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001   04.04.23 Sean Flook         WI40669 Initial version.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   05.01.24 Sean Flook                 Use CSS shortcuts.
//    004   11.01.24 Sean Flook                 Fix warnings.
//    005   16.01.24 Sean Flook                 Changes required to fix warnings.
//    006   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    007   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    008   18.06.24 Joshua McCormick IMANN-598 Cross ref max set to 20 if scottish, else default 50
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import { Dialog, DialogActions, DialogContent, Button } from "@mui/material";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import { ValidateCrossReference } from "../utils/WizardValidation";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";

import { adsDarkPink } from "../utils/ADSColours";
import { redButtonStyle, blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditCrossReferenceDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isNew: PropTypes.bool,
  data: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditCrossReferenceDialog.defaultProps = {
  isNew: false,
};

function EditCrossReferenceDialog({ isOpen, isNew, data, onDone, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);

  const [sourceId, setSourceId] = useState(null);
  const [crossReference, setCrossReference] = useState("");
  const [startDate, setStartDate] = useState(null);

  const [haveErrors, setHaveErrors] = useState(false);
  const [sourceIdError, setSourceIdError] = useState(null);
  const [crossReferenceError, setCrossReferenceError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Method to get the updated cross reference data.
   *
   * @returns {object} The current cross reference data.
   */
  const getUpdatedData = () => {
    return {
      id: data.id,
      sourceId: sourceId,
      crossReference: crossReference,
      startDate: startDate,
    };
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    const updatedData = getUpdatedData();
    const crossRefErrors = ValidateCrossReference(
      updatedData,
      lookupContext.currentLookups,
      settingsContext.isScottish
    );

    setSourceIdError(null);
    setCrossReferenceError(null);
    setStartDateError(null);
    setHaveErrors(crossRefErrors.length > 0);

    if (crossRefErrors.length > 0) {
      for (const error of crossRefErrors) {
        switch (error.field.toLowerCase()) {
          case "sourceid":
            setSourceIdError(error.errors);
            break;

          case "crossreference":
            setCrossReferenceError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          default:
            break;
        }
      }
    } else {
      if (onDone) onDone(updatedData);
    }
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the source id changes.
   *
   * @param {string} newValue The new source id.
   */
  const handleSourceIdChangeEvent = (newValue) => {
    setSourceId(newValue);
    setSourceIdError(null);
    setHaveErrors(crossReferenceError || startDateError);
  };

  /**
   * Event to handle when the cross reference changes.
   *
   * @param {string} newValue The new cross reference.
   */
  const handleCrossReferenceChangeEvent = (newValue) => {
    setCrossReference(newValue);
    setCrossReferenceError(null);
    setHaveErrors(sourceIdError || startDateError);
  };

  /**
   * Event to handle when the start date changes.
   *
   * @param {Date} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    setStartDateError(null);
    setHaveErrors(sourceIdError || crossReferenceError);
  };

  useEffect(() => {
    if (data) {
      setSourceId(data.sourceId);
      setCrossReference(data.crossReference ? data.crossReference : "");
      setStartDate(data.startDate);
      setHaveErrors(data.errors && data.errors.length > 0);

      if (data.errors && data.errors.length > 0) {
        setSourceIdError(null);
        setCrossReferenceError(null);
        setStartDateError(null);

        for (const error of data.errors) {
          switch (error.field.toLowerCase()) {
            case "sourceid":
              setSourceIdError(error.errors);
              break;

            case "crossreference":
              setCrossReferenceError(error.errors);
              break;

            case "startdate":
              setStartDateError(error.errors);
              break;

            default:
              break;
          }
        }
      }
    }

    setShowDialog(isOpen);
  }, [data, isOpen]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="edit-template-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <ADSDialogTitle
        title={isNew ? "Add cross reference" : "Edit cross reference"}
        closeTooltip="Cancel"
        onClose={handleCancelClick}
      />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        <ADSSelectControl
          label="Source"
          isEditable
          isRequired
          useRounded
          isCrossRef
          lookupData={lookupContext.currentLookups.appCrossRefs.filter((x) => x.enabled && x.xrefSourceRef !== "BILG")}
          lookupId="pkId"
          lookupLabel="xrefDescription"
          lookupColour={adsDarkPink}
          lookupIcon="avatar_icon"
          value={sourceId}
          errorText={sourceIdError}
          onChange={handleSourceIdChangeEvent}
          helperText="External data-set identity."
        />
        <ADSTextControl
          label="Cross reference"
          isEditable
          isRequired
          value={crossReference}
          id="cross_reference"
          maxLength={!settingsContext.isScottish ? 50 : 20}
          errorText={crossReferenceError}
          helperText="Primary key of corresponding Record in an external data-set."
          onChange={handleCrossReferenceChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable
          isRequired
          value={startDate}
          helperText="Date this change originated."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        <Button
          onClick={handleDoneClick}
          autoFocus
          variant="contained"
          sx={haveErrors ? redButtonStyle : blueButtonStyle}
          startIcon={haveErrors ? <ErrorIcon /> : <DoneIcon />}
        >
          Done
        </Button>
        <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditCrossReferenceDialog;
