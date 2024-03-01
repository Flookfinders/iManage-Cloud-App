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
//    002   02.06.23 Joel Benford       WI40689 Invoke homepage control
//    003   23.08.23 Sean Flook       IMANN-159 Include the street template and sub-locality lookup.
//    004   07.09.23 Sean Flook                 Remove unnecessary awaits.
//    005   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings.
//    007   25.01.24 Sean Flook                 Correctly handle status code 204.
//    008   13.02.24 Sean Flook                 Correctly handle the response from the GET endpoints.
//    009   26.02.24 Joel Benford     IMANN-242 Add DbAuthority to lookups context
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";
import {
  GetValidationMessagesUrl,
  GetLocalityUrl,
  GetTownUrl,
  GetIslandUrl,
  GetAdministrativeAreaUrl,
  GetOperationalDistrictUrl,
  GetAppCrossRefUrl,
  GetStreetDescriptorUrl,
  GetSubLocalityUrl,
  GetPostTownUrl,
  GetPostcodeUrl,
  GetWardsForAuthorityUrl,
  GetParishesForAuthorityUrl,
  GetDbAuthorityUrl,
  GetApiMetadataUrl,
  GetLookupMetadataUrl,
  GetSettingsMetadataUrl,
  GetAuthorityDetailsUrl,
  GetPropertyTemplatesUrl,
  GetStreetTemplateUrl,
  GetMapLayersUrl,
} from "../configuration/ADSConfig";
import ADSHomepageControl from "../components/ADSHomepageControl";

const HomePage = () => {
  const lookupsContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [lookupValidationMessages, setLookupValidationMessages] = useState();
  const [lookupLocalities, setLookupLocalities] = useState();
  const [lookupIslands, setLookupIslands] = useState();
  const [lookupTowns, setLookupTowns] = useState();
  const [lookupAdminAuthorities, setLookupAdminAuthorities] = useState();
  const [lookupOperationalDistricts, setLookupOperationalDistricts] = useState();
  const [lookupAppCrossRefs, setLookupAppCrossRefs] = useState();
  const [lookupStreetDescriptors, setLookupStreetDescriptors] = useState();
  const [lookupSubLocalities, setLookupSubLocalities] = useState();
  const [lookupPostTowns, setLookupPostTowns] = useState();
  const [lookupPostcodes, setLookupPostcodes] = useState();
  const [lookupWards, setLookupWards] = useState();
  const [lookupParishes, setLookupParishes] = useState();
  const [lookupDbAuthorities, setLookupDbAuthorities] = useState();
  const [apiMetadata, setApiMetadata] = useState();
  const [lookupMetadata, setLookupMetadata] = useState();
  const [settingsMetadata, setSettingsMetadata] = useState();
  const [authorityDetails, setAuthorityDetails] = useState();
  const [propertyTemplates, setPropertyTemplates] = useState();
  const [streetTemplate, setStreetTemplate] = useState();
  const [mapLayers, setMapLayers] = useState();

  const loadedLookups = useRef([]);
  const validationMessagesLoaded = useRef(false);
  const localitiesLoaded = useRef(false);
  const islandsLoaded = useRef(false);
  const townsLoaded = useRef(false);
  const adminAuthoritiesLoaded = useRef(false);
  const operationalDistrictsLoaded = useRef(false);
  const appCrossRefsLoaded = useRef(false);
  const streetDescriptorsLoaded = useRef(false);
  const subLocalitiesLoaded = useRef(false);
  const postTownsLoaded = useRef(false);
  const postcodesLoaded = useRef(false);
  const wardsLoaded = useRef(false);
  const parishesLoaded = useRef(false);
  const dbAuthoritiesLoaded = useRef(false);
  const apiMetadataLoaded = useRef(false);
  const lookupMetadataLoaded = useRef(false);
  const settingsMetadataLoaded = useRef(false);
  const authorityDetailsLoaded = useRef(false);
  const propertyTemplatesLoaded = useRef(false);
  const streetTemplateLoaded = useRef(false);
  const mapLayersLoaded = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Method to fetch the lookup data.
   *
   * @param {object} lookup The lookup object.
   */
  const fetchData = async (lookup) => {
    const url = lookup.url.url;

    const setData = (id, result) => {
      switch (id) {
        case "lookupValidationMessages":
          setLookupValidationMessages(result);
          validationMessagesLoaded.current = true;
          break;

        case "lookupLocalities":
          setLookupLocalities(result);
          localitiesLoaded.current = true;
          break;

        case "lookupIslands":
          setLookupIslands(result);
          islandsLoaded.current = true;
          break;

        case "lookupTowns":
          setLookupTowns(result);
          townsLoaded.current = true;
          break;

        case "lookupAdminAuthorities":
          setLookupAdminAuthorities(result);
          adminAuthoritiesLoaded.current = true;
          break;

        case "lookupOperationalDistricts":
          setLookupOperationalDistricts(result);
          operationalDistrictsLoaded.current = true;
          break;

        case "lookupAppCrossRefs":
          setLookupAppCrossRefs(result);
          appCrossRefsLoaded.current = true;
          break;

        case "lookupStreetDescriptors":
          setLookupStreetDescriptors(result);
          streetDescriptorsLoaded.current = true;
          break;

        case "lookupSubLocalities":
          setLookupSubLocalities(result);
          subLocalitiesLoaded.current = true;
          break;

        case "lookupPostTowns":
          setLookupPostTowns(result);
          postTownsLoaded.current = true;
          break;

        case "lookupPostcodes":
          setLookupPostcodes(result);
          postcodesLoaded.current = true;
          break;

        case "lookupWards":
          setLookupWards(result);
          wardsLoaded.current = true;
          break;

        case "lookupParishes":
          setLookupParishes(result);
          parishesLoaded.current = true;
          break;

        case "lookupDbAuthorities":
          setLookupDbAuthorities(result);
          dbAuthoritiesLoaded.current = true;
          break;

        case "apiMetadata":
          setApiMetadata(result);
          apiMetadataLoaded.current = true;
          break;

        case "lookupMetadata":
          setLookupMetadata(result);
          lookupMetadataLoaded.current = true;
          break;

        case "settingsMetadata":
          setSettingsMetadata(result);
          settingsMetadataLoaded.current = true;
          break;

        case "authorityDetails":
          setAuthorityDetails(result);
          authorityDetailsLoaded.current = true;
          break;

        case "propertyTemplates":
          setPropertyTemplates(result);
          propertyTemplatesLoaded.current = true;
          break;

        case "streetTemplate":
          setStreetTemplate(result);
          streetTemplateLoaded.current = true;
          break;

        case "mapLayers":
          setMapLayers(result);
          mapLayersLoaded.current = true;
          break;

        default:
          break;
      }
    };

    await fetch(url, {
      headers: lookup.url.headers,
      crossDomain: true,
      method: "GET",
    })
      .then((response) => {
        if (response) {
          switch (response.status) {
            case 200:
              return response.json();

            case 204:
              return [];

            case 401:
              console.error("[401 ERROR] You are not authorized.", { lookup: lookup.id });
              setData(lookup.id, lookup.noRecords);
              break;

            case 500:
              console.error("[500 ERROR] Fetching data", {
                lookup: lookup.id,
                errorText: response.statusText,
                response: response,
              });
              setData(lookup.id, lookup.noRecords);
              break;

            default:
              break;
          }
        } else return response.json();
      })
      .then((result) => {
        setData(lookup.id, result);
      })
      .catch((e) => {
        // Ignore lookups that do not exist
        if (e.message !== "Unexpected end of JSON input")
          console.error("[ERROR] Fetching data", {
            lookup: lookup.id,
            error: e,
          });
        setData(lookup.id, lookup.noRecords);
      });
  };

  useEffect(() => {
    let isCancelled = false;

    /**
     * Method to load the ward and parish lookups
     */
    const LoadWardParishLookups = async () => {
      const Lookups = [
        {
          url: GetWardsForAuthorityUrl("GET", userContext.currentUser.token, Number(authorityDetails.dataProviderCode)),
          data: lookupWards,
          noRecords: [],
          id: "lookupWards",
        },
        {
          url: GetParishesForAuthorityUrl(
            "GET",
            userContext.currentUser.token,
            Number(authorityDetails.dataProviderCode)
          ),
          data: lookupParishes,
          noRecords: [],
          id: "lookupParishes",
        },
      ];

      Lookups.forEach(async (lookup) => {
        if (!isCancelled && !loadedLookups.current.includes(lookup.id)) {
          loadedLookups.current = loadedLookups.current.concat([lookup.id]);
          await fetchData(lookup);
        }
      });
    };

    /**
     * Method to load the lookups
     */
    const LoadLookups = async () => {
      const Lookups = [
        {
          url: GetValidationMessagesUrl(userContext.currentUser.token),
          data: lookupValidationMessages,
          noRecords: [],
          id: "lookupValidationMessages",
        },
        {
          url: GetLocalityUrl("GET", userContext.currentUser.token),
          data: lookupLocalities,
          noRecords: [],
          id: "lookupLocalities",
        },
        {
          url: GetTownUrl("GET", userContext.currentUser.token),
          data: lookupTowns,
          noRecords: [],
          id: "lookupTowns",
        },
        {
          url: GetIslandUrl("GET", userContext.currentUser.token),
          data: lookupIslands,
          noRecords: [],
          id: "lookupIslands",
        },
        {
          url: GetAdministrativeAreaUrl("GET", userContext.currentUser.token),
          data: lookupAdminAuthorities,
          noRecords: [],
          id: "lookupAdminAuthorities",
        },
        {
          url: GetOperationalDistrictUrl("GET", userContext.currentUser.token),
          data: lookupOperationalDistricts,
          noRecords: [],
          id: "lookupOperationalDistricts",
        },
        {
          url: GetAppCrossRefUrl("GET", userContext.currentUser.token),
          data: lookupAppCrossRefs,
          noRecords: [],
          id: "lookupAppCrossRefs",
        },
        {
          url: GetStreetDescriptorUrl("GET", userContext.currentUser.token),
          data: lookupStreetDescriptors,
          noRecords: [],
          id: "lookupStreetDescriptors",
        },
        {
          url: GetSubLocalityUrl("GET", userContext.currentUser.token),
          data: lookupSubLocalities,
          noRecords: [],
          id: "lookupSubLocalities",
        },
        {
          url: GetPostTownUrl("GET", userContext.currentUser.token),
          data: lookupPostTowns,
          noRecords: [],
          id: "lookupPostTowns",
        },
        {
          url: GetPostcodeUrl("GET", userContext.currentUser.token),
          data: lookupPostcodes,
          noRecords: [],
          id: "lookupPostcodes",
        },
        {
          url: GetDbAuthorityUrl("GET", userContext.currentUser.token),
          data: lookupDbAuthorities,
          noRecords: [],
          id: "lookupDbAuthorities",
        },
        {
          url: GetApiMetadataUrl(userContext.currentUser.token),
          data: apiMetadata,
          noRecords: {
            iManageAPIVer: "Unknown",
            iManageCoreVer: "Unknown",
            searchIndexDllVer: "Unknown",
            searchLibDllVer: "Unknown",
            iManageDBVer: "Unknown",
            iExchangeDBVer: "Unknown",
            iValidateDBVer: "Unknown",
            iManageIndexMeta: {
              dbserver: "Unknown",
              dbname: "Unknown",
              builton: "Unknown",
              elasticnugetversion: "Unknown",
            },
          },
          id: "apiMetadata",
        },
        {
          url: GetLookupMetadataUrl(userContext.currentUser.token),
          data: lookupMetadata,
          noRecords: {
            iManageAPIVer: "Unknown",
            iManageCoreVer: "Unknown",
            searchIndexDllVer: "Unknown",
            searchLibDllVer: "Unknown",
            iManageDBVer: "Unknown",
            iExchangeDBVer: "Unknown",
            iValidateDBVer: "Unknown",
            iManageIndexMeta: {
              dbserver: "Unknown",
              dbname: "Unknown",
              builton: "Unknown",
              elasticnugetversion: "Unknown",
            },
          },
          id: "lookupMetadata",
        },
        {
          url: GetSettingsMetadataUrl(userContext.currentUser.token),
          data: settingsMetadata,
          noRecords: {
            iManageAPIVer: "Unknown",
            iManageCoreVer: "Unknown",
            searchIndexDllVer: "Unknown",
            searchLibDllVer: "Unknown",
            iManageDBVer: "Unknown",
            iExchangeDBVer: "Unknown",
            iValidateDBVer: "Unknown",
            iManageIndexMeta: {
              dbserver: "Unknown",
              dbname: "Unknown",
              builton: "Unknown",
              elasticnugetversion: "Unknown",
            },
          },
          id: "settingsMetadata",
        },
        {
          url: GetAuthorityDetailsUrl("GET", userContext.currentUser.token),
          data: authorityDetails,
          noRecords: {
            dataProviderCode: null,
            userOrgName: null,
            minUsrn: 0,
            maxUsrn: 0,
            minUprn: 0,
            maxUprn: 0,
            msaLicenceNumber: null,
            streetBlpu: true,
            minEsuId: 0,
            maxEsuId: 0,
            displayLanguage: "ENG",
            uppercase: false,
            databaseDescription: null,
            tabText: "iManage Cloud",
          },
          id: "authorityDetails",
        },
        {
          url: GetPropertyTemplatesUrl("GET", userContext.currentUser.token),
          data: propertyTemplates,
          noRecords: [],
          id: "propertyTemplates",
        },
        {
          url: GetStreetTemplateUrl("GET", userContext.currentUser.token),
          data: streetTemplate,
          noRecords: {},
          id: "streetTemplate",
        },
        {
          url: GetMapLayersUrl("GET", userContext.currentUser.token),
          data: mapLayers,
          noRecords: [],
          id: "mapLayers",
        },
      ];

      Lookups.forEach(async (lookup) => {
        if (!isCancelled && !loadedLookups.current.includes(lookup.id)) {
          loadedLookups.current = loadedLookups.current.concat([lookup.id]);
          await fetchData(lookup);
        }
      });
    };

    if (!isLoaded) {
      LoadLookups();

      // We can only load the ward and parish lookups once we have the authority code
      if (authorityDetailsLoaded.current) LoadWardParishLookups();
    }

    const lookupsAreLoaded =
      validationMessagesLoaded.current &&
      localitiesLoaded.current &&
      townsLoaded.current &&
      islandsLoaded.current &&
      adminAuthoritiesLoaded.current &&
      operationalDistrictsLoaded.current &&
      appCrossRefsLoaded.current &&
      streetDescriptorsLoaded.current &&
      subLocalitiesLoaded.current &&
      postTownsLoaded.current &&
      postcodesLoaded.current &&
      wardsLoaded.current &&
      parishesLoaded.current &&
      dbAuthoritiesLoaded.current &&
      apiMetadataLoaded.current &&
      lookupMetadataLoaded.current &&
      settingsMetadataLoaded.current &&
      propertyTemplatesLoaded.current &&
      streetTemplateLoaded.current &&
      authorityDetailsLoaded.current;

    if (lookupsAreLoaded && !isLoaded) {
      lookupsContext.onLookupChange(
        lookupValidationMessages,
        lookupLocalities,
        lookupTowns,
        lookupIslands,
        lookupAdminAuthorities,
        lookupOperationalDistricts,
        lookupAppCrossRefs,
        lookupSubLocalities,
        lookupStreetDescriptors,
        lookupPostTowns,
        lookupPostcodes,
        lookupWards,
        lookupParishes,
        lookupDbAuthorities
      );

      lookupsContext.onMetadataChange(
        apiMetadata.iManageAPIVer,
        apiMetadata.iManageCoreVer,
        lookupMetadata.iManageAPIVer,
        settingsMetadata.iManageAPIVer,
        apiMetadata.iManageDBVer,
        apiMetadata.iExchangeDBVer,
        apiMetadata.iValidateDBVer,
        apiMetadata.iManageIndexMeta
      );

      settingsContext.onAuthorityDetailsChange(authorityDetails);

      settingsContext.onPropertyTemplatesChange(propertyTemplates);

      settingsContext.onStreetTemplateChange(streetTemplate);

      if (mapLayers) {
        settingsContext.onMapLayersChange(mapLayers);
      }

      setIsLoaded(true);
    }

    return () => {
      isCancelled = true;
    };
  }, [
    isLoaded,
    lookupValidationMessages,
    lookupLocalities,
    lookupTowns,
    lookupIslands,
    lookupAdminAuthorities,
    lookupOperationalDistricts,
    lookupAppCrossRefs,
    lookupStreetDescriptors,
    lookupSubLocalities,
    lookupPostTowns,
    lookupPostcodes,
    lookupWards,
    lookupParishes,
    lookupDbAuthorities,
    apiMetadata,
    lookupMetadata,
    settingsMetadata,
    authorityDetails,
    propertyTemplates,
    streetTemplate,
    mapLayers,
    lookupsContext,
    settingsContext,
    userContext,
  ]);

  return isLoaded ? (
    <ADSHomepageControl />
  ) : (
    <div>
      <Backdrop open={!isLoaded}>
        Loading data, please wait...
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default HomePage;
