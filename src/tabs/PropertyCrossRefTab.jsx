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
//    003   28.03.23 Sean Flook         WI40596 Removed above change.
//    004   06.04.23 Sean Flook         WI40228 Prevent bilingual cross references from being edited.
//    005   06.10.23 Sean Flook                 Use colour variables.
//    006   27.10.23 Sean Flook                 Use new dataFormStyle.
//    007   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    008   05.01.24 Sean Flook                 Changes to sort out warnings.
//    009   11.01.24 Sean Flook                 Fix warnings.
//    010   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    011   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    012   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    013   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    014   18.03.24 Sean Flook      STRFRM4_OS Set the nullString parameter for the key.
//    015   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    016   09.04.24 Joshua McCormick IMANN-277 Added displayCharactersLeft for inputs that it should be shown for
//    017   29.04.24 Joshua McCormick IMANN-386 Toolbar changes no title nowrapping with width restrictions
//    018   04.06.24 Joel Benford     IMANN-505 Fix enabling OK button
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import SettingsContext from "../context/settingsContext";
import { ConvertDate } from "../utils/HelperUtils";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { adsDarkPink } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

PropertyCrossRefTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function PropertyCrossRefTab({ data, errors, loading, focusedField, onHomeClick, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [dataChanged, setDataChanged] = useState(false);
  const currentId = useRef(0);

  const [sourceId, setSourceId] = useState(null);
  const [crossReference, setCrossReference] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState(null);

  const [sourceIdError, setSourceIdError] = useState(null);
  const [crossReferenceError, setCrossReferenceError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newCrossRef = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("appCrossRef", newCrossRef);
  };

  /**
   * Event to handle when the source id is changed.
   *
   * @param {string|null} newValue The new source id.
   */
  const handleSourceIdChangeEvent = (newValue) => {
    const appXrefBeforehand = sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find(
      (x) => x.pkId === data.xrefData.id
    );
    const fieldBeforehand = appXrefBeforehand && appXrefBeforehand.sourceId;
    setDataChanged(fieldBeforehand !== newValue);
    setSourceId(newValue);
    UpdateSandbox("sourceId", newValue);
  };

  /**
   * Event to handle when the cross reference is changed.
   *
   * @param {string|null} newValue The new cross reference.
   */
  const handleCrossReferenceChangeEvent = (newValue) => {
    const appXrefBeforehand = sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find(
      (x) => x.pkId === data.xrefData.id
    );
    const fieldBeforehand = appXrefBeforehand && appXrefBeforehand.crossReference;
    setDataChanged(fieldBeforehand !== newValue);
    setCrossReference(newValue);
    UpdateSandbox("crossReference", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    const appXrefBeforehand = sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find(
      (x) => x.pkId === data.xrefData.id
    );
    const fieldBeforehand = appXrefBeforehand && appXrefBeforehand.startDate;
    setDataChanged(fieldBeforehand !== ConvertDate(newValue));
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    const appXrefBeforehand = sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find(
      (x) => x.pkId === data.xrefData.id
    );
    const fieldBeforehand = appXrefBeforehand && appXrefBeforehand.endDate;
    setDataChanged(fieldBeforehand !== ConvertDate(newValue));
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceCrossRef =
      data.id > 0 && sandboxContext.currentSandbox.sourceProperty
        ? sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find((x) => x.pkId === data.id)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef
            ? "check"
            : "discard"
          : "discard",
        sourceCrossRef,
        sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef
      );
  };

  /**
   * Event to handle when the delete button is clicked.
   */
  const handleDeleteClick = () => {
    if (settingsContext.isWelsh) {
      const rec = lookupContext.currentLookups.appCrossRefs.find((x) => x.xrefSourceRef === "BILG");

      if (rec && rec.pkId === sourceId) {
        setAssociatedRecords([{ type: "linked lpi", count: 2 }]);
      }
    }
    setOpenDeleteConfirmation(true);
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
      onDelete(id);
    }
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.xrefData) {
        setSourceId(data.xrefData.sourceId);
        setCrossReference(data.xrefData.crossReference ? data.xrefData.crossReference : "");
        setStartDate(data.xrefData.startDate);
        setEndDate(data.xrefData.endDate);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.xrefData, null);
  };

  /**
   * Method to return the current cross reference record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|Date|null} newValue The value used to update the given field.
   * @returns {object} The current provenance record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: !data.xrefData.xrefKey ? "I" : "U",
      crossReference: field && field === "crossReference" ? newValue : crossReference,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      pkId: data.xrefData.id,
      sourceId: field && field === "sourceId" ? newValue : sourceId,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      uprn: data.xrefData.uprn,
      xrefKey: data.xrefData.xrefKey,
    };
  }

  /**
   * Method to get the source text.
   *
   * @param {string} code The source code.
   * @returns {string} The source text.
   */
  function getSourceText(code) {
    const rec = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === code);

    if (rec)
      return rec.xrefDescription.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    else return "";
  }

  useEffect(() => {
    if (!loading && data && data.xrefData) {
      setSourceId(data.xrefData.sourceId);
      setCrossReference(data.xrefData.crossReference ? data.xrefData.crossReference : "");
      setStartDate(data.xrefData.startDate);
      setEndDate(data.xrefData.endDate);
    }
  }, [loading, data]);

  useEffect(() => {
    if (
      data &&
      data.id < 0 &&
      !sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef &&
      currentId.current !== data.id
    ) {
      sandboxContext.onSandboxChange("appCrossRef", data.xrefData);
      currentId.current = data.id;
    }
  }, [data, sandboxContext, sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef]);

  useEffect(() => {
    const rec = lookupContext.currentLookups.appCrossRefs.find((x) => x.xrefSourceRef === "BILG");
    const bilingualCrossRef = rec && rec.pkId === data.xrefData.sourceId;
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit && !bilingualCrossRef);
  }, [userContext, data, lookupContext.currentLookups.appCrossRefs]);

  useEffect(() => {
    setSourceIdError(null);
    setCrossReferenceError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "source":
          case "sourceid":
            setSourceIdError(error.errors);
            break;

          case "crossreference":
            setCrossReferenceError(error.errors);
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: theme.spacing(0.25) }}>
          <Typography variant="subtitle1">
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
          </Typography>
          <Typography
            sx={{
              flexGrow: 1,
              fontSize: "14px",
              display: "none",
              pl: "6px",
              pt: "2px",
              [theme.breakpoints.up("sm")]: {
                display: "block",
              },
            }}
            variant="subtitle1"
            noWrap
            align="left"
          >
            <Typography display="inline" variant="subtitle1">
              {`| Cross ref (${data.index + 1} of ${data.totalRecords}): ${getSourceText(sourceId)}`}
            </Typography>
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
      </Box>
      <Box sx={dataFormStyle("PropertyCrossRefTab")}>
        <ADSSelectControl
          label="Source"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Source" || focusedField === "SourceId" : false}
          loading={loading}
          useRounded
          isCrossRef
          lookupData={lookupContext.currentLookups.appCrossRefs.filter((x) => x.enabled)}
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
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "CrossReference" : false}
          loading={loading}
          value={crossReference}
          id="cross_reference"
          maxLength={50}
          displayCharactersLeft
          errorText={crossReferenceError}
          helperText="Primary key of corresponding Record in an external data-set."
          onChange={handleCrossReferenceChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date this change originated."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "EndDate" : false}
          loading={loading}
          value={endDate}
          helperText="The date on which the external cross reference ceased to exist."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSReadOnlyControl
          label="Cross reference key"
          loading={loading}
          value={data.xrefData.xrefKey}
          nullString="Key set on save"
        />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="app cross ref"
          open={openDeleteConfirmation}
          associatedRecords={associatedRecords}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default PropertyCrossRefTab;
