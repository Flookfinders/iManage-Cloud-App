/* #region header */
/**************************************************************************************************
//
//  Description: ASD template tab
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
//    002   10.08.23 Sean Flook                 Modified to call the API to update the values.
//    003   23.08.23 Sean Flook       IMANN-159 Use the new street template structure.
//    004   07.09.23 Sean Flook                 Removed unnecessary awaits.
//    005   06.10.23 Sean Flook                 Use colour variables.
//    006   03.11.23 Sean Flook                 Make labels the same within application.
//    007   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    008   05.12.23 Joel Benford               Various fixes to display and save
//    009   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";

import { Typography, Tooltip, Grid, Card, CardActionArea, CardContent, IconButton } from "@mui/material";
import { Box, Stack } from "@mui/system";

import EditTemplateDialog from "../dialogs/EditTemplateDialog";

import { GetStreetTemplateUrl } from "../configuration/ADSConfig";

import RoadStatusCode from "../data/RoadStatusCode";
import InterestType from "../data/InterestType";
import SwaOrgRef from "../data/SwaOrgRef";
import ConstructionType from "../data/ConstructionType";
import ReinstatementType from "../data/ReinstatementType";
import AggregateAbrasionValue from "../data/AggregateAbrasionValue";
import PolishedStoneValue from "../data/PolishedStoneValue";
import SpecialDesignationCode from "../data/SpecialDesignationCode";
import SpecialDesignationPeriodicity from "../data/SpecialDesignationPeriodicity";
import HWWDesignationCode from "../data/HWWDesignationCode";
import PRoWDedicationCode from "../data/PRoWDedicationCode";
import PRoWStatusCode from "../data/PRoWStatusCode";

import EditIcon from "@mui/icons-material/Edit";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import SkateboardingIcon from "@mui/icons-material/Skateboarding";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { EquestrianIcon } from "../utils/ADSIcons";
import DoneIcon from "@mui/icons-material/Done";

import { adsLightBlue } from "../utils/ADSColours";
import {
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
  getTitleStyle,
  getTemplateIconStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function AsdTemplateTab() {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);

  const [data, setData] = useState(null);

  const [maintenanceResponsibilityStreetStatus, setMaintenanceResponsibilityStreetStatus] = useState(null);
  const [maintenanceResponsibilityCustodian, setMaintenanceResponsibilityCustodian] = useState(null);
  const [maintenanceResponsibilityAuthority, setMaintenanceResponsibilityAuthority] = useState(null);
  const [reinstatementCategoryReinstatementCategory, setReinstatementCategoryReinstatementCategory] = useState(null);
  const [reinstatementCategoryCustodian, setReinstatementCategoryCustodian] = useState(null);
  const [reinstatementCategoryAuthority, setReinstatementCategoryAuthority] = useState(null);
  const [osSpecialDesignationSpecialDesignation, setOsSpecialDesignationSpecialDesignation] = useState(null);
  const [osSpecialDesignationCustodian, setOsSpecialDesignationCustodian] = useState(null);
  const [osSpecialDesignationAuthority, setOsSpecialDesignationAuthority] = useState(null);
  const [interestStreetStatus, setInterestStreetStatus] = useState(null);
  const [interestOrganisation, setInterestOrganisation] = useState(null);
  const [interestType, setInterestType] = useState(null);
  const [interestDistrict, setInterestDistrict] = useState(null);
  const [interestMaintainingOrganisation, setInterestMaintainingOrganisation] = useState(null);
  const [constructionType, setConstructionType] = useState(null);
  const [constructionReinstatementType, setConstructionReinstatementType] = useState(null);
  const [constructionAggregateAbrasionValue, setConstructionAggregateAbrasionValue] = useState(null);
  const [constructionPolishedStoneValue, setConstructionPolishedStoneValue] = useState(null);
  const [constructionOrganisation, setConstructionOrganisation] = useState(null);
  const [constructionDistrict, setConstructionDistrict] = useState(null);
  const [specialDesigType, setSpecialDesigType] = useState(null);
  const [specialDesigOrganisation, setSpecialDesigOrganisation] = useState(null);
  const [specialDesigDistrict, setSpecialDesigDistrict] = useState(null);
  const [specialDesigPeriodicity, setSpecialDesigPeriodicity] = useState(null);
  const [hwwDesignation, setHwwDesignation] = useState(null);
  const [hwwOrganisation, setHwwOrganisation] = useState(null);
  const [hwwDistrict, setHwwDistrict] = useState(null);
  const [prowDedication, setProwDedication] = useState(null);
  const [prowStatus, setProwStatus] = useState(null);
  const [prowPedestrianAccess, setProwPedestrianAccess] = useState(false);
  const [prowEquestrianAccess, setProwEquestrianAccess] = useState(false);
  const [prowNonMotorisedVehicleAccess, setProwNonMotorisedVehicleAccess] = useState(false);
  const [prowBicycleAccess, setProwBicycleAccess] = useState(false);
  const [prowMotorisedVehicleAccess, setProwMotorisedVehicleAccess] = useState(false);
  const [prowPromotedRoute, setProwPromotedRoute] = useState(false);
  const [prowAccessibleRoute, setProwAccessibleRoute] = useState(false);
  const [prowOrganisation, setProwOrganisation] = useState(null);
  const [prowDistrict, setProwDistrict] = useState(null);

  const [editMaintenanceResponsibility, setEditMaintenanceResponsibility] = useState(false);
  const [editReinstatementCategory, setEditReinstatementCategory] = useState(false);
  const [editOsSpecialDesignation, setEditOsSpecialDesignation] = useState(false);
  const [editInterest, setEditInterest] = useState(false);
  const [editConstruction, setEditConstruction] = useState(false);
  const [editSpecialDesignation, setEditSpecialDesignation] = useState(false);
  const [editHww, setEditHww] = useState(false);
  const [editPRoW, setEditPRoW] = useState(false);

  const [editVariant, setEditVariant] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  /**
   * Event to handle when the mouse enters the maintenance responsibility card.
   */
  const doMouseEnterMaintenanceResponsibility = () => {
    setEditMaintenanceResponsibility(true);
  };

  /**
   * Event to handle when the mouse leaves the maintenance responsibility card.
   */
  const doMouseLeaveMaintenanceResponsibility = () => {
    setEditMaintenanceResponsibility(false);
  };

  /**
   * Event to handle when the mouse enters the reinstatement category card.
   */
  const doMouseEnterReinstatementCategory = () => {
    setEditReinstatementCategory(true);
  };

  /**
   * Event to handle when the mouse leaves the reinstatement category card.
   */
  const doMouseLeaveReinstatementCategory = () => {
    setEditReinstatementCategory(false);
  };

  /**
   * Event to handle when the mouse enters the OneScotland special designation card.
   */
  const doMouseEnterOsSpecialDesignation = () => {
    setEditOsSpecialDesignation(true);
  };

  /**
   * Event to handle when the mouse leaves the OneScotland special designation card.
   */
  const doMouseLeaveOsSpecialDesignation = () => {
    setEditOsSpecialDesignation(false);
  };

  /**
   * Event to handle when the mouse enters the interest card.
   */
  const doMouseEnterInterest = () => {
    setEditInterest(true);
  };

  /**
   * Event to handle when the mouse leaves the interest card.
   */
  const doMouseLeaveInterest = () => {
    setEditInterest(false);
  };

  /**
   * Event to handle when the mouse enters the construction card.
   */
  const doMouseEnterConstruction = () => {
    setEditConstruction(true);
  };

  /**
   * Event to handle when the mouse leaves the construction card.
   */
  const doMouseLeaveConstruction = () => {
    setEditConstruction(false);
  };

  /**
   * Event to handle when the mouse enters the GeoPlace special designation card.
   */
  const doMouseEnterSpecialDesignation = () => {
    setEditSpecialDesignation(true);
  };

  /**
   * Event to handle when the mouse leaves the GeoPlace special designation card.
   */
  const doMouseLeaveSpecialDesignation = () => {
    setEditSpecialDesignation(false);
  };

  /**
   * Event to handle when the mouse enters the height, width & weight card.
   */
  const doMouseEnterHww = () => {
    setEditHww(true);
  };

  /**
   * Event to handle when the mouse leaves the height, width & weight card.
   */
  const doMouseLeaveHww = () => {
    setEditHww(false);
  };

  /**
   * Event to handle when the mouse enters the public rights of way card.
   */
  const doMouseEnterPRoW = () => {
    setEditPRoW(true);
  };

  /**
   * Event to handle when the mouse leaves the public rights of way card.
   */
  const doMouseLeavePRoW = () => {
    setEditPRoW(false);
  };

  /**
   * Method to get the street status description.
   *
   * @param {number} value The street status.
   * @returns {string|null} The description to display for the street status.
   */
  const getStreetStatus = (value) => {
    const rec = RoadStatusCode.find((x) => x.id === value);

    if (rec) return settingsContext.isScottish ? rec.osText : rec.gpText;
    else return null;
  };

  /**
   * Method to get the organisation description.
   *
   * @param {number} value The organisation reference number.
   * @returns {string|null} The description to display for the organisation reference number.
   */
  const getOrganisation = (value) => {
    const rec = SwaOrgRef.find((x) => x.id === value);

    if (rec) return settingsContext.isScottish ? rec.osText : rec.gpText;
    else return null;
  };

  /**
   * Method to get the interest type description.
   *
   * @param {number} value The interest type.
   * @returns {string|null} The description to display for the interest type.
   */
  const getInterestType = (value) => {
    const rec = InterestType.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the district description.
   *
   * @param {number} value The district reference number.
   * @returns {string|null} The description to display for the district.
   */
  const getDistrict = (orgValue, value) => {
    const rec = lookupContext.currentLookups.operationalDistricts.find(
      (x) => x.organisationId === orgValue && x.districtId === value
    );

    if (rec) return rec.districtName;
    else return null;
  };

  /**
   * Method to get the construction type description.
   *
   * @param {number} value The construction type.
   * @returns {string|null} The description to display for the construction type.
   */
  const getConstructionType = (value) => {
    const rec = ConstructionType.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the reinstatement type description.
   *
   * @param {number} value The reinstatement type.
   * @returns {string|null} The description to display for the reinstatement type.
   */
  const getReinstatementType = (value) => {
    const rec = ReinstatementType.find((x) => x.id === value);

    if (rec) return settingsContext.isScottish ? rec.osText : rec.gpText;
    else return null;
  };

  /**
   * Method to get the aggregate abrasion description.
   *
   * @param {number} value The aggregate abrasion value.
   * @returns {string|null} The description to display for the aggregate abrasion value.
   */
  const getAggregateAbrasionValue = (value, reinstatementCode) => {
    const rec = AggregateAbrasionValue.find((x) => x.id === value && x.reinstatementCode === reinstatementCode);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the polished stone description.
   *
   * @param {number} value The polished stone value.
   * @returns {string|null} The description to display for the polished stone value.
   */
  const getPolishedStoneValue = (value, reinstatementCode) => {
    const rec = PolishedStoneValue.find((x) => x.id === value && x.reinstatementCode === reinstatementCode);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the special designation type description.
   *
   * @param {number} value The special designation type.
   * @returns {string|null} The description to display for the special designation type.
   */
  const getSpecialDesignationType = (value) => {
    const rec = SpecialDesignationCode.find((x) => x.id === value);

    if (rec) return settingsContext.isScottish ? rec.osText : rec.gpText;
    else return null;
  };

  /**
   * Method to get the special designation periodicity description.
   *
   * @param {number} value The special designation periodicity.
   * @returns {string|null} The description to display for the special designation periodicity.
   */
  const getSpecialDesignationPeriodicity = (value) => {
    const rec = SpecialDesignationPeriodicity.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the height, width & weight designation description.
   *
   * @param {number} value The height, width & weight designation.
   * @returns {string|null} The description to display for the height, width & weight designation.
   */
  const getHwwDesignation = (value) => {
    const rec = HWWDesignationCode.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the public rights of way dedication description.
   *
   * @param {number} value The public rights of way dedication.
   * @returns {string|null} The description to display for the public rights of way dedication.
   */
  const getProwDedication = (value) => {
    const rec = PRoWDedicationCode.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to get the public rights of way status description.
   *
   * @param {number} value The public rights of way status.
   * @returns {string|null} The description to display for the public rights of way status.
   */
  const getProwStatus = (value) => {
    const rec = PRoWStatusCode.find((x) => x.id === value);

    if (rec) return rec.gpText;
    else return null;
  };

  /**
   * Method to determine if a check needs to be displayed or not.
   *
   * @param {boolean} value True if the check icon is required; otherwise false.
   * @returns {JSX.Element|null} The check icon.
   */
  const getCheck = (value) => {
    if (value) return <DoneIcon fontSize="small" sx={{ color: adsLightBlue }} />;
    else return null;
  };

  /**
   * Event to handle when the maintenance responsibility data is edited.
   */
  const doEditMaintenanceResponsibility = () => {
    setEditVariant("maintenanceResponsibility");
    setEditData({
      maintenanceResponsibilityStreetStatus: data.scoMaintenanceResponsibilityTemplate.streetStatus,
      maintenanceResponsibilityCustodian: data.scoMaintenanceResponsibilityTemplate.custodianCode,
      maintenanceResponsibilityAuthority: data.scoMaintenanceResponsibilityTemplate.maintainingAuthorityCode,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the reinstatement category data is edited.
   */
  const doEditReinstatementCategory = () => {
    setEditVariant("reinstatementCategory");
    setEditData({
      reinstatementCategoryReinstatementCategory: data.scoReinstatementCategoryTemplate.reinstatementCategory,
      reinstatementCategoryCustodian: data.scoReinstatementCategoryTemplate.custodianCode,
      reinstatementCategoryAuthority: data.scoReinstatementCategoryTemplate.reinstatementAuthorityCode,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the OneScotland special designation data is edited.
   */
  const doEditOsSpecialDesignation = () => {
    setEditVariant("osSpecialDesignation");
    setEditData({
      osSpecialDesignationSpecialDesignation: data.scoSpecialDesignationTemplate.specialDesignation,
      osSpecialDesignationCustodian: data.scoSpecialDesignationTemplate.custodianCode,
      osSpecialDesignationAuthority: data.scoSpecialDesignationTemplate.authorityCode,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the interest data is edited.
   */
  const doEditInterest = () => {
    setEditVariant("interest");
    setEditData({
      interestStreetStatus: data.interestTemplate.streetStatus,
      interestOrganisation: data.interestTemplate.swaOrgRefAuthority,
      interestType: data.interestTemplate.interestType,
      interestDistrict: data.interestTemplate.districtRefAuthority,
      maintainingOrganisation: data.interestTemplate.swaOrgRefMaintaining,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the construction data is edited.
   */
  const doEditConstruction = () => {
    setEditVariant("construction");
    setEditData({
      constructionType: data.constructionTemplate.constructionType,
      reinstatementType: data.constructionTemplate.reinstatementTypeCode,
      aggregateAbrasionValue: data.constructionTemplate.aggregateAbrasionValue,
      polishedStoneValue: data.constructionTemplate.polishedStoneValue,
      constructionOrganisation: data.constructionTemplate.swaOrgRefConsultant,
      constructionDistrict: data.constructionTemplate.districtRefConsultant,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the GeoPlace special designation data is edited.
   */
  const doEditSpecialDesignation = () => {
    setEditVariant("specialDesignation");
    setEditData({
      specialDesigType: data.specialDesignationTemplate.type,
      specialDesigOrganisation: data.specialDesignationTemplate.swaOrgRefConsultant,
      specialDesigDistrict: data.specialDesignationTemplate.districtRefConsultant,
      specialDesigPeriodicity: data.specialDesignationTemplate.specialDesigPeriodicityCode,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the height, width & weight data is edited.
   */
  const doEditHww = () => {
    setEditVariant("hww");
    setEditData({
      hwwDesignation: data.heightWidthWeightTemplate.hwwRestrictionCode,
      hwwOrganisation: data.heightWidthWeightTemplate.swaOrgRefConsultant,
      hwwDistrict: data.heightWidthWeightTemplate.districtRefConsultant,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the public rights of way data is edited.
   */
  const doEditPRoW = () => {
    setEditVariant("prow");
    setEditData({
      prowDedication: data.publicRightOfWayTemplate.prowRights,
      prowStatus: data.publicRightOfWayTemplate.status,
      pedestrianAccess: data.publicRightOfWayTemplate.pedestrianAccess,
      equestrianAccess: data.publicRightOfWayTemplate.equestrianAccess,
      nonMotorisedVehicleAccess: data.publicRightOfWayTemplate.nonMotVehicleAccess,
      bicycleAccess: data.publicRightOfWayTemplate.bicycleAccess,
      motorisedVehicleAccess: data.publicRightOfWayTemplate.motVehicleAccess,
      promotedRoute: data.publicRightOfWayTemplate.promotedRoute,
      accessibleRoute: data.publicRightOfWayTemplate.accessibleRoute,
      prowOrganisation: data.publicRightOfWayTemplate.organisation,
      prowDistrict: data.publicRightOfWayTemplate.district,
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
      const saveUrl = GetStreetTemplateUrl("PUT", userContext.currentUser.token);

      if (saveUrl) {
        const saveData = {
          pkId: data.pkId,
          templateName: data.templateName,
          templateDescription: data.templateDescription,
          templateType: data.templateType,
          templateUseType: data.templateUseType,
          numberingSystem: data.numberingSystem,
          constructionTemplate: !settingsContext.isScottish
            ? {
                pkId: data.constructionTemplate.pkId,
                templatePkId: data.constructionTemplate.templatePkId,
                constructionType:
                  editVariant === "construction"
                    ? updatedData.constructionType
                    : data.constructionTemplate.constructionType,
                reinstatementTypeCode:
                  editVariant === "construction"
                    ? updatedData.reinstatementType
                    : data.constructionTemplate.reinstatementTypeCode,
                aggregateAbrasionValue:
                  editVariant === "construction"
                    ? updatedData.aggregateAbrasionValue
                    : data.constructionTemplate.aggregateAbrasionValue,
                polishedStoneValue:
                  editVariant === "construction"
                    ? updatedData.polishedStoneValue
                    : data.constructionTemplate.polishedStoneValue,
                swaOrgRefConsultant:
                  editVariant === "construction"
                    ? updatedData.constructionOrganisation
                    : data.constructionTemplate.swaOrgRefConsultant,
                districtRefConsultant:
                  editVariant === "construction"
                    ? updatedData.constructionDistrict
                    : data.constructionTemplate.districtRefConsultant,
              }
            : data.constructionTemplate,
          esuTemplate: data.esuTemplate,
          heightWidthWeightTemplate: !settingsContext.isScottish
            ? {
                pkId: data.heightWidthWeightTemplate.pkId,
                templatePkId: data.heightWidthWeightTemplate.templatePkId,
                hwwRestrictionCode:
                  editVariant === "hww"
                    ? updatedData.hwwDesignation
                    : data.heightWidthWeightTemplate.hwwRestrictionCode,
                swaOrgRefConsultant:
                  editVariant === "hww"
                    ? updatedData.hwwOrganisation
                    : data.heightWidthWeightTemplate.swaOrgRefConsultant,
                districtRefConsultant:
                  editVariant === "hww"
                    ? updatedData.hwwDistrict
                    : data.heightWidthWeightTemplate.districtRefConsultant,
              }
            : data.heightWidthWeightTemplate,
          interestTemplate: !settingsContext.isScottish
            ? {
                pkId: data.interestTemplate.pkId,
                templatePkId: data.interestTemplate.templatePkId,
                streetStatus:
                  editVariant === "interest" ? updatedData.interestStreetStatus : data.interestTemplate.streetStatus,
                swaOrgRefAuthority:
                  editVariant === "interest"
                    ? updatedData.interestOrganisation
                    : data.interestTemplate.swaOrgRefAuthority,
                interestType:
                  editVariant === "interest" ? updatedData.interestType : data.interestTemplate.interestType,
                districtRefAuthority:
                  editVariant === "interest"
                    ? updatedData.interestDistrict
                    : data.interestTemplate.districtRefAuthority,
                swaOrgRefMaintaining:
                  editVariant === "interest"
                    ? updatedData.maintainingOrganisation
                    : data.interestTemplate.swaOrgRefMaintaining,
              }
            : data.interestTemplate,
          publicRightOfWayTemplate: !settingsContext.isScottish
            ? {
                pkId: data.publicRightOfWayTemplate.pkId,
                templatePkId: data.publicRightOfWayTemplate.templatePkId,
                prowRights:
                  editVariant === "prow" ? updatedData.prowDedication : data.publicRightOfWayTemplate.prowRights,
                status: editVariant === "prow" ? updatedData.prowStatus : data.publicRightOfWayTemplate.status,
                pedestrianAccess:
                  editVariant === "prow"
                    ? updatedData.pedestrianAccess
                    : data.publicRightOfWayTemplate.pedestrianAccess,
                equestrianAccess:
                  editVariant === "prow"
                    ? updatedData.equestrianAccess
                    : data.publicRightOfWayTemplate.equestrianAccess,
                nonMotVehicleAccess:
                  editVariant === "prow"
                    ? updatedData.nonMotorisedVehicleAccess
                    : data.publicRightOfWayTemplate.nonMotVehicleAccess,
                bicycleAccess:
                  editVariant === "prow" ? updatedData.bicycleAccess : data.publicRightOfWayTemplate.bicycleAccess,
                motVehicleAccess:
                  editVariant === "prow"
                    ? updatedData.motorisedVehicleAccess
                    : data.publicRightOfWayTemplate.motVehicleAccess,
                promotedRoute:
                  editVariant === "prow" ? updatedData.promotedRoute : data.publicRightOfWayTemplate.promotedRoute,
                accessibleRoute:
                  editVariant === "prow" ? updatedData.accessibleRoute : data.publicRightOfWayTemplate.accessibleRoute,
                organisation:
                  editVariant === "prow" ? updatedData.prowOrganisation : data.publicRightOfWayTemplate.organisation,
                district: editVariant === "prow" ? updatedData.prowDistrict : data.publicRightOfWayTemplate.district,
              }
            : data.publicRightOfWayTemplate,
          scoEsuTemplate: data.scoEsuTemplate,
          scoMaintenanceResponsibilityTemplate: settingsContext.isScottish
            ? {
                pkId: data.scoMaintenanceResponsibilityTemplate.pkId,
                templatePkId: data.scoMaintenanceResponsibilityTemplate.templatePkId,
                streetStatus:
                  editVariant === "maintenanceResponsibility"
                    ? updatedData.maintenanceResponsibilityStreetStatus
                    : data.scoMaintenanceResponsibilityTemplate.streetStatus,
                custodianCode:
                  editVariant === "maintenanceResponsibility"
                    ? updatedData.maintenanceResponsibilityCustodian
                    : data.scoMaintenanceResponsibilityTemplate.custodianCode,
                maintainingAuthorityCode:
                  editVariant === "maintenanceResponsibility"
                    ? updatedData.maintenanceResponsibilityAuthority
                    : data.scoMaintenanceResponsibilityTemplate.maintainingAuthorityCode,
              }
            : data.scoMaintenanceResponsibilityTemplate,
          scoReinstatementCategoryTemplate: settingsContext.isScottish
            ? {
                pkId: data.scoReinstatementCategoryTemplate.pkId,
                templatePkId: data.scoReinstatementCategoryTemplate.templatePkId,
                reinstatementCategory:
                  editVariant === "reinstatementCategory"
                    ? updatedData.reinstatementCategoryReinstatementCategory
                    : data.scoReinstatementCategoryTemplate.reinstatementCategory,
                custodianCode:
                  editVariant === "reinstatementCategory"
                    ? updatedData.reinstatementCategoryCustodian
                    : data.scoReinstatementCategoryTemplate.custodianCode,
                reinstatementAuthorityCode:
                  editVariant === "reinstatementCategory"
                    ? updatedData.reinstatementCategoryAuthority
                    : data.scoReinstatementCategoryTemplate.reinstatementAuthorityCode,
              }
            : data.scoReinstatementCategoryTemplate,
          scoSpecialDesignationTemplate: settingsContext.isScottish
            ? {
                pkId: data.scoSpecialDesignationTemplate.pkId,
                templatePkId: data.scoSpecialDesignationTemplate.templatePkId,
                specialDesignation:
                  editVariant === "osSpecialDesignation"
                    ? updatedData.osSpecialDesignationSpecialDesignation
                    : data.scoSpecialDesignationTemplate.specialDesignation,
                custodianCode:
                  editVariant === "osSpecialDesignation"
                    ? updatedData.osSpecialDesignationCustodian
                    : data.scoSpecialDesignationTemplate.custodianCode,
                authorityCode:
                  editVariant === "osSpecialDesignation"
                    ? updatedData.osSpecialDesignationAuthority
                    : data.scoSpecialDesignationTemplate.authorityCode,
              }
            : data.scoSpecialDesignationTemplate,
          specialDesignationTemplate: !settingsContext.isScottish
            ? {
                PkId: data.specialDesignationTemplate.pkId,
                templatePkId: data.specialDesignationTemplate.templatePkId,
                type:
                  editVariant === "specialDesignation"
                    ? updatedData.specialDesigType
                    : data.specialDesignationTemplate.type,
                swaOrgRefConsultant:
                  editVariant === "specialDesignation"
                    ? updatedData.specialDesigOrganisation
                    : data.specialDesignationTemplate.swaOrgRefConsultant,
                districtRefConsultant:
                  editVariant === "specialDesignation"
                    ? updatedData.specialDesigDistrict
                    : data.specialDesignationTemplate.districtRefConsultant,
                specialDesigPeriodicityCode:
                  editVariant === "specialDesignation"
                    ? updatedData.specialDesigPeriodicity
                    : data.specialDesignationTemplate.specialDesigPeriodicityCode,
              }
            : data.specialDesignationTemplate,
          streetTemplate: data.streetTemplate,
        };

        // if (process.env.NODE_ENV === "development")
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
                  console.error("[400 ERROR] Updating ASD template", body.errors);
                });
                break;

              case 401:
                res.json().then((body) => {
                  console.error("[401 ERROR] Updating ASD template", body);
                });
                break;

              case 500:
                console.error("[500 ERROR] Updating ASD template", res);
                break;

              default:
                console.error(`[${res.status} ERROR] handleDoneEditTemplate - Updating ASD template.`, res);
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
      setMaintenanceResponsibilityStreetStatus(data.scoMaintenanceResponsibilityTemplate.streetStatus);
      setMaintenanceResponsibilityCustodian(data.scoMaintenanceResponsibilityTemplate.custodianCode);
      setMaintenanceResponsibilityAuthority(data.scoMaintenanceResponsibilityTemplate.maintainingAuthorityCode);
      setReinstatementCategoryReinstatementCategory(data.scoReinstatementCategoryTemplate.reinstatementCategory);
      setReinstatementCategoryCustodian(data.scoReinstatementCategoryTemplate.custodianCode);
      setReinstatementCategoryAuthority(data.scoReinstatementCategoryTemplate.reinstatementAuthorityCode);
      setOsSpecialDesignationSpecialDesignation(data.scoSpecialDesignationTemplate.specialDesignation);
      setOsSpecialDesignationCustodian(data.scoSpecialDesignationTemplate.custodianCode);
      setOsSpecialDesignationAuthority(data.scoSpecialDesignationTemplate.authorityCode);
      setInterestStreetStatus(data.interestTemplate.streetStatus);
      setInterestOrganisation(data.interestTemplate.swaOrgRefAuthority);
      setInterestType(data.interestTemplate.interestType);
      setInterestDistrict(data.interestTemplate.districtRefAuthority);
      setInterestMaintainingOrganisation(data.interestTemplate.swaOrgRefMaintaining);
      setConstructionType(data.constructionTemplate.constructionType);
      setConstructionReinstatementType(data.constructionTemplate.reinstatementTypeCode);
      setConstructionAggregateAbrasionValue(data.constructionTemplate.aggregateAbrasionValue);
      setConstructionPolishedStoneValue(data.constructionTemplate.polishedStoneValue);
      setConstructionOrganisation(data.constructionTemplate.swaOrgRefConsultant);
      setConstructionDistrict(data.constructionTemplate.districtRefConsultant);
      setSpecialDesigType(data.specialDesignationTemplate.type);
      setSpecialDesigOrganisation(data.specialDesignationTemplate.swaOrgRefConsultant);
      setSpecialDesigDistrict(data.specialDesignationTemplate.districtRefConsultant);
      setSpecialDesigPeriodicity(data.specialDesignationTemplate.specialDesigPeriodicityCode);
      setHwwDesignation(data.heightWidthWeightTemplate.hwwRestrictionCode);
      setHwwOrganisation(data.heightWidthWeightTemplate.swaOrgRefConsultant);
      setHwwDistrict(data.heightWidthWeightTemplate.districtRefConsultant);
      setProwDedication(data.publicRightOfWayTemplate.prowRights);
      setProwStatus(data.publicRightOfWayTemplate.status);
      setProwPedestrianAccess(data.publicRightOfWayTemplate.pedestrianAccess);
      setProwEquestrianAccess(data.publicRightOfWayTemplate.equestrianAccess);
      setProwNonMotorisedVehicleAccess(data.publicRightOfWayTemplate.nonMotVehicleAccess);
      setProwBicycleAccess(data.publicRightOfWayTemplate.bicycleAccess);
      setProwMotorisedVehicleAccess(data.publicRightOfWayTemplate.motVehicleAccess);
      setProwPromotedRoute(data.publicRightOfWayTemplate.promotedRoute);
      setProwAccessibleRoute(data.publicRightOfWayTemplate.accessibleRoute);
      setProwOrganisation(data.publicRightOfWayTemplate.organisation);
      setProwDistrict(data.publicRightOfWayTemplate.district);
    }
  }, [data]);

  return (
    <Box
      sx={{
        ml: theme.spacing(1),
        mr: theme.spacing(4),
        // my: theme.spacing(2),
      }}
    >
      <Stack direction="column" spacing={1}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, paddingLeft: theme.spacing(3) }}>ASD template</Typography>
        <Typography variant="body2" sx={{ paddingLeft: theme.spacing(3) }}>
          Set default lookup values for ASD records
        </Typography>
        <Grid
          container
          sx={{
            paddingRight: theme.spacing(3.5),
            overflowY: "auto",
          }}
          spacing={3}
        >
          {settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterMaintenanceResponsibility}
                onMouseLeave={doMouseLeaveMaintenanceResponsibility}
                raised={editMaintenanceResponsibility}
                sx={settingsCardStyle(editMaintenanceResponsibility)}
              >
                <CardActionArea onClick={doEditMaintenanceResponsibility}>
                  <CardContent sx={settingsCardContentStyle("os-asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editMaintenanceResponsibility)}>
                          Maintenance responsibility defaults
                        </Typography>
                        {editMaintenanceResponsibility && (
                          <Tooltip
                            title="Edit maintenance responsibility defaults"
                            placement="bottom"
                            sx={tooltipStyle}
                          >
                            <IconButton onClick={doEditMaintenanceResponsibility} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Street status</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getStreetStatus(maintenanceResponsibilityStreetStatus)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Custodian</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(maintenanceResponsibilityCustodian)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Authority</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(maintenanceResponsibilityAuthority)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterReinstatementCategory}
                onMouseLeave={doMouseLeaveReinstatementCategory}
                raised={editReinstatementCategory}
                sx={settingsCardStyle(editReinstatementCategory)}
              >
                <CardActionArea onClick={doEditReinstatementCategory}>
                  <CardContent sx={settingsCardContentStyle("os-asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editReinstatementCategory)}>
                          Reinstatement category defaults
                        </Typography>
                        {editReinstatementCategory && (
                          <Tooltip title="Edit reinstatement category defaults" placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={doEditReinstatementCategory} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Category</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getReinstatementType(reinstatementCategoryReinstatementCategory)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Custodian</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(reinstatementCategoryCustodian)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Authority</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(reinstatementCategoryAuthority)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterOsSpecialDesignation}
                onMouseLeave={doMouseLeaveOsSpecialDesignation}
                raised={editOsSpecialDesignation}
                sx={settingsCardStyle(editOsSpecialDesignation)}
              >
                <CardActionArea onClick={doEditOsSpecialDesignation}>
                  <CardContent sx={settingsCardContentStyle("os-asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editOsSpecialDesignation)}>
                          Special designation defaults
                        </Typography>
                        {editOsSpecialDesignation && (
                          <Tooltip title="Edit special designation defaults" placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={doEditOsSpecialDesignation} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Special designation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getSpecialDesignationType(osSpecialDesignationSpecialDesignation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Custodian</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(osSpecialDesignationCustodian)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Authority</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(osSpecialDesignationAuthority)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {!settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterInterest}
                onMouseLeave={doMouseLeaveInterest}
                raised={editInterest}
                sx={settingsCardStyle(editInterest)}
              >
                <CardActionArea onClick={doEditInterest}>
                  <CardContent sx={settingsCardContentStyle("asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editInterest)}>
                          Interested organisation defaults
                        </Typography>
                        {editInterest && (
                          <Tooltip title="Edit interest defaults" placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={doEditInterest} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Street status</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getStreetStatus(interestStreetStatus)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Interested organisation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(interestOrganisation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Interest type</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getInterestType(interestType)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">District</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getDistrict(interestOrganisation, interestDistrict, true)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Maintaining organisation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(interestMaintainingOrganisation)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {!settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterConstruction}
                onMouseLeave={doMouseLeaveConstruction}
                raised={editConstruction}
                sx={settingsCardStyle(editConstruction)}
              >
                <CardActionArea onClick={doEditConstruction}>
                  <CardContent sx={settingsCardContentStyle("asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editConstruction)}>
                          Construction defaults
                        </Typography>
                        {editConstruction && (
                          <Tooltip title="Edit construction defaults" placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={doEditConstruction} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Construction type</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getConstructionType(constructionType)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Reinstatement type</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getReinstatementType(constructionReinstatementType)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Aggregate abrasion value</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getAggregateAbrasionValue(
                              constructionAggregateAbrasionValue,
                              constructionReinstatementType
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Polished stone value</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getPolishedStoneValue(constructionPolishedStoneValue, constructionReinstatementType)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Organisation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(constructionOrganisation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">District</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getDistrict(constructionOrganisation, constructionDistrict)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {!settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterSpecialDesignation}
                onMouseLeave={doMouseLeaveSpecialDesignation}
                raised={editSpecialDesignation}
                sx={settingsCardStyle(editSpecialDesignation)}
              >
                <CardActionArea onClick={doEditSpecialDesignation}>
                  <CardContent sx={settingsCardContentStyle("asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editSpecialDesignation)}>
                          Special designation defaults
                        </Typography>
                        {editSpecialDesignation && (
                          <Tooltip title="Edit special designation defaults" placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={doEditSpecialDesignation} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Type</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getSpecialDesignationType(specialDesigType)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Organisation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(specialDesigOrganisation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">District</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getDistrict(specialDesigOrganisation, specialDesigDistrict)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Periodicity</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getSpecialDesignationPeriodicity(specialDesigPeriodicity)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {!settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterHww}
                onMouseLeave={doMouseLeaveHww}
                raised={editHww}
                sx={settingsCardStyle(editHww)}
              >
                <CardActionArea onClick={doEditHww}>
                  <CardContent sx={settingsCardContentStyle("asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editHww)}>
                          Height, width & weight restriction defaults
                        </Typography>
                        {editHww && (
                          <Tooltip
                            title="Edit height, width & weight restriction defaults"
                            placement="bottom"
                            sx={tooltipStyle}
                          >
                            <IconButton onClick={doEditHww} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Designation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getHwwDesignation(hwwDesignation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Organisation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(hwwOrganisation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">District</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getDistrict(hwwOrganisation, hwwDistrict)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {!settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                onMouseEnter={doMouseEnterPRoW}
                onMouseLeave={doMouseLeavePRoW}
                raised={editPRoW}
                sx={settingsCardStyle(editPRoW)}
              >
                <CardActionArea onClick={doEditPRoW}>
                  <CardContent sx={settingsCardContentStyle("asd")}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" sx={getTitleStyle(editPRoW)}>
                          Public right of way defaults
                        </Typography>
                        {editPRoW && (
                          <Tooltip title="Edit public right of way defaults" placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={doEditPRoW} size="small">
                              <EditIcon sx={ActionIconStyle(true)} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                      <Grid container rowSpacing={1}>
                        <Grid item xs={3}>
                          <Typography variant="body2">Dedication</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getProwDedication(prowDedication)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Status</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getProwStatus(prowStatus)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Access</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Stack direction="row" spacing={1}>
                            <DirectionsWalkIcon fontSize="small" sx={getTemplateIconStyle(prowPedestrianAccess)} />
                            <EquestrianIcon fontSize="small" sx={getTemplateIconStyle(prowEquestrianAccess)} />
                            <SkateboardingIcon
                              fontSize="small"
                              sx={getTemplateIconStyle(prowNonMotorisedVehicleAccess)}
                            />
                            <DirectionsBikeIcon fontSize="small" sx={getTemplateIconStyle(prowBicycleAccess)} />
                            <DirectionsCarIcon fontSize="small" sx={getTemplateIconStyle(prowMotorisedVehicleAccess)} />
                          </Stack>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Promoted route</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {getCheck(prowPromotedRoute)}
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Accessible route</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          {getCheck(prowAccessibleRoute)}
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">Organisation</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getOrganisation(prowOrganisation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">District</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getDistrict(prowOrganisation, prowDistrict)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
        </Grid>
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

export default AsdTemplateTab;
