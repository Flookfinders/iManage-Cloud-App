//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Edit template dialog
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   31.03.23 Sean Flook          WI40652 For template and wizard do not include Historic or Rejected logical status.
//    003   06.04.23 Sean Flook          WI40675 Correctly call FilteredBLPUState.
//    004   27.06.23 Sean Flook          WI40738 Renamed title when editing a title.
//    005   23.08.23 Sean Flook        IMANN-159 Corrected field names.
//    006   22.09.23 Sean Flook                  Changes required to handle Scottish classifications.
//    007   06.10.23 Sean Flook                  Added some error trapping and use colour variables.
//    008   03.11.23 Sean Flook                  Added hyphen to one-way.
//    009   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//    010   24.11.23 Joel Benford                Show dropdowns for LPI official/postal in Scotland
//    011   30.11.23 Sean Flook                  Changes required to handle Scottish authorities.
//    012   05.12.23 Joel Benford                Add Scottish classification dialogue
//    013   05.01.24 Sean Flook                  Use CSS shortcuts.
//    014   08.01.24 Joel Benford                Classification and sub locality
//    015   10.01.24 Sean Flook                  Fix warnings.
//    016   11.01.24 Sean Flook                  Fix warnings.
//    017   16.01.23 Joel Benford                OS/GP level split
//    018   16.01.24 Sean Flook                  Changes required to fix warnings.
//    019   30.01.24 Sean Flook                  Added ESU tolerance for GeoPlace.
//    020   05.02.24 Sean Flook                  Further filter for maintaining organisation.
//    021   01.03.24 Joel Benford      IMANN-330 Stop defaulting interested/maintaining auth on open.
//    022   27.02.24 Sean Flook            MUL15 Fixed dialog title styling.
//    023   01.03.24 Joel Benford                Restrict Districts to suit organisation
//    024   27.03.24 Sean Flook                  Further changes required to fix warnings and added ADSDialogTitle.
//    025   09.04.24 Sean Flook        IMANN-376 Allow lookups to be added on the fly.
//    026   09.04.24 Sean Flook        IMANN-376 Removed for administrative area.
//    027   17.04.24 Joshua McCormick  IMANN-277 Added displayCharactersLeft to Scheme field.
//    028   23.04.24 Joshua McCormick  IMANN-277 Added displayCharactersLeft to ADSTextControl fields
//    029   08.05.24 Sean Flook        IMANN-447 Added exclude from export and site visit to the options of fields that can be edited.
//    030   22.05.24 Sean Flook        IMANN-473 Corrected label for Scottish authorities.
//    031   23.04.24 Joshua McCormick  IMANN-94  Edit Dialog title from Edit Title to Rename Template
//    032   19.06.24 Joshua McCormick  IMANN-503 BLPU Level field max characters 30 and removed up down counter.
//    033   19.06.24 Joshua McCormick  IMANN-503 BLPU Level AdsNumberControl type set to text to hide up down
//    034   19.06.24 Joshua McCormick  IMANN-503 BLPU Level removed type prop
//    035   19.06.24 Joshua McCormick  IMANN-503 BLPU Level max set to 99.9
//    036   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    037   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    038   08.08.24 Sean Flook        IMANN-911 Corrected typo.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    039   01.10.24 Sean Flook        IMANN-665 Changed Designation to Type for HWW.
//    040   31.10.24 Sean Flook       IMANN-1012 Changes required for the plot to postal wizard.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    041   25.11.24 Sean Flook       IMANN-1085 Added divider between Provenance and Notes for wizardOther.
//endregion Version 1.0.2.0
//region Version 1.0.5.0
//    042   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    043   14.03.25 Sean Flook       IMANN-1703 Sort the list of cross references.
//    044   14.03.25 Sean Flook       IMANN-1137 Ensure the BLPU state date is set when the BLPU state is 0.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Button,
  Grid2,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSProwAccessControl from "../components/ADSProwAccessControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import AddLookupDialog from "../dialogs/AddLookupDialog";

import { GetLookupLabel, addLookup, filteredLookup, getLookupVariantString } from "../utils/HelperUtils";
import {
  FilteredBLPULogicalStatus,
  FilteredRepresentativePointCode,
  FilteredBLPUState,
  FilteredLPILogicalStatus,
} from "../utils/PropertyUtils";
import { FilteredStreetType, filteredOperationalDistricts } from "../utils/StreetUtils";

import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";
import BLPUProvenance from "./../data/BLPUProvenance";
import OfficialAddress from "../data/OfficialAddress";
import PostallyAddressable from "../data/PostallyAddressable";
import StreetState from "../data/StreetState";
import StreetClassification from "../data/StreetClassification";
import StreetSurface from "../data/StreetSurface";
import RoadStatusCode from "../data/RoadStatusCode";
import SwaOrgRef from "../data/SwaOrgRef";
import ESUDirectionCode from "../data/ESUDirectionCode";
import ESUTolerance from "../data/ESUTolerance";
import ESUState from "../data/ESUState";
import ESUClassification from "../data/ESUClassification";
import OneWayExemptionType from "../data/OneWayExemptionType";
import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import HighwayDedicationCode from "../data/HighwayDedicationCode";
import InterestType from "../data/InterestType";
import ConstructionType from "../data/ConstructionType";
import AggregateAbrasionValue from "../data/AggregateAbrasionValue";
import PolishedStoneValue from "../data/PolishedStoneValue";
import SpecialDesignationPeriodicity from "./../data/SpecialDesignationPeriodicity";
import SpecialDesignationCode from "./../data/SpecialDesignationCode";
import ReinstatementType from "../data/ReinstatementType";
import HWWDesignationCode from "./../data/HWWDesignationCode";
import PRoWDedicationCode from "../data/PRoWDedicationCode";
import PRoWStatusCode from "../data/PRoWStatusCode";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import {
  PRoWIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";

import { adsBlueA, adsMidGreyA, adsDarkPink, adsDarkGreen } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle, FormRowStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditTemplateDialog.propTypes = {
  variant: PropTypes.oneOf([
    "title",
    "description",
    "blpu",
    "lpi",
    "classification",
    "other",
    "street",
    "esu",
    "owe",
    "hd",
    "maintenanceResponsibility",
    "reinstatementCategory",
    "osSpecialDesignation",
    "interest",
    "construction",
    "specialDesignation",
    "hww",
    "prow",
    "blpuWizard",
    "lpiWizard",
    "classificationWizard",
    "otherWizard",
    "plotBlpuWizard",
    "plotLpiWizard",
    "plotOtherWizard",
  ]),
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditTemplateDialog({ variant, isOpen, data, onDone, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [showDialog, setShowDialog] = useState(false);
  const [templateType, setTemplateType] = useState("unknown");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blpuStatus, setBlpuStatus] = useState(null);
  const [blpuRpc, setBlpuRpc] = useState(null);
  const [blpuState, setBlpuState] = useState(null);
  const [blpuStateDate, setBlpuStateDate] = useState(null);
  const [blpuClassification, setBlpuClassification] = useState(null);
  const [blpuStartDate, setBlpuStartDate] = useState(null);
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [siteVisit, setSiteVisit] = useState(false);
  const [level, setLevel] = useState(""); // numeric on BLPU for OS, string on LPI for GP
  const [existingLpiStatus, setExistingLpiStatus] = useState(null);
  const [lpiStatus, setLpiStatus] = useState(null);
  const [lpiPostcode, setLpiPostcode] = useState(null);
  const [lpiPostTown, setLpiPostTown] = useState(null);
  const [lpiSubLocality, setLpiSubLocality] = useState(null);
  const [lpiOfficialAddress, setLpiOfficialAddress] = useState(null);
  const [lpiPostalAddress, setLpiPostalAddress] = useState(null);
  const [lpiStartDate, setLpiStartDate] = useState(null);
  const [classificationScheme, setClassificationScheme] = useState("");
  const [classificationStartDate, setClassificationStartDate] = useState(null);
  const [otherCrossRefSource, setOtherCrossRefSource] = useState(null);
  const [otherProvenance, setOtherProvenance] = useState(null);
  const [otherProvenanceStartDate, setOtherProvenanceStartDate] = useState(null);
  const [otherNote, setOtherNote] = useState("");
  const [createGaelic, setCreateGaelic] = useState(false);
  const [streetType, setStreetType] = useState(null);
  const [streetState, setStreetState] = useState(null);
  const [streetLocality, setStreetLocality] = useState(null);
  const [streetTown, setStreetTown] = useState(null);
  const [streetIsland, setStreetIsland] = useState(null);
  const [streetAdminArea, setStreetAdminArea] = useState(null);
  const [streetClassification, setStreetClassification] = useState(null);
  const [streetSurface, setStreetSurface] = useState(null);
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

  const [subLocalityLookup, setSubLocalityLookup] = useState([]);
  const [postTownLookup, setPostTownLookup] = useState([]);
  const [postcodeLookup, setPostcodeLookup] = useState([]);

  const [prowHover, setProwHover] = useState(false);
  const [ncrHover, setNcrHover] = useState(false);
  const [quietRouteHover, setQuietRouteHover] = useState(false);
  const [obstructionHover, setObstructionHover] = useState(false);
  const [planningOrderHover, setPlanningOrderHover] = useState(false);
  const [vehiclesProhibitedHover, setVehiclesProhibitedHover] = useState(false);

  const [errors, setErrors] = useState(null);
  const [blpuStatusError, setBlpuStatusError] = useState(null);
  const [blpuRpcError, setBlpuRpcError] = useState(null);
  const [blpuStateError, setBlpuStateError] = useState(null);
  const [blpuStateDateError, setBlpuStateDateError] = useState(null);
  const [blpuClassificationError, setBlpuClassificationError] = useState(null);
  const [excludeFromExportError, setExcludeFromExportError] = useState(null);
  const [siteVisitError, setSiteVisitError] = useState(null);
  const [blpuStartDateError, setBlpuStartDateError] = useState(null);
  const [existingLpiStatusError, setExistingLpiStatusError] = useState(null);
  const [lpiStatusError, setLpiStatusError] = useState(null);
  const [lpiPostTownError, setLpiPostTownError] = useState(null);
  const [lpiPostcodeError, setLpiPostcodeError] = useState(null);
  const [lpiSubLocalityError, setLpiSubLocalityError] = useState(null);
  const [levelError, setLevelError] = useState(null);
  const [lpiOfficialAddressError, setLpiOfficialAddressError] = useState(null);
  const [lpiPostalAddressError, setLpiPostalAddressError] = useState(null);
  const [lpiStartDateError, setLpiStartDateError] = useState(null);
  const [classificationSchemeError, setClassificationSchemeError] = useState(null);
  const [classificationStartDateError, setClassificationStartDateError] = useState(null);
  const [otherProvenanceError, setOtherProvenanceError] = useState(null);
  const [otherProvenanceStartDateError, setOtherProvenanceStartDateError] = useState(null);
  const [otherNoteError, setOtherNoteError] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const [hasProperty, setHasProperty] = useState(false);

  const addResult = useRef(null);
  const currentVariant = useRef(null);

  /**
   * Event to handle the closing of the dialog.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Method to get the data that has been updated.
   *
   * @returns {object} The updated data.
   */
  const getUpdatedData = () => {
    switch (variant) {
      case "title":
        return { templateName: title };

      case "description":
        return { templateDescription: description };

      case "blpu":
        return {
          blpuLogicalStatus: blpuStatus,
          rpc: blpuRpc,
          state: blpuState,
          classification: blpuClassification,
          blpuLevel: level,
          excludeFromExport: excludeFromExport,
          siteVisit: siteVisit,
        };

      case "lpi":
        return {
          lpiLogicalStatus: lpiStatus,
          postTownRef: lpiPostTown,
          subLocalityRef: lpiSubLocality,
          lpiLevel: level,
          officialAddressMaker: lpiOfficialAddress,
          postallyAddressable: lpiPostalAddress,
        };

      case "classification":
        return {
          classification: blpuClassification,
          classificationScheme: classificationScheme,
        };

      case "other":
        return {
          source: otherCrossRefSource,
          provCode: otherProvenance,
          note: otherNote,
        };

      case "street":
        return {
          streetRefType: streetType,
          state: streetState,
          localityRef: streetLocality,
          townRef: streetTown,
          islandRef: streetIsland,
          adminAreaRef: streetAdminArea,
          classification: streetClassification,
          surface: streetSurface,
          streetExcludeFromExport: excludeFromExport,
        };

      case "esu":
        return {
          esuDirection: esuDirection,
          esuTolerance: esuTolerance,
          esuState: esuState,
          esuClassification: esuClassification,
        };

      case "owe":
        return { oweType: oweType, owePeriodicityCode: owePeriodicityCode };

      case "hd":
        return {
          hdCode: hdCode,
          hdPRoW: hdPRoW,
          hdNCR: hdNCR,
          hdQuietRoute: hdQuietRoute,
          hdObstruction: hdObstruction,
          hdPlanningOrder: hdPlanningOrder,
          hdVehiclesProhibited: hdVehiclesProhibited,
        };

      case "maintenanceResponsibility":
        return {
          maintenanceResponsibilityStreetStatus: maintenanceResponsibilityStreetStatus,
          maintenanceResponsibilityCustodian: maintenanceResponsibilityCustodian,
          maintenanceResponsibilityAuthority: maintenanceResponsibilityAuthority,
        };

      case "reinstatementCategory":
        return {
          reinstatementCategoryReinstatementCategory: reinstatementCategoryReinstatementCategory,
          reinstatementCategoryCustodian: reinstatementCategoryCustodian,
          reinstatementCategoryAuthority: reinstatementCategoryAuthority,
        };

      case "osSpecialDesignation":
        return {
          osSpecialDesignationSpecialDesignation: osSpecialDesignationSpecialDesignation,
          osSpecialDesignationCustodian: osSpecialDesignationCustodian,
          osSpecialDesignationAuthority: osSpecialDesignationAuthority,
        };

      case "interest":
        return {
          interestStreetStatus: interestStreetStatus,
          interestOrganisation: interestOrganisation,
          interestType: interestType,
          interestDistrict: interestDistrict,
          maintainingOrganisation: interestMaintainingOrganisation,
        };

      case "construction":
        return {
          constructionType: constructionType,
          reinstatementType: constructionReinstatementType,
          aggregateAbrasionValue: constructionAggregateAbrasionValue,
          polishedStoneValue: constructionPolishedStoneValue,
          constructionOrganisation: constructionOrganisation,
          constructionDistrict: constructionDistrict,
        };

      case "specialDesignation":
        return {
          specialDesigType: specialDesigType,
          specialDesigOrganisation: specialDesigOrganisation,
          specialDesigDistrict: specialDesigDistrict,
          specialDesigPeriodicity: specialDesigPeriodicity,
        };

      case "hww":
        return {
          hwwDesignation: hwwDesignation,
          hwwOrganisation: hwwOrganisation,
          hwwDistrict: hwwDistrict,
        };

      case "prow":
        return {
          prowDedication: prowDedication,
          prowStatus: prowStatus,
          pedestrianAccess: prowPedestrianAccess,
          equestrianAccess: prowEquestrianAccess,
          nonMotorisedVehicleAccess: prowNonMotorisedVehicleAccess,
          bicycleAccess: prowBicycleAccess,
          motorisedVehicleAccess: prowMotorisedVehicleAccess,
          promotedRoute: prowPromotedRoute,
          accessibleRoute: prowAccessibleRoute,
          prowOrganisation: prowOrganisation,
          prowDistrict: prowDistrict,
        };

      case "blpuWizard":
        if (settingsContext.isScottish)
          return {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            blpuLevel: level,
            excludeFromExport: excludeFromExport,
            siteVisit: siteVisit,
            startDate: blpuStartDate,
            errors: errors,
          };
        else
          return {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            classification: blpuClassification,
            excludeFromExport: excludeFromExport,
            siteVisit: siteVisit,
            startDate: blpuStartDate,
            errors: errors,
          };

      case "lpiWizard":
        if (settingsContext.isScottish)
          return {
            lpiLogicalStatus: lpiStatus,
            officialAddressMaker: lpiOfficialAddress,
            postallyAddressable: lpiPostalAddress,
            startDate: lpiStartDate,
            errors: errors,
          };
        else
          return {
            lpiLogicalStatus: lpiStatus,
            lpiLevel: level,
            officialAddressMaker: lpiOfficialAddress,
            postallyAddressable: lpiPostalAddress,
            startDate: lpiStartDate,
            errors: errors,
          };

      case "classificationWizard":
        return {
          classification: blpuClassification,
          classificationScheme: classificationScheme,
          startDate: classificationStartDate,
          errors: errors,
        };

      case "otherWizard":
        return {
          provCode: otherProvenance,
          provStartDate: otherProvenanceStartDate,
          note: otherNote,
          errors: errors,
        };

      case "plotBlpuWizard":
        if (settingsContext.isScottish)
          return {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            blpuLevel: level,
            errors: errors,
          };
        else
          return {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            errors: errors,
          };

      case "plotLpiWizard":
        if (settingsContext.isScottish)
          return {
            existingLpiLogicalStatus: existingLpiStatus,
            newLpiLogicalStatus: lpiStatus,
            postcodeRef: lpiPostcode,
            postTownRef: lpiPostTown,
            subLocalityRef: lpiSubLocality,
            officialAddressMaker: lpiOfficialAddress,
            postallyAddressable: lpiPostalAddress,
            startDate: lpiStartDate,
            errors: errors,
          };
        else
          return {
            existingLpiLogicalStatus: existingLpiStatus,
            newLpiLogicalStatus: lpiStatus,
            postcodeRef: lpiPostcode,
            postTownRef: lpiPostTown,
            lpiLevel: level,
            officialAddressMaker: lpiOfficialAddress,
            postallyAddressable: lpiPostalAddress,
            startDate: lpiStartDate,
            errors: errors,
          };

      case "plotOtherWizard":
        return settingsContext.isScottish
          ? {
              createGaelic: createGaelic,
              note: otherNote,
              errors: errors,
            }
          : {
              note: otherNote,
              errors: errors,
            };

      default:
        return null;
    }
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onDone) onDone(getUpdatedData());
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Method to update the errors.
   *
   * @param {string} updatedField The name of the field that was updated.
   */
  const updateErrors = (updatedField) => {
    if (errors) setErrors(errors.filter((x) => x.field.toLowerCase() !== updatedField.toLowerCase()));
  };

  /**
   * Event to handle when the title is changed.
   *
   * @param {string} newValue The new title.
   */
  const handleTitleChangeEvent = (newValue) => {
    setTitle(newValue);
  };

  /**
   * Event to handle when the description is changed.
   *
   * @param {string} newValue The new description.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
  };

  /**
   * Event to handle when the BLPU logical status is changed.
   *
   * @param {number} newValue The new BLPU logical status.
   */
  const handleBlpuStatusChangeEvent = (newValue) => {
    setBlpuStatus(newValue);
    if (variant === "blpuWizard" || variant === "plotBlpuWizard") {
      updateErrors("blpuStatus");
      setBlpuStatusError(null);
    }
  };

  /**
   * Event to handle when the BLPU RPC is changed.
   *
   * @param {number} newValue The new BLPU RPC.
   */
  const handleBlpuRpcChangeEvent = (newValue) => {
    setBlpuRpc(newValue);
    if (variant === "blpuWizard" || variant === "plotBlpuWizard") {
      updateErrors("rpc");
      setBlpuRpcError(null);
    }
  };

  /**
   * Event to handle when the BLPU state is changed.
   *
   * @param {number} newValue The new BLPU state.
   */
  const handleBlpuStateChangeEvent = (newValue) => {
    setBlpuState(newValue);
    if (variant === "blpuWizard" || variant === "plotBlpuWizard") {
      if ((newValue || newValue === 0) && !blpuStateDate) setBlpuStateDate(new Date());
      updateErrors("state");
      setBlpuStateError(null);
    }
  };

  /**
   * Event to handle when the BLPU state date is changed.
   *
   * @param {Date} newValue The new BLPU state date.
   */
  const handleBlpuStateDateChangeEvent = (newValue) => {
    setBlpuStateDate(newValue);
    if (variant === "blpuWizard" || variant === "plotBlpuWizard") {
      updateErrors("stateDate");
      setBlpuStateDateError(null);
    }
  };

  /**
   * Event to handle when the BLPU classification is changed (GeoPlace only).
   *
   * @param {string} newValue The new BLPU classification.
   */
  const handleBlpuClassificationChangeEvent = (newValue) => {
    setBlpuClassification(newValue);
    if (variant === "blpuWizard" || variant === "classificationWizard") {
      updateErrors("classification");
      setBlpuClassificationError(null);
    }
  };

  /**
   * Event to handle when the exclude from export is changed.
   */
  const handleExcludeFromExportChangeEvent = () => {
    setExcludeFromExport(!excludeFromExport);
    if (variant === "blpuWizard") {
      updateErrors("excludeFromExport");
      setExcludeFromExportError(null);
    }
  };

  /**
   * Event to handle when the BLPU site visit is changed.
   */
  const handleBlpuSiteVisitChangeEvent = () => {
    setSiteVisit(!siteVisit);
    if (variant === "blpuWizard") {
      updateErrors("siteVisit");
      setSiteVisitError(null);
    }
  };

  /**
   * Event to handle when the BLPU start date is changed.
   *
   * @param {Date} newValue The new BLPU start date.
   */
  const handleBlpuStartDateChangeEvent = (newValue) => {
    setBlpuStartDate(newValue);
    if (variant === "blpuWizard" || variant === "plotBlpuWizard") {
      updateErrors("blpuStartDate");
      setBlpuStartDateError(null);
    }
  };

  /**
   * Event to handle when the existing LPI logical status is changed.
   *
   * @param {number} newValue The new existing LPI logical status.
   */
  const handleExistingLpiStatusChangeEvent = (newValue) => {
    setExistingLpiStatus(newValue);
    if (variant === "plotLpiWizard") {
      updateErrors("existingLpiStatus");
      setExistingLpiStatusError(null);
    }
  };

  /**
   * Event to handle when the LPI logical status is changed.
   *
   * @param {number} newValue The new LPI logical status.
   */
  const handleLpiStatusChangeEvent = (newValue) => {
    setLpiStatus(newValue);
    if (variant === "lpiWizard" || variant === "plotLpiWizard") {
      updateErrors("lpiStatus");
      setLpiStatusError(null);
    }
  };

  /**
   * Event to handle when the postcode is changed.
   *
   * @param {number} newValue The new postcode.
   */
  const handleLpiPostcodeChangeEvent = (newValue) => {
    setLpiPostcode(newValue);
  };

  /**
   * Event to handle when a new postcode is added.
   */
  const handleAddPostcodeEvent = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the post town is changed.
   *
   * @param {number} newValue The new post town.
   */
  const handleLpiPostTownChangeEvent = (newValue) => {
    setLpiPostTown(newValue);
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
   * @param {number} newValue The new sub-locality.
   */
  const handleLpiSubLocalityChangeEvent = (newValue) => {
    setLpiSubLocality(newValue);
  };

  /**
   * Event to handle when a new sub-locality is added.
   */
  const handleAddSubLocalityEvent = () => {
    setLookupType("subLocality");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the level is changed.
   *
   * @param {number|string} newValue The new level.
   */
  const handleLevelChangeEvent = (newValue) => {
    setLevel(newValue);
    if (
      variant === "lpiWizard" ||
      variant === "blpuWizard" ||
      variant === "plotBlpuWizard" ||
      variant === "plotLpiWizard"
    ) {
      updateErrors("level");
      setLevelError(null);
    }
  };

  /**
   * Event to handle when the official address is changed.
   *
   * @param {string} newValue The new official address.
   */
  const handleLpiOfficialAddressChangeEvent = (newValue) => {
    setLpiOfficialAddress(newValue);
    if (variant === "lpiWizard" || variant === "plotLpiWizard") {
      updateErrors("officialAddress");
      setLpiOfficialAddressError(null);
    }
  };

  /**
   * Event to handle when the postally addressable is changed.
   *
   * @param {string} newValue The new postally addressable.
   */
  const handleLpiPostalAddressChangeEvent = (newValue) => {
    setLpiPostalAddress(newValue);
    if (variant === "lpiWizard" || variant === "plotLpiWizard") {
      updateErrors("postalAddress");
      setLpiPostalAddressError(null);
    }
  };

  /**
   * Event to handle when the LPI start date is changed.
   *
   * @param {Date} newValue The new LPI start date.
   */
  const handleLpiStartDateChangeEvent = (newValue) => {
    setLpiStartDate(newValue);
    if (variant === "lpiWizard" || variant === "plotLpiWizard") {
      updateErrors("lpiStartDate");
      setLpiStartDateError(null);
    }
  };

  /**
   * Event to handle when the classification scheme is changed.
   *
   * @param {string} newValue The new classification scheme.
   */
  const handleClassificationSchemeChangeEvent = (newValue) => {
    setClassificationScheme(newValue);
    if (variant === "classificationWizard") {
      updateErrors("classificationScheme");
      setClassificationSchemeError(null);
    }
  };

  /**
   * Event to handle when the classification start date is changed.
   *
   * @param {Date} newValue The new LPI start date.
   */
  const handleClassificationStartDateChangeEvent = (newValue) => {
    setClassificationStartDate(newValue);
    if (variant === "classificationWizard") {
      updateErrors("classificationStartDate");
      setClassificationStartDateError(null);
    }
  };

  /**
   * Event to handle when the cross reference source is changed.
   *
   * @param {number} newValue The new cross reference source.
   */
  const handleOtherCrossRefSourceChangeEvent = (newValue) => {
    setOtherCrossRefSource(newValue);
  };

  /**
   * Event to handle when the provenance is changed.
   *
   * @param {string} newValue The new provenance.
   */
  const handleOtherProvenanceChangeEvent = (newValue) => {
    setOtherProvenance(newValue);
    if (variant === "otherWizard") {
      if (newValue && !otherProvenanceStartDate) setOtherProvenanceStartDate(new Date());
      updateErrors("provenance");
      setOtherProvenanceError(null);
    }
  };

  /**
   * Event to handle when the provenance start date is changed.
   *
   * @param {Date} newValue The new provenance start date.
   */
  const handleOtherProvenanceStartDateChangeEvent = (newValue) => {
    setOtherProvenanceStartDate(newValue);
    if (variant === "otherWizard") {
      updateErrors("provenanceStartDate");
      setOtherProvenanceStartDateError(null);
    }
  };

  /**
   * Event to handle when the create Gaelic flag changes.
   *
   * @param {Boolean} newValue The new create Gaelic flag.
   */
  const handleCreateGaelicChangeEvent = (newValue) => {
    setCreateGaelic(newValue);
  };

  /**
   * Event to handle when the note is changed.
   *
   * @param {string} newValue The new note.
   */
  const handleOtherNoteChangeEvent = (newValue) => {
    setOtherNote(newValue);
    if (variant === "otherWizard" || variant === "plotOtherWizard") {
      updateErrors("note");
      setOtherNoteError(null);
    }
  };

  /**
   * Event to handle when the street type is changed.
   *
   * @param {number} newValue The new street type.
   */
  const handleStreetTypeChangeEvent = (newValue) => {
    setStreetType(newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number} newValue The new state.
   */
  const handleStateChangeEvent = (newValue) => {
    setStreetState(newValue);
  };

  /**
   * Event to handle when the locality is changed.
   *
   * @param {number} newValue The new locality.
   */
  const handleLocalityChangeEvent = (newValue) => {
    setStreetLocality(newValue);
  };

  /**
   * Event to handle when a new locality is added.
   */
  const handleAddLocalityEvent = () => {
    setLookupType("locality");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the town is changed.
   *
   * @param {number} newValue The new town.
   */
  const handleTownChangeEvent = (newValue) => {
    setStreetTown(newValue);
  };

  /**
   * Event to handle when a new town is added.
   */
  const handleAddTownEvent = () => {
    setLookupType("town");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the island is changed.
   *
   * @param {number} newValue The new island.
   */
  const handleIslandChangeEvent = (newValue) => {
    setStreetIsland(newValue);
  };

  /**
   * Event to handle when a new island is added.
   */
  const handleAddIslandEvent = () => {
    setLookupType("island");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the administrative area is changed.
   *
   * @param {number} newValue The new administrative area.
   */
  const handleAdministrativeAreaChangeEvent = (newValue) => {
    setStreetAdminArea(newValue);
  };

  /**
   * Event to handle when the street classification is changed (GeoPlace only).
   *
   * @param {number} newValue The new street classification.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setStreetClassification(newValue);
  };

  /**
   * Event to handle when the surface is changed (GeoPlace only).
   *
   * @param {number} newValue The new surface.
   */
  const handleSurfaceChangeEvent = (newValue) => {
    setStreetSurface(newValue);
  };

  /**
   * Event to handle when the direction is changed (GeoPlace only).
   *
   * @param {number} newValue The new direction.
   */
  const handleDirectionChangeEvent = (newValue) => {
    setEsuDirection(newValue);
  };

  /**
   * Event to handle when the tolerance is changed (GeoPlace only).
   *
   * @param {number} newValue The new tolerance.
   */
  const handleToleranceChangeEvent = (newValue) => {
    setEsuTolerance(newValue);
  };

  /**
   * Event to handle when the ESU state is changed (OneScotland only).
   *
   * @param {number} newValue The new ESU state.
   */
  const handleEsuStateChangeEvent = (newValue) => {
    setEsuState(newValue);
  };

  /**
   * Event to handle when the ESU classification is changed (OneScotland only).
   *
   * @param {number} newValue The new ESU classification.
   */
  const handleEsuClassificationChangeEvent = (newValue) => {
    setEsuClassification(newValue);
  };

  /**
   * Event to handle when the one-way exemption type is changed (GeoPlace only).
   *
   * @param {number} newValue The new one-way exemption type.
   */
  const handleOneWayExemptionTypeChangeEvent = (newValue) => {
    setOweType(newValue);
  };

  /**
   * Event to handle when the one-way exemption periodicity is changed (GeoPlace only).
   *
   * @param {number} newValue The new one-way exemption periodicity.
   */
  const handlePeriodicityChangeEvent = (newValue) => {
    setOwePeriodicityCode(newValue);
  };

  /**
   * Event to handle when the highway dedication code is changed (GeoPlace only).
   *
   * @param {number} newValue The new highway dedication code.
   */
  const handleHighwayDedicationCodeChangeEvent = (newValue) => {
    setHdCode(newValue);
  };

  /**
   * Event to handle when the public rights of way is changed (GeoPlace only).
   *
   * @param {number} newValue The new public rights of way.
   */
  const handleProwChangeEvent = (newValue) => {
    setHdPRoW(newValue);
  };

  /**
   * Event to handle when the NCR is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new NCR.
   */
  const handleNcrChangeEvent = (newValue) => {
    setHdNCR(newValue);
  };

  /**
   * Event to handle when the quiet route is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new quiet route.
   */
  const handleQuietRouteChangeEvent = (newValue) => {
    setHdQuietRoute(newValue);
  };

  /**
   * Event to handle when the obstruction is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new obstruction.
   */
  const handleObstructionChangeEvent = (newValue) => {
    setHdObstruction(newValue);
  };

  /**
   * Event to handle when the planning order is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new planning order.
   */
  const handlePlanningOrderChangeEvent = (newValue) => {
    setHdPlanningOrder(newValue);
  };

  /**
   * Event to handle when the vehicles prohibited is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new vehicles prohibited.
   */
  const handleVehiclesProhibitedChangeEvent = (newValue) => {
    setHdVehiclesProhibited(newValue);
  };

  /**
   * Event to handle when the maintenance responsibility street status is changed (OneScotland only).
   *
   * @param {number} newValue The new maintenance responsibility street status.
   */
  const handleMaintenanceResponsibilityStreetStatusChangeEvent = (newValue) => {
    setMaintenanceResponsibilityStreetStatus(newValue);
  };

  /**
   * Event to handle when the maintenance responsibility custodian is changed (OneScotland only).
   *
   * @param {number} newValue The new maintenance responsibility custodian.
   */
  const handleMaintenanceResponsibilityCustodianChangeEvent = (newValue) => {
    setMaintenanceResponsibilityCustodian(newValue);
  };

  /**
   * Event to handle when the maintenance responsibility authority is changed (OneScotland only).
   *
   * @param {number} newValue The new maintenance responsibility authority.
   */
  const handleMaintenanceResponsibilityAuthorityChangeEvent = (newValue) => {
    setMaintenanceResponsibilityAuthority(newValue);
  };

  /**
   * Event to handle when the reinstatement category is changed (OneScotland only).
   *
   * @param {number} newValue The new reinstatement category.
   */
  const handleReinstatementCategoryReinstatementCategoryChangeEvent = (newValue) => {
    setReinstatementCategoryReinstatementCategory(newValue);
  };

  /**
   * Event to handle when the reinstatement category custodian is changed (OneScotland only).
   *
   * @param {number} newValue The new reinstatement category custodian.
   */
  const handleReinstatementCategoryCustodianChangeEvent = (newValue) => {
    setReinstatementCategoryCustodian(newValue);
  };

  /**
   * Event to handle when the reinstatement category authority is changed (OneScotland only).
   *
   * @param {number} newValue The new reinstatement category authority.
   */
  const handleReinstatementCategoryAuthorityChangeEvent = (newValue) => {
    setReinstatementCategoryAuthority(newValue);
  };

  /**
   * Event to handle when the special designation is changed (OneScotland only).
   *
   * @param {number} newValue The new special designation.
   */
  const handleOsSpecialDesignationSpecialDesignationChangeEvent = (newValue) => {
    setOsSpecialDesignationSpecialDesignation(newValue);
  };

  /**
   * Event to handle when the special designation custodian is changed (OneScotland only).
   *
   * @param {number} newValue The new special designation custodian.
   */
  const handleOsSpecialDesignationCustodianChangeEvent = (newValue) => {
    setOsSpecialDesignationCustodian(newValue);
  };

  /**
   * Event to handle when the special designation authority is changed (OneScotland only).
   *
   * @param {number} newValue The new special designation authority.
   */
  const handleOsSpecialDesignationAuthorityChangeEvent = (newValue) => {
    setOsSpecialDesignationAuthority(newValue);
  };

  /**
   * Event to handle when the interest street status is changed (GeoPlace only).
   *
   * @param {number} newValue The new interest street status.
   */
  const handleInterestStreetStatusChangeEvent = (newValue) => {
    setInterestStreetStatus(newValue);
  };

  /**
   * Event to handle when the interest organisation is changed (GeoPlace only).
   *
   * @param {number} newValue The new interest organisation.
   */
  const handleInterestOrganisationChangeEvent = (newValue) => {
    setInterestOrganisation(newValue);
    const possibleDistricts = filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, newValue);
    if (possibleDistricts.filter((x) => x.districtId === interestDistrict).length === 0) setInterestDistrict(null);
  };

  /**
   * Event to handle when the interest type is changed (GeoPlace only).
   *
   * @param {number} newValue The new interest type.
   */
  const handleInterestTypeChangeEvent = (newValue) => {
    setInterestType(newValue);
  };

  /**
   * Event to handle when the interest district is changed (GeoPlace only).
   *
   * @param {number} newValue The new interest district.
   */
  const handleInterestDistrictChangeEvent = (newValue) => {
    setInterestDistrict(newValue);
  };

  /**
   * Event to handle when the interest maintaining organisation is changed (GeoPlace only).
   *
   * @param {number} newValue The new interest maintaining organisation.
   */
  const handleInterestMaintainingOrganisationChangeEvent = (newValue) => {
    setInterestMaintainingOrganisation(newValue);
  };

  /**
   * Event to handle when the construction type is changed (GeoPlace only).
   *
   * @param {number} newValue The new construction type.
   */
  const handleConstructionTypeChangeEvent = (newValue) => {
    setConstructionType(newValue);
  };

  /**
   * Event to handle when the reinstatement type is changed (GeoPlace only).
   *
   * @param {number} newValue The new reinstatement type.
   */
  const handleReinstatementTypeChangeEvent = (newValue) => {
    setConstructionReinstatementType(newValue);
  };

  /**
   * Event to handle when the aggregate abrasion value is changed (GeoPlace only).
   *
   * @param {number} newValue The new aggregate abrasion value.
   */
  const handleAggregateAbrasionValueChangeEvent = (newValue) => {
    setConstructionAggregateAbrasionValue(newValue);
  };

  /**
   * Event to handle when the polished stone value is changed (GeoPlace only).
   *
   * @param {number} newValue The new polished stone value.
   */
  const handlePolishedStoneValueChangeEvent = (newValue) => {
    setConstructionPolishedStoneValue(newValue);
  };

  /**
   * Event to handle when the construction organisation is changed (GeoPlace only).
   *
   * @param {number} newValue The new construction organisation.
   */
  const handleConstructionOrganisationChangeEvent = (newValue) => {
    setConstructionOrganisation(newValue);
    const possibleDistricts = filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, newValue);
    if (possibleDistricts.filter((x) => x.districtId === constructionDistrict).length === 0)
      setConstructionDistrict(null);
  };

  /**
   * Event to handle when the construction district is changed (GeoPlace only).
   *
   * @param {number} newValue The new construction district.
   */
  const handleConstructionDistrictChangeEvent = (newValue) => {
    setConstructionDistrict(newValue);
  };

  /**
   * Event to handle when the special designation type is changed (GeoPlace only).
   *
   * @param {number} newValue The new special designation type.
   */
  const handleDesignationTypeChangeEvent = (newValue) => {
    setSpecialDesigType(newValue);
  };

  /**
   * Event to handle when the special designation organisation is changed (GeoPlace only).
   *
   * @param {number} newValue The new special designation organisation.
   */
  const handleSpecialDesigOrganisationChangeEvent = (newValue) => {
    setSpecialDesigOrganisation(newValue);
    const possibleDistricts = filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, newValue);
    if (possibleDistricts.filter((x) => x.districtId === specialDesigDistrict).length === 0)
      setSpecialDesigDistrict(null);
  };

  /**
   * Event to handle when the special designation district is changed (GeoPlace only).
   *
   * @param {number} newValue The new special designation district.
   */
  const handleSpecialDesigDistrictChangeEvent = (newValue) => {
    setSpecialDesigDistrict(newValue);
  };

  /**
   * Event to handle when the special designation periodicity is changed (GeoPlace only).
   *
   * @param {number} newValue The new special designation periodicity.
   */
  const handleSpecialDesigPeriodicityChangeEvent = (newValue) => {
    setSpecialDesigPeriodicity(newValue);
  };

  /**
   * Event to handle when the height, width & weight designation code is changed (GeoPlace only).
   *
   * @param {number} newValue The new height, width & weight designation code.
   */
  const handleHwwDesignationCodeChangeEvent = (newValue) => {
    setHwwDesignation(newValue);
  };

  /**
   * Event to handle when the height, width & weight organisation is changed (GeoPlace only).
   *
   * @param {number} newValue The new height, width & weight organisation.
   */
  const handleHwwOrganisationChangeEvent = (newValue) => {
    setHwwOrganisation(newValue);
    const possibleDistricts = filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, newValue);
    if (possibleDistricts.filter((x) => x.districtId === hwwDistrict).length === 0) setHwwDistrict(null);
  };

  /**
   * Event to handle when the height, width & weight district is changed (GeoPlace only).
   *
   * @param {number} newValue The new height, width & weight district.
   */
  const handleHwwDistrictChangeEvent = (newValue) => {
    setHwwDistrict(newValue);
  };

  /**
   * Event to handle when the public rights of way dedication is changed (GeoPlace only).
   *
   * @param {number} newValue The new public rights of way dedication.
   */
  const handleProwDedicationChangeEvent = (newValue) => {
    setProwDedication(newValue);
  };

  /**
   * Event to handle when the public rights of way status is changed (GeoPlace only).
   *
   * @param {number} newValue The new public rights of way status.
   */
  const handleProwStatusChangeEvent = (newValue) => {
    setProwStatus(newValue);
  };

  /**
   * Event to handle when the pedestrian access is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new pedestrian access.
   */
  const handlePedestrianAccessChangeEvent = (newValue) => {
    setProwPedestrianAccess(newValue);
  };

  /**
   * Event to handle when the equestrian access is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new equestrian access.
   */
  const handleEquestrianAccessChangeEvent = (newValue) => {
    setProwEquestrianAccess(newValue);
  };

  /**
   * Event to handle when the non-motorised access is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new non-motorised access.
   */
  const handleNonMotorisedAccessChangeEvent = (newValue) => {
    setProwNonMotorisedVehicleAccess(newValue);
  };

  /**
   * Event to handle when the cycle access is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new cycle access.
   */
  const handleCycleAccessChangeEvent = (newValue) => {
    setProwBicycleAccess(newValue);
  };

  /**
   * Event to handle when the motorised access is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new motorised access.
   */
  const handleMotorisedAccessChangeEvent = (newValue) => {
    setProwMotorisedVehicleAccess(newValue);
  };

  /**
   * Event to handle when the promoted route is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new promoted route.
   */
  const handlePromotedRouteChangeEvent = (newValue) => {
    setProwPromotedRoute(newValue);
  };

  /**
   * Event to handle when the accessible route is changed (GeoPlace only).
   *
   * @param {boolean} newValue The new accessible route.
   */
  const handleAccessibleRouteChangeEvent = (newValue) => {
    setProwAccessibleRoute(newValue);
  };

  /**
   * Event to handle when the public rights of way organisation is changed (GeoPlace only).
   *
   * @param {number} newValue The new public rights of way organisation.
   */
  const handleProwOrganisationChangeEvent = (newValue) => {
    setProwOrganisation(newValue);
    const possibleDistricts = filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, newValue);
    if (possibleDistricts.filter((x) => x.districtId === prowDistrict).length === 0) setProwDistrict(null);
  };

  /**
   * Event to handle when the public rights of way district is changed (GeoPlace only).
   *
   * @param {number} newValue The new public rights of way district.
   */
  const handleProwDistrictChangeEvent = (newValue) => {
    setProwDistrict(newValue);
  };

  /**
   * Event to handle when the mouse enters the public rights of way (GeoPlace only)
   */
  const handleProwMouseEnter = () => {
    setProwHover(true);
  };

  /**
   * Event to handle when the mouse leaves the public rights of way (GeoPlace only)
   */
  const handleProwMouseLeave = () => {
    setProwHover(false);
  };

  /**
   * Event to handle when the mouse enters the national cycle route (GeoPlace only)
   */
  const handleNcrMouseEnter = () => {
    setNcrHover(true);
  };

  /**
   * Event to handle when the mouse leaves the national cycle route (GeoPlace only)
   */
  const handleNcrMouseLeave = () => {
    setNcrHover(false);
  };

  /**
   * Event to handle when the mouse enters the quite route (GeoPlace only)
   */
  const handleQuietRouteMouseEnter = () => {
    setQuietRouteHover(true);
  };

  /**
   * Event to handle when the mouse leaves the quite route (GeoPlace only)
   */
  const handleQuietRouteMouseLeave = () => {
    setQuietRouteHover(false);
  };

  /**
   * Event to handle when the mouse enters the obstruction (GeoPlace only)
   */
  const handleObstructionMouseEnter = () => {
    setObstructionHover(true);
  };

  /**
   * Event to handle when the mouse leaves the obstruction (GeoPlace only)
   */
  const handleObstructionMouseLeave = () => {
    setObstructionHover(false);
  };

  /**
   * Event to handle when the mouse enters the planning order (GeoPlace only)
   */
  const handlePlanningOrderMouseEnter = () => {
    setPlanningOrderHover(true);
  };

  /**
   * Event to handle when the mouse leaves the planning order (GeoPlace only)
   */
  const handlePlanningOrderMouseLeave = () => {
    setPlanningOrderHover(false);
  };

  /**
   * Event to handle when the mouse enters the vehicles prohibited (GeoPlace only)
   */
  const handleVehiclesProhibitedMouseEnter = () => {
    setVehiclesProhibitedHover(true);
  };

  /**
   * Event to handle when the mouse leaves the vehicles prohibited (GeoPlace only)
   */
  const handleVehiclesProhibitedMouseLeave = () => {
    setVehiclesProhibitedHover(false);
  };

  /**
   * Method to get the dialog title depending on which variant of dialog is to be displayed.
   *
   * @returns {string} The dialog title
   */
  const getDialogTitle = () => {
    switch (variant) {
      case "title":
        return "Rename Template";

      case "description":
        return "Edit description";

      case "blpuWizard":
      case "lpiWizard":
      case "classificationWizard":
      case "otherWizard":
      case "plotBlpuWizard":
      case "plotLpiWizard":
      case "plotOtherWizard":
        return `Edit ${templateType} details`;

      default:
        return `Edit ${templateType} settings`;
    }
  };

  /**
   * Method to get the content of the dialog depending on which variant of dialog is to be displayed.
   *
   * @returns {JSX.Element} The content of the dialog.
   */
  const getDialogContent = () => {
    if (!variant) return null;

    switch (variant) {
      case "title":
        return (
          <ADSTextControl
            label="Name"
            isEditable
            value={title}
            id="template_title"
            maxLength={75}
            displayCharactersLeft
            onChange={handleTitleChangeEvent}
          />
        );

      case "description":
        return (
          <ADSTextControl
            label="Description"
            isEditable
            value={description}
            id="template_description"
            maxLength={200}
            minLines={2}
            maxLines={10}
            onChange={handleDescriptionChangeEvent}
          />
        );

      case "blpu":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Logical status"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={FilteredBLPULogicalStatus(settingsContext.isScottish, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuStatus}
              onChange={handleBlpuStatusChangeEvent}
              helperText="Logical Status of the BLPU."
            />
            <ADSSelectControl
              label="RPC"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={FilteredRepresentativePointCode(settingsContext.isScottish, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuRpc}
              onChange={handleBlpuRpcChangeEvent}
              helperText="Representative Point Code."
            />
            <ADSSelectControl
              label="State"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={FilteredBLPUState(settingsContext.isScottish, blpuStatus ? blpuStatus : null)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuState}
              onChange={handleBlpuStateChangeEvent}
              helperText="A code identifying the current state of a BLPU."
            />
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="Classification"
                isEditable
                isClassification
                includeHiddenCode
                useRounded
                doNotSetTitleCase
                lookupData={BLPUClassification}
                lookupId="id"
                lookupLabel="display"
                lookupColour="colour"
                value={blpuClassification}
                onChange={handleBlpuClassificationChangeEvent}
                helperText="Classification code for the BLPU."
              />
            )}
            {settingsContext.isScottish && (
              <ADSNumberControl
                label="Level"
                maximum={99.9}
                isEditable
                value={level}
                helperText="Code describing vertical position of BLPU."
                onChange={handleLevelChangeEvent}
              />
            )}
            <ADSSwitchControl
              label="Exclude from export"
              isEditable
              checked={excludeFromExport}
              trueLabel="Yes"
              falseLabel="No"
              helperText="Set this if you do not want this property to be included in any exports."
              onChange={handleExcludeFromExportChangeEvent}
            />
            <ADSSwitchControl
              label="Site visit required"
              isEditable
              checked={siteVisit}
              trueLabel="Yes"
              falseLabel="No"
              helperText="Set this if the property requires a site visit."
              onChange={handleBlpuSiteVisitChangeEvent}
            />
          </Stack>
        );

      case "lpi":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Logical status"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={FilteredLPILogicalStatus(settingsContext.isScottish, null, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={lpiStatus}
              onChange={handleLpiStatusChangeEvent}
              helperText="Logical status of this Record."
            />
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="Sub-locality"
                isEditable
                useRounded
                allowAddLookup
                lookupData={lookupContext.currentLookups.subLocalities
                  .filter((x) => x.language === "ENG" && !x.historic)
                  .sort(function (a, b) {
                    return a.subLocality.localeCompare(b.subLocality, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  })}
                lookupId="subLocalityRef"
                lookupLabel="subLocality"
                value={lpiSubLocality}
                onChange={handleLpiSubLocalityChangeEvent}
                onAddLookup={handleAddSubLocalityEvent}
                helperText="Third level of geographic area name. e.g. to record an island name or property group."
              />
            )}
            <ADSSelectControl
              label="Post town"
              isEditable
              useRounded
              allowAddLookup
              lookupData={lookupContext.currentLookups.postTowns
                .filter((x) => x.language === "ENG" && !x.historic)
                .sort(function (a, b) {
                  return a.postTown.localeCompare(b.postTown, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                })}
              lookupId="postTownRef"
              lookupLabel="postTown"
              value={lpiPostTown}
              onChange={handleLpiPostTownChangeEvent}
              onAddLookup={handleAddPostTownEvent}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
            {!settingsContext.isScottish && (
              <ADSTextControl
                label="Level"
                maximum={99.9}
                isEditable
                value={level}
                id="lpi_level_settings_template"
                maxLength={30}
                displayCharactersLeft
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            )}
            <ADSSelectControl
              label="Official address"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(OfficialAddress, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              value={lpiOfficialAddress}
              onChange={handleLpiOfficialAddressChangeEvent}
              helperText="Status of address."
            />
            <ADSSelectControl
              label={`${settingsContext.isScottish ? "Postally addressable" : "Postal address"}`}
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(PostallyAddressable, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              value={lpiPostalAddress}
              onChange={handleLpiPostalAddressChangeEvent}
              helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
            />
          </Stack>
        );

      case "classification":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Classification"
              isEditable
              isClassification
              includeHiddenCode
              useRounded
              doNotSetTitleCase
              lookupData={settingsContext.isScottish ? OSGClassification : BLPUClassification}
              lookupId="id"
              lookupLabel="display"
              lookupColour="colour"
              value={blpuClassification}
              onChange={handleBlpuClassificationChangeEvent}
              helperText="Classification code for the BLPU."
            />
            <ADSTextControl
              label="Scheme"
              isEditable
              value={classificationScheme}
              id="classification_scheme"
              maxLength={60}
              displayCharactersLeft
              minLines={1}
              maxLines={1}
              onChange={handleClassificationSchemeChangeEvent}
            />
          </Stack>
        );

      case "other":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Cross ref source"
              isEditable
              useRounded
              isCrossRef
              lookupData={lookupContext.currentLookups.appCrossRefs
                .filter((x) => x.enabled)
                .sort(function (a, b) {
                  return a.xrefDescription.localeCompare(b.xrefDescription, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                })}
              lookupId="pkId"
              lookupLabel="xrefDescription"
              lookupColour={adsDarkPink}
              lookupIcon="avatar_icon"
              value={otherCrossRefSource}
              onChange={handleOtherCrossRefSourceChangeEvent}
              helperText="External data-set identity."
            />
            <ADSSelectControl
              label="Provenance"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(BLPUProvenance, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              lookupIcon="avatar_icon"
              value={otherProvenance}
              onChange={handleOtherProvenanceChangeEvent}
              helperText="Identifies the BLPU Provenance Extent derivation."
            />
            <ADSTextControl
              label="Note"
              isEditable
              value={otherNote}
              id="other_note"
              maxLength={4000}
              minLines={2}
              maxLines={10}
              onChange={handleOtherNoteChangeEvent}
            />
          </Stack>
        );

      case "street":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={FilteredStreetType(settingsContext.isScottish, hasProperty)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={streetType}
              onChange={handleStreetTypeChangeEvent}
              helperText="This is the type of the street."
            />
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="State"
                isEditable
                doNotSetTitleCase
                useRounded
                lookupData={StreetState}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                value={streetState}
                helperText="This is the current state of the street."
                onChange={handleStateChangeEvent}
              />
            )}
            <ADSSelectControl
              label="Locality"
              isEditable
              useRounded
              allowAddLookup
              lookupData={lookupContext.currentLookups.localities
                .filter((x) => x.language === "ENG" && !x.historic)
                .sort(function (a, b) {
                  return a.locality.localeCompare(b.locality, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                })}
              lookupId="localityRef"
              lookupLabel="locality"
              value={streetLocality}
              onChange={handleLocalityChangeEvent}
              onAddLookup={handleAddLocalityEvent}
              helperText="Locality name."
            />
            <ADSSelectControl
              label="Town"
              isEditable
              useRounded
              allowAddLookup
              lookupData={lookupContext.currentLookups.towns
                .filter((x) => x.language === "ENG" && !x.historic)
                .sort(function (a, b) {
                  return a.town.localeCompare(b.town, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                })}
              lookupId="townRef"
              lookupLabel="town"
              value={streetTown}
              onChange={handleTownChangeEvent}
              onAddLookup={handleAddTownEvent}
              helperText="Town name."
            />
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="Island"
                isEditable
                useRounded
                allowAddLookup
                lookupData={lookupContext.currentLookups.islands
                  .filter((x) => x.language === "ENG" && !x.historic)
                  .sort(function (a, b) {
                    return a.island.localeCompare(b.island, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  })}
                lookupId="islandRef"
                lookupLabel="island"
                value={streetIsland}
                onChange={handleIslandChangeEvent}
                onAddLookup={handleAddIslandEvent}
                helperText="Island name."
              />
            )}
            <ADSSelectControl
              label="Admin area"
              isEditable
              useRounded
              lookupData={lookupContext.currentLookups.adminAuthorities
                .filter((x) => x.language === "ENG" && !x.historic)
                .sort(function (a, b) {
                  return a.administrativeArea.localeCompare(b.administrativeArea, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                })}
              lookupId="administrativeAreaRef"
              lookupLabel="administrativeArea"
              value={streetAdminArea}
              onChange={handleAdministrativeAreaChangeEvent}
              helperText="Administrative area name."
            />
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="Classification"
                isEditable
                doNotSetTitleCase
                useRounded
                lookupData={StreetClassification}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                value={streetClassification}
                helperText="This is the current classification of the street."
                onChange={handleClassificationChangeEvent}
              />
            )}
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="Surface"
                isEditable
                doNotSetTitleCase
                useRounded
                lookupData={StreetSurface}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                value={streetSurface}
                helperText="This is the type of surface used for the majority of the street."
                onChange={handleSurfaceChangeEvent}
              />
            )}
            <ADSSwitchControl
              label="Exclude from export"
              isEditable
              checked={excludeFromExport}
              trueLabel="Yes"
              falseLabel="No"
              helperText="Set this if you do not want this street to be included in any exports."
              onChange={handleExcludeFromExportChangeEvent}
            />
          </Stack>
        );

      case "esu":
        return (
          <Stack direction="column">
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="Direction"
                isEditable
                useRounded
                doNotSetTitleCase
                lookupData={ESUDirectionCode}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                lookupIcon="avatar_icon"
                value={esuDirection}
                onChange={handleDirectionChangeEvent}
                helperText="Indicates whether traffic flow is restricted in a particular direction."
              />
            )}
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="Tolerance"
                isEditable
                doNotSetTitleCase
                useRounded
                lookupData={ESUTolerance}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                value={esuTolerance}
                helperText="The tolerance of all coordinate points."
                onChange={handleToleranceChangeEvent}
              />
            )}
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="State"
                isEditable
                useRounded
                doNotSetTitleCase
                lookupData={ESUState}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                lookupIcon="avatar_icon"
                value={esuState}
                onChange={handleEsuStateChangeEvent}
                helperText="The current state of the ESU."
              />
            )}
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="Classification"
                isEditable
                useRounded
                doNotSetTitleCase
                lookupData={ESUClassification}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                lookupIcon="avatar_icon"
                value={esuClassification}
                onChange={handleEsuClassificationChangeEvent}
                helperText="The classification of the ESU."
              />
            )}
          </Stack>
        );

      case "owe":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={OneWayExemptionType}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              lookupIcon="avatar_icon"
              value={oweType}
              onChange={handleOneWayExemptionTypeChangeEvent}
              helperText="Type of traffic which is exempt from one-way restrictions."
            />
            <ADSSelectControl
              label="Periodicity"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={OneWayExemptionPeriodicity}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              lookupIcon="avatar_icon"
              value={owePeriodicityCode}
              onChange={handlePeriodicityChangeEvent}
              helperText="Code to identify the periodicity of the restriction."
            />
          </Stack>
        );

      case "hd":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={HighwayDedicationCode}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              lookupIcon="avatar_icon"
              value={hdCode}
              onChange={handleHighwayDedicationCodeChangeEvent}
              helperText="The type of Highway Dedication that applies to this section of the Street."
            />
            <Grid2 container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
              <Grid2 size={3}>
                <Typography variant="body2" align="left" id="indicator-label" color="textPrimary">
                  Indicator
                </Typography>
              </Grid2>
              <Grid2 size={9}>
                <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                  <Grid2>
                    <FormControlLabel
                      control={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox checked={hdPRoW} onChange={(e) => handleProwChangeEvent(e.target.checked)} />
                          <PRoWIcon sx={getIndicatorStyle(hdPRoW, prowHover)} />
                        </Box>
                      }
                      label="PRoW"
                      onMouseEnter={handleProwMouseEnter}
                      onMouseLeave={handleProwMouseLeave}
                      sx={getIndicatorStyle(hdPRoW, prowHover)}
                    />
                  </Grid2>
                  <Grid2>
                    <FormControlLabel
                      control={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox checked={hdNCR} onChange={(e) => handleNcrChangeEvent(e.target.checked)} />
                          <DirectionsBikeIcon sx={getIndicatorStyle(hdNCR, ncrHover)} />
                        </Box>
                      }
                      label="NCR"
                      onMouseEnter={handleNcrMouseEnter}
                      onMouseLeave={handleNcrMouseLeave}
                      sx={getIndicatorStyle(hdNCR, ncrHover)}
                    />
                  </Grid2>
                  <Grid2>
                    <FormControlLabel
                      control={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            checked={hdQuietRoute}
                            onChange={(e) => handleQuietRouteChangeEvent(e.target.checked)}
                          />
                          <QuietRouteIcon sx={getIndicatorStyle(hdQuietRoute, quietRouteHover)} />
                        </Box>
                      }
                      label="Quiet route"
                      onMouseEnter={handleQuietRouteMouseEnter}
                      onMouseLeave={handleQuietRouteMouseLeave}
                      sx={getIndicatorStyle(hdQuietRoute, quietRouteHover)}
                    />
                  </Grid2>
                  <Grid2>
                    <FormControlLabel
                      control={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            checked={hdObstruction}
                            onChange={(e) => handleObstructionChangeEvent(e.target.checked)}
                          />
                          <ObstructionIcon sx={getIndicatorStyle(hdObstruction, obstructionHover)} />
                        </Box>
                      }
                      label="Obstruction"
                      onMouseEnter={handleObstructionMouseEnter}
                      onMouseLeave={handleObstructionMouseLeave}
                      sx={getIndicatorStyle(hdObstruction, obstructionHover)}
                    />
                  </Grid2>
                  <Grid2>
                    <FormControlLabel
                      control={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            checked={hdPlanningOrder}
                            onChange={(e) => handlePlanningOrderChangeEvent(e.target.checked)}
                          />
                          <PlanningOrderIcon sx={getIndicatorStyle(hdPlanningOrder, planningOrderHover)} />
                        </Box>
                      }
                      label="Planning order"
                      onMouseEnter={handlePlanningOrderMouseEnter}
                      onMouseLeave={handlePlanningOrderMouseLeave}
                      sx={getIndicatorStyle(hdPlanningOrder, planningOrderHover)}
                    />
                  </Grid2>
                  <Grid2>
                    <FormControlLabel
                      control={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            checked={hdVehiclesProhibited}
                            onChange={(e) => handleVehiclesProhibitedChangeEvent(e.target.checked)}
                          />
                          <VehiclesProhibitedIcon
                            sx={getIndicatorStyle(hdVehiclesProhibited, vehiclesProhibitedHover)}
                          />
                        </Box>
                      }
                      label="Vehicles prohibited"
                      onMouseEnter={handleVehiclesProhibitedMouseEnter}
                      onMouseLeave={handleVehiclesProhibitedMouseLeave}
                      sx={getIndicatorStyle(hdVehiclesProhibited, vehiclesProhibitedHover)}
                    />
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          </Stack>
        );

      case "maintenanceResponsibility":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Street status"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(RoadStatusCode, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={maintenanceResponsibilityStreetStatus}
              onChange={handleMaintenanceResponsibilityStreetStatusChangeEvent}
              helperText="Street status of the Street."
            />
            <ADSSelectControl
              label="Custodian"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={maintenanceResponsibilityCustodian}
              onChange={handleMaintenanceResponsibilityCustodianChangeEvent}
              helperText="The organisation providing the data."
            />
            <ADSSelectControl
              label="Authority"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={maintenanceResponsibilityAuthority}
              onChange={handleMaintenanceResponsibilityAuthorityChangeEvent}
              helperText="The organisation maintaining the street."
            />
          </Stack>
        );

      case "reinstatementCategory":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Category"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(ReinstatementType, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={reinstatementCategoryReinstatementCategory}
              onChange={handleReinstatementCategoryReinstatementCategoryChangeEvent}
              helperText="The reinstatement category of the street, footpath etc."
            />
            <ADSSelectControl
              label="Custodian"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={reinstatementCategoryCustodian}
              onChange={handleReinstatementCategoryCustodianChangeEvent}
              helperText="The organisation providing the data."
            />
            <ADSSelectControl
              label="Authority"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={reinstatementCategoryAuthority}
              onChange={handleReinstatementCategoryAuthorityChangeEvent}
              helperText="The organisation specifying the reinstatement of the street."
            />
          </Stack>
        );

      case "osSpecialDesignation":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SpecialDesignationCode, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={osSpecialDesignationSpecialDesignation}
              onChange={handleOsSpecialDesignationSpecialDesignationChangeEvent}
              helperText="The type of special designation applying to the street."
            />
            <ADSSelectControl
              label="Custodian"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={osSpecialDesignationCustodian}
              onChange={handleOsSpecialDesignationCustodianChangeEvent}
              helperText="The organisation providing the data."
            />
            <ADSSelectControl
              label="Authority"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(true)}
              lookupColour="colour"
              value={osSpecialDesignationAuthority}
              onChange={handleOsSpecialDesignationAuthorityChangeEvent}
              helperText="The authority responsible for the special designation."
            />
          </Stack>
        );

      case "interest":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Street status"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(RoadStatusCode, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={interestStreetStatus}
              onChange={handleInterestStreetStatusChangeEvent}
              helperText="Street status as defined within the Street Maintenance Responsibility table."
            />
            <ADSSelectControl
              label="Interested organisation"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={interestOrganisation}
              onChange={handleInterestOrganisationChangeEvent}
              helperText="Code to identify the authority which has an interest in the Street."
            />
            <ADSSelectControl
              label="Interest type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(InterestType, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={interestType}
              onChange={handleInterestTypeChangeEvent}
              helperText="Code to identify the nature of the interest that the organisation has in the Street. Defined within the SWA Data Capture Codes."
            />
            <ADSSelectControl
              label="District"
              isEditable
              useRounded
              includeHistoric
              lookupData={filteredOperationalDistricts(
                lookupContext.currentLookups.operationalDistricts,
                interestOrganisation
              ).sort(function (a, b) {
                return a.districtName.localeCompare(b.districtName, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
              lookupId="districtId"
              lookupLabel="districtName"
              value={interestDistrict}
              onChange={handleInterestDistrictChangeEvent}
              helperText="Code to identify the Operational District within the authority."
            />
            <ADSSelectControl
              label="Maintaining organisation"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, false).filter((x) => x.maintainingAuthority)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={interestMaintainingOrganisation}
              onChange={handleInterestMaintainingOrganisationChangeEvent}
              helperText="Code to identify the Street Authority that is legally responsible for maintaining the street where this is not the Local Highway Authority. For example, TfL, Highways England and Welsh Government."
            />
          </Stack>
        );

      case "construction":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Construction type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={ConstructionType}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={constructionType}
              onChange={handleConstructionTypeChangeEvent}
              helperText="The type of Construction that the Record applies to."
            />
            <ADSSelectControl
              label="Reinstatement type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(ReinstatementType, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={constructionReinstatementType}
              onChange={handleReinstatementTypeChangeEvent}
              helperText="Reinstatement as defined in the SROH codes of practice."
            />
            <ADSSelectControl
              label="Aggregate abrasion value"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={
                constructionReinstatementType
                  ? AggregateAbrasionValue.filter((x) => x.reinstatementCode === constructionReinstatementType)
                  : AggregateAbrasionValue
              }
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              value={constructionAggregateAbrasionValue}
              onChange={handleAggregateAbrasionValueChangeEvent}
              helperText="Value as defined in the SROH codes of practice."
            />
            <ADSSelectControl
              label="Polished stone value"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={
                constructionReinstatementType
                  ? PolishedStoneValue.filter((x) => x.reinstatementCode === constructionReinstatementType)
                  : PolishedStoneValue
              }
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              value={constructionPolishedStoneValue}
              onChange={handlePolishedStoneValueChangeEvent}
              helperText="Value as defined in the SROH codes of practice."
            />
            <ADSSelectControl
              label="Organisation"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={constructionOrganisation}
              onChange={handleConstructionOrganisationChangeEvent}
              helperText="Code to identify the Highway Authority which must be consulted about the Construction."
            />
            <ADSSelectControl
              label="District"
              isEditable
              useRounded
              includeHistoric
              lookupData={filteredOperationalDistricts(
                lookupContext.currentLookups.operationalDistricts,
                constructionOrganisation
              ).sort(function (a, b) {
                return a.districtName.localeCompare(b.districtName, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
              lookupId="districtId"
              lookupLabel="districtName"
              value={constructionDistrict}
              onChange={handleConstructionDistrictChangeEvent}
              helperText="Code to identify the Operational District of the Highway Authority which must be consulted about the Construction."
            />
          </Stack>
        );

      case "specialDesignation":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SpecialDesignationCode, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={specialDesigType}
              onChange={handleDesignationTypeChangeEvent}
              helperText="Code to identify the type of Special Designation that the Record applies to (for example, Traffic Sensitive Street)."
            />
            <ADSSelectControl
              label="Organisation"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={specialDesigOrganisation}
              onChange={handleSpecialDesigOrganisationChangeEvent}
              helperText="Code to identify the Street Authority which must be consulted about the Special Designation."
            />
            <ADSSelectControl
              label="District"
              isEditable
              useRounded
              includeHistoric
              lookupData={filteredOperationalDistricts(
                lookupContext.currentLookups.operationalDistricts,
                specialDesigOrganisation
              ).sort(function (a, b) {
                return a.districtName.localeCompare(b.districtName, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
              lookupId="districtId"
              lookupLabel="districtName"
              value={specialDesigDistrict}
              onChange={handleSpecialDesigDistrictChangeEvent}
              helperText="Code to identify the Operational District for the Street Authority which must be consulted about the Special Designation."
            />
            <ADSSelectControl
              label="Periodicity"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SpecialDesignationPeriodicity, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={specialDesigPeriodicity}
              onChange={handleSpecialDesigPeriodicityChangeEvent}
              helperText="Code to identify the periodicity of the restriction."
            />
          </Stack>
        );

      case "hww":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Type"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={HWWDesignationCode}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={hwwDesignation}
              onChange={handleHwwDesignationCodeChangeEvent}
              helperText="The type of restriction that the Record applies to."
            />
            <ADSSelectControl
              label="Organisation"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={hwwOrganisation}
              onChange={handleHwwOrganisationChangeEvent}
              helperText="Code to identify the Street Authority which must be consulted about the HWW Restriction."
            />
            <ADSSelectControl
              label="District"
              isEditable
              useRounded
              includeHistoric
              lookupData={filteredOperationalDistricts(
                lookupContext.currentLookups.operationalDistricts,
                hwwOrganisation
              ).sort(function (a, b) {
                return a.districtName.localeCompare(b.districtName, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
              lookupId="districtId"
              lookupLabel="districtName"
              value={hwwDistrict}
              onChange={handleHwwDistrictChangeEvent}
              helperText="Code to identify the Operational District for the Street Authority which must be consulted about the HWW Restriction."
            />
          </Stack>
        );

      case "prow":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Dedication"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={PRoWDedicationCode}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour={adsDarkGreen}
              value={prowDedication}
              onChange={handleProwDedicationChangeEvent}
              helperText="PRoW Dedication."
            />
            <ADSSelectControl
              label="Status"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={PRoWStatusCode}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour={adsDarkGreen}
              value={prowStatus}
              onChange={handleProwStatusChangeEvent}
              helperText="The status of the PRoW."
            />
            <Grid2 container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
              <Grid2 size={3}>
                <Typography variant="body2" align="left" id="access-label" color="textPrimary">
                  Access
                </Typography>
              </Grid2>
              <Grid2 size={9}>
                <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                  <Grid2>
                    <ADSProwAccessControl
                      variant="Pedestrian"
                      value={prowPedestrianAccess}
                      isEditable
                      onChange={handlePedestrianAccessChangeEvent}
                    />
                  </Grid2>
                  <Grid2>
                    <ADSProwAccessControl
                      variant="Equestrian"
                      value={prowEquestrianAccess}
                      isEditable
                      onChange={handleEquestrianAccessChangeEvent}
                    />
                  </Grid2>
                  <Grid2>
                    <ADSProwAccessControl
                      variant="NonMotorised"
                      value={prowNonMotorisedVehicleAccess}
                      isEditable
                      onChange={handleNonMotorisedAccessChangeEvent}
                    />
                  </Grid2>
                  <Grid2>
                    <ADSProwAccessControl
                      variant="Bicycle"
                      value={prowBicycleAccess}
                      isEditable
                      onChange={handleCycleAccessChangeEvent}
                    />
                  </Grid2>
                  <Grid2>
                    <ADSProwAccessControl
                      variant="Motorised"
                      value={prowMotorisedVehicleAccess}
                      isEditable
                      onChange={handleMotorisedAccessChangeEvent}
                    />
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
            <ADSSwitchControl
              label="Promoted route"
              isEditable
              checked={prowPromotedRoute}
              trueLabel="Yes"
              falseLabel="No"
              helperText="Route defined by the Surveying Authority as a recommended/promoted route."
              onChange={handlePromotedRouteChangeEvent}
            />
            <ADSSwitchControl
              label="Accessible route"
              isEditable
              checked={prowAccessibleRoute}
              trueLabel="Yes"
              falseLabel="No"
              helperText="Route defined by the Surveying Authority as an accessible route for elderly and disabled."
              onChange={handleAccessibleRouteChangeEvent}
            />
            <ADSSelectControl
              label="Organisation"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(SwaOrgRef, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={prowOrganisation}
              onChange={handleProwOrganisationChangeEvent}
              helperText="The Surveying Authority which must be consulted about the PRoW."
            />
            <ADSSelectControl
              label="District"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredOperationalDistricts(
                lookupContext.currentLookups.operationalDistricts,
                prowOrganisation
              ).sort(function (a, b) {
                return a.districtName.localeCompare(b.districtName, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              })}
              lookupId="districtId"
              lookupLabel="districtName"
              lookupColour="colour"
              value={prowDistrict}
              onChange={handleProwDistrictChangeEvent}
              helperText="The Operational District for the Surveying Authority which must be consulted about the PRoW."
            />
          </Stack>
        );

      case "blpuWizard":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Logical status"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredBLPULogicalStatus(settingsContext.isScottish, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuStatus}
              errorText={blpuStatusError}
              onChange={handleBlpuStatusChangeEvent}
              helperText="Logical Status of the BLPU."
            />
            <ADSSelectControl
              label="RPC"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredRepresentativePointCode(settingsContext.isScottish, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuRpc}
              errorText={blpuRpcError}
              onChange={handleBlpuRpcChangeEvent}
              helperText="Representative Point Code."
            />
            <ADSSelectControl
              label="State"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredBLPUState(settingsContext.isScottish, blpuStatus ? blpuStatus : null)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuState}
              errorText={blpuStateError}
              onChange={handleBlpuStateChangeEvent}
              helperText="A code identifying the current state of a BLPU."
            />
            <ADSDateControl
              label="State date"
              isEditable
              isRequired
              value={blpuStateDate}
              errorText={blpuStateDateError}
              onChange={handleBlpuStateDateChangeEvent}
              helperText="Date at which the BLPU achieved its current state in the real-world."
            />
            {!settingsContext.isScottish && (
              <ADSSelectControl
                label="Classification"
                isEditable
                isRequired
                includeHiddenCode
                useRounded
                doNotSetTitleCase
                isClassification
                lookupData={BLPUClassification}
                lookupId="id"
                lookupLabel="display"
                lookupColour="colour"
                value={blpuClassification}
                errorText={blpuClassificationError}
                onChange={handleBlpuClassificationChangeEvent}
                helperText="Classification code for the BLPU."
              />
            )}
            {settingsContext.isScottish && (
              <ADSNumberControl
                label="Level"
                maximum={99.9}
                isEditable
                isRequired
                value={level}
                errorText={levelError}
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            )}
            <ADSSwitchControl
              label="Exclude from export"
              isEditable
              checked={excludeFromExport}
              trueLabel="Yes"
              falseLabel="No"
              errorText={excludeFromExportError}
              helperText="Set this if you do not want this property to be included in any exports."
              onChange={handleExcludeFromExportChangeEvent}
            />
            <ADSSwitchControl
              label="Site visit required"
              isEditable
              checked={siteVisit}
              trueLabel="Yes"
              falseLabel="No"
              errorText={siteVisitError}
              helperText="Set this if the property requires a site visit."
              onChange={handleBlpuSiteVisitChangeEvent}
            />
            <ADSDateControl
              label="Start date"
              isEditable
              isRequired
              value={blpuStartDate}
              helperText="Date on which this BLPU was defined."
              errorText={blpuStartDateError}
              onChange={handleBlpuStartDateChangeEvent}
            />
          </Stack>
        );

      case "lpiWizard":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Logical status"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredLPILogicalStatus(settingsContext.isScottish, null, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={lpiStatus}
              errorText={lpiStatusError}
              onChange={handleLpiStatusChangeEvent}
              helperText="Logical status of this Record."
            />
            {!settingsContext.isScottish && (
              <ADSTextControl
                label="Level"
                maximum={99.9}
                isEditable
                value={level}
                errorText={levelError}
                id="lpi_level_settings_template"
                maxLength={30}
                displayCharactersLeft
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            )}
            <ADSSelectControl
              label="Official address"
              isEditable
              isRequired={settingsContext.isScottish}
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(OfficialAddress, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              value={lpiOfficialAddress}
              errorText={lpiOfficialAddressError}
              onChange={handleLpiOfficialAddressChangeEvent}
              helperText="Status of address."
            />
            <ADSSelectControl
              label={`${settingsContext.isScottish ? "Postally addressable" : "Postal address"}`}
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(PostallyAddressable, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              value={lpiPostalAddress}
              errorText={lpiPostalAddressError}
              onChange={handleLpiPostalAddressChangeEvent}
              helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
            />
            <ADSDateControl
              label="Start date"
              isEditable
              isRequired
              value={lpiStartDate}
              helperText="Date this Record was created."
              errorText={lpiStartDateError}
              onChange={handleLpiStartDateChangeEvent}
            />
          </Stack>
        );

      case "classificationWizard":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Classification"
              isEditable
              isRequired
              includeHiddenCode
              useRounded
              doNotSetTitleCase
              isClassification
              lookupData={OSGClassification}
              lookupId="id"
              lookupLabel="display"
              lookupColour="colour"
              value={blpuClassification}
              errorText={blpuClassificationError}
              onChange={handleBlpuClassificationChangeEvent}
              helperText="Classification for the BLPU."
            />
            <ADSTextControl
              label="Scheme"
              isEditable
              isRequired
              value={classificationScheme}
              id="wizard_classification_scheme"
              maxLength={40}
              displayCharactersLeft
              errorText={classificationSchemeError}
              helperText="The classification scheme used for this record."
              onChange={handleClassificationSchemeChangeEvent}
            />
            <ADSDateControl
              label="Start date"
              isEditable
              isRequired
              value={classificationStartDate}
              helperText="Date on which this classification was defined."
              errorText={classificationStartDateError}
              onChange={handleClassificationStartDateChangeEvent}
            />
          </Stack>
        );

      case "otherWizard":
        return (
          <Stack direction="column">
            <Divider textAlign="center">
              <Typography variant="body1" sx={{ color: `${adsBlueA}`, fontWeight: 700 }}>
                Provenance
              </Typography>
            </Divider>
            <ADSSelectControl
              label="Provenance"
              isEditable
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(BLPUProvenance, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              lookupIcon="avatar_icon"
              value={otherProvenance}
              errorText={otherProvenanceError}
              onChange={handleOtherProvenanceChangeEvent}
              helperText="Identifies the BLPU Provenance Extent derivation."
            />
            <ADSDateControl
              label="Start date"
              isEditable
              value={otherProvenanceStartDate}
              helperText="Date this Record was created."
              errorText={otherProvenanceStartDateError}
              onChange={handleOtherProvenanceStartDateChangeEvent}
            />
            <Divider textAlign="center">
              <Typography variant="body1" sx={{ color: `${adsBlueA}`, fontWeight: 700 }}>
                Notes
              </Typography>
            </Divider>
            <ADSTextControl
              label="Note"
              isEditable
              value={otherNote}
              errorText={otherNoteError}
              id={"ads-text-textfield-note"}
              maxLength={4000}
              minLines={2}
              maxLines={10}
              onChange={handleOtherNoteChangeEvent}
            />
          </Stack>
        );

      case "plotBlpuWizard":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Logical status"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredBLPULogicalStatus(settingsContext.isScottish, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuStatus}
              errorText={blpuStatusError}
              onChange={handleBlpuStatusChangeEvent}
              helperText="Logical Status of the BLPU."
            />
            <ADSSelectControl
              label="RPC"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredRepresentativePointCode(settingsContext.isScottish, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuRpc}
              errorText={blpuRpcError}
              onChange={handleBlpuRpcChangeEvent}
              helperText="Representative Point Code."
            />
            <ADSSelectControl
              label="State"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredBLPUState(settingsContext.isScottish, blpuStatus ? blpuStatus : null)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={blpuState}
              errorText={blpuStateError}
              onChange={handleBlpuStateChangeEvent}
              helperText="A code identifying the current state of a BLPU."
            />
            <ADSDateControl
              label="State date"
              isEditable
              isRequired
              value={blpuStateDate}
              errorText={blpuStateDateError}
              onChange={handleBlpuStateDateChangeEvent}
              helperText="Date at which the BLPU achieved its current state in the real-world."
            />
            {settingsContext.isScottish && (
              <ADSNumberControl
                label="Level"
                maximum={99.9}
                isEditable
                isRequired
                value={level}
                errorText={levelError}
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            )}
          </Stack>
        );

      case "plotLpiWizard":
        return (
          <Stack direction="column">
            <Divider textAlign="center">
              <Typography variant="body1" sx={{ color: `${adsBlueA}`, fontWeight: 700 }}>
                Existing
              </Typography>
            </Divider>
            <ADSSelectControl
              label="Logical status"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredLPILogicalStatus(settingsContext.isScottish, null, false, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={existingLpiStatus}
              errorText={existingLpiStatusError}
              onChange={handleExistingLpiStatusChangeEvent}
              helperText="Logical status of this Record."
            />
            <Divider textAlign="center">
              <Typography variant="body1" sx={{ color: `${adsBlueA}`, fontWeight: 700 }}>
                New
              </Typography>
            </Divider>
            <ADSSelectControl
              label="Logical status"
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={FilteredLPILogicalStatus(settingsContext.isScottish, null, true)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={lpiStatus}
              errorText={lpiStatusError}
              onChange={handleLpiStatusChangeEvent}
              helperText="Logical status of this Record."
            />
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="Sub-locality"
                isEditable
                useRounded
                allowAddLookup
                lookupData={subLocalityLookup}
                lookupId="subLocalityRef"
                lookupLabel="subLocality"
                value={lpiSubLocality}
                errorText={lpiSubLocalityError}
                onChange={handleLpiSubLocalityChangeEvent}
                onAddLookup={handleAddSubLocalityEvent}
                helperText="Third level of geographic area name. e.g. to record an island name or property group."
              />
            )}
            <ADSSelectControl
              label="Post town"
              isEditable
              useRounded
              allowAddLookup
              lookupData={postTownLookup}
              lookupId="postTownRef"
              lookupLabel="postTown"
              value={lpiPostTown}
              errorText={lpiPostTownError}
              onChange={handleLpiPostTownChangeEvent}
              onAddLookup={handleAddPostTownEvent}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
            <ADSSelectControl
              label="Postcode"
              isEditable
              useRounded
              doNotSetTitleCase
              allowAddLookup
              lookupData={postcodeLookup}
              lookupId="postcodeRef"
              lookupLabel="postcode"
              value={lpiPostcode}
              errorText={lpiPostcodeError}
              onChange={handleLpiPostcodeChangeEvent}
              onAddLookup={handleAddPostcodeEvent}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
            {!settingsContext.isScottish && (
              <ADSTextControl
                label="Level"
                maximum={99.9}
                isEditable
                value={level}
                errorText={levelError}
                id="lpi_level_settings_template"
                maxLength={30}
                displayCharactersLeft
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            )}
            <ADSSelectControl
              label="Official address"
              isEditable
              isRequired={settingsContext.isScottish}
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(OfficialAddress, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              value={lpiOfficialAddress}
              errorText={lpiOfficialAddressError}
              onChange={handleLpiOfficialAddressChangeEvent}
              helperText="Status of address."
            />
            <ADSSelectControl
              label={`${settingsContext.isScottish ? "Postally addressable" : "Postal address"}`}
              isEditable
              isRequired
              useRounded
              doNotSetTitleCase
              lookupData={filteredLookup(PostallyAddressable, settingsContext.isScottish)}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              value={lpiPostalAddress}
              errorText={lpiPostalAddressError}
              onChange={handleLpiPostalAddressChangeEvent}
              helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
            />
            <ADSDateControl
              label="Start date"
              isEditable
              isRequired
              value={lpiStartDate}
              helperText="Date this Record was created."
              errorText={lpiStartDateError}
              onChange={handleLpiStartDateChangeEvent}
            />
          </Stack>
        );

      case "plotOtherWizard":
        return (
          <Stack direction="column">
            {settingsContext.isScottish && (
              <ADSSwitchControl
                label="Create Gaelic records"
                isEditable
                checked={createGaelic}
                trueLabel="Yes"
                falseLabel="No"
                onChange={handleCreateGaelicChangeEvent}
                helperText="Set this if you want to also create Gaelic records."
              />
            )}
            <ADSTextControl
              label="Note"
              isEditable
              value={otherNote}
              errorText={otherNoteError}
              id={"ads-text-textfield-note"}
              maxLength={4000}
              minLines={2}
              maxLines={10}
              onChange={handleOtherNoteChangeEvent}
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  /**
   * Method to get the styling to be used for the indicator.
   *
   * @param {boolean} isChecked True if the item is checked; otherwise false.
   * @param {boolean} isHover True if the mouse is hovering over the item; otherwise false.
   * @returns {object} The styling to be used for the indicator.
   */
  function getIndicatorStyle(isChecked, isHover) {
    if (isChecked || isHover)
      return {
        mr: theme.spacing(1),
        color: adsBlueA,
      };
    else
      return {
        mr: theme.spacing(1),
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
  }

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
        case "postTown":
          setLpiPostTown(addResults.newLookup.postTownRef);
          break;

        case "subLocality":
          setLpiSubLocality(addResults.newLookup.subLocalityRef);
          break;

        case "locality":
          setStreetLocality(addResults.newLookup.localityRef);
          break;

        case "town":
          setStreetTown(addResults.newLookup.townRef);
          break;

        case "island":
          setStreetIsland(addResults.newLookup.islandRef);
          break;

        case "administrativeArea":
          setStreetAdminArea(addResults.newLookup.adminAreaRef);
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
    if (data) {
      switch (variant) {
        case "title":
          setTemplateType("Title");
          setTitle(data.title ? data.title : "");
          break;

        case "description":
          setTemplateType("Description");
          setDescription(data.description ? data.description : "");
          break;

        case "blpu":
          setTemplateType("BLPU");
          setBlpuStatus(data.blpuLogicalStatus);
          setBlpuRpc(data.rpc);
          setBlpuState(data.state);
          if (settingsContext.isScottish) {
            setLevel(data.level ? data.level : 0);
          } else {
            setBlpuClassification(data.classification);
          }
          setExcludeFromExport(data.excludeFromExport);
          setSiteVisit(data.siteVisit);
          break;

        case "lpi":
          setTemplateType("LPI");
          setLpiStatus(data.lpiLogicalStatus);
          setLpiPostTown(data.postTownRef);
          if (settingsContext.isScottish) {
            setLpiSubLocality(data.subLocalityRef);
          } else {
            setLevel(data.level ? data.level : "");
          }
          setLpiOfficialAddress(data.officialAddressMaker);
          setLpiPostalAddress(data.postallyAddressable);
          break;

        case "classification":
          setTemplateType("Classification");
          setBlpuClassification(data.classification);
          setClassificationScheme(data.classificationScheme ? data.classificationScheme : "");
          break;

        case "other":
          setTemplateType("Other");
          setOtherCrossRefSource(data.source);
          setOtherProvenance(data.provCode);
          setOtherNote(data.note ? data.note : "");
          break;

        case "street":
          setTemplateType("Street");
          setStreetType(data.streetRefType);
          setStreetState(data.state);
          setStreetLocality(data.localityRef);
          setStreetTown(data.townRef);
          setStreetIsland(data.islandRef);
          setStreetAdminArea(data.adminAreaRef);
          setStreetClassification(data.classification);
          setStreetSurface(data.surface);
          setExcludeFromExport(data.excludeFromExport);
          break;

        case "esu":
          setTemplateType("ESU");
          setEsuDirection(data.esuDirection);
          setEsuTolerance(data.esuTolerance);
          setEsuState(data.esuState);
          setEsuClassification(data.esuClassification);
          break;

        case "owe":
          setTemplateType("One-way exemption");
          setOweType(data.oweType);
          setOwePeriodicityCode(data.owePeriodicityCode);
          break;

        case "hd":
          setTemplateType("Highway dedication");
          setHdCode(data.hdCode);
          setHdPRoW(data.hdPRoW ? data.hdPRoW : false);
          setHdNCR(data.hdNCR ? data.hdNCR : false);
          setHdQuietRoute(data.hdQuietRoute ? data.hdQuietRoute : false);
          setHdObstruction(data.hdObstruction ? data.hdObstruction : false);
          setHdPlanningOrder(data.hdPlanningOrder ? data.hdPlanningOrder : false);
          setHdVehiclesProhibited(data.hdVehiclesProhibited ? data.hdVehiclesProhibited : false);
          break;

        case "maintenanceResponsibility":
          setTemplateType("Maintenance responsibility");
          setMaintenanceResponsibilityStreetStatus(data.maintenanceResponsibilityStreetStatus);
          setMaintenanceResponsibilityCustodian(data.maintenanceResponsibilityCustodian);
          setMaintenanceResponsibilityAuthority(data.maintenanceResponsibilityAuthority);
          break;

        case "reinstatementCategory":
          setTemplateType("Reinstatement category");
          setReinstatementCategoryReinstatementCategory(data.reinstatementCategoryReinstatementCategory);
          setReinstatementCategoryCustodian(data.reinstatementCategoryCustodian);
          setReinstatementCategoryAuthority(data.reinstatementCategoryAuthority);
          break;

        case "osSpecialDesignation":
          setTemplateType("Special designation");
          setOsSpecialDesignationSpecialDesignation(data.osSpecialDesignationSpecialDesignation);
          setOsSpecialDesignationCustodian(data.osSpecialDesignationCustodian);
          setOsSpecialDesignationAuthority(data.osSpecialDesignationAuthority);
          break;

        case "interest":
          setTemplateType("Interested organisation");
          setInterestStreetStatus(data.interestStreetStatus);
          setInterestOrganisation(data.interestOrganisation);
          setInterestType(data.interestType);
          setInterestDistrict(data.interestDistrict);
          setInterestMaintainingOrganisation(data.maintainingOrganisation);
          break;

        case "construction":
          setTemplateType("Construction");
          setConstructionType(data.constructionType);
          setConstructionReinstatementType(data.reinstatementType);
          setConstructionAggregateAbrasionValue(data.aggregateAbrasionValue);
          setConstructionPolishedStoneValue(data.polishedStoneValue);
          setConstructionOrganisation(data.constructionOrganisation);
          setConstructionDistrict(data.constructionDistrict);
          break;

        case "specialDesignation":
          setTemplateType("Special designation");
          setSpecialDesigType(data.specialDesigType);
          setSpecialDesigOrganisation(data.specialDesigOrganisation);
          setSpecialDesigDistrict(data.specialDesigDistrict);
          setSpecialDesigPeriodicity(data.specialDesigPeriodicity);
          break;

        case "hww":
          setTemplateType("Height, width & weight restriction");
          setHwwDesignation(data.hwwDesignation);
          setHwwOrganisation(data.hwwOrganisation);
          setHwwDistrict(data.hwwDistrict);
          break;

        case "prow":
          setTemplateType("Public right of way");
          setProwDedication(data.prowDedication);
          setProwStatus(data.prowStatus);
          setProwPedestrianAccess(data.pedestrianAccess ? data.pedestrianAccess : false);
          setProwEquestrianAccess(data.equestrianAccess ? data.equestrianAccess : false);
          setProwNonMotorisedVehicleAccess(data.nonMotorisedVehicleAccess ? data.nonMotorisedVehicleAccess : false);
          setProwBicycleAccess(data.bicycleAccess ? data.bicycleAccess : false);
          setProwMotorisedVehicleAccess(data.motorisedVehicleAccess ? data.motorisedVehicleAccess : false);
          setProwPromotedRoute(data.promotedRoute ? data.promotedRoute : false);
          setProwAccessibleRoute(data.accessibleRoute ? data.accessibleRoute : false);
          setProwOrganisation(data.prowOrganisation);
          setProwDistrict(data.prowDistrict);
          break;

        case "blpuWizard":
          setTemplateType("BLPU");
          setBlpuStatus(data.blpuLogicalStatus);
          setBlpuRpc(data.rpc);
          setBlpuState(data.state);
          setBlpuStateDate(data.stateDate);
          if (settingsContext.isScottish) {
            setLevel(data.level ? data.level : 0);
          } else {
            setBlpuClassification(data.classification);
          }
          setExcludeFromExport(data.excludeFromExport);
          setSiteVisit(data.siteVisit);
          setBlpuStartDate(data.startDate);
          break;

        case "lpiWizard":
          setTemplateType("LPI");
          setLpiStatus(data.lpiLogicalStatus);
          if (settingsContext.isScottish) {
            setLpiSubLocality(data.subLocality);
          } else {
            setLevel(data.level ? data.level : "");
          }
          setLpiOfficialAddress(data.officialAddressMaker);
          setLpiPostalAddress(data.postallyAddressable);
          setLpiStartDate(data.startDate);
          break;

        case "classificationWizard":
          setTemplateType("Classification");
          setBlpuClassification(data.classification);
          setClassificationScheme(data.classificationScheme ? data.classificationScheme : "");
          setClassificationStartDate(data.startDate);
          break;

        case "otherWizard":
          setTemplateType("Other");
          setOtherProvenance(data.provCode);
          setOtherProvenanceStartDate(data.provStartDate);
          setOtherNote(data.note ? data.note : "");
          break;

        case "plotBlpuWizard":
          setTemplateType("BLPU");
          setBlpuStatus(data.blpuLogicalStatus);
          setBlpuRpc(data.rpc);
          setBlpuState(data.state);
          setBlpuStateDate(data.stateDate);
          if (settingsContext.isScottish) {
            setLevel(data.level ? data.level : 0);
          } else {
            setBlpuClassification(data.classification);
          }
          setExcludeFromExport(data.excludeFromExport);
          setSiteVisit(data.siteVisit);
          break;

        case "plotLpiWizard":
          setTemplateType("LPI");
          setExistingLpiStatus(data.existingLpiLogicalStatus);
          setLpiStatus(data.newLpiLogicalStatus);
          setLpiPostTown(data.postTownRef);
          setLpiPostcode(data.postcodeRef);
          if (settingsContext.isScottish) {
            setLpiSubLocality(data.subLocalityRef);
          } else {
            setLevel(data.level ? data.level : "");
          }
          setLpiOfficialAddress(data.officialAddressMaker);
          setLpiPostalAddress(data.postallyAddressable);
          setLpiStartDate(data.startDate);
          break;

        case "plotOtherWizard":
          setTemplateType(`${settingsContext.isScottish ? "Other" : "Note"}`);
          if (settingsContext.isScottish) setCreateGaelic(data.createGaelic);
          setOtherNote(data.note ? data.note : "");
          break;

        default:
          setTemplateType("Unknown");
          break;
      }

      if (
        [
          "blpuWizard",
          "lpiWizard",
          "classificationWizard",
          "otherWizard",
          "plotBlpuWizard",
          "plotLpiWizard",
          "postalLpiWizard",
          "plotOtherWizard",
        ].includes(variant) &&
        data.errors &&
        data.errors.length > 0
      ) {
        setErrors(data.errors);
        setBlpuStatusError(null);
        setBlpuRpcError(null);
        setBlpuStateError(null);
        setBlpuStateDateError(null);
        setBlpuClassificationError(null);
        setExcludeFromExportError(null);
        setSiteVisitError(null);
        setBlpuStartDateError(null);
        setExistingLpiStatusError(null);
        setLpiStatusError(null);
        setLpiPostTownError(null);
        setLpiPostcodeError(null);
        setLpiSubLocalityError(null);
        setLevelError(null);
        setLpiOfficialAddressError(null);
        setLpiPostalAddressError(null);
        setLpiStartDateError(null);
        setClassificationSchemeError(null);
        setOtherProvenanceError(null);
        setOtherProvenanceStartDateError(null);
        setOtherNoteError(null);

        for (const error of data.errors) {
          switch (error.field.toLowerCase()) {
            case "blpustatus":
              setBlpuStatusError(error.errors);
              break;

            case "rpc":
              setBlpuRpcError(error.errors);
              break;

            case "state":
              setBlpuStateError(error.errors);
              break;

            case "statedate":
              setBlpuStateDateError(error.errors);
              break;

            case "classification":
              setBlpuClassificationError(error.errors);
              break;

            case "excludefromexport":
              setExcludeFromExportError(error.errors);
              break;

            case "sitevisit":
              setSiteVisitError(error.errors);
              break;

            case "blpustartdate":
              setBlpuStartDateError(error.errors);
              break;

            case "existinglpistatus":
              setExistingLpiStatusError(error.errors);
              break;

            case "lpistatus":
            case "newlpistatus":
              setLpiStatusError(error.errors);
              break;

            case "postcode":
            case "postcoderef":
              setLpiPostcodeError(error.errors);
              break;

            case "posttown":
            case "posttownref":
              setLpiPostTownError(error.errors);
              break;

            case "sublocality":
            case "sublocalityref":
              setLpiSubLocalityError(error.errors);
              break;

            case "level":
              setLevelError(error.errors);
              break;

            case "officialaddress":
              setLpiOfficialAddressError(error.errors);
              break;

            case "postaladdress":
              setLpiPostalAddressError(error.errors);
              break;

            case "lpistartdate":
              setLpiStartDateError(error.errors);
              break;

            case "classificationscheme":
              setClassificationSchemeError(error.errors);
              break;

            case "classificationstartdate":
              setClassificationStartDateError(error.errors);
              break;

            case "provenance":
              setOtherProvenanceError(error.errors);
              break;

            case "provenancestartdate":
              setOtherProvenanceStartDateError(error.errors);
              break;

            case "note":
              setOtherNoteError(error.errors);
              break;

            default:
              break;
          }
        }
      } else setErrors(null);
    }

    setShowDialog(isOpen);
  }, [variant, data, isOpen, settingsContext.isScottish]);

  useEffect(() => {
    setHasProperty(userContext.currentUser && userContext.currentUser.hasProperty);
  }, [userContext]);

  return (
    <>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-template-dialog"
        fullWidth
        maxWidth="sm"
        onClose={handleDialogClose}
      >
        <ADSDialogTitle title={getDialogTitle()} closeTooltip="Cancel" onClose={handleCancelClick} />
        <DialogContent sx={{ mt: theme.spacing(2) }}>{getDialogContent()}</DialogContent>
        <DialogActions
          sx={{
            justifyContent: "flex-start",
            mb: theme.spacing(1),
            ml: theme.spacing(3),
          }}
        >
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
          <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
            Cancel
          </Button>
        </DialogActions>
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

export default EditTemplateDialog;
