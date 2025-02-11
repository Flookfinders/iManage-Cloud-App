//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Plot to Postal Finalise Page
//
//  Copyright:   © 2024 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.1.0
//    001   15.10.24 Sean Flook       IMANN-1012 Initial Revision.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    002   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import { GetAvatarColour, GetAvatarTooltip, StringToTitleCase } from "../utils/HelperUtils";
import { addressToTitleCase } from "../utils/PropertyUtils";

import {
  Backdrop,
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ADSSelectionControl from "../components/ADSSelectionControl";
import ADSActionButton from "../components/ADSActionButton";

import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import WizardActionDialog from "../dialogs/WizardActionDialog";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import GetClassificationIcon from "../utils/ADSClassificationIcons";
import { IndentIcon } from "../utils/ADSIcons";

import {
  ActionIconStyle,
  dataFormStyle,
  menuItemStyle,
  menuStyle,
  toolbarStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { adsBlueA, adsMidGreyA, adsOffWhite, adsPaleBlueA, adsRed, adsRed10 } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

PlotToPostalFinalisePage.propTypes = {
  data: PropTypes.array.isRequired,
  createGaelic: PropTypes.bool,
  checked: PropTypes.array.isRequired,
  errors: PropTypes.array,
  updating: PropTypes.bool,
  onCheckedChanged: PropTypes.func.isRequired,
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

PlotToPostalFinalisePage.defaultProps = {
  createGaelic: false,
  updating: false,
};

function PlotToPostalFinalisePage({
  data,
  createGaelic,
  checked,
  errors,
  updating,
  onCheckedChanged,
  onDataChanged,
  onErrorChanged,
}) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [allChecked, setAllChecked] = useState(false);
  const [partialChecked, setPartialChecked] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionData, setActionData] = useState("");
  const [addressErrors, setAddressErrors] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);
  const [anchorActionsEl, setAnchorActionsEl] = useState(null);

  const addressListData = useRef(null);
  const actionAddressIds = useRef(null);
  const actionCount = useRef(0);

  /**
   * Method to get the list of address ids.
   *
   * @param {object} rec The record object.
   * @returns {array} The list of address ids.
   */
  const getActionAddressIds = (rec) => {
    if (rec) {
      return [rec.id];
    } else if (checked && checked.length > 0) {
      const addressIds = checked.map((x) => x);
      return addressIds;
    } else return null;
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
      setActionData(rec.classification);
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
      setActionData(rec.excludeFromExport);
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
      setActionData(rec.siteVisit);
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
      setActionData(rec.level);
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
      setActionData(rec.postcodeRef);
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
      if (settingsContext.isWelsh || (settingsContext.isScottish && createGaelic))
        setActionData({ eng: rec.postTownRef, alt: rec.altLangPostTownRef });
      else setActionData({ eng: rec.postTownRef, alt: null });
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
      if (settingsContext.isScottish && createGaelic)
        setActionData({ eng: rec.addressDetails.subLocalityRef, alt: rec.altLangSubLocalityRef });
      else setActionData({ eng: rec.subLocalityRef, alt: null });
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
      setActionData(rec.rpc);
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
   * Event to handle when an action has been completed.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleCloseAction = (updatedData) => {
    const updateAddress = (address, variant, oldData) => {
      let oldRecord = null;
      let newRecord = null;
      let newAddress = address;

      switch (variant) {
        case "postcode":
          oldRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === oldData);
          newRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === updatedData);
          if (oldRecord && newRecord) {
            if (oldRecord.postcode !== "Unassigned" && newRecord.postcode !== "Unassigned")
              newAddress = address.replace(oldRecord.postcode, newRecord.postcode);
            else if (oldRecord.postcode !== "Unassigned" && newRecord.postcode === "Unassigned")
              newAddress = address.replace(`, ${oldRecord.postcode}`, "");
            else if (oldRecord.postcode === "Unassigned" && newRecord.postcode !== "Unassigned")
              newAddress = `${address}, ${newRecord.postcode}`;
          }
          return newAddress;

        case "postTown":
          oldRecord = lookupContext.currentLookups.postTowns.find(
            (x) => x.postTownRef === oldData && x.language === "ENG"
          );
          newRecord = lookupContext.currentLookups.postTowns.find(
            (x) => x.postTownRef === updatedData.eng && x.language === "ENG"
          );
          if (oldRecord && newRecord) {
            if (oldRecord.postTown !== "Unassigned" && newRecord.postTown !== "Unassigned")
              newAddress = address.replace(
                StringToTitleCase(oldRecord.postTown),
                StringToTitleCase(newRecord.postTown)
              );
            else if (oldRecord.postTown !== "Unassigned" && newRecord.postTown === "Unassigned")
              newAddress = address.replace(`, ${StringToTitleCase(oldRecord.postTown)}`, "");
            else if (oldRecord.postTown === "Unassigned" && newRecord.postTown !== "Unassigned") {
              const lastPart = address.split(", ").reverse()[0];
              newAddress = address.replace(`, ${lastPart}`, `, ${StringToTitleCase(newRecord.postTown)}, ${lastPart}`);
            }
          }
          return newAddress;

        case "subLocality":
          oldRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === oldData && x.language === "ENG"
          );
          newRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === updatedData.eng && x.language === "ENG"
          );
          if (oldRecord && newRecord) {
            if (oldRecord.subLocality !== "Unassigned" && newRecord.subLocality !== "Unassigned")
              newAddress = address.replace(
                StringToTitleCase(oldRecord.subLocality),
                StringToTitleCase(newRecord.subLocality)
              );
            else if (oldRecord.subLocality !== "Unassigned" && newRecord.subLocality === "Unassigned")
              newAddress = address.replace(`, ${StringToTitleCase(oldRecord.subLocality)}`, "");
          }
          return newAddress;

        default:
          return address;
      }
    };

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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: currentRecord.newAddress,
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: updatedData,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: currentRecord.newAddress,
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: updatedData,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: currentRecord.newAddress,
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: updatedData,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: currentRecord.newAddress,
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: updatedData,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: updateAddress(currentRecord.newAddress, "postcode", currentRecord.postcodeRef),
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: updatedData,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: updateAddress(currentRecord.newAddress, "postTown", currentRecord.postTownRef),
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: updatedData.eng,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: updatedData.alt,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: updateAddress(currentRecord.newAddress, "subLocality", currentRecord.subLocalityRef),
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: updatedData.eng,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
                    },
                  ].find((rec) => rec.id === x.id) || x
              );
              break;

            case "note":
              let updatedNote = null;

              if (!currentRecord.note) updatedNote = updatedData;
              else if (Array.isArray(currentRecord.other.note)) {
                updatedNote = currentRecord.note.map((x) => x);
                updatedNote.push(updatedData);
              } else updatedNote = [currentRecord.note, updatedData];

              updatedRecords = updatedRecords.map(
                (x) =>
                  [
                    {
                      id: updateId,
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: currentRecord.newAddress,
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: currentRecord.rpc,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: updatedNote,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
                      uprn: currentRecord.uprn,
                      originalAddress: currentRecord.originalAddress,
                      originalLpiLogicalStatus: currentRecord.originalLpiLogicalStatus,
                      newAddress: currentRecord.newAddress,
                      newLpiLogicalStatus: currentRecord.newLpiLogicalStatus,
                      classification: currentRecord.classification,
                      language: currentRecord.language,
                      saoStartNumber: currentRecord.saoStartNumber,
                      saoStartSuffix: currentRecord.saoStartSuffix,
                      saoEndNumber: currentRecord.saoEndNumber,
                      saoEndSuffix: currentRecord.saoEndSuffix,
                      saoText: currentRecord.saoText,
                      paoStartNumber: currentRecord.paoStartNumber,
                      paoStartSuffix: currentRecord.paoStartSuffix,
                      paoEndNumber: currentRecord.paoEndNumber,
                      paoEndSuffix: currentRecord.paoEndSuffix,
                      paoText: currentRecord.paoText,
                      usrn: currentRecord.usrn,
                      postTownRef: currentRecord.postTownRef,
                      postcodeRef: currentRecord.postcodeRef,
                      subLocalityRef: currentRecord.subLocalityRef,
                      officialAddress: currentRecord.officialAddress,
                      postallyAddressable: currentRecord.postallyAddressable,
                      startDate: currentRecord.startDate,
                      blpuLogicalStatus: currentRecord.blpuLogicalStatus,
                      rpc: updatedData,
                      state: currentRecord.state,
                      stateDate: currentRecord.stateDate,
                      level: currentRecord.level,
                      excludeFromExport: currentRecord.excludeFromExport,
                      siteVisit: currentRecord.siteVisit,
                      blpuStartDate: currentRecord.blpuStartDate,
                      note: currentRecord.note,
                      altLangLanguage: currentRecord.altLangLanguage,
                      altLangSaoStartSuffix: currentRecord.altLangSaoStartSuffix,
                      altLangSaoEndSuffix: currentRecord.altLangSaoEndSuffix,
                      altLangSaoText: currentRecord.altLangSaoText,
                      altLangPaoStartSuffix: currentRecord.altLangPaoStartSuffix,
                      altLangPaoEndSuffix: currentRecord.altLangPaoEndSuffix,
                      altLangPaoText: currentRecord.altLangPaoText,
                      altLangPostTownRef: currentRecord.altLangPostTownRef,
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
        // for (const rec of updatedRecords) {
        //   const propertyDetailErrors = ValidatePropertyDetails(
        //     rec.blpu,
        //     rec.lpi,
        //     rec.classification,
        //     rec.other,
        //     lookupContext.currentLookups,
        //     settingsContext.isScottish,
        //     rec.addressDetails.postTownRef,
        //     rec.addressDetails.postcodeRef,
        //     haveMoveBlpu
        //   );

        //   if (
        //     propertyDetailErrors.blpu.length > 0 ||
        //     propertyDetailErrors.lpi.length > 0 ||
        //     propertyDetailErrors.classification.length > 0 ||
        //     propertyDetailErrors.other.length > 0
        //   ) {
        //     finaliseErrors.push({ id: rec.id, errors: propertyDetailErrors });
        //   }
        // }

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
            setActionData(editRecord.classification);
            break;

          case "level":
            setActionData(editRecord.level);
            break;

          case "postcode":
            setActionData(editRecord.postcodeRef);
            break;

          case "postTown":
            if (settingsContext.isWelsh || (settingsContext.isScottish && createGaelic)) {
              setActionData({
                eng: editRecord.postTownRef,
                alt: editRecord.altLangPostTownRef,
              });
            } else setActionData({ eng: editRecord.addressDetails.postTownRef, alt: null });
            break;

          case "rpc":
            setActionData(editRecord.rpc);
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
    handleToggle(event, rec);
  };

  /**
   * Event to handle the mouse entering a record.
   *
   * @param {object} rec The record object.
   */
  const handleMouseEnter = (rec) => {
    setItemSelected(rec.id);
  };

  /**
   * Event to handle the mouse leaving a record.
   *
   * @param {object} rec The record object.
   */
  const handleMouseLeave = (rec) => {
    setItemSelected(null);
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
      if (onCheckedChanged && checked && checked.length > 0) {
        onCheckedChanged(checked.filter((x) => !actionAddressIds.current.includes(x)));
      }
      actionAddressIds.current = null;
      actionCount.current = 0;
    }
  };

  /**
   * Event to handle when the select checkbox is clicked.
   */
  const handleSelectCheckboxClick = () => {
    if (allChecked) {
      onCheckedChanged([]);
    } else {
      const newChecked = data.filter((x) => x.language === "ENG").map((x) => x.id);
      onCheckedChanged(newChecked);
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

    onCheckedChanged(newChecked);
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
                      align="left"
                      sx={{ fontWeight: 600, fontSize: "14px", color: adsRed }}
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
          height: "75px",
          backgroundColor: adsRed10,
        };
      else
        return {
          height: "75px",
          backgroundColor: adsRed10,
          "&:hover": {
            color: adsRed,
          },
        };
    } else {
      if (selected)
        return {
          height: "75px",
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
          "&:hover": {
            backgroundColor: adsPaleBlueA,
            color: adsBlueA,
          },
        };
      else
        return {
          height: "75px",
          "&:hover": {
            backgroundColor: adsPaleBlueA,
            color: adsBlueA,
          },
        };
    }
  };

  /**
   * Method to get the address item styling.
   *
   * @param {number} recId The record id.
   * @returns {object} The address item styling.
   */
  const getAddressItemStyle = (recId) => {
    if ((itemSelected !== null && itemSelected === recId) || checked.indexOf(recId) !== -1)
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
    }
  }, [updating, checked, onCheckedChanged]);

  return (
    <Box sx={{ width: "60%", overflowY: "hidden", ml: "auto", mr: "auto" }}>
      <Stack direction="column" spacing={2} sx={{ mt: theme.spacing(1), width: "100%" }}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(0) }}>Addresses creation</Typography>
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
            {checked && checked.length > 0 && !updating && (
              <ADSSelectionControl
                selectionCount={checked && checked.length > 0 ? checked.length : 0}
                haveWizard
                onAddNote={handleAddNotes}
                onEditWizard={handleEditWizard}
                onDeleteWizard={handleDeleteWizard}
                onClose={handleCloseSelection}
              />
            )}
          </Stack>
        </Box>
        <Box sx={dataFormStyle("PlotToPostalFinalisePage")}>
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
                      selected={itemSelected !== null && itemSelected === rec.id}
                      onClick={(event) => handleSelectRecord(event, rec)}
                      onMouseEnter={() => handleMouseEnter(rec)}
                      onMouseLeave={() => handleMouseLeave(rec)}
                      id={rec.id}
                      key={`plot-to-postal-address-${rec.id}-${idx}`}
                    >
                      <ListItemIcon sx={getAddressItemStyle(rec.id)}>
                        {((itemSelected !== null && itemSelected === rec.id) || checked.indexOf(rec.id) !== -1) && (
                          <Checkbox
                            edge="start"
                            checked={checked.indexOf(rec.id) !== -1}
                            color="primary"
                            tabIndex={-1}
                            onClick={(event) => handleToggle(event, rec)}
                            id={`plot_to_postal_list_checkbox_${rec.id}`}
                            sx={{ pb: theme.spacing(2.25), color: adsMidGreyA }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                            <Tooltip
                              title={GetAvatarTooltip(
                                24,
                                rec.newLpiLogicalStatus,
                                rec.classification,
                                null,
                                settingsContext.isScottish
                              )}
                              arrow
                              placement="bottom"
                              sx={tooltipStyle}
                            >
                              {GetClassificationIcon(
                                rec.classification ? rec.classification : "U",
                                GetAvatarColour(rec.newLpiLogicalStatus)
                              )}
                            </Tooltip>
                            <Typography variant="subtitle1">{rec.newAddress}</Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                            <Box sx={{ width: "8px" }} />
                            <IndentIcon />
                            <Tooltip
                              title={GetAvatarTooltip(
                                24,
                                rec.originalLpiLogicalStatus,
                                rec.classification,
                                null,
                                settingsContext.isScottish
                              )}
                              arrow
                              placement="bottom"
                              sx={tooltipStyle}
                            >
                              {GetClassificationIcon(
                                rec.classification ? rec.classification : "U",
                                GetAvatarColour(rec.originalLpiLogicalStatus)
                              )}
                            </Tooltip>
                            <Typography variant="subtitle2">
                              {addressToTitleCase(rec.originalAddress, rec.originalPostcode)}
                            </Typography>
                          </Stack>
                        }
                      />
                      <ListItemAvatar
                        sx={{
                          minWidth: 32,
                        }}
                      >
                        {itemSelected !== null && itemSelected === rec.id && (!checked || checked.length === 0) && (
                          <Fragment>
                            <ADSActionButton
                              variant="delete"
                              inheritBackground
                              tooltipTitle="Delete address"
                              tooltipPlacement="right"
                              onClick={(event) => handleDeleteAddress(event, rec)}
                            />
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
                              id="plot-to-postal-addresses-actions-menu"
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
                              <MenuItem
                                dense
                                onClick={(event) => handleEditClassification(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit classification</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                onClick={(event) => handleEditExcludeFromExport(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit exclude from export</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                onClick={(event) => handleEditSiteVisit(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit site visit required</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                onClick={(event) => handleEditLevel(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit level</Typography>
                              </MenuItem>
                              {settingsContext.isScottish && (
                                <MenuItem
                                  dense
                                  onClick={(event) => handleEditSubLocality(event, rec)}
                                  sx={menuItemStyle(true)}
                                >
                                  <Typography variant="inherit">Edit sub-locality</Typography>
                                </MenuItem>
                              )}
                              <MenuItem
                                dense
                                onClick={(event) => handleEditPostTown(event, rec)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Edit post town</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => handleEditPostcode(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Edit postcode</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => handleEditRpc(event, rec)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Edit RPC</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => handleAddNote(event, rec)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Add note</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                onClick={(event) => handleDeleteAddress(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit" color="error">
                                  Delete
                                </Typography>
                              </MenuItem>
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
                    <Typography variant="body2">{`${"No addresses can be generated from your data"}`}</Typography>
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
        {updating && (
          <Backdrop open={updating}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
      </Stack>
    </Box>
  );
}

export default PlotToPostalFinalisePage;
