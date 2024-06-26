/* #region header */
/**************************************************************************************************
//
//  Description: Related street tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   30.07.21 Sean Flook         WI39??? Initial Revision.
//    002   17.03.23 Sean Flook         WI40585 Hide Add property and range menu items.
//    003   18.04.23 Sean Flook         WI40685 Modified call to ADSSelectionControl.
//    004   30.06.23 Sean Flook                 Ensure the current street is initially in view.
//    005   24.07.23 Sean Flook                 Removed Edit street menu item.
//    006   20.07.23 Sean Flook                 Added ability to display the street in Google street view.
//    007   06.10.23 Sean Flook                 Use colour variables.
//    008   27.10.23 Sean Flook                 Use new dataFormStyle.
//    009   03.11.23 Sean Flook                 Updated TreeView and TreeItem.
//    010   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and fixed a warning.
//    011   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    012   10.01.24 Sean Flook                 Fix warnings.
//    013   25.01.24 Sean Flook                 Changes required after UX review.
//    014   07.02.24 Joel Benford               Spacing and colours
//    015   12.02.24 Joel Benford               Tooltip on classification icon
//    016   12.02.24 Joel Benford       RTAB4   Removed left border on hover, interest avatar -> rounded
//    017   14.02.24 Joel Benford       RTAB2   Styling for additional languages and records
//    018   16.02.24 Sean Flook        ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    019   20.02.24 Sean Flook        ESU16_GP Undone above change as not required.
//    020   22.02.24 Joel Benford     IMANN-287 Checked items blue
//    021   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    022   13.03.24 Sean Flook            MUL9 Added new parameters to handle the checking of records.
//    023   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    024   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    025   22.04.24 Sean Flook       IMANN-374 Correctly call DataFormStyle.
//    026   25.04.24 Sean Flook       IMANN-166 After putting the current street in focus do not keep doing it.
//    027   26.04.24 Sean Flook       IMANN-166 Reset flag if the data changes.
//    028   13.05.24 Sean Flook       IMANN-439 Changed to use grids to display th data as well as other display improvements.
//    029   17.05.24 Sean Flook       IMANN-458 Correctly highlight the avatar when items are hovered.
//    030   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    031   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    032   26.06.24 Sean Flook       IMANN-488 Correctly filter the data in getStreetFromId.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import StreetContext from "../context/streetContext";
import SettingsContext from "../context/settingsContext";
import PropTypes from "prop-types";
import dateFormat from "dateformat";
import {
  stringToSentenceCase,
  lookupToTitleCase,
  GetAvatarColour,
  copyTextToClipboard,
  openInStreetView,
  GetAvatarTooltip,
} from "../utils/HelperUtils";
import { streetToTitleCase, GetStreetMapData } from "./../utils/StreetUtils";
import {
  Typography,
  Avatar,
  Skeleton,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  Chip,
  Checkbox,
  Popper,
  Snackbar,
  Alert,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import ADSSelectionControl from "../components/ADSSelectionControl";
import {
  ExpandMore,
  ChevronRight,
  MoreVert,
  MyLocation,
  SyncAlt as TwoWayIcon,
  People,
  Texture,
  ArrowDropDown,
  DirectionsWalk,
} from "@mui/icons-material";
import { CopyIcon, SpecialDesignationIcon, StartToEndIcon, EndToStartIcon } from "../utils/ADSIcons";
import GetStreetIcon from "../utils/ADSStreetIcons";
import StreetState from "./../data/StreetState";
import InterestType from "../data/InterestType";
import DETRCodes from "../data/DETRCodes";
import ConstructionType from "../data/ConstructionType";
import SpecialDesignationCode from "../data/SpecialDesignationCode";
import HWWDesignationCode from "../data/HWWDesignationCode";
import PRoWDedicationCode from "../data/PRoWDedicationCode";
import {
  adsBlueA,
  adsWhite,
  adsLightGreyB,
  adsPurple,
  adsPaleBlueA,
  adsBlack,
  adsYellow,
  adsPink,
  adsMidRed,
  adsBrown,
  adsDarkGreen,
  adsLightGreyD,
  adsBlack0,
} from "../utils/ADSColours";
import {
  dataFormStyle,
  GetTabIconStyle,
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
  RelatedLanguageChipStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

RelatedStreetTab.propTypes = {
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "property"]).isRequired,
  loading: PropTypes.bool.isRequired,
  expanded: PropTypes.array.isRequired,
  checked: PropTypes.array.isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  onNodeToggle: PropTypes.func.isRequired,
  onChecked: PropTypes.func.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onPropertyAdd: PropTypes.func.isRequired,
};

function RelatedStreetTab({
  data,
  variant,
  loading,
  expanded,
  checked,
  onNodeSelect,
  onNodeToggle,
  onChecked,
  onSetCopyOpen,
  onPropertyAdd,
}) {
  const theme = useTheme();

  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const streetContext = useContext(StreetContext);
  const settingsContext = useContext(SettingsContext);

  const [userCanEdit, setUserCanEdit] = useState(false);
  const initialStreetFocused = useRef(false);

  const [streetSelected, setStreetSelected] = useState(null);
  const [streetChecked, setStreetChecked] = useState([]);
  const [anchorStreetActionsEl, setAnchorStreetActionsEl] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "list-selection-popper" : undefined;
  const checkedAddress = useRef(null);

  const [errorOpen, setErrorOpen] = useState(false);
  const errorType = useRef(null);

  const [hasASD, setHasASD] = useState(false);

  /**
   * Event to handle when a node is selected.
   *
   * @param {object} event The event object.
   * @param {number} nodeId The id of the selected node.
   */
  function handleNodeSelected(event, nodeId) {
    // event.persist();
    event.stopPropagation();
    const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
    const checkboxClicked = event.target.closest(".MuiCheckbox-root");
    if (!iconClicked && !checkboxClicked && onNodeSelect) onNodeSelect("street", nodeId);
  }

  /**
   * Event to handle the toggling of the nodes.
   *
   * @param {object} event The event object.
   * @param {array} nodeIds The list of node ids that are expanded.
   */
  function handleNodeToggle(event, nodeIds) {
    // event.persist();
    event.stopPropagation();
    const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
    if (iconClicked) {
      if (expanded.length + 1 === nodeIds.length) {
        const difference = nodeIds.filter((x) => !expanded.includes(x));
        if (difference && !difference.includes("esu") && !difference.includes("asd")) {
          let newNodeIds = nodeIds;
          const newItems = hasASD ? [`esu-root-${difference}`, `asd-root-${difference}`] : [`esu-root-${difference}`];
          newNodeIds.push(...newItems);
          if (onNodeToggle) onNodeToggle(newNodeIds);
        }
      } else {
        if (onNodeToggle) onNodeToggle(nodeIds);
      }
    }
  }

  /**
   * Event to handle when the mouse enters a street node.
   *
   * @param {number} recId The id of the street the mouse has entered.
   */
  const handleMouseEnterStreet = (recId) => {
    if (recId !== "") setStreetSelected(recId);
  };

  /**
   * Event to handle when the mouse leaves a street node.
   */
  const handleMouseLeaveStreet = () => {
    setStreetSelected(null);
  };

  /**
   * Event to handle the toggling of the checkboxes.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street.
   * @param {string} address The address for the street.
   */
  const handleCheckboxChange = (event, usrn, address) => {
    event.stopPropagation();

    const tempArray = streetChecked;

    if (!streetChecked.includes(usrn)) tempArray.push(usrn);
    else tempArray.splice(streetChecked.indexOf(usrn), 1);

    if (onChecked) onChecked(tempArray);
    else setStreetChecked(tempArray);

    checkedAddress.current = address;

    if (tempArray.length > 0) setSelectionAnchorEl(document.getElementById("street-related-tree"));
    else setSelectionAnchorEl(null);
  };

  /**
   * Event to handle displaying the copy alert.
   *
   * @param {string} dataType The type of data that has been copied.
   */
  const handleSetCopyOpen = (dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(true, dataType);
  };

  /**
   * Event to handle selection errors.
   *
   * @param {string} typeOfError The type of error.
   */
  const handleSelectionError = (typeOfError) => {
    if (typeOfError) {
      errorType.current = typeOfError;
      setErrorOpen(true);
    }
  };

  /**
   * Event to handle closing the selection dialog.
   */
  const handleCloseSelection = () => {
    if (onChecked) onChecked([]);
    else setStreetChecked([]);
    setSelectionAnchorEl(null);
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   *
   * @param {object} event The event object.
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (event, text, dataType) => {
    event.stopPropagation();
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Event to handle zooming the map to a street.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street to zoom to.
   */
  async function zoomToStreet(event, usrn) {
    event.stopPropagation();

    const found = mapContext.currentSearchData.streets.find((rec) => rec.usrn === usrn);

    const streetData = await GetStreetMapData(usrn, userContext, settingsContext.isScottish);

    const highlightStreet = {
      usrn: usrn,
      minX: streetData.streetStartX < streetData.streetEndX ? streetData.streetStartX : streetData.streetEndX,
      minY: streetData.streetStartY < streetData.streetEndY ? streetData.streetStartY : streetData.streetEndY,
      maxX: streetData.streetStartX > streetData.streetEndX ? streetData.streetStartX : streetData.streetEndX,
      maxY: streetData.streetStartY > streetData.streetEndY ? streetData.streetStartY : streetData.streetEndY,
    };

    if (found) {
      mapContext.onMapChange(mapContext.currentLayers.extents, highlightStreet, null);
    }
  }

  /**
   * Event to handle when the street actions menu button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleStreetActionsMenuClick = (event) => {
    setAnchorStreetActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the street actions menu.
   *
   * @param {object} event The event object.
   */
  const handleStreetActionsMenuClose = (event) => {
    setAnchorStreetActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle creating a property.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street.
   */
  async function HandleAddProperty(event, usrn) {
    handleStreetActionsMenuClose(event);
    if (onPropertyAdd) onPropertyAdd(usrn, null, false);
  }

  /**
   * Event to handle creating a range of properties.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street.
   */
  const handleAddRange = (event, usrn) => {
    handleStreetActionsMenuClose(event);
    if (onPropertyAdd) onPropertyAdd(usrn, null, true);
  };

  /**
   * Display the street/property in Google Street View.
   *
   * @param {object} event The event object
   * @param {object} rec The record that needs to be displayed in Google Street View.
   */
  async function handleStreetViewClick(event, rec) {
    if (rec) {
      handleStreetActionsMenuClose(event);

      await GetStreetMapData(rec.usrn, userContext, settingsContext.isScottish).then((result) => {
        if (result && result.esus && result.esus.length > 0) {
          const esuPoints = result.esus[0].wktGeometry.replace("LINESTRING (", "").replace(")").split(",");

          if (esuPoints && esuPoints.length > 0) {
            const firstEsuPointString = esuPoints[0].split(" ");
            if (firstEsuPointString) {
              const bngPoint = [Number(firstEsuPointString[0]), Number(firstEsuPointString[1])];
              openInStreetView(bngPoint);
            }
          }
        }
      });
    }
  }

  /**
   * Method to get the styling to be used for the language chip.
   *
   * @param {number} state The state of the street.
   * @returns {object} The styling to be used for the language chip.
   */
  function StreetLanguageChipStyle(state) {
    const streetStateRec = StreetState.find((x) => x.id === state);
    return RelatedLanguageChipStyle(streetStateRec ? streetStateRec.colour : "");
  }

  /**
   * Method to get the styling for stack holding language chip + address.
   *
   * @returns {object} The styling to be used for the stack.
   */
  function LanguageDescriptionPairStyle() {
    return { mb: theme.spacing(1) };
  }

  /**
   * Method to get the styling to be used for the address.
   *
   * @param {boolean} selected True if the node is selected; otherwise false.
   * @returns {object} The styling to use for the address.
   */
  function AddressStyle(selected) {
    if (selected) {
      return { display: "inline-flex", fontWeight: "bold" };
    } else {
      return { display: "inline-flex" };
    }
  }

  /**
   * Method to get the required direction icon to be displayed.
   *
   * @param {number} directionCode The direction code for the ESU.
   * @returns {JSX.Element} The direction icon to be displayed.
   */
  function showDirectionIcon(directionCode) {
    switch (directionCode) {
      case 1:
        return (
          <TwoWayIcon
            sx={{
              color: adsWhite,
              backgroundColor: adsPurple,
              width: theme.spacing(2),
              height: theme.spacing(2),
            }}
          />
        );

      case 2:
        return (
          <StartToEndIcon
            sx={{
              color: adsWhite,
              backgroundColor: adsPurple,
              width: theme.spacing(2),
              height: theme.spacing(2),
            }}
          />
        );

      case 3:
        return (
          <EndToStartIcon
            sx={{
              color: adsWhite,
              backgroundColor: adsPurple,
              width: theme.spacing(2),
              height: theme.spacing(2),
            }}
          />
        );

      default:
        return null;
    }
  }

  /**
   * Method to get the styling to be used for the ASD record.
   *
   * @param {number} asdType The type of ASD record.
   * @returns {object} The styling to be used for the ASD record.
   */
  const GetAvatarStyle = (asdType) => {
    let avatarClipPath = null;
    let iconBorderColour = null;
    let iconColour = null;
    let iconBackgroundColour = null;

    switch (asdType) {
      case 61:
        iconColour = adsWhite;
        iconBackgroundColour = adsBrown;
        break;

      case 62:
        iconColour = adsWhite;
        iconBackgroundColour = adsPink;
        avatarClipPath = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
        break;

      case 63:
        iconColour = adsBlack;
        iconBackgroundColour = adsYellow;
        iconBorderColour = `${adsBlack}  !important`;
        break;

      case 64:
        iconColour = adsBlack;
        iconBackgroundColour = adsWhite;
        iconBorderColour = `#${adsMidRed} !important`;
        break;

      case 66:
        iconColour = adsWhite;
        iconBackgroundColour = adsDarkGreen;
        avatarClipPath = "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)";
        break;

      default:
        break;
    }

    if (avatarClipPath) {
      if (iconBorderColour)
        return {
          color: iconColour,
          clipPath: avatarClipPath,
          backgroundColor: iconBackgroundColour,
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: iconBorderColour,
          height: theme.spacing(2),
          width: theme.spacing(2),
        };
      else
        return {
          color: iconColour,
          clipPath: avatarClipPath,
          backgroundColor: iconBackgroundColour,
          height: theme.spacing(2),
          width: theme.spacing(2),
        };
    } else {
      if (iconBorderColour)
        return {
          color: iconColour,
          backgroundColor: iconBackgroundColour,
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: iconBorderColour,
          height: theme.spacing(2),
          width: theme.spacing(2),
        };
      else
        return {
          color: iconColour,
          backgroundColor: iconBackgroundColour,
          height: theme.spacing(2),
          width: theme.spacing(2),
        };
    }
  };

  /**
   * Method to get the description for a specific type of interest code.
   *
   * @param {number} interestType The type of interest.
   * @returns {string} The interest type description.
   */
  const GetInterestType = (interestType) => {
    const rec = InterestType.find((x) => x.id === interestType);
    if (rec) return rec.gpText;
    else return "Unknown type";
  };

  /**
   * Method to get the name of an organisation from its DETR code.
   *
   * @param {number} orgRef The DETR organisation code.
   * @returns {string} The name of the organisation.
   */
  const GetOrgName = (orgRef) => {
    const rec = DETRCodes.find((x) => x.id === orgRef);
    if (rec) return lookupToTitleCase(rec.text, false);
    else return "Unknown organisation";
  };

  /**
   * Method to get the description for a given construction type.
   *
   * @param {number} constructionType The type of construction.
   * @returns {string} The description for the construction type.
   */
  const GetConstructionType = (constructionType) => {
    const rec = ConstructionType.find((x) => x.id === constructionType);
    if (rec) return rec.gpText;
    else return "Unknown construction type";
  };

  /**
   * Method to get the description for a given special designation code.
   *
   * @param {number} specialDesignationCode The special designation code.
   * @returns {string} The description for the special designation code.
   */
  const GetSpecialDesignation = (specialDesignationCode) => {
    const rec = SpecialDesignationCode.find((x) => x.id === specialDesignationCode);
    if (rec) {
      if (settingsContext.isScottish) return rec.osText;
      else return rec.gpText;
    } else return "Unknown special designation";
  };

  /**
   * Method to get the description for a given height, width & weight restriction code.
   *
   * @param {number} hwwRestrictionCode The height, width & weight restriction code.
   * @returns {string} The description for the height, width & weight restriction code.
   */
  const GetHwwRestriction = (hwwRestrictionCode) => {
    const rec = HWWDesignationCode.find((x) => x.id === hwwRestrictionCode);
    if (rec) return rec.gpText;
    else return "Unknown restriction";
  };

  /**
   * Method to get the description for a given PRoW rights.
   *
   * @param {number} prowRights The PRoW rights.
   * @returns {string} The description for the PRoW rights.
   */
  const GetPRoWRights = (prowRights) => {
    const rec = PRoWDedicationCode.find((x) => x.id === prowRights);
    if (rec) return rec.gpText;
    else return "Unknown PRoW rights";
  };

  /**
   * Method to get styling used for a tree item, based on whether usrn is current street and/or checked.
   *
   * @param {number} usrn The usrn for the street in the tree item
   * @returns {object} The styling for the tree item.
   */
  const treeItemStyle = (usrn) => {
    const currentStreet = usrn.toString() === streetContext.currentStreet.usrn.toString();
    const checked = streetChecked.includes(usrn.toString());
    if (currentStreet)
      return {
        backgroundColor: checked ? adsPaleBlueA : adsWhite,
        borderTop: `solid ${adsLightGreyB} 1px`,
        borderLeft: `solid ${adsLightGreyD} 5px`,
        pb: theme.spacing(1),
        pt: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: checked ? adsPaleBlueA : "inherit",
        borderTop: `solid ${adsLightGreyB} 1px`,
        borderLeft: `solid ${adsBlack0} 5px`,
        pb: theme.spacing(1),
        pt: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        },
      };
  };

  /**
   * Method to get the street object for a given USRN.
   *
   * @param {number} streetId The USRN of the street that is required.
   * @returns {object} The street object for the given USRN.
   */
  const getStreetFromId = (streetId) => {
    const street = data.street.filter((x) => x.usrn.toString() === streetId.toString());
    if (street && street.length > 0)
      return { id: street[0].usrn, logical_status: street[0].stRefType > 0 ? street[0].stRefType + 10 : 11 };
    else return null;
  };

  /**
   * Event to handle the closing of the error dialog.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the dialog is closing.
   * @returns
   */
  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setErrorOpen(false);
  };

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editStreet);
  }, [userContext]);

  useEffect(() => {
    setStreetChecked(checked);
  }, [checked]);

  useEffect(() => {
    initialStreetFocused.current = false;
  }, [data]);

  useEffect(() => {
    if (
      streetContext.currentStreet.usrn &&
      streetContext.currentStreet.usrn > 0 &&
      document.getElementById(`street-related-tree-${streetContext.currentStreet.usrn.toString()}`) &&
      !initialStreetFocused.current
    )
      document.getElementById(`street-related-tree-${streetContext.currentStreet.usrn.toString()}`).scrollIntoView();
    initialStreetFocused.current = true;
  }, [streetContext.currentStreet.usrn]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      <Box sx={dataFormStyle("StreetRelatedStreetTab")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          <TreeView
            aria-label="street related tree"
            id="street-related-tree"
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            sx={{ flexGrow: 1, overflowY: "auto" }}
            expanded={expanded}
            onNodeSelect={handleNodeSelected}
            onNodeToggle={handleNodeToggle}
          >
            {data &&
              data.street &&
              data.street
                .sort(function (a, b) {
                  return a.address && b.address
                    ? a.address.localeCompare(b.address, undefined, {
                        numeric: true,
                        sensitivity: "base",
                      })
                    : 0;
                })
                .map((rec, index) => {
                  return (
                    <TreeItem
                      key={`street-${rec.usrn}-${index}`}
                      nodeId={rec.usrn.toString()}
                      sx={treeItemStyle(rec.usrn)}
                      label={
                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                            {(streetSelected && streetSelected === rec.usrn) ||
                            streetChecked.includes(rec.usrn.toString()) ? (
                              <Checkbox
                                sx={{
                                  pl: theme.spacing(0),
                                  pr: theme.spacing(0),
                                }}
                                checked={streetChecked.includes(rec.usrn.toString())}
                                onChange={(event) =>
                                  handleCheckboxChange(event, rec.usrn.toString(), rec.primary.address)
                                }
                              />
                            ) : (
                              <Box sx={{ width: "24px" }} />
                            )}
                            <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                              <Tooltip
                                title={GetAvatarTooltip(
                                  15,
                                  10 + rec.stRefType,
                                  null,
                                  rec.state,
                                  settingsContext.isScottish
                                )}
                                arrow
                                placement="bottom"
                                sx={tooltipStyle}
                              >
                                {GetStreetIcon(
                                  rec.stRefType > 0 ? rec.stRefType + 10 : 11, // TODO: Correct once field name as been corrected to recordType
                                  GetAvatarColour(rec.state > 0 ? rec.state + 10 : 12)
                                )}
                              </Tooltip>
                              <Stack direction="column">
                                <Stack direction="row" spacing={1} sx={LanguageDescriptionPairStyle()}>
                                  <Chip
                                    size="small"
                                    label={rec.primary.language}
                                    sx={StreetLanguageChipStyle(rec.state > 0 ? rec.state : 2)}
                                  />
                                  <Typography
                                    variant="subtitle2"
                                    sx={AddressStyle(
                                      rec.usrn.toString() === streetContext.currentStreet.usrn.toString()
                                    )}
                                  >
                                    {streetToTitleCase(rec.primary.address)}
                                  </Typography>
                                </Stack>
                                {rec.additional && rec.additional.language && (
                                  <Stack direction="row" spacing={1}>
                                    <Chip
                                      size="small"
                                      label={rec.additional.language}
                                      sx={StreetLanguageChipStyle(rec.state > 0 ? rec.state : 2)}
                                    />
                                    <Typography
                                      variant="subtitle2"
                                      sx={AddressStyle(
                                        rec.usrn.toString() === streetContext.currentStreet.usrn.toString()
                                      )}
                                    >
                                      {streetToTitleCase(rec.additional.address)}
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>
                            </Stack>
                          </Stack>
                          {streetSelected &&
                            streetSelected === rec.usrn &&
                            streetChecked &&
                            streetChecked.length < 2 && (
                              <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                <Tooltip title="Copy USRN" arrow placement="bottom" sx={tooltipStyle}>
                                  <IconButton
                                    onClick={(event) => itemCopy(event, rec.usrn.toString(), "USRN")}
                                    size="small"
                                  >
                                    <CopyIcon sx={ActionIconStyle()} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Zoom to this" arrow placement="bottom" sx={tooltipStyle}>
                                  <IconButton onClick={() => zoomToStreet(rec.usrn)} size="small">
                                    <MyLocation sx={ActionIconStyle()} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                                  <IconButton
                                    onClick={handleStreetActionsMenuClick}
                                    aria-controls="street-actions-menu"
                                    aria-haspopup="true"
                                    size="small"
                                  >
                                    <MoreVert sx={ActionIconStyle()} />
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
                                  {process.env.NODE_ENV === "development" && (
                                    <MenuItem
                                      dense
                                      disabled={!userCanEdit}
                                      onClick={(event) => HandleAddProperty(event, rec.usrn)}
                                      sx={menuItemStyle(true)}
                                    >
                                      <Typography variant="inherit">Add property on street</Typography>
                                    </MenuItem>
                                  )}
                                  {process.env.NODE_ENV === "development" && (
                                    <MenuItem
                                      dense
                                      divider
                                      disabled={!userCanEdit}
                                      onClick={(event) => handleAddRange(event, rec.usrn)}
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
                                    onClick={(event) => zoomToStreet(event, rec.usrn)}
                                    sx={menuItemStyle(false)}
                                  >
                                    <Typography variant="inherit">Zoom to this</Typography>
                                  </MenuItem>
                                  <MenuItem
                                    dense
                                    divider
                                    onClick={(event) => itemCopy(event, rec.usrn.toString(), "USRN")}
                                    sx={menuItemStyle(true)}
                                  >
                                    <Typography variant="inherit">Copy USRN</Typography>
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
                                </Menu>
                              </Stack>
                            )}
                        </Stack>
                      }
                      onMouseEnter={() => handleMouseEnterStreet(rec.usrn)}
                      onMouseLeave={handleMouseLeaveStreet}
                    >
                      <TreeItem
                        key={"esu-root"}
                        nodeId={`esu-root-${rec.usrn}`}
                        sx={treeItemStyle(rec.usrn)}
                        label={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              display: "inline-flex",
                            }}
                          >
                            ESUs
                            <Avatar
                              variant="rounded"
                              sx={GetTabIconStyle(
                                rec && rec.esus ? rec.esus.length : 0,
                                streetSelected && streetSelected === rec.usrn
                              )}
                            >
                              <Typography variant="caption">
                                <strong>{rec && rec.esus ? rec.esus.length : 0}</strong>
                              </Typography>
                            </Avatar>
                          </Typography>
                        }
                      >
                        {rec.esus.map((recEsu, index) => {
                          return (
                            <TreeItem
                              key={`esu-${recEsu.esuId}-${index}`}
                              nodeId={recEsu.esuId.toString()}
                              sx={treeItemStyle(rec.usrn)}
                              label={
                                <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                                  {showDirectionIcon(recEsu.esuDirection)}
                                  <Typography variant="caption">{recEsu.esuId}</Typography>
                                </Stack>
                              }
                            />
                          );
                        })}
                      </TreeItem>
                      {hasASD && (
                        <TreeItem
                          key={"asd-root"}
                          nodeId={`asd-root-${rec.usrn}`}
                          sx={treeItemStyle(rec.usrn)}
                          label={
                            <Typography variant="subtitle2" sx={{ display: "inline-flex" }}>
                              ASDs
                              <Avatar
                                variant="rounded"
                                sx={GetTabIconStyle(
                                  rec && rec.asds ? rec.asds.length : 0,
                                  streetSelected && streetSelected === rec.usrn
                                )}
                              >
                                <Typography variant="caption">
                                  <strong>{rec && rec.asds ? rec.asds.length : 0}</strong>
                                </Typography>
                              </Avatar>
                            </Typography>
                          }
                        >
                          {rec.asds
                            .filter((x) => x.asdType === 61)
                            .map((recAsd61) => {
                              return (
                                <TreeItem
                                  key={`asd-${recAsd61.asdType}-${recAsd61.pkId}-${index}`}
                                  nodeId={`asd${recAsd61.asdType}|${rec.usrn}|${recAsd61.pkId}`}
                                  sx={treeItemStyle(rec.usrn)}
                                  label={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      justifyContent="flex-start"
                                      alignItems="flex-start"
                                    >
                                      {
                                        <Avatar variant={"rounded"} sx={GetAvatarStyle(61)}>
                                          <People
                                            sx={{
                                              height: theme.spacing(2),
                                              width: theme.spacing(2),
                                            }}
                                          />
                                        </Avatar>
                                      }
                                      <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                                        <Typography variant="caption">
                                          {GetInterestType(recAsd61.interestType)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "rgb(121,121,121)" }}>
                                          {GetOrgName(recAsd61.swaOrgRefAuthority)}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  }
                                />
                              );
                            })}
                          {rec.asds
                            .filter((x) => x.asdType === 62)
                            .map((recAsd62) => {
                              return (
                                <TreeItem
                                  key={`asd-${recAsd62.asdType}-${recAsd62.pkId}-${index}`}
                                  nodeId={`asd${recAsd62.asdType}|${rec.usrn}|${recAsd62.pkId}`}
                                  sx={treeItemStyle(rec.usrn)}
                                  label={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      justifyContent="flex-start"
                                      alignItems="flex-start"
                                    >
                                      {
                                        <Avatar variant={"square"} sx={GetAvatarStyle(62)}>
                                          <Texture
                                            sx={{
                                              height: theme.spacing(2),
                                              width: theme.spacing(2),
                                            }}
                                          />
                                        </Avatar>
                                      }
                                      <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                                        <Typography variant="caption">
                                          {GetConstructionType(recAsd62.constructionType)}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "inline-block",
                                            color: "rgb(121,121,121)",
                                          }}
                                          noWrap
                                        >
                                          {stringToSentenceCase(recAsd62.constructionDescription)}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  }
                                />
                              );
                            })}
                          {rec.asds
                            .filter((x) => x.asdType === 63)
                            .map((recAsd63) => {
                              return (
                                <TreeItem
                                  key={`asd-${recAsd63.asdType}-${recAsd63.pkId}-${index}`}
                                  nodeId={`asd${recAsd63.asdType}|${rec.usrn}|${recAsd63.pkId}`}
                                  sx={treeItemStyle(rec.usrn)}
                                  label={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      justifyContent="flex-start"
                                      alignItems="flex-start"
                                    >
                                      {
                                        <Avatar variant={"circular"} sx={GetAvatarStyle(63)}>
                                          <SpecialDesignationIcon
                                            sx={{
                                              height: theme.spacing(2),
                                              width: theme.spacing(2),
                                            }}
                                          />
                                        </Avatar>
                                      }
                                      <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          justifyContent="flex-start"
                                          alignItems="flex-start"
                                        >
                                          <Typography variant="caption">
                                            {GetSpecialDesignation(recAsd63.streetSpecialDesigCode)}
                                          </Typography>
                                          {recAsd63.specialDesigStartDate && (
                                            <Fragment>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "rgb(121,121,121)",
                                                }}
                                              >
                                                {dateFormat(recAsd63.specialDesigStartDate, "d mmm yyyy")}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "rgb(121,121,121)",
                                                }}
                                              >
                                                -
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "rgb(121,121,121)",
                                                }}
                                              >
                                                {dateFormat(recAsd63.specialDesigEndDate, "d mmm yyyy")}
                                              </Typography>
                                            </Fragment>
                                          )}
                                        </Stack>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "inline-block",
                                            color: "rgb(121,121,121)",
                                          }}
                                          noWrap
                                        >
                                          {stringToSentenceCase(recAsd63.specialDesigDescription)}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  }
                                />
                              );
                            })}
                          {rec.asds
                            .filter((x) => x.asdType === 64)
                            .map((recAsd64) => {
                              return (
                                <TreeItem
                                  key={`asd-${recAsd64.asdType}-${recAsd64.pkId}-${index}`}
                                  nodeId={`asd${recAsd64.asdType}|${rec.usrn}|${recAsd64.pkId}`}
                                  sx={treeItemStyle(rec.usrn)}
                                  label={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      justifyContent="flex-start"
                                      alignItems="flex-start"
                                    >
                                      {
                                        <Avatar variant={"circular"} sx={GetAvatarStyle(64)}>
                                          <ArrowDropDown
                                            sx={{
                                              height: theme.spacing(2),
                                              width: theme.spacing(2),
                                            }}
                                          />
                                        </Avatar>
                                      }
                                      <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                                        <Typography variant="caption">
                                          {GetHwwRestriction(recAsd64.hwwRestrictionCode)}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "inline-block",
                                            color: "rgb(121,121,121)",
                                          }}
                                          noWrap
                                        >
                                          {stringToSentenceCase(recAsd64.featureDescription)}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  }
                                />
                              );
                            })}
                          {rec.asds
                            .filter((x) => x.asdType === 66)
                            .map((recAsd66) => {
                              return (
                                <TreeItem
                                  key={`asd-${recAsd66.asdType}-${recAsd66.pkId}-${index}`}
                                  nodeId={`asd${recAsd66.asdType}|${rec.usrn}|${recAsd66.pkId}`}
                                  sx={treeItemStyle(rec.usrn)}
                                  label={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      justifyContent="flex-start"
                                      alignItems="flex-start"
                                    >
                                      {
                                        <Avatar variant={"square"} sx={GetAvatarStyle(66)}>
                                          <DirectionsWalk
                                            sx={{
                                              height: theme.spacing(2),
                                              width: theme.spacing(2),
                                            }}
                                          />
                                        </Avatar>
                                      }
                                      <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                                        <Typography variant="caption">{GetPRoWRights(recAsd66.prowRights)}</Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "inline-block",
                                            color: "rgb(121,121,121)",
                                          }}
                                          noWrap
                                        >
                                          {stringToSentenceCase(recAsd66.prowDetails)}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  }
                                />
                              );
                            })}
                        </TreeItem>
                      )}
                    </TreeItem>
                  );
                })}
          </TreeView>
        )}
        <Box sx={{ height: "24px" }} />
      </Box>
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={handleErrorClose}
      >
        <Alert
          sx={GetAlertStyle(false)}
          icon={GetAlertIcon(false)}
          onClose={handleErrorClose}
          severity={GetAlertSeverity(false)}
          elevation={6}
          variant="filled"
        >{`${
          errorType.current === "invalidSingleState"
            ? `You are not allowed to create a property on a closed street.`
            : errorType.current === "invalidRangeState"
            ? `You are not allowed to create properties on a closed street.`
            : `Unknown error.`
        }`}</Alert>
      </Snackbar>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={streetChecked && streetChecked.length > 0 ? streetChecked.length : 0}
          haveStreet={streetChecked && streetChecked.length > 0}
          currentStreet={streetChecked && streetChecked.length === 1 ? getStreetFromId(streetChecked[0]) : null}
          currentAddress={
            streetChecked && streetChecked.length === 1 && checkedAddress.current
              ? checkedAddress.current.address
              : null
          }
          onSetCopyOpen={handleSetCopyOpen}
          onError={handleSelectionError}
          onClose={handleCloseSelection}
        />
      </Popper>
    </Fragment>
  );
}

export default RelatedStreetTab;
