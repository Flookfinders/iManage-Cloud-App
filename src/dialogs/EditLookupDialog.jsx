//region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to edit an existing lookup
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
//    002   29.06.23 Sean Flook          WI40744 Added Make Historic switch.
//    003   29.06.23 Sean Flook                  Added enabled flag for cross reference records.
//    004   06.10.23 Sean Flook                  Use colour variables.
//    005   27.10.23 Sean Flook                  Added missing colour variable.
//    006   24.11.23 Sean Flook                  Moved Stack to @mui/system.
//    007   05.01.24 Sean Flook                  Use CSS shortcuts.
//    008   10.01.24 Sean Flook                  Fix warnings.
//    009   25.01.24 Sean Flook        IMANN-253 Include historic when checking for changes.
//    010   29.02.24 Joel Benford      IMANN-242 Add DbAuthority.
//    011   27.02.24 Sean Flook            MUL15 Fixed dialog title styling.
//    012   27.03.24 Sean Flook                  Added ADSDialogTitle.
//    013   19.04.24 Sean Flook        IMANN-355 Use a dropdown list for selecting the authority.
//    014   26.04.24 Sean Flook        IMANN-413 Removed Gaelic option.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    015   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Grid2,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import { Stack } from "@mui/system";
import ADSDialogTitle from "../components/ADSDialogTitle";

import DETRCodes from "../data/DETRCodes";

import { stringToSentenceCase, GeoPlaceCrossRefSources, lookupToTitleCase } from "../utils/HelperUtils";

import CloseIcon from "@mui/icons-material/Close";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DoneIcon from "@mui/icons-material/Done";
import { adsRed, adsMagenta, adsDarkGrey } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditLookupDialog.propTypes = {
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
  isUsed: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  lookupId: PropTypes.number,
  errorEng: PropTypes.object,
  errorAltLanguage: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditLookupDialog({ variant, isUsed, isOpen, lookupId, errorEng, errorAltLanguage, onDone, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engValue, setEngValue] = useState(null);
  const [cymValue, setCymValue] = useState(null);
  const [lookupHistoric, setLookupHistoric] = useState(false);
  const [geoPlaceCrossRef, setGeoPlaceCrossRef] = useState(false);
  const [crossRefDescription, setCrossRefDescription] = useState(null);
  const [crossRefSource, setCrossRefSource] = useState(null);
  const [crossRefSourceAuthority, setCrossRefSourceAuthority] = useState(null);
  const [crossRefSourceCode, setCrossRefSourceCode] = useState(null);
  const [crossRefEnabled, setCrossRefEnabled] = useState(null);
  const [crossRefExport, setCrossRefExport] = useState(null);
  const [crossRefHistoric, setCrossRefHistoric] = useState(null);
  const [wardName, setWardName] = useState(null);
  const [wardCode, setWardCode] = useState(null);
  const [parishName, setParishName] = useState(null);
  const [parishCode, setParishCode] = useState(null);
  const [engError, setEngError] = useState(null);
  const [cymError, setCymError] = useState(null);
  const [crossRefDescriptionError, setCrossRefDescriptionError] = useState(null);
  const [crossRefSourceCodeError, setCrossRefSourceCodeError] = useState(null);
  const [wardNameError, setWardNameError] = useState(null);
  const [wardCodeError, setWardCodeError] = useState(null);
  const [parishNameError, setParishNameError] = useState(null);
  const [parishCodeError, setParishCodeError] = useState(null);

  const [dbAuthorityRef, setDbAuthorityRef] = useState(null);
  const [dbAuthorityName, setDbAuthorityName] = useState(null);
  const [dbAuthorityMinUsrn, setDbAuthorityMinUsrn] = useState(null);
  const [dbAuthorityMaxUsrn, setDbAuthorityMaxUsrn] = useState(null);
  const [dbAuthorityMinUsrnError, setDbAuthorityMinUsrnError] = useState(null);
  const [dbAuthorityMaxUsrnError, setDbAuthorityMaxUsrnError] = useState(null);

  /**
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    let validData = true;
    switch (variant) {
      case "postcode":
        const postcodeRecord = lookupContext.currentLookups.postcodes.find(
          (x) => x.postcode === engValue && x.postcodeRef !== lookupId
        );
        if (postcodeRecord) {
          setEngError("There is already an entry with this postcode in the table.");
          validData = false;
        }
        const postcodeRegEx = /^([A-Z][A-HJ-Y]?[0-9][A-Z0-9]? ?[0-9][A-Z]{2}|GIR ?0A{2})$/;
        if (!postcodeRegEx.test(engValue)) {
          setEngError("This postcode does not have a valid format.");
          validData = false;
        }
        break;

      case "postTown":
        const currentPostTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);

        if (currentPostTownRecord) {
          if (currentPostTownRecord.language === "ENG") {
            const engPostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTown === engValue && x.language === "ENG" && x.postTownRef !== lookupId
            );
            if (engPostTownRecord) {
              setEngError("There is already an English entry with this post town in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymPostTownRecord = lookupContext.currentLookups.postTowns.find(
                (x) =>
                  x.postTown === cymValue && x.language === "CYM" && x.postTownRef !== currentPostTownRecord.linkedRef
              );
              if (cymPostTownRecord) {
                setCymError("There is already a Welsh entry with this post town in the table.");
                validData = false;
              }
            }
          } else {
            if (currentPostTownRecord.language === "ENG") {
              const engPostTownRecord = lookupContext.currentLookups.postTowns.find(
                (x) =>
                  x.postTown === engValue && x.language === "ENG" && x.postTownRef !== currentPostTownRecord.linkedRef
              );
              if (engPostTownRecord) {
                setEngError("There is already an English entry with this post town in the table.");
                validData = false;
              }

              if (settingsContext.isWelsh) {
                const cymPostTownRecord = lookupContext.currentLookups.postTowns.find(
                  (x) => x.postTown === cymValue && x.language === "CYM" && x.postTownRef !== lookupId
                );
                if (cymPostTownRecord) {
                  setCymError("There is already a Welsh entry with this post town in the table.");
                  validData = false;
                }
              }
            }
          }
        }
        break;

      case "subLocality":
        const currentSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
          (x) => x.subLocalityRef === lookupId
        );

        if (currentSubLocalityRecord) {
          if (currentSubLocalityRecord.language === "ENG") {
            const engSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
              (x) => x.subLocality === engValue && x.language === "ENG" && x.subLocalityRef !== lookupId
            );
            if (engSubLocalityRecord) {
              setEngError("There is already an English entry with this sub-locality in the table.");
              validData = false;
            }
          } else {
            const engSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
              (x) =>
                x.subLocality === engValue &&
                x.language === "ENG" &&
                x.subLocalityRef !== currentSubLocalityRecord.linkedRef
            );
            if (engSubLocalityRecord) {
              setEngError("There is already an English entry with this sub-locality in the table.");
              validData = false;
            }
          }
        }
        break;

      case "crossReference":
        const crossRefDescriptionRecord = lookupContext.currentLookups.appCrossRefs.find(
          (x) => x.xrefDescription === crossRefDescription && x.pkId !== lookupId
        );
        if (crossRefDescriptionRecord) {
          setCrossRefDescriptionError("There is already a cross reference with this description.");
          validData = false;
        }

        const crossRefSourceRecord = lookupContext.currentLookups.appCrossRefs.find(
          (x) => x.xrefSourceRef73 === crossRefSource && x.pkId !== lookupId
        );
        if (crossRefSourceRecord) {
          setCrossRefSourceCodeError("There is already a cross reference with this source.");
          validData = false;
        }
        break;

      case "locality":
        const currentLocalityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);

        if (currentLocalityRecord) {
          if (currentLocalityRecord.language === "ENG") {
            const engLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.locality === engValue && x.language === "ENG" && x.localityRef !== lookupId
            );
            if (engLocalityRecord) {
              setEngError("There is already an English entry with this locality in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymLocalityRecord = lookupContext.currentLookups.localities.find(
                (x) =>
                  x.locality === cymValue && x.language === "CYM" && x.localityRef !== currentLocalityRecord.linkedRef
              );
              if (cymLocalityRecord) {
                setCymError("There is already a Welsh entry with this locality in the table.");
                validData = false;
              }
            }
          } else {
            const engLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) =>
                x.locality === engValue && x.language === "ENG" && x.localityRef !== currentLocalityRecord.linkedRef
            );
            if (engLocalityRecord) {
              setEngError("There is already an English entry with this locality in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymLocalityRecord = lookupContext.currentLookups.localities.find(
                (x) => x.locality === cymValue && x.language === "CYM" && x.localityRef !== lookupId
              );
              if (cymLocalityRecord) {
                setCymError("There is already a Welsh entry with this locality in the table.");
                validData = false;
              }
            }
          }
        }
        break;

      case "town":
        const currentTownRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);

        if (currentTownRecord) {
          if (currentTownRecord.language === "ENG") {
            const engTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.town === engValue && x.language === "ENG" && x.townRef !== lookupId
            );
            if (engTownRecord) {
              setEngError("There is already an English entry with this town in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymTownRecord = lookupContext.currentLookups.towns.find(
                (x) => x.town === cymValue && x.language === "CYM" && x.townRef !== currentTownRecord.linkedRef
              );
              if (cymTownRecord) {
                setCymError("There is already a Welsh entry with this town in the table.");
                validData = false;
              }
            }
          } else {
            const engTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.town === engValue && x.language === "ENG" && x.townRef !== currentTownRecord.linkedRef
            );
            if (engTownRecord) {
              setEngError("There is already an English entry with this town in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymTownRecord = lookupContext.currentLookups.towns.find(
                (x) => x.town === cymValue && x.language === "CYM" && x.townRef !== lookupId
              );
              if (cymTownRecord) {
                setCymError("There is already a Welsh entry with this town in the table.");
                validData = false;
              }
            }
          }
        }
        break;

      case "island":
        const currentIslandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);

        if (currentIslandRecord) {
          if (currentIslandRecord.language === "ENG") {
            const engIslandRecord = lookupContext.currentLookups.islands.find(
              (x) => x.island === engValue && x.language === "ENG" && x.islandRef !== lookupId
            );
            if (engIslandRecord) {
              setEngError("There is already an English entry with this island in the table.");
              validData = false;
            }
          } else {
            const engIslandRecord = lookupContext.currentLookups.islands.find(
              (x) => x.island === engValue && x.language === "ENG" && x.islandRef !== currentIslandRecord.linkedRef
            );
            if (engIslandRecord) {
              setEngError("There is already an English entry with this island in the table.");
              validData = false;
            }
          }
        }
        break;

      case "administrativeArea":
        const currentAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
          (x) => x.administrativeAreaRef === lookupId
        );

        if (currentAdministrativeAreaRecord) {
          if (currentAdministrativeAreaRecord.language === "ENG") {
            const engAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeArea === engValue && x.language === "ENG" && x.administrativeAreaRef !== lookupId
            );
            if (engAdministrativeAreaRecord) {
              setEngError("There is already an English entry with this administrative area in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
                (x) =>
                  x.town === cymValue &&
                  x.language === "CYM" &&
                  x.administrativeAreaRef !== currentAdministrativeAreaRecord.linkedRef
              );
              if (cymAdministrativeAreaRecord) {
                setCymError("There is already a Welsh entry with this administrative area in the table.");
                validData = false;
              }
            }
          } else {
            const engAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) =>
                x.administrativeArea === engValue &&
                x.language === "ENG" &&
                x.administrativeAreaRef !== currentAdministrativeAreaRecord.linkedRef
            );
            if (engAdministrativeAreaRecord) {
              setEngError("There is already an English entry with this administrative area in the table.");
              validData = false;
            }

            if (settingsContext.isWelsh) {
              const cymAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
                (x) => x.town === cymValue && x.language === "CYM" && x.administrativeAreaRef !== lookupId
              );
              if (cymAdministrativeAreaRecord) {
                setCymError("There is already a Welsh entry with this administrative area in the table.");
                validData = false;
              }
            }
          }
        }
        break;

      case "ward":
        const wardNameRecord = lookupContext.currentLookups.wards.find(
          (x) => x.ward === wardName && x.pkId !== lookupId
        );
        if (wardNameRecord) {
          setWardNameError("There is already an entry with this ward in the table.");
        }

        const wardCodeRecord = lookupContext.currentLookups.wards.find(
          (x) => x.wardCode === wardCode && x.pkId !== lookupId
        );
        if (wardCodeRecord) {
          setWardCodeError("There is already an entry with this code in the table.");
        }
        break;

      case "parish":
        const parishNameRecord = lookupContext.currentLookups.parishes.find(
          (x) => x.parish === parishName && x.pkId !== lookupId
        );
        if (parishNameRecord) {
          setParishNameError("There is already an entry with this parish in the table.");
        }

        const parishCodeRecord = lookupContext.currentLookups.parishes.find(
          (x) => x.parishCode === parishCode && x.pkId !== lookupId
        );
        if (parishCodeRecord) {
          setParishCodeError("There is already an entry with this code in the table.");
        }
        break;

      case "dbAuthority":
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
   * Method to determine if the data has been changed or not.
   *
   * @returns {boolean} True if the data has been changed; otherwise false.
   */
  const hasDataChanged = () => {
    let dataChanged = false;

    switch (variant) {
      case "postcode":
        const oldPostcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === lookupId);
        if (oldPostcodeRecord) {
          dataChanged = oldPostcodeRecord.postcode !== engValue || oldPostcodeRecord.historic !== lookupHistoric;
        }
        break;

      case "postTown":
        const oldPostTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
        if (oldPostTownRecord) {
          if (oldPostTownRecord.language === "ENG") {
            if (settingsContext.isWelsh) {
              const oldCymPostTownRecord = lookupContext.currentLookups.postTowns.find(
                (x) => x.postTownRef === oldPostTownRecord.linkedRef
              );
              dataChanged =
                oldPostTownRecord.postTown !== engValue ||
                oldCymPostTownRecord.postTown !== cymValue ||
                oldPostTownRecord.historic !== lookupHistoric ||
                oldCymPostTownRecord.historic !== lookupHistoric;
            } else {
              dataChanged = oldPostTownRecord.postTown !== engValue || oldPostTownRecord.historic !== lookupHistoric;
            }
          } else {
            const oldEngPostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTownRef === oldPostTownRecord.linkedRef
            );
            if (settingsContext.isWelsh) {
              dataChanged =
                oldEngPostTownRecord.postTown !== engValue ||
                oldPostTownRecord.postTown !== cymValue ||
                oldPostTownRecord.historic !== lookupHistoric ||
                oldEngPostTownRecord.historic !== lookupHistoric;
            } else {
              dataChanged =
                oldEngPostTownRecord.postTown !== engValue ||
                oldPostTownRecord.historic !== lookupHistoric ||
                oldEngPostTownRecord.historic !== lookupHistoric;
            }
          }
        }
        break;

      case "subLocality":
        const oldSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
          (x) => x.subLocalityRef === lookupId
        );
        if (oldSubLocalityRecord) {
          if (oldSubLocalityRecord.language === "ENG") {
            dataChanged =
              oldSubLocalityRecord.subLocality !== engValue || oldSubLocalityRecord.historic !== lookupHistoric;
          } else {
            const oldEngSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
              (x) => x.subLocalityRef === oldSubLocalityRecord.linkedRef
            );
            dataChanged =
              oldEngSubLocalityRecord.subLocality !== engValue ||
              oldSubLocalityRecord.historic !== lookupHistoric ||
              oldEngSubLocalityRecord !== lookupHistoric;
          }
        }
        break;

      case "crossReference":
        const oldCrossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === lookupId);
        dataChanged =
          oldCrossReferenceRecord.xrefDescription !== crossRefDescription ||
          oldCrossReferenceRecord.xrefSourceRef73 !== crossRefSource ||
          oldCrossReferenceRecord.enabled !== crossRefEnabled ||
          oldCrossReferenceRecord.export !== crossRefExport ||
          oldCrossReferenceRecord.historic !== crossRefHistoric;
        break;

      case "locality":
        const oldLocalityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
        if (oldLocalityRecord) {
          if (oldLocalityRecord.language === "ENG") {
            if (settingsContext.isWelsh) {
              const oldCymLocalityRecord = lookupContext.currentLookups.localities.find(
                (x) => x.localityRef === oldLocalityRecord.linkedRef
              );
              dataChanged =
                oldLocalityRecord.locality !== engValue ||
                oldCymLocalityRecord.locality !== cymValue ||
                oldLocalityRecord.historic !== lookupHistoric ||
                oldCymLocalityRecord !== lookupHistoric;
            } else {
              dataChanged = oldLocalityRecord.locality !== engValue || oldLocalityRecord.historic !== lookupHistoric;
            }
          } else {
            const oldEngLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.localityRef === oldLocalityRecord.linkedRef
            );
            if (settingsContext.isWelsh) {
              dataChanged =
                oldEngLocalityRecord.locality !== engValue ||
                oldLocalityRecord.locality !== cymValue ||
                oldLocalityRecord.historic !== lookupHistoric ||
                oldEngLocalityRecord !== lookupHistoric;
            } else {
              dataChanged =
                oldEngLocalityRecord.locality !== engValue ||
                oldLocalityRecord.historic !== lookupHistoric ||
                oldEngLocalityRecord !== lookupHistoric;
            }
          }
        }
        break;

      case "town":
        const oldTownRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
        if (oldTownRecord) {
          if (oldTownRecord.language === "ENG") {
            if (settingsContext.isWelsh) {
              const oldCymTownRecord = lookupContext.currentLookups.towns.find(
                (x) => x.townRef === oldTownRecord.linkedRef
              );
              dataChanged =
                oldTownRecord.town !== engValue ||
                oldCymTownRecord.town !== cymValue ||
                oldTownRecord.historic !== lookupHistoric ||
                oldCymTownRecord.historic !== lookupHistoric;
            } else {
              dataChanged = oldTownRecord.town !== engValue || oldTownRecord.historic !== lookupHistoric;
            }
          } else {
            const oldEngTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.townRef === oldTownRecord.linkedRef
            );
            if (settingsContext.isWelsh) {
              dataChanged =
                oldEngTownRecord.town !== engValue ||
                oldTownRecord.town !== cymValue ||
                oldTownRecord.historic !== lookupHistoric ||
                oldEngTownRecord.historic !== lookupHistoric;
            } else {
              dataChanged = oldEngTownRecord.town !== engValue || oldEngTownRecord.historic !== lookupHistoric;
            }
          }
        }
        break;

      case "island":
        const oldIslandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
        if (oldIslandRecord) {
          if (oldIslandRecord.language === "ENG") {
            dataChanged = oldIslandRecord.island !== engValue || oldIslandRecord.historic !== lookupHistoric;
          } else {
            const oldEngIslandRecord = lookupContext.currentLookups.islands.find(
              (x) => x.islandRef === oldIslandRecord.linkedRef
            );
            dataChanged =
              oldEngIslandRecord.island !== engValue ||
              oldIslandRecord.historic !== lookupHistoric ||
              oldEngIslandRecord.historic !== lookupHistoric;
          }
        }
        break;

      case "administrativeArea":
        const oldAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
          (x) => x.administrativeAreaRef === lookupId
        );
        if (oldAdministrativeAreaRecord) {
          if (oldAdministrativeAreaRecord.language === "ENG") {
            if (settingsContext.isWelsh) {
              const oldCymAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
                (x) => x.administrativeAreaRef === oldAdministrativeAreaRecord.linkedRef
              );
              dataChanged =
                oldAdministrativeAreaRecord.administrativeArea !== engValue ||
                oldCymAdministrativeAreaRecord.administrativeArea !== cymValue ||
                oldAdministrativeAreaRecord.historic !== lookupHistoric ||
                oldCymAdministrativeAreaRecord.historic !== lookupHistoric;
            } else {
              dataChanged =
                oldAdministrativeAreaRecord.administrativeArea !== engValue ||
                oldAdministrativeAreaRecord.historic !== lookupHistoric;
            }
          } else {
            const oldEngAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeAreaRef === oldAdministrativeAreaRecord.linkedRef
            );
            if (settingsContext.isWelsh) {
              dataChanged =
                oldEngAdministrativeAreaRecord.administrativeArea !== engValue ||
                oldAdministrativeAreaRecord.administrativeArea !== cymValue ||
                oldAdministrativeAreaRecord.historic !== lookupHistoric ||
                oldEngAdministrativeAreaRecord.historic !== lookupHistoric;
            } else {
              dataChanged =
                oldEngAdministrativeAreaRecord.administrativeArea !== engValue ||
                oldAdministrativeAreaRecord.historic !== lookupHistoric ||
                oldEngAdministrativeAreaRecord.historic !== lookupHistoric;
            }
          }
        }
        break;

      case "ward":
        const oldWardRecord = lookupContext.currentLookups.wards.find((x) => x.pkId === lookupId);
        dataChanged =
          oldWardRecord.ward !== wardName ||
          oldWardRecord.wardCode !== wardCode ||
          oldWardRecord.historic !== lookupHistoric;
        break;

      case "parish":
        const oldParishRecord = lookupContext.currentLookups.parishes.find((x) => x.pkId === lookupId);
        dataChanged =
          oldParishRecord.parish !== parishName ||
          oldParishRecord.parishCode !== parishCode ||
          oldParishRecord !== lookupHistoric;
        break;

      case "dbAuthority":
        const oldDbAuthorityRecord = lookupContext.currentLookups.dbAuthorities.find(
          (x) => x.authorityRef === lookupId
        );
        dataChanged =
          oldDbAuthorityRecord.authorityRef !== dbAuthorityRef ||
          oldDbAuthorityRecord.authorityName !== dbAuthorityName ||
          oldDbAuthorityRecord.minUsrn !== dbAuthorityMinUsrn ||
          oldDbAuthorityRecord.maxUsrn !== dbAuthorityMaxUsrn;
        break;

      default:
        break;
    }

    return dataChanged;
  };

  /**
   * Method to get the lookup data.
   *
   * @returns {object} The lookup data object.
   */
  const getLookupData = () => {
    switch (variant) {
      case "postcode":
        return { variant: variant, lookupData: { lookupId: lookupId, postcode: engValue, historic: lookupHistoric } };

      case "postTown":
      case "locality":
      case "town":
      case "administrativeArea":
        return {
          variant: variant,
          lookupData: {
            lookupId: lookupId,
            english: engValue,
            welsh: cymValue,
            historic: lookupHistoric,
          },
        };

      case "subLocality":
      case "island":
        return {
          variant: variant,
          lookupData: { lookupId: lookupId, english: engValue, historic: lookupHistoric },
        };

      case "crossReference":
        return {
          variant: variant,
          lookupData: {
            lookupId: lookupId,
            xrefDescription: crossRefDescription,
            xrefSourceRef73: `${crossRefSourceAuthority}${crossRefSourceCode}`,
            historic: crossRefHistoric,
            enabled: crossRefEnabled,
            export: crossRefExport,
          },
        };

      case "ward":
        return {
          variant: variant,
          lookupData: { lookupId: lookupId, ward: wardName, wardCode: wardCode, historic: lookupHistoric },
        };

      case "parish":
        return {
          variant: variant,
          lookupData: { lookupId: lookupId, parish: parishName, parishCode: parishCode, historic: lookupHistoric },
        };

      case "dbAuthority":
        return {
          variant: variant,
          lookupData: {
            lookupId: lookupId,
            dbAuthorityRef: lookupId,
            dbAuthorityName: dbAuthorityName.toUpperCase(),
            dbAuthorityMinUsrn: parseInt(dbAuthorityMinUsrn),
            dbAuthorityMaxUsrn: parseInt(dbAuthorityMaxUsrn),
            dbAuthorityRefCurrent: parseInt(dbAuthorityRef),
          },
        };

      default:
        return null;
    }
  };

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
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
      if (hasDataChanged()) {
        if (onDone) onDone(getLookupData());
      } else handleCancelClick();
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
   * Event to handle when the lookup historic flag changes.
   */
  const onLookupHistoricChange = () => {
    setLookupHistoric(!lookupHistoric);
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
    setCrossRefSource(`${crossRefSourceAuthority}${event.target.value}`);
  };

  /**
   * Event to handle when the cross reference enabled flag changes.
   */
  const onCrossRefEnabledChange = () => {
    setCrossRefEnabled(!crossRefEnabled);
  };

  /**
   * Event to handle when the cross reference export flag changes.
   */
  const onCrossRefExportChange = () => {
    setCrossRefExport(!crossRefExport);
  };

  /**
   * Event to handle when the cross reference historic flag changes.
   */
  const onCrossRefHistoricChange = () => {
    setCrossRefHistoric(!crossRefHistoric);
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
   * Event to handle when the dbAuthority ref changes.
   *
   * @param {object} event The event object.
   */
  const onDbAuthorityRefChange = (event) => {
    setDbAuthorityRef(event.target.value);
    setDbAuthorityName(event.target.value);
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
   * Method to get the maximum field length by variant.
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
        if (lookupId) {
          const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === lookupId);
          if (postcodeRecord) {
            setEngValue(postcodeRecord.postcode);
            setLookupHistoric(postcodeRecord.historic);
          } else {
            setEngValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          setLookupHistoric(false);
        }
        break;

      case "postTown":
        setLookupType("post town");
        if (lookupId) {
          const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
          if (postTownRecord) {
            if (postTownRecord.language === "ENG") setEngValue(postTownRecord.postTown);
            else {
              const engPostTown = lookupContext.currentLookups.postTowns.find(
                (x) => x.postTownRef === postTownRecord.linkedRef && x.language === "ENG"
              );
              if (engPostTown) setEngValue(engPostTown.postTown);
              else setEngValue(null);
            }

            if (settingsContext.isWelsh) {
              if (postTownRecord.language === "CYM") setCymValue(postTownRecord.postTown);
              else {
                const cymPostTown = lookupContext.currentLookups.postTowns.find(
                  (x) => x.postTownRef === postTownRecord.linkedRef && x.language === "CYM"
                );
                if (cymPostTown) setCymValue(cymPostTown.postTown);
                else setCymValue(null);
              }
            }
            setLookupHistoric(postTownRecord.historic);
          } else {
            setEngValue(null);
            if (settingsContext.isWelsh) setCymValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          if (settingsContext.isWelsh) setCymValue(null);
          setLookupHistoric(false);
        }
        break;

      case "subLocality":
        setLookupType("sub-locality");
        if (lookupId) {
          const subLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === lookupId
          );
          if (subLocalityRecord) {
            if (subLocalityRecord.language === "ENG") setEngValue(subLocalityRecord.subLocality);
            else {
              const engSubLocality = lookupContext.currentLookups.subLocalities.find(
                (x) => x.subLocalityRef === subLocalityRecord.linkedRef && x.language === "ENG"
              );
              if (engSubLocality) setEngValue(engSubLocality.subLocality);
              else setEngValue(null);
            }

            setLookupHistoric(subLocalityRecord.historic);
          } else {
            setEngValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          setLookupHistoric(false);
        }
        break;

      case "crossReference":
        setLookupType("cross reference");
        if (lookupId) {
          const crossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === lookupId);
          if (crossReferenceRecord) {
            const sourceCode = crossReferenceRecord.xrefSourceRef73.substring(4);
            setGeoPlaceCrossRef(GeoPlaceCrossRefSources.includes(sourceCode));
            setCrossRefDescription(crossReferenceRecord.xrefDescription);
            setCrossRefSource(crossReferenceRecord.xrefSourceRef73);
            setCrossRefSourceAuthority(crossReferenceRecord.xrefSourceRef73.substring(0, 4));
            setCrossRefSourceCode(sourceCode);
            setCrossRefEnabled(crossReferenceRecord.enabled);
            setCrossRefExport(crossReferenceRecord.export);
            setCrossRefHistoric(crossReferenceRecord.historic);
          } else {
            setGeoPlaceCrossRef(null);
            setCrossRefDescription(null);
            setCrossRefSource(null);
            setCrossRefSourceAuthority(null);
            setCrossRefSourceCode(null);
            setCrossRefEnabled(true);
            setCrossRefExport(false);
            setCrossRefHistoric(false);
          }
        } else {
          setGeoPlaceCrossRef(null);
          setCrossRefDescription(null);
          setCrossRefSource(null);
          setCrossRefSourceAuthority(null);
          setCrossRefSourceCode(null);
          setCrossRefEnabled(true);
          setCrossRefExport(false);
          setCrossRefHistoric(false);
        }
        break;

      case "locality":
        setLookupType("locality");
        if (lookupId) {
          const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
          if (localityRecord) {
            if (localityRecord.language === "ENG") setEngValue(localityRecord.locality);
            else {
              const engLocality = lookupContext.currentLookups.localities.find(
                (x) => x.localityRef === localityRecord.linkedRef && x.language === "ENG"
              );
              if (engLocality) setEngValue(engLocality.locality);
              else setEngValue(null);
            }

            if (settingsContext.isWelsh) {
              if (localityRecord.language === "CYM") setCymValue(localityRecord.locality);
              else {
                const cymLocality = lookupContext.currentLookups.localities.find(
                  (x) => x.localityRef === localityRecord.linkedRef && x.language === "CYM"
                );
                if (cymLocality) setCymValue(cymLocality.locality);
                else setCymValue(null);
              }
            }
            setLookupHistoric(localityRecord.historic);
          } else {
            setEngValue(null);
            if (settingsContext.isWelsh) setCymValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          if (settingsContext.isWelsh) setCymValue(null);
          setLookupHistoric(false);
        }
        break;

      case "town":
        setLookupType("town");
        if (lookupId) {
          const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
          if (townRecord) {
            if (townRecord.language === "ENG") setEngValue(townRecord.town);
            else {
              const engTown = lookupContext.currentLookups.towns.find(
                (x) => x.townRef === townRecord.linkedRef && x.language === "ENG"
              );
              if (engTown) setEngValue(engTown.town);
              else setEngValue(null);
            }

            if (settingsContext.isWelsh) {
              if (townRecord.language === "CYM") setCymValue(townRecord.town);
              else {
                const cymTown = lookupContext.currentLookups.towns.find(
                  (x) => x.townRef === townRecord.linkedRef && x.language === "CYM"
                );
                if (cymTown) setCymValue(cymTown.town);
                else setCymValue(null);
              }
            }
            setLookupHistoric(townRecord.historic);
          } else {
            setEngValue(null);
            if (settingsContext.isWelsh) setCymValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          if (settingsContext.isWelsh) setCymValue(null);
          setLookupHistoric(false);
        }
        break;

      case "island":
        setLookupType("island");
        if (lookupId) {
          const islandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
          if (islandRecord) {
            if (islandRecord.language === "ENG") setEngValue(islandRecord.island);
            else {
              const engIsland = lookupContext.currentLookups.islands.find(
                (x) => x.islandRef === islandRecord.linkedRef && x.language === "ENG"
              );
              if (engIsland) setEngValue(engIsland.island);
              else setEngValue(null);
            }

            setLookupHistoric(islandRecord.historic);
          } else {
            setEngValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          setLookupHistoric(false);
        }
        break;

      case "administrativeArea":
        setLookupType("administrative area");
        if (lookupId) {
          const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeAreaRef === lookupId
          );
          if (administrativeAreaRecord) {
            if (administrativeAreaRecord.language === "ENG") setEngValue(administrativeAreaRecord.administrativeArea);
            else {
              const engAdministrativeArea = lookupContext.currentLookups.adminAuthorities.find(
                (x) => x.administrativeAreaRef === administrativeAreaRecord.linkedRef && x.language === "ENG"
              );
              if (engAdministrativeArea) setEngValue(engAdministrativeArea.administrativeArea);
              else setEngValue(null);
            }

            if (settingsContext.isWelsh) {
              if (administrativeAreaRecord.language === "CYM") setCymValue(administrativeAreaRecord.administrativeArea);
              else {
                const cymAdministrativeArea = lookupContext.currentLookups.adminAuthorities.find(
                  (x) => x.administrativeAreaRef === administrativeAreaRecord.linkedRef && x.language === "CYM"
                );
                if (cymAdministrativeArea) setCymValue(cymAdministrativeArea.administrativeArea);
                else setCymValue(null);
              }
            }
            setLookupHistoric(administrativeAreaRecord.historic);
          } else {
            setEngValue(null);
            if (settingsContext.isWelsh) setCymValue(null);
            setLookupHistoric(false);
          }
        } else {
          setEngValue(null);
          if (settingsContext.isWelsh) setCymValue(null);
          setLookupHistoric(false);
        }
        break;

      case "ward":
        setLookupType("ward");
        if (lookupId) {
          const wardRecord = lookupContext.currentLookups.wards.find((x) => x.pkId === lookupId);
          if (wardRecord) {
            setWardName(wardRecord.ward);
            setWardCode(wardRecord.wardCode);
            setLookupHistoric(wardRecord.historic);
          } else {
            setWardName(null);
            setWardCode(null);
            setLookupHistoric(false);
          }
        } else {
          setWardName(null);
          setWardCode(null);
          setLookupHistoric(false);
        }
        break;

      case "parish":
        setLookupType("parish");
        if (lookupId) {
          const parishRecord = lookupContext.currentLookups.parishes.find((x) => x.pkId === lookupId);
          if (parishRecord) {
            setParishName(parishRecord.parish);
            setParishCode(parishRecord.parishCode);
            setLookupHistoric(parishRecord.historic);
          } else {
            setParishName(null);
            setParishCode(null);
            setLookupHistoric(false);
          }
        } else {
          setParishName(null);
          setParishCode(null);
          setLookupHistoric(false);
        }
        break;

      case "dbAuthority":
        setLookupType("authority");
        if (lookupId) {
          const dbAuthorityRecord = lookupContext.currentLookups.dbAuthorities.find((x) => x.authorityRef === lookupId);
          if (dbAuthorityRecord) {
            setDbAuthorityRef(dbAuthorityRecord.authorityRef.toString());
            setDbAuthorityName(dbAuthorityRecord.authorityName);
            setDbAuthorityMinUsrn(dbAuthorityRecord.minUsrn.toString());
            setDbAuthorityMaxUsrn(dbAuthorityRecord.maxUsrn.toString());
          } else {
            setDbAuthorityRef(null);
            setDbAuthorityName(null);
            setDbAuthorityMinUsrn(null);
            setDbAuthorityMaxUsrn(null);
          }
        } else {
          setDbAuthorityRef(null);
          setDbAuthorityName(null);
          setDbAuthorityMinUsrn(null);
          setDbAuthorityMaxUsrn(null);
        }
        break;

      default:
        setLookupType("unknown");
        break;
    }

    setShowDialog(isOpen);
  }, [variant, lookupId, isOpen, lookupContext, settingsContext]);

  useEffect(() => {
    if (errorEng) setEngError(errorEng);
    else setEngError(null);

    if (errorAltLanguage) {
      setCymError(errorAltLanguage);
    } else {
      setCymError(null);
    }
  }, [errorEng, errorAltLanguage]);

  return (
    <Dialog open={showDialog} aria-labelledby="edit-lookup-dialog" fullWidth maxWidth="xs" onClose={handleDialogClose}>
      <ADSDialogTitle title={`Edit ${lookupType}`} closeTooltip="Cancel" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {variant === "crossReference" ? (
          <Grid2 container alignItems="center" rowSpacing={2}>
            <Grid2 size={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Description
              </Typography>
            </Grid2>
            <Grid2 size={8}>
              <TextField
                variant="outlined"
                error={crossRefDescriptionError}
                helperText={
                  <Typography variant="caption" sx={{ color: adsRed }} align="left">
                    {crossRefDescriptionError}
                  </Typography>
                }
                value={crossRefDescription}
                fullWidth
                size="small"
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onCrossRefDescriptionChange}
                slotProps={{
                  htmlInput: { maxLength: "200" },
                }}
              />
            </Grid2>
            <Grid2 size={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Source
              </Typography>
            </Grid2>
            {geoPlaceCrossRef ? (
              <Grid2 size={8}>
                <Typography variant="body1" sx={{ ml: theme.spacing(1) }} gutterBottom>
                  {crossRefSource}
                </Typography>
              </Grid2>
            ) : (
              <Grid2 size={8}>
                <Stack direction="row" alignItems="center">
                  <Typography variant="body1" sx={{ ml: theme.spacing(1) }} gutterBottom>
                    {crossRefSourceAuthority}
                  </Typography>
                  <TextField
                    variant="outlined"
                    error={crossRefSourceCodeError}
                    helperText={
                      <Typography variant="caption" sx={{ color: adsRed }} align="left">
                        {crossRefSourceCodeError}
                      </Typography>
                    }
                    value={crossRefSourceCode}
                    size="small"
                    sx={{
                      color: theme.palette.background.contrastText,
                      pl: theme.spacing(1),
                      pr: theme.spacing(1),
                      mb: theme.spacing(1),
                      width: "70px",
                    }}
                    onChange={onCrossRefSourceCodeChange}
                    slotProps={{
                      htmlInput: { maxLength: "2" },
                    }}
                  />
                </Stack>
              </Grid2>
            )}
            <Grid2 size={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Enabled
              </Typography>
            </Grid2>
            <Grid2 size={8}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"ads-switch-enabled"}
                    disabled={geoPlaceCrossRef}
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
            </Grid2>
            <Grid2 size={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Include in export
              </Typography>
            </Grid2>
            <Grid2 size={8}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"ads-switch-include-in-export"}
                    disabled={geoPlaceCrossRef}
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
            </Grid2>
            {!geoPlaceCrossRef && (
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Make historic
                </Typography>
              </Grid2>
            )}
            {!geoPlaceCrossRef && (
              <Grid2 size={8}>
                <FormControlLabel
                  value="end"
                  control={
                    <Switch
                      id={"ads-switch-make-historic"}
                      checked={crossRefHistoric}
                      onChange={onCrossRefHistoricChange}
                      color="primary"
                      aria-labelledby={"ads-switch-label-make-historic"}
                    />
                  }
                  label={crossRefHistoric ? "Yes" : "No"}
                  labelPlacement="end"
                  sx={{ ml: "1px", mb: theme.spacing(1) }}
                  // sx={{ ml: "1px", mt: theme.spacing(1.5) }}
                />
              </Grid2>
            )}
          </Grid2>
        ) : variant === "dbAuthority" ? (
          <Stack direction="column">
            <Grid2 container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Authority
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <Autocomplete
                  id={"ads-select-authority"}
                  sx={{
                    color: "inherit",
                  }}
                  getOptionLabel={(option) => lookupToTitleCase(option, false)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText={"No authority records"}
                  options={DETRCodes}
                  value={dbAuthorityName}
                  autoHighlight
                  disabled
                  autoSelect
                  onChange={onDbAuthorityRefChange}
                  renderOption={(props, option) => {
                    return (
                      <li {...props}>
                        <Typography variant="body2" sx={{ color: adsDarkGrey }} align="left">
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
                      fullWidth
                      placeholder="e.g. 1234"
                      variant="outlined"
                      margin="dense"
                      size="small"
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Min USRN
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  type="number"
                  error={dbAuthorityMinUsrnError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {dbAuthorityMinUsrnError}
                    </Typography>
                  }
                  value={dbAuthorityMinUsrn}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onDbAuthorityMinUsrnChange}
                  slotProps={{
                    htmlInput: { min: 0, max: 99999999 },
                  }}
                />
              </Grid2>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Max USRN
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  type="number"
                  error={dbAuthorityMaxUsrnError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {dbAuthorityMaxUsrnError}
                    </Typography>
                  }
                  value={dbAuthorityMaxUsrn}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onDbAuthorityMaxUsrnChange}
                  slotProps={{
                    htmlInput: { min: 0, max: 99999999 },
                  }}
                />
              </Grid2>
            </Grid2>
          </Stack>
        ) : variant === "ward" ? (
          <Stack direction="column">
            <Stack direction="row" alignItems="center" spacing={1}>
              <ReportProblemIcon sx={{ color: adsMagenta }} />
              <Typography
                variant="body2"
                align="justify"
                sx={{ color: adsMagenta }}
              >{`Editing the ${lookupType} will create a new version and make the existing version historic. Any records attached to the previous version will be updated to the new entry.`}</Typography>
            </Stack>
            <Grid2 container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Ward
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  error={wardNameError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {wardNameError}
                    </Typography>
                  }
                  value={wardName}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onWardNameChange}
                  slotProps={{
                    htmlInput: { maxLength: "200" },
                  }}
                />
              </Grid2>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Code
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  error={wardCodeError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {wardCodeError}
                    </Typography>
                  }
                  value={wardCode}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onWardCodeChange}
                  slotProps={{
                    htmlInput: { maxLength: "10" },
                  }}
                />
              </Grid2>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Make historic
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <FormControlLabel
                  value="end"
                  control={
                    <Switch
                      id={"ads-switch-make-historic"}
                      checked={lookupHistoric}
                      onChange={onLookupHistoricChange}
                      color="primary"
                      aria-labelledby={"ads-switch-label-make-historic"}
                    />
                  }
                  label={lookupHistoric ? "Yes" : "No"}
                  labelPlacement="end"
                  sx={{ ml: "1px", mb: theme.spacing(1) }}
                />
              </Grid2>
            </Grid2>
          </Stack>
        ) : variant === "parish" ? (
          <Stack direction="column">
            <Stack direction="row" alignItems="center" spacing={1}>
              <ReportProblemIcon sx={{ color: adsMagenta }} />
              <Typography
                variant="body2"
                align="justify"
                sx={{ color: adsMagenta }}
              >{`Editing the ${lookupType} will create a new version and make the existing version historic. Any records attached to the previous version will be updated to the new entry.`}</Typography>
            </Stack>
            <Grid2 container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Parish
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  error={parishNameError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {parishNameError}
                    </Typography>
                  }
                  value={parishName}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onParishNameChange}
                  slotProps={{
                    htmlInput: { maxLength: "200" },
                  }}
                />
              </Grid2>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Code
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  error={parishCodeError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {parishCodeError}
                    </Typography>
                  }
                  value={parishCode}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onParishCodeChange}
                  slotProps={{
                    htmlInput: { maxLength: "10" },
                  }}
                />
              </Grid2>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Make historic
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <FormControlLabel
                  value="end"
                  control={
                    <Switch
                      id={"ads-switch-make-historic"}
                      checked={lookupHistoric}
                      onChange={onLookupHistoricChange}
                      color="primary"
                      aria-labelledby={"ads-switch-label-make-historic"}
                    />
                  }
                  label={lookupHistoric ? "Yes" : "No"}
                  labelPlacement="end"
                  sx={{ ml: "1px", mb: theme.spacing(1) }}
                />
              </Grid2>
            </Grid2>
          </Stack>
        ) : (
          <Stack direction="column">
            {isUsed && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <ReportProblemIcon sx={{ color: adsMagenta }} />
                <Typography
                  variant="body2"
                  align="justify"
                  sx={{ color: adsMagenta }}
                >{`Editing the ${lookupType} will create a new version and make the existing version historic. Any records attached to the previous version will be updated to the new entry.`}</Typography>
              </Stack>
            )}
            <Grid2 container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  {`${
                    variant === "postcode"
                      ? "Postcode"
                      : !settingsContext.isWelsh
                      ? stringToSentenceCase(lookupType)
                      : "English"
                  }`}
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <TextField
                  variant="outlined"
                  error={engError}
                  helperText={
                    <Typography variant="caption" sx={{ color: adsRed }} align="left">
                      {engError}
                    </Typography>
                  }
                  value={engValue}
                  fullWidth
                  size="small"
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                  onChange={onEngChange}
                  slotProps={{
                    htmlInput: { maxLength: `${getMaxFieldLength()}` },
                  }}
                />
              </Grid2>
              {variant !== "postcode" && settingsContext.isWelsh && (
                <Fragment>
                  <Grid2 size={4}>
                    <Typography variant="body2" align="right" gutterBottom>
                      Welsh
                    </Typography>
                  </Grid2>
                  <Grid2 size={8}>
                    <TextField
                      variant="outlined"
                      error={cymError}
                      helperText={
                        <Typography variant="caption" sx={{ color: adsRed }} align="left">
                          {cymError}
                        </Typography>
                      }
                      value={cymValue}
                      fullWidth
                      size="small"
                      sx={{
                        color: theme.palette.background.contrastText,
                        pl: theme.spacing(1),
                        pr: theme.spacing(1),
                      }}
                      onChange={onCymChange}
                      slotProps={{
                        htmlInput: { maxLength: `${getMaxFieldLength()}` },
                      }}
                    />
                  </Grid2>
                </Fragment>
              )}
              <Grid2 size={4}>
                <Typography variant="body1" align="right" gutterBottom>
                  Make historic
                </Typography>
              </Grid2>
              <Grid2 size={8}>
                <FormControlLabel
                  value="end"
                  control={
                    <Switch
                      id={"ads-switch-make-historic"}
                      checked={lookupHistoric}
                      onChange={onLookupHistoricChange}
                      color="primary"
                      aria-labelledby={"ads-switch-label-make-historic"}
                    />
                  }
                  label={lookupHistoric ? "Yes" : "No"}
                  labelPlacement="end"
                  sx={{ ml: "1px", mb: theme.spacing(1) }}
                />
              </Grid2>
            </Grid2>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
          Done
        </Button>
        <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditLookupDialog;
