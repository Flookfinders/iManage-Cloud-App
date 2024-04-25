/* #region header */
/**************************************************************************************************
//
//  Description: Add Property Wizard Dialog
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
//    002   27.03.23 Sean Flook         WI40609 Treat 0 as null for numbers.
//    003   28.03.23 Sean Flook         WI40631 Always set the addressPoints when leaving the property details page.
//    004   05.04.23 Sean Flook         WI40669 Changes required for cross references.
//    005   13.04.23 Sean Flook         WI40681 If template has cross reference add a record.
//    006   13.04.23 Sean Flook         WI40681 Added validation of cross references.
//    007   07.09.23 Sean Flook                 Changed function name.
//    008   06.10.23 Sean Flook                 Use colour variables.
//    009   27.10.23 Sean Flook                 Updated call to SaveProperty.
//    010   03.11.23 Sean Flook                 Added Message dialog for confirmation of cancelling the wizard.
//    011   10.11.23 Sean Flook                 Updated action string.
//    012   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    013   30.11.23 Sean Flook                 Changes required for Scottish authorities.
//    014   01.12.23 Sean Flook                 Corrected field names.
//    015   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    016   17.01.24 Sean Flook                 Renamed fields and included sub-locality.
//    017   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    018   11.03.24 Sean Flook           GLB12 Removed bottom margin.
//    019   22.03.24 Sean Flook           GLB12 Use new constant for height.
//    020   27.03.24 Sean Flook                 Added a tooltip to the close button.
//    021   27.03.24 Sean Flook                 Changes required to remove warnings.
//    022   22.04.24 Sean Flook       IMANN-374 Disable the buttons when creating the properties.
//    023   24.04.24 Sean Flook       IMANN-390 Get the list of new UPRNs from the API before creating the properties.
//    024   25.04.24 Sean Flook       IMANN-390 Display a message dialog if there are no available UPRNs to use to create the properties.
//    025   25.04.24 Sean Flook       IMANN-390 If a property is failed by the API return the UPRN back to the API so it can be reused.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { forwardRef, useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import PropertyContext from "../context/propertyContext";

import { streetToTitleCase } from "../utils/StreetUtils";
import { addressToTitleCase, returnFailedUprns, SaveProperty } from "../utils/PropertyUtils";

import {
  Slide,
  Dialog,
  Stepper,
  Step,
  StepLabel,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import { Box, Stack } from "@mui/system";

import WizardSelectTemplatePage from "../pages/WizardSelectTemplatePage";
import WizardAddressDetailsPage from "../pages/WizardAddressDetailsPage";
import WizardPropertyDetailsPage from "../pages/WizardPropertyDetailsPage";
import WizardCrossReferencesPage from "../pages/WizardCrossReferencesPage";
import WizardMapPlacementPage from "../pages/WizardMapPlacementPage";
import WizardFinalisePage from "../pages/WizardFinalisePage";
import WizardFinaliseDialog from "./WizardFinaliseDialog";
import MessageDialog from "./MessageDialog";

import { GetListOfUprnsUrl, GetPropertyFromUPRNUrl } from "../configuration/ADSConfig";
import { stringToSentenceCase } from "../utils/HelperUtils";
import { streetDescriptorToTitleCase } from "../utils/StreetUtils";
import { ValidateAddressDetails, ValidateCrossReference, ValidatePropertyDetails } from "../utils/WizardValidation";

import { OSGScheme } from "../data/OSGClassification";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ErrorIcon from "@mui/icons-material/Error";

import { adsBlueA, adsOffWhite } from "../utils/ADSColours";
import {
  blueButtonStyle,
  whiteButtonStyle,
  redButtonStyle,
  dialogTitleStyle,
  wizardStepperHeight,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

AddPropertyWizardDialog.propTypes = {
  variant: PropTypes.oneOf(["property", "child", "range", "rangeChildren"]),
  parent: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AddPropertyWizardDialog({ variant, parent, isOpen, onDone, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const propertyContext = useContext(PropertyContext);

  const [showDialog, setShowDialog] = useState(false);
  const [steps, setSteps] = useState(["No steps"]);
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [addressErrors, setAddressErrors] = useState([]);
  const [propertyErrors, setPropertyErrors] = useState([]);
  const [crossReferencesErrors, setCrossReferencesErrors] = useState([]);
  const [finaliseErrors, setFinaliseErrors] = useState([]);
  const [failedUprns, setFailedUprns] = useState([]);
  const [haveErrors, setHaveErrors] = useState(false);

  const [engSingleAddressData, setEngSingleAddressData] = useState(null);
  const [altLangSingleAddressData, setAltLangSingleAddressData] = useState(null);
  const [engRangeAddressData, setEngRangeAddressData] = useState(null);
  const [altLangRangeAddressData, setAltLangRangeAddressData] = useState(null);
  const [blpuData, setBlpuData] = useState(null);
  const [lpiData, setLpiData] = useState(null);
  const [classificationData, setClassificationData] = useState(null);
  const [otherData, setOtherData] = useState(null);
  const [crossReferenceData, setCrossReferenceData] = useState([]);
  const [addressPoints, setAddressPoints] = useState(null);
  const [placeOnMapData, setPlaceOnMapData] = useState(null);
  const [finaliseOpen, setFinaliseOpen] = useState(false);
  const [rangeProcessedCount, setRangeProcessedCount] = useState(0);
  const [finaliseVariant, setFinaliseVariant] = useState(variant);
  const [viewErrors, setViewErrors] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [messageVariant, setMessageVariant] = useState("cancelWizard");

  const selectedTemplate = useRef(null);
  const addressDetails = useRef(null);
  const language = useRef("ENG");
  const isRange = useRef(false);
  const errorId = useRef(null);
  const savedProperty = useRef(null);
  const rangeErrors = useRef(null);
  const failedRangeUprns = useRef(null);
  const totalRangeCount = useRef(0);
  const createdCount = useRef(0);
  const failedCount = useRef(0);

  /**
   * Method to determine if the current step is optional or not.
   *
   * @param {number} step The current step.
   * @returns {boolean} True if the current step is optional; otherwise false.
   */
  const isStepOptional = (step) => {
    return step === 3;
  };

  /**
   * Method to determine if the step has been skipped or not.
   *
   * @param {number} step The current step.
   * @returns {boolean} True if the step has been skipped: otherwise false.
   */
  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  /**
   * Event to handle when the dialog closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    setMessageVariant("cancelWizard");
    setOpenMessageDialog(true);
  };

  /**
   * Event to handle when the message dialog closes.
   *
   * @param {string} action The action to take after closing the dialog.
   */
  const handleMessageDialogClose = (action) => {
    setOpenMessageDialog(false);

    switch (action) {
      case "close":
        if (onClose) onClose();
        else setShowDialog(false);
        break;

      default:
        break;
    }
  };

  /**
   * Method to get the list of new properties.
   *
   * @returns {Array} A list of the new properties.
   */
  const getPropertyData = async () => {
    if (addressPoints) {
      const newProperties = [];
      const newErrorIds = [];
      let blpuPkId = -10;
      let lpiPkId = -10;
      let notePkId = -10;
      let dualLanguageLink = 0;

      const getNewUprnsUrl = GetListOfUprnsUrl(userContext.currentUser.token);
      const newUprnCount = addressPoints.filter((x) => x.language === "ENG").length;
      let haveEnoughUprns = true;

      const newUprns = await fetch(`${getNewUprnsUrl.url}/${newUprnCount}`, {
        headers: getNewUprnsUrl.headers,
        crossDomain: true,
        method: getNewUprnsUrl.type,
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          switch (res.status) {
            case 200:
              return res.json();

            default:
              haveEnoughUprns = false;
              return [];
          }
        })
        .then((result) => {
          if (Array.isArray(result)) {
            if (result.length > 1)
              return result.sort((a, b) => {
                return b - a;
              });
            else return result;
          } else return [result];
        })
        .catch((res) => {
          haveEnoughUprns = false;
          return [];
        });

      if (haveEnoughUprns) haveEnoughUprns = newUprns && newUprns.length && newUprns.length === newUprnCount;

      if (haveEnoughUprns) {
        for (const address of addressPoints.filter((x) => x.language === "ENG")) {
          const newCrossRefs = [];
          const newClassifications = [];
          const newProvenances = [];
          const newNotes = [];
          const newLpis = [];
          const newUprn = newUprns.pop();

          dualLanguageLink++;

          const engPostTownRecord = lookupContext.currentLookups.postTowns.find(
            (x) => x.postTownRef === address.addressDetails.postTownRef
          );
          const subLocalityRecord = settingsContext.isScottish
            ? lookupContext.currentLookups.subLocalities.find(
                (x) => x.subLocalityRef === address.addressDetails.subLocalityRef
              )
            : null;
          const postcodeRecord = lookupContext.currentLookups.postcodes.find(
            (x) => x.postcodeRef === address.addressDetails.postcodeRef
          );

          if (settingsContext.isScottish)
            newLpis.push({
              pkId: lpiPkId--,
              changeType: "I",
              language: "ENG",
              startDate: address.lpi.startDate,
              endDate: null,
              saoStartNumber:
                address.addressDetails.saoStartNumber && Number(address.addressDetails.saoStartNumber) > 0
                  ? address.addressDetails.saoStartNumber
                  : null,
              saoStartSuffix: address.addressDetails.saoStartSuffix,
              saoEndNumber:
                address.addressDetails.saoEndNumber && Number(address.addressDetails.saoEndNumber) > 0
                  ? address.addressDetails.saoEndNumber
                  : null,
              saoEndSuffix: address.addressDetails.saoEndSuffix,
              saoText: address.addressDetails.saoText,
              paoStartNumber:
                address.addressDetails.paoStartNumber && Number(address.addressDetails.paoStartNumber) > 0
                  ? address.addressDetails.paoStartNumber
                  : null,
              paoStartSuffix: address.addressDetails.paoStartSuffix,
              paoEndNumber:
                address.addressDetails.paoEndNumber && Number(address.addressDetails.paoEndNumber) > 0
                  ? address.addressDetails.paoEndNumber
                  : null,
              paoEndSuffix: address.addressDetails.paoEndSuffix,
              paoText: address.addressDetails.paoText,
              usrn: address.addressDetails.usrn,
              postcodeRef: address.addressDetails.postcodeRef,
              postTownRef: address.addressDetails.postTownRef,
              subLocalityRef: address.addressDetails.subLocalityRef,
              neverExport: false,
              address: address.addressDetails.address,
              postTown: engPostTownRecord ? engPostTownRecord.postTown : null,
              subLocality: subLocalityRecord ? subLocalityRecord.subLocality : null,
              postcode: postcodeRecord ? postcodeRecord.postcode : null,
              uprn: 0,
              logicalStatus: address.lpi.logicalStatus,
              postallyAddressable: address.lpi.postallyAddressable,
              officialFlag: address.lpi.officialAddress,
              dualLanguageLink: 0,
            });
          else
            newLpis.push({
              pkId: lpiPkId--,
              changeType: "I",
              language: "ENG",
              startDate: address.lpi.startDate,
              endDate: null,
              saoStartNumber:
                address.addressDetails.saoStartNumber && Number(address.addressDetails.saoStartNumber) > 0
                  ? address.addressDetails.saoStartNumber
                  : null,
              saoStartSuffix: address.addressDetails.saoStartSuffix,
              saoEndNumber:
                address.addressDetails.saoEndNumber && Number(address.addressDetails.saoEndNumber) > 0
                  ? address.addressDetails.saoEndNumber
                  : null,
              saoEndSuffix: address.addressDetails.saoEndSuffix,
              saoText: address.addressDetails.saoText,
              paoStartNumber:
                address.addressDetails.paoStartNumber && Number(address.addressDetails.paoStartNumber) > 0
                  ? address.addressDetails.paoStartNumber
                  : null,
              paoStartSuffix: address.addressDetails.paoStartSuffix,
              paoEndNumber:
                address.addressDetails.paoEndNumber && Number(address.addressDetails.paoEndNumber) > 0
                  ? address.addressDetails.paoEndNumber
                  : null,
              paoEndSuffix: address.addressDetails.paoEndSuffix,
              paoText: address.addressDetails.paoText,
              usrn: address.addressDetails.usrn,
              postcodeRef: address.addressDetails.postcodeRef,
              postTownRef: address.addressDetails.postTownRef,
              neverExport: false,
              address: address.addressDetails.address,
              postTown: engPostTownRecord ? engPostTownRecord.postTown : null,
              postcode: postcodeRecord ? postcodeRecord.postcode : null,
              uprn: 0,
              logicalStatus: address.lpi.logicalStatus,
              level: settingsContext.isScottish ? address.blpu.level : address.lpi.level,
              postalAddress: address.lpi.postallyAddressable,
              officialFlag: address.lpi.officialAddress,
              dualLanguageLink: settingsContext.isWelsh ? dualLanguageLink : 0,
            });

          if (settingsContext.isWelsh) {
            const cymPostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.linkedRef === address.addressDetails.postTownRef
            );

            const cymRecord = addressPoints.find((x) => x.id === `CYM_${address.addressDetails.id}`);

            if (cymRecord)
              newLpis.push({
                pkId: lpiPkId--,
                changeType: "I",
                language: "CYM",
                startDate: cymRecord.lpi.startDate,
                endDate: null,
                saoStartNumber:
                  cymRecord.addressDetails.saoStartNumber && Number(cymRecord.addressDetails.saoStartNumber) > 0
                    ? cymRecord.addressDetails.saoStartNumber
                    : null,
                saoStartSuffix: cymRecord.addressDetails.saoStartSuffix,
                saoEndNumber:
                  cymRecord.addressDetails.saoEndNumber && Number(cymRecord.addressDetails.saoEndNumber) > 0
                    ? cymRecord.addressDetails.saoEndNumber
                    : null,
                saoEndSuffix: cymRecord.addressDetails.saoEndSuffix,
                saoText: cymRecord.addressDetails.saoText,
                paoStartNumber:
                  cymRecord.addressDetails.paoStartNumber && Number(cymRecord.addressDetails.paoStartNumber) > 0
                    ? cymRecord.addressDetails.paoStartNumber
                    : null,
                paoStartSuffix: cymRecord.addressDetails.paoStartSuffix,
                paoEndNumber:
                  cymRecord.addressDetails.paoEndNumber && Number(cymRecord.addressDetails.paoEndNumber) > 0
                    ? cymRecord.addressDetails.paoEndNumber
                    : null,
                paoEndSuffix: cymRecord.addressDetails.paoEndSuffix,
                paoText: cymRecord.addressDetails.paoText,
                usrn: cymRecord.addressDetails.usrn,
                postcodeRef: cymRecord.addressDetails.postcodeRef,
                postTownRef: cymRecord.addressDetails.postTownRef,
                neverExport: false,
                address: cymRecord.addressDetails.address,
                postTown: cymPostTownRecord ? cymPostTownRecord.postTown : null,
                postcode: postcodeRecord ? postcodeRecord.postcode : null,
                uprn: 0,
                logicalStatus: cymRecord.lpi.logicalStatus,
                level: cymRecord.lpi.level,
                postalAddress: cymRecord.lpi.postallyAddressable,
                officialFlag: cymRecord.lpi.officialAddress,
                dualLanguageLink: dualLanguageLink,
              });
          }

          if (crossReferenceData && crossReferenceData.length > 0) {
            for (const crossReference of crossReferenceData) {
              newCrossRefs.push({
                changeType: "I",
                uprn: 0,
                startDate: crossReference.startDate,
                endDate: null,
                crossReference: crossReference.crossReference,
                sourceId: crossReference.sourceId,
                source: null,
                neverExport: false,
              });
            }
          }

          if (settingsContext.isScottish && address.classification) {
            newClassifications.push({
              changeType: "I",
              uprn: 0,
              classificationScheme: address.classification.classificationScheme,
              blpuClass: address.classification.classification,
              startDate: address.classification.startDate,
              endDate: null,
              neverExport: false,
            });
          }

          if (address.other) {
            if (address.other.provCode)
              newProvenances.push({
                changeType: "I",
                uprn: 0,
                provenanceCode: address.other.provCode,
                annotation: null,
                startDate: address.other.provStartDate,
                endDate: null,
                neverExport: false,
                wktGeometry: null,
              });

            if (address.other.note) {
              if (Array.isArray(address.other.note)) {
                for (const singleNote of address.other.note) {
                  newNotes.push({
                    pkId: notePkId--,
                    changeType: "I",
                    uprn: 0,
                    note: singleNote,
                  });
                }
              } else
                newNotes.push({
                  pkId: notePkId--,
                  changeType: "I",
                  uprn: 0,
                  note: address.other.note,
                });
            }
          }

          if (settingsContext.isScottish)
            newProperties.push({
              pkId: blpuPkId,
              changeType: "I",
              blpuStateDate: address.blpu.stateDate,
              xcoordinate: Number(address.easting),
              ycoordinate: Number(address.northing),
              rpc: address.blpu.rpc,
              startDate: address.blpu.startDate,
              endDate: null,
              parentUprn: address.parentUprn,
              neverExport: false,
              siteSurvey: false,
              uprn: newUprn && newUprn > 0 ? newUprn : 0,
              logicalStatus: address.blpu.logicalStatus,
              blpuState: address.blpu.state,
              level: address.blpu.level,
              custodianCode: settingsContext.authorityCode,
              relatedPropertyCount: 0,
              relatedStreetCount: 0,
              blpuAppCrossRefs: newCrossRefs,
              blpuProvenances: newProvenances,
              blpuNotes: newNotes,
              classifications: newClassifications,
              organisations: [],
              successorCrossRefs: [],
              lpis: newLpis,
            });
          else
            newProperties.push({
              pkId: blpuPkId,
              changeType: "I",
              blpuStateDate: address.blpu.stateDate,
              xcoordinate: Number(address.easting),
              ycoordinate: Number(address.northing),
              rpc: address.blpu.rpc,
              startDate: address.blpu.startDate,
              endDate: null,
              parentUprn: address.parentUprn,
              neverExport: false,
              siteSurvey: false,
              uprn: newUprn && newUprn > 0 ? newUprn : 0,
              logicalStatus: address.blpu.logicalStatus,
              blpuState: address.blpu.state,
              blpuClass: address.blpu.classification,
              localCustodianCode: settingsContext.authorityCode,
              organisation: null,
              wardCode: null,
              parishCode: null,
              relatedPropertyCount: 0,
              relatedStreetCount: 0,
              blpuAppCrossRefs: newCrossRefs,
              blpuProvenances: newProvenances,
              blpuNotes: newNotes,
              lpis: newLpis,
            });

          newErrorIds.push({ pkId: blpuPkId--, addressId: address.id, uprn: newUprn });
        }
      } else if (!haveEnoughUprns) {
        setMessageVariant(["range", "rangeChildren"].includes(variant) ? "noUprnsRange" : "noUprn");
        setOpenMessageDialog(true);
      }

      errorId.current = newErrorIds;

      return newProperties;
    } else return null;
  };

  /**
   * Method to create the properties from list of new properties.
   *
   * @param {Array} propertyData The list of new properties that need to be created.
   */
  const finishAndCreateProperty = (propertyData) => {
    savedProperty.current = null;

    if (propertyData) {
      setCreating(true);
      switch (variant) {
        case "range":
        case "rangeChildren":
          if (propertyData.length > 0) {
            savedProperty.current = [];
            totalRangeCount.current = propertyData.length;
            createdCount.current = 0;
            failedCount.current = 0;
            setHaveErrors(false);
            rangeErrors.current = null;
            failedRangeUprns.current = null;

            for (const propertyRecord of propertyData) {
              SaveProperty(
                propertyRecord,
                true,
                userContext.currentUser.token,
                propertyContext,
                settingsContext.isScottish
              ).then((result) => {
                if (result) {
                  createdCount.current++;
                  savedProperty.current.push(result);
                  setRangeProcessedCount(createdCount.current + failedCount.current);
                } else {
                  setHaveErrors(true);
                  failedCount.current++;
                  setRangeProcessedCount(createdCount.current + failedCount.current);
                }
              });
            }
          }
          break;

        default:
          if (propertyData.length === 1) {
            SaveProperty(
              propertyData[0],
              true,
              userContext.currentUser.token,
              propertyContext,
              settingsContext.isScottish
            ).then((result) => {
              if (result) {
                savedProperty.current = result;
                createdCount.current = 1;
                failedCount.current = 0;
                setFinaliseErrors([]);
                setFailedUprns([]);
                setHaveErrors(false);
                setCreating(false);
                setFinaliseOpen(true);
              }
            });
          }
          break;
      }
    }
  };

  /**
   * Event to handle when the next button is clicked.
   */
  const doNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  /**
   * Method to get the address details data.
   */
  const getAddressDetailsData = () => {
    let engData = null;
    let altLangData = null;

    const createBlankData = () => {
      if (isRange.current) {
        engData = {
          language: "ENG",
          rangeType: "",
          rangeText: "",
          rangeStartPrefix: "",
          rangeStartNumber: "",
          rangeStartSuffix: "",
          rangeEndPrefix: "",
          rangeEndNumber: "",
          rangeEndSuffix: "",
          numbering: 1,
          paoStartNumber: "",
          paoStartSuffix: "",
          paoEndNumber: "",
          paoEndSuffix: "",
          paoText: "",
          paoDetails: "",
          usrn: parent.usrn,
          postcodeRef: "",
          postTownRef: selectedTemplate.current.postTownRef,
          subLocalityRef: settingsContext.isScottish ? selectedTemplate.current.subLocalityRef : "",
          addressList: [],
        };

        setEngRangeAddressData(engData);
      } else {
        engData = {
          language: "ENG",
          saoStartNumber: "",
          saoStartSuffix: "",
          saoEndNumber: "",
          saoEndSuffix: "",
          saoText: "",
          paoStartNumber: "",
          paoStartSuffix: "",
          paoEndNumber: "",
          paoEndSuffix: "",
          paoText: "",
          paoDetails: "",
          usrn: parent.usrn,
          postcodeRef: "",
          postTownRef: selectedTemplate.current.postTownRef,
          subLocalityRef: settingsContext.isScottish ? selectedTemplate.current.subLocalityRef : "",
        };

        setEngSingleAddressData(engData);
      }

      if (settingsContext.isScottish) {
        if (isRange.current) {
          altLangData = {
            language: "GAE",
            rangeType: "",
            rangeText: "",
            rangeStartPrefix: "",
            rangeStartNumber: "",
            rangeStartSuffix: "",
            rangeEndPrefix: "",
            rangeEndNumber: "",
            rangeEndSuffix: "",
            numbering: 1,
            paoStartNumber: "",
            paoStartSuffix: "",
            paoEndNumber: "",
            paoEndSuffix: "",
            paoText: "",
            paoDetails: "",
            usrn: parent.usrn,
            postcodeRef: "",
            postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
            subLocalityRef: altLangSubLocalityRecord ? altLangSubLocalityRecord.subLocalityRef : "",
            addressList: [],
          };

          setAltLangRangeAddressData(altLangData);
        } else {
          altLangData = {
            language: "GAE",
            saoStartNumber: "",
            saoStartSuffix: "",
            saoEndNumber: "",
            saoEndSuffix: "",
            saoText: "",
            paoStartNumber: "",
            paoStartSuffix: "",
            paoEndNumber: "",
            paoEndSuffix: "",
            paoText: "",
            paoDetails: "",
            usrn: parent.usrn,
            postcodeRef: "",
            postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
            subLocalityRef: altLangSubLocalityRecord ? altLangSubLocalityRecord.subLocalityRef : "",
          };

          setAltLangSingleAddressData(altLangData);
        }
      } else if (settingsContext.isWelsh) {
        if (isRange.current) {
          altLangData = {
            language: "CYM",
            rangeType: "",
            rangeText: "",
            rangeStartPrefix: "",
            rangeStartNumber: "",
            rangeStartSuffix: "",
            rangeEndPrefix: "",
            rangeEndNumber: "",
            rangeEndSuffix: "",
            numbering: 1,
            paoStartNumber: "",
            paoStartSuffix: "",
            paoEndNumber: "",
            paoEndSuffix: "",
            paoText: "",
            paoDetails: "",
            usrn: parent.usrn,
            postcodeRef: "",
            postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
            subLocalityRef: "",
            addressList: [],
          };

          setAltLangRangeAddressData(altLangData);
        } else {
          altLangData = {
            language: "CYM",
            saoStartNumber: "",
            saoStartSuffix: "",
            saoEndNumber: "",
            saoEndSuffix: "",
            saoText: "",
            paoStartNumber: "",
            paoStartSuffix: "",
            paoEndNumber: "",
            paoEndSuffix: "",
            paoText: "",
            paoDetails: "",
            usrn: parent.usrn,
            postcodeRef: "",
            postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
            subLocalityRef: "",
          };

          setAltLangSingleAddressData(altLangData);
        }
      }

      if (altLangData) addressDetails.current = [engData, altLangData];
      else addressDetails.current = [engData];
    };

    async function GetParentInformation() {
      const propertyUrl = GetPropertyFromUPRNUrl(userContext.currentUser.token);

      const getPaoDetails = (parentRecord) => {
        return `${parentRecord.paoText ? parentRecord.paoText : ""}${
          parentRecord.paoText && (parentRecord.paoStartNumber || parentRecord.paoStartSuffix) ? ", " : ""
        }${parentRecord.paoStartNumber ? parentRecord.paoStartNumber : ""}${
          parentRecord.paoStartSuffix ? parentRecord.paoStartSuffix : ""
        }${
          (parentRecord.paoStartNumber || parentRecord.paoStartSuffix) &&
          (parentRecord.paoEndNumber || parentRecord.paoEndSuffix)
            ? "-"
            : ""
        }${parentRecord.paoEndNumber ? parentRecord.paoEndNumber : ""}${
          parentRecord.paoEndSuffix ? parentRecord.paoEndSuffix : ""
        }`;
      };

      if (propertyUrl) {
        const returnValue =
          parent && parent.uprn
            ? await fetch(`${propertyUrl.url}/${parent.uprn}`, {
                headers: propertyUrl.headers,
                crossDomain: true,
                method: "GET",
              })
                .then((res) => (res.ok ? res : Promise.reject(res)))
                .then((res) => res.json())
                .then(
                  (result) => {
                    return result;
                  },
                  (error) => {
                    console.error("[ERROR] Get Property data", error);
                    return null;
                  }
                )
            : null;

        if (returnValue) {
          const engParentLpi = returnValue.lpis
            .sort((a, b) => a.logicalStatus - b.logicalStatus)
            .filter((x) => x.language === "ENG");

          if (isRange.current) {
            engData = {
              language: "ENG",
              rangeType: "",
              rangeText: "",
              rangeStartPrefix: "",
              rangeStartNumber: "",
              rangeStartSuffix: "",
              rangeEndPrefix: "",
              rangeEndNumber: "",
              rangeEndSuffix: "",
              numbering: 1,
              paoStartNumber: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoStartNumber : "",
              paoStartSuffix: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoStartSuffix : "",
              paoEndNumber: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoEndNumber : "",
              paoEndSuffix: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoEndSuffix : "",
              paoText: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoText : "",
              paoDetails: engParentLpi && engParentLpi.length > 0 ? getPaoDetails(engParentLpi[0]) : "",
              usrn: parent.usrn,
              postcodeRef: "",
              postTownRef: selectedTemplate.current.postTownRef,
              subLocalityRef: selectedTemplate.current.subLocalityRef,
              addressList: [],
            };

            setEngRangeAddressData(engData);
          } else {
            engData = {
              language: "ENG",
              saoStartNumber: "",
              saoStartSuffix: "",
              saoEndNumber: "",
              saoEndSuffix: "",
              saoText: "",
              paoStartNumber: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoStartNumber : "",
              paoStartSuffix: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoStartSuffix : "",
              paoEndNumber: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoEndNumber : "",
              paoEndSuffix: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoEndSuffix : "",
              paoText: engParentLpi && engParentLpi.length > 0 ? engParentLpi[0].paoText : "",
              paoDetails: engParentLpi && engParentLpi.length > 0 ? getPaoDetails(engParentLpi[0]) : "",
              usrn: parent.usrn,
              postcodeRef: "",
              postTownRef: selectedTemplate.current.postTownRef,
              subLocalityRef: selectedTemplate.current.subLocalityRef,
            };

            setEngSingleAddressData(engData);
          }

          if (settingsContext.isScottish) {
            const gaeParentLpi = returnValue.lpis
              .sort((a, b) => a.logicalStatus - b.logicalStatus)
              .filter((x) => x.language === "GAE");

            if (isRange.current) {
              altLangData = {
                language: "GAE",
                rangeType: "",
                rangeText: "",
                rangeStartPrefix: "",
                rangeStartNumber: "",
                rangeStartSuffix: "",
                rangeEndPrefix: "",
                rangeEndNumber: "",
                rangeEndSuffix: "",
                numbering: 1,
                paoStartNumber: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoStartNumber : "",
                paoStartSuffix: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoStartSuffix : "",
                paoEndNumber: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoEndNumber : "",
                paoEndSuffix: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoEndSuffix : "",
                paoText: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoText : "",
                paoDetails: gaeParentLpi && gaeParentLpi.length > 0 ? getPaoDetails(gaeParentLpi[0]) : "",
                usrn: parent.usrn,
                postcodeRef: "",
                postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
                subLocalityRef: altLangSubLocalityRecord ? altLangSubLocalityRecord.subLocalityRef : "",
                addressList: [],
              };

              setAltLangRangeAddressData(altLangData);
            } else {
              altLangData = {
                language: "GAE",
                saoStartNumber: "",
                saoStartSuffix: "",
                saoEndNumber: "",
                saoEndSuffix: "",
                saoText: "",
                paoStartNumber: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoStartNumber : "",
                paoStartSuffix: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoStartSuffix : "",
                paoEndNumber: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoEndNumber : "",
                paoEndSuffix: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoEndSuffix : "",
                paoText: gaeParentLpi && gaeParentLpi.length > 0 ? gaeParentLpi[0].paoText : "",
                paoDetails: gaeParentLpi && gaeParentLpi.length > 0 ? getPaoDetails(gaeParentLpi[0]) : "",
                usrn: parent.usrn,
                postcodeRef: "",
                postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
                subLocalityRef: altLangSubLocalityRecord ? altLangSubLocalityRecord.subLocalityRef : "",
              };

              setAltLangSingleAddressData(altLangData);
            }
          } else if (settingsContext.isWelsh) {
            const cymParentLpi = returnValue.lpis
              .sort((a, b) => a.logicalStatus - b.logicalStatus)
              .filter((x) => x.language === "CYM");

            if (isRange.current) {
              altLangData = {
                language: "CYM",
                rangeType: "",
                rangeText: "",
                rangeStartPrefix: "",
                rangeStartNumber: "",
                rangeStartSuffix: "",
                rangeEndPrefix: "",
                rangeEndNumber: "",
                rangeEndSuffix: "",
                numbering: 1,
                paoStartNumber: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoStartNumber : "",
                paoStartSuffix: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoStartSuffix : "",
                paoEndNumber: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoEndNumber : "",
                paoEndSuffix: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoEndSuffix : "",
                paoText: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoText : "",
                paoDetails: cymParentLpi && cymParentLpi.length > 0 ? getPaoDetails(cymParentLpi[0]) : "",
                usrn: parent.usrn,
                postcodeRef: "",
                postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
                subLocalityRef: "",
                addressList: [],
              };

              setAltLangRangeAddressData(altLangData);
            } else {
              altLangData = {
                language: "CYM",
                saoStartNumber: "",
                saoStartSuffix: "",
                saoEndNumber: "",
                saoEndSuffix: "",
                saoText: "",
                paoStartNumber: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoStartNumber : "",
                paoStartSuffix: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoStartSuffix : "",
                paoEndNumber: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoEndNumber : "",
                paoEndSuffix: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoEndSuffix : "",
                paoText: cymParentLpi && cymParentLpi.length > 0 ? cymParentLpi[0].paoText : "",
                paoDetails: cymParentLpi && cymParentLpi.length > 0 ? getPaoDetails(cymParentLpi[0]) : "",
                usrn: parent.usrn,
                postcodeRef: "",
                postTownRef: altLangPostTownRecord ? altLangPostTownRecord.postTownRef : "",
                subLocalityRef: "",
              };

              setAltLangSingleAddressData(altLangData);
            }
          }
        } else createBlankData();
      }

      if (altLangData) addressDetails.current = [engData, altLangData];
      else addressDetails.current = [engData];
    }

    if (selectedTemplate.current) isRange.current = ![1, 9].includes(selectedTemplate.current.numberingSystem);

    const altLangPostTownRecord =
      selectedTemplate.current && (settingsContext.isScottish || settingsContext.isWelsh)
        ? lookupContext.currentLookups.postTowns.find((x) => x.linkedRef === selectedTemplate.current.postTownRef)
        : null;

    const altLangSubLocalityRecord =
      selectedTemplate.current && settingsContext.isScottish
        ? lookupContext.currentLookups.subLocalities.find(
            (x) => x.linkedRef === selectedTemplate.current.subLocalityRef
          )
        : null;

    if ((!isRange.current && !engSingleAddressData) || (isRange.current && !engRangeAddressData)) {
      if (parent.usrn) GetParentInformation();
      else createBlankData();
    }
  };

  /**
   * Method to determine if the address details are valid or not.
   *
   * @returns {boolean} True if the address details are valid; otherwise false.
   */
  const addressDetailsValid = () => {
    if (settingsContext.isScottish || settingsContext.isWelsh) {
      const engRecord = addressDetails.current.find((x) => x.language === "ENG");
      const altRecord = addressDetails.current.find((x) => x.language !== "ENG");

      if (language.current === "ENG") {
        if (isRange.current) {
          handleAddressDetailsChanged([
            {
              language: "ENG",
              rangeType: engRecord.rangeType,
              rangeText: engRecord.rangeText,
              rangeStartPrefix: engRecord.rangeStartPrefix,
              rangeStartNumber:
                engRecord.rangeStartNumber && Number(engRecord.rangeStartNumber) > 0
                  ? engRecord.rangeStartNumber
                  : null,
              rangeStartSuffix: engRecord.rangeStartSuffix,
              rangeEndPrefix: engRecord.rangeEndPrefix,
              rangeEndNumber:
                engRecord.rangeEndNumber && Number(engRecord.rangeEndNumber) > 0 ? engRecord.rangeEndNumber : null,
              rangeEndSuffix: engRecord.rangeEndSuffix,
              numbering: engRecord.numbering,
              paoStartNumber:
                engRecord.paoStartNumber && Number(engRecord.paoStartNumber) > 0 ? engRecord.paoStartNumber : null,
              paoStartSuffix: engRecord.paoStartSuffix,
              paoEndNumber:
                engRecord.paoEndNumber && Number(engRecord.paoEndNumber) > 0 ? engRecord.paoEndNumber : null,
              paoEndSuffix: engRecord.paoEndSuffix,
              paoText: engRecord.paoText,
              paoDetails: engRecord.paoDetails,
              usrn: engRecord.usrn,
              postcodeRef: engRecord.postcodeRef,
              postTownRef: engRecord.postTownRef,
              subLocalityRef: engRecord.subLocalityRef,
              addressList: engRecord.addressList,
            },
            {
              language: altRecord.language,
              rangeType: altRecord.rangeType,
              rangeText: !altRecord.rangeText ? engRecord.rangeText : altRecord.rangeText,
              rangeStartPrefix: altRecord.rangeStartPrefix,
              rangeStartNumber:
                altRecord.rangeStartNumber && Number(altRecord.rangeStartNumber) > 0
                  ? altRecord.rangeStartNumber
                  : null,
              rangeStartSuffix: altRecord.rangeStartSuffix,
              rangeEndPrefix: altRecord.rangeEndPrefix,
              rangeEndNumber:
                altRecord.rangeEndNumber && Number(altRecord.rangeEndNumber) > 0 ? altRecord.rangeEndNumber : null,
              rangeEndSuffix: altRecord.rangeEndSuffix,
              numbering: altRecord.numbering,
              paoStartNumber:
                altRecord.paoStartNumber && Number(altRecord.paoStartNumber) > 0 ? altRecord.paoStartNumber : null,
              paoStartSuffix: altRecord.paoStartSuffix,
              paoEndNumber:
                altRecord.paoEndNumber && Number(altRecord.paoEndNumber) > 0 ? altRecord.paoEndNumber : null,
              paoEndSuffix: altRecord.paoEndSuffix,
              paoText: !altRecord.paoText ? engRecord.paoText : altRecord.paoText,
              paoDetails: !altRecord.paoDetails ? engRecord.paoDetails : altRecord.paoDetails,
              usrn: altRecord.usrn,
              postcodeRef: altRecord.postcodeRef,
              postTownRef: altRecord.postTownRef,
              subLocalityRef: altRecord.subLocalityRef,
              addressList: altRecord.addressList,
            },
          ]);
        } else {
          handleAddressDetailsChanged([
            {
              language: "ENG",
              saoStartNumber:
                engRecord.saoStartNumber && Number(engRecord.saoStartNumber) > 0 ? engRecord.saoStartNumber : null,
              saoStartSuffix: engRecord.saoStartSuffix,
              saoEndNumber:
                engRecord.saoEndNumber && Number(engRecord.saoEndNumber) > 0 ? engRecord.saoEndNumber : null,
              saoEndSuffix: engRecord.saoEndSuffix,
              saoText: engRecord.saoText,
              paoStartNumber:
                engRecord.paoStartNumber && Number(engRecord.paoStartNumber) > 0 ? engRecord.paoStartNumber : null,
              paoStartSuffix: engRecord.paoStartSuffix,
              paoEndNumber:
                engRecord.paoEndNumber && Number(engRecord.paoEndNumber) > 0 ? engRecord.paoEndNumber : null,
              paoEndSuffix: engRecord.paoEndSuffix,
              paoText: engRecord.paoText,
              paoDetails: engRecord.paoDetails,
              usrn: engRecord.usrn,
              postcodeRef: engRecord.postcodeRef,
              postTownRef: engRecord.postTownRef,
              subLocalityRef: engRecord.subLocalityRef,
            },
            {
              language: altRecord.language,
              saoStartNumber:
                altRecord.saoStartNumber && Number(altRecord.saoStartNumber) > 0 ? altRecord.saoStartNumber : null,
              saoStartSuffix: altRecord.saoStartSuffix,
              saoEndNumber:
                altRecord.saoEndNumber && Number(altRecord.saoEndNumber) > 0 ? altRecord.saoEndNumber : null,
              saoEndSuffix: altRecord.saoEndSuffix,
              saoText: !altRecord.saoText ? engRecord.saoText : altRecord.saoText,
              paoStartNumber:
                altRecord.paoStartNumber && Number(altRecord.paoStartNumber) > 0 ? altRecord.paoStartNumber : null,
              paoStartSuffix: altRecord.paoStartSuffix,
              paoEndNumber:
                altRecord.paoEndNumber && Number(altRecord.paoEndNumber) > 0 ? altRecord.paoEndNumber : null,
              paoEndSuffix: altRecord.paoEndSuffix,
              paoText: !altRecord.paoText ? engRecord.paoText : altRecord.paoText,
              paoDetails: !altRecord.paoDetails ? engRecord.paoDetails : altRecord.paoDetails,
              usrn: altRecord.usrn,
              postcodeRef: altRecord.postcodeRef,
              postTownRef: altRecord.postTownRef,
              subLocalityRef: altRecord.subLocalityRef,
            },
          ]);
        }
      } else {
        if (isRange.current) {
          handleAddressDetailsChanged([
            {
              language: "ENG",
              rangeType: engRecord.rangeType,
              rangeText: !engRecord.rangeText ? altRecord.rangeText : engRecord.rangeText,
              rangeStartPrefix: engRecord.rangeStartPrefix,
              rangeStartNumber:
                engRecord.rangeStartNumber && Number(engRecord.rangeStartNumber) > 0
                  ? engRecord.rangeStartNumber
                  : null,
              rangeStartSuffix: engRecord.rangeStartSuffix,
              rangeEndPrefix: engRecord.rangeEndPrefix,
              rangeEndNumber:
                engRecord.rangeEndNumber && Number(engRecord.rangeEndNumber) > 0 ? engRecord.rangeEndNumber : null,
              rangeEndSuffix: engRecord.rangeEndSuffix,
              numbering: engRecord.numbering,
              paoStartNumber:
                engRecord.paoStartNumber && Number(engRecord.paoStartNumber) > 0 ? engRecord.paoStartNumber : null,
              paoStartSuffix: engRecord.paoStartSuffix,
              paoEndNumber:
                engRecord.paoEndNumber && Number(engRecord.paoEndNumber) > 0 ? engRecord.paoEndNumber : null,
              paoEndSuffix: engRecord.paoEndSuffix,
              paoText: !engRecord.paoText ? altRecord.paoText : altRecord.paoText,
              paoDetails: !engRecord.paoDetails ? altRecord.paoDetails : altRecord.paoDetails,
              usrn: engRecord.usrn,
              postcodeRef: engRecord.postcodeRef,
              postTownRef: engRecord.postTownRef,
              subLocalityRef: engRecord.subLocalityRef,
              addressList: engRecord.addressList,
            },
            {
              language: altRecord.language,
              rangeType: altRecord.rangeType,
              rangeText: altRecord.rangeText,
              rangeStartPrefix: altRecord.rangeStartPrefix,
              rangeStartNumber:
                altRecord.rangeStartNumber && Number(altRecord.rangeStartNumber) > 0
                  ? altRecord.rangeStartNumber
                  : null,
              rangeStartSuffix: altRecord.rangeStartSuffix,
              rangeEndPrefix: altRecord.rangeEndPrefix,
              rangeEndNumber:
                altRecord.rangeEndNumber && Number(altRecord.rangeEndNumber) > 0 ? altRecord.rangeEndNumber : null,
              rangeEndSuffix: altRecord.rangeEndSuffix,
              numbering: altRecord.numbering,
              paoStartNumber:
                altRecord.paoStartNumber && Number(altRecord.paoStartNumber) > 0 ? altRecord.paoStartNumber : null,
              paoStartSuffix: altRecord.paoStartSuffix,
              paoEndNumber:
                altRecord.paoEndNumber && Number(altRecord.paoEndNumber) > 0 ? altRecord.paoEndNumber : null,
              paoEndSuffix: altRecord.paoEndSuffix,
              paoText: altRecord.paoText,
              paoDetails: altRecord.paoDetails,
              usrn: altRecord.usrn,
              postcodeRef: altRecord.postcodeRef,
              postTownRef: altRecord.postTownRef,
              subLocalityRef: altRecord.subLocalityRef,
              addressList: altRecord.addressList,
            },
          ]);
        } else {
          handleAddressDetailsChanged([
            {
              language: "ENG",
              saoStartNumber:
                engRecord.saoStartNumber && Number(engRecord.saoStartNumber) > 0 ? engRecord.saoStartNumber : null,
              saoStartSuffix: engRecord.saoStartSuffix,
              saoEndNumber:
                engRecord.saoEndNumber && Number(engRecord.saoEndNumber) > 0 ? engRecord.saoEndNumber : null,
              saoEndSuffix: engRecord.saoEndSuffix,
              saoText: !engRecord.saoText ? altRecord.saoText : engRecord.saoText,
              paoStartNumber:
                engRecord.paoStartNumber && Number(engRecord.paoStartNumber) > 0 ? engRecord.paoStartNumber : null,
              paoStartSuffix: engRecord.paoStartSuffix,
              paoEndNumber:
                engRecord.paoEndNumber && Number(engRecord.paoEndNumber) > 0 ? engRecord.paoEndNumber : null,
              paoEndSuffix: engRecord.paoEndSuffix,
              paoText: !engRecord.paoText ? altRecord.paoText : engRecord.paoText,
              paoDetails: !engRecord.paoDetails ? altRecord.paoDetails : engRecord.paoDetails,
              usrn: engRecord.usrn,
              postcodeRef: engRecord.postcodeRef,
              postTownRef: engRecord.postTownRef,
              subLocalityRef: engRecord.subLocalityRef,
            },
            {
              language: altRecord.language,
              saoStartNumber:
                altRecord.saoStartNumber && Number(altRecord.saoStartNumber) > 0 ? altRecord.saoStartNumber : null,
              saoStartSuffix: altRecord.saoStartSuffix,
              saoEndNumber:
                altRecord.saoEndNumber && Number(altRecord.saoEndNumber) > 0 ? altRecord.saoEndNumber : null,
              saoEndSuffix: altRecord.saoEndSuffix,
              saoText: altRecord.saoText,
              paoStartNumber:
                altRecord.paoStartNumber && Number(altRecord.paoStartNumber) > 0 ? altRecord.paoStartNumber : null,
              paoStartSuffix: altRecord.paoStartSuffix,
              paoEndNumber:
                altRecord.paoEndNumber && Number(altRecord.paoEndNumber) > 0 ? altRecord.paoEndNumber : null,
              paoEndSuffix: altRecord.paoEndSuffix,
              paoText: altRecord.paoText,
              paoDetails: altRecord.paoDetails,
              usrn: altRecord.usrn,
              postcodeRef: altRecord.postcodeRef,
              postTownRef: altRecord.postTownRef,
              subLocalityRef: altRecord.subLocalityRef,
            },
          ]);
        }
      }
    }

    const addressDetailErrors = ValidateAddressDetails(
      addressDetails.current.find((x) => x.language === language.current),
      lookupContext.currentLookups,
      userContext.currentUser.token,
      settingsContext.isScottish,
      selectedTemplate.current.numberingSystem,
      selectedTemplate.current.templateUseType
    );

    setHaveErrors(addressDetailErrors.length > 0);

    setAddressErrors(addressDetailErrors);

    return addressDetailErrors.length === 0;
  };

  /**
   * Method to determine if the property details are valid or not.
   *
   * @returns {boolean} True if the property details are valid; otherwise false.
   */
  const propertyDetailsValid = () => {
    const propertyDetailErrors = ValidatePropertyDetails(
      blpuData,
      lpiData,
      classificationData,
      otherData,
      lookupContext.currentLookups,
      settingsContext.isScottish,
      addressDetails.current[0].postTownRef,
      addressDetails.current[0].postcodeRef
    );

    const havePropertyErrors =
      propertyDetailErrors.blpu.length > 0 ||
      propertyDetailErrors.lpi.length > 0 ||
      propertyDetailErrors.classification.length > 0 ||
      propertyDetailErrors.other.length > 0;

    setHaveErrors(havePropertyErrors);
    setPropertyErrors(propertyDetailErrors);

    return !havePropertyErrors;
  };

  /**
   * Method to determine if the cross reference data is valid or not.
   *
   * @returns {boolean} True if the cross reference data is valid; otherwise false.
   */
  const crossReferencesValid = () => {
    let haveCrossReferenceErrors = false;

    if (crossReferenceData && crossReferenceData.length > 0) {
      for (const crossReference of crossReferenceData) {
        const crossReferenceError = ValidateCrossReference(
          crossReference,
          lookupContext.currentLookups,
          settingsContext.isScottish
        );

        if (crossReferenceError && crossReferenceError.length > 0) {
          const newErrors =
            crossReferencesErrors && crossReferencesErrors.length > 0
              ? crossReferencesErrors.concat(crossReferenceError)
              : crossReferenceError.map((x) => x);

          setCrossReferencesErrors(newErrors);
          haveCrossReferenceErrors = true;
        }
      }
    }

    setHaveErrors(haveCrossReferenceErrors);
    return !haveCrossReferenceErrors;
  };

  /**
   * Method to get the map label for a given address.
   *
   * @param {object} address The address data to use to generate the label from.
   * @returns {string} The label to be used in the map for the address.
   */
  const getNewMapLabel = (address) => {
    if (!address.saoStartNumber && !address.saoStartSuffix && !address.saoText) {
      if (!address.paoEndNumber && !address.paoEndSuffix) {
        if ((address.paoStartNumber || address.paoStartSuffix) && !address.paoText)
          return `${address.paoStartNumber ? address.paoStartNumber : ""}${
            address.paoStartSuffix ? address.paoStartSuffix : ""
          }`;
        else if (!address.paoStartNumber && !address.paoStartSuffix && address.paoText) return address.paoText;
        else if ((address.paoStartNumber || address.paoStartSuffix) && address.paoText)
          return `${address.paoText}, ${address.paoStartNumber ? address.paoStartNumber : ""}${
            address.paoStartSuffix ? address.paoStartSuffix : ""
          }`;
      } else {
        if ((address.paoStartNumber || address.paoStartSuffix) && !address.paoText)
          return `${address.paoStartNumber ? address.paoStartNumber : ""}${
            address.paoStartSuffix ? address.paoStartSuffix : ""
          }-${address.paoEndNumber ? address.paoEndNumber : ""}${address.paoEndSuffix ? address.paoEndSuffix : ""}`;
        else if ((address.paoStartNumber || address.paoStartSuffix) && address.paoText)
          return `${address.paoText}, ${address.paoStartNumber ? address.paoStartNumber : ""}${
            address.paoStartSuffix ? address.paoStartSuffix : ""
          }-${address.paoEndNumber ? address.paoEndNumber : ""}${address.paoEndSuffix ? address.paoEndSuffix : ""}`;
      }
    } else {
      if (!address.saoEndNumber && !address.saoEndSuffix) {
        if ((address.saoStartNumber || address.saoStartSuffix) && !address.saoText)
          return `${address.saoStartNumber ? address.saoStartNumber : ""}${
            address.saoStartSuffix ? address.saoStartSuffix : ""
          }, ${address.paoDetails}`;
        else if (!address.saoStartNumber && !address.saoStartSuffix && address.saoText)
          return `${address.saoText}, ${address.paoDetails}`;
        else if ((address.saoStartNumber || address.saoStartSuffix) && address.saoText)
          return `${address.saoText}, ${address.saoStartNumber ? address.saoStartNumber : ""}${
            address.saoStartSuffix ? address.saoStartSuffix : ""
          }, ${address.paoDetails}`;
      } else {
        if ((address.saoStartNumber || address.saoStartSuffix) && !address.saoText)
          return `${address.saoStartNumber ? address.saoStartNumber : ""}${
            address.saoStartSuffix ? address.saoStartSuffix : ""
          }-${address.saoEndNumber ? address.saoEndNumber : ""}${address.saoEndSuffix ? address.saoEndSuffix : ""}, ${
            address.paoDetails
          }`;
        else if ((address.saoStartNumber || address.saoStartSuffix) && address.saoText)
          return `${address.saoText}, ${address.saoStartNumber ? address.saoStartNumber : ""}${
            address.saoStartSuffix ? address.saoStartSuffix : ""
          }-${address.saoEndNumber ? address.saoEndNumber : ""}${address.saoEndSuffix ? address.saoEndSuffix : ""}, ${
            address.paoDetails
          }`;
      }
    }
  };

  /**
   * Method to get the address for a new property.
   *
   * @param {object} address The property record to use to get the address from.
   * @param {string} mapLabel The map label for the given address.
   * @returns {string} The new address for the property.
   */
  const getNewAddress = (address, mapLabel) => {
    const streetDescriptorRecord = lookupContext.currentLookups.streetDescriptors.find(
      (x) => x.usrn === address.usrn && x.language === language
    );
    const postTownRecord = lookupContext.currentLookups.postTowns.find(
      (x) => x.postTownRef === address.postTownRef && x.language === address.language
    );
    const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === address.postcodeRef);

    return `${mapLabel}${streetDescriptorRecord ? " " : ""}${
      streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
    }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
      postcodeRecord ? " " : ""
    }${postcodeRecord ? postcodeRecord.postcode : ""}`;
  };

  /**
   * Event to handle when the next button is clicked.
   */
  const handleNext = () => {
    switch (activeStep) {
      case 0: // Select template
        if (selectedTemplate.current) {
          getAddressDetailsData();
          doNext();
        }
        break;

      case 1: // Address details
        if (addressDetailsValid()) {
          if (selectedTemplate.current) {
            if (!blpuData)
              setBlpuData(
                settingsContext.isScottish
                  ? {
                      logicalStatus: selectedTemplate.current.blpuLogicalStatus,
                      rpc: selectedTemplate.current.rpc,
                      state: selectedTemplate.current.state,
                      stateDate: selectedTemplate.current.state ? new Date() : null,
                      level: selectedTemplate.current.blpuLevel ? selectedTemplate.current.blpuLevel : 0,
                      startDate: new Date(),
                    }
                  : {
                      logicalStatus: selectedTemplate.current.blpuLogicalStatus,
                      rpc: selectedTemplate.current.rpc,
                      state: selectedTemplate.current.state,
                      stateDate: selectedTemplate.current.state ? new Date() : null,
                      classification: selectedTemplate.current.classification,
                      startDate: new Date(),
                    }
              );

            if (!lpiData)
              setLpiData({
                logicalStatus: selectedTemplate.current.lpiLogicalStatus,
                level: selectedTemplate.current.lpiLevel,
                officialAddress: selectedTemplate.current.officialAddressMaker,
                postallyAddressable: selectedTemplate.current.postallyAddressable,
                startDate: new Date(),
              });

            if (!classificationData)
              setClassificationData(
                settingsContext.isScottish
                  ? {
                      classification: selectedTemplate.current.classification,
                      classificationScheme: selectedTemplate.current.classificationScheme
                        ? selectedTemplate.current.classificationScheme
                        : OSGScheme,
                      startDate: new Date(),
                    }
                  : null
              );

            if (!otherData)
              setOtherData({
                provCode: selectedTemplate.current.provCode,
                provStartDate: selectedTemplate.current.provCode ? new Date() : null,
                note: selectedTemplate.current.note,
              });
          }
          doNext();
        }
        break;

      case 2: // Property details
        if (propertyDetailsValid()) {
          if (addressDetails.current) {
            const initialAddressPoints = [];

            for (const addressDetailRecord of addressDetails.current) {
              if (addressDetailRecord && addressDetailRecord.addressList) {
                for (const addressRecord of addressDetailRecord.addressList.filter((x) => x.included)) {
                  switch (variant) {
                    case "range":
                      initialAddressPoints.push({
                        id: `${addressDetailRecord.language}_${addressRecord.id}`,
                        language: addressDetailRecord.language,
                        addressDetails: {
                          id: addressRecord.id,
                          address: addressRecord.address,
                          mapLabel: addressRecord.mapLabel,
                          saoStartNumber: null,
                          saoStartSuffix: null,
                          saoEndNumber: null,
                          saoEndSuffix: null,
                          saoText: null,
                          paoStartNumber:
                            addressRecord.paoNumber && Number(addressRecord.paoNumber) > 0
                              ? addressRecord.paoNumber
                              : null,
                          paoStartSuffix: addressRecord.paoSuffix,
                          paoEndNumber: null,
                          paoEndSuffix: null,
                          paoText: addressRecord.paoText,
                          paoDetails: addressDetailRecord.paoDetails,
                          usrn: addressRecord.usrn,
                          postTownRef: addressRecord.postTownRef,
                          postcodeRef: addressRecord.postcodeRef,
                          subLocalityRef: addressRecord.subLocalityRef,
                          included: addressRecord.included,
                        },
                        blpu: blpuData,
                        lpi: lpiData,
                        classification: classificationData,
                        other: otherData,
                        parentUprn: null,
                        easting: null,
                        northing: null,
                      });
                      break;

                    case "rangeChildren":
                      initialAddressPoints.push({
                        id: `${addressDetailRecord.language}_${addressRecord.id}`,
                        language: addressDetailRecord.language,
                        addressDetails: {
                          id: addressRecord.id,
                          address: addressRecord.address,
                          mapLabel: addressRecord.mapLabel,
                          saoStartNumber:
                            addressRecord.saoNumber && Number(addressRecord.saoNumber) > 0
                              ? addressRecord.saoNumber
                              : null,
                          saoStartSuffix: addressRecord.saoSuffix,
                          saoEndNumber: null,
                          saoEndSuffix: null,
                          saoText: addressRecord.saoText,
                          paoStartNumber:
                            addressDetailRecord.paoStartNumber && Number(addressDetailRecord.paoStartNumber) > 0
                              ? addressDetailRecord.paoStartNumber
                              : null,
                          paoStartSuffix: addressDetailRecord.paoStartSuffix,
                          paoEndNumber:
                            addressDetailRecord.paoEndNumber && Number(addressDetailRecord.paoEndNumber) > 0
                              ? addressDetailRecord.paoEndNumber
                              : null,
                          paoEndSuffix: addressDetailRecord.paoEndSuffix,
                          paoText: addressDetailRecord.paoText,
                          paoDetails: addressDetailRecord.paoDetails,
                          usrn: addressRecord.usrn,
                          postTownRef: addressRecord.postTownRef,
                          postcodeRef: addressRecord.postcodeRef,
                          subLocalityRef: addressRecord.subLocalityRef,
                          included: addressRecord.included,
                        },
                        blpu: blpuData,
                        lpi: lpiData,
                        classification: classificationData,
                        other: otherData,
                        parentUprn: parent.uprn,
                        easting: parent.easting,
                        northing: parent.northing,
                      });
                      break;

                    default:
                      break;
                  }
                }
              } else {
                const newMapLabel = getNewMapLabel(addressDetailRecord);
                const newAddress = getNewAddress(addressDetailRecord, newMapLabel);

                switch (variant) {
                  case "property":
                    initialAddressPoints.push({
                      id: `${addressDetailRecord.language}_0`,
                      language: addressDetailRecord.language,
                      addressDetails: {
                        id: 0,
                        address: newAddress,
                        mapLabel: newMapLabel,
                        saoStartNumber:
                          addressDetailRecord.saoStartNumber && Number(addressDetailRecord.saoStartNumber) > 0
                            ? addressDetailRecord.saoStartNumber
                            : null,
                        saoStartSuffix: addressDetailRecord.saoStartSuffix,
                        saoEndNumber:
                          addressDetailRecord.saoEndNumber && Number(addressDetailRecord.saoEndNumber) > 0
                            ? addressDetailRecord.saoEndNumber
                            : null,
                        saoEndSuffix: addressDetailRecord.saoEndSuffix,
                        saoText: addressDetailRecord.saoText,
                        paoStartNumber:
                          addressDetailRecord.paoStartNumber && Number(addressDetailRecord.paoStartNumber) > 0
                            ? addressDetailRecord.paoStartNumber
                            : null,
                        paoStartSuffix: addressDetailRecord.paoStartSuffix,
                        paoEndNumber:
                          addressDetailRecord.paoEndNumber && Number(addressDetailRecord.paoEndNumber) > 0
                            ? addressDetailRecord.paoEndNumber
                            : null,
                        paoEndSuffix: addressDetailRecord.paoEndSuffix,
                        paoText: addressDetailRecord.paoText,
                        paoDetails: addressDetailRecord.paoDetails,
                        usrn: addressDetailRecord.usrn,
                        subLocalityRef: addressDetailRecord.subLocalityRef,
                        postTownRef: addressDetailRecord.postTownRef,
                        postcodeRef: addressDetailRecord.postcodeRef,
                        included: true,
                      },
                      blpu: blpuData,
                      lpi: lpiData,
                      classification: classificationData,
                      other: otherData,
                      parentUprn: null,
                      easting: null,
                      northing: null,
                    });
                    break;

                  case "child":
                    initialAddressPoints.push({
                      id: `${addressDetailRecord.language}_0`,
                      language: addressDetailRecord.language,
                      addressDetails: {
                        id: 0,
                        address: newAddress,
                        mapLabel: newMapLabel,
                        saoStartNumber:
                          addressDetailRecord.saoStartNumber && Number(addressDetailRecord.saoStartNumber) > 0
                            ? addressDetailRecord.saoStartNumber
                            : null,
                        saoStartSuffix: addressDetailRecord.saoStartSuffix,
                        saoEndNumber:
                          addressDetailRecord.saoEndNumber && Number(addressDetailRecord.saoEndNumber) > 0
                            ? addressDetailRecord.saoEndNumber
                            : null,
                        saoEndSuffix: addressDetailRecord.saoEndSuffix,
                        saoText: addressDetailRecord.saoText,
                        paoStartNumber:
                          addressDetailRecord.paoStartNumber && Number(addressDetailRecord.paoStartNumber) > 0
                            ? addressDetailRecord.paoStartNumber
                            : null,
                        paoStartSuffix: addressDetailRecord.paoStartSuffix,
                        paoEndNumber:
                          addressDetailRecord.paoEndNumber && Number(addressDetailRecord.paoEndNumber) > 0
                            ? addressDetailRecord.paoEndNumber
                            : null,
                        paoEndSuffix: addressDetailRecord.paoEndSuffix,
                        paoText: addressDetailRecord.paoText,
                        paoDetails: addressDetailRecord.paoDetails,
                        usrn: addressDetailRecord.usrn,
                        subLocalityRef: addressDetailRecord.subLocalityRef,
                        postTownRef: addressDetailRecord.postTownRef,
                        postcodeRef: addressDetailRecord.postcodeRef,
                        included: true,
                      },
                      blpu: blpuData,
                      lpi: lpiData,
                      classification: classificationData,
                      other: otherData,
                      parentUprn: parent.uprn,
                      easting: parent.easting,
                      northing: parent.northing,
                    });
                    break;

                  default:
                    break;
                }
              }
            }

            setAddressPoints(initialAddressPoints);
          }

          if (!placeOnMapData)
            setPlaceOnMapData({
              placeStyle: "point",
              areaStyle: "elliptical",
              startPoint: "top",
              direction: "clockwise",
            });

          if (
            selectedTemplate.current &&
            selectedTemplate.current.source &&
            (!crossReferenceData || crossReferenceData.length === 0)
          )
            setCrossReferenceData([
              {
                id: 1,
                sourceId: selectedTemplate.current.source,
                crossReference: null,
                startDate: new Date(),
              },
            ]);

          doNext();
        }
        break;

      case 3: // Cross references
        if (crossReferencesValid()) doNext();
        break;

      case 4: // Map placement
        if (steps.length === 5) {
          createdCount.current = 0;
          failedCount.current = 0;
          getPropertyData().then((result) => {
            if (result && Array.isArray(result)) finishAndCreateProperty(result);
          });
          // finishAndCreateProperty(getPropertyData());
        } else doNext();
        break;

      case 5: // Finalise
        createdCount.current = 0;
        failedCount.current = 0;
        setViewErrors(false);
        getPropertyData().then((result) => {
          if (result && Array.isArray(result)) finishAndCreateProperty(result);
        });
        // finishAndCreateProperty(getPropertyData());
        break;

      default:
        break;
    }
  };

  /**
   * Event to handle when the back button is clicked.
   */
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * Event to handle when the skip button is clicked.
   */
  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setCrossReferenceData([]);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  /**
   * Method to get the wizard title dependant on the variant.
   *
   * @returns {string} The wizard title.
   */
  const getTitle = () => {
    if (parent) {
      switch (variant) {
        case "property":
          return `Property creation: ${streetToTitleCase(parent.address)}`;

        case "child":
          return `Child creation: ${addressToTitleCase(parent.address, parent.postcode)}`;

        case "range":
          return `Property range creation: ${streetToTitleCase(parent.address)}`;

        case "rangeChildren":
          return `Child range creation: ${addressToTitleCase(parent.address, parent.postcode)}`;

        default:
          return steps[activeStep];
      }
    } else return steps[activeStep];
  };

  /**
   * Event to handle when a template is selected.
   *
   * @param {number} pkId The id og the template that was selected.
   */
  const handleTemplateSelected = (pkId) => {
    const template = settingsContext.propertyTemplates.find((x) => x.templatePkId === pkId);

    if (template) {
      // If the template has changed reset all the data and errors
      if (!selectedTemplate.current || template.templatePkId !== selectedTemplate.current.templatePkId) {
        setEngSingleAddressData(null);
        setAltLangSingleAddressData(null);
        setEngRangeAddressData(null);
        setAltLangRangeAddressData(null);
        setBlpuData(null);
        setLpiData(null);
        setClassificationData(null);
        setOtherData(null);
        setCrossReferenceData([]);

        setHaveErrors(false);
        setAddressErrors(null);
        setPropertyErrors(null);
        setCrossReferencesErrors(null);
      }

      selectedTemplate.current = template;
      handleNext();
    } else selectedTemplate.current = null;
  };

  /**
   * Event to handle when the address details data changes.
   *
   * @param {Array} data The updated address details data.
   */
  const handleAddressDetailsChanged = (data) => {
    addressDetails.current = data;

    const engDataRecord = data.find((x) => x.language === "ENG");

    if (engDataRecord) {
      if (isRange.current) setEngRangeAddressData(engDataRecord);
      else setEngSingleAddressData(engDataRecord);
    }

    if (settingsContext.isScottish || settingsContext.isWelsh) {
      const altLangDataRecord = data.find((x) => x.language !== "ENG");

      if (altLangDataRecord) {
        if (isRange.current) setAltLangRangeAddressData(altLangDataRecord);
        else setAltLangSingleAddressData(altLangDataRecord);
      }
    }
  };

  /**
   * Event to handle when the language is changed.
   *
   * @param {string} newLanguage The new language flag.
   */
  const handleLanguageChanged = (newLanguage) => {
    language.current = newLanguage;
  };

  /**
   * Event to handle when the list of address detail errors change.
   *
   * @param {Array} addressDetailErrors The list of address detail errors.
   */
  const handleAddressDetailsErrorChanged = (addressDetailErrors) => {
    setHaveErrors(addressDetailErrors && addressDetailErrors.length > 0);
    setAddressErrors(addressDetailErrors);
  };

  /**
   * Event to handle when the property details data changes.
   *
   * @param {object} data The updated property details data.
   */
  const handlePropertyDetailsChanged = (data) => {
    if (data) {
      setBlpuData(data.blpu);
      setLpiData(data.lpi);
      setClassificationData(data.classification);
      setOtherData(data.other);
    }
  };

  /**
   * Event to handle when the list of property details errors change.
   *
   * @param {Array} propertyErrors The list of property details errors.
   */
  const handlePropertyDetailsErrorChanged = (propertyErrors) => {
    if (propertyErrors) {
      setPropertyErrors(propertyErrors);
      setHaveErrors(
        propertyErrors &&
          ((propertyErrors.blpu && propertyErrors.blpu.length > 0) ||
            (propertyErrors.lpi && propertyErrors.lpi.length > 0) ||
            (propertyErrors.other && propertyErrors.other.length > 0))
      );
    }
  };

  /**
   * Event to handle when the cross reference data changes.
   *
   * @param {object} data The updated cross reference data.
   */
  const handleCrossReferencesChanged = (data) => {
    if (data) setCrossReferenceData(data);
    else setCrossReferenceData([]);
  };

  /**
   * Event to handle when the list of cross reference errors change.
   *
   * @param {Array} crossReferenceErrors The list of cross reference errors.
   */
  const handleCrossReferencesErrorChanged = (crossReferenceErrors) => {
    if (crossReferenceErrors) setCrossReferencesErrors(crossReferenceErrors);

    setHaveErrors(crossReferenceErrors && crossReferenceErrors.length > 0);
  };

  /**
   * Event to handle when the place on map data changes.
   *
   * @param {object} placeOnMapData The updated place on map data.
   */
  const handlePlaceOnMapDataChange = (placeOnMapData) => {
    if (placeOnMapData) setPlaceOnMapData(placeOnMapData);
  };

  /**
   * Event to handle when the finalise data changes.
   *
   * @param {Array} finaliseData The list of properties that will be created.
   */
  const handleFinaliseDataChange = (finaliseData) => {
    setAddressPoints(finaliseData);
  };

  /**
   * Event to handle when the list of finalise errors change.
   *
   * @param {Array} finaliseErrors The list of finalise errors.
   */
  const handleFinaliseErrorChanged = (finaliseErrors) => {
    setHaveErrors(finaliseErrors && finaliseErrors.length > 0);
  };

  /**
   * Method to get the required wizard page depending on the variant and active step.
   *
   * @returns {JSX.Element} The required wizard page.
   */
  const getWizardPage = () => {
    switch (variant) {
      case "property":
        switch (activeStep) {
          case 0: // Select template
            return <WizardSelectTemplatePage variant={variant} onTemplateSelected={handleTemplateSelected} />;

          case 1: // Address details
            return (
              <WizardAddressDetailsPage
                template={selectedTemplate.current}
                language={language.current}
                engSingleData={engSingleAddressData}
                altLangSingleData={altLangSingleAddressData}
                streetUsrn={parent.usrn}
                errors={addressErrors}
                onDataChanged={handleAddressDetailsChanged}
                onLanguageChanged={handleLanguageChanged}
                onErrorChanged={handleAddressDetailsErrorChanged}
              />
            );

          case 2: // Property details
            return (
              <WizardPropertyDetailsPage
                data={{ blpu: blpuData, lpi: lpiData, classification: classificationData, other: otherData }}
                errors={propertyErrors}
                onDataChanged={handlePropertyDetailsChanged}
                onErrorChanged={handlePropertyDetailsErrorChanged}
              />
            );

          case 3: // Cross references
            return (
              <WizardCrossReferencesPage
                data={crossReferenceData}
                errors={crossReferencesErrors}
                templateVariant={variant}
                onDataChanged={handleCrossReferencesChanged}
                onErrorChanged={handleCrossReferencesErrorChanged}
              />
            );

          case 4: // Map placement
            return (
              <WizardMapPlacementPage
                data={addressPoints}
                creating={creating}
                placeOnMapData={placeOnMapData}
                onPlaceOnMapDataChange={handlePlaceOnMapDataChange}
              />
            );

          default:
            return null;
        }

      case "child":
        switch (activeStep) {
          case 0: // Select template
            return <WizardSelectTemplatePage variant={variant} onTemplateSelected={handleTemplateSelected} />;

          case 1: // Address details
            return (
              <WizardAddressDetailsPage
                template={selectedTemplate.current}
                language={language.current}
                engSingleData={engSingleAddressData}
                altLangSingleData={altLangSingleAddressData}
                streetUsrn={parent.usrn}
                parentUprn={parent.uprn}
                errors={addressErrors}
                onDataChanged={handleAddressDetailsChanged}
                onLanguageChanged={handleLanguageChanged}
                onErrorChanged={handleAddressDetailsErrorChanged}
              />
            );

          case 2: // Property details
            return (
              <WizardPropertyDetailsPage
                data={{ blpu: blpuData, lpi: lpiData, classification: classificationData, other: otherData }}
                errors={propertyErrors}
                onDataChanged={handlePropertyDetailsChanged}
                onErrorChanged={handlePropertyDetailsErrorChanged}
              />
            );

          case 3: // Cross references
            return (
              <WizardCrossReferencesPage
                data={crossReferenceData}
                errors={crossReferencesErrors}
                templateVariant={variant}
                onDataChanged={handleCrossReferencesChanged}
                onErrorChanged={handleCrossReferencesErrorChanged}
              />
            );

          case 4: // Map placement
            return (
              <WizardMapPlacementPage
                data={addressPoints}
                placeOnMapData={placeOnMapData}
                isChild
                creating={creating}
                onPlaceOnMapDataChange={handlePlaceOnMapDataChange}
              />
            );

          default:
            return null;
        }

      case "range":
        switch (activeStep) {
          case 0: // Select template
            return <WizardSelectTemplatePage variant={variant} onTemplateSelected={handleTemplateSelected} />;

          case 1: // Address details
            return (
              <WizardAddressDetailsPage
                template={selectedTemplate.current}
                language={language.current}
                engRangeData={engRangeAddressData}
                altLangRangeData={altLangRangeAddressData}
                streetUsrn={parent.usrn}
                isRange
                errors={addressErrors}
                onDataChanged={handleAddressDetailsChanged}
                onLanguageChanged={handleLanguageChanged}
                onErrorChanged={handleAddressDetailsErrorChanged}
              />
            );

          case 2: // Property details
            return (
              <WizardPropertyDetailsPage
                data={{ blpu: blpuData, lpi: lpiData, classification: classificationData, other: otherData }}
                errors={propertyErrors}
                onDataChanged={handlePropertyDetailsChanged}
                onErrorChanged={handlePropertyDetailsErrorChanged}
              />
            );

          case 3: // Cross references
            return (
              <WizardCrossReferencesPage
                data={crossReferenceData}
                errors={crossReferencesErrors}
                templateVariant={variant}
                onDataChanged={handleCrossReferencesChanged}
                onErrorChanged={handleCrossReferencesErrorChanged}
              />
            );

          case 4: // Map placement
            return (
              <WizardMapPlacementPage
                data={addressPoints}
                placeOnMapData={placeOnMapData}
                isRange
                creating={creating}
                onPlaceOnMapDataChange={handlePlaceOnMapDataChange}
              />
            );

          case 5: // Finalise
            return (
              <WizardFinalisePage
                data={addressPoints}
                errors={finaliseErrors}
                creating={creating}
                onDataChange={handleFinaliseDataChange}
                onErrorChanged={handleFinaliseErrorChanged}
              />
            );

          default:
            return null;
        }

      case "rangeChildren":
        switch (activeStep) {
          case 0: // Select template
            return <WizardSelectTemplatePage variant={variant} onTemplateSelected={handleTemplateSelected} />;

          case 1: // Address details
            return (
              <WizardAddressDetailsPage
                template={selectedTemplate.current}
                language={language.current}
                engRangeData={engRangeAddressData}
                altLangRangeData={altLangRangeAddressData}
                streetUsrn={parent.usrn}
                parentUprn={parent.uprn}
                isRange
                errors={addressErrors}
                onDataChanged={handleAddressDetailsChanged}
                onLanguageChanged={handleLanguageChanged}
                onErrorChanged={handleAddressDetailsErrorChanged}
              />
            );

          case 2: // Property details
            return (
              <WizardPropertyDetailsPage
                data={{ blpu: blpuData, lpi: lpiData, classification: classificationData, other: otherData }}
                errors={propertyErrors}
                onDataChanged={handlePropertyDetailsChanged}
                onErrorChanged={handlePropertyDetailsErrorChanged}
              />
            );

          case 3: // Cross references
            return (
              <WizardCrossReferencesPage
                data={crossReferenceData}
                errors={crossReferencesErrors}
                templateVariant={variant}
                onDataChanged={handleCrossReferencesChanged}
                onErrorChanged={handleCrossReferencesErrorChanged}
              />
            );

          case 4: // Map placement
            return (
              <WizardMapPlacementPage
                data={addressPoints}
                placeOnMapData={placeOnMapData}
                isChild
                isRange
                creating={creating}
                onPlaceOnMapDataChange={handlePlaceOnMapDataChange}
              />
            );

          case 5: // Finalise
            return (
              <WizardFinalisePage
                data={addressPoints}
                errors={finaliseErrors}
                isChild
                creating={creating}
                onDataChange={handleFinaliseDataChange}
                onErrorChanged={handleFinaliseErrorChanged}
              />
            );

          default:
            return null;
        }

      default:
        return null;
    }
  };

  /**
   * Event to handle when the finalise page closes.
   *
   * @param {string} type The type of closure.
   */
  const handleFinaliseClose = (type) => {
    if (onDone && type !== "error") onDone({ type: type, variant: variant, savedProperty: savedProperty.current });
    setViewErrors(type === "error");
    setFinaliseOpen(false);
  };

  useEffect(() => {
    switch (variant) {
      case "range":
      case "rangeChildren":
        setSteps([
          "Select template",
          "Address details",
          "Property details",
          "Cross references",
          "Map placement",
          "Finalise",
        ]);
        break;

      default:
        setSteps(["Select template", "Address details", "Property details", "Cross references", "Map placement"]);
        break;
    }

    if (isOpen) {
      // Initialise everything
      setActiveStep(0);
      setSkipped(new Set());
      setAddressErrors([]);
      setPropertyErrors([]);
      setFinaliseErrors([]);
      setFailedUprns([]);
      setHaveErrors(false);
      setCreating(false);

      setEngSingleAddressData(null);
      setAltLangSingleAddressData(null);
      setEngRangeAddressData(null);
      setAltLangRangeAddressData(null);
      setBlpuData(null);
      setLpiData(null);
      setClassificationData(null);
      setOtherData(null);
      setCrossReferenceData([]);
      setAddressPoints(null);
      setPlaceOnMapData(null);
      setFinaliseOpen(false);
      setRangeProcessedCount(0);
      setFinaliseVariant(variant);
      setViewErrors(false);

      selectedTemplate.current = null;
      addressDetails.current = null;
      language.current = "ENG";
      isRange.current = false;
      errorId.current = null;
      savedProperty.current = null;
      rangeErrors.current = null;
      failedRangeUprns.current = null;
      totalRangeCount.current = 0;
      createdCount.current = 0;
      failedCount.current = 0;
    }

    setShowDialog(isOpen);
    setFinaliseVariant(variant);
  }, [variant, isOpen]);

  useEffect(() => {
    if (mapContext.currentWizardPoint && addressPoints) {
      let updatedAddressPoints = [];
      let updateRequired = false;

      if (!mapContext.currentWizardPoint.pointId) {
        for (const addressPoint of addressPoints) {
          updateRequired =
            updateRequired ||
            mapContext.currentWizardPoint.x !== addressPoint.easting ||
            mapContext.currentWizardPoint.y !== addressPoint.northing;

          updatedAddressPoints.push({
            id: addressPoint.id,
            language: addressPoint.language,
            addressDetails: addressPoint.addressDetails,
            blpu: addressPoint.blpu,
            lpi: addressPoint.lpi,
            classification: addressPoint.classification,
            other: addressPoint.other,
            parentUprn: addressPoint.parentUprn,
            easting: mapContext.currentWizardPoint.x,
            northing: mapContext.currentWizardPoint.y,
          });
        }
      } else {
        const addressPoint = addressPoints.find((x) => x.id === mapContext.currentWizardPoint.pointId);
        if (addressPoint) {
          updateRequired =
            updateRequired ||
            mapContext.currentWizardPoint.x !== addressPoint.easting ||
            mapContext.currentWizardPoint.y !== addressPoint.northing;

          updatedAddressPoints = addressPoints.map(
            (x) =>
              [
                {
                  id: addressPoint.id,
                  language: addressPoint.language,
                  addressDetails: addressPoint.addressDetails,
                  blpu: addressPoint.blpu,
                  lpi: addressPoint.lpi,
                  classification: addressPoint.classification,
                  other: addressPoint.other,
                  parentUprn: addressPoint.parentUprn,
                  easting: mapContext.currentWizardPoint.x,
                  northing: mapContext.currentWizardPoint.y,
                },
              ].find((rec) => rec.id === x.id) || x
          );
        }
      }

      if (updateRequired) setAddressPoints(updatedAddressPoints);
    }
  }, [mapContext.currentWizardPoint, addressPoints]);

  useEffect(() => {
    if (propertyContext.currentPropertyHasErrors && propertyContext.currentErrors) {
      switch (variant) {
        case "range":
        case "rangeChildren":
          const addressId = errorId.current.find((x) => x.pkId === propertyContext.currentErrors.pkId).addressId;
          const rangeUprn = errorId.current.find((x) => x.pkId === propertyContext.currentErrors.pkId).uprn;
          if (rangeErrors.current) rangeErrors.current.push({ id: addressId, errors: propertyContext.currentErrors });
          else rangeErrors.current = [{ id: addressId, errors: propertyContext.currentErrors }];
          if (Array.isArray(rangeErrors.current)) setFinaliseErrors(rangeErrors.current);
          else setFinaliseErrors([rangeErrors.current]);
          if (failedRangeUprns.current) failedRangeUprns.current.push(rangeUprn);
          else failedRangeUprns.current = [rangeUprn];
          if (Array.isArray(failedRangeUprns.current)) setFailedUprns(failedRangeUprns.current);
          else setFailedUprns([failedRangeUprns.current]);
          break;

        default:
          createdCount.current = 0;
          failedCount.current = 1;
          if (Array.isArray(propertyContext.currentErrors)) setFinaliseErrors(propertyContext.currentErrors);
          else setFinaliseErrors([propertyContext.currentErrors]);
          if (errorId.current && errorId.current.length) {
            const uprn = errorId.current.find((x) => x.pkId === propertyContext.currentErrors.pkId).uprn;
            returnFailedUprns([uprn], userContext.currentUser.token);
          }
          setHaveErrors(true);
          setCreating(false);
          setFinaliseOpen(true);
          break;
      }
    }
  }, [propertyContext.currentErrors, propertyContext.currentPropertyHasErrors, variant, userContext.currentUser.token]);

  useEffect(() => {
    if (
      totalRangeCount.current > 0 &&
      totalRangeCount.current === createdCount.current + failedCount.current &&
      ["range", "rangeChildren"].includes(variant)
    ) {
      setCreating(false);
      setFinaliseOpen(true);
    }
  }, [variant, rangeProcessedCount]);

  useEffect(() => {
    if (viewErrors && rangeErrors.current && rangeErrors.current.length > 0) {
      const errorIds = settingsContext.isScottish
        ? [...rangeErrors.current.map((x) => x.id), ...rangeErrors.current.map((x) => x.id.replace("ENG", "GAE"))]
        : settingsContext.isWelsh
        ? [...rangeErrors.current.map((x) => x.id), ...rangeErrors.current.map((x) => x.id.replace("ENG", "CYM"))]
        : rangeErrors.current.map((x) => x.id);

      if (errorIds && addressPoints && errorIds.length > 0 && errorIds.length !== addressPoints.length) {
        const errorAddressPoints = addressPoints.filter((x) => errorIds.includes(x.id));

        setAddressPoints(errorAddressPoints);
      }
      if (failedUprns && failedUprns.length) returnFailedUprns(failedUprns, userContext.currentUser.token);
    }
  }, [
    viewErrors,
    addressPoints,
    settingsContext.isScottish,
    settingsContext.isWelsh,
    failedUprns,
    userContext.currentUser.token,
  ]);

  return (
    <Fragment>
      <Dialog
        open={showDialog}
        aria-labelledby="add-property-wizard-dialog"
        fullScreen
        onClose={handleDialogClose}
        TransitionComponent={Transition}
      >
        <DialogTitle
          id="add-property-wizard-dialog"
          sx={{ ...dialogTitleStyle, mb: "0px", height: `${wizardStepperHeight}px` }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            spacing={1}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Tooltip title="Close" sx={tooltipStyle}>
              <IconButton aria-label="close" onClick={handleCancelClick}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography
              sx={{
                flexGrow: 1,
                display: "none",
                pl: "8px",
                pr: "8px",
                [theme.breakpoints.up("sm")]: {
                  display: "block",
                },
              }}
              variant="subtitle1"
              noWrap
              align="left"
            >
              {getTitle()}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: adsOffWhite }}>{getWizardPage()}</DialogContent>
        <DialogActions
          sx={{
            borderTopWidth: "4px",
            borderTopStyle: "solid",
            borderTopColor: adsBlueA,
            justifyContent: "flex-start",
            mb: theme.spacing(1),
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: `${wizardStepperHeight}px`,
              ml: theme.spacing(2),
              mr: theme.spacing(2),
              mt: theme.spacing(1),
            }}
          >
            <Stack direction="column" spacing={2}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {activeStep > 0 && (
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Button
                    onClick={handleBack}
                    autoFocus
                    disabled={creating}
                    variant="contained"
                    sx={whiteButtonStyle}
                    startIcon={<ArrowBackIcon />}
                  >
                    Back
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                    {isStepOptional(activeStep) && (
                      <Button
                        onClick={handleSkip}
                        autoFocus
                        disabled={creating}
                        variant="contained"
                        sx={blueButtonStyle}
                        startIcon={<SkipNextIcon />}
                      >
                        Skip
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      autoFocus
                      disabled={creating}
                      variant="contained"
                      sx={haveErrors ? redButtonStyle : blueButtonStyle}
                      startIcon={
                        activeStep === steps.length - 1 ? null : haveErrors ? <ErrorIcon /> : <ArrowForwardIcon />
                      }
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Box>
        </DialogActions>
      </Dialog>
      <WizardFinaliseDialog
        open={finaliseOpen}
        variant={finaliseVariant}
        errors={finaliseErrors}
        createdCount={createdCount.current}
        failedCount={failedCount.current}
        onClose={handleFinaliseClose}
      />
      <MessageDialog isOpen={openMessageDialog} variant={messageVariant} onClose={handleMessageDialogClose} />
    </Fragment>
  );
}

export default AddPropertyWizardDialog;
