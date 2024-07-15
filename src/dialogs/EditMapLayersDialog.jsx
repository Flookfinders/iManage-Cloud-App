/* #region header */
/**************************************************************************************************
//
//  Description: Edit map layers dialog
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
//    003   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    004   02.01.24 Sean Flook                 Changes required to load shape files.
//    005   03.01.24 Sean Flook                 Fixed warning.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//    007   10.01.24 Sean Flook                 Fix warnings.
//    008   11.01.24 Sean Flook                 Fix warnings.
//    009   07.02.24 Sean Flook                 Changes required for viaEuropa.
//    010   07.02.24 Sean Flook                 Changes required to support WFS from viaEuropa mapping for OneScotland.
//    011   08.02.24 Sean Flook                 Correctly set additional fields.
//    012   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    013   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    014   09.07.24 Joshua McCormick IMANN-520 Property Names input set to required 
//    015   15.07.24 Sean Flook                 Display non-field errors.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useContext, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import { Dialog, DialogActions, DialogContent, Grid, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSMinMaxControl from "../components/ADSMinMaxControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSSliderControl from "../components/ADSSliderControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import MinMaxDialog from "../dialogs/MinMaxDialog";

import MapLayerTypes from "../data/MapLayerTypes";
import MapServiceProviders from "../data/MapServiceProviders";

import { defaultMapLayerIds, GetLookupLabel, filteredLookup } from "../utils/HelperUtils";
import { ValidateMapLayer } from "../utils/SettingsValidation";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { redButtonStyle, blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { adsRed } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

EditMapLayersDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isNew: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  errors: PropTypes.array,
  onDataChanged: PropTypes.func.isRequired,
  onErrorsChanged: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditMapLayersDialog({ isOpen, isNew, data, errors, onDataChanged, onErrorsChanged, onDone, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [showDialog, setShowDialog] = useState(false);

  const [layerId, setLayerId] = useState(null);
  const [layerType, setLayerType] = useState(null);
  const [url, setUrl] = useState(null);
  const [title, setTitle] = useState(null);
  const [copyright, setCopyright] = useState(null);
  const [displayInList, setDisplayInList] = useState(null);
  const [visible, setVisible] = useState(null);
  const [maxScale, setMaxScale] = useState(null);
  const [minScale, setMinScale] = useState(null);
  const [opacity, setOpacity] = useState(null);
  const [esuSnap, setEsuSnap] = useState(null);
  const [blpuSnap, setBlpuSnap] = useState(null);
  const [extentSnap, setExtentSnap] = useState(null);
  const [layerUsername, setLayerUsername] = useState(null);
  const [layerPassword, setLayerPassword] = useState(null);
  const [globalLayer, setGlobalLayer] = useState(null);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [geometryType, setGeometryType] = useState(null);
  const [layerKey, setLayerKey] = useState(null);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [serviceMode, setServiceMode] = useState(null);
  const [propertyName, setPropertyName] = useState(null);
  const [usePaging, setUsePaging] = useState(null);
  const [maxBatchSize, setMaxBatchSize] = useState(null);

  const [layerIdError, setLayerIdError] = useState(null);
  const [layerTypeError, setLayerTypeError] = useState(null);
  const [urlError, setUrlError] = useState(null);
  const [titleError, setTitleError] = useState(null);
  const [copyrightError, setCopyrightError] = useState(null);
  const [displayInListError, setDisplayInListError] = useState(null);
  const [visibleError, setVisibleError] = useState(null);
  const [maxScaleError, setMaxScaleError] = useState(null);
  const [minScaleError, setMinScaleError] = useState(null);
  const [opacityError, setOpacityError] = useState(null);
  const [esuSnapError, setEsuSnapError] = useState(null);
  const [blpuSnapError, setBlpuSnapError] = useState(null);
  const [extentSnapError, setExtentSnapError] = useState(null);
  // const [layerUsernameError, setLayerUsernameError] = useState(null);
  // const [layerPasswordError, setLayerPasswordError] = useState(null);
  // const [globalLayerError, setGlobalLayerError] = useState(null);
  const [serviceProviderError, setServiceProviderError] = useState(null);
  const [geometryTypeError, setGeometryTypeError] = useState(null);
  const [layerKeyError, setLayerKeyError] = useState(null);
  const [activeLayerIdError, setActiveLayerIdError] = useState(null);
  const [serviceModeError, setServiceModeError] = useState(null);
  const [propertyNameError, setPropertyNameError] = useState(null);
  const [usePagingError, setUsePagingError] = useState(null);
  const [maxBatchSizeError, setMaxBatchSizeError] = useState(null);
  const [mapLayerError, setMapLayerError] = useState(null);

  const [haveErrors, setHaveErrors] = useState(false);

  const [showMinMaxDialog, setShowMinMaxDialog] = useState(false);
  const [minMaxType, setMinMaxType] = useState("scale");
  const minValue = useRef(0);
  const maxValue = useRef(0);
  const [maximum, setMaximum] = useState(23);

  const geometryTypes = [
    {
      id: "line",
      text: "Line",
    },
    {
      id: "polygon",
      text: "Polygon",
    },
  ];

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
   * Method to get the updated data object after a change.
   *
   * @param {string} field The name of the field that has been updated.
   * @param {number|string|boolean|null} newValue The new value for the field.
   * @returns {object} The updated data abject.
   */
  const getUpdatedData = (field, newValue) => {
    return {
      pkId: data.pkId,
      layerId: field && field === "layerId" ? newValue : layerId,
      layerType: field && field === "layerType" ? newValue : layerType,
      layerPosition: field && field === "layerPosition" ? newValue : data.layerPosition,
      url: field && field === "url" ? newValue : url,
      title: field && field === "title" ? newValue : title,
      copyright:
        field && field === "copyright"
          ? newValue
          : (field &&
              field === "serviceProvider" &&
              !copyright &&
              (newValue === "OS" ||
                newValue === "viaEuropa" ||
                (newValue === "thinkWare" && activeLayerId.toLowerCase().startsWith("osmm")))) ||
            (field &&
              field === "activeLayerId" &&
              !copyright &&
              serviceProvider === "thinkWare" &&
              newValue.toLowerCase().startsWith("osmm"))
          ? "Contains OS data © Crown copyright and database rights <<year>>"
          : copyright,
      displayInList: field && field === "displayInList" ? newValue : displayInList,
      visible: field && field === "visible" ? newValue : visible,
      minScale: field && field === "minScale" ? newValue : minScale,
      maxScale: field && field === "maxScale" ? newValue : maxScale,
      opacity: field && field === "opacity" ? newValue : opacity,
      esuSnap: field && field === "esuSnap" ? newValue : esuSnap,
      blpuSnap: field && field === "blpuSnap" ? newValue : blpuSnap,
      extentSnap: field && field === "extentSnap" ? newValue : extentSnap,
      globalLayer: field && field === "globalLayer" ? newValue : globalLayer,
      serviceProvider: field && field === "serviceProvider" ? newValue : serviceProvider,
      geometryType: field && field === "geometryType" ? newValue : geometryType,
      layerKey: field && field === "layerKey" ? newValue : layerKey,
      layerUsername: field && field === "layerUsername" ? newValue : layerUsername,
      layerPassword: field && field === "layerPassword" ? newValue : layerPassword,
      activeLayerId: field && field === "activeLayerId" ? newValue : activeLayerId,
      serviceMode:
        field && field === "serviceMode"
          ? newValue
          : field && field === "serviceProvider" && !serviceMode
          ? "KVP"
          : serviceMode,
      propertyName: field && field === "propertyName" ? newValue : propertyName,
      usePaging: field && field === "usePaging" ? newValue : usePaging,
      maxBatchSize: field && field === "maxBatchSize" ? newValue : maxBatchSize,
    };
  };

  /**
   * Method to determine if the map layer data is valid or not.
   *
   * @param {object} mapLayerData The map layer data.
   * @returns {boolean} True of the map layer data is valid; otherwise false.
   */
  const mapLayerValid = (mapLayerData) => {
    const mapLayerErrors = ValidateMapLayer(mapLayerData, lookupContext.currentLookups, settingsContext.isScottish);

    setHaveErrors(mapLayerErrors.length > 0);

    if (onErrorsChanged) onErrorsChanged(mapLayerErrors);

    return mapLayerErrors.length === 0;
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    const updatedData = getUpdatedData(null, null);
    if (mapLayerValid(updatedData) && onDone) onDone(updatedData);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the layer id changes.
   *
   * @param {number} newValue The new layer id.
   */
  const handleLayerIdChangeEvent = (newValue) => {
    setLayerId(newValue);
    if (newValue !== data.layerId && onDataChanged) onDataChanged(getUpdatedData("layerId", newValue));
    if (defaultMapLayerIds.includes(newValue)) setLayerIdError(`${newValue} is not unique.`);
    else if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "layerid"));
  };

  /**
   * Event to handle when the layer type changes.
   *
   * @param {number} newValue The new layer type.
   */
  const handleLayerTypeChangeEvent = (newValue) => {
    setLayerType(newValue);
    if (newValue !== data.layerType && onDataChanged) onDataChanged(getUpdatedData("layerType", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "layertype"));
  };

  /**
   * Event to handle when the URL changes.
   *
   * @param {string} newValue The new URL.
   */
  const handleUrlChangeEvent = (newValue) => {
    setUrl(newValue);
    if (newValue !== data.url && onDataChanged) onDataChanged(getUpdatedData("url", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "url"));
  };

  /**
   * Event to handle when the title changes.
   *
   * @param {string} newValue The new title.
   */
  const handleTitleChangeEvent = (newValue) => {
    setTitle(newValue);
    if (newValue !== data.title && onDataChanged) onDataChanged(getUpdatedData("title", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "title"));
  };

  /**
   * Event to handle when the copyright information changes.
   *
   * @param {string} newValue The new copyright information.
   */
  const handleCopyrightInformationChangeEvent = (newValue) => {
    setCopyright(newValue);
    if (newValue !== data.copyright && onDataChanged) onDataChanged(getUpdatedData("copyright", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "copyright"));
  };

  /**
   * Event to handle when the display in list flag changes.
   *
   * @param {boolean} newValue The new display in list flag.
   */
  const handleDisplayInListChangeEvent = (newValue) => {
    setDisplayInList(newValue);
    if (newValue !== data.displayInList && onDataChanged) onDataChanged(getUpdatedData("displayInList", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "displayinlist"));
  };

  /**
   * Event to handle when the visible flag changes.
   *
   * @param {boolean} newValue The new visible flag.
   */
  const handleVisibleChangeEvent = (newValue) => {
    setVisible(newValue);
    if (newValue !== data.visible && onDataChanged) onDataChanged(getUpdatedData("visible", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "visible"));
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
   * Event to handle when the opacity changes.
   *
   * @param {number} newValue The new opacity.
   */
  const handleOpacityChangeEvent = (newValue) => {
    setOpacity(newValue);
    if (newValue !== data.opacity && onDataChanged) onDataChanged(getUpdatedData("opacity", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "opacity"));
  };

  /**
   * Event to handle when the ESU snap flag changes.
   *
   * @param {boolean} newValue The new ESU snap flag.
   */
  const handleEsuSnapChangeEvent = (newValue) => {
    setEsuSnap(newValue);
    if (newValue !== data.esuSnap && onDataChanged) onDataChanged(getUpdatedData("esuSnap", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "esusnap"));
  };

  /**
   * Event to handle when the BLPU snap flag changes.
   *
   * @param {boolean} newValue The new BLPU snap flag.
   */
  const handleBlpuSnapChangeEvent = (newValue) => {
    setBlpuSnap(newValue);
    if (newValue !== data.blpuSnap && onDataChanged) onDataChanged(getUpdatedData("blpuSnap", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "blpusnap"));
  };

  /**
   * Event to handle when the extent snap flag changes.
   *
   * @param {boolean} newValue The new extent snap flag.
   */
  const handleExtentSnapChangeEvent = (newValue) => {
    setExtentSnap(newValue);
    if (newValue !== data.extentSnap && onDataChanged) onDataChanged(getUpdatedData("extentSnap", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "extentsnap"));
  };

  /**
   * Event to handle when the service provider changes.
   *
   * @param {string} newValue The new service provider.
   */
  const handleServiceProviderChangeEvent = (newValue) => {
    setServiceProvider(newValue);
    if (newValue !== data.serviceProvider && onDataChanged) onDataChanged(getUpdatedData("serviceProvider", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "serviceprovider"));
  };

  /**
   * Event to handle when the geometry type changes.
   *
   * @param {number} newValue The new geometry type.
   */
  const handleGeometryTypeChangeEvent = (newValue) => {
    setGeometryType(newValue);
    if (newValue !== data.geometryType && onDataChanged) onDataChanged(getUpdatedData("geometryType", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "geometrytype"));
  };

  /**
   * Event to handle when the layer key changes.
   *
   * @param {string} newValue The new layer key.
   */
  const handleLayerKeyChangeEvent = (newValue) => {
    setLayerKey(newValue);
    if (newValue !== data.layerKey && onDataChanged) onDataChanged(getUpdatedData("layerKey", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "layerkey"));
  };

  /**
   * Event to handle when the active layer id changes.
   *
   * @param {string} newValue The new active layer id.
   */
  const handleActiveLayerIdChangeEvent = (newValue) => {
    setActiveLayerId(newValue);
    if (newValue !== data.activeLayerId && onDataChanged) onDataChanged(getUpdatedData("activeLayerId", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "activelayerid"));
  };

  /**
   * Event to handle when the service mode changes.
   *
   * @param {string} newValue The new service mode.
   */
  const handleServiceModeChangeEvent = (newValue) => {
    setServiceMode(newValue);
    if (newValue !== data.serviceMode && onDataChanged) onDataChanged(getUpdatedData("serviceMode", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "servicemode"));
  };

  /**
   * Event to handle when the property name changes.
   *
   * @param {string} newValue The new property name.
   */
  const handlePropertyNameChangeEvent = (newValue) => {
    setPropertyName(newValue);
    if (newValue !== data.propertyName && onDataChanged) onDataChanged(getUpdatedData("propertyName", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "propertyname"));
  };

  /**
   * Event to handle when the use paging flag changes.
   *
   * @param {boolean} newValue The new use paging flag.
   */
  const handleUsePagingChangeEvent = (newValue) => {
    setUsePaging(newValue);
    if (newValue !== data.usePaging && onDataChanged) onDataChanged(getUpdatedData("usePaging", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "usepaging"));
  };

  /**
   * Event to handle when the maximum batch size changes.
   *
   * @param {number} newValue The new maximum batch size.
   */
  const handleMaxBatchSizeChangeEvent = (newValue) => {
    setMaxBatchSize(newValue);
    if (newValue !== data.maxBatchSize && onDataChanged) onDataChanged(getUpdatedData("maxBatchSize", newValue));
    if (errors && onErrorsChanged) onErrorsChanged(errors.filter((x) => x.field.toLowerCase() !== "maxbatchsize"));
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

      if (minMaxData.min !== data.minScale && onDataChanged) onDataChanged(getUpdatedData("minScale", minMaxData.min));
      if (minMaxData.max !== data.maxScale && onDataChanged) onDataChanged(getUpdatedData("maxScale", minMaxData.max));

      if (errors && onErrorsChanged)
        onErrorsChanged(errors.filter((x) => !["minscale", "maxscale"].includes(x.field.toLowerCase())));
    }

    setShowMinMaxDialog(false);
  };

  /**
   * Event to handle the closing of the Min/Max dialog.
   */
  const handleCloseMinMax = () => {
    setShowMinMaxDialog(false);
  };

  useEffect(() => {
    if (data) {
      setLayerId(data.layerId);
      setLayerType(data.layerType);
      setUrl(data.url);
      setTitle(data.title);
      setCopyright(data.copyright);
      setDisplayInList(data.displayInList);
      setVisible(data.visible);
      setMaxScale(data.maxScale);
      setMinScale(data.minScale);
      setOpacity(data.opacity);
      setEsuSnap(data.esuSnap);
      setBlpuSnap(data.blpuSnap);
      setExtentSnap(data.extentSnap);
      setLayerUsername(data.layerUsername);
      setLayerPassword(data.layerPassword);
      setGlobalLayer(data.globalLayer);
      setServiceProvider(data.serviceProvider);
      setGeometryType(data.geometryType);
      setLayerKey(data.layerKey);
      setActiveLayerId(data.activeLayerId);
      setServiceMode(data.serviceMode);
      setPropertyName(data.propertyName);
      setUsePaging(data.usePaging);
      setMaxBatchSize(data.maxBatchSize);
    }

    setShowDialog(isOpen);
  }, [data, isOpen]);

  useEffect(() => {
    setLayerIdError(null);
    setLayerTypeError(null);
    setUrlError(null);
    setTitleError(null);
    setCopyrightError(null);
    setDisplayInListError(null);
    setVisibleError(null);
    setMaxScaleError(null);
    setMinScaleError(null);
    setOpacityError(null);
    setEsuSnapError(null);
    setBlpuSnapError(null);
    setExtentSnapError(null);
    // setLayerUsernameError(null);
    // setLayerPasswordError(null);
    // setGlobalLayerError(null);
    setServiceProviderError(null);
    setGeometryTypeError(null);
    setLayerKeyError(null);
    setActiveLayerIdError(null);
    setServiceModeError(null);
    setPropertyNameError(null);
    setUsePagingError(null);
    setMaxBatchSizeError(null);

    setHaveErrors(errors && errors.length > 0);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "layerid":
            setLayerIdError(error.errors);
            break;

          case "layertype":
            setLayerTypeError(error.errors);
            break;

          case "url":
            setUrlError(error.errors);
            break;

          case "title":
            setTitleError(error.errors);
            break;

          case "copyright":
            setCopyrightError(error.errors);
            break;

          case "displayinlist":
            setDisplayInListError(error.errors);
            break;

          case "visible":
            setVisibleError(error.errors);
            break;

          case "maxscale":
            setMaxScaleError(error.errors);
            break;

          case "minscale":
            setMinScaleError(error.errors);
            break;

          case "opacity":
            setOpacityError(error.errors);
            break;

          case "esusnap":
            setEsuSnapError(error.errors);
            break;

          case "blpusnap":
            setBlpuSnapError(error.errors);
            break;

          case "extentsnap":
            setExtentSnapError(error.errors);
            break;

          case "layerusername":
            // setLayerUsernameError(error.errors);
            break;

          case "layerpassword":
            // setLayerPasswordError(error.errors);
            break;

          case "globallayer":
            // setGlobalLayerError(error.errors);
            break;

          case "serviceprovider":
            setServiceProviderError(error.errors);
            break;

          case "geometrytype":
            setGeometryTypeError(error.errors);
            break;

          case "layerkey":
            setLayerKeyError(error.errors);
            break;

          case "activelayerid":
            setActiveLayerIdError(error.errors);
            break;

          case "servicemode":
            setServiceModeError(error.errors);
            break;

          case "propertyname":
            setPropertyNameError(error.errors);
            break;

          case "usepaging":
            setUsePagingError(error.errors);
            break;

          case "maxbatchsize":
            setMaxBatchSizeError(error.errors);
            break;

          default:
            setMapLayerError(error.errors);
            break;
        }
      }
    }
  }, [errors]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-map-layer-dialog"
        fullWidth
        maxWidth="md"
        onClose={handleDialogClose}
      >
        <ADSDialogTitle
          title={`${isNew ? "Add" : "Edit"} map layer`}
          closeTooltip="Cancel"
          onClose={handleCancelClick}
        />
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          <Grid container justifyContent="flex-start" spacing={0} sx={{ pl: theme.spacing(3.5) }}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={0.25}>
                  <Typography sx={{ fontSize: 24, flexGrow: 1 }}>Map layer</Typography>
                  {mapLayerError && (
                    <>
                      <PriorityHighIcon sx={{ color: adsRed, height: "16px", width: "16px" }} />
                      <Typography
                        variant="caption"
                        color={adsRed}
                        align="left"
                        sx={{ fontWeight: 600, fontSize: "14px" }}
                      >
                        {mapLayerError}
                      </Typography>
                    </>
                  )}
                </Stack>
                <Box>
                  <ADSTextControl
                    label="Title"
                    isEditable
                    isRequired
                    maxLength={40}
                    value={title}
                    id="layer_title"
                    helperText="The title of the layer used to identify it in the layer control."
                    errorText={titleError}
                    onChange={handleTitleChangeEvent}
                  />
                  <ADSSelectControl
                    label="Provider"
                    isEditable
                    isRequired
                    useRounded
                    doNotSetTitleCase
                    lookupData={filteredLookup(MapServiceProviders, settingsContext.isScottish)}
                    lookupId="id"
                    lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                    value={serviceProvider}
                    helperText="Select the service provider for this layer."
                    errorText={serviceProviderError}
                    onChange={handleServiceProviderChangeEvent}
                  />
                  <ADSSelectControl
                    label="Type"
                    isEditable
                    isRequired
                    useRounded
                    doNotSetTitleCase
                    lookupData={MapLayerTypes}
                    lookupId="id"
                    lookupLabel="name"
                    value={layerType}
                    helperText="The type of service being used to get the layer from."
                    errorText={layerTypeError}
                    onChange={handleLayerTypeChangeEvent}
                  />
                  <ADSTextControl
                    label="URL"
                    isEditable
                    maxLength={100}
                    isRequired
                    value={url}
                    id="layer_url"
                    helperText="The URL used to obtain the layer information from the service."
                    errorText={urlError}
                    onChange={handleUrlChangeEvent}
                  />
                  <ADSTextControl
                    label="Layer"
                    isEditable
                    isRequired
                    maxLength={40}
                    value={activeLayerId}
                    id="active_layer_id"
                    helperText="This is the layer ID of the layer that you want to return from the service."
                    errorText={activeLayerIdError}
                    onChange={handleActiveLayerIdChangeEvent}
                  />
                  {(serviceProvider === "OS" || serviceProvider === "viaEuropa") && (
                    <ADSTextControl
                      label="Key"
                      isEditable
                      isHidden
                      isRequired
                      maxLength={40}
                      value={layerKey}
                      id="layer_key"
                      helperText="This is your key used to access the service to get the layer information."
                      errorText={layerKeyError}
                      onChange={handleLayerKeyChangeEvent}
                    />
                  )}
                  {layerType === 3 && serviceProvider !== "viaEuropa" && (
                    <ADSTextControl
                      label="Mode"
                      isEditable
                      maxLength={40}
                      value={serviceMode}
                      id="layer_service_mode"
                      helperText="This is the service mode used to return the data from the service for WMTS layers from OS this would be KVP."
                      errorText={serviceModeError}
                      onChange={handleServiceModeChangeEvent}
                    />
                  )}
                  {layerType === 1 && (
                    <ADSTextControl
                      label="Property names"
                      isEditable
                      isRequired
                      maxLength={100}
                      value={propertyName}
                      id="layer_property_name"
                      helperText="This is a comma separated list of property names that you want to be returned"
                      errorText={propertyNameError}
                      onChange={handlePropertyNameChangeEvent}
                    />
                  )}
                  <ADSSelectControl
                    label="Geometry type"
                    isEditable
                    isRequired
                    useRounded
                    lookupData={geometryTypes}
                    lookupId="id"
                    lookupLabel="text"
                    value={geometryType}
                    helperText="Select the geometry type for the layer, only single geometry type layers are allowed."
                    errorText={geometryTypeError}
                    onChange={handleGeometryTypeChangeEvent}
                  />
                  <ADSTextControl
                    label="Map id"
                    isEditable
                    maxLength={50}
                    isRequired
                    value={layerId}
                    id="layer_id"
                    characterSet="EsriLayerId"
                    helperText="The unique ID assigned to the layer."
                    errorText={layerIdError}
                    onChange={handleLayerIdChangeEvent}
                  />
                  <ADSTextControl
                    label="Copyright information"
                    isEditable
                    isRequired={
                      serviceProvider === "OS" ||
                      serviceProvider === "viaEuropa" ||
                      (serviceProvider === "thinkWare" &&
                        activeLayerId &&
                        activeLayerId.toLowerCase().startsWith("osmm"))
                    }
                    maxLength={100}
                    value={copyright}
                    id="layer_copyright_information"
                    helperText="The copyright information that needs to be displayed on the map. If the current year needs to be displayed use <<year>>."
                    errorText={copyrightError}
                    onChange={handleCopyrightInformationChangeEvent}
                  />
                  {layerType === 1 && (
                    <ADSSwitchControl
                      label="Use paging"
                      isEditable
                      isRequired
                      checked={usePaging}
                      trueLabel="Yes"
                      falseLabel="No"
                      helperText="Set this if you want to use paging to return the records."
                      errorText={usePagingError}
                      onChange={handleUsePagingChangeEvent}
                    />
                  )}
                  {layerType === 1 && (
                    <ADSNumberControl
                      label="Max. batch size"
                      isEditable
                      isRequired={usePaging}
                      value={maxBatchSize}
                      helperText="This is the maximum number of records to return in each batch."
                      errorText={maxBatchSizeError}
                      onChange={handleMaxBatchSizeChangeEvent}
                    />
                  )}
                  <ADSSwitchControl
                    label="Active"
                    isEditable
                    checked={visible}
                    trueLabel="Yes"
                    falseLabel="No"
                    helperText="Set this if you want to use this layer."
                    errorText={visibleError}
                    onChange={handleVisibleChangeEvent}
                  />
                  {visible && (
                    <ADSSwitchControl
                      label="Display in layer control"
                      isEditable
                      checked={displayInList}
                      trueLabel="Yes"
                      falseLabel="No"
                      helperText="Set this if you want this layer to be displayed in the layer control."
                      errorText={displayInListError}
                      onChange={handleDisplayInListChangeEvent}
                    />
                  )}
                  {visible && (
                    <ADSMinMaxControl
                      label="Scale range"
                      isEditable
                      minValue={minScale}
                      maxValue={maxScale}
                      helperText="The minimum scale (most zoomed out) and maximum scale (most zoomed in) at which the layer is visible in the map."
                      errorText={
                        minScaleError && maxScaleError
                          ? minScaleError.concat(maxScaleError)
                          : minScaleError && !maxScaleError
                          ? minScaleError
                          : !minScaleError && maxScaleError
                          ? maxScaleError
                          : null
                      }
                      onChange={handleMinMaxScaleChangeEvent}
                    />
                  )}
                  {visible && (
                    <ADSSliderControl
                      label="Opacity"
                      narrowLabel
                      isEditable
                      includeLabel
                      min={0}
                      max={1}
                      step={0.01}
                      helperText="The opacity of the layer in the map where 0 is transparent and 1 is opaque."
                      errorText={opacityError}
                      value={opacity}
                      onChange={handleOpacityChangeEvent}
                    />
                  )}
                  {visible && layerType === 1 && (
                    <ADSSwitchControl
                      label="ESU snap to layer"
                      isEditable
                      checked={esuSnap}
                      trueLabel="Yes"
                      falseLabel="No"
                      helperText="Set this if you want to use this layer for snapping ESU nodes to it."
                      errorText={esuSnapError}
                      onChange={handleEsuSnapChangeEvent}
                    />
                  )}
                  {visible && layerType === 1 && (
                    <ADSSwitchControl
                      label="BLPU snap to layer"
                      isEditable
                      checked={blpuSnap}
                      trueLabel="Yes"
                      falseLabel="No"
                      helperText="Set this if you want to use this layer for snapping BLPUs to it."
                      errorText={blpuSnapError}
                      onChange={handleBlpuSnapChangeEvent}
                    />
                  )}
                  {visible && layerType === 1 && (
                    <ADSSwitchControl
                      label="Extent snap to layer"
                      isEditable
                      checked={extentSnap}
                      trueLabel="Yes"
                      falseLabel="No"
                      helperText="Set this if you want to use this layer for snapping BLPU extents to it."
                      errorText={extentSnapError}
                      onChange={handleExtentSnapChangeEvent}
                    />
                  )}
                  {/* <ADSSwitchControl
                    label="Global"
                    isEditable
                    checked={globalLayer}
                    trueLabel="Yes"
                    falseLabel="No"
                    // helperText=""
                    errorText={globalLayerError}
                    onChange={handleGlobalChangeEvent}
                  />
                  <ADSTextControl
                    label="Username"
                    isEditable
                    maxLength={40}
                    value={layerUsername}
                    id="layer_username"
                    // helperText=""
                    errorText={layerUsernameError}
                    onChange={handleLayerUsernameChangeEvent}
                  />
                  <ADSTextControl
                    label="Password"
                    isEditable
                    isHidden
                    maxLength={40}
                    value={layerPassword}
                    id="layer_password"
                    helperText="This is your password used to access this layer."
                    errorText={layerPasswordError}
                    onChange={handleLayerPasswordChangeEvent}
                  /> */}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
          <Button
            onClick={handleDoneClick}
            autoFocus
            variant="contained"
            sx={haveErrors ? redButtonStyle : blueButtonStyle}
            startIcon={haveErrors ? <ErrorIcon /> : <DoneIcon />}
          >
            Done
          </Button>
          <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
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

export default EditMapLayersDialog;
