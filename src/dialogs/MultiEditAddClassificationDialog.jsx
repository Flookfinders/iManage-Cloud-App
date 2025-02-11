//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to multi-edit add classification for OneScotland authorities
//
//  Copyright:    © 2023 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   26.10.23 Sean Flook        IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   30.11.23 Sean Flook                  Use a constant for the default classification scheme.
//    004   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    005   05.01.24 Sean Flook                  Use CSS shortcuts.
//    006   11.01.24 Sean Flook                  Fix warnings.
//    007   16.01.24 Sean Flook                  Changes required to fix warnings.
//    008   27.02.24 Sean Flook            MUL15 Changed to use dialogTitleStyle and renderErrors.
//    009   11.03.24 Sean Flook            MUL13 Changed control alignment.
//    010   11.03.24 Sean Flook            MUL11 Reset counts when closing dialog.
//    011   12.03.24 Sean Flook            MUL10 Display errors in a list control.
//    012   27.03.24 Sean Flook                  Added ADSDialogTitle.
//    013   23.05.24 Sean Flook        IMANN-486 Changed seqNo to seqNum.
//    014   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    015   08.07.24 Sean Flook        IMANN-714 Corrected field name.
//    016   08.07.24 Sean Flook        IMANN-715 Increase the failed count if failed to save property.
//    017   22.08.24 Sean Flook        IMANN-946 Only display the Keep option when end date is set.
//    018   28.08.24 Sean Flook        IMANN-959 When we have an end date set only display the keep option.
//    019   10.09.24 Sean Flook        IMANN-979 When updating existing do not add a new record.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    020   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import PropertyContext from "../context/propertyContext";
import SettingsContext from "../context/settingsContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Button,
  Grid2,
  Backdrop,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  List,
  ListItem,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import { GetCurrentDate, renderErrorListItem } from "../utils/HelperUtils";
import { GetPropertyMapData, SaveProperty, addressToTitleCase } from "../utils/PropertyUtils";
import { ValidateClassificationData } from "../utils/PropertyValidation";

import OSGClassification, { OSGScheme } from "../data/OSGClassification";

import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { adsGreenC, adsRed, adsLightGreyC } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MultiEditAddClassificationDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditAddClassificationDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [classification, setClassification] = useState(null);
  const [startDate, setStartDate] = useState(GetCurrentDate());
  const [endDate, setEndDate] = useState(null);
  const [action, setAction] = useState("add");
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [classificationError, setClassificationError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  const [title, setTitle] = useState("Add cross reference");

  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finaliseErrors, setFinaliseErrors] = useState([]);
  const [haveErrors, setHaveErrors] = useState(false);
  const [rangeProcessedCount, setRangeProcessedCount] = useState(0);

  const properties = useRef(null);
  const savedProperty = useRef(null);
  const updateErrors = useRef([]);
  const totalUpdateCount = useRef(0);
  const updatedCount = useRef(0);
  const failedCount = useRef(0);
  const failedIds = useRef([]);

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
   * Event to handle when the confirm button is clicked.
   */
  const handleConfirmClick = () => {
    if (!haveErrors) updateProperties();
  };

  /**
   * Event to handle when the close button is clicked.
   */
  const handleCloseClick = () => {
    if (onClose) onClose(savedProperty.current);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose(null);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the add to list button is clicked.
   */
  const handleAddToListClick = () => {
    if (finaliseErrors && finaliseErrors.length > 0) {
    }
  };

  /**
   * Event to handle when the add note button is clicked.
   */
  const handleAddNoteClick = () => {
    setNoteOpen(true);
  };

  /**
   * Event to handle when the classification is changed.
   *
   * @param {string|null} newValue The new classification.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    setClassificationError(null);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    setStartDateError(null);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    setEndDateError(null);
    if (newValue) setAction("keep");
    else setAction("add");
  };

  /**
   * Event to handle when the action is changed.
   *
   * @param {object|null} event The new action.
   */
  const handleActionChangeEvent = (event) => {
    setAction(event.target.value);
  };

  /**
   * Event to handle when the note changes.
   *
   * @param {object} event The event object.
   */
  const handleNoteChangeEvent = (newValue) => {
    setNote(newValue);
  };

  /**
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    const validationData = {
      blpuClass: classification,
      classificationScheme: OSGScheme,
      startDate: startDate,
      endDate: endDate,
    };

    const validationErrors = ValidateClassificationData(validationData, 0, lookupContext.currentLookups);

    setClassificationError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (validationErrors && validationErrors.length > 0) {
      for (const error of validationErrors) {
        switch (error.field.toLowerCase()) {
          case "blpuclass":
            setClassificationError(error.errors);
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

      return false;
    } else return true;
  };

  /**
   * Method to update the selected properties.
   */
  const updateProperties = async () => {
    savedProperty.current = null;
    setUpdating(true);

    if (dataValid()) {
      if (propertyUprns && propertyUprns.length > 0) {
        properties.current = [];
        savedProperty.current = [];
        totalUpdateCount.current = propertyUprns.length;
        updatedCount.current = 0;
        failedCount.current = 0;
        failedIds.current = [];
        setHaveErrors(false);
        updateErrors.current = [];
        setFinaliseErrors([]);

        const currentDate = GetCurrentDate();

        for (const propertyUprn of propertyUprns) {
          const property = await GetPropertyMapData(propertyUprn, userContext);

          if (property) {
            let updatedProperty = null;

            const engLpi = property.lpis.filter((x) => x.language === "ENG");
            if (engLpi && engLpi.length > 0) {
              properties.current.push({
                id: property.pkId,
                uprn: property.uprn,
                address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
              });
            }

            const minPkIdClass =
              property.classifications && property.classifications.length > 0
                ? property.classifications.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
                : null;
            const newPkIdClass =
              !minPkIdClass || !minPkIdClass.pkId || minPkIdClass.pkId > -10 ? -10 : minPkIdClass.pkId - 1;
            const newClassificationRec = {
              pkId: newPkIdClass,
              classKey: null,
              changeType: "I",
              uprn: property && property.uprn,
              classificationScheme: OSGScheme,
              blpuClass: classification,
              startDate: startDate,
              endDate: endDate,
              neverExport: property.neverExport,
            };

            let updatedClassifications = property.classifications ? property.classifications.map((x) => x) : [];
            let openClassification = property.classifications ? property.classifications.filter((x) => !x.endDate) : [];
            let haveReplaceError = false;

            switch (action) {
              case "keep":
                updatedClassifications.push(newClassificationRec);
                break;

              case "delete":
                if (!property.classifications || property.classifications.length === 0)
                  updatedClassifications.push(newClassificationRec);
                else if (property.classifications && property.classifications.length === 1) {
                  updatedClassifications = property.classifications.map((x) => {
                    return { ...x, changeType: "D", endDate: currentDate };
                  });
                  updatedClassifications.push(newClassificationRec);
                } else if (openClassification && openClassification.length === 1) {
                  openClassification = openClassification.map((x) => {
                    return { ...x, changeType: "D", endDate: currentDate };
                  });
                  updatedClassifications = property.classifications.map(
                    (x) => openClassification.find((rec) => rec.pkId === x.pkId) || x
                  );
                  updatedClassifications.push(newClassificationRec);
                } else if (
                  property.classifications &&
                  property.classifications.length > 1 &&
                  openClassification &&
                  openClassification.length > 1
                ) {
                  haveReplaceError = true;
                  setClassificationError([
                    "Delete can only be used when there is only 1 previous open classification.",
                  ]);
                }
                break;

              case "historicise":
                if (!property.classifications || property.classifications.length === 0)
                  updatedClassifications.push(newClassificationRec);
                else if (property.classifications && property.classifications.length === 1) {
                  updatedClassifications = property.classifications.map((x) => {
                    return { ...x, changeType: "U", endDate: currentDate };
                  });
                  updatedClassifications.push(newClassificationRec);
                } else if (openClassification && openClassification.length === 1) {
                  openClassification = openClassification.map((x) => {
                    return { ...x, changeType: "U", endDate: currentDate };
                  });
                  updatedClassifications = property.classifications.map(
                    (x) => openClassification.find((rec) => rec.pkId === x.pkId) || x
                  );
                  updatedClassifications.push(newClassificationRec);
                } else if (
                  property.classifications &&
                  property.classifications.length > 1 &&
                  openClassification &&
                  openClassification.length > 1
                ) {
                  haveReplaceError = true;
                  setClassificationError([
                    "Historicise can only be used when there is only 1 previous open classification.",
                  ]);
                }
                break;

              case "update":
                if (!property.classifications || property.classifications.length === 0)
                  updatedClassifications.push(newClassificationRec);
                else if (property.classifications && property.classifications.length === 1) {
                  updatedClassifications = [
                    {
                      pkId: property.classifications[0].pkId,
                      classKey: property.classifications[0].classKey,
                      changeType: "U",
                      uprn: property && property.uprn,
                      classificationScheme: property.classifications[0].classificationScheme,
                      blpuClass: classification,
                      startDate: startDate,
                      endDate: endDate,
                      neverExport: property.neverExport,
                    },
                  ];
                } else if (openClassification && openClassification.length === 1) {
                  openClassification = [
                    {
                      pkId: openClassification[0].pkId,
                      classKey: openClassification[0].classKey,
                      changeType: "U",
                      uprn: property && property.uprn,
                      classificationScheme: openClassification[0].classificationScheme,
                      blpuClass: classification,
                      startDate: startDate,
                      endDate: endDate,
                      neverExport: property.neverExport,
                    },
                  ];
                  updatedClassifications = property.classifications.map(
                    (x) => openClassification.find((rec) => rec.pkId === x.pkId) || x
                  );
                } else if (
                  property.classifications &&
                  property.classifications.length > 1 &&
                  openClassification &&
                  openClassification.length > 1
                ) {
                  haveReplaceError = true;
                  setClassificationError([
                    "Update can only be used when there is only 1 previous open classification.",
                  ]);
                }
                break;

              default:
                if (openClassification && openClassification.length > 0) {
                  haveReplaceError = true;
                  setClassificationError(["Select what should be done with the existing classification."]);
                }
                break;
            }

            const minPkIdNote =
              property.blpuNotes && property.blpuNotes.length > 0
                ? property.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
                : null;
            const newPkIdNote =
              !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
            const maxSeqNumNote =
              property.blpuNotes && property.blpuNotes.length > 0
                ? property.blpuNotes.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
                : null;
            const newSeqNumNote = maxSeqNumNote && maxSeqNumNote.seqNum ? maxSeqNumNote.seqNum + 1 : 1;

            const updatedNotes = property.blpuNotes ? [...property.blpuNotes] : [];
            if (noteOpen)
              updatedNotes.push({
                uprn: property.uprn,
                note: note,
                changeType: "I",
                pkId: newPkIdNote,
                seqNum: newSeqNumNote,
              });

            updatedProperty = {
              blpuStateDate: property.blpuStateDate,
              parentUprn: property.parentUprn,
              neverExport: property.neverExport,
              siteSurvey: property.siteSurvey,
              uprn: property.uprn,
              logicalStatus: property.logicalStatus,
              endDate: property.endDate,
              startDate: property.startDate,
              blpuState: property.blpuState,
              custodianCode: property.custodianCode,
              level: property.level,
              xcoordinate: property.xcoordinate,
              ycoordinate: property.ycoordinate,
              pkId: property.pkId,
              changeType: property.changeType,
              rpc: property.rpc,
              blpuAppCrossRefs: property.blpuAppCrossRefs,
              blpuProvenances: property.blpuProvenances,
              blpuNotes: property.blpuNotes,
              classifications: updatedClassifications,
              organisations: property.organisations,
              successorCrossRefs: property.successorCrossRefs,
              lpis: property.lpis,
            };

            if (updatedProperty && !haveReplaceError) {
              SaveProperty(updatedProperty, false, userContext, propertyContext, settingsContext.isScottish).then(
                (result) => {
                  if (result) {
                    updatedCount.current++;
                    savedProperty.current.push(result);
                    setRangeProcessedCount(updatedCount.current + failedCount.current);
                  } else {
                    failedCount.current++;
                    setRangeProcessedCount(updatedCount.current + failedCount.current);
                  }
                }
              );
            } else {
              setUpdating(false);
            }
          }
        }
      }
    } else setUpdating(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("Add classification");
      setAction("add");
      setClassificationError(null);
      setStartDateError(null);
      setEndDateError(null);
      setHaveErrors(false);
      setNoteOpen(false);
      setCompleted(false);
      setUpdating(false);
    } else {
      failedCount.current = 0;
      updatedCount.current = 0;
      totalUpdateCount.current = 0;
      setRangeProcessedCount(0);
    }

    setShowDialog(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const getErrorList = (currentErrors) => {
      const errorList = [];

      if (currentErrors.blpu && currentErrors.blpu.length > 0) {
        for (const error of currentErrors.blpu) {
          const errorStr = `BLPU [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.lpi && currentErrors.lpi.length > 0) {
        for (const error of currentErrors.lpi) {
          const errorStr = `LPI [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.provenance && currentErrors.provenance.length > 0) {
        for (const error of currentErrors.provenance) {
          const errorStr = `Provenance [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.crossRef && currentErrors.crossRef.length > 0) {
        for (const error of currentErrors.crossRef) {
          const errorStr = `Cross reference [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.classification && currentErrors.classification.length > 0) {
        for (const error of currentErrors.classification) {
          const errorStr = `Classification [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.organisation && currentErrors.organisation.length > 0) {
        for (const error of currentErrors.organisation) {
          const errorStr = `Organisation [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.successorCrossRef && currentErrors.successorCrossRef.length > 0) {
        for (const error of currentErrors.successorCrossRef) {
          const errorStr = `Successor cross reference [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.note && currentErrors.note.length > 0) {
        for (const error of currentErrors.note) {
          const errorStr = `Note [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      return errorList.join("\n");
    };

    if (
      propertyContext.currentPropertyHasErrors &&
      propertyContext.currentErrors &&
      propertyContext.currentErrors.pkId
    ) {
      if (!failedIds.current.includes(propertyContext.currentErrors.pkId)) {
        failedIds.current = [...failedIds.current, propertyContext.currentErrors.pkId];

        const failedAddress = properties.current
          ? properties.current.find((x) => x.id === propertyContext.currentErrors.pkId)
          : null;

        if (failedAddress) {
          if (updateErrors.current)
            updateErrors.current = [
              ...updateErrors.current,
              {
                id: propertyContext.currentErrors.pkId,
                uprn: failedAddress.uprn,
                address: failedAddress.address,
                errors: getErrorList(propertyContext.currentErrors),
              },
            ];
          else
            updateErrors.current = [
              {
                id: propertyContext.currentErrors.pkId,
                uprn: failedAddress.uprn,
                address: failedAddress.address,
                errors: getErrorList(propertyContext.currentErrors),
              },
            ];
          if (Array.isArray(updateErrors.current)) setFinaliseErrors(updateErrors.current);
          else setFinaliseErrors([updateErrors.current]);
        }

        failedCount.current++;
        setRangeProcessedCount(updatedCount.current + failedCount.current);
      }
    }
  }, [propertyContext.currentErrors, propertyContext.currentPropertyHasErrors]);

  useEffect(() => {
    if (totalUpdateCount.current > 0 && totalUpdateCount.current === updatedCount.current + failedCount.current) {
      setTitle("Add classification: completed");
      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="multi-add-classification-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <ADSDialogTitle title={`${title}`} closeTooltip="Close" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {!completed ? (
          <Fragment>
            <Typography variant="body1" gutterBottom sx={{ ml: theme.spacing(1.25) }}>
              Enter the details for the classification to add to the selected properties
            </Typography>
            <Grid2 container justifyContent="center" alignItems="center">
              <Grid2 size={12}>
                <ADSSelectControl
                  label="Classification"
                  isEditable
                  isRequired
                  isClassification
                  includeHiddenCode
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
              </Grid2>
              <Grid2 size={12}>
                <ADSDateControl
                  label="Start date"
                  isEditable
                  isRequired
                  disabled={updating}
                  value={startDate}
                  helperText="Date of start of this classification record."
                  errorText={startDateError}
                  onChange={handleStartDateChangeEvent}
                />
              </Grid2>
              <Grid2 size={12}>
                <ADSDateControl
                  label="End date"
                  isEditable
                  disabled={updating}
                  value={endDate}
                  helperText="Date on which this classification ceased to apply to the property."
                  errorText={endDateError}
                  onChange={handleEndDateChangeEvent}
                />
              </Grid2>
              <Grid2 size={12}>
                <FormControl>
                  <FormLabel id="add-cross-reference-action-radio-buttons-group" sx={{ pt: "4px" }}>
                    <Typography variant="body2" sx={{ ml: "10px" }}>
                      If a property already has a classification?
                    </Typography>
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="add-cross-reference-action-radio-buttons-group"
                    name="cross-reference-action-radio-buttons-group"
                    value={action}
                    onChange={handleActionChangeEvent}
                  >
                    {endDate && (
                      <FormControlLabel
                        value="keep"
                        control={<Radio />}
                        label={<Typography variant="body2">Keep existing and add new</Typography>}
                        sx={{ ml: "135px" }}
                      />
                    )}
                    {!endDate && (
                      <FormControlLabel
                        value="delete"
                        control={<Radio />}
                        label={<Typography variant="body2">Delete existing and add new</Typography>}
                        sx={{ ml: "135px" }}
                      />
                    )}
                    {!endDate && (
                      <FormControlLabel
                        value="historicise"
                        control={<Radio />}
                        label={<Typography variant="body2">Historicise existing and add new</Typography>}
                        sx={{ ml: "135px" }}
                      />
                    )}
                    {!endDate && (
                      <FormControlLabel
                        value="update"
                        control={<Radio />}
                        label={<Typography variant="body2">Update existing</Typography>}
                        sx={{ ml: "135px" }}
                      />
                    )}
                  </RadioGroup>
                </FormControl>
              </Grid2>
              {noteOpen && (
                <Grid2 size={12}>
                  <ADSTextControl
                    isEditable
                    disabled={updating}
                    value={note}
                    id="classification_note"
                    maxLength={4000}
                    minLines={2}
                    maxLines={10}
                    onChange={handleNoteChangeEvent}
                  />
                </Grid2>
              )}
            </Grid2>
          </Fragment>
        ) : (
          <Fragment>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={1}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsGreenC }}>
                  {updatedCount.current}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  properties were successfully updated
                </Typography>
              </Stack>
              {failedCount.current > 0 && (
                <Stack direction="column" spacing={1}>
                  <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={1}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsRed }}>
                      {failedCount.current}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      properties were not updated:
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: "197px",
                      border: `1px solid ${adsLightGreyC}`,
                      overflowY: "auto",
                    }}
                  >
                    {finaliseErrors && finaliseErrors.length > 0 && (
                      <List
                        sx={{ width: "100%", pt: "0px", pb: "0px" }}
                        component="nav"
                        key="multi-edit-add-classification-errors"
                      >
                        {finaliseErrors.map((rec, index) => (
                          <ListItem
                            alignItems="flex-start"
                            dense
                            divider
                            id={`multi-edit-add-classification-error-${index}`}
                          >
                            {renderErrorListItem(rec)}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      onClick={handleAddToListClick}
                      autoFocus
                      variant="contained"
                      sx={{ ...whiteButtonStyle, width: "135px" }}
                      startIcon={<PlaylistAddIcon />}
                    >
                      Add to list
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </Fragment>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", ml: theme.spacing(3), mb: theme.spacing(2) }}>
        {!completed ? (
          <Stack direction="column" spacing={3}>
            {!noteOpen && (
              <Button
                onClick={handleAddNoteClick}
                autoFocus
                disabled={updating}
                variant="contained"
                sx={whiteButtonStyle}
                startIcon={<NoteAddIcon />}
              >
                Add note
              </Button>
            )}
            <Button
              onClick={handleConfirmClick}
              autoFocus
              disabled={updating}
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<DoneIcon />}
            >
              Confirm
            </Button>
          </Stack>
        ) : (
          <Button
            onClick={handleCloseClick}
            autoFocus
            variant="contained"
            sx={blueButtonStyle}
            startIcon={<DoneIcon />}
          >
            Close
          </Button>
        )}
      </DialogActions>
      {updating && (
        <Backdrop open={updating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Dialog>
  );
}

export default MultiEditAddClassificationDialog;
