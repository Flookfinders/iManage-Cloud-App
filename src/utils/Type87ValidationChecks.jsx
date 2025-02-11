//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 87 validation checks
//
//  Copyright:    © 2024 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.1.0
//    001   31.10.24 Sean Flook      IMANN-1012 Initial Revision.
//endregion Version 1.0.1.0
//region Version 1.0.3.0
//    002   06.01.25 Sean Flook      IMANN-1121 Fixed logic for failsCheck8700004.
//endregion Version 1.0.3.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import MapLayerTypes from "../data/MapLayerTypes";

/**
 * Check 8700004 - Layer type is invalid.
 *
 * @param {Number|Null} layerType The map layer type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700004 = (layerType) => {
  return layerType && !MapLayerTypes.find((x) => x.id === layerType);
};

/**
 * Check 8700005 - Title is too long.
 *
 * @param {String|Null} title The map layer title
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700005 = (title) => {
  return title && title.length > 40;
};

/**
 * Check 8700006 - Copyright is too long.
 *
 * @param {String|Null} copyright The map layer copyright
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700006 = (copyright) => {
  return copyright && copyright.length > 100;
};

/**
 * Check 8700007 - Service provider is too long.
 *
 * @param {String|Null} serviceProvider The map layer service provider
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700007 = (serviceProvider) => {
  return serviceProvider && serviceProvider.length > 50;
};

/**
 * Check 8700008 - Layer key is too long.
 *
 * @param {String|Null} layerKey The map layer key
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700008 = (layerKey) => {
  return layerKey && layerKey.length > 40;
};

/**
 * Check 8700009 - Layer username is too long.
 *
 * @param {String|Null} layerUsername The map layer username
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700009 = (layerUsername) => {
  return layerUsername && layerUsername.length > 40;
};

/**
 * Check 8700010 - Layer password is too long.
 *
 * @param {String|Null} layerPassword The map layer password
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700010 = (layerPassword) => {
  return layerPassword && layerPassword.length > 40;
};

/**
 * Check 8700011 - Service layer name is too long.
 *
 * @param {String|Null} activeLayerId The map layer service layer
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700011 = (activeLayerId) => {
  return activeLayerId && activeLayerId.length > 40;
};

/**
 * Check 8700012 - Service mode is too long.
 *
 * @param {String|Null} serviceMode The map layer service mode
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700012 = (serviceMode) => {
  return serviceMode && serviceMode.length > 40;
};

/**
 * Check 8700013 - Property name is too long.
 *
 * @param {String|Null} propertyName The map layer property name
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700013 = (propertyName) => {
  return propertyName && propertyName.length > 100;
};

/**
 * Check 8700014 - Enter a type of service.
 *
 * @param {Number|Null} layerType The map layer type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700014 = (layerType) => {
  return !layerType;
};

/**
 * Check 8700015 - Enter a service layer name.
 *
 * @param {String|Null} activeLayerId The map layer service layer
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700015 = (activeLayerId) => {
  return !activeLayerId;
};

/**
 * Check 8700018 - Enter a URL.
 *
 * @param {String|Null} url The map layer url
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700018 = (url) => {
  return !url;
};

/**
 * Check 8700019 - Opacity is invalid.
 *
 * @param {String|Null} opacity The map layer opacity
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700019 = (opacity) => {
  return !opacity;
};

/**
 * Check 8700020 - Enter a service provider.
 *
 * @param {String|Null} serviceProvider The map layer service provider
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700020 = (serviceProvider) => {
  return !serviceProvider;
};

/**
 * Check 8700022 - Enter a copyright.
 *
 * @param {String|Null} serviceProvider The map layer copyright
 * @param {String|Null} activeLayerId The map layer service layer
 * @param {String|Null} copyright The map layer copyright
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700022 = (serviceProvider, activeLayerId, copyright) => {
  return (
    (serviceProvider === "OS" ||
      serviceProvider === "viaEuropa" ||
      (serviceProvider === "thinkWare" && activeLayerId && activeLayerId.toLowerCase().startsWith("osmm"))) &&
    !copyright
  );
};

/**
 * Check 8700023 - Enter a service mode.
 *
 * @param {String|Null} serviceProvider The map layer service provider
 * @param {Number|Null} layerType The map layer type
 * @param {String|Null} serviceMode The map layer service mode
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700023 = (serviceProvider, layerType, serviceMode) => {
  return serviceProvider === "OS" && layerType === 3 && !serviceMode;
};

/**
 * Check 8700024 - Enter a property name.
 *
 * @param {Number|Null} layerType The map layer type
 * @param {String|Null} propertyName The map layer property name
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700024 = (layerType, propertyName) => {
  return layerType === 1 && !propertyName;
};

/**
 * Check 8700027 - Enter a layer key.
 *
 * @param {String|Null} serviceProvider The map layer service provider
 * @param {String|Null} layerKey The map layer key
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700027 = (serviceProvider, layerKey) => {
  return (serviceProvider === "OS" || serviceProvider === "viaEuropa") && !layerKey;
};

/**
 * Check 8700028 - Title is missing.
 *
 * @param {String|Null} title The map layer title
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700028 = (title) => {
  return !title;
};

/**
 * Check 8700030 - Enter a geometry type.
 *
 * @param {String|Null} geometryType The map layer geometry type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700030 = (geometryType) => {
  return !geometryType;
};

/**
 * Check 8700031 - Enter a map layer id.
 *
 * @param {String|Null} layerId The map layer id
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8700031 = (layerId) => {
  return !layerId;
};
