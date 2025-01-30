/* #region header */
/**************************************************************************************************
//
//  Description: Street template tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                  Initial Revision.
//    002   10.08.23 Sean Flook                  Modified to call the API to update the values.
//    003   23.08.23 Sean Flook        IMANN-159 Use the new street template structure.
//    004   07.09.23 Sean Flook                  Removed unnecessary awaits.
//    005   03.11.23 Sean Flook                  Added hyphen to one-way.
//    006   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//    007   05.12.23 Joel Benford                Various fixes to display and save
//    008   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    009   05.01.24 Sean Flook                  Use CSS shortcuts.
//    010   10.01.24 Sean Flook                  Fix warnings.
//    011   25.01.24 Sean Flook                  Changes required after UX review.
//    012   30.01.24 Sean Flook                  Added ESU tolerance for GeoPlace.
//    013   13.02.24 Sean Flook                  Only set the data if it exists.
//    014   19.02.24 Sean Flook        IMANN-307 Check for the ESU objects when trying to edit the ESU template.
//    015   08.05.24 Sean Flook        IMANN-447 Added exclude from export.
//    016   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    017   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    018   01.10.24 Sean Flook        IMANN-664 Changed Indicators to Indicator.
//    019   22.10.24 Sean Flook       IMANN-1018 Hide ESU and associated cards if do not have streets.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.4.0 changes
//    020   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    021   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//#endregion Version 1.0.4.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";

import { Typography, Tooltip, Grid2, Card, CardHeader, CardActionArea, CardContent, IconButton } from "@mui/material";
import { Box, Stack } from "@mui/system";

import EditTemplateDialog from "../dialogs/EditTemplateDialog";

import { GetStreetTemplateUrl } from "../configuration/ADSConfig";

import StreetType from "../data/StreetType";
import StreetState from "../data/StreetState";
import StreetClassification from "../data/StreetClassification";
import StreetSurface from "../data/StreetSurface";
import ESUDirectionCode from "../data/ESUDirectionCode";
import ESUTolerance from "../data/ESUTolerance";
import ESUState from "../data/ESUState";
import ESUClassification from "../data/ESUClassification";
import OneWayExemptionType from "../data/OneWayExemptionType";
import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import HighwayDedicationCode from "../data/HighwayDedicationCode";

import EditIcon from "@mui/icons-material/Edit";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import {
  PRoWIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";

import {
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
  getTitleStyle,
  getTemplateIconStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { StringToTitleCase } from "../utils/HelperUtils";
import { adsRed } from "../utils/ADSColours";

function StreetTemplateTab() {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);

  const [data, setData] = useState(null);

  const [streetRefType, setStreetRefType] = useState(null);
  const [state, setState] = useState(null);
  const [localityRef, setLocalityRef] = useState(null);
  const [townRef, setTownRef] = useState(null);
  const [islandRef, setIslandRef] = useState(null);
  const [adminAreaRef, setAdminAreaRef] = useState(null);
  const [classification, setClassification] = useState(null);
  const [surface, setSurface] = useState(null);
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [esuDirection, setEsuDirection] = useState(null);
  const [esuTolerance, setEsuTolerance] = useState(null);
  const [esuState, setEsuState] = useState(null);
  const [esuClassification, setEsuClassification] = useState(null);
  const [oweType, setOweType] = useState(null);
  const [owePeriodicityCode, setOwePeriodicityCode] = useState(null);
  const [hdCode, setHdCode] = useState(false);
  const [hdPRoW, setHdPRoW] = useState(false);
  const [hdNCR, setHdNCR] = useState(false);
  const [hdQuietRoute, setHdQuietRoute] = useState(false);
  const [hdObstruction, setHdObstruction] = useState(false);
  const [hdPlanningOrder, setHdPlanningOrder] = useState(false);
  const [hdVehiclesProhibited, setHdVehiclesProhibited] = useState(false);

  const [editStreet, setEditStreet] = useState(false);
  const [editEsu, setEditEsu] = useState(false);
  const [editOneWayExemption, setEditOneWayExemption] = useState(false);
  const [editHighwayDedication, setEditHighwayDedication] = useState(false);

  const [editVariant, setEditVariant] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [updateError, setUpdateError] = useState(null);

  /**
   * Event to handle when the mouse enters the street card.
   */
  const doMouseEnterStreet = () => {
    setEditStreet(true);
  };

  /**
   * Event to handle when the mouse leaves the street card.
   */
  const doMouseLeaveStreet = () => {
    setEditStreet(false);
  };

  /**
   * Event to handle when the mouse enters the ESU card.
   */
  const doMouseEnterEsu = () => {
    setEditEsu(true);
  };

  /**
   * Event to handle when the mouse leaves the ESU card.
   */
  const doMouseLeaveEsu = () => {
    setEditEsu(false);
  };

  /**
   * Event to handle when the mouse enters the one-way exemption card.
   */
  const doMouseEnterOneWayExemption = () => {
    setEditOneWayExemption(true);
  };

  /**
   * Event to handle when the mouse leaves the one-way exemption card.
   */
  const doMouseLeaveOneWayExemption = () => {
    setEditOneWayExemption(false);
  };

  /**
   * Event to handle when the mouse enters the highway dedication card.
   */
  const doMouseEnterHighwayDedication = () => {
    setEditHighwayDedication(true);
  };

  /**
   * Event to handle when the mouse leaves the highway dedication card.
   */
  const doMouseLeaveHighwayDedication = () => {
    setEditHighwayDedication(false);
  };

  /**
   * Method to get the street type description.
   *
   * @param {number} value The street type.
   * @returns {string|null} The description to display for the street type.
   */
  const getStreetType = (value) => {
    const rec = StreetType.find((x) => x.id === value);

    if (rec) return `Type ${streetRefType} - ${settingsContext.isScottish ? rec.osText : rec.gpText}`;
    else return null;
  };

  /**
   * Method to get the street state description.
   *
   * @param {number} value The street state.
   * @returns {string|null} The description to display for the street state.
   */
  const getState = (value) => {
    const rec = settingsContext.isScottish
      ? ESUState.find((x) => x.id === value)
      : StreetState.find((x) => x.id === value);

    if (rec) return settingsContext.isScottish ? rec.osText : rec.gpText;
    else return null;
  };

  /**
   * Method to get the locality for the locality reference number.
   *
   * @param {number} value The locality reference number.
   * @returns {string|null} The locality to display for the locality reference number.
   */
  const getLocality = (value) => {
    const rec = lookupContext.currentLookups.localities.find((x) => x.localityRef === value);

    if (rec) return rec.locality;
    else return null;
  };

  /**
   * Method to get the town for the town reference number.
   *
   * @param {number} value The town reference number.
   * @returns {string|null} The town to display for the town reference number.
   */
  const getTown = (value) => {
    const rec = lookupContext.currentLookups.towns.find((x) => x.townRef === value);

    if (rec) return rec.town;
    else return null;
  };

  /**
   * Method to get the island for the island reference number.
   *
   * @param {number} value The island reference number.
   * @returns {string|null} The island to display for the island reference number.
   */
  const getIsland = (value) => {
    const rec = lookupContext.currentLookups.islands.find((x) => x.islandRef === value);

    if (rec) return rec.island;
    else return null;
  };

  /**
   * Method to get the administrative area for the administrative area reference number.
   *
   * @param {number} value The administrative area reference number.
   * @returns {string|null} The administrative area to display for the administrative area reference number.
   */
  const getAdminArea = (value) => {
    const rec = lookupContext.currentLookups.adminAuthorities.find((x) => x.administrativeAreaRef === value);

    if (rec) return rec.administrativeArea;
    else return null;
  };

  /**
   * Method to get the classification for the classification code.
   *
   * @param {string} value The classification code.
   * @returns {string|null} The classification to display for the classification code.
   */
  const getClassification = (value) => {
    const rec = settingsContext.isScottish
      ? ESUClassification.find((x) => x.id === value)
      : StreetClassification.find((x) => x.id === value);

    if (rec) return settingsContext.isScottish ? rec.osText : rec.gpText;
    else return null;
  };

  /**
   * Method to get the surface for the surface code.
   *
   * @param {number} value The surface code.
   * @returns {string|null} The surface to display for the surface code.
   */
  const getSurface = (value) => {
    const rec = StreetSurface.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the direction for the direction code.
   *
   * @param {number} value The direction code.
   * @returns {string|null} The direction to display for the direction code.
   */
  const getDirection = (value) => {
    const rec = ESUDirectionCode.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the tolerance for the ESU.
   *
   * @param {number} value The tolerance.
   * @returns {string|null} The tolerance to display.
   */
  const getTolerance = (value) => {
    const rec = ESUTolerance.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the one-way exemption type for the one-way exemption type code.
   *
   * @param {number} value The one-way exemption type code.
   * @returns {string|null} The one-way exemption type to display for the one-way exemption type code.
   */
  const getOweType = (value) => {
    const rec = OneWayExemptionType.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the one-way exemption periodicity for the one-way exemption periodicity code.
   *
   * @param {number} value The one-way exemption periodicity code.
   * @returns {string|null} The one-way exemption periodicity to display for the one-way exemption periodicity code.
   */
  const getOwePeriodicity = (value) => {
    const rec = OneWayExemptionPeriodicity.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the highway dedication for the highway dedication code.
   *
   * @param {number} value The highway dedication code.
   * @returns {string|null} The highway dedication to display for the highway dedication code.
   */
  const getHdCode = (value) => {
    const rec = HighwayDedicationCode.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Event to handle when the street data is edited.
   */
  const doEditStreet = () => {
    setUpdateError(null);
    setEditVariant("street");
    setEditData({
      streetRefType: data.streetTemplate.recordType,
      state: data.streetTemplate.state,
      localityRef: data.streetTemplate.localityRef,
      townRef: data.streetTemplate.townRef,
      islandRef: data.streetTemplate.islandRef,
      adminAreaRef: data.streetTemplate.adminAreaRef,
      classification: data.streetTemplate.classification,
      surface: data.streetTemplate.streetSurface,
      excludeFromExport: data.streetTemplate.streetExcludeFromExport,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the ESU data is edited.
   */
  const doEditEsu = () => {
    setUpdateError(null);
    setEditVariant("esu");
    setEditData({
      esuDirection: data.esuTemplate ? data.esuTemplate.esuDirection : null,
      esuTolerance: data.esuTemplate ? data.esuTemplate.esuTolerance : null,
      esuState: data.scoEsuTemplate ? data.scoEsuTemplate.state : null,
      esuClassification: data.scoEsuTemplate ? data.scoEsuTemplate.classification : null,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the one-way exemption data is edited.
   */
  const doEditOneWayExemption = () => {
    setUpdateError(null);
    setEditVariant("owe");
    setEditData({
      oweType: data.esuTemplate.oneWayExemptionType,
      owePeriodicityCode: data.esuTemplate.oneWayExemptionPeriodicityCode,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the highway dedication data is edited.
   */
  const doEditHighwayDedication = () => {
    setUpdateError(null);
    setEditVariant("hd");
    setEditData({
      hdCode: data.esuTemplate.highwayDedicationCode,
      hdPRoW: data.esuTemplate.hdProw,
      hdNCR: data.esuTemplate.hdNcr,
      hdQuietRoute: data.esuTemplate.hdQuietRoute,
      hdObstruction: data.esuTemplate.hdObstruction,
      hdPlanningOrder: data.esuTemplate.hdPlanningOrder,
      hdVehiclesProhibited: data.esuTemplate.hdVehiclesProhibited,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the data has been edited.
   *
   * @param {object} updatedData The data that has been edited.
   */
  const handleDoneEditTemplate = async (updatedData) => {
    if (updatedData) {
      const saveUrl = GetStreetTemplateUrl("PUT", userContext.currentUser);

      if (saveUrl) {
        const saveData = {
          pkId: data.pkId,
          templateName: data.templateName,
          templateDescription: data.templateDescription,
          templateType: data.templateType,
          templateUseType: data.templateUseType,
          numberingSystem: data.numberingSystem,
          constructionTemplate: data.constructionTemplate,
          esuTemplate: !settingsContext.isScottish
            ? {
                pkId: data.esuTemplate.pkId,
                templatePkId: data.esuTemplate.templatePkId,
                esuDirection:
                  editVariant === "esu" && !settingsContext.isScottish
                    ? updatedData.esuDirection
                    : data.esuTemplate.esuDirection,
                esuTolerance:
                  editVariant === "esu" && !settingsContext.isScottish
                    ? updatedData.esuTolerance
                    : data.esuTemplate.esuTolerance,
                oneWayExemptionType:
                  editVariant === "owe" && !settingsContext.isScottish
                    ? updatedData.oweType
                    : data.esuTemplate.oneWayExemptionType,
                oneWayExemptionPeriodicityCode:
                  editVariant === "owe" && !settingsContext.isScottish
                    ? updatedData.owePeriodicityCode
                    : data.esuTemplate.oneWayExemptionPeriodicityCode,
                highwayDedicationCode:
                  editVariant === "hd" && !settingsContext.isScottish
                    ? updatedData.hdCode
                    : data.esuTemplate.highwayDedicationCode,
                hdProw:
                  editVariant === "hd" && !settingsContext.isScottish ? updatedData.hdPRoW : data.esuTemplate.hdProw,
                hdNcr: editVariant === "hd" && !settingsContext.isScottish ? updatedData.hdNCR : data.esuTemplate.hdNcr,
                hdQuietRoute:
                  editVariant === "hd" && !settingsContext.isScottish
                    ? updatedData.hdQuietRoute
                    : data.esuTemplate.hdQuietRoute,
                hdObstruction:
                  editVariant === "hd" && !settingsContext.isScottish
                    ? updatedData.hdObstruction
                    : data.esuTemplate.hdObstruction,
                hdPlanningOrder:
                  editVariant === "hd" && !settingsContext.isScottish
                    ? updatedData.hdPlanningOrder
                    : data.esuTemplate.hdPlanningOrder,
                hdVehiclesProhibited:
                  editVariant === "hd" && !settingsContext.isScottish
                    ? updatedData.hdVehiclesProhibited
                    : data.esuTemplate.hdVehiclesProhibited,
              }
            : data.esuTemplate,
          heightWidthWeightTemplate: data.heightWidthWeightTemplate,
          interestTemplate: data.interestTemplate,
          publicRightOfWayTemplate: data.publicRightOfWayTemplate,
          scoEsuTemplate: settingsContext.isScottish
            ? {
                pkId: data.scoEsuTemplate.pkId,
                templatePkId: data.scoEsuTemplate.templatePkId,
                state:
                  editVariant === "esu" && settingsContext.isScottish
                    ? updatedData.esuState
                    : data.scoEsuTemplate.state,
                classification:
                  editVariant === "esu" && settingsContext.isScottish
                    ? updatedData.esuClassification
                    : data.scoEsuTemplate.classification,
              }
            : data.scoEsuTemplate,
          scoMaintenanceResponsibilityTemplate: data.scoMaintenanceResponsibilityTemplate,
          scoReinstatementCategoryTemplate: data.scoReinstatementCategoryTemplate,
          scoSpecialDesignationTemplate: data.scoSpecialDesignationTemplate,
          specialDesignationTemplate: data.specialDesignationTemplate,
          streetTemplate: {
            pkId: data.streetTemplate.pkId,
            templatePkId: data.streetTemplate.templatePkId,
            language: data.streetTemplate.language,
            recordType: editVariant === "street" ? updatedData.streetRefType : data.streetTemplate.recordType,
            state: editVariant === "street" ? updatedData.state : data.streetTemplate.state,
            townRef: editVariant === "street" ? updatedData.townRef : data.streetTemplate.townRef,
            localityRef: editVariant === "street" ? updatedData.localityRef : data.streetTemplate.localityRef,
            adminAreaRef: editVariant === "street" ? updatedData.adminAreaRef : data.streetTemplate.adminAreaRef,
            classification:
              editVariant === "street" && !settingsContext.isScottish
                ? updatedData.classification
                : data.streetTemplate.classification,
            streetSurface:
              editVariant === "street" && !settingsContext.isScottish
                ? updatedData.surface
                : data.streetTemplate.streetSurface,
            islandRef:
              editVariant === "street" && settingsContext.isScottish
                ? updatedData.islandRef
                : data.streetTemplate.islandRef,
            streetExcludeFromExport:
              editVariant === "street"
                ? updatedData.streetExcludeFromExport
                : data.streetTemplate.streetExcludeFromExport
                ? data.streetTemplate.streetExcludeFromExport
                : false,
          },
        };

        if (userContext.currentUser.showMessages)
          console.log("[DEBUG] handleDoneEditTemplate", updatedData, saveUrl, JSON.stringify(saveData));

        await fetch(saveUrl.url, {
          headers: saveUrl.headers,
          crossDomain: true,
          method: saveUrl.type,
          body: JSON.stringify(saveData),
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            settingsContext.onStreetTemplateChange(result);
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error("[400 ERROR] Updating street template", body.errors);
                });
                break;

              case 401:
                useContext.onExpired();
                break;

              case 403:
                setUpdateError("You do not have authorisation to update the template");
                break;

              case 500:
                res.json().then((body) => {
                  setUpdateError(`ERROR: ${body[0].errorTitle} - ${body[0].errorDescription}`);
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[500 ERROR] Updating street template - ${body[0].errorTitle}: ${body[0].errorDescription}`
                    );
                });
                break;

              default:
                if (userContext.currentUser.showMessages)
                  console.error(`[${res.status} ERROR] handleDoneEditTemplate - Updating street template.`, res);
                break;
            }
          });
      }
    }

    setShowEditDialog(false);
  };

  /**
   * Event to handle when the edit template dialog is closed.
   */
  const handleCloseEditTemplate = () => {
    setShowEditDialog(false);
  };

  useEffect(() => {
    if (settingsContext.streetTemplate) setData(settingsContext.streetTemplate);

    return () => {};
  }, [settingsContext.streetTemplate]);

  useEffect(() => {
    if (data) {
      setStreetRefType(data.streetTemplate ? data.streetTemplate.recordType : null);
      setState(data.streetTemplate ? data.streetTemplate.state : null);
      setLocalityRef(data.streetTemplate ? data.streetTemplate.localityRef : null);
      setTownRef(data.streetTemplate ? data.streetTemplate.townRef : null);
      setIslandRef(data.streetTemplate ? data.streetTemplate.islandRef : null);
      setAdminAreaRef(data.streetTemplate ? data.streetTemplate.adminAreaRef : null);
      setClassification(data.streetTemplate ? data.streetTemplate.classification : null);
      setSurface(data.streetTemplate ? data.streetTemplate.streetSurface : null);
      setExcludeFromExport(data.streetTemplate ? data.streetTemplate.streetExcludeFromExport : false);
      setEsuDirection(data.esuTemplate ? data.esuTemplate.esuDirection : null);
      setEsuTolerance(data.esuTemplate ? data.esuTemplate.esuTolerance : null);
      setEsuState(data.scoEsuTemplate ? data.scoEsuTemplate.state : null);
      setEsuClassification(data.scoEsuTemplate ? data.scoEsuTemplate.classification : null);
      setOweType(data.esuTemplate ? data.esuTemplate.oneWayExemptionType : null);
      setOwePeriodicityCode(data.esuTemplate ? data.esuTemplate.oneWayExemptionPeriodicityCode : null);
      setHdCode(data.esuTemplate ? data.esuTemplate.highwayDedicationCode : null);
      setHdPRoW(data.esuTemplate ? data.esuTemplate.hdProw : false);
      setHdNCR(data.esuTemplate ? data.esuTemplate.hdNcr : false);
      setHdQuietRoute(data.esuTemplate ? data.esuTemplate.hdQuietRoute : false);
      setHdObstruction(data.esuTemplate ? data.esuTemplate.hdObstruction : false);
      setHdPlanningOrder(data.esuTemplate ? data.esuTemplate.hdPlanningOrder : false);
      setHdVehiclesProhibited(data.esuTemplate ? data.esuTemplate.hdVehiclesProhibited : false);
    }
  }, [data]);

  return (
    <Box sx={{ ml: theme.spacing(1), mr: theme.spacing(4) }}>
      <Stack direction="column" spacing={1}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3) }}>Street template</Typography>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ pl: theme.spacing(3) }}>
            Set default lookup values for streets
          </Typography>
          {updateError && (
            <Typography variant="body2" sx={{ color: adsRed }}>
              {updateError}
            </Typography>
          )}
        </Stack>
        <Grid2 container sx={{ pr: theme.spacing(3.5) }} spacing={3}>
          <Grid2 size={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterStreet}
              onMouseLeave={doMouseLeaveStreet}
              sx={settingsCardStyle(editStreet)}
            >
              <CardHeader
                action={
                  editStreet && (
                    <Tooltip title="Edit street defaults" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditStreet} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Street defaults"
                sx={{ height: "66px" }}
                slotProps={{
                  title: { sx: getTitleStyle(editStreet) },
                }}
              />
              <CardActionArea onClick={doEditStreet}>
                <CardContent sx={settingsCardContentStyle(settingsContext.isScottish ? "os-street" : "street")}>
                  <Grid2 container rowSpacing={1}>
                    <Grid2 size={3}>
                      <Typography variant="body2">Type</Typography>
                    </Grid2>
                    <Grid2 size={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getStreetType(streetRefType)}
                      </Typography>
                    </Grid2>
                    {!settingsContext.isScottish && (
                      <Grid2 size={3}>
                        <Typography variant="body2">State</Typography>
                      </Grid2>
                    )}
                    {!settingsContext.isScottish && (
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getState(state)}
                        </Typography>
                      </Grid2>
                    )}
                    <Grid2 size={3}>
                      <Typography variant="body2">Locality</Typography>
                    </Grid2>
                    <Grid2 size={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {StringToTitleCase(getLocality(localityRef))}
                      </Typography>
                    </Grid2>
                    <Grid2 size={3}>
                      <Typography variant="body2">Town</Typography>
                    </Grid2>
                    <Grid2 size={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {StringToTitleCase(getTown(townRef))}
                      </Typography>
                    </Grid2>
                    {settingsContext.isScottish && (
                      <Grid2 size={3}>
                        <Typography variant="body2">Island</Typography>
                      </Grid2>
                    )}
                    {settingsContext.isScottish && (
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {StringToTitleCase(getIsland(islandRef))}
                        </Typography>
                      </Grid2>
                    )}
                    <Grid2 size={3}>
                      <Typography variant="body2">Admin area</Typography>
                    </Grid2>
                    <Grid2 size={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {StringToTitleCase(getAdminArea(adminAreaRef))}
                      </Typography>
                    </Grid2>
                    {!settingsContext.isScottish && (
                      <Grid2 size={3}>
                        <Typography variant="body2">Classification</Typography>
                      </Grid2>
                    )}
                    {!settingsContext.isScottish && (
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getClassification(classification)}
                        </Typography>
                      </Grid2>
                    )}
                    {!settingsContext.isScottish && (
                      <Grid2 size={3}>
                        <Typography variant="body2">Surface</Typography>
                      </Grid2>
                    )}
                    {!settingsContext.isScottish && (
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getSurface(surface)}
                        </Typography>
                      </Grid2>
                    )}
                    <Grid2 size={3}>
                      <Typography variant="body2">Exclude from export</Typography>
                    </Grid2>
                    <Grid2 size={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${excludeFromExport ? "Yes" : "No"}`}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid2>
          {userContext.currentUser.hasStreet && (
            <Grid2 size={6}>
              <Card
                variant="outlined"
                elevation={0}
                onMouseEnter={doMouseEnterEsu}
                onMouseLeave={doMouseLeaveEsu}
                sx={settingsCardStyle(editEsu)}
              >
                <CardHeader
                  action={
                    editEsu && (
                      <Tooltip title="Edit ESU defaults" placement="bottom" sx={tooltipStyle}>
                        <IconButton onClick={doEditEsu} sx={{ pr: "16px", pb: "16px" }}>
                          <EditIcon sx={ActionIconStyle(true)} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  title="ESU defaults"
                  sx={{ height: "66px" }}
                  slotProps={{
                    title: { sx: getTitleStyle(editEsu) },
                  }}
                />
                <CardActionArea onClick={doEditEsu}>
                  <CardContent sx={settingsCardContentStyle(settingsContext.isScottish ? "os-street" : "street")}>
                    <Grid2 container rowSpacing={1}>
                      {!settingsContext.isScottish && (
                        <Grid2 size={3}>
                          <Typography variant="body2">Direction</Typography>
                        </Grid2>
                      )}
                      {!settingsContext.isScottish && (
                        <Grid2 size={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getDirection(esuDirection)}
                          </Typography>
                        </Grid2>
                      )}
                      {!settingsContext.isScottish && (
                        <Grid2 size={3}>
                          <Typography variant="body2">Tolerance</Typography>
                        </Grid2>
                      )}
                      {!settingsContext.isScottish && (
                        <Grid2 size={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getTolerance(esuTolerance)}
                          </Typography>
                        </Grid2>
                      )}
                      {settingsContext.isScottish && (
                        <Grid2 size={3}>
                          <Typography variant="body2">State</Typography>
                        </Grid2>
                      )}
                      {settingsContext.isScottish && (
                        <Grid2 size={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getState(esuState)}
                          </Typography>
                        </Grid2>
                      )}
                      {settingsContext.isScottish && (
                        <Grid2 size={3}>
                          <Typography variant="body2">Classification</Typography>
                        </Grid2>
                      )}
                      {settingsContext.isScottish && (
                        <Grid2 size={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getClassification(esuClassification)}
                          </Typography>
                        </Grid2>
                      )}
                    </Grid2>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid2>
          )}
          {!settingsContext.isScottish && userContext.currentUser.hasStreet && (
            <Grid2 size={6}>
              <Card
                variant="outlined"
                elevation={0}
                onMouseEnter={doMouseEnterOneWayExemption}
                onMouseLeave={doMouseLeaveOneWayExemption}
                sx={settingsCardStyle(editOneWayExemption)}
              >
                <CardHeader
                  action={
                    editOneWayExemption && (
                      <Tooltip title="Edit one-way exemption defaults" placement="bottom" sx={tooltipStyle}>
                        <IconButton onClick={doEditOneWayExemption} sx={{ pr: "16px", pb: "16px" }}>
                          <EditIcon sx={ActionIconStyle(true)} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  title="One-way exemption defaults"
                  sx={{ height: "66px" }}
                  slotProps={{
                    title: { sx: getTitleStyle(editOneWayExemption) },
                  }}
                />
                <CardActionArea onClick={doEditOneWayExemption}>
                  <CardContent sx={settingsCardContentStyle("street")}>
                    <Grid2 container rowSpacing={1}>
                      <Grid2 size={3}>
                        <Typography variant="body2">Type</Typography>
                      </Grid2>
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getOweType(oweType)}
                        </Typography>
                      </Grid2>
                      <Grid2 size={3}>
                        <Typography variant="body2">Periodicity</Typography>
                      </Grid2>
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getOwePeriodicity(owePeriodicityCode)}
                        </Typography>
                      </Grid2>
                    </Grid2>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid2>
          )}
          {!settingsContext.isScottish && userContext.currentUser.hasStreet && (
            <Grid2 size={6}>
              <Card
                variant="outlined"
                elevation={0}
                onMouseEnter={doMouseEnterHighwayDedication}
                onMouseLeave={doMouseLeaveHighwayDedication}
                sx={settingsCardStyle(editHighwayDedication)}
              >
                <CardHeader
                  action={
                    editHighwayDedication && (
                      <Tooltip title="Edit highway dedication defaults" placement="bottom" sx={tooltipStyle}>
                        <IconButton onClick={doEditHighwayDedication} sx={{ pr: "16px", pb: "16px" }}>
                          <EditIcon sx={ActionIconStyle(true)} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  title="Highway dedication defaults"
                  sx={{ height: "66px" }}
                  slotProps={{
                    title: { sx: getTitleStyle(editHighwayDedication) },
                  }}
                />
                <CardActionArea onClick={doEditHighwayDedication}>
                  <CardContent sx={settingsCardContentStyle("street")}>
                    <Grid2 container rowSpacing={1}>
                      <Grid2 size={3}>
                        <Typography variant="body2">Type</Typography>
                      </Grid2>
                      <Grid2 size={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getHdCode(hdCode)}
                        </Typography>
                      </Grid2>
                      <Grid2 size={3}>
                        <Typography variant="body2">Indicator</Typography>
                      </Grid2>
                      <Grid2 size={9}>
                        <Stack direction="row" spacing={1}>
                          <PRoWIcon fontSize="small" sx={getTemplateIconStyle(hdPRoW)} />
                          <DirectionsBikeIcon fontSize="small" sx={getTemplateIconStyle(hdNCR)} />
                          <QuietRouteIcon fontSize="small" sx={getTemplateIconStyle(hdQuietRoute)} />
                          <ObstructionIcon fontSize="small" sx={getTemplateIconStyle(hdObstruction)} />
                          <PlanningOrderIcon fontSize="small" sx={getTemplateIconStyle(hdPlanningOrder)} />
                          <VehiclesProhibitedIcon fontSize="small" sx={getTemplateIconStyle(hdVehiclesProhibited)} />
                        </Stack>
                      </Grid2>
                    </Grid2>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid2>
          )}
        </Grid2>
      </Stack>
      <EditTemplateDialog
        isOpen={showEditDialog}
        variant={editVariant}
        data={editData}
        onDone={(data) => handleDoneEditTemplate(data)}
        onClose={handleCloseEditTemplate}
      />
    </Box>
  );
}

export default StreetTemplateTab;
