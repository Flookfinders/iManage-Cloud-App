/* #region header */
/**************************************************************************************************
//
//  Description: Plot to Postal Wizard Dialog
//
//  Copyright:   © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.1.0 changes
//    001   15.10.24 Sean Flook      IMANN-1012 Initial Revision.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    002   13.11.24 Sean Flook      IMANN-1012 Use the correct validation.
//    003   14.11.24 Sean Flook      IMANN-1012 Only set the alt fields if required for Scottish authorities.
//    004   18.11.24 Sean Flook      IMANN-1056 Use the new getPropertyListDetails method.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { forwardRef, useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "./../context/lookupContext";
import PropertyContext from "../context/propertyContext";
import UserContext from "../context/userContext";

import { GetCurrentDate, getLookupLinkedRef } from "../utils/HelperUtils";
import { ValidatePlotPropertyDetails } from "../utils/WizardValidation";
import {
  addressToTitleCase,
  getPropertyListDetails,
  GetPropertyMapData,
  GetTempAddress,
  SaveProperty,
} from "../utils/PropertyUtils";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Slide,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";

import MessageDialog from "./MessageDialog";
import WizardFinaliseDialog from "./WizardFinaliseDialog";

import PlotToPostalDetailsPage from "../pages/PlotToPostalDetailsPage";
import PlotToPostalAddressesPage from "../pages/PlotToPostalAddressesPage";
import PlotToPostalFinalisePage from "../pages/PlotToPostalFinalisePage";

import { OSGScheme } from "../data/OSGClassification";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ErrorIcon from "@mui/icons-material/Error";

import {
  blueButtonStyle,
  dialogTitleStyle,
  redButtonStyle,
  tooltipStyle,
  whiteButtonStyle,
  wizardStepperHeight,
} from "../utils/ADSStyles";
import { adsBlueA, adsOffWhite } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

MultiEditPlotToPostalWizardDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function MultiEditPlotToPostalWizardDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);
  const propertyContext = useContext(PropertyContext);
  const userContext = useContext(UserContext);

  const [showDialog, setShowDialog] = useState(false);
  const [steps, setSteps] = useState(["No steps"]);
  const [activeStep, setActiveStep] = useState(0);
  const [propertyErrors, setPropertyErrors] = useState([]);
  const [addressErrors, setAddressErrors] = useState([]);

  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [messageVariant, setMessageVariant] = useState("cancelWizard");

  const [updating, setUpdating] = useState(false);
  const [haveErrors, setHaveErrors] = useState(false);
  const [viewErrors, setViewErrors] = useState(false);
  const [finaliseOpen, setFinaliseOpen] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const [blpuData, setBlpuData] = useState(null);
  const [lpiData, setLpiData] = useState(null);
  const [otherData, setOtherData] = useState(null);

  const [updatedAddresses, setUpdatedAddresses] = useState([]);
  const [allAddressesUpdated, setAllAddressesUpdated] = useState(false);

  const [finaliseData, setFinaliseData] = useState([]);
  const [finaliseChecked, setFinaliseChecked] = useState([]);
  const [finaliseErrors, setFinaliseErrors] = useState([]);

  const errorId = useRef(null);
  const savedProperty = useRef(null);
  const saveErrors = useRef(null);
  const totalCount = useRef(0);
  const createdCount = useRef(0);
  const failedCount = useRef(0);

  /**
   * Method to get the list of updated properties.
   *
   * @returns {Array|null} A list of the updated properties.
   */
  const getPropertyData = async () => {
    if (finaliseData) {
      const newProperties = [];
      const newErrorIds = [];

      for (const property of finaliseData) {
        const existingProperty = await GetPropertyMapData(property.uprn, userContext);
        if (existingProperty) {
          const maxDualLanguageLink =
            existingProperty.lpis && existingProperty.lpis.length > 0
              ? existingProperty.lpis.reduce((prev, curr) =>
                  (prev.dualLanguageLink ? prev.dualLanguageLink : 0) >
                  (curr.dualLanguageLink ? curr.dualLanguageLink : 0)
                    ? prev
                    : curr
                )
              : 0;

          const newLpis = existingProperty.lpis.map((x) =>
            settingsContext.isScottish
              ? {
                  startDate: x.startDate,
                  endDate:
                    !x.endDate && [7, 8, 9].includes(property.originalLpiLogicalStatus) ? GetCurrentDate() : x.endDate,
                  saoStartNumber: x.saoStartNumber,
                  saoEndNumber: x.saoEndNumber,
                  saoText: x.saoText,
                  paoStartNumber: x.paoStartNumber,
                  paoEndNumber: x.paoEndNumber,
                  paoText: x.paoText,
                  usrn: x.usrn,
                  postcodeRef: x.postcodeRef,
                  postTownRef: x.postTownRef,
                  neverExport: x.neverExport,
                  postTown: x.postTown,
                  postcode: x.postcode,
                  dualLanguageLink: x.dualLanguageLink,
                  pkId: x.pkId,
                  changeType: "U",
                  lpiKey: x.lpiKey,
                  uprn: x.uprn,
                  logicalStatus: property.originalLpiLogicalStatus,
                  language: x.language,
                  paoStartSuffix: x.paoStartSuffix,
                  paoEndSuffix: x.paoEndSuffix,
                  saoStartSuffix: x.saoStartSuffix,
                  saoEndSuffix: x.saoEndSuffix,
                  subLocalityRef: x.subLocalityRef,
                  subLocality: x.subLocality,
                  postallyAddressable: x.postallyAddressable,
                  officialFlag: x.officialFlag,
                }
              : {
                  startDate: x.startDate,
                  endDate:
                    !x.endDate && [7, 8, 9].includes(property.originalLpiLogicalStatus) ? GetCurrentDate() : x.endDate,
                  saoStartNumber: x.saoStartNumber,
                  saoEndNumber: x.saoEndNumber,
                  saoText: x.saoText,
                  paoStartNumber: x.paoStartNumber,
                  paoEndNumber: x.paoEndNumber,
                  paoText: x.paoText,
                  usrn: x.usrn,
                  postcodeRef: x.postcodeRef,
                  postTownRef: x.postTownRef,
                  neverExport: x.neverExport,
                  postTown: x.postTown,
                  postcode: x.postcode,
                  dualLanguageLink: x.dualLanguageLink,
                  pkId: x.pkId,
                  uprn: x.uprn,
                  changeType: "U",
                  lpiKey: x.lpiKey,
                  logicalStatus: property.originalLpiLogicalStatus,
                  language: x.language,
                  paoStartSuffix: x.paoStartSuffix,
                  paoEndSuffix: x.paoEndSuffix,
                  saoStartSuffix: x.saoStartSuffix,
                  saoEndSuffix: x.saoEndSuffix,
                  level: x.level,
                  postalAddress: x.postalAddress,
                  officialFlag: x.officialFlag,
                }
          );

          let lpiPkId = -10;

          if (settingsContext.isWelsh) {
            newLpis.push({
              startDate: property.startDate,
              endDate: null,
              saoStartNumber: property.saoStartNumber,
              saoEndNumber: property.saoEndNumber,
              saoText: property.saoText,
              paoStartNumber: property.paoStartNumber,
              paoEndNumber: property.paoEndNumber,
              paoText: property.paoText,
              usrn: property.usrn,
              postcodeRef: property.postcodeRef,
              postTownRef: property.postTownRef,
              neverExport: property.neverExport,
              postTown: null,
              postcode: null,
              dualLanguageLink: maxDualLanguageLink ? maxDualLanguageLink.dualLanguageLink + 1 : 0,
              pkId: lpiPkId--,
              uprn: property.uprn,
              changeType: "I",
              lpiKey: null,
              logicalStatus: property.newLpiLogicalStatus,
              language: property.language,
              paoStartSuffix: property.paoStartSuffix,
              paoEndSuffix: property.paoEndSuffix,
              saoStartSuffix: property.saoStartSuffix,
              saoEndSuffix: property.saoEndSuffix,
              level: property.level,
              postalAddress: property.postallyAddressable,
              officialFlag: property.officialAddress,
            });

            newLpis.push({
              startDate: property.startDate,
              endDate: null,
              saoStartNumber: property.saoStartNumber,
              saoEndNumber: property.saoEndNumber,
              saoText: property.altLangSaoText,
              paoStartNumber: property.paoStartNumber,
              paoEndNumber: property.paoEndNumber,
              paoText: property.altLangPaoText,
              usrn: property.usrn,
              postcodeRef: property.postcodeRef,
              postTownRef: property.altLangPostTownRef,
              neverExport: property.neverExport,
              postTown: null,
              postcode: null,
              dualLanguageLink: maxDualLanguageLink ? maxDualLanguageLink.dualLanguageLink + 1 : 0,
              pkId: lpiPkId--,
              uprn: property.uprn,
              changeType: "I",
              lpiKey: null,
              logicalStatus: property.newLpiLogicalStatus,
              language: property.altLangLanguage,
              paoStartSuffix: property.altLangPaoStartSuffix,
              paoEndSuffix: property.altLangPaoEndSuffix,
              saoStartSuffix: property.altLangSaoStartSuffix,
              saoEndSuffix: property.altLangSaoEndSuffix,
              level: property.level,
              postalAddress: property.postallyAddressable,
              officialFlag: property.officialAddress,
            });
          } else if (settingsContext.isScottish) {
            newLpis.push({
              startDate: property.startDate,
              endDate: null,
              saoStartNumber: property.saoStartNumber,
              saoEndNumber: property.saoEndNumber,
              saoText: property.saoText,
              paoStartNumber: property.paoStartNumber,
              paoEndNumber: property.paoEndNumber,
              paoText: property.paoText,
              usrn: property.usrn,
              postcodeRef: property.postcodeRef,
              postTownRef: property.postTownRef,
              neverExport: property.neverExport,
              postTown: null,
              postcode: null,
              dualLanguageLink: 0,
              pkId: lpiPkId--,
              changeType: "I",
              lpiKey: null,
              uprn: property.uprn,
              logicalStatus: property.newLpiLogicalStatus,
              language: property.language,
              paoStartSuffix: property.paoStartSuffix,
              paoEndSuffix: property.paoEndSuffix,
              saoStartSuffix: property.saoStartSuffix,
              saoEndSuffix: property.saoEndSuffix,
              subLocalityRef: property.subLocalityRef,
              subLocality: null,
              postallyAddressable: property.postallyAddressable,
              officialFlag: property.officialAddress,
            });

            if (otherData.createGaelic) {
              newLpis.push({
                startDate: property.startDate,
                endDate: null,
                saoStartNumber: property.saoStartNumber,
                saoEndNumber: property.saoEndNumber,
                saoText: property.altLangSaoText,
                paoStartNumber: property.paoStartNumber,
                paoEndNumber: property.paoEndNumber,
                paoText: property.altLangPaoText,
                usrn: property.usrn,
                postcodeRef: property.postcodeRef,
                postTownRef: property.altLangPostTownRef,
                neverExport: property.neverExport,
                postTown: null,
                postcode: null,
                dualLanguageLink: 0,
                pkId: lpiPkId--,
                changeType: "I",
                lpiKey: null,
                uprn: property.uprn,
                logicalStatus: property.newLpiLogicalStatus,
                language: property.altLangLanguage,
                paoStartSuffix: property.altLangPaoStartSuffix,
                paoEndSuffix: property.altLangPaoEndSuffix,
                saoStartSuffix: property.altLangSaoStartSuffix,
                saoEndSuffix: property.altLangSaoEndSuffix,
                subLocalityRef: property.altLangSubLocalityRef,
                subLocality: null,
                postallyAddressable: property.postallyAddressable,
                officialFlag: property.officialAddress,
              });
            }
          } else {
            newLpis.push({
              startDate: property.startDate,
              endDate: null,
              saoStartNumber: property.saoStartNumber,
              saoEndNumber: property.saoEndNumber,
              saoText: property.saoText,
              paoStartNumber: property.paoStartNumber,
              paoEndNumber: property.paoEndNumber,
              paoText: property.paoText,
              usrn: property.usrn,
              postcodeRef: property.postcodeRef,
              postTownRef: property.postTownRef,
              neverExport: property.neverExport,
              postTown: null,
              postcode: null,
              dualLanguageLink: 0,
              pkId: lpiPkId--,
              uprn: property.uprn,
              changeType: "I",
              lpiKey: null,
              logicalStatus: property.newLpiLogicalStatus,
              language: property.language,
              paoStartSuffix: property.paoStartSuffix,
              paoEndSuffix: property.paoEndSuffix,
              saoStartSuffix: property.saoStartSuffix,
              saoEndSuffix: property.saoEndSuffix,
              level: property.level,
              postalAddress: property.postallyAddressable,
              officialFlag: property.officialAddress,
            });
          }

          let notePkId = -10;
          const newNotes = existingProperty.blpuNotes.map((x) => x);
          if (property.note) {
            if (Array.isArray(property.note)) {
              for (const singleNote of property.note) {
                newNotes.push({
                  pkId: notePkId--,
                  changeType: "I",
                  uprn: property.uprn,
                  note: singleNote,
                });
              }
            } else
              newNotes.push({
                pkId: notePkId--,
                changeType: "I",
                uprn: property.uprn,
                note: property.note,
              });
          }

          if (settingsContext.isScottish) {
            let newClassifications = existingProperty.classifications.map((x) => x);
            if (newClassifications.length === 0) {
              newClassifications.push({
                pkId: -10,
                classKey: null,
                changeType: "I",
                uprn: existingProperty.uprn,
                classificationScheme: OSGScheme,
                blpuClass: property.classification,
                startDate: GetCurrentDate(),
                endDate: null,
                neverExport: existingProperty.neverExport,
              });
            } else if (!newClassifications.find((x) => x.blpuClass === property.classification && !x.endDate)) {
              newClassifications = newClassifications.map((x) => (x.endDate ? x : { ...x, endDate: GetCurrentDate() }));

              newClassifications.push({
                pkId: -10,
                classKey: null,
                changeType: "I",
                uprn: existingProperty.uprn,
                classificationScheme: OSGScheme,
                blpuClass: property.classification,
                startDate: GetCurrentDate(),
                endDate: null,
                neverExport: existingProperty.neverExport,
              });
            }

            newProperties.push({
              blpuStateDate: blpuData.stateDate,
              parentUprn: existingProperty.parentUprn,
              cascadeToChild: false,
              neverExport: property.neverExport,
              siteSurvey: property.siteSurvey,
              uprn: existingProperty.uprn,
              logicalStatus: blpuData.logicalStatus,
              endDate: existingProperty.endDate,
              startDate: existingProperty.startDate,
              blpuState: blpuData.state,
              custodianCode: existingProperty.custodianCode,
              level: property.level,
              xcoordinate: existingProperty.xcoordinate,
              ycoordinate: existingProperty.ycoordinate,
              pkId: existingProperty.pkId,
              changeType: "U",
              rpc: blpuData.rpc,
              blpuAppCrossRefs: existingProperty.blpuAppCrossRefs,
              blpuProvenances: existingProperty.blpuProvenances,
              blpuNotes: newNotes,
              classifications: newClassifications,
              organisations: existingProperty.organisations,
              successorCrossRefs: existingProperty.successorCrossRefs,
              lpis: newLpis,
            });
          } else {
            newProperties.push({
              blpuStateDate: blpuData.stateDate,
              parentUprn: existingProperty.parentUprn,
              cascadeToChild: false,
              neverExport: property.neverExport,
              siteSurvey: property.siteSurvey,
              uprn: existingProperty.uprn,
              logicalStatus: blpuData.logicalStatus,
              endDate: existingProperty.endDate,
              blpuState: blpuData.state,
              startDate: existingProperty.startDate,
              blpuClass: property.classification,
              localCustodianCode: existingProperty.localCustodianCode,
              organisation: existingProperty.organisation,
              xcoordinate: existingProperty.xcoordinate,
              ycoordinate: existingProperty.ycoordinate,
              wardCode: existingProperty.wardCode,
              parishCode: existingProperty.parishCode,
              pkId: existingProperty.pkId,
              changeType: "U",
              rpc: blpuData.rpc,
              blpuAppCrossRefs: existingProperty.blpuAppCrossRefs,
              blpuProvenances: existingProperty.blpuProvenances,
              blpuNotes: newNotes,
              lpis: newLpis,
            });
          }

          newErrorIds.push({ pkId: existingProperty.pkId, addressId: property.id, uprn: property.uprn });
        }
      }

      errorId.current = newErrorIds;

      return newProperties;
    } else return null;
  };

  /**
   * Method to update the properties from list of properties.
   *
   * @param {Array} propertyData The list of properties that need to be updated.
   */
  const finishAndUpdateProperty = (propertyData) => {
    if (propertyData && propertyData.length > 0) {
      savedProperty.current = [];
      totalCount.current = propertyData.length;
      createdCount.current = 0;
      failedCount.current = 0;
      setHaveErrors(false);
      saveErrors.current = null;

      for (const propertyRecord of propertyData) {
        SaveProperty(propertyRecord, false, userContext, propertyContext, settingsContext.isScottish).then((result) => {
          if (result) {
            createdCount.current++;
            savedProperty.current.push(result);
            setProcessedCount(createdCount.current + failedCount.current);
          } else {
            setHaveErrors(true);
            failedCount.current++;
            setProcessedCount(createdCount.current + failedCount.current);
          }
        });
      }
    }
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
   * Method to get the required wizard page depending on the active step.
   *
   * @returns {JSX.Element} The required wizard page.
   */
  const getWizardPage = () => {
    switch (activeStep) {
      case 0: // Details
        return (
          <PlotToPostalDetailsPage
            data={{
              blpu: blpuData,
              lpi: lpiData,
              other: otherData,
            }}
            errors={propertyErrors}
            onDataChanged={handlePropertyDetailsChanged}
            onErrorChanged={handlePropertyDetailsErrorChanged}
          />
        );

      case 1: // Addresses
        return (
          <PlotToPostalAddressesPage
            addresses={updatedAddresses}
            createGaelic={settingsContext.isScottish ? otherData.createGaelic : false}
            errors={addressErrors}
            onDataChanged={handleAddressDetailsChanged}
            onErrorChanged={handleAddressDetailsErrorChanged}
          />
        );

      case 2: // Finalise
        return (
          <PlotToPostalFinalisePage
            data={finaliseData}
            createGaelic={settingsContext.isScottish ? otherData.createGaelic : false}
            checked={finaliseChecked}
            errors={finaliseErrors}
            updating={updating}
            onCheckedChanged={handleFinaliseCheckedChanged}
            onDataChanged={handleFinaliseDataChanged}
            onErrorChanged={handleFinaliseErrorChanged}
          />
        );

      default:
        return null;
    }
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
      setOtherData(data.other);

      if (updatedAddresses && updatedAddresses.length > 0) {
        const altLangPostTownRef =
          data.lpi && data.lpi.postTownRef
            ? getLookupLinkedRef("postTown", data.lpi.postTownRef, lookupContext.currentLookups)
            : null;

        const addressToBeChanged = updatedAddresses.map((x) => x);
        setUpdatedAddresses(
          addressToBeChanged.map((x) => ({
            id: x.id,
            uprn: x.uprn,
            originalAddress: x.originalAddress,
            originalLpiLogicalStatus: x.originalLpiLogicalStatus,
            originalSaoStartSuffix: x.originalSaoStartSuffix,
            originalSaoEndSuffix: x.originalSaoEndSuffix,
            originalSaoText: x.originalSaoText,
            originalPaoStartSuffix: x.originalPaoStartSuffix,
            originalPaoEndSuffix: x.originalPaoEndSuffix,
            originalPaoText: x.originalPaoText,
            originalPostcode: x.originalPostcode,
            newAddress: x.newAddress,
            newLpiLogicalStatus: data.lpi.newLogicalStatus,
            classification: x.classification,
            language: "ENG",
            saoStartNumber: x.saoStartNumber,
            saoStartSuffix: x.saoStartSuffix,
            saoEndNumber: x.saoEndNumber,
            saoEndSuffix: x.saoEndSuffix,
            saoText: x.saoText,
            paoStartNumber: x.paoStartNumber,
            paoStartSuffix: x.paoStartSuffix,
            paoEndNumber: x.paoEndNumber,
            paoEndSuffix: x.paoEndSuffix,
            paoText: x.paoText,
            usrn: x.usrn,
            postTownRef: data.lpi.postTownRef,
            postcodeRef: data.lpi.postcodeRef,
            subLocalityRef: data.lpi.subLocalityRef,
            officialAddress: data.lpi.officialAddress,
            postallyAddressable: data.lpi.postallyAddressable,
            startDate: data.lpi.startDate,
            altLangLanguage: x.altLangLanguage,
            altLangSaoStartSuffix: x.altLangSaoStartSuffix,
            altLangSaoEndSuffix: x.altLangSaoEndSuffix,
            altLangSaoText: x.altLangSaoText,
            altLangPaoStartSuffix: x.altLangPaoStartSuffix,
            altLangPaoEndSuffix: x.altLangPaoEndSuffix,
            altLangPaoText: x.altLangPaoText,
            altLangPostTownRef: altLangPostTownRef,
            addressUpdated: x.addressUpdated,
          }))
        );
      }
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
            (propertyErrors.plotLpi && propertyErrors.plotLpi.length > 0) ||
            (propertyErrors.postalLpi && propertyErrors.postalLpi.length > 0) ||
            (propertyErrors.note && propertyErrors.note.length > 0))
      );
    }
  };

  /**
   * Event to handle when the address details have changed.
   *
   * @param {Array} data The updated array of address data
   */
  const handleAddressDetailsChanged = (data) => {
    if (data) {
      setUpdatedAddresses(data);
      const notUpdatedAddresses = data.filter(
        (x) => !x.addressUpdated || !x.newAddress || x.originalAddress === x.newAddress
      );
      setAllAddressesUpdated(!notUpdatedAddresses || notUpdatedAddresses.length === 0);
    }
  };

  const handleAddressDetailsErrorChanged = (addressErrors) => {
    if (addressErrors) {
      setAddressErrors(addressErrors);
    }
  };

  /**
   * Event to handle when the back button is clicked.
   */
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * Event to handle when the next button is clicked.
   */
  const handleNext = async () => {
    switch (activeStep) {
      case 0:
        if (propertyDetailsValid()) {
          if (propertyUprns && propertyUprns.length > 0) {
            const selectedAddresses = await getPropertyListDetails(propertyUprns, userContext);

            const altLangPostTownRef =
              lpiData && lpiData.postTownRef
                ? getLookupLinkedRef("postTown", lpiData.postTownRef, lookupContext.currentLookups)
                : null;

            if (updatedAddresses && updatedAddresses.length === 0 && selectedAddresses.length > 0) {
              const propertyData = await GetPropertyMapData(selectedAddresses[0].uprn, userContext);
              if (propertyData) {
                const engLpi = propertyData.lpis.filter((x) => x.language === "ENG");
                const cymLpi = settingsContext.isWelsh ? propertyData.lpis.filter((x) => x.language === "CYM") : null;
                const gaeLpi = settingsContext.isScottish
                  ? propertyData.lpis.filter((x) => x.language === "GAE")
                  : null;

                const tempAddress = await GetTempAddress(
                  settingsContext.isScottish
                    ? {
                        usrn: selectedAddresses[0].usrn,
                        language: "ENG",
                        saoStartNumber: engLpi[0].saoStartNumber ? engLpi[0].saoStartNumber : null,
                        saoStartSuffix: engLpi[0].saoStartSuffix ? engLpi[0].saoStartSuffix : null,
                        saoEndNumber: engLpi[0].saoEndNumber ? engLpi[0].saoEndNumber : null,
                        saoEndSuffix: engLpi[0].saoEndSuffix ? engLpi[0].saoEndSuffix : null,
                        saoText: engLpi[0].saoText ? engLpi[0].saoText : null,
                        paoStartNumber: engLpi[0].paoStartNumber ? engLpi[0].paoStartNumber : null,
                        paoStartSuffix: engLpi[0].paoStartSuffix ? engLpi[0].paoStartSuffix : null,
                        paoEndNumber: engLpi[0].paoEndNumber ? engLpi[0].paoEndNumber : null,
                        paoEndSuffix: engLpi[0].paoEndSuffix ? engLpi[0].paoEndSuffix : null,
                        paoText: engLpi[0].paoText ? engLpi[0].paoText : null,
                        postTownRef: lpiData.postTownRef,
                        postcodeRef: lpiData.postcodeRef,
                        subLocalityRef: lpiData.subLocalityRef,
                        postalAddress: lpiData.postallyAddressable,
                      }
                    : {
                        usrn: selectedAddresses[0].usrn,
                        language: "ENG",
                        saoStartNumber: engLpi[0].saoStartNumber ? engLpi[0].saoStartNumber : null,
                        saoStartSuffix: engLpi[0].saoStartSuffix ? engLpi[0].saoStartSuffix : null,
                        saoEndNumber: engLpi[0].saoEndNumber ? engLpi[0].saoEndNumber : null,
                        saoEndSuffix: engLpi[0].saoEndSuffix ? engLpi[0].saoEndSuffix : null,
                        saoText: engLpi[0].saoText ? engLpi[0].saoText : null,
                        paoStartNumber: engLpi[0].paoStartNumber ? engLpi[0].paoStartNumber : null,
                        paoStartSuffix: engLpi[0].paoStartSuffix ? engLpi[0].paoStartSuffix : null,
                        paoEndNumber: engLpi[0].paoEndNumber ? engLpi[0].paoEndNumber : null,
                        paoEndSuffix: engLpi[0].paoEndSuffix ? engLpi[0].paoEndSuffix : null,
                        paoText: engLpi[0].paoText ? engLpi[0].paoText : null,
                        postTownRef: lpiData.postTownRef,
                        postcodeRef: lpiData.postcodeRef,
                        postalAddress: lpiData.postallyAddressable,
                      },
                  null,
                  lookupContext,
                  userContext,
                  settingsContext.isScottish
                );

                setUpdatedAddresses(
                  selectedAddresses.map((x, idx) => ({
                    id: idx,
                    uprn: x.uprn,
                    originalAddress: x.formattedaddress.replaceAll("\r\n", ", "),
                    originalLpiLogicalStatus: lpiData.existingLogicalStatus,
                    originalSaoStartSuffix: x.sao_nums
                      ? x.sao_nums.includes("-")
                        ? x.sao_nums.substring(0, x.sao_nums.indexOf("-")).replace(/\d+/g, "").trim()
                        : x.sao_nums.replace(/\d+/g, "").trim()
                      : null,
                    originalSaoEndSuffix: x.sao_nums
                      ? x.sao_nums.includes("-")
                        ? x.sao_nums
                            .substring(x.sao_nums.indexOf("-") + 1)
                            .replace(/\d+/g, "")
                            .trim()
                        : null
                      : null,
                    originalSaoText: x.sao_text,
                    originalPaoStartSuffix: x.pao_nums
                      ? x.pao_nums.includes("-")
                        ? x.pao_nums.substring(0, x.pao_nums.indexOf("-")).replace(/\d+/g, "").trim()
                        : x.pao_nums.replace(/\d+/g, "").trim()
                      : null,
                    originalPaoEndSuffix: x.pao_nums
                      ? x.pao_nums.includes("-")
                        ? x.pao_nums
                            .substring(x.pao_nums.indexOf("-") + 1)
                            .replace(/\d+/g, "")
                            .trim()
                        : null
                      : null,
                    originalPaoText: x.pao_text,
                    originalPostcode: x.postcode,
                    newAddress: idx === 0 ? addressToTitleCase(tempAddress, null) : null,
                    newLpiLogicalStatus: lpiData.newLogicalStatus,
                    classification: x.classification_code,
                    language: "ENG",
                    saoStartNumber: idx === 0 ? (engLpi[0].saoStartNumber ? engLpi[0].saoStartNumber : null) : null,
                    saoStartSuffix:
                      idx === 0 ? (engLpi[0].saoStartSuffix ? engLpi[0].saoStartSuffix : null) : x.saoStartSuffix,
                    saoEndNumber: idx === 0 ? (engLpi[0].saoEndNumber ? engLpi[0].saoEndNumber : null) : x.saoEndNumber,
                    saoEndSuffix: idx === 0 ? (engLpi[0].saoEndSuffix ? engLpi[0].saoEndSuffix : null) : x.saoEndSuffix,
                    saoText: idx === 0 ? (engLpi[0].saoText ? engLpi[0].saoText : null) : x.saoText,
                    paoStartNumber:
                      idx === 0 ? (engLpi[0].paoStartNumber ? engLpi[0].paoStartNumber : null) : x.paoStartNumber,
                    paoStartSuffix:
                      idx === 0 ? (engLpi[0].paoStartSuffix ? engLpi[0].paoStartSuffix : null) : x.paoStartSuffix,
                    paoEndNumber: idx === 0 ? (engLpi[0].paoEndNumber ? engLpi[0].paoEndNumber : null) : x.paoEndNumber,
                    paoEndSuffix: idx === 0 ? (engLpi[0].paoEndSuffix ? engLpi[0].paoEndSuffix : null) : x.paoEndSuffix,
                    paoText: idx === 0 ? (engLpi[0].paoText ? engLpi[0].paoText : null) : x.paoText,
                    usrn: x.usrn,
                    postTownRef: x.language === "ENG" ? (lpiData ? lpiData.postTownRef : null) : altLangPostTownRef,
                    postcodeRef: lpiData ? lpiData.postcodeRef : null,
                    subLocalityRef: settingsContext.isScottish && lpiData ? lpiData.subLocalityRef : null,
                    officialAddress: lpiData.officialAddress,
                    postallyAddressable: lpiData.postallyAddressable,
                    startDate: lpiData.startDate,
                    altLangLanguage: settingsContext.isWelsh
                      ? "CYM"
                      : settingsContext.isScottish && otherData.createGaelic
                      ? "GAE"
                      : null,
                    altLangSaoStartSuffix:
                      idx === 0
                        ? settingsContext.isWelsh && cymLpi && cymLpi.length > 0
                          ? cymLpi[0].saoStartSuffix
                            ? cymLpi[0].saoStartSuffix
                            : null
                          : settingsContext.isScottish && otherData.createGaelic && gaeLpi && gaeLpi.length > 0
                          ? gaeLpi[0].saoStartSuffix
                            ? gaeLpi[0].saoStartSuffix
                            : null
                          : null
                        : x.altLangSaoStartSuffix,
                    altLangSaoEndSuffix:
                      idx === 0
                        ? settingsContext.isWelsh && cymLpi && cymLpi.length > 0
                          ? cymLpi[0].saoEndSuffix
                            ? cymLpi[0].saoEndSuffix
                            : null
                          : settingsContext.isScottish && otherData.createGaelic && gaeLpi && gaeLpi.length > 0
                          ? gaeLpi[0].saoEndSuffix
                            ? gaeLpi[0].saoEndSuffix
                            : null
                          : null
                        : x.altLangSaoEndSuffix,
                    altLangSaoText:
                      idx === 0
                        ? settingsContext.isWelsh && cymLpi && cymLpi.length > 0
                          ? cymLpi[0].saoText
                            ? cymLpi[0].saoText
                            : null
                          : settingsContext.isScottish && otherData.createGaelic && gaeLpi && gaeLpi.length > 0
                          ? gaeLpi[0].saoText
                            ? gaeLpi[0].saoText
                            : null
                          : null
                        : x.altLangSaoText,
                    altLangPaoStartSuffix:
                      idx === 0
                        ? settingsContext.isWelsh && cymLpi && cymLpi.length > 0
                          ? cymLpi[0].paoStartSuffix
                            ? cymLpi[0].paoStartSuffix
                            : null
                          : settingsContext.isScottish && otherData.createGaelic && gaeLpi && gaeLpi.length > 0
                          ? gaeLpi[0].paoStartSuffix
                            ? gaeLpi[0].paoStartSuffix
                            : null
                          : null
                        : x.altLangPaoStartSuffix,
                    altLangPaoEndSuffix:
                      idx === 0
                        ? settingsContext.isWelsh && cymLpi && cymLpi.length > 0
                          ? cymLpi[0].paoEndSuffix
                            ? cymLpi[0].paoEndSuffix
                            : null
                          : settingsContext.isScottish && otherData.createGaelic && gaeLpi && gaeLpi.length > 0
                          ? gaeLpi[0].paoEndSuffix
                            ? gaeLpi[0].paoEndSuffix
                            : null
                          : null
                        : x.altLangPaoEndSuffix,
                    altLangPaoText:
                      idx === 0
                        ? settingsContext.isWelsh && cymLpi && cymLpi.length > 0
                          ? cymLpi[0].paoText
                            ? cymLpi[0].paoText
                            : null
                          : settingsContext.isScottish && otherData.createGaelic && gaeLpi && gaeLpi.length > 0
                          ? gaeLpi[0].paoText
                            ? gaeLpi[0].paoText
                            : null
                          : null
                        : x.altLangPaoText,
                    altLangPostTownRef: altLangPostTownRef,
                    addressUpdated: false,
                  }))
                );
                setAllAddressesUpdated(false);
              }
            } else if (updatedAddresses && updatedAddresses.length > 0) {
              const notUpdatedAddresses = updatedAddresses.filter(
                (x) => !x.addressUpdated || !x.newAddress || x.originalAddress === x.newAddress
              );
              setAllAddressesUpdated(!notUpdatedAddresses || notUpdatedAddresses.length === 0);
            } else {
              setAllAddressesUpdated(false);
            }
          }

          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
        break;

      case 1:
        setFinaliseData(
          updatedAddresses.map((x) => ({
            id: x.id,
            uprn: x.uprn,
            originalAddress: x.originalAddress,
            originalLpiLogicalStatus: x.originalLpiLogicalStatus,
            newAddress: x.newAddress,
            newLpiLogicalStatus: x.newLpiLogicalStatus,
            classification: x.classification,
            language: x.language,
            saoStartNumber: x.saoStartNumber,
            saoStartSuffix: x.saoStartSuffix,
            saoEndNumber: x.saoEndNumber,
            saoEndSuffix: x.saoEndSuffix,
            saoText: x.saoText,
            paoStartNumber: x.paoStartNumber,
            paoStartSuffix: x.paoStartSuffix,
            paoEndNumber: x.paoEndNumber,
            paoEndSuffix: x.paoEndSuffix,
            paoText: x.paoText,
            usrn: x.usrn,
            postTownRef: x.postTownRef,
            postcodeRef: x.postcodeRef,
            subLocalityRef: x.subLocalityRef,
            officialAddress: x.officialAddress,
            postallyAddressable: x.postallyAddressable,
            startDate: x.startDate,
            blpuLogicalStatus: blpuData.logicalStatus,
            rpc: blpuData.rpc,
            state: blpuData.state,
            stateDate: blpuData.stateDate,
            level: settingsContext.isScottish ? blpuData.level : lpiData.level,
            excludeFromExport: blpuData.excludeFromExport,
            siteVisit: blpuData.siteVisit,
            blpuStartDate: blpuData.startDate,
            note: otherData.note,
            altLangLanguage: x.altLangLanguage,
            altLangSaoStartSuffix: x.altLangSaoStartSuffix,
            altLangSaoEndSuffix: x.altLangSaoEndSuffix,
            altLangSaoText: x.altLangSaoText,
            altLangPaoStartSuffix: x.altLangPaoStartSuffix,
            altLangPaoEndSuffix: x.altLangPaoEndSuffix,
            altLangPaoText: x.altLangPaoText,
            altLangPostTownRef: x.altLangPostTownRef,
          }))
        );

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        break;

      case 2:
        setUpdating(true);
        createdCount.current = 0;
        failedCount.current = 0;
        setViewErrors(false);

        getPropertyData().then((result) => {
          if (result && Array.isArray(result)) finishAndUpdateProperty(result);
        });
        break;

      default:
        break;
    }
  };

  /**
   * Method to determine if the property details are valid or not.
   *
   * @returns {boolean} True if the property details are valid; otherwise false.
   */
  const propertyDetailsValid = () => {
    const propertyDetailErrors = ValidatePlotPropertyDetails(
      blpuData,
      lpiData,
      lookupContext.currentLookups,
      settingsContext.isScottish
    );

    const havePropertyErrors = propertyDetailErrors.blpu.length > 0 || propertyDetailErrors.lpi.length > 0;

    setHaveErrors(havePropertyErrors);
    setPropertyErrors(propertyDetailErrors);

    return !havePropertyErrors;
  };

  /**
   * Event to handle updating the list of checked records.
   *
   * @param {Array} updatedChecked The list of checked records.
   */
  const handleFinaliseCheckedChanged = (updatedChecked) => {
    setFinaliseChecked(updatedChecked);
  };

  /**
   * Event to handle when the data has been changed.
   *
   * @param {object} updatedData The updated data.
   */
  const handleFinaliseDataChanged = (updatedData) => {
    if (updatedData) {
      setFinaliseData(updatedData);
    }
  };

  /**
   * Event to handle when the list of errors changes.
   *
   * @param {Array} finaliseErrors The list of errors.
   */
  const handleFinaliseErrorChanged = (finaliseErrors) => {
    setFinaliseErrors(finaliseErrors);
  };

  /**
   * Event to handle when the finalise page closes.
   *
   * @param {string} type The type of closure.
   */
  const handleFinaliseClose = (type) => {
    if (onClose && type !== "error") onClose(savedProperty.current);
    setViewErrors(type === "error");
    setFinaliseOpen(false);
  };

  useEffect(() => {
    if (totalCount.current > 0 && totalCount.current === createdCount.current + failedCount.current) {
      setUpdating(false);
      setFinaliseOpen(true);
    }
  }, [processedCount]);

  useEffect(() => {
    setSteps(["Property details", "New addresses", "Finalise"]);

    if (isOpen) {
      setActiveStep(0);
      setUpdating(false);
      setUpdatedAddresses([]);
      setFinaliseChecked([]);
      setFinaliseErrors([]);
      setFinaliseOpen(false);
      setProcessedCount(0);
      setViewErrors(false);

      setBlpuData(
        settingsContext.isScottish
          ? {
              logicalStatus: null,
              rpc: null,
              state: null,
              stateDate: new Date(),
              level: null,
              excludeFromExport: false,
              siteVisit: false,
              startDate: new Date(),
            }
          : {
              logicalStatus: null,
              rpc: null,
              state: null,
              stateDate: new Date(),
              classification: null,
              excludeFromExport: false,
              siteVisit: false,
              startDate: new Date(),
            }
      );

      setLpiData({
        existingLogicalStatus: null,
        newLogicalStatus: null,
        level: null,
        postTownRef: null,
        postcodeRef: null,
        subLocalityRef: null,
        officialAddress: null,
        postallyAddressable: null,
        startDate: new Date(),
      });

      setOtherData(
        settingsContext.isScottish
          ? {
              createGaelic: false,
              note: null,
            }
          : { note: null }
      );

      errorId.current = null;
      savedProperty.current = null;
      saveErrors.current = null;
      totalCount.current = 0;
      createdCount.current = 0;
      failedCount.current = 0;
    }

    setShowDialog(isOpen);
  }, [isOpen, settingsContext.isScottish]);

  useEffect(() => {
    if (propertyContext.currentPropertyHasErrors && propertyContext.currentErrors) {
      const failedRecord = errorId.current.find((x) => x.pkId === propertyContext.currentErrors.pkId);
      const addressId = failedRecord ? failedRecord.addressId : null;
      if (saveErrors.current) saveErrors.current.push({ id: addressId, errors: propertyContext.currentErrors });
      else saveErrors.current = [{ id: addressId, errors: propertyContext.currentErrors }];
      if (Array.isArray(saveErrors.current)) setFinaliseErrors(saveErrors.current);
      else setFinaliseErrors([saveErrors.current]);
    }
  }, [propertyContext.currentErrors, propertyContext.currentPropertyHasErrors]);

  useEffect(() => {
    if (viewErrors && saveErrors.current && saveErrors.current.length > 0) {
      const errorIds = saveErrors.current.map((x) => x.id);

      if (errorIds && finaliseData && errorIds.length > 0 && errorIds.length !== finaliseData.length) {
        const errorAddressPoints = finaliseData.filter((x) => errorIds.includes(x.id));

        setFinaliseData(errorAddressPoints);
      }
    }
  }, [viewErrors, settingsContext.isScottish, settingsContext.isWelsh, finaliseData]);

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
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
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
                {`Plot to postal address for ${propertyUprns.length} properties`}
              </Typography>
            </Stack>
            {activeStep === steps.length - 1 && (
              <Button
                onClick={handleNext}
                autoFocus
                disabled={updating}
                variant="contained"
                sx={haveErrors ? redButtonStyle : blueButtonStyle}
                startIcon={haveErrors ? <ErrorIcon /> : null}
              >
                Finish & Save
              </Button>
            )}
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
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    autoFocus
                    disabled={updating}
                    variant="contained"
                    sx={whiteButtonStyle}
                    startIcon={<ArrowBackIcon />}
                  >
                    Back
                  </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                  <Button
                    onClick={handleNext}
                    autoFocus
                    disabled={updating || (activeStep === 1 && !allAddressesUpdated)}
                    variant="contained"
                    sx={haveErrors ? redButtonStyle : blueButtonStyle}
                    startIcon={
                      activeStep === steps.length - 1 ? null : haveErrors ? <ErrorIcon /> : <ArrowForwardIcon />
                    }
                  >
                    {activeStep === steps.length - 1 ? "Finish & Save" : "Next"}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </DialogActions>
      </Dialog>
      <WizardFinaliseDialog
        open={finaliseOpen}
        variant={"plotToPostal"}
        errors={finaliseErrors}
        createdCount={createdCount.current}
        failedCount={failedCount.current}
        onClose={handleFinaliseClose}
      />
      <MessageDialog isOpen={openMessageDialog} variant={messageVariant} onClose={handleMessageDialogClose} />
    </Fragment>
  );
}

export default MultiEditPlotToPostalWizardDialog;
