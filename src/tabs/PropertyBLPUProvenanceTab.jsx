//#region header */
/**************************************************************************************************
//
//  Description: Property Details Tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook         WI39??? Initial Revision.
//    002   22.03.23 Sean Flook         WI40596 Only allow editing if BLPU logical status is not historic or rejected.
//    003   27.03.23 Sean Flook         WI40627 Prevent useEffect from being run when not required.
//    004   28.03.23 Sean Flook         WI40596 Removed above change.
//    005   26.04.23 Sean Flook         WI40700 Do not set end date when deleting.
//    006   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    007   27.10.23 Sean Flook                 Use new dataFormStyle.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    009   05.01.24 Sean Flook                 Changes to sort out warnings.
//    010   11.01.24 Sean Flook                 Fix warnings.
//    011   16.01.24 Sean Flook                 Changes required to fix warnings.
//    012   09.02.24 Sean Flook                 Added id to box so that ADSSelectionControl can use it.
//    013   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    014   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import PropertyContext from "../context/propertyContext";
import SettingsContext from "../context/settingsContext";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { GetLookupLabel, ConvertDate, filteredLookup } from "../utils/HelperUtils";
import BLPUProvenance from "../data/BLPUProvenance";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataTabToolBar, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

PropertyBLPUProvenanceTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function PropertyBLPUProvenanceTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);

  const currentId = useRef(0);

  const [provenanceLookup, setProvenanceLookup] = useState(filteredLookup(BLPUProvenance, settingsContext.isScottish));

  const [code, setCode] = useState(null);
  const [annotation, setAnnotation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [codeError, setCodeError] = useState(null);
  const [annotationError, setAnnotationError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newProvenance = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("provenance", newProvenance);
  };

  /**
   * Event to handle when the code is changed.
   *
   * @param {string|null} newValue The new code.
   */
  const handleCodeChangeEvent = (newValue) => {
    setCode(newValue);
    if (!propertyContext.provenanceDataChanged) {
      propertyContext.onProvenanceDataChange(code !== newValue);
      if (onDataChanged && code !== newValue) onDataChanged();
    }
    UpdateSandbox("provenanceCode", newValue);
  };

  /**
   * Event to handle when the annotation is changed.
   *
   * @param {string|null} newValue The new annotation.
   */
  const handleAnnotationChangeEvent = (newValue) => {
    setAnnotation(newValue);
    if (!propertyContext.provenanceDataChanged) {
      propertyContext.onProvenanceDataChange(annotation !== newValue);
      if (onDataChanged && annotation !== newValue) onDataChanged();
    }
    UpdateSandbox("annotation", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    if (!propertyContext.provenanceDataChanged) {
      propertyContext.onProvenanceDataChange(startDate !== newValue);
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
    if (!propertyContext.provenanceDataChanged) {
      propertyContext.onProvenanceDataChange(endDate !== newValue);
      if (onDataChanged && endDate !== newValue) onDataChanged();
    }
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceProvenance =
      data.id > 0 && sandboxContext.currentSandbox.sourceProperty
        ? sandboxContext.currentSandbox.sourceProperty.blpuProvenances.find((x) => x.pkId === data.id)
        : null;

    propertyContext.onProvenanceDataChange(
      onHomeClick(
        propertyContext.provenanceDataChanged
          ? sandboxContext.currentSandbox.currentPropertyRecords.provenance
            ? "check"
            : "discard"
          : "discard",
        sourceProvenance,
        sandboxContext.currentSandbox.currentPropertyRecords.provenance
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
    propertyContext.onProvenanceDataChange(
      onHomeClick("save", null, sandboxContext.currentSandbox.currentPropertyRecords.provenance)
    );
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (propertyContext.provenanceDataChanged) {
      if (data && data.provenanceData) {
        setCode(data.provenanceData.provenanceCode);
        setAnnotation(data.provenanceData.annotation ? data.provenanceData.annotation : "");
        setStartDate(data.provenanceData.startDate);
        setEndDate(data.provenanceData.endDate);
      }
    }
    propertyContext.onProvenanceDataChange(false);
    if (onHomeClick) onHomeClick("discard", data.provenanceData, null);
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
   * Method to get the text for a given provenance code.
   *
   * @param {string|null} code The provenance code we want the text for.
   * @returns {string} The text for the given provenance code.
   */
  function getProvenanceText(code) {
    const rec = BLPUProvenance.find((x) => x.id === code);

    if (rec) return rec[GetLookupLabel(settingsContext.isScottish)];
    else return "";
  }

  /**
   * Method to return the current provenance record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|Date|null} newValue The value used to update the given field.
   * @returns {object} The current provenance record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.provenanceData.provenanceKey ? "I" : "U",
      annotation: field && field === "annotation" ? newValue : annotation,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      entryDate: data.provenanceData.entryDate,
      pkId: data.provenanceData.id,
      lastUpdateDate: data.provenanceData.lastUpdateDate,
      provenanceCode: field && field === "provenanceCode" ? newValue : code,
      provenanceKey: data.provenanceData.provenanceKey,
      wktGeometry: data.provenanceData.wktGeometry,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      uprn: data.provenanceData.uprn,
    };
  }

  useEffect(() => {
    if (data && data.provenanceData) {
      setCode(data.provenanceData.provenanceCode);
      setAnnotation(data.provenanceData.annotation ? data.provenanceData.annotation : "");
      setStartDate(data.provenanceData.startDate);
      setEndDate(data.provenanceData.endDate);

      setProvenanceLookup(filteredLookup(BLPUProvenance, settingsContext.isScottish));
    }
  }, [data, settingsContext.isScottish]);

  useEffect(() => {
    if (
      data &&
      data.id < 0 &&
      !sandboxContext.currentSandbox.currentPropertyRecords.provenance &&
      currentId.current !== data.id
    ) {
      sandboxContext.onSandboxChange("provenance", data.provenanceData);
      currentId.current = data.id;
    }
  }, [data, sandboxContext, sandboxContext.currentSandbox.currentPropertyRecords.provenance]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setCodeError(null);
    setAnnotationError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "provenancecode":
            setCodeError(error.errors);
            break;

          case "annotation":
            setAnnotationError(error.errors);
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
      <Box sx={toolbarStyle} id="ads-provenance-data-tab">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
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
              {`| BLPU provenance (${data.index + 1} of ${data.totalRecords}): ${getProvenanceText(code)}`}
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
      <Box sx={dataFormStyle("79.9vh")}>
        <ADSSelectControl
          label="Provenance"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ProvenanceCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={provenanceLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          lookupIcon="avatar_icon"
          value={code}
          errorText={codeError}
          onChange={handleCodeChangeEvent}
          helperText="Identifies the BLPU Provenance Extent derivation."
        />
        <ADSTextControl
          label="Annotation"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "Annotation" : false}
          loading={loading}
          value={annotation}
          id="annotation"
          maxLength={30}
          errorText={annotationError}
          helperText="Supplementary information to support the provenance."
          onChange={handleAnnotationChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date of start of this Provenance Record."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "EndDate" : false}
          loading={loading}
          value={endDate}
          helperText="Date of end of this Provenance Record."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSReadOnlyControl label="Provenance key" loading={loading} value={data.provenanceData.provenanceKey} />
        <ADSOkCancelControl
          okDisabled={!propertyContext.provenanceDataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="provenance"
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default PropertyBLPUProvenanceTab;
