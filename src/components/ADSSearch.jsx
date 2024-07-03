/* #region header */
/**************************************************************************************************
//
//  Description: Search component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   05.04.23 Sean Flook         WI40596 If opening an historic property display the warning dialog.
//    003   18.04.23 Sean Flook         WI40687 Handle a 204 response.
//    004   21.04.23 Sean Flook         WI40693 If no records found display a message informing the user of the fact.
//    005   24.04.23 Sean Flook         WI40695 Do not bother doing an object comparison if we do not have a current object.
//    006   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    007   07.09.23 Sean Flook                 Added code to handle unassigned ESUs.
//    008   06.10.23 Sean Flook                 Added some error trapping and use colour variables.
//    009   27.10.23 Sean Flook                 Updated call to SavePropertyAndUpdate.
//    010   03.11.23 Sean Flook                 Hide the filter and sort buttons for now.
//    011   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    012   20.11.23 Sean Flook                 Tweak the classification code for street BLPUs.
//    013   20.11.23 Sean Flook                 Undone above change.
//    014   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    015   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    016   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    017   25.01.24 Sean Flook                 Correctly handle status code 204.
//    018   26.01.24 Sean Flook       IMANN-260 Corrected field name.
//    019   01.02.24 Joel Benford     GLB9      Adjust placement/sizing
//    020   09.02.24 Sean Flook                 Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    021   09.02.24 Sean Flook                 If only 1 record found in search pressing the Enter key will open the record.
//    022   13.02.24 Sean Flook                 Corrected the type 66 map data.
//    023   16.02.24 Sean Flook        ESU27_GP Tweaked styling for new Add street button.
//    024   27.02.24 Sean Flook           MUL16 Changes required to allow control to be used for make child of dialog.
//    025   08.03.24 Sean Flook       IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    026   04.04.24 Sean Flook                 Added parentUprn to mapContext search data for properties.
//    027   30.04.24 Sean Flook                 Handle nulls being returned by the Scottish API for ASD records when none are present.
//    028   14.05.24 Sean Flook       IMANN-206 Changes required to display all the provenances.
//    029   29.05.24 Sean Flook       IMANN-411 Added missing else statement.
//    030   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    031   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    032   24.06.24 Sean Flook       IMANN-170 Changes required for cascading parent PAO changes to children.
//    033   03.07.24 Joshua McCormick IMANN-542 Searching when inside a property will now directly open property instead of showing search list
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SearchContext from "../context/searchContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SandboxContext from "../context/sandboxContext";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Stack } from "@mui/system";
import ADSFilterControl from "./ADSFilterControl";

import { autocompleteClasses } from "@mui/material/Autocomplete";
import {
  GetBackgroundStreetsUrl,
  GetUnassignedEsusUrl,
  GetBackgroundPropertiesUrl,
  GetBackgroundProvenancesUrl,
  GetSearchURL,
} from "../configuration/ADSConfig";
import { GetWktCoordinates, GetChangedAssociatedRecords, ResetContexts } from "../utils/HelperUtils";
import { GetStreetMapData, GetCurrentStreetData, SaveStreet, hasStreetChanged } from "../utils/StreetUtils";
import {
  addressToTitleCase,
  GetPropertyMapData,
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  hasPropertyChanged,
  hasParentPaoChanged,
} from "../utils/PropertyUtils";

import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";

import GetClassificationIcon from "../utils/ADSClassificationIcons";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from "@mui/icons-material/Tune";
import ClearIcon from "@mui/icons-material/Clear";
import { StreetIcon } from "../utils/ADSIcons";

import { adsBlueA, adsMidGreyA, adsLightGreyB, adsLightGreyA50, adsPaleBlueA, adsMidGreyB } from "../utils/ADSColours";
import {
  ActionIconStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  ClearSearchIconStyle,
} from "../utils/ADSStyles";
import { useTheme, styled } from "@mui/styles";
import userContext from "../context/userContext";

/* #endregion imports */

const apiFetch = async (url, headers, dataIfAborted, signal) => {
  try {
    const response = await fetch(url, {
      headers: headers,
      crossDomain: true,
      method: "GET",
      signal,
    });

    switch (response.status) {
      case 200:
        const data = await response.json();
        return data;

      case 204:
        return [{ type: 24, uprn: 0, address: "No records found", postcode: "" }];

      case 401:
        userContext.onExpired();
        return [{ type: 24, uprn: 0, address: "Search failed...", postcode: "" }];

      default:
        return [{ type: 24, uprn: 0, address: "Search failed...", postcode: "" }];
    }
  } catch (err) {
    if (err.name === "AbortError") {
      return dataIfAborted;
    }
    return err;
  }
};

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.paper}`]: {
    mt: "20px",
    border: "1px",
    borderColor: adsLightGreyB,
    boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
    borderRadius: "6px",
  },
});

ADSSearch.propTypes = {
  variant: PropTypes.oneOf(["appBar", "makeChild"]).isRequired,
  placeholder: PropTypes.string.isRequired,
  onSearchClick: PropTypes.func.isRequired,
};

ADSSearch.defaultProps = {
  variant: "appBar",
};

function ADSSearch({ variant, placeholder, onSearchClick }) {
  const theme = useTheme();

  const searchContext = useContext(SearchContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const sandboxContext = useContext(SandboxContext);
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [data, setData] = useState([]);
  const [urlDetails, setUrlDetails] = useState(null);
  const [search, setSearch] = useState();
  const [showIcons, setShowIcons] = useState(false);
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [maxResults, setMaxResults] = useState(8);
  const backgroundStreetData = useRef(null);
  const unassignedEsuData = useRef(null);
  const backgroundPropertyData = useRef(null);
  const backgroundProvenanceData = useRef(null);
  const searchStreets = useRef(null);
  const searchProperties = useRef(null);

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  const filterId = filterOpen ? "filter-popper" : undefined;

  const saveConfirmDialog = useSaveConfirmation();
  const [saveOpen, setSaveOpen] = useState(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);

  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);
  const historicRec = useRef(null);

  const [hasASD, setHasASD] = useState(false);

  /**
   * Method to get the API URL details.
   */
  const GetApiSite = () => {
    if (!urlDetails && userContext.currentUser) {
      const url = GetSearchURL(userContext.currentUser.token);
      setUrlDetails(url);
    }
  };

  /**
   * Event to handle when the search string changes.
   *
   * @param {object} event The event object.
   * @param {string} newInputValue The new search string.
   */
  const onSearchChange = (event, newInputValue) => {
    if (!urlDetails) GetApiSite();

    setSearch(newInputValue);
    setInputValue(newInputValue);
  };

  /**
   * Event to handle when the search control gets focus.
   */
  const onSearchFocus = () => {
    setShowIcons(true);
  };

  /**
   * Event to handle when the search control losses focus.
   */
  const onSearchBlur = () => {
    setShowIcons(filterAnchorEl || false);
  };

  /**
   * Event to handle when the search button is clicked.
   */
  async function handleSearchClick() {
    searchStreets.current = await Promise.all(
      data
        .filter((x) => x.type === 15)
        .map(async (x) => {
          try {
            return await GetStreetMapData(x.usrn, userContext, settingsContext.isScottish).then((streetData) => {
              const streetEsus =
                streetData && streetData.esus
                  ? streetData.esus.map((rec) => ({
                      esuId: rec.esuId,
                      state: settingsContext.isScottish && rec ? rec.state : undefined,
                      geometry:
                        rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
                    }))
                  : [];
              const asdType51 =
                settingsContext.isScottish && streetData && streetData.maintenanceResponsibilities
                  ? streetData.maintenanceResponsibilities.map((asdRec) => ({
                      type: 51,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetStatus: asdRec.streetStatus,
                      custodianCode: asdRec.custodianCode,
                      maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType52 =
                settingsContext.isScottish && streetData && streetData.reinstatementCategories
                  ? streetData.reinstatementCategories.map((asdRec) => ({
                      type: 52,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
                      custodianCode: asdRec.custodianCode,
                      reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType53 =
                settingsContext.isScottish && streetData && streetData.specialDesignations
                  ? streetData.specialDesignations.map((asdRec) => ({
                      type: 53,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      specialDesig: asdRec.specialDesig,
                      custodianCode: asdRec.custodianCode,
                      authorityCode: asdRec.authorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType61 =
                !settingsContext.isScottish && hasASD && streetData && streetData.interests
                  ? streetData.interests.map((asdRec) => ({
                      type: 61,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetStatus: asdRec.streetStatus,
                      interestType: asdRec.interestType,
                      districtRefAuthority: asdRec.districtRefAuthority,
                      swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType62 =
                !settingsContext.isScottish && hasASD && streetData && streetData.constructions
                  ? streetData.constructions.map((asdRec) => ({
                      type: 62,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      constructionType: asdRec.constructionType,
                      reinstatementTypeCode: asdRec.reinstatementTypeCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType63 =
                !settingsContext.isScottish && hasASD && streetData && streetData.specialDesignations
                  ? streetData.specialDesignations.map((asdRec) => ({
                      type: 63,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType64 =
                !settingsContext.isScottish && hasASD && streetData && streetData.heightWidthWeights
                  ? streetData.heightWidthWeights.map((asdRec) => ({
                      type: 64,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      hwwRestrictionCode: asdRec.hwwRestrictionCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const asdType66 =
                !settingsContext.isScottish && hasASD && streetData && streetData.publicRightOfWays
                  ? streetData.publicRightOfWays.map((asdRec) => ({
                      type: 66,
                      pkId: asdRec.pkId,
                      prowUsrn: asdRec.prowUsrn,
                      prowRights: asdRec.prowRights,
                      prowStatus: asdRec.prowStatus,
                      prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                      prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                      defMapGeometryType: asdRec.defMapGeometryType,
                      geometry:
                        asdRec.wktGeometry && asdRec.wktGeometry !== ""
                          ? GetWktCoordinates(asdRec.wktGeometry)
                          : undefined,
                    }))
                  : [];
              const streetObj = {
                usrn: x.usrn,
                description: x.street,
                language: x.language,
                locality: x.locality,
                town: x.town,
                state: !settingsContext.isScottish && streetData ? streetData.state : undefined,
                type: streetData ? streetData.recordType : undefined,
                esus: streetEsus,
                asdType51: asdType51,
                asdType52: asdType52,
                asdType53: asdType53,
                asdType61: asdType61,
                asdType62: asdType62,
                asdType63: asdType63,
                asdType64: asdType64,
                asdType66: asdType66,
              };
              return streetObj;
            });
          } catch (err) {
            throw err;
          }
        })
    );
    searchProperties.current = data
      .filter((x) => x.type === 24)
      .map((x) => {
        let propObj = {
          uprn: x.uprn,
          parentUprn: x.parent_uprn,
          address: x.address,
          formattedAddress: x.formattedaddress,
          postcode: x.postcode,
          easting: x.easting,
          northing: x.northing,
          logicalStatus: x.logical_status,
          classificationCode: x.classification_code ? x.classification_code : "U",
        };
        return propObj;
      });

    mapContext.onSearchDataChange(searchStreets.current, searchProperties.current, null, null);
    searchContext.onSearchDataChange(search, data);
    searchContext.onSearchOpen(false);
    if (onSearchClick) onSearchClick();
  }

  /**
   * Event to handle when the save alert is closed.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is being closed.
   * @returns
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
   * @param {object} currentStreet The current streets data.
   */
  function HandleSaveStreet(currentStreet) {
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
   * @param {Object} currentProperty The current property data.
   * @param {Boolean} cascadeParentPaoChanges If true the child property PAO details need to be changed; otherwise they are not changed.
   */
  function HandleSaveProperty(currentProperty, cascadeParentPaoChanges) {
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
      } else {
        saveResult.current = false;
        saveType.current = "property";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to check there are no outstanding changes before doing a new search.
   */
  async function handleSearchCheck() {
    if (sandboxContext.currentSandbox.sourceStreet) {
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

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
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
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet);
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        handleSearchClick();
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

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current, parentPaoChanged)
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
                  HandleSaveProperty(currentPropertyData, result === "saveCascade");
                  ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                  handleSearchClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                handleSearchClick();
              }
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true, parentPaoChanged)
            .then((result) => {
              if (result === "save" || result === "saveCascade") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty, result === "saveCascade");
              }
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        handleSearchClick();
      }
    } else {
      ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
      handleSearchClick();
    }
  }

  /**
   * Event to handle when the clear search button is clicked.
   */
  const handleClearSearch = () => {
    setValue(null);
    setInputValue("");
    setSearch(null);
  };

  /**
   * Event to handle when a key is pressed down.
   *
   * @param {object} event The event object.
   */
  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      if (data && data.length === 1) {
        onSelectCheck(event, data[0]);
      } else if (variant === "appBar") {
        handleSearchCheck();
      }
    }
  };

  /**
   * Event to handle when the filter button is clicked.
   */
  const handleFilterClick = () => {
    setFilterAnchorEl(filterAnchorEl ? null : document.getElementById(`ads-${variant}-search`));
  };

  /**
   * Event to handle filtering the search results.
   */
  const handleFilterResults = () => {};

  /**
   * Event to handle cancelling the filtering of the search results.
   */
  const handleCancelFilter = () => {
    setFilterAnchorEl(null);
  };

  /**
   * Event to handle when the query builder button is clicked.
   */
  const handleQueryBuilderClick = () => {};

  /**
   * Event to handle opening a property.
   *
   * @param {object} rec The property record.
   */
  const doOpenProperty = async (rec) => {
    propertyContext.onPropertyChange(
      rec.uprn,
      0,
      rec.address,
      rec.formattedaddress,
      rec.postcode,
      rec.easting,
      rec.northing,
      false,
      null
    );
    searchProperties.current = [
      {
        uprn: rec.uprn,
        parentUprn: rec.parent_uprn,
        address: rec.address,
        formattedAddress: rec.formattedAddress,
        postcode: rec.postcode,
        easting: rec.easting,
        northing: rec.northing,
        logicalStatus: rec.logical_status,
        classificationCode: rec.classification_code ? rec.classification_code : "U",
      },
    ];
    const propertyData = await GetPropertyMapData(rec.uprn, userContext);
    const extents = propertyData
      ? propertyData.blpuProvenances.map((provRec) => ({
          uprn: rec.uprn,
          code: provRec.provenanceCode,
          geometry:
            provRec.wktGeometry && provRec.wktGeometry !== "" ? GetWktCoordinates(provRec.wktGeometry) : undefined,
        }))
      : undefined;
    searchStreets.current = [];
    mapContext.onSearchDataChange(searchStreets.current, searchProperties.current, null, rec.uprn);
    mapContext.onMapChange(extents, null, null);
  };

  /**
   * Event to handle closing the historic property dialog.
   *
   * @param {string} action The action taken from the dialog
   */
  const handleHistoricPropertyClose = (action) => {
    setOpenHistoricProperty(false);
    if (action === "continue") {
      if (historicRec.current) doOpenProperty(historicRec.current);
    }
  };

  /**
   * Event to handle when the selection changes in the dropdown list.
   *
   * @param {object} newValue The selected record.
   */
  async function onSelectChange(newValue) {
    if (newValue) {
      if (newValue.usrn && !newValue.uprn) {
        streetContext.onStreetChange(newValue.usrn, newValue.street, false);
        const streetData = await GetStreetMapData(newValue.usrn, userContext, settingsContext.isScottish);
        const esus = streetData
          ? streetData.esus.map((rec) => ({
              esuId: rec.esuId,
              state: settingsContext.isScottish && rec ? rec.state : undefined,
              geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
            }))
          : undefined;
        const asdType51 =
          settingsContext.isScottish && streetData && streetData.maintenanceResponsibilities
            ? streetData.maintenanceResponsibilities.map((asdRec) => ({
                type: 51,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                streetStatus: asdRec.streetStatus,
                custodianCode: asdRec.custodianCode,
                maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType52 =
          settingsContext.isScottish && streetData && streetData.reinstatementCategories
            ? streetData.reinstatementCategories.map((asdRec) => ({
                type: 52,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
                custodianCode: asdRec.custodianCode,
                reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType53 =
          settingsContext.isScottish && streetData && streetData.specialDesignations
            ? streetData.specialDesignations.map((asdRec) => ({
                type: 53,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                specialDesig: asdRec.specialDesig,
                custodianCode: asdRec.custodianCode,
                authorityCode: asdRec.authorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType61 =
          !settingsContext.isScottish && hasASD && streetData && streetData.interests
            ? streetData.interests.map((asdRec) => ({
                type: 61,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                streetStatus: asdRec.streetStatus,
                interestType: asdRec.interestType,
                districtRefAuthority: asdRec.districtRefAuthority,
                swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType62 =
          !settingsContext.isScottish && hasASD && streetData && streetData.constructions
            ? streetData.constructions.map((asdRec) => ({
                type: 62,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                constructionType: asdRec.constructionType,
                reinstatementTypeCode: asdRec.reinstatementTypeCode,
                swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                districtRefConsultant: asdRec.districtRefConsultant,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType63 =
          !settingsContext.isScottish && hasASD && streetData && streetData.specialDesignations
            ? streetData.specialDesignations.map((asdRec) => ({
                type: 63,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
                swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                districtRefConsultant: asdRec.districtRefConsultant,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType64 =
          !settingsContext.isScottish && hasASD && streetData && streetData.heightWidthWeights
            ? streetData.heightWidthWeights.map((asdRec) => ({
                type: 64,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                hwwRestrictionCode: asdRec.hwwRestrictionCode,
                swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                districtRefConsultant: asdRec.districtRefConsultant,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType66 =
          !settingsContext.isScottish && hasASD && streetData && streetData.publicRightOfWays
            ? streetData.publicRightOfWays.map((asdRec) => ({
                type: 66,
                pkId: asdRec.pkId,
                prowUsrn: asdRec.prowUsrn,
                prowRights: asdRec.prowRights,
                prowStatus: asdRec.prowStatus,
                prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                defMapGeometryType: asdRec.defMapGeometryType,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        searchStreets.current = [
          {
            usrn: newValue.usrn,
            description: newValue.street,
            language: newValue.language,
            locality: newValue.locality,
            town: newValue.town,
            state: !settingsContext.isScottish && streetData ? streetData.state : undefined,
            type: streetData ? streetData.recordType : undefined,
            esus: esus,
            asdType51: asdType51,
            asdType52: asdType52,
            asdType53: asdType53,
            asdType61: asdType61,
            asdType62: asdType62,
            asdType63: asdType63,
            asdType64: asdType64,
            asdType66: asdType66,
          },
        ];
        searchProperties.current = [];
        mapContext.onSearchDataChange(searchStreets.current, searchProperties.current, newValue.usrn, null);
      }

      if (newValue.uprn) {
        if (newValue.logical_status === 8) {
          historicRec.current = newValue;
          setOpenHistoricProperty(true);
        } else doOpenProperty(newValue);
      }
    }

    setValue(newValue);
  }

  /**
   * Event to handle checking for any unsaved changes to the data before selecting a new record.
   *
   * @param {object} event The event object.
   * @param {object} newValue The selected record.
   */
  function onSelectCheck(event, newValue) {
    event.stopPropagation();

    if (variant === "appBar") {
      if (sandboxContext.currentSandbox.sourceStreet) {
        const streetChanged = hasStreetChanged(
          streetContext.currentStreet.newStreet,
          sandboxContext.currentSandbox,
          hasASD
        );

        if (streetChanged) {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                // if (process.env.NODE_ENV === "development")
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              onSelectChange(newValue);
            })
            .catch(() => {});
        } else {
          ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
          onSelectChange(newValue);
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

          if (associatedRecords.current.length > 0) {
            saveConfirmDialog(associatedRecords.current, parentPaoChanged)
              .then((result) => {
                if (result === "save" || result === "saveCascade") {
                  const currentPropertyData = GetCurrentPropertyData(
                    propertyData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveProperty(currentPropertyData, result === "saveCascade");
                }
                ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                handleSearchClick();
              })
              .catch(() => {});
          } else {
            saveConfirmDialog(true, parentPaoChanged)
              .then((result) => {
                if (result === "save" || result === "saveCascade") {
                  HandleSaveProperty(sandboxContext.currentSandbox.currentProperty, result === "saveCascade");
                }
                ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                handleSearchClick();
              })
              .catch(() => {});
          }
        } else {
          ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
          onSelectChange(newValue);
        }
      } else {
        ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
        onSelectChange(newValue);
      }
    } else {
      if (newValue && newValue.type === 24 && onSearchClick) onSearchClick(newValue);
    }
  }

  const getSearchStyle = () => {
    if (variant === "appBar") {
      return {
        color: adsMidGreyA,
        fontFamily: "Nunito Sans",
        fontSize: "15px",
        display: "inline-flex",
        pl: theme.spacing(1),
        pr: theme.spacing(1),
        borderStyle: "solid",
        borderWidth: "1px",
        borderRadius: "18px",
        mt: "8px",
        height: "32px",
        transition: theme.transitions.create("width"),
        [theme.breakpoints.up("sm")]: {
          width: "176px",
          borderColor: adsLightGreyB,
          "&:focus-within": {
            width: "640px",
            borderColor: adsMidGreyB,
          },
        },
      };
    } else {
      return {
        color: adsMidGreyA,
        fontFamily: "Nunito Sans",
        fontSize: "15px",
        display: "inline-flex",
        pl: theme.spacing(1),
        pr: theme.spacing(1),
        borderStyle: "solid",
        borderWidth: "1px",
        borderRadius: "18px",
        mt: "8px",
        height: "32px",
        width: "540px",
        borderColor: adsLightGreyB,
        "&:focus-within": {
          borderColor: adsMidGreyB,
        },
      };
    }
  };

  useEffect(() => {
    const controller = new window.AbortController();

    if (urlDetails && search && search.length > 0) {
      const whileWaiting = [{ type: 24, uprn: 0, address: "Loading Data...", postcode: "" }];

      setData(whileWaiting);

      const signal = controller.signal;

      const url = `${urlDetails.url}/${search}`;
      apiFetch(url, urlDetails.headers, whileWaiting, signal).then((res) => {
        if (variant === "appBar") {
          setData(res);
        } else {
          setData(res.filter((x) => x.type === 24));
        }
      });
    } else {
      setData([]);
    }

    async function GetBackgroundStreetData() {
      if (!userContext.currentUser) return;
      if (
        !mapContext.currentExtent ||
        (mapContext.currentExtent.xmin === 0 &&
          mapContext.currentExtent.ymin === 0 &&
          mapContext.currentExtent.xmax === 660000 &&
          mapContext.currentExtent.ymax === 1300000) ||
        mapContext.currentExtent.zoomLevel < 16
      )
        return;

      const backgroundStreetsUrl = GetBackgroundStreetsUrl(userContext.currentUser.token);

      if (backgroundStreetsUrl) {
        const returnValue = await fetch(
          `${backgroundStreetsUrl.url}?XMin=${mapContext.currentExtent.xmin}&YMin=${mapContext.currentExtent.ymin}&XMax=${mapContext.currentExtent.xmax}&YMax=${mapContext.currentExtent.ymax}`,
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
                userContext.onExpired();
                return null;

              case 500:
                console.error(`[500 ERROR] Getting all Street data`, res);
                return null;

              default:
                console.error(`[${res.status} ERROR] Getting all Street data`, res);
                return null;
            }
          });

        backgroundStreetData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current,
          backgroundProvenanceData.current
        );
      }
    }

    async function GetUnassignedEsuData() {
      if (!userContext.currentUser) return;
      if (
        !mapContext.currentExtent ||
        (mapContext.currentExtent.xmin === 0 &&
          mapContext.currentExtent.ymin === 0 &&
          mapContext.currentExtent.xmax === 660000 &&
          mapContext.currentExtent.ymax === 1300000) ||
        mapContext.currentExtent.zoomLevel < 16
      )
        return;

      const unassignedEsusUrl = GetUnassignedEsusUrl(userContext.currentUser.token);

      if (unassignedEsusUrl) {
        // console.log("[SF] GetUnassignedEsuData", {
        //   XMin: mapContext.currentExtent.xmin,
        //   YMin: mapContext.currentExtent.ymin,
        //   XMax: mapContext.currentExtent.xmax,
        //   YMax: mapContext.currentExtent.ymax,
        // });
        const returnValue = await fetch(
          `${unassignedEsusUrl.url}?XMin=${mapContext.currentExtent.xmin}&YMin=${mapContext.currentExtent.ymin}&XMax=${mapContext.currentExtent.xmax}&YMax=${mapContext.currentExtent.ymax}`,
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
                userContext.onExpired();
                return null;

              case 500:
                console.error(`[500 ERROR] Getting all unassigned ESU data`, res);
                return null;

              default:
                console.error(`[${res.status} ERROR] Getting all unassigned ESU data`, res);
                return null;
            }
          });

        unassignedEsuData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current,
          backgroundProvenanceData.current
        );
      }
    }

    async function GetBackgroundPropertyData() {
      if (!userContext.currentUser) return;

      if (
        !mapContext.currentExtent ||
        (mapContext.currentExtent.xmin === 0 &&
          mapContext.currentExtent.ymin === 0 &&
          mapContext.currentExtent.xmax === 660000 &&
          mapContext.currentExtent.ymax === 1300000) ||
        mapContext.currentExtent.zoomLevel < 18
      )
        return;

      const backgroundPropertiesUrl = GetBackgroundPropertiesUrl(userContext.currentUser.token);

      if (backgroundPropertiesUrl) {
        const returnValue = await fetch(
          `${backgroundPropertiesUrl.url}?XMin=${mapContext.currentExtent.xmin}&YMin=${mapContext.currentExtent.ymin}&XMax=${mapContext.currentExtent.xmax}&YMax=${mapContext.currentExtent.ymax}`,
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
                userContext.onExpired();
                return null;

              case 500:
                console.error(`[500 ERROR] Getting all property data`, res);
                return null;

              default:
                console.error(`[${res.status} ERROR] Getting all property data`, res);
                return null;
            }
          });

        backgroundPropertyData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current,
          backgroundProvenanceData.current
        );
      }
    }

    async function GetBackgroundProvenanceData() {
      if (!userContext.currentUser) return;

      if (
        !mapContext.currentExtent ||
        (mapContext.currentExtent.xmin === 0 &&
          mapContext.currentExtent.ymin === 0 &&
          mapContext.currentExtent.xmax === 660000 &&
          mapContext.currentExtent.ymax === 1300000) ||
        mapContext.currentExtent.zoomLevel < 18
      )
        return;

      const backgroundProvenancesUrl = GetBackgroundProvenancesUrl(userContext.currentUser.token);

      if (backgroundProvenancesUrl) {
        const returnValue = await fetch(
          `${backgroundProvenancesUrl.url}?XMin=${mapContext.currentExtent.xmin}&YMin=${mapContext.currentExtent.ymin}&XMax=${mapContext.currentExtent.xmax}&YMax=${mapContext.currentExtent.ymax}`,
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
                  console.error(`[400 ERROR] Getting all provenance data`, body.errors);
                });
                return null;

              case 401:
                userContext.onExpired();
                return null;

              case 500:
                console.error(`[500 ERROR] Getting all provenance data`, res);
                return null;

              default:
                console.error(`[${res.status} ERROR] Getting all provenance data`, res);
                return null;
            }
          });

        backgroundProvenanceData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current,
          backgroundProvenanceData.current
        );
      }
    }

    if (
      variant === "appBar" &&
      !backgroundStreetData.current &&
      mapContext.currentExtent &&
      mapContext.currentExtent.zoomLevel > 15
    )
      GetBackgroundStreetData();

    if (
      variant === "appBar" &&
      !unassignedEsuData.current &&
      mapContext.currentExtent &&
      mapContext.currentExtent.zoomLevel > 15
    )
      GetUnassignedEsuData();

    if (
      variant === "appBar" &&
      !backgroundPropertyData.current &&
      mapContext.currentExtent &&
      mapContext.currentExtent.zoomLevel > 17
    )
      GetBackgroundPropertyData();

    if (
      variant === "appBar" &&
      !backgroundProvenanceData.current &&
      mapContext.currentExtent &&
      mapContext.currentExtent.zoomLevel > 17
    )
      GetBackgroundProvenanceData();

    return () => {
      setData([{ uprn: 0, address: "Loading Data...", postcode: "" }]);
      controller.abort();
    };
  }, [search, urlDetails, searchContext, userContext, mapContext, settingsContext, variant]);

  useEffect(() => {
    switch (variant) {
      case "appBar":
        setMaxResults(8);
        break;

      default:
        setMaxResults(20);
        break;
    }
  }, [variant]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      <Autocomplete
        id={`ads-${variant}-search`}
        open={searchContext.searchPopupOpen}
        sx={{ color: "inherit", pr: "24px" }}
        getOptionLabel={(option) => addressToTitleCase(option.address, option.postcode)}
        isOptionEqualToValue={(option, value) => option.address === value.address}
        filterOptions={(x) => x}
        noOptionsText="No search results"
        options={data.length > maxResults ? data.slice(0, maxResults) : data}
        onOpen={() => {
          if (search) {
            searchContext.onSearchOpen(true);
          }
        }}
        onClose={() => {
          searchContext.onSearchOpen(false);
        }}
        value={value}
        onChange={onSelectCheck}
        inputValue={inputValue}
        onInputChange={onSearchChange}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        PopperComponent={StyledPopper}
        renderOption={(props, option) => {
          return (
            <li {...props}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                spacing={1}
                sx={{
                  color: adsMidGreyA,
                  "&:hover": { cursor: "pointer", color: adsBlueA, backgroundColor: adsPaleBlueA },
                }}
              >
                {option.type === 15 ? <StreetIcon /> : GetClassificationIcon(option.classification_code)}
                <Typography sx={{ fontSize: "15px" }}>{addressToTitleCase(option.address, option.postcode)}</Typography>
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            ref={params.InputProps.ref}
            variant="standard"
            placeholder={placeholder}
            sx={getSearchStyle()}
            fullWidth
            onKeyDownCapture={handleKeyDown}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton id="btnSearch" onClick={handleSearchCheck} aria-label="search button" size="large">
                    <SearchIcon sx={ActionIconStyle()} />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton id="btnClear" onClick={handleClearSearch} aria-label="clear button" size="small">
                    <ClearIcon sx={ClearSearchIconStyle(search)} />
                  </IconButton>
                  {process.env.NODE_ENV === "development" && showIcons && variant === "appBar" && (
                    <IconButton id="filter-button" disabled onClick={handleFilterClick} aria-label="filter button">
                      <FilterListIcon sx={ActionIconStyle()} />
                    </IconButton>
                  )}
                  {process.env.NODE_ENV === "development" && showIcons && variant === "appBar" && (
                    <IconButton
                      id="query-builder-button"
                      disabled
                      onClick={handleQueryBuilderClick}
                      aria-label="query builder button"
                    >
                      <TuneIcon sx={ActionIconStyle()} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      <Popper id={filterId} open={filterOpen} anchorEl={filterAnchorEl} placement="bottom-start">
        <ADSFilterControl searchButton="Search" onFilter={handleFilterResults} onCancel={handleCancelFilter} />
      </Popper>
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
      <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
    </Fragment>
  );
}

export default ADSSearch;
