/* #region header */
/**************************************************************************************************
//
//  Description: Search component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";

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
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Grid,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import ADSFilterControl from "./ADSFilterControl";

import { autocompleteClasses } from "@mui/material/Autocomplete";
import {
  GetBackgroundStreetsUrl,
  GetUnassignedEsusUrl,
  GetBackgroundPropertiesUrl,
  GetSearchURL,
  HasASD,
} from "../configuration/ADSConfig";
import { GetWktCoordinates, GetChangedAssociatedRecords, ResetContexts } from "../utils/HelperUtils";
import { GetStreetMapData, GetCurrentStreetData, SaveStreet } from "../utils/StreetUtils";
import {
  addressToTitleCase,
  GetPropertyMapData,
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
} from "../utils/PropertyUtils";
import { StreetComparison, PropertyComparison } from "../utils/ObjectComparison";

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
        return [{ uprn: 0, address: "No records found", postcode: "" }];

      default:
        return [{ uprn: 0, address: "Search failed...", postcode: "" }];
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
    marginTop: "20px",
    border: "1px",
    borderColor: adsLightGreyB,
    boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
    borderRadius: "6px",
  },
});

function ADSSearch({ placeholder, onSearchClick }) {
  const theme = useTheme();

  const searchContext = useContext(SearchContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const sandboxContext = useContext(SandboxContext);
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  // const isWelsh = useRef(settingsContext ? settingsContext.isWelsh : false);

  const [data, setData] = useState([]);
  const [urlDetails, setUrlDetails] = useState(null);
  const [search, setSearch] = useState();
  const [showIcons, setShowIcons] = useState(false);
  // const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const backgroundStreetData = useRef(null);
  const unassignedEsuData = useRef(null);
  const backgroundPropertyData = useRef(null);
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
            return await GetStreetMapData(x.usrn, userContext.currentUser.token, settingsContext.isScottish).then(
              (streetData) => {
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
                  !settingsContext.isScottish && HasASD() && streetData && streetData.interests
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
                  !settingsContext.isScottish && HasASD() && streetData && streetData.constructions
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
                  !settingsContext.isScottish && HasASD() && streetData && streetData.specialDesignations
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
                  !settingsContext.isScottish && HasASD() && streetData && streetData.heightWidthWeights
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
                  !settingsContext.isScottish && HasASD() && streetData && streetData.publicRightOfWays
                    ? streetData.publicRightOfWays.map((asdRec) => ({
                        type: 66,
                        pkId: asdRec.pkId,
                        usrn: asdRec.usrn,
                        prowRights: asdRec.prowRights,
                        prowStatus: asdRec.prowStatus,
                        prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                        prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                        wholeRoad: asdRec.wholeRoad,
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
              }
            );
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
   * @param {object} currentProperty The current property data.
   */
  function HandleSaveProperty(currentProperty) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext.currentUser.token,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
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
      const streetChanged =
        sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor ||
        sandboxContext.currentSandbox.currentStreetRecords.esu ||
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication ||
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption ||
        sandboxContext.currentSandbox.currentStreetRecords.interest ||
        sandboxContext.currentSandbox.currentStreetRecords.construction ||
        sandboxContext.currentSandbox.currentStreetRecords.specialDesignation ||
        sandboxContext.currentSandbox.currentStreetRecords.hww ||
        sandboxContext.currentSandbox.currentStreetRecords.prow ||
        sandboxContext.currentSandbox.currentStreetRecords.note ||
        (sandboxContext.currentSandbox.currentStreet &&
          !StreetComparison(sandboxContext.currentSandbox.sourceStreet, sandboxContext.currentSandbox.currentStreet));

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
                    settingsContext.isScottish
                  );
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet);
              }
              ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
        handleSearchClick();
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged =
        sandboxContext.currentSandbox.currentPropertyRecords.lpi ||
        sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef ||
        sandboxContext.currentSandbox.currentPropertyRecords.provenance ||
        sandboxContext.currentSandbox.currentPropertyRecords.note ||
        (sandboxContext.currentSandbox.currentProperty &&
          !PropertyComparison(
            sandboxContext.currentSandbox.sourceProperty,
            sandboxContext.currentSandbox.currentProperty
          ));

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const propertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  const currentPropertyData = GetCurrentPropertyData(
                    propertyData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveProperty(currentPropertyData);
                  ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
                  handleSearchClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
                handleSearchClick();
              }
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty);
              }
              ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
        handleSearchClick();
      }
    } else {
      ResetContexts("all", false, mapContext, streetContext, propertyContext, sandboxContext);
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
      handleSearchCheck();
    }
  };

  /**
   * Event to handle when the filter button is clicked.
   */
  const handleFilterClick = () => {
    setFilterAnchorEl(filterAnchorEl ? null : document.getElementById("ads-search"));
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
        address: rec.address,
        formattedAddress: rec.formattedAddress,
        postcode: rec.postcode,
        easting: rec.easting,
        northing: rec.northing,
        logicalStatus: rec.logical_status,
        classificationCode: rec.classification_code ? rec.classification_code : "U",
      },
    ];
    const propertyData = await GetPropertyMapData(rec.uprn, userContext.currentUser.token);
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
   */
  const handleHistoricPropertyClose = () => {
    setOpenHistoricProperty(false);
    if (historicRec.current) doOpenProperty(historicRec.current);
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
        const streetData = await GetStreetMapData(
          newValue.usrn,
          userContext.currentUser.token,
          settingsContext.isScottish
        );
        const esus = streetData
          ? streetData.esus.map((rec) => ({
              esuId: rec.esuId,
              state: settingsContext.isScottish && rec ? rec.state : undefined,
              geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
            }))
          : undefined;
        const asdType51 =
          settingsContext.isScottish && streetData
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
          settingsContext.isScottish && streetData
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
          settingsContext.isScottish && streetData
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
          !settingsContext.isScottish && HasASD() && streetData
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
          !settingsContext.isScottish && HasASD() && streetData
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
          !settingsContext.isScottish && HasASD() && streetData
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
          !settingsContext.isScottish && HasASD() && streetData
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
          !settingsContext.isScottish && HasASD() && streetData
            ? streetData.publicRightOfWays.map((asdRec) => ({
                type: 66,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                prowRights: asdRec.prowRights,
                prowStatus: asdRec.prowStatus,
                prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                wholeRoad: asdRec.wholeRoad,
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

    if (sandboxContext.currentSandbox.sourceStreet) {
      const streetChanged =
        sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor ||
        sandboxContext.currentSandbox.currentStreetRecords.esu ||
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication ||
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption ||
        sandboxContext.currentSandbox.currentStreetRecords.interest ||
        sandboxContext.currentSandbox.currentStreetRecords.construction ||
        sandboxContext.currentSandbox.currentStreetRecords.specialDesignation ||
        sandboxContext.currentSandbox.currentStreetRecords.hww ||
        sandboxContext.currentSandbox.currentStreetRecords.prow ||
        sandboxContext.currentSandbox.currentStreetRecords.note ||
        (sandboxContext.currentSandbox.currentStreet &&
          !StreetComparison(sandboxContext.currentSandbox.sourceStreet, sandboxContext.currentSandbox.currentStreet));

      if (streetChanged) {
        saveConfirmDialog(true)
          .then((result) => {
            if (result === "save") {
              // if (process.env.NODE_ENV === "development")
            }
            ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
            onSelectChange(newValue);
          })
          .catch(() => {});
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged =
        !!sandboxContext.currentSandbox.currentPropertyRecords.lpi ||
        !!sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef ||
        !!sandboxContext.currentSandbox.currentPropertyRecords.provenance ||
        !!sandboxContext.currentSandbox.currentPropertyRecords.note ||
        (sandboxContext.currentSandbox.currentProperty &&
          !PropertyComparison(
            sandboxContext.currentSandbox.sourceProperty,
            sandboxContext.currentSandbox.currentProperty
          ));

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const propertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                const currentPropertyData = GetCurrentPropertyData(
                  propertyData,
                  sandboxContext,
                  lookupContext,
                  settingsContext.isWelsh,
                  settingsContext.isScottish
                );
                HandleSaveProperty(currentPropertyData);
              }
              ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty);
              }
              ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
              handleSearchClick();
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", false, mapContext, streetContext, propertyContext, sandboxContext);
        handleSearchClick();
      }
    } else {
      ResetContexts("all", false, mapContext, streetContext, propertyContext, sandboxContext);
      onSelectChange(newValue);
    }
  }

  useEffect(() => {
    const controller = new window.AbortController();

    if (urlDetails && search && search.length > 0) {
      const whileWaiting = [{ uprn: 0, address: "Loading Data...", postcode: "" }];

      setData(whileWaiting);

      const signal = controller.signal;

      const url = `${urlDetails.url}/${search}`;
      apiFetch(url, urlDetails.headers, whileWaiting, signal).then((res) => {
        setData(res);
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
          .then((res) => res.json())
          .then(
            (result) => {
              return result;
            },
            (error) => {
              console.log("ERROR Getting all Street data", error);
              return null;
            }
          );

        backgroundStreetData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current
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
        const returnValue = await fetch(
          `${unassignedEsusUrl.url}?XMin=${mapContext.currentExtent.xmin}&YMin=${mapContext.currentExtent.ymin}&XMax=${mapContext.currentExtent.xmax}&YMax=${mapContext.currentExtent.ymax}`,
          {
            headers: unassignedEsusUrl.headers,
            crossDomain: true,
            method: "GET",
          }
        )
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              return result;
            },
            (error) => {
              console.log("ERROR Getting all unassigned ESU data", error);
              return null;
            }
          );

        unassignedEsuData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current
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
          .then((res) => res.json())
          .then(
            (result) => {
              return result;
            },
            (error) => {
              console.log("ERROR Getting all Property data", error);
              return null;
            }
          );

        backgroundPropertyData.current = returnValue ? returnValue : undefined;

        mapContext.onBackgroundDataChange(
          backgroundStreetData.current,
          unassignedEsuData.current,
          backgroundPropertyData.current
        );
      }
    }

    if (!backgroundStreetData.current && mapContext.currentExtent && mapContext.currentExtent.zoomLevel > 15)
      GetBackgroundStreetData();
    if (!unassignedEsuData.current && mapContext.currentExtent && mapContext.currentExtent.zoomLevel > 15)
      GetUnassignedEsuData();
    if (!backgroundPropertyData.current && mapContext.currentExtent && mapContext.currentExtent.zoomLevel > 17)
      GetBackgroundPropertyData();

    return () => {
      setData([{ uprn: 0, address: "Loading Data...", postcode: "" }]);
      controller.abort();
    };
  }, [search, urlDetails, searchContext, userContext, mapContext, settingsContext]);

  return (
    <Fragment>
      <Autocomplete
        id="ads-search"
        open={searchContext.searchPopupOpen}
        sx={{ color: "inherit" }}
        getOptionLabel={(option) => addressToTitleCase(option.address, option.postcode)}
        isOptionEqualToValue={(option, value) => option.address === value.address}
        filterOptions={(x) => x}
        noOptionsText="No search results"
        options={data.length > 8 ? data.slice(0, 8) : data}
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
            <Grid
              {...props}
              container
              alignItems="center"
              spacing={1}
              sx={{
                pt: theme.spacing(0.5),
                pb: theme.spacing(1),
                color: adsMidGreyA,
                "&:hover": {
                  cursor: "pointer",
                  color: adsBlueA,
                  backgroundColor: adsPaleBlueA,
                },
              }}
            >
              <Grid item>
                {option.type === 15 ? <StreetIcon /> : GetClassificationIcon(option.classification_code)}
              </Grid>
              <Grid item xs>
                <Typography sx={{ fontSize: "15px" }}>{addressToTitleCase(option.address, option.postcode)}</Typography>
              </Grid>
            </Grid>
          );
        }}
        renderInput={(params) => (
          <Box
            ref={params.InputProps.ref}
            sx={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "18px",
              marginBottom: theme.spacing(1.5),
              display: "inline-flex",
              height: "36px",
              transition: theme.transitions.create("width"),
              [theme.breakpoints.up("sm")]: {
                width: "176px",
                borderColor: adsLightGreyB,
                "&:focus-within": {
                  width: "640px",
                  borderColor: adsMidGreyB,
                },
              },
            }}
          >
            <TextField
              {...params}
              variant="standard"
              placeholder={placeholder}
              sx={{
                color: adsMidGreyA,
                fontFamily: "Nunito Sans",
                fontSize: "15px",
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
                width: "100%",
              }}
              onKeyDownCapture={handleKeyDown}
              InputProps={{
                ...params.inputProps,
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
                  </InputAdornment>
                ),
              }}
            />
            {process.env.NODE_ENV === "development" && showIcons && (
              <Fragment>
                <IconButton
                  id="filter-button"
                  disabled
                  onClick={handleFilterClick}
                  aria-label="filter button"
                  size="large"
                >
                  <FilterListIcon sx={ActionIconStyle()} />
                </IconButton>
                <IconButton
                  id="query-builder-button"
                  disabled
                  onClick={handleQueryBuilderClick}
                  aria-label="query builder button"
                  size="large"
                >
                  <TuneIcon sx={ActionIconStyle()} />
                </IconButton>
              </Fragment>
            )}
          </Box>
        )}
      />
      <Popper id={filterId} open={filterOpen} anchorEl={filterAnchorEl} placement="bottom-start">
        <ADSFilterControl searchButton="Search" onFilter={handleFilterResults} onCancel={handleCancelFilter} />
      </Popper>
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
        <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
      </div>
    </Fragment>
  );
}

export default ADSSearch;
