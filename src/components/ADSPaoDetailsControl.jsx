/* #region header */
/**************************************************************************************************
//
//  Description: PAO details component
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
//    002   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    003   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { Box, Grid, Typography, Skeleton, Stack, Tooltip, IconButton } from "@mui/material";
import ADSErrorDisplay from "./ADSErrorDisplay";
import EditPaoDetailsDialog from "../dialogs/EditPaoDetailsDialog";

import { StringToTitleCase } from "../utils/HelperUtils";

import EditIcon from "@mui/icons-material/Edit";

import { adsPaleBlueA } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle, ActionIconStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSPaoDetailsControl.propTypes = {
  loading: PropTypes.bool,
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  data: PropTypes.object,
  errorText: PropTypes.array,
  onDetailsChanged: PropTypes.func.isRequired,
};

ADSPaoDetailsControl.defaultProps = {
  loading: false,
  isRequired: false,
};

function ADSPaoDetailsControl({ loading, label, isRequired, data, errorText, onDetailsChanged }) {
  const theme = useTheme();

  const [displayError, setDisplayError] = useState("");

  const [startNumber, setStartNumber] = useState(data.startNumber);
  const [startSuffix, setStartSuffix] = useState(data.startSuffix);
  const [endNumber, setEndNumber] = useState(data.endNumber);
  const [endSuffix, setEndSuffix] = useState(data.endSuffix);
  const [text, setText] = useState(data.text);
  const [details, setDetails] = useState(data.details);
  const [detailHighlighted, setDetailHighlighted] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  const hasError = useRef(false);

  /**
   * Event to handle when the mouse enters the details.
   */
  const doMouseEnterDetails = () => {
    setDetailHighlighted(true);
  };

  /**
   * Event to handle when the mouse leaves the details.
   */
  const doMouseLeaveDetails = () => {
    setDetailHighlighted(false);
  };

  /**
   * Event to handle when the details are edited.
   */
  const doEditDetails = () => {
    setEditData({
      startNumber: startNumber,
      startSuffix: startSuffix,
      endNumber: endNumber,
      endSuffix: endSuffix,
      text: text,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the details have been updated.
   *
   * @param {object} updatedData The updated PAO details.
   */
  const handleDoneEditDetails = (updatedData) => {
    if (updatedData) {
      const newData = {
        startNumber: updatedData.startNumber,
        startSuffix: updatedData.startSuffix,
        endNumber: updatedData.endNumber,
        endSuffix: updatedData.endSuffix,
        text: updatedData.text,
        details: `${updatedData.text ? updatedData.text : ""}${
          updatedData.text && (updatedData.startNumber || updatedData.startSuffix) ? ", " : ""
        }${updatedData.startNumber ? updatedData.startNumber : ""}${
          updatedData.startSuffix ? updatedData.startSuffix : ""
        }${
          (updatedData.startNumber || updatedData.startSuffix) && (updatedData.endNumber || updatedData.endSuffix)
            ? "-"
            : ""
        }${updatedData.endNumber ? updatedData.endNumber : ""}${updatedData.endSuffix ? updatedData.endSuffix : ""}`,
      };

      setStartNumber(newData.startNumber);
      setStartSuffix(newData.startSuffix);
      setEndNumber(newData.endNumber);
      setEndSuffix(newData.endSuffix);
      setText(newData.text);
      setDetails(newData.details);

      if (onDetailsChanged) onDetailsChanged(newData);
    }

    setShowEditDialog(false);
  };

  /**
   * Event to handle the closing of the edit details dialog.
   */
  const handleCloseEditDetails = () => {
    setShowEditDialog(false);
  };

  /**
   * Method to get the details styling.
   *
   * @param {boolean} highlighted True if the details are highlighted; otherwise false.
   * @returns {object|null} The styling for the details.
   */
  const getDetailStyle = (highlighted) => {
    if (highlighted)
      return {
        backgroundColor: adsPaleBlueA,
        cursor: "pointer",
      };
    else return null;
  };

  useEffect(() => {
    if (data) {
      setStartNumber(data.startNumber);
      setStartSuffix(data.startSuffix);
      setEndNumber(data.endNumber);
      setEndSuffix(data.endSuffix);
      setText(data.text);
      setDetails(data.details);
    }
  }, [data]);

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={3}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            color="textPrimary"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            onMouseEnter={doMouseEnterDetails}
            onMouseLeave={doMouseLeaveDetails}
            onClick={doEditDetails}
            sx={getDetailStyle(detailHighlighted)}
          >
            <Typography
              id={`${label.toLowerCase().replaceAll(" ", "-")}-ads-pao-details`}
              variant="body1"
              align="left"
              sx={{ pt: theme.spacing(1.75), pb: theme.spacing(1.75) }}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            >
              {loading ? <Skeleton animation="wave" /> : StringToTitleCase(details)}
            </Typography>
            {detailHighlighted && (
              <Tooltip title="Edit PAO details" placement="bottom" sx={tooltipStyle}>
                <IconButton onClick={doEditDetails} sx={{ mr: theme.spacing(2) }}>
                  <EditIcon sx={ActionIconStyle(true)} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={"pao-details-error"} />
      </Grid>
      <EditPaoDetailsDialog
        isOpen={showEditDialog}
        data={editData}
        onDone={(data) => handleDoneEditDetails(data)}
        onClose={handleCloseEditDetails}
      />
    </Box>
  );
}

export default ADSPaoDetailsControl;
