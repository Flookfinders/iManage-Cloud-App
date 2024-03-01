/* #region header */
/**************************************************************************************************
//
//  Description: Delete lookup dialog
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   10.01.24 Sean Flook                 Fix warnings.
//    006   05.02.24 Sean Flook                 Include operational districts.
//    007   29.02.24 Joel Benford     IMANN-242 Add DbAuthority.
//    008   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, Button } from "@mui/material";
import { Stack } from "@mui/system";

import { stringToSentenceCase } from "../utils/HelperUtils";

import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import BlockIcon from "@mui/icons-material/Block";
import { adsRed } from "../utils/ADSColours";
import { redButtonStyle, blueButtonStyle, whiteButtonStyle, dialogTitleStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

DeleteLookupDialog.propTypes = {
  variant: PropTypes.oneOf([
    "postcode",
    "postTown",
    "subLocality",
    "crossReference",
    "locality",
    "town",
    "island",
    "administrativeArea",
    "authority",
    "ward",
    "parish",
    "dbAuthority",
    "operationalDistrict",
    "unknown",
  ]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  lookupId: PropTypes.number.isRequired,
  canDelete: PropTypes.bool.isRequired,
  errorEng: PropTypes.object,
  errorAltLanguage: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
  onHistoric: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function DeleteLookupDialog({
  variant,
  isOpen,
  lookupId,
  canDelete,
  errorEng,
  errorAltLanguage,
  onDelete,
  onHistoric,
  onClose,
}) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [lookupText, setLookupText] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

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
   * Event to handle when the delete button is clicked.
   */
  const handleDeleteClick = () => {
    if (onDelete) onDelete(variant, lookupId);
  };

  /**
   * Event to handle when the make historic button is clicked.
   */
  const handleHistoricClick = () => {
    if (onHistoric) onHistoric(variant, lookupId);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  useEffect(() => {
    switch (variant) {
      case "postcode":
        setLookupType("postcode");
        const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === lookupId);
        if (postcodeRecord) setLookupText(postcodeRecord.postcode);
        break;

      case "postTown":
        setLookupType("post town");
        const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
        if (postTownRecord) {
          if (settingsContext.isWelsh || settingsContext.isScottish) {
            const linkedPostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTownRef === postTownRecord.linkedRef
            );
            if (linkedPostTownRecord)
              setLookupText(
                `${stringToSentenceCase(postTownRecord.postTown)} / ${stringToSentenceCase(
                  linkedPostTownRecord.postTown
                )}`
              );
            else setLookupText(stringToSentenceCase(postTownRecord.postTown));
          } else setLookupText(stringToSentenceCase(postTownRecord.postTown));
        }
        break;

      case "subLocality":
        setLookupType("sub-locality");
        const subLocalityRecord = lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === lookupId);
        if (subLocalityRecord) {
          const linkedSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === subLocalityRecord.linkedRef
          );
          if (linkedSubLocalityRecord)
            setLookupText(
              `${stringToSentenceCase(subLocalityRecord.subLocality)} / ${stringToSentenceCase(
                linkedSubLocalityRecord.subLocality
              )}`
            );
          else setLookupText(stringToSentenceCase(subLocalityRecord.subLocality));
        }
        break;

      case "crossReference":
        setLookupType("cross reference");
        const crossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === lookupId);
        if (crossReferenceRecord) setLookupText(stringToSentenceCase(crossReferenceRecord.xrefDescription));
        break;

      case "locality":
        setLookupType("locality");
        const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
        if (localityRecord) {
          if (settingsContext.isWelsh || settingsContext.isScottish) {
            const linkedLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.localityRef === localityRecord.linkedRef
            );
            if (linkedLocalityRecord)
              setLookupText(
                `${stringToSentenceCase(localityRecord.locality)} / ${stringToSentenceCase(
                  linkedLocalityRecord.locality
                )}`
              );
            else setLookupText(stringToSentenceCase(localityRecord.locality));
          } else setLookupText(stringToSentenceCase(localityRecord.locality));
        }
        break;

      case "town":
        setLookupType("town");
        const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
        if (townRecord) {
          if (settingsContext.isWelsh || settingsContext.isScottish) {
            const linkedTownRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === townRecord.linkedRef);
            if (linkedTownRecord)
              setLookupText(
                `${stringToSentenceCase(townRecord.town)} / ${stringToSentenceCase(linkedTownRecord.town)}`
              );
            else setLookupText(stringToSentenceCase(townRecord.town));
          } else setLookupText(stringToSentenceCase(townRecord.town));
        }
        break;

      case "island":
        setLookupType("island");
        const islandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
        if (islandRecord) {
          const linkedIslandRecord = lookupContext.currentLookups.islands.find(
            (x) => x.islandRef === islandRecord.linkedRef
          );
          if (linkedIslandRecord)
            setLookupText(
              `${stringToSentenceCase(islandRecord.island)} / ${stringToSentenceCase(linkedIslandRecord.island)}`
            );
          else setLookupText(stringToSentenceCase(islandRecord.island));
        }
        break;

      case "administrativeArea":
        setLookupType("administrative area");
        const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
          (x) => x.administrativeAreaRef === lookupId
        );
        if (administrativeAreaRecord) {
          if (settingsContext.isWelsh || settingsContext.isScottish) {
            const linkedAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeAreaRef === administrativeAreaRecord.linkedRef
            );
            if (linkedAdministrativeAreaRecord)
              setLookupText(
                `${stringToSentenceCase(administrativeAreaRecord.administrativeArea)} / ${stringToSentenceCase(
                  linkedAdministrativeAreaRecord.administrativeArea
                )}`
              );
            else setLookupText(stringToSentenceCase(administrativeAreaRecord.administrativeArea));
          } else setLookupText(stringToSentenceCase(administrativeAreaRecord.administrativeArea));
        }
        break;

      case "ward":
        setLookupType("ward");
        const wardRecord = lookupContext.currentLookups.wards.find((x) => x.pkId === lookupId);
        if (wardRecord) setLookupText(stringToSentenceCase(wardRecord.ward));
        break;

      case "parish":
        setLookupType("parish");
        const parishRecord = lookupContext.currentLookups.parishes.find((x) => x.pkId === lookupId);
        if (parishRecord) setLookupText(stringToSentenceCase(parishRecord.parish));
        break;

      case "dbAuthority":
        setLookupType("authority");
        const dbAuthorityRecord = lookupContext.currentLookups.dbAuthorities.find((x) => x.authorityRef === lookupId);
        if (dbAuthorityRecord) setLookupText(stringToSentenceCase(dbAuthorityRecord.authorityName));
        break;

      case "operationalDistrict":
        setLookupType("operational district");
        const operationalDistrictRecord = lookupContext.currentLookups.operationalDistricts.find(
          (x) => x.pkId === lookupId
        );
        if (operationalDistrictRecord) setLookupText(stringToSentenceCase(operationalDistrictRecord.districtName));
        break;

      default:
        setLookupType("unknown");
        break;
    }

    setShowDialog(isOpen);
  }, [variant, isOpen, lookupId, lookupContext, settingsContext]);

  useEffect(() => {
    if (errorEng) setDeleteError(errorEng);
    else if (errorAltLanguage) setDeleteError(errorAltLanguage);
    else setDeleteError(null);
  }, [errorEng, errorAltLanguage]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="delete-lookup-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <DialogTitle id="delete-lookup-dialog" sx={dialogTitleStyle}>
        <Typography variant="h6">{`Delete ${lookupType}`}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancelClick}
          sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="body2" align="justify" sx={{ backgroundColor: "rgb(248, 249, 250)" }}>
            {lookupText}
          </Typography>
          {deleteError && (
            <Typography variant="caption" color={adsRed} align="justify">
              {deleteError}
            </Typography>
          )}
          {canDelete ? (
            <Fragment>
              <Typography
                variant="body2"
                align="justify"
              >{`On deletion this ${lookupType} will no longer appear in the lookup table and cannot be retrieved.`}</Typography>
              {lookupType !== "authority" && (
                <Typography variant="body2" align="justify">
                  If you would like to keep it for reference but avoid it being attached to records then you can make it
                  historic.
                </Typography>
              )}
            </Fragment>
          ) : (
            <Typography
              variant="body2"
              align="justify"
            >{`This ${lookupType} cannot be deleted as it has records associated with it.`}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        {canDelete && (
          <Button
            onClick={handleDeleteClick}
            variant="contained"
            sx={redButtonStyle}
            startIcon={<DeleteForeverOutlinedIcon />}
          >
            Delete forever
          </Button>
        )}
        {canDelete && lookupType !== "authority" && (
          <Button
            onClick={handleHistoricClick}
            autoFocus
            variant="contained"
            sx={blueButtonStyle}
            startIcon={<BlockIcon />}
          >
            Make historic
          </Button>
        )}
        <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteLookupDialog;
