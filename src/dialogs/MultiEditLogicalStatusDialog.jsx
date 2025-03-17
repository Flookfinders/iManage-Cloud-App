//region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to multi-edit the logical status
//
//  Copyright:    © 2023 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   17.10.23 Sean Flook        IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   30.11.23 Sean Flook                  Removed redundant code.
//    004   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    005   05.01.24 Sean Flook                  Use CSS shortcuts.
//    006   11.01.24 Sean Flook                  Fix warnings.
//    007   16.01.24 Sean Flook                  Changes required to fix warnings.
//    008   27.02.24 Sean Flook            MUL15 Changed to use dialogTitleStyle and renderErrors.
//    009   11.03.24 Sean Flook            MUL13 Changed control alignment.
//    010   11.03.24 Sean Flook            MUL11 Reset counts when closing dialog.
//    011   12.03.24 Sean Flook            MUL10 Display errors in a list control.
//    012   27.03.24 Sean Flook                  Added ADSDialogTitle.
//    013   09.04.24 Sean Flook        IMANN-376 Allow lookups to be added on the fly.
//    014   22.05.24 Sean Flook        IMANN-473 Corrected label for Scottish authorities.
//    015   23.05.24 Sean Flook        IMANN-486 Changed seqNo to seqNum.
//    016   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    017   08.07.24 Sean Flook        IMANN-715 Increase the failed count if failed to save property.
//    018   03.09.24 Sean Flook        IMANN-969 Corrected field name and show state for Scottish authorities.
//    019   05.09.24 Sean Flook        IMANN-978 Set the state if required for OneScotland authorities.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    020   24.10.24 Sean Flook       IMANN-1033 Only sort and filter lookups when required.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    021   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    022   14.03.25 Sean Flook       IMANN-1689 No need to get the GAE postcode ref.
//    023   14.03.25 Sean Flook        IMANN-955 Do not count failures twice.
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
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import AddLookupDialog from "../dialogs/AddLookupDialog";

import {
  GetLookupLabel,
  addLookup,
  GetCurrentDate,
  GetCheck,
  GetErrorMessage,
  filteredLookup,
  renderErrorListItem,
  getLookupVariantString,
} from "../utils/HelperUtils";
import {
  FilteredBLPUState,
  FilteredRepresentativePointCode,
  GetPropertyMapData,
  SaveProperty,
  addressToTitleCase,
} from "../utils/PropertyUtils";
import { ValidateMultiEditLogicalStatus } from "../utils/PropertyValidation";

import OfficialAddress from "./../data/OfficialAddress";
import PostallyAddressable from "./../data/PostallyAddressable";

import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { adsGreenC, adsRed, adsLightGreyC } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MultiEditLogicalStatusDialog.propTypes = {
  variant: PropTypes.oneOf(["approved", "historic", "unknown"]).isRequired,
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditLogicalStatusDialog({ variant, propertyUprns, isOpen, onClose }) {
  const theme = useTheme();
  // const classes = useStyles();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);

  const [showDialog, setShowDialog] = useState(false);
  const [state, setState] = useState(null);
  const [rpc, setRpc] = useState(null);
  const [officialFlag, setOfficialFlag] = useState(null);
  const [postalAddress, setPostalAddress] = useState(null);
  const [postTown, setPostTown] = useState(null);
  const [subLocality, setSubLocality] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [postTownLookup, setPostTownLookup] = useState([]);
  const [subLocalityLookup, setSubLocalityLookup] = useState([]);
  const [postcodeLookup, setPostcodeLookup] = useState([]);

  const [stateError, setStateError] = useState(null);
  const [rpcError, setRpcError] = useState(null);
  const [officialFlagError, setOfficialFlagError] = useState(null);
  const [postalAddressError, setPostalAddressError] = useState(null);
  const [postTownRefError, setPostTownRefError] = useState(null);
  const [subLocalityError, setSubLocalityError] = useState(null);
  const [postcodeRefError, setPostcodeRefError] = useState(null);

  const [titleLogicalStatus, setTitleLogicalStatus] = useState(null);
  const [blpuLogicalStatus, setBlpuLogicalStatus] = useState(null);
  const [lpiLogicalStatus, setLpiLogicalStatus] = useState(null);

  const [blpuStateLookup, setBLPUStateLookup] = useState(FilteredBLPUState(settingsContext.isScottish, null));
  const [representativePointCodeLookup, setRepresentativePointCodeLookup] = useState(
    FilteredRepresentativePointCode(settingsContext.isScottish, true)
  );

  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finaliseErrors, setFinaliseErrors] = useState([]);
  const [haveErrors, setHaveErrors] = useState(false);
  const [rangeProcessedCount, setRangeProcessedCount] = useState(0);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

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
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    const validationData = {
      logicalStatus: variant === "historic" ? 8 : 1,
      blpuState: state,
      rpc: rpc,
      officialFlag: officialFlag,
      postalAddress: postalAddress,
      postTownRef: postTown,
      postcodeRef: postcode,
    };

    const validationErrors = ValidateMultiEditLogicalStatus(
      validationData,
      lookupContext.currentLookups,
      settingsContext.isScottish
    );

    setStateError(null);
    setRpcError(null);
    setOfficialFlagError(null);
    setPostalAddressError(null);
    setPostTownRefError(null);
    setSubLocalityError(null);
    setPostcodeRefError(null);

    if (validationErrors && validationErrors.length > 0) {
      for (const error of validationErrors) {
        switch (error.field.toLowerCase()) {
          case "blpustate":
            setStateError(error.errors);
            break;

          case "rpc":
            setRpcError(error.errors);
            break;

          case "officialflag":
            setOfficialFlagError(error.errors);
            break;

          case "postaladdress":
            setPostalAddressError(error.errors);
            break;

          case "posttown":
          case "posttownref":
            setPostTownRefError(error.errors);
            break;

          case "sublocality":
          case "sublocalityref":
            setSubLocalityError(error.errors);
            break;

          case "postcode":
          case "postcoderef":
            setPostcodeRefError(error.errors);
            break;

          default:
            break;
        }
      }

      return false;
    } else return true;
  };

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
   * Event to handle when the State value changes.
   *
   * @param {number|null} newValue The new state value.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
  };

  /**
   * Event to handle when the RPC value changes.
   *
   * @param {number|null} newValue The new RPC value.
   */
  const handleRpcChangeEvent = (newValue) => {
    setRpc(newValue);
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
    try {
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
          const duplicateApprovedCheck = GetCheck(
            2400048,
            lookupContext.currentLookups,
            "MultiEditUpdateProperties",
            settingsContext.isScottish,
            false
          );

          for (const propertyUprn of propertyUprns) {
            const property = await GetPropertyMapData(propertyUprn, userContext);

            if (property) {
              let updatedProperty = null;

              const newLogicalStatus = variant === "historic" ? 8 : 1;

              const engLpi = property.lpis.filter((x) => x.language === "ENG");
              if (engLpi && engLpi.length > 0) {
                properties.current.push({
                  id: property.pkId,
                  uprn: property.uprn,
                  address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
                });
              }

              const updatedCrossRefs = !property.blpuAppCrossRefs
                ? []
                : variant === "historic"
                ? property.blpuAppCrossRefs.map((x) => {
                    return { ...x, endDate: currentDate, changeType: "U" };
                  })
                : property.blpuAppCrossRefs;
              const updatedProvenances = !property.blpuProvenances
                ? []
                : variant === "historic"
                ? property.blpuProvenances.map((x) => {
                    return { ...x, endDate: currentDate, changeType: "U" };
                  })
                : property.blpuProvenances;

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
                if (variant === "approved" && property.lpis.length > 2) {
                  // Cannot have more than 1 logical status of Approved
                  propertyContext.onPropertyErrors(
                    [],
                    property.lpis.map((x, indx) => {
                      return {
                        field: "UPRN",
                        index: indx,
                        errors: [GetErrorMessage(duplicateApprovedCheck, settingsContext.isScottish)],
                      };
                    }),
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    property.pkId
                  );
                } else {
                  const cymPostTownRef = postTown
                    ? lookupContext.currentLookups.postTowns.find(
                        (x) => x.linkedRef === postTown && x.language === "CYM"
                      ).postTownRef
                    : null;

                  updatedProperty = {
                    changeType: "U",
                    blpuStateDate: state ? currentDate : property.blpuStateDate,
                    rpc: rpc ? rpc : property.rpc,
                    startDate: property.startDate,
                    endDate: variant === "historic" ? currentDate : null, //property.endDate,
                    parentUprn: property.parentUprn,
                    neverExport: property.neverExport,
                    siteSurvey: property.siteSurvey,
                    uprn: property.uprn,
                    logicalStatus: newLogicalStatus,
                    blpuState: state ? state : property.blpuState,
                    blpuClass: property.blpuClass,
                    localCustodianCode: property.localCustodianCode,
                    organisation: property.organisation,
                    xcoordinate: property.xcoordinate,
                    ycoordinate: property.ycoordinate,
                    wardCode: property.wardCode,
                    parishCode: property.parishCode,
                    pkId: property.pkId,
                    blpuAppCrossRefs: updatedCrossRefs,
                    blpuProvenances: updatedProvenances,
                    blpuNotes: updatedNotes,
                    lpis: property.lpis.map((lpi) => {
                      return {
                        ...lpi,
                        changeType: "U",
                        endDate: variant === "historic" ? currentDate : null, // lpi.endDate,
                        postcodeRef: postcode ? postcode : lpi.postcodeRef,
                        postTownRef: postTown ? (lpi.language === "ENG" ? postTown : cymPostTownRef) : lpi.postTownRef,
                        logicalStatus: newLogicalStatus,
                        postalAddress: postalAddress ? postalAddress : lpi.postalAddress,
                        officialFlag: officialFlag ? officialFlag : lpi.officialFlag,
                      };
                    }),
                  };
                }
              } else if (settingsContext.isScottish) {
                if (variant === "approved" && property.lpis.filter((x) => x.language === "ENG").length > 1) {
                  // Cannot have more than 1 logical status of Approved
                  propertyContext.onPropertyErrors(
                    [],
                    property.lpis.map((x, indx) => {
                      return {
                        field: "UPRN",
                        index: indx,
                        errors: [GetErrorMessage(duplicateApprovedCheck, settingsContext.isScottish)],
                      };
                    }),
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    property.pkId
                  );
                } else {
                  updatedProperty = {
                    changeType: "U",
                    blpuStateDate: state ? currentDate : property.blpuStateDate,
                    rpc: rpc ? rpc : property.rpc,
                    startDate: property.startDate,
                    endDate: variant === "historic" ? currentDate : property.endDate,
                    parentUprn: property.parentUprn,
                    neverExport: property.neverExport,
                    siteSurvey: property.siteSurvey,
                    uprn: property.uprn,
                    logicalStatus: newLogicalStatus,
                    blpuState: state ? state : property.blpuState,
                    blpuClass: property.blpuClass,
                    custodianCode: property.custodianCode,
                    organisation: property.organisation,
                    xcoordinate: property.xcoordinate,
                    ycoordinate: property.ycoordinate,
                    wardCode: property.wardCode,
                    parishCode: property.parishCode,
                    pkId: property.pkId,
                    blpuAppCrossRefs: updatedCrossRefs,
                    blpuProvenances: updatedProvenances,
                    classifications:
                      variant === "historic"
                        ? property.classifications.map((x) => {
                            return { ...x, endDate: currentDate, changeType: "U" };
                          })
                        : property.classifications,
                    organisations:
                      variant === "historic"
                        ? property.organisations.map((x) => {
                            return { ...x, endDate: currentDate, changeType: "U" };
                          })
                        : property.organisations,
                    successorCrossRefs:
                      variant === "historic"
                        ? property.successorCrossRefs.map((x) => {
                            return { ...x, endDate: currentDate, changeType: "U" };
                          })
                        : property.successorCrossRefs,
                    blpuNotes: updatedNotes,
                    lpis: property.lpis.map((lpi) => {
                      return {
                        ...lpi,
                        changeType: "U",
                        endDate: variant === "historic" ? currentDate : lpi.endDate,
                        postcodeRef: postcode ? postcode : lpi.postcodeRef,
                        postTownRef: postTown ? postTown : lpi.postTownRef,
                        logicalStatus: newLogicalStatus,
                      };
                    }),
                  };
                }
              } else {
                if (variant === "approved" && property.lpis.length > 1) {
                  // Cannot have more than 1 logical status of Approved
                  propertyContext.onPropertyErrors(
                    [],
                    property.lpis.map((x, indx) => {
                      return {
                        field: "UPRN",
                        index: indx,
                        errors: [GetErrorMessage(duplicateApprovedCheck, settingsContext.isScottish)],
                      };
                    }),
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    property.pkId
                  );
                } else {
                  updatedProperty = {
                    changeType: "U",
                    blpuStateDate: state ? currentDate : property.blpuStateDate,
                    rpc: rpc ? rpc : property.rpc,
                    startDate: property.startDate,
                    endDate: variant === "historic" ? currentDate : property.endDate,
                    parentUprn: property.parentUprn,
                    neverExport: property.neverExport,
                    siteSurvey: property.siteSurvey,
                    uprn: property.uprn,
                    logicalStatus: newLogicalStatus,
                    blpuState: state ? state : property.blpuState,
                    blpuClass: property.blpuClass,
                    localCustodianCode: property.localCustodianCode,
                    organisation: property.organisation,
                    xcoordinate: property.xcoordinate,
                    ycoordinate: property.ycoordinate,
                    wardCode: property.wardCode,
                    parishCode: property.parishCode,
                    pkId: property.pkId,
                    blpuAppCrossRefs: updatedCrossRefs,
                    blpuProvenances: updatedProvenances,
                    blpuNotes: updatedNotes,
                    lpis: property.lpis.map((lpi) => {
                      return {
                        ...lpi,
                        changeType: "U",
                        endDate: variant === "historic" ? currentDate : lpi.endDate,
                        postcodeRef: postcode ? postcode : lpi.postcodeRef,
                        postTownRef: postTown ? postTown : lpi.postTownRef,
                        logicalStatus: newLogicalStatus,
                        postalAddress: postalAddress ? postalAddress : lpi.postalAddress,
                        officialFlag: officialFlag ? officialFlag : lpi.officialFlag,
                      };
                    }),
                  };
                }
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
      }
    } finally {
      setUpdating(false);
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
    setRepresentativePointCodeLookup(FilteredRepresentativePointCode(settingsContext.isScottish, true));

    if (isOpen) {
      switch (variant) {
        case "historic":
          setTitleLogicalStatus("historical");
          setBlpuLogicalStatus("Historical");
          setLpiLogicalStatus("Historical");
          setBLPUStateLookup(FilteredBLPUState(settingsContext.isScottish, 8));
          break;

        default:
          setTitleLogicalStatus("approved");
          setBlpuLogicalStatus("Approved");
          setLpiLogicalStatus(settingsContext.isScottish ? "Approved/Preferred" : "Approved preferred");
          setBLPUStateLookup(FilteredBLPUState(settingsContext.isScottish, 1));
          break;
      }

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
  }, [variant, settingsContext.isScottish, isOpen]);

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
      switch (variant) {
        case "historic":
          setTitleLogicalStatus("historical: completed");
          break;

        default:
          setTitleLogicalStatus("approved: completed");
          break;
      }

      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount, variant]);

  return (
    <>
      <Dialog
        open={showDialog}
        aria-labelledby="multi-edit-logical-status-dialog"
        fullWidth
        maxWidth="sm"
        onClose={handleDialogClose}
      >
        <ADSDialogTitle title={`Set ${titleLogicalStatus}`} closeTooltip="Close" onClose={handleCancelClick} />
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          {!completed ? (
            <Fragment>
              <Typography variant="body1" gutterBottom sx={{ ml: theme.spacing(1.25) }}>
                {`Set the selected properties to ${titleLogicalStatus} with the following settings`}
              </Typography>
              <Grid2 container justifyContent="center" alignItems="center">
                <Grid2 size={12}>
                  <ADSReadOnlyControl label="BLPU logical status" value={blpuLogicalStatus} />
                </Grid2>
                <Grid2 size={12}>
                  <ADSReadOnlyControl label="LPI logical status" value={lpiLogicalStatus} />
                </Grid2>
                <Grid2 size={12}>
                  <ADSSelectControl
                    label="State"
                    isEditable
                    useRounded
                    disabled={updating}
                    doNotSetTitleCase
                    displayNoChange
                    lookupData={blpuStateLookup}
                    lookupId="id"
                    lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                    lookupColour="colour"
                    value={state}
                    errorText={stateError}
                    onChange={handleStateChangeEvent}
                    helperText="A code identifying the current state of a BLPU."
                  />
                </Grid2>
                <Grid2 size={12}>
                  <ADSSelectControl
                    label="RPC"
                    isEditable
                    useRounded
                    disabled={updating}
                    doNotSetTitleCase
                    displayNoChange
                    lookupData={representativePointCodeLookup}
                    lookupId="id"
                    lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                    lookupColour="colour"
                    value={rpc}
                    errorText={rpcError}
                    onChange={handleRpcChangeEvent}
                    helperText="Representative Point Code."
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
                    errorText={officialFlagError}
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
                    errorText={postalAddressError}
                    onChange={handlePostalAddressChangeEvent}
                    helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
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
                    errorText={postTownRefError}
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
                      errorText={subLocalityError}
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
                    errorText={postcodeRefError}
                    onChange={handlePostcodeChangeEvent}
                    onAddLookup={handleAddPostcodeEvent}
                    helperText="Allocated by the Royal Mail to assist in delivery of mail."
                  />
                </Grid2>
                {noteOpen && (
                  <Grid2 size={12}>
                    <ADSTextControl
                      isEditable
                      disabled={updating}
                      value={note}
                      id="logical_status_note"
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
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="flex-end"
                  spacing={1}
                  sx={{ ml: theme.spacing(1) }}
                >
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsGreenC }}>
                    {updatedCount.current}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    properties were successfully updated
                  </Typography>
                </Stack>
                {failedCount.current > 0 && (
                  <Stack direction="column" spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="flex-end"
                      spacing={1}
                      sx={{ ml: theme.spacing(1) }}
                    >
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
                          key="multi-edit-logical-status-errors"
                        >
                          {finaliseErrors.map((rec, index) => (
                            <ListItem
                              alignItems="flex-start"
                              dense
                              divider
                              id={`multi-edit-logical-status-error-${index}`}
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

export default MultiEditLogicalStatusDialog;
