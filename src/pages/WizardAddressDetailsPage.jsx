//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Wizard address details page
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   05.04.23 Sean Flook         WI40669 Fixed warning and reduced code.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings.
//    006   17.01.24 Sean Flook                 Included sub-locality.
//    007   29.05.24 Sean Flook       IMANN-504 Only create second language for Welsh authorities.
//    008   11.06.24 Joshua McCormick IMANN-451 fixed saving states changing lang, cleanup.
//    009   14.06.24 Sean Flook       IMANN-451 Various changes required in order for Scottish authorities to be able to choose to create Gaelic records or not.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import { Typography, AppBar, Tabs, Tab, FormControlLabel, Checkbox } from "@mui/material";
import { Box, Stack } from "@mui/system";
import WizardAddressDetails1Tab from "../tabs/WizardAddressDetails1Tab";
import WizardAddressDetails2Tab from "../tabs/WizardAddressDetails2Tab";

import { stringToSentenceCase } from "../utils/HelperUtils";
import { streetDescriptorToTitleCase } from "../utils/StreetUtils";

import { adsBlueA, adsMidGreyA, adsLightGreyB, adsOffWhite } from "../utils/ADSColours";
import { wizardTabStyle, tabLabelStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wizard-address-details-tabpanel-${index}`}
      aria-labelledby={`wizard-address-details-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `wizard-address-details-tab-${index}`,
    "aria-controls": `wizard-address-details-tabpanel-${index}`,
  };
}

WizardAddressDetailsPage.propTypes = {
  template: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  engSingleData: PropTypes.object,
  altLangSingleData: PropTypes.object,
  engRangeData: PropTypes.object,
  altLangRangeData: PropTypes.object,
  isRange: PropTypes.bool,
  createAltLang: PropTypes.bool.isRequired,
  errors: PropTypes.array,
  onDataChanged: PropTypes.func.isRequired,
  onLanguageChanged: PropTypes.func.isRequired,
  onCreateAltLangChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

WizardAddressDetailsPage.defaultProps = {
  language: "ENG",
  isRange: false,
  createAltLang: false,
};

function WizardAddressDetailsPage({
  template,
  language,
  engSingleData,
  altLangSingleData,
  engRangeData,
  altLangRangeData,
  isRange,
  createAltLang,
  errors,
  onDataChanged,
  onLanguageChanged,
  onCreateAltLangChanged,
  onErrorChanged,
}) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [value, setValue] = useState(0);
  const [data, setData] = useState(null);
  const [createGaelicRecords, setCreateGaelicRecords] = useState(false);

  /**
   * Event to handle when the create gaelic records is clicked
   */
  const handleCreateGaelicRecordsChangeEvent = () => {
    if (onCreateAltLangChanged) onCreateAltLangChanged(!createGaelicRecords);
    else setCreateGaelicRecords(!createGaelicRecords);
  };

  /**
   * Event to handle changing the tab.
   *
   * @param {object} event The event object.
   * @param {number} newValue The index number of the new tab.
   */
  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      if (isRange) {
        const altLangRangePostTownRecord = lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === altLangRangeData.postTownRef
        );
        const altLangRangeSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
          (x) => x.subLocalityRef === altLangRangeData.subLocalityRef
        );
        const dataRangeEng = {
          language: "ENG",
          rangeType:
            engRangeData.rangeType !== altLangRangeData.rangeType ? altLangRangeData.rangeType : engRangeData.rangeType,
          rangeText: !engRangeData.rangeText ? altLangRangeData.rangeText : engRangeData.rangeText,
          rangeStartPrefix:
            engRangeData.rangeStartPrefix !== altLangRangeData.rangeStartPrefix
              ? altLangRangeData.rangeStartPrefix
              : engRangeData.rangeStartPrefix,
          rangeStartNumber:
            engRangeData.rangeStartNumber !== altLangRangeData.rangeStartNumber
              ? altLangRangeData.rangeStartNumber
              : engRangeData.rangeStartNumber,
          rangeStartSuffix:
            engRangeData.rangeStartSuffix !== altLangRangeData.rangeStartSuffix
              ? altLangRangeData.rangeStartSuffix
              : engRangeData.rangeStartSuffix,
          rangeEndPrefix:
            engRangeData.rangeEndPrefix !== altLangRangeData.rangeEndPrefix
              ? altLangRangeData.rangeEndPrefix
              : engRangeData.rangeEndPrefix,
          rangeEndNumber:
            engRangeData.rangeEndNumber !== altLangRangeData.rangeEndNumber
              ? altLangRangeData.rangeEndNumber
              : engRangeData.rangeEndNumber,
          rangeEndSuffix:
            engRangeData.rangeEndSuffix !== altLangRangeData.rangeEndSuffix
              ? altLangRangeData.rangeEndSuffix
              : engRangeData.rangeEndSuffix,
          numbering:
            engRangeData.numbering !== altLangRangeData.numbering ? altLangRangeData.numbering : engRangeData.numbering,
          paoStartNumber: !engRangeData.paoStartNumber ? altLangRangeData.paoStartNumber : engRangeData.paoStartNumber,
          paoStartSuffix: !engRangeData.paoStartSuffix ? altLangRangeData.paoStartSuffix : engRangeData.paoStartSuffix,
          paoEndNumber: !engRangeData.paoEndNumber ? altLangRangeData.paoEndNumber : engRangeData.paoEndNumber,
          paoEndSuffix: !engRangeData.paoEndSuffix ? altLangRangeData.paoEndSuffix : engRangeData.paoEndSuffix,
          paoText: !engRangeData.paoText ? altLangRangeData.paoText : engRangeData.paoText,
          paoDetails: !engRangeData.paoDetails ? altLangRangeData.paoDetails : engRangeData.paoDetails,
          usrn: engRangeData.usrn !== altLangRangeData.usrn ? altLangRangeData.usrn : engRangeData.usrn,
          postcodeRef:
            engRangeData.postcodeRef !== altLangRangeData.postcodeRef
              ? altLangRangeData.postcodeRef
              : engRangeData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh &&
            altLangRangePostTownRecord &&
            engRangeData.postTownRef !== altLangRangePostTownRecord.linkedRef
              ? altLangRangePostTownRecord.linkedRef
              : engRangeData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh &&
            altLangRangeSubLocalityRecord &&
            engRangeData.subLocalityRef !== altLangRangeSubLocalityRecord.linkedRef
              ? altLangRangeSubLocalityRecord.linkedRef
              : engRangeData.subLocalityRef,
          addressList: getSyncedAddressList(engRangeData, altLangRangeData),
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              rangeType: dataRangeEng.rangeType,
              rangeText: dataRangeEng.rangeText,
              rangeStartPrefix: dataRangeEng.rangeStartPrefix,
              rangeStartNumber: dataRangeEng.rangeStartNumber,
              rangeStartSuffix: dataRangeEng.rangeStartSuffix,
              rangeEndPrefix: dataRangeEng.rangeEndPrefix,
              rangeEndNumber: dataRangeEng.rangeEndNumber,
              rangeEndSuffix: dataRangeEng.rangeEndSuffix,
              numbering: dataRangeEng.numbering,
              paoStartNumber: dataRangeEng.paoStartNumber,
              paoStartSuffix: dataRangeEng.paoStartSuffix,
              paoEndNumber: dataRangeEng.paoEndNumber,
              paoEndSuffix: dataRangeEng.paoEndSuffix,
              paoText: dataRangeEng.paoText,
              paoDetails: dataRangeEng.paoDetails,
              usrn: dataRangeEng.usrn,
              postcodeRef: dataRangeEng.postcodeRef,
              postTownRef: dataRangeEng.postTownRef,
              subLocalityRef: dataRangeEng.subLocalityRef,
              addressList: dataRangeEng.addressList,
            },
            {
              language: altLangRangeData.language,
              rangeType: altLangRangeData.rangeType,
              rangeText: altLangRangeData.rangeText,
              rangeStartPrefix: altLangRangeData.rangeStartPrefix,
              rangeStartNumber: altLangRangeData.rangeStartNumber,
              rangeStartSuffix: altLangRangeData.rangeStartSuffix,
              rangeEndPrefix: altLangRangeData.rangeEndPrefix,
              rangeEndNumber: altLangRangeData.rangeEndNumber,
              rangeEndSuffix: altLangRangeData.rangeEndSuffix,
              numbering: altLangRangeData.numbering,
              paoStartNumber: altLangRangeData.paoStartNumber,
              paoStartSuffix: altLangRangeData.paoStartSuffix,
              paoEndNumber: altLangRangeData.paoEndNumber,
              paoEndSuffix: altLangRangeData.paoEndSuffix,
              paoText: altLangRangeData.paoText,
              paoDetails: altLangRangeData.paoDetails,
              usrn: altLangRangeData.usrn,
              postcodeRef: altLangRangeData.postcodeRef,
              postTownRef: altLangRangeData.postTownRef,
              subLocalityRef: altLangRangeData.subLocalityRef,
              addressList: altLangRangeData.addressList,
            },
          ]);
      } else {
        const altLangSinglePostTownRecord = lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === altLangSingleData.postTownRef
        );
        const dataEng = {
          language: "ENG",
          saoStartNumber: !engSingleData.saoStartNumber
            ? altLangSingleData.saoStartNumber
            : engSingleData.saoStartNumber,
          saoStartSuffix: !engSingleData.saoStartSuffix
            ? altLangSingleData.saoStartSuffix
            : engSingleData.saoStartSuffix,
          saoEndNumber: !engSingleData.saoEndNumber ? altLangSingleData.saoEndNumber : engSingleData.saoEndNumber,
          saoEndSuffix: !engSingleData.saoEndSuffix ? altLangSingleData.saoEndSuffix : engSingleData.saoEndSuffix,
          saoText: !engSingleData.saoText ? altLangSingleData.saoText : engSingleData.saoText,
          paoStartNumber: !engSingleData.paoStartNumber
            ? altLangSingleData.paoStartNumber
            : engSingleData.paoStartNumber,
          paoStartSuffix: !engSingleData.paoStartSuffix
            ? altLangSingleData.paoStartSuffix
            : engSingleData.paoStartSuffix,
          paoEndNumber: !engSingleData.paoEndNumber ? altLangSingleData.paoEndNumber : engSingleData.paoEndNumber,
          paoEndSuffix: !engSingleData.paoEndSuffix ? altLangSingleData.paoEndSuffix : engSingleData.paoEndSuffix,
          paoText: !engSingleData.paoText ? altLangSingleData.paoText : engSingleData.paoText,
          paoDetails: !engSingleData.paoDetails ? altLangSingleData.paoDetails : engSingleData.paoDetails,
          usrn: engSingleData.usrn !== altLangSingleData.usrn ? altLangSingleData.usrn : engSingleData.usrn,
          postcodeRef:
            settingsContext.isWelsh && engSingleData.postcodeRef !== altLangSingleData.postcodeRef
              ? altLangSingleData.postcodeRef
              : engSingleData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh &&
            altLangSinglePostTownRecord &&
            engSingleData.postTownRef !== altLangSinglePostTownRecord.linkedRef
              ? altLangSinglePostTownRecord.linkedRef
              : engSingleData.postTownRef,
          subLocalityRef: engSingleData.subLocalityRef,
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              saoStartNumber: dataEng.saoStartNumber,
              saoStartSuffix: dataEng.saoStartSuffix,
              saoEndNumber: dataEng.saoEndNumber,
              saoEndSuffix: dataEng.saoEndSuffix,
              saoText: dataEng.saoText,
              paoStartNumber: dataEng.paoStartNumber,
              paoStartSuffix: dataEng.paoStartSuffix,
              paoEndNumber: dataEng.paoEndNumber,
              paoEndSuffix: dataEng.paoEndSuffix,
              paoText: dataEng.paoText,
              paoDetails: dataEng.paoDetails,
              usrn: dataEng.usrn,
              postcodeRef: dataEng.postcodeRef,
              postTownRef: dataEng.postTownRef,
              subLocalityRef: dataEng.subLocalityRef,
            },
            {
              language: altLangSingleData.language,
              saoStartNumber: altLangSingleData.saoStartNumber,
              saoStartSuffix: altLangSingleData.saoStartSuffix,
              saoEndNumber: altLangSingleData.saoEndNumber,
              saoEndSuffix: altLangSingleData.saoEndSuffix,
              saoText: altLangSingleData.saoText,
              paoStartNumber: altLangSingleData.paoStartNumber,
              paoStartSuffix: altLangSingleData.paoStartSuffix,
              paoEndNumber: altLangSingleData.paoEndNumber,
              paoEndSuffix: altLangSingleData.paoEndSuffix,
              paoText: altLangSingleData.paoText,
              paoDetails: altLangSingleData.paoDetails,
              usrn: altLangSingleData.usrn,
              postcodeRef: altLangSingleData.postcodeRef,
              postTownRef: altLangSingleData.postTownRef,
              subLocalityRef: altLangSingleData.subLocalityRef,
            },
          ]);
      }
    } else {
      if (isRange) {
        const engRangePostTownRecord = lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === engRangeData.postTownRef
        );
        const engRangeSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
          (x) => x.subLocalityRef === engRangeData.subLocalityRef
        );
        const dataRangeAlt = {
          language: settingsContext.isScottish ? "GAE" : "CYM",
          rangeType:
            altLangRangeData.rangeType !== engRangeData.rangeType ? engRangeData.rangeType : altLangRangeData.rangeType,
          rangeText: !altLangRangeData.rangeText ? engRangeData.rangeText : altLangRangeData.rangeText,
          rangeStartPrefix:
            altLangRangeData.rangeStartPrefix !== engRangeData.rangeStartPrefix
              ? engRangeData.rangeStartPrefix
              : altLangRangeData.rangeStartPrefix,
          rangeStartNumber:
            altLangRangeData.rangeStartNumber !== engRangeData.rangeStartNumber
              ? engRangeData.rangeStartNumber
              : altLangRangeData.rangeStartNumber,
          rangeStartSuffix:
            altLangRangeData.rangeStartSuffix !== engRangeData.rangeStartSuffix
              ? engRangeData.rangeStartSuffix
              : altLangRangeData.rangeStartSuffix,
          rangeEndPrefix:
            altLangRangeData.rangeEndPrefix !== engRangeData.rangeEndPrefix
              ? engRangeData.rangeEndPrefix
              : altLangRangeData.rangeEndPrefix,
          rangeEndNumber:
            altLangRangeData.rangeEndNumber !== engRangeData.rangeEndNumber
              ? engRangeData.rangeEndNumber
              : altLangRangeData.rangeEndNumber,
          rangeEndSuffix:
            altLangRangeData.rangeEndSuffix !== engRangeData.rangeEndSuffix
              ? engRangeData.rangeEndSuffix
              : altLangRangeData.rangeEndSuffix,
          numbering:
            altLangRangeData.numbering !== engRangeData.numbering ? engRangeData.numbering : altLangRangeData.numbering,
          paoStartNumber: !altLangRangeData.paoStartNumber
            ? engRangeData.paoStartNumber
            : altLangRangeData.paoStartNumber,
          paoStartSuffix: !altLangRangeData.paoStartSuffix
            ? engRangeData.paoStartSuffix
            : altLangRangeData.paoStartSuffix,
          paoEndNumber: !altLangRangeData.paoEndNumber ? engRangeData.paoEndNumber : altLangRangeData.paoEndNumber,
          paoEndSuffix: !altLangRangeData.paoEndSuffix ? engRangeData.paoEndSuffix : altLangRangeData.paoEndSuffix,
          paoText: !altLangRangeData.paoText ? engRangeData.paoText : altLangRangeData.paoText,
          paoDetails: !altLangRangeData.paoDetails ? engRangeData.paoDetails : altLangRangeData.paoDetails,
          usrn: altLangRangeData.usrn !== engRangeData.usrn ? engRangeData.usrn : altLangRangeData.usrn,
          postcodeRef:
            settingsContext.isWelsh && altLangRangeData.postcodeRef !== engRangeData.postcodeRef
              ? engRangeData.postcodeRef
              : altLangRangeData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh &&
            engRangePostTownRecord &&
            altLangRangeData.postTownRef !== engRangePostTownRecord.linkedRef
              ? engRangePostTownRecord.linkedRef
              : altLangRangeData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh &&
            engRangeSubLocalityRecord &&
            altLangRangeData.subLocalityRef !== engRangeSubLocalityRecord.linkedRef
              ? engRangeSubLocalityRecord.linkedRef
              : altLangRangeData.subLocalityRef,
          addressList: getSyncedAddressList(altLangRangeData, engRangeData),
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              rangeType: engRangeData.rangeType,
              rangeText: engRangeData.rangeText,
              rangeStartPrefix: engRangeData.rangeStartPrefix,
              rangeStartNumber: engRangeData.rangeStartNumber,
              rangeStartSuffix: engRangeData.rangeStartSuffix,
              rangeEndPrefix: engRangeData.rangeEndPrefix,
              rangeEndNumber: engRangeData.rangeEndNumber,
              rangeEndSuffix: engRangeData.rangeEndSuffix,
              numbering: engRangeData.numbering,
              paoStartNumber: engRangeData.paoStartNumber,
              paoStartSuffix: engRangeData.paoStartSuffix,
              paoEndNumber: engRangeData.paoEndNumber,
              paoEndSuffix: engRangeData.paoEndSuffix,
              paoText: engRangeData.paoText,
              paoDetails: engRangeData.paoDetails,
              usrn: engRangeData.usrn,
              postcodeRef: engRangeData.postcodeRef,
              postTownRef: engRangeData.postTownRef,
              subLocalityRef: engRangeData.subLocalityRef,
              addressList: engRangeData.addressList,
            },
            {
              language: dataRangeAlt.language,
              rangeType: dataRangeAlt.rangeType,
              rangeText: dataRangeAlt.rangeText,
              rangeStartPrefix: dataRangeAlt.rangeStartPrefix,
              rangeStartNumber: dataRangeAlt.rangeStartNumber,
              rangeStartSuffix: dataRangeAlt.rangeStartSuffix,
              rangeEndPrefix: dataRangeAlt.rangeEndPrefix,
              rangeEndNumber: dataRangeAlt.rangeEndNumber,
              rangeEndSuffix: dataRangeAlt.rangeEndSuffix,
              numbering: dataRangeAlt.numbering,
              paoStartNumber: dataRangeAlt.paoStartNumber,
              paoStartSuffix: dataRangeAlt.paoStartSuffix,
              paoEndNumber: dataRangeAlt.paoEndNumber,
              paoEndSuffix: dataRangeAlt.paoEndSuffix,
              paoText: dataRangeAlt.paoText,
              paoDetails: dataRangeAlt.paoDetails,
              usrn: dataRangeAlt.usrn,
              postcodeRef: dataRangeAlt.postcodeRef,
              postTownRef: dataRangeAlt.postTownRef,
              subLocalityRef: dataRangeAlt.subLocalityRef,
              addressList: dataRangeAlt.addressList,
            },
          ]);
      } else {
        const engSinglePostTownRecord = lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === engSingleData.postTownRef
        );
        const engSingleSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
          (x) => x.subLocalityRef === engSingleData.subLocalityRef
        );
        const dataAlt = {
          language: settingsContext.isScottish ? "GAE" : "CYM",
          saoStartNumber: !altLangSingleData.saoStartNumber
            ? engSingleData.saoStartNumber
            : altLangSingleData.saoStartNumber,
          saoStartSuffix: !altLangSingleData.saoStartSuffix
            ? engSingleData.saoStartSuffix
            : altLangSingleData.saoStartSuffix,
          saoEndNumber: !altLangSingleData.saoEndNumber ? engSingleData.saoEndNumber : altLangSingleData.saoEndNumber,
          saoEndSuffix: !altLangSingleData.saoEndSuffix ? engSingleData.saoEndSuffix : altLangSingleData.saoEndSuffix,
          saoText: !altLangSingleData.saoText ? engSingleData.saoText : altLangSingleData.saoText,
          paoStartNumber: !altLangSingleData.paoStartNumber
            ? engSingleData.paoStartNumber
            : altLangSingleData.paoStartNumber,
          paoStartSuffix: !altLangSingleData.paoStartSuffix
            ? engSingleData.paoStartSuffix
            : altLangSingleData.paoStartSuffix,
          paoEndNumber: !altLangSingleData.paoEndNumber ? engSingleData.paoEndNumber : altLangSingleData.paoEndNumber,
          paoEndSuffix: !altLangSingleData.paoEndSuffix ? engSingleData.paoEndSuffix : altLangSingleData.paoEndSuffix,
          paoText: !altLangSingleData.paoText ? engSingleData.paoText : altLangSingleData.paoText,
          paoDetails: !altLangSingleData.paoDetails ? engSingleData.paoDetails : altLangSingleData.paoDetails,
          usrn: altLangSingleData.usrn,
          postcodeRef: altLangSingleData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh &&
            engSinglePostTownRecord &&
            altLangSingleData.postTownRef !== engSinglePostTownRecord.linkedRef
              ? engSinglePostTownRecord.linkedRef
              : altLangSingleData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh &&
            engSingleSubLocalityRecord &&
            altLangSingleData.subLocalityRef !== engSingleSubLocalityRecord.linkedRef
              ? engSingleSubLocalityRecord.linkedRef
              : altLangSingleData.subLocalityRef,
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              saoStartNumber: engSingleData.saoStartNumber,
              saoStartSuffix: engSingleData.saoStartSuffix,
              saoEndNumber: engSingleData.saoEndNumber,
              saoEndSuffix: engSingleData.saoEndSuffix,
              saoText: engSingleData.saoText,
              paoStartNumber: engSingleData.paoStartNumber,
              paoStartSuffix: engSingleData.paoStartSuffix,
              paoEndNumber: engSingleData.paoEndNumber,
              paoEndSuffix: engSingleData.paoEndSuffix,
              paoText: engSingleData.paoText,
              paoDetails: engSingleData.paoDetails,
              usrn: engSingleData.usrn,
              postcodeRef: engSingleData.postcodeRef,
              postTownRef: engSingleData.postTownRef,
              subLocalityRef: engSingleData.subLocalityRef,
            },
            {
              language: dataAlt.language,
              saoStartNumber: dataAlt.saoStartNumber,
              saoStartSuffix: dataAlt.saoStartSuffix,
              saoEndNumber: dataAlt.saoEndNumber,
              saoEndSuffix: dataAlt.saoEndSuffix,
              saoText: dataAlt.saoText,
              paoStartNumber: dataAlt.paoStartNumber,
              paoStartSuffix: dataAlt.paoStartSuffix,
              paoEndNumber: dataAlt.paoEndNumber,
              paoEndSuffix: dataAlt.paoEndSuffix,
              paoText: dataAlt.paoText,
              paoDetails: dataAlt.paoDetails,
              usrn: dataAlt.usrn,
              postcodeRef: dataAlt.postcodeRef,
              postTownRef: dataAlt.postTownRef,
              subLocalityRef: dataAlt.subLocalityRef,
            },
          ]);
      }
    }

    setValue(newValue);

    if (onLanguageChanged) onLanguageChanged(newValue === 0 ? "ENG" : settingsContext.isScottish ? "GAE" : "CYM");
  };

  /**
   * Method to get the synced address list.
   *
   * @param {object} updateData The updated data.
   * @param {object} referenceData The reference data.
   * @returns {Array} The address list.
   */
  const getSyncedAddressList = (updateData, referenceData) => {
    const newList = [];

    const selectedUsrn = updateData.usrn !== referenceData.usrn ? referenceData.usrn : updateData.usrn;
    const selectedPostcode =
      updateData.postcodeRef !== referenceData.postcodeRef ? referenceData.postcodeRef : updateData.postcodeRef;
    let referencePostTownRecord =
      referenceData && referenceData.postTownRef
        ? settingsContext.isWelsh
          ? lookupContext.currentLookups.postTowns.find(
              (x) => x.postTownRef === referenceData.postTownRef && x.language === referenceData.language
            )
          : lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === referenceData.postTownRef)
        : null;

    if (
      settingsContext.isScottish &&
      !referencePostTownRecord &&
      referenceData &&
      referenceData.postTownRef &&
      referenceData.language === "GAE"
    )
      referencePostTownRecord = lookupContext.currentLookups.postTowns.find(
        (x) => x.postTownRef === referenceData.postTownRef && x.language === "ENG"
      );

    let streetDescriptorRecord = lookupContext.currentLookups.streetDescriptors.find(
      (x) => x.usrn === selectedUsrn && x.language === referenceData.language
    );

    if (settingsContext.isScottish && !streetDescriptorRecord && referenceData && referenceData.language === "GAE")
      streetDescriptorRecord = lookupContext.currentLookups.streetDescriptors.find(
        (x) => x.usrn === selectedUsrn && x.language === "ENG"
      );

    let postTownRecord = referencePostTownRecord
      ? lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === referencePostTownRecord.linkedRef && x.language === updateData.language
        )
      : null;

    if (settingsContext.isScottish && !postTownRecord && referencePostTownRecord && updateData.language === "GAE")
      postTownRecord = lookupContext.currentLookups.postTowns.find(
        (x) => x.postTownRef === referencePostTownRecord.postTownRef && x.language === "ENG"
      );

    const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === selectedPostcode);

    const getNewMapLabel = (address) => {
      if (!address.saoNumber && !address.saoSuffix && !address.saoText) {
        if ((address.paoNumber || address.paoSuffix) && !address.paoText)
          return `${address.paoNumber ? address.paoNumber : ""}${address.paoSuffix ? address.paoSuffix : ""}`;
        else if (!address.paoNumber && !address.paoSuffix && address.paoText)
          return `${
            referenceData.rangeText && updateData.rangeText
              ? address.paoText.replace(referenceData.rangeText, updateData.rangeText)
              : address.paoText
          }`;
        else if ((address.paoNumber || address.paoSuffix) && address.paoText)
          return `${
            referenceData.rangeText && updateData.rangeText
              ? address.paoText.replace(referenceData.rangeText, updateData.rangeText)
              : address.paoText
          }, ${address.paoNumber ? address.paoNumber : ""}${address.paoSuffix ? address.paoSuffix : ""}`;
      } else {
        if ((address.saoNumber || address.saoSuffix) && !address.saoText)
          return `${address.saoNumber ? address.saoNumber : ""}${address.saoSuffix ? address.saoSuffix : ""}, ${
            address.paoDetails
          }`;
        else if (!address.saoNumber && !address.saoSuffix && address.saoText)
          return `${
            referenceData.rangeText && updateData.rangeText
              ? address.saoText.replace(referenceData.rangeText, updateData.rangeText)
              : address.saoText
          }, ${address.paoDetails}`;
        else if ((address.saoNumber || address.saoSuffix) && address.saoText)
          return `${
            referenceData.rangeText && updateData.rangeText
              ? address.saoText.replace(referenceData.rangeText, updateData.rangeText)
              : address.saoText
          }, ${address.saoNumber ? address.saoNumber : ""}${address.saoSuffix ? address.saoSuffix : ""}, ${
            address.paoDetails
          }`;
      }
    };

    const getNewAddress = (mapLabel) => {
      return `${mapLabel}${streetDescriptorRecord ? " " : ""}${
        streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
      }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
        postcodeRecord ? " " : ""
      }${postcodeRecord ? postcodeRecord.postcode : ""}`;
    };

    // Rebuild a new list from the referenceData list
    for (const address of referenceData.addressList) {
      const newMapLabel = getNewMapLabel(address);
      const newAddress = getNewAddress(newMapLabel);

      newList.push({
        id: address.id,
        address: newAddress,
        mapLabel: newMapLabel,
        saoNumber: address.saoNumber,
        saoSuffix: address.saoSuffix,
        saoText:
          address.saoText && referenceData.rangeText && updateData.rangeText
            ? address.saoText.replace(referenceData.rangeText, updateData.rangeText)
            : address.saoText,
        paoNumber: address.paoNumber,
        paoSuffix: address.paoSuffix,
        paoText:
          address.paoText && referenceData.rangeText && updateData.rangeText
            ? address.paoText.replace(referenceData.rangeText, updateData.rangeText)
            : address.paoText,
        paoDetails: address.paoDetails,
        usrn: address.usrn,
        postTownRef: postTownRecord ? postTownRecord.postTownRef : null,
        postcodeRef: address.postcodeRef,
        included: address.included,
      });
    }

    return newList;
  };

  /**
   * Event to handle when the range property data changes.
   *
   * @param {object} rangeData The range data.
   */
  const handleRangePropertyDataChange = (rangeData) => {
    const postTownRecord = settingsContext.isWelsh
      ? lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === rangeData.postTownRef && x.language === rangeData.language
        )
      : lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === rangeData.postTownRef);
    const subLocalityRecord = settingsContext.isScottish
      ? lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === rangeData.subLocalityRef)
      : null;

    if (settingsContext.isScottish || settingsContext.isWelsh) {
      if (language === "ENG") {
        const dataAlt = {
          language: altLangRangeData.language,
          rangeType:
            altLangRangeData.rangeType !== rangeData.rangeType ? rangeData.rangeType : altLangRangeData.rangeType,
          rangeText: altLangRangeData.rangeText,
          rangeStartPrefix:
            altLangRangeData.rangeStartPrefix !== rangeData.rangeStartPrefix
              ? rangeData.rangeStartPrefix
              : altLangRangeData.rangeStartPrefix,
          rangeStartNumber:
            altLangRangeData.rangeStartNumber !== rangeData.rangeStartNumber
              ? rangeData.rangeStartNumber
              : altLangRangeData.rangeStartNumber,
          rangeStartSuffix:
            altLangRangeData.rangeStartSuffix !== rangeData.rangeStartSuffix
              ? rangeData.rangeStartSuffix
              : altLangRangeData.rangeStartSuffix,
          rangeEndPrefix:
            altLangRangeData.rangeEndPrefix !== rangeData.rangeEndPrefix
              ? rangeData.rangeEndPrefix
              : altLangRangeData.rangeEndPrefix,
          rangeEndNumber:
            altLangRangeData.rangeEndNumber !== rangeData.rangeEndNumber
              ? rangeData.rangeEndNumber
              : altLangRangeData.rangeEndNumber,
          rangeEndSuffix:
            altLangRangeData.rangeEndSuffix !== rangeData.rangeEndSuffix
              ? rangeData.rangeEndSuffix
              : altLangRangeData.rangeEndSuffix,
          numbering:
            altLangRangeData.numbering !== rangeData.numbering ? rangeData.numbering : altLangRangeData.numbering,
          paoStartNumber:
            altLangRangeData.paoStartNumber !== rangeData.paoStartNumber
              ? rangeData.paoStartNumber
              : altLangRangeData.paoStartNumber,
          paoStartSuffix:
            altLangRangeData.paoStartSuffix !== rangeData.paoStartSuffix
              ? rangeData.paoStartSuffix
              : altLangRangeData.paoStartSuffix,
          paoEndNumber:
            altLangRangeData.paoEndNumber !== rangeData.paoEndNumber
              ? rangeData.paoEndNumber
              : altLangRangeData.paoEndNumber,
          paoEndSuffix:
            altLangRangeData.paoEndSuffix !== rangeData.paoEndSuffix
              ? rangeData.paoEndSuffix
              : altLangRangeData.paoEndSuffix,
          paoText: altLangRangeData.paoText,
          paoDetails: altLangRangeData.paoDetails,
          usrn: altLangRangeData.usrn !== rangeData.usrn ? rangeData.usrn : altLangRangeData.usrn,
          postcodeRef:
            altLangRangeData.postcodeRef !== rangeData.postcodeRef
              ? rangeData.postcodeRef
              : altLangRangeData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh && postTownRecord && altLangRangeData.postTownRef !== postTownRecord.linkedRef
              ? postTownRecord.linkedRef
              : altLangRangeData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh &&
            subLocalityRecord &&
            altLangRangeData.subLocalityRef !== subLocalityRecord.linkedRef
              ? subLocalityRecord.linkedRef
              : altLangRangeData.subLocalityRef,
          addressList: getSyncedAddressList(altLangRangeData, rangeData),
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              rangeType: rangeData.rangeType,
              rangeText: rangeData.rangeText,
              rangeStartPrefix: rangeData.rangeStartPrefix,
              rangeStartNumber: rangeData.rangeStartNumber,
              rangeStartSuffix: rangeData.rangeStartSuffix,
              rangeEndPrefix: rangeData.rangeEndPrefix,
              rangeEndNumber: rangeData.rangeEndNumber,
              rangeEndSuffix: rangeData.rangeEndSuffix,
              numbering: rangeData.numbering,
              paoStartNumber: rangeData.paoStartNumber,
              paoStartSuffix: rangeData.paoStartSuffix,
              paoEndNumber: rangeData.paoEndNumber,
              paoEndSuffix: rangeData.paoEndSuffix,
              paoText: rangeData.paoText,
              paoDetails: rangeData.paoDetails,
              usrn: rangeData.usrn,
              postcodeRef: rangeData.postcodeRef,
              postTownRef: rangeData.postTownRef,
              subLocalityRef: rangeData.subLocalityRef,
              addressList: rangeData.addressList,
            },
            {
              language: dataAlt.language,
              rangeType: dataAlt.rangeType,
              rangeText: dataAlt.rangeText,
              rangeStartPrefix: dataAlt.rangeStartPrefix,
              rangeStartNumber: dataAlt.rangeStartNumber,
              rangeStartSuffix: dataAlt.rangeStartSuffix,
              rangeEndPrefix: dataAlt.rangeEndPrefix,
              rangeEndNumber: dataAlt.rangeEndNumber,
              rangeEndSuffix: dataAlt.rangeEndSuffix,
              numbering: dataAlt.numbering,
              paoStartNumber: dataAlt.paoStartNumber,
              paoStartSuffix: dataAlt.paoStartSuffix,
              paoEndNumber: dataAlt.paoEndNumber,
              paoEndSuffix: dataAlt.paoEndSuffix,
              paoText: dataAlt.paoText,
              paoDetails: dataAlt.paoDetails,
              usrn: dataAlt.usrn,
              postcodeRef: dataAlt.postcodeRef,
              postTownRef: dataAlt.postTownRef,
              subLocalityRef: dataAlt.subLocalityRef,
              addressList: dataAlt.addressList,
            },
          ]);
      } else {
        const dataEng = {
          language: engRangeData.language,
          rangeType: engRangeData.rangeType !== rangeData.rangeType ? rangeData.rangeType : engRangeData.rangeType,
          rangeText: engRangeData.rangeText,
          rangeStartPrefix:
            engRangeData.rangeStartPrefix !== rangeData.rangeStartPrefix
              ? rangeData.rangeStartPrefix
              : engRangeData.rangeStartPrefix,
          rangeStartNumber:
            engRangeData.rangeStartNumber !== rangeData.rangeStartNumber
              ? rangeData.rangeStartNumber
              : engRangeData.rangeStartNumber,
          rangeStartSuffix:
            engRangeData.rangeStartSuffix !== rangeData.rangeStartSuffix
              ? rangeData.rangeStartSuffix
              : engRangeData.rangeStartSuffix,
          rangeEndPrefix:
            engRangeData.rangeEndPrefix !== rangeData.rangeEndPrefix
              ? rangeData.rangeEndPrefix
              : engRangeData.rangeEndPrefix,
          rangeEndNumber:
            engRangeData.rangeEndNumber !== rangeData.rangeEndNumber
              ? rangeData.rangeEndNumber
              : engRangeData.rangeEndNumber,
          rangeEndSuffix:
            engRangeData.rangeEndSuffix !== rangeData.rangeEndSuffix
              ? rangeData.rangeEndSuffix
              : engRangeData.rangeEndSuffix,
          numbering: engRangeData.numbering !== rangeData.numbering ? rangeData.numbering : engRangeData.numbering,
          paoStartNumber:
            engRangeData.paoStartNumber !== rangeData.paoStartNumber
              ? rangeData.paoStartNumber
              : engRangeData.paoStartNumber,
          paoStartSuffix:
            engRangeData.paoStartSuffix !== rangeData.paoStartSuffix
              ? rangeData.paoStartSuffix
              : engRangeData.paoStartSuffix,
          paoEndNumber:
            engRangeData.paoEndNumber !== rangeData.paoEndNumber ? rangeData.paoEndNumber : engRangeData.paoEndNumber,
          paoEndSuffix:
            engRangeData.paoEndSuffix !== rangeData.paoEndSuffix ? rangeData.paoEndSuffix : engRangeData.paoEndSuffix,
          paoText: engRangeData.paoText,
          paoDetails: !engRangeData.paoDetails ? rangeData.paoDetails : engRangeData.paoDetails,
          usrn: engRangeData.usrn !== rangeData.usrn ? rangeData.usrn : engRangeData.usrn,
          postcodeRef:
            engRangeData.postcodeRef !== rangeData.postcodeRef ? rangeData.postcodeRef : engRangeData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh && postTownRecord && engRangeData.postTownRef !== postTownRecord.linkedRef
              ? postTownRecord.linkedRef
              : engRangeData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh && subLocalityRecord && engRangeData.subLocalityRef !== subLocalityRecord.linkedRef
              ? subLocalityRecord.linkedRef
              : engRangeData.subLocalityRef,
          addressList: getSyncedAddressList(engRangeData, rangeData),
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              rangeType: dataEng.rangeType,
              rangeText: dataEng.rangeText,
              rangeStartPrefix: dataEng.rangeStartPrefix,
              rangeStartNumber: dataEng.rangeStartNumber,
              rangeStartSuffix: dataEng.rangeStartSuffix,
              rangeEndPrefix: dataEng.rangeEndPrefix,
              rangeEndNumber: dataEng.rangeEndNumber,
              rangeEndSuffix: dataEng.rangeEndSuffix,
              numbering: dataEng.numbering,
              paoStartNumber: dataEng.paoStartNumber,
              paoStartSuffix: dataEng.paoStartSuffix,
              paoEndNumber: dataEng.paoEndNumber,
              paoEndSuffix: dataEng.paoEndSuffix,
              paoText: dataEng.paoText,
              paoDetails: dataEng.paoDetails,
              usrn: dataEng.usrn,
              postcodeRef: dataEng.postcodeRef,
              postTownRef: dataEng.postTownRef,
              subLocalityRef: dataEng.subLocalityRef,
              addressList: dataEng.addressList,
            },
            {
              language: altLangRangeData.language,
              rangeType: rangeData.rangeType,
              rangeText: rangeData.rangeText,
              rangeStartPrefix: rangeData.rangeStartPrefix,
              rangeStartNumber: rangeData.rangeStartNumber,
              rangeStartSuffix: rangeData.rangeStartSuffix,
              rangeEndPrefix: rangeData.rangeEndPrefix,
              rangeEndNumber: rangeData.rangeEndNumber,
              rangeEndSuffix: rangeData.rangeEndSuffix,
              numbering: rangeData.numbering,
              paoStartNumber: rangeData.paoStartNumber,
              paoStartSuffix: rangeData.paoStartSuffix,
              paoEndNumber: rangeData.paoEndNumber,
              paoEndSuffix: rangeData.paoEndSuffix,
              paoText: rangeData.paoText,
              paoDetails: rangeData.paoDetails,
              usrn: rangeData.usrn,
              postcodeRef: rangeData.postcodeRef,
              postTownRef: rangeData.postTownRef,
              subLocalityRef: rangeData.subLocalityRef,
              addressList: rangeData.addressList,
            },
          ]);
      }
    } else {
      if (onDataChanged)
        onDataChanged([
          {
            language: "ENG",
            rangeType: rangeData.rangeType,
            rangeText: rangeData.rangeText,
            rangeStartPrefix: rangeData.rangeStartPrefix,
            rangeStartNumber: rangeData.rangeStartNumber,
            rangeStartSuffix: rangeData.rangeStartSuffix,
            rangeEndPrefix: rangeData.rangeEndPrefix,
            rangeEndNumber: rangeData.rangeEndNumber,
            rangeEndSuffix: rangeData.rangeEndSuffix,
            numbering: rangeData.numbering,
            paoStartNumber: rangeData.paoStartNumber,
            paoStartSuffix: rangeData.paoStartSuffix,
            paoEndNumber: rangeData.paoEndNumber,
            paoEndSuffix: rangeData.paoEndSuffix,
            paoText: rangeData.paoText,
            paoDetails: rangeData.paoDetails,
            usrn: rangeData.usrn,
            postcodeRef: rangeData.postcodeRef,
            postTownRef: rangeData.postTownRef,
            subLocalityRef: rangeData.subLocalityRef,
            addressList: rangeData.addressList,
          },
        ]);
    }
  };

  /**
   * Event to handle when the error list changes.
   *
   * @param {Array} updatedErrors The list of updated errors.
   */
  const handleErrorChange = (updatedErrors) => {
    if (onErrorChanged) onErrorChanged(updatedErrors);
  };

  /**
   * Event to handle when the single property data changes.
   *
   * @param {object} singleData The single property data.
   */
  const handleSinglePropertyDataChange = (singleData) => {
    const postTownRecord = settingsContext.isWelsh
      ? lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === singleData.postTownRef && x.language === singleData.language
        )
      : lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === singleData.postTownRef);
    const subLocalityRecord = settingsContext.isScottish
      ? lookupContext.currentLookups.subLocalities.find(
          (x) => x.subLocalityRef === singleData.subLocalityRef && x.language === singleData.language
        )
      : null;

    if (settingsContext.isWelsh || createGaelicRecords) {
      if (language === "ENG") {
        const dataAlt = {
          language: altLangSingleData.language,
          saoStartNumber:
            altLangSingleData.saoStartNumber !== singleData.saoStartNumber
              ? singleData.saoStartNumber
              : altLangSingleData.saoStartNumber,
          saoStartSuffix:
            altLangSingleData.saoStartSuffix !== singleData.saoStartSuffix
              ? singleData.saoStartSuffix
              : altLangSingleData.saoStartSuffix,
          saoEndNumber:
            altLangSingleData.saoEndNumber !== singleData.saoEndNumber
              ? singleData.saoEndNumber
              : altLangSingleData.saoEndNumber,
          saoEndSuffix:
            altLangSingleData.saoEndSuffix !== singleData.saoEndSuffix
              ? singleData.saoEndSuffix
              : altLangSingleData.saoEndSuffix,
          saoText: altLangSingleData.saoText,
          paoStartNumber:
            altLangSingleData.paoStartNumber !== singleData.paoStartNumber
              ? singleData.paoStartNumber
              : altLangSingleData.paoStartNumber,
          paoStartSuffix:
            altLangSingleData.paoStartSuffix !== singleData.paoStartSuffix
              ? singleData.paoStartSuffix
              : altLangSingleData.paoStartSuffix,
          paoEndNumber:
            altLangSingleData.paoEndNumber !== singleData.paoEndNumber
              ? singleData.paoEndNumber
              : altLangSingleData.paoEndNumber,
          paoEndSuffix:
            altLangSingleData.paoEndSuffix !== singleData.paoEndSuffix
              ? singleData.paoEndSuffix
              : altLangSingleData.paoEndSuffix,
          paoText: altLangSingleData.paoText,
          paoDetails: altLangSingleData.paoDetails,
          usrn: altLangSingleData.usrn !== singleData.usrn ? singleData.usrn : altLangSingleData.usrn,
          postcodeRef:
            altLangSingleData.postcodeRef !== singleData.postcodeRef
              ? singleData.postcodeRef
              : altLangSingleData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh && postTownRecord && altLangSingleData.postTownRef !== postTownRecord.linkedRef
              ? postTownRecord.linkedRef
              : altLangSingleData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh &&
            subLocalityRecord &&
            altLangSingleData.subLocalityRef !== postTownRecord.linkedRef
              ? subLocalityRecord.linkedRef
              : altLangSingleData.subLocalityRef,
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              saoStartNumber: singleData.saoStartNumber,
              saoStartSuffix: singleData.saoStartSuffix,
              saoEndNumber: singleData.saoEndNumber,
              saoEndSuffix: singleData.saoEndSuffix,
              saoText: singleData.saoText,
              paoStartNumber: singleData.paoStartNumber,
              paoStartSuffix: singleData.paoStartSuffix,
              paoEndNumber: singleData.paoEndNumber,
              paoEndSuffix: singleData.paoEndSuffix,
              paoText: singleData.paoText,
              paoDetails: singleData.paoDetails,
              usrn: singleData.usrn,
              postcodeRef: singleData.postcodeRef,
              postTownRef: singleData.postTownRef,
              subLocalityRef: singleData.subLocalityRef,
            },
            {
              language: dataAlt.language,
              saoStartNumber: dataAlt.saoStartNumber,
              saoStartSuffix: dataAlt.saoStartSuffix,
              saoEndNumber: dataAlt.saoEndNumber,
              saoEndSuffix: dataAlt.saoEndSuffix,
              saoText: dataAlt.saoText,
              paoStartNumber: dataAlt.paoStartNumber,
              paoStartSuffix: dataAlt.paoStartSuffix,
              paoEndNumber: dataAlt.paoEndNumber,
              paoEndSuffix: dataAlt.paoEndSuffix,
              paoText: dataAlt.paoText,
              paoDetails: dataAlt.paoDetails,
              usrn: dataAlt.usrn,
              postcodeRef: dataAlt.postcodeRef,
              postTownRef: dataAlt.postTownRef,
              subLocalityRef: dataAlt.subLocalityRef,
            },
          ]);
      } else {
        const dataEng = {
          language: "ENG",
          saoStartNumber:
            engSingleData.saoStartNumber !== singleData.saoStartNumber
              ? singleData.saoStartNumber
              : engSingleData.saoStartNumber,
          saoStartSuffix:
            engSingleData.saoStartSuffix !== singleData.saoStartSuffix
              ? singleData.saoStartSuffix
              : engSingleData.saoStartSuffix,
          saoEndNumber:
            engSingleData.saoEndNumber !== singleData.saoEndNumber
              ? singleData.saoEndNumber
              : engSingleData.saoEndNumber,
          saoEndSuffix:
            engSingleData.saoEndSuffix !== singleData.saoEndSuffix
              ? singleData.saoEndSuffix
              : engSingleData.saoEndSuffix,
          saoText: engSingleData.saoText,
          paoStartNumber:
            engSingleData.paoStartNumber !== singleData.paoStartNumber
              ? singleData.paoStartNumber
              : engSingleData.paoStartNumber,
          paoStartSuffix:
            engSingleData.paoStartSuffix !== singleData.paoStartSuffix
              ? singleData.paoStartSuffix
              : engSingleData.paoStartSuffix,
          paoEndNumber:
            engSingleData.paoEndNumber !== singleData.paoEndNumber
              ? singleData.paoEndNumber
              : engSingleData.paoEndNumber,
          paoEndSuffix:
            engSingleData.paoEndSuffix !== singleData.paoEndSuffix
              ? singleData.paoEndSuffix
              : engSingleData.paoEndSuffix,
          paoText: engSingleData.paoText,
          paoDetails: engSingleData.paoDetails,
          usrn: engSingleData.usrn !== singleData.usrn ? singleData.usrn : engSingleData.usrn,
          postcodeRef:
            engSingleData.postcodeRef !== singleData.postcodeRef ? singleData.postcodeRef : engSingleData.postcodeRef,
          postTownRef:
            settingsContext.isWelsh && postTownRecord && engSingleData.postTownRef !== postTownRecord.linkedRef
              ? postTownRecord.linkedRef
              : engSingleData.postTownRef,
          subLocalityRef:
            settingsContext.isWelsh && subLocalityRecord && engSingleData.subLocalityRef !== subLocalityRecord.linkedRef
              ? subLocalityRecord.linkedRef
              : engSingleData.subLocalityRef,
        };

        if (onDataChanged)
          onDataChanged([
            {
              language: "ENG",
              saoStartNumber: dataEng.saoStartNumber,
              saoStartSuffix: dataEng.saoStartSuffix,
              saoEndNumber: dataEng.saoEndNumber,
              saoEndSuffix: dataEng.saoEndSuffix,
              saoText: dataEng.saoText,
              paoStartNumber: dataEng.paoStartNumber,
              paoStartSuffix: dataEng.paoStartSuffix,
              paoEndNumber: dataEng.paoEndNumber,
              paoEndSuffix: dataEng.paoEndSuffix,
              paoText: dataEng.paoText,
              paoDetails: dataEng.paoDetails,
              usrn: dataEng.usrn,
              postcodeRef: dataEng.postcodeRef,
              postTownRef: dataEng.postTownRef,
              subLocalityRef: dataEng.subLocalityRef,
            },
            {
              language: altLangSingleData.language,
              saoStartNumber: singleData.saoStartNumber,
              saoStartSuffix: singleData.saoStartSuffix,
              saoEndNumber: singleData.saoEndNumber,
              saoEndSuffix: singleData.saoEndSuffix,
              saoText: singleData.saoText,
              paoStartNumber: singleData.paoStartNumber,
              paoStartSuffix: singleData.paoStartSuffix,
              paoEndNumber: singleData.paoEndNumber,
              paoEndSuffix: singleData.paoEndSuffix,
              paoText: singleData.paoText,
              paoDetails: singleData.paoDetails,
              usrn: singleData.usrn,
              postcodeRef: singleData.postcodeRef,
              postTownRef: singleData.postTownRef,
              subLocalityRef: singleData.subLocalityRef,
            },
          ]);
      }
    } else {
      if (onDataChanged)
        onDataChanged([
          {
            language: (singleData.language = "ENG"),
            saoStartNumber: singleData.saoStartNumber,
            saoStartSuffix: singleData.saoStartSuffix,
            saoEndNumber: singleData.saoEndNumber,
            saoEndSuffix: singleData.saoEndSuffix,
            saoText: singleData.saoText,
            paoStartNumber: singleData.paoStartNumber,
            paoStartSuffix: singleData.paoStartSuffix,
            paoEndNumber: singleData.paoEndNumber,
            paoEndSuffix: singleData.paoEndSuffix,
            paoText: singleData.paoText,
            paoDetails: singleData.paoDetails,
            usrn: singleData.usrn,
            postcodeRef: singleData.postcodeRef,
            postTownRef: singleData.postTownRef,
            subLocalityRef: singleData.subLocalityRef,
          },
        ]);
    }
  };

  /**
   * Method to get the required address details tab.
   *
   * @returns {JSX.Element} The required address details tab.
   */
  const getAddressDetailsForm = () => {
    if (template) {
      switch (template.numberingSystem) {
        case 1: // Single property and child
          return (
            <WizardAddressDetails1Tab
              data={data}
              isChild={template.templateUseType === 3}
              language={language}
              errors={errors}
              onDataChanged={handleSinglePropertyDataChange}
              onErrorChanged={handleErrorChange}
            />
          );

        case 2: // Property range and child range
          return (
            <WizardAddressDetails2Tab
              data={data}
              isChild={template.templateUseType === 4}
              language={language}
              errors={errors}
              onDataChanged={handleRangePropertyDataChange}
              onErrorChanged={handleErrorChange}
            />
          );

        case 3: // Plot numbering in new build development
          return <Box id="wizard-address-settings-page-plot-numbering" sx={{ width: "100%" }}></Box>;

        case 4: // Official numbering in new build development
          return <Box id="wizard-address-settings-page-official-numbering" sx={{ width: "100%" }}></Box>;

        case 5: // Flats with hotel-style numbering
          return <Box id="wizard-address-settings-page-hotel-numbering" sx={{ width: "100%" }}></Box>;

        case 6: // Bedsits in HMO
          return <Box id="wizard-address-settings-page-bedsit-numbering" sx={{ width: "100%" }}></Box>;

        case 7: // Industrial estate units
          return <Box id="wizard-address-settings-page-industrial-estate-numbering" sx={{ width: "100%" }}></Box>;

        case 8: // Offices
          return <Box id="wizard-address-settings-page-office-numbering" sx={{ width: "100%" }}></Box>;

        case 9: // Property shell
          return <Box id="wizard-address-settings-page-property-shell" sx={{ width: "100%" }}></Box>;

        default:
          return null;
      }
    }
  };

  useEffect(() => {
    if (isRange) setData(language === "ENG" ? engRangeData : altLangRangeData);
    else setData(language === "ENG" ? engSingleData : altLangSingleData);
  }, [isRange, language, engSingleData, altLangSingleData, engRangeData, altLangRangeData]);

  useEffect(() => {
    setCreateGaelicRecords(createAltLang);
  }, [createAltLang]);

  return (
    <Box id="wizard-address-details-page" sx={{ ml: "auto", mr: "auto", width: "1000px" }}>
      <Stack direction="column" spacing={2} sx={{ mt: theme.spacing(1), width: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 24, pl: theme.spacing(0) }}>Address details</Typography>
          {settingsContext.isScottish && (
            <FormControlLabel
              control={<Checkbox checked={createGaelicRecords} onChange={handleCreateGaelicRecordsChangeEvent} />}
              label={`Create Gaelic record${isRange ? "s" : ""}`}
              labelPlacement="start"
            />
          )}
        </Stack>
        <AppBar
          position="static"
          color="default"
          sx={{
            borderStyle: "none",
            borderBottom: `2px solid ${adsLightGreyB}`,
            boxShadow: "none",
          }}
        >
          {((settingsContext.isScottish && createGaelicRecords) || settingsContext.isWelsh) && (
            <Tabs
              value={value}
              onChange={handleTabChange}
              TabIndicatorProps={{ style: { background: adsBlueA, height: "3px" } }}
              aria-label="address-tabs"
              sx={{ backgroundColor: adsOffWhite, color: adsMidGreyA, height: "50px" }}
            >
              <Tab
                sx={wizardTabStyle}
                label={
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                    English
                  </Typography>
                }
                {...a11yProps(0)}
              />
              <Tab
                sx={wizardTabStyle}
                label={
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                    {settingsContext.isWelsh ? "Welsh" : "Gaelic"}
                  </Typography>
                }
                {...a11yProps(1)}
              />
            </Tabs>
          )}
        </AppBar>
        {((settingsContext.isScottish && createGaelicRecords) || settingsContext.isWelsh) && (
          <>
            <TabPanel value={value} index={0}>
              {getAddressDetailsForm()}
            </TabPanel>
            <TabPanel value={value} index={1}>
              {getAddressDetailsForm()}
            </TabPanel>
          </>
        )}
        {(!settingsContext.isScottish || !createGaelicRecords) && !settingsContext.isWelsh && getAddressDetailsForm()}
      </Stack>
    </Box>
  );
}

export default WizardAddressDetailsPage;
