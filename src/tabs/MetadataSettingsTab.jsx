/* #region header */
/**************************************************************************************************
//
//  Description: ESU Data tab
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

import { adsBlueA } from "../utils/ADSColours";
import {
  blueButtonStyle,
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function MetadataSettingsTab({ variant }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [streetApiUrl, setStreetApiUrl] = useState(null);
  const [asdApiUrl, setAsdApiUrl] = useState(null);
  const [propertyApiUrl, setPropertyApiUrl] = useState(null);

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
  const [dataValid, setDataValid] = useState(false);

  const [name, setName] = useState(null);
  const [scope, setScope] = useState(null);
  const [territory, setTerritory] = useState(null);
  const [metadataData, setMetadataData] = useState(null);
  const [owner, setOwner] = useState(null);
  const [frequency, setFrequency] = useState(null);

  const [custodianName, setCustodianName] = useState(null);
  const [custodianUprn, setCustodianUprn] = useState(null);
  const [custodianCode, setCustodianCode] = useState(null);

  const [classificationScheme, setClassificationScheme] = useState(null);
  const [metadataDate, setMetadataDate] = useState(null);
  const [language, setLanguage] = useState(null);

  const [motorwayTrunkRoads, setMotorwayTrunkRoads] = useState(null);
  const [privateStreets, setPrivateStreets] = useState(null);
  const [primaryRouteNetwork, setPrimaryRouteNetwork] = useState(null);
  const [classifiedRoads, setClassifiedRoads] = useState(null);
  const [prowFootpaths, setProwFootpaths] = useState(null);
  const [prowBridleways, setProwBridleways] = useState(null);
  const [prowRestrictedByways, setProwRestrictedByways] = useState(null);
  const [prowBoat, setProwBoat] = useState(null);
  const [nationalCycleRoutes, setNationalCycleRoutes] = useState(null);

  const [protectedStreets, setProtectedStreets] = useState(null);
  const [trafficSensitiveStreets, setTrafficSensitiveStreets] = useState(null);
  const [specialEngineeringDifficulties, setSpecialEngineeringDifficulties] = useState(null);
  const [proposedSEDs, setProposedSEDs] = useState(null);
  const [levelCrossing, setLevelCrossing] = useState(null);
  const [environmentallySensitiveAreas, setEnvironmentallySensitiveAreas] = useState(null);
  const [structuresNotSEDs, setStructuresNotSEDs] = useState(null);
  const [pipelinesAndSpecialistCables, setPipelinesAndSpecialistCables] = useState(null);
  const [priorityLanes, setPriorityLanes] = useState(null);
  const [laneRental, setLaneRental] = useState(null);
  const [earlyNotificationStreets, setEarlyNotificationStreets] = useState(null);
  const [specialEvents, setSpecialEvents] = useState(null);
  const [parking, setParking] = useState(null);
  const [pedestrianCrossings, setPedestrianCrossings] = useState(null);
  const [speedLimits, setSpeedLimits] = useState(null);
  const [transportAuthorityCriticalApparatus, setTransportAuthorityCriticalApparatus] = useState(null);
  const [strategicRoute, setStrategicRoute] = useState(null);
  const [streetLighting, setStreetLighting] = useState(null);
  const [drainageAndFlood, setDrainageAndFlood] = useState(null);
  const [unusualTrafficLayouts, setUnusualTrafficLayouts] = useState(null);
  const [localConsiderations, setLocalConsiderations] = useState(null);
  const [winterMaintenanceRoutes, setWinterMaintenanceRoutes] = useState(null);
  const [hgvApprovedRoutes, setHgvApprovedRoutes] = useState(null);
  const [emergencyServicesRoutes, setEmergencyServicesRoutes] = useState(null);

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

    setDataValid(false);
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
   * Method to get the full text for the given frequency.
   *
   * @param {string} value The type of frequency.
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
  const getMetadataDate = (value) => {
    return DateString(value);
  };

  /**
   * Method to check that the data is valid.
   *
   * @param {string} type The type of data that has been updated.
   * @param {object} updatedData The data that has been updated.
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const checkDataIsValid = (type, updatedData) => {
    let dataValid = true;

    switch (variant) {
      case "street":
        const streetData = {
          territory: type === "gazetteer" && updatedData ? updatedData.territory : streetGazetteerData.territory,
          metadataData:
            type === "gazetteer" && updatedData ? updatedData.metadataData : streetGazetteerData.metadataData,
          frequency: type === "gazetteer" && updatedData ? updatedData.frequency : streetGazetteerData.frequency,
          custodianName:
            type === "custodian" && updatedData ? updatedData.custodianName : streetCustodianData.custodianName,
          custodianUprn:
            type === "custodian" && updatedData ? updatedData.custodianUprn : streetCustodianData.custodianUprn,
          custodianCode:
            type === "custodian" && updatedData ? updatedData.custodianCode : streetCustodianData.custodianCode,
          classificationScheme:
            type === "miscellaneous" && updatedData
              ? updatedData.classificationScheme
              : streetMiscellaneousData.classificationScheme,
          metadataDate:
            type === "miscellaneous" && updatedData ? updatedData.metadataDate : streetMiscellaneousData.metadataDate,
          language: type === "miscellaneous" && updatedData ? updatedData.language : streetMiscellaneousData.language,
          motorwayTrunkRoads:
            type === "content" && updatedData ? updatedData.motorwayTrunkRoads : streetContentData.motorwayTrunkRoads,
          privateStreets:
            type === "content" && updatedData ? updatedData.privateStreets : streetContentData.privateStreets,
          primaryRouteNetwork:
            type === "content" && updatedData ? updatedData.primaryRouteNetwork : streetContentData.primaryRouteNetwork,
          classifiedRoads:
            type === "content" && updatedData ? updatedData.classifiedRoads : streetContentData.classifiedRoads,
          prowFootpaths:
            type === "content" && updatedData ? updatedData.prowFootpaths : streetContentData.prowFootpaths,
          prowBridleways:
            type === "content" && updatedData ? updatedData.prowBridleways : streetContentData.prowBridleways,
          prowRestrictedByways:
            type === "content" && updatedData
              ? updatedData.prowRestrictedByways
              : streetContentData.prowRestrictedByways,
          prowBoat: type === "content" && updatedData ? updatedData.prowBoat : streetContentData.prowBoat,
          nationalCycleRoutes:
            type === "content" && updatedData ? updatedData.nationalCycleRoutes : streetContentData.nationalCycleRoutes,
        };

        dataValid =
          !!streetData.territory &&
          !!streetData.frequency &&
          !!streetData.custodianName &&
          !!streetData.custodianUprn &&
          !!streetData.custodianCode &&
          !!streetData.classificationScheme &&
          !!streetData.metadataDate &&
          !!streetData.language &&
          !!streetData.motorwayTrunkRoads &&
          !!streetData.privateStreets &&
          !!streetData.primaryRouteNetwork &&
          !!streetData.classifiedRoads &&
          !!streetData.prowFootpaths &&
          !!streetData.prowBridleways &&
          !!streetData.prowRestrictedByways &&
          !!streetData.prowBoat &&
          !!streetData.nationalCycleRoutes;
        break;

      case "asd":
        const asdData = {
          territory: type === "gazetteer" && updatedData ? updatedData.territory : asdGazetteerData.territory,
          metadataData: type === "gazetteer" && updatedData ? updatedData.metadataData : asdGazetteerData.metadataData,
          frequency: type === "gazetteer" && updatedData ? updatedData.frequency : asdGazetteerData.frequency,
          custodianName:
            type === "custodian" && updatedData ? updatedData.custodianName : asdCustodianData.custodianName,
          custodianUprn:
            type === "custodian" && updatedData ? updatedData.custodianUprn : asdCustodianData.custodianUprn,
          custodianCode:
            type === "custodian" && updatedData ? updatedData.custodianCode : asdCustodianData.custodianCode,
          classificationScheme:
            type === "miscellaneous" && updatedData
              ? updatedData.classificationScheme
              : asdMiscellaneousData.classificationScheme,
          metadataDate:
            type === "miscellaneous" && updatedData ? updatedData.metadataDate : asdMiscellaneousData.metadataDate,
          language: type === "miscellaneous" && updatedData ? updatedData.language : asdMiscellaneousData.language,
          protectedStreets:
            type === "content" && updatedData ? updatedData.protectedStreets : asdContentData.protectedStreets,
          trafficSensitiveStreets:
            type === "content" && updatedData
              ? updatedData.trafficSensitiveStreets
              : asdContentData.trafficSensitiveStreets,
          specialEngineeringDifficulties:
            type === "content" && updatedData
              ? updatedData.specialEngineeringDifficulties
              : asdContentData.specialEngineeringDifficulties,
          proposedSEDs: type === "content" && updatedData ? updatedData.proposedSEDs : asdContentData.proposedSEDs,
          levelCrossing: type === "content" && updatedData ? updatedData.levelCrossing : asdContentData.levelCrossing,
          environmentallySensitiveAreas:
            type === "content" && updatedData
              ? updatedData.environmentallySensitiveAreas
              : asdContentData.environmentallySensitiveAreas,
          structuresNotSEDs:
            type === "content" && updatedData ? updatedData.structuresNotSEDs : asdContentData.structuresNotSEDs,
          pipelinesAndSpecialistCables:
            type === "content" && updatedData
              ? updatedData.pipelinesAndSpecialistCables
              : asdContentData.pipelinesAndSpecialistCables,
          priorityLanes: type === "content" && updatedData ? updatedData.priorityLanes : asdContentData.priorityLanes,
          laneRental: type === "content" && updatedData ? updatedData.laneRental : asdContentData.laneRental,
          earlyNotificationStreets:
            type === "content" && updatedData
              ? updatedData.earlyNotificationStreets
              : asdContentData.earlyNotificationStreets,
          specialEvents: type === "content" && updatedData ? updatedData.specialEvents : asdContentData.specialEvents,
          parking: type === "content" && updatedData ? updatedData.parking : asdContentData.parking,
          pedestrianCrossings:
            type === "content" && updatedData ? updatedData.pedestrianCrossings : asdContentData.pedestrianCrossings,
          speedLimits: type === "content" && updatedData ? updatedData.speedLimits : asdContentData.speedLimits,
          transportAuthorityCriticalApparatus:
            type === "content" && updatedData
              ? updatedData.transportAuthorityCriticalApparatus
              : asdContentData.transportAuthorityCriticalApparatus,
          strategicRoute:
            type === "content" && updatedData ? updatedData.strategicRoute : asdContentData.strategicRoute,
          streetLighting:
            type === "content" && updatedData ? updatedData.streetLighting : asdContentData.streetLighting,
          drainageAndFlood:
            type === "content" && updatedData ? updatedData.drainageAndFlood : asdContentData.drainageAndFlood,
          unusualTrafficLayouts:
            type === "content" && updatedData
              ? updatedData.unusualTrafficLayouts
              : asdContentData.unusualTrafficLayouts,
          localConsiderations:
            type === "content" && updatedData ? updatedData.localConsiderations : asdContentData.localConsiderations,
          winterMaintenanceRoutes:
            type === "content" && updatedData
              ? updatedData.winterMaintenanceRoutes
              : asdContentData.winterMaintenanceRoutes,
          hgvApprovedRoutes:
            type === "content" && updatedData ? updatedData.hgvApprovedRoutes : asdContentData.hgvApprovedRoutes,
          emergencyServicesRoutes:
            type === "content" && updatedData
              ? updatedData.emergencyServicesRoutes
              : asdContentData.emergencyServicesRoutes,
        };

        dataValid =
          !!asdData.territory &&
          !!asdData.frequency &&
          !!asdData.custodianName &&
          !!asdData.custodianUprn &&
          !!asdData.custodianCode &&
          !!asdData.classificationScheme &&
          !!asdData.metadataDate &&
          !!asdData.language &&
          !!asdData.protectedStreets &&
          !!asdData.trafficSensitiveStreets &&
          !!asdData.specialEngineeringDifficulties &&
          !!asdData.proposedSEDs &&
          !!asdData.environmentallySensitiveAreas &&
          !!asdData.structuresNotSEDs &&
          !!asdData.priorityLanes &&
          !!asdData.laneRental &&
          !!asdData.specialEvents &&
          !!asdData.parking &&
          !!asdData.pedestrianCrossings &&
          !!asdData.speedLimits &&
          !!asdData.strategicRoute &&
          !!asdData.winterMaintenanceRoutes &&
          !!asdData.hgvApprovedRoutes &&
          !!asdData.emergencyServicesRoutes;
        break;

      case "property":
        const propertyData = {
          name: type === "gazetteer" && updatedData ? updatedData.name : propertyGazetteerData.name,
          scope: type === "gazetteer" && updatedData ? updatedData.scope : propertyGazetteerData.scope,
          territory: type === "gazetteer" && updatedData ? updatedData.territory : propertyGazetteerData.territory,
          metadataData:
            type === "gazetteer" && updatedData ? updatedData.metadataData : propertyGazetteerData.metadataData,
          owner: type === "gazetteer" && updatedData ? updatedData.owner : propertyGazetteerData.owner,
          frequency: type === "gazetteer" && updatedData ? updatedData.frequency : propertyGazetteerData.frequency,
          custodianName:
            type === "custodian" && updatedData ? updatedData.custodianName : propertyCustodianData.custodianName,
          custodianUprn:
            type === "custodian" && updatedData ? updatedData.custodianUprn : propertyCustodianData.custodianUprn,
          custodianCode:
            type === "custodian" && updatedData ? updatedData.custodianCode : propertyCustodianData.custodianCode,
          classificationScheme:
            type === "miscellaneous" && updatedData
              ? updatedData.classificationScheme
              : propertyMiscellaneousData.classificationScheme,
          metadataDate:
            type === "miscellaneous" && updatedData ? updatedData.metadataDate : propertyMiscellaneousData.metadataDate,
          language: type === "miscellaneous" && updatedData ? updatedData.language : propertyMiscellaneousData.language,
        };

        dataValid =
          !!propertyData.name &&
          !!propertyData.scope &&
          !!propertyData.territory &&
          !!propertyData.owner &&
          !!propertyData.frequency &&
          !!propertyData.custodianName &&
          !!propertyData.custodianUprn &&
          !!propertyData.custodianCode &&
          !!propertyData.classificationScheme &&
          !!propertyData.metadataDate &&
          !!propertyData.language;
        break;

      default:
        break;
    }

    return dataValid;
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

      if (variant === "property") setName(updatedData.name);
      if (variant === "property") setScope(updatedData.scope);
      setTerritory(updatedData.territory);
      setMetadataData(updatedData.metadataData);
      if (variant === "property") setOwner(updatedData.owner);
      setFrequency(updatedData.frequency);

      setDataValid(checkDataIsValid("gazetteer", updatedData));
    }

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

      setDataValid(checkDataIsValid("custodian", updatedData));
    }

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
      setMetadataDate(updatedData.metadataDate);
      setLanguage(updatedData.language);

      setDataValid(checkDataIsValid("miscellaneous", updatedData));
    }

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
          setMotorwayTrunkRoads(updatedData.motorwayTrunkRoads);
          setPrivateStreets(updatedData.privateStreets);
          setPrimaryRouteNetwork(updatedData.primaryRouteNetwork);
          setClassifiedRoads(updatedData.classifiedRoads);
          setProwFootpaths(updatedData.prowFootpaths);
          setProwBridleways(updatedData.prowBridleways);
          setProwRestrictedByways(updatedData.prowRestrictedByways);
          setProwBoat(updatedData.prowBoat);
          setNationalCycleRoutes(updatedData.nationalCycleRoutes);
          break;

        case "asd":
          setAsdContentData(updatedData);
          setProtectedStreets(updatedData.protectedStreets);
          setTrafficSensitiveStreets(updatedData.trafficSensitiveStreets);
          setSpecialEngineeringDifficulties(updatedData.specialEngineeringDifficulties);
          setProposedSEDs(updatedData.proposedSEDs);
          setLevelCrossing(updatedData.levelCrossing);
          setEnvironmentallySensitiveAreas(updatedData.environmentallySensitiveAreas);
          setStructuresNotSEDs(updatedData.structuresNotSEDs);
          setPipelinesAndSpecialistCables(updatedData.pipelinesAndSpecialistCables);
          setPriorityLanes(updatedData.priorityLanes);
          setLaneRental(updatedData.laneRental);
          setEarlyNotificationStreets(updatedData.earlyNotificationStreets);
          setSpecialEvents(updatedData.specialEvents);
          setParking(updatedData.parking);
          setPedestrianCrossings(updatedData.pedestrianCrossings);
          setSpeedLimits(updatedData.speedLimits);
          setTransportAuthorityCriticalApparatus(updatedData.transportAuthorityCriticalApparatus);
          setStrategicRoute(updatedData.strategicRoute);
          setStreetLighting(updatedData.streetLighting);
          setDrainageAndFlood(updatedData.drainageAndFlood);
          setUnusualTrafficLayouts(updatedData.unusualTrafficLayouts);
          setLocalConsiderations(updatedData.localConsiderations);
          setWinterMaintenanceRoutes(updatedData.winterMaintenanceRoutes);
          setHgvApprovedRoutes(updatedData.hgvApprovedRoutes);
          setEmergencyServicesRoutes(updatedData.emergencyServicesRoutes);
          break;

        default:
          break;
      }

      setDataValid(checkDataIsValid("content", updatedData));
    }

    setShowEditContentDialog(false);
  };

  /**
   * Event to handle when the edit content metadata dialog is closed.
   */
  const handleCloseEditContentMetadata = () => {
    setShowEditContentDialog(false);
  };

  /**
   * Method to get the styling to use for the title.
   *
   * @param {boolean} highlighted True if the title is highlighted; otherwise false.
   * @returns {object|null} The styling to use for the title.
   */
  const getTitleStyle = (highlighted) => {
    if (highlighted) return { color: adsBlueA };
    else return null;
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
              setStreetGazetteerData({
                territory: result.terOfUse,
                metadataData: result.linkedData,
                frequency: result.ngazFreq,
              });

              setTerritory(result.terOfUse);
              setMetadataData(result.linkedData);
              setFrequency(result.ngazFreq);

              setStreetCustodianData({
                custodianName: result.custodianName,
                custodianUprn: result.custodianUprn,
                custodianCode: result.authCode,
              });

              setCustodianName(result.custodianName);
              setCustodianUprn(result.custodianUprn);
              setCustodianCode(result.authCode);

              setStreetMiscellaneousData({
                classificationScheme: result.classificationScheme,
                metadataDate: result.metaDate,
                language: result.language,
              });

              setClassificationScheme(result.classificationScheme);
              setMetadataDate(result.metaDate);
              setLanguage(result.language);

              setStreetContentData({
                motorwayTrunkRoads: result.contentMotorwayTrunkRoad,
                privateStreets: result.contentPrivateStreet,
                primaryRouteNetwork: result.contentPrn,
                classifiedRoads: result.contentClassifiedRoad,
                prowFootpaths: result.contentProwFootpath,
                prowBridleways: result.contentProwBridleway,
                prowRestrictedByways: result.contentProwRestrictedByway,
                prowBoat: result.contentProwBoat,
                nationalCycleRoutes: result.contentNationalCycleRoute,
              });

              setMotorwayTrunkRoads(result.contentMotorwayTrunkRoad);
              setPrivateStreets(result.contentPrivateStreet);
              setPrimaryRouteNetwork(result.contentPrn);
              setClassifiedRoads(result.contentClassifiedRoad);
              setProwFootpaths(result.contentProwFootpath);
              setProwBridleways(result.contentProwBridleway);
              setProwRestrictedByways(result.contentProwRestrictedByway);
              setProwBoat(result.contentProwBoat);
              setNationalCycleRoutes(result.contentNationalCycleRoute);
            },
            (error) => {
              console.error("[ERROR] Getting street metadata", error);
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
              setAsdGazetteerData({
                territory: result.terOfUse,
                metadataData: result.linkedData,
                frequency: result.ngazFreq,
              });

              setTerritory(result.terOfUse);
              setMetadataData(result.linkedData);
              setFrequency(result.ngazFreq);

              setAsdCustodianData({
                custodianName: result.custodianName,
                custodianUprn: result.custodianUprn,
                custodianCode: result.authCode,
              });

              setCustodianName(result.custodianName);
              setCustodianUprn(result.custodianUprn);
              setCustodianCode(result.authCode);

              setAsdMiscellaneousData({
                classificationScheme: result.classificationScheme,
                metadataDate: result.metaDate,
                language: result.language,
              });

              setClassificationScheme(result.classificationScheme);
              setMetadataDate(result.metaDate);
              setLanguage(result.language);

              setAsdContentData({
                protectedStreets: result.mdProtectedStreet,
                trafficSensitiveStreets: result.mdTrafficSensitive,
                specialEngineeringDifficulties: result.mdSed,
                proposedSEDs: result.mdProposedSed,
                levelCrossing: result.mdLevelCrossing,
                environmentallySensitiveAreas: result.mdEnvSensitiveArea,
                structuresNotSEDs: result.mdStructuresNotSed,
                pipelinesAndSpecialistCables: result.mdPipelinesAndCables,
                priorityLanes: result.mdPriorityLanes,
                laneRental: result.mdLaneRental,
                earlyNotificationStreets: result.mdEarlyNotification,
                specialEvents: result.mdSpecialEvents,
                parking: result.mdParking,
                pedestrianCrossings: result.mdPedCrossAndSignals,
                speedLimits: result.mdSpeedLimit,
                transportAuthorityCriticalApparatus: result.mdTransAuthApp,
                strategicRoute: result.mdStrategicRoute,
                streetLighting: result.mdStreetLight,
                drainageAndFlood: result.mdDrainageAndFlood,
                unusualTrafficLayouts: result.mdUnusualLayout,
                localConsiderations: result.mdLocalConsider,
                winterMaintenanceRoutes: result.mdWinterMainRoute,
                hgvApprovedRoutes: result.mdHgvRoute,
                emergencyServicesRoutes: result.mdEmergencyRoute,
              });

              setProtectedStreets(result.mdProtectedStreet);
              setTrafficSensitiveStreets(result.mdTrafficSensitive);
              setSpecialEngineeringDifficulties(result.mdSed);
              setProposedSEDs(result.mdProposedSed);
              setLevelCrossing(result.mdLevelCrossing);
              setEnvironmentallySensitiveAreas(result.mdEnvSensitiveArea);
              setStructuresNotSEDs(result.mdStructuresNotSed);
              setPipelinesAndSpecialistCables(result.mdPipelinesAndCables);
              setPriorityLanes(result.mdPriorityLanes);
              setLaneRental(result.mdLaneRental);
              setEarlyNotificationStreets(result.mdEarlyNotification);
              setSpecialEvents(result.mdSpecialEvents);
              setParking(result.mdParking);
              setPedestrianCrossings(result.mdPedCrossAndSignals);
              setSpeedLimits(result.mdSpeedLimit);
              setTransportAuthorityCriticalApparatus(result.mdTransAuthApp);
              setStrategicRoute(result.mdStrategicRoute);
              setStreetLighting(result.mdStreetLight);
              setDrainageAndFlood(result.mdDrainageAndFlood);
              setUnusualTrafficLayouts(result.mdUnusualLayout);
              setLocalConsiderations(result.mdLocalConsider);
              setWinterMaintenanceRoutes(result.mdWinterMainRoute);
              setHgvApprovedRoutes(result.mdHgvRoute);
              setEmergencyServicesRoutes(result.mdEmergencyRoute);
            },
            (error) => {
              console.error("[ERROR] Getting ASD metadata", error);
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
              setPropertyGazetteerData({
                name: result.gazName,
                scope: result.gazScope,
                territory: result.terOfUse,
                data: result.linkedData,
                owner: result.gazOwner,
                frequency: result.ngazFreq,
              });

              setName(result.gazName);
              setScope(result.gazScope);
              setTerritory(result.terOfUse);
              setMetadataData(result.linkedData);
              setOwner(result.gazOwner);
              setFrequency(result.ngazFreq);

              setPropertyCustodianData({
                custodianName: result.custodianName,
                custodianUprn: result.uprn,
                custodianCode: result.custodianCode,
              });

              setCustodianName(result.custodianName);
              setCustodianUprn(result.uprn);
              setCustodianCode(result.custodianCode);

              setPropertyMiscellaneousData({
                classificationScheme: result.classificationScheme,
                metadataDate: result.metaDate,
                language: result.language,
              });

              setClassificationScheme(result.classificationScheme);
              setMetadataDate(result.metaDate);
              setLanguage(result.language);
            },
            (error) => {
              console.error("[ERROR] Getting property metadata", error);
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

    setDataValid(false);
  }, [
    settingsContext.streetMetadata,
    settingsContext.isScottish,
    streetApiUrl,
    asdApiUrl,
    propertyApiUrl,
    userContext.currentUser.token,
    variant,
  ]);

  return (
    <Box sx={{ ml: theme.spacing(1), mr: theme.spacing(4) }}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mr: theme.spacing(0.5) }}>
          <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3) }}>{getTitle()}</Typography>
          <Button
            variant="contained"
            disabled={!dataValid}
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
                titleTypographyProps={{ variant: "h6", sx: getTitleStyle(editGazetteer) }}
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
                            {name}
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
                            {scope}
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
                          {territory}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Data</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {metadataData}
                        </Typography>
                      )}
                    </Grid>
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
                            {owner}
                          </Typography>
                        )}
                      </Grid>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Frequency</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getFrequency(frequency)}
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
                titleTypographyProps={{ variant: "h6", sx: getTitleStyle(editCustodian) }}
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
                titleTypographyProps={{ variant: "h6", sx: getTitleStyle(editMiscellaneous) }}
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
                    <Grid item xs={3}>
                      <Typography variant="body2">Metadata date</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {loading ? (
                        <Skeleton variant="rectangular" height="20px" width="100%" />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getMetadataDate(metadataDate)}
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
                  titleTypographyProps={{ variant: "h6", sx: getTitleStyle(editContent) }}
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
                              {`${motorwayTrunkRoads ? motorwayTrunkRoads : 0}%`}
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
                              {`${privateStreets ? privateStreets : 0}%`}
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
                              {`${primaryRouteNetwork ? primaryRouteNetwork : 0}%`}
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
                              {`${classifiedRoads ? classifiedRoads : 0}%`}
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
                              {`${prowFootpaths ? prowFootpaths : 0}%`}
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
                              {`${prowBridleways ? prowBridleways : 0}%`}
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
                              {`${prowRestrictedByways ? prowRestrictedByways : 0}%`}
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
                              {`${prowBoat ? prowBoat : 0}%`}
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
                              {`${nationalCycleRoutes ? nationalCycleRoutes : 0}%`}
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
                              {`${protectedStreets ? protectedStreets : 0}%`}
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
                              {`${trafficSensitiveStreets ? trafficSensitiveStreets : 0}%`}
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
                              {`${specialEngineeringDifficulties ? specialEngineeringDifficulties : 0}%`}
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
                              {`${proposedSEDs ? proposedSEDs : 0}%`}
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
                              {`${levelCrossing ? levelCrossing : 0}%`}
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
                              {`${environmentallySensitiveAreas ? environmentallySensitiveAreas : 0}%`}
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
                              {`${structuresNotSEDs ? structuresNotSEDs : 0}%`}
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
                              {`${pipelinesAndSpecialistCables ? pipelinesAndSpecialistCables : 0}%`}
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
                              {`${priorityLanes ? priorityLanes : 0}%`}
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
                              {`${laneRental ? laneRental : 0}%`}
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
                              {`${earlyNotificationStreets ? earlyNotificationStreets : 0}%`}
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
                              {`${specialEvents ? specialEvents : 0}%`}
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
                              {`${parking ? parking : 0}%`}
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
                              {`${pedestrianCrossings ? pedestrianCrossings : 0}%`}
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
                              {`${speedLimits ? speedLimits : 0}%`}
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
                              {`${transportAuthorityCriticalApparatus ? transportAuthorityCriticalApparatus : 0}%`}
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
                              {`${strategicRoute ? strategicRoute : 0}%`}
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
                              {`${streetLighting ? streetLighting : 0}%`}
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
                              {`${drainageAndFlood ? drainageAndFlood : 0}%`}
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
                              {`${unusualTrafficLayouts ? unusualTrafficLayouts : 0}%`}
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
                              {`${localConsiderations ? localConsiderations : 0}%`}
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
                              {`${winterMaintenanceRoutes ? winterMaintenanceRoutes : 0}%`}
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
                              {`${hgvApprovedRoutes ? hgvApprovedRoutes : 0}%`}
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
                              {`${emergencyServicesRoutes ? emergencyServicesRoutes : 0}%`}
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
