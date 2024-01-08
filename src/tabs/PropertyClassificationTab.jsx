//#region header */
/**************************************************************************************************
//
//  Description: Classification Tab
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   18.09.23 Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   30.11.23 Sean Flook                 Bug fixes in GetCurrentData.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings.
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
import OSGClassification from "../data/OSGClassification";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

PropertyClassificationTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function PropertyClassificationTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);

  const [dataChanged, setDataChanged] = useState(false);
  const currentId = useRef(0);

  const [classification, setClassification] = useState(
    data && data.classificationData ? data.classificationData.blpuClass : ""
  );
  const [classScheme, setClassScheme] = useState(
    data && data.classificationData ? data.classificationData.classScheme : null
  );
  const [startDate, setStartDate] = useState(
    data && data.classificationData ? data.classificationData.startDate : null
  );
  const [endDate, setEndDate] = useState(data && data.classificationData ? data.classificationData.endDate : null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [classificationError, setClassificationError] = useState(null);
  const [classSchemeError, setClassSchemeError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newClassification = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("classification", newClassification);
  };

  /**
   * Event to handle when the classification is changed.
   *
   * @param {string|null} newValue The new classification.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    if (!dataChanged) {
      setDataChanged(classification !== newValue);
      if (onDataChanged && classification !== newValue) onDataChanged();
    }
    UpdateSandbox("classification", newValue);
  };

  /**
   * Event to handle when the classification scheme is changed.
   *
   * @param {string|null} newValue The new classification scheme.
   */
  const handleClassificationSchemeChangeEvent = (newValue) => {
    setClassScheme(newValue);
    if (!dataChanged) {
      setDataChanged(classScheme !== newValue);
      if (onDataChanged && classScheme !== newValue) onDataChanged();
    }
    UpdateSandbox("classScheme", newValue);
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
    const sourceClassification =
      data.id > 0 && sandboxContext.currentSandbox.sourceProperty
        ? sandboxContext.currentSandbox.sourceProperty.classifications.find((x) => x.pkId === data.id)
        : null;

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged
            ? sandboxContext.currentSandbox.currentPropertyRecords.classification
              ? "check"
              : "discard"
            : "discard",
          sourceClassification,
          sandboxContext.currentSandbox.currentPropertyRecords.classification
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
      setDataChanged(onHomeClick("save", null, sandboxContext.currentSandbox.currentPropertyRecords.classification));
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.classificationData) {
        setClassification(data.classificationData.provenanceCode);
        setClassScheme(data.classificationData.classScheme);
        setStartDate(data.classificationData.startDate);
        setEndDate(data.classificationData.endDate);
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.classificationData, null);
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
   * Method to get the text for a given classification code.
   *
   * @param {string|null} classification The classification code we want the text for.
   * @returns {string} The text for the given classification code.
   */
  function getClassificationText(classification) {
    const rec = OSGClassification.find((x) => x.id === classification);

    if (rec) return rec.display;
    else return "";
  }

  /**
   * Method to return the current classification record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|Date|null} newValue The value used to update the given field.
   * @returns {object} The current classification record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.classificationData.classKey ? "I" : "U",
      blpuClass: field && field === "classification" ? newValue : classification,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      entryDate: data.classificationData.entryDate,
      pkId: data.classificationData.id,
      lastUpdateDate: data.classificationData.lastUpdateDate,
      classScheme: field && field === "classScheme" ? newValue : classScheme,
      classKey: data.classificationData.classKey,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      uprn: data.classificationData.uprn,
      neverExport: data.classificationData.neverExport,
    };
  }

  useEffect(() => {
    if (data && data.classificationData) {
      setClassification(data.classificationData.blpuClass);
      setClassScheme(data.classificationData.classScheme);
      setStartDate(data.classificationData.startDate);
      setEndDate(data.classificationData.endDate);
    }
  }, [data]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceProperty && data && data.classificationData) {
      const sourceClassification = sandboxContext.currentSandbox.sourceProperty.classifications.find(
        (x) => x.pkId === data.id
      );

      if (sourceClassification) {
        setDataChanged(
          !ObjectComparison(sourceClassification, data.classificationData, [
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
  }, [data, sandboxContext.currentSandbox.sourceProperty]);

  useEffect(() => {
    if (
      data &&
      data.id < 0 &&
      !sandboxContext.currentSandbox.currentPropertyRecords.classification &&
      currentId.current !== data.id
    ) {
      sandboxContext.onSandboxChange("classification", data.classificationData);
      currentId.current = data.id;
    }
  }, [data, sandboxContext, sandboxContext.currentSandbox.currentPropertyRecords.classification]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setClassificationError(null);
    setClassSchemeError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "classification":
            setClassificationError(error.errors);
            break;

          case "classscheme":
            setClassSchemeError(error.errors);
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
              {`| Classification (${data.index + 1} of ${data.totalRecords}): ${getClassificationText(classification)}`}
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
        <ADSSelectControl
          label="Classification"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Classification" : false}
          isClassification
          includeHiddenCode
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={OSGClassification}
          lookupId="id"
          lookupLabel="display"
          lookupColour="colour"
          value={classification}
          errorText={classificationError}
          onChange={handleClassificationChangeEvent}
          helperText="Classification for the BLPU."
        />
        <ADSTextControl
          label="Scheme"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ClassScheme" : false}
          loading={loading}
          value={classScheme}
          id={data.classificationData.pkId}
          maxLength={40}
          errorText={classSchemeError}
          helperText="The classification scheme used for this record."
          onChange={handleClassificationSchemeChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date of start of this classification record."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "EndDate" : false}
          loading={loading}
          value={endDate}
          helperText="Date on which this classification ceased to apply to the property."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSReadOnlyControl label="Classification key" loading={loading} value={data.classificationData.classKey} />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="classification"
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default PropertyClassificationTab;
