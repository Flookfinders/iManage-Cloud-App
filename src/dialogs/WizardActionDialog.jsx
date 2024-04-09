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
//    010   16.01.24 Sean Flook                 Changes required to fix warnings.
//    011   27.02.24 Sean Flook           MUL15 Changed to use dialogTitleStyle.
//    012   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    013   09.04.24 Sean Flook       IMANN-376 Allow lookups to be added on the fly.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";

import AddLookupDialog from "../dialogs/AddLookupDialog";

import { addLookup, getLookupVariantString, GetLookupLabel } from "../utils/HelperUtils";
import { FilteredRepresentativePointCode } from "../utils/PropertyUtils";

import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { Box } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/SaveOutlined";

import { adsMidGreyA } from "../utils/ADSColours";
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
  const userContext = useContext(UserContext);

  const [representativePointCodeLookup, setRepresentativePointCodeLookup] = useState(
    FilteredRepresentativePointCode(settingsContext.isScottish)
  );

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const addResult = useRef(null);
  const currentVariant = useRef(null);

  const [actionData, setActionData] = useState("");
  const maxContentHeight = "240px";
  const boxStyle = { maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" };

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

  /**
   * Event to handle when a new postcode is added.
   */
  const handleAddPostcodeEvent = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
  };

  /**
   * Method to handle when the English post town is changed.
   *
   * @param {number} newValue The reference for the English post town.
   */
  const handleEngPostTownChanged = (newValue) => {
    if (settingsContext.isScottish || settingsContext.isWelsh) {
      const selectedRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === newValue);
      if (selectedRecord && selectedRecord.linkedRef !== newValue)
        setActionData({ eng: newValue, alt: selectedRecord.linkedRef });
      else setActionData({ eng: newValue, alt: actionData.alt });
    } else setActionData({ eng: newValue, alt: actionData.alt });
  };

  /**
   * Method to handle when the alternative language post town is changed.
   *
   * @param {number} newValue The reference for the alternative language post town.
   */
  const handleAltPostTownChanged = (newValue) => {
    const selectedRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === newValue);
    if (selectedRecord && selectedRecord.linkedRef !== newValue)
      setActionData({ eng: selectedRecord.linkedRef, alt: newValue });
    else setActionData({ eng: actionData.eng, alt: newValue });
  };

  /**
   * Event to handle when a new post town is added.
   */
  const handleAddPostTownEvent = () => {
    setLookupType("postTown");
    setShowAddDialog(true);
  };

  /**
   * Method to handle when the English sub-locality is changed.
   *
   * @param {number} newValue The reference for the English sub-locality.
   */
  const handleEngSubLocalityChanged = (newValue) => {
    const selectedRecord = lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === newValue);
    if (selectedRecord && selectedRecord.linkedRef !== newValue)
      setActionData({ eng: newValue, alt: selectedRecord.linkedRef });
    else setActionData({ eng: newValue, alt: actionData.alt });
  };

  /**
   * Method to handle when the Gaelic sub-locality is changed.
   *
   * @param {number} newValue The reference for the Gaelic sub-locality.
   */
  const handleAltSubLocalityChanged = (newValue) => {
    const selectedRecord = lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === newValue);
    if (selectedRecord && selectedRecord.linkedRef !== newValue)
      setActionData({ eng: selectedRecord.linkedRef, alt: newValue });
    else setActionData({ eng: actionData.eng, alt: newValue });
  };

  /**
   * Event to handle when a new sub-locality is added.
   */
  const handleAddSubLocalityEvent = () => {
    setLookupType("subLocality");
    setShowAddDialog(true);
  };

  /**
   * Method to get the title for the dialog.
   *
   * @returns {string} The title text for the dialog.
   */
  const getTitle = () => {
    const getEditTitle = (type) => {
      return `Edit ${type} for ${
        recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
      }property ${recordText}`;
    };

    const recordText = recordCount && recordCount > 1 ? "records" : "record";

    switch (variant) {
      case "classification":
        return getEditTitle("classification");

      case "level":
        return getEditTitle("level");

      case "postcode":
        return getEditTitle("postcode");

      case "postTown":
        return getEditTitle("post town");

      case "subLocality":
        return getEditTitle("sub-locality");

      case "note":
        return `Add note for ${
          recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
        }property ${recordText}`;

      case "rpc":
        return getEditTitle("representative point code");

      default:
        return "Edit record";
    }
  };

  /**
   * Method to get the required content of the dialog.
   *
   * @returns {JSX.Element} The content required for the dialog
   */
  const getContent = () => {
    switch (variant) {
      case "classification":
        return (
          <Box sx={boxStyle}>
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

      case "level":
        return (
          <Box sx={boxStyle}>
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

      case "postcode":
        return (
          <Box sx={boxStyle}>
            <ADSSelectControl
              label="Postcode"
              isEditable
              isFocused
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
              value={actionData}
              onChange={(newValue) => setActionData(newValue)}
              onAddLookup={handleAddPostcodeEvent}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
          </Box>
        );

      case "postTown":
        return (
          <Box sx={boxStyle}>
            <ADSSelectControl
              label={`${settingsContext.isScottish || settingsContext.isWelsh ? "English p" : "P"}ost town`}
              isEditable
              isFocused
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
              value={actionData ? actionData.eng : null}
              onChange={handleEngPostTownChanged}
              onAddLookup={handleAddPostTownEvent}
              helperText="Allocated by the Royal Mail to assist in delivery of mail."
            />
            {settingsContext.isScottish && (
              <ADSSelectControl
                label="Gaelic post town"
                isEditable
                useRounded
                allowAddLookup
                lookupData={lookupContext.currentLookups.postTowns
                  .filter((x) => x.language === "GAE" && !x.historic)
                  .sort(function (a, b) {
                    return a.postTown.localeCompare(b.postTown, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  })}
                lookupId="postTownRef"
                lookupLabel="postTown"
                value={actionData ? actionData.alt : null}
                onChange={handleAltPostTownChanged}
                onAddLookup={handleAddPostTownEvent}
                helperText="Allocated by the Royal Mail to assist in delivery of mail."
              />
            )}
            {settingsContext.isWelsh && (
              <ADSSelectControl
                label="Welsh post town"
                isEditable
                useRounded
                allowAddLookup
                lookupData={lookupContext.currentLookups.postTowns
                  .filter((x) => x.language === "CYM" && !x.historic)
                  .sort(function (a, b) {
                    return a.postTown.localeCompare(b.postTown, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  })}
                lookupId="postTownRef"
                lookupLabel="postTown"
                value={actionData ? actionData.alt : null}
                onChange={handleAltPostTownChanged}
                onAddLookup={handleAddPostTownEvent}
                helperText="Allocated by the Royal Mail to assist in delivery of mail."
              />
            )}
          </Box>
        );

      case "subLocality":
        return (
          <Box sx={boxStyle}>
            <ADSSelectControl
              label={"English sub-locality"}
              isEditable
              isFocused
              useRounded
              allowAddLookup
              lookupData={lookupContext.currentLookups.subLocalities.filter((x) => x.language === "ENG")}
              lookupId="subLocalityRef"
              lookupLabel="subLocality"
              value={actionData ? actionData.eng : null}
              onChange={handleEngSubLocalityChanged}
              onAddLookup={handleAddSubLocalityEvent}
              helperText="Third level of geographic area name. e.g. to record an island name or property group."
            />
            <ADSSelectControl
              label="Gaelic sub-locality"
              isEditable
              useRounded
              allowAddLookup
              lookupData={lookupContext.currentLookups.subLocalities.filter((x) => x.language === "GAE")}
              lookupId="subLocalityRef"
              lookupLabel="subLocality"
              value={actionData ? actionData.alt : null}
              onChange={handleAltSubLocalityChanged}
              onAddLookup={handleAddSubLocalityEvent}
              helperText="Third level of geographic area name. e.g. to record an island name or property group."
            />
          </Box>
        );

      case "note":
        return (
          <Box sx={boxStyle}>
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

      case "rpc":
        return (
          <Box sx={boxStyle}>
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

      default:
        break;
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
          setActionData(addResults.newLookup.postcodeRef);
          break;

        case "postTown":
          handleEngPostTownChanged(addResults.newLookup.postTownRef);
          break;

        case "subLocality":
          handleEngSubLocalityChanged(addResults.newLookup.subLocalityRef);
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
    setActionData(
      data ? data : variant === "level" ? (settingsContext.isScottish ? 0 : "") : variant === "note" ? "" : null
    );
    setRepresentativePointCodeLookup(FilteredRepresentativePointCode(settingsContext.isScottish));
  }, [data, variant, settingsContext.isScottish]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        aria-labelledby="wizard-action-dialog-title"
        sx={{ p: "16px 16px 24px 16px", borderRadius: "9px" }}
        onClose={handleCancel}
      >
        <ADSDialogTitle title={getTitle()} closeTooltip="Cancel" onClose={handleCancel} />
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>{getContent()}</DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
          <Button variant="contained" onClick={handleOk} sx={blueButtonStyle} startIcon={<SaveIcon />}>
            Save
          </Button>
          <Button variant="contained" autoFocus sx={whiteButtonStyle} onClick={handleCancel} startIcon={<CloseIcon />}>
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

export default WizardActionDialog;
