/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Address List
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   29.03.23 Sean Flook         WI40639 Correctly set the note when adding a new one.
//    003   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    006   20.11.23 Sean Flook                 Tweak the classification code for street BLPUs.
//    007   20.11.23 Sean Flook                 Undone above change.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and sorted some warnings.
//    009   30.11.23 Sean Flook                 Change required for Scottish authorities.
//    010   05.01.24 Sean Flook                 Use CSS shortcuts.
//    011   12.01.24 Sean Flook                 Fixed duplicate key warning.
//    012   16.01.24 Sean Flook                 Changes required to fix warnings.
//    013   25.01.24 Sean Flook                 Changes required after UX review.
//    014   08.02.24 Joel Benford         RTAB3 Supply null street state to classification icon tooltip
//    015   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    016   11.04.24 Sean Flook       IMANN-384 Hide information and selection control when updating.
//    017   12.04.24 Sean Flook       IMANN-384 Clear checked when updating.
//    018   25.04.24 Sean Flook                 Display the information control for the wizard as well.
//    019   08.05.24 Sean Flook       IMANN-447 Added exclude from export and site visit to the options of fields that can be edited.
//    020   18.06.24 Sean Flook       IMANN-599 Use the correct classification when moving BLPUs for Scottish authorities.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useRef, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";

import {
  Checkbox,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  ListItem,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "./ADSActionButton";
import ADSSelectionControl from "./ADSSelectionControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import WizardActionDialog from "../dialogs/WizardActionDialog";

import { GetAvatarColour, GetAvatarTooltip } from "../utils/HelperUtils";
import { ValidatePropertyDetails } from "../utils/WizardValidation";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import GetClassificationIcon from "../utils/ADSClassificationIcons";

import { adsBlueA, adsMidGreyA, adsRed, adsRed10, adsOffWhite, adsPaleBlueA } from "../utils/ADSColours";
import {
  toolbarStyle,
  tooltipStyle,
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  dataFormStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

ADSWizardAddressList.propTypes = {
  data: PropTypes.array.isRequired,
  checked: PropTypes.array.isRequired,
  errors: PropTypes.array,
  haveMoveBlpu: PropTypes.bool,
  updating: PropTypes.bool,
  onCheckedChanged: PropTypes.func.isRequired,
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

ADSWizardAddressList.defaultProps = {
  haveMoveBlpu: false,
  updating: false,
};

function ADSWizardAddressList({
  data,
  checked,
  errors,
  haveMoveBlpu,
  updating,
  onCheckedChanged,
  onDataChanged,
  onErrorChanged,
}) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);

  const [allChecked, setAllChecked] = useState(false);
  const [partialChecked, setPartialChecked] = useState(false);

  const [anchorActionsEl, setAnchorActionsEl] = useState(null);

  const [itemSelected, setItemSelected] = useState(null);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionData, setActionData] = useState("");
  const addressListData = useRef(null);

  const [addressErrors, setAddressErrors] = useState([]);

  const actionAddressIds = useRef(null);
  const actionCount = useRef(0);

  /**
   * Event to handle when the select checkbox is clicked.
   */
  const handleSelectCheckboxClick = () => {
    if (allChecked) {
      onCheckedChanged([]);
      mapContext.onHighlightClear();
    } else {
      const newChecked = data.filter((x) => x.language === "ENG").map((x) => x.id);
      onCheckedChanged(newChecked);
      mapContext.onHighlightStreetProperty(null, newChecked);
    }
  };

  /**
   * Event to handle toggling of the control.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleToggle = (event, rec) => {
    event.stopPropagation();

    const currentIndex = checked.indexOf(rec.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(rec.id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    mapContext.onHighlightStreetProperty(null, newChecked);

    onCheckedChanged(newChecked);
  };

  /**
   * Method to get the list of address ids.
   *
   * @param {object} rec The record object.
   * @returns {array} The list of address ids.
   */
  const getActionAddressIds = (rec) => {
    if (rec) {
      const addressIds = [rec.id];

      if (settingsContext.isWelsh) addressIds.push(rec.id.replace("ENG", "CYM"));
      else if (settingsContext.isScottish) addressIds.push(rec.id.replace("ENG", "GAE"));

      return addressIds;
    } else if (checked && checked.length > 0) {
      const addressIds = checked.map((x) => x);

      if (settingsContext.isWelsh) {
        for (const engId of checked) {
          addressIds.push(engId.replace("ENG", "CYM"));
        }
      } else if (settingsContext.isScottish) {
        for (const engId of checked) {
          addressIds.push(engId.replace("ENG", "GAE"));
        }
      }

      return addressIds;
    } else return null;
  };

  /**
   * Event to handle adding notes.
   */
  const handleAddNotes = () => {
    if (checked && checked.length > 0) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(null);
      actionCount.current = checked.length;
      setActionData("");
      setActionType("note");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the data.
   *
   * @param {string} variant The type of information that is to be edited.
   */
  const handleEditWizard = (variant) => {
    if (checked && checked.length > 0) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(null);
      actionCount.current = checked.length;
      const editRecord = data.find((x) => x.id === checked[0]);
      if (editRecord) {
        switch (variant) {
          case "classification":
            setActionData(
              settingsContext.isScottish ? editRecord.classification.classification : editRecord.blpu.classification
            );
            break;

          case "level":
            setActionData(editRecord.lpi.level ? editRecord.lpi.level : settingsContext.isScottish ? 0 : "");
            break;

          case "postcode":
            setActionData(editRecord.addressDetails.postcodeRef);
            break;

          case "postTown":
            if (settingsContext.isScottish) {
              const gaeRecord = data.find((x) => x.id === checked[0].replace("ENG", "GAE"));
              if (gaeRecord)
                setActionData({
                  eng: editRecord.addressDetails.postTownRef,
                  alt: gaeRecord.addressDetails.postTownRef,
                });
              else setActionData({ eng: editRecord.addressDetails.postTownRef, alt: null });
            } else if (settingsContext.isWelsh) {
              const cymRecord = data.find((x) => x.id === checked[0].replace("ENG", "CYM"));
              if (cymRecord)
                setActionData({
                  eng: editRecord.addressDetails.postTownRef,
                  alt: cymRecord.addressDetails.postTownRef,
                });
              else setActionData({ eng: editRecord.addressDetails.postTownRef, alt: null });
            } else setActionData({ eng: editRecord.addressDetails.postTownRef, alt: null });
            break;

          case "rpc":
            setActionData(editRecord.blpu.rpc);
            break;

          default:
            break;
        }

        setActionType(variant);
        setOpenAction(true);
      }
    }
  };

  /**
   * Event to handle deleting of addresses.
   */
  const handleDeleteWizard = () => {
    if (checked && checked.length > 0) {
      actionAddressIds.current = getActionAddressIds(null);
      actionCount.current = checked.length;
      setOpenDeleteConfirmation(true);
    }
  };

  /**
   * Event to handle closing the selection.
   */
  const handleCloseSelection = () => {
    if (onCheckedChanged) onCheckedChanged([]);
    mapContext.onHighlightClear();
  };

  /**
   * Event to handle the display of the actions context menu.
   *
   * @param {object} event The event object.
   */
  const handleActionsMenuClick = (event) => {
    setAnchorActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle the closing of the actions context menu.
   *
   * @param {object} event The event object.
   */
  const handleActionsMenuClose = (event) => {
    setAnchorActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle selecting a record.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleSelectRecord = (event, rec) => {
    handleActionsMenuClose(event);
    setItemSelected(rec.id);
  };

  /**
   * Event to handle the mouse entering a record.
   *
   * @param {object} rec The record object.
   */
  const handleMouseEnter = (rec) => {
    setItemSelected(rec.id);

    if (checked.length === 0) {
      mapContext.onHighlightStreetProperty(null, [rec.id]);
    } else {
      if (checked.includes(rec.id)) mapContext.onHighlightStreetProperty(null, checked);
      else {
        const newChecked = checked.map((x) => x);
        newChecked.push(rec.id);
        mapContext.onHighlightStreetProperty(null, newChecked);
      }
    }
  };

  /**
   * Event to handle the mouse leaving a record.
   *
   * @param {object} rec The record object.
   */
  const handleMouseLeave = (rec) => {
    setItemSelected(null);

    if (!checked.includes(rec.id)) {
      const checkedIndex = mapContext.currentHighlight.property
        ? mapContext.currentHighlight.property.indexOf(rec.id)
        : -1;
      const newChecked = mapContext.currentHighlight.property ? [...mapContext.currentHighlight.property] : [];
      if (checkedIndex > -1) newChecked.splice(checkedIndex, 1);
      mapContext.onHighlightStreetProperty(null, newChecked);
    }
  };

  /**
   * Event to handle the deletion of an address.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleDeleteAddress = (event, rec) => {
    event.stopPropagation();
    if (rec) {
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setOpenDeleteConfirmation(true);
    }
  };

  /**
   * Event to handle the closing of the delete confirmation dialog.
   *
   * @param {boolean} deleteConfirmed If true the delete was confirmed.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);

    if (deleteConfirmed && onDataChanged && actionAddressIds.current) {
      onDataChanged(data.filter((x) => !actionAddressIds.current.includes(x.id)));
      actionAddressIds.current = null;
      actionCount.current = 0;
    }
  };

  /**
   * Event to handle editing the classification.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditClassification = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData(settingsContext.isScottish ? rec.classification.classification : rec.blpu.classification);
      setActionType("classification");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the exclude from export.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditExcludeFromExport = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData(rec.blpu.excludeFromExport);
      setActionType("excludeFromExport");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the site visit required.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditSiteVisit = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData(rec.blpu.siteVisit);
      setActionType("siteVisit");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the level.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditLevel = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData(settingsContext.isScottish ? rec.blpu.level : rec.lpi.level);
      setActionType("level");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the postcode.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditPostcode = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData(rec.addressDetails.postcodeRef);
      setActionType("postcode");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the post town.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditPostTown = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      if (settingsContext.isScottish) {
        const gaeRecord = data.find((x) => x.id === rec.id.replace("ENG", "GAE"));
        if (gaeRecord)
          setActionData({ eng: rec.addressDetails.postTownRef, alt: gaeRecord.addressDetails.postTownRef });
        else setActionData({ eng: rec.addressDetails.postTownRef, alt: null });
      } else if (settingsContext.isWelsh) {
        const cymRecord = data.find((x) => x.id === rec.id.replace("ENG", "CYM"));
        if (cymRecord)
          setActionData({ eng: rec.addressDetails.postTownRef, alt: cymRecord.addressDetails.postTownRef });
        else {
          const cymPostTownRec = lookupContext.currentLookups.postTowns.find(
            (x) => x.linkedRef === rec.addressDetails.postTownRef && x.language === "CYM"
          );
          if (cymPostTownRec) setActionData({ eng: rec.addressDetails.postTownRef, alt: cymPostTownRec.postTownRef });
          else setActionData({ eng: rec.addressDetails.postTownRef, alt: null });
        }
      } else setActionData({ eng: rec.addressDetails.postTownRef, alt: null });
      setActionType("postTown");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the sub-locality.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditSubLocality = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      const gaeRecord = data.find((x) => x.id === rec.id.replace("ENG", "GAE"));
      if (gaeRecord)
        setActionData({ eng: rec.addressDetails.subLocalityRef, alt: gaeRecord.addressDetails.subLocalityRef });
      else setActionData({ eng: rec.addressDetails.subLocalityRef, alt: null });
      setActionType("subLocality");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle editing the RPC.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleEditRpc = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData(rec.blpu.rpc);
      setActionType("rpc");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle adding a note.
   *
   * @param {object} event The event object.
   * @param {object} rec The record object.
   */
  const handleAddNote = (event, rec) => {
    handleActionsMenuClose(event);
    if (rec) {
      addressListData.current = data;
      actionAddressIds.current = getActionAddressIds(rec);
      actionCount.current = 1;
      setActionData("");
      setActionType("note");
      setOpenAction(true);
    }
  };

  /**
   * Event to handle when an action has been completed.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleCloseAction = (updatedData) => {
    if (actionAddressIds.current) {
      let updatedRecords = addressListData.current.map((x) => x);

      for (const updateId of actionAddressIds.current) {
        const currentRecord = addressListData.current.find((x) => x.id === updateId);

        if (currentRecord) {
          switch (actionType) {
            case "classification":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: currentRecord.addressDetails,
                      blpu: settingsContext.isScottish
                        ? currentRecord.blpu
                        : {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: currentRecord.blpu.rpc,
                            state: currentRecord.blpu.state,
                            stateDate: currentRecord.blpu.stateDate,
                            classification: updatedData,
                            excludeFromExport: currentRecord.blpu.excludeFromExport,
                            siteVisit: currentRecord.blpu.siteVisit,
                            startDate: currentRecord.blpu.startDate,
                          },
                      lpi: currentRecord.lpi,
                      classification: settingsContext.isScottish
                        ? {
                            classification: updatedData,
                            classificationScheme: currentRecord.classification.classificationScheme,
                            startDate: currentRecord.classification.startDate,
                          }
                        : currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "excludeFromExport":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: currentRecord.addressDetails,
                      blpu: settingsContext.isScottish
                        ? {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: currentRecord.blpu.rpc,
                            level: currentRecord.blpu.level,
                            excludeFromExport: updatedData,
                            siteVisit: currentRecord.blpu.siteVisit,
                            startDate: currentRecord.blpu.startDate,
                          }
                        : {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: currentRecord.blpu.rpc,
                            state: currentRecord.blpu.state,
                            stateDate: currentRecord.blpu.stateDate,
                            classification: currentRecord.blpu.classification,
                            excludeFromExport: updatedData,
                            siteVisit: currentRecord.blpu.siteVisit,
                            startDate: currentRecord.blpu.startDate,
                          },
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "siteVisit":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: currentRecord.addressDetails,
                      blpu: settingsContext.isScottish
                        ? {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: currentRecord.blpu.rpc,
                            level: currentRecord.blpu.level,
                            excludeFromExport: currentRecord.blpu.excludeFromExport,
                            siteVisit: updatedData,
                            startDate: currentRecord.blpu.startDate,
                          }
                        : {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: currentRecord.blpu.rpc,
                            state: currentRecord.blpu.state,
                            stateDate: currentRecord.blpu.stateDate,
                            classification: currentRecord.blpu.classification,
                            excludeFromExport: currentRecord.blpu.excludeFromExport,
                            siteVisit: updatedData,
                            startDate: currentRecord.blpu.startDate,
                          },
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "level":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: currentRecord.addressDetails,
                      blpu: settingsContext.isScottish
                        ? {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: currentRecord.blpu.rpc,
                            level: updatedData,
                            excludeFromExport: currentRecord.blpu.excludeFromExport,
                            siteVisit: currentRecord.blpu.siteVisit,
                            startDate: currentRecord.blpu.startDate,
                          }
                        : currentRecord.blpu,
                      lpi: settingsContext.isScottish
                        ? currentRecord.lpi
                        : {
                            logicalStatus: currentRecord.lpi.logicalStatus,
                            level: updatedData,
                            officialAddress: currentRecord.lpi.officialAddress,
                            postallyAddressable: currentRecord.lpi.postallyAddressable,
                            startDate: currentRecord.lpi.startDate,
                          },
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "postcode":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: {
                        id: currentRecord.addressDetails.id,
                        address: currentRecord.addressDetails.address,
                        mapLabel: currentRecord.addressDetails.mapLabel,
                        saoStartNumber: currentRecord.addressDetails.saoStartNumber,
                        saoStartSuffix: currentRecord.addressDetails.saoStartSuffix,
                        saoEndNumber: currentRecord.addressDetails.saoEndNumber,
                        saoEndSuffix: currentRecord.addressDetails.saoEndSuffix,
                        saoText: currentRecord.addressDetails.saoText,
                        paoStartNumber: currentRecord.addressDetails.paoStartNumber,
                        paoStartSuffix: currentRecord.addressDetails.paoStartSuffix,
                        paoEndNumber: currentRecord.addressDetails.paoEndNumber,
                        paoEndSuffix: currentRecord.addressDetails.paoEndSuffix,
                        paoText: currentRecord.addressDetails.paoText,
                        paoDetails: currentRecord.addressDetails.paoDetails,
                        usrn: currentRecord.addressDetails.usrn,
                        postTownRef: currentRecord.addressDetails.postTownRef,
                        subLocalityRef: currentRecord.addressDetails.subLocalityRef,
                        postcodeRef: updatedData,
                        included: currentRecord.addressDetails.included,
                      },
                      blpu: currentRecord.blpu,
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "postTown":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: {
                        id: currentRecord.addressDetails.id,
                        address: currentRecord.addressDetails.address,
                        mapLabel: currentRecord.addressDetails.mapLabel,
                        saoStartNumber: currentRecord.addressDetails.saoStartNumber,
                        saoStartSuffix: currentRecord.addressDetails.saoStartSuffix,
                        saoEndNumber: currentRecord.addressDetails.saoEndNumber,
                        saoEndSuffix: currentRecord.addressDetails.saoEndSuffix,
                        saoText: currentRecord.addressDetails.saoText,
                        paoStartNumber: currentRecord.addressDetails.paoStartNumber,
                        paoStartSuffix: currentRecord.addressDetails.paoStartSuffix,
                        paoEndNumber: currentRecord.addressDetails.paoEndNumber,
                        paoEndSuffix: currentRecord.addressDetails.paoEndSuffix,
                        paoText: currentRecord.addressDetails.paoText,
                        paoDetails: currentRecord.addressDetails.paoDetails,
                        usrn: currentRecord.addressDetails.usrn,
                        postTownRef: currentRecord.language === "ENG" ? updatedData.eng : updatedData.alt,
                        subLocalityRef: currentRecord.addressDetails.subLocalityRef,
                        postcodeRef: currentRecord.addressDetails.postcodeRef,
                        included: currentRecord.addressDetails.included,
                      },
                      blpu: currentRecord.blpu,
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "subLocality":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: {
                        id: currentRecord.addressDetails.id,
                        address: currentRecord.addressDetails.address,
                        mapLabel: currentRecord.addressDetails.mapLabel,
                        saoStartNumber: currentRecord.addressDetails.saoStartNumber,
                        saoStartSuffix: currentRecord.addressDetails.saoStartSuffix,
                        saoEndNumber: currentRecord.addressDetails.saoEndNumber,
                        saoEndSuffix: currentRecord.addressDetails.saoEndSuffix,
                        saoText: currentRecord.addressDetails.saoText,
                        paoStartNumber: currentRecord.addressDetails.paoStartNumber,
                        paoStartSuffix: currentRecord.addressDetails.paoStartSuffix,
                        paoEndNumber: currentRecord.addressDetails.paoEndNumber,
                        paoEndSuffix: currentRecord.addressDetails.paoEndSuffix,
                        paoText: currentRecord.addressDetails.paoText,
                        paoDetails: currentRecord.addressDetails.paoDetails,
                        usrn: currentRecord.addressDetails.usrn,
                        postTownRef: currentRecord.addressDetails.postTownRef,
                        subLocalityRef: currentRecord.language === "ENG" ? updatedData.eng : updatedData.alt,
                        postcodeRef: currentRecord.addressDetails.postcodeRef,
                        included: currentRecord.addressDetails.included,
                      },
                      blpu: currentRecord.blpu,
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "note":
              let updatedNote = null;

              if (!currentRecord.other.note) updatedNote = updatedData;
              else if (Array.isArray(currentRecord.other.note)) {
                updatedNote = currentRecord.other.note.map((x) => x);
                updatedNote.push(updatedData);
              } else updatedNote = [currentRecord.other.note, updatedData];

              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: currentRecord.addressDetails,
                      blpu: currentRecord.blpu,
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: {
                        provCode: currentRecord.other.provCode,
                        provStartDate: currentRecord.other.provStartDate,
                        note: updatedNote,
                      },
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "rpc":
              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      language: currentRecord.language,
                      addressDetails: currentRecord.addressDetails,
                      blpu: settingsContext.isScottish
                        ? {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: updatedData,
                            level: currentRecord.blpu.level,
                            excludeFromExport: currentRecord.blpu.excludeFromExport,
                            siteVisit: currentRecord.blpu.siteVisit,
                            startDate: currentRecord.blpu.startDate,
                          }
                        : {
                            logicalStatus: currentRecord.blpu.logicalStatus,
                            rpc: updatedData,
                            state: currentRecord.blpu.state,
                            stateDate: currentRecord.blpu.stateDate,
                            classification: currentRecord.blpu.classification,
                            excludeFromExport: currentRecord.blpu.excludeFromExport,
                            siteVisit: currentRecord.blpu.siteVisit,
                            startDate: currentRecord.blpu.startDate,
                          },
                      lpi: currentRecord.lpi,
                      classification: currentRecord.classification,
                      other: currentRecord.other,
                      parentUprn: currentRecord.parentUprn,
                      easting: currentRecord.easting,
                      northing: currentRecord.northing,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            default:
              break;
          }
        }
      }

      if (updatedRecords && updatedRecords.length > 0) {
        const finaliseErrors = [];
        for (const rec of updatedRecords) {
          const propertyDetailErrors = ValidatePropertyDetails(
            rec.blpu,
            rec.lpi,
            rec.classification,
            rec.other,
            lookupContext.currentLookups,
            settingsContext.isScottish,
            rec.addressDetails.postTownRef,
            rec.addressDetails.postcodeRef,
            haveMoveBlpu
          );

          if (
            propertyDetailErrors.blpu.length > 0 ||
            propertyDetailErrors.lpi.length > 0 ||
            propertyDetailErrors.classification.length > 0 ||
            propertyDetailErrors.other.length > 0
          ) {
            finaliseErrors.push({ id: rec.id, errors: propertyDetailErrors });
          }
        }

        setAddressErrors(finaliseErrors);

        if (onDataChanged) onDataChanged(updatedRecords);
        if (onErrorChanged) onErrorChanged(finaliseErrors);
      } else {
        if (onDataChanged) onDataChanged(updatedRecords);
        if (onErrorChanged) onErrorChanged(null);
      }

      actionAddressIds.current = null;
      actionCount.current = 0;
      setActionData("");
      setActionType(null);
      setOpenAction(false);
    }
  };

  /**
   * Event to handle when an action has been canceled.
   */
  const handleCancelAction = () => {
    setActionData("");
    setActionType(null);
    setOpenAction(false);
  };

  /**
   * Method to display the list of errors.
   *
   * @param {object} rec The record object.
   * @returns {JSX.Element|null} The list of errors.
   */
  const getErrors = (rec) => {
    const foundErrors = addressErrors ? addressErrors.find((x) => x.id === rec.id) : null;

    if (foundErrors) {
      const blpuErrors =
        foundErrors.errors.blpu && foundErrors.errors.blpu.length > 0
          ? [...new Set(foundErrors.errors.blpu.flatMap((x) => x.errors))]
          : [];
      const lpiErrors =
        foundErrors.errors.lpi && foundErrors.errors.lpi.length > 0
          ? [...new Set(foundErrors.errors.lpi.flatMap((x) => x.errors))]
          : [];
      const otherErrors =
        foundErrors.errors.other && foundErrors.errors.other.length > 0
          ? [...new Set(foundErrors.errors.other.flatMap((x) => x.errors))]
          : [];
      const provenanceErrors =
        foundErrors.errors.provenance && foundErrors.errors.provenance.length > 0
          ? [...new Set(foundErrors.errors.provenance.flatMap((x) => x.errors))]
          : [];
      const crossRefErrors =
        foundErrors.errors.crossRef && foundErrors.errors.crossRef.length > 0
          ? [...new Set(foundErrors.errors.crossRef.flatMap((x) => x.errors))]
          : [];
      const noteErrors =
        foundErrors.errors.note && foundErrors.errors.note.length > 0
          ? [...new Set(foundErrors.errors.note.flatMap((x) => x.errors))]
          : [];
      const itemErrors = [
        ...new Set([
          ...blpuErrors,
          ...lpiErrors,
          ...otherErrors,
          ...provenanceErrors,
          ...crossRefErrors,
          ...noteErrors,
        ]),
      ];

      return (
        <List component="div" disablePadding>
          {itemErrors &&
            itemErrors.length > 0 &&
            itemErrors.map((error, idx) => (
              <ListItem sx={{ pl: 9, backgroundColor: adsRed10 }} divider key={`${rec.id}-error-${idx}`}>
                <ListItemIcon>
                  <PriorityHighIcon sx={{ color: adsRed, height: "16px", width: "16px" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      id={`${rec.id}-${idx}`}
                      variant="body2"
                      color={adsRed}
                      align="left"
                      sx={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      {error}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
        </List>
      );
    } else return null;
  };

  /**
   * Method to get the address item styling.
   *
   * @param {number} recId The record id.
   * @returns {object} The address item styling.
   */
  const getAddressItemStyle = (recId) => {
    if ((itemSelected && itemSelected === recId) || checked.indexOf(recId) !== -1)
      return {
        pl: theme.spacing(1.5),
        pt: theme.spacing(1),
        pr: theme.spacing(1),
        height: "42px",
      };
    else
      return {
        pl: "42px",
        pt: theme.spacing(1),
        pr: theme.spacing(1),
        height: "42px",
      };
  };

  /**
   * Method to get the list item button styling.
   *
   * @param {number} recId The record id.
   * @returns {object} The styling for the list item button.
   */
  const getListItemButtonStyle = (recId) => {
    const foundErrors = addressErrors ? addressErrors.find((x) => x.id === recId) : null;
    const selected = checked.indexOf(recId) !== -1;

    if (foundErrors) {
      if (selected)
        return {
          height: "50px",
          backgroundColor: adsRed10,
        };
      else
        return {
          height: "50px",
          backgroundColor: adsRed10,
          "&:hover": {
            color: adsRed,
          },
        };
    } else {
      if (selected)
        return {
          height: "50px",
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        };
      else
        return {
          height: "50px",
          "&:hover": {
            backgroundColor: adsPaleBlueA,
            color: adsBlueA,
          },
        };
    }
  };

  useEffect(() => {
    setAllChecked(data && checked && checked.length === data.filter((x) => x.language === "ENG").length);
    setPartialChecked(
      data && checked && checked.length > 0 && checked.length !== data.filter((x) => x.language === "ENG").length
    );
  }, [checked, data]);

  useEffect(() => {
    setAddressErrors(errors);
  }, [errors]);

  useEffect(() => {
    if (updating && checked && checked.length) {
      onCheckedChanged([]);
      mapContext.onHighlightClear();
    }
  }, [updating, checked, onCheckedChanged, mapContext]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ backgroundColor: adsOffWhite, pr: "17px" }}
        >
          <Tooltip title="Toggle select all / none" arrow placement="right" sx={tooltipStyle}>
            <Checkbox
              sx={{
                pr: theme.spacing(0),
              }}
              checked={allChecked}
              color="primary"
              indeterminate={partialChecked}
              onClick={handleSelectCheckboxClick}
            />
          </Tooltip>
          {checked &&
            checked.length > 0 &&
            !updating &&
            (haveMoveBlpu ? (
              <ADSSelectionControl
                selectionCount={checked && checked.length > 0 ? checked.length : 0}
                haveMoveBlpu
                onAddNote={handleAddNotes}
                onEditWizard={handleEditWizard}
                onClose={handleCloseSelection}
              />
            ) : (
              <ADSSelectionControl
                selectionCount={checked && checked.length > 0 ? checked.length : 0}
                haveWizard
                onAddNote={handleAddNotes}
                onEditWizard={handleEditWizard}
                onDeleteWizard={handleDeleteWizard}
                onClose={handleCloseSelection}
              />
            ))}
          {!updating && <ADSInformationControl variant={haveMoveBlpu ? "moveBLPU" : "propertyWizard"} />}
        </Stack>
      </Box>
      <Box sx={dataFormStyle(haveMoveBlpu ? "ADSWizardAddressListMoveBlpu" : "ADSWizardAddressListWizard")}>
        <List
          id="ads-wizard-address-list"
          sx={{
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            pt: theme.spacing(0),
          }}
          component="nav"
          key={"list_wizard-address-list"}
        >
          {data && data.filter((x) => x.language === "ENG").length > 0 ? (
            data
              .filter((x) => x.language === "ENG")
              .map((rec, idx) => (
                <Fragment key={`address_list_${idx}`}>
                  <ListItemButton
                    divider
                    dense
                    disableGutters
                    sx={getListItemButtonStyle(rec.id)}
                    selected={itemSelected && itemSelected === rec.id}
                    onClick={(event) => handleSelectRecord(event, rec)}
                    onMouseEnter={() => handleMouseEnter(rec)}
                    onMouseLeave={() => handleMouseLeave(rec)}
                    id={rec.id}
                    key={`wizard-address-${rec.id}-${idx}`}
                  >
                    <ListItemIcon sx={getAddressItemStyle(rec.id)}>
                      {((itemSelected && itemSelected === rec.id) || checked.indexOf(rec.id) !== -1) && (
                        <Checkbox
                          edge="start"
                          checked={checked.indexOf(rec.id) !== -1}
                          color="primary"
                          tabIndex={-1}
                          onClick={(event) => handleToggle(event, rec)}
                          id={`wizard_address_list_checkbox_${rec.id}`}
                          sx={{ pb: theme.spacing(2.25), color: adsMidGreyA }}
                        />
                      )}
                      <Tooltip
                        title={GetAvatarTooltip(
                          21,
                          rec.blpu.logicalStatus,
                          settingsContext.isScottish && !haveMoveBlpu
                            ? rec.classification.classification
                            : rec.blpu.classification,
                          null,
                          settingsContext.isScottish
                        )}
                        arrow
                        placement="bottom"
                        sx={tooltipStyle}
                      >
                        {GetClassificationIcon(
                          settingsContext.isScottish && !haveMoveBlpu
                            ? rec.classification.classification
                              ? rec.classification.classification
                              : "U"
                            : rec.blpu.classification
                            ? rec.blpu.classification
                            : "U",
                          GetAvatarColour(rec.blpu.logicalStatus)
                        )}
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="subtitle1">{rec.addressDetails.address}</Typography>} />
                    <ListItemAvatar
                      sx={{
                        minWidth: 32,
                      }}
                    >
                      {itemSelected && itemSelected === rec.id && (
                        <Fragment>
                          {!haveMoveBlpu && (
                            <ADSActionButton
                              variant="delete"
                              inheritBackground
                              tooltipTitle="Delete address"
                              tooltipPlacement="right"
                              onClick={(event) => handleDeleteAddress(event, rec)}
                            />
                          )}
                          <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                            <IconButton
                              onClick={handleActionsMenuClick}
                              aria-controls="wizard-addresses-actions-menu"
                              aria-haspopup="true"
                              size="small"
                            >
                              <MoreVertIcon sx={ActionIconStyle()} />
                            </IconButton>
                          </Tooltip>
                          <Menu
                            id="wizard-addresses-actions-menu"
                            elevation={2}
                            anchorEl={anchorActionsEl}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                            keepMounted
                            open={Boolean(anchorActionsEl)}
                            onClose={handleActionsMenuClose}
                            sx={menuStyle}
                          >
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleEditClassification(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit classification</Typography>
                              </MenuItem>
                            )}
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleEditExcludeFromExport(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit exclude from export</Typography>
                              </MenuItem>
                            )}
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleEditSiteVisit(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit site visit required</Typography>
                              </MenuItem>
                            )}
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleEditLevel(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit level</Typography>
                              </MenuItem>
                            )}
                            {settingsContext.isScottish && !haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleEditSubLocality(event, rec)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Edit sub-locality</Typography>
                              </MenuItem>
                            )}
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleEditPostTown(event, rec)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Edit post town</Typography>
                              </MenuItem>
                            )}
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => handleEditPostcode(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit postcode</Typography>
                              </MenuItem>
                            )}
                            {haveMoveBlpu && (
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => handleEditRpc(event, rec)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Edit RPC</Typography>
                              </MenuItem>
                            )}
                            <MenuItem
                              dense
                              divider={!haveMoveBlpu}
                              onClick={(event) => handleAddNote(event, rec)}
                              sx={menuItemStyle(!haveMoveBlpu)}
                            >
                              <Typography variant="inherit">Add note</Typography>
                            </MenuItem>
                            {!haveMoveBlpu && (
                              <MenuItem
                                dense
                                onClick={(event) => handleDeleteAddress(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit" color="error">
                                  Delete
                                </Typography>
                              </MenuItem>
                            )}
                          </Menu>
                        </Fragment>
                      )}
                    </ListItemAvatar>
                  </ListItemButton>
                  {getErrors(rec)}
                </Fragment>
              ))
          ) : (
            <ListItem key="No results">
              <ListItemText
                primary={
                  <Typography variant="body2">{`${
                    haveMoveBlpu ? "No properties selected" : "No addresses can be generated from your data"
                  }`}</Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant={"address"}
          recordCount={actionCount.current}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
        <WizardActionDialog
          variant={actionType}
          open={openAction}
          recordCount={actionCount.current}
          data={actionData}
          onClose={handleCloseAction}
          onCancel={handleCancelAction}
        />
      </div>
    </Fragment>
  );
}

export default ADSWizardAddressList;
