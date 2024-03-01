//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to multi-edit the address fields
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   23.10.23 Sean Flook       IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   08.12.23 Sean Flook                 Migrated DataGrid to v6.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   11.01.24 Sean Flook                 Fix warnings.
//    006   16.01.24 Sean Flook                 Changes required to fix warnings.
//    007   27.02.24 Sean Flook           MUL15 Changed to use dialogTitleStyle and renderErrors.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";
import PropertyContext from "../context/propertyContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Grid,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";

import { GetLookupLabel, filteredLookup, renderErrors } from "../utils/HelperUtils";
import { GetPropertyMapData, SaveProperty, addressToTitleCase } from "../utils/PropertyUtils";

import OfficialAddress from "./../data/OfficialAddress";
import PostallyAddressable from "./../data/PostallyAddressable";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import {
  adsBlueA,
  adsGreenC,
  adsRed,
  adsLightGreyC,
  adsMidGreyA,
  adsPaleBlueB,
  adsDarkGrey10,
  adsDarkGrey20,
} from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle, dialogTitleStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return {
      root: {
        "& .visible-row": {
          "&:hover": {
            backgroundColor: adsPaleBlueB,
            color: adsBlueA,
            // cursor: "pointer",
          },
        },
        "& .hidden-row": {
          backgroundColor: adsDarkGrey10,
          "&:hover": {
            backgroundColor: adsDarkGrey20,
            color: adsBlueA,
            // cursor: "pointer",
          },
        },
      },
    };
  },
  { defaultTheme }
);

MultiEditAddressFieldsDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditAddressFieldsDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();
  const classes = useStyles();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);

  const [showDialog, setShowDialog] = useState(false);
  const [street, setStreet] = useState(null);
  const [postTown, setPostTown] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [officialFlag, setOfficialFlag] = useState(null);
  const [postalAddress, setPostalAddress] = useState(null);
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [title, setTitle] = useState("Edit address");

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

  const [sortModel, setSortModel] = useState([{ field: "address", sort: "asc" }]);
  const [selectionModel, setSelectionModel] = useState([]);

  /**
   * Array of fields (columns) to be displayed in the data grid.
   */
  const columns = [
    { field: "id" },
    { field: "uprn" },
    {
      field: "address",
      headerName: "Address",
      headerClassName: "idox-multi-edit-address-fields-error-data-grid-header",
      flex: 30,
    },
    {
      field: "errors",
      headerName: "Errors",
      cellClassName: "idox-multi-edit-address-fields-error-data-grid-error",
      headerClassName: "idox-multi-edit-address-fields-error-data-grid-header",
      flex: 30,
      renderCell: renderErrors,
    },
  ];

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
   * Event to handle when the street is changed.
   *
   * @param {number|null} newValue The new street.
   */
  const handleStreetChangeEvent = (newValue) => {
    setStreet(newValue);
  };

  /**
   * Event to handle when the post town is changed.
   *
   * @param {number|null} newValue The new post town.
   */
  const handlePostTownChangeEvent = (newValue) => {
    setPostTown(newValue);
  };

  /**
   * Event to handle when the postcode is changed.
   *
   * @param {number|null} newValue The new postcode.
   */
  const handlePostcodeChangeEvent = (newValue) => {
    setPostcode(newValue);
  };

  /**
   * Event to handle when the official flag value changes.
   *
   * @param {string|null} newValue The new official flag.
   */
  const handleOfficialFlagChangeEvent = (newValue) => {
    setOfficialFlag(newValue);
  };

  /**
   * Event to handle when the postally addressable value changes.
   *
   * @param {string|null} newValue The new postally addressable flag.
   */
  const handlePostalAddressChangeEvent = (newValue) => {
    setPostalAddress(newValue);
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

      for (const propertyUprn of propertyUprns) {
        const property = await GetPropertyMapData(propertyUprn, userContext.currentUser.token);

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

          const minPkIdNote =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
              : null;
          const newPkId = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
          const maxSeqNo =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.seqNo > curr.seqNo ? prev : curr))
              : null;
          const newSeqNo = maxSeqNo && maxSeqNo.seqNo ? maxSeqNo.seqNo + 1 : 1;

          const updatedNotes = property.blpuNotes ? [...property.blpuNotes] : [];
          if (noteOpen)
            updatedNotes.push({
              uprn: property.uprn,
              note: note,
              changeType: "I",
              pkId: newPkId,
              seqNo: newSeqNo,
            });

          if (settingsContext.isWelsh) {
            const cymPostTownRef = postTown
              ? lookupContext.currentLookups.postTowns.find((x) => x.linkedRef === postTown && x.language === "CYM")
                  .postTownRef
              : null;

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
              blpuAppCrossRefs: property.blpuAppCrossRefs,
              blpuProvenances: property.blpuProvenances,
              blpuNotes: updatedNotes,
              lpis: property.lpis.map((lpi) => {
                return {
                  ...lpi,
                  changeType: "U",
                  usrn: street ? street : lpi.usrn,
                  postcodeRef: postcode ? postcode : lpi.postcodeRef,
                  postTownRef: postTown ? (lpi.language === "ENG" ? postTown : cymPostTownRef) : lpi.postTownRef,
                  postalAddress: postalAddress ? postalAddress : lpi.postalAddress,
                  officialFlag: officialFlag ? officialFlag : lpi.officialFlag,
                };
              }),
            };
          } else if (settingsContext.isScottish) {
            const gaePostTownRef = postTown
              ? lookupContext.currentLookups.postTowns.find((x) => x.linkedRef === postTown && x.language === "GAE")
                  .postTownRef
              : null;

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
              blpuAppCrossRefs: property.blpuAppCrossRefs,
              blpuProvenances: property.blpuProvenances,
              classifications: property.classifications,
              organisations: property.organisations,
              successorCrossRefs: property.successorCrossRefs,
              blpuNotes: updatedNotes,
              lpis: property.lpis.map((lpi) => {
                return {
                  ...lpi,
                  changeType: "U",
                  usrn: street ? street : lpi.usrn,
                  postcodeRef: postcode ? postcode : lpi.postcodeRef,
                  postTownRef: postTown ? (lpi.language === "ENG" ? postTown : gaePostTownRef) : lpi.postTownRef,
                };
              }),
            };
          } else {
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
              blpuAppCrossRefs: property.blpuAppCrossRefs,
              blpuProvenances: property.blpuProvenances,
              blpuNotes: updatedNotes,
              lpis: property.lpis.map((lpi) => {
                return {
                  ...lpi,
                  changeType: "U",
                  usrn: street ? street : lpi.usrn,
                  postcodeRef: postcode ? postcode : lpi.postcodeRef,
                  postTownRef: postTown ? postTown : lpi.postTownRef,
                  postalAddress: postalAddress ? postalAddress : lpi.postalAddress,
                  officialFlag: officialFlag ? officialFlag : lpi.officialFlag,
                };
              }),
            };
          }

          if (updatedProperty) {
            SaveProperty(
              updatedProperty,
              false,
              userContext.currentUser.token,
              propertyContext,
              settingsContext.isScottish
            ).then((result) => {
              if (result) {
                updatedCount.current++;
                savedProperty.current.push(result);
                setRangeProcessedCount(updatedCount.current + failedCount.current);
              }
            });
          } else {
            failedCount.current++;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen && !showDialog) {
      setTitle("Edit address");
      setHaveErrors(false);
      setNoteOpen(false);
      setCompleted(false);
      setUpdating(false);
    }

    setShowDialog(isOpen);
  }, [isOpen, showDialog]);

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
      setTitle("Edit address: completed");
      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="multi-edit-address-fields-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <DialogTitle id="multi-edit-address-fields-dialog" sx={dialogTitleStyle}>
        <Typography variant="h6">{`${title}`}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancelClick}
          sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {!completed ? (
          <Fragment>
            <Typography variant="body1" gutterBottom>
              Choose the updates that you wish to apply to the selected properties
            </Typography>
            <Grid container justifyContent="center" alignItems="center">
              <Grid item xs={12}>
                <ADSSelectControl
                  label="Street"
                  isEditable
                  useRounded
                  disabled={updating}
                  displayNoChange
                  lookupData={lookupContext.currentLookups.streetDescriptors.filter((x) => x.language === "ENG")}
                  lookupId="usrn"
                  lookupLabel="address"
                  value={street}
                  errorText={null}
                  onChange={handleStreetChangeEvent}
                  helperText="Unique Street reference number."
                />
              </Grid>
              <Grid item xs={12}>
                <ADSSelectControl
                  label="Post town"
                  isEditable
                  useRounded
                  disabled={updating}
                  displayNoChange
                  lookupData={lookupContext.currentLookups.postTowns.filter((x) => x.language === "ENG" && !x.historic)}
                  lookupId="postTownRef"
                  lookupLabel="postTown"
                  value={postTown}
                  errorText={null}
                  onChange={handlePostTownChangeEvent}
                  helperText="Allocated by the Royal Mail to assist in delivery of mail."
                />
              </Grid>
              <Grid item xs={12}>
                <ADSSelectControl
                  label="Postcode"
                  isEditable
                  useRounded
                  disabled={updating}
                  doNotSetTitleCase
                  displayNoChange
                  lookupData={lookupContext.currentLookups.postcodes.filter((x) => !x.historic)}
                  lookupId="postcodeRef"
                  lookupLabel="postcode"
                  value={postcode}
                  errorText={null}
                  onChange={handlePostcodeChangeEvent}
                  helperText="Allocated by the Royal Mail to assist in delivery of mail."
                />
              </Grid>
              <Grid item xs={12}>
                <ADSSelectControl
                  label="Official address"
                  isEditable
                  useRounded
                  disabled={updating}
                  doNotSetTitleCase
                  displayNoChange
                  lookupData={filteredLookup(OfficialAddress, settingsContext.isScottish)}
                  lookupId="id"
                  lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                  value={officialFlag}
                  errorText={null}
                  onChange={handleOfficialFlagChangeEvent}
                  helperText="Status of address."
                />
              </Grid>
              <Grid item xs={12}>
                <ADSSelectControl
                  label="Postal address"
                  isEditable
                  useRounded
                  disabled={updating}
                  doNotSetTitleCase
                  displayNoChange
                  lookupData={filteredLookup(PostallyAddressable, settingsContext.isScottish)}
                  lookupId="id"
                  lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                  value={postalAddress}
                  errorText={null}
                  onChange={handlePostalAddressChangeEvent}
                  helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
                />
              </Grid>
              {noteOpen && (
                <Grid item xs={12}>
                  <ADSTextControl
                    isEditable
                    disabled={updating}
                    value={note}
                    id="property_note"
                    maxLength={4000}
                    minLines={2}
                    maxLines={10}
                    onChange={handleNoteChangeEvent}
                  />
                </Grid>
              )}
            </Grid>
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
                      height: "215px",
                      "& .idox-multi-edit-address-fields-error-data-grid-header": {
                        backgroundColor: adsLightGreyC,
                        color: adsMidGreyA,
                      },
                      "& .idox-multi-edit-address-fields-error-data-grid-error": {
                        color: adsRed,
                      },
                    }}
                    className={classes.root}
                  >
                    {finaliseErrors && finaliseErrors.length > 0 && (
                      <DataGrid
                        rows={finaliseErrors}
                        columns={columns}
                        initialState={{
                          columns: {
                            columnVisibilityModel: {
                              id: false,
                              uprn: false,
                            },
                          },
                        }}
                        autoPageSize
                        disableColumnMenu
                        disableRowSelectionOnClick
                        pagination
                        rowHeight={32}
                        sortModel={sortModel}
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={(newSelectionModel) => {
                          setSelectionModel(newSelectionModel);
                        }}
                        onSortModelChange={(model) => setSortModel(model)}
                      />
                    )}
                  </Box>
                </Stack>
              )}
            </Stack>
          </Fragment>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: theme.spacing(2) }}>
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
          <Fragment>
            <Button
              onClick={handleCloseClick}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<DoneIcon />}
            >
              Close
            </Button>
            {failedCount.current > 0 && (
              <Button
                onClick={handleAddToListClick}
                autoFocus
                variant="contained"
                sx={{ ...whiteButtonStyle, position: "relative", left: "-96px", top: "-68px" }}
                startIcon={<PlaylistAddIcon />}
              >
                Add to list
              </Button>
            )}
          </Fragment>
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

export default MultiEditAddressFieldsDialog;
