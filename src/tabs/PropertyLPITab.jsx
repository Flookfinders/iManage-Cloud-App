//#region header */
/**************************************************************************************************
//
//  Description: Property Details Tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook         WI39??? Initial Revision.
//    002   22.03.23 Sean Flook         WI40596 Only allow editing if BLPU logical status is not historic or rejected.
//    003   28.03.23 Sean Flook         WI40596 Removed above change.
//    004   26.04.23 Sean Flook         WI40700 Do not set end date when deleting.
//    005   07.09.23 Sean Flook                 Removed unnecessary awaits.
//    006   06.10.23 Sean Flook                 Use colour variables.
//    007   27.10.23 Sean Flook                 Use new dataFormStyle.
//    008   03.11.23 Sean Flook                 Added debug code.
//    009   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and changes required for Scottish authorities.
//    010   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    011   05.01.24 Sean Flook                 Changes to sort out warnings.
//    012   10.01.24 Sean Flook                 Fix warnings.
//    013   11.01.24 Sean Flook                 Fix warnings.
//    014   16.01.24 Sean Flook                 Changes required to fix warnings.
//    015   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    016   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    017   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    018   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    019   18.03.24 Sean Flook      STRFRM4_OS Set the nullString parameter for the key.
//    020   21.03.24 Joshua McCormick IMANN-280 Toolbar styling and action icons are inline with rest of app
//    021   22.03.24 Sean Flook                 Changed the way the address is updated and displayed.
//    022   26.03.24 Joshua McCormick IMANN-280 Added divider on tab between back button and title
//    023   09.04.24 Sean Flook       IMANN-376 Allow lookups to be added on the fly.
//    024   16.04.24 Joshua McCormick IMANN-277 Added displayCharactersLeft and maxLength props to ADSAddressableObjectControl
//    025   17.04.24 Joshua McCormick IMANN-277 Removed maxLength from ADSAddressableObjectControl, as it is hardcoded inside ADSAddressableObjectControl
//    026   17.04.24 Joshua McCormick IMANN-207 endDate set to null if logical status is less than 7
//    027   17.04.24 Joshua McCormick IMANN-277 remaining unnecessary maxLength removed from ADSAddressableObjectControl
//    028   23.04.24 Joshua McCormick IMANN-386 changed LPI index&title to wrap correctly, formatted code
//    029   29.04.24 Sean Flook       IMANN-413 Only filter lookups on language for Welsh authorities.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import {
  addLookup,
  copyTextToClipboard,
  getLookupVariantString,
  GetLookupLabel,
  ConvertDate,
  filteredLookup,
  shorten,
} from "../utils/HelperUtils";
import { addressToTitleCase, FilteredLPILogicalStatus, GetTempAddress } from "../utils/PropertyUtils";
import ObjectComparison, { lpiKeysToIgnore } from "./../utils/ObjectComparison";

import { Typography, Tooltip, IconButton, Menu, MenuItem, Fade } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSLanguageControl from "../components/ADSLanguageControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSAddressableObjectControl from "../components/ADSAddressableObjectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import AddLookupDialog from "../dialogs/AddLookupDialog";

import OfficialAddress from "./../data/OfficialAddress";
import PostallyAddressable from "./../data/PostallyAddressable";

import { MoreVert as ActionsIcon } from "@mui/icons-material";
import { adsMidGreyA } from "../utils/ADSColours";
import {
  toolbarStyle,
  dataFormStyle,
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

PropertyLPITab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onSetCopyOpen: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onAddLpi: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function PropertyLPITab({ data, errors, loading, focusedField, onSetCopyOpen, onHomeClick, onAddLpi, onDelete }) {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [dataChanged, setDataChanged] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState(null);
  const currentId = useRef(0);

  const [logicalStatusLookup, setLogicalStatusLookup] = useState(
    FilteredLPILogicalStatus(settingsContext.isScottish, data.blpuLogicalStatus)
  );

  const [language, setLanguage] = useState(null);
  const [logicalStatus, setLogicalStatus] = useState(null);
  const [saoStartNumber, setSaoStartNumber] = useState("");
  const [saoStartSuffix, setSaoStartSuffix] = useState("");
  const [saoEndNumber, setSaoEndNumber] = useState("");
  const [saoEndSuffix, setSaoEndSuffix] = useState("");
  const [saoText, setSaoText] = useState("");
  const [paoStartNumber, setPaoStartNumber] = useState("");
  const [paoStartSuffix, setPaoStartSuffix] = useState("");
  const [paoEndNumber, setPaoEndNumber] = useState("");
  const [paoEndSuffix, setPaoEndSuffix] = useState("");
  const [paoText, setPaoText] = useState("");
  const [usrn, setUsrn] = useState(null);
  const [postTownRef, setPostTownRef] = useState(null);
  const [subLocalityRef, setSubLocalityRef] = useState(null);
  const [postcodeRef, setPostcodeRef] = useState(null);
  const [level, setLevel] = useState("");
  const [officialFlag, setOfficialFlag] = useState(null);
  const [postalAddress, setPostalAddress] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [lpiAddress, setLpiAddress] = useState("");

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [languageError, setLanguageError] = useState(null);
  const [logicalStatusError, setLogicalStatusError] = useState(null);
  const [saoStartNumError, setSaoStartNumError] = useState(null);
  const [saoStartSuffixError, setSaoStartSuffixError] = useState(null);
  const [saoEndNumError, setSaoEndNumError] = useState(null);
  const [saoEndSuffixError, setSaoEndSuffixError] = useState(null);
  const [saoTextError, setSaoTextError] = useState(null);
  const [paoStartNumError, setPaoStartNumError] = useState(null);
  const [paoStartSuffixError, setPaoStartSuffixError] = useState(null);
  const [paoEndNumError, setPaoEndNumError] = useState(null);
  const [paoEndSuffixError, setPaoEndSuffixError] = useState(null);
  const [paoTextError, setPaoTextError] = useState(null);
  const [usrnError, setUsrnError] = useState(null);
  const [postTownRefError, setPostTownRefError] = useState(null);
  const [subLocalityRefError, setSubLocalityRefError] = useState(null);
  const [postcodeRefError, setPostcodeRefError] = useState(null);
  const [levelError, setLevelError] = useState(null);
  const [officialFlagError, setOfficialFlagError] = useState(null);
  const [postalAddressError, setPostalAddressError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const addResult = useRef(null);
  const currentVariant = useRef(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = async (field, newValue) => {
    const newLpiData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("lpi", newLpiData);
    if (
      [
        "saoStartNumber",
        "saoStartSuffix",
        "saoEndNumber",
        "saoEndSuffix",
        "saoText",
        "paoStartNumber",
        "paoStartSuffix",
        "paoEndNumber",
        "paoEndSuffix",
        "paoText",
        "usrn",
        "postTownRef",
        "postcodeRef",
      ].includes(field)
    ) {
      const updatedAddress = await GetTempAddress(
        newLpiData,
        data.organisation,
        lookupContext,
        userContext.currentUser.token,
        settingsContext.isScottish
      );
      let currentPostcode = newLpiData.postcode;
      if (field === "postcodeRef") {
        const postcodeRec = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === newValue);
        if (postcodeRec) {
          currentPostcode = postcodeRec.postcode;
        }
      }
      setLpiAddress(
        updatedAddress && updatedAddress.length > 70
          ? `${shorten(addressToTitleCase(updatedAddress, currentPostcode), 70)} ...`
          : updatedAddress
      );
    }
  };

  /**
   * Event to handle when the language is changed.
   *
   * @param {string|null} newValue The new language.
   */
  const handleLanguageChangeEvent = (newValue) => {
    setLanguage(newValue);
    UpdateSandbox("language", newValue);
  };

  /**
   * Event to handle when the logical status is changed.
   *
   * @param {number|null} newValue The new logical status.
   */
  const handleLogicalStatusChangeEvent = (newValue) => {
    setLogicalStatus(newValue);
    UpdateSandbox("logicalStatus", newValue);
  };

  /**
   * Event to handle when the SAO start number is changed.
   *
   * @param {number|null} newValue The new SAO start number.
   */
  const handleSaoStartNumberChangeEvent = (newValue) => {
    setSaoStartNumber(newValue);
    UpdateSandbox("saoStartNumber", newValue);
  };

  /**
   * Event to handle when the SAO start suffix is changed.
   *
   * @param {string|null} newValue The new SAO start suffix.
   */
  const handleSaoStartSuffixChangeEvent = (newValue) => {
    setSaoStartSuffix(newValue);
    UpdateSandbox("saoStartSuffix", newValue);
  };

  /**
   * Event to handle when the SAO end number is changed.
   *
   * @param {number|null} newValue The new SAO end number.
   */
  const handleSaoEndNumberChangeEvent = (newValue) => {
    setSaoEndNumber(newValue);
    UpdateSandbox("saoEndNumber", newValue);
  };

  /**
   * Event to handle when the SAO end suffix is changed.
   *
   * @param {string|null} newValue The new SAO end suffix.
   */
  const handleSaoEndSuffixChangeEvent = (newValue) => {
    setSaoEndSuffix(newValue);
    UpdateSandbox("saoEndSuffix", newValue);
  };

  /**
   * Event to handle when the SAO text is changed.
   *
   * @param {string|null} newValue The new SAO text.
   */
  const handleSaoTextChangeEvent = (newValue) => {
    setSaoText(newValue);
    UpdateSandbox("saoText", newValue);
  };

  /**
   * Event to handle when the PAO start number is changed.
   *
   * @param {number|null} newValue The new PAO start number.
   */
  const handlePaoStartNumberChangeEvent = (newValue) => {
    setPaoStartNumber(newValue);
    UpdateSandbox("paoStartNumber", newValue);
  };

  /**
   * Event to handle when the PAO start suffix is changed.
   *
   * @param {string|null} newValue The new PAO start number.
   */
  const handlePaoStartSuffixChangeEvent = (newValue) => {
    setPaoStartSuffix(newValue);
    UpdateSandbox("paoStartSuffix", newValue);
  };

  /**
   * Event to handle when the PAO end number is changed.
   *
   * @param {number|null} newValue The new PAO end number.
   */
  const handlePaoEndNumberChangeEvent = (newValue) => {
    setPaoEndNumber(newValue);
    UpdateSandbox("paoEndNumber", newValue);
  };

  /**
   * Event to handle when the PAO end suffix is changed.
   *
   * @param {string|null} newValue The new PAO end suffix.
   */
  const handlePaoEndSuffixChangeEvent = (newValue) => {
    setPaoEndSuffix(newValue);
    UpdateSandbox("paoEndSuffix", newValue);
  };

  /**
   * Event to handle when the PAO text is changed.
   *
   * @param {string|null} newValue The new PAO text.
   */
  const handlePaoTextChangeEvent = (newValue) => {
    setPaoText(newValue);
    UpdateSandbox("paoText", newValue);
  };

  /**
   * Event to handle when the USRN is changed.
   *
   * @param {number|null} newValue The new USRN.
   */
  const handleUsrnChangeEvent = (newValue) => {
    setUsrn(newValue);
    UpdateSandbox("usrn", newValue);
  };

  /**
   * Event to handle when the post town is changed.
   *
   * @param {number|null} newValue The new post town.
   */
  const handlePostTownRefChangeEvent = (newValue) => {
    setPostTownRef(newValue);
    UpdateSandbox("postTownRef", newValue);
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
  const handleSubLocalityRefChangeEvent = (newValue) => {
    setSubLocalityRef(newValue);
    UpdateSandbox("subLocalityRef", newValue);
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
  const handlePostcodeRefChangeEvent = (newValue) => {
    setPostcodeRef(newValue);
    UpdateSandbox("postcodeRef", newValue);
  };

  /**
   * Event to handle when a new postcode is added.
   */
  const handleAddPostcodeEvent = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the level is changed.
   *
   * @param {number|string|null} newValue The new level.
   */
  const handleLevelChangeEvent = (newValue) => {
    setLevel(newValue);
    UpdateSandbox("level", newValue);
  };

  /**
   * Event to handle when the official flag is changed.
   *
   * @param {string|null} newValue The new official flag.
   */
  const handleOfficialFlagChangeEvent = (newValue) => {
    setOfficialFlag(newValue);
    UpdateSandbox("officialFlag", newValue);
  };

  /**
   * Event to handle when the postally addressable is changed.
   *
   * @param {string|null} newValue The new postally addressable.
   */
  const handlePostalAddressChangeEvent = (newValue) => {
    setPostalAddress(newValue);
    UpdateSandbox("postalAddress", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Method to return the current LPI record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current LPI record.
   */
  function GetCurrentData(field, newValue) {
    return !settingsContext.isScottish
      ? {
          language: field && field === "language" ? newValue : language,
          startDate:
            field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
          endDate:
            field && field === "endDate"
              ? newValue && ConvertDate(newValue)
              : field && field === "logicalStatus" && newValue < 7
              ? null
              : endDate && ConvertDate(endDate),
          saoStartNumber:
            field && field === "saoStartNumber"
              ? newValue && Number(newValue)
              : saoStartNumber && Number(saoStartNumber),
          saoEndNumber:
            field && field === "saoEndNumber" ? newValue && Number(newValue) : saoEndNumber && Number(saoEndNumber),
          saoText: field && field === "saoText" ? newValue : saoText,
          paoStartNumber:
            field && field === "paoStartNumber"
              ? newValue && Number(newValue)
              : paoStartNumber && Number(paoStartNumber),
          paoEndNumber:
            field && field === "paoEndNumber" ? newValue && Number(newValue) : paoEndNumber && Number(paoEndNumber),
          paoText: field && field === "paoText" ? newValue : paoText,
          usrn: field && field === "usrn" ? newValue : usrn,
          postcodeRef: field && field === "postcodeRef" ? newValue : postcodeRef,
          postTownRef: field && field === "postTownRef" ? newValue : postTownRef,
          neverExport: data.lpiData.neverExport,
          postTown: data.lpiData.postTown,
          postcode: data.lpiData.postcode,
          dualLanguageLink: data.lpiData.dualLanguageLink ? data.lpiData.dualLanguageLink : 0,
          uprn: data.lpiData.uprn,
          logicalStatus: field && field === "logicalStatus" ? newValue : logicalStatus,
          paoStartSuffix: field && field === "paoStartSuffix" ? newValue : paoStartSuffix,
          paoEndSuffix: field && field === "paoEndSuffix" ? newValue : paoEndSuffix,
          saoStartSuffix: field === "saoStartSuffix" ? newValue : saoStartSuffix,
          saoEndSuffix: field && field === "saoEndSuffix" ? newValue : saoEndSuffix,
          level: field && field === "level" ? newValue : level,
          postalAddress: field && field === "postalAddress" ? newValue : postalAddress,
          officialFlag: field && field === "officialFlag" ? newValue : officialFlag,
          pkId: data.lpiData.pkId,
          changeType: field && field === "changeType" ? newValue : !data.lpiData.lpiKey ? "I" : "U",
          lpiKey: data.lpiData.lpiKey,
          address: data.lpiData.address,
          entryDate: data.lpiData.entryDate,
          lastUpdateDate: data.lpiData.lastUpdateDate,
        }
      : {
          language: field && field === "language" ? newValue : language,
          startDate:
            field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
          endDate:
            field && field === "endDate"
              ? newValue && ConvertDate(newValue)
              : field && field === "logicalStatus" && newValue < 7
              ? null
              : endDate && ConvertDate(endDate),
          saoStartNumber:
            field && field === "saoStartNumber"
              ? newValue && Number(newValue)
              : saoStartNumber && Number(saoStartNumber),
          saoEndNumber:
            field && field === "saoEndNumber" ? newValue && Number(newValue) : saoEndNumber && Number(saoEndNumber),
          saoText: field && field === "saoText" ? newValue : saoText,
          paoStartNumber:
            field && field === "paoStartNumber"
              ? newValue && Number(newValue)
              : paoStartNumber && Number(paoStartNumber),
          paoEndNumber:
            field && field === "paoEndNumber" ? newValue && Number(newValue) : paoEndNumber && Number(paoEndNumber),
          paoText: field && field === "paoText" ? newValue : paoText,
          usrn: field && field === "usrn" ? newValue : usrn,
          postcodeRef: field && field === "postcodeRef" ? newValue : postcodeRef,
          postTownRef: field && field === "postTownRef" ? newValue : postTownRef,
          neverExport: data.lpiData.neverExport,
          postTown: data.lpiData.postTown,
          postcode: data.lpiData.postcode,
          dualLanguageLink: data.lpiData.dualLanguageLink ? data.lpiData.dualLanguageLink : 0,
          uprn: data.lpiData.uprn,
          logicalStatus: field && field === "logicalStatus" ? newValue : logicalStatus,
          paoStartSuffix: field && field === "paoStartSuffix" ? newValue : paoStartSuffix,
          paoEndSuffix: field && field === "paoEndSuffix" ? newValue : paoEndSuffix,
          saoStartSuffix: field === "saoStartSuffix" ? newValue : saoStartSuffix,
          saoEndSuffix: field && field === "saoEndSuffix" ? newValue : saoEndSuffix,
          subLocalityRef: field && field === "subLocalityRef" ? newValue : subLocalityRef,
          subLocality: data.lpiData.subLocality,
          postallyAddressable: field && field === "postalAddress" ? newValue : postalAddress,
          officialFlag: field && field === "officialFlag" ? newValue : officialFlag,
          pkId: data.lpiData.pkId,
          changeType: field && field === "changeType" ? newValue : !data.lpiData.lpiKey ? "I" : "U",
          lpiKey: data.lpiData.lpiKey,
          address: data.lpiData.address,
          entryDate: data.lpiData.entryDate,
          lastUpdateDate: data.lpiData.lastUpdateDate,
        };
  }

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceLpi =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceProperty
        ? sandboxContext.currentSandbox.sourceProperty.lpis.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged ? (sandboxContext.currentSandbox.currentPropertyRecords.lpi ? "check" : "discard") : "discard",
        sourceLpi,
        sandboxContext.currentSandbox.currentPropertyRecords.lpi
      );
  };

  /**
   * Event to display the actions context menu.
   *
   * @param {object} event The event object.
   */
  const handleActionsClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
  };

  /**
   * Event to handle closing the actions context menu.
   */
  const handleActionsMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle adding a new LPI.
   */
  const handleAddNewLpi = () => {
    setAnchorEl(null);
    if (onAddLpi) onAddLpi();
  };

  /**
   * Event to handle copying the address to the clipboard.
   */
  const handleCopyAddress = () => {
    if (data.lpiData.address) itemCopy(data.lpiData.address, "Address");
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to search for properties and streets near by.
   */
  const handleSearchNearby = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to export the LPI.
   */
  const handleExportTo = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to make the LPI rejected.
   */
  const handleRejectLpi = () => {
    if (logicalStatus !== 9) {
      setLogicalStatus(9);
      setLogicalStatusLookup(FilteredLPILogicalStatus(settingsContext.isScottish, 9));
      UpdateSandbox("logicalStatus", 9);
    }
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to make the LPI historic.
   */
  const handleHistoriciseLpi = () => {
    if (logicalStatus !== 8) {
      setLogicalStatus(8);
      setLogicalStatusLookup(FilteredLPILogicalStatus(settingsContext.isScottish, 8));
      UpdateSandbox("logicalStatus", 8);
    }
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to delete the LPI.
   */
  const handleDeleteLpi = () => {
    setAnchorEl(null);
    if (settingsContext.isWelsh) {
      setAssociatedRecords([
        {
          type: "linked lpi",
          count: 1,
        },
        {
          type: "cross reference",
          count: 1,
        },
      ]);
    }
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && pkId && pkId > 0) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (text, dataType) => {
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentPropertyRecords.lpi);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.lpiData) {
        setLanguage(data.lpiData.language);
        setLogicalStatus(data.lpiData.logicalStatus);
        setSaoStartNumber(data.lpiData.saoStartNumber ? data.lpiData.saoStartNumber : "");
        setSaoStartSuffix(data.lpiData.saoStartSuffix ? data.lpiData.saoStartSuffix : "");
        setSaoEndNumber(data.lpiData.saoEndNumber ? data.lpiData.saoEndNumber : "");
        setSaoEndSuffix(data.lpiData.saoEndSuffix ? data.lpiData.saoEndSuffix : "");
        setSaoText(data.lpiData.saoText ? data.lpiData.saoText : "");
        setPaoStartNumber(data.lpiData.paoStartNumber ? data.lpiData.paoStartNumber : "");
        setPaoStartSuffix(data.lpiData.paoStartSuffix ? data.lpiData.paoStartSuffix : "");
        setPaoEndNumber(data.lpiData.paoEndNumber ? data.lpiData.paoEndNumber : "");
        setPaoEndSuffix(data.lpiData.paoEndSuffix ? data.lpiData.paoEndSuffix : "");
        setPaoText(data.lpiData.paoText ? data.lpiData.paoText : "");
        setUsrn(data.lpiData.usrn);
        setPostTownRef(data.lpiData.postTownRef);
        if (settingsContext.isScottish) setSubLocalityRef(data.lpiData.subLocalityRef);
        setPostcodeRef(data.lpiData.postcodeRef);
        if (!settingsContext.isScottish) setLevel(data.lpiData.level ? data.lpiData.level : "");
        setOfficialFlag(data.lpiData.officialFlag);
        setPostalAddress(settingsContext.isScottish ? data.lpiData.postallyAddressable : data.lpiData.postalAddress);
        setStartDate(data.lpiData.startDate);
        setEndDate(data.lpiData.endDate);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.lpiData, null);
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
      userContext.currentUser.token,
      settingsContext.isWelsh,
      settingsContext.isScottish,
      lookupContext.currentLookups
    );

    if (addResults && addResults.result) {
      if (addResults.updatedLookups && addResults.updatedLookups.length > 0)
        lookupContext.onUpdateLookup(data.variant, addResults.updatedLookups);

      switch (data.variant) {
        case "postcode":
          setPostcodeRef(addResults.newLookup.postcodeRef);
          break;

        case "postTown":
          setPostTownRef(addResults.newLookup.postTownRef);
          break;

        case "subLocality":
          setSubLocalityRef(addResults.newLookup.subLocalityRef);
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
    if (!loading && data && data.lpiData) {
      setLanguage(data.lpiData.language);
      setLogicalStatus(data.lpiData.logicalStatus);
      setSaoStartNumber(data.lpiData.saoStartNumber ? data.lpiData.saoStartNumber : "");
      setSaoStartSuffix(data.lpiData.saoStartSuffix ? data.lpiData.saoStartSuffix : "");
      setSaoEndNumber(data.lpiData.saoEndNumber ? data.lpiData.saoEndNumber : "");
      setSaoEndSuffix(data.lpiData.saoEndSuffix ? data.lpiData.saoEndSuffix : "");
      setSaoText(data.lpiData.saoText ? data.lpiData.saoText : "");
      setPaoStartNumber(data.lpiData.paoStartNumber ? data.lpiData.paoStartNumber : "");
      setPaoStartSuffix(data.lpiData.paoStartSuffix ? data.lpiData.paoStartSuffix : "");
      setPaoEndNumber(data.lpiData.paoEndNumber ? data.lpiData.paoEndNumber : "");
      setPaoEndSuffix(data.lpiData.paoEndSuffix ? data.lpiData.paoEndSuffix : "");
      setPaoText(data.lpiData.paoText ? data.lpiData.paoText : "");
      setUsrn(data.lpiData.usrn);
      setPostTownRef(data.lpiData.postTownRef);
      if (settingsContext.isScottish) setSubLocalityRef(data.lpiData.subLocalityRef);
      setPostcodeRef(data.lpiData.postcodeRef);
      if (!settingsContext.isScottish) setLevel(data.lpiData.level ? data.lpiData.level : "");
      setOfficialFlag(data.lpiData.officialFlag);
      setPostalAddress(settingsContext.isScottish ? data.lpiData.postallyAddressable : data.lpiData.postalAddress);
      setStartDate(data.lpiData.startDate);
      setEndDate(data.lpiData.endDate);
      setLpiAddress(
        data.lpiData.address && data.lpiData.address.length > 70
          ? `${shorten(addressToTitleCase(data.lpiData.address, data.lpiData.postcode), 70)} ...`
          : data.lpiData.address
      );

      setLogicalStatusLookup(FilteredLPILogicalStatus(settingsContext.isScottish, data.blpuLogicalStatus));
    }
  }, [loading, data, settingsContext.isScottish]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceProperty && sandboxContext.currentSandbox.currentPropertyRecords.lpi) {
      const sourceLpi = sandboxContext.currentSandbox.sourceProperty.lpis.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.lpi.pkId
      );

      if (sourceLpi) {
        setDataChanged(
          !ObjectComparison(sourceLpi, sandboxContext.currentSandbox.currentPropertyRecords.lpi, lpiKeysToIgnore)
        );
      } else if (sandboxContext.currentSandbox.currentPropertyRecords.lpi.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.currentPropertyRecords.lpi, sandboxContext.currentSandbox.sourceProperty]);

  useEffect(() => {
    if (
      data &&
      data.pkId < 0 &&
      !sandboxContext.currentSandbox.currentPropertyRecords.lpi &&
      currentId.current !== data.pkId
    ) {
      sandboxContext.onSandboxChange("lpi", data.lpiData);
      currentId.current = data.pkId;
    }
  }, [data, sandboxContext, sandboxContext.currentSandbox.currentPropertyRecords.lpi]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setLanguageError(null);
    setLogicalStatusError(null);
    setSaoStartNumError(null);
    setSaoStartSuffixError(null);
    setSaoEndNumError(null);
    setSaoEndSuffixError(null);
    setSaoTextError(null);
    setPaoStartNumError(null);
    setPaoStartSuffixError(null);
    setPaoEndNumError(null);
    setPaoEndSuffixError(null);
    setPaoTextError(null);
    setUsrnError(null);
    setPostTownRefError(null);
    setSubLocalityRefError(null);
    setPostcodeRefError(null);
    setLevelError(null);
    setOfficialFlagError(null);
    setPostalAddressError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "language":
            setLanguageError(error.errors);
            break;

          case "logicalstatus":
            setLogicalStatusError(error.errors);
            break;

          case "saostartnumber":
            setSaoStartNumError(error.errors);
            break;

          case "saostartsuffix":
            setSaoStartSuffixError(error.errors);
            break;

          case "saoendnumber":
            setSaoEndNumError(error.errors);
            break;

          case "saoendsuffix":
            setSaoEndSuffixError(error.errors);
            break;

          case "saotext":
            setSaoTextError(error.errors);
            break;

          case "paostartnumber":
            setPaoStartNumError(error.errors);
            break;

          case "paostartsuffix":
            setPaoStartSuffixError(error.errors);
            break;

          case "paoendnumber":
            setPaoEndNumError(error.errors);
            break;

          case "paoendsuffix":
            setPaoEndSuffixError(error.errors);
            break;

          case "paotext":
            setPaoTextError(error.errors);
            break;

          case "usrn":
            setUsrnError(error.errors);
            break;

          case "posttown":
          case "posttownref":
            setPostTownRefError(error.errors);
            break;

          case "sublocality":
          case "sublocalityref":
            setSubLocalityRefError(error.errors);
            break;

          case "postcode":
          case "postcoderef":
            setPostcodeRefError(error.errors);
            break;

          case "level":
            setLevelError(error.errors);
            break;

          case "officialflag":
            setOfficialFlagError(error.errors);
            break;

          case "postaladdress":
            setPostalAddressError(error.errors);
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
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: theme.spacing(0.25) }}>
          <Typography variant="subtitle1">
            <ADSActionButton
              variant="home"
              tooltipTitle="Back to property details"
              tooltipPlacement="bottom"
              onClick={handleHomeClick}
            />
          </Typography>
          <Typography
            sx={{
              flexGrow: 1,
              fontSize: "14px",
              color: adsMidGreyA,
              display: "none",
              pl: "6px",
              pt: "2px",
              [theme.breakpoints.up("sm")]: {
                display: "block",
              },
            }}
            variant="subtitle1"
            noWrap
            align="left"
          >
            <Typography display="inline" variant="subtitle1">
              {`| LPI ${data.index + 1} of ${data.totalRecords}: `}
            </Typography>
            {`${lpiAddress ? lpiAddress : ""}`}
          </Typography>
          <Tooltip title="Actions" arrow placement="right" sx={tooltipStyle}>
            <IconButton
              onClick={handleActionsClick}
              sx={ActionIconStyle()}
              aria_controls={`actions-menu-${data.lpiData.lpiKey}`}
              size="small"
            >
              <ActionsIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id={`actions-menu-${data.lpiData.lpiKey}`}
            elevation={2}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleActionsMenuClose}
            TransitionComponent={Fade}
            sx={menuStyle}
          >
            <MenuItem dense disabled={!userCanEdit} onClick={handleAddNewLpi} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Add new LPI</Typography>
            </MenuItem>
            <MenuItem dense onClick={handleCopyAddress} divider sx={menuItemStyle(true)}>
              <Typography variant="inherit">Copy address</Typography>
            </MenuItem>
            <MenuItem dense disabled onClick={handleSearchNearby} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Search nearby</Typography>
            </MenuItem>
            <MenuItem dense disabled onClick={handleExportTo} divider sx={menuItemStyle(true)}>
              <Typography variant="inherit">Export to...</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleRejectLpi} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Reject LPI</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleHistoriciseLpi} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Historicise LPI</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleDeleteLpi} sx={menuItemStyle(false)}>
              <Typography variant="inherit" color="error">
                Delete LPI
              </Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("PropertyLPITab")}>
        <ADSLanguageControl
          label="Language"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Language" : false}
          loading={loading}
          value={language}
          helperText="The language in use for the descriptive identifier."
          errorText={languageError}
          onChange={handleLanguageChangeEvent}
        />
        <ADSSelectControl
          label="LPI logical status"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "LogicalStatus" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={logicalStatusLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          value={logicalStatus}
          errorText={logicalStatusError}
          onChange={handleLogicalStatusChangeEvent}
          helperText="Logical status of this Record."
        />
        <ADSAddressableObjectControl
          displayCharactersLeft
          variant="SAO"
          isEditable={userCanEdit}
          isStartNumberFocused={focusedField ? focusedField === "SaoStartNumber" : false}
          isStartSuffixFocused={focusedField ? focusedField === "SaoStartSuffix" : false}
          isEndNumberFocused={focusedField ? focusedField === "SaoEndNumber" : false}
          isEndSuffixFocused={focusedField ? focusedField === "SaoEndSuffix" : false}
          isTextFocused={focusedField ? focusedField === "SaoText" : false}
          loading={loading}
          helperText="The secondary addressable object."
          startNumberValue={saoStartNumber}
          startSuffixValue={saoStartSuffix}
          endNumberValue={saoEndNumber}
          endSuffixValue={saoEndSuffix}
          textValue={saoText}
          startNumberErrorText={saoStartNumError}
          startSuffixErrorText={saoStartSuffixError}
          endNumberErrorText={saoEndNumError}
          endSuffixErrorText={saoEndSuffixError}
          textErrorText={saoTextError}
          onStartNumberChange={handleSaoStartNumberChangeEvent}
          onStartSuffixChange={handleSaoStartSuffixChangeEvent}
          onEndNumberChange={handleSaoEndNumberChangeEvent}
          onEndSuffixChange={handleSaoEndSuffixChangeEvent}
          onTextChange={handleSaoTextChangeEvent}
        />
        <ADSAddressableObjectControl
          displayCharactersLeft
          variant="PAO"
          isEditable={userCanEdit}
          isRequired
          isStartNumberFocused={focusedField ? focusedField === "PaoStartNumber" : false}
          isStartSuffixFocused={focusedField ? focusedField === "PaoStartSuffix" : false}
          isEndNumberFocused={focusedField ? focusedField === "PaoEndNumber" : false}
          isEndSuffixFocused={focusedField ? focusedField === "PaoEndSuffix" : false}
          isTextFocused={focusedField ? focusedField === "PaoText" : false}
          loading={loading}
          helperText="The primary addressable object."
          startNumberValue={paoStartNumber}
          startSuffixValue={paoStartSuffix}
          endNumberValue={paoEndNumber}
          endSuffixValue={paoEndSuffix}
          textValue={paoText}
          startNumberErrorText={paoStartNumError}
          startSuffixErrorText={paoStartSuffixError}
          endNumberErrorText={paoEndNumError}
          endSuffixErrorText={paoEndSuffixError}
          textErrorText={paoTextError}
          onStartNumberChange={handlePaoStartNumberChangeEvent}
          onStartSuffixChange={handlePaoStartSuffixChangeEvent}
          onEndNumberChange={handlePaoEndNumberChangeEvent}
          onEndSuffixChange={handlePaoEndSuffixChangeEvent}
          onTextChange={handlePaoTextChangeEvent}
        />
        <ADSSelectControl
          label="Street"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Usrn" : false}
          loading={loading}
          useRounded
          // doNotSetTitleCase
          lookupData={lookupContext.currentLookups.streetDescriptors.filter(
            (x) => x.language === (settingsContext.isWelsh ? language : "ENG")
          )}
          lookupId="usrn"
          lookupLabel="address"
          value={usrn}
          errorText={usrnError}
          onChange={handleUsrnChangeEvent}
          helperText="Unique Street reference number."
        />
        <ADSSelectControl
          label="Post town"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "PostTown" || focusedField === "PostTownRef" : false}
          loading={loading}
          useRounded
          allowAddLookup
          lookupData={lookupContext.currentLookups.postTowns
            .filter((x) => x.language === (settingsContext.isWelsh ? language : "ENG") && !x.historic)
            .sort(function (a, b) {
              return a.postTown.localeCompare(b.postTown, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            })}
          lookupId="postTownRef"
          lookupLabel="postTown"
          value={postTownRef}
          errorText={postTownRefError}
          onChange={handlePostTownRefChangeEvent}
          onAddLookup={handleAddPostTownEvent}
          helperText="Allocated by the Royal Mail to assist in delivery of mail."
        />
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="Sub-locality"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "SubLocality" || focusedField === "SubLocalityRef" : false}
            loading={loading}
            useRounded
            allowAddLookup
            lookupData={lookupContext.currentLookups.subLocalities
              .filter((x) => !x.historic)
              .sort(function (a, b) {
                return a.subLocality.localeCompare(b.subLocality, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
            lookupId="subLocalityRef"
            lookupLabel="subLocality"
            value={subLocalityRef}
            errorText={subLocalityRefError}
            onChange={handleSubLocalityRefChangeEvent}
            onAddLookup={handleAddSubLocalityEvent}
            helperText="Third level of geographic area name. e.g. to record an island name or property group."
          />
        )}
        <ADSSelectControl
          label="Postcode"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "Postcode" || focusedField === "PostcodeRef" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          allowAddLookup
          lookupData={lookupContext.currentLookups.postcodes
            .filter((x) => !x.historic)
            .sort(function (a, b) {
              return a.postcode.localeCompare(b.postcode, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            })}
          lookupId="postcodeRef"
          lookupLabel="postcode"
          value={postcodeRef}
          errorText={postcodeRefError}
          onChange={handlePostcodeRefChangeEvent}
          onAddLookup={handleAddPostcodeEvent}
          helperText="Allocated by the Royal Mail to assist in delivery of mail."
        />
        {!settingsContext.isScottish && (
          <ADSTextControl
            label="Level"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "Level" : false}
            loading={loading}
            value={level}
            id="lpi_level"
            maxLength={30}
            errorText={levelError}
            helperText="Memorandum of the vertical position of the BLPU."
            onChange={handleLevelChangeEvent}
          />
        )}
        <ADSSelectControl
          label="Official address"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "OfficialFlag" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={filteredLookup(OfficialAddress, settingsContext.isScottish)}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          value={officialFlag}
          errorText={officialFlagError}
          onChange={handleOfficialFlagChangeEvent}
          helperText="Status of address."
        />
        <ADSSelectControl
          label={`${settingsContext.isScottish ? "Postally addressable" : "Postal address"}`}
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "PostalAddress" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={filteredLookup(PostallyAddressable, settingsContext.isScottish)}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          value={postalAddress}
          errorText={postalAddressError}
          onChange={handlePostalAddressChangeEvent}
          helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date this Record was created."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {logicalStatus && [7, 8, 9].includes(logicalStatus) && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "EndDate" : false}
            loading={loading}
            value={endDate}
            helperText="Date this Record was closed."
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
        <ADSReadOnlyControl
          label="LPI key"
          loading={loading}
          value={data.lpiData.lpiKey}
          nullString="Key set on save"
        />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
        <Box sx={{ height: "24px" }} />
      </Box>
      <div>
        <ConfirmDeleteDialog
          open={openDeleteConfirmation}
          associatedRecords={associatedRecords}
          onClose={handleCloseDeleteConfirmation}
        />
        <AddLookupDialog
          isOpen={showAddDialog}
          variant={lookupType}
          errorEng={engError}
          errorAltLanguage={altLanguageError}
          onDone={(data) => handleDoneAddLookup(data)}
          onClose={handleCloseAddLookup}
        />
      </div>
    </Fragment>
  );
}

export default PropertyLPITab;
