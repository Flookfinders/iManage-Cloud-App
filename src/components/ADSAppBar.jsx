/* #region header */
/**************************************************************************************************
//
//  Description: Application Bar component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.07.21 Sean Flook          WI39??? Initial Revision.
//    002   28.03.23 Sean Flook          WI40632 Set the source for onWizardDone.
//    003   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    004   23.08.23 Sean Flook        IMANN-160 Use the street template when creating a new street.
//    005   07.09.23 Sean Flook                  Modified call to mapContext.onBackgroundDataChange.
//    006   20.09.23 Sean Flook                  Tweak to handleBackToListClick method.
//    007   06.10.23 Sean Flook                  Use colour variables.
//    008   27.10.23 Sean Flook                  Updated call to SavePropertyAndUpdate.
//    009   03.11.23 Sean Flook        IMANN-175 Added button to select properties from the map.
//    010   10.11.23 Sean Flook                  Removed HasASDPlus as no longer required.
//    011   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and added getClassificationCode.
//    012   30.11.23 Sean Flook        IMANN-175 Make the button visible to all.
//    013   19.12.23 Sean Flook                  Various bug fixes.
//    014   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    015   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    016   12.01.24 Sean Flook        IMANN-163 Search results should be an array.
//    017   26.01.24 Sean Flook        IMANN-260 Corrected field name.
//    018   26.01.24 Sean Flook        IMANN-251 Fix HandleChangeCheck and only do the postCheckAction after the record is saved.
//    019   05.02.24 Joel Benford                Hide close button on homepage, add spacing before auth avatar
//    020   08.02.24 Sean Flook                  Display the Add street and Select properties button when in the gazetteer page.
//    021   13.02.24 Sean Flook                  Corrected the type 66 map data.
//    022   14.02.24 Joshua McCormick  IMANN-282 shorthand padding and Add new street title change
//    023   15.02.24 Joshua McCormick  IMANN-282 Changed logic for street title change
//    024   15.02.24 Joshua McCormick  IMANN-282 Final tweaks, shortened condition
//    025   16.02.24 Joshua McCormick  IMANN-282 currentSearchStreets title change
//    026   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    027   16.02.24 Sean Flook         ESU27_GP Changed the Add street button to make it more prominent.
//    028   20.02.24 Sean Flook             MUL1 Display information control for selecting properties.
//    029   27.02.24 Sean Flook            MUL16 Hide the search control when required and reduce padding on the Add street button.
//    030   05.03.24 Sean Flook        IMANN-338 Correctly display controls and navigate as required.
//    031   07.03.24 Sean Flook        IMANN-338 Use the correct fields to hide the issue popper.
//    032   08.03.24 Sean Flook        IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    033   11.03.24 Sean Flook            GLB12 Use constants from ADSStyles to set heights and widths.
//    034   15.03.24 Sean Flook             GLB6 Removed autofocus from the add street button as not required.
//    035   04.04.24 Sean Flook                  Changes required to navigate back after deleting a property.
//    036   05.04.24 Sean Flook                  Changes required to display errors even when records have not been edited (Delete and Get).
//    037   01.05.24 Sean Flook                  Correctly set haveSearch.
//    048   14.05.24 Sean Flook        IMANN-206 Changes required to display all the provenances.
//    049   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    050   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    051   24.06.24 Sean Flook        IMANN-170 Changes required for cascading parent PAO changes to children.
//    052   18.07.24 Sean Flook        IMANN-772 Corrected field name.
//    053   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    054   10.10.24 Sean Flook       IMANN-1018 Allow LLPG editors to create streets.
//    055   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    056   28.11.24 Sean Flook       IMANN-1073 If validation fails when trying to save do not proceed so validation messages can be seen.
//#endregion Version 1.0.2.0 changes
//#region Version 1.0.5.0 changes
//    057   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect, Fragment, useCallback } from "react";
// import { useLocation, useNavigate } from "react-router";
import { useHistory, useLocation } from "react-router";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import SearchContext from "../context/searchContext";
import MapContext from "../context/mapContext";
import SandboxContext from "../context/sandboxContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import InformationContext from "../context/informationContext";
import {
  GetChangedAssociatedRecords,
  GetWktCoordinates,
  StringAvatar,
  ResetContexts,
  mapSelectSearchString,
} from "../utils/HelperUtils";
import {
  streetToTitleCase,
  GetStreetMapData,
  GetCurrentStreetData,
  SaveStreet,
  hasStreetChanged,
} from "../utils/StreetUtils";
import {
  addressToTitleCase,
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  getClassificationCode,
  hasPropertyChanged,
  hasParentPaoChanged,
} from "../utils/PropertyUtils";
import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import {
  AppBar,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Link,
  Popper,
  Avatar,
} from "@mui/material";
import { Stack } from "@mui/system";
import { EditConfirmationServiceProvider } from "../pages/EditConfirmationPage";
import ADSInformationControl from "../components/ADSInformationControl";
import ADSErrorList from "./ADSErrorList";
import ADSActionButton from "./ADSActionButton";
import ADSSearch from "./ADSSearch";
import ADSBookmarkDrawer from "../drawer/ADSBookmarkDrawer";
import ADSTaskDrawer from "../drawer/ADSTaskDrawer";
import ADSHelpDrawer from "../drawer/ADSHelpDrawer";
import AddIcon from "@mui/icons-material/Add";
import SelectPropertiesIcon from "@mui/icons-material/HolidayVillageOutlined";
import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import TaskIcon from "@mui/icons-material/AssignmentOutlined";
import HelpIcon from "@mui/icons-material/HelpOutline";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import { HomeRoute, GazetteerRoute, AdminSettingsRoute } from "../PageRouting";
import { adsBlueA, adsRed, adsMagenta } from "../utils/ADSColours";
import {
  ActionIconStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  tooltipStyle,
  SelectPropertiesIconStyle,
  blueButtonStyle,
  drawerWidth,
  navBarWidth,
  appBarHeight,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

function ADSAppBar(props) {
  const theme = useTheme();

  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const searchContext = useContext(SearchContext);
  const mapContext = useContext(MapContext);
  const sandboxContext = useContext(SandboxContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const informationContext = useContext(InformationContext);

  // const navigate = useNavigate();
  const history = useHistory();
  const location = useLocation();

  const [openHelp, setOpenHelp] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [openBookmark, setOpenBookmark] = useState(false);

  const [haveSearch, setHaveSearch] = useState(false);
  const [haveStreet, setHaveStreet] = useState(false);
  const [haveStreetError, setHaveStreetError] = useState(false);
  const [haveProperty, setHaveProperty] = useState(false);
  const [haveMapProperties, setHaveMapProperties] = useState(false);
  const [havePropertyError, setHavePropertyError] = useState(false);
  const [haveAdminSettings, setHaveAdminSettings] = useState(false);
  const [hasASD, setHasASD] = useState(false);

  const [selectingProperties, setSelectingProperties] = useState(false);

  const [saveOpen, setSaveOpen] = useState(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);

  const saveConfirmDialog = useSaveConfirmation();

  const [issueAnchorEl, setIssueAnchorEl] = useState(null);
  const issueOpen = Boolean(issueAnchorEl);
  const issueId = issueOpen ? "issue-list-popper" : undefined;

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "select-properties-popper" : undefined;

  /**
   * Event to handle when the search is clicked.
   */
  const handleSearchClick = () => {
    // if (location.pathname !== GazetteerRoute) navigate(GazetteerRoute);
    if (location.pathname !== GazetteerRoute) history.push(GazetteerRoute);
  };

  /**
   * Event to handle creating a new street.
   */
  const handleCreateStreet = () => {
    streetContext.onStreetChange(0, "Add new Street", true);

    const currentSearchStreets =
      userContext.currentUser && userContext.currentUser.hasStreet
        ? mapContext.currentSearchData.streets
        : mapContext.currentSearchData.llpgStreets;
    currentSearchStreets.push({
      usrn: 0,
      description: "Add new Street",
      language: "ENG",
      locality:
        settingsContext.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate.localityRef
          ? settingsContext.streetTemplate.streetTemplate.localityRef
          : null,
      town:
        settingsContext.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate.townRef
          ? settingsContext.streetTemplate.streetTemplate.townRef
          : null,
      state:
        settingsContext.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate.state
          ? settingsContext.streetTemplate.streetTemplate.state
          : undefined,
      type:
        settingsContext.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate &&
        settingsContext.streetTemplate.streetTemplate.recordType
          ? settingsContext.streetTemplate.streetTemplate.recordType
          : undefined,
      esus: [],
      asdType51: [],
      asdType52: [],
      asdType53: [],
      asdType61: [],
      asdType62: [],
      asdType63: [],
      asdType64: [],
      asdType66: [],
    });

    mapContext.onSearchDataChange(
      userContext.currentUser && userContext.currentUser.hasStreet ? currentSearchStreets : [],
      userContext.currentUser && !userContext.currentUser.hasStreet ? currentSearchStreets : [],
      [],
      "0",
      null
    );
    mapContext.onEditMapObject(null, null);
  };

  /**
   * Event to handle selecting properties.
   */
  const handleSelectProperties = () => {
    if (!selectingProperties) {
      informationContext.onDisplayInformation("selectProperties", "ADSAppBar");
    } else {
      informationContext.onClearInformation();
    }
    mapContext.onSelectPropertiesChange(!selectingProperties);
    setSelectingProperties(!selectingProperties);
  };

  /**
   * Event to handle the opening of the task drawer.
   */
  const handleTaskOpen = () => {
    setOpenBookmark(false);
    setOpenHelp(false);
    setOpenTask(true);
  };

  /**
   * Event to handle the closing of the task drawer.
   */
  const handleTaskClose = () => {
    setOpenTask(false);
  };

  /**
   * Event to handle the opening of the bookmark drawer.
   */
  const handleBookmarkOpen = () => {
    setOpenTask(false);
    setOpenHelp(false);
    setOpenBookmark(true);
  };

  /**
   * Event to handle the closing of the bookmark drawer.
   */
  const handleBookmarkClose = () => {
    setOpenBookmark(false);
  };

  /**
   * Event to handle the opening of the help drawer.
   */
  const handleHelpOpen = () => {
    setOpenBookmark(false);
    setOpenTask(false);
    setOpenHelp(true);
  };

  /**
   * Event to handle the closing of the help drawer.
   */
  const handleHelpClose = () => {
    setOpenHelp(false);
  };

  /**
   * Event to handle the closing of the save alert.
   */
  const handleSaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle saving a street.
   *
   * @param {object} currentStreet The data for the current street.
   * @param {string} action The action that needs to be performed.
   * @param {boolean} discardChanges If true the changes are discarded; otherwise they are saved.
   */
  function HandleSaveStreet(currentStreet, action, discardChanges) {
    SaveStreet(
      currentStreet,
      streetContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "street";
        setSaveOpen(true);
        ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        PerformReturnAction(action, discardChanges);
      } else {
        saveResult.current = false;
        saveType.current = "street";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle saving a property.
   *
   * @param {Object} currentProperty The data for the current property.
   * @param {String} action The action that needs to be performed.
   * @param {Boolean} discardChanges If true the changes are discarded; otherwise they are saved.
   * @param {Boolean} cascadeParentPaoChanges If true the child property PAO details need to be changed; otherwise they are not changed.
   */
  function HandleSaveProperty(currentProperty, action, discardChanges, cascadeParentPaoChanges) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh,
      cascadeParentPaoChanges
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "property";
        setSaveOpen(true);
        ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        PerformReturnAction(action, discardChanges);
      } else {
        saveResult.current = false;
        saveType.current = "property";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Method to perform the required return action.
   *
   * @param {string} action The action that needs to be performed.
   * @param {boolean} discardChanges If true the changes are discarded; otherwise they are saved.
   */
  function PerformReturnAction(action, discardChanges) {
    informationContext.onClearInformation();

    switch (action) {
      case "home":
        handleHomeClick();
        break;

      case "back":
        handleBackToListClick(discardChanges);
        break;

      case "street":
        handleCreateStreet();
        break;

      case "properties":
        handleSelectProperties();
        break;

      default:
        if (userContext.currentUser.showMessages)
          console.error(`Unknown action: "${action}" passed in to HandleReturnClick.`);
        break;
    }
  }

  /**
   * Event to handle checking if any data has changed.
   *
   * @param {string} postCheckAction The action that needs to be performed after the check has been done.
   */
  async function HandleChangeCheck(postCheckAction) {
    if (haveAdminSettings) {
      PerformReturnAction(postCheckAction, false);
    } else if (sandboxContext.currentSandbox.sourceStreet) {
      const streetChanged = hasStreetChanged(
        streetContext.currentStreet.newStreet,
        sandboxContext.currentSandbox,
        hasASD
      );

      if (streetChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("street", sandboxContext, streetContext.esuDataChanged);

        const streetData = sandboxContext.currentSandbox.currentStreet
          ? sandboxContext.currentSandbox.currentStreet
          : sandboxContext.currentSandbox.sourceStreet;

        saveConfirmDialog(associatedRecords.current.length > 0 ? associatedRecords.current : true)
          .then((result) => {
            if (result === "save") {
              if (streetContext.validateData()) {
                failedValidation.current = false;
                const currentStreetData = GetCurrentStreetData(
                  streetData,
                  sandboxContext,
                  lookupContext,
                  settingsContext.isWelsh,
                  settingsContext.isScottish,
                  hasASD
                );
                HandleSaveStreet(currentStreetData, postCheckAction, result === "discard");
              } else {
                failedValidation.current = true;
                saveResult.current = false;
                setSaveOpen(true);
              }
            } else {
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              PerformReturnAction(postCheckAction, result === "discard");
            }
          })
          .catch(() => {});
      } else {
        ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        PerformReturnAction(postCheckAction, false);
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged = hasPropertyChanged(
        propertyContext.currentProperty.newProperty,
        sandboxContext.currentSandbox
      );

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const parentPaoChanged = hasParentPaoChanged(
          propertyContext.childCount,
          sandboxContext.currentSandbox.sourceProperty,
          sandboxContext.currentSandbox.currentProperty
        );

        const propertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        saveConfirmDialog(associatedRecords.current.length > 0 ? associatedRecords.current : true, parentPaoChanged)
          .then((result) => {
            if (result === "save" || result === "saveCascade") {
              if (propertyContext.validateData()) {
                failedValidation.current = false;
                const currentPropertyData = GetCurrentPropertyData(
                  propertyData,
                  sandboxContext,
                  lookupContext,
                  settingsContext.isWelsh,
                  settingsContext.isScottish
                );
                HandleSaveProperty(
                  currentPropertyData,
                  postCheckAction,
                  result === "discard",
                  result === "saveCascade"
                );
              } else {
                failedValidation.current = true;
                saveResult.current = false;
                setSaveOpen(true);
              }
            } else {
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              PerformReturnAction(postCheckAction, result === "discard");
            }
          })
          .catch(() => {});
      } else {
        ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        PerformReturnAction(postCheckAction, false);
      }
    } else {
      ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
      PerformReturnAction(postCheckAction, false);
    }
  }

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = useCallback(() => {
    streetContext.resetStreet();
    propertyContext.resetProperty();
    searchContext.onSearchDataChange("", []);
    sandboxContext.resetSandbox();
    mapContext.onBackgroundDataChange([], [], [], []);
    mapContext.onSearchDataChange([], [], [], null, null);
    mapContext.onMapChange([], null, null);
    mapContext.onEditMapObject(null, null);
    informationContext.onClearInformation();
    history.push(HomeRoute);
  }, [history, informationContext, mapContext, propertyContext, sandboxContext, searchContext, streetContext]);
  //   navigate(HomeRoute);
  // }, [navigate, informationContext, mapContext, propertyContext, sandboxContext, searchContext, streetContext]);

  /**
   * Event to handle when the back to list button is clicked.
   *
   * @param {boolean} discardChanges If true the changes are discarded; otherwise they are saved.
   */
  const handleBackToListClick = useCallback(
    async (discardChanges) => {
      if (haveAdminSettings) {
        // navigate.go(-1);
        history.go(-1);
      } else {
        const foundStreet =
          discardChanges &&
          streetContext.currentStreet &&
          (await GetStreetMapData(streetContext.currentStreet.usrn, userContext, settingsContext.isScottish));

        const foundStreetDescriptor =
          discardChanges && foundStreet && foundStreet.streetDescriptors.find((x) => x.language === "ENG");

        const originalStreet = discardChanges &&
          foundStreet &&
          foundStreetDescriptor && {
            usrn: foundStreet.usrn,
            description: foundStreetDescriptor.streetDescriptor,
            language: foundStreetDescriptor.language,
            locality: foundStreetDescriptor.locality,
            town: foundStreetDescriptor.town,
            state: !settingsContext.isScottish ? foundStreet.state : undefined,
            type: foundStreet.recordType,
            esus: foundStreet.esus
              ? foundStreet.esus.map((esu) => ({
                  esuId: esu.esuId,
                  state: settingsContext.isScottish ? esu.state : undefined,
                  geometry: esu.wktGeometry ? GetWktCoordinates(esu.wktGeometry) : undefined,
                }))
              : [],
            asdType51:
              settingsContext.isScottish &&
              foundStreet.maintenanceResponsibilities.map((asdRec) => ({
                type: 51,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                streetStatus: asdRec.streetStatus,
                custodianCode: asdRec.custodianCode,
                maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType52:
              settingsContext.isScottish &&
              foundStreet.reinstatementCategories.map((asdRec) => ({
                type: 52,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
                custodianCode: asdRec.custodianCode,
                reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType53:
              settingsContext.isScottish &&
              foundStreet.specialDesignations.map((asdRec) => ({
                type: 53,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                specialDesignationCode: asdRec.specialDesignationCode,
                custodianCode: asdRec.custodianCode,
                authorityCode: asdRec.authorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType61:
              !settingsContext.isScottish &&
              hasASD &&
              foundStreet.interests.map((asdRec) => ({
                type: 61,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                streetStatus: asdRec.streetStatus,
                interestType: asdRec.interestType,
                districtRefAuthority: asdRec.districtRefAuthority,
                swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType62:
              !settingsContext.isScottish &&
              hasASD &&
              foundStreet.constructions.map((asdRec) => ({
                type: 62,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                constructionType: asdRec.constructionType,
                reinstatementTypeCode: asdRec.reinstatementTypeCode,
                swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                districtRefConsultant: asdRec.districtRefConsultant,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType63:
              !settingsContext.isScottish &&
              hasASD &&
              foundStreet.specialDesignations.map((asdRec) => ({
                type: 63,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
                swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                districtRefConsultant: asdRec.districtRefConsultant,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType64:
              !settingsContext.isScottish &&
              hasASD &&
              foundStreet.heightWidthWeights.map((asdRec) => ({
                type: 64,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                hwwRestrictionCode: asdRec.hwwRestrictionCode,
                swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                districtRefConsultant: asdRec.districtRefConsultant,
                wholeRoad: asdRec.wholeRoad,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
            asdType66:
              !settingsContext.isScottish &&
              hasASD &&
              foundStreet.publicRightOfWays.map((asdRec) => ({
                type: 66,
                pkId: asdRec.pkId,
                prowUsrn: asdRec.prowUsrn,
                prowRights: asdRec.prowRights,
                prowStatus: asdRec.prowStatus,
                prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                defMapGeometryType: asdRec.defMapGeometryType,
                geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
          };

        const currentSearchStreets =
          streetContext.currentStreet && streetContext.currentStreet.newStreet && discardChanges
            ? mapContext.sourceSearchData.streets.filter((x) => x.usrn !== 0)
            : streetContext.currentStreet && streetContext.currentStreet.newStreet && !discardChanges
            ? mapContext.currentSearchData.streets.filter((x) => x.usrn !== 0)
            : discardChanges && originalStreet
            ? mapContext.sourceSearchData.streets.map(
                (x) => [originalStreet].find((rec) => rec.usrn.toString() === x.usrn.toString()) || x
              )
            : discardChanges
            ? mapContext.sourceSearchData.streets
            : mapContext.currentSearchData.streets;

        const currentSearchLlpgStreets =
          streetContext.currentStreet && streetContext.currentStreet.newStreet && discardChanges
            ? mapContext.sourceSearchData.llpgStreets.filter((x) => x.usrn !== 0)
            : streetContext.currentStreet && streetContext.currentStreet.newStreet && !discardChanges
            ? mapContext.currentSearchData.llpgStreets.filter((x) => x.usrn !== 0)
            : discardChanges && originalStreet
            ? mapContext.sourceSearchData.llpgStreets.map(
                (x) => [originalStreet].find((rec) => rec.usrn.toString() === x.usrn.toString()) || x
              )
            : discardChanges
            ? mapContext.sourceSearchData.llpgStreets
            : mapContext.currentSearchData.llpgStreets;

        const foundProperty =
          discardChanges &&
          propertyContext.currentProperty &&
          mapContext.currentBackgroundData.properties.find(
            (x) => x.uprn.toString() === propertyContext.currentProperty.uprn.toString()
          );

        const originalProperty = discardChanges &&
          foundProperty && {
            uprn: foundProperty.uprn,
            address: foundProperty.address,
            formattedAddress: foundProperty.address,
            postcode: foundProperty.postcode,
            easting: foundProperty.easting,
            northing: foundProperty.northing,
            logicalStatus: foundProperty.logicalStatus,
            classificationCode: getClassificationCode(foundProperty),
          };

        const currentSearchProperties =
          propertyContext.currentProperty && propertyContext.currentProperty.newProperty && discardChanges
            ? mapContext.sourceSearchData.properties.filter((x) => x.uprn !== 0)
            : propertyContext.currentProperty && propertyContext.currentProperty.newProperty && !discardChanges
            ? mapContext.currentSearchData.properties.filter((x) => x.uprn !== 0)
            : discardChanges && originalProperty
            ? mapContext.sourceSearchData.properties.map(
                (x) => [originalProperty].find((rec) => rec.uprn.toString() === x.uprn.toString()) || x
              )
            : discardChanges
            ? mapContext.sourceSearchData.properties
            : mapContext.currentSearchData.properties;

        sandboxContext.resetSandbox();

        streetContext.resetStreet();
        streetContext.resetStreetErrors();
        propertyContext.resetProperty();
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);

        mapContext.onSearchDataChange(
          currentSearchStreets,
          currentSearchLlpgStreets,
          currentSearchProperties,
          null,
          null
        );
        mapContext.onEditMapObject(null, null);

        informationContext.onClearInformation();

        // navigate(GazetteerRoute);
        history.push(GazetteerRoute);
      }
    },
    [
      haveAdminSettings,
      // navigate,
      history,
      informationContext,
      mapContext,
      propertyContext,
      sandboxContext,
      settingsContext.isScottish,
      streetContext,
      userContext,
      hasASD,
    ]
  );

  /**
   * Event to handle when the view issues button is clicked.
   */
  const handleViewIssueClick = () => {
    setIssueAnchorEl(document.getElementById("imanage-cloud-app-bar"));
  };

  /**
   * Event to handle when the error list is closed.
   */
  const handleCloseErrorList = () => {
    setIssueAnchorEl(null);
  };

  /**
   * Method to get the title styling.
   *
   * @returns {object} The styling for the title.
   */
  const titleStyle = () => {
    return {
      flexGrow: 1,
      display: "none",
      pl: "8px",
      pr: "8px",
      //mt: "4px",
      [theme.breakpoints.up("sm")]: {
        display: "block",
      },
    };
  };

  useEffect(() => {
    setHaveSearch(
      searchContext.currentSearchData &&
        searchContext.currentSearchData.searchString &&
        searchContext.currentSearchData.searchString.length > 0 &&
        searchContext.currentSearchData.searchString !== "!+reload+!"
    );

    setHaveStreet(
      !!(
        streetContext &&
        streetContext.currentStreet &&
        (streetContext.currentStreet.newStreet ||
          (streetContext.currentStreet.usrn && streetContext.currentStreet.usrn > 0))
      )
    );

    setHaveStreetError(streetContext && streetContext.currentStreetHasErrors);

    setHaveProperty(
      !!(
        propertyContext &&
        propertyContext.currentProperty &&
        (propertyContext.currentProperty.newProperty ||
          (propertyContext.currentProperty.uprn && propertyContext.currentProperty.uprn > 0))
      )
    );

    setHaveMapProperties(
      !!(
        mapContext.currentBackgroundData &&
        mapContext.currentBackgroundData.properties &&
        mapContext.currentBackgroundData.properties.length > 0
      )
    );

    setHavePropertyError(propertyContext && propertyContext.currentPropertyHasErrors);

    setHaveAdminSettings(location.pathname === AdminSettingsRoute);
  }, [searchContext.currentSearchData, streetContext, propertyContext, mapContext.currentBackgroundData, location]);

  useEffect(() => {
    if (!haveStreetError && !havePropertyError) setIssueAnchorEl(null);
  }, [haveStreetError, havePropertyError, haveAdminSettings]);

  useEffect(() => {
    if (selectingProperties !== mapContext.selectingProperties) setSelectingProperties(mapContext.selectingProperties);
  }, [selectingProperties, mapContext.selectingProperties]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "ADSAppBar")
      setInformationAnchorEl(document.getElementById("ads-search-data-list"));
    else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    if (searchContext.navigateBack) {
      searchContext.onNavigateBack(false);

      if (haveSearch && (haveStreet || haveProperty || haveAdminSettings)) handleBackToListClick(false);
      else handleHomeClick();
    }
  }, [searchContext, handleHomeClick, handleBackToListClick, haveAdminSettings, haveProperty, haveSearch, haveStreet]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      <AppBar
        position="fixed"
        color="inherit"
        id="imanage-cloud-app-bar"
        elevation={0}
        sx={{
          width: `calc(100% - ${openHelp || openTask || openBookmark ? navBarWidth + drawerWidth : navBarWidth}px)`,
          height: `${appBarHeight}px`,
          ml: `${navBarWidth}px`,
          mr: `${openHelp || openTask || openBookmark ? drawerWidth : 0}px`,
          transition: `theme.transitions.create(["margin", "width"], {
          easing: ${
            openHelp || openTask || openBookmark ? theme.transitions.easing.easeOut : theme.transitions.easing.sharp
          },
          duration: ${
            openHelp || openTask || openBookmark
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen
          },
        })`,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: adsBlueA,
        }}
      >
        <Stack sx={{ ml: "12px", mr: "24px" }} direction="row" justifyContent="space-between" alignItems="center">
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem />}
          >
            {haveSearch && (haveStreet || haveProperty || haveAdminSettings) ? (
              <ADSActionButton
                variant="home"
                tooltipTitle={`${
                  haveAdminSettings
                    ? haveStreet
                      ? "Back to street"
                      : haveProperty
                      ? "Back to property"
                      : "Back to list"
                    : "Back to list"
                }`}
                tooltipPlacement="bottom"
                onClick={() => HandleChangeCheck("back")}
              />
            ) : haveStreet || haveProperty || haveAdminSettings ? (
              <ADSActionButton
                variant="home"
                tooltipTitle="Home"
                tooltipPlacement="bottom"
                onClick={() => HandleChangeCheck("home")}
              />
            ) : (
              location.pathname !== HomeRoute && (
                <ADSActionButton
                  variant="close"
                  tooltipTitle="Home"
                  tooltipPlacement="bottom"
                  onClick={() => HandleChangeCheck("home")}
                />
              )
            )}
            <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ mt: "4px" }}>
              {haveAdminSettings ? (
                <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ pl: "12px" }}>
                  <Avatar
                    variant="rounded"
                    {...StringAvatar(settingsContext ? settingsContext.authorityName : null, false)}
                  />
                  <Typography sx={titleStyle()} variant="subtitle1" noWrap align="left">
                    {`${settingsContext ? settingsContext.authorityName : null} settings`}
                  </Typography>
                </Stack>
              ) : haveStreet ? (
                <>
                  <Tooltip title="USRN - Street" arrow placement="bottom-start" sx={tooltipStyle}>
                    <Typography sx={titleStyle()} variant="subtitle1" noWrap align="left">
                      <strong>{streetContext.currentStreet.usrn || ""}</strong>
                      {streetToTitleCase(
                        `${streetContext.currentStreet.usrn ? " -" : ""} ${streetContext.currentStreet.descriptor}`
                      )}
                    </Typography>
                  </Tooltip>
                  {streetContext.currentStreetModified && !haveStreetError && (
                    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                      <WarningIcon sx={{ color: adsMagenta, paddingLeft: 1 }} />
                      <Typography sx={{ color: adsMagenta, paddingRight: 1 }} variant="body2" noWrap align="left">
                        Edits in progress
                      </Typography>
                    </Stack>
                  )}
                  {streetContext.currentStreetModified && haveStreetError && (
                    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                      <ErrorIcon sx={{ color: adsRed, paddingLeft: 1 }} />
                      <Typography sx={{ color: adsRed, fontWeight: 600 }} variant="body2" noWrap align="left">
                        Edits in progress
                      </Typography>
                      <Link
                        sx={{ color: adsRed, fontWeight: 600, paddingRight: 1 }}
                        color={adsRed}
                        variant="body2"
                        noWrap
                        align="left"
                        component="button"
                        onClick={handleViewIssueClick}
                      >
                        View issue(s)
                      </Link>
                    </Stack>
                  )}
                  {!streetContext.currentStreetModified && haveStreetError && (
                    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                      <ErrorIcon sx={{ color: adsRed, paddingLeft: 1 }} />
                      <Link
                        sx={{ color: adsRed, fontWeight: 600, paddingRight: 1 }}
                        color={adsRed}
                        variant="body2"
                        noWrap
                        align="left"
                        component="button"
                        onClick={handleViewIssueClick}
                      >
                        View issue(s)
                      </Link>
                    </Stack>
                  )}
                </>
              ) : haveProperty ? (
                <>
                  <Tooltip title="UPRN - Address" arrow placement="bottom-start" sx={tooltipStyle}>
                    <Typography sx={titleStyle()} variant="subtitle1" noWrap align="left">
                      <strong>{propertyContext.currentProperty.uprn}</strong>
                      {propertyContext.currentProperty.newProperty
                        ? " - New Property"
                        : addressToTitleCase(
                            ` - ${propertyContext.currentProperty.address}`,
                            propertyContext.currentProperty.postcode
                          )}
                    </Typography>
                  </Tooltip>
                  {propertyContext.currentPropertyModified && !havePropertyError && (
                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      spacing={1}
                      sx={{ pl: "8px" }}
                    >
                      <WarningIcon sx={{ color: adsMagenta }} />
                      <Typography sx={{ color: adsMagenta }} variant="body2" noWrap align="left">
                        Edits in progress
                      </Typography>
                    </Stack>
                  )}
                  {propertyContext.currentPropertyModified && havePropertyError && (
                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      spacing={1}
                      sx={{ pl: "8px" }}
                    >
                      <ErrorIcon sx={{ color: adsRed }} />
                      <Typography sx={{ color: adsRed, fontWeight: 600 }} variant="body2" noWrap align="left">
                        Edits in progress
                      </Typography>
                      <Link
                        sx={{ color: adsRed, fontWeight: 600 }}
                        color={adsRed}
                        variant="body2"
                        noWrap
                        align="left"
                        component="button"
                        onClick={handleViewIssueClick}
                      >
                        View issue(s)
                      </Link>
                    </Stack>
                  )}
                  {!propertyContext.currentPropertyModified && havePropertyError && (
                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      spacing={1}
                      sx={{ pl: "8px" }}
                    >
                      <ErrorIcon sx={{ color: adsRed }} />
                      <Link
                        sx={{ color: adsRed, fontWeight: 600 }}
                        color={adsRed}
                        variant="body2"
                        noWrap
                        align="left"
                        component="button"
                        onClick={handleViewIssueClick}
                      >
                        View issue(s)
                      </Link>
                    </Stack>
                  )}
                </>
              ) : haveSearch ? (
                <>
                  <Typography sx={titleStyle()} variant="subtitle1" noWrap align="left">
                    {` ${searchContext.currentSearchData.results.length} results ${
                      searchContext.currentSearchData.searchString === mapSelectSearchString
                        ? "from selecting properties from the map"
                        : "for"
                    } `}
                    {searchContext.currentSearchData.searchString !== mapSelectSearchString && (
                      <strong>{searchContext.currentSearchData.searchString}</strong>
                    )}
                  </Typography>
                  {(haveStreetError || havePropertyError) && (
                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      spacing={1}
                      sx={{ pl: "8px" }}
                    >
                      <ErrorIcon sx={{ color: adsRed }} />
                      <Link
                        sx={{ color: adsRed, fontWeight: 600 }}
                        color={adsRed}
                        variant="body2"
                        noWrap
                        align="left"
                        component="button"
                        onClick={handleViewIssueClick}
                      >
                        View issue(s)
                      </Link>
                    </Stack>
                  )}
                </>
              ) : (
                <Typography sx={titleStyle()} variant="subtitle1" noWrap align="left">
                  iManage Cloud
                </Typography>
              )}
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ mt: "4px" }}>
            {!searchContext.hideSearch && (
              <ADSSearch variant="appBar" placeholder="Search…" onSearchClick={handleSearchClick} />
            )}
            {userContext.currentUser &&
            (userContext.currentUser.editStreet || userContext.currentUser.editProperty) &&
            (haveSearch || haveStreet || haveProperty || location.pathname === GazetteerRoute) ? (
              <Tooltip title="Add street" arrow placement="bottom-end" sx={tooltipStyle}>
                <Button
                  onClick={() => HandleChangeCheck("street")}
                  variant="contained"
                  sx={{ ...blueButtonStyle, pl: "8px", pr: "8px" }}
                  startIcon={<AddIcon />}
                >
                  Add street
                </Button>
              </Tooltip>
            ) : (
              ""
            )}
            {userContext.currentUser &&
              userContext.currentUser.editProperty &&
              (haveMapProperties || haveSearch || location.pathname === GazetteerRoute) &&
              !haveStreet &&
              !haveProperty && (
                <Tooltip
                  title={selectingProperties ? "Stop selecting properties" : "Select properties"}
                  arrow
                  placement="bottom-end"
                  sx={tooltipStyle}
                >
                  <IconButton
                    aria-label={selectingProperties ? "stop selecting properties" : "select properties"}
                    onClick={() => HandleChangeCheck("properties")}
                    size="large"
                    sx={SelectPropertiesIconStyle(selectingProperties)}
                  >
                    <SelectPropertiesIcon />
                  </IconButton>
                </Tooltip>
              )}
            {process.env.NODE_ENV === "development" && (
              <Tooltip title="Bookmarks and Views" arrow placement="bottom-end" sx={tooltipStyle}>
                <span>
                  <IconButton aria-label="bookmarks and views" disabled onClick={handleBookmarkOpen} size="large">
                    <BookmarkIcon sx={ActionIconStyle()} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {process.env.NODE_ENV === "development" && (
              <Tooltip title="Display tasks" arrow placement="bottom-end" sx={tooltipStyle}>
                <span>
                  <IconButton aria-label="display tasks" disabled onClick={handleTaskOpen} size="large">
                    <TaskIcon sx={ActionIconStyle()} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="Help & support" arrow placement="bottom-end" sx={tooltipStyle}>
              <IconButton aria-label="open help drawer" onClick={handleHelpOpen} size="large">
                <HelpIcon sx={ActionIconStyle()} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <ADSBookmarkDrawer
          open={openBookmark}
          handleDrawerClose={handleBookmarkClose}
          bookmarks={[
            {
              pkId: 0,
              title: "33 Houndiscombe Rd, Plymouth, PL3 4EU",
            },
            {
              pkId: 1,
              title: "7 St Martins Ave, Plymouth, PL3 4QS",
            },
          ]}
        />
        <ADSTaskDrawer open={openTask} handleDrawerClose={handleTaskClose} />
        <ADSHelpDrawer open={openHelp} handleDrawerClose={handleHelpClose} />
      </AppBar>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleSaveClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handleSaveClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            saveResult.current
              ? `The ${saveType.current} has been successfully saved.`
              : failedValidation.current
              ? `Failed to validate the ${saveType.current} record.`
              : `Failed to save the ${saveType.current}.`
          }`}</Alert>
        </Snackbar>
      </div>
      <EditConfirmationServiceProvider>
        <Popper
          id={issueId}
          open={issueOpen}
          anchorEl={issueAnchorEl}
          placement="bottom-start"
          sx={{ left: theme.spacing(-85), top: theme.spacing(-2.5) }}
        >
          <ADSErrorList onClose={handleCloseErrorList} />
        </Popper>
      </EditConfirmationServiceProvider>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"selectProperties"} />
      </Popper>
    </Fragment>
  );
}

export default ADSAppBar;
