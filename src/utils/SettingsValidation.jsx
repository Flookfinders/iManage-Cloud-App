/* #region header */
/**************************************************************************************************
//
//  Description: Settings validation
//
//  Copyright:    © 2023 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Settings: 8700021 - 8700027
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   25.04.23 Sean Flook                 Initial Revision.
//    002   07.09.23 Sean Flook                 Removed unnecessary console logs.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { GetErrorMessage, GetCheck } from "./HelperUtils";

import MapLayerTypes from "../data/MapLayerTypes";

const showDebugMessages = false;

/**
 * Validates a map layer record
 *
 * @param {object} data - The map layer record data that needs to be validated
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @return {array}
 */
export function ValidateMapLayer(data, currentLookups, isScottish) {
  const methodName = "ValidateMapLayer";
  const validationErrors = [];
  let currentCheck;
  const layerTypeErrors = [];
  const titleErrors = [];
  const copyrightErrors = [];
  const serviceProviderErrors = [];
  const layerKeyErrors = [];
  const layerUsernameErrors = [];
  const layerPasswordErrors = [];
  const activeLayerIdErrors = [];
  const serviceModeErrors = [];
  const propertyNameErrors = [];
  const layerIdErrors = [];
  const urlErrors = [];
  const opacityErrors = [];

  if (data) {
    currentCheck = GetCheck(8700004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      currentCheck &&
      !currentCheck.ignoreCheck &&
      data.layerType &&
      !MapLayerTypes.find((x) => x.id === data.layerType)
    )
      layerTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700005, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.title && data.title.length > 40)
      titleErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700006, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.copyright && data.copyright.length > 100)
      copyrightErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700007, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.serviceProvider && data.serviceProvider.length > 50)
      serviceProviderErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700008, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.layerKey && data.layerKey.length > 40)
      layerKeyErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700009, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.layerUsername && data.layerUsername.length > 40)
      layerUsernameErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700010, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.layerPassword && data.layerPassword.length > 40)
      layerPasswordErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700011, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.activeLayerId && data.activeLayerId.length > 40)
      activeLayerIdErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700012, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.serviceMode && data.serviceMode.length > 40)
      serviceModeErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700013, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.propertyName && data.propertyName.length > 100)
      propertyNameErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700014, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && !data.layerType)
      layerTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700015, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && !data.layerId)
      layerIdErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700018, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && !data.url)
      urlErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700019, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && !data.opacity)
      opacityErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700020, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && !data.serviceProvider)
      serviceProviderErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700022, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      currentCheck &&
      !currentCheck.ignoreCheck &&
      (data.serviceProvider === "OS" ||
        (data.serviceProvider === "thinkWare" &&
          data.activeLayerId &&
          data.activeLayerId.toLowerCase().startsWith("osmm"))) &&
      !data.copyright
    )
      copyrightErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700023, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.layerType === 3 && !data.serviceMode)
      serviceModeErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700024, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.layerType === 1 && !data.propertyName)
      propertyNameErrors.push(GetErrorMessage(currentCheck, isScottish));

    currentCheck = GetCheck(8700027, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && data.serviceProvider === "OS" && !data.layerKey)
      layerKeyErrors.push(GetErrorMessage(currentCheck, isScottish));
  }

  if (layerTypeErrors.length > 0)
    validationErrors.push({
      field: "LayerType",
      errors: layerTypeErrors,
    });

  if (titleErrors.length > 0)
    validationErrors.push({
      field: "Title",
      errors: titleErrors,
    });

  if (copyrightErrors.length > 0)
    validationErrors.push({
      field: "Copyright",
      errors: copyrightErrors,
    });

  if (serviceProviderErrors.length > 0)
    validationErrors.push({
      field: "ServiceProvider",
      errors: serviceProviderErrors,
    });

  if (layerKeyErrors.length > 0)
    validationErrors.push({
      field: "LayerKey",
      errors: layerKeyErrors,
    });

  if (layerUsernameErrors.length > 0)
    validationErrors.push({
      field: "LayerUsername",
      errors: layerUsernameErrors,
    });

  if (layerPasswordErrors.length > 0)
    validationErrors.push({
      field: "LayerPassword",
      errors: layerPasswordErrors,
    });

  if (activeLayerIdErrors.length > 0)
    validationErrors.push({
      field: "ActiveLayerId",
      errors: activeLayerIdErrors,
    });

  if (serviceModeErrors.length > 0)
    validationErrors.push({
      field: "ServiceMode",
      errors: serviceModeErrors,
    });

  if (propertyNameErrors.length > 0)
    validationErrors.push({
      field: "PropertyName",
      errors: propertyNameErrors,
    });

  if (layerIdErrors.length > 0)
    validationErrors.push({
      field: "LayerId",
      errors: layerIdErrors,
    });

  if (urlErrors.length > 0)
    validationErrors.push({
      field: "Url",
      errors: urlErrors,
    });

  if (opacityErrors.length > 0)
    validationErrors.push({
      field: "Opacity",
      errors: opacityErrors,
    });

  return validationErrors;
}
