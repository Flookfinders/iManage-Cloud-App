/* #region header */
/**************************************************************************************************
//
//  Description: Metadata settings tab
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
//    002   07.09.23 Sean Flook                 Cleaned the code.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//    007   10.01.24 Sean Flook                 Fix warnings.
//    008   16.01.24 Sean Flook                 Changes required to fix warnings.
//    009   24.01.24 Joel Benford               Interim with API changes and partial save (GP LLPG).
//    010   24.01.24 Joel Benford               Save placeholder gazDate (will need adding to GUI)
//    011   25.01.24 Sean Flook                 Changes required after UX review.
//    012   31.01.24 Joel Benford               Changes to as save and support OS
//    013   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { GetLSGMetadataUrl, GetASDMetadataUrl, GetLLPGMetadataUrl } from "../configuration/ADSConfig";

import {
  Typography,
  Button,
  Grid,
  Card,
  CardHeader,
  CardActionArea,
  CardContent,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { Box, Stack } from "@mui/system";

import EditMetadataGazetteerDialog from "../dialogs/EditMetadataGazetteerDialog";
import EditMetadataCustodianDialog from "../dialogs/EditMetadataCustodianDialog";
import EditMetadataMiscellaneousDialog from "../dialogs/EditMetadataMiscellaneousDialog";
import EditMetadataContentDialog from "../dialogs/EditMetadataContentDialog";

import { DateString, getAuthorityText, getDisplayLanguage } from "../utils/HelperUtils";

import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";

import {
  blueButtonStyle,
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
  getTitleStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function MetadataSettingsTab({ variant }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [streetApiUrl, setStreetApiUrl] = useState(null);
  const [asdApiUrl, setAsdApiUrl] = useState(null);
  const [propertyApiUrl, setPropertyApiUrl] = useState(null);

  //pkIds used in the DB/API, needed for PUTS, in some cases these are *currently* fixed values
  const [metaId, setMetaId] = useState(null); // GP LLPG and OS Gaz
  const [lsgMetaDataId, setLsgMetaDataId] = useState(null);
  const [asdMetaDataId, setAsdMetaDataId] = useState(null);

  const [streetGazetteerData, setStreetGazetteerData] = useState(null);
  const [streetCustodianData, setStreetCustodianData] = useState(null);
  const [streetMiscellaneousData, setStreetMiscellaneousData] = useState(null);
  const [streetContentData, setStreetContentData] = useState(null);
  const [asdGazetteerData, setAsdGazetteerData] = useState(null);
  const [asdCustodianData, setAsdCustodianData] = useState(null);
  const [asdMiscellaneousData, setAsdMiscellaneousData] = useState(null);
  const [asdContentData, setAsdContentData] = useState(null);
  const [propertyGazetteerData, setPropertyGazetteerData] = useState(null);
  const [propertyCustodianData, setPropertyCustodianData] = useState(null);
  const [propertyMiscellaneousData, setPropertyMiscellaneousData] = useState(null);

  const [editGazetteer, setEditGazetteer] = useState(false);
  const [editCustodian, setEditCustodian] = useState(false);
  const [editMiscellaneous, setEditMiscellaneous] = useState(false);
  const [editContent, setEditContent] = useState(false);
  // const [dataValid, setDataValid] = useState(false);

  const [gazName, setGazName] = useState(null);
  const [gazScope, setGazScope] = useState(null);
  const [terOfUse, setTerOfUse] = useState(null);
  const [linkedData, setLinkedData] = useState(null);
  const [gazOwner, setGazOwner] = useState(null);
  const [ngazFreq, setNgazFreq] = useState(null);

  const [custodianName, setCustodianName] = useState(null);
  const [custodianUprn, setCustodianUprn] = useState(null);
  const [custodianCode, setCustodianCode] = useState(null);

  const [classificationScheme, setClassificationScheme] = useState(null);
  const [stateCodeScheme, setStateCodeScheme] = useState(null);
  const [metaDate, setMetaDate] = useState(null);
  const [gazDate, setGazDate] = useState(null);
  const [language, setLanguage] = useState(null);
  const [characterSet, setCharacterSet] = useState(null);

  const [contentMotorwayTrunkRoad, setContentMotorwayTrunkRoad] = useState(null);
  const [contentPrivateStreet, setContentPrivateStreet] = useState(null);
  const [contentPrn, setContentPrn] = useState(null);
  const [contentClassifiedRoad, setContentClassifiedRoad] = useState(null);
  const [contentProwFootpath, setContentProwFootpath] = useState(null);
  const [contentProwBridleway, setContentProwBridleway] = useState(null);
  const [contentProwRestrictedByway, setContentProwRestrictedByway] = useState(null);
  const [contentProwBoat, setContentProwBoat] = useState(null);
  const [contentNationalCycleRoute, setContentNationalCycleRoute] = useState(null);

  const [mdProtectedStreet, setMdProtectedStreet] = useState(null);
  const [mdTrafficSensitive, mdSetTrafficSensitive] = useState(null);
  const [mdSed, setMdSet] = useState(null);
  const [mdProposedSed, setMdProposedSed] = useState(null);
  const [mdLevelCrossing, setMdLevelCrossing] = useState(null);
  const [mdEnvSensitiveArea, setMdEnvSensitiveArea] = useState(null);
  const [mdStructuresNotSed, setMdStructuresNotSed] = useState(null);
  const [mdPipelinesAndCables, setMdPipelinesAndCables] = useState(null);
  const [mdPriorityLanes, setMdPriorityLanes] = useState(null);
  const [mdLaneRental, setMdLaneRental] = useState(null);
  const [mdEarlyNotification, setMdEarlyNotification] = useState(null);
  const [mdSpecialEvents, setMdSpecialEvents] = useState(null);
  const [mdParking, setMdParking] = useState(null);
  const [mdPedCrossAndSignals, setMdPedCrossAndSignal] = useState(null);
  const [mdSpeedLimit, setMdSpeedLimit] = useState(null);
  const [mdTransAuthApp, setMdTransAuthApp] = useState(null);
  const [mdStrategicRoute, setMdStrategicRoute] = useState(null);
  const [mdStreetLight, setMdStreetLight] = useState(null);
  const [mdDrainageAndFlood, setMdDrainageAndFlood] = useState(null);
  const [mdUnusualLayout, setMdUnusualLayout] = useState(null);
  const [mdLocalConsider, setMdLocalConsider] = useState(null);
  const [mdWinterMainRoute, setMdWinterMainRoute] = useState(null);
  const [mdHgvRoute, setMdHgvRoute] = useState(null);
  const [mdEmergencyRoute, setMdEmergencyRoute] = useState(null);

  const [editData, setEditData] = useState({});
  const [showEditGazetteerDialog, setShowEditGazetteerDialog] = useState(false);
  const [showEditCustodianDialog, setShowEditCustodianDialog] = useState(false);
  const [showEditMiscellaneousDialog, setShowEditMiscellaneousDialog] = useState(false);
  const [showEditContentDialog, setShowEditContentDialog] = useState(false);

  const [loading, setLoading] = useState(true);

  /**
   * Event to handle when the done button is clicked.
   */
  const doDoneMetadata = () => {
    switch (variant) {
      case "street":
        break;

      case "asd":
        break;

      case "property":
        break;

      default:
        break;
    }

    //    setDataValid(false);
  };

  /**
   * Method to get the text for the done button.
   *
   * @returns {string} The text to display on the button.
   */
  const getButtonText = () => {
    switch (variant) {
      case "street":
        return settingsContext.streetMetadata && settingsContext.streetMetadata.length > 0 ? "Done" : "Create";

      case "asd":
        return settingsContext.asdMetadata && settingsContext.asdMetadata.length > 0 ? "Done" : "Create";

      case "property":
        return settingsContext.propertyMetadata && settingsContext.propertyMetadata.length > 0 ? "Done" : "Create";

      default:
        return "Done";
    }
  };

  /**
   * Event to handle when the mouse enters the gazetteer card.
   */
  const doMouseEnterGazetteer = () => {
    setEditGazetteer(true);
  };

  /**
   * Event to handle when the mouse leaves the gazetteer card.
   */
  const doMouseLeaveGazetteer = () => {
    setEditGazetteer(false);
  };

  /**
   * Event to handle when the mouse enters the custodian card.
   */
  const doMouseEnterCustodian = () => {
    setEditCustodian(true);
  };

  /**
   * Event to handle when the mouse leaves the custodian card.
   */
  const doMouseLeaveCustodian = () => {
    setEditCustodian(false);
  };

  /**
   * Event to handle when the mouse enters the miscellaneous card.
   */
  const doMouseEnterMiscellaneous = () => {
    setEditMiscellaneous(true);
  };

  /**
   * Event to handle when the mouse leaves the miscellaneous card.
   */
  const doMouseLeaveMiscellaneous = () => {
    setEditMiscellaneous(false);
  };

  /**
   * Event to handle when the mouse enters the content card.
   */
  const doMouseEnterContent = () => {
    setEditContent(true);
  };

  /**
   * Event to handle when the mouse leaves the content card.
   */
  const doMouseLeaveContent = () => {
    setEditContent(false);
  };

  /**
   * Event to handle when the gazetteer edit button is clicked.
   */
  const doEditGazetteer = () => {
    switch (variant) {
      case "street":
        setEditData(streetGazetteerData);
        break;

      case "asd":
        setEditData(asdGazetteerData);
        break;

      case "property":
        setEditData(propertyGazetteerData);
        break;

      default:
        break;
    }
    setShowEditGazetteerDialog(true);
  };

  /**
   * Event to handle when the custodian edit button is clicked.
   */
  const doEditCustodian = () => {
    switch (variant) {
      case "street":
        setEditData(streetCustodianData);
        break;

      case "asd":
        setEditData(asdCustodianData);
        break;

      case "property":
        setEditData(propertyCustodianData);
        break;

      default:
        break;
    }
    setShowEditCustodianDialog(true);
  };

  /**
   * Event to handle when the miscellaneous edit button is clicked.
   */
  const doEditMiscellaneous = () => {
    switch (variant) {
      case "street":
        setEditData(streetMiscellaneousData);
        break;

      case "asd":
        setEditData(asdMiscellaneousData);
        break;

      case "property":
        setEditData(propertyMiscellaneousData);
        break;

      default:
        break;
    }
    setShowEditMiscellaneousDialog(true);
  };

  /**
   * Event to handle when the content edit button is clicked.
   */
  const doEditContent = () => {
    switch (variant) {
      case "street":
        setEditData(streetContentData);
        break;

      case "asd":
        setEditData(asdContentData);
        break;

      default:
        break;
    }
    setShowEditContentDialog(true);
  };

  /**
   * Method to get the card title.
   *
   * @returns {string} The card title.
   */
  const getTitle = () => {
    switch (variant) {
      case "street":
        return "Street metadata";

      case "asd":
        return "ASD metadata";

      case "property":
        return "Property metadata";

      default:
        break;
    }
  };

  /**
   * Method to get the full text for the given ngazFreq.
   *
   * @param {string} value The type of ngazFreq.
   * @returns {string} The full text for the frequency.
   */
  const getFrequency = (value) => {
    switch (value) {
      case "D":
        return "Daily";

      case "W":
        return "Weekly";

      case "F":
        return "Fortnightly";

      case "M":
        return "Monthly";

      default:
        return "";
    }
  };

  /**
   * Get the formatted metadata date.
   *
   * @param {Date} value The metadata date.
   * @returns {string} The formatted date.
   */
  const getDisplayDate = (value) => {
    return DateString(value);
  };

  /**
   * Gets the original (pre-edit) values for fields in LLPG/OS API PUT
   *
   * @param {boolean} oneScotland The gazetteer is Scottish.
   */
  const getOriginalPropertyApiData = (oneScotland) => {
    return {
      metaId,
      gazName,
      gazScope,
      terOfUse,
      linkedData,
      gazOwner,
      ngazFreq,
      custodianName,
      custodianUprn: oneScotland ? undefined : custodianUprn,
      custodianCode,
      metaDate,
      classificationScheme,
      gazDate,
      language,
      characterSet: oneScotland ? undefined : characterSet,
      stateCodeScheme: oneScotland ? stateCodeScheme : undefined,
    };
  };

  /**
   * Gets the original (pre-edit) values for fields in LLPG/OS API PUT
   *
   * @param {boolean} oneScotland The gazetteer is Scottish.
   */
  const getOriginalStreetApiData = () => {
    return {
      lsgMetaDataId,
      terOfUse,
      linkedData,
      ngazFreq,
      custodianName,
      custodianUprn,
      custodianCode,
      metaDate,
      classificationScheme,
      gazDate,
      language,
      characterSet,
      contentMotorwayTrunkRoad,
      contentPrivateStreet,
      contentPrn,
      contentClassifiedRoad,
      contentProwFootpath,
      contentProwBridleway,
      contentProwRestrictedByway,
      contentProwBoat,
      contentNationalCycleRoute,
    };
  };

  /**
   * Gets the original (pre-edit) values for fields in LLPG/OS API PUT
   *
   * @param {boolean} oneScotland The gazetteer is Scottish.
   */
  const getOriginalAsdApiData = () => {
    return {
      asdMetaDataId,
      terOfUse,
      linkedData,
      ngazFreq,
      custodianName,
      custodianUprn,
      custodianCode,
      metaDate,
      classificationScheme,
      gazDate,
      language,
      characterSet,
      mdProtectedStreet,
      mdTrafficSensitive,
      mdSed,
      mdProposedSed,
      mdLevelCrossing,
      mdEnvSensitiveArea,
      mdStructuresNotSed,
      mdPipelinesAndCables,
      mdPriorityLanes,
      mdLaneRental,
      mdEarlyNotification,
      mdSpecialEvents,
      mdParking,
      mdPedCrossAndSignals,
      mdSpeedLimit,
      mdTransAuthApp,
      mdStrategicRoute,
      mdStreetLight,
      mdDrainageAndFlood,
      mdUnusualLayout,
      mdLocalConsider,
      mdWinterMainRoute,
      mdHgvRoute,
      mdEmergencyRoute,
    };
  };

  /**
   * Sets the various form state from an API PUT result
   *
   * @param {boolean} oneScotland The gazetteer is Scottish.
   */
  const setTabDataFromApiResult = (result) => {
    switch (variant) {
      case "property":
        setMetaId(result.metaId);

        setPropertyGazetteerData({
          gazName: result.gazName,
          gazScope: result.gazScope,
          terOfUse: result.terOfUse,
          linkedData: result.linkedData,
          gazOwner: result.gazOwner,
          ngazFreq: result.ngazFreq,
        });

        setGazName(result.gazName);
        setGazScope(result.gazScope);
        setTerOfUse(result.terOfUse);
        setLinkedData(result.linkedData);
        setGazOwner(result.gazOwner);
        setNgazFreq(result.ngazFreq);

        setPropertyCustodianData({
          custodianName: result.custodianName,
          custodianUprn: result.custodianUprn,
          custodianCode: result.custodianCode,
        });

        setCustodianName(result.custodianName);
        setCustodianUprn(result.custodianUprn);
        setCustodianCode(result.custodianCode);

        setPropertyMiscellaneousData({
          classificationScheme: result.classificationScheme,
          stateCodeScheme: result.stateCodeScheme,
          metaDate: result.metaDate,
          gazDate: result.gazDate,
          language: result.language,
          characterSet: result.characterSet,
        });

        setClassificationScheme(result.classificationScheme);
        setStateCodeScheme(result.stateCodeScheme);
        setMetaDate(result.metaDate);
        setGazDate(result.gazDate);
        setLanguage(result.language);
        setCharacterSet(result.characterSet);
        break;

      case "street":
        setLsgMetaDataId(result.lsgMetaDataId);

        setStreetGazetteerData({
          terOfUse: result.terOfUse,
          linkedData: result.linkedData,
          ngazFreq: result.ngazFreq,
        });

        setTerOfUse(result.terOfUse);
        setLinkedData(result.linkedData);
        setNgazFreq(result.ngazFreq);

        setStreetCustodianData({
          custodianName: result.custodianName,
          custodianUprn: result.custodianUprn,
          custodianCode: result.custodianCode,
        });

        setCustodianName(result.custodianName);
        setCustodianUprn(result.custodianUprn);
        setCustodianCode(result.custodianCode);

        setStreetMiscellaneousData({
          classificationScheme: result.classificationScheme,
          metaDate: result.metaDate,
          gazDate: result.gazDate,
          language: result.language,
          characterSet: result.characterSet,
        });

        setClassificationScheme(result.classificationScheme);
        setMetaDate(result.metaDate);
        setGazDate(result.gazDate);
        setLanguage(result.language);
        setCharacterSet(result.characterSet);

        setStreetContentData({
          contentMotorwayTrunkRoad: result.contentMotorwayTrunkRoad,
          contentPrivateStreet: result.contentPrivateStreet,
          contentPrimaryRouteNetwork: result.contentPrn,
          contentClassifiedRoad: result.contentClassifiedRoad,
          contentProwFootpath: result.contentProwFootpath,
          contentProwBridleway: result.contentProwBridleway,
          contentProwRestrictedByway: result.contentProwRestrictedByway,
          contentProwBoat: result.contentProwBoat,
          contentNationalCycleRoute: result.contentNationalCycleRoute,
        });

        setContentMotorwayTrunkRoad(result.contentMotorwayTrunkRoad);
        setContentPrivateStreet(result.contentPrivateStreet);
        setContentPrn(result.contentPrn);
        setContentClassifiedRoad(result.contentClassifiedRoad);
        setContentProwFootpath(result.contentProwFootpath);
        setContentProwBridleway(result.contentProwBridleway);
        setContentProwRestrictedByway(result.contentProwRestrictedByway);
        setContentProwBoat(result.contentProwBoat);
        setContentNationalCycleRoute(result.contentNationalCycleRoute);
        break;
      case "asd":
        setAsdMetaDataId(result.asdMetaDataId);

        setAsdGazetteerData({
          terOfUse: result.terOfUse,
          linkedData: result.linkedData,
          ngazFreq: result.ngazFreq,
        });

        setTerOfUse(result.terOfUse);
        setLinkedData(result.linkedData);
        setNgazFreq(result.ngazFreq);

        setAsdCustodianData({
          custodianName: result.custodianName,
          custodianUprn: result.custodianUprn,
          custodianCode: result.custodianCode,
        });

        setCustodianName(result.custodianName);
        setCustodianUprn(result.custodianUprn);
        setCustodianCode(result.custodianCode);

        setAsdMiscellaneousData({
          classificationScheme: result.classificationScheme,
          metaDate: result.metaDate,
          gazDate: result.gazDate,
          language: result.language,
          characterSet: result.characterSet,
        });

        setClassificationScheme(result.classificationScheme);
        setMetaDate(result.metaDate);
        setGazDate(result.gazDate);
        setLanguage(result.language);
        setCharacterSet(result.characterSet);

        setAsdContentData({
          mdProtectedStreet: result.mdProtectedStreet,
          mdTrafficSensitive: result.mdTrafficSensitive,
          mdSed: result.mdSed,
          mdProposedSed: result.mdProposedSed,
          mdLevelCrossing: result.mdLevelCrossing,
          mdEnvSensitiveArea: result.mdEnvSensitiveArea,
          mdStructuresNotSed: result.mdStructuresNotSed,
          mdPipelinesAndCables: result.mdPipelinesAndCables,
          mdPriorityLanes: result.mdPriorityLanes,
          mdLaneRental: result.mdLaneRental,
          mdEarlyNotification: result.mdEarlyNotification,
          mdSpecialEvents: result.mdSpecialEvents,
          mdParking: result.mdParking,
          mdPedCrossAndSignals: result.mdPedCrossAndSignals,
          mdSpeedLimit: result.mdSpeedLimit,
          mdTransAuthApp: result.mdTransAuthApp,
          mdStrategicRoute: result.mdStrategicRoute,
          mdStreetLight: result.mdStreetLight,
          mdDrainageAndFlood: result.mdDrainageAndFlood,
          mdUnusualLayout: result.mdUnusualLayout,
          mdLocalConsider: result.mdLocalConsider,
          mdWinterMainRoute: result.mdWinterMainRoute,
          mdHgvRoute: result.mdHgvRoute,
          mdEmergencyRoute: result.mdEmergencyRoute,
        });

        setMdProtectedStreet(result.mdProtectedStreet);
        mdSetTrafficSensitive(result.mdTrafficSensitive);
        setMdSet(result.mdSed);
        setMdProposedSed(result.mdProposedSed);
        setMdLevelCrossing(result.mdLevelCrossing);
        setMdEnvSensitiveArea(result.mdEnvSensitiveArea);
        setMdStructuresNotSed(result.mdStructuresNotSed);
        setMdPipelinesAndCables(result.mdPipelinesAndCables);
        setMdPriorityLanes(result.mdPriorityLanes);
        setMdLaneRental(result.mdLaneRental);
        setMdEarlyNotification(result.mdEarlyNotification);
        setMdSpecialEvents(result.mdSpecialEvents);
        setMdParking(result.mdParking);
        setMdPedCrossAndSignal(result.mdPedCrossAndSignals);
        setMdSpeedLimit(result.mdSpeedLimit);
        setMdTransAuthApp(result.mdTransAuthApp);
        setMdStrategicRoute(result.mdStrategicRoute);
        setMdStreetLight(result.mdStreetLight);
        setMdDrainageAndFlood(result.mdDrainageAndFlood);
        setMdUnusualLayout(result.mdUnusualLayout);
        setMdLocalConsider(result.mdLocalConsider);
        setMdWinterMainRoute(result.mdWinterMainRoute);
        setMdHgvRoute(result.mdHgvRoute);
        setMdEmergencyRoute(result.mdEmergencyRoute);
        break;
      default:
    }
  };

  /**
   * Event to handle updating a set of metadata after it has been edited.
   * Will choose endpoint to match variant in state.
   *
   * @param {object} updatedData The updated data.
   */
  const updateMetadata = async (updatedData) => {
    let saveUrl, originalData, errorType;
    switch (variant) {
      case "property":
        errorType = settingsContext.isScottish ? "gazetteer" : "property";
        saveUrl = GetLLPGMetadataUrl("PUT", userContext.currentUser.token, settingsContext.isScottish);
        originalData = getOriginalPropertyApiData(settingsContext.isScottish);
        break;
      case "street":
        errorType = "street";
        saveUrl = GetLSGMetadataUrl("PUT", userContext.currentUser.token, settingsContext.isScottish);
        originalData = getOriginalStreetApiData();
        break;
      case "asd":
        errorType = "ASD";
        saveUrl = GetASDMetadataUrl("PUT", userContext.currentUser.token, settingsContext.isScottish);
        originalData = getOriginalAsdApiData();
        break;
      default:
    }

    if (saveUrl) {
      const saveData = { ...originalData, ...updatedData };
      //console.log("MetadataSettingsTab saveMetadata() will PUT", JSON.stringify(saveData));

      await fetch(saveUrl.url, {
        headers: saveUrl.headers,
        crossDomain: true,
        method: saveUrl.type,
        body: JSON.stringify(saveData),
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then((result) => setTabDataFromApiResult(result))
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                console.error(`[400 ERROR] Updating ${errorType} metadata.`, body.errors);
              });
              break;

            case 401:
              userContext.onExpired();
              break;

            case 500:
              console.error(`[500 ERROR] Updating ${errorType} metadata.`, res);
              break;

            default:
              console.error(`[${res.status} ERROR] in saveGazetteerMetadata - updating ${errorType} metadata.`, res);
              break;
          }
        });
    }
  };

  /**
   * Event to handle when the gazetteer metadata data has been edited.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleDoneEditGazetteerMetadata = (updatedData) => {
    if (updatedData) {
      switch (variant) {
        case "street":
          setStreetGazetteerData(updatedData);
          break;

        case "asd":
          setAsdGazetteerData(updatedData);
          break;

        case "property":
          setPropertyGazetteerData(updatedData);
          break;

        default:
          break;
      }

      if (variant === "property") setGazName(updatedData.gazName);
      if (variant === "property") setGazScope(updatedData.gazScope);
      setTerOfUse(updatedData.terOfUse);
      setLinkedData(updatedData.linkedData);
      if (variant === "property") setGazOwner(updatedData.gazOwner);
      setNgazFreq(updatedData.ngazFreq);
    }

    updateMetadata(updatedData);

    setShowEditGazetteerDialog(false);
  };

  /**
   * Event to handle when the edit gazetteer metadata dialog is closed.
   */
  const handleCloseEditGazetteerMetadata = () => {
    setShowEditGazetteerDialog(false);
  };

  /**
   * Event to handle when the custodian metadata data has been edited.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleDoneEditCustodianMetadata = (updatedData) => {
    if (updatedData) {
      switch (variant) {
        case "street":
          setStreetCustodianData(updatedData);
          break;

        case "asd":
          setAsdCustodianData(updatedData);
          break;

        case "property":
          setPropertyCustodianData(updatedData);
          break;

        default:
          break;
      }

      setCustodianName(updatedData.custodianName);
      setCustodianUprn(updatedData.custodianUprn);
      setCustodianCode(updatedData.custodianCode);
    }

    updateMetadata(updatedData);

    setShowEditCustodianDialog(false);
  };

  /**
   * Event to handle when the edit custodian metadata dialog is closed.
   */
  const handleCloseEditCustodianMetadata = () => {
    setShowEditCustodianDialog(false);
  };

  /**
   * Event to handle when the miscellaneous metadata data has been edited.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleDoneEditMiscellaneousMetadata = (updatedData) => {
    if (updatedData) {
      switch (variant) {
        case "street":
          setStreetMiscellaneousData(updatedData);
          break;

        case "asd":
          setAsdMiscellaneousData(updatedData);
          break;

        case "property":
          setPropertyMiscellaneousData(updatedData);
          break;

        default:
          break;
      }

      setClassificationScheme(updatedData.classificationScheme);
      setStateCodeScheme(updatedData.stateCodeScheme);
      setMetaDate(updatedData.metaDate);
      setGazDate(updatedData.gazDate);
      setLanguage(updatedData.language);
      setCharacterSet(updatedData.characterSet);
    }

    updateMetadata(updatedData);

    setShowEditMiscellaneousDialog(false);
  };

  /**
   * Event to handle when the edit miscellaneous metadata dialog is closed.
   */
  const handleCloseEditMiscellaneousMetadata = () => {
    setShowEditMiscellaneousDialog(false);
  };

  /**
   * Event to handle when the content metadata data has been edited.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleDoneEditContentMetadata = (updatedData) => {
    if (updatedData) {
      switch (variant) {
        case "street":
          setStreetContentData(updatedData);
          setContentMotorwayTrunkRoad(updatedData.contentMotorwayTrunkRoad);
          setContentPrivateStreet(updatedData.contentPrivateStreet);
          setContentPrn(updatedData.contentPrimaryRouteNetwork);
          setContentClassifiedRoad(updatedData.contentClassifiedRoad);
          setContentProwFootpath(updatedData.contentProwFootpath);
          setContentProwBridleway(updatedData.contentProwBridleway);
          setContentProwRestrictedByway(updatedData.contentProwRestrictedByway);
          setContentProwBoat(updatedData.contentProwBoat);
          setContentNationalCycleRoute(updatedData.contentNationalCycleRoute);
          break;

        case "asd":
          setAsdContentData(updatedData);
          setMdProtectedStreet(updatedData.mdProtectedStreet);
          mdSetTrafficSensitive(updatedData.mdTrafficSensitive);
          setMdSet(updatedData.mdSed);
          setMdProposedSed(updatedData.mdProposedSed);
          setMdLevelCrossing(updatedData.mdLevelCrossing);
          setMdEnvSensitiveArea(updatedData.mdEnvSensitiveArea);
          setMdStructuresNotSed(updatedData.mdStructuresNotSed);
          setMdPipelinesAndCables(updatedData.mdPipelinesAndCables);
          setMdPriorityLanes(updatedData.mdPriorityLanes);
          setMdLaneRental(updatedData.mdLaneRental);
          setMdEarlyNotification(updatedData.mdEarlyNotification);
          setMdSpecialEvents(updatedData.mdSpecialEvents);
          setMdParking(updatedData.mdParking);
          setMdPedCrossAndSignal(updatedData.mdPedCrossAndSignals);
          setMdSpeedLimit(updatedData.mdSpeedLimit);
          setMdTransAuthApp(updatedData.mdTransAuthApp);
          setMdStrategicRoute(updatedData.mdStrategicRoute);
          setMdStreetLight(updatedData.mdStreetLight);
          setMdDrainageAndFlood(updatedData.mdDrainageAndFlood);
          setMdUnusualLayout(updatedData.mdUnusualLayout);
          setMdLocalConsider(updatedData.mdLocalConsider);
          setMdWinterMainRoute(updatedData.mdWinterMainRoute);
          setMdHgvRoute(updatedData.mdHgvRoute);
          setMdEmergencyRoute(updatedData.mdEmergencyRoute);
          break;

        default:
          break;
      }

      updateMetadata(updatedData);
    }

    setShowEditContentDialog(false);
  };

  /**
   * Event to handle when the edit content metadata dialog is closed.
   */
  const handleCloseEditContentMetadata = () => {
    setShowEditContentDialog(false);
  };

  useEffect(() => {
    async function SetUpStreetData() {
      if (streetApiUrl) {
        setLoading(true);

        fetch(streetApiUrl.url, {
          headers: streetApiUrl.headers,
          crossDomain: true,
          method: streetApiUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              setLsgMetaDataId(result.lsgMetaDataId);

              setStreetGazetteerData({
                terOfUse: result.terOfUse,
                linkedData: result.linkedData,
                ngazFreq: result.ngazFreq,
              });

              setTerOfUse(result.terOfUse);
              setLinkedData(result.linkedData);
              setNgazFreq(result.ngazFreq);

              setStreetCustodianData({
                custodianName: result.custodianName,
                custodianUprn: result.custodianUprn,
                custodianCode: result.custodianCode,
              });

              setCustodianName(result.custodianName);
              setCustodianUprn(result.custodianUprn);
              setCustodianCode(result.custodianCode);

              setStreetMiscellaneousData({
                classificationScheme: result.classificationScheme,
                metaDate: result.metaDate,
                gazDate: result.gazDate,
                language: result.language,
                characterSet: result.characterSet,
              });

              setClassificationScheme(result.classificationScheme);
              setMetaDate(result.metaDate);
              setGazDate(result.gazDate);
              setLanguage(result.language);
              setCharacterSet(result.characterSet);

              setStreetContentData({
                contentMotorwayTrunkRoad: result.contentMotorwayTrunkRoad,
                contentPrivateStreet: result.contentPrivateStreet,
                contentPrimaryRouteNetwork: result.contentPrn,
                contentClassifiedRoad: result.contentClassifiedRoad,
                contentProwFootpath: result.contentProwFootpath,
                contentProwBridleway: result.contentProwBridleway,
                contentProwRestrictedByway: result.contentProwRestrictedByway,
                contentProwBoat: result.contentProwBoat,
                contentNationalCycleRoute: result.contentNationalCycleRoute,
              });

              setContentMotorwayTrunkRoad(result.contentMotorwayTrunkRoad);
              setContentPrivateStreet(result.contentPrivateStreet);
              setContentPrn(result.contentPrn);
              setContentClassifiedRoad(result.contentClassifiedRoad);
              setContentProwFootpath(result.contentProwFootpath);
              setContentProwBridleway(result.contentProwBridleway);
              setContentProwRestrictedByway(result.contentProwRestrictedByway);
              setContentProwBoat(result.contentProwBoat);
              setContentNationalCycleRoute(result.contentNationalCycleRoute);
            },
            (error) => {
              if (error.status && error.status === 401) {
                userContext.onExpired();
              } else {
                console.error("[ERROR] Getting street metadata", error);
              }
            }
          )
          .then(() => {
            setLoading(false);
          });
      }
    }

    async function SetUpAsdData() {
      if (asdApiUrl) {
        setLoading(true);

        fetch(asdApiUrl.url, {
          headers: asdApiUrl.headers,
          crossDomain: true,
          method: asdApiUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              setAsdMetaDataId(result.asdMetaDataId);

              setAsdGazetteerData({
                terOfUse: result.terOfUse,
                linkedData: result.linkedData,
                ngazFreq: result.ngazFreq,
              });

              setTerOfUse(result.terOfUse);
              setLinkedData(result.linkedData);
              setNgazFreq(result.ngazFreq);

              setAsdCustodianData({
                custodianName: result.custodianName,
                custodianUprn: result.custodianUprn,
                custodianCode: result.custodianCode,
              });

              setCustodianName(result.custodianName);
              setCustodianUprn(result.custodianUprn);
              setCustodianCode(result.custodianCode);

              setAsdMiscellaneousData({
                classificationScheme: result.classificationScheme,
                metaDate: result.metaDate,
                gazDate: result.gazDate,
                language: result.language,
                characterSet: result.characterSet,
              });

              setClassificationScheme(result.classificationScheme);
              setMetaDate(result.metaDate);
              setGazDate(result.gazDate);
              setLanguage(result.language);
              setCharacterSet(result.characterSet);

              setAsdContentData({
                mdProtectedStreet: result.mdProtectedStreet,
                mdTrafficSensitive: result.mdTrafficSensitive,
                mdSed: result.mdSed,
                mdProposedSed: result.mdProposedSed,
                mdLevelCrossing: result.mdLevelCrossing,
                mdEnvSensitiveArea: result.mdEnvSensitiveArea,
                mdStructuresNotSed: result.mdStructuresNotSed,
                mdPipelinesAndCables: result.mdPipelinesAndCables,
                mdPriorityLanes: result.mdPriorityLanes,
                mdLaneRental: result.mdLaneRental,
                mdEarlyNotification: result.mdEarlyNotification,
                mdSpecialEvents: result.mdSpecialEvents,
                mdParking: result.mdParking,
                mdPedCrossAndSignals: result.mdPedCrossAndSignals,
                mdSpeedLimit: result.mdSpeedLimit,
                mdTransAuthApp: result.mdTransAuthApp,
                mdStrategicRoute: result.mdStrategicRoute,
                mdStreetLight: result.mdStreetLight,
                mdDrainageAndFlood: result.mdDrainageAndFlood,
                mdUnusualLayout: result.mdUnusualLayout,
                mdLocalConsider: result.mdLocalConsider,
                mdWinterMainRoute: result.mdWinterMainRoute,
                mdHgvRoute: result.mdHgvRoute,
                mdEmergencyRoute: result.mdEmergencyRoute,
              });

              setMdProtectedStreet(result.mdProtectedStreet);
              mdSetTrafficSensitive(result.mdTrafficSensitive);
              setMdSet(result.mdSed);
              setMdProposedSed(result.mdProposedSed);
              setMdLevelCrossing(result.mdLevelCrossing);
              setMdEnvSensitiveArea(result.mdEnvSensitiveArea);
              setMdStructuresNotSed(result.mdStructuresNotSed);
              setMdPipelinesAndCables(result.mdPipelinesAndCables);
              setMdPriorityLanes(result.mdPriorityLanes);
              setMdLaneRental(result.mdLaneRental);
              setMdEarlyNotification(result.mdEarlyNotification);
              setMdSpecialEvents(result.mdSpecialEvents);
              setMdParking(result.mdParking);
              setMdPedCrossAndSignal(result.mdPedCrossAndSignals);
              setMdSpeedLimit(result.mdSpeedLimit);
              setMdTransAuthApp(result.mdTransAuthApp);
              setMdStrategicRoute(result.mdStrategicRoute);
              setMdStreetLight(result.mdStreetLight);
              setMdDrainageAndFlood(result.mdDrainageAndFlood);
              setMdUnusualLayout(result.mdUnusualLayout);
              setMdLocalConsider(result.mdLocalConsider);
              setMdWinterMainRoute(result.mdWinterMainRoute);
              setMdHgvRoute(result.mdHgvRoute);
              setMdEmergencyRoute(result.mdEmergencyRoute);
            },
            (error) => {
              if (error.status && error.status === 401) {
                userContext.onExpired();
              } else {
                console.error("[ERROR] Getting ASD metadata", error);
              }
            }
          )
          .then(() => {
            setLoading(false);
          });
      }
    }

    async function SetUpPropertyData() {
      if (propertyApiUrl) {
        setLoading(true);

        fetch(propertyApiUrl.url, {
          headers: propertyApiUrl.headers,
          crossDomain: true,
          method: propertyApiUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              setMetaId(result.metaId);

              setPropertyGazetteerData({
                gazName: result.gazName,
                gazScope: result.gazScope,
                terOfUse: result.terOfUse,
                linkedData: result.linkedData,
                gazOwner: result.gazOwner,
                ngazFreq: result.ngazFreq, // not used in Scotland
              });

              setGazName(result.gazName);
              setGazScope(result.gazScope);
              setTerOfUse(result.terOfUse);
              setLinkedData(result.linkedData);
              setGazOwner(result.gazOwner);
              setNgazFreq(result.ngazFreq); // not used in Scotland

              setPropertyCustodianData({
                custodianName: result.custodianName,
                custodianUprn: result.custodianUprn, // not used in Scotland
                custodianCode: result.custodianCode,
              });

              setCustodianName(result.custodianName);
              setCustodianUprn(result.custodianUprn); // not used in Scotland
              setCustodianCode(result.custodianCode);

              setPropertyMiscellaneousData({
                classificationScheme: result.classificationScheme,
                stateCodeScheme: result.stateCodeScheme, // only used in Scotland
                metaDate: result.metaDate,
                gazDate: result.gazDate,
                language: result.language,
                characterSet: result.characterSet,
              });

              setClassificationScheme(result.classificationScheme);
              setStateCodeScheme(result.stateCodeScheme);
              setMetaDate(result.metaDate);
              setGazDate(result.gazDate);
              setLanguage(result.language);
              setCharacterSet(result.characterSet);
            },
            (error) => {
              if (error.status && error.status === 401) {
                useContext.onExpired();
              } else {
                console.error("[ERROR] Getting property metadata", error);
              }
            }
          )
          .then(() => {
            setLoading(false);
          });
      }
    }

    switch (variant) {
      case "street":
        if (!streetApiUrl) {
          const streetUrl = GetLSGMetadataUrl("GET", userContext.currentUser.token);
          setStreetApiUrl(streetUrl);
        }
        SetUpStreetData();

        break;

      case "asd":
        if (!asdApiUrl) {
          const asdUrl = GetASDMetadataUrl("GET", userContext.currentUser.token);
          setAsdApiUrl(asdUrl);
        }

        SetUpAsdData();
        break;

      case "property":
        if (!propertyApiUrl) {
          const propertyUrl = GetLLPGMetadataUrl("GET", userContext.currentUser.token, settingsContext.isScottish);
          setPropertyApiUrl(propertyUrl);
        }

        SetUpPropertyData();
        break;

      default:
        break;
    }

    // setDataValid(false);
  }, [
    //settingsContext.streetMetadata,
    settingsContext.isScottish,
    streetApiUrl,
    asdApiUrl,
    propertyApiUrl,
    userContext,
    variant,
  ]);

  return (
    <Box sx={{ ml: theme.spacing(1), mr: theme.spacing(4) }}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mr: theme.spacing(0.5) }}>
          <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3) }}>{getTitle()}</Typography>
          <Button
            variant="contained"
            disabled={true} // TODO show when there was a 204 on fetch and the data on screen is valid
            sx={blueButtonStyle}
            startIcon={<DoneIcon />}
            onClick={doDoneMetadata}
          >
            <Typography variant="body2">{getButtonText()}</Typography>
          </Button>
        </Stack>
        <Grid container sx={{ pr: theme.spacing(3.5) }} spacing={3}>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterGazetteer}
              onMouseLeave={doMouseLeaveGazetteer}
              sx={settingsCardStyle(editGazetteer)}
            >
              <CardHeader
                action={
                  editGazetteer && (
                    <Tooltip title="Edit gazetteer details" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditGazetteer} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Gazetteer details"
                titleTypographyProps={{ sx: getTitleStyle(editGazetteer) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditGazetteer}>
                <CardContent
                  sx={settingsCardContentStyle(variant === "property" ? "property-metadata" : "street-asd-metadata")}
                >
                  <Grid container rowSpacing={1}>
                    {variant === "property" && (
                      <Grid item xs={3}>
                        <Typography variant="body2">Name</Typography>
                      </Grid>
                    )}
                    {variant === "property" && (
                      <Grid item xs={9}>
                        {loading ? (
                          <Skeleton variant="rectangular" height="20px" width="100%" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {gazName}
                          </Typography>
                        )}
                      </Grid>
                    )}
                    {variant === "property" && (
                      <Grid item xs={3}>
                        <Typography variant="body2">Scope</Typography>
                      </Grid>
                    )}
                    {variant === "property" && (
                      <Grid item xs={9}>
                        {loading ? (
                          <Skeleton variant="rectangular" height="20px" width="100%" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {gazScope}
                          </Typography>
                        )}
                      </Grid>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Territory</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {terOfUse}
                        </Typography>
                      )}
                    </Grid>
                    {!settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Linked data</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {linkedData}
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                    {variant === "property" && (
                      <Grid item xs={3}>
                        <Typography variant="body2">Owner</Typography>
                      </Grid>
                    )}
                    {variant === "property" && (
                      <Grid item xs={9}>
                        {loading ? (
                          <Skeleton variant="rectangular" height="20px" width="100%" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {gazOwner}
                          </Typography>
                        )}
                      </Grid>
                    )}
                    {!settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Frequency</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {getFrequency(ngazFreq)}
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterCustodian}
              onMouseLeave={doMouseLeaveCustodian}
              sx={settingsCardStyle(editCustodian)}
            >
              <CardHeader
                action={
                  editCustodian && (
                    <Tooltip title="Edit custodian details" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditCustodian} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Custodian details"
                titleTypographyProps={{ sx: getTitleStyle(editCustodian) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditCustodian}>
                <CardContent
                  sx={settingsCardContentStyle(variant === "property" ? "property-metadata" : "street-asd-metadata")}
                >
                  <Grid container rowSpacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="body2">Name</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {custodianName}
                        </Typography>
                      )}
                    </Grid>
                    {!settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">UPRN</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {custodianUprn}
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Code</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getAuthorityText(custodianCode)}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterMiscellaneous}
              onMouseLeave={doMouseLeaveMiscellaneous}
              sx={settingsCardStyle(editMiscellaneous)}
            >
              <CardHeader
                action={
                  editMiscellaneous && (
                    <Tooltip title="Edit miscellaneous details" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditMiscellaneous} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Miscellaneous details"
                titleTypographyProps={{ sx: getTitleStyle(editMiscellaneous) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditMiscellaneous}>
                <CardContent
                  sx={settingsCardContentStyle(variant === "property" ? "property-metadata" : "street-asd-metadata")}
                >
                  <Grid container rowSpacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="body2">Classification scheme</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {classificationScheme}
                        </Typography>
                      )}
                    </Grid>
                    {settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">State code scheme</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {stateCodeScheme}
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Metadata date</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getDisplayDate(metaDate)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Gazetteer date</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getDisplayDate(gazDate)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Language</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getDisplayLanguage(language)}
                        </Typography>
                      )}
                    </Grid>
                    {!settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Character set</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {characterSet}
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {variant !== "property" && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                elevation={0}
                onMouseEnter={doMouseEnterContent}
                onMouseLeave={doMouseLeaveContent}
                sx={settingsCardStyle(editContent)}
              >
                <CardHeader
                  action={
                    editContent && (
                      <Tooltip title="Edit content details" placement="bottom" sx={tooltipStyle}>
                        <IconButton onClick={doEditContent} sx={{ pr: "16px", pb: "16px" }}>
                          <EditIcon sx={ActionIconStyle(true)} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  title="Content details"
                  titleTypographyProps={{ sx: getTitleStyle(editContent) }}
                  sx={{ height: "66px" }}
                />
                <CardActionArea onClick={doEditContent}>
                  <CardContent
                    sx={settingsCardContentStyle(variant === "property" ? "property-metadata" : "street-asd-metadata")}
                  >
                    <Grid container rowSpacing={1} sx={{ height: "260px", overflowY: "auto" }}>
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Motorway trunk roads</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentMotorwayTrunkRoad ? contentMotorwayTrunkRoad : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Private streets</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentPrivateStreet ? contentPrivateStreet : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Primary route network</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentPrn ? contentPrn : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Classified roads</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentClassifiedRoad ? contentClassifiedRoad : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">PRoW footpaths</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentProwFootpath ? contentProwFootpath : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">PRoW bridleways</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentProwBridleway ? contentProwBridleway : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">PRoW restricted byways</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentProwRestrictedByway ? contentProwRestrictedByway : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">PRoW BOAT</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentProwBoat ? contentProwBoat : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">National cycle routes</Typography>
                        </Grid>
                      )}
                      {variant === "street" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${contentNationalCycleRoute ? contentNationalCycleRoute : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Protected streets</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdProtectedStreet ? mdProtectedStreet : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Traffic sensitive streets</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdTrafficSensitive ? mdTrafficSensitive : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Special engineering difficulties</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdSed ? mdSed : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Proposed SEDs</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdProposedSed ? mdProposedSed : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Level crossing safety zone</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdLevelCrossing ? mdLevelCrossing : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Environmentally sensitive areas</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdEnvSensitiveArea ? mdEnvSensitiveArea : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Structures not SEDs</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdStructuresNotSed ? mdStructuresNotSed : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Pipelines and specialist cables</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdPipelinesAndCables ? mdPipelinesAndCables : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Priority lanes</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdPriorityLanes ? mdPriorityLanes : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Lane rental</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdLaneRental ? mdLaneRental : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Early notification streets</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdEarlyNotification ? mdEarlyNotification : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Special events</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdSpecialEvents ? mdSpecialEvents : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Parking bays and restrictions</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdParking ? mdParking : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Pedestrian crossings and signals</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdPedCrossAndSignals ? mdPedCrossAndSignals : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Speed limits</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdSpeedLimit ? mdSpeedLimit : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Transport authority critical apparatus</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdTransAuthApp ? mdTransAuthApp : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Strategic route</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdStrategicRoute ? mdStrategicRoute : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Street lighting</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdStreetLight ? mdStreetLight : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Drainage and flood risk areas</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdDrainageAndFlood ? mdDrainageAndFlood : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Unusual traffic layouts</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdUnusualLayout ? mdUnusualLayout : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Local considerations</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdLocalConsider ? mdLocalConsider : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Winter maintenance routes</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdWinterMainRoute ? mdWinterMainRoute : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">HGV approved routes</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdHgvRoute ? mdHgvRoute : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          <Typography variant="body2">Emergency services routes</Typography>
                        </Grid>
                      )}
                      {variant === "asd" && (
                        <Grid item xs={6}>
                          {loading ? (
                            <Skeleton variant="rectangular" height="20px" width="100%" />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${mdEmergencyRoute ? mdEmergencyRoute : 0}%`}
                            </Typography>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
        </Grid>
      </Stack>
      <EditMetadataGazetteerDialog
        isOpen={showEditGazetteerDialog}
        data={editData}
        variant={variant}
        onDone={(updatedData) => handleDoneEditGazetteerMetadata(updatedData)}
        onClose={handleCloseEditGazetteerMetadata}
      />
      <EditMetadataCustodianDialog
        isOpen={showEditCustodianDialog}
        data={editData}
        variant={variant}
        onDone={(updatedData) => handleDoneEditCustodianMetadata(updatedData)}
        onClose={handleCloseEditCustodianMetadata}
      />
      <EditMetadataMiscellaneousDialog
        isOpen={showEditMiscellaneousDialog}
        data={editData}
        variant={variant}
        onDone={(updatedData) => handleDoneEditMiscellaneousMetadata(updatedData)}
        onClose={handleCloseEditMiscellaneousMetadata}
      />
      {(variant === "street" || variant === "asd") && (
        <EditMetadataContentDialog
          isOpen={showEditContentDialog}
          data={editData}
          variant={variant}
          onDone={(updatedData) => handleDoneEditContentMetadata(updatedData)}
          onClose={handleCloseEditContentMetadata}
        />
      )}
    </Box>
  );
}

export default MetadataSettingsTab;
