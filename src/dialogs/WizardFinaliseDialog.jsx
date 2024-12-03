/* #region header */
/**************************************************************************************************
//
//  Description: Control used to display a list of the errors.
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
//    002   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//    007   27.02.24 Sean Flook           MUL15 Changed to use dialogTitleStyle.
//    008   27.03.24 Sean Flook                 Added ADSDialogTitle.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    009   31.10.24 Sean Flook      IMANN-1012 Added plotToPostal.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    010   03.12.24 Sean Flook      IMANN-1081 Include classification errors for Scottish authorities.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSDialogTitle from "../components/ADSDialogTitle";

import FmdBadIcon from "@mui/icons-material/FmdBad";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CloseIcon from "@mui/icons-material/Close";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { adsMidGreyA, adsRed, adsGreenC } from "../utils/ADSColours";
import { redButtonStyle, blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

WizardFinaliseDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(["property", "child", "range", "rangeChildren", "moveBlpu", "makeChildOf", "plotToPostal"]),
  errors: PropTypes.array,
  createdCount: PropTypes.number,
  failedCount: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

WizardFinaliseDialog.defaultProps = {
  createdCount: 0,
  failedCount: 0,
};

function WizardFinaliseDialog({ open, variant, errors, createdCount, failedCount, onClose }) {
  const theme = useTheme();

  const [showOpen, setShowOpen] = useState(false);
  const [isRange, setIsRange] = useState(false);
  const [title, setTitle] = useState("Property created");
  const [content, setContent] = useState(null);
  const [saveFailed, setSaveFailed] = useState(failedCount > 0);
  const maxContentHeight = "240px";

  /**
   * Event to handle when the error button is clicked.
   */
  const handleError = () => {
    if (onClose) onClose("error");
  };

  /**
   * Event to handle when the view button is clicked.
   */
  const handleView = () => {
    if (onClose) onClose("view");
  };

  /**
   * Event to handle when the add child button is clicked.
   */
  const handleAddChild = () => {
    if (onClose) onClose("addChild");
  };

  /**
   * Event to handle when the add children button is clicked.
   */
  const handleAddChildren = () => {
    if (onClose) onClose("addChildren");
  };

  /**
   * Event to handle when the return button is clicked.
   */
  const handleReturn = () => {
    if (onClose) onClose("error");
  };

  /**
   * Event to handle when the close button is clicked.
   */
  const handleClose = () => {
    if (onClose) onClose("close");
  };

  useEffect(() => {
    setSaveFailed(failedCount > 0);
  }, [failedCount]);

  useEffect(() => {
    if (variant) {
      let blpuErrors = [];
      let lpiErrors = [];
      let classificationErrors = [];
      let provenanceErrors = [];
      let crossRefErrors = [];
      let noteErrors = [];

      if (Array.isArray(errors)) {
        for (const error of errors) {
          blpuErrors =
            ["property", "child", "moveBlpu", "makeChildOf", "plotToPostal"].includes(variant) &&
            error &&
            error.blpu &&
            error.blpu.length > 0
              ? [...new Set([...error.blpu.flatMap((x) => x.errors), ...blpuErrors])]
              : blpuErrors.length > 0
              ? blpuErrors
              : [];
          lpiErrors =
            ["property", "child", "moveBlpu", "makeChildOf", "plotToPostal"].includes(variant) &&
            error &&
            error.lpi &&
            error.lpi.length > 0
              ? [...new Set([...error.lpi.flatMap((x) => x.errors), ...lpiErrors])]
              : lpiErrors.length > 0
              ? lpiErrors
              : [];
          classificationErrors =
            ["property", "child"].includes(variant) && error && error.classification && error.classification.length > 0
              ? [...new Set([...error.classification.flatMap((x) => x.errors), ...classificationErrors])]
              : classificationErrors.length > 0
              ? classificationErrors
              : [];
          provenanceErrors =
            ["property", "child"].includes(variant) && error && error.provenance && error.provenance.length > 0
              ? [...new Set([...error.provenance.flatMap((x) => x.errors), ...provenanceErrors])]
              : provenanceErrors.length > 0
              ? provenanceErrors
              : [];
          crossRefErrors =
            ["property", "child"].includes(variant) && error && error.crossRef && error.crossRef.length > 0
              ? [...new Set([...error.crossRef.flatMap((x) => x.errors), ...crossRefErrors])]
              : crossRefErrors.length > 0
              ? crossRefErrors
              : [];
          noteErrors =
            ["property", "child", "makeChildOf", "plotToPostal"].includes(variant) &&
            error &&
            error.note &&
            error.note.length > 0
              ? [...new Set([...error.note.flatMap((x) => x.errors), ...noteErrors])]
              : noteErrors.length > 0
              ? noteErrors
              : [];
        }
      } else {
        blpuErrors =
          ["property", "child", "moveBlpu", "makeChildOf", "plotToPostal"].includes(variant) &&
          errors &&
          errors.blpu &&
          errors.blpu.length > 0
            ? [...new Set(errors.blpu.flatMap((x) => x.errors))]
            : [];
        lpiErrors =
          ["property", "child", "moveBlpu", "makeChildOf", "plotToPostal"].includes(variant) &&
          errors &&
          errors.lpi &&
          errors.lpi.length > 0
            ? [...new Set(errors.lpi.flatMap((x) => x.errors))]
            : [];
        classificationErrors =
          ["property", "child"].includes(variant) && errors && errors.classification && errors.classification.length > 0
            ? [...new Set(errors.classification.flatMap((x) => x.errors))]
            : [];
        provenanceErrors =
          ["property", "child"].includes(variant) && errors && errors.provenance && errors.provenance.length > 0
            ? [...new Set(errors.provenance.flatMap((x) => x.errors))]
            : [];
        crossRefErrors =
          ["property", "child"].includes(variant) && errors && errors.crossRef && errors.crossRef.length > 0
            ? [...new Set(errors.crossRef.flatMap((x) => x.errors))]
            : [];
        noteErrors =
          ["property", "child", "makeChildOf", "plotToPostal"].includes(variant) &&
          errors &&
          errors.note &&
          errors.note.length > 0
            ? [...new Set(errors.note.flatMap((x) => x.errors))]
            : [];
      }

      const finalisedErrors = [
        ...new Set([
          ...blpuErrors,
          ...lpiErrors,
          ...classificationErrors,
          ...provenanceErrors,
          ...crossRefErrors,
          ...noteErrors,
        ]),
      ];

      switch (variant) {
        case "property":
          setIsRange(false);
          if (!saveFailed) setTitle("Property created successfully");
          else setTitle("Failed to create property");
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              {!saveFailed ? (
                <Typography variant="body2">
                  The property has been created, you can now view the property or add a child/children to it.
                </Typography>
              ) : (
                <Stack direction="column" spacing={1}>
                  <Typography variant="body2">
                    {`The property has the following ${finalisedErrors.length > 1 ? "errors" : "error"}:`}
                  </Typography>
                  <Stack direction="column">
                    {finalisedErrors.map((error, idx) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={`property_error_${idx}`}>
                        <PriorityHighIcon sx={{ color: adsRed, height: "16px", width: "16px" }} />
                        <Typography variant="body2" color={adsRed}>
                          {error}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Box>
          );
          break;

        case "range":
          setIsRange(true);
          setTitle("Property creation: completed");
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              <Stack direction="column">
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                  <Typography variant="h6" color={adsGreenC} sx={{ fontSize: "20px" }}>{`${createdCount}`}</Typography>
                  <Typography variant="body2">{`${
                    createdCount === 1 ? "property was" : "properties were"
                  } successfully created.`}</Typography>
                </Stack>
                {failedCount > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                    <Typography variant="h6" color={adsRed} sx={{ fontSize: "20px" }}>{`${failedCount}`}</Typography>
                    <Typography variant="body2">{`${
                      failedCount === 1 ? "property" : "properties"
                    } failed to be created.`}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
          break;

        case "child":
          setIsRange(false);
          if (!saveFailed) setTitle("Child created successfully");
          else setTitle("Failed to create child");
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              {!saveFailed ? (
                <Typography variant="body2">
                  The child has been created, you can now view the child or add a child/children to it.
                </Typography>
              ) : (
                <Stack direction="column">
                  <Typography variant="body2">
                    {`The child has the following ${finalisedErrors.length > 1 ? "errors" : "error"}:`}
                  </Typography>
                  <Stack direction="column">
                    {finalisedErrors.map((error, idx) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={`child_error_${idx}`}>
                        <PriorityHighIcon sx={{ color: adsRed, height: "16px", width: "16px" }} />
                        <Typography variant="body2" color={adsRed}>
                          {error}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Box>
          );
          break;

        case "rangeChildren":
          setIsRange(true);
          setTitle("Child creation: completed");
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              <Stack direction="column">
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                  <Typography variant="h6" color={adsGreenC} sx={{ fontSize: "20px" }}>{`${createdCount}`}</Typography>
                  <Typography variant="body2">{`${
                    createdCount === 1 ? "child was" : "children were"
                  } successfully created.`}</Typography>
                </Stack>
                {failedCount > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                    <Typography variant="h6" color={adsRed} sx={{ fontSize: "20px" }}>{`${failedCount}`}</Typography>
                    <Typography variant="body2">{`${
                      failedCount === 1 ? "child" : "children"
                    } failed to be created.`}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
          break;

        case "moveBlpu":
          setIsRange(true);
          setTitle("Move BLPU seed point: completed");
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              <Stack direction="column">
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                  <Typography variant="h6" color={adsGreenC} sx={{ fontSize: "20px" }}>{`${createdCount}`}</Typography>
                  <Typography variant="body2">{`${
                    createdCount === 1 ? "property was" : "properties were"
                  } successfully updated.`}</Typography>
                </Stack>
                {failedCount > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                    <Typography variant="h6" color={adsRed} sx={{ fontSize: "20px" }}>{`${failedCount}`}</Typography>
                    <Typography variant="body2">{`${
                      failedCount === 1 ? "property" : "properties"
                    } failed to be updated.`}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
          break;

        case "makeChildOf":
          setIsRange(true);
          setTitle(
            `Make selected ${createdCount + failedCount === 1 ? "property" : "properties"} child of...: completed`
          );
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              <Stack direction="column">
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                  <Typography variant="h6" color={adsGreenC} sx={{ fontSize: "20px" }}>{`${createdCount}`}</Typography>
                  <Typography variant="body2">{`${
                    createdCount === 1 ? "property was" : "properties were"
                  } successfully updated.`}</Typography>
                </Stack>
                {failedCount > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                    <Typography variant="h6" color={adsRed} sx={{ fontSize: "20px" }}>{`${failedCount}`}</Typography>
                    <Typography variant="body2">{`${
                      failedCount === 1 ? "property" : "properties"
                    } failed to be updated.`}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
          break;

        case "plotToPostal":
          setIsRange(true);
          setTitle(
            `Update plot to postal for ${createdCount + failedCount === 1 ? "property" : "properties"}: completed`
          );
          setContent(
            <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
              <Stack direction="column">
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                  <Typography variant="h6" color={adsGreenC} sx={{ fontSize: "20px" }}>{`${createdCount}`}</Typography>
                  <Typography variant="body2">{`${
                    createdCount === 1 ? "property was" : "properties were"
                  } successfully updated.`}</Typography>
                </Stack>
                {failedCount > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                    <Typography variant="h6" color={adsRed} sx={{ fontSize: "20px" }}>{`${failedCount}`}</Typography>
                    <Typography variant="body2">{`${
                      failedCount === 1 ? "property" : "properties"
                    } failed to be updated.`}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
          break;

        default:
          break;
      }
    }

    if (["property", "range", "child", "rangeChildren", "moveBlpu", "makeChildOf", "plotToPostal"].includes(variant))
      setShowOpen(open);
    else setShowOpen(false);
  }, [variant, errors, createdCount, failedCount, saveFailed, open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={showOpen}
      aria-labelledby="wizard-finalise-dialog-title"
      sx={{ p: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleClose}
    >
      <ADSDialogTitle title={`${title}`} closeTooltip="Close" onClose={handleClose} />
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>{content}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
        {saveFailed && isRange && (
          <Button variant="contained" autoFocus onClick={handleError} sx={redButtonStyle} startIcon={<FmdBadIcon />}>
            {`View ${failedCount === 1 ? "error" : "errors"}`}
          </Button>
        )}
        {saveFailed && !isRange && (
          <Button variant="contained" onClick={handleReturn} sx={redButtonStyle} startIcon={<KeyboardReturnIcon />}>
            Return
          </Button>
        )}
        {!saveFailed && !["moveBlpu", "makeChildOf"].includes(variant) && (
          <Button
            variant="contained"
            autoFocus={!saveFailed}
            onClick={handleView}
            sx={blueButtonStyle}
            startIcon={isRange ? <PlaylistPlayIcon /> : <ArrowForwardIcon />}
          >
            {`View ${isRange ? "properties" : "property"}`}
          </Button>
        )}
        {!saveFailed && !isRange && !["moveBlpu", "makeChildOf"].includes(variant) && (
          <Button variant="contained" onClick={handleAddChild} sx={blueButtonStyle} startIcon={<AddIcon />}>
            Add child
          </Button>
        )}
        {!saveFailed && !isRange && !["moveBlpu", "makeChildOf"].includes(variant) && (
          <Button variant="contained" onClick={handleAddChildren} sx={blueButtonStyle} startIcon={<PlaylistAddIcon />}>
            Add children
          </Button>
        )}
        <Button variant="contained" sx={whiteButtonStyle} onClick={handleClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WizardFinaliseDialog;
