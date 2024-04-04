/* #region header */
/**************************************************************************************************
//
//  Description: The main application file used for contexts etc.
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   16.08.22 Sean Flook         WI39??? Initial Revision.
//    002   16.03.23 Sean Flook         WI40583 Correctly set/reset propertyErrors.
//    003   28.03.23 Sean Flook         WI40632 Added source to HandleWizardDone.
//    004   29.03.23 Sean Flook         WI40634 Do not prevent the map extent from being set due to zoom level.
//    005   06.04.23 Sean Flook         WI40610 Include parentUprn in HandlePropertyValidateData.
//    006   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    007            Sean Flook                 Added newRecord parameter to the HandleStreetRecordChange function.
//    008   17.08.23 Sean Flook       IMANN-156 Modified to allow the login dialog to be displayed again after user has clicked cancel.
//    009   23.08.23 Sean Flook       IMANN-159 Use the new street template structure.
//    010   07.09.23 Sean Flook                 Added code to handle ESU maintenance.
//    011   20.09.23 Sean Flook                 Handle OneScotland specific records types.
//    012   10.10.23 Sean Flook       IMANN-163 Changes required to correctly handle opening the related tab after the property wizard has run.
//    013   12.10.23 Sean Flook                 Added code to deal with storing the expanded ESU and ASD items.
//    014   12.10.23 Sean Flook                 Reset the ESU and ASD list when resetting the street.
//    015   03.11.23 Sean Flook       IMANN-175 Changes required to select properties from the map.
//    016   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    017   20.11.23 Sean Flook                 Removed unwanted code.
//    018   24.11.23 Sean Flook                 Renamed successor to successorCrossRef.
//    019   01.12.23 Sean Flook       IMANN-194 Added HandleUpdateLookup to enable updating a single lookup type.
//    020   14.12.23 Sean Flook                 Corrected note record type and tidied up validation code.
//    021   19.12.23 Sean Flook                 Various bug fixes.
//    022   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    023   05.01.24 Sean Flook                 Use CSS shortcuts.
//    024   10.01.24 Sean Flook       IMANN-163 Added previousStreet and previousProperty.
//    025   12.01.24 Sean Flook       IMANN-163 Search results should be an array.
//    026   25.01.24 Sean Flook                 Changes required after UX review.
//    027   26.01.24 Sean Flook       IMANN-251 Only check why in HandleLeavingStreet.
//    028   05.02.24 Sean Flook                 Further changes required for operational districts.
//    029   13.02.24 Sean Flook                 Pass the authorityCode to ValidatePublicRightOfWayData.
//    030   14.02.24 Sean Flook        ASD10_GP Changes required to filter the ASD map layers when editing a record.
//    031   20.02.24 Sean Flook            MUL1 Changes required for handling selecting properties from the map.
//    032   26.02.24 Joel Benford     IMANN-242 Add DbAuthority to lookups context
//    033   27.02.24 Sean Flook           MUL16 Added ability too hide the search control.
//    034   05.03.24 Sean Flook       IMANN-338 Store the last opened street and property tab.
//    035   08.03.24 Sean Flook       IMANN-348 If clearing ESU from sandbox ensure highway dedication and one way exemption are also cleared.
//    036   11.03.24 Sean Flook           GLB12 Use appBarHeight to set the height of the control.
//    037   13.03.24 Sean Flook            MUL9 Changes required to enable related refresh.
//    038   04.04.24 Sean Flook                 Added navigate back and leaving a property.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, Fragment } from "react";
import { Router } from "react-router-dom";
import ADSAppBar from "./components/ADSAppBar";
import ADSNavContent from "./components/ADSNavContent";
import history from "./history";
import PageRouting from "./PageRouting";
import userContext from "./context/userContext";
import LookupContext from "./context/lookupContext";
import SearchContext from "./context/searchContext";
import FilterContext from "./context/filterContext";
import SettingsContext from "./context/settingsContext";
import StreetContext from "./context/streetContext";
import PropertyContext from "./context/propertyContext";
import MapContext from "./context/mapContext";
import SandboxContext from "./context/sandboxContext";
import InformationContext from "./context/informationContext";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  GetBackgroundStreetsUrl,
  GetUnassignedEsusUrl,
  GetBackgroundPropertiesUrl,
  GetPropertyFromUPRNUrl,
} from "./configuration/ADSConfig";
import { stringToSentenceCase, mapSelectSearchString, mergeArrays } from "./utils/HelperUtils";
import {
  ValidateStreetData,
  ValidateDescriptorData,
  ValidateEsuData,
  ValidateOneWayExemptionData,
  ValidateHighwayDedicationData,
  ValidateStreetSuccessorCrossRefData,
  ValidateMaintenanceResponsibilityData,
  ValidateReinstatementCategoryData,
  ValidateOSSpecialDesignationData,
  ValidateInterestData,
  ValidateConstructionData,
  ValidateSpecialDesignationData,
  ValidateHeightWidthWeightData,
  ValidatePublicRightOfWayData,
  ValidateStreetNoteData,
} from "./utils/StreetValidation";
import {
  ValidateBlpuData,
  ValidateLpiData,
  ValidateProvenanceData,
  ValidateCrossRefData,
  ValidateClassificationData,
  ValidateOrganisationData,
  ValidateSuccessorCrossRefData,
  ValidatePropertyNoteData,
} from "./utils/PropertyValidation";
import LoginDialog from "./dialogs/LoginDialog";
import DETRCodes from "./data/DETRCodes";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ThemeProvider, StyledEngineProvider, createTheme } from "@mui/material/styles";
import StylesProvider from "@mui/styles/StylesProvider";
import { SaveConfirmationServiceProvider } from "./pages/SaveConfirmationPage";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";
import { appBarHeight } from "./utils/ADSStyles";

function App() {
  const theme = createTheme();
  const [currentUser, setCurrentUser] = useState(null);

  const [loginOpen, setLoginOpen] = useState(true);

  const currentMapExtent = useRef(null);

  const guiVersion = "0.0.0.12";

  const [lookups, setLookups] = useState({
    validationMessages: [],
    localities: [],
    towns: [],
    islands: [],
    adminAuthorities: [],
    operationalDistricts: [],
    appCrossRefs: [],
    subLocalities: [],
    streetDescriptors: [],
    postTowns: [],
    postcodes: [],
    wards: [],
    parishes: [],
    dbAuthorities: [],
  });

  const [metadata, setMetadata] = useState(null);

  const [districtUpdated, setDistrictUpdated] = useState(false);

  const [sandbox, setSandbox] = useState({
    sourceStreet: null,
    currentStreet: null,
    sourceProperty: null,
    currentProperty: null,
    currentStreetRecords: {
      streetDescriptor: null,
      esu: null,
      highwayDedication: null,
      oneWayExemption: null,
      successorCrossRef: null,
      maintenanceResponsibility: null,
      reinstatementCategory: null,
      osSpecialDesignation: null,
      interest: null,
      construction: null,
      specialDesignation: null,
      hww: null,
      prow: null,
      note: null,
    },
    currentPropertyRecords: {
      lpi: null,
      appCrossRef: null,
      provenance: null,
      classification: null,
      organisation: null,
      successorCrossRef: null,
      note: null,
    },
    streetTab: 0,
    propertyTab: 0,
  });

  const [refreshRelated, setRefreshRelated] = useState(false);

  const [searchData, setSearchData] = useState({
    searchString: "",
    results: [],
  });

  const [previousSearchData, setPreviousSearchData] = useState({
    searchString: searchData.searchString,
    results: searchData.results,
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [hideSearch, setHideSearch] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);

  const [searchFilter, setSearchFilter] = useState({});

  const [settingsNode, setSettingsNode] = useState({});

  const [authorityDetails, setAuthorityDetails] = useState({
    userOrgName: null,
    dataProviderCode: 6815,
    msaLicenceNumber: null,
    tabText: null,
    minusrn: 0,
    maxusrn: 0,
    minuprn: 0,
    maxuprn: 0,
    minesuId: 0,
    maxesuId: 0,
    streetBlpu: false,
    displayLanguage: "ENG",
  });

  const [authorityCode, setAuthorityCode] = useState(0);

  const [authorityName, setAuthorityName] = useState("");

  const [isScottish, setIsScottish] = useState(false);

  const [isWelsh, setIsWelsh] = useState(false);

  const [propertyTemplates, setPropertyTemplates] = useState([]);

  const [streetTemplate, setStreetTemplate] = useState({
    pkId: 1,
    templateName: "Street template",
    templateDescription: "Set default lookup values for streets.",
    templateType: 0,
    templateUseType: 0,
    numberingSystem: 0,
    constructionTemplate: null,
    esuTemplate: null,
    heightWidthWeightTemplate: null,
    interestTemplate: null,
    publicRightOfWayTemplate: null,
    scoEsuTemplate: null,
    scoMaintenanceResponsibilityTemplate: null,
    scoReinstatementCategoryTemplate: null,
    scoSpecialDesignationTemplate: null,
    specialDesignationTemplate: null,
    streetTemplate: null,
  });

  const [mapLayers, setMapLayers] = useState(null);

  const [street, setStreet] = useState({
    usrn: 0,
    descriptor: "",
    newStreet: false,
    openRelated: null,
  });

  const previousStreet = useRef({
    usrn: 0,
    descriptor: "",
    newStreet: false,
    openRelated: null,
  });

  const [streetErrors, setStreetErrors] = useState({
    street: [],
    descriptor: [],
    esu: [],
    highwayDedication: [],
    oneWayExemption: [],
    successorCrossRef: [],
    interest: [],
    maintenanceResponsibility: [],
    reinstatementCategory: [],
    osSpecialDesignation: [],
    construction: [],
    specialDesignation: [],
    heightWidthWeight: [],
    publicRightOfWay: [],
    note: [],
  });

  const [creatingStreet, setCreatingStreet] = useState(false);

  const [streetHasErrors, setStreetHasErrors] = useState(false);

  const [leavingStreet, setLeavingStreet] = useState(null);

  const [streetModified, setStreetModified] = useState(false);

  const [streetClosing, setStreetClosing] = useState(false);

  const [streetGoToField, setStreetGoToField] = useState(null);

  const [streetRecord, setStreetRecord] = useState({ type: 11, id: null, index: null });

  const [esuDataChanged, setEsuDataChanged] = useState(false);

  const [selectedMapEsuId, setSelectedMapEsuId] = useState(null);
  const [mergedEsus, setMergedEsus] = useState(null);
  const [unassignEsus, setUnassignEsus] = useState(null);
  const [assignEsu, setAssignEsu] = useState(null);
  const [assignEsus, setAssignEsus] = useState(null);
  const [createEsus, setCreateEsus] = useState(null);
  const [esuDividedMerged, setEsuDividedMerged] = useState(false);
  const [expandedEsu, setExpandedEsu] = useState([]);
  const [expandedAsd, setExpandedAsd] = useState([]);

  const [property, setProperty] = useState({
    uprn: 0,
    usrn: 0,
    address: "",
    formatAddress: "",
    postcode: "",
    easting: 0,
    northing: 0,
    newProperty: false,
    parent: null,
    openRelated: null,
  });

  const previousProperty = useRef({
    uprn: 0,
    usrn: 0,
    address: "",
    formatAddress: "",
    postcode: "",
    easting: 0,
    northing: 0,
    newProperty: false,
    parent: null,
    openRelated: null,
  });

  const [propertyErrors, setPropertyErrors] = useState({
    blpu: [],
    lpi: [],
    provenance: [],
    crossRef: [],
    classification: [],
    organisation: [],
    successorCrossRef: [],
    note: [],
  });

  const [propertyHasErrors, setPropertyHasErrors] = useState(false);

  const [leavingProperty, setLeavingProperty] = useState(null);

  const [propertyModified, setPropertyModified] = useState(false);

  const [logicalStatus, setLogicalStatus] = useState(null);

  const [propertyGoToField, setPropertyGoToField] = useState(null);

  const [propertyRecord, setPropertyRecord] = useState({
    type: 21,
    index: null,
  });

  const [provenanceDataChanged, setProvenanceDataChanged] = useState(false);

  const [wizardData, setWizardData] = useState(null);

  const [backgroundData, setBackgroundData] = useState({
    streets: [],
    unassignedEsus: [],
    properties: [],
  });

  const [mapSearchData, setMapSearchData] = useState({
    streets: [],
    properties: [],
    editStreet: null,
    editProperty: null,
  });

  const [sourceMapSearchData, setSourceMapSearchData] = useState({
    streets: [],
    properties: [],
  });

  const [map, setMap] = useState({
    // backgroundStreets: [],
    // backgroundProperties: [],
    // searchStreets: [],
    // searchProperties: [],
    extents: [],
    // editStreet: null,
    // editProperty: null,
    zoomStreet: null,
    zoomProperty: null,
  });

  const [editObject, setEditObject] = useState(null);

  const [mapProperty, setMapProperty] = useState(null);

  const [mapStreet, setMapStreet] = useState(null);

  const [mapExtent, setMapExtent] = useState(null);

  const [highlight, setHighlight] = useState({
    street: null,
    esu: null,
    asd51: null,
    asd52: null,
    asd53: null,
    asd61: null,
    asd62: null,
    asd63: null,
    asd64: null,
    asd66: null,
    property: null,
    selectProperties: null,
    extent: null,
  });

  const [mapPropertyPin, setMapPropertyPin] = useState(null);
  const [mapStreetStart, setMapStreetStart] = useState(null);
  const [mapStreetEnd, setMapStreetEnd] = useState(null);
  const [mapDivideEsu, setMapDivideEsu] = useState(null);
  const [mapLineGeometry, setMapLineGeometry] = useState(null);
  const [mapPolygonGeometry, setMapPolygonGeometry] = useState(null);
  const [wizardPoint, setWizardPoint] = useState(null);
  const [selectingProperties, setSelectingProperties] = useState(false);

  const [pointCaptureMode, setPointCaptureMode] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const pointCaptureModeRef = useRef(null);
  const editObjectRef = useRef(null);

  const [informationType, setInformationType] = useState(null);
  const [informationSource, setInformationSource] = useState(null);

  /**
   * Event to handle when the user changes.
   *
   * @param {object} userInfo The users information.
   */
  function HandleUserChange(userInfo) {
    if (userInfo) {
      const user = {
        ...userInfo,
        canEdit: userInfo.active && (userInfo.rights.includes("Administrator") || userInfo.rights.includes("User")),
        isAdministrator: userInfo.active && userInfo.rights.includes("Administrator"),
      };

      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }

    if (loginOpen) setLoginOpen(false);
  }

  /**
   * Event to handle displaying the login dialog.
   */
  function HandleDisplayLogin() {
    setLoginOpen(true);
  }

  /**
   * Event to handle when the lookups change.
   *
   * @param {array} validationMessages The list of validation messages.
   * @param {array} localities The list of localities.
   * @param {array} towns The list of towns.
   * @param {array} islands The list of islands (OneScotland only)
   * @param {array} adminAuthorities The list of administrative authorities
   * @param {array} operationalDistricts The list of operational districts (GeoPlace only)
   * @param {array} appCrossRefs  The list of application cross references
   * @param {array} subLocalities The list of sub-localities (OneScotland only)
   * @param {array} streetDescriptors The list of street descriptors
   * @param {array} postTowns The list of post towns.
   * @param {array} postcodes The list of postcodes.
   * @param {array} wards The list of wards (GeoPlace only).
   * @param {array} parishes The list of parishes (GeoPlace only).
   * @param {array} dbAuthorities The list of dbAuthorities.
   */
  function HandleLookupChange(
    validationMessages,
    localities,
    towns,
    islands,
    adminAuthorities,
    operationalDistricts,
    appCrossRefs,
    subLocalities,
    streetDescriptors,
    postTowns,
    postcodes,
    wards,
    parishes,
    dbAuthorities
  ) {
    setLookups({
      validationMessages: validationMessages,
      localities: localities,
      towns: towns,
      islands: islands,
      adminAuthorities: adminAuthorities,
      operationalDistricts: operationalDistricts,
      appCrossRefs: appCrossRefs,
      subLocalities: subLocalities,
      streetDescriptors: streetDescriptors,
      postTowns: postTowns,
      postcodes: postcodes,
      wards: wards,
      parishes: parishes,
      dbAuthorities: dbAuthorities,
    });
  }

  /**
   * Event to handle when a lookup is updated.
   *
   * @param {string} variant The type of lookup that is being updated ["validationMessage", "locality", "town", "island", "administrativeArea", "operationalDistrict", "crossReference", "subLocality", "streetDescriptor", "postTown", "postcode", "ward", "parish", "dbAuthority"]
   * @param {Array} newLookups The updated list of lookups.
   */
  function HandleUpdateLookup(variant, newLookups) {
    setLookups({
      validationMessages: variant === "validationMessage" ? newLookups : lookups.validationMessages,
      localities: variant === "locality" ? newLookups : lookups.localities,
      towns: variant === "town" ? newLookups : lookups.towns,
      islands: variant === "island" ? newLookups : lookups.islands,
      adminAuthorities: variant === "administrativeArea" ? newLookups : lookups.adminAuthorities,
      operationalDistricts: variant === "operationalDistrict" ? newLookups : lookups.operationalDistricts,
      appCrossRefs: variant === "crossReference" ? newLookups : lookups.appCrossRefs,
      subLocalities: variant === "subLocality" ? newLookups : lookups.subLocalities,
      streetDescriptors: variant === "streetDescriptor" ? newLookups : lookups.streetDescriptors,
      postTowns: variant === "postTown" ? newLookups : lookups.postTowns,
      postcodes: variant === "postcode" ? newLookups : lookups.postcodes,
      wards: variant === "ward" ? newLookups : lookups.wards,
      parishes: variant === "parish" ? newLookups : lookups.parishes,
      dbAuthorities: variant === "dbAuthority" ? newLookups : lookups.dbAuthorities,
    });
  }

  /**
   * Event to handle when the metadata version information changes.
   *
   * @param {object} apiVersion The version information from the API
   * @param {object} coreVersion The version information from the core API
   * @param {object} lookupVersion The version information from the lookup API
   * @param {object} settingsVersion The version information from the settings API
   * @param {object} iManageDbVersion The version of the iManage database.
   * @param {object} iExchangeDbVersion The version of the iExchange database.
   * @param {object} iValidateDbVersion The version of the iValidate database.
   * @param {object} iManageIndexMeta The version information for the elastic index.
   */
  function HandleMetadataChange(
    apiVersion,
    coreVersion,
    lookupVersion,
    settingsVersion,
    iManageDbVersion,
    iExchangeDbVersion,
    iValidateDbVersion,
    iManageIndexMeta
  ) {
    setMetadata({
      guiVersion: guiVersion,
      apiVersion: apiVersion ? apiVersion : "unknown",
      coreVersion: coreVersion ? coreVersion : "unknown",
      lookupVersion: lookupVersion ? lookupVersion : "unknown",
      settingsVersion: settingsVersion ? settingsVersion : "unknown",
      iManageDbVersion: iManageDbVersion ? iManageDbVersion : "unknown",
      iExchangeDbVersion: iExchangeDbVersion ? iExchangeDbVersion : "unknown",
      iValidateDbVersion: iValidateDbVersion ? iValidateDbVersion : "unknown",
      indexDBServer: iManageIndexMeta ? iManageIndexMeta.dbserver : "unknown",
      indexDBName: iManageIndexMeta ? iManageIndexMeta.dbname : "unknown",
      indexBuiltOn: iManageIndexMeta ? iManageIndexMeta.builton : "unknown",
      indexElasticVersion: iManageIndexMeta ? iManageIndexMeta.elasticnugetversion : "unknown",
    });
  }

  /**
   * Event to handle when an operational district record has been updated.
   *
   * @param {boolean} updated If true the operational district record has been updated.
   */
  function HandleDistrictUpdated(updated) {
    setDistrictUpdated(updated);
  }

  /**
   * Event to handle when the sandbox data needs to be changed.
   *
   * @param {string} type The type of data that is being changed.
   * @param {object} updatedData The updated data object.
   */
  function HandleSandboxChange(type, updatedData) {
    const newSandbox = {
      sourceStreet: type === "sourceStreet" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.sourceStreet,
      currentStreet: type === "currentStreet" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreet,
      sourceProperty: type === "sourceProperty" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.sourceProperty,
      currentProperty: type === "currentProperty" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentProperty,
      currentStreetRecords: {
        streetDescriptor:
          type === "streetDescriptor"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.streetDescriptor,
        esu: type === "esu" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreetRecords.esu,
        highwayDedication:
          type === "highwayDedication" || (type === "esu" && !updatedData)
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.highwayDedication,
        oneWayExemption:
          type === "oneWayExemption" || (type === "esu" && !updatedData)
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.oneWayExemption,
        successorCrossRef:
          type === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.successorCrossRef,
        maintenanceResponsibility:
          type === "maintenanceResponsibility"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.maintenanceResponsibility,
        reinstatementCategory:
          type === "reinstatementCategory"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.reinstatementCategory,
        osSpecialDesignation:
          type === "osSpecialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.osSpecialDesignation,
        interest: type === "interest" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreetRecords.interest,
        construction:
          type === "construction" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreetRecords.construction,
        specialDesignation:
          type === "specialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentStreetRecords.specialDesignation,
        hww: type === "hww" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreetRecords.hww,
        prow: type === "prow" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreetRecords.prow,
        note: type === "streetNote" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentStreetRecords.note,
      },
      currentPropertyRecords: {
        lpi: type === "lpi" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentPropertyRecords.lpi,
        appCrossRef:
          type === "appCrossRef" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentPropertyRecords.appCrossRef,
        provenance:
          type === "provenance" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentPropertyRecords.provenance,
        classification:
          type === "classification"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentPropertyRecords.classification,
        organisation:
          type === "organisation"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentPropertyRecords.organisation,
        successorCrossRef:
          type === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandbox.currentPropertyRecords.successorCrossRef,
        note: type === "propertyNote" ? JSON.parse(JSON.stringify(updatedData)) : sandbox.currentPropertyRecords.note,
      },
      streetTab: sandbox.streetTab,
      propertyTab: sandbox.propertyTab,
    };
    setSandbox(newSandbox);
  }

  /**
   * Event to handle when the sandbox data needs to be changed and then clear other data.
   *
   * @param {string} updateType The type of data that is being changed.
   * @param {object} updatedData The updated data object.
   * @param {string} clearType The data that needs to be cleared after the sandbox data has been updated.
   */
  function HandleSandboxUpdateAndClear(updateType, updatedData, clearType) {
    const newSandbox = {
      sourceStreet:
        updateType === "sourceStreet"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["sourceStreet", "allProperty"].includes(clearType)
          ? null
          : sandbox.sourceStreet,
      currentStreet:
        updateType === "currentStreet"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["currentStreet", "allProperty", "allStreet"].includes(clearType)
          ? null
          : sandbox.currentStreet,
      sourceProperty:
        updateType === "sourceProperty"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["sourceProperty", "allStreet"].includes(clearType)
          ? null
          : sandbox.sourceProperty,
      currentProperty:
        updateType === "currentProperty"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["currentProperty", "allProperty", "allStreet"].includes(clearType)
          ? null
          : sandbox.currentProperty,
      currentStreetRecords: {
        streetDescriptor:
          updateType === "streetDescriptor"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["streetDescriptor", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.streetDescriptor,
        esu:
          updateType === "esu"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["esu", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.esu,
        highwayDedication:
          updateType === "highwayDedication"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["esu", "highwayDedication", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.highwayDedication,
        oneWayExemption:
          updateType === "oneWayExemption"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["esu", "oneWayExemption", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.oneWayExemption,
        successorCrossRef:
          updateType === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["successorCrossRef", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.successorCrossRef,
        maintenanceResponsibility:
          updateType === "maintenanceResponsibility"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["maintenanceResponsibility", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.maintenanceResponsibility,
        reinstatementCategory:
          updateType === "reinstatementCategory"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["reinstatementCategory", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.reinstatementCategory,
        osSpecialDesignation:
          updateType === "osSpecialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["osSpecialDesignation", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.osSpecialDesignation,
        interest:
          updateType === "interest"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["interest", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.interest,
        construction:
          updateType === "construction"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["construction", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.construction,
        specialDesignation:
          updateType === "specialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["specialDesignation", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.specialDesignation,
        hww:
          updateType === "hww"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["hww", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.hww,
        prow:
          updateType === "prow"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["prow", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.prow,
        note:
          updateType === "streetNote"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["streetNote", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentStreetRecords.note,
      },
      currentPropertyRecords: {
        lpi:
          updateType === "lpi"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["lpi", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.lpi,
        appCrossRef:
          updateType === "appCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["appCrossRef", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.appCrossRef,
        provenance:
          updateType === "provenance"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["provenance", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.provenance,
        classification:
          updateType === "classification"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["classification", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.classification,
        organisation:
          updateType === "organisation"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["organisation", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.organisation,
        successorCrossRef:
          updateType === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["successorCrossRef", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.successorCrossRef,
        note:
          updateType === "propertyNote"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["propertyNote", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandbox.currentPropertyRecords.note,
      },
      streetTab: sandbox.streetTab,
      propertyTab: sandbox.propertyTab,
    };
    setSandbox(newSandbox);
  }

  /**
   * Event to handle when the tab changes on the street form.
   *
   * @param {number} newValue The new tab value
   */
  function HandleStreetTabChange(newValue) {
    const updatedSandbox = {
      sourceStreet: sandbox.sourceStreet,
      currentStreet: sandbox.currentStreet,
      sourceProperty: sandbox.sourceProperty,
      currentProperty: sandbox.currentProperty,
      currentStreetRecords: sandbox.currentStreetRecords,
      currentPropertyRecords: sandbox.currentPropertyRecords,
      streetTab: newValue,
      propertyTab: sandbox.propertyTab,
    };
    setSandbox(updatedSandbox);
  }

  /**
   * Event to handle when the tab changes on the property form.
   *
   * @param {number} newValue The new tab value
   */
  function HandlePropertyTabChange(newValue) {
    const updatedSandbox = {
      sourceStreet: sandbox.sourceStreet,
      currentStreet: sandbox.currentStreet,
      sourceProperty: sandbox.sourceProperty,
      currentProperty: sandbox.currentProperty,
      currentStreetRecords: sandbox.currentStreetRecords,
      currentPropertyRecords: sandbox.currentPropertyRecords,
      streetTab: sandbox.streetTab,
      propertyTab: newValue,
    };
    setSandbox(updatedSandbox);
  }

  /**
   * Event to handle the resetting of the data in the sandbox.
   *
   * @param {string} sourceType The type of data that is being reset in the sandbox.
   */
  function HandleResetSandbox(sourceType) {
    const resetSandbox = {
      sourceStreet: sourceType !== "street" ? null : sandbox.sourceStreet,
      currentStreet: null,
      sourceProperty: sourceType !== "property" ? null : sandbox.sourceProperty,
      currentProperty: null,
      currentStreetRecords: {
        streetDescriptor: null,
        esu: null,
        highwayDedication: null,
        oneWayExemption: null,
        successorCrossRef: null,
        maintenanceResponsibility: null,
        reinstatementCategory: null,
        osSpecialDesignation: null,
        interest: null,
        construction: null,
        specialDesignation: null,
        hww: null,
        prow: null,
        note: null,
      },
      currentPropertyRecords: {
        lpi: null,
        appCrossRef: null,
        provenance: null,
        classification: null,
        organisation: null,
        successorCrossRef: null,
        note: null,
      },
      streetTab: !["street", "property"].includes(sourceType) ? 0 : sandbox.streetTab,
      propertyTab: !["street", "property"].includes(sourceType) ? 0 : sandbox.propertyTab,
    };
    setSandbox(resetSandbox);
  }

  /**
   * Event to handle refreshing the related data.
   *
   * @param {boolean} refresh True if the related data needs to be refreshed; otherwise false.
   */
  function HandleRefreshRelated(refresh) {
    setRefreshRelated(refresh);
  }

  /**
   * Event to handle when the search data has been changed.
   *
   * @param {string} searchString The search string that was used to perform the search.
   * @param {array} data The data that has been returned by the search.
   */
  function HandleSearchDataChange(searchString, data) {
    setPreviousSearchData({
      searchString: searchData.searchString,
      results: searchData.results,
    });
    setSearchData({ searchString: searchString, results: data });
  }

  /**
   * Event to handle when properties have been selected from the map.
   *
   * @param {string} action The action that needs to be done with the data.
   * @param {Array} uprns Array of the UPRNs that have been selected.
   * @param {Array} data The data that has been returned by the search.
   */
  function HandlePropertiesSelected(action, uprns, data) {
    const newMapSearchProperties = backgroundData.properties
      .filter((x) => uprns.includes(x.uprn))
      .map((x) => {
        return {
          address: x.address.replaceAll("\r\n", " "),
          classificationCode: x.blpuClass,
          easting: x.easting,
          formattedAddress: x.address,
          logicalStatus: x.logicalStatus,
          northing: x.northing,
          postcode: x.postcode,
          uprn: x.uprn.toString(),
        };
      });

    switch (action) {
      case "new":
        HandleSearchDataChange(mapSelectSearchString, data);
        HandleMapSearchDataChange(null, newMapSearchProperties, null, null);
        break;

      case "existing":
        const newSearchData = mergeArrays(searchData.results, data, (a, b) => a.id === b.id);
        HandleSearchDataChange(mapSelectSearchString, newSearchData);
        const newExistingMapSearchProperties = mergeArrays(
          mapSearchData.properties,
          newMapSearchProperties,
          (a, b) => a.uprn === b.uprn
        );
        HandleMapSearchDataChange(null, newExistingMapSearchProperties, null, null);
        break;

      default:
        break;
    }
  }

  /**
   * Event to handle the changing of the state of the search dropdown.
   *
   * @param {boolean} open True if the search dropdown is being displayed; otherwise false.
   */
  function HandleSearchOpenChange(open) {
    setSearchOpen(open);
  }

  /**
   * Event to handle when the search control needs to be hidden.
   *
   * @param {boolean} hide True if the search control should be hidden; otherwise false.
   */
  function HandleHideSearch(hide) {
    setHideSearch(hide);
  }

  /**
   * Event to handle when we need to navigate back a page.
   *
   * @param {boolean} goBack True if we need to navigate back a page; otherwise false.
   */
  function HandleNavigateBack(goBack) {
    setNavigateBack(goBack);
  }

  /**
   * Event to handle when the search filter data changes.
   *
   * @param {object} filterData The data used to filter the search.
   */
  function HandleSearchFilterChange(filterData) {
    setSearchFilter(filterData);
  }

  /**
   * Event to handle when the settings node changes.
   *
   * @param {number} nodeId The id of the node.
   */
  function HandleNodeChange(nodeId) {
    setSettingsNode(nodeId);
  }

  /**
   * Event to handle when the authority details change.
   *
   * @param {object} details The authority details.
   */
  function HandleAuthorityDetailsChange(details) {
    setAuthorityDetails(details);

    if (details) {
      const authority = Number(details.dataProviderCode);
      setAuthorityCode(authority);
      const authorityRecord = DETRCodes.find((x) => x.id === authority);
      if (authorityRecord) setAuthorityName(stringToSentenceCase(authorityRecord.text));
      else setAuthorityName("");
      setIsScottish(authority >= 9000 && authority <= 9999 && authority !== 9904);
      setIsWelsh(authority >= 6000 && authority <= 6999);
      if (details.tabText) {
        if (details.tabText !== document.title) document.title = details.tabText;
      } else {
        if (authorityRecord) document.title = `iManage Cloud (${stringToSentenceCase(authorityRecord.text)})`;
        else document.title = "iManage Cloud";
      }
    } else {
      setAuthorityCode(0);
      setAuthorityName("");
      setIsScottish(false);
      setIsWelsh(false);
      document.title = "iManage Cloud";
    }
  }

  /**
   * Event to handle when the array of property templates change.
   *
   * @param {array} templates Array of property templates.
   */
  function HandlePropertyTemplatesChange(templates) {
    setPropertyTemplates(templates);
  }

  /**
   * Event to handle when the street template changes.
   *
   * @param {object} template The street template.
   */
  function HandleStreetTemplateChange(template) {
    setStreetTemplate(template);
  }

  /**
   * Event to handle when the array of map layers have changed.
   *
   * @param {array} data The list of map layers to be used by the application.
   */
  function HandleMapLayersChange(data) {
    setMapLayers(data);
  }

  /**
   * Event to handle when the current street data has changed.
   *
   * @param {number} usrn The USRN of the street.
   * @param {string} descriptor The descriptor for the street.
   * @param {boolean} newStreet True if this is a new street; otherwise false.
   * @param {number|null} [openRelated=null] If present it contains the USRN of the street that we need the the related tab opened.
   */
  function HandleStreetChange(usrn, descriptor, newStreet, openRelated = null) {
    setStreet({
      usrn: usrn,
      descriptor: descriptor,
      newStreet: newStreet,
      openRelated: openRelated ? openRelated : street.openRelated,
    });

    if (usrn && usrn > 0) history.push(`/street/${usrn}`);
    else if (newStreet) {
      setCreatingStreet(true);
      history.push("/street/0");
    }
  }

  /**
   * Method to clear the street creating flag.
   */
  function HandleStreetCreated() {
    setCreatingStreet(false);
  }

  /**
   * Event to handle when the street is closed.
   *
   * @param {boolean} closing True if the current street is being closed; otherwise false.
   */
  function HandleCloseStreet(closing) {
    setStreetClosing(closing);
  }

  /**
   * Event to handle setting the modified flag for the current street.
   *
   * @param {boolean} changed True if the current street has been modified; otherwise false.
   */
  function HandleStreetModified(changed) {
    setStreetModified(changed);
    if (!changed) setEsuDividedMerged(changed);
  }

  /**
   * Event to handle when the street errors change.
   *
   * @param {array|null} streetErrors The list of street errors.
   * @param {array|null} descriptorErrors The list of descriptor errors.
   * @param {array|null} esuErrors The list of ESU errors.
   * @param {array|null} successorCrossRefErrors The list of successor cross reference errors (OneScotland only).
   * @param {array|null} highwayDedicationErrors The list of highway dedication errors (GeoPlace only).
   * @param {array|null} oneWayExemptionErrors The list of one-way exemption errors (GeoPlace only).
   * @param {array|null} maintenanceResponsibilityErrors The list of maintenance responsibility errors (OneScotland only).
   * @param {array|null} reinstatementCategoryErrors The list of reinstatement category errors (OneScotland only).
   * @param {array|null} osSpecialDesignationErrors The list of special designation errors (OneScotland only).
   * @param {array|null} interestErrors The list of interest errors (GeoPlace only).
   * @param {array|null} constructionErrors The list of construction errors (GeoPlace only).
   * @param {array|null} specialDesignationErrors The list of special designation errors (GeoPlace only).
   * @param {array|null} heightWidthWeightErrors The list of height, width & weight errors (GeoPlace only).
   * @param {array|null} publicRightOfWayErrors The list of public rights of way errors (GeoPlace only).
   * @param {array|null} noteErrors The list of note errors.
   */
  function HandleStreetErrors(
    streetErrors,
    descriptorErrors,
    esuErrors,
    successorCrossRefErrors,
    highwayDedicationErrors,
    oneWayExemptionErrors,
    maintenanceResponsibilityErrors,
    reinstatementCategoryErrors,
    osSpecialDesignationErrors,
    interestErrors,
    constructionErrors,
    specialDesignationErrors,
    heightWidthWeightErrors,
    publicRightOfWayErrors,
    noteErrors
  ) {
    setStreetErrors({
      street: streetErrors && streetErrors.length > 0 ? streetErrors : [],
      descriptor: descriptorErrors && descriptorErrors.length > 0 ? descriptorErrors : [],
      esu: esuErrors && esuErrors.length > 0 ? esuErrors : [],
      highwayDedication: highwayDedicationErrors && highwayDedicationErrors.length > 0 ? highwayDedicationErrors : [],
      oneWayExemption: oneWayExemptionErrors && oneWayExemptionErrors.length > 0 ? oneWayExemptionErrors : [],
      successorCrossRef: successorCrossRefErrors && successorCrossRefErrors.length > 0 ? successorCrossRefErrors : [],
      maintenanceResponsibility:
        maintenanceResponsibilityErrors && maintenanceResponsibilityErrors.length > 0
          ? maintenanceResponsibilityErrors
          : [],
      reinstatementCategory:
        reinstatementCategoryErrors && reinstatementCategoryErrors.length > 0 ? reinstatementCategoryErrors : [],
      osSpecialDesignation:
        osSpecialDesignationErrors && osSpecialDesignationErrors.length > 0 ? osSpecialDesignationErrors : [],
      interest: interestErrors && interestErrors.length > 0 ? interestErrors : [],
      construction: constructionErrors && constructionErrors.length > 0 ? constructionErrors : [],
      specialDesignation:
        specialDesignationErrors && specialDesignationErrors.length > 0 ? specialDesignationErrors : [],
      heightWidthWeight: heightWidthWeightErrors && heightWidthWeightErrors.length > 0 ? heightWidthWeightErrors : [],
      publicRightOfWay: publicRightOfWayErrors && publicRightOfWayErrors.length > 0 ? publicRightOfWayErrors : [],
      note: noteErrors && noteErrors.length > 0 ? noteErrors : [],
    });
    setStreetHasErrors(
      (streetErrors && streetErrors.length > 0) ||
        (descriptorErrors && descriptorErrors.length > 0) ||
        (esuErrors && esuErrors.length > 0) ||
        (highwayDedicationErrors && highwayDedicationErrors.length > 0) ||
        (oneWayExemptionErrors && oneWayExemptionErrors.length > 0) ||
        (successorCrossRefErrors && successorCrossRefErrors.length > 0) ||
        (maintenanceResponsibilityErrors && maintenanceResponsibilityErrors.length > 0) ||
        (reinstatementCategoryErrors && reinstatementCategoryErrors.length > 0) ||
        (osSpecialDesignationErrors && osSpecialDesignationErrors.length > 0) ||
        (interestErrors && interestErrors.length > 0) ||
        (constructionErrors && constructionErrors.length > 0) ||
        (specialDesignationErrors && specialDesignationErrors.length > 0) ||
        (heightWidthWeightErrors && heightWidthWeightErrors.length > 0) ||
        (publicRightOfWayErrors && publicRightOfWayErrors.length > 0) ||
        (noteErrors && noteErrors.length > 0)
    );
  }

  /**
   * Method used to handle when we are leaving the current street to go to a new street or property.
   *
   * @param {string|null} why The reason why we are leaving the current street.
   * @param {object|null} information The information required to use when leaving the street.
   */
  function HandleLeavingStreet(why, information) {
    if (why) setLeavingStreet({ why: why, information: information });
    else setLeavingStreet(null);
  }

  /**
   * Goes to a specific field on a specific record for a street record.
   *
   * @param {number} type The record type where the field is located
   * @param {number} index The index of the record within the array of records.
   * @param {number|null} parentIndex The index of the ESU record when going to a highway dedication or one-way exemption record.
   * @param {string} fieldName The index of the record within the array of records.
   */
  function HandleStreetGoToField(type, index, parentIndex, fieldName) {
    if (type === null) setStreetGoToField(null);
    else
      setStreetGoToField({
        type: type,
        index: index,
        parentIndex: parentIndex,
        fieldName: fieldName,
      });
  }

  /**
   * Event to handle when the street record changes.
   *
   * @param {number} type The type of street record.
   * @param {number} id The id of the record.
   * @param {number} index The index of the street record in the search array.
   * @param {number} parentIndex The index for the parent
   * @param {boolean} [newRecord=false] True if this is a new record; otherwise false.
   */
  function HandleStreetRecordChange(type, id, index, parentIndex, newRecord = false) {
    setStreetRecord({ type: type, id: id, index: index, parentIndex: parentIndex, newRecord: newRecord });
  }

  /**
   * Event to handle when the ESU data has been changed.
   *
   * @param {boolean} changed True if the ESU data has changed; otherwise false.
   */
  function HandleEsuDataChange(changed) {
    setEsuDataChanged(changed);
  }

  /**
   * Event to handle resetting the street.
   */
  function HandleResetStreet() {
    previousStreet.current = street;
    HandleStreetChange(0, "", false);
    setExpandedEsu([]);
    setExpandedAsd([]);
  }

  /**
   * Event to handle restoring the street state object.
   */
  function HandleRestoreStreet() {
    setStreet(previousStreet.current);
  }

  /**
   * Event to handle when the street is opened at the related tab.
   */
  function HandleStreetRelatedOpened() {
    setStreet({
      usrn: street.usrn,
      descriptor: street.descriptor,
      newStreet: street.newStreet,
      openRelated: null,
    });
  }

  /**
   * Event to handle when an ESU is selected in the map.
   *
   * @param {number|null} esuId The ESU id for the ESU that has been selected.
   */
  function HandleEsuSelected(esuId) {
    setSelectedMapEsuId(esuId);
  }

  /**
   * Event to handle when 2 ESUs are merged together.
   *
   * @param {number|null} esuId1 The ESU id for the first ESU that has been merged.
   * @param {number|null} esuId2 The ESU id for the second ESU that has been merged.
   * @param {Array|null} newGeometry The array of points making up the new geometry for the merged ESUs.
   */
  function HandleMergedEsus(esuId1, esuId2, newGeometry) {
    if (!esuId1) setMergedEsus(null);
    else setMergedEsus({ esuId1: esuId1, esuId2: esuId2, newGeometry: newGeometry });
  }

  /**
   * Event to handle when ESUs are unassigned from a street.
   *
   * @param {Array|null} esus The list of ESU Ids to be unassigned from the street.
   */
  function HandleUnassignEsus(esus) {
    if (!esus) setUnassignEsus(null);
    else setUnassignEsus(esus);
  }

  /**
   * Event to handle when an ESU is assigned to a street.
   *
   * @param {number|null} esuId The Id of the ESU that needs to be assigned to the street.
   */
  function HandleAssignEsu(esuId) {
    setAssignEsu(esuId);
  }

  /**
   * Event to handle when ESUs are assigned to a street.
   *
   * @param {Array|null} esus The list of ESU Ids to be assigned to the street.
   */
  function HandleAssignEsus(esus) {
    if (!esus) setAssignEsus(null);
    else setAssignEsus(esus);
    HandlePointCapture(null);
  }

  /**
   * Event to handle when ESUs are used to create a street.
   *
   * @param {Array|null} esus The list of ESU Ids to be used to create the street.
   */
  function HandleCreateStreetFromEsus(esus) {
    if (!esus) setCreateEsus(null);
    else {
      setCreateEsus(esus);
      HandleStreetChange(0, "New Street", true);
    }
    HandlePointCapture(null);
  }

  /**
   * Event to handle when an ESU has been divided or merged.
   *
   * @param {boolean} hasBeenDividedMerged True if an ESU has been divided or merged.
   */
  function HandleEsuDividedMerged(hasBeenDividedMerged) {
    setEsuDividedMerged(hasBeenDividedMerged);
  }

  /**
   * Event to handle when an ESU is expanded or collapsed.
   *
   * @param {string} title The title of the item we are expanding or collapsing.
   */
  function HandleToggleEsuExpanded(title) {
    const newList = [...expandedEsu];
    const index = newList.indexOf(title);
    if (index > -1) newList.splice(index, 1);
    else newList.push(title);

    setExpandedEsu(newList);
  }

  /**
   * Event to handle when an ASD is expanded or collapsed.
   *
   * @param {string} title The title of the item we are expanding or collapsing.
   */
  function HandleToggleAsdExpanded(title) {
    const newList = [...expandedAsd];
    const index = newList.indexOf(title);
    if (index > -1) newList.splice(index, 1);
    else newList.push(title);

    setExpandedAsd(newList);
  }

  /**
   * Event to handle resetting the street errors.
   */
  function HandleResetStreetErrors() {
    HandleStreetErrors([], [], [], [], [], [], [], [], [], [], [], [], [], [], []);
  }

  /**
   * Event to handle validating the street data.
   *
   * @returns {boolean} True if the street is valid; otherwise false.
   */
  function HandleStreetValidateData() {
    let isValid = true;

    const updateStreetErrors = (newErrors, type) => {
      HandleStreetErrors(
        type === "street" ? newErrors : streetErrors.street,
        type === "descriptor" ? newErrors : streetErrors.descriptor,
        type === "esu" ? newErrors : streetErrors.esu,
        type === "highwayDedication" ? newErrors : streetErrors.highwayDedication,
        type === "oneWayExemption" ? newErrors : streetErrors.oneWayExemption,
        type === "successorCrossRef" ? newErrors : streetErrors.successorCrossRef,
        type === "maintenanceResponsibility" ? newErrors : streetErrors.maintenanceResponsibility,
        type === "reinstatementCategory" ? newErrors : streetErrors.reinstatementCategory,
        type === "osSpecialDesignation" ? newErrors : streetErrors.osSpecialDesignation,
        type === "interest" ? newErrors : streetErrors.interest,
        type === "construction" ? newErrors : streetErrors.construction,
        type === "specialDesignation" ? newErrors : streetErrors.specialDesignation,
        type === "heightWidthWeight" ? newErrors : streetErrors.heightWidthWeight,
        type === "publicRightOfWay" ? newErrors : streetErrors.publicRightOfWay,
        type === "note" ? newErrors : streetErrors.note
      );
    };

    if (streetModified) {
      switch (streetRecord.type) {
        case 11:
          if (sandbox.currentStreet) {
            const streetData = {
              usrn: sandbox.currentStreet.usrn,
              swaOrgRefNaming: sandbox.currentStreet.swaOrgRefNaming,
              streetSurface: sandbox.currentStreet.streetSurface,
              streetStartDate: sandbox.currentStreet.streetStartDate,
              streetEndDate: sandbox.currentStreet.streetEndDate,
              streetStartX: sandbox.currentStreet.streetStartX,
              streetStartY: sandbox.currentStreet.streetStartY,
              streetEndX: sandbox.currentStreet.streetEndX,
              streetEndY: sandbox.currentStreet.streetEndY,
              neverExport: sandbox.currentStreet.neverExport,
              recordType: sandbox.currentStreet.recordType,
              state: sandbox.currentStreet.state,
              stateDate: sandbox.currentStreet.stateDate,
              streetClassification: sandbox.currentStreet.streetClassification,
              streetTolerance: sandbox.currentStreet.streetTolerance,
              esus: sandbox.currentStreet.esus,
              successorCrossRefs: sandbox.currentStreet.successorCrossRefs,
            };
            const errorStreet = ValidateStreetData(streetData, lookups, isScottish, authorityCode);
            isValid = errorStreet.length === 0;
            updateStreetErrors(errorStreet, "street");
          }
          break;

        case 13:
          if (sandbox.currentStreetRecords.esu) {
            const esuErrors = ValidateEsuData(
              sandbox.currentStreetRecords.esu,
              streetRecord.index,
              lookups,
              isScottish
            );
            isValid = esuErrors.length === 0;
            updateStreetErrors(esuErrors, "esu");
          }
          break;

        case 15:
          if (sandbox.currentStreetRecords.streetDescriptor) {
            const descriptorErrors = ValidateDescriptorData(
              sandbox.currentStreetRecords.streetDescriptor,
              streetRecord.index,
              lookups,
              isScottish,
              isWelsh
            );
            isValid = descriptorErrors.length === 0;
            updateStreetErrors(descriptorErrors, "descriptor");
          }
          break;

        case 16:
          if (sandbox.currentStreetRecords.oneWayExemption) {
            const oneWayExemptionErrors = ValidateOneWayExemptionData(
              sandbox.currentStreetRecords.oneWayExemption,
              streetRecord.index,
              streetRecord.parentIndex,
              lookups,
              isScottish
            );
            isValid = oneWayExemptionErrors.length === 0;
            updateStreetErrors(oneWayExemptionErrors, "oneWayExemption");
          }
          break;

        case 17:
          if (sandbox.currentStreetRecords.highwayDedication) {
            const highwayDedicationErrors = ValidateHighwayDedicationData(
              sandbox.currentStreetRecords.highwayDedication,
              streetRecord.index,
              streetRecord.parentIndex,
              lookups,
              isScottish
            );
            isValid = highwayDedicationErrors.length === 0;
            updateStreetErrors(highwayDedicationErrors, "highwayDedication");
          }
          break;

        case 30:
          if (sandbox.currentStreetRecords.successorCrossRef) {
            const successorCrossRefErrors = ValidateStreetSuccessorCrossRefData(
              sandbox.currentStreetRecords.successorCrossRef,
              streetRecord.index,
              streetRecord.parentIndex,
              lookups,
              true
            );
            isValid = successorCrossRefErrors.length === 0;
            updateStreetErrors(successorCrossRefErrors, "successorCrossRef");
          }
          break;

        case 51:
          if (sandbox.currentStreetRecords.maintenanceResponsibility) {
            const maintenanceResponsibilityErrors = ValidateMaintenanceResponsibilityData(
              sandbox.currentStreetRecords.maintenanceResponsibility,
              streetRecord.index,
              lookups
            );
            isValid = maintenanceResponsibilityErrors.length === 0;
            updateStreetErrors(maintenanceResponsibilityErrors, "maintenanceResponsibility");
          }
          break;

        case 52:
          if (sandbox.currentStreetRecords.reinstatementCategory) {
            const reinstatementCategoryErrors = ValidateReinstatementCategoryData(
              sandbox.currentStreetRecords.reinstatementCategory,
              streetRecord.index,
              lookups
            );
            isValid = reinstatementCategoryErrors.length === 0;
            updateStreetErrors(reinstatementCategoryErrors, "reinstatementCategory");
          }
          break;

        case 53:
          if (sandbox.currentStreetRecords.osSpecialDesignation) {
            const osSpecialDesignationErrors = ValidateOSSpecialDesignationData(
              sandbox.currentStreetRecords.osSpecialDesignation,
              streetRecord.index,
              lookups
            );
            isValid = osSpecialDesignationErrors.length === 0;
            updateStreetErrors(osSpecialDesignationErrors, "osSpecialDesignation");
          }
          break;

        case 61:
          if (sandbox.currentStreetRecords.interest) {
            const interestErrors = ValidateInterestData(
              sandbox.currentStreetRecords.interest,
              streetRecord.index,
              lookups
            );
            isValid = interestErrors.length === 0;
            updateStreetErrors(interestErrors, "interest");
          }
          break;

        case 62:
          if (sandbox.currentStreetRecords.construction) {
            const constructionErrors = ValidateConstructionData(
              sandbox.currentStreetRecords.construction,
              streetRecord.index,
              lookups
            );
            isValid = constructionErrors.length === 0;
            updateStreetErrors(constructionErrors, "construction");
          }
          break;

        case 63:
          if (sandbox.currentStreetRecords.specialDesignation) {
            const specialDesignationErrors = ValidateSpecialDesignationData(
              sandbox.currentStreetRecords.specialDesignation,
              streetRecord.index,
              lookups
            );
            isValid = specialDesignationErrors.length === 0;
            updateStreetErrors(specialDesignationErrors, "specialDesignation");
          }
          break;

        case 64:
          if (sandbox.currentStreetRecords.heightWidthWeight) {
            const heightWidthWeightErrors = ValidateHeightWidthWeightData(
              sandbox.currentStreetRecords.heightWidthWeight,
              streetRecord.index,
              lookups
            );
            isValid = heightWidthWeightErrors.length === 0;
            updateStreetErrors(heightWidthWeightErrors, "heightWidthWeight");
          }
          break;

        case 66:
          if (sandbox.currentStreetRecords.publicRightOfWay) {
            const publicRightOfWayErrors = ValidatePublicRightOfWayData(
              sandbox.currentStreetRecords.publicRightOfWay,
              streetRecord.index,
              lookups,
              authorityCode
            );
            isValid = publicRightOfWayErrors.length === 0;
            updateStreetErrors(publicRightOfWayErrors, "publicRightOfWay");
          }
          break;

        case 72:
          if (sandbox.currentStreetRecords.note) {
            const noteErrors = ValidateStreetNoteData(
              sandbox.currentStreetRecords.note,
              streetRecord.index,
              lookups,
              isScottish
            );
            isValid = noteErrors.length === 0;
            updateStreetErrors(noteErrors, "note");
          }
          break;

        default:
          break;
      }
    }

    return isValid;
  }

  /**
   * Event to handle the changing of a property.
   *
   * @param {number} uprn The UPRN of the property.
   * @param {number} usrn The USRN of the street the property is on.
   * @param {string} address The address of the property.
   * @param {string} formattedAddress The formatted address for the property.
   * @param {string} postcode The postcode for the address.
   * @param {number} easting The easting of the property.
   * @param {number} northing The northing of the property.
   * @param {boolean} newProperty True if this is a new property; otherwise false.
   * @param {object|null} parent The parent object for the property.
   * @param {object|null} [openRelated=null] If present it contains the UPRN of the property that we need the the related tab opened.
   */
  async function HandlePropertyChange(
    uprn,
    usrn,
    address,
    formattedAddress,
    postcode,
    easting,
    northing,
    newProperty,
    parent,
    openRelated = null
  ) {
    async function GetParentUprn(uprn) {
      const propertyUrl = GetPropertyFromUPRNUrl(openRelated.userToken);

      if (propertyUrl) {
        const parentUprn = await fetch(`${propertyUrl.url}/${uprn}`, {
          headers: propertyUrl.headers,
          crossDomain: true,
          method: "GET",
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              return result.parentUprn;
            },
            (error) => {
              console.error("[ERROR] Get Property data", error);
              return null;
            }
          );

        return parentUprn;
      } else return null;
    }

    let relatedProperty = null;

    if (openRelated) {
      let expandList = [];
      let topNodeId = `property-related-tree-${openRelated.property.toString()}`;

      if (openRelated.parent) {
        expandList.push(openRelated.parent.toString());
        topNodeId = `property-related-tree-${openRelated.parent.toString()}`;
        const grandParent = await GetParentUprn(openRelated.parent);

        if (grandParent) {
          expandList.push(grandParent.toString());
          topNodeId = `property-related-tree-${grandParent.toString()}`;
          const greatGrandParent = await GetParentUprn(grandParent);

          if (greatGrandParent) {
            expandList.push(greatGrandParent.toString());
            topNodeId = `property-related-tree-${greatGrandParent.toString()}`;
          }
        }
      }

      relatedProperty = {
        property: openRelated.property,
        expandList: expandList,
        topNodeId: topNodeId,
      };
    }

    setProperty({
      uprn: uprn,
      usrn: usrn,
      address: address,
      formattedAddress: formattedAddress,
      postcode: postcode,
      easting: easting,
      northing: northing,
      newProperty: newProperty,
      parent: parent,
      openRelated: openRelated ? relatedProperty : property.openRelated,
    });

    if (uprn && uprn > 0) history.push(`/property/${uprn}`);
    else if (newProperty) history.push("/property/0");
  }

  /**
   * Event to handle the change of logical status of the property.
   *
   * @param {number} logicalStatus The logical status of the property.
   */
  function HandleLogicalStatusChange(logicalStatus) {
    setLogicalStatus(logicalStatus);
  }

  /**
   * Event to handle setting a flag to determine if the current property has been modified.
   *
   * @param {boolean} changed True if the property has been modified; otherwise false.
   */
  function HandlePropertyModified(changed) {
    setPropertyModified(changed);
  }

  /**
   * Event to handle the property errors.
   *
   * @param {array|null} blpuErrors The list of BLPU errors.
   * @param {array|null} lpiErrors The list of LPI errors.
   * @param {array|null} provenanceErrors The list of provenance errors.
   * @param {array|null} crossRefErrors The list of cross reference errors.
   * @param {array|null} classificationErrors The list of classification errors (OneScotland only).
   * @param {array|null} organisationErrors The list of organisation errors (OneScotland only).
   * @param {array|null} successorCrossRefErrors The list of successor cross reference errors (OneScotland only).
   * @param {array|null} noteErrors The list of note errors.
   * @param {number} pkId The id of the current property.
   */
  function HandlePropertyErrors(
    blpuErrors,
    lpiErrors,
    provenanceErrors,
    crossRefErrors,
    classificationErrors,
    organisationErrors,
    successorCrossRefErrors,
    noteErrors,
    pkId
  ) {
    setPropertyErrors({
      pkId: pkId,
      blpu: blpuErrors && blpuErrors.length > 0 ? blpuErrors : [],
      lpi: lpiErrors && lpiErrors.length > 0 ? lpiErrors : [],
      provenance: provenanceErrors && provenanceErrors.length > 0 ? provenanceErrors : [],
      crossRef: crossRefErrors && crossRefErrors.length > 0 ? crossRefErrors : [],
      classification: classificationErrors && classificationErrors.length > 0 ? classificationErrors : [],
      organisation: organisationErrors && organisationErrors.length > 0 ? organisationErrors : [],
      successorCrossRef: successorCrossRefErrors && successorCrossRefErrors.length > 0 ? successorCrossRefErrors : [],
      note: noteErrors && noteErrors.length > 0 ? noteErrors : [],
    });
    setPropertyHasErrors(
      (blpuErrors && blpuErrors.length > 0) ||
        (lpiErrors && lpiErrors.length > 0) ||
        (provenanceErrors && provenanceErrors.length > 0) ||
        (crossRefErrors && crossRefErrors.length > 0) ||
        (classificationErrors && classificationErrors.length > 0) ||
        (organisationErrors && organisationErrors.length > 0) ||
        (successorCrossRefErrors && successorCrossRefErrors.length > 0) ||
        (noteErrors && noteErrors.length > 0)
    );
  }

  /**
   * Method used to handle when we are leaving the current property to go to a new street or property.
   *
   * @param {string|null} why The reason why we are leaving the current property.
   * @param {object|null} information The information required to use when leaving the property.
   */
  function HandleLeavingProperty(why, information) {
    if (why) setLeavingProperty({ why: why, information: information });
    else setLeavingProperty(null);
  }

  /**
   * Event to handle setting a field as the currently active control.
   *
   * @param {number} type The type of record.
   * @param {number} index The index of the record with the array.
   * @param {string} fieldName The field name used to determine which control to go to.
   */
  function HandlePropertyGoToField(type, index, fieldName) {
    if (type === null) setPropertyGoToField(null);
    else setPropertyGoToField({ type: type, index: index, fieldName: fieldName });
  }

  /**
   * Event to handle the change of a property.
   *
   * @param {number} type The record type.
   * @param {number} index The index of the record within its array.
   * @param {boolean} [newRecord=false] True if this is a new record; otherwise false.
   */
  function HandlePropertyRecordChange(type, index, newRecord = false) {
    setPropertyRecord({ type: type, index: index, newRecord: newRecord });
  }

  /**
   * Event to handle setting a flag to say if the provenance record has been modified.
   *
   * @param {boolean} changed True if the provenance data has been modified; otherwise false.
   */
  function HandleProvenanceDataChange(changed) {
    setProvenanceDataChanged(changed);
  }

  /**
   * Event to handle when the wizard is done.
   *
   * @param {object} data The wizard data.
   * @param {boolean} isRange True if creating a range of properties/children.
   * @param {object|null} parent If creating children this is the parent object.
   * @param {object} source The source data.
   */
  function HandleWizardDone(data, isRange, parent, source) {
    setWizardData({ ...data, isRange: isRange, parent: parent, source: source });
  }

  /**
   * Event to handle the resetting of the property.
   */
  function HandleResetProperty() {
    previousProperty.current = property;
    HandlePropertyChange(0, 0, "", "", "", 0, 0, false, null);
    setLogicalStatus(null);
  }

  /**
   * Event to handle the restoring of the property state object.
   */
  function HandleRestoreProperty() {
    setProperty(previousProperty.current);
  }

  /**
   * Event to handle when the property is opened at the related tab.
   */
  function HandlePropertyRelatedOpened() {
    setProperty({
      uprn: property.uprn,
      usrn: property.usrn,
      address: property.address,
      formattedAddress: property.formattedAddress,
      postcode: property.postcode,
      easting: property.easting,
      northing: property.northing,
      newProperty: property.newProperty,
      parent: property.parent,
      openRelated: null,
    });
  }

  /**
   * Event to handle resetting of the property errors.
   */
  function HandleResetPropertyErrors() {
    setPropertyErrors({
      blpu: [],
      lpi: [],
      provenance: [],
      crossRef: [],
      classification: [],
      organisation: [],
      successorCrossRef: [],
      note: [],
    });
    setPropertyHasErrors(false);
  }

  /**
   * Event to handle the validation of the property data.
   *
   * @returns True if the data is valid; otherwise false.
   */
  function HandlePropertyValidateData() {
    let isValid = true;

    const updatePropertyErrors = (newErrors, type) => {
      HandlePropertyErrors(
        type === "blpu" ? newErrors : propertyErrors.blpu,
        type === "lpi" ? newErrors : propertyErrors.lpi,
        type === "provenance" ? newErrors : propertyErrors.provenance,
        type === "crossRef" ? newErrors : propertyErrors.crossRef,
        type === "classification" ? newErrors : propertyErrors.classification,
        type === "organisation" ? newErrors : propertyErrors.organisation,
        type === "successorCrossRef" ? newErrors : propertyErrors.successorCrossRef,
        type === "note" ? newErrors : propertyErrors.note
      );
    };

    if (propertyModified) {
      switch (propertyRecord.type) {
        case 21:
          if (sandbox.currentProperty) {
            const blpuData = {
              blpuStateDate: sandbox.currentProperty.blpuStateDate,
              rpc: sandbox.currentProperty.rpc,
              startDate: sandbox.currentProperty.startDate,
              endDate: sandbox.currentProperty.endDate,
              neverExport: sandbox.currentProperty.neverExport,
              siteSurvey: sandbox.currentProperty.siteSurvey,
              uprn: sandbox.currentProperty.uprn,
              parentUprn: sandbox.currentProperty.parentUprn,
              logicalStatus: sandbox.currentProperty.logicalStatus,
              blpuState: sandbox.currentProperty.blpuState,
              blpuClass: sandbox.currentProperty.blpuClass,
              organisation: sandbox.currentProperty.organisation,
              xcoordinate: sandbox.currentProperty.xcoordinate,
              ycoordinate: sandbox.currentProperty.ycoordinate,
              wardCode: sandbox.currentProperty.wardCode,
              parishCode: sandbox.currentProperty.parishCode,
            };
            const blpuErrors = ValidateBlpuData(blpuData, lookups, isScottish);
            isValid = blpuErrors.length === 0;
            updatePropertyErrors(blpuErrors, "blpu");
          }
          break;

        case 22:
          if (sandbox.currentPropertyRecords.provenance) {
            const provenanceErrors = ValidateProvenanceData(
              sandbox.currentPropertyRecords.provenance,
              propertyRecord.index,
              lookups,
              isScottish
            );
            isValid = provenanceErrors.length === 0;
            updatePropertyErrors(provenanceErrors, "provenance");
          }
          break;

        case 23:
          if (sandbox.currentPropertyRecords.appCrossRef) {
            const crossRefErrors = ValidateCrossRefData(
              sandbox.currentPropertyRecords.appCrossRef,
              propertyRecord.index,
              lookups,
              isScottish
            );
            isValid = crossRefErrors.length === 0;
            updatePropertyErrors(crossRefErrors, "crossRef");
          }
          break;

        case 24:
          if (sandbox.currentPropertyRecords.lpi) {
            const lpiErrors = ValidateLpiData(
              sandbox.currentPropertyRecords.lpi,
              propertyRecord.index,
              lookups,
              isScottish,
              isWelsh
            );
            isValid = lpiErrors.length === 0;
            updatePropertyErrors(lpiErrors, "lpi");
          }
          break;

        case 30:
          if (sandbox.currentPropertyRecords.successorCrossRef) {
            const successorCrossRefErrors = ValidateSuccessorCrossRefData(
              sandbox.currentPropertyRecords.successorCrossRef,
              propertyRecord.index,
              lookups
            );
            isValid = successorCrossRefErrors.length === 0;
            updatePropertyErrors(successorCrossRefErrors, "successorCrossRef");
          }
          break;

        case 31:
          if (sandbox.currentPropertyRecords.organisation) {
            const organisationErrors = ValidateOrganisationData(
              sandbox.currentPropertyRecords.organisation,
              propertyRecord.index,
              lookups
            );
            isValid = organisationErrors.length === 0;
            updatePropertyErrors(organisationErrors, "organisation");
          }
          break;

        case 32:
          if (sandbox.currentPropertyRecords.classification) {
            const classificationErrors = ValidateClassificationData(
              sandbox.currentPropertyRecords.classification,
              propertyRecord.index,
              lookups
            );
            isValid = classificationErrors.length === 0;
            updatePropertyErrors(classificationErrors, "classification");
          }
          break;

        case 71:
          if (sandbox.currentPropertyRecords.note) {
            const noteErrors = ValidatePropertyNoteData(
              sandbox.currentPropertyRecords.note,
              propertyRecord.index,
              lookups,
              isScottish
            );
            isValid = noteErrors.length === 0;
            updatePropertyErrors(noteErrors, "note");
          }
          break;

        default:
          break;
      }
    }

    return isValid;
  }

  /**
   * Event to handle when background mapping data changes.
   *
   * @param {Array} streets The list of background streets.
   * @param {Array} unassignedEsus The list of unassigned ESUs.
   * @param {Array} properties The list of background properties.
   */
  function HandleBackgroundDataChange(streets, unassignedEsus, properties) {
    setBackgroundData({ streets: streets, unassignedEsus: unassignedEsus, properties: properties });
  }

  /**
   * Event to handle when the mapping data changes for a search.
   *
   * @param {Array|null} streets The list of streets returned by the search.
   * @param {Array|null} properties The list of properties returned by the search.
   * @param {number|null} editStreet The USRN of the street that is being edited.
   * @param {number|null} editProperty The UPRN of the property that is being edited.
   */
  function HandleMapSearchDataChange(streets, properties, editStreet, editProperty) {
    setMapSearchData({
      streets: streets,
      properties: properties,
      editStreet: editStreet,
      editProperty: editProperty,
    });

    if (!editStreet && editStreet !== 0 && !editProperty && editProperty !== 0) {
      setSourceMapSearchData({ streets: streets, properties: properties });
    }
  }

  /**
   * Event to handle when the map changes.
   *
   * @param {Array|null} extents The list of extents to display for the current property.
   * @param {number|null} zoomStreet The USRN of the street to zoom to.
   * @param {number|null} zoomProperty The UPRN of the property to zoom to.
   */
  function HandleMapChange(extents, zoomStreet, zoomProperty) {
    setMap({
      extents: extents,
      zoomStreet: zoomStreet,
      zoomProperty: zoomProperty,
    });
  }

  /**
   * Event to handle when the property changes.
   *
   * @param {object} property The current property.
   */
  function HandleMapPropertyChange(property) {
    setMapProperty(property);
  }

  /**
   * Event to handle when the street changes.
   *
   * @param {object} street The current street.
   */
  function HandleMapStreetChange(street) {
    setMapStreet(street);
  }

  /**
   * Event to handle editing a map object.
   *
   * @param {number} objectType The type of map object being edited.
   * @param {number} objectId The id of the object being edited.
   */
  function HandleEditMapObject(objectType, objectId) {
    if (!objectType) {
      setEditObject(null);
      editObjectRef.current = null;
    } else {
      setEditObject({ objectType: objectType, objectId: objectId });
      editObjectRef.current = { objectType: objectType, objectId: objectId };
    }
  }

  /**
   * Method to get all the streets within a given extent.
   *
   * @param {object} extent The extent of the map
   * @returns {array} The list of streets within the given extent.
   */
  async function GetBackgroundStreetData(extent) {
    if (!currentUser || extent.zoomLevel < 16) return null;

    const backgroundStreetsUrl = GetBackgroundStreetsUrl(currentUser.token);

    if (backgroundStreetsUrl) {
      const returnValue = await fetch(
        `${backgroundStreetsUrl.url}?XMin=${extent.xmin}&YMin=${extent.ymin}&XMax=${extent.xmax}&YMax=${extent.ymax}`,
        {
          headers: backgroundStreetsUrl.headers,
          crossDomain: true,
          method: "GET",
        }
      )
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          if (res.status && res.status === 204) return [];
          else return res.json();
        })
        .then((result) => {
          return result;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                console.error(`[400 ERROR] Getting all Street data`, body.errors);
              });
              return null;

            case 401:
              res.json().then((body) => {
                console.error(`[401 ERROR] Getting all Street data`, body);
              });
              return null;

            case 500:
              console.error(`[500 ERROR] Getting all Street data`, res);
              return null;

            default:
              console.error(`[${res.status} ERROR] Getting all Street data`, res);
              return null;
          }
        });

      return returnValue;
    } else return null;
  }

  /**
   * Method to get all the unassigned ESUs within a given extent.
   *
   * @param {object} extent The extent of the map
   * @returns {Array} The list of unassigned ESUs within the given extent.
   */
  async function GetUnassignedEsuData(extent) {
    if (!currentUser || extent.zoomLevel < 16) return null;

    const unassignedEsusUrl = GetUnassignedEsusUrl(currentUser.token);

    if (unassignedEsusUrl) {
      const returnValue = await fetch(
        `${unassignedEsusUrl.url}?XMin=${extent.xmin}&YMin=${extent.ymin}&XMax=${extent.xmax}&YMax=${extent.ymax}`,
        {
          headers: unassignedEsusUrl.headers,
          crossDomain: true,
          method: "GET",
        }
      )
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          if (res.status && res.status === 204) return [];
          else return res.json();
        })
        .then((result) => {
          return result;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                console.error(`[400 ERROR] Getting all unassigned ESU data`, body.errors);
              });
              return null;

            case 401:
              res.json().then((body) => {
                console.error(`[401 ERROR] Getting all unassigned ESU data`, body);
              });
              return null;

            case 500:
              console.error(`[500 ERROR] Getting all unassigned ESU data`, res);
              return null;

            default:
              console.error(`[${res.status} ERROR] Getting all unassigned ESU data`, res);
              return null;
          }
        });

      return returnValue;
    } else return null;
  }

  /**
   * Method to get all the properties within a given extent.
   *
   * @param {object} extent The extent of the map
   * @returns {array} The list of properties within the given extent.
   */
  async function GetBackgroundPropertyData(extent) {
    if (!currentUser || extent.zoomLevel < 18) return null;

    const backgroundPropertiesUrl = GetBackgroundPropertiesUrl(currentUser.token);

    if (backgroundPropertiesUrl) {
      const returnValue = await fetch(
        `${backgroundPropertiesUrl.url}?XMin=${extent.xmin}&YMin=${extent.ymin}&XMax=${extent.xmax}&YMax=${extent.ymax}`,
        {
          headers: backgroundPropertiesUrl.headers,
          crossDomain: true,
          method: "GET",
        }
      )
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          if (res.status && res.status === 204) return [];
          else return res.json();
        })
        .then((result) => {
          return result;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                console.error(`[400 ERROR] Getting all property data`, body.errors);
              });
              return null;

            case 401:
              res.json().then((body) => {
                console.error(`[401 ERROR] Getting all property data`, body);
              });
              return null;

            case 500:
              console.error(`[500 ERROR] Getting all property data`, res);
              return null;

            default:
              console.error(`[${res.status} ERROR] Getting all property data`, res);
              return null;
          }
        });

      return returnValue;
    } else return null;
  }

  /**
   * Event to handle when the map extent changes.
   *
   * @param {object} extent The extent for the map
   * @returns
   */
  async function HandleExtentChange(extent) {
    if (!extent) return;

    setMapExtent(extent);

    let backgroundStreetData = null;
    let unassignedEsuData = null;
    let backgroundPropertyData = null;

    if (
      !currentMapExtent.current ||
      (currentMapExtent.current.zoomLevel !== extent.zoomLevel && extent.zoomLevel > 15) ||
      (currentMapExtent.current.zoomLevel === extent.zoomLevel &&
        (currentMapExtent.current.xmin !== extent.xmin ||
          currentMapExtent.current.ymin !== extent.ymin ||
          currentMapExtent.current.xmax !== extent.xmax ||
          currentMapExtent.current.ymax !== extent.ymax))
    ) {
      if (extent.zoomLevel > 15) {
        backgroundStreetData = await GetBackgroundStreetData(extent);
        unassignedEsuData = await GetUnassignedEsuData(extent);
      } else {
        backgroundStreetData = [];
        unassignedEsuData = [];
      }

      if (extent.zoomLevel > 17) {
        backgroundPropertyData = await GetBackgroundPropertyData(extent);
      } else backgroundPropertyData = [];

      if (backgroundStreetData || backgroundPropertyData)
        setBackgroundData({
          streets: backgroundStreetData,
          unassignedEsus: unassignedEsuData,
          properties: backgroundPropertyData,
        });

      currentMapExtent.current = {
        xmin: extent.xmin,
        ymin: extent.ymin,
        xmax: extent.xmax,
        ymax: extent.ymax,
        zoomLevel: extent.zoomLevel,
      };
    }
  }

  /**
   * Event to handle highlighting a street or property on the map.
   *
   * @param {object|null} street The street to highlight
   * @param {object|null} property Th property to highlight
   */
  function HandleStreetPropertyHighlight(street, property) {
    if (!selectingProperties)
      setHighlight({
        street: street,
        esu: null,
        asd51: null,
        asd52: null,
        asd53: null,
        asd61: null,
        asd62: null,
        asd63: null,
        asd64: null,
        asd66: null,
        property: property,
        selectProperties: null,
        extent: null,
      });
  }

  /**
   * Event to handle highlighting items on the map.
   *
   * @param {string} type The type of item to highlight.
   * @param {array} array The array of items that need to be highlighted.
   */
  function HandleListItemHighlight(type, array) {
    setHighlight({
      street: null,
      esu: type === "esu" ? array : null,
      asd51: type === "asd51" ? array : null,
      asd52: type === "asd52" ? array : null,
      asd53: type === "asd53" ? array : null,
      asd61: type === "asd61" ? array : null,
      asd62: type === "asd62" ? array : null,
      asd63: type === "asd63" ? array : null,
      asd64: type === "asd64" ? array : null,
      asd66: type === "asd66" ? array : null,
      property: null,
      selectProperties: type === "selectProperties" ? array : null,
      extent: type === "extent" ? array : null,
    });
  }

  /**
   * Event to handle clearing any highlights on the map.
   */
  function HandleClearHighlight() {
    setHighlight({
      street: null,
      esu: null,
      asd51: null,
      asd52: null,
      asd53: null,
      asd61: null,
      asd62: null,
      asd63: null,
      asd64: null,
      asd66: null,
      property: null,
      selectProperties: null,
      extent: null,
    });
  }

  /**
   * Event to handle setting coordinates.
   *
   * @param {object|null} point The point coordinates to use.
   */
  function HandleSetCoordinate(point) {
    if (!point) {
      setMapStreetStart(null);
      setMapStreetEnd(null);
      setMapPropertyPin(null);
      setMapDivideEsu(null);
    } else {
      switch (pointCaptureModeRef.current) {
        case "streetStart":
          setMapStreetStart(point);
          break;

        case "streetEnd":
          setMapStreetEnd(point);
          break;

        default:
          setMapPropertyPin(point);
          break;
      }
    }
    HandlePointCapture(null);
  }

  /**
   * Event to handle setting the coordinates from the wizard.
   * @param {object} data The point object.
   */
  function HandleWizardSetCoordinate(data) {
    if (!data) setWizardPoint(null);
    else setWizardPoint(data);
  }

  /**
   * Event to handle when a line has been drawn on the map.
   *
   * @param {string} wktGeometry The WKT geometry of the line.
   */
  function HandleSetLineGeometry(wktGeometry) {
    if (!wktGeometry || !wktGeometry.includes(",")) setMapLineGeometry(null);
    else
      setMapLineGeometry({
        wktGeometry: wktGeometry,
        objectType: editObjectRef.current ? editObjectRef.current.objectType : null,
        objectId: editObjectRef.current ? editObjectRef.current.objectId : null,
      });
  }

  /**
   * Event to handle when a polygon has been drawn on the map.
   *
   * @param {string} wktGeometry The WKT geometry of the polygon.
   */
  function HandleSetPolygonGeometry(wktGeometry) {
    // Only set a polygon if we have a minimum of 3 unique points (triangle)
    if (!wktGeometry || !wktGeometry.includes(",") || (wktGeometry.match(/,/g) || []).length < 4)
      setMapPolygonGeometry(null);
    else
      setMapPolygonGeometry({
        wktGeometry: wktGeometry,
        objectType: editObjectRef.current ? editObjectRef.current.objectType : null,
        objectId: editObjectRef.current ? editObjectRef.current.objectId : null,
      });
  }

  /**
   * Event to handle capturing a point from the map.
   *
   * @param {string} mode The type of point capture required.
   */
  function HandlePointCapture(mode) {
    setPointCaptureMode(mode);
    pointCaptureModeRef.current = mode;
  }

  /**
   * Event to handle when a property pin is selected.
   *
   * @param {object} pin The property pin that has been selected.
   */
  function HandlePinSelected(pin) {
    setSelectedPin(pin);
  }

  /**
   * Method to handle when an ESU is selected to be divided.
   *
   * @param {number} esuId The ESU id that is to be divided.
   */
  function HandleDivideEsu(esuId) {
    if (esuId) {
      HandleEditMapObject(13, esuId);
      HandlePointCapture("divideEsu");
    } else {
      HandleEditMapObject(null, null);
      HandlePointCapture(null);
    }
  }

  /**
   * Method to handle when an ESU has been divided.
   *
   * @param {Array} esuGeometry1 The array of points for the first new ESU.
   * @param {Array} esuGeometry2 The array of points for the second new ESU.
   */
  function HandleEsuDivided(esuGeometry1, esuGeometry2) {
    setMapDivideEsu({ esuId: editObjectRef.current.objectId, newEsu1: esuGeometry1, newEsu2: esuGeometry2 });
  }

  /**
   * Method to handle selecting ESUs from the map.
   */
  function HandleSelectEsus() {
    HandlePointCapture("assignEsu");
  }

  /**
   *
   * @param {Boolean} selecting If true user wants to select properties from the map; otherwise false.
   */
  function HandleSelectPropertiesChange(selecting) {
    setSelectingProperties(selecting);
  }

  /**
   * Method to handle when the display information should be shown.
   *
   * @param {string} type The type of information being displayed.
   * @param {string} source The source that is displaying the information.
   */
  function HandleDisplayInformation(type, source) {
    setInformationType(type);
    setInformationSource(source);
  }

  /**
   * Method to clear the information control.
   */
  function HandleClearInformation() {
    switch (informationType) {
      case "divideESU":
        HandleDivideEsu(null);
        break;

      default:
        break;
    }

    HandleDisplayInformation(null, null);
  }

  return (
    <StylesProvider injectFirst>
      <Router history={history}>
        <userContext.Provider
          value={{ currentUser: currentUser, onUserChange: HandleUserChange, onDisplayLogin: HandleDisplayLogin }}
        >
          <LookupContext.Provider
            value={{
              currentLookups: lookups,
              metadata: metadata,
              districtUpdated: districtUpdated,
              onLookupChange: HandleLookupChange,
              onUpdateLookup: HandleUpdateLookup,
              onMetadataChange: HandleMetadataChange,
              onDistrictUpdated: HandleDistrictUpdated,
            }}
          >
            <SandboxContext.Provider
              value={{
                currentSandbox: sandbox,
                refreshRelated: refreshRelated,
                onSandboxChange: HandleSandboxChange,
                onUpdateAndClear: HandleSandboxUpdateAndClear,
                onStreetTabChange: HandleStreetTabChange,
                onPropertyTabChange: HandlePropertyTabChange,
                onRefreshRelated: HandleRefreshRelated,
                resetSandbox: HandleResetSandbox,
              }}
            >
              <SearchContext.Provider
                value={{
                  currentSearchData: searchData,
                  previousSearchData: previousSearchData,
                  searchPopupOpen: searchOpen,
                  hideSearch: hideSearch,
                  navigateBack: navigateBack,
                  onSearchDataChange: HandleSearchDataChange,
                  onPropertiesSelected: HandlePropertiesSelected,
                  onSearchOpen: HandleSearchOpenChange,
                  onHideSearch: HandleHideSearch,
                  onNavigateBack: HandleNavigateBack,
                }}
              >
                <FilterContext.Provider
                  value={{
                    currentSearchFilter: searchFilter,
                    onSearchFilterChange: HandleSearchFilterChange,
                  }}
                >
                  <SettingsContext.Provider
                    value={{
                      currentSettingsNode: settingsNode,
                      authorityDetails: authorityDetails,
                      authorityCode: authorityCode,
                      authorityName: authorityName,
                      isScottish: isScottish,
                      isWelsh: isWelsh,
                      propertyTemplates: propertyTemplates,
                      streetTemplate: streetTemplate,
                      mapLayers: mapLayers,
                      onNodeChange: HandleNodeChange,
                      onAuthorityDetailsChange: HandleAuthorityDetailsChange,
                      onPropertyTemplatesChange: HandlePropertyTemplatesChange,
                      onStreetTemplateChange: HandleStreetTemplateChange,
                      onMapLayersChange: HandleMapLayersChange,
                    }}
                  >
                    <StreetContext.Provider
                      value={{
                        currentStreet: street,
                        creatingStreet: creatingStreet,
                        streetClosing: streetClosing,
                        currentErrors: streetErrors,
                        currentStreetModified: streetModified,
                        currentStreetHasErrors: streetHasErrors,
                        leavingStreet: leavingStreet,
                        goToField: streetGoToField,
                        currentRecord: streetRecord,
                        selectedMapEsuId: selectedMapEsuId,
                        esuDataChanged: esuDataChanged,
                        mergedEsus: mergedEsus,
                        unassignEsus: unassignEsus,
                        assignEsu: assignEsu,
                        assignEsus: assignEsus,
                        createEsus: createEsus,
                        esuDividedMerged: esuDividedMerged,
                        expandedEsu: expandedEsu,
                        expandedAsd: expandedAsd,
                        onStreetChange: HandleStreetChange,
                        onStreetCreated: HandleStreetCreated,
                        onCloseStreet: HandleCloseStreet,
                        onStreetModified: HandleStreetModified,
                        onStreetErrors: HandleStreetErrors,
                        onLeavingStreet: HandleLeavingStreet,
                        onGoToField: HandleStreetGoToField,
                        onRecordChange: HandleStreetRecordChange,
                        onEsuDataChange: HandleEsuDataChange,
                        onRelatedOpened: HandleStreetRelatedOpened,
                        onEsuSelected: HandleEsuSelected,
                        onMergedEsus: HandleMergedEsus,
                        onUnassignEsus: HandleUnassignEsus,
                        onAssignEsu: HandleAssignEsu,
                        onAssignEsus: HandleAssignEsus,
                        onCreateStreet: HandleCreateStreetFromEsus,
                        onEsuDividedMerged: HandleEsuDividedMerged,
                        onToggleEsuExpanded: HandleToggleEsuExpanded,
                        onToggleAsdExpanded: HandleToggleAsdExpanded,
                        resetStreet: HandleResetStreet,
                        restoreStreet: HandleRestoreStreet,
                        resetStreetErrors: HandleResetStreetErrors,
                        validateData: HandleStreetValidateData,
                      }}
                    >
                      <PropertyContext.Provider
                        value={{
                          currentProperty: property,
                          newLogicalStatus: logicalStatus,
                          currentErrors: propertyErrors,
                          currentPropertyModified: propertyModified,
                          currentPropertyHasErrors: propertyHasErrors,
                          leavingProperty: leavingProperty,
                          goToField: propertyGoToField,
                          currentRecord: propertyRecord,
                          provenanceDataChanged: provenanceDataChanged,
                          wizardData: wizardData,
                          onPropertyChange: HandlePropertyChange,
                          onLogicalStatusChange: HandleLogicalStatusChange,
                          onPropertyModified: HandlePropertyModified,
                          onPropertyErrors: HandlePropertyErrors,
                          onLeavingProperty: HandleLeavingProperty,
                          onGoToField: HandlePropertyGoToField,
                          onRecordChange: HandlePropertyRecordChange,
                          onProvenanceDataChange: HandleProvenanceDataChange,
                          onWizardDone: HandleWizardDone,
                          onRelatedOpened: HandlePropertyRelatedOpened,
                          resetProperty: HandleResetProperty,
                          restoreProperty: HandleRestoreProperty,
                          resetPropertyErrors: HandleResetPropertyErrors,
                          validateData: HandlePropertyValidateData,
                        }}
                      >
                        <MapContext.Provider
                          value={{
                            currentBackgroundData: backgroundData,
                            currentSearchData: mapSearchData,
                            sourceSearchData: sourceMapSearchData,
                            currentLayers: map,
                            currentProperty: mapProperty,
                            currentStreet: mapStreet,
                            currentExtent: mapExtent,
                            currentHighlight: highlight,
                            currentEditObject: editObject,
                            currentPropertyPin: mapPropertyPin,
                            currentStreetStart: mapStreetStart,
                            currentStreetEnd: mapStreetEnd,
                            currentDivideEsu: mapDivideEsu,
                            currentWizardPoint: wizardPoint,
                            currentPointCaptureMode: pointCaptureMode,
                            currentLineGeometry: mapLineGeometry,
                            currentPolygonGeometry: mapPolygonGeometry,
                            currentPinSelected: selectedPin,
                            selectingProperties: selectingProperties,
                            onBackgroundDataChange: HandleBackgroundDataChange,
                            onSearchDataChange: HandleMapSearchDataChange,
                            onMapChange: HandleMapChange,
                            onEditMapObject: HandleEditMapObject,
                            onMapPropertyChange: HandleMapPropertyChange,
                            onMapStreetChange: HandleMapStreetChange,
                            onExtentChange: HandleExtentChange,
                            onHighlightStreetProperty: HandleStreetPropertyHighlight,
                            onHighlightListItem: HandleListItemHighlight,
                            onHighlightClear: HandleClearHighlight,
                            onSetCoordinate: HandleSetCoordinate,
                            onWizardSetCoordinate: HandleWizardSetCoordinate,
                            onSetLineGeometry: HandleSetLineGeometry,
                            onSetPolygonGeometry: HandleSetPolygonGeometry,
                            onPointCapture: HandlePointCapture,
                            onPinSelected: HandlePinSelected,
                            onDivideEsu: HandleDivideEsu,
                            onEsuDivided: HandleEsuDivided,
                            onSelectEsus: HandleSelectEsus,
                            onSelectPropertiesChange: HandleSelectPropertiesChange,
                          }}
                        >
                          <InformationContext.Provider
                            value={{
                              informationType: informationType,
                              informationSource: informationSource,
                              onDisplayInformation: HandleDisplayInformation,
                              onClearInformation: HandleClearInformation,
                            }}
                          >
                            <SaveConfirmationServiceProvider>
                              <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Fragment>
                                      <div style={{ display: "flex" }}>
                                        <CssBaseline />
                                        <ADSAppBar />
                                        <ADSNavContent uprn={property.uprn} />
                                        <main
                                          style={{
                                            flexGrow: 1,
                                            pl: "0px",
                                            pr: "0px",
                                          }}
                                        >
                                          <div style={{ height: `${appBarHeight}px` }} />
                                          <PageRouting />
                                        </main>
                                      </div>
                                      <LoginDialog
                                        isOpen={loginOpen}
                                        title="iManage Cloud Login"
                                        message="Enter your credentials."
                                      />
                                    </Fragment>
                                  </LocalizationProvider>
                                </ThemeProvider>
                              </StyledEngineProvider>
                            </SaveConfirmationServiceProvider>
                          </InformationContext.Provider>
                        </MapContext.Provider>
                      </PropertyContext.Provider>
                    </StreetContext.Provider>
                  </SettingsContext.Provider>
                </FilterContext.Provider>
              </SearchContext.Provider>
            </SandboxContext.Provider>
          </LookupContext.Provider>
        </userContext.Provider>
      </Router>
    </StylesProvider>
  );
}

export default App;
