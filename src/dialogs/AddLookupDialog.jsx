//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to add a new lookup
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
//    002   29.06.23 Sean Flook         WI40744 Removed Make Historic switch.
//    003   29.06.23 Sean Flook                 Added enabled flag for cross reference records.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//    007   10.01.24 Sean Flook                 Fix warnings.
//    008   29.02.24 Joel Benford     IMANN-242 Add DbAuthority.
//    009   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    010   27.03.24 Sean Flook                 Added ADSDialogTitle and fixed some warnings.
//    011   19.04.24 Sean Flook       IMANN-355 Use a dropdown list for selecting the authority.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useState, useContext, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import { Stack } from "@mui/system";
import ADSDialogTitle from "../components/ADSDialogTitle";

import DETRCodes from "../data/DETRCodes";

import { lookupToTitleCase, stringToSentenceCase } from "../utils/HelperUtils";

import DoneIcon from "@mui/icons-material/Done";
import { adsDarkGrey, adsRed } from "../utils/ADSColours";
import { blueButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

AddLookupDialog.propTypes = {
  variant: PropTypes.oneOf([
    "postcode",
    "postTown",
    "subLocality",
    "crossReference",
    "locality",
    "town",
    "island",
    "administrativeArea",
    "dbAuthority",
    "ward",
    "parish",
    "operationalDistrict",
    "unknown",
  ]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  errorEng: PropTypes.object,
  errorAltLanguage: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function AddLookupDialog({ variant, isOpen, errorEng, errorAltLanguage, onDone, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engPlaceholder, setEngPlaceholder] = useState(null);
  const [cymPlaceholder, setCymPlaceholder] = useState(null);
  const [gaePlaceholder, setGaePlaceholder] = useState(null);
  const [engValue, setEngValue] = useState("");
  const [cymValue, setCymValue] = useState("");
  const [gaeValue, setGaeValue] = useState("");
  const [crossRefDescription, setCrossRefDescription] = useState("");
  const [crossRefSourceAuthority, setCrossRefSourceAuthority] = useState("");
  const [crossRefSourceCode, setCrossRefSourceCode] = useState("");
  const [crossRefEnabled, setCrossRefEnabled] = useState(true);
  const [crossRefExport, setCrossRefExport] = useState(false);
  const [wardName, setWardName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [parishName, setParishName] = useState("");
  const [parishCode, setParishCode] = useState("");
  const [engError, setEngError] = useState("");
  const [cymError, setCymError] = useState("");
  const [gaeError, setGaeError] = useState("");
  const [crossRefDescriptionError, setCrossRefDescriptionError] = useState("");
  const [crossRefSourceCodeError, setCrossRefSourceCodeError] = useState("");
  const [wardNameError, setWardNameError] = useState("");
  const [wardCodeError, setWardCodeError] = useState("");
  const [parishNameError, setParishNameError] = useState("");
  const [parishCodeError, setParishCodeError] = useState("");

  const [dbAuthorityRef, setDbAuthorityRef] = useState("");
  const [dbAuthorityName, setDbAuthorityName] = useState("");
  const [dbAuthorityMinUsrn, setDbAuthorityMinUsrn] = useState(0);
  const [dbAuthorityMaxUsrn, setDbAuthorityMaxUsrn] = useState(0);
  const [dbAuthorityError, setDbAuthorityError] = useState("");
  const [dbAuthorityMinUsrnError, setDbAuthorityMinUsrnError] = useState("");
  const [dbAuthorityMaxUsrnError, setDbAuthorityMaxUsrnError] = useState("");

  /**
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    let validData = true;
    switch (variant) {
      case "postcode":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty postcode.");
          validData = false;
        } else {
          const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcode === engValue);
          if (postcodeRecord) {
            setEngError("There is already an entry with this postcode in the table.");
            validData = false;
          }
          const postcodeRegEx = /^([A-Z][A-HJ-Y]?[0-9][A-Z0-9]? ?[0-9][A-Z]{2}|GIR ?0A{2})$/;
          if (!postcodeRegEx.test(engValue)) {
            setEngError("This postcode does not have a valid format.");
            validData = false;
          }
        }
        break;

      case "postTown":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty post town.");
          validData = false;
        } else {
          const engPostTownRecord = lookupContext.currentLookups.postTowns.find(
            (x) => x.postTown === engValue && x.language === "ENG"
          );
          if (engPostTownRecord) {
            setEngError("There is already an English entry with this post town in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty post town.");
            validData = false;
          } else {
            const cymPostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTown === cymValue && x.language === "CYM"
            );
            if (cymPostTownRecord) {
              setCymError("There is already a Welsh entry with this post town in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty post town.");
            validData = false;
          } else {
            const gaePostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTown === gaeValue && x.language === "GAE"
            );
            if (gaePostTownRecord) {
              setGaeError("There is already a Gaelic entry with this post town in the table.");
              validData = false;
            }
          }
        }
        break;

      case "subLocality":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty sub-locality.");
          validData = false;
        } else {
          const engSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocality === engValue && x.language === "ENG"
          );
          if (engSubLocalityRecord) {
            setEngError("There is already an English entry with this sub-locality in the table.");
            validData = false;
          }
        }

        if (!gaeValue || gaeValue.length === 0) {
          setGaeError("You cannot add an empty sub-locality.");
          validData = false;
        } else {
          const gaeSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocality === gaeValue && x.language === "GAE"
          );
          if (gaeSubLocalityRecord) {
            setGaeError("There is already a Gaelic entry with this sub-locality in the table.");
            validData = false;
          }
        }
        break;

      case "crossReference":
        if (!crossRefDescription || crossRefDescription.length === 0) {
          setCrossRefDescriptionError("You cannot have an empty description.");
          validData = false;
        } else {
          const crossRefDescriptionRecord = lookupContext.currentLookups.appCrossRefs.find(
            (x) => x.xrefDescription === crossRefDescription
          );
          if (crossRefDescriptionRecord) {
            setCrossRefDescriptionError("There is already a cross reference with this description.");
            validData = false;
          }
        }

        if (!crossRefSourceCode || crossRefSourceCode.length === 0) {
          setCrossRefSourceCodeError("You cannot have an empty source.");
          validData = false;
        } else {
          const crossRefSourceRecord = lookupContext.currentLookups.appCrossRefs.find(
            (x) => x.xrefSourceRef73 === `${crossRefSourceAuthority}${crossRefSourceCode}`
          );
          if (crossRefSourceRecord) {
            setCrossRefSourceCodeError("There is already a cross reference with this source.");
            validData = false;
          }
        }
        break;

      case "locality":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty locality.");
          validData = false;
        } else {
          const engLocalityRecord = lookupContext.currentLookups.localities.find(
            (x) => x.locality === engValue && x.language === "ENG"
          );
          if (engLocalityRecord) {
            setEngError("There is already an English entry with this locality in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty locality.");
            validData = false;
          } else {
            const cymLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.locality === cymValue && x.language === "CYM"
            );
            if (cymLocalityRecord) {
              setCymError("There is already a Welsh entry with this locality in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty locality.");
            validData = false;
          } else {
            const gaeLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.locality === gaeValue && x.language === "GAE"
            );
            if (gaeLocalityRecord) {
              setGaeError("There is already a Gaelic entry with this locality in the table.");
              validData = false;
            }
          }
        }
        break;

      case "town":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty town.");
          validData = false;
        } else {
          const engTownRecord = lookupContext.currentLookups.towns.find(
            (x) => x.town === engValue && x.language === "ENG"
          );
          if (engTownRecord) {
            setEngError("There is already an English entry with this town in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty town.");
            validData = false;
          } else {
            const cymTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.town === cymValue && x.language === "CYM"
            );
            if (cymTownRecord) {
              setCymError("There is already a Welsh entry with this town in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty town.");
            validData = false;
          } else {
            const gaeTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.town === gaeValue && x.language === "GAE"
            );
            if (gaeTownRecord) {
              setGaeError("There is already a Gaelic entry with this town in the table.");
              validData = false;
            }
          }
        }
        break;

      case "island":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty island.");
          validData = false;
        } else {
          const engIslandRecord = lookupContext.currentLookups.islands.find(
            (x) => x.island === engValue && x.language === "ENG"
          );
          if (engIslandRecord) {
            setEngError("There is already an English entry with this island in the table.");
            validData = false;
          }
        }

        if (!gaeValue || gaeValue.length === 0) {
          setGaeError("You cannot add an empty island.");
          validData = false;
        } else {
          const gaeIslandRecord = lookupContext.currentLookups.islands.find(
            (x) => x.island === gaeValue && x.language === "GAE"
          );
          if (gaeIslandRecord) {
            setGaeError("There is already a Gaelic entry with this island in the table.");
            validData = false;
          }
        }
        break;

      case "administrativeArea":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty administrative area.");
          validData = false;
        } else {
          const engAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeArea === engValue && x.language === "ENG"
          );
          if (engAdministrativeAreaRecord) {
            setEngError("There is already an English entry with this administrative area in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty administrative area.");
            validData = false;
          } else {
            const cymAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.town === cymValue && x.language === "CYM"
            );
            if (cymAdministrativeAreaRecord) {
              setCymError("There is already a Welsh entry with this administrative area in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty administrative area.");
            validData = false;
          } else {
            const gaeAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.town === gaeValue && x.language === "GAE"
            );
            if (gaeAdministrativeAreaRecord) {
              setGaeError("There is already a Gaelic entry with this administrative area in the table.");
              validData = false;
            }
          }
        }
        break;

      case "ward":
        if (!wardName || wardName.length === 0) {
          setWardNameError("You cannot add an empty ward.");
          validData = false;
        } else {
          const wardNameRecord = lookupContext.currentLookups.wards.find((x) => x.ward === wardName);
          if (wardNameRecord) {
            setWardNameError("There is already an entry with this ward in the table.");
          }
        }

        if (!wardCode || wardCode.length === 0) {
          setWardCodeError("You cannot add an empty code.");
          validData = false;
        } else {
          const wardCodeRecord = lookupContext.currentLookups.wards.find((x) => x.wardCode === wardCode);
          if (wardCodeRecord) {
            setWardCodeError("There is already an entry with this code in the table.");
          }
        }
        break;

      case "parish":
        if (!parishName || parishName.length === 0) {
          setParishNameError("You cannot add an empty parish.");
          validData = false;
        } else {
          const parishNameRecord = lookupContext.currentLookups.parishes.find((x) => x.parish === parishName);
          if (parishNameRecord) {
            setParishNameError("There is already an entry with this parish in the table.");
          }
        }

        if (!parishCode || parishCode.length === 0) {
          setParishCodeError("You cannot add an empty code.");
          validData = false;
        } else {
          const parishCodeRecord = lookupContext.currentLookups.parishes.find((x) => x.parishCode === parishCode);
          if (parishCodeRecord) {
            setParishCodeError("There is already an entry with this code in the table.");
          }
        }
        break;

      case "dbAuthority":
        if (!Number.isInteger(parseFloat(dbAuthorityRef)) || dbAuthorityRef <= 0 || dbAuthorityRef > 9999) {
          setDbAuthorityError("DETR code must be 0 to 9999.");
          validData = false;
        } else {
          const dbAuthorityRefRecord = lookupContext.currentLookups.dbAuthorities.find(
            (x) => x.authorityRef === dbAuthorityRef
          );
          if (dbAuthorityRefRecord) {
            setDbAuthorityError("There is already an entry with this code in the table.");
            validData = false;
          }
        }

        if (!dbAuthorityName || dbAuthorityName.length === 0) {
          setDbAuthorityError("You cannot add an empty authority name.");
          validData = false;
        } else {
          const dbAuthorityNameRecord = lookupContext.currentLookups.dbAuthorities.find(
            (x) => x.authorityName === dbAuthorityName
          );
          if (dbAuthorityNameRecord) {
            setDbAuthorityError("There is already an entry with this authority name in the table.");
            validData = false;
          }
        }

        if (
          !Number.isInteger(parseFloat(dbAuthorityMinUsrn)) ||
          dbAuthorityMinUsrn <= 0 ||
          dbAuthorityMinUsrn > 99999999
        ) {
          setDbAuthorityMinUsrnError("USRN must be 0 to 99999999.");
          validData = false;
        }

        if (
          !Number.isInteger(parseFloat(dbAuthorityMinUsrn)) ||
          dbAuthorityMaxUsrn <= 0 ||
          dbAuthorityMaxUsrn > 99999999
        ) {
          setDbAuthorityMaxUsrnError("USRN must be 0 to 99999999.");
          validData = false;
        }

        if (validData && parseInt(dbAuthorityMinUsrn) > parseInt(dbAuthorityMaxUsrn)) {
          setDbAuthorityMaxUsrnError("Min USRN cannot be greater than max.");
          setDbAuthorityMinUsrnError("Min USRN cannot be greater than max.");
          validData = false;
        }
        break;

      default:
        break;
    }

    return validData;
  };

  /**
   * Method to return the new lookup data.
   *
   * @returns {object} The new lookup data.
   */
  const getLookupData = () => {
    switch (variant) {
      case "postcode":
        return { variant: variant, lookupData: { postcode: engValue, historic: false } };

      case "postTown":
      case "locality":
      case "town":
      case "administrativeArea":
        return {
          variant: variant,
          lookupData: { english: engValue, welsh: cymValue, gaelic: gaeValue, historic: false },
        };

      case "subLocality":
      case "island":
        return { variant: variant, lookupData: { english: engValue, gaelic: gaeValue, historic: false } };

      case "crossReference":
        return {
          variant: variant,
          lookupData: {
            xrefDescription: crossRefDescription,
            xrefSourceRef73: `${crossRefSourceAuthority}${crossRefSourceCode}`,
            historic: false,
            enabled: crossRefEnabled,
            export: crossRefExport,
          },
        };

      case "ward":
        return { variant: variant, lookupData: { ward: wardName, wardCode: wardCode, historic: false } };

      case "parish":
        return {
          variant: variant,
          lookupData: { parish: parishName, parishCode: parishCode, historic: false },
        };

      case "dbAuthority":
        return {
          variant: variant,
          lookupData: {
            dbAuthorityRef: parseInt(dbAuthorityRef),
            dbAuthorityName: dbAuthorityName.toUpperCase(),
            dbAuthorityMinUsrn: parseInt(dbAuthorityMinUsrn),
            dbAuthorityMaxUsrn: parseInt(dbAuthorityMaxUsrn),
          },
        };

      default:
        return null;
    }
  };

  /**
   * Event to handle when the dialog closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (dataValid()) {
      if (onDone) onDone(getLookupData());
    }
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the English value changes.
   *
   * @param {object} event The event object.
   */
  const onEngChange = (event) => {
    if (variant === "postcode") setEngValue(event.target.value.toUpperCase());
    else setEngValue(event.target.value);
  };

  /**
   * Event to handle when the Welsh value changes.
   *
   * @param {object} event The event object.
   */
  const onCymChange = (event) => {
    setCymValue(event.target.value);
  };

  /**
   * Event to handle when the Scottish value changes.
   *
   * @param {object} event The event object.
   */
  const onGaeChange = (event) => {
    setGaeValue(event.target.value);
  };

  /**
   * Event to handle when the cross reference description changes.
   *
   * @param {object} event The event object.
   */
  const onCrossRefDescriptionChange = (event) => {
    setCrossRefDescription(event.target.value);
  };

  /**
   * Event to handle when the cross reference source code changes.
   *
   * @param {object} event The event object.
   */
  const onCrossRefSourceCodeChange = (event) => {
    setCrossRefSourceCode(event.target.value);
  };

  /**
   * Event to handle when the cross reference enabled changes.
   */
  const onCrossRefEnabledChange = () => {
    setCrossRefEnabled(!crossRefEnabled);
  };

  /**
   * Event to handle when the cross reference export changes.
   */
  const onCrossRefExportChange = () => {
    setCrossRefExport(!crossRefExport);
  };

  /**
   * Event to handle when the ward name changes.
   *
   * @param {object} event The event object.
   */
  const onWardNameChange = (event) => {
    setWardName(event.target.value);
  };

  /**
   * Event to handle when the ward code changes.
   *
   * @param {object} event The event object.
   */
  const onWardCodeChange = (event) => {
    setWardCode(event.target.value);
  };

  /**
   * Event to handle when the parish name changes.
   *
   * @param {object} event The event object.
   */
  const onParishNameChange = (event) => {
    setParishName(event.target.value);
  };

  /**
   * Event to handle when the parish code changes.
   *
   * @param {object} event The event object.
   */
  const onParishCodeChange = (event) => {
    setParishCode(event.target.value);
  };

  /**
   * Event to handle when the dbAuthority DETR code changes.
   *
   * @param {object} event The event object.
   */
  const onDbAuthorityChange = (event, newValue) => {
    const newAuthority = DETRCodes.find((x) => x.text === newValue);
    if (newAuthority) {
      setDbAuthorityName(newValue);
      setDbAuthorityRef(newAuthority.id);
    }
  };

  /**
   * Event to handle when the dbAuthority min usrn changes.
   *
   * @param {object} event The event object.
   */
  const onDbAuthorityMinUsrnChange = (event) => {
    setDbAuthorityMinUsrn(event.target.value);
  };

  /**
   * Event to handle when the dbAuthority max usrn changes.
   *
   * @param {object} event The event object.
   */
  const onDbAuthorityMaxUsrnChange = (event) => {
    setDbAuthorityMaxUsrn(event.target.value);
  };

  /**
   * Method to get the maximum field length for each variant.
   *
   * @returns {string} The maximum field length.
   */
  const getMaxFieldLength = () => {
    switch (variant) {
      case "postcode":
        return "8";

      case "postTown":
        return "30";

      case "subLocality":
        return "35";

      case "locality":
        return "35";

      case "town":
        return "30";

      case "island":
        return "30";

      case "administrativeArea":
        return "30";

      case "dbAuthority":
        return "255";

      default:
        break;
    }
  };

  useEffect(() => {
    switch (variant) {
      case "postcode":
        setLookupType("postcode");
        setEngPlaceholder("e.g. GU21 5SB");
        setEngValue("");
        setEngError("");
        break;

      case "postTown":
        setLookupType("post town");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue("");
          setCymValue("");
          setEngError("");
          setCymError("");
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perth");
          setGaePlaceholder("e.g. Peairt");
          setEngValue("");
          setGaeValue("");
          setEngError("");
          setGaeError("");
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue("");
          setEngError("");
        }
        break;

      case "subLocality":
        setLookupType("sub-locality");
        setEngPlaceholder("e.g. Perth");
        setGaePlaceholder("e.g. Peairt");
        setEngValue("");
        setGaeValue("");
        setEngError("");
        setGaeError("");
        break;

      case "crossReference":
        setLookupType("cross reference");
        setCrossRefSourceAuthority(settingsContext ? settingsContext.authorityCode : null);
        setCrossRefDescription("");
        setCrossRefSourceCode("");
        setCrossRefExport(false);
        setCrossRefEnabled(true);
        setCrossRefDescriptionError("");
        setCrossRefSourceCodeError("");
        break;

      case "locality":
        setLookupType("locality");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue("");
          setCymValue("");
          setEngError("");
          setCymError("");
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perth");
          setGaePlaceholder("e.g. Peairt");
          setEngValue("");
          setGaeValue("");
          setEngError("");
          setGaeError("");
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue("");
          setEngError("");
        }
        break;

      case "town":
        setLookupType("town");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue("");
          setCymValue("");
          setEngError("");
          setCymError("");
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perth");
          setGaePlaceholder("e.g. Peairt");
          setEngValue("");
          setGaeValue("");
          setEngError("");
          setGaeError("");
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue("");
          setEngError("");
        }
        break;

      case "island":
        setLookupType("island");
        setEngPlaceholder("e.g. Raasay");
        setGaePlaceholder("e.g. Ratharsair");
        setEngValue("");
        setGaeValue("");
        setEngError("");
        setGaeError("");
        break;

      case "administrativeArea":
        setLookupType("administrative area");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue("");
          setCymValue("");
          setEngError("");
          setCymError("");
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perthshire");
          setGaePlaceholder("e.g. Siorrachd Pheairt");
          setEngValue("");
          setGaeValue("");
          setEngError("");
          setGaeError("");
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue("");
          setEngError("");
        }
        break;

      case "ward":
        setLookupType("ward");
        setWardName("");
        setWardCode("");
        setWardNameError("");
        setWardCodeError("");
        break;

      case "parish":
        setLookupType("parish");
        setParishName("");
        setParishCode("");
        setParishNameError("");
        setParishCodeError("");
        break;

      case "dbAuthority":
        setLookupType("authority");
        setDbAuthorityName("");
        setDbAuthorityRef("");
        setDbAuthorityMinUsrn(0);
        setDbAuthorityMaxUsrn(0);
        setDbAuthorityError("");
        setDbAuthorityMinUsrnError("");
        setDbAuthorityMaxUsrnError("");
        break;

      default:
        setLookupType("unknown");
        break;
    }

    setShowDialog(isOpen);
  }, [variant, isOpen, settingsContext]);

  useEffect(() => {
    if (errorEng) setEngError(errorEng);
    else setEngError("");

    if (errorAltLanguage) {
      setCymError(errorAltLanguage);
      setGaeError(errorAltLanguage);
    } else {
      setCymError("");
      setGaeError("");
    }
  }, [errorEng, errorAltLanguage]);

  return (
    <Dialog open={showDialog} aria-labelledby="add-lookup-dialog" fullWidth maxWidth="xs" onClose={handleDialogClose}>
      <ADSDialogTitle title={`Add ${lookupType}`} closeTooltip="Cancel" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {variant === "crossReference" ? (
          <Grid container alignItems="center" rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Description
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={!!crossRefDescriptionError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {crossRefDescriptionError}
                  </Typography>
                }
                value={crossRefDescription}
                placeholder="e.g. Council Tax"
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: "200" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onCrossRefDescriptionChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Source
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Stack direction="row" alignItems="center">
                <Typography variant="body1" sx={{ ml: theme.spacing(1) }} gutterBottom>
                  {crossRefSourceAuthority}
                </Typography>
                <TextField
                  variant="outlined"
                  error={!!crossRefSourceCodeError}
                  helperText={
                    <Typography variant="caption" color={adsRed} align="left">
                      {crossRefSourceCodeError}
                    </Typography>
                  }
                  value={crossRefSourceCode}
                  placeholder="AA"
                  size="small"
                  inputProps={{ maxLength: "2" }}
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                    mb: theme.spacing(1),
                    width: "70px",
                  }}
                  onChange={onCrossRefSourceCodeChange}
                />
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Enabled
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"ads-switch-enabled"}
                    checked={crossRefEnabled}
                    onChange={onCrossRefEnabledChange}
                    color="primary"
                    aria-labelledby={"ads-switch-label-enabled"}
                  />
                }
                label={crossRefEnabled ? "Yes" : "No"}
                labelPlacement="end"
                sx={{ ml: "1px", mb: theme.spacing(1) }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Include in export
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"ads-switch-include-in-export"}
                    checked={crossRefExport}
                    onChange={onCrossRefExportChange}
                    color="primary"
                    aria-labelledby={"ads-switch-label-include-in-export"}
                  />
                }
                label={crossRefExport ? "Yes" : "No"}
                labelPlacement="end"
                sx={{ ml: "1px", mb: theme.spacing(1) }}
              />
            </Grid>
          </Grid>
        ) : variant === "dbAuthority" ? (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Authority
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Autocomplete
                id={"ads-select-authority"}
                sx={{
                  color: "inherit",
                }}
                getOptionLabel={(option) => lookupToTitleCase(option, false)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={"No authority records"}
                options={DETRCodes.map((x) => x.text)}
                value={dbAuthorityName}
                autoHighlight
                autoSelect
                onChange={onDbAuthorityChange}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      <Typography variant="body2" color={adsDarkGrey} align="left">
                        {lookupToTitleCase(option, false)}
                      </Typography>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      color: theme.palette.background.contrastText,
                      pl: theme.spacing(1),
                      pr: theme.spacing(1),
                    }}
                    error={!!dbAuthorityError}
                    helperText={
                      <Typography variant="caption" color={adsRed} align="left">
                        {dbAuthorityError}
                      </Typography>
                    }
                    fullWidth
                    required
                    placeholder="e.g. 1234"
                    variant="outlined"
                    margin="dense"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Min USRN
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                type="number"
                error={!!dbAuthorityMinUsrnError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {dbAuthorityMinUsrnError}
                  </Typography>
                }
                value={dbAuthorityMinUsrn}
                placeholder="e.g. 12345678"
                fullWidth
                size="small"
                inputProps={{ min: 0, max: 99999999 }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onDbAuthorityMinUsrnChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Max USRN
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                type="number"
                error={!!dbAuthorityMaxUsrnError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {dbAuthorityMaxUsrnError}
                  </Typography>
                }
                value={dbAuthorityMaxUsrn}
                placeholder="e.g. 12345678"
                fullWidth
                size="small"
                inputProps={{ min: 0, max: 99999999 }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onDbAuthorityMaxUsrnChange}
              />
            </Grid>
          </Grid>
        ) : variant === "ward" ? (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Ward
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={!!wardNameError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {wardNameError}
                  </Typography>
                }
                value={wardName}
                placeholder="e.g. Byfleet"
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: "200" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onWardNameChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Code
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={!!wardCodeError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {wardCodeError}
                  </Typography>
                }
                value={wardCode}
                placeholder="e.g. E05007441"
                fullWidth
                size="small"
                inputProps={{ maxLength: "10" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onWardCodeChange}
              />
            </Grid>
          </Grid>
        ) : variant === "parish" ? (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Parish
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={!!parishNameError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {parishNameError}
                  </Typography>
                }
                value={parishName}
                placeholder="e.g. Byfleet"
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: "200" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onParishNameChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Code
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={!!parishCodeError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {parishCodeError}
                  </Typography>
                }
                value={parishCode}
                placeholder="e.g. E04009626"
                fullWidth
                size="small"
                inputProps={{ maxLength: "10" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onParishCodeChange}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                {`${
                  variant === "postcode"
                    ? "Postcode"
                    : !settingsContext.isWelsh && !settingsContext.isScottish
                    ? stringToSentenceCase(lookupType)
                    : "English"
                }`}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={!!engError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {engError}
                  </Typography>
                }
                value={engValue}
                placeholder={engPlaceholder}
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: `${getMaxFieldLength()}` }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onEngChange}
              />
            </Grid>
            {variant !== "postcode" && settingsContext.isWelsh && (
              <Fragment>
                <Grid item xs={4}>
                  <Typography variant="body2" align="right" gutterBottom>
                    Welsh
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    variant="outlined"
                    error={!!cymError}
                    helperText={
                      <Typography variant="caption" color={adsRed} align="left">
                        {cymError}
                      </Typography>
                    }
                    value={cymValue}
                    placeholder={cymPlaceholder}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: `${getMaxFieldLength()}` }}
                    sx={{
                      color: theme.palette.background.contrastText,
                      pl: theme.spacing(1),
                      pr: theme.spacing(1),
                    }}
                    onChange={onCymChange}
                  />
                </Grid>
              </Fragment>
            )}
            {variant !== "postcode" && settingsContext.isScottish && (
              <Fragment>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right" gutterBottom>
                    Gaelic
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    variant="outlined"
                    error={!!gaeError}
                    helperText={
                      <Typography variant="caption" color={adsRed} align="left">
                        {gaeError}
                      </Typography>
                    }
                    value={gaeValue}
                    placeholder={gaePlaceholder}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: `${getMaxFieldLength()}` }}
                    sx={{
                      color: theme.palette.background.contrastText,
                      pl: theme.spacing(1),
                      pr: theme.spacing(1),
                    }}
                    onChange={onGaeChange}
                  />
                </Grid>
              </Fragment>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddLookupDialog;
