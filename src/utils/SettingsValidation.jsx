//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Settings validation
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Metadata: 1000000 - 1000019
//  Settings: 8700031
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001   25.04.23 Sean Flook                 Initial Revision.
//    002   07.09.23 Sean Flook                 Removed unnecessary console logs.
//    003   15.12.23 Sean Flook                 Added comments.
//    004   08.02.24 Sean Flook                 Changes required for viaEuropa.
//    005   20.05.24 Sean Flook       IMANN-446 Added missing map layer checks.
//    006   04.07.24 Sean Flook       IMANN-221 Updated messages.
//endregion Version 1.0.0.0
//region Version 1.0.2.0
//    007   31.10.24 Sean Flook       IMANN-1012 Changed to use new checks to prevent duplicating check code.
//endregion Version 1.0.2.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import { GetErrorMessage, GetCheck } from "./HelperUtils";

import {
  failsCheck8700004,
  failsCheck8700005,
  failsCheck8700006,
  failsCheck8700007,
  failsCheck8700008,
  failsCheck8700009,
  failsCheck8700010,
  failsCheck8700011,
  failsCheck8700012,
  failsCheck8700013,
  failsCheck8700014,
  failsCheck8700015,
  failsCheck8700018,
  failsCheck8700019,
  failsCheck8700020,
  failsCheck8700022,
  failsCheck8700023,
  failsCheck8700024,
  failsCheck8700027,
  failsCheck8700028,
  failsCheck8700030,
  failsCheck8700031,
} from "./Type87ValidationChecks";

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
  const geometryTypeErrors = [];

  if (data) {
    // Layer type is invalid.
    currentCheck = GetCheck(8700004, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700004(data.layerType))
      layerTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Title is too long.
    currentCheck = GetCheck(8700005, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700005(data.title))
      titleErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Copyright is too long.
    currentCheck = GetCheck(8700006, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700006(data.copyright))
      copyrightErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Service provider is too long.
    currentCheck = GetCheck(8700007, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700007(data.serviceProvider))
      serviceProviderErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Layer key is too long.
    currentCheck = GetCheck(8700008, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700008(data.layerKey))
      layerKeyErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Layer username is too long.
    currentCheck = GetCheck(8700009, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700009(data.layerUsername))
      layerUsernameErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Layer password is too long.
    currentCheck = GetCheck(8700010, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700010(data.layerPassword))
      layerPasswordErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Service layer name is too long.
    currentCheck = GetCheck(8700011, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700011(data.activeLayerId))
      activeLayerIdErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Service mode is too long.
    currentCheck = GetCheck(8700012, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700012(data.serviceMode))
      serviceModeErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Property name is too long.
    currentCheck = GetCheck(8700013, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700013(data.propertyName))
      propertyNameErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a type of service.
    currentCheck = GetCheck(8700014, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700014(data.layerType))
      layerTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a service layer name.
    currentCheck = GetCheck(8700015, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700015(data.activeLayerId))
      activeLayerIdErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a URL.
    currentCheck = GetCheck(8700018, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700018(data.url))
      urlErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Opacity is invalid.
    currentCheck = GetCheck(8700019, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700019(data.opacity))
      opacityErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a service provider.
    currentCheck = GetCheck(8700020, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700020(data.serviceProvider))
      serviceProviderErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a copyright.
    currentCheck = GetCheck(8700022, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      currentCheck &&
      !currentCheck.ignoreCheck &&
      failsCheck8700022(data.serviceProvider, data.activeLayerId, data.copyright)
    )
      copyrightErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a service mode.
    currentCheck = GetCheck(8700023, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      currentCheck &&
      !currentCheck.ignoreCheck &&
      failsCheck8700023(data.serviceProvider, data.layerType, data.serviceMode)
    )
      serviceModeErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a property name.
    currentCheck = GetCheck(8700024, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700024(data.layerType, data.propertyName))
      propertyNameErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a layer key.
    currentCheck = GetCheck(8700027, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700027(data.serviceProvider, data.layerKey))
      layerKeyErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Title is missing.
    currentCheck = GetCheck(8700028, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700028(data.title))
      titleErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a geometry type.
    currentCheck = GetCheck(8700030, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700030(data.geometryType))
      geometryTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a map layer id.
    currentCheck = GetCheck(8700031, currentLookups, methodName, isScottish, showDebugMessages);
    if (currentCheck && !currentCheck.ignoreCheck && failsCheck8700031(data.layerId))
      layerIdErrors.push(GetErrorMessage(currentCheck, isScottish));
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

  if (geometryTypeErrors.length > 0)
    validationErrors.push({
      field: "GeometryType",
      errors: geometryTypeErrors,
    });

  return validationErrors;
}
