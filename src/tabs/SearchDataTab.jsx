//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: List records returned from a search
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   21.03.23 Sean Flook          WI40592 Do not allow properties to be created on a closed street or a type 3/4 street.
//    003   22.03.23 Sean Flook          WI40600 Correctly call handleOpenRecord from the grid view.
//    004   28.03.23 Sean Flook          WI40632 Set the source for onWizardDone.
//    005   05.04.23 Sean Flook          WI40596 If opening an historic property display the warning dialog.
//    006   18.04.23 Sean Flook          WI40685 Modified call to ADSSelectionControl.
//    007   27.06.23 Sean Flook          WI40759 Include a natural sort on the address field when displaying records.
//    008   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    009   24.07.23 Sean Flook                  Removed Edit property and Edit street menu items.
//    010   20.07.23 Sean Flook                  Added ability to display the street and property in Google street view.
//    011   22.09.23 Sean Flook                  Changes required to handle Scottish classifications.
//    012   06.10.23 Sean Flook                  Added call to DisplayStreetInStreetView. Added some error trapping and use colour variables.
//    012   10.10.23 Sean Flook        IMANN-163 Changes required for opening the related tab after the property wizard.
//    013   11.10.23 Sean Flook        IMANN-163 Use the centralised doOpenRecord method.
//    014   11.10.23 Sean Flook        IMANN-163 Correctly handle historic properties.
//    015   27.10.23 Sean Flook        IMANN-175 Added getUprnsFromLpiKeys.
//    016   30.11.23 Sean Flook        IMANN-175 Added closing street, reset property selection flag when opening a record.
//    017   10.11.23 Sean Flook                  Removed HasASDPlus as no longer required.
//    018   20.11.23 Sean Flook                  Tweak the classification code for street BLPUs, and improve some functions.
//    019   20.11.23 Sean Flook                  Undone above change.
//    020   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and fixed some warnings.
//    021   29.11.23 Sean Flook        IMANN-163 Do not clear the street or property contexts if viewing ranges.
//    022   05.01.24 Sean Flook                  Use CSS shortcuts.
//    023   11.01.24 Sean Flook        IMANN-163 Close the add property wizard dialog when clicking on view properties.
//    024   12.01.24 Sean Flook                  Fixed duplicate key warning.
//    025   16.01.24 Sean Flook                  Changes required to fix warnings.
//    026   26.01.24 Sean Flook        IMANN-260 Corrected field name.
//    027   08.02.24 Joel Benford      RTAB3     Supply state to classification icon tooltip
//    028   09.02.24 Sean Flook                  Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    029   13.02.24 Sean Flook                  Corrected the type 66 map data and added missing parameter to call to StreetDelete.
//    030   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    031   19.02.24 Sean Flook         ESU16_GP Do not clear the controls if we have items checked.
//    032   20.02.24 Sean Flook             MUL1 Added removal of items from the list.
//    033   27.02.24 Sean Flook            MUL16 Changes required to handle parent child relationships.
//    034   12.03.24 Sean Flook             MUL8 Display an alert if properties are successfully moved.
//    035   15.03.24 Sean Flook             GLB7 Use onClick rather than onChange.
//    036   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    037   25.03.24 Sean Flook            MUL16 Removed option to remove from parent.
//    038   04.04.24 Sean Flook                  Changes required to handle deleting ESUs from streets and child properties from parent properties.
//    039   05.04.24 Sean Flook                  Further changes to ensure the application is correctly updated after a delete.
//    040   19.04.24 Sean Flook        IMANN-132 When adding a child or children ensure we have the parent English LPI.
//    041   26.04.24 Sean Flook                  Added some error handling.
//    042   29.04.24 Sean Flook                  Replaced openPropertyRecord with call to doOpenRecord.
//    043   29.05.24 Joshua McCormick  IMANN-470 Nowrap street title & added tooltip with title
//    044   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    045   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    046   11.07.24 Sean Flook        IMANN-747 Only display menu items if the user has the rights to use them.
//    047   11.07.24 Sean Flook        IMANN-748 Only display menu items if user has the correct rights.
//    048   17.07.24 Joshua McCormick  IMANN-548 zoomToStreet fix
//    049   17.07.24 Joshua McCormick  IMANN-548 Removed debug code, removed FormatStreetData, removed GetStreetMapData
//    050   17.07.24 Joshua McCormick  IMANN-548 Removed getStreetSearchData import
//    051   18.07.24 Joshua McCormick  IMANN-548 zoomToStreet add street if not in newMapSearchProperties
//    052   18.07.24 Sean Flook        IMANN-772 Corrected field name.
//    053   28.08.24 Sean Flook        IMANN-957 Added missing formattedAddress field to map search data.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    054   27.09.24 Sean Flook        IMANN-573 when creating a new child or range of children check the parent is not already at the maximum allowable level.
//    055   02.10.24 Sean Flook        IMANN-550 Changed menu item order for streets.
//    056   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//    057   23.10.24 Sean Flook       IMANN-1019 Use the correct data when opening the record.
//    058   01.11.24 Sean Flook       IMANN-1010 Use the correct data determining the street icon.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    059   21.11.24 Sean Flook       IMANN-1029 Use the correct UPRN when calling GetParentHierarchy.
//endregion Version 1.0.2.0
//region Version 1.0.4.0
//    060   11.02.25 Sean Flook       IMANN-1686 Correctly get the map search data when removing from list.
//endregion Version 1.0.4.0
//region Version 1.0.5.0
//    061   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    062   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//    063   14.03.25 Sean Flook        IMANN-963 Prevent the selection control from displaying if the user cannot edit the data.
//    064   17.03.25 Sean Flook        IMANN-885 If street closed do not allow properties to be created on it.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, Fragment, useEffect } from "react";
// import { useNavigate } from "react-router";
import { useHistory } from "react-router";
import PropTypes from "prop-types";

import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import SearchContext from "../context/searchContext";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import InformationContext from "../context/informationContext";

import {
  Checkbox,
  Grid2,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Popper,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectionControl from "../components/ADSSelectionControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import AddPropertyWizardDialog from "../dialogs/AddPropertyWizardDialog";
import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import MakeChildDialog from "../dialogs/MakeChildDialog";

import {
  copyTextToClipboard,
  GetAvatarColour,
  GetAvatarTooltip,
  GetWktCoordinates,
  openInStreetView,
  doOpenRecord,
} from "../utils/HelperUtils";
import { GetStreetMapData, StreetDelete, DisplayStreetInStreetView, getStreetSearchData } from "../utils/StreetUtils";
import {
  addressToTitleCase,
  GetPropertyMapData,
  formattedAddressToTitleCase,
  GetClassificationLabel,
  PropertyDelete,
  UpdateRangeAfterSave,
  UpdateAfterSave,
  GetParentHierarchy,
} from "../utils/PropertyUtils";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CopyIcon } from "../utils/ADSIcons";
import GetStreetIcon from "../utils/ADSStreetIcons";
import GetClassificationIcon from "../utils/ADSClassificationIcons";

import { yellow } from "@mui/material/colors";
import { adsLightGreyA, adsMidGreyA, adsDarkGrey, adsMidGreyC } from "../utils/ADSColours";
import {
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  listItemButtonStyle,
  tooltipStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  dataFormStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

SearchDataTab.propTypes = {
  data: PropTypes.array.isRequired,
  variant: PropTypes.oneOf(["list", "grid"]).isRequired,
  checked: PropTypes.array.isRequired,
  onToggleItem: PropTypes.func.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onSetDeleteOpen: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
};

function SearchDataTab({ data, variant, checked, onToggleItem, onSetCopyOpen, onSetDeleteOpen, onClearSelection }) {
  const theme = useTheme();

  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const searchContext = useContext(SearchContext);
  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const informationContext = useContext(InformationContext);

  // const navigate = useNavigate();
  const history = useHistory();

  const [itemSelected, setItemSelected] = useState(null);
  const [anchorStreetActionsEl, setAnchorStreetActionsEl] = useState(null);
  const [anchorPropertyActionsEl, setAnchorPropertyActionsEl] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "list-selection-popper" : undefined;

  const [streetCount, setStreetCount] = useState(0);
  const [propertyCount, setPropertyCount] = useState(0);

  const [userCanEditStreet, setUserCanEditStreet] = useState(false);
  const [userCanEditProperty, setUserCanEditProperty] = useState(false);
  const [hasASD, setHasASD] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [childCount, setChildCount] = useState(0);

  const [associatedRecords, setAssociatedRecords] = useState(null);

  const propertyWizardType = useRef(null);
  const propertyWizardParent = useRef(null);
  const [openPropertyWizard, setOpenPropertyWizard] = useState(false);

  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);

  const [openMakeChild, setOpenMakeChild] = useState(false);
  const [makeChildUprn, setMakeChildUprn] = useState([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const alertType = useRef(null);

  const deleteUSRN = useRef(null);
  const deleteUPRN = useRef(null);
  const wizardUprn = useRef(null);
  const historicRec = useRef(null);

  /**
   * Event to handle when the record is toggled.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  const handleToggle = (event, rec) => {
    event.stopPropagation();

    if (checked.indexOf(rec.id) === -1) {
      if (rec.type === 15) {
        if (mapContext.currentHighlight.street) {
          const newStreetSelection = JSON.parse(JSON.stringify(mapContext.currentHighlight.street));
          if (mapContext.currentHighlight.street.indexOf(rec.usrn.toString()) === -1)
            newStreetSelection.push(rec.usrn.toString());
          mapContext.onHighlightStreetProperty(newStreetSelection, mapContext.currentHighlight.property);
        } else {
          mapContext.onHighlightStreetProperty([rec.usrn.toString()], mapContext.currentHighlight.property);
        }
      } else if (rec.type === 24) {
        if (mapContext.currentHighlight.property) {
          const newPropertySelection = JSON.parse(JSON.stringify(mapContext.currentHighlight.property));

          if (mapContext.currentHighlight.property.indexOf(rec.uprn.toString()) === -1)
            newPropertySelection.push(rec.uprn.toString());

          mapContext.onHighlightStreetProperty(mapContext.currentHighlight.street, newPropertySelection);
        } else {
          mapContext.onHighlightStreetProperty(mapContext.currentHighlight.street, [rec.uprn.toString()]);
        }
      }
    } else {
      if (rec.type === 15) {
        const streetIndex = mapContext.currentHighlight.street.indexOf(rec.usrn.toString());
        const newStreetSelection = [...mapContext.currentHighlight.street];
        if (streetIndex > -1) newStreetSelection.splice(streetIndex, 1);
        mapContext.onHighlightStreetProperty(newStreetSelection, mapContext.currentHighlight.property);
      } else if (rec.type === 24) {
        const propertyIndex = mapContext.currentHighlight.property.indexOf(rec.uprn.toString());
        const newPropertySelection = [...mapContext.currentHighlight.property];
        if (propertyIndex > -1) newPropertySelection.splice(propertyIndex, 1);
        mapContext.onHighlightStreetProperty(mapContext.currentHighlight.street, newPropertySelection);
      }
    }

    if (onToggleItem) onToggleItem(rec.id);
  };

  /**
   * Event to handle the displaying of the street context actions menu.
   *
   * @param {object} event The event object.
   */
  const handleStreetActionsMenuClick = (event) => {
    setAnchorStreetActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle when the street context actions menu is closed.
   *
   * @param {object} event The event object.
   */
  const handleStreetActionsMenuClose = (event) => {
    setAnchorStreetActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle the displaying of the property context actions menu.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle when the property context actions menu is closed.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the context actions menu is closed.
   *
   * @param {object} event The event object.
   */
  const handleActionsMenusClose = (event) => {
    setAnchorStreetActionsEl(null);
    setAnchorPropertyActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle adding a new property.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function HandleAddProperty(event, rec) {
    handleStreetActionsMenuClose(event);

    await GetStreetMapData(rec.usrn, userContext, settingsContext.isScottish).then((result) => {
      if (result && result.state !== 4) {
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);
        mapContext.onWizardSetCoordinate(null);
        propertyWizardType.current = "property";
        propertyWizardParent.current = rec;
        setOpenPropertyWizard(true);
      } else {
        alertType.current = "invalidSingleState";
        setAlertOpen(true);
      }
    });
  }

  /**
   * Event to handle adding a range of new properties.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function HandleAddRange(event, rec) {
    handleStreetActionsMenuClose(event);

    await GetStreetMapData(rec.usrn, userContext, settingsContext.isScottish).then((result) => {
      if (result && result.state !== 4) {
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);
        mapContext.onWizardSetCoordinate(null);
        propertyWizardType.current = "range";
        propertyWizardParent.current = rec;
        setOpenPropertyWizard(true);
      } else {
        alertType.current = "invalidRangeState";
        setAlertOpen(true);
      }
    });
  }

  /**
   * Display the street/property in Google Street View.
   *
   * @param {object} event The event object
   * @param {object} rec The record that needs to be displayed in Google Street View.
   */
  function handleStreetViewClick(event, rec) {
    if (rec) {
      if (rec.type === 15) {
        handleStreetActionsMenuClose(event);
        if (rec.usrn) DisplayStreetInStreetView(rec.usrn, userContext, settingsContext.isScottish);
      } else {
        handlePropertyActionsMenuClose(event);
        if (rec.easting && rec.northing) openInStreetView([rec.easting, rec.northing]);
      }
    }
  }

  /**
   * Event to handle when the property wizard is done.
   *
   * @param {object} wizardData The data returned from the wizard.
   */
  const handlePropertyWizardDone = async (wizardData) => {
    if (wizardData && wizardData.savedProperty) {
      const isRange = Array.isArray(wizardData.savedProperty);

      if (isRange) {
        UpdateRangeAfterSave(
          wizardData.savedProperty,
          lookupContext,
          mapContext,
          propertyContext,
          sandboxContext,
          settingsContext.isWelsh,
          searchContext
        );
      } else {
        UpdateAfterSave(
          wizardData.savedProperty,
          lookupContext,
          mapContext,
          propertyContext,
          sandboxContext,
          settingsContext.isWelsh,
          searchContext
        );
      }

      // if (!isRange) navigate.goBack();
      if (!isRange) history.goBack();

      const parentData =
        isRange && wizardData.savedProperty && wizardData.savedProperty.length > 0
          ? await GetPropertyMapData(wizardData.savedProperty[0].parentUprn, userContext)
          : null;
      const engLpis = parentData && parentData.lpis ? parentData.lpis.filter((x) => x.language === "ENG") : null;
      const parent =
        parentData && engLpis
          ? {
              uprn: parentData.uprn,
              usrn: engLpis[0].usrn,
              easting: parentData.xcoordinate,
              northing: parentData.ycoordinate,
              address: engLpis[0].address,
              postcode: engLpis[0].postcode,
            }
          : null;

      propertyContext.onWizardDone(wizardData, isRange, parent, "search");
    } else propertyContext.onWizardDone(wizardData, false, null, "search");

    sandboxContext.resetSandbox();
    if (wizardData.type !== "view" && wizardData.variant !== "range") streetContext.resetStreet();
    streetContext.resetStreetErrors();
    if (wizardData.type !== "view" && wizardData.variant !== "rangeChildren") propertyContext.resetProperty();
    propertyContext.resetPropertyErrors();
    mapContext.onEditMapObject(null, null);
  };

  /**
   * Event to handle when the property wizard dialog closes.
   */
  const handlePropertyWizardClose = () => {
    setOpenPropertyWizard(false);
  };

  /**
   * Event to handle when the historic property dialog is closed.
   *
   * @param {string} action The action taken from the dialog
   */
  const handleHistoricPropertyClose = (action) => {
    setOpenHistoricProperty(false);
    if (action === "continue") {
      if (historicRec.current) {
        doOpenRecord(
          historicRec.current.property,
          historicRec.current.related,
          searchContext.currentSearchData.results,
          mapContext,
          streetContext,
          propertyContext,
          userContext,
          settingsContext.isScottish
        );
      }
    }
  };

  /**
   * Event to handle when the make child of dialog closes.
   */
  const handleMakeChildClose = () => {
    setOpenMakeChild(false);
    searchContext.onHideSearch(false);
    setMakeChildUprn([]);
  };

  /**
   * Event to handle when a record is clicked.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function handleOpenRecord(event, rec) {
    handleActionsMenusClose(event);

    if (mapContext.selectingProperties) mapContext.onSelectPropertiesChange(false);

    if (rec.type === 15) {
      streetContext.onStreetChange(rec.usrn, rec.street, false);
      const foundStreet = userContext.currentUser.hasStreet
        ? mapContext.currentSearchData.streets.find(({ usrn }) => usrn === rec.usrn)
        : mapContext.currentSearchData.llpgStreets.find(({ usrn }) => usrn === rec.usrn);
      const currentSearchStreets = userContext.currentUser.hasStreet
        ? JSON.parse(JSON.stringify(mapContext.currentSearchData.streets))
        : JSON.parse(JSON.stringify(mapContext.currentSearchData.llpgStreets));

      if (!foundStreet) {
        const streetData = await GetStreetMapData(rec.usrn, userContext, settingsContext.isScottish);
        const esus = streetData
          ? userContext.currentUser.hasStreet
            ? streetData.esus.map((esuRec) => ({
                esuId: esuRec.esuId,
                state: settingsContext.isScottish ? esuRec.state : undefined,
                geometry:
                  esuRec.wktGeometry && esuRec.wktGeometry !== "" ? GetWktCoordinates(esuRec.wktGeometry) : undefined,
              }))
            : [
                {
                  esuId: -1,
                  state: undefined,
                  geometry: GetWktCoordinates(
                    `LINESTRING (${streetData.streetStartX} ${streetData.streetStartY}, ${streetData.streetEndX} ${streetData.streetEndY})`
                  ),
                },
              ]
          : [];
        const asdType51 =
          userContext.currentUser.hasStreet && settingsContext.isScottish && streetData
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
          userContext.currentUser.hasStreet && settingsContext.isScottish && streetData
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
          userContext.currentUser.hasStreet && settingsContext.isScottish && streetData
            ? streetData.specialDesignations.map((asdRec) => ({
                type: 53,
                pkId: asdRec.pkId,
                usrn: asdRec.usrn,
                specialDesignationCode: asdRec.specialDesignationCode,
                custodianCode: asdRec.custodianCode,
                authorityCode: asdRec.authorityCode,
                wholeRoad: asdRec.wholeRoad,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              }))
            : [];
        const asdType61 =
          userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
          userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
          userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
          userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
          userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
        currentSearchStreets.push({
          usrn: rec.usrn,
          description: rec.street,
          language: rec.language,
          locality: rec.locality,
          town: rec.town,
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
        });
      }
      mapContext.onSearchDataChange(
        userContext.currentUser.hasStreet ? currentSearchStreets : [],
        !userContext.currentUser.hasStreet ? currentSearchStreets : [],
        mapContext.currentSearchData.properties,
        rec.usrn,
        null
      );
      mapContext.onEditMapObject(null, null);
    } else if (rec.type === 24) {
      if (rec.logical_status === 8) {
        historicRec.current = { property: rec, related: null };
        setOpenHistoricProperty(true);
      } else {
        doOpenRecord(
          rec,
          null,
          searchContext.currentSearchData.results,
          mapContext,
          streetContext,
          propertyContext,
          userContext,
          settingsContext.isScottish
        );
      }
    }
  }

  /**
   * Event to handle when the mouse enters a record.
   *
   * @param {object} rec The search record.
   */
  const handleMouseEnter = (rec) => {
    setItemSelected(rec.id);
    searchContext.onSearchOpen(false);

    if (checked.length === 0) {
      if (rec.type === 15) {
        mapContext.onHighlightStreetProperty([rec.usrn.toString()], null);
      } else if (rec.type === 24) {
        mapContext.onHighlightStreetProperty(null, [rec.uprn.toString()]);
      }
    }
  };

  /**
   * Event to handle when the mouse leaves a record.
   */
  const handleMouseLeave = () => {
    setItemSelected(null);
    if (checked.length === 0) mapContext.onHighlightClear();
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   * @param {object} event The event object.
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (event, text, dataType) => {
    handleActionsMenusClose(event);
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Event to handle opening the copy alert.
   *
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const handleSetCopyOpen = (dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(true, dataType);
  };

  /**
   * Event to display the list of errors.
   *
   * @param {string} typeOfError The type of error.
   */
  const handleSelectionError = (typeOfError) => {
    if (typeOfError) {
      alertType.current = typeOfError;
      setAlertOpen(true);
    }
  };

  /**
   * Event to handle display the alert after moving seed points.
   */
  const handlePropertyMoved = () => {
    alertType.current = "propertyMoved";
    setAlertOpen(true);
  };

  /**
   * Method to zoom the map to the given street.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street.
   */
  async function zoomToStreet(event, usrn) {
    handleStreetActionsMenuClose(event);

    const found = mapContext.currentSearchData.streets.find((rec) => rec.usrn === usrn);
    const streetData = await GetStreetMapData(usrn, userContext, settingsContext.isScottish);

    const highlightStreet = {
      usrn: usrn,
      minX: streetData.streetStartX < streetData.streetEndX ? streetData.streetStartX : streetData.streetEndX,
      minY: streetData.streetStartY < streetData.streetEndY ? streetData.streetStartY : streetData.streetEndY,
      maxX: streetData.streetStartX > streetData.streetEndX ? streetData.streetStartX : streetData.streetEndX,
      maxY: streetData.streetStartY > streetData.streetEndY ? streetData.streetStartY : streetData.streetEndY,
    };

    if (!found) {
      const newMapSearchProperties = mapContext.currentSearchData.streets;
      newMapSearchProperties.push(await getStreetSearchData(streetData, settingsContext.isScottish));
    }

    mapContext.onMapChange(mapContext.currentLayers.extents, highlightStreet, null);
  }

  /**
   * Method to remove the given item from the list.
   *
   * @param {object} event The event object.
   * @param {string} id The id of the record to remove.
   * @param {boolean} isStreet True if this is a street; otherwise false.
   */
  const removeFromList = async (event, id, isStreet) => {
    if (isStreet) handleStreetActionsMenuClose(event);
    else handlePropertyActionsMenuClose(event);

    const newSearchData = searchContext.currentSearchData.results.filter((x) => x.id !== id);

    const searchStreets = userContext.currentUser.hasStreet
      ? await Promise.all(
          newSearchData
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
                          specialDesignationCode: asdRec.specialDesignationCode,
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
        )
      : [];

    const searchLlpgStreets = !userContext.currentUser.hasStreet
      ? await Promise.all(
          newSearchData
            .filter((x) => x.type === 15)
            .map(async (x) => {
              try {
                return await GetStreetMapData(x.usrn, userContext, settingsContext.isScottish).then((streetData) => {
                  const streetEsus = streetData
                    ? [
                        {
                          esuId: -1,
                          state: undefined,
                          geometry: GetWktCoordinates(
                            `LINESTRING (${streetData.streetStartX} ${streetData.streetStartY}, ${streetData.streetEndX} ${streetData.streetEndY})`
                          ),
                        },
                      ]
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
                    asdType51: [],
                    asdType52: [],
                    asdType53: [],
                    asdType61: [],
                    asdType62: [],
                    asdType63: [],
                    asdType64: [],
                    asdType66: [],
                  };
                  return streetObj;
                });
              } catch (err) {
                throw err;
              }
            })
        )
      : [];

    const searchProperties = newSearchData
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

    searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newSearchData);
    mapContext.onSearchDataChange(searchStreets, searchLlpgStreets, searchProperties, null, null);
  };

  /**
   * Method to make the record a child.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  const handleMakeChildOf = (event, rec) => {
    handlePropertyActionsMenuClose(event);

    if (rec) {
      setMakeChildUprn([rec.uprn]);
      setOpenMakeChild(true);
      searchContext.onHideSearch(true);
    }
  };

  /**
   * Method to close the street.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function CloseStreet(event, rec) {
    await handleOpenRecord(event, rec);

    streetContext.onCloseStreet(true);
  }

  /**
   * Method to delete the given street.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street.
   */
  async function DeleteStreet(event, usrn) {
    handleStreetActionsMenuClose(event);
    deleteUSRN.current = usrn;
    deleteUPRN.current = null;
    await GetAssociatedRecords();
    const deleteStreet = await GetStreetMapData(usrn, userContext, settingsContext.isScottish);
    setChildCount(deleteStreet && deleteStreet.esus ? deleteStreet.esus.length : 0);
    setOpenDeleteConfirmation(true);
  }

  /**
   * Event to handle adding a child property.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function HandleAddChild(event, rec) {
    handlePropertyActionsMenuClose(event);

    GetParentHierarchy(rec.uprn, userContext).then((parentProperties) => {
      if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);
        mapContext.onWizardSetCoordinate(null);
        propertyWizardType.current = "child";
        propertyWizardParent.current = rec;
        setOpenPropertyWizard(true);
      } else {
        alertType.current = "maxParentLevel";
        setAlertOpen(true);
      }
    });
  }

  /**
   * Event to handle adding a range of child properties.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  function HandleAddChildren(event, rec) {
    handlePropertyActionsMenuClose(event);

    GetParentHierarchy(rec.uprn, userContext).then((parentProperties) => {
      if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);
        mapContext.onWizardSetCoordinate(null);
        propertyWizardType.current = "rangeChildren";
        propertyWizardParent.current = rec;
        setOpenPropertyWizard(true);
      } else {
        alertType.current = "maxParentLevel";
        setAlertOpen(true);
      }
    });
  }

  /**
   * Method to zoom the map to the given property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property.
   */
  const zoomToProperty = (event, uprn) => {
    handlePropertyActionsMenuClose(event);

    const found = mapContext.currentSearchData.properties.find((rec) => rec.uprn === uprn);

    if (found) {
      mapContext.onMapChange(mapContext.currentLayers.extents, null, uprn);
    }
  };

  /**
   * Method to reject the property.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function RejectProperty(event, rec) {
    await handleOpenRecord(event, rec);

    propertyContext.onLogicalStatusChange(9);

    const found = mapContext.currentSearchData.properties.find((x) => x.uprn === rec.uprn);

    if (found) {
      const updatedProperty = {
        uprn: found.uprn,
        parentUprn: found.parentUprn,
        address: found.address,
        formattedAddress: found.formattedAddress,
        postcode: found.postcode,
        easting: found.easting,
        northing: found.northing,
        logicalStatus: 9,
        classificationCode: found.classificationCode,
      };

      const currentSearchProperties = mapContext.currentSearchData.properties.map(
        (x) => [updatedProperty].find((rec) => rec.uprn === x.uprn) || x
      );

      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.llpgStreets,
        currentSearchProperties,
        null,
        rec.uprn
      );
    }
  }

  /**
   * Method to historicise the property.
   *
   * @param {object} event The event object.
   * @param {object} rec The search record.
   */
  async function HistoriciseProperty(event, rec) {
    await handleOpenRecord(event, rec);

    propertyContext.onLogicalStatusChange(8);

    const found = mapContext.currentSearchData.properties.find((x) => x.uprn === rec.uprn);

    if (found) {
      const updatedProperty = {
        uprn: found.uprn,
        parentUprn: found.parentUprn,
        address: found.address,
        formattedAddress: found.formattedAddress,
        postcode: found.postcode,
        easting: found.easting,
        northing: found.northing,
        logicalStatus: 8,
        classificationCode: found.classificationCode,
      };

      const currentSearchProperties = mapContext.currentSearchData.properties.map(
        (x) => [updatedProperty].find((rec) => rec.uprn === x.uprn) || x
      );

      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.llpgStreets,
        currentSearchProperties,
        null,
        rec.uprn
      );
    }
  }

  /**
   * Method to delete the given property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property.
   */
  async function DeleteProperty(event, uprn) {
    handlePropertyActionsMenuClose(event);
    deleteUSRN.current = null;
    deleteUPRN.current = uprn;
    await GetAssociatedRecords();
    const deleteProperty = await GetPropertyMapData(uprn, userContext);
    setChildCount(deleteProperty ? deleteProperty.childCount : 0);
    setOpenDeleteConfirmation(true);
  }

  /**
   * Method to get the search item styling.
   *
   * @param {number} recId The id of the search record.
   * @returns {object} The styling to be used for the search item.
   */
  function GetSearchItemStyle(recId) {
    if ((itemSelected && itemSelected === recId) || checked.indexOf(recId) !== -1)
      return {
        pl: theme.spacing(1.5),
        pt: theme.spacing(1),
        pr: theme.spacing(1),
        height: "42px",
      };
    else
      return {
        pl: "42px",
        pt: theme.spacing(1),
        pr: theme.spacing(1),
        height: "42px",
      };
  }

  /**
   * Event to handle when the selection dialog closes.
   */
  const handleCloseSelection = () => {
    if (onClearSelection) onClearSelection();
  };

  /**
   * Method to get the street from the given id.
   *
   * @param {number} streetId The id for the street.
   * @returns {object|null} The street record.
   */
  const getStreetFromId = (streetId) => {
    const street = data ? data.filter((x) => x.id === streetId) : null;
    return street && street.length > 0 ? { id: street[0].usrn, logical_status: street[0].logical_status } : null;
  };

  /**
   * Method to get the property from the given LPI key.
   *
   * @param {number} lpiKey The LPI key for the property.
   * @returns {object|null} The property record.
   */
  const getPropertyFromLPIKey = (lpiKey) => {
    const property = data ? data.find((x) => x.id === lpiKey) : null;
    return property ? { id: property.uprn, logical_status: property.logical_status } : null;
  };

  /**
   * Method to get the property address from the given LPI key.
   *
   * @param {number} lpiKey The LPI key for the property.
   * @returns {string|null} The property address.
   */
  const getAddressFromLPIKey = (lpiKey) => {
    const property = data ? data.find((x) => x.id === lpiKey) : null;
    return property ? property.formattedaddress : null;
  };

  /**
   * Method to get the unique selected USRNs from the ids.
   *
   * @param {array} ids The array of ids for the selected streets
   * @returns {array} An array of the unique selected USRNs.
   */
  const getUsrnsFromIds = (ids) => {
    return data ? [...new Set(data.filter((x) => ids.includes(x.id)).map((x) => x.usrn))] : [];
  };

  /**
   * Method to get the unique selected UPRNs from the LPI keys.
   *
   * @param {array} lpiKeys The array of LPI keys for the selected addresses
   * @returns {array} An array of the unique selected UPRNs.
   */
  const getUprnsFromLpiKeys = (lpiKeys) => {
    return data ? [...new Set(data.filter((x) => lpiKeys.includes(x.id)).map((x) => x.uprn))] : [];
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   * @param {boolean} deleteChildren True if the user has confirmed to delete the child ESUs or properties when deleting a street or parent property; otherwise false.
   */
  async function HandleCloseDeleteConfirmation(deleteConfirmed, deleteChildren) {
    setOpenDeleteConfirmation(false);

    if (deleteConfirmed) {
      if (deleteUSRN.current) {
        const result = await StreetDelete(
          deleteUSRN.current,
          deleteChildren,
          lookupContext,
          streetContext,
          userContext,
          settingsContext.isScottish
        );

        if (onSetDeleteOpen) onSetDeleteOpen(true, "Street", result, deleteUSRN.current, deleteChildren);
      } else if (deleteUPRN.current) {
        const result = await PropertyDelete(deleteUPRN.current, deleteChildren, userContext, propertyContext);

        if (onSetDeleteOpen) onSetDeleteOpen(true, "Property", result, deleteUPRN.current, deleteChildren);
      }
    }

    deleteUSRN.current = null;
    deleteUPRN.current = null;
    setAssociatedRecords(null);
  }

  /**
   * Method to get a list of the associated records for a street or property.
   */
  async function GetAssociatedRecords() {
    let associatedRecords = [];
    if (deleteUSRN.current) {
      const streetData = await GetStreetMapData(deleteUSRN.current, userContext, settingsContext.isScottish);

      if (streetData) {
        if (streetData.streetDescriptors && streetData.streetDescriptors.length > 0)
          associatedRecords.push({
            type: "descriptor",
            count: streetData.streetDescriptors.length,
          });
        if (streetData.esus && streetData.esus.length > 0) {
          associatedRecords.push({
            type: "ESU",
            count: streetData.esus.length,
          });

          let hdCount = 0;
          let oweCount = 0;

          streetData.esus.forEach((esu) => {
            hdCount += esu.highwayDedications ? esu.highwayDedications.length : 0;
            oweCount += esu.oneWayExemptions ? esu.oneWayExemptions.length : 0;
          });

          if (hdCount > 0)
            associatedRecords.push({
              type: "highway dedication",
              count: hdCount,
            });
          if (oweCount > 0)
            associatedRecords.push({
              type: "one-way exemption",
              count: oweCount,
            });
        }
        if (streetData.successorCrossRefs && streetData.successorCrossRefs.length > 0)
          associatedRecords.push({
            type: "successor",
            count: streetData.successorCrossRefs.length,
          });
        if (streetData.maintenanceResponsibilities && streetData.maintenanceResponsibilities.length > 0)
          associatedRecords.push({
            type: "maintenance responsibility",
            count: streetData.maintenanceResponsibilities.length,
          });
        if (streetData.reinstatementCategories && streetData.reinstatementCategories.length > 0)
          associatedRecords.push({
            type: "reinstatement category",
            count: streetData.reinstatementCategories.length,
          });
        if (streetData.interests && streetData.interests.length > 0)
          associatedRecords.push({
            type: "interested organisation",
            count: streetData.interests.length,
          });
        if (streetData.constructions && streetData.constructions.length > 0)
          associatedRecords.push({
            type: "construction",
            count: streetData.constructions.length,
          });
        if (streetData.specialDesignations && streetData.specialDesignations.length > 0)
          associatedRecords.push({
            type: "special designation",
            count: streetData.specialDesignations.length,
          });
        if (streetData.heightWidthWeights && streetData.heightWidthWeights.length > 0)
          associatedRecords.push({
            type: "height, width and weight restriction",
            count: streetData.heightWidthWeights.length,
          });
        if (streetData.publicRightOfWays && streetData.publicRightOfWays.length > 0)
          associatedRecords.push({
            type: "public right of way",
            count: streetData.publicRightOfWays.length,
          });
        if (streetData.streetNotes && streetData.streetNotes.length > 0)
          associatedRecords.push({
            type: "note",
            count: streetData.streetNotes.length,
          });
      }
    } else if (deleteUPRN.current) {
      const propertyData = await GetPropertyMapData(deleteUPRN.current, userContext);

      if (propertyData) {
        if (propertyData.lpis && propertyData.lpis.length > 0)
          associatedRecords.push({
            type: "lpi",
            count: propertyData.lpis.length,
          });
        if (propertyData.classifications && propertyData.classifications.length > 0)
          associatedRecords.push({
            type: "classification",
            count: propertyData.classifications.length,
          });
        if (propertyData.organisations && propertyData.organisations.length > 0)
          associatedRecords.push({
            type: "organisation",
            count: propertyData.organisations.length,
          });
        if (propertyData.successorCrossRefs && propertyData.successorCrossRefs.length > 0)
          associatedRecords.push({
            type: "successor",
            count: propertyData.successorCrossRefs.length,
          });
        if (propertyData.blpuAppCrossRefs && propertyData.blpuAppCrossRefs.length > 0)
          associatedRecords.push({
            type: "cross reference",
            count: propertyData.blpuAppCrossRefs.length,
          });
        if (propertyData.blpuProvenances && propertyData.blpuProvenances.length > 0)
          associatedRecords.push({
            type: "BLPU provenance",
            count: propertyData.blpuProvenances.length,
          });
        if (propertyData.blpuNotes && propertyData.blpuNotes.length > 0)
          associatedRecords.push({
            type: "note",
            count: propertyData.blpuNotes.length,
          });
      }
    }

    if (associatedRecords.length > 0) setAssociatedRecords(associatedRecords);
    else setAssociatedRecords(null);
  }

  /**
   * Event to handle when the alert closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   * @returns
   */
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertOpen(false);
  };

  useEffect(() => {
    if (checked && checked.length > 0) {
      if (userCanEditStreet || userCanEditProperty)
        setSelectionAnchorEl(
          document.getElementById(`${variant === "list" ? "ads-search-data-list" : "ads-search-data-grid"}`)
        );
      const propertyChecked = checked.filter((x) => x.indexOf("L") === 4);
      setPropertyCount(propertyChecked.length);
      const streetChecked = checked.filter((x) => x.indexOf("L") === -1);
      setStreetCount(streetChecked.length);
    } else setSelectionAnchorEl(null);
  }, [checked, variant, userCanEditStreet, userCanEditProperty]);

  useEffect(() => {
    setUserCanEditStreet(userContext.currentUser && userContext.currentUser.editStreet);
    setUserCanEditProperty(userContext.currentUser && userContext.currentUser.editProperty);
  }, [userContext]);

  useEffect(() => {
    if (
      propertyContext.wizardData &&
      propertyContext.wizardData.source &&
      propertyContext.wizardData.source === "search"
    ) {
      if (!propertyContext.wizardData.savedProperty || propertyContext.wizardData.savedProperty.length === 0) {
        if (propertyContext.wizardData.type === "close") setOpenPropertyWizard(false);
      } else {
        const savedUprn = Array.isArray(propertyContext.wizardData.savedProperty)
          ? propertyContext.wizardData.savedProperty[0].uprn
          : propertyContext.wizardData.savedProperty.uprn;

        if (savedUprn !== wizardUprn.current) {
          wizardUprn.current = savedUprn;
          const engLpi = ["addChild", "addChildren"].includes(propertyContext.wizardData.type)
            ? propertyContext.wizardData.savedProperty.lpis.filter((x) => x.language === "ENG")
            : null;

          switch (propertyContext.wizardData.type) {
            case "view":
              const rangeEngLpis = ["range", "rangeChildren"].includes(propertyContext.wizardData.variant)
                ? propertyContext.wizardData.savedProperty[0].lpis.filter((x) => x.language === "ENG")
                : null;

              switch (propertyContext.wizardData.variant) {
                case "range":
                  doOpenRecord(
                    {
                      type: 15,
                      usrn: rangeEngLpis[0].usrn,
                    },
                    savedUprn,
                    searchContext.currentSearchData.results,
                    mapContext,
                    streetContext,
                    propertyContext,
                    userContext,
                    settingsContext.isScottish
                  );
                  break;

                case "rangeChildren":
                  const parentRec = {
                    type: 24,
                    uprn: propertyContext.wizardData.parent.uprn,
                    address: propertyContext.wizardData.parent.address,
                    formattedAddress: propertyContext.wizardData.parent.address,
                    postcode: propertyContext.wizardData.parent.postcode,
                    easting: propertyContext.wizardData.parent.xcoordinate,
                    northing: propertyContext.wizardData.parent.ycoordinate,
                    logical_status: propertyContext.wizardData.parent.logicalStatus,
                    classification_code: propertyContext.wizardData.parent.blpuClass,
                  };
                  const relatedObj = {
                    parent: propertyContext.wizardData.parent.uprn,
                    property: rangeEngLpis[0].uprn,
                    currentUser: userContext.currentUser,
                  };
                  if (parentRec.logicalStatus === 8) {
                    historicRec.current = { property: parentRec, related: relatedObj };
                    setOpenHistoricProperty(true);
                  } else
                    doOpenRecord(
                      parentRec,
                      relatedObj,
                      searchContext.currentSearchData.results,
                      mapContext,
                      streetContext,
                      propertyContext,
                      userContext,
                      settingsContext.isScottish
                    );
                  break;

                default:
                  const engLpis = propertyContext.wizardData.savedProperty.lpis.filter((x) => x.language === "ENG");
                  const savedRec = {
                    type: 24,
                    uprn: propertyContext.wizardData.savedProperty.uprn,
                    address: engLpis[0].address,
                    formattedAddress: engLpis[0].address,
                    postcode: engLpis[0].postcode,
                    easting: propertyContext.wizardData.savedProperty.xcoordinate,
                    northing: propertyContext.wizardData.savedProperty.ycoordinate,
                    logical_status: propertyContext.wizardData.savedProperty.logicalStatus,
                    classification_code: propertyContext.wizardData.savedProperty.blpuClass,
                  };

                  if (savedRec.logical_status === 8) {
                    historicRec.current = { property: savedRec, related: null };
                    setOpenHistoricProperty(true);
                  } else
                    doOpenRecord(
                      savedRec,
                      null,
                      searchContext.currentSearchData.results,
                      mapContext,
                      streetContext,
                      propertyContext,
                      userContext,
                      settingsContext.isScottish
                    );
                  break;
              }
              propertyContext.onWizardDone(null, false, null, null);
              setOpenPropertyWizard(false);
              break;

            case "addChild":
              GetParentHierarchy(propertyContext.wizardData.savedProperty.uprn, userContext).then(
                (parentProperties) => {
                  if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
                    propertyContext.resetPropertyErrors();
                    propertyContext.onWizardDone(null, false, null, null);
                    mapContext.onWizardSetCoordinate(null);
                    propertyWizardType.current = "child";
                    propertyWizardParent.current = {
                      type: 24,
                      id: engLpi[0].lpi_key,
                      uprn: propertyContext.wizardData.savedProperty.uprn,
                      usrn: engLpi[0].usrn,
                      logical_status: propertyContext.wizardData.savedProperty.logicalStatus,
                      language: "ENG",
                      classification_code: settingsContext.isScottish
                        ? propertyContext.wizardData.savedProperty.classifications[0].blpuClass
                        : propertyContext.wizardData.savedProperty.blpuClass,
                      isParent: true,
                      parent_uprn: propertyContext.wizardData.savedProperty.parentUprn,
                      country: "",
                      authority: "",
                      longitude: 0,
                      latitude: 0,
                      easting: propertyContext.wizardData.savedProperty.xcoordinate,
                      northing: propertyContext.wizardData.savedProperty.ycoordinate,
                      full_building_desc: "",
                      formattedAddress: engLpi[0].address,
                      organisation: "",
                      secondary_name: "",
                      sao_text: "",
                      sao_nums: "",
                      primary_name: "",
                      pao_text: engLpi[0].paoText,
                      pao_nums: `${
                        engLpi[0].paoStartNumber && engLpi[0].paoStartNumber > 0 ? engLpi[0].paoStartNumber : ""
                      }${engLpi[0].paoEndNumber && engLpi[0].paoEndNumber > 0 ? " - " : ""}${
                        engLpi[0].paoEndNumber && engLpi[0].paoEndNumber > 0 ? engLpi[0].paoEndNumber : ""
                      }`,
                      street: "",
                      locality: "",
                      town: "",
                      post_town: "",
                      postcode: "",
                      crossref: "",
                      lpi_st_ref_type: 1,
                      blpu_state: 2,
                      address: engLpi[0].address,
                      sort_score: 0,
                    };
                    setOpenPropertyWizard(true);
                  } else {
                    alertType.current = "maxParentLevel";
                    setAlertOpen(true);
                  }
                }
              );
              break;

            case "addChildren":
              GetParentHierarchy(propertyContext.wizardData.savedProperty.uprn, userContext).then(
                (parentProperties) => {
                  if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
                    propertyContext.resetPropertyErrors();
                    propertyContext.onWizardDone(null, false, null, null);
                    mapContext.onWizardSetCoordinate(null);
                    propertyWizardType.current = "rangeChildren";
                    propertyWizardParent.current = {
                      type: 24,
                      id: engLpi[0].lpi_key,
                      uprn: propertyContext.wizardData.savedProperty.uprn,
                      usrn: engLpi[0].usrn,
                      logical_status: propertyContext.wizardData.savedProperty.logicalStatus,
                      language: "ENG",
                      classification_code: settingsContext.isScottish
                        ? propertyContext.wizardData.savedProperty.classifications[0].blpuClass
                        : propertyContext.wizardData.savedProperty.blpuClass,
                      isParent: true,
                      parent_uprn: propertyContext.wizardData.savedProperty.parentUprn,
                      country: "",
                      authority: "",
                      longitude: 0,
                      latitude: 0,
                      easting: propertyContext.wizardData.savedProperty.xcoordinate,
                      northing: propertyContext.wizardData.savedProperty.ycoordinate,
                      full_building_desc: "",
                      formattedAddress: engLpi[0].address,
                      organisation: "",
                      secondary_name: "",
                      sao_text: "",
                      sao_nums: "",
                      primary_name: "",
                      pao_text: engLpi[0].paoText,
                      pao_nums: `${
                        engLpi[0].paoStartNumber && engLpi[0].paoStartNumber > 0 ? engLpi[0].paoStartNumber : ""
                      }${engLpi[0].paoEndNumber && engLpi[0].paoEndNumber > 0 ? " - " : ""}${
                        engLpi[0].paoEndNumber && engLpi[0].paoEndNumber > 0 ? engLpi[0].paoEndNumber : ""
                      }`,
                      street: "",
                      locality: "",
                      town: "",
                      post_town: "",
                      postcode: "",
                      crossref: "",
                      lpi_st_ref_type: 1,
                      blpu_state: 2,
                      address: engLpi[0].address,
                      sort_score: 0,
                    };
                    setOpenPropertyWizard(true);
                  } else {
                    alertType.current = "maxParentLevel";
                    setAlertOpen(true);
                  }
                }
              );
              break;

            default:
              propertyContext.onWizardDone(null, false, null, null);
              setOpenPropertyWizard(false);
              break;
          }
        }
      }
    }
  }, [
    propertyContext.wizardData,
    mapContext,
    propertyContext,
    streetContext,
    userContext,
    searchContext.currentSearchData.results,
    settingsContext.isScottish,
  ]);

  // Clear selection control if required.
  useEffect(() => {
    if (!informationContext.informationSource && selectionAnchorEl && !checked && !checked.length) {
      setSelectionAnchorEl(null);
      mapContext.onHighlightClear();
    }
  }, [informationContext.informationSource, selectionAnchorEl, mapContext, checked]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      {variant === "list" ? (
        <Box sx={dataFormStyle("SearchDataTab")} id="ads-search-data-list">
          <List
            sx={{
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              pt: theme.spacing(0),
            }}
            component="nav"
            key={"list-search-data-list"}
          >
            {data && data.length > 0 ? (
              data
                .sort(
                  (a, b) =>
                    a.type - b.type ||
                    a.address.localeCompare(b.address, undefined, { numeric: true, sensitivity: "base" })
                )
                .map((rec) => (
                  <ListItemButton
                    divider
                    dense
                    disableGutters
                    sx={listItemButtonStyle(checked.indexOf(rec.id) !== -1)}
                    selected={itemSelected && itemSelected === rec.id}
                    onClick={(event) => handleOpenRecord(event, rec)}
                    onMouseEnter={() => handleMouseEnter(rec)}
                    onMouseLeave={handleMouseLeave}
                    id={rec.id}
                    key={rec.id}
                  >
                    <ListItemIcon sx={GetSearchItemStyle(rec.id)}>
                      {((itemSelected && itemSelected === rec.id) || checked.indexOf(rec.id) !== -1) && (
                        <Checkbox
                          edge="start"
                          checked={checked.indexOf(rec.id) !== -1}
                          color="primary"
                          tabIndex={-1}
                          onClick={(event) => handleToggle(event, rec)}
                          id={`gazetteer_list_checkbox_${rec.id}`}
                          sx={{ pb: theme.spacing(2.25), color: adsMidGreyA }}
                        />
                      )}
                      <Tooltip
                        title={GetAvatarTooltip(
                          rec.type,
                          rec.type === 15 ? rec.lpi_st_ref_type : rec.logical_status,
                          rec.classification_code,
                          rec.type === 15 ? rec.blpu_state : null,
                          settingsContext.isScottish,
                          rec
                        )}
                        arrow
                        placement="bottom"
                        sx={tooltipStyle}
                      >
                        {rec.type === 15
                          ? GetStreetIcon(
                              rec.lpi_st_ref_type,
                              GetAvatarColour(rec.blpu_state ? rec.blpu_state + 10 : 12)
                            )
                          : GetClassificationIcon(
                              rec.classification_code ? rec.classification_code : "U",
                              GetAvatarColour(rec.logical_status)
                            )}
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Tooltip title={addressToTitleCase(rec.address, rec.postcode)}>
                          <Typography variant="subtitle1" noWrap>
                            {addressToTitleCase(rec.address, rec.postcode)}
                          </Typography>
                        </Tooltip>
                      }
                    />
                    <ListItemAvatar
                      sx={{
                        minWidth: 32,
                      }}
                    >
                      {itemSelected &&
                        itemSelected === rec.id &&
                        checked &&
                        checked.length < 2 &&
                        (rec.type === 15 ? (
                          <Fragment>
                            <Tooltip title="Copy USRN" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton
                                onClick={(event) => itemCopy(event, rec.usrn.toString(), "USRN")}
                                size="small"
                              >
                                <CopyIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton
                                onClick={handleStreetActionsMenuClick}
                                aria-controls="street-actions-menu"
                                aria-haspopup="true"
                                size="small"
                              >
                                <MoreVertIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                            <Menu
                              id="street-actions-menu"
                              elevation={2}
                              anchorEl={anchorStreetActionsEl}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              keepMounted
                              open={Boolean(anchorStreetActionsEl)}
                              onClose={handleStreetActionsMenuClose}
                              sx={menuStyle}
                            >
                              {userCanEditProperty && rec.blpu_state !== 4 && (
                                <MenuItem
                                  dense
                                  disabled={![11, 12, 19].includes(rec.logical_status)}
                                  onClick={(event) => HandleAddProperty(event, rec)}
                                  sx={menuItemStyle(false)}
                                >
                                  <Typography variant="inherit">Add property</Typography>
                                </MenuItem>
                              )}
                              {userCanEditProperty && rec.blpu_state !== 4 && (
                                <MenuItem
                                  dense
                                  divider
                                  disabled={![11, 12, 19].includes(rec.logical_status)}
                                  onClick={(event) => HandleAddRange(event, rec)}
                                  sx={menuItemStyle(true)}
                                >
                                  <Typography variant="inherit">Add properties</Typography>
                                </MenuItem>
                              )}
                              <MenuItem
                                dense
                                onClick={(event) => handleStreetViewClick(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Open in Street View</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => zoomToStreet(event, rec.usrn)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Zoom to this</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                onClick={(event) => itemCopy(event, rec.usrn.toString(), "USRN")}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Copy USRN</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => removeFromList(event, rec.id, true)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Remove from list</Typography>
                              </MenuItem>
                              {userCanEditStreet && (
                                <MenuItem dense onClick={(event) => CloseStreet(event, rec)} sx={menuItemStyle(false)}>
                                  <Typography variant="inherit">Close</Typography>
                                </MenuItem>
                              )}
                              {!settingsContext.isScottish && userCanEditStreet && (
                                <MenuItem
                                  dense
                                  onClick={(event) => DeleteStreet(event, rec.usrn)}
                                  sx={menuItemStyle(false)}
                                >
                                  <Typography variant="inherit" color="error">
                                    Delete
                                  </Typography>
                                </MenuItem>
                              )}
                            </Menu>
                          </Fragment>
                        ) : (
                          <Fragment>
                            <Tooltip title="Copy UPRN" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton
                                onClick={(event) => itemCopy(event, rec.uprn.toString(), "UPRN")}
                                size="small"
                              >
                                <CopyIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton
                                onClick={handlePropertyActionsMenuClick}
                                aria-controls="property-actions-menu"
                                aria-haspopup="true"
                                size="small"
                              >
                                <MoreVertIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                            <Menu
                              id="property-actions-menu"
                              elevation={2}
                              anchorEl={anchorPropertyActionsEl}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              keepMounted
                              open={Boolean(anchorPropertyActionsEl)}
                              onClose={handlePropertyActionsMenuClose}
                              sx={menuStyle}
                            >
                              {userCanEditProperty && (
                                <MenuItem
                                  dense
                                  disabled={rec.logical_status > 6}
                                  onClick={(event) => HandleAddChild(event, rec)}
                                  sx={menuItemStyle(false)}
                                >
                                  <Typography variant="inherit">Add child</Typography>
                                </MenuItem>
                              )}
                              {userCanEditProperty && (
                                <MenuItem
                                  dense
                                  disabled={rec.logical_status > 6}
                                  onClick={(event) => HandleAddChildren(event, rec)}
                                  divider
                                  sx={menuItemStyle(true)}
                                >
                                  <Typography variant="inherit">Add children</Typography>
                                </MenuItem>
                              )}
                              <MenuItem
                                dense
                                onClick={(event) => itemCopy(event, rec.uprn.toString(), "UPRN")}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Copy UPRN</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => itemCopy(event, rec.formattedaddress, "Address")}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Copy address</Typography>
                              </MenuItem>
                              <MenuItem
                                dense
                                onClick={(event) => handleStreetViewClick(event, rec)}
                                sx={menuItemStyle(false)}
                              >
                                <Typography variant="inherit">Open in Street View</Typography>
                              </MenuItem>
                              {process.env.NODE_ENV === "development" && (
                                <MenuItem dense disabled sx={menuItemStyle(false)}>
                                  <Typography variant="inherit">Search nearby</Typography>
                                </MenuItem>
                              )}
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => zoomToProperty(event, rec.uprn)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Zoom to this</Typography>
                              </MenuItem>
                              {process.env.NODE_ENV === "development" && (
                                <MenuItem dense disabled sx={menuItemStyle(false)}>
                                  <Typography variant="inherit">Bookmark</Typography>
                                </MenuItem>
                              )}
                              {process.env.NODE_ENV === "development" && (
                                <MenuItem dense disabled sx={menuItemStyle(false)}>
                                  <Typography variant="inherit">Add to list</Typography>
                                </MenuItem>
                              )}
                              <MenuItem
                                dense
                                divider
                                onClick={(event) => removeFromList(event, rec.id, false)}
                                sx={menuItemStyle(true)}
                              >
                                <Typography variant="inherit">Remove from list</Typography>
                              </MenuItem>
                              {process.env.NODE_ENV === "development" && userCanEditProperty && (
                                <MenuItem dense disabled sx={menuItemStyle(true)}>
                                  <Typography variant="inherit">Export to...</Typography>
                                </MenuItem>
                              )}
                              {process.env.NODE_ENV === "development" && userCanEditProperty && (
                                <MenuItem dense disabled sx={menuItemStyle(false)}>
                                  <Typography variant="inherit">Move street</Typography>
                                </MenuItem>
                              )}
                              {userCanEditProperty && (
                                <MenuItem
                                  dense
                                  sx={menuItemStyle(false)}
                                  onClick={(event) => handleMakeChildOf(event, rec)}
                                >
                                  <Typography variant="inherit">Make child of...</Typography>
                                </MenuItem>
                              )}
                              {process.env.NODE_ENV === "development" && userCanEditProperty && (
                                <MenuItem dense divider disabled sx={menuItemStyle(true)}>
                                  <Typography variant="inherit">Move seed point</Typography>
                                </MenuItem>
                              )}
                              {userCanEditProperty && (
                                <MenuItem
                                  dense
                                  onClick={(event) => RejectProperty(event, rec)}
                                  sx={menuItemStyle(false)}
                                >
                                  <Typography variant="inherit">Reject</Typography>
                                </MenuItem>
                              )}
                              {userCanEditProperty && (
                                <MenuItem
                                  dense
                                  onClick={(event) => HistoriciseProperty(event, rec)}
                                  sx={menuItemStyle(false)}
                                >
                                  <Typography variant="inherit">Historicise</Typography>
                                </MenuItem>
                              )}
                              {userCanEditProperty && (
                                <MenuItem
                                  dense
                                  onClick={(event) => DeleteProperty(event, rec.uprn)}
                                  sx={menuItemStyle(false)}
                                >
                                  <Typography variant="inherit" color="error">
                                    Delete
                                  </Typography>
                                </MenuItem>
                              )}
                            </Menu>
                          </Fragment>
                        ))}
                    </ListItemAvatar>
                  </ListItemButton>
                ))
            ) : (
              <ListItemButton key="No results">
                <ListItemText primary={<Typography variant="body2">No results found for your search</Typography>} />
              </ListItemButton>
            )}
          </List>
        </Box>
      ) : (
        <Box sx={dataFormStyle("SearchDataTab")} id="ads-search-data-grid">
          <List
            sx={{
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              pr: theme.spacing(0),
              pt: theme.spacing(0),
            }}
            component="nav"
            key={"list-search-data-grid"}
          >
            {data && data.length > 0 ? (
              data
                .sort(
                  (a, b) =>
                    a.type - b.type ||
                    a.address.localeCompare(b.address, undefined, { numeric: true, sensitivity: "base" })
                )
                .map((rec) => (
                  <ListItemButton
                    alignItems="flex-start"
                    divider
                    dense
                    disableGutters
                    sx={listItemButtonStyle(checked.indexOf(rec.id) !== -1, true)}
                    selected={itemSelected && itemSelected === rec.id}
                    onClick={(event) => handleOpenRecord(event, rec)}
                    onMouseEnter={() => handleMouseEnter(rec)}
                    onMouseLeave={handleMouseLeave}
                    id={rec.id}
                    key={rec.id}
                  >
                    <ListItemIcon sx={GetSearchItemStyle(rec.id)}>
                      {((itemSelected && itemSelected === rec.id) || checked.indexOf(rec.id) !== -1) && (
                        <Checkbox
                          edge="start"
                          checked={checked.indexOf(rec.id) !== -1}
                          color="primary"
                          tabIndex={-1}
                          onClick={(event) => handleToggle(event, rec)}
                          id={`gazetteer_grid_checkbox_${rec.id}`}
                          sx={{ pb: theme.spacing(3.5), color: adsMidGreyA }}
                        />
                      )}
                      <Tooltip
                        title={GetAvatarTooltip(
                          rec.type,
                          rec.type === 15 ? rec.lpi_st_ref_type : rec.logical_status,
                          rec.classification_code,
                          rec.type === 15 ? rec.blpu_state : null,
                          settingsContext.isScottish
                        )}
                        arrow
                        placement="bottom"
                        sx={tooltipStyle}
                      >
                        {rec.type === 15
                          ? GetStreetIcon(
                              rec.lpi_st_ref_type,
                              GetAvatarColour(rec.blpu_state ? rec.blpu_state + 10 : 12)
                            )
                          : GetClassificationIcon(
                              rec.classification_code ? rec.classification_code : "U",
                              GetAvatarColour(rec.logical_status)
                            )}
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Grid2 container justifyContent="flex-start" alignItems="flex-start">
                          <Grid2
                            container
                            direction="column"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1}
                            size={6}
                          >
                            <Grid2 container direction="column">
                              {rec.type === 15 ? (
                                <Fragment>
                                  <Grid2>
                                    <Typography variant="body2" sx={{ fontSize: "15px", color: adsMidGreyA }}>
                                      {rec.street.replace(/\w\S*/g, function (txt) {
                                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                      })}
                                    </Typography>
                                  </Grid2>
                                  <Grid2>
                                    <Typography variant="body2" sx={{ fontSize: "15px", color: adsMidGreyA }}>
                                      {rec.town.replace(/\w\S*/g, function (txt) {
                                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                      })}
                                    </Typography>
                                  </Grid2>
                                </Fragment>
                              ) : (
                                formattedAddressToTitleCase(rec.formattedaddress, rec.postcode).map((address, idx) => (
                                  <Grid2 key={`key_${idx}`}>
                                    <Typography variant="body2" sx={{ fontSize: "15px", color: adsMidGreyA }}>
                                      {address}
                                    </Typography>
                                  </Grid2>
                                ))
                              )}
                            </Grid2>
                            <Grid2>
                              <Typography variant="body2" sx={{ fontSize: "15px", color: adsMidGreyA }}>
                                {rec.type === 15 ? rec.usrn : rec.uprn}
                              </Typography>
                            </Grid2>
                          </Grid2>
                          <Grid2
                            container
                            rowSpacing={2}
                            direction="column"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            size={3}
                          >
                            {rec.type === 15 ? (
                              <Fragment>
                                <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                                  <Grid2>
                                    <Typography
                                      sx={{
                                        color: adsMidGreyC,
                                      }}
                                      variant="caption"
                                    >
                                      State
                                    </Typography>
                                  </Grid2>
                                  <Grid2>
                                    <Typography variant="body2">Open</Typography>
                                  </Grid2>
                                </Grid2>
                                <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                                  <Grid2>
                                    <Typography
                                      sx={{
                                        color: adsMidGreyC,
                                      }}
                                      variant="caption"
                                    >
                                      Surface
                                    </Typography>
                                  </Grid2>
                                  <Grid2>
                                    <Typography variant="body2">Metalled</Typography>
                                  </Grid2>
                                </Grid2>
                                <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                                  <Grid2>
                                    <Typography
                                      sx={{
                                        color: adsMidGreyC,
                                      }}
                                      variant="caption"
                                    >
                                      Direction
                                    </Typography>
                                  </Grid2>
                                  <Grid2>
                                    <Typography variant="body2">Two way</Typography>
                                  </Grid2>
                                </Grid2>
                              </Fragment>
                            ) : (
                              <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                                <Grid2>
                                  <Typography
                                    sx={{
                                      color: adsMidGreyC,
                                    }}
                                    variant="caption"
                                  >
                                    Classification
                                  </Typography>
                                </Grid2>
                                <Grid2>
                                  <Typography variant="body2">
                                    {GetClassificationLabel(
                                      rec.classification_code ? rec.classification_code : "U",
                                      settingsContext.isScottish,
                                      false
                                    )}
                                  </Typography>
                                </Grid2>
                              </Grid2>
                            )}
                            <Grid2 container direction="column" justifyContent="flex-start" alignItems="flex-start">
                              <Grid2>
                                <Typography
                                  sx={{
                                    color: adsMidGreyC,
                                  }}
                                  variant="caption"
                                >
                                  Language
                                </Typography>
                              </Grid2>
                              <Grid2>
                                <Typography variant="body2">{rec.language}</Typography>
                              </Grid2>
                            </Grid2>
                          </Grid2>
                          <Grid2
                            container
                            direction="column"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1}
                            size={3}
                          >
                            <Grid2 container direction="column" justifyContent="space-between" alignItems="flex-end">
                              {itemSelected && itemSelected === rec.id ? (
                                rec.type === 15 ? (
                                  <Stack
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    sx={{ height: "41px" }}
                                  >
                                    <Tooltip title="Copy USRN" arrow placement="bottom" sx={tooltipStyle}>
                                      <IconButton
                                        onClick={(event) => itemCopy(event, rec.usrn.toString(), "USRN")}
                                        size="small"
                                      >
                                        <CopyIcon sx={ActionIconStyle()} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                                      <IconButton
                                        onClick={handleStreetActionsMenuClick}
                                        aria-controls="street-actions-menu"
                                        aria-haspopup="true"
                                        size="small"
                                      >
                                        <MoreVertIcon sx={ActionIconStyle()} />
                                      </IconButton>
                                    </Tooltip>
                                    <Menu
                                      id="street-actions-menu"
                                      elevation={2}
                                      anchorEl={anchorStreetActionsEl}
                                      anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                      }}
                                      transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                      }}
                                      keepMounted
                                      open={Boolean(anchorStreetActionsEl)}
                                      onClose={handleStreetActionsMenuClose}
                                      sx={menuStyle}
                                    >
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => HandleAddProperty(event, rec)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit">Add property</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          divider
                                          onClick={(event) => HandleAddRange(event, rec)}
                                          sx={menuItemStyle(true)}
                                        >
                                          <Typography variant="inherit">Add properties</Typography>
                                        </MenuItem>
                                      )}
                                      <MenuItem
                                        dense
                                        onClick={(event) => itemCopy(event, rec.usrn.toString(), "USRN")}
                                        sx={menuItemStyle(false)}
                                      >
                                        <Typography variant="inherit">Copy USRN</Typography>
                                      </MenuItem>
                                      <MenuItem
                                        dense
                                        onClick={(event) => handleStreetViewClick(event, rec)}
                                        sx={menuItemStyle(false)}
                                      >
                                        <Typography variant="inherit">Open in Street View</Typography>
                                      </MenuItem>
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense disabled sx={menuItemStyle(false)}>
                                          <Typography variant="inherit">Search nearby</Typography>
                                        </MenuItem>
                                      )}
                                      <MenuItem
                                        dense
                                        divider
                                        onClick={(usrn) => zoomToStreet(rec.usrn)}
                                        sx={menuItemStyle(false)}
                                      >
                                        <Typography variant="inherit">Zoom to this</Typography>
                                      </MenuItem>
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense disabled sx={menuItemStyle(false)}>
                                          <Typography variant="inherit">Bookmark</Typography>
                                        </MenuItem>
                                      )}
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense divider disabled sx={menuItemStyle(true)}>
                                          <Typography variant="inherit">Add to list</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditStreet && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => CloseStreet(event, rec)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit">Close street</Typography>
                                        </MenuItem>
                                      )}
                                      {!settingsContext.isScottish && userCanEditStreet && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => DeleteStreet(event, rec.usrn)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit" color="error">
                                            Delete
                                          </Typography>
                                        </MenuItem>
                                      )}
                                    </Menu>
                                  </Stack>
                                ) : (
                                  <Stack
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    sx={{ height: "41px" }}
                                  >
                                    <Tooltip title="Copy UPRN" arrow placement="bottom" sx={tooltipStyle}>
                                      <IconButton
                                        onClick={(event) => itemCopy(event, rec.uprn.toString(), "UPRN")}
                                        size="small"
                                      >
                                        <CopyIcon sx={ActionIconStyle()} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                                      <IconButton
                                        onClick={handlePropertyActionsMenuClick}
                                        aria-controls="property-actions-menu"
                                        aria-haspopup="true"
                                        size="small"
                                      >
                                        <MoreVertIcon sx={ActionIconStyle()} />
                                      </IconButton>
                                    </Tooltip>
                                    <Menu
                                      id="property-actions-menu"
                                      elevation={2}
                                      anchorEl={anchorPropertyActionsEl}
                                      anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                      }}
                                      transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                      }}
                                      keepMounted
                                      open={Boolean(anchorPropertyActionsEl)}
                                      onClose={handlePropertyActionsMenuClose}
                                      sx={menuStyle}
                                    >
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          disabled={rec.logical_status > 6}
                                          onClick={(event) => HandleAddChild(event, rec)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit">Add child</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          disabled={rec.logical_status > 6}
                                          onClick={(event) => HandleAddChildren(event, rec)}
                                          divider
                                          sx={menuItemStyle(true)}
                                        >
                                          <Typography variant="inherit">Add children</Typography>
                                        </MenuItem>
                                      )}
                                      <MenuItem
                                        dense
                                        onClick={(event) => itemCopy(event, rec.uprn.toString(), "UPRN")}
                                        sx={menuItemStyle(false)}
                                      >
                                        <Typography variant="inherit">Copy UPRN</Typography>
                                      </MenuItem>
                                      <MenuItem
                                        dense
                                        divider
                                        onClick={(event) => itemCopy(event, rec.formattedaddress, "Address")}
                                        sx={menuItemStyle(false)}
                                      >
                                        <Typography variant="inherit">Copy address</Typography>
                                      </MenuItem>
                                      <MenuItem
                                        dense
                                        onClick={(event) => handleStreetViewClick(event, rec)}
                                        sx={menuItemStyle(false)}
                                      >
                                        <Typography variant="inherit">Open in Street View</Typography>
                                      </MenuItem>
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense disabled sx={menuItemStyle(false)}>
                                          <Typography variant="inherit">Search nearby</Typography>
                                        </MenuItem>
                                      )}
                                      <MenuItem
                                        dense
                                        divider
                                        onClick={(uprn) => zoomToProperty(uprn)}
                                        sx={menuItemStyle(true)}
                                      >
                                        <Typography variant="inherit">Zoom to this</Typography>
                                      </MenuItem>
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense disabled sx={menuItemStyle(false)}>
                                          <Typography variant="inherit">Bookmark</Typography>
                                        </MenuItem>
                                      )}
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense disabled sx={menuItemStyle(false)}>
                                          <Typography variant="inherit">Add to list</Typography>
                                        </MenuItem>
                                      )}
                                      {process.env.NODE_ENV === "development" && (
                                        <MenuItem dense divider disabled sx={menuItemStyle(true)}>
                                          <Typography variant="inherit">Export to...</Typography>
                                        </MenuItem>
                                      )}
                                      {process.env.NODE_ENV === "development" && userCanEditProperty && (
                                        <MenuItem dense disabled sx={menuItemStyle(false)}>
                                          <Typography variant="inherit">Move street</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => handleMakeChildOf(event, rec)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit">Make child of...</Typography>
                                        </MenuItem>
                                      )}
                                      {process.env.NODE_ENV === "development" && userCanEditProperty && (
                                        <MenuItem dense divider disabled sx={menuItemStyle(true)}>
                                          <Typography variant="inherit">Move seed point</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => RejectProperty(event, rec)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit">Reject</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => HistoriciseProperty(event, rec)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit">Historicise</Typography>
                                        </MenuItem>
                                      )}
                                      {userCanEditProperty && (
                                        <MenuItem
                                          dense
                                          onClick={(event) => DeleteProperty(event, rec.uprn)}
                                          sx={menuItemStyle(false)}
                                        >
                                          <Typography variant="inherit" color="error">
                                            Delete
                                          </Typography>
                                        </MenuItem>
                                      )}
                                    </Menu>
                                  </Stack>
                                )
                              ) : (
                                <Fragment>
                                  <Grid2>
                                    <Typography
                                      sx={{
                                        color: adsMidGreyC,
                                        pr: theme.spacing(1),
                                      }}
                                      variant="caption"
                                    >
                                      Last updated
                                    </Typography>
                                  </Grid2>
                                  <Grid2>
                                    <Typography variant="body2" sx={{ pr: theme.spacing(1) }}>
                                      22/07/2021
                                    </Typography>
                                  </Grid2>
                                </Fragment>
                              )}
                            </Grid2>
                            {rec.type === 15 ? (
                              <Grid2
                                container
                                direction="column"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                                sx={{ pr: theme.spacing(1) }}
                              >
                                <Grid2>
                                  <Typography
                                    sx={{
                                      color: adsMidGreyC,
                                    }}
                                    variant="caption"
                                  >
                                    Special designation
                                  </Typography>
                                </Grid2>
                                <Grid2 container justifyContent="flex-end" spacing={1}>
                                  <Grid2>
                                    <Avatar
                                      variant="rounded"
                                      sx={{
                                        height: theme.spacing(2.5),
                                        width: theme.spacing(2.5),
                                        color: theme.palette.getContrastText(yellow[500]),
                                        backgroundColor: yellow[500],
                                      }}
                                    >
                                      <Typography variant="caption">1</Typography>
                                    </Avatar>
                                  </Grid2>
                                  <Grid2>
                                    <Avatar
                                      variant="rounded"
                                      sx={{
                                        height: theme.spacing(2.5),
                                        width: theme.spacing(2.5),
                                        color: theme.palette.getContrastText(yellow[500]),
                                        backgroundColor: yellow[500],
                                      }}
                                    >
                                      <Typography variant="caption">2</Typography>
                                    </Avatar>
                                  </Grid2>
                                  <Grid2>
                                    <Avatar
                                      variant="rounded"
                                      sx={{
                                        height: theme.spacing(2.5),
                                        width: theme.spacing(2.5),
                                        color: theme.palette.getContrastText(yellow[500]),
                                        backgroundColor: yellow[500],
                                      }}
                                    >
                                      <Typography variant="caption">3</Typography>
                                    </Avatar>
                                  </Grid2>
                                </Grid2>
                              </Grid2>
                            ) : (
                              <Grid2
                                container
                                direction="column"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                                sx={{ pr: theme.spacing(1) }}
                              >
                                <Grid2>
                                  <Typography
                                    sx={{
                                      color: adsMidGreyC,
                                    }}
                                    variant="caption"
                                  >
                                    Cross refs
                                  </Typography>
                                </Grid2>
                                <Grid2 container justifyContent="flex-end" spacing={1}>
                                  <Grid2>
                                    <Avatar
                                      variant="rounded"
                                      sx={{
                                        height: theme.spacing(2.5),
                                        width: theme.spacing(2.5),
                                        backgroundColor: adsLightGreyA,
                                        color: adsDarkGrey,
                                      }}
                                    >
                                      <Typography variant="caption">ER</Typography>
                                    </Avatar>
                                  </Grid2>
                                  <Grid2>
                                    <Avatar
                                      variant="rounded"
                                      sx={{
                                        height: theme.spacing(2.5),
                                        width: theme.spacing(2.5),
                                        backgroundColor: adsLightGreyA,
                                        color: adsDarkGrey,
                                      }}
                                    >
                                      <Typography variant="caption">CT</Typography>
                                    </Avatar>
                                  </Grid2>
                                </Grid2>
                              </Grid2>
                            )}
                          </Grid2>
                        </Grid2>
                      }
                    />
                  </ListItemButton>
                ))
            ) : (
              <ListItemButton key="No results">
                <ListItemText primary={<Typography variant="body2">No results found for your search</Typography>} />
              </ListItemButton>
            )}
          </List>
        </Box>
      )}
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={checked && checked.length > 0 ? checked.length : 0}
          haveStreet={streetCount > 0}
          haveProperty={propertyCount > 0}
          currentStreet={checked && checked.length === 1 && streetCount === 1 ? getStreetFromId(checked[0]) : null}
          currentProperty={
            checked && checked.length === 1 && propertyCount === 1 ? getPropertyFromLPIKey(checked[0]) : null
          }
          currentAddress={
            checked && checked.length === 1 && propertyCount === 1 ? getAddressFromLPIKey(checked[0]) : null
          }
          streetUsrns={getUsrnsFromIds(checked)}
          propertyUprns={getUprnsFromLpiKeys(checked)}
          onSetCopyOpen={handleSetCopyOpen}
          onError={handleSelectionError}
          onPropertyMoved={handlePropertyMoved}
          onClose={handleCloseSelection}
        />
      </Popper>
      <div>
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleAlertClose}
        >
          <Alert
            sx={GetAlertStyle(alertType.current === "propertyMoved")}
            icon={GetAlertIcon(alertType.current === "propertyMoved")}
            onClose={handleAlertClose}
            severity={GetAlertSeverity(alertType.current === "propertyMoved")}
            elevation={6}
            variant="filled"
          >{`${
            alertType.current === "invalidSingleState"
              ? `You are not allowed to create a property on a closed street.`
              : alertType.current === "invalidRangeState"
              ? `You are not allowed to create properties on a closed street.`
              : alertType.current === "maxParentLevel"
              ? `Parent is already at the maximum BLPU hierarchy level.`
              : alertType.current === "propertyMoved"
              ? `Changes saved successfully. Your moved seed points have been updated.`
              : `Unknown error.`
          }`}</Alert>
        </Snackbar>
        <ConfirmDeleteDialog
          variant={`${deleteUSRN.current ? "street" : "property"}`}
          open={openDeleteConfirmation}
          associatedRecords={associatedRecords}
          childCount={childCount}
          onClose={HandleCloseDeleteConfirmation}
        />
        <AddPropertyWizardDialog
          variant={propertyWizardType.current}
          parent={propertyWizardParent.current}
          isOpen={openPropertyWizard}
          onDone={handlePropertyWizardDone}
          onClose={handlePropertyWizardClose}
        />
        <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
        <MakeChildDialog
          isOpen={openMakeChild}
          variant="multi"
          selectedUPRNs={makeChildUprn}
          onClose={handleMakeChildClose}
        />
      </div>
    </Fragment>
  );
}

export default SearchDataTab;
