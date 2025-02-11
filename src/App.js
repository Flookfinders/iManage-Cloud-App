//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: The main application file used for contexts etc.
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   16.08.22 Sean Flook          WI39??? Initial Revision.
//    002   16.03.23 Sean Flook          WI40583 Correctly set/reset propertyErrors.
//    003   28.03.23 Sean Flook          WI40632 Added source to HandleWizardDone.
//    004   29.03.23 Sean Flook          WI40634 Do not prevent the map extent from being set due to zoom level.
//    005   06.04.23 Sean Flook          WI40610 Include parentUprn in HandlePropertyValidateData.
//    006   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    007            Sean Flook                  Added newRecord parameter to the HandleStreetRecordChange function.
//    008   17.08.23 Sean Flook        IMANN-156 Modified to allow the login dialog to be displayed again after user has clicked cancel.
//    009   23.08.23 Sean Flook        IMANN-159 Use the new street template structure.
//    010   07.09.23 Sean Flook                  Added code to handle ESU maintenance.
//    011   20.09.23 Sean Flook                  Handle OneScotland specific records types.
//    012   10.10.23 Sean Flook        IMANN-163 Changes required to correctly handle opening the related tab after the property wizard has run.
//    013   12.10.23 Sean Flook                  Added code to deal with storing the expanded ESU and ASD items.
//    014   12.10.23 Sean Flook                  Reset the ESU and ASD list when resetting the street.
//    015   03.11.23 Sean Flook        IMANN-175 Changes required to select properties from the map.
//    016   10.11.23 Sean Flook        IMANN-175 Changes required for Move BLPU seed point.
//    017   20.11.23 Sean Flook                  Removed unwanted code.
//    018   24.11.23 Sean Flook                  Renamed successor to successorCrossRef.
//    019   01.12.23 Sean Flook        IMANN-194 Added HandleUpdateLookup to enable updating a single lookup type.
//    020   14.12.23 Sean Flook                  Corrected note record type and tidied up validation code.
//    021   19.12.23 Sean Flook                  Various bug fixes.
//    022   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    023   05.01.24 Sean Flook                  Use CSS shortcuts.
//    024   10.01.24 Sean Flook        IMANN-163 Added previousStreet and previousProperty.
//    025   12.01.24 Sean Flook        IMANN-163 Search results should be an array.
//    026   25.01.24 Sean Flook                  Changes required after UX review.
//    027   26.01.24 Sean Flook        IMANN-251 Only check why in HandleLeavingStreet.
//    028   05.02.24 Sean Flook                  Further changes required for operational districts.
//    029   13.02.24 Sean Flook                  Pass the authorityCode to ValidatePublicRightOfWayData.
//    030   14.02.24 Sean Flook         ASD10_GP Changes required to filter the ASD map layers when editing a record.
//    031   20.02.24 Sean Flook             MUL1 Changes required for handling selecting properties from the map.
//    032   26.02.24 Joel Benford      IMANN-242 Add DbAuthority to lookups context
//    033   27.02.24 Sean Flook            MUL16 Added ability too hide the search control.
//    034   05.03.24 Sean Flook        IMANN-338 Store the last opened street and property tab.
//    035   08.03.24 Sean Flook        IMANN-348 If clearing ESU from sandbox ensure highway dedication and one way exemption are also cleared.
//    036   11.03.24 Sean Flook            GLB12 Use appBarHeight to set the height of the control.
//    037   13.03.24 Sean Flook             MUL9 Changes required to enable related refresh.
//    038   04.04.24 Sean Flook                  Added navigate back and leaving a property.
//    039   05.04.24 Sean Flook        IMANN-351 Changes to handle browser navigation.
//    040   09.04.24 Sean Flook                  If we do not have user information do not close the login dialog.
//    041   11.04.24 Sean Flook                  Use title case for authority name rather than sentence case.
//    042   16.04.24 Sean Flook                  Changes required to handle loading and displaying SHP files.
//    043   18.04.24 Sean Flook        IMANN-351 Changes required to reload the contexts after a refresh.
//    044   30.04.24 Sean Flook        IMANN-371 Separate out streetTab and propertyTab.
//    045   01.05.24 Sean Flook                  Only reload contexts if required.
//    046   14.05.24 Joshua McCormick  IMANN-270 Typo in Validation  for errors with hww & prow
//    047   14.05.24 Sean Flook        IMANN-206 Changes required to display all the provenances.
//    048   30.05.24 Sean Flook        IMANN-499 Include settingsNode in the settingsContext reload.
//    049   04.06.24 Sean Flook        IMANN-510 Include the level field when validating the BLPU data.
//    050   04.06.24 Sean Flook        IMANN-511 Handle when we do not have an internet connection.
//    051   06.06.24 Sean Flook        IMANN-524 Ensure the sandbox has the current data.
//    052   12.06.24 Sean Flook        IMANN-536 Added some additional checking to HandleMapReload.
//    053   12.06.24 Sean Flook        IMANN-565 Handle polygon deletion.
//    054   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    055   20.06.24 Sean Flook        IMANN-636 Bug fix.
//    056   24.06.24 Sean Flook        IMANN-170 Changes required for cascading parent PAO changes to children.
//    057   01.07.24 Sean Flook        IMANN-592 Use sandboxRef.current in HandleResetSandbox.
//    058   04.07.24 Sean Flook        IMANN-705 Added displayName to contextUser.
//    059   08.07.24 Sean Flook        IMANN-728 Include the new user rights.
//    060   17.07.24 Sean Flook        IMANN-596 Modified HandleClearHighlight to set objects to empty arrays rather than null.
//    061   19.07.24 Sean Flook        IMANN-801 Added polling objects to Offline and Online and changed the polling interval from every 5 seconds to every 60 seconds.
//    062   23.07.24 Sean Flook        IMANN-801 Reduced the polling interval back to every 5 seconds.
//    063   06.08.24 Sean Flook        IMANN-903 Use a reference to store the loaded SHP files.
//    064   27.08.24 Sean Flook        IMANN-925 Corrected typo.
//    065   10.09.24 Sean Flook        IMANN-980 Set the showMessages rights for users and only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    066   26.09.24 Sean Flook        IMANN-573 Updated the version.
//    067   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//    068   28.10.24 Sean Flook       IMANN-1040 Clear the localStorage and sessionStorage items when logoff user.
//    069   28.10.24 Joshua McCormick  IMANN-904 added context for clearObject, setClearObject
//    070   05.11.24 Sean Flook        IMANN-904 Correctly handle clearing the geometry in HandleSetLineGeometry.
//    071   06.11.24 Sean Flook       IMANN-1047 Undo changes done for IMANN-904.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    066   13.11.24 Sean Flook       IMANN-1012 Updated the version.
//    067   27.11.24 Sean Flook       IMANN-1096 Do not store the lookups in the session storage.
//endregion Version 1.0.2.0
//region Version 1.0.3.0
//    068   02.01.25 Sean Flook       IMANN-1121 Updated the version.
//    069   07.01.25 Sean Flook       IMANN-1124 When opening the related tab always include the current property in the expand list.
//    070   09.01.25 Sean Flook       IMANN-1125 Moved code to prevent the calls to get the background data from being run multiple times.
//    071   13.01.25 Sean Flook       IMANN-1136 Various changes to improve editing provenances.
//    072   16.01.25 Sean Flook       IMANN-1136 Removed editingProvenance and changed provenanceMerged to provenanceMerging.
//endregion Version 1.0.3.0
//region Version 1.0.4.0
//    073   03.02.25 Sean Flook       IMANN-1676 Updated the version.
//    074   04.02.25 Sean Flook       IMANN-1674 Use the same zoom level for background streets and properties.
//    075   06.02.25 Sean Flook       IMANN-1679 If authorisation has expired display the home page.
//endregion Version 1.0.4.0
//region Version 1.0.5.0
//    076   22.01.25 Sean Flook       IMANN-1077 Updated the version.
//    077   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useState, useRef, Fragment } from "react";
import { Router } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
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
import { Offline, Online } from "react-detect-offline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  GetBackgroundStreetsUrl,
  GetUnassignedEsusUrl,
  GetBackgroundPropertiesUrl,
  GetBackgroundProvenancesUrl,
  GetPropertyFromUPRNUrl,
} from "./configuration/ADSConfig";
import { mapSelectSearchString, mergeArrays, StringToTitleCase } from "./utils/HelperUtils";
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
import { Typography, Box, Stack } from "@mui/material";
import LoginDialog from "./dialogs/LoginDialog";

import DETRCodes from "./data/DETRCodes";

import WifiOffIcon from "@mui/icons-material/WifiOff";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ThemeProvider, StyledEngineProvider, createTheme } from "@mui/material/styles";
import { appBarHeight } from "./utils/ADSStyles";
import StylesProvider from "@mui/styles/StylesProvider";
import { SaveConfirmationServiceProvider } from "./pages/SaveConfirmationPage";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";
import { adsLightGreyD } from "./utils/ADSColours";

function App() {
  const theme = createTheme();

  // let navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const userShowMessages = useRef(false);

  const [loginOpen, setLoginOpen] = useState(localStorage.getItem("currentUser") === null);
  const loginMessage = useRef("Enter your credentials.");

  const currentMapExtent = useRef(null);

  const guiVersion = "1.0.5.0";

  const onlinePolling = { enabled: true, url: "https://ipv4.icanhazip.com", interval: 5000, timeout: 5000 };
  const offlinePolling = { enabled: true, url: "https://ipv4.icanhazip.com", interval: 5000, timeout: 5000 };

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

  const sandboxRef = useRef({
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
  });
  const [sandbox, setSandbox] = useState(sandboxRef.current);

  const [propertyTab, setPropertyTab] = useState(0);
  const [streetTab, setStreetTab] = useState(0);

  const [refreshRelated, setRefreshRelated] = useState(false);

  const [searchData, setSearchData] = useState({
    searchString: "!+reload+!",
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

  const [settingsNode, setSettingsNode] = useState("");

  const [authorityDetails, setAuthorityDetails] = useState({
    userOrgName: null,
    dataProviderCode: null,
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
    descriptor: "!+reload+!",
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

  const [childCount, setChildCount] = useState(0);

  const [provenanceDataChanged, setProvenanceDataChanged] = useState(false);

  const [wizardData, setWizardData] = useState(null);

  const [backgroundData, setBackgroundData] = useState({
    streets: [],
    unassignedEsus: [],
    properties: [],
    provenances: [],
  });

  const [mapSearchData, setMapSearchData] = useState({
    streets: [],
    llpgStreets: [],
    properties: [],
    editStreet: null,
    editProperty: null,
  });

  const [sourceMapSearchData, setSourceMapSearchData] = useState({
    streets: [],
    llpgStreets: [],
    properties: [],
  });

  const [map, setMap] = useState({
    extents: [],
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
  const [loadedShpFiles, setLoadedShpFiles] = useState([]);
  const currentShpFiles = useRef([]);
  const [layerVisibility, setLayerVisibility] = useState({
    backgroundStreets: true,
    unassignedEsus: true,
    backgroundProvenances: false,
    backgroundProperties: true,
  });
  const [provenanceMerging, setProvenanceMerging] = useState(false);
  const [createToolActivated, setCreateToolActivated] = useState(false);

  const [pointCaptureMode, setPointCaptureMode] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const pointCaptureModeRef = useRef(null);
  const editObjectRef = useRef(null);

  const [informationType, setInformationType] = useState(null);
  const [informationSource, setInformationSource] = useState(null);

  //region userContext
  /**
   * Event to handle when the user changes.
   *
   * @param {object} userInfo The users information.
   */
  function HandleUserChange(userInfo) {
    if (userInfo) {
      userShowMessages.current =
        userInfo.active &&
        userInfo.extraInformation &&
        userInfo.extraInformation.length > 0 &&
        !!userInfo.extraInformation.find((x) => x.key === "ShowMessages" && x.value === "true");

      const user = {
        ...userInfo,
        displayName: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
        isAdministrator:
          userInfo.active &&
          (userInfo.rights.includes("LSGAdministrator") ||
            userInfo.rights.includes("ASDAdministrator") ||
            userInfo.rights.includes("LLPGAdministrator")),
        hasStreet:
          userInfo.active &&
          (userInfo.rights.includes("LSGReadOnly") ||
            userInfo.rights.includes("LSGEditor") ||
            userInfo.rights.includes("LSGAdministrator")),
        hasASD:
          userInfo.active &&
          (userInfo.rights.includes("ASDReadOnly") ||
            userInfo.rights.includes("ASDEditor") ||
            userInfo.rights.includes("ASDAdministrator")),
        hasProperty:
          userInfo.active &&
          (userInfo.rights.includes("LLPGReadOnly") ||
            userInfo.rights.includes("LLPGEditor") ||
            userInfo.rights.includes("LLPGAdministrator")),
        editStreet:
          userInfo.active && (userInfo.rights.includes("LSGEditor") || userInfo.rights.includes("LSGAdministrator")),
        adminStreet: userInfo.active && userInfo.rights.includes("LSGAdministrator"),
        editASD:
          userInfo.active && (userInfo.rights.includes("ASDEditor") || userInfo.rights.includes("ASDAdministrator")),
        adminASD: userInfo.active && userInfo.rights.includes("ASDAdministrator"),
        editProperty:
          userInfo.active && (userInfo.rights.includes("LLPGEditor") || userInfo.rights.includes("LLPGAdministrator")),
        adminProperty: userInfo.active && userInfo.rights.includes("LLPGAdministrator"),
        showMessages: userShowMessages.current,
      };

      setCurrentUser(user);
      if (loginOpen) setLoginOpen(false);
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      setCurrentUser(null);
      localStorage.removeItem("currentUser");

      sessionStorage.removeItem("authorityDetails");
      sessionStorage.removeItem("backgroundData");
      sessionStorage.removeItem("currentData");
      sessionStorage.removeItem("editObject");
      sessionStorage.removeItem("esu");
      sessionStorage.removeItem("expandedAsd");
      sessionStorage.removeItem("expandedEsu");
      sessionStorage.removeItem("displayInformation");
      sessionStorage.removeItem("GazetteerPage_firstLoadDone");
      sessionStorage.removeItem("highlight");
      sessionStorage.removeItem("lookups");
      sessionStorage.removeItem("map");
      sessionStorage.removeItem("mapExtent");
      sessionStorage.removeItem("mapLayers");
      sessionStorage.removeItem("mapProperty");
      sessionStorage.removeItem("mapSearch");
      sessionStorage.removeItem("mapStreet");
      sessionStorage.removeItem("metadata");
      sessionStorage.removeItem("property");
      sessionStorage.removeItem("propertyChildCount");
      sessionStorage.removeItem("propertyErrors");
      sessionStorage.removeItem("PropertyPage_firstLoadDone");
      sessionStorage.removeItem("propertyRecord");
      sessionStorage.removeItem("propertyTab");
      sessionStorage.removeItem("propertyTemplates");
      sessionStorage.removeItem("sandbox");
      sessionStorage.removeItem("search");
      sessionStorage.removeItem("SearchDataForm_firstLoadDone");
      sessionStorage.removeItem("searchFilter");
      sessionStorage.removeItem("settingsNode");
      sessionStorage.removeItem("SettingsPage_firstLoadDone");
      sessionStorage.removeItem("street");
      sessionStorage.removeItem("streetErrors");
      sessionStorage.removeItem("StreetPage_ApiUrl");
      sessionStorage.removeItem("StreetPage_firstLoadDone");
      sessionStorage.removeItem("streetRecord");
      sessionStorage.removeItem("streetTab");
      sessionStorage.removeItem("streetTemplate");
      sessionStorage.removeItem("wizardData");

      loginMessage.current = "Enter your credentials.";
      setLoginOpen(true);
    }
  }

  /**
   * Event to handle displaying the login dialog.
   */
  function HandleDisplayLogin() {
    setLoginOpen(true);
  }

  /**
   * Event to handle when the users authorisation has expired.
   */
  function HandleAuthorisationExpired() {
    // navigate("/"); // Return to the home page
    history.push("/"); // Ensure we are on the home page
    HandleResetStreet();
    HandleResetProperty();
    HandleSearchDataChange("", []);
    HandleResetSandbox();
    HandleBackgroundDataChange([], [], [], []);
    HandleMapSearchDataChange([], [], [], null, null);
    HandleMapChange([], null, null);
    HandleEditMapObject(null, null);
    HandleClearInformation();
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    loginMessage.current = "Authorisation has expired, re-enter your credentials.";
    setLoginOpen(true);
  }

  /**
   * Event to handle reloading the current user.
   */
  function HandleUserReload() {
    if (localStorage.getItem("currentUser") !== null && !currentUser) {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      setCurrentUser(savedUser);
    }
  }
  //endregion userContext

  //region lookupContext
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

    // sessionStorage.setItem(
    //   "lookups",
    //   JSON.stringify({
    //     validationMessages: validationMessages,
    //     localities: localities,
    //     towns: towns,
    //     islands: islands,
    //     adminAuthorities: adminAuthorities,
    //     operationalDistricts: operationalDistricts,
    //     appCrossRefs: appCrossRefs,
    //     subLocalities: subLocalities,
    //     streetDescriptors: streetDescriptors,
    //     postTowns: postTowns,
    //     postcodes: postcodes,
    //     wards: wards,
    //     parishes: parishes,
    //     dbAuthorities: dbAuthorities,
    //   })
    // );
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

    sessionStorage.setItem(
      "lookups",
      JSON.stringify({
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
      })
    );
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

    sessionStorage.setItem(
      "metadata",
      JSON.stringify({
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
      })
    );
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
   * Event to handle reloading the lookup context data from storage
   */
  function HandleLookupReload() {
    // if (sessionStorage.getItem("lookups") !== null && lookups.validationMessages.length === 0) {
    //   const savedLookups = JSON.parse(sessionStorage.getItem("lookups"));
    //   setLookups({
    //     validationMessages: savedLookups.validationMessages,
    //     localities: savedLookups.localities,
    //     towns: savedLookups.towns,
    //     islands: savedLookups.islands,
    //     adminAuthorities: savedLookups.adminAuthorities,
    //     operationalDistricts: savedLookups.operationalDistricts,
    //     appCrossRefs: savedLookups.appCrossRefs,
    //     subLocalities: savedLookups.subLocalities,
    //     streetDescriptors: savedLookups.streetDescriptors,
    //     postTowns: savedLookups.postTowns,
    //     postcodes: savedLookups.postcodes,
    //     wards: savedLookups.wards,
    //     parishes: savedLookups.parishes,
    //     dbAuthorities: savedLookups.dbAuthorities,
    //   });
    // }

    if (sessionStorage.getItem("metadata") !== null && !metadata) {
      const savedMetadata = JSON.parse(sessionStorage.getItem("metadata"));
      setMetadata({
        guiVersion: savedMetadata.guiVersion,
        apiVersion: savedMetadata.apiVersion ? savedMetadata.apiVersion : "unknown",
        coreVersion: savedMetadata.coreVersion ? savedMetadata.coreVersion : "unknown",
        lookupVersion: savedMetadata.lookupVersion ? savedMetadata.lookupVersion : "unknown",
        settingsVersion: savedMetadata.settingsVersion ? savedMetadata.settingsVersion : "unknown",
        iManageDbVersion: savedMetadata.iManageDbVersion ? savedMetadata.iManageDbVersion : "unknown",
        iExchangeDbVersion: savedMetadata.iExchangeDbVersion ? savedMetadata.iExchangeDbVersion : "unknown",
        iValidateDbVersion: savedMetadata.iValidateDbVersion ? savedMetadata.iValidateDbVersion : "unknown",
        indexDBServer: savedMetadata.iManageIndexMeta ? savedMetadata.iManageIndexMeta.dbserver : "unknown",
        indexDBName: savedMetadata.iManageIndexMeta ? savedMetadata.iManageIndexMeta.dbname : "unknown",
        indexBuiltOn: savedMetadata.iManageIndexMeta ? savedMetadata.iManageIndexMeta.builton : "unknown",
        indexElasticVersion: savedMetadata.iManageIndexMeta
          ? savedMetadata.iManageIndexMeta.elasticnugetversion
          : "unknown",
      });
    }
  }
  //endregion lookupContext

  //region sandboxContext
  /**
   * Event to handle when the sandbox data needs to be changed.
   *
   * @param {string} type The type of data that is being changed.
   * @param {object} updatedData The updated data object.
   */
  function HandleSandboxChange(type, updatedData) {
    const newSandbox = {
      sourceStreet: type === "sourceStreet" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.sourceStreet,
      currentStreet:
        type === "currentStreet" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.currentStreet,
      sourceProperty:
        type === "sourceProperty" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.sourceProperty,
      currentProperty:
        type === "currentProperty" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.currentProperty,
      currentStreetRecords: {
        streetDescriptor:
          type === "streetDescriptor"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.streetDescriptor,
        esu: type === "esu" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.currentStreetRecords.esu,
        highwayDedication:
          type === "highwayDedication" || (type === "esu" && !updatedData)
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.highwayDedication,
        oneWayExemption:
          type === "oneWayExemption" || (type === "esu" && !updatedData)
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.oneWayExemption,
        successorCrossRef:
          type === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.successorCrossRef,
        maintenanceResponsibility:
          type === "maintenanceResponsibility"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.maintenanceResponsibility,
        reinstatementCategory:
          type === "reinstatementCategory"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.reinstatementCategory,
        osSpecialDesignation:
          type === "osSpecialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.osSpecialDesignation,
        interest:
          type === "interest"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.interest,
        construction:
          type === "construction"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.construction,
        specialDesignation:
          type === "specialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.specialDesignation,
        hww: type === "hww" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.currentStreetRecords.hww,
        prow: type === "prow" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.currentStreetRecords.prow,
        note:
          type === "streetNote"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentStreetRecords.note,
      },
      currentPropertyRecords: {
        lpi: type === "lpi" ? JSON.parse(JSON.stringify(updatedData)) : sandboxRef.current.currentPropertyRecords.lpi,
        appCrossRef:
          type === "appCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentPropertyRecords.appCrossRef,
        provenance:
          type === "provenance"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentPropertyRecords.provenance,
        classification:
          type === "classification"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentPropertyRecords.classification,
        organisation:
          type === "organisation"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentPropertyRecords.organisation,
        successorCrossRef:
          type === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentPropertyRecords.successorCrossRef,
        note:
          type === "propertyNote"
            ? JSON.parse(JSON.stringify(updatedData))
            : sandboxRef.current.currentPropertyRecords.note,
      },
    };
    sandboxRef.current = newSandbox;
    setSandbox(newSandbox);
    sessionStorage.setItem("sandbox", JSON.stringify(newSandbox));
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
          : sandboxRef.current.sourceStreet,
      currentStreet:
        updateType === "currentStreet"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["currentStreet", "allProperty", "allStreet"].includes(clearType)
          ? null
          : sandboxRef.current.currentStreet,
      sourceProperty:
        updateType === "sourceProperty"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["sourceProperty", "allStreet"].includes(clearType)
          ? null
          : sandboxRef.current.sourceProperty,
      currentProperty:
        updateType === "currentProperty"
          ? JSON.parse(JSON.stringify(updatedData))
          : ["currentProperty", "allProperty", "allStreet"].includes(clearType)
          ? null
          : sandboxRef.current.currentProperty,
      currentStreetRecords: {
        streetDescriptor:
          updateType === "streetDescriptor"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["streetDescriptor", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.streetDescriptor,
        esu:
          updateType === "esu"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["esu", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.esu,
        highwayDedication:
          updateType === "highwayDedication"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["esu", "highwayDedication", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.highwayDedication,
        oneWayExemption:
          updateType === "oneWayExemption"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["esu", "oneWayExemption", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.oneWayExemption,
        successorCrossRef:
          updateType === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["successorCrossRef", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.successorCrossRef,
        maintenanceResponsibility:
          updateType === "maintenanceResponsibility"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["maintenanceResponsibility", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.maintenanceResponsibility,
        reinstatementCategory:
          updateType === "reinstatementCategory"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["reinstatementCategory", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.reinstatementCategory,
        osSpecialDesignation:
          updateType === "osSpecialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["osSpecialDesignation", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.osSpecialDesignation,
        interest:
          updateType === "interest"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["interest", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.interest,
        construction:
          updateType === "construction"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["construction", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.construction,
        specialDesignation:
          updateType === "specialDesignation"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["specialDesignation", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.specialDesignation,
        hww:
          updateType === "hww"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["hww", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.hww,
        prow:
          updateType === "prow"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["prow", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.prow,
        note:
          updateType === "streetNote"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["streetNote", "allAssociatedStreet", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentStreetRecords.note,
      },
      currentPropertyRecords: {
        lpi:
          updateType === "lpi"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["lpi", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.lpi,
        appCrossRef:
          updateType === "appCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["appCrossRef", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.appCrossRef,
        provenance:
          updateType === "provenance"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["provenance", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.provenance,
        classification:
          updateType === "classification"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["classification", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.classification,
        organisation:
          updateType === "organisation"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["organisation", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.organisation,
        successorCrossRef:
          updateType === "successorCrossRef"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["successorCrossRef", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.successorCrossRef,
        note:
          updateType === "propertyNote"
            ? JSON.parse(JSON.stringify(updatedData))
            : ["propertyNote", "allAssociatedProperty", "allProperty", "allStreet"].includes(clearType)
            ? null
            : sandboxRef.current.currentPropertyRecords.note,
      },
    };
    sandboxRef.current = newSandbox;
    setSandbox(newSandbox);
    sessionStorage.setItem("sandbox", JSON.stringify(newSandbox));
  }

  /**
   * Event to handle when the tab changes on the street form.
   *
   * @param {number} newValue The new tab value
   */
  function HandleStreetTabChange(newValue) {
    setStreetTab(newValue);
    sessionStorage.setItem("streetTab", JSON.stringify(newValue));
  }

  /**
   * Event to handle when the tab changes on the property form.
   *
   * @param {number} newValue The new tab value
   */
  function HandlePropertyTabChange(newValue) {
    setPropertyTab(newValue);
    sessionStorage.setItem("propertyTab", JSON.stringify(newValue));
  }

  /**
   * Event to handle the resetting of the data in the sandbox.
   *
   * @param {string} sourceType The type of data that is being reset in the sandbox.
   */
  function HandleResetSandbox(sourceType) {
    const resetSandbox = {
      sourceStreet: sourceType !== "street" ? null : sandboxRef.current.sourceStreet,
      currentStreet: null,
      sourceProperty: sourceType !== "property" ? null : sandboxRef.current.sourceProperty,
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
    };
    sandboxRef.current = resetSandbox;
    setSandbox(resetSandbox);
    setStreetTab(["street", "property"].includes(sourceType) ? 0 : streetTab);
    setPropertyTab(["street", "property"].includes(sourceType) ? 0 : propertyTab);
    sessionStorage.setItem("sandbox", JSON.stringify(resetSandbox));
    sessionStorage.setItem("streetTab", JSON.stringify(!["street", "property"].includes(sourceType) ? 0 : streetTab));
    sessionStorage.setItem(
      "propertyTab",
      JSON.stringify(!["street", "property"].includes(sourceType) ? 0 : propertyTab)
    );
  }

  /**
   * Event to handle reloading the sandbox context data from storage
   */
  function HandleSandboxReload() {
    if (
      sessionStorage.getItem("sandbox") !== null &&
      !sandbox.sourceStreet &&
      !sandbox.currentStreet &&
      !sandbox.sourceProperty &&
      !sandbox.currentProperty &&
      !sandbox.currentStreetRecords.streetDescriptor &&
      !sandbox.currentStreetRecords.esu &&
      !sandbox.currentStreetRecords.highwayDedication &&
      !sandbox.currentStreetRecords.oneWayExemption &&
      !sandbox.currentStreetRecords.successorCrossRef &&
      !sandbox.currentStreetRecords.maintenanceResponsibility &&
      !sandbox.currentStreetRecords.reinstatementCategory &&
      !sandbox.currentStreetRecords.osSpecialDesignation &&
      !sandbox.currentStreetRecords.interest &&
      !sandbox.currentStreetRecords.construction &&
      !sandbox.currentStreetRecords.specialDesignation &&
      !sandbox.currentStreetRecords.hww &&
      !sandbox.currentStreetRecords.prow &&
      !sandbox.currentStreetRecords.note &&
      !sandbox.currentPropertyRecords.lpi &&
      !sandbox.currentPropertyRecords.appCrossRef &&
      !sandbox.currentPropertyRecords.provenance &&
      !sandbox.currentPropertyRecords.classification &&
      !sandbox.currentPropertyRecords.organisation &&
      !sandbox.currentPropertyRecords.successorCrossRef &&
      !sandbox.currentPropertyRecords.note
    ) {
      sandboxRef.current = JSON.parse(sessionStorage.getItem("sandbox"));
      setSandbox(sandboxRef.current);
      setStreetTab(JSON.parse(sessionStorage.getItem("streetTab")));
      setPropertyTab(JSON.parse(sessionStorage.getItem("propertyTab")));
    }
  }

  /**
   * Event to handle refreshing the related data.
   *
   * @param {boolean} refresh True if the related data needs to be refreshed; otherwise false.
   */
  function HandleRefreshRelated(refresh) {
    setRefreshRelated(refresh);
  }
  //endregion sandboxContext

  //region searchContext
  /**
   * Event to handle when the search data has been changed.
   *
   * @param {string} searchString The search string that was used to perform the search.
   * @param {array} data The data that has been returned by the search.
   * @param {boolean} [reloading=false] True if this is called from the reloading method; otherwise false.
   */
  function HandleSearchDataChange(searchString, data, reloading = false) {
    setPreviousSearchData({
      searchString: searchData.searchString,
      results: searchData.results,
    });

    setSearchData({ searchString: searchString, results: data });

    if (!reloading) {
      sessionStorage.setItem("search", JSON.stringify({ searchString: searchString, results: data }));
    }
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
   * Event to handle reloading the search context data from storage
   */
  function HandleSearchReload() {
    if (sessionStorage.getItem("search") !== null && searchData.searchString === "!+reload+!") {
      const savedSearchData = JSON.parse(sessionStorage.getItem("search"));
      HandleSearchDataChange(savedSearchData.searchString, savedSearchData.results, true);
    }
  }
  //endregion searchContext

  //region filterContext
  /**
   * Event to handle when the search filter data changes.
   *
   * @param {object} filterData The data used to filter the search.
   */
  function HandleSearchFilterChange(filterData) {
    setSearchFilter(filterData);
    sessionStorage.setItem("searchFilter", JSON.stringify(filterData));
  }

  /**
   * Event to handle reloading the filter context data from storage
   */
  function HandleFilterReload() {
    if (sessionStorage.getItem("searchFilter") !== null) {
      setSearchFilter(JSON.parse(sessionStorage.getItem("searchFilter")));
    }
  }
  //endregion filterContext

  //region settingsContext
  /**
   * Event to handle when the settings node changes.
   *
   * @param {number} nodeId The id of the node.
   */
  function HandleNodeChange(nodeId) {
    setSettingsNode(nodeId);
    sessionStorage.setItem("settingsNode", JSON.stringify(nodeId));
  }

  /**
   * Event to handle when the authority details change.
   *
   * @param {object} details The authority details.
   * @param {boolean} [reloading=false] True if this is called from the reloading method; otherwise false.
   */
  function HandleAuthorityDetailsChange(details, reloading = false) {
    setAuthorityDetails(details);

    if (details) {
      const authority = Number(details.dataProviderCode);
      setAuthorityCode(authority);
      const authorityRecord = DETRCodes.find((x) => x.id === authority);
      if (authorityRecord)
        setAuthorityName(StringToTitleCase(authorityRecord.text).replace("Of", "of").replace("And", "and"));
      else setAuthorityName("");
      setIsScottish(authority >= 9000 && authority <= 9999 && authority !== 9904);
      setIsWelsh(authority >= 6000 && authority <= 6999);
      if (details.tabText) {
        if (details.tabText !== document.title) document.title = details.tabText;
      } else {
        if (authorityRecord)
          document.title = `iManage Cloud (${StringToTitleCase(authorityRecord.text)
            .replace("Of", "of")
            .replace("And", "and")})`;
        else document.title = "iManage Cloud";
      }
    } else {
      setAuthorityCode(0);
      setAuthorityName("");
      setIsScottish(false);
      setIsWelsh(false);
      document.title = "iManage Cloud";
    }

    if (!reloading) {
      sessionStorage.setItem("authorityDetails", JSON.stringify(details));
    }
  }

  /**
   * Event to handle when the array of property templates change.
   *
   * @param {array} templates Array of property templates.
   */
  function HandlePropertyTemplatesChange(templates) {
    setPropertyTemplates(templates);
    sessionStorage.setItem("propertyTemplates", JSON.stringify(templates));
  }

  /**
   * Event to handle when the street template changes.
   *
   * @param {object} template The street template.
   */
  function HandleStreetTemplateChange(template) {
    setStreetTemplate(template);
    sessionStorage.setItem("streetTemplate", JSON.stringify(template));
  }

  /**
   * Event to handle when the array of map layers have changed.
   *
   * @param {array} data The list of map layers to be used by the application.
   */
  function HandleMapLayersChange(data) {
    setMapLayers(data);
    sessionStorage.setItem("mapLayers", JSON.stringify(data));
  }

  /**
   * Event to handle reloading the settings context data from storage
   */
  function HandleSettingsReload() {
    if (sessionStorage.getItem("settingsNode") !== null) {
      setSettingsNode(JSON.parse(sessionStorage.getItem("settingsNode")));
    }

    if (sessionStorage.getItem("authorityDetails") !== null && !authorityDetails.dataProviderCode) {
      HandleAuthorityDetailsChange(JSON.parse(sessionStorage.getItem("authorityDetails")), true);
    }

    if (sessionStorage.getItem("propertyTemplates") !== null && propertyTemplates.length === 0) {
      setPropertyTemplates(JSON.parse(sessionStorage.getItem("propertyTemplates")));
    }

    if (sessionStorage.getItem("streetTemplate") !== null) {
      setStreetTemplate(JSON.parse(sessionStorage.getItem("streetTemplate")));
    }

    if (sessionStorage.getItem("mapLayers") !== null && !mapLayers) {
      setMapLayers(JSON.parse(sessionStorage.getItem("mapLayers")));
    }
  }
  //endregion settingsContext

  //region streetContext
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

    sessionStorage.setItem(
      "street",
      JSON.stringify({
        usrn: usrn,
        descriptor: descriptor,
        newStreet: newStreet,
        openRelated: openRelated ? openRelated : street.openRelated,
      })
    );

    // if (usrn && usrn > 0) navigate(`/street/${usrn}`);
    // else if (newStreet) {
    //   setCreatingStreet(true);
    //   navigate("/street/0");
    // }
    if (usrn && usrn > 0) history.push(`/street/${usrn}`);
    else if (newStreet) {
      setCreatingStreet(true);
      history.push("/street/0");
    }
  }

  /**
   * Event to handle when the current street data has been updated.
   *
   * @param {number} usrn The USRN of the street.
   * @param {string} descriptor The descriptor for the street.
   * @param {boolean} newStreet True if this is a new street; otherwise false.
   * @param {number|null} [openRelated=null] If present it contains the USRN of the street that we need the the related tab opened.
   */
  function HandleUpdateCurrentStreet(usrn, descriptor, newStreet, openRelated = null) {
    setStreet({
      usrn: usrn,
      descriptor: descriptor,
      newStreet: newStreet,
      openRelated: openRelated ? openRelated : street.openRelated,
    });

    sessionStorage.setItem(
      "street",
      JSON.stringify({
        usrn: usrn,
        descriptor: descriptor,
        newStreet: newStreet,
        openRelated: openRelated ? openRelated : street.openRelated,
      })
    );
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
   * @param {boolean} [reloading=false] True if this is called from the reloading method; otherwise false.
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
    noteErrors,
    reloading = false
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

    if (!reloading) {
      sessionStorage.setItem(
        "streetErrors",
        JSON.stringify({
          street: streetErrors && streetErrors.length > 0 ? streetErrors : [],
          descriptor: descriptorErrors && descriptorErrors.length > 0 ? descriptorErrors : [],
          esu: esuErrors && esuErrors.length > 0 ? esuErrors : [],
          highwayDedication:
            highwayDedicationErrors && highwayDedicationErrors.length > 0 ? highwayDedicationErrors : [],
          oneWayExemption: oneWayExemptionErrors && oneWayExemptionErrors.length > 0 ? oneWayExemptionErrors : [],
          successorCrossRef:
            successorCrossRefErrors && successorCrossRefErrors.length > 0 ? successorCrossRefErrors : [],
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
          heightWidthWeight:
            heightWidthWeightErrors && heightWidthWeightErrors.length > 0 ? heightWidthWeightErrors : [],
          publicRightOfWay: publicRightOfWayErrors && publicRightOfWayErrors.length > 0 ? publicRightOfWayErrors : [],
          note: noteErrors && noteErrors.length > 0 ? noteErrors : [],
        })
      );
    }
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
    sessionStorage.setItem(
      "streetRecord",
      JSON.stringify({ type: type, id: id, index: index, parentIndex: parentIndex, newRecord: newRecord })
    );
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
    sessionStorage.setItem("esu", esuId);
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
    sessionStorage.setItem("expandedEsu", JSON.stringify(newList));
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
    sessionStorage.setItem("expandedAsd", JSON.stringify(newList));
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
        type === "successorCrossRef" ? newErrors : streetErrors.successorCrossRef,
        type === "highwayDedication" ? newErrors : streetErrors.highwayDedication,
        type === "oneWayExemption" ? newErrors : streetErrors.oneWayExemption,
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
          if (sandbox.currentStreetRecords.hww) {
            const heightWidthWeightErrors = ValidateHeightWidthWeightData(
              sandbox.currentStreetRecords.hww,
              streetRecord.index,
              lookups
            );
            isValid = heightWidthWeightErrors.length === 0;
            updateStreetErrors(heightWidthWeightErrors, "heightWidthWeight");
          }
          break;

        case 66:
          if (sandbox.currentStreetRecords.prow) {
            const publicRightOfWayErrors = ValidatePublicRightOfWayData(
              sandbox.currentStreetRecords.prow,
              streetRecord.index,
              lookups
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
   * Event to handle reloading the street context data from storage
   */
  function HandleStreetReload() {
    if (sessionStorage.getItem("street") !== null && street.descriptor === "!+reload+!") {
      const savedStreet = JSON.parse(sessionStorage.getItem("street"));
      setStreet({
        usrn: savedStreet.usrn,
        descriptor: savedStreet.descriptor,
        newStreet: savedStreet.newStreet,
        openRelated: savedStreet.openRelated ? savedStreet.openRelated : street.openRelated,
      });
    }

    if (
      sessionStorage.getItem("streetErrors") !== null &&
      streetErrors.street.length === 0 &&
      streetErrors.descriptor.length === 0 &&
      streetErrors.esu.length === 0 &&
      streetErrors.highwayDedication.length === 0 &&
      streetErrors.oneWayExemption.length === 0 &&
      streetErrors.successorCrossRef.length === 0 &&
      streetErrors.interest.length === 0 &&
      streetErrors.maintenanceResponsibility.length === 0 &&
      streetErrors.reinstatementCategory.length === 0 &&
      streetErrors.osSpecialDesignation.length === 0 &&
      streetErrors.construction.length === 0 &&
      streetErrors.specialDesignation.length === 0 &&
      streetErrors.heightWidthWeight.length === 0 &&
      streetErrors.publicRightOfWay.length === 0 &&
      streetErrors.note.length
    ) {
      const savedStreetErrors = JSON.parse(sessionStorage.getItem("streetErrors"));
      HandleStreetErrors(
        savedStreetErrors.streetErrors,
        savedStreetErrors.descriptorErrors,
        savedStreetErrors.esuErrors,
        savedStreetErrors.successorCrossRefErrors,
        savedStreetErrors.highwayDedicationErrors,
        savedStreetErrors.oneWayExemptionErrors,
        savedStreetErrors.maintenanceResponsibilityErrors,
        savedStreetErrors.reinstatementCategoryErrors,
        savedStreetErrors.osSpecialDesignationErrors,
        savedStreetErrors.interestErrors,
        savedStreetErrors.constructionErrors,
        savedStreetErrors.specialDesignationErrors,
        savedStreetErrors.heightWidthWeightErrors,
        savedStreetErrors.publicRightOfWayErrors,
        savedStreetErrors.noteErrors,
        true
      );
    }

    if (
      sessionStorage.getItem("streetRecord") !== null &&
      streetRecord.type === 11 &&
      !streetRecord.id &&
      !streetRecord.index
    ) {
      const savedStreetRecord = JSON.parse(sessionStorage.getItem("streetRecord"));
      setStreetRecord({
        type: savedStreetRecord.type,
        id: savedStreetRecord.id,
        index: savedStreetRecord.index,
        parentIndex: savedStreetRecord.parentIndex,
        newRecord: savedStreetRecord.newRecord,
      });
    }

    if (sessionStorage.getItem("esu") !== null && !selectedMapEsuId) {
      setSelectedMapEsuId(Number(sessionStorage.getItem("esu")));
    }

    if (sessionStorage.getItem("expandedEsu") !== null && expandedEsu.length === 0) {
      setExpandedEsu(JSON.parse(sessionStorage.getItem("expandedEsu")));
    }

    if (sessionStorage.getItem("expandedAsd") !== null && expandedAsd.length === 0) {
      setExpandedAsd(JSON.parse(sessionStorage.getItem("expandedAsd")));
    }
  }
  //endregion streetContext

  //region propertyContext
  /**
   * Event to handle the changing of a property.
   *
   * @param {Number} uprn The UPRN of the property.
   * @param {Number} usrn The USRN of the street the property is on.
   * @param {String} address The address of the property.
   * @param {String} formattedAddress The formatted address for the property.
   * @param {String} postcode The postcode for the address.
   * @param {Number} easting The easting of the property.
   * @param {Number} northing The northing of the property.
   * @param {Boolean} newProperty True if this is a new property; otherwise false.
   * @param {Object|null} parent The parent object for the property.
   * @param {Object|null} [openRelated=null] If present it contains the UPRN of the property that we need the the related tab opened.
   * @param {Boolean} [reloading=false] True if this is called from the reloading method; otherwise false.
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
    openRelated = null,
    reloading = false
  ) {
    async function GetParentUprn(uprn) {
      const propertyUrl = GetPropertyFromUPRNUrl(openRelated.currentUser.token);

      if (propertyUrl) {
        const parentUprn = await fetch(`${propertyUrl.url}/${uprn}`, {
          headers: propertyUrl.headers,
          crossDomain: true,
          method: "GET",
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => {
            if (res.status === 401) {
              HandleAuthorisationExpired();
              return null;
            } else {
              return res.json();
            }
          })
          .then(
            (result) => {
              return result.parentUprn;
            },
            (error) => {
              if (userShowMessages.current) console.error("[ERROR] Get Property data", error);
              return null;
            }
          );

        return parentUprn;
      } else return null;
    }

    let relatedProperty = null;

    if (openRelated) {
      let expandList = [`${openRelated.property.toString()}`];
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

    if (!reloading) {
      sessionStorage.setItem(
        "property",
        JSON.stringify({
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
        })
      );
    }

    // if (uprn && uprn > 0) navigate(`/property/${uprn}`);
    // else if (newProperty) navigate("/property/0");
    if (uprn && uprn > 0) history.push(`/property/${uprn}`);
    else if (newProperty) history.push("/property/0");
  }

  /**
   * Event to handle the changing of a property.
   *
   * @param {Number} uprn The UPRN of the property.
   * @param {Number} usrn The USRN of the street the property is on.
   * @param {String} address The address of the property.
   * @param {String} formattedAddress The formatted address for the property.
   * @param {String} postcode The postcode for the address.
   * @param {Number} easting The easting of the property.
   * @param {Number} northing The northing of the property.
   * @param {Boolean} newProperty True if this is a new property; otherwise false.
   * @param {Object|null} parent The parent object for the property.
   */
  function HandleUpdateCurrentProperty(
    uprn,
    usrn,
    address,
    formattedAddress,
    postcode,
    easting,
    northing,
    newProperty,
    parent
  ) {
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
      openRelated: property.openRelated,
    });

    sessionStorage.setItem(
      "property",
      JSON.stringify({
        uprn: uprn,
        usrn: usrn,
        address: address,
        formattedAddress: formattedAddress,
        postcode: postcode,
        easting: easting,
        northing: northing,
        newProperty: newProperty,
        parent: parent,
        openRelated: property.openRelated,
      })
    );
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
   * @param {boolean} [reloading=false] True if this is called from the reloading method; otherwise false.
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
    pkId,
    reloading = false
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

    if (!reloading) {
      sessionStorage.setItem(
        "propertyErrors",
        JSON.stringify({
          pkId: pkId,
          blpu: blpuErrors && blpuErrors.length > 0 ? blpuErrors : [],
          lpi: lpiErrors && lpiErrors.length > 0 ? lpiErrors : [],
          provenance: provenanceErrors && provenanceErrors.length > 0 ? provenanceErrors : [],
          crossRef: crossRefErrors && crossRefErrors.length > 0 ? crossRefErrors : [],
          classification: classificationErrors && classificationErrors.length > 0 ? classificationErrors : [],
          organisation: organisationErrors && organisationErrors.length > 0 ? organisationErrors : [],
          successorCrossRef:
            successorCrossRefErrors && successorCrossRefErrors.length > 0 ? successorCrossRefErrors : [],
          note: noteErrors && noteErrors.length > 0 ? noteErrors : [],
        })
      );
    }
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

    sessionStorage.setItem("propertyRecord", JSON.stringify({ type: type, index: index, newRecord: newRecord }));
  }

  /**
   * Event to handle when the number of children the property has changes.
   *
   * @param {Number} childCount The number of children the property has.
   */
  function HandleChildCountChange(childCount) {
    setChildCount(childCount);
    sessionStorage.setItem("propertyChildCount", childCount);
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

    sessionStorage.setItem("wizardData", JSON.stringify({ ...data, isRange: isRange, parent: parent, source: source }));
  }

  /**
   * Event to handle the resetting of the property.
   */
  function HandleResetProperty() {
    previousProperty.current = property;
    HandlePropertyChange(0, 0, "", "", "", 0, 0, false, null, null);
    setLogicalStatus(null);
  }

  /**
   * Event to handle the restoring of the property state object.
   */
  function HandleRestoreProperty() {
    setProperty(previousProperty.current);
    sessionStorage.setItem("property", JSON.stringify(previousProperty.current));
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

    sessionStorage.setItem(
      "property",
      JSON.stringify({
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
      })
    );
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

    sessionStorage.setItem(
      "propertyErrors",
      JSON.stringify({
        blpu: [],
        lpi: [],
        provenance: [],
        crossRef: [],
        classification: [],
        organisation: [],
        successorCrossRef: [],
        note: [],
      })
    );
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
              level: sandbox.currentProperty.level,
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
   * Event to handle reloading the property context data from storage
   */
  function HandlePropertyReload() {
    if (sessionStorage.getItem("property") !== null && property.uprn === 0 && property.usrn === 0) {
      const savedProperty = JSON.parse(sessionStorage.getItem("property"));
      HandlePropertyChange(
        savedProperty.uprn,
        savedProperty.usrn,
        savedProperty.address,
        savedProperty.formattedAddress,
        savedProperty.postcode,
        savedProperty.easting,
        savedProperty.northing,
        savedProperty.newProperty,
        savedProperty.parent,
        savedProperty.openRelated,
        true
      );
    }

    if (
      sessionStorage.getItem("propertyErrors") !== null &&
      propertyErrors.blpu.length === 0 &&
      propertyErrors.lpi.length === 0 &&
      propertyErrors.provenance.length === 0 &&
      propertyErrors.crossRef.length === 0 &&
      propertyErrors.classification.length === 0 &&
      propertyErrors.organisation.length === 0 &&
      propertyErrors.successorCrossRef.length === 0 &&
      propertyErrors.note.length === 0
    ) {
      const savedPropertyErrors = JSON.parse(sessionStorage.getItem("propertyErrors"));
      HandlePropertyErrors(
        savedPropertyErrors.blpu,
        savedPropertyErrors.lpi,
        savedPropertyErrors.provenance,
        savedPropertyErrors.crossRef,
        savedPropertyErrors.classification,
        savedPropertyErrors.organisation,
        savedPropertyErrors.successorCrossRef,
        savedPropertyErrors.note,
        savedPropertyErrors.pkId,
        true
      );
    }

    if (sessionStorage.getItem("propertyRecord") !== null && propertyRecord.type === 21 && !propertyRecord.index) {
      const savedPropertRecord = JSON.parse(sessionStorage.getItem("propertyRecord"));
      setPropertyRecord({
        type: savedPropertRecord.type,
        index: savedPropertRecord.index,
        newRecord: savedPropertRecord.newRecord,
      });
    }

    if (sessionStorage.getItem("propertyChildCount") !== null) {
      setChildCount(Number(sessionStorage.getItem("propertyChildCount")));
    }

    if (sessionStorage.getItem("wizardData") !== null && !wizardData) {
      setWizardData(JSON.parse(sessionStorage.getItem("wizardData")));
    }
  }
  //endregion propertyContext

  //region mapContext
  /**
   * Event to handle when background mapping data changes.
   *
   * @param {Array} streets The list of background streets.
   * @param {Array} unassignedEsus The list of unassigned ESUs.
   * @param {Array} properties The list of background properties.
   * @param {Array} provenances The list of background provenances.
   */
  function HandleBackgroundDataChange(streets, unassignedEsus, properties, provenances) {
    setBackgroundData({
      streets: streets,
      unassignedEsus: unassignedEsus,
      properties: properties,
      provenances: provenances,
    });

    sessionStorage.setItem(
      "backgroundData",
      JSON.stringify({
        streets: streets,
        unassignedEsus: unassignedEsus,
        properties: properties,
        provenances: provenances,
      })
    );
  }

  /**
   * Event to handle when the mapping data changes for a search.
   *
   * @param {Array|null} streets The list of streets returned by the search.
   * @param {Array|null} llpgStreets The list of LLPG streets returned by the search.
   * @param {Array|null} properties The list of properties returned by the search.
   * @param {number|null} editStreet The USRN of the street that is being edited.
   * @param {number|null} editProperty The UPRN of the property that is being edited.
   */
  function HandleMapSearchDataChange(streets, llpgStreets, properties, editStreet, editProperty, reloading = false) {
    setMapSearchData({
      streets: streets,
      llpgStreets: llpgStreets,
      properties: properties,
      editStreet: editStreet,
      editProperty: editProperty,
    });

    if (!reloading) {
      sessionStorage.setItem(
        "mapSearch",
        JSON.stringify({
          streets: streets,
          llpgStreets: llpgStreets,
          properties: properties,
          editStreet: editStreet,
          editProperty: editProperty,
        })
      );
    }

    if (!editStreet && editStreet !== 0 && !editProperty && editProperty !== 0) {
      setSourceMapSearchData({ streets: streets, llpgStreets: llpgStreets, properties: properties });
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

    sessionStorage.setItem(
      "map",
      JSON.stringify({
        extents: extents,
        zoomStreet: zoomStreet,
        zoomProperty: zoomProperty,
      })
    );
  }

  /**
   * Event to handle when the property changes.
   *
   * @param {object} property The current property.
   */
  function HandleMapPropertyChange(property) {
    setMapProperty(property);

    sessionStorage.setItem("mapProperty", JSON.stringify(property));
  }

  /**
   * Event to handle when the street changes.
   *
   * @param {object} street The current street.
   */
  function HandleMapStreetChange(street) {
    setMapStreet(street);

    sessionStorage.setItem("mapStreet", JSON.stringify(property));
  }

  /**
   * Event to handle editing a map object.
   *
   * @param {number} objectType The type of map object being edited.
   * @param {number} objectId The id of the object being edited.
   */
  function HandleEditMapObject(objectType, objectId, reloading = false) {
    if (!objectType) {
      setEditObject(null);
      editObjectRef.current = null;
      setCreateToolActivated(false);
    } else {
      setEditObject({ objectType: objectType, objectId: objectId });
      editObjectRef.current = { objectType: objectType, objectId: objectId };
    }

    if (!reloading) {
      sessionStorage.setItem("editObject", JSON.stringify({ objectType: objectType, objectId: objectId }));
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

    const backgroundStreetsUrl = GetBackgroundStreetsUrl(currentUser);

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
                if (userShowMessages.current) console.error(`[400 ERROR] Getting all Street data`, body.errors);
              });
              return null;

            case 401:
              HandleAuthorisationExpired();
              return null;

            case 500:
              if (userShowMessages.current) console.error(`[500 ERROR] Getting all Street data`, res);
              return null;

            default:
              if (userShowMessages.current) console.error(`[${res.status} ERROR] Getting all Street data`, res);
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

    const unassignedEsusUrl = GetUnassignedEsusUrl(currentUser);

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
                if (userShowMessages.current) console.error(`[400 ERROR] Getting all unassigned ESU data`, body.errors);
              });
              return null;

            case 401:
              HandleAuthorisationExpired();
              return null;

            case 500:
              if (userShowMessages.current) console.error(`[500 ERROR] Getting all unassigned ESU data`, res);
              return null;

            default:
              if (userShowMessages.current) console.error(`[${res.status} ERROR] Getting all unassigned ESU data`, res);
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
    if (!currentUser || extent.zoomLevel < 16) return null;

    const backgroundPropertiesUrl = GetBackgroundPropertiesUrl(currentUser);

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
                if (userShowMessages.current) console.error(`[400 ERROR] Getting all property data`, body.errors);
              });
              return null;

            case 401:
              HandleAuthorisationExpired();
              return null;

            case 500:
              if (userShowMessages.current) console.error(`[500 ERROR] Getting all property data`, res);
              return null;

            default:
              if (userShowMessages.current) console.error(`[${res.status} ERROR] Getting all property data`, res);
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
  async function GetBackgroundProvenanceData(extent) {
    if (!currentUser || extent.zoomLevel < 16) return null;

    const backgroundProvenancesUrl = GetBackgroundProvenancesUrl(currentUser);

    if (backgroundProvenancesUrl) {
      const returnValue = await fetch(
        `${backgroundProvenancesUrl.url}?XMin=${extent.xmin}&YMin=${extent.ymin}&XMax=${extent.xmax}&YMax=${extent.ymax}`,
        {
          headers: backgroundProvenancesUrl.headers,
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
                if (userShowMessages.current) console.error(`[400 ERROR] Getting all provenance data`, body.errors);
              });
              return null;

            case 401:
              HandleAuthorisationExpired();
              return null;

            case 500:
              if (userShowMessages.current) console.error(`[500 ERROR] Getting all provenance data`, res);
              return null;

            default:
              if (userShowMessages.current) console.error(`[${res.status} ERROR] Getting all provenance data`, res);
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
  async function HandleExtentChange(extent, reloading = false) {
    if (!extent) return;

    setMapExtent(extent);

    if (!reloading) {
      sessionStorage.setItem("mapExtent", JSON.stringify(extent));
    }

    let backgroundStreetData = null;
    let unassignedEsuData = null;
    let backgroundPropertyData = null;
    let backgroundProvenanceData = null;

    if (
      extent.zoomLevel > 15 &&
      (!currentMapExtent.current ||
        currentMapExtent.current.zoomLevel !== extent.zoomLevel ||
        (currentMapExtent.current.zoomLevel === extent.zoomLevel &&
          (currentMapExtent.current.xmin !== extent.xmin ||
            currentMapExtent.current.ymin !== extent.ymin ||
            currentMapExtent.current.xmax !== extent.xmax ||
            currentMapExtent.current.ymax !== extent.ymax)))
    ) {
      currentMapExtent.current = {
        xmin: extent.xmin,
        ymin: extent.ymin,
        xmax: extent.xmax,
        ymax: extent.ymax,
        zoomLevel: extent.zoomLevel,
      };

      if (extent.zoomLevel > 15) {
        backgroundStreetData = await GetBackgroundStreetData(extent);
        unassignedEsuData = await GetUnassignedEsuData(extent);
      } else {
        backgroundStreetData = [];
        unassignedEsuData = [];
      }

      if (extent.hasProperties && extent.zoomLevel > 15) {
        backgroundPropertyData = await GetBackgroundPropertyData(extent);
        backgroundProvenanceData = await GetBackgroundProvenanceData(extent);
      } else {
        backgroundPropertyData = [];
        backgroundProvenanceData = [];
      }

      if (backgroundStreetData || backgroundPropertyData) {
        setBackgroundData({
          streets: backgroundStreetData,
          unassignedEsus: unassignedEsuData,
          properties: backgroundPropertyData,
          provenances: backgroundProvenanceData,
        });

        sessionStorage.setItem(
          "backgroundData",
          JSON.stringify({
            streets: backgroundStreetData,
            unassignedEsus: unassignedEsuData,
            properties: backgroundPropertyData,
            provenances: backgroundProvenanceData,
          })
        );
      }
    }
  }

  /**
   * Event to handle highlighting a street or property on the map.
   *
   * @param {object|null} street The street to highlight
   * @param {object|null} property Th property to highlight
   */
  function HandleStreetPropertyHighlight(street, property) {
    if (!selectingProperties) {
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

      sessionStorage.setItem(
        "highlight",
        JSON.stringify({
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
        })
      );
    }
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

    sessionStorage.setItem(
      "highlight",
      JSON.stringify({
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
      })
    );
  }

  /**
   * Event to handle clearing any highlights on the map.
   */
  function HandleClearHighlight() {
    setHighlight({
      street: [],
      esu: [],
      asd51: [],
      asd52: [],
      asd53: [],
      asd61: [],
      asd62: [],
      asd63: [],
      asd64: [],
      asd66: [],
      property: [],
      selectProperties: [],
      extent: [],
    });

    sessionStorage.setItem(
      "highlight",
      JSON.stringify({
        street: [],
        esu: [],
        asd51: [],
        asd52: [],
        asd53: [],
        asd61: [],
        asd62: [],
        asd63: [],
        asd64: [],
        asd66: [],
        property: [],
        selectProperties: [],
        extent: [],
      })
    );
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
    if (!wktGeometry || !wktGeometry.includes(",")) {
      setMapLineGeometry(null);
    } else
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
    if (wktGeometry === "") {
      // Deleting the geometry
      setMapPolygonGeometry({
        wktGeometry: "",
        objectType: editObjectRef.current ? editObjectRef.current.objectType : null,
        objectId: editObjectRef.current ? editObjectRef.current.objectId : null,
      });
    } else if (!wktGeometry || !wktGeometry.includes(",") || (wktGeometry.match(/,/g) || []).length < 3) {
      // Only set a polygon if we have a minimum of 3 unique points (triangle)
      setMapPolygonGeometry(null);
    } else {
      setMapPolygonGeometry({
        wktGeometry: wktGeometry,
        objectType: editObjectRef.current ? editObjectRef.current.objectType : null,
        objectId: editObjectRef.current ? editObjectRef.current.objectId : null,
      });
    }
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
   * Method to handle when the user wants to select properties from the map.
   *
   * @param {Boolean} selecting If true user wants to select properties from the map; otherwise false.
   */
  function HandleSelectPropertiesChange(selecting) {
    setSelectingProperties(selecting);
  }

  /**
   * Method to handle when a shape file is loaded.
   *
   * @param {string} geojson The string representation of the geojson data from the SHP file.
   * @param {object} shpFile The object containing the information for the shp file that has just been loaded.
   */
  function HandleLoadShpFile(geojson, shpFile) {
    if (geojson && shpFile) {
      let newLoadedShpFiles = loadedShpFiles.map((x) => x);
      if (!loadedShpFiles.find((x) => x.id === shpFile.layerId)) {
        newLoadedShpFiles.push({ id: shpFile.layerId, geojson: geojson, shpFile: shpFile });
      } else {
        newLoadedShpFiles = loadedShpFiles.map(
          (x) => [{ id: shpFile.layerId, geojson: geojson, shpFile: shpFile }].find((rec) => rec.id === x.id) || x
        );
      }
      setLoadedShpFiles(newLoadedShpFiles);
      currentShpFiles.current = newLoadedShpFiles;
    }
  }

  /**
   * Method to handle when a shape file is unloaded.
   *
   * @param {string} id The id of for the shp file that we want to unload.
   */
  function HandleUnloadShpFile(id) {
    if (id) {
      const newLoadedShpFiles = currentShpFiles.current.filter((x) => x.id !== id);
      setLoadedShpFiles(newLoadedShpFiles);
      currentShpFiles.current = newLoadedShpFiles;
    }
  }

  /**
   * Event to handle reloading the map context data from storage
   */
  function HandleMapReload() {
    if (
      sessionStorage.getItem("backgroundData") !== null &&
      (!backgroundData.streets || backgroundData.streets.length === 0) &&
      (!backgroundData.properties || backgroundData.properties.length === 0) &&
      (!backgroundData.unassignedEsus || backgroundData.unassignedEsus.length === 0)
    ) {
      setBackgroundData(JSON.parse(sessionStorage.getItem("backgroundData")));
    }

    if (
      sessionStorage.getItem("mapSearch") !== null &&
      (!mapSearchData.streets || mapSearchData.streets.length === 0) &&
      (!mapSearchData.llpgStreets || mapSearchData.llpgStreets.length === 0) &&
      (!mapSearchData.properties || mapSearchData.properties.length === 0) &&
      !mapSearchData.editStreet &&
      !mapSearchData.editProperty
    ) {
      const savedMapSearch = JSON.parse(sessionStorage.getItem("mapSearch"));
      HandleMapSearchDataChange(
        savedMapSearch.streets,
        savedMapSearch.llpgStreets,
        savedMapSearch.properties,
        savedMapSearch.editStreet,
        savedMapSearch.editProperty,
        true
      );
    }

    if (
      sessionStorage.getItem("map") !== null &&
      map.extents &&
      map.extents.length === 0 &&
      !map.zoomStreet &&
      !map.zoomProperty
    ) {
      setMap(JSON.parse(sessionStorage.getItem("map")));
    }

    if (sessionStorage.getItem("editObject") !== null && !editObject) {
      const savedEditObject = JSON.parse(sessionStorage.getItem("editObject"));
      HandleEditMapObject(savedEditObject.objectType, savedEditObject.objectId, true);
    }

    if (sessionStorage.getItem("mapProperty") !== null && !mapProperty) {
      setMapProperty(JSON.parse(sessionStorage.getItem("mapProperty")));
    }

    if (sessionStorage.getItem("mapStreet") !== null && !mapStreet) {
      setMapStreet(JSON.parse(sessionStorage.getItem("mapStreet")));
    }

    if (sessionStorage.getItem("mapExtent") !== null && !mapExtent) {
      HandleExtentChange(JSON.parse(sessionStorage.getItem("mapExtent")), true);
    }

    if (
      sessionStorage.getItem("highlight") !== null &&
      !highlight.street &&
      !highlight.esu &&
      !highlight.asd51 &&
      !highlight.asd52 &&
      !highlight.asd53 &&
      !highlight.asd61 &&
      !highlight.asd62 &&
      !highlight.asd63 &&
      !highlight.asd64 &&
      !highlight.asd66 &&
      !highlight.property &&
      !highlight.selectProperties &&
      !highlight.extent
    ) {
      setHighlight(JSON.parse(sessionStorage.getItem("highlight")));
    }
  }

  /**
   * Handle when the visibility of a layer is changed.
   *
   * @param {String} layer The layer that is having its visibility changed.
   * @param {Boolean} visibility The new visibility for the layer.
   */
  function HandleLayerVisibilityChange(layer, visibility) {
    setLayerVisibility({
      backgroundStreets: layer === "backgroundStreets" ? visibility : layerVisibility.backgroundStreets,
      unassignedEsus: layer === "unassignedEsus" ? visibility : layerVisibility.unassignedEsus,
      backgroundProvenances: layer === "backgroundProvenances" ? visibility : layerVisibility.backgroundProvenances,
      backgroundProperties: layer === "backgroundProperties" ? visibility : layerVisibility.backgroundProperties,
    });
  }

  /**
   * Handle when merging a provenance record.
   *
   * @param {Boolean} merging True when a provenance record is being merged.
   */
  function HandleProvenanceMerging(merging) {
    setProvenanceMerging(merging);
  }

  /**
   * Handle when setting flag for activating the create tool.
   *
   * @param {Boolean} activated True when a provenance record is being merged.
   */
  function HandleCreateToolActivated(activated) {
    setCreateToolActivated(activated);
  }
  //endregion mapContext

  //region informationContext
  /**
   * Method to handle when the display information should be shown.
   *
   * @param {string} type The type of information being displayed.
   * @param {string} source The source that is displaying the information.
   */
  function HandleDisplayInformation(type, source, reloading = false) {
    setInformationType(type);
    setInformationSource(source);

    if (!reloading) {
      sessionStorage.setItem(
        "displayInformation",
        JSON.stringify({
          type: type,
          source: source,
        })
      );
    }
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

  /**
   * Event to handle reloading the information context data from storage
   */
  function HandleInformationReload() {
    if (sessionStorage.getItem("displayInformation") !== null && !informationType && !informationSource) {
      const savedDisplayInformation = JSON.parse(sessionStorage.getItem("displayInformation"));
      HandleDisplayInformation(savedDisplayInformation.type, savedDisplayInformation.source, true);
    }
  }
  //endregion informationContext

  //region return
  return (
    <StylesProvider injectFirst>
      <Router history={history}>
        <userContext.Provider
          value={{
            currentUser: currentUser,
            onUserChange: HandleUserChange,
            onDisplayLogin: HandleDisplayLogin,
            onExpired: HandleAuthorisationExpired,
            onReload: HandleUserReload,
          }}
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
              onReload: HandleLookupReload,
            }}
          >
            <SandboxContext.Provider
              value={{
                currentSandbox: sandbox,
                refreshRelated: refreshRelated,
                streetTab: streetTab,
                propertyTab: propertyTab,
                onSandboxChange: HandleSandboxChange,
                onUpdateAndClear: HandleSandboxUpdateAndClear,
                onStreetTabChange: HandleStreetTabChange,
                onPropertyTabChange: HandlePropertyTabChange,
                onRefreshRelated: HandleRefreshRelated,
                resetSandbox: HandleResetSandbox,
                onReload: HandleSandboxReload,
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
                  onReload: HandleSearchReload,
                }}
              >
                <FilterContext.Provider
                  value={{
                    currentSearchFilter: searchFilter,
                    onSearchFilterChange: HandleSearchFilterChange,
                    onReload: HandleFilterReload,
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
                      onReload: HandleSettingsReload,
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
                        onUpdateCurrentStreet: HandleUpdateCurrentStreet,
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
                        onReload: HandleStreetReload,
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
                          childCount: childCount,
                          provenanceDataChanged: provenanceDataChanged,
                          wizardData: wizardData,
                          onPropertyChange: HandlePropertyChange,
                          onUpdateCurrentProperty: HandleUpdateCurrentProperty,
                          onLogicalStatusChange: HandleLogicalStatusChange,
                          onPropertyModified: HandlePropertyModified,
                          onPropertyErrors: HandlePropertyErrors,
                          onLeavingProperty: HandleLeavingProperty,
                          onGoToField: HandlePropertyGoToField,
                          onRecordChange: HandlePropertyRecordChange,
                          onChildCountChange: HandleChildCountChange,
                          onProvenanceDataChange: HandleProvenanceDataChange,
                          onWizardDone: HandleWizardDone,
                          onRelatedOpened: HandlePropertyRelatedOpened,
                          resetProperty: HandleResetProperty,
                          restoreProperty: HandleRestoreProperty,
                          resetPropertyErrors: HandleResetPropertyErrors,
                          validateData: HandlePropertyValidateData,
                          onReload: HandlePropertyReload,
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
                            loadedShpFiles: loadedShpFiles,
                            layerVisibility: layerVisibility,
                            provenanceMerging: provenanceMerging,
                            createToolActivated: createToolActivated,
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
                            onLoadShpFile: HandleLoadShpFile,
                            onUnloadShpFile: HandleUnloadShpFile,
                            onReload: HandleMapReload,
                            onLayerVisibilityChange: HandleLayerVisibilityChange,
                            onProvenanceMerging: HandleProvenanceMerging,
                            onCreateToolActivated: HandleCreateToolActivated,
                          }}
                        >
                          <InformationContext.Provider
                            value={{
                              informationType: informationType,
                              informationSource: informationSource,
                              onDisplayInformation: HandleDisplayInformation,
                              onClearInformation: HandleClearInformation,
                              onReload: HandleInformationReload,
                            }}
                          >
                            <SaveConfirmationServiceProvider>
                              <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Online polling={onlinePolling}>
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
                                          message={loginMessage.current}
                                        />
                                      </Fragment>
                                    </Online>
                                    <Offline polling={offlinePolling}>
                                      <Box
                                        sx={{
                                          paddingTop: "30px",
                                          textAlign: "center",
                                          backgroundColor: adsLightGreyD,
                                          height: "100vh",
                                        }}
                                      >
                                        <Stack
                                          direction="column"
                                          spacing={2}
                                          justifyContent="center"
                                          alignItems="center"
                                          sx={{ height: "100vh" }}
                                        >
                                          <WifiOffIcon sx={{ height: "100px", width: "100px" }} />
                                          <Typography variant="h1" sx={{ marginBottom: "5px" }}>
                                            Couldn't connect
                                          </Typography>
                                          <Typography variant="h4" sx={{ margin: "0" }}>
                                            Check your internet connection and try again.
                                          </Typography>
                                        </Stack>
                                      </Box>
                                    </Offline>
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
  //endregion return
}

export default App;
