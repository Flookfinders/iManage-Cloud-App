//#region header */
/**************************************************************************************************
//
//  Description: URL data about the api calls we need to make
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
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
//    006   05.01.24 Sean Flook                 Correctly call GetApiSite.
//    007   25.01.24 Sean Flook                 Changes required after UX review.
//    008   09.04.24 Sean Flook                 Changes required for updated security API.
//    009   24.04.24 Sean Flook       IMANN-390 Added new endpoint to get the list of new UPRNs used when creating new properties.
//    010   25.04.24 Sean Flook       IMANN-390 Added new endpoint to return UPRNs assigned to failed properties to be added back into the availableUprns table.
//    011   09.02.24 Joel Benford    IM-227/228 Generalize ward/parish URL
//    012   14.05.24 Sean Flook       IMANN-206 Changes required to display all the provenances.
//    013   17.05.24 Sean Flook       IMANN-176 Added a new endpoints used for spatially updating BLPU ward and parish codes.
//    014   10.06.24 Sean Flook       IMANN-509 Added new security URLs and ability to handle API versions.
//    015   10.06.24 Sean Flook       IMANN-509 Updated versions for api, settings and lookups.
//    016   11.06.24 Sean Flook       IMANN-509 Reverted security API back to v1 for now.
//    017   11.06.24 Sean Flook       IMANN-509 Undone above changes.
//    018   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    019   01.10.24 Sean Flook       IMANN-986 Added new range URLs.
//#endregion Version 1.0.1.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

var currentConfig = null;

const apiVersion = "v1/";
// const securityVersion = process.env.NODE_ENV === "development" ? "v1/" : "v2/";
const securityVersion = "v2/";
const settingsVersion = "v1/";
const lookupVersion = "v1/";

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
 * Get the URL used to log an user in to the system.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function PostUserLoginUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/Login`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to authenticate an user in to the system.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function GetAuthenticateUserUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/Authenticate`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to resent the authentication email.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function GetResendEmailUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/ResendEmail`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to send a reset password code.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPasswordResetCodeUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/SendPasswordResetCode`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to reset the users password.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function GetResetMyPasswordUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/ResetMyPassword`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to validate a new password.
 *
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPasswordValidateUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Password/Validate`);
  return getUrl(url, "GET", "application/json", null);
}

/**
 * Get information about the currently logged in user.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetWhoAmIUrl(userToken) {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/WhoAmI`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the current user.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUserUrl(userToken) {
  const url = GetApiSite("security", `/api/${securityVersion}User`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get a list of users.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUsersUrl(userToken) {
  const url = GetApiSite("security", `/api/${securityVersion}User`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get URL to allow a user to update their own password.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function UpdateMyPasswordUrl(userToken) {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/UpdateMyPassword`);
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL to allow any users password to be updated.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function UpdateAnyUserPasswordUrl(userToken) {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/UpdateAnyUserPassword`);
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used for searching within the application.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetSearchURL(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Search/MultiSearchProperty`);
  return getUrl(url, "GET", "text/plain", userToken);
}

/**
 * Get the URL used for multi-edit searching within the application.
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetMultiEditSearchUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Search/MultiSearchPropertyList`);
  return getUrl(url, "GET", "text/plain", userToken);
}

/**
 * Get the URL used when creating a new street object.
 *
 * @param {String} userToken The token for the user who is calling the endpoint.
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object} The URL object used in FETCH calls.
 */
export function GetCreateStreetUrl(userToken, hasAsd) {
  const url = GetApiSite("main", `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Ge the URL used to retrieve a street from a given USRN.
 *
 * @param {String} userToken The token for the user who is calling the endpoint.
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object} The URL object used in FETCH calls.
 */
export function GetStreetByUSRNUrl(userToken, hasAsd) {
  const url = GetApiSite("main", `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the ESU from a given id.
 *
 * @param {String} userToken The token for the user who is calling the endpoint.
 * @return {Object} The URL object used in FETCH calls.
 */
export function GetEsuByIdUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}MappableData/GetEsu`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the list of ESUs from a list of ESU ids.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetMultipleEsusByIdUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}MappableData/GetMultipleEsusById`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related properties from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedPropertyByUSRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Related/GetRelatedPropertyByUsrn`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related properties from a given UPRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedPropertyByUPRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Related/GetRelatedPropertyByUPRN`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetByUSRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Related/GetRelatedStreetByUSRN`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets from a given UPRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetByUPRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Related/GetRelatedStreetByUPRN`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets, with ASD data, from a given USRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetWithASDByUSRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Related/GetRelatedStreetWithASDByUSRN`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the related streets, with ASD data, from a given UPRN.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetRelatedStreetWithASDByUPRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Related/GetRelatedStreetWithASDByUPRN`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the history of a given property.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPropertyHistoryByUPRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}History/PropertySummaryGroup`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the history of a given street.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetStreetHistoryByUSRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}History/StreetSummaryGroup`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the home page data
 *
 * @param {string} userToken The token for the user who is calling the endpoint
 * @return {object} The URL object used in FETCH calls.
 */
export function GetHomepageUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Homepage`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to make updates to a given street.
 *
 * @param {String} userToken The token for the user who is calling the endpoint.
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object} The URL object used in FETCH calls.
 */
export function GetUpdateStreetUrl(userToken, hasAsd) {
  const url = GetApiSite("main", `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used to delete a given street.
 *
 * @param {String} userToken The token for the user who is calling the endpoint.
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object} The URL object used in FETCH calls.
 */
export function GetDeleteStreetUrl(userToken, hasAsd) {
  const url = GetApiSite("main", `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "DELETE", "application/json", userToken);
}

/**
 * Get the URL used to return all the streets within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetBackgroundStreetsUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}MappableData/GetStreets`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return all the unassigned ESUs within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUnassignedEsusUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}MappableData/GetUnassignedEsus`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return all the properties within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetBackgroundPropertiesUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}MappableData/GetProperties`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return all the provenances within a bounding box.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetBackgroundProvenancesUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}MappableData/GetBlpuProvenances`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to create a new property.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetCreatePropertyUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Property`);
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URL used to return a given property object.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetPropertyFromUPRNUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Property`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to update a given property.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUpdatePropertyUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Property`);
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used to delete a given property object.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetDeletePropertyUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Property`);
  return getUrl(url, "DELETE", "application/json", userToken);
}

/**
 * Get the URL used to return an array of new UPRNs to be used when creating new properties.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetListOfUprnsUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Property/GetListOfUprns`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return an array of new UPRNs to be used when creating new properties.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetAddUprnsBackUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Property/AddUprnsBackToAvailableUprns`);
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URL used to get all the validation messages.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetValidationMessagesUrl(userToken) {
  const url = GetApiSite("lookup", `/api/${lookupVersion}Admin`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}AppCrossRef`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}StreetDescriptor`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}Postcode`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}Posttown`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}SubLocality`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the count of properties with incorrect wards or parishes.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetIncorrectBoundariesCountUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Boundary/IncorrectBoundariesCount`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to update the ward and parish codes from the spatial data.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUpdateBlpuBoundaryCodesUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Boundary/UpdateBLPUBoundaryCodes`);
  return getUrl(url, "PUT", "application/json", userToken);
}

/**
 * Get the URL used to return the list of available parishes for a given authority.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {*} authorityCode The DETR code for the authority running the application, only used on GET.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetParishesUrl(endPointType, userToken, authorityCode) {
  const url =
    endPointType === "GET"
      ? GetApiSite("lookup", `/api/${lookupVersion}Parish/${authorityCode}`)
      : GetApiSite("lookup", `/api/${lookupVersion}Parish`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available wards for a given authority.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {*} authorityCode The DETR code for the authority running the application, only used on GET.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetWardsUrl(endPointType, userToken, authorityCode) {
  const url =
    endPointType === "GET"
      ? GetApiSite("lookup", `/api/${lookupVersion}Ward/${authorityCode}`)
      : GetApiSite("lookup", `/api/${lookupVersion}Ward`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}Locality`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return the list of available DbAuthorities.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetDbAuthorityUrl(endPointType, userToken) {
  const url = GetApiSite("lookup", `/api/${lookupVersion}DbAuthority`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}Island`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}Town`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}AdministrativeArea`);
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
  const url = GetApiSite("lookup", `/api/${lookupVersion}OperationalDistrict`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URL used to return a temporary address before the LPI has been created.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetTempAddressUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}TempAddress`);
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URL used to return the metadata for the main API.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetApiMetadataUrl(userToken) {
  const url = GetApiSite("main", `/api/${apiVersion}Version`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the metadata for the lookup API.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetLookupMetadataUrl(userToken) {
  const url = GetApiSite("lookup", `/api/${lookupVersion}Version`);
  return getUrl(url, "GET", "application/json", userToken);
}

/**
 * Get the URL used to return the metadata for the settings API.
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetSettingsMetadataUrl(userToken) {
  const url = GetApiSite("settings", `/api/${settingsVersion}Version`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}AuthorityDetail`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}LSGMetadata`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}ASDMetadata`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}${isScottish ? "OSGazetteerMetadata" : "GPLLPGMetadata"}`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}PropertyTemplate`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}StreetTemplate`);
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
  const url = GetApiSite("settings", `/api/${settingsVersion}MapLayer`);
  return getUrl(url, endPointType, "application/json", userToken);
}

/**
 * Get the URLs used to maintain the USRN Range
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUsrnRangeUrl(userToken, isScottish) {
  const url = GetApiSite("settings", `/api/${settingsVersion}${isScottish ? "OSRanges" : "GPRanges"}/UsrnRange`);
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URLs used to maintain the UPRN Range
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUprnRangeUrl(userToken, isScottish) {
  const url = GetApiSite("settings", `/api/${settingsVersion}${isScottish ? "OSRanges" : "GPRanges"}/UprnRange`);
  return getUrl(url, "POST", "application/json", userToken);
}

/**
 * Get the URLs used to maintain the ESU Id Range
 *
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The URL object used in FETCH calls.
 */
export function GetUEsuIdRangeUrl(userToken) {
  const url = GetApiSite("settings", `/api/${settingsVersion}OSRanges/EsuIdRange`);
  return getUrl(url, "POST", "application/json", userToken);
}
