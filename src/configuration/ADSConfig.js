//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: URL data about the api calls we need to make
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   02.07.21 Sean Flook          WI39??? Initial Revision.
//    002   23.08.23 Sean Flook        IMANN-159 Removed ASD Template as not required.
//    003   07.09.23 Sean Flook                  Cleaned the code and function names.
//    004   03.11.23 Sean Flook        IMANN-175 Added GetMultiEditSearchUrl.
//    005   10.11.23 Sean Flook                  Removed HasASDPlus as no longer required.
//    006   05.01.24 Sean Flook                  Correctly call GetApiSite.
//    007   25.01.24 Sean Flook                  Changes required after UX review.
//    008   09.04.24 Sean Flook                  Changes required for updated security API.
//    009   24.04.24 Sean Flook        IMANN-390 Added new endpoint to get the list of new UPRNs used when creating new properties.
//    010   25.04.24 Sean Flook        IMANN-390 Added new endpoint to return UPRNs assigned to failed properties to be added back into the availableUprns table.
//    011   09.02.24 Joel Benford     IM-227/228 Generalize ward/parish URL
//    012   14.05.24 Sean Flook        IMANN-206 Changes required to display all the provenances.
//    013   17.05.24 Sean Flook        IMANN-176 Added a new endpoints used for spatially updating BLPU ward and parish codes.
//    014   10.06.24 Sean Flook        IMANN-509 Added new security URLs and ability to handle API versions.
//    015   10.06.24 Sean Flook        IMANN-509 Updated versions for api, settings and lookups.
//    016   11.06.24 Sean Flook        IMANN-509 Reverted security API back to v1 for now.
//    017   11.06.24 Sean Flook        IMANN-509 Undone above changes.
//    018   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    019   01.10.24 Sean Flook        IMANN-986 Added new range URLs.
//    020   10.10.24 Sean Flook        IMANN-986 Corrected method name.
//    021   24.10.24 Sean Flook       IMANN-1040 Added PostUserLogoffUrl.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    022   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//    023   30.01.25 Sean Flook       IMANN-1673 Added some error handling.
//    024   11.02.25 Sean Flook       IMANN-1680 Fixed GetCreateStreetUrl.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

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
    !currentConfig.securityApi ||
    currentConfig.securityApi.length === 0 ||
    !currentConfig.userApi ||
    currentConfig.userApi.length === 0 ||
    !currentConfig.appName ||
    currentConfig.appName.length === 0
  ) {
    const securityApi = getBaseUrl(process.env.REACT_APP_SECURITY_API);
    const userApi = getBaseUrl(process.env.REACT_APP_USER_API);
    const appName = process.env.REACT_APP_APP_NAME;

    currentConfig = {
      securityApi,
      userApi,
      appName,
    };
  }
};

/**
 * Return the full URL for an end point that can be found in the main API.
 *
 * @param {String} baseType The base API type to use.
 * @param {String} urlController The specific text to be added to the base API URL.
 * @return {String} The API URL.
 */
function GetApiSite(baseType, urlController) {
  if (!currentConfig) getConfigInfo();
  const ApiUrl = `${
    baseType === "security" ? currentConfig.securityApi : baseType === "user" ? currentConfig.userApi : baseType
  }${urlController}${baseType === "user" ? "/" + currentConfig.appName : ""}`;
  return ApiUrl;
}

/**
 * Get the URL object used when making calls to the various APIs
 *
 * @param {String} url The url string for the endpoint.
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | PATCH | DELETE ]
 * @param {String} contentType The content type to use [ application/json | text/plain ]
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
const getUrl = (url, endPointType, contentType, currentUser) => {
  if (currentUser)
    return {
      url: url,
      type: endPointType,
      mode: "cors",
      headers: {
        "Content-Type": contentType,
        Authorization: "Bearer " + currentUser,
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
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function PostUserLoginUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/Login`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to log an user out of the system.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function PostUserLogoffUrl(currentUser) {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/Logoff`);
  return getUrl(url, "POST", "application/text", currentUser);
}

/**
 * Get the URL used to authenticate an user in to the system.
 *
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetAuthenticateUserUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/Authenticate`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to resent the authentication email.
 *
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetResendEmailUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/ResendEmail`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to send a reset password code.
 *
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPasswordResetCodeUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/SendPasswordResetCode`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to reset the users password.
 *
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetResetMyPasswordUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Authority/ResetMyPassword`);
  return getUrl(url, "POST", "application/json", null);
}

/**
 * Get the URL used to validate a new password.
 *
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPasswordValidateUrl() {
  const url = GetApiSite("security", `/api/${securityVersion}Password/Validate`);
  return getUrl(url, "GET", "application/json", null);
}

/**
 * Get information about the currently logged in user.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetWhoAmIUrl(currentUser) {
  if (!currentUser) return null;
  const url = GetApiSite("security", `/api/${securityVersion}Authority/WhoAmI`);
  return getUrl(url, "GET", "application/json", currentUser);
}

/**
 * Get the current user.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUserUrl(currentUser) {
  if (!currentUser) return null;
  const url = GetApiSite("security", `/api/${securityVersion}User`);
  return getUrl(url, "GET", "application/json", currentUser);
}

/**
 * Get a list of users.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUsersUrl(currentUser) {
  if (!currentUser) return null;
  const url = GetApiSite("security", `/api/${securityVersion}User`);
  return getUrl(url, "GET", "application/json", currentUser);
}

/**
 * Get URL to allow a user to update their own password.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function UpdateMyPasswordUrl(currentUser) {
  if (!currentUser) return null;
  const url = GetApiSite("security", `/api/${securityVersion}Authority/UpdateMyPassword`);
  return getUrl(url, "PUT", "application/json", currentUser);
}

/**
 * Get the URL to allow any users password to be updated.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function UpdateAnyUserPasswordUrl(currentUser) {
  if (!currentUser) return null;
  const url = GetApiSite("security", `/api/${securityVersion}Authority/UpdateAnyUserPassword`);
  return getUrl(url, "PUT", "application/json", currentUser);
}

/**
 * Get the URL to get the cluster of APIs the user is using.
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetOrganisationClusterUrl(currentUser) {
  if (!currentUser) return null;
  const url = GetApiSite("user", `/api/UserApis/OrganisationCluster`);
  return getUrl(url, "GET", "application/json", currentUser);
}

/**
 * Get the URL used for searching within the application.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetSearchURL(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Search/MultiSearchProperty`);
  return getUrl(url, "GET", "text/plain", currentUser.token);
}

/**
 * Get the URL used for multi-edit searching within the application.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetMultiEditSearchUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Search/MultiSearchPropertyList`);
  return getUrl(url, "GET", "text/plain", currentUser.token);
}

/**
 * Get the URL used when creating a new street object.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetCreateStreetUrl(currentUser, hasAsd) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "POST", "application/json", currentUser.token);
}

/**
 * Ge the URL used to retrieve a street from a given USRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetStreetByUSRNUrl(currentUser, hasAsd) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the ESU from a given id.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetEsuByIdUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}MappableData/GetEsu`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of ESUs from a list of ESU ids.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetMultipleEsusByIdUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}MappableData/GetMultipleEsusById`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the related properties from a given USRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetRelatedPropertyByUSRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Related/GetRelatedPropertyByUsrn`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the related properties from a given UPRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetRelatedPropertyByUPRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Related/GetRelatedPropertyByUPRN`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the related streets from a given USRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetRelatedStreetByUSRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Related/GetRelatedStreetByUSRN`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the related streets from a given UPRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetRelatedStreetByUPRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Related/GetRelatedStreetByUPRN`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the related streets, with ASD data, from a given USRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetRelatedStreetWithASDByUSRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Related/GetRelatedStreetWithASDByUSRN`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the related streets, with ASD data, from a given UPRN.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetRelatedStreetWithASDByUPRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Related/GetRelatedStreetWithASDByUPRN`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the history of a given property.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPropertyHistoryByUPRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}History/PropertySummaryGroup`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the history of a given street.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetStreetHistoryByUSRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}History/StreetSummaryGroup`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the home page data
 *
 * @param {String} currentUser The token for the user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetHomepageUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Homepage`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to make updates to a given street.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUpdateStreetUrl(currentUser, hasAsd) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "PUT", "application/json", currentUser.token);
}

/**
 * Get the URL used to delete a given street.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {Boolean} hasAsd Can the user see ASD data.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetDeleteStreetUrl(currentUser, hasAsd) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Street${hasAsd ? "WithAsd" : ""}`);
  return getUrl(url, "DELETE", "application/json", currentUser.token);
}

/**
 * Get the URL used to return all the streets within a bounding box.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetBackgroundStreetsUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}MappableData/GetStreets`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return all the unassigned ESUs within a bounding box.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUnassignedEsusUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}MappableData/GetUnassignedEsus`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return all the properties within a bounding box.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetBackgroundPropertiesUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}MappableData/GetProperties`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return all the provenances within a bounding box.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetBackgroundProvenancesUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}MappableData/GetBlpuProvenances`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to create a new property.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetCreatePropertyUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Property`);
  return getUrl(url, "POST", "application/json", currentUser.token);
}

/**
 * Get the URL used to return a given property object.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPropertyFromUPRNUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Property`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to update a given property.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUpdatePropertyUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Property`);
  return getUrl(url, "PUT", "application/json", currentUser.token);
}

/**
 * Get the URL used to delete a given property object.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetDeletePropertyUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Property`);
  return getUrl(url, "DELETE", "application/json", currentUser.token);
}

/**
 * Get the URL used to return an array of new UPRNs to be used when creating new properties.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetListOfUprnsUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Property/GetListOfUprns`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return an array of new UPRNs to be used when creating new properties.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetAddUprnsBackUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Property/AddUprnsBackToAvailableUprns`);
  return getUrl(url, "POST", "application/json", currentUser.token);
}

/**
 * Get the URL used to get all the validation messages.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetValidationMessagesUrl(currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Admin`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the current list of application cross reference sources
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetAppCrossRefUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}AppCrossRef`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available streets.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetStreetDescriptorUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}StreetDescriptor`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to get the list of available postcodes.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPostcodeUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Postcode`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available post towns.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPostTownUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Posttown`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available sub-localities.
 *
 * @param {string} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetSubLocalityUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}SubLocality`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the count of properties with incorrect wards or parishes.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetIncorrectBoundariesCountUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Boundary/IncorrectBoundariesCount`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to update the ward and parish codes from the spatial data.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUpdateBlpuBoundaryCodesUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Boundary/UpdateBLPUBoundaryCodes`);
  return getUrl(url, "PUT", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available parishes for a given authority.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {*} authorityCode The DETR code for the authority running the application, only used on GET.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetParishesUrl(endPointType, currentUser, authorityCode) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url =
    endPointType === "GET"
      ? GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Parish/${authorityCode}`)
      : GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Parish`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available wards for a given authority.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {*} authorityCode The DETR code for the authority running the application, only used on GET.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetWardsUrl(endPointType, currentUser, authorityCode) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url =
    endPointType === "GET"
      ? GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Ward/${authorityCode}`)
      : GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Ward`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available localities.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetLocalityUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Locality`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available DbAuthorities.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetDbAuthorityUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}DbAuthority`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available islands.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetIslandUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Island`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available towns.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetTownUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Town`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of available administrative areas.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetAdministrativeAreaUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}AdministrativeArea`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return the list of operational districts.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetOperationalDistrictUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}OperationalDistrict`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URL used to return a temporary address before the LPI has been created.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetTempAddressUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}TempAddress`);
  return getUrl(url, "POST", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the metadata for the main API.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetApiMetadataUrl(currentUser) {
  if (!currentUser || !currentUser.mainApi) return null;
  const url = GetApiSite(currentUser.mainApi, `/api/${apiVersion}Version`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the metadata for the lookup API.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetLookupMetadataUrl(currentUser) {
  if (!currentUser || !currentUser.lookupsApi) return null;
  const url = GetApiSite(currentUser.lookupsApi, `/api/${lookupVersion}Version`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URL used to return the metadata for the settings API.
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetSettingsMetadataUrl(currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}Version`);
  return getUrl(url, "GET", "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the authority details in the settings.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetAuthorityDetailsUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}AuthorityDetail`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the LSG metadata settings data.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetLSGMetadataUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}LSGMetadata`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the ASD metadata settings data.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetASDMetadataUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}ASDMetadata`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the LLPG metadata settings data.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {Boolean} isScottish Is the authority a Scottish authority.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetLLPGMetadataUrl(endPointType, currentUser, isScottish) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(
    currentUser.settingsApi,
    `/api/${settingsVersion}${isScottish ? "OSGazetteerMetadata" : "GPLLPGMetadata"}`
  );
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the property templates
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetPropertyTemplatesUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}PropertyTemplate`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the street template.
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetStreetTemplateUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}StreetTemplate`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the map layers
 *
 * @param {String} endPointType The type of endpoint being called [ GET | POST | PUT | PATCH | DELETE ]
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetMapLayersUrl(endPointType, currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}MapLayer`);
  return getUrl(url, endPointType, "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the USRN Range
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {boolean} isScottish Is the authority a Scottish authority.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUsrnRangeUrl(currentUser, isScottish) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(
    currentUser.settingsApi,
    `/api/${settingsVersion}${isScottish ? "OSRanges" : "GPRanges"}/UsrnRange`
  );
  return getUrl(url, "POST", "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the UPRN Range
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @param {Boolean} isScottish Is the authority a Scottish authority.
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetUprnRangeUrl(currentUser, isScottish) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(
    currentUser.settingsApi,
    `/api/${settingsVersion}${isScottish ? "OSRanges" : "GPRanges"}/UprnRange`
  );
  return getUrl(url, "POST", "application/json", currentUser.token);
}

/**
 * Get the URLs used to maintain the ESU Id Range
 *
 * @param {String} currentUser The current user who is calling the endpoint
 * @return {Object|null} The URL object used in FETCH calls.
 */
export function GetEsuIdRangeUrl(currentUser) {
  if (!currentUser || !currentUser.settingsApi) return null;
  const url = GetApiSite(currentUser.settingsApi, `/api/${settingsVersion}OSRanges/EsuIdRange`);
  return getUrl(url, "POST", "application/json", currentUser.token);
}
