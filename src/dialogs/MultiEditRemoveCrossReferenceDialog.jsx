//region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to multi-edit removing cross references
//
//  Copyright:    © 2023 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   24.10.23 Sean Flook        IMANN-175 Initial Revision.
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
//    012   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    013   09.07.24 Sean Flook        IMANN-731 Corrected Scottish data.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    014   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header */

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
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
  Autocomplete,
  Avatar,
  TextField,
  InputAdornment,
  List,
  ListItem,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import { GetCurrentDate, lookupToTitleCase, renderErrorListItem } from "../utils/HelperUtils";
import { GetPropertyMapData, SaveProperty, addressToTitleCase } from "../utils/PropertyUtils";

import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import {
  adsBlueA,
  adsGreenC,
  adsRed,
  adsLightGreyC,
  adsDarkPink,
  adsDarkGrey,
  adsWhite,
  adsOffWhite,
} from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MultiEditRemoveCrossReferenceDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditRemoveCrossReferenceDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [source, setSource] = useState(null);
  const [sourceId, setSourceId] = useState(null);
  const [crossReference, setCrossReference] = useState(null);
  const [action, setAction] = useState("add");
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [options, setOptions] = useState([]);

  const [title, setTitle] = useState("Remove cross reference(s)");

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
   * @param {object|null} event The event object.
   * @param {string|null} newValue The new source.
   */
  const handleSourceIdChangeEvent = (event, newValue) => {
    setSource(newValue);

    const selectedItem = getSelectedItem(newValue);
    if (selectedItem && selectedItem.length > 0) setSourceId(selectedItem[0].pkId);
    else setSourceId(null);
  };

  /**
   * Event to handle when the cross reference is changed.
   *
   * @param {object|null} event The event object.
   */
  const handleCrossReferenceChangeEvent = (event) => {
    setCrossReference(event.target.value);
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
   * Method to update the selected properties.
   */
  const updateProperties = async () => {
    savedProperty.current = null;
    setUpdating(true);

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

          let updatedBlpuAppCrossRefs = [];

          if (property.blpuAppCrossRefs) {
            switch (action) {
              case "source":
                updatedBlpuAppCrossRefs = property.blpuAppCrossRefs.map((x) => {
                  return x.sourceId === sourceId ? { ...x, changeType: "D", endDate: currentDate } : x;
                });
                break;

              case "crossRef":
                updatedBlpuAppCrossRefs = property.blpuAppCrossRefs.map((x) => {
                  return x.sourceId === sourceId && x.crossReference === crossReference
                    ? { ...x, changeType: "D", endDate: currentDate }
                    : x;
                });
                break;

              case "all":
                updatedBlpuAppCrossRefs = property.blpuAppCrossRefs.map((x) => {
                  return { ...x, changeType: "D", endDate: currentDate };
                });
                break;

              default:
                break;
            }
          }

          const minPkIdNote =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
              : null;
          const newPkIdNote = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
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
                }
              }
            );
          } else {
            failedCount.current++;
          }
        }
      }
    }
  };

  /**
   * Method to get the selected item.
   *
   * @param {string} value The display value for the control
   * @returns {array|null} The lookup row with the given label.
   */
  function getSelectedItem(value) {
    if (!value) return null;
    return lookupContext.currentLookups.appCrossRefs.filter((x) => x.enabled && x.xrefDescription === value);
  }

  /**
   * Method to get the avatar colour and styling.
   *
   * @param {string} value The display value for the control
   * @returns {object} The styling for the avatar.
   */
  function getAvatarColour(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem && selectedItem.length > 0) {
      const avatarWidth =
        selectedItem[0].pkId.toString().length <= 2
          ? "24px"
          : selectedItem[0].pkId.toString().length <= 3
          ? "36px"
          : "48px";

      return {
        backgroundColor: adsDarkPink,
        height: "24px",
        width: avatarWidth,
      };
    } else
      return {
        backgroundColor: adsBlueA,
        width: "24px",
        height: "24px",
      };
  }

  /**
   * Method to get the avatar value.
   *
   * @param {string} value The control value
   * @returns {string|null} The avatar value.
   */
  function getAvatarValue(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem && selectedItem.length > 0) {
      if (selectedItem[0].xrefSourceRef73) return selectedItem[0].xrefSourceRef73.substring(4, 6);
      else if (selectedItem[0].xrefSourceRef) return selectedItem[0].xrefSourceRef.substring(0, 2);
      else return null;
    } else return null;
  }

  /**
   * Method to get the item avatar.
   *
   * @param {string} value The control value.
   * @returns {JSX.Element} The item avatar.
   */
  function getItemAvatar(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem && selectedItem.length > 0) {
      return (
        <Avatar id={`source-avatar`} variant={"rounded"} sx={getAvatarColour(value)} aria-labelledby={`source-label`}>
          {selectedItem[0].avatar_icon && selectedItem[0].avatar_icon.length > 0 ? (
            <img src={selectedItem[0].avatar_icon} alt="" width="20" height="20" />
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: adsWhite,
                fontWeight: 500,
                fontFamily: "Open Sans",
              }}
            >
              {getAvatarValue(value)}
            </Typography>
          )}
        </Avatar>
      );
    }
  }

  /**
   * Returns the styling for an input component.
   *
   * @param {boolean} hasError True if the component is displaying an error; otherwise false.
   * @return {object} The styling to use for the form input.
   */
  const inputStyle = (hasError) => {
    if (hasError)
      return {
        fontFamily: "Nunito sans",
        fontSize: "15px",
        color: adsDarkGrey,
        ml: "75px",
        width: "450px",
        pl: "4px",
        "&$outlinedInputFocused": {
          borderColor: `${adsBlueA}  !important`,
        },
        "&$notchedOutline": {
          borderWidth: "1px",
          borderColor: `${adsRed}  !important`,
        },
      };
    else
      return {
        fontFamily: "Nunito sans",
        fontSize: "15px",
        color: adsDarkGrey,
        ml: "75px",
        width: "450px",
        "&$outlinedInputFocused": {
          borderColor: `${adsBlueA}  !important`,
        },
        "&$notchedOutline": {
          borderWidth: "1px",
          borderColor: `${adsOffWhite}  !important`,
        },
      };
  };

  /**
   * Returns the styling for a select input component.
   *
   * @param {boolean} hasError True if the component is displaying an error; otherwise false.
   * @return {object} The styling to use for the form select input.
   */
  const selectInputStyle = (hasError) => {
    if (hasError)
      return {
        fontFamily: "Nunito sans",
        fontSize: "15px",
        color: adsDarkGrey,
        display: "inline-flex",
        ml: "75px",
        width: "450px",
        "&$outlinedInputFocused": {
          borderColor: `${adsBlueA}  !important`,
        },
        "&$notchedOutline": {
          borderWidth: "1px",
          borderColor: `${adsRed}  !important`,
        },
      };
    else
      return {
        fontFamily: "Nunito sans",
        fontSize: "15px",
        color: adsDarkGrey,
        display: "inline-flex",
        ml: "75px",
        width: "450px",
        "&$outlinedInputFocused": {
          borderColor: `${adsBlueA}  !important`,
        },
        "&$notchedOutline": {
          borderWidth: "1px",
          borderColor: `${adsOffWhite}  !important`,
        },
      };
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("Remove cross reference(s)");
      setAction("source");
      setHaveErrors(false);
      setNoteOpen(false);
      setCompleted(false);
      setUpdating(false);

      const filteredData = lookupContext.currentLookups.appCrossRefs
        .filter((x) => x.enabled)
        .sort(function (a, b) {
          return a.xrefDescription.localeCompare(b.xrefDescription, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
        .map((a) => a["xrefDescription"]);
      if (filteredData.length !== options.length) setOptions(filteredData);
    } else {
      failedCount.current = 0;
      updatedCount.current = 0;
      totalUpdateCount.current = 0;
      setRangeProcessedCount(0);
    }

    setShowDialog(isOpen);
  }, [isOpen, lookupContext.currentLookups.appCrossRefs, options]);

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
      setTitle("Remove cross reference(s): completed");
      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="multi-remove-xref-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <ADSDialogTitle title={`${title}`} closeTooltip="Close" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {!completed ? (
          <Fragment>
            <Typography variant="body1" gutterBottom sx={{ ml: theme.spacing(1.25) }}>
              Choose an action to perform on the selected records
            </Typography>
            <Grid2 container justifyContent="center" alignItems="center">
              <Grid2 size={12}>
                <FormControl>
                  <RadioGroup
                    aria-labelledby="add-cross-reference-action-radio-buttons-group"
                    name="cross-reference-action-radio-buttons-group"
                    value={action}
                    onChange={handleActionChangeEvent}
                  >
                    <FormControlLabel
                      value="source"
                      control={<Radio />}
                      label={<Typography variant="body2">Find and remove cross references of this</Typography>}
                      sx={{ ml: "35px" }}
                    />
                    <Tooltip title={"External data-set identity."} arrow placement="right" sx={tooltipStyle}>
                      <Autocomplete
                        id={"ads-select-source"}
                        sx={{
                          color: "inherit",
                        }}
                        getOptionLabel={(option) => lookupToTitleCase(option, false)}
                        noOptionsText={`No source records`}
                        options={options}
                        value={source}
                        autoHighlight
                        autoSelect
                        onChange={handleSourceIdChangeEvent}
                        renderOption={(props, option) => {
                          return (
                            <li {...props}>
                              <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                                {getItemAvatar(option)}
                                <Typography variant="body2" sx={{ color: adsDarkGrey }} align="left">
                                  {lookupToTitleCase(option, false)}
                                </Typography>
                              </Stack>
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={selectInputStyle(haveErrors)}
                            error={haveErrors}
                            fullWidth
                            disabled={updating || action !== "source"}
                            placeholder={"Select source"}
                            variant="outlined"
                            margin="dense"
                            size="small"
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">{getItemAvatar(source)}</InputAdornment>
                                ),
                              },
                            }}
                          />
                        )}
                        aria-labelledby={`source-label`}
                      />
                    </Tooltip>
                    <FormControlLabel
                      value="crossRef"
                      control={<Radio />}
                      label={<Typography variant="body2">Find and remove this unique cross reference</Typography>}
                      sx={{ ml: "35px" }}
                    />
                    <Tooltip
                      title={"Primary key of corresponding Record in an external data-set."}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <TextField
                        id={`ads-text-textfield-cross-reference`}
                        sx={inputStyle(haveErrors)}
                        error={haveErrors}
                        rows={1}
                        fullWidth
                        disabled={updating || action !== "crossRef"}
                        placeholder={"Enter unique cross reference"}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        value={crossReference}
                        onChange={handleCrossReferenceChangeEvent}
                        aria-labelledby={`ads-text-label-cross-reference`}
                        slotProps={{
                          htmlInput: { maxLength: "50" },
                        }}
                      />
                    </Tooltip>
                    <FormControlLabel
                      value="all"
                      control={<Radio />}
                      label={
                        <Typography variant="body2">Remove all cross references from selected properties</Typography>
                      }
                      sx={{ ml: "35px" }}
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
                    id="cross_reference_remove_note"
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
                        key="multi-edit-remove-cross-reference-errors"
                      >
                        {finaliseErrors.map((rec, index) => (
                          <ListItem
                            alignItems="flex-start"
                            dense
                            divider
                            id={`multi-edit-remove-cross-reference-error-${index}`}
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

export default MultiEditRemoveCrossReferenceDialog;
