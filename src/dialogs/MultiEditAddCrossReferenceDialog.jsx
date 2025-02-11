//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to multi-edit adding cross references
//
//  Copyright:    © 2023 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   23.10.23 Sean Flook        IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    004   05.01.24 Sean Flook                  Use CSS shortcuts.
//    005   11.01.24 Sean Flook                  Fix warnings.
//    006   27.02.24 Sean Flook            MUL15 Changed to use dialogTitleStyle and renderErrors.
//    007   11.03.24 Sean Flook            MUL13 Changed control alignment.
//    008   11.03.24 Sean Flook            MUL11 Reset counts when closing dialog.
//    009   12.03.24 Sean Flook            MUL10 Display errors in a list control.
//    010   27.03.24 Sean Flook                  Added ADSDialogTitle.
//    011   23.05.24 Sean Flook        IMANN-486 Changed seqNo to seqNum.
//    012   18.06.24 Joshua McCormick  IMANN-598 Cross ref max set to 20 if scottish, else default 50
//    013   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    014   08.07.24 Sean Flook        IMANN-715 Increase the failed count if failed to save property.
//    015   09.07.24 Sean Flook        IMANN-731 Corrected Scottish data.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    016   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
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
import { ValidateCrossRefData } from "../utils/PropertyValidation";

import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { adsGreenC, adsRed, adsLightGreyC, adsDarkPink } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MultiEditAddCrossReferenceDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditAddCrossReferenceDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [sourceId, setSourceId] = useState(null);
  const [crossReference, setCrossReference] = useState(null);
  const [startDate, setStartDate] = useState(GetCurrentDate());
  const [endDate, setEndDate] = useState(null);
  const [action, setAction] = useState("add");
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [sourceIdError, setSourceIdError] = useState(null);
  const [crossReferenceError, setCrossReferenceError] = useState(null);
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
   * Event to handle when the source is changed.
   *
   * @param {string|null} newValue The new source.
   */
  const handleSourceIdChangeEvent = (newValue) => {
    setSourceId(newValue);
    setSourceIdError(null);
  };

  /**
   * Event to handle when the cross reference is changed.
   *
   * @param {string|null} newValue The new cross reference.
   */
  const handleCrossReferenceChangeEvent = (newValue) => {
    setCrossReference(newValue);
    setCrossReferenceError(null);
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
      sourceId: sourceId,
      source: null,
      crossReference: crossReference,
      startDate: startDate,
      endDate: endDate,
    };

    const validationErrors = ValidateCrossRefData(
      validationData,
      0,
      lookupContext.currentLookups,
      settingsContext.isScottish
    );

    setSourceIdError(null);
    setCrossReferenceError(null);
    setStartDateError(null);

    if (validationErrors && validationErrors.length > 0) {
      for (const error of validationErrors) {
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

            const minPkIdXRef =
              property.blpuAppCrossRefs && property.blpuAppCrossRefs.length > 0
                ? property.blpuAppCrossRefs.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
                : null;
            const newPkIdXRef =
              !minPkIdXRef || !minPkIdXRef.pkId || minPkIdXRef.pkId > -10 ? -10 : minPkIdXRef.pkId - 1;
            const newXRefRec = {
              pkId: newPkIdXRef,
              changeType: "I",
              xrefKey: null,
              uprn: property && property.uprn,
              startDate: startDate,
              endDate: endDate,
              crossReference: crossReference,
              sourceId: sourceId,
              source: null,
              neverExport: property.neverExport,
            };

            let updatedBlpuAppCrossRefs = property.blpuAppCrossRefs ? property.blpuAppCrossRefs.map((x) => x) : [];

            switch (action) {
              case "add":
                updatedBlpuAppCrossRefs.push(newXRefRec);
                break;

              case "replace":
                if (property.blpuAppCrossRefs)
                  updatedBlpuAppCrossRefs = property.blpuAppCrossRefs.map((x) => {
                    return x.sourceId === sourceId ? { ...x, changeType: "D", endDate: currentDate } : x;
                  });
                updatedBlpuAppCrossRefs.push(newXRefRec);
                break;

              case "leave":
                if (property.blpuAppCrossRefs && !property.blpuAppCrossRefs.find((x) => x.sourceId === sourceId)) {
                  updatedBlpuAppCrossRefs.push(newXRefRec);
                }
                break;

              default:
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

            if (settingsContext.isScottish)
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
                blpuAppCrossRefs: updatedBlpuAppCrossRefs,
                blpuProvenances: property.blpuProvenances,
                blpuNotes: updatedNotes,
                classifications: property.classifications,
                organisations: property.organisations,
                successorCrossRefs: property.successorCrossRefs,
                lpis: property.lpis,
              };
            else
              updatedProperty = {
                changeType: property.changeType,
                blpuStateDate: property.blpuStateDate,
                rpc: property.rpc,
                startDate: property.startDate,
                endDate: property.endDate,
                parentUprn: property.parentUprn,
                neverExport: property.neverExport,
                siteSurvey: property.siteSurvey,
                uprn: property.uprn,
                logicalStatus: property.logicalStatus,
                blpuState: property.blpuState,
                blpuClass: property.blpuClass,
                localCustodianCode: property.localCustodianCode,
                organisation: property.organisation,
                xcoordinate: property.xcoordinate,
                ycoordinate: property.ycoordinate,
                wardCode: property.wardCode,
                parishCode: property.parishCode,
                pkId: property.pkId,
                blpuAppCrossRefs: updatedBlpuAppCrossRefs,
                blpuProvenances: property.blpuProvenances,
                blpuNotes: updatedNotes,
                lpis: property.lpis,
              };

            if (updatedProperty) {
              SaveProperty(updatedProperty, false, userContext, propertyContext, settingsContext.isScottish).then(
                (result) => {
                  if (result) {
                    updatedCount.current++;
                    savedProperty.current.push(result);
                    setRangeProcessedCount(updatedCount.current + failedCount.current);
                  } else {
                    failedCount.current++;
                  }
                }
              );
            } else {
              failedCount.current++;
            }
          }
        }
      }
    } else setUpdating(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("Add cross reference");
      setAction("add");
      setSourceIdError(null);
      setCrossReferenceError(null);
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
      setTitle("Add cross reference: completed");
      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="multi-add-xref-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <ADSDialogTitle title={`${title}`} closeTooltip="Close" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {!completed ? (
          <Fragment>
            <Typography variant="body1" gutterBottom sx={{ ml: theme.spacing(1.25) }}>
              Enter the details for the cross reference to add to the selected properties
            </Typography>
            <Grid2 container justifyContent="center" alignItems="center">
              <Grid2 size={12}>
                <ADSSelectControl
                  label="Source"
                  isEditable
                  useRounded
                  isCrossRef
                  isRequired
                  disabled={updating}
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
              </Grid2>
              <Grid2 size={12}>
                <ADSTextControl
                  label="Cross reference"
                  isEditable
                  isRequired
                  value={crossReference}
                  disabled={updating}
                  id="cross_reference"
                  maxLength={!settingsContext.isScottish ? 50 : 20}
                  errorText={crossReferenceError}
                  helperText="Primary key of corresponding Record in an external data-set."
                  onChange={handleCrossReferenceChangeEvent}
                />
              </Grid2>
              <Grid2 size={12}>
                <ADSDateControl
                  label="Start date"
                  isEditable
                  isRequired
                  disabled={updating}
                  value={startDate}
                  helperText="Date this change originated."
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
                  helperText="The date on which the external cross reference ceased to exist."
                  errorText={endDateError}
                  onChange={handleEndDateChangeEvent}
                />
              </Grid2>
              <Grid2 size={12}>
                <FormControl>
                  <FormLabel id="add-cross-reference-action-radio-buttons-group" sx={{ pt: "4px" }}>
                    <Typography variant="body2" sx={{ ml: "10px" }}>
                      If a property already has a cross reference of the same source?
                    </Typography>
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="add-cross-reference-action-radio-buttons-group"
                    name="cross-reference-action-radio-buttons-group"
                    value={action}
                    onChange={handleActionChangeEvent}
                  >
                    <FormControlLabel
                      value="replace"
                      control={<Radio />}
                      label={<Typography variant="body2">Replace existing</Typography>}
                      sx={{ ml: "135px" }}
                    />
                    <FormControlLabel
                      value="add"
                      control={<Radio />}
                      label={<Typography variant="body2">Keep existing and add new</Typography>}
                      sx={{ ml: "135px" }}
                    />
                    <FormControlLabel
                      value="leave"
                      control={<Radio />}
                      label={<Typography variant="body2">Keep existing (don't add or replace)</Typography>}
                      sx={{ ml: "135px" }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid2>
              {noteOpen && (
                <Grid2 size={12}>
                  <ADSTextControl
                    isEditable
                    disabled={updating}
                    value={note}
                    id="cross_reference_note"
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
                        key="multi-edit-add-cross-reference-errors"
                      >
                        {finaliseErrors.map((rec, index) => (
                          <ListItem
                            alignItems="flex-start"
                            dense
                            divider
                            id={`multi-edit-add-cross-reference-error-${index}`}
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

export default MultiEditAddCrossReferenceDialog;
