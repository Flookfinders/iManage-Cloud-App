/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Action dialog
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   22.09.23 Sean Flook                 Changes required to handle Scottish classifications.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   03.11.23 Sean Flook                 Updated propTypes.
//    005   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    006   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    007   30.11.23 Sean Flook                 Added sub-locality.
//    008   05.01.24 Sean Flook                 Use CSS shortcuts.
//    009   11.01.24 Sean Flook                 Fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import { GetLookupLabel } from "../utils/HelperUtils";
import { FilteredRepresentativePointCode } from "../utils/PropertyUtils";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSActionButton from "../components/ADSActionButton";

import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/SaveOutlined";

import { adsMidGreyA, adsLightGreyC } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

WizardActionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(["classification", "level", "postcode", "postTown", "subLocality", "note", "rpc"]),
  data: PropTypes.any,
  recordCount: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

WizardActionDialog.defaultProps = {
  recordCount: 1,
};

function WizardActionDialog({ open, variant, data, recordCount, onClose, onCancel }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [representativePointCodeLookup, setRepresentativePointCodeLookup] = useState(
    FilteredRepresentativePointCode(settingsContext.isScottish)
  );

  const [actionData, setActionData] = useState(data);
  const [title, setTitle] = useState("Edit record");
  const [content, setContent] = useState(null);
  const maxContentHeight = "240px";

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancel = () => {
    onCancel();
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOk = () => {
    onClose(actionData);
  };

  useEffect(() => {
    setActionData(data);
    setRepresentativePointCodeLookup(FilteredRepresentativePointCode(settingsContext.isScottish));
  }, [data, settingsContext.isScottish]);

  useEffect(() => {
    const handleEngPostTownChanged = (newValue) => {
      if (settingsContext.isScottish || settingsContext.isWelsh) {
        const selectedRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === newValue);
        if (selectedRecord && selectedRecord.linkedRef !== newValue)
          setActionData({ eng: newValue, alt: selectedRecord.linkedRef });
        else setActionData({ eng: newValue, alt: actionData.alt });
      } else setActionData({ eng: newValue, alt: actionData.alt });
    };

    const handleAltPostTownChanged = (newValue) => {
      const selectedRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === newValue);
      if (selectedRecord && selectedRecord.linkedRef !== newValue)
        setActionData({ eng: selectedRecord.linkedRef, alt: newValue });
      else setActionData({ eng: actionData.eng, alt: newValue });
    };

    const handleEngSubLocalityChanged = (newValue) => {
      const selectedRecord = lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === newValue);
      if (selectedRecord && selectedRecord.linkedRef !== newValue)
        setActionData({ eng: newValue, alt: selectedRecord.linkedRef });
      else setActionData({ eng: newValue, alt: actionData.alt });
    };

    const handleAltSubLocalityChanged = (newValue) => {
      const selectedRecord = lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === newValue);
      if (selectedRecord && selectedRecord.linkedRef !== newValue)
        setActionData({ eng: selectedRecord.linkedRef, alt: newValue });
      else setActionData({ eng: actionData.eng, alt: newValue });
    };

    const getEditTitle = (type) => {
      return `Edit ${type} for ${
        recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
      }property ${recordText}`;
    };

    const recordText = recordCount && recordCount > 1 ? "records" : "record";

    if (!variant) return;

    switch (variant) {
      case "classification":
        setTitle(getEditTitle("classification"));
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            <ADSSelectControl
              label="Classification"
              isEditable
              isFocused
              isClassification
              includeHiddenCode
              useRounded
              doNotSetTitleCase
              lookupData={settingsContext.isScottish ? OSGClassification : BLPUClassification}
              lookupId="id"
              lookupLabel="display"
              lookupColour="colour"
              value={actionData}
              onChange={(newValue) => setActionData(newValue)}
              helperText="Classification code for the BLPU."
            />
          </Box>
        );
        break;

      case "level":
        setTitle(getEditTitle("level"));
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            {settingsContext.isScottish ? (
              <ADSNumberControl
                label="Level"
                isEditable
                isFocused
                value={actionData}
                helperText="Code describing vertical position of BLPU."
                onChange={(newValue) => setActionData(newValue)}
              />
            ) : (
              <ADSTextControl
                label="Level"
                isEditable
                isFocused
                value={actionData}
                id="lpi_level_1"
                maxLength={30}
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={(newValue) => setActionData(newValue)}
              />
            )}
          </Box>
        );
        break;

      case "postcode":
        setTitle(getEditTitle("postcode"));
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            <ADSSelectControl
              label="Postcode"
              isEditable
              isFocused
              useRounded
              doNotSetTitleCase
              lookupData={lookupContext.currentLookups.postcodes}
              lookupId="postcodeRef"
              lookupLabel="postcode"
              value={actionData}
              onChange={(newValue) => setActionData(newValue)}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
          </Box>
        );
        break;

      case "postTown":
        setTitle(getEditTitle("post town"));
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            <ADSSelectControl
              label={`${settingsContext.isScottish || settingsContext.isWelsh ? "English p" : "P"}ost town`}
              isEditable
              isFocused
              useRounded
              lookupData={lookupContext.currentLookups.postTowns.filter((x) => x.language === "ENG")}
              lookupId="postTownRef"
              lookupLabel="postTown"
              value={actionData ? actionData.eng : null}
              onChange={handleEngPostTownChanged}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="Gaelic post town"
                isEditable
                useRounded
                lookupData={lookupContext.currentLookups.postTowns.filter((x) => x.language === "GAE")}
                lookupId="postTownRef"
                lookupLabel="postTown"
                value={actionData ? actionData.alt : null}
                onChange={handleAltPostTownChanged}
                helperText="Allocated by the Royal Mail to assist in delivery of mail."
              />
            )}
            {settingsContext.isWelsh && (
              <ADSSelectControl
                label="Welsh post town"
                isEditable
                useRounded
                lookupData={lookupContext.currentLookups.postTowns.filter((x) => x.language === "CYM")}
                lookupId="postTownRef"
                lookupLabel="postTown"
                value={actionData ? actionData.alt : null}
                onChange={handleAltPostTownChanged}
                helperText="Allocated by the Royal Mail to assist in delivery of mail."
              />
            )}
          </Box>
        );
        break;

      case "subLocality":
        setTitle(getEditTitle("sub-locality"));
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            <ADSSelectControl
              label={"English sub-locality"}
              isEditable
              isFocused
              useRounded
              lookupData={lookupContext.currentLookups.subLocalities.filter((x) => x.language === "ENG")}
              lookupId="subLocalityRef"
              lookupLabel="subLocality"
              value={actionData ? actionData.eng : null}
              onChange={handleEngSubLocalityChanged}
              helperText="Third level of geographic area name. e.g. to record an island name or property group."
            />
            <ADSSelectControl
              label="Gaelic sub-locality"
              isEditable
              useRounded
              lookupData={lookupContext.currentLookups.subLocalities.filter((x) => x.language === "GAE")}
              lookupId="subLocalityRef"
              lookupLabel="subLocality"
              value={actionData ? actionData.alt : null}
              onChange={handleAltSubLocalityChanged}
              helperText="Third level of geographic area name. e.g. to record an island name or property group."
            />
          </Box>
        );
        break;

      case "note":
        setTitle(
          `Add note for ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}property ${recordText}`
        );
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            <ADSTextControl
              isEditable
              value={actionData}
              id="property_note"
              maxLength={4000}
              minLines={2}
              maxLines={10}
              onChange={(newValue) => setActionData(newValue)}
            />
          </Box>
        );
        break;

      case "rpc":
        setTitle(getEditTitle("representative point code"));
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
            <ADSSelectControl
              label="RPC"
              isEditable
              isFocused
              useRounded
              doNotSetTitleCase
              lookupData={representativePointCodeLookup}
              lookupId="id"
              lookupLabel={GetLookupLabel(settingsContext.isScottish)}
              lookupColour="colour"
              value={actionData}
              onChange={(newValue) => setActionData(newValue)}
              helperText="Representative Point Code."
            />
          </Box>
        );
        break;

      default:
        break;
    }
  }, [
    recordCount,
    variant,
    actionData,
    representativePointCodeLookup,
    lookupContext,
    settingsContext.isScottish,
    settingsContext.isWelsh,
  ]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      aria-labelledby="wizard-action-dialog-title"
      sx={{ p: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleCancel}
    >
      <DialogTitle
        id="wizard-action-dialog-title"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsLightGreyC, mb: "8px" }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ fontWeight: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <ADSActionButton variant="close" tooltipTitle="Cancel" tooltipPlacement="bottom" onClick={handleCancel} />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>{content}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
        <Button variant="contained" onClick={handleOk} sx={blueButtonStyle} startIcon={<SaveIcon />}>
          Save
        </Button>
        <Button variant="contained" autoFocus sx={whiteButtonStyle} onClick={handleCancel} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WizardActionDialog;
