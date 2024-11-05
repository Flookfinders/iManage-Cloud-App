//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to make a property a child of another property
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   27.02.24 Sean Flook           MUL16 Initial Revision.
//    002   12.03.24 Sean Flook           MUL10 Display errors in a list control.
//    003   22.03.24 Sean Flook           MUL16 Correctly set the address data.
//    004   25.03.24 Sean Flook           MUL16 Added cascade address changes option.
//    005   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    006   04.04.24 Sean Flook                 Added parentUprn to mapContext search data for properties.
//    007   23.05.24 Sean Flook       IMANN-486 Changed seqNo to seqNum.
//    008   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    009   30.09.24 Sean Flook       IMANN-605 Display the selected parent address on the first page once selected.
//    010   14.10.24 Sean Flook      IMANN-1016 Changes required to handle LLPG Streets.
//    011   01.11.24 Sean Flook      IMANN-1010 Include new fields in search results.
//#endregion Version 1.0.1.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import PropertyContext from "../context/propertyContext";
import SearchContext from "../context/searchContext";
import MapContext from "../context/mapContext";

import {
  GetParentHierarchy,
  GetPropertyMapData,
  SaveProperty,
  addressToTitleCase,
  getClassificationCode,
} from "./../utils/PropertyUtils";
import { renderErrorListItem } from "../utils/HelperUtils";

import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Box,
  Grid,
  List,
  ListItem,
} from "@mui/material";
import { Stack } from "@mui/system";
import ADSSearch from "../components/ADSSearch";
import ADSTextControl from "../components/ADSTextControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { adsRed, adsLightGreyC, adsGreenC } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MakeChildDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(["property", "multi"]).isRequired,
  selectedUPRNs: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MakeChildDialog({ isOpen, variant, selectedUPRNs, onClose }) {
  const theme = useTheme();

  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const propertyContext = useContext(PropertyContext);
  const searchContext = useContext(SearchContext);
  const mapContext = useContext(MapContext);

  const [showDialog, setShowDialog] = useState(false);
  const [step, setStep] = useState(0);
  const [parentUprn, setParentUprn] = useState(0);
  const [parentAddress, setParentAddress] = useState("");
  const [parentPostcode, setParentPostcode] = useState("");
  const [updateAddress, setUpdateAddress] = useState(true);
  const [updateAllAddresses, setUpdateAllAddresses] = useState(false);
  const [cascadeUpdates, setCascadeUpdates] = useState(false);
  const [action, setAction] = useState("leave");
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [processedCount, setProcessedCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [finaliseErrors, setFinaliseErrors] = useState([]);

  const properties = useRef(null);
  const savedProperty = useRef(null);
  const updateErrors = useRef([]);
  const totalCount = useRef(0);
  const updatedCount = useRef(0);
  const failedCount = useRef(0);
  const failedIds = useRef([]);

  /**
   * Event to handle when the continue button is clicked
   */
  const handleContinueClick = () => {
    if (variant === "multi") setStep(1);
    else if (parentUprn) {
      if (onClose) onClose({ uprn: parentUprn, address: parentAddress, postcode: parentPostcode });
    }
  };

  /**
   * Event to handle when the confirm button is clicked
   */
  const handleConfirmClick = () => {
    const setError = (error, childProperty) => {
      const engLpi = childProperty.lpis
        .filter((x) => x.language === "ENG")
        .sort((a, b) => a.logicalStatus - b.logicalStatus);

      if (engLpi && engLpi.length > 0) {
        properties.current.push({
          id: childProperty.pkId,
          uprn: childProperty.uprn,
          address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
        });
      }

      propertyContext.onPropertyErrors(
        [
          {
            field: "UPRN",
            errors: [error],
          },
        ],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        childProperty.pkId
      );
    };

    const getAddressText = (childLpi, parentLpi, parentProperties, isPao) => {
      const grandParentLpi = parentProperties.grandParent
        ? parentProperties.grandParent.lpis.find(
            (p) => p.logicalStatus === parentProperties.grandParent.logicalStatus && p.language === childLpi.language
          )
        : null;

      const greatGrandParentLpi = parentProperties.greatGrandParent
        ? parentProperties.greatGrandParent.lpis.find(
            (p) =>
              p.logicalStatus === parentProperties.greatGrandParent.logicalStatus && p.language === childLpi.language
          )
        : null;

      if (greatGrandParentLpi) {
        if (isPao) {
          return greatGrandParentLpi.paoText && grandParentLpi.saoText
            ? `${grandParentLpi.saoText} ${greatGrandParentLpi.paoText}`
            : greatGrandParentLpi.paoText && !grandParentLpi.saoText
            ? greatGrandParentLpi.paoText
            : !greatGrandParentLpi.paoText && grandParentLpi.saoText
            ? grandParentLpi.saoText
            : null;
        } else {
          return childLpi.paoText && parentLpi.saoText && grandParentLpi.saoText
            ? `${childLpi.paoText} ${parentLpi.saoText.replace(grandParentLpi.saoText, "").trim()}`
            : childLpi.paoText && parentLpi.saoText && !grandParentLpi.saoText
            ? `${childLpi.paoText} ${parentLpi.saoText}`
            : childLpi.paoText && !parentLpi.saoText
            ? childLpi.paoText
            : !childLpi.paoText && parentLpi.saoText && grandParentLpi.saoText
            ? parentLpi.saoText.replace(grandParentLpi.saoText, "").trim()
            : !childLpi.paoText && parentLpi.saoText && !grandParentLpi.saoText
            ? parentLpi.saoText
            : null;
        }
      } else if (grandParentLpi) {
        if (isPao) {
          return grandParentLpi.paoText && grandParentLpi.saoText
            ? `${grandParentLpi.paoText} ${grandParentLpi.saoText}`
            : grandParentLpi.paoText && !grandParentLpi.saoText
            ? grandParentLpi.paoText
            : !grandParentLpi.paoText && grandParentLpi.saoText
            ? grandParentLpi.saoText
            : null;
        } else {
          return childLpi.paoText && parentLpi.saoText
            ? `${childLpi.paoText} ${parentLpi.saoText}`
            : childLpi.paoText && !parentLpi.saoText
            ? childLpi.paoText
            : !childLpi.paoText && parentLpi.saoText
            ? parentLpi.saoText
            : null;
        }
      } else {
        if (isPao) {
          return parentLpi.paoText && parentLpi.saoText
            ? `${parentLpi.paoText} ${parentLpi.saoText}`
            : parentLpi.paoText && !parentLpi.saoText
            ? parentLpi.paoText
            : !parentLpi.paoText && parentLpi.saoText
            ? parentLpi.saoText
            : null;
        } else {
          return childLpi.paoText && childLpi.saoText
            ? `${childLpi.paoText} ${childLpi.saoText}`
            : childLpi.paoText && !childLpi.saoText
            ? childLpi.paoText
            : !childLpi.paoText && childLpi.saoText
            ? childLpi.saoText
            : null;
        }
      }
    };

    if (selectedUPRNs && selectedUPRNs.length && parentUprn) {
      setUpdating(true);
      properties.current = [];
      savedProperty.current = [];
      totalCount.current = selectedUPRNs.length;
      updatedCount.current = 0;
      failedCount.current = 0;
      updateErrors.current = null;
      failedIds.current = [];
      setFinaliseErrors([]);

      GetParentHierarchy(parentUprn, userContext).then((parentProperties) => {
        if (parentProperties) {
          selectedUPRNs.forEach((childUprn) => {
            GetPropertyMapData(childUprn, userContext).then((childProperty) => {
              if (childProperty) {
                if (!childProperty.parentUprn || action === "replace") {
                  if (parentProperties.parent.currentParentChildLevel === 4) {
                    setError("Parent is already at the maximum BLPU hierarchy level.", childProperty);
                  } else if (
                    childProperty.existingParentChildLevels -
                      childProperty.currentParentChildLevel +
                      parentProperties.parent.currentParentChildLevel >
                    3
                  ) {
                    setError("New relationship would exceed the maximum BLPU hierarchy level.", childProperty);
                  } else if (childProperty.logicalStatus < parentProperties.parent.logicalStatus) {
                    setError("Child has a lower logical status than the parent logical status.", childProperty);
                  } else {
                    const engLpi = childProperty.lpis
                      .filter((x) => x.language === "ENG")
                      .sort((a, b) => a.logicalStatus - b.logicalStatus);

                    if (engLpi && engLpi.length > 0) {
                      properties.current.push({
                        id: childProperty.pkId,
                        uprn: childProperty.uprn,
                        address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
                      });
                    }

                    let updatedLpis = [...childProperty.lpis];

                    if (updateAddress) {
                      updatedLpis = childProperty.lpis.map((x) => {
                        const parentLpi = parentProperties.parent.lpis.find(
                          (p) => p.logicalStatus === parentProperties.parent.logicalStatus && p.language === x.language
                        );

                        if (parentLpi && (updateAllAddresses || x.logicalStatus === childProperty.logicalStatus)) {
                          return settingsContext.isScottish
                            ? {
                                language: x.language,
                                startDate: x.startDate,
                                endDate: x.endDate,
                                saoStartNumber: x.paoStartNumber,
                                saoEndNumber: x.paoEndNumber,
                                saoText: getAddressText(x, parentLpi, parentProperties, false),
                                paoStartNumber: parentLpi.paoStartNumber,
                                paoEndNumber: parentLpi.paoEndNumber,
                                paoText: getAddressText(x, parentLpi, parentProperties, true),
                                usrn: x.usrn,
                                postcodeRef: x.postcodeRef,
                                postTownRef: x.postTownRef,
                                neverExport: x.neverExport,
                                postTown: x.postTown,
                                postcode: x.postcode,
                                dualLanguageLink: x.dualLanguageLink,
                                uprn: x.uprn,
                                logicalStatus: x.logicalStatus,
                                paoStartSuffix: parentLpi.paoStartSuffix,
                                paoEndSuffix: parentLpi.paoEndSuffix,
                                saoStartSuffix: x.paoStartSuffix,
                                saoEndSuffix: x.paoEndSuffix,
                                subLocalityRef: x.subLocalityRef,
                                subLocality: x.subLocality,
                                postallyAddressable: x.postallyAddressable,
                                officialFlag: x.officialFlag,
                                pkId: x.pkId,
                                changeType: "U",
                                lpiKey: x.lpiKey,
                                address: x.address,
                                entryDate: x.entryDate,
                                lastUpdateDate: x.lastUpdateDate,
                              }
                            : {
                                language: x.language,
                                startDate: x.startDate,
                                endDate: x.endDate,
                                saoStartNumber: x.paoStartNumber,
                                saoEndNumber: x.paoEndNumber,
                                saoText: getAddressText(x, parentLpi, parentProperties, false),
                                paoStartNumber: parentLpi.paoStartNumber,
                                paoEndNumber: parentLpi.paoEndNumber,
                                paoText: getAddressText(x, parentLpi, parentProperties, true),
                                usrn: x.usrn,
                                postcodeRef: x.postcodeRef,
                                postTownRef: x.postTownRef,
                                neverExport: x.neverExport,
                                postTown: x.postTown,
                                postcode: x.postcode,
                                dualLanguageLink: x.dualLanguageLink,
                                uprn: x.uprn,
                                logicalStatus: x.logicalStatus,
                                paoStartSuffix: parentLpi.paoStartSuffix,
                                paoEndSuffix: parentLpi.paoEndSuffix,
                                saoStartSuffix: x.paoStartSuffix,
                                saoEndSuffix: x.paoEndSuffix,
                                level: x.level,
                                postalAddress: x.postalAddress,
                                officialFlag: x.officialFlag,
                                pkId: x.pkId,
                                changeType: "U",
                                lpiKey: x.lpiKey,
                                address: x.address,
                                entryDate: x.entryDate,
                                lastUpdateDate: x.lastUpdateDate,
                              };
                        } else return x;
                      });
                    }

                    const minPkIdNote =
                      childProperty.blpuNotes && childProperty.blpuNotes.length > 0
                        ? childProperty.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
                        : null;

                    const newPkIdNote =
                      !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;

                    const maxSeqNumNote =
                      childProperty.blpuNotes && childProperty.blpuNotes.length > 0
                        ? childProperty.blpuNotes.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
                        : null;

                    const newSeqNumNote = maxSeqNumNote && maxSeqNumNote.seqNum ? maxSeqNumNote.seqNum + 1 : 1;

                    const updatedNotes = childProperty.blpuNotes ? [...childProperty.blpuNotes] : [];

                    if (noteOpen)
                      updatedNotes.push({
                        uprn: childProperty.uprn,
                        note: note,
                        changeType: "I",
                        pkId: newPkIdNote,
                        seqNum: newSeqNumNote,
                      });

                    const updatedChildProperty = settingsContext.isScottish
                      ? {
                          blpuStateDate: childProperty.blpuStateDate,
                          parentUprn:
                            childProperty.parentUprn && action === "leave" ? childProperty.parentUprn : parentUprn,
                          neverExport: childProperty.neverExport,
                          siteSurvey: childProperty.siteSurvey,
                          uprn: childProperty.uprn,
                          logicalStatus: childProperty.logicalStatus,
                          endDate: childProperty.endDate,
                          startDate: childProperty.startDate,
                          blpuState: childProperty.blpuState,
                          custodianCode: childProperty.custodianCode,
                          level: childProperty.level,
                          xcoordinate: childProperty.xcoordinate ? childProperty.xcoordinate : 0,
                          ycoordinate: childProperty.ycoordinate ? childProperty.ycoordinate : 0,
                          pkId: childProperty.pkId,
                          changeType: "U",
                          rpc: childProperty.rpc,
                          blpuAppCrossRefs: childProperty.blpuAppCrossRefs,
                          blpuProvenances: childProperty.blpuProvenances,
                          blpuNotes: updatedNotes,
                          classifications: childProperty.classifications,
                          organisations: childProperty.organisations,
                          successorCrossRefs: childProperty.successorCrossRefs,
                          lpis: updatedLpis,
                        }
                      : {
                          changeType: "U",
                          blpuStateDate: childProperty.blpuStateDate,
                          rpc: childProperty.rpc,
                          startDate: childProperty.startDate,
                          endDate: childProperty.endDate,
                          parentUprn:
                            childProperty.parentUprn && action === "leave" ? childProperty.parentUprn : parentUprn,
                          neverExport: childProperty.neverExport,
                          siteSurvey: childProperty.siteSurvey,
                          uprn: childProperty.uprn,
                          logicalStatus: childProperty.logicalStatus,
                          blpuState: childProperty.blpuState,
                          blpuClass: childProperty.blpuClass,
                          localCustodianCode: childProperty.localCustodianCode,
                          organisation: childProperty.organisation,
                          xcoordinate: childProperty.xcoordinate ? childProperty.xcoordinate : 0,
                          ycoordinate: childProperty.ycoordinate ? childProperty.ycoordinate : 0,
                          wardCode: childProperty.wardCode,
                          parishCode: childProperty.parishCode,
                          pkId: childProperty.pkId,
                          blpuAppCrossRefs: childProperty.blpuAppCrossRefs,
                          blpuProvenances: childProperty.blpuProvenances,
                          blpuNotes: updatedNotes,
                          lpis: updatedLpis,
                        };

                    SaveProperty(
                      updatedChildProperty,
                      false,
                      userContext,
                      propertyContext,
                      settingsContext.isScottish
                    ).then((result) => {
                      if (result) {
                        updatedCount.current++;
                        savedProperty.current.push(result);

                        const newSearchLpis = result.lpis.map((x) => {
                          return {
                            type: 24,
                            id: x.lpiKey,
                            uprn: x.uprn,
                            usrn: x.usrn,
                            logical_status: x.logicalStatus,
                            language: x.language,
                            classification_code: getClassificationCode(result),
                            isParent: false,
                            parent_uprn: result.parentUprn,
                            country: null,
                            authority: null,
                            longitude: null,
                            latitude: null,
                            easting: result.xcoordinate,
                            northing: result.ycoordinate,
                            full_building_desc: null,
                            formattedaddress: x.address,
                            organisation: null,
                            secondary_name: null,
                            sao_text: null,
                            sao_nums: null,
                            primary_name: null,
                            pao_text: null,
                            pao_nums: null,
                            street: null,
                            locality: null,
                            town: null,
                            post_town: x.postTown,
                            postcode: x.postcode,
                            crossref: null,
                            lpi_st_ref_type: 1,
                            blpu_state: 2,
                            address: x.address,
                            sort_code: 0,
                          };
                        });
                        const newSearchData = searchContext.currentSearchData.results.map(
                          (x) => newSearchLpis.find((rec) => x.type === 24 && rec.id === x.id) || x
                        );
                        searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newSearchData);

                        const newMapSearchLpis = result.lpis
                          .filter((x) => x.language === "ENG")
                          .map((x) => {
                            return {
                              uprn: x.uprn.toString(),
                              parentUprn: result.parentUprn,
                              address: x.address,
                              formattedAddress: x.address,
                              postcode: x.postcode,
                              easting: result.xcoordinate,
                              northing: result.ycoordinate,
                              logicalStatus: x.logicalStatus,
                              classificationCode: getClassificationCode(result),
                            };
                          });
                        const newMapSearchProperties = mapContext.currentSearchData.properties.map(
                          (x) => newMapSearchLpis.find((rec) => rec.uprn === x.uprn) || x
                        );
                        mapContext.onSearchDataChange(
                          mapContext.currentSearchData.streets,
                          mapContext.currentSearchData.llpgStreets,
                          newMapSearchProperties,
                          null,
                          null
                        );

                        setProcessedCount(updatedCount.current + failedCount.current);
                      }
                    });
                  }
                }
              }
            });
          });
        }
      });
    }
  };

  /**
   * Event to handle when the cancel button is clicked
   */
  const handleCancelClick = () => {
    if (onClose) onClose(null);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the search has selected a property.
   *
   * @param {object} property The selected property.
   */
  const handleSearchClick = (property) => {
    if (property && property.type === 24) {
      setParentUprn(property.uprn);
      setParentAddress(property.address);
      setParentPostcode(property.postcode);
    } else {
      setParentUprn(0);
      setParentAddress("");
      setParentPostcode("");
    }
  };

  /**
   * Event to handle when the edit button is clicked.
   */
  const handleEditParentClick = () => {
    setParentUprn(0);
    setParentAddress("");
    setParentPostcode("");
    setStep(0);
  };

  const handleAddToListClick = () => {};

  /**
   * Event to handle when the update address details switch is clicked.
   */
  const handleUpdateAddressChangeEvent = () => {
    setUpdateAddress(!updateAddress);
  };

  /**
   * Event to handle when the update all addresses switch is clicked.
   */
  const handleUpdateAllAddressesChangeEvent = () => {
    setUpdateAllAddresses(!updateAllAddresses);
  };

  /**
   * Event to handle when the cascade updates switch is clicked.
   */
  const handleCascadeUpdatesChangeEvent = () => {
    setCascadeUpdates(!cascadeUpdates);
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
   * Event to handle when the add note button is clicked.
   */
  const handleAddNoteClick = () => {
    setNoteOpen(true);
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
   * Method to get the content for the dialog.
   *
   * @returns {JSX.Element} The controls to display in the dialog.
   */
  const getContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={2}>
            <Typography variant="body2">{`Select the parent property for the chosen ${
              selectedUPRNs && selectedUPRNs.length > 1 ? "properties" : "property"
            }:`}</Typography>
            <ADSSearch variant="makeChild" placeholder="Search for a property" onSearchClick={handleSearchClick} />
            {parentAddress.length > 0 && (
              <Typography variant="body2">{`Parent: ${addressToTitleCase(parentAddress, parentPostcode)}`}</Typography>
            )}
          </Stack>
        );

      case 1:
        return (
          <Grid container justifyContent="flex-start" alignItems="center" columnSpacing={0.5} rowSpacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2">You have chosen the following parent property:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {addressToTitleCase(parentAddress, parentPostcode)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Button
                onClick={handleEditParentClick}
                disabled={updating}
                variant="contained"
                sx={whiteButtonStyle}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{`Update the address details of the ${
                selectedUPRNs && selectedUPRNs.length > 1 ? "children" : "child"
              } to match the parent's address details?`}</Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"update-address-make-child-switch"}
                    disabled={updating}
                    checked={updateAddress}
                    onChange={handleUpdateAddressChangeEvent}
                    color="primary"
                  />
                }
                label={updateAddress ? "Yes" : "No"}
                labelPlacement="end"
              />
            </Grid>
            {updateAddress && (
              <>
                <Grid item xs={8}>
                  <Typography variant="body2">{`Update all addresses of the ${
                    selectedUPRNs && selectedUPRNs.length > 1 ? "children" : "child"
                  } if there are multiple addresses?`}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    value="end"
                    control={
                      <Switch
                        id={"all-addresses-make-child-switch"}
                        disabled={updating}
                        checked={updateAllAddresses}
                        onChange={handleUpdateAllAddressesChangeEvent}
                        color="primary"
                      />
                    }
                    label={updateAllAddresses ? "Yes" : "No"}
                    labelPlacement="end"
                  />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    Cascade updates to address details to any children if present?
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    value="end"
                    control={
                      <Switch
                        id={"cascade-updates-make-child-switch"}
                        disabled={updating}
                        checked={cascadeUpdates}
                        onChange={handleCascadeUpdatesChangeEvent}
                        color="primary"
                      />
                    }
                    label={cascadeUpdates ? "Yes" : "No"}
                    labelPlacement="end"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={8}>
              <Typography variant="body2">If a property already has a parent UPRN?</Typography>
            </Grid>
            <Grid item xs={4}>
              <RadioGroup
                aria-labelledby="make-child-of-radio-buttons-group"
                name="make-child-of-action-radio-buttons-group"
                disabled={updating}
                value={action}
                onChange={handleActionChangeEvent}
              >
                <FormControlLabel
                  value="leave"
                  control={<Radio disabled={updating} />}
                  label={<Typography variant="body2">Keep existing</Typography>}
                />
                <FormControlLabel
                  value="replace"
                  control={<Radio disabled={updating} />}
                  label={<Typography variant="body2">Replace with new</Typography>}
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              {!noteOpen && (
                <Button
                  onClick={handleAddNoteClick}
                  disabled={updating}
                  variant="contained"
                  sx={whiteButtonStyle}
                  startIcon={<NoteAddIcon />}
                >
                  Add note
                </Button>
              )}
              {noteOpen && (
                <Box>
                  <Typography variant="body2">Note</Typography>
                  <ADSTextControl
                    isEditable
                    disabled={updating}
                    noLeftPadding
                    value={note}
                    id="make-child-of-note"
                    maxLength={4000}
                    minLines={2}
                    maxLines={10}
                    onChange={handleNoteChangeEvent}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
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
                    <List sx={{ width: "100%", pt: "0px", pb: "0px" }} component="nav" key="make-child-of-errors">
                      {finaliseErrors.map((rec, index) => (
                        <ListItem alignItems="flex-start" dense divider id={`make-child-of-error-${index}`}>
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
        );

      default:
        return null;
    }
  };

  /**
   * Method to get the actions buttons for the dialog.
   *
   * @returns {JSX.Element} The buttons that should appear in the dialog actions section.
   */
  const getActions = () => {
    switch (step) {
      case 0:
        return variant === "multi" ? (
          <Button
            variant="contained"
            onClick={handleContinueClick}
            disabled={!parentUprn}
            sx={blueButtonStyle}
            startIcon={<ArrowForwardIcon />}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleContinueClick}
            disabled={!parentUprn}
            sx={blueButtonStyle}
            startIcon={<DoneIcon />}
          >
            Confirm
          </Button>
        );

      case 1:
        return (
          <>
            <Button
              variant="contained"
              onClick={handleConfirmClick}
              autoFocus
              sx={blueButtonStyle}
              startIcon={<DoneIcon />}
            >
              Confirm
            </Button>
            <Button variant="contained" onClick={handleCancelClick} sx={whiteButtonStyle} startIcon={<CloseIcon />}>
              Cancel
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <Button variant="contained" onClick={handleCancelClick} sx={blueButtonStyle} startIcon={<CloseIcon />}>
              Close
            </Button>
          </>
        );

      default:
        break;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setParentUprn(0);
      setParentAddress("");
      setParentPostcode("");
      setUpdateAddress(true);
      setNoteOpen(false);
      setProcessedCount(0);
      setUpdating(false);

      updateErrors.current = null;
      totalCount.current = 0;
      updatedCount.current = 0;
      failedCount.current = 0;
    }

    if (showDialog !== isOpen) setShowDialog(isOpen);
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
        setProcessedCount(updatedCount.current + failedCount.current);
      }
    }
  }, [propertyContext.currentErrors, propertyContext.currentPropertyHasErrors]);

  useEffect(() => {
    if (totalCount.current > 0 && totalCount.current === updatedCount.current + failedCount.current) {
      setUpdating(false);
      setStep(2);
    }
  }, [processedCount]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="make-child-of-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleCancelClick}
    >
      <ADSDialogTitle
        title={`Make selected ${
          selectedUPRNs && selectedUPRNs.length > 1 ? "properties children" : "property child"
        } of...`}
        closeTooltip="Cancel"
        onClose={handleCancelClick}
      />
      <DialogContent sx={{ mt: theme.spacing(2) }}>{getContent()}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(2.25) }}>
        {getActions()}
      </DialogActions>
    </Dialog>
  );
}

export default MakeChildDialog;
