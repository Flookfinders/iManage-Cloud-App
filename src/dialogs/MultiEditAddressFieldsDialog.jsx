//region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to multi-edit the address fields
//
//  Copyright:    © 2023 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   23.10.23 Sean Flook        IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    004   05.01.24 Sean Flook                  Use CSS shortcuts.
//    005   11.01.24 Sean Flook                  Fix warnings.
//    006   16.01.24 Sean Flook                  Changes required to fix warnings.
//    007   27.02.24 Sean Flook            MUL15 Changed to use dialogTitleStyle and renderErrors.
//    008   11.03.24 Sean Flook            MUL13 Changed control alignment.
//    009   11.03.24 Sean Flook            MUL11 Reset counts when closing dialog.
//    010   12.03.24 Sean Flook            MUL10 Display errors in a list control.
//    011   27.03.24 Sean Flook                  Added ADSDialogTitle.
//    012   09.04.24 Sean Flook        IMANN-376 Allow lookups to be added on the fly.
//    013   22.05.24 Sean Flook        IMANN-473 Corrected label for Scottish authorities.
//    014   23.05.24 Sean Flook        IMANN-486 Changed seqNo to seqNum.
//    015   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    016   08.07.24 Sean Flook        IMANN-715 Corrected the Scottish property structure and increase the failed count if failed to save property.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    017   24.10.24 Sean Flook       IMANN-1033 Only sort and filter lookups when required.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    018   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    019   14.03.25 Sean Flook        IMANN-955 Do not count failures twice.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header */

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
  Typography,
  Button,
  Grid2,
  Backdrop,
  CircularProgress,
  List,
  ListItem,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import AddLookupDialog from "../dialogs/AddLookupDialog";

import {
  GetLookupLabel,
  addLookup,
  filteredLookup,
  getLookupVariantString,
  renderErrorListItem,
} from "../utils/HelperUtils";
import { GetPropertyMapData, SaveProperty, addressToTitleCase } from "../utils/PropertyUtils";

import OfficialAddress from "./../data/OfficialAddress";
import PostallyAddressable from "./../data/PostallyAddressable";

import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { adsGreenC, adsRed, adsLightGreyC } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MultiEditAddressFieldsDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditAddressFieldsDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);

  const [showDialog, setShowDialog] = useState(false);
  const [street, setStreet] = useState(null);
  const [postTown, setPostTown] = useState(null);
  const [subLocality, setSubLocality] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [officialFlag, setOfficialFlag] = useState(null);
  const [postalAddress, setPostalAddress] = useState(null);
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [streetLookup, setStreetLookup] = useState([]);
  const [postTownLookup, setPostTownLookup] = useState([]);
  const [subLocalityLookup, setSubLocalityLookup] = useState([]);
  const [postcodeLookup, setPostcodeLookup] = useState([]);

  const [title, setTitle] = useState("Edit address");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

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
  const addResult = useRef(null);
  const currentVariant = useRef(null);

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
   * Event to handle when a new post town is added.
   */
  const handleAddPostTownEvent = () => {
    setLookupType("postTown");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the sub-locality is changed.
   *
   * @param {number|null} newValue The new sub-locality.
   */
  const handleSubLocalityChangeEvent = (newValue) => {
    setSubLocality(newValue);
  };

  /**
   * Event to handle when a new sub-locality is added.
   */
  const handleAddSubLocalityEvent = () => {
    setLookupType("subLocality");
    setShowAddDialog(true);
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
   * Event to handle when a new postcode is added.
   */
  const handleAddPostcodeEvent = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
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

          const minPkIdNote =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
              : null;
          const newPkId = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
          const maxSeqNum =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
              : null;
          const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;

          const updatedNotes = property.blpuNotes ? [...property.blpuNotes] : [];
          if (noteOpen)
            updatedNotes.push({
              uprn: property.uprn,
              note: note,
              changeType: "I",
              pkId: newPkId,
              seqNum: newSeqNum,
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
              blpuNotes: updatedNotes,
              classifications: property.classifications,
              organisations: property.organisations,
              successorCrossRefs: property.successorCrossRefs,
              lpis: property.lpis.map((lpi) => {
                return {
                  ...lpi,
                  changeType: "U",
                  usrn: street ? street : lpi.usrn,
                  postcodeRef: postcode ? postcode : lpi.postcodeRef,
                  postTownRef: postTown ? postTown : lpi.postTownRef,
                  subLocalityRef: subLocality ? subLocality : lpi.subLocalityRef,
                  postallyAddressable: postalAddress ? postalAddress : lpi.postallyAddressable,
                  officialFlag: officialFlag ? officialFlag : lpi.officialFlag,
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
            failedCount.current++;
            setRangeProcessedCount(updatedCount.current + failedCount.current);
          }
        }
      }
    }
  };

  /**
   * Method used to add the new lookup.
   *
   * @param {object} data The data returned from the add lookup dialog.
   */
  const handleDoneAddLookup = async (data) => {
    currentVariant.current = getLookupVariantString(data.variant);

    const addResults = await addLookup(
      data,
      settingsContext.authorityCode,
      userContext,
      settingsContext.isWelsh,
      lookupContext.currentLookups
    );

    if (addResults && addResults.result) {
      if (addResults.updatedLookups && addResults.updatedLookups.length > 0)
        lookupContext.onUpdateLookup(data.variant, addResults.updatedLookups);

      switch (data.variant) {
        case "postcode":
          setPostcode(addResults.newLookup.postcodeRef);
          break;

        case "postTown":
          setPostTown(addResults.newLookup.postTownRef);
          break;

        case "subLocality":
          setSubLocality(addResults.newLookup.subLocalityRef);
          break;

        default:
          break;
      }

      addResult.current = true;
    } else addResult.current = false;
    setEngError(addResults ? addResults.engError : null);
    setAltLanguageError(addResults ? addResults.altLanguageError : null);

    setShowAddDialog(!addResult.current);
  };

  /**
   * Event to handle when the add lookup dialog is closed.
   */
  const handleCloseAddLookup = () => {
    setShowAddDialog(false);
  };

  useEffect(() => {
    setStreetLookup(lookupContext.currentLookups.streetDescriptors.filter((x) => x.language === "ENG"));
  }, [lookupContext.currentLookups.streetDescriptors]);

  useEffect(() => {
    setPostTownLookup(
      lookupContext.currentLookups.postTowns
        .filter((x) => x.language === "ENG" && !x.historic)
        .sort(function (a, b) {
          return a.postTown.localeCompare(b.postTown, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.postTowns]);

  useEffect(() => {
    setSubLocalityLookup(
      lookupContext.currentLookups.subLocalities
        .filter((x) => x.language === "ENG" && !x.historic)
        .sort(function (a, b) {
          return a.subLocality.localeCompare(b.subLocality, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.subLocalities]);

  useEffect(() => {
    setPostcodeLookup(
      lookupContext.currentLookups.postcodes
        .filter((x) => !x.historic)
        .sort(function (a, b) {
          return a.postcode.localeCompare(b.postcode, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.postcodes]);

  useEffect(() => {
    if (isOpen) {
      setTitle("Edit address");
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
    <>
      <Dialog
        open={showDialog}
        aria-labelledby="multi-edit-address-fields-dialog"
        fullWidth
        maxWidth="sm"
        onClose={handleDialogClose}
      >
        <ADSDialogTitle title={`${title}`} closeTooltip="Close" onClose={handleCancelClick} />
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          {!completed ? (
            <Fragment>
              <Typography variant="body1" gutterBottom sx={{ ml: theme.spacing(1.25) }}>
                Choose the updates that you wish to apply to the selected properties
              </Typography>
              <Grid2 container justifyContent="center" alignItems="center">
                <Grid2 size={12}>
                  <ADSSelectControl
                    label="Street"
                    isEditable
                    useRounded
                    disabled={updating}
                    displayNoChange
                    lookupData={streetLookup}
                    lookupId="usrn"
                    lookupLabel="address"
                    value={street}
                    errorText={null}
                    onChange={handleStreetChangeEvent}
                    helperText="Unique Street reference number."
                  />
                </Grid2>
                <Grid2 size={12}>
                  <ADSSelectControl
                    label="Post town"
                    isEditable
                    useRounded
                    disabled={updating}
                    displayNoChange
                    allowAddLookup
                    lookupData={postTownLookup}
                    lookupId="postTownRef"
                    lookupLabel="postTown"
                    value={postTown}
                    errorText={null}
                    onChange={handlePostTownChangeEvent}
                    onAddLookup={handleAddPostTownEvent}
                    helperText="Allocated by the Royal Mail to assist in delivery of mail."
                  />
                </Grid2>
                {settingsContext.isScottish && (
                  <Grid2 size={12}>
                    <ADSSelectControl
                      label="Sub-locality"
                      isEditable
                      useRounded
                      disabled={updating}
                      displayNoChange
                      allowAddLookup
                      lookupData={subLocalityLookup}
                      lookupId="subLocalityRef"
                      lookupLabel="subLocality"
                      value={subLocality}
                      errorText={null}
                      onChange={handleSubLocalityChangeEvent}
                      onAddLookup={handleAddSubLocalityEvent}
                      helperText="Third level of geographic area name. e.g. to record an island name or property group."
                    />
                  </Grid2>
                )}
                <Grid2 size={12}>
                  <ADSSelectControl
                    label="Postcode"
                    isEditable
                    useRounded
                    disabled={updating}
                    doNotSetTitleCase
                    displayNoChange
                    allowAddLookup
                    lookupData={postcodeLookup}
                    lookupId="postcodeRef"
                    lookupLabel="postcode"
                    value={postcode}
                    errorText={null}
                    onChange={handlePostcodeChangeEvent}
                    onAddLookup={handleAddPostcodeEvent}
                    helperText="Allocated by the Royal Mail to assist in delivery of mail."
                  />
                </Grid2>
                <Grid2 size={12}>
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
                </Grid2>
                <Grid2 size={12}>
                  <ADSSelectControl
                    label={`${settingsContext.isScottish ? "Postally addressable" : "Postal address"}`}
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
                </Grid2>
                {noteOpen && (
                  <Grid2 size={12}>
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
                          key="multi-edit-address-fields-errors"
                        >
                          {finaliseErrors.map((rec, index) => (
                            <ListItem
                              alignItems="flex-start"
                              dense
                              divider
                              id={`multi-edit-address-fields-error-${index}`}
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
      <AddLookupDialog
        isOpen={showAddDialog}
        variant={lookupType}
        errorEng={engError}
        errorAltLanguage={altLanguageError}
        onDone={(data) => handleDoneAddLookup(data)}
        onClose={handleCloseAddLookup}
      />
    </>
  );
}

export default MultiEditAddressFieldsDialog;
