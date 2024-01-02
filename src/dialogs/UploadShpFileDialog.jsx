/* #region header */
/**************************************************************************************************
//
//  Description: Upload shape file dialog
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.01.24 Sean Flook                 Initial Revision.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import {
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Tooltip,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSMinMaxControl from "../components/ADSMinMaxControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSSliderControl from "../components/ADSSliderControl";

import MinMaxDialog from "../dialogs/MinMaxDialog";

import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import CancelIcon from "@mui/icons-material/Cancel";

import { blueButtonStyle, whiteButtonStyle, tooltipStyle } from "../utils/ADSStyles";
import { adsBlueA, adsDarkGrey, adsOffWhite, adsMidGreyA } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

UploadShpFileDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  currentIds: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

function UploadShpFileDialog({ isOpen, currentIds, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);
  const [shpFile, setShpFile] = useState(null);
  const [filename, setFilename] = useState(null);

  const [title, setTitle] = useState(null);
  const [layerId, setLayerId] = useState(null);
  const [copyright, setCopyright] = useState(null);
  const [displayInList, setDisplayInList] = useState(true);
  const [maxScale, setMaxScale] = useState(0);
  const [minScale, setMinScale] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [esuSnap, setEsuSnap] = useState(false);
  const [blpuSnap, setBlpuSnap] = useState(false);
  const [extentSnap, setExtentSnap] = useState(false);

  const [layerIdError, setLayerIdError] = useState(null);

  const [showMinMaxDialog, setShowMinMaxDialog] = useState(false);
  const [minMaxType, setMinMaxType] = useState(null);
  const minValue = useRef(null);
  const maxValue = useRef(null);
  const [maximum, setMaximum] = useState(null);

  const chooseFileId = "upload-shp-file";

  /**
   * Event to handle when the close button is clicked
   */
  const handleUploadClick = () => {
    if (shpFile && onClose && !currentIds.includes(layerId)) {
      const returnData = {
        file: shpFile,
        title: title,
        layerId: layerId,
        copyright: copyright,
        displayInList: displayInList,
        maxScale: maxScale,
        minScale: minScale,
        opacity: opacity,
        esuSnap: esuSnap,
        blpuSnap: blpuSnap,
        extentSnap: extentSnap,
      };
      onClose(returnData);
    }
  };

  /**
   * Event to handle when the close button is clicked
   */
  const handleCancelClick = () => {
    if (onClose) onClose(null);
  };

  /**
   * Event to handle when the shp file changes.
   *
   * @param {object} event The event object.
   */
  const handleShpFileChangeEvent = (event) => {
    const shpFiles = document.getElementById(chooseFileId).files;
    if (shpFiles.length === 0) {
      setShpFile(null);
      setFilename("");
    } else {
      setShpFile(shpFiles[0]);
      setFilename(event.target.value);
      if (!layerId && !currentIds.includes(shpFiles[0].name.replace(".zip", "")))
        setLayerId(shpFiles[0].name.replace(".zip", ""));
    }
  };

  /**
   * Event to handle when the title changes.
   *
   * @param {string} newValue The new title.
   */
  const handleTitleChangeEvent = (newValue) => {
    setTitle(newValue);
  };

  /**
   * Event to handle when the layer id changes.
   *
   * @param {number} newValue The new layer id.
   */
  const handleLayerIdChangeEvent = (newValue) => {
    setLayerId(newValue);
    if (currentIds.includes(newValue)) {
      setLayerIdError(`${newValue} is not unique.`);
    } else setLayerIdError(null);
  };

  /**
   * Event to handle when the copyright information changes.
   *
   * @param {string} newValue The new copyright information.
   */
  const handleCopyrightInformationChangeEvent = (newValue) => {
    setCopyright(newValue);
  };

  /**
   * Event to handle when the display in list flag changes.
   *
   * @param {boolean} newValue The new display in list flag.
   */
  const handleDisplayInListChangeEvent = (newValue) => {
    setDisplayInList(newValue);
  };

  /**
   * Event to handle when the minimum and maximum scale changes.
   */
  const handleMinMaxScaleChangeEvent = () => {
    setMinMaxType("scale");
    minValue.current = minScale ? minScale : 0;
    maxValue.current = maxScale ? maxScale : 0;
    setMaximum(23);
    setShowMinMaxDialog(true);
  };

  /**
   * Event to handle when the minimum and maximum scale changes.
   *
   * @param {object} minMaxData The new minimum and maximum data.
   */
  const handleNewMinMax = (minMaxData) => {
    if (minMaxData) {
      minValue.current = minMaxData.min;
      maxValue.current = minMaxData.max;

      setMinScale(minMaxData.min);
      setMaxScale(minMaxData.max);
    }

    setShowMinMaxDialog(false);
  };

  /**
   * Event to handle the closing of the Min/Max dialog.
   */
  const handleCloseMinMax = () => {
    setShowMinMaxDialog(false);
  };

  /**
   * Event to handle when the opacity changes.
   *
   * @param {number} newValue The new opacity.
   */
  const handleOpacityChangeEvent = (newValue) => {
    setOpacity(newValue);
  };

  /**
   * Event to handle when the ESU snap flag changes.
   *
   * @param {boolean} newValue The new ESU snap flag.
   */
  const handleEsuSnapChangeEvent = (newValue) => {
    setEsuSnap(newValue);
  };

  /**
   * Event to handle when the BLPU snap flag changes.
   *
   * @param {boolean} newValue The new BLPU snap flag.
   */
  const handleBlpuSnapChangeEvent = (newValue) => {
    setBlpuSnap(newValue);
  };

  /**
   * Event to handle when the extent snap flag changes.
   *
   * @param {boolean} newValue The new extent snap flag.
   */
  const handleExtentSnapChangeEvent = (newValue) => {
    setExtentSnap(newValue);
  };

  useEffect(() => {
    if (isOpen && !showDialog) {
      setShpFile(null);
      setFilename("");
      setTitle(null);
      setLayerId(null);
      setLayerIdError(null);
      setCopyright(null);
      setDisplayInList(true);
      setMaxScale(0);
      setMinScale(0);
      setOpacity(1);
      setEsuSnap(false);
      setBlpuSnap(false);
      setExtentSnap(false);
    }

    if (isOpen !== showDialog) setShowDialog(isOpen);
  }, [isOpen, showDialog]);

  return (
    <div>
      <Dialog open={showDialog} aria-labelledby="message-dialog" fullWidth maxWidth="md" onClose={handleCancelClick}>
        <DialogTitle
          id="message-dialog"
          sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA, mb: "8px" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Load Shape file
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleUploadClick}
            sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ marginTop: theme.spacing(2) }}>
          <Grid container justifyContent="flex-start" spacing={0}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={0}>
                <Typography
                  variant="body2"
                  sx={{ pl: "8px", fontFamily: "Nunito sans", fontSize: "14px", color: adsMidGreyA }}
                >
                  Choose the zip file you wish to upload.
                </Typography>
                <Box>
                  <Tooltip
                    title="Please select your zipped shape file. This is a required field."
                    arrow
                    placement="right"
                    sx={tooltipStyle}
                  >
                    <TextField
                      id={chooseFileId}
                      variant="outlined"
                      required
                      fullWidth
                      margin="dense"
                      size="small"
                      value={filename}
                      inputProps={{ type: "File", accept: "application/x-zip-compressed" }}
                      sx={{
                        pl: "8px",
                        pr: "8px",
                        fontFamily: "Nunito sans",
                        fontSize: "15px",
                        color: adsDarkGrey,
                        "&$outlinedInputFocused": {
                          borderColor: `${adsBlueA}  !important`,
                        },
                        "&$notchedOutline": {
                          borderWidth: "1px",
                          borderColor: `${adsOffWhite}  !important`,
                        },
                      }}
                      onChange={handleShpFileChangeEvent}
                    />
                  </Tooltip>
                  <ADSTextControl
                    label="Title"
                    isEditable
                    isRequired
                    maxLength={40}
                    value={title}
                    id={"layer_title"}
                    helperText="The title of the layer used to identify it in the layer control."
                    onChange={handleTitleChangeEvent}
                  />
                  <ADSTextControl
                    label="Map id"
                    isEditable
                    maxLength={50}
                    isRequired
                    value={layerId}
                    id={"layer_id"}
                    characterSet="EsriLayerId"
                    helperText="The unique ID assigned to the layer."
                    errorText={layerIdError}
                    onChange={handleLayerIdChangeEvent}
                  />
                  <ADSTextControl
                    label="Copyright information"
                    isEditable
                    maxLength={100}
                    value={copyright}
                    id={"layer_copyright_information"}
                    helperText="The copyright information that needs to be displayed on the map. If the current year needs to be displayed use <<year>>."
                    onChange={handleCopyrightInformationChangeEvent}
                  />
                  <ADSSwitchControl
                    label="Display in layer control"
                    isEditable
                    checked={displayInList}
                    trueLabel="Yes"
                    falseLabel="No"
                    helperText="Set this if you want this layer to be displayed in the layer control."
                    onChange={handleDisplayInListChangeEvent}
                  />
                  <ADSMinMaxControl
                    label="Scale range"
                    isEditable
                    minValue={minScale}
                    maxValue={maxScale}
                    helperText="The minimum scale (most zoomed out) and maximum scale (most zoomed in) at which the layer is visible in the map."
                    onChange={handleMinMaxScaleChangeEvent}
                  />
                  <ADSSliderControl
                    label="Opacity"
                    narrowLabel
                    isEditable
                    includeLabel
                    min={0}
                    max={1}
                    step={0.01}
                    helperText="The opacity of the layer in the map where 0 is transparent and 1 is opaque."
                    value={opacity}
                    onChange={handleOpacityChangeEvent}
                  />
                  <ADSSwitchControl
                    label="ESU snap to layer"
                    isEditable
                    checked={esuSnap}
                    trueLabel="Yes"
                    falseLabel="No"
                    helperText="Set this if you want to use this layer for snapping ESU nodes to it."
                    onChange={handleEsuSnapChangeEvent}
                  />
                  <ADSSwitchControl
                    label="BLPU snap to layer"
                    isEditable
                    checked={blpuSnap}
                    trueLabel="Yes"
                    falseLabel="No"
                    helperText="Set this if you want to use this layer for snapping BLPUs to it."
                    onChange={handleBlpuSnapChangeEvent}
                  />
                  <ADSSwitchControl
                    label="Extent snap to layer"
                    isEditable
                    checked={extentSnap}
                    trueLabel="Yes"
                    falseLabel="No"
                    helperText="Set this if you want to use this layer for snapping BLPU extents to it."
                    onChange={handleExtentSnapChangeEvent}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(2.25) }}>
          <Button
            variant="contained"
            onClick={handleUploadClick}
            autoFocus
            disabled={!shpFile || !["shp", "zip"].includes(shpFile.name.slice(-3)) || !title || !layerId}
            sx={blueButtonStyle}
            startIcon={<UploadIcon />}
          >
            Upload
          </Button>
          <Button variant="contained" onClick={handleCancelClick} sx={whiteButtonStyle} startIcon={<CancelIcon />}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <MinMaxDialog
        isOpen={showMinMaxDialog}
        variant={minMaxType}
        minValue={minValue.current}
        maxValue={maxValue.current}
        maximum={maximum}
        onNewMinMax={(data) => handleNewMinMax(data)}
        onClose={handleCloseMinMax}
      />
    </div>
  );
}

export default UploadShpFileDialog;
