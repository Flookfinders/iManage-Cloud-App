/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Address Details 2 (Range create)
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   23.03.23 Sean Flook         WI40607 Display an error for address list if we have one.
//    003   24.03.23 Sean Flook         WI40608 Changes required to correctly handle changes to PAO details for child properties.
//    004   27.03.23 Sean Flook         WI40609 Leave the range start and end number as text so that they can be set to null.
//    005   05.04.23 Sean Flook         WI40669 Fixed warnings.
//    006   25.04.23 Sean Flook         WI40703 Do not allow text with invalid characters to be pasted in and displayed.
//    007   06.10.23 Sean Flook                 Use colour variables.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    009   30.11.23 Sean Flook                 Changes required to handle Scottish authorities.
//    010   23.02.24 Joel Benford     IMANN-287 Correct hover blue
//    011   09.04.24 Sean Flook       IMANN-376 Allow lookups to be added on the fly.
//    012   19.04.24 Sean Flook       IMANN-137 For Welsh authority allow 2 characters for the suffix.
//    013   14.06.24 Sean Flook       IMANN-451 Various changes required in order for Scottish authorities to be able to choose to create Gaelic records or not.
//    014   18.06.24 Sean Flook       IMANN-577 Use characterSetValidator.
//    015   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    016   20.06.24 Sean Flook       IMANN-633 Enforce the maximum for the numbers.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import {
  Grid,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSPaoDetailsControl from "../components/ADSPaoDetailsControl";
import ADSErrorDisplay from "../components/ADSErrorDisplay";
import AddLookupDialog from "../dialogs/AddLookupDialog";

import { addLookup, characterSetValidator, getLookupVariantString, stringToSentenceCase } from "../utils/HelperUtils";
import { streetDescriptorToTitleCase } from "../utils/StreetUtils";

import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";

import {
  adsBlueA,
  adsMidGreyA,
  adsDarkGrey,
  adsLightGreyB,
  adsPaleBlueA,
  adsPaleBlueB,
  adsLightGreyC,
} from "../utils/ADSColours";
import {
  FormBoxRowStyle,
  FormRowStyle,
  FormInputStyle,
  controlLabelStyle,
  getStateButtonStyle,
  getStateButtonTextStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

WizardAddressDetails2Tab.propTypes = {
  data: PropTypes.object,
  isChild: PropTypes.bool,
  language: PropTypes.string.isRequired,
  errors: PropTypes.array,
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

WizardAddressDetails2Tab.defaultProps = {
  isChild: false,
};

function WizardAddressDetails2Tab({ data, isChild, language, errors, onDataChanged, onErrorChanged }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [rangeType, setRangeType] = useState(null);
  const [rangeText, setRangeText] = useState(null);
  const [rangeStartPrefix, setRangeStartPrefix] = useState(null);
  const [rangeStartNumber, setRangeStartNumber] = useState(null);
  const [rangeStartSuffix, setRangeStartSuffix] = useState(null);
  const [rangeEndPrefix, setRangeEndPrefix] = useState(null);
  const [rangeEndNumber, setRangeEndNumber] = useState(null);
  const [rangeEndSuffix, setRangeEndSuffix] = useState(null);
  const [numbering, setNumbering] = useState(null);
  const [paoStartNumber, setPaoStartNumber] = useState(null);
  const [paoStartSuffix, setPaoStartSuffix] = useState(null);
  const [paoEndNumber, setPaoEndNumber] = useState(null);
  const [paoEndSuffix, setPaoEndSuffix] = useState(null);
  const [paoText, setPaoText] = useState(null);
  const [paoDetails, setPaoDetails] = useState(null);
  const [usrn, setUsrn] = useState(null);
  const [postTownRef, setPostTownRef] = useState(null);
  const [subLocalityRef, setSubLocalityRef] = useState(null);
  const [postcodeRef, setPostcodeRef] = useState(null);

  const [rangeTypeError, setRangeTypeError] = useState(null);
  const [rangeTextError, setRangeTextError] = useState(null);
  const [rangeStartPrefixError, setRangeStartPrefixError] = useState(null);
  const [rangeStartNumberError, setRangeStartNumberError] = useState(null);
  const [rangeStartSuffixError, setRangeStartSuffixError] = useState(null);
  const [rangeEndPrefixError, setRangeEndPrefixError] = useState(null);
  const [rangeEndNumberError, setRangeEndNumberError] = useState(null);
  const [rangeEndSuffixError, setRangeEndSuffixError] = useState(null);
  const [paoDetailsError, setPaoDetailsError] = useState(null);
  const [numberingError, setNumberingError] = useState(1);
  const [usrnError, setUsrnError] = useState(null);
  const [postTownRefError, setPostTownRefError] = useState(null);
  const [subLocalityRefError, setSubLocalityRefError] = useState(null);
  const [postcodeRefError, setPostcodeRefError] = useState(null);
  const [addressListError, setAddressListError] = useState(null);

  const rangeType1HasErrors = useRef(false);
  const rangeType2HasErrors = useRef(false);
  const [displayRange1Error, setDisplayRange1Error] = useState("");
  const [displayRange2Error, setDisplayRange2Error] = useState("");
  const [displayNumberingError, setDisplayNumberingError] = useState("");

  const [addressList, setAddressList] = useState([]);

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
      rangeType:
        updatedField === "rangeType" ? newValue : updatedDataRef.current ? updatedDataRef.current.rangeType : rangeType,
      rangeText:
        updatedField === "rangeText" ? newValue : updatedDataRef.current ? updatedDataRef.current.rangeText : rangeText,
      rangeStartPrefix:
        updatedField === "rangeStartPrefix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.rangeStartPrefix
          : rangeStartPrefix,
      rangeStartNumber:
        updatedField === "rangeStartNumber"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.rangeStartNumber
          : rangeStartNumber,
      rangeStartSuffix:
        updatedField === "rangeStartSuffix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.rangeStartSuffix
          : rangeStartSuffix,
      rangeEndPrefix:
        updatedField === "rangeEndPrefix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.rangeEndPrefix
          : rangeEndPrefix,
      rangeEndNumber:
        updatedField === "rangeEndNumber"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.rangeEndNumber
          : rangeEndNumber,
      rangeEndSuffix:
        updatedField === "rangeEndSuffix"
          ? newValue
          : updatedDataRef.current
          ? updatedDataRef.current.rangeEndSuffix
          : rangeEndSuffix,
      numbering:
        updatedField === "numbering" ? newValue : updatedDataRef.current ? updatedDataRef.current.numbering : numbering,
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
      addressList: updatedField === "addressList" ? newValue : getUpdatedAddressList(updatedField, newValue),
    };

    updatedDataRef.current = updatedData;

    return updatedData;
  };

  /**
   * Method to regenerate the list of address after data has been changed.
   *
   * @param {string} updatedField The name of the field that has been updated.
   * @param {string|number|null} newValue The new value for the field.
   * @returns {Array} The updated list of addresses.
   */
  const getUpdatedAddressList = (updatedField, newValue) => {
    const newList = [];

    const text = updatedField === "rangeText" ? newValue : rangeText;
    const startPrefix = updatedField === "rangeStartPrefix" ? newValue : rangeStartPrefix;
    const startNumber = updatedField === "rangeStartNumber" ? Number(newValue) : Number(rangeStartNumber);
    const startSuffix = updatedField === "rangeStartSuffix" ? newValue : rangeStartSuffix;
    const endPrefix = updatedField === "rangeEndPrefix" ? newValue : rangeEndPrefix;
    const endNumber =
      updatedField === "rangeEndNumber" ? Number(newValue) : rangeEndNumber ? Number(rangeEndNumber) : 0;
    const endSuffix = updatedField === "rangeEndSuffix" ? newValue : rangeEndSuffix;
    const selectedUsrn = updatedField === "usrn" ? newValue : usrn;
    const selectedPostTown = updatedField === "postTownRef" ? newValue : postTownRef;
    const selectedSubLocality = updatedField === "subLocalityRef" ? newValue : subLocalityRef;
    const selectedPostcode = updatedField === "postcodeRef" ? newValue : postcodeRef;
    const currentNumbering = updatedField === "numbering" ? newValue : numbering;

    const streetDescriptorRecord = settingsContext.isWelsh
      ? lookupContext.currentLookups.streetDescriptors.find((x) => x.usrn === selectedUsrn && x.language === language)
      : lookupContext.currentLookups.streetDescriptors.find((x) => x.usrn === selectedUsrn);
    const postTownRecord = settingsContext.isWelsh
      ? lookupContext.currentLookups.postTowns.find(
          (x) => x.postTownRef === selectedPostTown && x.language === language
        )
      : lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === selectedPostTown);
    const subLocalityRecord = settingsContext.isScottish
      ? lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === selectedSubLocality)
      : null;
    const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === selectedPostcode);

    const paoDetails =
      updatedField === "paoDetails"
        ? newValue
        : isChild
        ? `${paoText ? paoText : ""}${paoText && (paoStartNumber || paoStartSuffix) ? ", " : ""}${
            paoStartNumber ? paoStartNumber : ""
          }${paoStartSuffix ? paoStartSuffix : ""}${paoEndNumber || paoEndSuffix ? "-" : ""}${
            paoEndNumber ? paoEndNumber : ""
          }${paoEndSuffix ? paoEndSuffix : ""}`
        : "";

    let i = startNumber;
    let idx = 0;

    switch (updatedField === "rangeType" ? newValue : rangeType) {
      case 1: // [PAO/SAO] numbering / suffix
        if (startNumber && startSuffix) {
          do {
            if (
              currentNumbering === 1 ||
              (currentNumbering === 2 && i % 2 !== 0) ||
              (currentNumbering === 3 && i % 2 === 0)
            ) {
              let suffixNumber = startSuffix.charCodeAt(0);
              const suffixEndNumber = endSuffix ? endSuffix.charCodeAt(0) : 0;
              do {
                if (isChild) {
                  const newMapLabel = `${i}${String.fromCharCode(suffixNumber)}, ${paoDetails}`;
                  const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                    streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                  }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                    subLocalityRecord ? ", " : ""
                  }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                    postcodeRecord ? " " : ""
                  }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                  const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                  newList.push({
                    id: idx,
                    address: newAddress,
                    mapLabel: newMapLabel,
                    saoNumber: i,
                    saoSuffix: String.fromCharCode(suffixNumber),
                    saoText: null,
                    paoNumber: null,
                    paoSuffix: null,
                    paoText: null,
                    paoDetails: paoDetails,
                    usrn: selectedUsrn,
                    postTownRef: selectedPostTown,
                    subLocalityRef: selectedSubLocality,
                    postcodeRef: selectedPostcode,
                    included: existingAddressRecord ? existingAddressRecord.included : true,
                  });
                } else {
                  const newMapLabel = `${i}${String.fromCharCode(suffixNumber)}`;
                  const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                    streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                  }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                    subLocalityRecord ? ", " : ""
                  }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                    postcodeRecord ? " " : ""
                  }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                  const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                  newList.push({
                    id: idx,
                    address: newAddress,
                    mapLabel: newMapLabel,
                    saoNumber: null,
                    saoSuffix: null,
                    saoText: null,
                    paoNumber: i,
                    paoSuffix: String.fromCharCode(suffixNumber),
                    paoText: null,
                    paoDetails: null,
                    usrn: selectedUsrn,
                    postTownRef: selectedPostTown,
                    subLocalityRef: selectedSubLocality,
                    postcodeRef: selectedPostcode,
                    included: existingAddressRecord ? existingAddressRecord.included : true,
                  });
                }
                idx += 1;
                suffixNumber += 1;
              } while (suffixNumber <= suffixEndNumber);
            }
            i += 1;
          } while (i <= endNumber);
        } else if (startNumber && !startSuffix) {
          do {
            if (
              currentNumbering === 1 ||
              (currentNumbering === 2 && i % 2 !== 0) ||
              (currentNumbering === 3 && i % 2 === 0)
            ) {
              if (isChild) {
                const newMapLabel = `${i}, ${paoDetails}`;
                const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                  streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                  subLocalityRecord ? ", " : ""
                }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                  postcodeRecord ? " " : ""
                }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                newList.push({
                  id: idx,
                  address: newAddress,
                  mapLabel: newMapLabel,
                  saoNumber: i,
                  saoSuffix: null,
                  saoText: null,
                  paoNumber: null,
                  paoSuffix: null,
                  paoText: null,
                  paoDetails: paoDetails,
                  usrn: selectedUsrn,
                  postTownRef: selectedPostTown,
                  subLocalityRef: selectedSubLocality,
                  postcodeRef: selectedPostcode,
                  included: existingAddressRecord ? existingAddressRecord.included : true,
                });
              } else {
                const newMapLabel = `${i}`;
                const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                  streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                  subLocalityRecord ? ", " : ""
                }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                  postcodeRecord ? " " : ""
                }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                newList.push({
                  id: idx,
                  address: newAddress,
                  mapLabel: newMapLabel,
                  saoNumber: null,
                  saoSuffix: null,
                  saoText: null,
                  paoNumber: i,
                  paoSuffix: null,
                  paoText: null,
                  paoDetails: null,
                  usrn: selectedUsrn,
                  postTownRef: selectedPostTown,
                  subLocalityRef: selectedSubLocality,
                  postcodeRef: selectedPostcode,
                  included: existingAddressRecord ? existingAddressRecord.included : true,
                });
              }
              idx += 1;
            }
            i += 1;
          } while (i <= endNumber);
        } else if (!startNumber && startSuffix) {
          let suffixNumber = startSuffix.charCodeAt(0);
          const suffixEndNumber = endSuffix ? endSuffix.charCodeAt(0) : 0;
          do {
            if (isChild) {
              const newMapLabel = `${String.fromCharCode(suffixNumber)}, ${paoDetails}`;
              const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
              }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                subLocalityRecord ? ", " : ""
              }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                postcodeRecord ? " " : ""
              }${postcodeRecord ? postcodeRecord.postcode : ""}`;

              const existingAddressRecord = addressList.find((x) => x.address === newAddress);

              newList.push({
                id: idx,
                address: newAddress,
                mapLabel: newMapLabel,
                saoNumber: null,
                saoSuffix: null,
                saoText: String.fromCharCode(suffixNumber),
                paoNumber: null,
                paoSuffix: null,
                paoText: null,
                paoDetails: paoDetails,
                usrn: selectedUsrn,
                postTownRef: selectedPostTown,
                subLocalityRef: selectedSubLocality,
                postcodeRef: selectedPostcode,
                included: existingAddressRecord ? existingAddressRecord.included : true,
              });
            } else {
              const newMapLabel = `${String.fromCharCode(suffixNumber)}`;
              const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
              }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                subLocalityRecord ? ", " : ""
              }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                postcodeRecord ? " " : ""
              }${postcodeRecord ? postcodeRecord.postcode : ""}`;

              const existingAddressRecord = addressList.find((x) => x.address === newAddress);

              newList.push({
                id: idx,
                address: newAddress,
                mapLabel: newMapLabel,
                saoNumber: null,
                saoSuffix: null,
                saoText: null,
                paoNumber: null,
                paoSuffix: String.fromCharCode(suffixNumber),
                paoText: null,
                paoDetails: null,
                usrn: selectedUsrn,
                postTownRef: selectedPostTown,
                subLocalityRef: selectedSubLocality,
                postcodeRef: selectedPostcode,
                included: existingAddressRecord ? existingAddressRecord.included : true,
              });
            }
            idx += 1;
            suffixNumber += 1;
          } while (suffixNumber <= suffixEndNumber);
        }
        break;

      case 2: // [PAO/SAO] text
        if (startPrefix && startNumber && startSuffix) {
          let prefixNumber = startPrefix.charCodeAt(0);
          const prefixEndNumber = endPrefix ? endPrefix.charCodeAt(0) : 0;
          do {
            i = startNumber;
            do {
              if (
                currentNumbering === 1 ||
                (currentNumbering === 2 && i % 2 !== 0) ||
                (currentNumbering === 3 && i % 2 === 0)
              ) {
                let suffixNumber = startSuffix.charCodeAt(0);
                const suffixEndNumber = endSuffix ? endSuffix.charCodeAt(0) : 0;
                do {
                  if (isChild) {
                    const newSaoText = `${text ? text : ""} ${String.fromCharCode(
                      prefixNumber
                    )}${i}${String.fromCharCode(suffixNumber)}`;
                    const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
                    const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                      streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                    }${postTownRecord ? ", " : ""}${
                      postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""
                    }${subLocalityRecord ? ", " : ""}${
                      subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""
                    }${postcodeRecord ? " " : ""}${postcodeRecord ? postcodeRecord.postcode : ""}`;

                    const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                    newList.push({
                      id: idx,
                      address: newAddress,
                      mapLabel: newMapLabel,
                      saoNumber: null,
                      saoSuffix: null,
                      saoText: newSaoText.trim(),
                      paoNumber: null,
                      paoSuffix: null,
                      paoText: null,
                      paoDetails: paoDetails,
                      usrn: selectedUsrn,
                      postTownRef: selectedPostTown,
                      subLocalityRef: selectedSubLocality,
                      postcodeRef: selectedPostcode,
                      included: existingAddressRecord ? existingAddressRecord.included : true,
                    });
                  } else {
                    const newPaoText = `${text ? text : ""} ${String.fromCharCode(
                      prefixNumber
                    )}${i}${String.fromCharCode(suffixNumber)}`;
                    const newMapLabel = `${newPaoText.trim()}`;
                    const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                      streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                    }${postTownRecord ? ", " : ""}${
                      postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""
                    }${subLocalityRecord ? ", " : ""}${
                      subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""
                    }${postcodeRecord ? " " : ""}${postcodeRecord ? postcodeRecord.postcode : ""}`;

                    const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                    newList.push({
                      id: idx,
                      address: newAddress,
                      mapLabel: newMapLabel,
                      saoNumber: null,
                      saoSuffix: null,
                      saoText: null,
                      paoNumber: null,
                      paoSuffix: null,
                      paoText: newPaoText.trim(),
                      paoDetails: null,
                      usrn: selectedUsrn,
                      postTownRef: selectedPostTown,
                      subLocalityRef: selectedSubLocality,
                      postcodeRef: selectedPostcode,
                      included: existingAddressRecord ? existingAddressRecord.included : true,
                    });
                  }
                  idx += 1;
                  suffixNumber += 1;
                } while (suffixNumber <= suffixEndNumber);
              }
              i += 1;
            } while (i <= endNumber);
            prefixNumber += 1;
          } while (prefixNumber <= prefixEndNumber);
        } else if (startPrefix && startNumber && !startSuffix) {
          let prefixNumber = startPrefix.charCodeAt(0);
          const prefixEndNumber = endPrefix ? endPrefix.charCodeAt(0) : 0;
          do {
            i = startNumber;
            do {
              if (
                currentNumbering === 1 ||
                (currentNumbering === 2 && i % 2 !== 0) ||
                (currentNumbering === 3 && i % 2 === 0)
              ) {
                if (isChild) {
                  const newSaoText = `${text ? text : ""} ${String.fromCharCode(prefixNumber)}${i}`;
                  const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
                  const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                    streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                  }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                    subLocalityRecord ? ", " : ""
                  }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                    postcodeRecord ? " " : ""
                  }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                  const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                  newList.push({
                    id: idx,
                    address: newAddress,
                    mapLabel: newMapLabel,
                    saoNumber: null,
                    saoSuffix: null,
                    saoText: newSaoText.trim(),
                    paoNumber: null,
                    paoSuffix: null,
                    paoText: null,
                    paoDetails: paoDetails,
                    usrn: selectedUsrn,
                    postTownRef: selectedPostTown,
                    subLocalityRef: selectedSubLocality,
                    postcodeRef: selectedPostcode,
                    included: existingAddressRecord ? existingAddressRecord.included : true,
                  });
                } else {
                  const newPaoText = `${text ? text : ""} ${String.fromCharCode(prefixNumber)}${i}`;
                  const newMapLabel = `${newPaoText.trim()}`;
                  const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                    streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                  }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                    subLocalityRecord ? ", " : ""
                  }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                    postcodeRecord ? " " : ""
                  }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                  const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                  newList.push({
                    id: idx,
                    address: newAddress,
                    mapLabel: newMapLabel,
                    saoNumber: null,
                    saoSuffix: null,
                    saoText: null,
                    paoNumber: null,
                    paoSuffix: null,
                    paoText: newPaoText.trim(),
                    paoDetails: null,
                    usrn: selectedUsrn,
                    postTownRef: selectedPostTown,
                    subLocalityRef: selectedSubLocality,
                    postcodeRef: selectedPostcode,
                    included: existingAddressRecord ? existingAddressRecord.included : true,
                  });
                }
                idx += 1;
              }
              i += 1;
            } while (i <= endNumber);
            prefixNumber += 1;
          } while (prefixNumber <= prefixEndNumber);
        } else if (startPrefix && !startNumber && startSuffix) {
          let prefixNumber = startPrefix.charCodeAt(0);
          const prefixEndNumber = endPrefix ? endPrefix.charCodeAt(0) : 0;
          do {
            let suffixNumber = startSuffix.charCodeAt(0);
            const suffixEndNumber = endSuffix ? endSuffix.charCodeAt(0) : 0;
            do {
              if (isChild) {
                const newSaoText = `${text ? text : ""} ${String.fromCharCode(prefixNumber)}${String.fromCharCode(
                  suffixNumber
                )}`;
                const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
                const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                  streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                  subLocalityRecord ? ", " : ""
                }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                  postcodeRecord ? " " : ""
                }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                newList.push({
                  id: idx,
                  address: newAddress,
                  mapLabel: newMapLabel,
                  saoNumber: null,
                  saoSuffix: null,
                  saoText: newSaoText.trim(),
                  paoNumber: null,
                  paoSuffix: null,
                  paoText: null,
                  paoDetails: paoDetails,
                  usrn: selectedUsrn,
                  postTownRef: selectedPostTown,
                  subLocalityRef: selectedSubLocality,
                  postcodeRef: selectedPostcode,
                  included: existingAddressRecord ? existingAddressRecord.included : true,
                });
              } else {
                const newPaoText = `${text ? text : ""} ${String.fromCharCode(prefixNumber)}${String.fromCharCode(
                  suffixNumber
                )}`;
                const newMapLabel = `${newPaoText.trim()}`;
                const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                  streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                  subLocalityRecord ? ", " : ""
                }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                  postcodeRecord ? " " : ""
                }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                newList.push({
                  id: idx,
                  address: newAddress,
                  mapLabel: newMapLabel,
                  saoNumber: null,
                  saoSuffix: null,
                  saoText: null,
                  paoNumber: null,
                  paoSuffix: null,
                  paoText: newPaoText.trim(),
                  paoDetails: null,
                  usrn: selectedUsrn,
                  postTownRef: selectedPostTown,
                  subLocalityRef: selectedSubLocality,
                  postcodeRef: selectedPostcode,
                  included: existingAddressRecord ? existingAddressRecord.included : true,
                });
              }
              idx += 1;
              suffixNumber += 1;
            } while (suffixNumber <= suffixEndNumber);
            prefixNumber += 1;
          } while (prefixNumber <= prefixEndNumber);
        } else if (!startPrefix && startNumber && startSuffix) {
          do {
            if (
              currentNumbering === 1 ||
              (currentNumbering === 2 && i % 2 !== 0) ||
              (currentNumbering === 3 && i % 2 === 0)
            ) {
              let suffixNumber = startSuffix.charCodeAt(0);
              const suffixEndNumber = endSuffix ? endSuffix.charCodeAt(0) : 0;
              do {
                if (isChild) {
                  const newSaoText = `${text ? text : ""} ${i}${String.fromCharCode(suffixNumber)}`;
                  const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
                  const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                    streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                  }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                    subLocalityRecord ? ", " : ""
                  }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                    postcodeRecord ? " " : ""
                  }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                  const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                  newList.push({
                    id: idx,
                    address: newAddress,
                    mapLabel: newMapLabel,
                    saoNumber: null,
                    saoSuffix: null,
                    saoText: newSaoText.trim(),
                    paoNumber: null,
                    paoSuffix: null,
                    paoText: null,
                    paoDetails: paoDetails,
                    usrn: selectedUsrn,
                    postTownRef: selectedPostTown,
                    subLocalityRef: selectedSubLocality,
                    postcodeRef: selectedPostcode,
                    included: existingAddressRecord ? existingAddressRecord.included : true,
                  });
                } else {
                  const newPaoText = `${text ? text : ""} ${i}${String.fromCharCode(suffixNumber)}`;
                  const newMapLabel = `${newPaoText.trim()}`;
                  const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                    streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                  }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                    subLocalityRecord ? ", " : ""
                  }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                    postcodeRecord ? " " : ""
                  }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                  const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                  newList.push({
                    id: idx,
                    address: newAddress,
                    mapLabel: newMapLabel,
                    saoNumber: null,
                    saoSuffix: null,
                    saoText: null,
                    paoNumber: null,
                    paoSuffix: null,
                    paoText: newPaoText.trim(),
                    paoDetails: null,
                    usrn: selectedUsrn,
                    postTownRef: selectedPostTown,
                    subLocalityRef: selectedSubLocality,
                    postcodeRef: selectedPostcode,
                    included: existingAddressRecord ? existingAddressRecord.included : true,
                  });
                }
                idx += 1;
                suffixNumber += 1;
              } while (suffixNumber <= suffixEndNumber);
            }
            i += 1;
          } while (i <= endNumber);
        } else if (startPrefix && !startNumber && !startSuffix) {
          let prefixNumber = startPrefix.charCodeAt(0);
          const prefixEndNumber = endPrefix ? endPrefix.charCodeAt(0) : 0;
          do {
            if (isChild) {
              const newSaoText = `${text ? text : ""} ${String.fromCharCode(prefixNumber)}`;
              const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
              const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
              }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                subLocalityRecord ? ", " : ""
              }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                postcodeRecord ? " " : ""
              }${postcodeRecord ? postcodeRecord.postcode : ""}`;

              const existingAddressRecord = addressList.find((x) => x.address === newAddress);

              newList.push({
                id: idx,
                address: newAddress,
                mapLabel: newMapLabel,
                saoNumber: null,
                saoSuffix: null,
                saoText: newSaoText.trim(),
                paoNumber: null,
                paoSuffix: null,
                paoText: null,
                paoDetails: paoDetails,
                usrn: selectedUsrn,
                postTownRef: selectedPostTown,
                subLocalityRef: selectedSubLocality,
                postcodeRef: selectedPostcode,
                included: existingAddressRecord ? existingAddressRecord.included : true,
              });
            } else {
              const newPaoText = `${text ? text : ""} ${String.fromCharCode(prefixNumber)}`;
              const newMapLabel = `${newPaoText.trim()}`;
              const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
              }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                subLocalityRecord ? ", " : ""
              }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                postcodeRecord ? " " : ""
              }${postcodeRecord ? postcodeRecord.postcode : ""}`;

              const existingAddressRecord = addressList.find((x) => x.address === newAddress);

              newList.push({
                id: idx,
                address: newAddress,
                mapLabel: newMapLabel,
                saoNumber: null,
                saoSuffix: null,
                saoText: null,
                paoNumber: null,
                paoSuffix: null,
                paoText: newPaoText.trim(),
                paoDetails: null,
                usrn: selectedUsrn,
                postTownRef: selectedPostTown,
                subLocalityRef: selectedSubLocality,
                postcodeRef: selectedPostcode,
                included: existingAddressRecord ? existingAddressRecord.included : true,
              });
            }
            idx += 1;
            prefixNumber += 1;
          } while (prefixNumber <= prefixEndNumber);
        } else if (!startPrefix && startNumber && !startSuffix) {
          do {
            if (
              currentNumbering === 1 ||
              (currentNumbering === 2 && i % 2 !== 0) ||
              (currentNumbering === 3 && i % 2 === 0)
            ) {
              if (isChild) {
                const newSaoText = `${text ? text : ""} ${i}`;
                const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
                const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                  streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                  subLocalityRecord ? ", " : ""
                }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                  postcodeRecord ? " " : ""
                }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                newList.push({
                  id: idx,
                  address: newAddress,
                  mapLabel: newMapLabel,
                  saoNumber: null,
                  saoSuffix: null,
                  saoText: newSaoText.trim(),
                  paoNumber: null,
                  paoSuffix: null,
                  paoText: null,
                  paoDetails: paoDetails,
                  usrn: selectedUsrn,
                  postTownRef: selectedPostTown,
                  subLocalityRef: selectedSubLocality,
                  postcodeRef: selectedPostcode,
                  included: existingAddressRecord ? existingAddressRecord.included : true,
                });
              } else {
                const newPaoText = `${text ? text : ""} ${i}`;
                const newMapLabel = `${newPaoText.trim()}`;
                const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                  streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
                }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                  subLocalityRecord ? ", " : ""
                }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                  postcodeRecord ? " " : ""
                }${postcodeRecord ? postcodeRecord.postcode : ""}`;

                const existingAddressRecord = addressList.find((x) => x.address === newAddress);

                newList.push({
                  id: idx,
                  address: newAddress,
                  mapLabel: newMapLabel,
                  saoNumber: null,
                  saoSuffix: null,
                  saoText: null,
                  paoNumber: null,
                  paoSuffix: null,
                  paoText: newPaoText.trim(),
                  paoDetails: null,
                  usrn: selectedUsrn,
                  postTownRef: selectedPostTown,
                  subLocalityRef: selectedSubLocality,
                  postcodeRef: selectedPostcode,
                  included: existingAddressRecord ? existingAddressRecord.included : true,
                });
              }
              idx += 1;
            }
            i += 1;
          } while (i <= endNumber);
        } else if (!startPrefix && !startNumber && startSuffix) {
          let suffixNumber = startSuffix.charCodeAt(0);
          const suffixEndNumber = endSuffix ? endSuffix.charCodeAt(0) : 0;
          do {
            if (isChild) {
              const newSaoText = `${text ? text : ""} ${String.fromCharCode(suffixNumber)}`;
              const newMapLabel = `${newSaoText.trim()}, ${paoDetails}`;
              const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
              }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                subLocalityRecord ? ", " : ""
              }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                postcodeRecord ? " " : ""
              }${postcodeRecord ? postcodeRecord.postcode : ""}`;

              const existingAddressRecord = addressList.find((x) => x.address === newAddress);

              newList.push({
                id: idx,
                address: newAddress,
                mapLabel: newMapLabel,
                saoNumber: null,
                saoSuffix: null,
                saoText: newSaoText.trim(),
                paoNumber: null,
                paoSuffix: null,
                paoText: null,
                paoDetails: paoDetails,
                usrn: selectedUsrn,
                postTownRef: selectedPostTown,
                subLocalityRef: selectedSubLocality,
                postcodeRef: selectedPostcode,
                included: existingAddressRecord ? existingAddressRecord.included : true,
              });
            } else {
              const newPaoText = `${text ? text : ""} ${String.fromCharCode(suffixNumber)}`;
              const newMapLabel = `${newPaoText.trim()}`;
              const newAddress = `${newMapLabel}${streetDescriptorRecord ? " " : ""}${
                streetDescriptorRecord ? streetDescriptorToTitleCase(streetDescriptorRecord.address) : ""
              }${postTownRecord ? ", " : ""}${postTownRecord ? stringToSentenceCase(postTownRecord.postTown) : ""}${
                subLocalityRecord ? ", " : ""
              }${subLocalityRecord ? stringToSentenceCase(subLocalityRecord.subLocality) : ""}${
                postcodeRecord ? " " : ""
              }${postcodeRecord ? postcodeRecord.postcode : ""}`;

              const existingAddressRecord = addressList.find((x) => x.address === newAddress);

              newList.push({
                id: idx,
                address: newAddress,
                mapLabel: newMapLabel,
                saoNumber: null,
                saoSuffix: null,
                saoText: null,
                paoNumber: null,
                paoSuffix: null,
                paoText: newPaoText.trim(),
                paoDetails: null,
                usrn: selectedUsrn,
                postTownRef: selectedPostTown,
                subLocalityRef: selectedSubLocality,
                postcodeRef: selectedPostcode,
                included: existingAddressRecord ? existingAddressRecord.included : true,
              });
            }
            idx += 1;
            suffixNumber += 1;
          } while (suffixNumber <= suffixEndNumber);
        }
        break;

      default:
        break;
    }

    setAddressList(newList);
    return newList;
  };

  /**
   * Method to get the updated list of errors after a field has been edited.
   *
   * @param {string} updatedField The name of the field that was updated.
   * @returns {Array} The list of errors.
   */
  const getUpdatedErrors = (updatedField) => {
    if (!errors) return null;

    if (updatedField === "rangeDetails")
      return errors.filter(
        (x) =>
          ![
            "rangestartprefix",
            "rangestartnumber",
            "rangestartsuffix",
            "rangeendprefix",
            "rangeendnumber",
            "rangeendsuffix",
          ].includes(x.field.toLowerCase())
      );
    else return errors.filter((x) => x.field.toLowerCase() !== updatedField.toLowerCase());
  };

  /**
   * Event to handle when the number suffix button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleNumberSuffixClick = (event) => {
    event.stopPropagation();
    setRangeType(1);
    if (onDataChanged && rangeType !== 1) onDataChanged(getUpdatedData("rangeType", 1));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeType"));
  };

  /**
   * Event to handle when the text button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleTextClick = (event) => {
    event.stopPropagation();
    setRangeType(2);
    if (onDataChanged && rangeType !== 2) onDataChanged(getUpdatedData("rangeType", 2));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeType"));
  };

  /**
   * Event to handle when the range text is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeTextChangeEvent = (event) => {
    if (
      characterSetValidator(
        event.target.value,
        `${settingsContext.isScottish ? "OneScotlandProperty" : "GeoPlaceProperty2"}`
      )
    ) {
      setRangeText(event.target.value);
      if (onDataChanged && rangeText !== event.target.value)
        onDataChanged(getUpdatedData("rangeText", event.target.value));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeText"));
    } else if (!rangeText) setRangeText("");
  };

  /**
   * Event to handle when the range start prefix is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeStartPrefixChangeEvent = (event) => {
    if (characterSetValidator(event.target.value, "GeoPlaceAZOnly")) {
      setRangeStartPrefix(event.target.value.toUpperCase());
      if (onDataChanged && rangeStartPrefix !== event.target.value.toUpperCase())
        onDataChanged(getUpdatedData("rangeStartPrefix", event.target.value.toUpperCase()));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeDetails"));
    } else if (!rangeStartPrefix) setRangeStartPrefix("");
  };

  /**
   * Event to handle when the range start number is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeStartNumberChangeEvent = (event) => {
    const newValue = event.target.value;
    const newNumber = Number(newValue);
    if (!newValue || (newNumber >= 1 && newNumber <= 9999)) {
      setRangeStartNumber(newValue);
      if (onDataChanged && rangeStartNumber !== newValue) onDataChanged(getUpdatedData("rangeStartNumber", newValue));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeDetails"));
    }
  };

  /**
   * Event to handle when the range start suffix is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeStartSuffixChangeEvent = (event) => {
    if (characterSetValidator(event.target.value, "GeoPlaceAZOnly")) {
      setRangeStartSuffix(event.target.value.toUpperCase());
      if (onDataChanged && rangeStartSuffix !== event.target.value.toUpperCase())
        onDataChanged(getUpdatedData("rangeStartSuffix", event.target.value.toUpperCase()));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeDetails"));
    } else if (!rangeStartSuffix) setRangeStartSuffix("");
  };

  /**
   * Event to handle when the range end prefix is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeEndPrefixChangeEvent = (event) => {
    if (characterSetValidator(event.target.value, "GeoPlaceAZOnly")) {
      setRangeEndPrefix(event.target.value.toUpperCase());
      if (onDataChanged && rangeEndPrefix !== event.target.value.toUpperCase())
        onDataChanged(getUpdatedData("rangeEndPrefix", event.target.value.toUpperCase()));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeDetails"));
    } else if (!rangeEndPrefix) setRangeEndPrefix("");
  };

  /**
   * Event to handle when the range end number is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeEndNumberChangeEvent = (event) => {
    const newValue = event.target.value;
    const newNumber = Number(newValue);
    if (!newValue || (newNumber >= 1 && newNumber <= 9999)) {
      setRangeEndNumber(newValue);
      if (onDataChanged && rangeEndNumber !== newValue) onDataChanged(getUpdatedData("rangeEndNumber", newValue));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeDetails"));
    }
  };

  /**
   * Event to handle when the range end suffix is changed.
   *
   * @param {object} event The event object.
   */
  const handleRangeEndSuffixChangeEvent = (event) => {
    if (characterSetValidator(event.target.value, "GeoPlaceAZOnly")) {
      setRangeEndSuffix(event.target.value.toUpperCase());
      if (onDataChanged && rangeEndSuffix !== event.target.value.toUpperCase())
        onDataChanged(getUpdatedData("rangeEndSuffix", event.target.value.toUpperCase()));
      if (onErrorChanged) onErrorChanged(getUpdatedErrors("rangeDetails"));
    } else if (!rangeEndSuffix) setRangeEndSuffix("");
  };

  /**
   * Event to handle when the odds and evens button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleOddsAndEvensClick = (event) => {
    event.stopPropagation();
    setNumbering(1);
    if (onDataChanged && numbering !== 1) onDataChanged(getUpdatedData("numbering", 1));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("numbering"));
  };

  /**
   * Event to handle when the odds only button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleOddsOnlyClick = (event) => {
    event.stopPropagation();
    setNumbering(2);
    if (onDataChanged && numbering !== 2) onDataChanged(getUpdatedData("numbering", 2));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("numbering"));
  };

  /**
   * Event to handle when the evens only button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleEvensOnlyClick = (event) => {
    event.stopPropagation();
    setNumbering(3);
    if (onDataChanged && numbering !== 3) onDataChanged(getUpdatedData("numbering", 3));
    if (onErrorChanged) onErrorChanged(getUpdatedErrors("numbering"));
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
   * Event to handle when the address is clicked.
   *
   * @param {object} record The record that was clicked.
   */
  const handleAddressClick = (record) => {
    const updatedAddress = {
      id: record.id,
      address: record.address,
      mapLabel: record.mapLabel,
      saoNumber: record.saoNumber,
      saoSuffix: record.saoSuffix,
      saoText: record.saoText,
      paoNumber: record.paoNumber,
      paoSuffix: record.paoSuffix,
      paoText: record.paoText,
      paoDetails: record.paoDetails,
      usrn: record.usrn,
      postTownRef: record.postTownRef,
      subLocalityRef: record.subLocalityRef,
      postcodeRef: record.postcodeRef,
      included: !record.included,
    };

    const updatedAddressList = addressList.map((x) => [updatedAddress].find((rec) => rec.id === x.id) || x);

    setAddressList(updatedAddressList);
    if (onDataChanged) onDataChanged(getUpdatedData("addressList", updatedAddressList));
  };

  /**
   * Event to handle when the PAO details are changed.
   *
   * @param {object} data The PAO details.
   */
  const handlePaoDetailsChanged = (data) => {
    if (data) {
      const numberStart =
        data.startNumber && Number(data.startNumber) > 0 && Number(data.startNumber) <= 9999
          ? Number(data.startNumber)
          : null;
      const numberEnd =
        data.endNumber && Number(data.endNumber) > 0 && Number(data.endNumber) <= 9999 ? Number(data.endNumber) : null;
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
      userContext,
      settingsContext.isWelsh,
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

  /**
   * Method to get the address list item styling.
   *
   * @param {boolean} included True if the address is being included; otherwise false.
   * @returns {object} The styling to be used for the address list item.
   */
  const getAddressListItemStyle = (included) => {
    if (included)
      return {
        pl: theme.spacing(1),
        backgroundColor: adsPaleBlueB,
        color: adsDarkGrey,
        "&:hover": { backgroundColor: adsPaleBlueA },
      };
    else
      return {
        pl: theme.spacing(1),
        backgroundColor: adsLightGreyC,
        color: adsDarkGrey,
        textDecoration: "line-through",
      };
  };

  /**
   * Method to get the list item avatar styling.
   *
   * @returns {object} The styling for the list item avatar.
   */
  const getListItemAvatarStyle = () => {
    if (addressList.length < 5) return { minWidth: 32, pr: theme.spacing(3) };
    else return { minWidth: 32, pr: theme.spacing(0.875) };
  };

  useEffect(() => {
    if (data) {
      setRangeType(data.rangeType);
      setRangeText(data.rangeText);
      setRangeStartPrefix(data.rangeStartPrefix);
      setRangeStartNumber(data.rangeStartNumber);
      setRangeStartSuffix(data.rangeStartSuffix);
      setRangeEndPrefix(data.rangeEndPrefix);
      setRangeEndNumber(data.rangeEndNumber);
      setRangeEndSuffix(data.rangeEndSuffix);
      setNumbering(data.numbering);
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
      setAddressList(data.addressList);
    }
  }, [data, settingsContext.isScottish]);

  useEffect(() => {
    setRangeTypeError(null);
    setRangeTextError(null);
    setRangeStartPrefixError(null);
    setRangeStartNumberError(null);
    setRangeStartSuffixError(null);
    setRangeEndPrefixError(null);
    setRangeEndNumberError(null);
    setRangeEndSuffixError(null);
    setPaoDetailsError(null);
    setNumberingError(null);
    setDisplayNumberingError(null);
    setUsrnError(null);
    setPostTownRefError(null);
    setSubLocalityRefError(null);
    setPostcodeRefError(null);
    setAddressListError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "rangetype":
            setRangeTypeError(error.errors);
            break;

          case "rangetext":
            setRangeTextError(error.errors);
            break;

          case "rangestartprefix":
            setRangeStartPrefixError(error.errors);
            break;

          case "rangestartnumber":
            setRangeStartNumberError(error.errors);
            break;

          case "rangestartsuffix":
            setRangeStartSuffixError(error.errors);
            break;

          case "rangeendprefix":
            setRangeEndPrefixError(error.errors);
            break;

          case "rangeendnumber":
            setRangeEndNumberError(error.errors);
            break;

          case "rangeendsuffix":
            setRangeEndSuffixError(error.errors);
            break;

          case "paodetails":
            setPaoDetailsError(error.errors);
            break;

          case "numbering":
            setNumberingError(error.errors);
            setDisplayNumberingError(error.errors.join(", "));
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

          case "addresslist":
            setAddressListError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  useEffect(() => {
    rangeType1HasErrors.current = !!(
      (rangeStartNumberError && rangeStartNumberError.length > 0) ||
      (rangeStartSuffixError && rangeStartSuffixError.length > 0) ||
      (rangeEndNumberError && rangeEndNumberError.length > 0) ||
      (rangeEndSuffixError && rangeEndSuffixError.length > 0)
    );

    let rangeErrors = [];
    if (rangeStartNumberError && rangeStartNumberError.length > 0)
      rangeErrors = rangeErrors.concat(rangeStartNumberError);
    if (rangeStartSuffixError && rangeStartSuffixError.length > 0)
      rangeErrors = rangeErrors.concat(rangeStartSuffixError);
    if (rangeEndNumberError && rangeEndNumberError.length > 0) rangeErrors = rangeErrors.concat(rangeEndNumberError);
    if (rangeEndSuffixError && rangeEndSuffixError.length > 0) rangeErrors = rangeErrors.concat(rangeEndSuffixError);

    if (rangeErrors.length > 0) setDisplayRange1Error(rangeErrors.join(", "));
    else setDisplayRange1Error(null);
  }, [rangeStartNumberError, rangeStartSuffixError, rangeEndNumberError, rangeEndSuffixError]);

  useEffect(() => {
    rangeType2HasErrors.current = !!(
      (rangeTextError && rangeTextError.length > 0) ||
      (rangeStartPrefixError && rangeStartPrefixError.length > 0) ||
      (rangeStartNumberError && rangeStartNumberError.length > 0) ||
      (rangeStartSuffixError && rangeStartSuffixError.length > 0) ||
      (rangeEndPrefixError && rangeEndPrefixError.length > 0) ||
      (rangeEndNumberError && rangeEndNumberError.length > 0) ||
      (rangeEndSuffixError && rangeEndSuffixError.length > 0)
    );

    let rangeErrors = [];
    if (rangeTextError && rangeTextError.length > 0) rangeErrors = rangeErrors.concat(rangeTextError);
    if (rangeStartPrefixError && rangeStartPrefixError.length > 0)
      rangeErrors = rangeErrors.concat(rangeStartPrefixError);
    if (rangeStartNumberError && rangeStartNumberError.length > 0)
      rangeErrors = rangeErrors.concat(rangeStartNumberError);
    if (rangeStartSuffixError && rangeStartSuffixError.length > 0)
      rangeErrors = rangeErrors.concat(rangeStartSuffixError);
    if (rangeEndPrefixError && rangeEndPrefixError.length > 0) rangeErrors = rangeErrors.concat(rangeEndPrefixError);
    if (rangeEndNumberError && rangeEndNumberError.length > 0) rangeErrors = rangeErrors.concat(rangeEndNumberError);
    if (rangeEndSuffixError && rangeEndSuffixError.length > 0) rangeErrors = rangeErrors.concat(rangeEndSuffixError);

    if (rangeErrors.length > 0) setDisplayRange2Error(rangeErrors.join(", "));
    else setDisplayRange2Error(null);
  }, [
    rangeTextError,
    rangeStartPrefixError,
    rangeStartNumberError,
    rangeStartSuffixError,
    rangeEndPrefixError,
    rangeEndNumberError,
    rangeEndSuffixError,
  ]);

  return (
    <>
      <Box id="wizard-address-settings-2-tab" sx={{ width: "100%" }}>
        <Box sx={FormBoxRowStyle(rangeTypeError && rangeTypeError.length > 0)}>
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            sx={FormRowStyle(rangeTypeError && rangeTypeError.length > 0)}
          >
            <Grid item xs={3}>
              <Typography id="create-range-using-label" variant="body2" align="left" sx={controlLabelStyle}>
                Create range using
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                <Button
                  id="number-suffix-button"
                  variant="outlined"
                  sx={getStateButtonStyle(rangeType === 1, 185)}
                  onClick={handleNumberSuffixClick}
                  aria-labelledby={"create-range-using-label"}
                >
                  <Typography
                    id="aon-number-suffix-button"
                    variant="body2"
                    align="left"
                    sx={getStateButtonTextStyle(rangeType === 1)}
                  >
                    {`${isChild ? "SAO" : "PAO"} numbering / suffix`}
                  </Typography>
                </Button>
                <Button
                  id="text-button"
                  variant="outlined"
                  sx={getStateButtonStyle(rangeType === 2, 185)}
                  onClick={handleTextClick}
                  aria-labelledby={"create-range-using-label"}
                >
                  <Typography
                    id="aon-text-button"
                    variant="body2"
                    align="left"
                    sx={getStateButtonTextStyle(rangeType === 2)}
                  >
                    {`${isChild ? "SAO" : "PAO"} text`}
                  </Typography>
                </Button>
              </Stack>
            </Grid>
            <ADSErrorDisplay errorText={rangeTypeError} id="create-range-using-label-error" />
          </Grid>
        </Box>
        {rangeType && rangeType === 1 && (
          <Box sx={FormBoxRowStyle(rangeType1HasErrors.current)}>
            <Grid
              container
              justifyContent="flex-start"
              alignItems="center"
              sx={FormRowStyle(rangeType1HasErrors.current)}
            >
              <Grid item xs={3} />
              <Grid item xs={9}>
                <Grid container justifyContent="flex-start" alignItems="center" columns={13} columnSpacing={1}>
                  <Grid item xs={3}>
                    <Typography
                      id="range-start-number-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Number
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      id="range-start-suffix-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Suffix
                    </Typography>
                  </Grid>
                  <Grid item xs={1} />
                  <Grid item xs={3}>
                    <Typography
                      id="range-end-number-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Number
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      id="range-end-suffix-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Suffix
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  id="range-label"
                  variant="body2"
                  align="left"
                  sx={{ fontSize: "14px", color: adsMidGreyA, pt: "12px" }}
                >
                  Range*
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Grid container justifyContent="flex-start" alignItems="center" columns={13} columnSpacing={1}>
                  <Grid item xs={3}>
                    <TextField
                      id="range-start-number-control"
                      sx={FormInputStyle(rangeType1HasErrors.current)}
                      type="number"
                      error={rangeType1HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ min: 0, max: 9999 }}
                      placeholder="e.g. 1"
                      value={rangeStartNumber ? rangeStartNumber : ""}
                      onChange={handleRangeStartNumberChangeEvent}
                      aria-labelledby="range-start-number-label"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      id="range-start-suffix-control"
                      sx={FormInputStyle(rangeType1HasErrors.current)}
                      error={rangeType1HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: `${settingsContext.isWelsh ? 2 : 1}` }}
                      placeholder="e.g. A"
                      value={rangeStartSuffix ? rangeStartSuffix : ""}
                      onChange={handleRangeStartSuffixChangeEvent}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <Typography
                      id="range-to-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "14px", color: adsMidGreyA, pt: "12px" }}
                    >
                      to
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      id="range-end-number-control"
                      sx={FormInputStyle(rangeType1HasErrors.current)}
                      type="number"
                      error={rangeType1HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ min: 0, max: 9999 }}
                      placeholder="e.g. 1"
                      value={rangeEndNumber ? rangeEndNumber : ""}
                      onChange={handleRangeEndNumberChangeEvent}
                      aria-labelledby="range-end-number-label"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      id="range-end-suffix-control"
                      sx={FormInputStyle(rangeType1HasErrors.current)}
                      error={rangeType1HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: `${settingsContext.isWelsh ? 2 : 1}` }}
                      placeholder="e.g. A"
                      value={rangeEndSuffix ? rangeEndSuffix : ""}
                      onChange={handleRangeEndSuffixChangeEvent}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <ADSErrorDisplay errorText={displayRange1Error} id="range-1-label-error" />
            </Grid>
          </Box>
        )}
        {rangeType && rangeType === 2 && (
          <Box sx={FormBoxRowStyle(rangeType2HasErrors.current)}>
            <Grid
              container
              justifyContent="flex-start"
              alignItems="center"
              sx={FormRowStyle(rangeType2HasErrors.current)}
            >
              <Grid item xs={3} />
              <Grid item xs={9}>
                <Grid container justifyContent="flex-start" alignItems="center" columns={19} columnSpacing={1}>
                  <Grid item xs={4}>
                    <Typography
                      id="range-text-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Text*
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      id="range-start-prefix-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Prefix
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      id="range-start-number-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Number
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      id="range-start-suffix-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Suffix
                    </Typography>
                  </Grid>
                  <Grid item xs={1} />
                  <Grid item xs={2}>
                    <Typography
                      id="range-end-prefix-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Prefix
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      id="range-end-number-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Number
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      id="range-end-suffix-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "12px", color: adsMidGreyA, pt: "6px" }}
                    >
                      Suffix
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  id="range-label"
                  variant="body2"
                  align="left"
                  sx={{ fontSize: "14px", color: adsMidGreyA, pt: "12px" }}
                >
                  Range*
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Grid container justifyContent="flex-start" alignItems="center" columns={19} columnSpacing={1}>
                  <Grid item xs={4}>
                    <TextField
                      id="range-text-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: 80 }}
                      placeholder="e.g. Plot"
                      value={rangeText ? rangeText : ""}
                      onChange={handleRangeTextChangeEvent}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="range-start-prefix-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: 1 }}
                      placeholder="e.g. A"
                      value={rangeStartPrefix ? rangeStartPrefix : ""}
                      onChange={handleRangeStartPrefixChangeEvent}
                      aria-labelledby="range-start-prefix-label"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      id="range-start-number-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      type="number"
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ min: 0, max: 9999 }}
                      placeholder="e.g. 1"
                      value={rangeStartNumber ? rangeStartNumber : ""}
                      onChange={handleRangeStartNumberChangeEvent}
                      aria-labelledby="range-start-number-label"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="range-start-suffix-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: 1 }}
                      placeholder="e.g. A"
                      value={rangeStartSuffix ? rangeStartSuffix : ""}
                      onChange={handleRangeStartSuffixChangeEvent}
                      aria-labelledby="range-start-suffix-label"
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <Typography
                      id="range-to-label"
                      variant="body2"
                      align="left"
                      sx={{ fontSize: "14px", color: adsMidGreyA, pt: "12px" }}
                    >
                      to
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="range-end-prefix-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: 1 }}
                      placeholder="e.g. A"
                      value={rangeEndPrefix ? rangeEndPrefix : ""}
                      onChange={handleRangeEndPrefixChangeEvent}
                      aria-labelledby="range-end-prefix-label"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      id="range-end-number-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      type="number"
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ min: 0, max: 9999 }}
                      placeholder="e.g. 1"
                      value={rangeEndNumber ? rangeEndNumber : ""}
                      onChange={handleRangeEndNumberChangeEvent}
                      aria-labelledby="range-end-number-label"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="range-end-suffix-control"
                      sx={FormInputStyle(rangeType2HasErrors.current)}
                      error={rangeType2HasErrors.current}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      size="small"
                      inputProps={{ maxLength: 1 }}
                      placeholder="e.g. A"
                      value={rangeEndSuffix ? rangeEndSuffix : ""}
                      onChange={handleRangeEndSuffixChangeEvent}
                      aria-labelledby="range-end-suffix-label"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <ADSErrorDisplay errorText={displayRange2Error} id="range-2-label-error" />
            </Grid>
          </Box>
        )}
        {rangeType && isChild && (
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
        {rangeType && (
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
        )}
        {rangeType && (
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
        )}
        {settingsContext.isScottish && rangeType && (
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
        {rangeType && (
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
        )}
        {rangeType && (
          <Box sx={FormBoxRowStyle(numberingError && numberingError.length > 0)}>
            <Grid
              container
              justifyContent="flex-start"
              alignItems="center"
              sx={FormRowStyle(numberingError && numberingError.length > 0)}
            >
              <Grid item xs={3}>
                <Typography id="numbering-label" variant="body2" align="left" sx={controlLabelStyle}>
                  Numbering
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                  <Button
                    id="odds-and-evens-button"
                    variant="outlined"
                    sx={getStateButtonStyle(numbering === 1, 137)}
                    onClick={handleOddsAndEvensClick}
                    aria-labelledby={"numbering-label"}
                  >
                    <Typography
                      id="odds-and-evens-button"
                      variant="body2"
                      align="left"
                      sx={getStateButtonTextStyle(numbering === 1)}
                    >
                      Odds and evens
                    </Typography>
                  </Button>
                  <Button
                    id="odds-only-button"
                    variant="outlined"
                    sx={getStateButtonStyle(numbering === 2, 137)}
                    onClick={handleOddsOnlyClick}
                    aria-labelledby={"numbering-label"}
                  >
                    <Typography
                      id="odds-only-button"
                      variant="body2"
                      align="left"
                      sx={getStateButtonTextStyle(numbering === 2)}
                    >
                      Odds only
                    </Typography>
                  </Button>
                  <Button
                    id="evens-only-button"
                    variant="outlined"
                    sx={getStateButtonStyle(numbering === 3, 137)}
                    onClick={handleEvensOnlyClick}
                    aria-labelledby={"numbering-label"}
                  >
                    <Typography
                      id="evens-only-button"
                      variant="body2"
                      align="left"
                      sx={getStateButtonTextStyle(numbering === 3)}
                    >
                      Evens only
                    </Typography>
                  </Button>
                </Stack>
              </Grid>
              <ADSErrorDisplay errorText={displayNumberingError} id="numbering-label-error" />
            </Grid>
          </Box>
        )}
        {rangeType && addressList.length > 0 && (
          <Box sx={{ mt: `${isChild ? "6px" : "24px"}` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography id="create-count-label" variant="body2" align="left" sx={controlLabelStyle}>
                <b>{`Create ${addressList.filter((x) => x.included).length} ${
                  addressList.filter((x) => x.included).length === 1 ? "property" : "properties"
                }`}</b>
              </Typography>
              <Typography
                id="include-label"
                variant="body2"
                align="left"
                sx={{ fontSize: "14px", color: adsMidGreyA, pr: theme.spacing(2) }}
              >
                Include
              </Typography>
            </Stack>
            {addressListError && addressListError.length > 0 && (
              <ADSErrorDisplay errorText={addressListError.join(", ")} id={`address-list-error`} />
            )}
            <List
              sx={{
                width: "100%",
                pt: theme.spacing(0),
                height: "176px",
                overflowY: "auto",
              }}
              component="nav"
              key="key_no_records"
            >
              {addressList.map((rec, index) => (
                <ListItem
                  id={`address-${index}`}
                  key={`address-${index}`}
                  alignItems="flex-start"
                  dense
                  disableGutters
                  sx={getAddressListItemStyle(rec.included)}
                >
                  <ListItemText
                    primary={
                      <Typography id={`address-${index}`} variant="body2" align="left" sx={controlLabelStyle}>
                        {rec.address}
                      </Typography>
                    }
                  />
                  <ListItemAvatar sx={getListItemAvatarStyle()}>
                    <IconButton onClick={() => handleAddressClick(rec)} size="small">
                      {rec.included ? (
                        <CheckBoxRoundedIcon sx={{ color: adsBlueA }} />
                      ) : (
                        <CheckBoxOutlineBlankRoundedIcon
                          sx={{ backgroundColor: adsLightGreyC, color: adsLightGreyB }}
                        />
                      )}
                    </IconButton>
                  </ListItemAvatar>
                </ListItem>
              ))}
            </List>
          </Box>
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

export default WizardAddressDetails2Tab;
