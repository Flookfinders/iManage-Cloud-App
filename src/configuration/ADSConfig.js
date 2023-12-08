//#region header */
/**************************************************************************************************
//
//  Description: URL data about the api calls we need to make
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.07.21 Sean Flook         WI39??? Initial Revision.
//    002   23.08.23 Sean Flook       IMANN-159 Removed ASD Template as not required.
//    003   07.09.23 Sean Flook                 Cleaned the code and function names.
//    004   03.11.23 Sean Flook       IMANN-175 Added GetMultiEditSearchUrl.
//    005   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

var currentConfig = null;

/**
 * Return the configuration information object for the application.
 *
 */
const getConfigInfo = () => {
  const getBaseUrl = (envApi) => {
    const baseAPI = envApi.replace("/index.html", "");
    return baseAPI.lastIndexOf("/") === baseAPI.length - 1 ? baseAPI.slice(0, -1) : baseAPI;
  };

  if (
    !currentConfig ||
    !currentConfig.api ||
    currentConfig.api.length === 0 ||
    !currentConfig.apiLookup ||
    currentConfig.apiLookup.length === 0 ||
    !currentConfig.apiSettings ||
    currentConfig.apiSettings.length === 0 ||
    !currentConfig.securityApi ||
    currentConfig.securityApi.length === 0 ||
    !currentConfig.maxRecords ||
    currentConfig.maxRecords === 0
  ) {
    const api = getBaseUrl(process.env.REACT_APP_API);
    const apiLookup = getBaseUrl(process.env.REACT_APP_API_LOOKUP);
    const apiSettings = getBaseUrl(process.env.REACT_APP_API_SETTINGS);
    const securityApi = getBaseUrl(process.env.REACT_APP_SECURITY_API);
    const maxRecords = process.env.REACT_APP_MAX_RECORDS;

    currentConfig = {
      api,
      apiLookup,
      apiSettings,
      securityApi,
      maxRecords,
    };
  }
};

/**
 * Return the full URL for an end point that can be found in the main API.
 *
 * @param {string} baseType The base API type to use.
 * @param {string} urlController The specific text to be added to the base API URL.
 * @return {string} The API URL.
 */
function GetApiSite(baseType, urlController) {
  if (!currentConfig) getConfigInfo();
  const ApiUrl = `${
    baseType === "lookup"
      ? currentConfig.apiLookup
      : baseType === "settings"
      ? currentConfig.apiSettings
      : baseType === "security"
      ? currentConfig.securityApi
      : currentConfig.api
  }${urlController}`;
  return ApiUrl;
}

/**
 * Get the URL object used when making calls to the various APIs
 *
 * @param {string} url The url string for the endpoint.
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | PATCH | DELETE ]
 * @param {string} contentType The content type to use [ application/json | text/plain ]
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
const getUrl = (url, endPointType, contentType, userToken) => {
  if (userToken)
    return {
      url: url,
      type: endPointType,
      mode: "cors",
      headers: {
        "Content-Type": contentType,
        Authorization: "Bearer " + userToken,
      },
    };
  else
    return {
      url: url,
      type: endPointType,
      mode: "cors",
      headers: {
        "Content-Type": contentType,
      },
    };
};

/**
 * Get the URL used to log a user in to the system.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function PostUserLoginUrl() {
  const url = GetApiSite("security", "/api/Authority/Login");
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get information about the currently logged in user.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetWhoAmIUrl(userToken) {
  const url = GetApiSite("security", "/api/Authority/WhoAmI");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the current user.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUserUrl(userToken) {
  const url = GetApiSite("security", "/api/User");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get a list of users.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUsersUrl(userToken) {
  const url = GetApiSite("security", "/api/User");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get URL to allow a user to update their own password.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function UpdateMyPasswordUrl(userToken) {
  const url = GetApiSite("security", "/api/Authority/UpdateMyPassword");
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL to allow any users password to be updated.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function UpdateAnyUserPasswordUrl(userToken) {
  const url = GetApiSite("security", "/api/Authority/UpdateAnyUserPassword");
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used for searching within the application.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetSearchURL(userToken) {
  const url = GetApiSite("main", "/api/Search/MultiSearchProperty");
  return getUrl(url, "GET", "text/plain", userToken);
}

/**
 * Get the URL used for multi-edit searching within the application.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetMultiEditSearchUrl(userToken) {
  const url = GetApiSite("main", "/api/Search/MultiSearchPropertyList");
  return getUrl(url, "GET", "text/plain", userToken);
}

/**
 * Get the URL used when creating a new street object.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetCreateStreetUrl(userToken, isScottish) {
  const url = !isScottish && HasASD() ? GetApiSite("main", "/api/StreetWithAsd") : GetApiSite("main", "/api/Street");
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Ge the URL used to retrieve a street from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetStreetByUSRNUrl(userToken, isScottish) {
  const url = !isScottish && HasASD() ? GetApiSite("main", "/api/StreetWithAsd") : GetApiSite("main", "/api/Street");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the ESU from a given id.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetEsuByIdUrl(userToken) {
  const url = GetApiSite("main", "/api/MappableData/GetEsu");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related properties from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedPropertyByUSRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Related/GetRelatedPropertyByUsrn");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related properties from a given UPRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedPropertyByUPRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Related/GetRelatedPropertyByUPRN");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetByUSRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Related/GetRelatedStreetByUSRN");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets from a given UPRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetByUPRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Related/GetRelatedStreetByUPRN");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets, with ASD data, from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetWithASDByUSRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Related/GetRelatedStreetWithASDByUSRN");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets, with ASD data, from a given UPRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetWithASDByUPRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Related/GetRelatedStreetWithASDByUPRN");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the history of a given property.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPropertyHistoryByUPRNUrl(userToken) {
  const url = GetApiSite("main", "/api/History/PropertySummaryGroup");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the history of a given street.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetStreetHistoryByUSRNUrl(userToken) {
  const url = GetApiSite("main", "/api/History/StreetSummaryGroup");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the home page data
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetHomepageUrl(userToken) {
  const url = GetApiSite("main", "/api/Homepage");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to make updates to a given street.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUpdateStreetUrl(userToken, isScottish) {
  const url = !isScottish && HasASD() ? GetApiSite("main", "/api/StreetWithAsd") : GetApiSite("main", "/api/Street");
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used to delete a given street.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetDeleteStreetUrl(userToken, isScottish) {
  const url = !isScottish && HasASD() ? GetApiSite("main", "/api/StreetWithAsd") : GetApiSite("main", "/api/Street");
  return getUrl(url, "DELETE", "application/json", userToken);
}

/**
 * Get the URL used to return all the streets within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetBackgroundStreetsUrl(userToken) {
  const url = GetApiSite("main", "/api/MappableData/GetStreets");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return all the unassigned ESUs within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUnassignedEsusUrl(userToken) {
  const url = GetApiSite("main", "/api/MappableData/GetUnassignedEsus");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return all the properties within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetBackgroundPropertiesUrl(userToken) {
  const url = GetApiSite("main", "/api/MappableData/GetProperties");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to create a new property.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetCreatePropertyUrl(userToken) {
  const url = GetApiSite("main", "/api/Property");
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URL used to return a given property object.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPropertyFromUPRNUrl(userToken) {
  const url = GetApiSite("main", "/api/Property");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to update a given property.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUpdatePropertyUrl(userToken) {
  const url = GetApiSite("main", "/api/Property");
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used to delete a given property object.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetDeletePropertyUrl(userToken) {
  const url = GetApiSite("main", "/api/Property");
  return getUrl(url, "DELETE", "application/json", userToken);
}

/**
 * Get the URL used to get all the validation messages.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetValidationMessagesUrl(userToken) {
  const url = GetApiSite("lookup", "/api/Admin");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the current list of application cross reference sources
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetAppCrossRefUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/AppCrossRef");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available streets.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetStreetDescriptorUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/StreetDescriptor");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to get the list of available postcodes.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPostcodeUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/Postcode");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available post towns.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPostTownUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/Posttown");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available sub-localities.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetSubLocalityUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/SubLocality");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available parishes for a given authority.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {*} authorityCode The DETR code for the authority running the application.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetParishesForAuthorityUrl(endPointType, userToken, authorityCode) {
  const url = GetApiSite("lookup", `/api/Parish/${authorityCode}`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available wards for a given authority.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {*} authorityCode The DETR code for the authority running the application.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetWardsForAuthorityUrl(endPointType, userToken, authorityCode) {
  const url = GetApiSite("lookup", `/api/Ward/${authorityCode}`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available localities.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetLocalityUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/Locality");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available islands.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetIslandUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/Island");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available towns.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetTownUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/Town");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available administrative areas.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetAdministrativeAreaUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/AdministrativeArea");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of operational districts.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetOperationalDistrictUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", "/api/OperationalDistrict");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return a temporary address before the LPI has been created.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetTempAddressUrl(userToken) {
  const url = GetApiSite("/api/TempAddress");
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URL used to return the metadata for the main API.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetApiMetadataUrl(userToken) {
  const url = GetApiSite("/api/Version");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the metadata for the lookup API.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetLookupMetadataUrl(userToken) {
  const url = GetApiSite("lookup", "/api/Version");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the metadata for the settings API.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetSettingsMetadataUrl(userToken) {
  const url = GetApiSite("settings", "/api/Version");
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URLs used to maintain the authority details in the settings.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetAuthorityDetailsUrl(endPointType, userToken) {
  const url = GetApiSite("settings", "/api/AuthorityDetail");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the LSG metadata settings data.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetLSGMetadataUrl(endPointType, userToken) {
  const url = GetApiSite("settings", "/api/LSGMetadata");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the ASD metadata settings data.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetASDMetadataUrl(endPointType, userToken) {
  const url = GetApiSite("settings", "/api/ASDMetadata");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the LLPG metadata settings data.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetLLPGMetadataUrl(endPointType, userToken, isScottish) {
  const url = isScottish
    ? GetApiSite("settings", "/api/OSGazetteerMetadata")
    : GetApiSite("settings", "/api/GPLLPGMetadata");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the property templates
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPropertyTemplatesUrl(endPointType, userToken) {
  const url = GetApiSite("settings", "/api/PropertyTemplate");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the street template.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetStreetTemplateUrl(endPointType, userToken) {
  const url = GetApiSite("settings", "/api/StreetTemplate");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the map layers
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | PATCH | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetMapLayersUrl(endPointType, userToken) {
  const url = GetApiSite("settings", "/api/MapLayer");
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Used to determine if the application is registered.
 *
 * @return {boolean} True if they are registered; otherwise false.
 */
export function IsRegistered() {
  const registration = GetRegistration();
  return registration.lsg || registration.llpg;
}

/**
 * Used to determine if the application is registered to deal with property data.
 *
 * @return {boolean} True if they have registered to handle properties; otherwise false.
 */
export function HasProperties() {
  const registration = GetRegistration();
  return registration.llpg;
}

/**
 * Used to determine if the application is registered to deal with ASD data.
 *
 * @return {boolean} Tue if they are registered for ASD; otherwise false.
 */
export function HasASD() {
  const registration = GetRegistration();
  return registration.asd;
}

/**
 * Returns the registration object for the application.
 *
 * @return {object} The registration object.
 */
function GetRegistration() {
  const regKey = process.env.REACT_APP_REG_KEY;

  return {
    lsg: regKey.includes("XJQ68B"),
    llpg: regKey.includes("R8VZE8"),
    asd: regKey.includes("PM10"),
  };
}
