/* #region header */
/**************************************************************************************************
//
//  Description: Move BLPU seed point dialog
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   06/11/23 Sean Flook       IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system, renamed successor to successorCrossRef and simplified handleFinaliseClose.
//    003   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    004   16.01.24 Sean Flook                 Changes required to fix warnings.
//    005   25.01.24 Sean Flook                 Changes required after UX review.
//    006   20.02.24 Sean Flook            MUL6 Updated title.
//    007   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    008   11.03.24 Sean Flook           GLB12 Removed bottom margin.
//    009   12.03.24 Sean Flook            MUL7 Handle saving when X is clicked and user chooses to save changes.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { forwardRef, useContext, useState, useRef, Fragment, useEffect } from "react";
import PropTypes from "prop-types";

import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import PropertyContext from "../context/propertyContext";

import { ArraysEqual } from "../utils/HelperUtils";
import { addressToTitleCase, GetPropertyMapData, SaveProperty, getClassificationCode } from "../utils/PropertyUtils";
import { GetMultiEditSearchUrl } from "../configuration/ADSConfig";

import {
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Divider,
  Grid,
  Backdrop,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Box, Stack } from "@mui/system";

import ADSWizardMap from "../components/ADSWizardMap";
import ADSWizardAddressList from "../components/ADSWizardAddressList";

import WizardFinaliseDialog from "./WizardFinaliseDialog";
import MessageDialog from "./MessageDialog";

import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ErrorIcon from "@mui/icons-material/Error";

import { adsBlueA, adsOffWhite } from "../utils/ADSColours";
import { blueButtonStyle, redButtonStyle, dialogTitleStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MoveBLPUDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function MoveBLPUDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const propertyContext = useContext(PropertyContext);

  const [showDialog, setShowDialog] = useState(false);
  const [finaliseOpen, setFinaliseOpen] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finaliseErrors, setFinaliseErrors] = useState([]);
  const [haveErrors, setHaveErrors] = useState(false);
  const [viewErrors, setViewErrors] = useState(false);

  const [data, setData] = useState([]);
  const [currentUprns, setCurrentUprns] = useState([]);
  const [checked, setChecked] = useState([]);

  const [rangeProcessedCount, setRangeProcessedCount] = useState(0);

  const properties = useRef(null);
  const savedProperty = useRef(null);
  const updateErrors = useRef([]);
  const totalUpdateCount = useRef(0);
  const updatedCount = useRef(0);
  const failedCount = useRef(0);
  const failedIds = useRef([]);

  /**
   * Event to handle when the dialog closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    setOpenMessageDialog(true);
  };

  /**
   * Event to handle when the finalise dialog closes.
   *
   * @param {string} type The type of closure.
   */
  const handleFinaliseClose = (type) => {
    // If anything changes here it will also need to be changed in useEffect where this code is duplicated.
    setViewErrors(type === "error");
    setFinaliseOpen(false);
    if (type !== "error") {
      const savedMapProperties = savedProperty.current.map((x) => {
        return {
          uprn: x.uprn.toString(),
          address: x.lpis.filter((rec) => rec.language === "ENG")[0].address.replaceAll("\r\n", " "),
          formattedAddress: x.lpis.filter((rec) => rec.language === "ENG")[0].address,
          postcode: x.lpis.filter((rec) => rec.language === "ENG")[0].postcode,
          easting: x.xcoordinate,
          northing: x.ycoordinate,
          logicalStatus: x.logicalStatus,
          classificationCode: getClassificationCode(x),
        };
      });
      const updatedSearchProperties = mapContext.currentSearchData.properties.map(
        (x) => savedMapProperties.find((rec) => rec.uprn === x.uprn) || x
      );
      mapContext.onSearchDataChange(mapContext.currentSearchData.streets, updatedSearchProperties, null, null);
      // mapContext.onHighlightRefresh(true);
      if (onClose) onClose();
      else setShowDialog(false);
    }
  };

  /**
   * Event to handle when the message dialog closes.
   *
   * @param {string} action The action to take after closing the dialog.
   */
  const handleMessageDialogClose = (action) => {
    setOpenMessageDialog(false);

    switch (action) {
      case "close":
        if (onClose) onClose();
        else setShowDialog(false);
        break;

      case "save":
        handleFinish();
        break;

      default:
        break;
    }
  };

  /**
   * Event to handle updating the list of checked records.
   *
   * @param {Array} updatedChecked The list of checked records.
   */
  const handleCheckedChanged = (updatedChecked) => {
    setChecked(updatedChecked);
  };

  /**
   * Event to handle when the data has been changed.
   *
   * @param {object} updatedData The updated data.
   */
  const handleDataChanged = (updatedData) => {
    // if (onDataChange) onDataChange(updatedData);
  };

  /**
   * Event to handle when the list of errors changes.
   *
   * @param {Array} finaliseErrors The list of errors.
   */
  const handleErrorChanged = (finaliseErrors) => {
    // if (onErrorChanged) onErrorChanged(finaliseErrors);
  };

  /**
   * Event to handle when the finish button is clicked.
   */
  const handleFinish = async () => {
    setUpdating(true);
    properties.current = [];
    savedProperty.current = [];
    totalUpdateCount.current = propertyUprns.length;
    updatedCount.current = 0;
    failedCount.current = 0;
    failedIds.current = [];
    setHaveErrors(false);
    setViewErrors(false);
    updateErrors.current = [];
    setFinaliseErrors([]);

    for (const property of data) {
      const currentProperty = await GetPropertyMapData(property.uprn, userContext.currentUser.token);

      if (currentProperty) {
        const engLpi = currentProperty.lpis.filter((x) => x.language === "ENG");
        if (engLpi && engLpi.length > 0) {
          properties.current.push({
            id: currentProperty.pkId,
            uprn: currentProperty.uprn,
            address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
          });
        }

        // Check to see if something has changed
        if (
          currentProperty.xcoordinate !== property.easting ||
          currentProperty.ycoordinate !== property.northing ||
          currentProperty.rpc !== property.blpu.rpc ||
          !property.other.notes
        ) {
          const minPkIdNote =
            currentProperty.blpuNotes && currentProperty.blpuNotes.length > 0
              ? currentProperty.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
              : null;
          let newPkId = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
          const maxSeqNo =
            currentProperty.blpuNotes && currentProperty.blpuNotes.length > 0
              ? currentProperty.blpuNotes.reduce((prev, curr) => (prev.seqNo > curr.seqNo ? prev : curr))
              : null;
          let newSeqNo = maxSeqNo && maxSeqNo.seqNo ? maxSeqNo.seqNo + 1 : 1;

          const updatedNotes = currentProperty.blpuNotes ? [...currentProperty.blpuNotes] : [];
          if (property.other.notes) {
            property.other.notes.forEach((note) => {
              updatedNotes.push({
                uprn: property.uprn,
                note: note,
                changeType: "I",
                pkId: newPkId,
                seqNo: newSeqNo,
              });

              newPkId -= 1;
              newSeqNo += 1;
            });
          }

          const updatedProperty = settingsContext.isScottish
            ? {
                changeType: "U",
                blpuStateDate: currentProperty.blpuStateDate,
                rpc: property.blpu.rpc ? property.blpu.rpc : currentProperty.rpc,
                startDate: currentProperty.startDate,
                endDate: currentProperty.endDate,
                parentUprn: currentProperty.parentUprn,
                neverExport: currentProperty.neverExport,
                siteSurvey: currentProperty.siteSurvey,
                uprn: currentProperty.uprn,
                logicalStatus: currentProperty.logicalStatus,
                blpuState: currentProperty.blpuState,
                localCustodianCode: currentProperty.localCustodianCode,
                level: currentProperty.level,
                xcoordinate: property.easting,
                ycoordinate: property.northing,
                pkId: currentProperty.pkId,
                blpuAppCrossRefs: currentProperty.blpuAppCrossRefs,
                blpuProvenances: currentProperty.blpuProvenances,
                classifications: currentProperty.classifications,
                organisations: currentProperty.organisations,
                successorCrossRefs: currentProperty.successorCrossRefs,
                blpuNotes: updatedNotes,
                lpis: currentProperty.lpis,
              }
            : {
                changeType: "U",
                blpuStateDate: currentProperty.blpuStateDate,
                rpc: property.blpu.rpc ? property.blpu.rpc : currentProperty.rpc,
                startDate: currentProperty.startDate,
                endDate: currentProperty.endDate,
                parentUprn: currentProperty.parentUprn,
                neverExport: currentProperty.neverExport,
                siteSurvey: currentProperty.siteSurvey,
                uprn: currentProperty.uprn,
                logicalStatus: currentProperty.logicalStatus,
                blpuState: currentProperty.blpuState,
                blpuClass: currentProperty.blpuClass,
                localCustodianCode: currentProperty.localCustodianCode,
                organisation: currentProperty.organisation,
                xcoordinate: property.easting,
                ycoordinate: property.northing,
                wardCode: currentProperty.wardCode,
                parishCode: currentProperty.parishCode,
                pkId: currentProperty.pkId,
                blpuAppCrossRefs: currentProperty.blpuAppCrossRefs,
                blpuProvenances: currentProperty.blpuProvenances,
                blpuNotes: updatedNotes,
                lpis: currentProperty.lpis,
              };

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
    const getPropertyDetails = async () => {
      const searchMultiEditUrl = GetMultiEditSearchUrl(userContext.currentUser.token);

      if (searchMultiEditUrl) {
        const newSearchData = await fetch(`${searchMultiEditUrl.url}/${propertyUprns.join()}`, {
          headers: searchMultiEditUrl.headers,
          crossDomain: true,
          method: searchMultiEditUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              return result;
            },
            (error) => {
              console.error("[ERROR] Getting selected properties", error);
              return null;
            }
          );

        let newPropertyData = [];
        if (newSearchData) {
          newPropertyData = newSearchData.map((x) => {
            const postcodeRec = lookupContext.currentLookups.postcodes.find(
              (p) => p.postcode.toUpperCase() === x.postcode.toUpperCase()
            );
            const postTownRec = lookupContext.currentLookups.postTowns.find(
              (p) =>
                ((x.post_town && x.post_town.length > 0 && p.postTown.toUpperCase() === x.post_town.toUpperCase()) ||
                  p.postTown.toUpperCase() === x.town.toUpperCase()) &&
                p.language.toUpperCase() === x.language.toUpperCase()
            );

            return {
              uprn: x.uprn,
              id: `${x.language}_${x.uprn}`,
              language: x.language,
              easting: x.easting,
              northing: x.northing,
              parentUprn: x.parent_uprn,
              blpu: {
                logicalStatus: x.logical_status,
                rpc: null,
                state: null,
                stateDate: null,
                classification: x.classification_code,
                startDate: null,
              },
              lpi: {
                logicalStatus: x.logical_status,
                level: null,
                officialAddress: null,
                postallyAddressable: null,
                startDate: null,
              },
              other: {
                provCode: null,
                provStartDate: null,
                notes: null,
              },
              addressDetails: {
                id: null,
                address: addressToTitleCase(x.formattedaddress, x.postcode),
                mapLabel: x.full_building_desc,
                saoStartNumber: null,
                saoStartSuffix: null,
                saoEndNumber: null,
                saoEndSuffix: null,
                saoText: null,
                paoStartNumber: null,
                paoStartSuffix: null,
                paoEndNumber: null,
                paoEndSuffix: null,
                paoText: null,
                paoDetails: null,
                usrn: x.usrn,
                postcodeRef: postcodeRec ? postcodeRec.postcodeRef : 0,
                postTownRef: postTownRec ? postTownRec.postTownRef : 0,
                included: true,
              },
            };
          });

          setData(newPropertyData);
          setCurrentUprns(propertyUprns);
        }

        return newPropertyData;
      }
    };

    if (isOpen && propertyUprns && propertyUprns.length > 0 && !ArraysEqual(propertyUprns, currentUprns)) {
      getPropertyDetails();
    }

    if (showDialog !== isOpen) setShowDialog(isOpen);

    if (!isOpen) {
      setHaveErrors(false);
      setCompleted(false);
      setUpdating(false);
    }
  }, [
    isOpen,
    propertyUprns,
    currentUprns,
    userContext.currentUser.token,
    showDialog,
    lookupContext.currentLookups.postcodes,
    lookupContext.currentLookups.postTowns,
  ]);

  useEffect(() => {
    if (mapContext.currentPinSelected) setChecked([mapContext.currentPinSelected]);
    else setChecked([]);
  }, [mapContext.currentPinSelected]);

  useEffect(() => {
    if (mapContext.currentWizardPoint && data) {
      let updatedData = [];
      let updateRequired = false;

      const property = data.find((x) => x.id === mapContext.currentWizardPoint.pointId);
      if (property) {
        updateRequired =
          updateRequired ||
          mapContext.currentWizardPoint.x !== property.easting ||
          mapContext.currentWizardPoint.y !== property.northing;

        updatedData = data.map(
          (x) =>
            [
              {
                uprn: property.uprn,
                id: property.id,
                language: property.language,
                easting: mapContext.currentWizardPoint.x,
                northing: mapContext.currentWizardPoint.y,
                parentUprn: property.parentUprn,
                blpu: property.blpu,
                lpi: property.lpi,
                other: property.other,
                addressDetails: property.addressDetails,
              },
            ].find((rec) => rec.id === x.id) || x
        );
      }

      if (updateRequired) setData(updatedData);
    }
  }, [mapContext.currentWizardPoint, data]);

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
    if (viewErrors && updateErrors.current && updateErrors.current.length > 0) {
      const errorIds = settingsContext.isScottish
        ? [...updateErrors.current.map((x) => x.id), ...updateErrors.current.map((x) => x.id.replace("ENG", "GAE"))]
        : settingsContext.isWelsh
        ? [...updateErrors.current.map((x) => x.id), ...updateErrors.current.map((x) => x.id.replace("ENG", "CYM"))]
        : updateErrors.current.map((x) => x.id);

      if (errorIds && data && errorIds.length > 0 && errorIds.length !== data.length) {
        const errorData = data.filter((x) => errorIds.includes(x.id));

        setData(errorData);
      }
    }
  }, [viewErrors, data, settingsContext.isScottish, settingsContext.isWelsh]);

  useEffect(() => {
    if (totalUpdateCount.current > 0 && totalUpdateCount.current === updatedCount.current + failedCount.current) {
      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      if (failedCount.current > 0) setFinaliseOpen(true);
      else {
        // If anything changes here it will also need to be changed in handleFinaliseClose
        setViewErrors(false);
        const savedMapProperties = savedProperty.current.map((x) => {
          return {
            uprn: x.uprn.toString(),
            address: x.lpis.filter((rec) => rec.language === "ENG")[0].address.replaceAll("\r\n", " "),
            formattedAddress: x.lpis.filter((rec) => rec.language === "ENG")[0].address,
            postcode: x.lpis.filter((rec) => rec.language === "ENG")[0].postcode,
            easting: x.xcoordinate,
            northing: x.ycoordinate,
            logicalStatus: x.logicalStatus,
            classificationCode: getClassificationCode(x),
          };
        });
        const updatedSearchProperties = mapContext.currentSearchData.properties.map(
          (x) => savedMapProperties.find((rec) => rec.uprn === x.uprn) || x
        );
        mapContext.onSearchDataChange(mapContext.currentSearchData.streets, updatedSearchProperties, null, null);
        if (onClose) onClose();
        else setShowDialog(false);
      }
      setUpdating(false);

      totalUpdateCount.current = 0;
      updatedCount.current = 0;
      failedCount.current = 0;
    }
  }, [rangeProcessedCount, mapContext, onClose]);

  return (
    <Fragment>
      <Dialog
        open={showDialog}
        aria-labelledby="add-property-wizard-dialog"
        fullScreen
        onClose={handleDialogClose}
        TransitionComponent={Transition}
      >
        <DialogTitle id="add-property-wizard-dialog" sx={{ ...dialogTitleStyle, mb: "0px" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
              spacing={1}
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Tooltip title="Exit editing seed points" sx={tooltipStyle}>
                <IconButton aria-label="close" onClick={handleCancelClick}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography
                sx={{
                  flexGrow: 1,
                  display: "none",
                  pl: "8px",
                  pr: "8px",
                  [theme.breakpoints.up("sm")]: {
                    display: "block",
                  },
                }}
                variant="subtitle1"
                noWrap
                align="left"
              >
                {`Move BLPU seed point${propertyUprns && propertyUprns.length === 1 ? "" : "s"}`}
              </Typography>
            </Stack>
            <Button
              onClick={handleFinish}
              autoFocus
              disabled={updating}
              variant="contained"
              sx={haveErrors ? redButtonStyle : blueButtonStyle}
              startIcon={haveErrors ? <ErrorIcon /> : completed ? <CloseIcon /> : <ArrowForwardIcon />}
            >
              <Typography sx={{ fontSize: "20px", textTransform: "none" }}>{`${
                completed && !haveErrors ? "Close" : "Finish & Save"
              }`}</Typography>
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: adsOffWhite }}>
          <Box>
            <Grid container justifyContent="flex-start" spacing={0}>
              <Grid item xs={12}>
                <Grid container spacing={0} justifyContent="flex-start">
                  <Grid item xs={12} sm={4}>
                    <ADSWizardAddressList
                      data={data}
                      checked={checked}
                      errors={finaliseErrors}
                      haveMoveBlpu
                      onCheckedChanged={handleCheckedChanged}
                      onDataChanged={handleDataChanged}
                      onErrorChanged={handleErrorChanged}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <ADSWizardMap data={data} isRange moveBlpu />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {updating && (
              <Backdrop open={updating}>
                <CircularProgress color="inherit" />
              </Backdrop>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            borderTopWidth: "4px",
            borderTopStyle: "solid",
            borderTopColor: adsBlueA,
            justifyContent: "flex-start",
          }}
        >
          <Box sx={{ width: "100%", height: "40px", ml: theme.spacing(2), mr: theme.spacing(2), mt: theme.spacing(1) }}>
            <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
              <Button
                onClick={handleFinish}
                autoFocus
                disabled={updating}
                variant="contained"
                sx={haveErrors ? redButtonStyle : blueButtonStyle}
                startIcon={haveErrors ? <ErrorIcon /> : completed ? <CloseIcon /> : <ArrowForwardIcon />}
              >
                <Typography sx={{ fontSize: "20px", textTransform: "none" }}>{`${
                  completed && !haveErrors ? "Close" : "Finish & Save"
                }`}</Typography>
              </Button>
            </Stack>
          </Box>
        </DialogActions>
      </Dialog>
      <WizardFinaliseDialog
        open={finaliseOpen}
        variant="moveBlpu"
        errors={finaliseErrors}
        createdCount={updatedCount.current}
        failedCount={failedCount.current}
        onClose={handleFinaliseClose}
      />
      <MessageDialog isOpen={openMessageDialog} variant="cancelMoveBlpu" onClose={handleMessageDialogClose} />
    </Fragment>
  );
}

export default MoveBLPUDialog;
