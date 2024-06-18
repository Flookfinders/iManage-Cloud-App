/* #region header */
/**************************************************************************************************
//
//  Description: Wizard validation
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
//    002   24.03.23 Sean Flook         WI40608 Changes required to correctly handle changes to PAO details for child properties.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    004   30.11.23 Sean Flook                 Changes required to handle Scottish authorities.
//    005   27.03.24 Sean Flook                 Changes required to remove warnings.
//    006   09.04.24 Sean Flook       IMANN-376 Allow lookups to be added on the fly.
//    007   14.06.24 Sean Flook       IMANN-451 Various changes required in order for Scottish authorities to be able to choose to create Gaelic records or not.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Box } from "@mui/system";
import ADSAddressableObjectControl from "../components/ADSAddressableObjectControl";
import ADSPaoDetailsControl from "../components/ADSPaoDetailsControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import AddLookupDialog from "../dialogs/AddLookupDialog";

import { addLookup, getLookupVariantString, stringToSentenceCase } from "../utils/HelperUtils";
import { streetDescriptorToTitleCase } from "../utils/StreetUtils";

WizardAddressDetails1Tab.propTypes = {
  data: PropTypes.object,
  isChild: PropTypes.bool,
  language: PropTypes.string.isRequired,
  errors: PropTypes.array,
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

WizardAddressDetails1Tab.defaultProps = {
  isChild: false,
};

function WizardAddressDetails1Tab({ data, isChild, language, errors, onDataChanged, onErrorChanged }) {
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

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
  const [paoDetails, setPaoDetails] = useState("");
  const [usrn, setUsrn] = useState(0);
  const [postTownRef, setPostTownRef] = useState(0);
  const [subLocalityRef, setSubLocalityRef] = useState(0);
  const [postcodeRef, setPostcodeRef] = useState(0);

  const [addressPreview, setAddressPreview] = useState("");

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
  const [paoDetailsError, setPaoDetailsError] = useState(null);
  const [usrnError, setUsrnError] = useState(null);
  const [postTownRefError, setPostTownRefError] = useState(null);
  const [subLocalityRefError, setSubLocalityRefError] = useState(null);
  const [postcodeRefError, setPostcodeRefError] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const updatedDataRef = useRef(null);
  const addResult = useRef(null);
  const currentVariant = useRef(null);

  /**
   * Method to get the updated data object after a change.
   *
   * @param {string} field The name of the field that has been updated.
   * @param {number|string|null} newValue The new value for the field.
   * @returns {object} The updated data abject.
   */
  const getUpdatedData = (updatedField, newValue) => {
    const updatedData = {
      language: data.language,
      saoStartNumber:
        updatedField === "saoStartNumber"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.saoStartNumber
          : saoStartNumber,
      saoStartSuffix:
        updatedField === "saoStartSuffix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.saoStartSuffix
          : saoStartSuffix,
      saoEndNumber:
        updatedField === "saoEndNumber"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.saoEndNumber
          : saoEndNumber,
      saoEndSuffix:
        updatedField === "saoEndSuffix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.saoEndSuffix
          : saoEndSuffix,
      saoText:
        updatedField === "saoText" ? newValue : updatedDataRef.current ? updatedDataRef.current.saoText : saoText,
      paoStartNumber:
        updatedField === "paoStartNumber"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.paoStartNumber
          : paoStartNumber,
      paoStartSuffix:
        updatedField === "paoStartSuffix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.paoStartSuffix
          : paoStartSuffix,
      paoEndNumber:
        updatedField === "paoEndNumber"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.paoEndNumber
          : paoEndNumber,
      paoEndSuffix:
        updatedField === "paoEndSuffix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.paoEndSuffix
          : paoEndSuffix,
      paoText:
        updatedField === "paoText" ? newValue : updatedDataRef.current ? updatedDataRef.current.paoText : paoText,
      paoDetails:
        updatedField === "paoDetails"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.paoDetails
          : paoDetails,
      usrn: updatedField === "usrn" ? newValue : updatedDataRef.current ? updatedDataRef.current.usrn : usrn,
      postcodeRef:
        updatedField === "postcodeRef"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.postcodeRef
          : postcodeRef,
      subLocalityRef:
        updatedField === "subLocalityRef"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.subLocalityRef
          : subLocalityRef,
      postTownRef:
        updatedField === "postTownRef"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.postTownRef
          : postTownRef,
    };

    updatedDataRef.current = updatedData;

    const streetDescriptorRecord = settingsContext.isWelsh
      ? lookupContext.currentLookups.streetDescriptors.find(
          (x) => x.usrn === updatedData.usrn && x.language === updatedData.language
        )
      : lookupContext.currentLookups.streetDescriptors.find((x) => x.usrn === updatedData.usrn);
    const postTownRecord = settingsContext.isWelsh
      ? lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === updatedData.postTownRef && x.language === updatedData.language
        )
      : lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === updatedData.postTownRef);
    const subLocalityRecord = settingsContext.isScottish
      ? lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === updatedData.subLocalityRef)
      : null;
    const postcodeRecord = lookupContext.currentLookups.postcodes.find(
      (x) => x.postcodeRef === updatedData.postcodeRef
    );

    if (isChild) {
      if (updatedData.saoStartNumber || updatedData.saoText) {
        const paoDetails = `${updatedData.paoText ? updatedData.paoText : ""}${
          updatedData.paoText && (updatedData.paoStartNumber || updatedData.paoStartSuffix) ? ", " : ""
        }${updatedData.paoStartNumber ? updatedData.paoStartNumber : ""}${
          updatedData.paoStartSuffix ? updatedData.paoStartSuffix : ""
        }${updatedData.paoEndNumber || updatedData.paoEndSuffix ? "-" : ""}${
          updatedData.paoEndNumber ? updatedData.paoEndNumber : ""
        }${updatedData.paoEndSuffix ? updatedData.paoEndSuffix : ""}`;

        const saoDetails = `${updatedData.saoText ? updatedData.saoText : ""}${
          updatedData.saoText && (updatedData.saoStartNumber || updatedData.saoStartSuffix) ? ", " : ""
        }${updatedData.saoStartNumber ? updatedData.saoStartNumber : ""}${
          updatedData.saoStartSuffix ? updatedData.saoStartSuffix : ""
        }${updatedData.saoEndNumber || updatedData.saoEndSuffix ? "-" : ""}${
          updatedData.saoEndNumber ? updatedData.saoEndNumber : ""
        }${updatedData.saoEndSuffix ? updatedData.saoEndSuffix : ""}`;

        setAddressPreview(
          `${saoDetails.trim()}${saoDetails ? ", " : ""}${paoDetails.trim()}${streetDescriptorRecord ? " " : ""}${
            streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
          }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
            subLocalityRecord ? ", " : ""
          }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${postcodeRecord ? " " : ""}${
            postcodeRecord ? postcodeRecord.postcode : ""
          }`
        );
      }
    } else {
      if (updatedData.paoStartNumber || updatedData.paoText) {
        setAddressPreview(
          `${updatedData.paoText ? updatedData.paoText : ""}${
            updatedData.paoText && (updatedData.paoStartNumber || updatedData.paoStartSuffix) ? ", " : ""
          }${updatedData.paoStartNumber ? updatedData.paoStartNumber : ""}${
            updatedData.paoStartSuffix ? updatedData.paoStartSuffix : ""
          }${updatedData.paoEndNumber || updatedData.paoEndSuffix ? "-" : ""}${
            updatedData.paoEndNumber ? updatedData.paoEndNumber : ""
          }${updatedData.paoEndSuffix ? updatedData.paoEndSuffix : ""}${streetDescriptorRecord ? " " : ""}${
            streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
          }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
            subLocalityRecord ? ", " : ""
          }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${postcodeRecord ? " " : ""}${
            postcodeRecord ? postcodeRecord.postcode : ""
          }`
        );
      }
    }

    return updatedData;
  };

  /**
   * Method to return the list of errors after a field has been updated.
   *
   * @param {string} updatedField The field that was updated.
   * @returns {Array} The updated list of errors.
   */
  const getUpdatedErrors = (updatedField) => {
    if (!errors) return null;

    switch (updatedField) {
      case "saoDetails":
        return errors.filter(
          (x) =>
            !["saostartnumber", "saostartsuffix", "saoendnumber", "saoendsuffix", "saotext"].includes(
              x.field.toLowerCase()
            )
        );

      case "paoDetails":
        return errors.filter(
          (x) =>
            !["paostartnumber", "paostartsuffix", "paoendnumber", "paoendsuffix", "paotext"].includes(
              x.field.toLowerCase()
            )
        );

      default:
        return errors.filter((x) => x.field.toLowerCase() !== updatedField);
    }
  };

  /**
   * Event to handle when the SAO start number is changed.
   *
   * @param {number|null} newValue The new SAO start number.
   */
  const handleSaoStartNumberChangeEvent = (newValue) => {
    setSaoStartNumber(newValue);
    if (onDataChanged && saoStartNumber !== newValue) onDataChanged(getUpdatedData("saoStartNumber", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("saoDetails"));
  };

  /**
   * Event to handle when the SAO start suffix is changed.
   *
   * @param {string|null} newValue The new SAO start suffix.
   */
  const handleSaoStartSuffixChangeEvent = (newValue) => {
    setSaoStartSuffix(newValue);
    if (onDataChanged && saoStartSuffix !== newValue) onDataChanged(getUpdatedData("saoStartSuffix", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("saoDetails"));
  };

  /**
   * Event to handle when the SAO end number is changed.
   *
   * @param {number|null} newValue The new SAO end number.
   */
  const handleSaoEndNumberChangeEvent = (newValue) => {
    setSaoEndNumber(newValue);
    if (onDataChanged && saoEndNumber !== newValue) onDataChanged(getUpdatedData("saoEndNumber", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("saoDetails"));
  };

  /**
   * Event to handle when the SAO end suffix is changed.
   *
   * @param {string|null} newValue The new SAO end suffix.
   */
  const handleSaoEndSuffixChangeEvent = (newValue) => {
    setSaoEndSuffix(newValue);
    if (onDataChanged && saoEndSuffix !== newValue) onDataChanged(getUpdatedData("saoEndSuffix", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("saoDetails"));
  };

  /**
   * Event to handle when the SAO text is changed.
   *
   * @param {string|null} newValue The new SAO text.
   */
  const handleSaoTextChangeEvent = (newValue) => {
    setSaoText(newValue);
    if (onDataChanged && saoText !== newValue) onDataChanged(getUpdatedData("saoText", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("saoDetails"));
  };

  /**
   * Event to handle when the PAO start number is changed.
   *
   * @param {number|null} newValue The new PAO start number.
   */
  const handlePaoStartNumberChangeEvent = (newValue) => {
    setPaoStartNumber(newValue);
    if (onDataChanged && paoStartNumber !== newValue) onDataChanged(getUpdatedData("paoStartNumber", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("paoDetails"));
  };

  /**
   * Event to handle when the PAO start suffix is changed.
   *
   * @param {string|null} newValue The new PAO start suffix.
   */
  const handlePaoStartSuffixChangeEvent = (newValue) => {
    setPaoStartSuffix(newValue);
    if (onDataChanged && paoStartSuffix !== newValue) onDataChanged(getUpdatedData("paoStartSuffix", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("paoDetails"));
  };

  /**
   * Event to handle when the PAO end number is changed.
   *
   * @param {number|null} newValue The new PAO end number.
   */
  const handlePaoEndNumberChangeEvent = (newValue) => {
    setPaoEndNumber(newValue);
    if (onDataChanged && paoEndNumber !== newValue) onDataChanged(getUpdatedData("paoEndNumber", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("paoDetails"));
  };

  /**
   * Event to handle when the PAO end suffix is changed.
   *
   * @param {string|null} newValue The new PAO end suffix.
   */
  const handlePaoEndSuffixChangeEvent = (newValue) => {
    setPaoEndSuffix(newValue);
    if (onDataChanged && paoEndSuffix !== newValue) onDataChanged(getUpdatedData("paoEndSuffix", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("paoDetails"));
  };

  /**
   * Event to handle when the PAO text is changed.
   *
   * @param {string|null} newValue The new PAO text.
   */
  const handlePaoTextChangeEvent = (newValue) => {
    setPaoText(newValue);
    if (onDataChanged && paoText !== newValue) onDataChanged(getUpdatedData("paoText", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("paoDetails"));
  };

  /**
   * Event to handle when the USRN is changed.
   *
   * @param {number|null} newValue The new USRN.
   */
  const handleUsrnChangeEvent = (newValue) => {
    setUsrn(newValue);
    if (onDataChanged && usrn !== newValue) onDataChanged(getUpdatedData("usrn", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("usrn"));
  };

  /**
   * Event to handle when the post town reference is changed.
   *
   * @param {number|null} newValue The new post town reference.
   */
  const handlePostTownRefChangeEvent = (newValue) => {
    setPostTownRef(newValue);
    if (onDataChanged && postTownRef !== newValue) onDataChanged(getUpdatedData("postTownRef", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("postTownRef"));
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
    if (onDataChanged && subLocalityRef !== newValue) onDataChanged(getUpdatedData("subLocalityRef", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("subLocalityRef"));
  };

  /**
   * Event to handle when a new sub-locality is added.
   */
  const handleAddSubLocalityEvent = () => {
    setLookupType("subLocality");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the postcode reference is changed.
   *
   * @param {number|null} newValue The new postcode reference.
   */
  const handlePostcodeRefChangeEvent = (newValue) => {
    setPostcodeRef(newValue);
    if (onDataChanged && postcodeRef !== newValue) onDataChanged(getUpdatedData("postcodeRef", newValue));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("postcodeRef"));
  };

  /**
   * Event to handle when a new postcode is added.
   */
  const handleAddPostcodeEvent = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the PAO details are changed.
   *
   * @param {object|null} data The new PAO details.
   */
  const handlePaoDetailsChanged = (data) => {
    if (data) {
      const numberStart = data.startNumber && Number(data.startNumber) > 0 ? Number(data.startNumber) : null;
      const numberEnd = data.endNumber && Number(data.endNumber) > 0 ? Number(data.endNumber) : null;
      setPaoStartNumber(numberStart);
      if (onDataChanged && paoStartNumber !== numberStart) onDataChanged(getUpdatedData("paoStartNumber", numberStart));
      setPaoStartSuffix(data.startSuffix);
      if (onDataChanged && paoStartSuffix !== data.startSuffix)
        onDataChanged(getUpdatedData("paoStartSuffix", data.startSuffix));
      setPaoEndNumber(numberEnd);
      if (onDataChanged && paoEndNumber !== numberEnd) onDataChanged(getUpdatedData("paoEndNumber", numberEnd));
      setPaoEndSuffix(data.endSuffix);
      if (onDataChanged && paoEndSuffix !== data.endSuffix)
        onDataChanged(getUpdatedData("paoEndSuffix", data.endSuffix));
      setPaoText(data.text);
      if (onDataChanged && paoText !== data.text) onDataChanged(getUpdatedData("paoText", data.text));
      setPaoDetails(data.details);
      if (onDataChanged && paoDetails !== data.details) onDataChanged(getUpdatedData("paoDetails", data.details));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("paoDetails"));
    }
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
    if (data) {
      setSaoStartNumber(data.saoStartNumber);
      setSaoStartSuffix(data.saoStartSuffix);
      setSaoEndNumber(data.saoEndNumber);
      setSaoEndSuffix(data.saoEndSuffix);
      setSaoText(data.saoText);
      setPaoStartNumber(data.paoStartNumber);
      setPaoStartSuffix(data.paoStartSuffix);
      setPaoEndNumber(data.paoEndNumber);
      setPaoEndSuffix(data.paoEndSuffix);
      setPaoText(data.paoText);
      setPaoDetails(data.paoDetails);
      setUsrn(data.usrn);
      setPostTownRef(data.postTownRef);
      setSubLocalityRef(settingsContext.isScottish ? data.subLocalityRef : null);
      setPostcodeRef(data.postcodeRef);

      const streetDescriptorRecord = settingsContext.isWelsh
        ? lookupContext.currentLookups.streetDescriptors.find(
            (x) => x.usrn === data.usrn && x.language === data.language
          )
        : lookupContext.currentLookups.streetDescriptors.find((x) => x.usrn === data.usrn);
      const postTownRecord = settingsContext.isWelsh
        ? lookupContext.currentLookups.postTowns.find(
            (x) => x.postTownRef === data.postTownRef && x.language === data.language
          )
        : lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef);
      const subLocalityRecord = settingsContext.isScottish
        ? lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === data.subLocalityRef)
        : null;
      const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef);

      if (isChild && (data.saoStartNumber || data.saoText)) {
        const paoDetails = `${data.paoText ? data.paoText : ""}${
          data.paoText && (data.paoStartNumber || data.paoStartSuffix) ? ", " : ""
        }${data.paoStartNumber ? data.paoStartNumber : ""}${data.paoStartSuffix ? data.paoStartSuffix : ""}${
          data.paoEndNumber || data.paoEndSuffix ? "-" : ""
        }${data.paoEndNumber ? data.paoEndNumber : ""}${data.paoEndSuffix ? data.paoEndSuffix : ""}`;

        const saoDetails = `${data.saoText ? data.saoText : ""}${
          data.saoText && (data.saoStartNumber || data.saoStartSuffix) ? ", " : ""
        }${data.saoStartNumber ? data.saoStartNumber : ""}${data.saoStartSuffix ? data.saoStartSuffix : ""}${
          data.saoEndNumber || data.saoEndSuffix ? "-" : ""
        }${data.saoEndNumber ? data.saoEndNumber : ""}${data.saoEndSuffix ? data.saoEndSuffix : ""}`;

        setAddressPreview(
          `${saoDetails.trim()}${saoDetails ? ", " : ""}${paoDetails.trim()}${streetDescriptorRecord ? " " : ""}${
            streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
          }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
            subLocalityRecord ? ", " : ""
          }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${postcodeRecord ? " " : ""}${
            postcodeRecord ? postcodeRecord.postcode : ""
          }`
        );
      } else if (!isChild && (data.paoStartNumber || data.paoText)) {
        setAddressPreview(
          `${data.paoText ? data.paoText : ""}${
            data.paoText && (data.paoStartNumber || data.paoStartSuffix) ? ", " : ""
          }${data.paoStartNumber ? data.paoStartNumber : ""}${data.paoStartSuffix ? data.paoStartSuffix : ""}${
            data.paoEndNumber || data.paoEndSuffix ? "-" : ""
          }${data.paoEndNumber ? data.paoEndNumber : ""}${data.paoEndSuffix ? data.paoEndSuffix : ""}${
            streetDescriptorRecord ? " " : ""
          }${streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""}${
            postTownRecord ? ", " : ""
          }${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${postcodeRecord ? " " : ""}${
            subLocalityRecord ? ", " : ""
          }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
            postcodeRecord ? postcodeRecord.postcode : ""
          }`
        );
      }
    }
  }, [language, data, lookupContext, isChild, settingsContext.isScottish, settingsContext.isWelsh]);

  useEffect(() => {
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
    setPaoDetailsError(null);
    setUsrnError(null);
    setPostTownRefError(null);
    setSubLocalityRefError(null);
    setPostcodeRefError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
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

          case "paodetails":
            setPaoDetailsError(error.errors);
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

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <>
      <Box id="wizard-address-settings-1-tab" sx={{ width: "100%" }}>
        {isChild && (
          <ADSAddressableObjectControl
            variant="SAO"
            isEditable
            isRequired
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
        )}
        {isChild && (
          <ADSPaoDetailsControl
            label="PAO details"
            isRequired
            data={{
              startNumber: paoStartNumber,
              startSuffix: paoStartSuffix,
              endNumber: paoEndNumber,
              endSuffix: paoEndSuffix,
              text: paoText,
              details: paoDetails,
            }}
            errorText={paoDetailsError}
            onDetailsChanged={handlePaoDetailsChanged}
          />
        )}
        {!isChild && (
          <ADSAddressableObjectControl
            variant="PAO"
            isEditable
            isRequired
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
        )}
        <ADSSelectControl
          label="Street"
          isEditable
          isRequired
          useRounded
          lookupData={lookupContext.currentLookups.streetDescriptors.filter(
            (x) => x.language === (settingsContext.isScottish ? "ENG" : language)
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
          isEditable
          useRounded
          allowAddLookup
          lookupData={lookupContext.currentLookups.postTowns
            .filter((x) => x.language === (settingsContext.isScottish ? "ENG" : language) && !x.historic)
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
            isEditable
            useRounded
            allowAddLookup
            lookupData={lookupContext.currentLookups.subLocalities
              .filter((x) => x.language === (settingsContext.isScottish ? "ENG" : language) && !x.historic)
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
          isEditable
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
        {addressPreview && (
          <ADSReadOnlyControl label="Address preview" value={addressPreview} noLeftPadding boldLabel />
        )}
      </Box>
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

export default WizardAddressDetails1Tab;
