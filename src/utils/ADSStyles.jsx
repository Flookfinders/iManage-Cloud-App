//#region header */
/**************************************************************************************************
//
//  Description: All the styling used by the app
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
//    002   05.04.23 Sean Flook         WI40669 Added wizardCrossRefFormStyle and removed the use of theme.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   27.10.23 Sean Flook                 Updated dataFormStyle and removed redundant methods.
//    005   03.11.23 Sean Flook       IMANN-175 Added SelectPropertiesIconStyle.
//    006   10.11.23 Sean Flook       IMANN-175 Modified wizardFinaliseFormStyle to handle Move BLPU seed point.
//    007   14.12.23 Sean Flook                 Added dashboardIconStyle.
//    008   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    009   10.01.24 Sean Flook                 Fix warnings.
//    010   12.01.24 Sean Flook                 Added top border to toolbar style.
//    011   25.01.24 Sean Flook                 Changes required after UX review.
//    012   25.01.24 Sean Flook                 Further changes required after UX review.
//    013   25.01.24 Joel Benford               Update RecordCountStyle
//    014   02.02.24 Joel Benford               Update tabLabelStyle and gridRowStyle
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveIcon from "@mui/icons-material/Save";
import ErrorIcon from "@mui/icons-material/Error";
import { grey } from "@mui/material/colors";
import {
  adsWhite,
  adsOffWhite,
  adsLightGreyA,
  adsLightGreyB,
  adsLightGreyA50,
  adsMidGreyA,
  adsDarkGrey,
  adsPaleBlueA,
  adsBlueA,
  adsBlue12,
  adsLightBlue,
  adsMidBlueA,
  adsRed,
  adsRed10,
  adsRed20,
  adsDarkRed,
  adsPaleBlueB,
} from "./ADSColours";

/* #endregion imports */

export const drawerWidth = "400px";
export const navBarWidth = "60px";

/**
 * Return the styling for action icons.
 *
 * @param {boolean} [isSmall=false] True if a small icon is required; otherwise false.
 * @return {object} The styling to be used for the action icon.
 */
export function ActionIconStyle(isSmall = false) {
  if (isSmall)
    return {
      color: adsMidGreyA,
      height: "16px",
      position: "absolute",
      width: "16px",
      "&:hover": {
        color: adsBlueA,
      },
    };
  else
    return {
      color: adsMidGreyA,
      "&:hover": {
        color: adsBlueA,
      },
    };
}

/**
 * Return the styling for action icons.
 *
 * @param {boolean} selected True if the icon is selected; otherwise false.
 * @return {object} The styling to be used for the icon.
 */
export function SelectPropertiesIconStyle(selected) {
  if (selected)
    return {
      backgroundColor: adsBlueA,
      color: adsWhite,
      "&:hover": {
        backgroundColor: adsMidBlueA,
      },
    };
  else
    return {
      color: adsMidGreyA,
      "&:hover": {
        color: adsBlueA,
      },
    };
}

/**
 * Return the styling for the clear search icon
 *
 * @param {string} text The current search string
 * @return {object} The styling to be used for the clear search icon.
 */
export function ClearSearchIconStyle(text) {
  if (text && text.length > 0)
    return {
      color: adsMidGreyA,
      "&:hover": {
        color: adsBlueA,
      },
    };
  else
    return {
      display: "none",
    };
}

/**
 * Return the styling for the row box object that contains the component on a form.
 *
 * @param {boolean} hasError True if the component is displaying an error; otherwise false.
 * @return {object} The styling to be used for the form box row.
 */
export function FormBoxRowStyle(hasError) {
  if (hasError)
    return {
      borderLeftStyle: "solid",
      borderLeftWidth: "4px",
      borderLeftColor: adsRed,
    };
  else
    return {
      borderLeftStyle: "none",
    };
}

/**
 * Return the styling for the row object that contains the component on a form.
 *
 * @param {boolean} hasError True if the component is displaying an error; otherwise false.
 * @return {object} The styling to use for the form row.
 */
export function FormRowStyle(hasError) {
  if (hasError)
    return {
      pt: "4px",
      pl: "12px",
      pr: "8px",
      color: adsMidGreyA,
      backgroundColor: adsRed10,
      display: "flex",
      justifyContent: "flex-start",
    };
  else
    return {
      borderLeftStyle: "none",
      pt: "4px",
      pl: "12px",
      pr: "8px",
      color: adsMidGreyA,
      display: "flex",
      justifyContent: "flex-start",
    };
}

/**
 * Returns the styling for an input component.
 *
 * @param {boolean} hasError True if the component is displaying an error; otherwise false.
 * @return {object} The styling to use for the form input.
 */
export function FormInputStyle(hasError) {
  if (hasError)
    return {
      fontFamily: "Nunito sans",
      fontSize: "15px",
      color: adsDarkGrey,
      backgroundColor: adsWhite,
      pl: "4px",
      "&$outlinedInputFocused": {
        borderColor: `${adsBlueA}  !important`,
      },
      "&$notchedOutline": {
        borderWidth: "1px",
        borderColor: `${adsRed}  !important`,
      },
    };
  else
    return {
      fontFamily: "Nunito sans",
      fontSize: "15px",
      color: adsDarkGrey,
      backgroundColor: adsWhite,
      "&$outlinedInputFocused": {
        borderColor: `${adsBlueA}  !important`,
      },
      "&$notchedOutline": {
        borderWidth: "1px",
        borderColor: `${adsOffWhite}  !important`,
      },
    };
}

/**
 * Returns the styling for a date input component.
 *
 * @param {boolean} hasError True if the component is displaying an error; otherwise false.
 * @return {object} The styling to use for the form date input.
 */
export function FormDateInputStyle(hasError) {
  if (hasError)
    return {
      fontFamily: "Nunito sans",
      fontSize: "15px",
      color: adsDarkGrey,
      backgroundColor: adsWhite,
      mt: "6px",
      "&$outlinedInputFocused": {
        borderColor: `${adsBlueA}  !important`,
      },
      "&$notchedOutline": {
        borderWidth: "1px",
        borderColor: `${adsRed}  !important`,
      },
    };
  else
    return {
      fontFamily: "Nunito sans",
      fontSize: "15px",
      color: adsDarkGrey,
      backgroundColor: adsWhite,
      mt: "6px",
      "&$outlinedInputFocused": {
        borderColor: `${adsBlueA}  !important`,
      },
      "&$notchedOutline": {
        borderWidth: "1px",
        borderColor: `${adsOffWhite}  !important`,
      },
    };
}

/**
 * Returns the styling for a select input component.
 *
 * @param {boolean} hasError True if the component is displaying an error; otherwise false.
 * @return {object} The styling to use for the form select input.
 */
export function FormSelectInputStyle(hasError) {
  if (hasError)
    return {
      fontFamily: "Nunito sans",
      fontSize: "15px",
      color: adsDarkGrey,
      backgroundColor: adsWhite,
      display: "inline-flex",
      "&$outlinedInputFocused": {
        borderColor: `${adsBlueA}  !important`,
      },
      "&$notchedOutline": {
        borderWidth: "1px",
        borderColor: `${adsRed}  !important`,
      },
    };
  else
    return {
      fontFamily: "Nunito sans",
      fontSize: "15px",
      color: adsDarkGrey,
      backgroundColor: adsWhite,
      display: "inline-flex",
      "&$outlinedInputFocused": {
        borderColor: `${adsBlueA}  !important`,
      },
      "&$notchedOutline": {
        borderWidth: "1px",
        borderColor: `${adsOffWhite}  !important`,
      },
    };
}

/**
 * The styling used for toolbars.
 */
export const toolbarStyle = {
  backgroundColor: adsWhite,
  borderBottom: `1px solid ${adsLightGreyB}`,
  borderTop: `1px solid ${adsLightGreyB}`,
  pl: "4px",
  pr: "6px",
  height: "44px",
  width: "100%",
};

/**
 * The styling used for data forms.
 */
export const dataFormStyle = (height) => {
  return {
    overflowY: "auto",
    width: "100%",
    height: height,
    backgroundColor: adsOffWhite,
    pl: "12px",
  };
};

/**
 * The styling used for search data form.
 */
export const searchDataFormStyle = {
  backgroundColor: adsOffWhite,
  boxShadow: `4px 0px 7px ${adsLightGreyA50}`,
  overflowY: "auto",
  width: "100%",
  height: "87.75vh",
};

/**
 * Return the styling used for the wizard finalise form.
 *
 * @param {Boolean} [haveMoveBlpu=false] True if we are moving BLPU seed point; otherwise false;
 * @return {object} Styling used for wizard finalise form.
 */
export const wizardFinaliseFormStyle = (haveMoveBlpu = false) => {
  return {
    backgroundColor: adsOffWhite,
    boxShadow: `4px 0px 7px ${adsLightGreyA50}`,
    overflowY: "auto",
    width: "100%",
    height: `${haveMoveBlpu ? "78vh" : "74vh"}`,
  };
};

/**
 * Return the styling used for record counts.
 *
 * @param {boolean} isHover True if the cursor is hovering over the control; otherwise false.
 * @return {object} Styling used for record counts.
 */
export function RecordCountStyle(isHover) {
  if (isHover)
    return {
      width: "16px",
      height: "16px",
      backgroundColor: adsBlueA,
    };
  else
    return {
      width: "16px",
      height: "16px",
      backgroundColor: adsLightGreyB,
      color: adsMidGreyA,
    };
}

/**
 * The styling used for dashboard icons.
 */
export const dashboardIconStyle = { color: grey[400] };

/**
 * Return the styling for tab icons.
 *
 * @param {number} dataLength The number of records.
 * @return {object} The styling used for tab icons.
 */
export function GetTabIconStyle(dataLength) {
  if (dataLength < 10)
    return {
      width: "16px",
      height: "16px",
      color: adsMidGreyA,
      backgroundColor: adsLightGreyB,
      borderRadius: "18px",
      fontFamily: "Open Sans",
      ml: "2px",
    };
  else if (dataLength < 100)
    return {
      width: "24px",
      height: "16px",
      color: adsMidGreyA,
      backgroundColor: adsLightGreyB,
      borderRadius: "18px",
      fontFamily: "Open Sans",
      ml: "2px",
    };
  else
    return {
      width: "32px",
      height: "16px",
      color: adsMidGreyA,
      backgroundColor: adsLightGreyB,
      borderRadius: "18px",
      fontFamily: "Open Sans",
      ml: "2px",
    };
}

/**
 * Returns the styling used for the alert.
 *
 * @param {boolean} result True if there was not an error; otherwise false;
 * @return {object} The styling used for alerts.
 */
export function GetAlertStyle(result) {
  if (result)
    return {
      backgroundColor: adsBlueA,
    };
  else
    return {
      backgroundColor: adsRed,
    };
}

/**
 * Returns the styling used for the alert icon
 *
 * @param {boolean} result True if there was not an error; otherwise false;
 * @return {object} The styling used for alert icons.
 */
export function GetAlertIcon(result) {
  if (result) return <CheckIcon fontSize="inherit" />;
  else return <ErrorOutlineIcon fontSize="inherit" />;
}

/**
 * Returns the severity used for the alert
 *
 * @param {boolean} result True if there was not an error; otherwise false;
 * @return {string} The alert severity.
 */
export function GetAlertSeverity(result) {
  if (result) return "success";
  else return "error";
}

/**
 * The styling used for the error icons.
 */
export const errorIconStyle = {
  color: adsRed,
  width: "17.6px",
  height: "17.6px",
};

/**
 * Returns the styling used for tree items.
 *
 * @param {boolean} selected True if the item is selected; otherwise false.
 * @return {object} The styling used for tree items.
 */
export function TreeItemStyle(selected) {
  if (selected)
    return {
      pt: "2px",
      pb: "2px",
      backgroundColor: adsPaleBlueA,
      color: adsBlueA,
      fontWeight: 700,
    };
  else
    return {
      pt: "2px",
      pb: "2px",
    };
}

/**
 * The styling used for a red button.
 */
export const redButtonStyle = {
  color: adsWhite,
  backgroundColor: adsRed,
  textTransform: "none",
  "&:hover": {
    backgroundColor: adsDarkRed,
    color: adsWhite,
  },
};

/**
 * The styling used for a blue button.
 */
export const blueButtonStyle = {
  color: adsWhite,
  backgroundColor: adsBlueA,
  textTransform: "none",
  "&:hover": {
    backgroundColor: adsLightBlue,
    color: adsWhite,
  },
};

/**
 * The styling used for a white button.
 */
export const whiteButtonStyle = {
  color: adsBlueA,
  backgroundColor: adsWhite,
  textTransform: "none",
  "&:hover": {
    backgroundColor: adsLightBlue,
    color: adsWhite,
  },
};

/**
 * The styling used for the settings forms
 */
export const settingsFormStyle = {
  overflowY: "auto",
  width: "50vw",
  height: "85vh",
  mt: "50px",
};

/**
 * Returns the styling used for the settings cards.
 *
 * @param {BookmarkIcon} highlighted True if the card is highlighted; otherwise false.
 * @param {boolean} [error=false] True if the data on the card has an error.
 * @return {object} The styling used for the settings cards.
 */
export const settingsCardStyle = (highlighted, error = false) => {
  if (error) return { borderColor: adsRed, borderRadius: "8px", boxShadow: `8px 8px 5px ${adsLightGreyA}` };
  else if (highlighted) return { borderColor: adsBlueA, borderRadius: "8px", boxShadow: `8px 8px 5px ${adsPaleBlueB}` };
  else return { borderRadius: "8px", boxShadow: `8px 8px 5px ${adsLightGreyA}` };
};

/**
 * Returns the height of the cards depending on which variant of card is being displayed.
 *
 * @param {string} variant The type of card that is being displayed.
 * @return {object} The styling used for the settings cards content.
 */
export const settingsCardContentStyle = (variant) => {
  switch (variant) {
    case "property":
      return { height: "210px" };

    case "street":
      return { height: "270px" };

    case "os-street":
      return { height: "220px" };

    case "asd":
      return { height: "260px" };

    case "os-asd":
      return { height: "160px" };

    case "property-metadata":
      return { height: "240px" };

    case "street-asd-metadata":
      return { height: "330px" };

    case "wizard":
      return { height: "240px" };

    default:
      break;
  }
};

/**
 * The styling used for menus.
 */
export const menuStyle = {
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: adsLightGreyB,
  boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
  borderRadius: "3px",
  minWidth: "188px",
};

/**
 * Returns the styling to be used by menu items.
 *
 * @param {boolean} hasDivider True if the item has a divider; otherwise false.
 * @return {object} The styling used for menu items.
 */
export const menuItemStyle = (hasDivider) => {
  if (hasDivider)
    return {
      pb: "8px",
      "&:hover": {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      },
    };
  else
    return {
      "&:hover": {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      },
    };
};

/**
 * Returns the styling used for list item buttons.
 *
 * @param {boolean} selected True if the item is selected; otherwise false.
 * @param {boolean} [isGrid=false] True if the item is within a grid control; otherwise false.
 * @return {object} The styling used for list item buttons.
 */
export const listItemButtonStyle = (selected, isGrid = false) => {
  if (isGrid) {
    if (selected)
      return {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      };
    else
      return {
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        },
      };
  } else {
    if (selected)
      return {
        height: "50px",
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      };
    else
      return {
        height: "50px",
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        },
      };
  }
};

/**
 * The styling used for tabs.
 */
export const tabStyle = {
  borderBottom: `2px solid ${adsLightGreyB}`,
  textTransform: "none",
  minWidth: "45px",
  height: "40px",
  backgroundColor: adsWhite,
  fontWeight: 700,
};

/**
 * The styling used for template tabs.
 */
export const templateTabStyle = {
  borderBottom: `2px solid ${adsLightGreyB}`,
  bottom: "-2px",
  textTransform: "none",
  minWidth: "45px",
  height: "40px",
  backgroundColor: adsWhite,
  fontWeight: 700,
};

/**
 * The styling used for wizard tabs.
 */
export const wizardTabStyle = {
  borderBottom: `2px solid ${adsLightGreyB}`,
  bottom: "-2px",
  textTransform: "none",
  minWidth: "45px",
  height: "40px",
  backgroundColor: adsOffWhite,
  fontWeight: 700,
};

/**
 * Returns the styling used for tab labels.
 *
 * @param {boolean} isActive True if the tab is active; otherwise false.
 * @return {object} The styling used for tab labels.
 */
export const tabLabelStyle = (isActive) => {
  return isActive
    ? { display: "inline-flex", color: adsBlueA, fontWeight: 700, fontSize: "17px" }
    : { display: "inline-flex", color: adsMidGreyA, fontSize: "17px" };
};

/**
 * The styling used for control labels.
 */
export const controlLabelStyle = { fontSize: "14px", color: adsMidGreyA };

/**
 * The styling used for bold control labels.
 */
export const boldControlLabelStyle = { fontWeight: 700, fontSize: "14px", color: adsMidGreyA };

/**
 * The styling used for tooltips.
 */
export const tooltipStyle = { fontSize: "14px" };

/**
 * The styling used for drawer titles.
 */
export const drawerTitleStyle = { color: adsMidGreyA, fontSize: "24px", pl: "24px" };

/**
 * The styling used for drawer sub-titles
 */
export const drawerSubTitleStyle = { color: adsMidGreyA, fontSize: "18px" };

/**
 * The styling used for drawer text.
 */
export const drawerTextStyle = { color: adsMidGreyA, fontSize: "16px" };

/**
 * The styling used for drawer links.
 */
export const drawerLinkStyle = { color: adsBlueA, fontSize: "16px" };

/**
 * The styling used for drawer small text.
 */
export const drawerSmallTextStyle = { color: adsMidGreyA, fontSize: "15px", pt: "2px" };

/**
 * Returns the styling used for state buttons
 *
 * @param {boolean} selected True is the button is selected; otherwise false.
 * @param {number} width The width of the button, a width of 0 uses the default button width
 * @return {object} The styling used for the state buttons.
 */
export const getStateButtonStyle = (selected, width) => {
  if (width === 0) {
    if (selected)
      return {
        backgroundColor: adsBlueA,
        color: adsWhite,
        borderColor: adsBlueA,
        "&:hover": {
          backgroundColor: adsBlueA,
          color: adsWhite,
          borderColor: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: adsOffWhite,
        color: adsLightGreyB,
        borderColor: adsLightGreyB,
        "&:hover": {
          color: adsMidGreyA,
          borderColor: adsMidGreyA,
        },
      };
  } else {
    if (selected)
      return {
        backgroundColor: adsBlueA,
        color: adsWhite,
        borderColor: adsBlueA,
        width: `${width}px`,
        "&:hover": {
          backgroundColor: adsBlueA,
          color: adsWhite,
          borderColor: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: adsOffWhite,
        color: adsLightGreyB,
        borderColor: adsLightGreyB,
        width: `${width}px`,
        "&:hover": {
          color: adsMidGreyA,
          borderColor: adsMidGreyA,
        },
      };
  }
};

/**
 * Returns the styling used for state button text
 *
 * @param {boolean} selected True if the button is selected; otherwise false.
 * @return {object} The styling used for state buttons text.
 */
export const getStateButtonTextStyle = (selected) => {
  if (selected) return { textTransform: "none", fontSize: "14px", color: adsWhite };
  else return { textTransform: "none", fontSize: "14px", color: adsMidGreyA };
};

/**
 * Returns the styling used for related language chips
 *
 * @param {string} chipColour The colour to be used for the chip
 * @return {object} The styling used for related language chips.
 */
export function RelatedLanguageChipStyle(chipColour) {
  return {
    ml: "2px",
    mr: "1px",
    mb: "2px",
    borderColor: chipColour,
    borderStyle: "solid",
    borderWidth: "2px",
    backgroundColor: adsWhite,
    color: chipColour,
    fontSize: "10px",
  };
}

/**
 * The styling used for grid rows.
 */
export const gridRowStyle = {
  root: {
    fontFamily: "Nunito sans",
    fontSize: "15px",
    color: adsDarkGrey,
    "& .valid-row": {
      "&:hover": {
        backgroundColor: adsPaleBlueB,
        color: adsBlueA,
        cursor: "pointer",
      },
    },
    "& .invalid-row": {
      backgroundColor: adsRed10,
      "&:hover": {
        backgroundColor: adsRed20,
        color: adsBlueA,
        cursor: "pointer",
      },
    },
  },
};

/**
 * Returns the styling used for buttons
 *
 * @param {boolean} selected True if the button is selected; otherwise false.
 * @return {object} The styling used for buttons.
 */
export const getButtonStyle = (selected) => {
  if (selected)
    return {
      mt: "6px",
      color: adsWhite,
      backgroundColor: adsMidGreyA,
      "&:hover": {
        color: adsWhite,
        backgroundColor: adsMidGreyA,
      },
    };
  else
    return {
      mt: "6px",
      color: adsMidGreyA,
      backgroundColor: adsWhite,
    };
};

/**
 * Returns the styling used for ASD avatar icons
 *
 * @param {string|null} avatarClipPath The clip path used for the avatar or null
 * @param {string} iconBorderColour The hex colour to be used for the border colour
 * @param {string} iconColour The hex colour to be used for the icon foreground colour
 * @param {string} iconBackgroundColour The hex colour to be used for the icon background colour
 * @returns {object} The styling used for ASD avatars.
 */
export const getAsdAvatarStyle = (avatarClipPath, iconBorderColour, iconColour, iconBackgroundColour) => {
  if (avatarClipPath) {
    if (iconBorderColour)
      return {
        color: iconColour,
        clipPath: avatarClipPath,
        backgroundColor: iconBackgroundColour,
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: iconBorderColour,
        height: "16px",
        width: "16px",
      };
    else
      return {
        color: iconColour,
        clipPath: avatarClipPath,
        backgroundColor: iconBackgroundColour,
        height: "16px",
        width: "16px",
      };
  } else {
    if (iconBorderColour)
      return {
        color: iconColour,
        backgroundColor: iconBackgroundColour,
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: iconBorderColour,
        height: "16px",
        width: "16px",
      };
    else
      return {
        color: iconColour,
        backgroundColor: iconBackgroundColour,
        height: "16px",
        width: "16px",
      };
  }
};

/**
 * Returns the styling used for the ASD list items.
 *
 * @param {string} id The id for the record
 * @param {boolean} subItem True if this is a sub item; otherwise false
 * @param {number} index The index for the record in the array
 * @param {array} checked An array of the items that are checked
 * @param {string} variant The type of ASD record being styled
 * @param {array} selectedRecord An array of the selected items
 * @param {array} errors An array of errors
 * @returns {object} The styling used for the ASD list items.
 */
export function getASDListItemStyle(id, subItem, index, checked, variant, selectedRecord, errors) {
  function getPaddingSize() {
    if (
      (checked && checked.indexOf(`${variant}_${id}`) !== -1) ||
      (selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === id)
    )
      return "7px";
    else if (subItem) return "68px";
    else return "36px";
  }

  const defaultASDStyle = {
    pl: getPaddingSize(),
    backgroundColor: grey[100],
    "&:hover": {
      backgroundColor: adsBlue12,
      color: adsBlueA,
    },
  };

  if (errors && errors.length > 0) {
    const asdRecordErrors = errors.filter((x) => x.index === index);
    if (asdRecordErrors && asdRecordErrors.length > 0) {
      return {
        pl: getPaddingSize(),
        backgroundColor: adsRed10,
        "&:hover": {
          backgroundColor: adsRed20,
          color: adsBlueA,
        },
      };
    } else return defaultASDStyle;
  } else return defaultASDStyle;
}

/**
 * Returns the styling used for the ASD list avatars.
 *
 * @param {string} id The id for the record
 * @param {array} checked An array of the items that are checked
 * @param {string} variant The type of ASD record being styled
 * @param {array} selectedRecord An array of the selected items
 * @returns {object} The styling used for ASD list item avatars.
 */
export function getASDListItemAvatarStyle(id, checked, variant, selectedRecord) {
  if (
    (checked && checked.indexOf(`${variant}_${id}`) !== -1) ||
    (selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === id)
  )
    return {
      pr: "4px",
      minWidth: 24,
    };
  else
    return {
      pl: "4.8px",
      pr: "4px",
      minWidth: 24,
    };
}

/**
 * Returns the style for a title.
 *
 * @param {boolean} highlighted True if the title is highlighted; otherwise false.
 * @param {boolean} [error=false] True if there is an error; otherwise false.
 * @returns {object} The styling used for titles.
 */
export const getTitleStyle = (highlighted, error = false) => {
  if (error) return { color: adsRed, fontSize: "20px", fontWeight: 600 };
  else if (highlighted) return { color: adsBlueA, fontSize: "20px", fontWeight: 600 };
  else return { fontSize: "20px", fontWeight: 600 };
};

/**
 * Returns the style to be used for the template icon.
 *
 * @param {boolean} selected True if the template is selected; otherwise false
 * @returns  {object} The styling used for template icons.
 */
export function getTemplateIconStyle(selected) {
  if (selected) return { color: adsLightBlue };
  else return { color: grey[300] };
}

/**
 * Returns the styling to be used for the save button.
 *
 * @param {boolean} hasErrors True if there are errors for the street/property; otherwise false.
 * @returns {object} The styling used for save buttons.
 */
export const getSaveButtonStyle = (hasErrors) => {
  if (hasErrors)
    return {
      backgroundColor: adsRed,
      fontSize: "15px",
      color: adsWhite,
      height: "28px",
      pl: "6px",
      "&:hover": {
        backgroundColor: adsDarkRed,
        color: adsWhite,
      },
      "&:disabled": {
        backgroundColor: adsLightGreyB,
        color: adsWhite,
      },
    };
  else
    return {
      backgroundColor: adsBlueA,
      fontSize: "15px",
      color: adsWhite,
      height: "28px",
      pl: "6px",
      "&:hover": {
        backgroundColor: adsLightBlue,
        color: adsWhite,
      },
      "&:disabled": {
        backgroundColor: adsLightGreyB,
        color: adsWhite,
      },
    };
};

/**
 * Get the icon to use on the save button.
 *
 * @param {boolean} hasError True if the street/property has errors; otherwise false;
 * @returns {JSX.Element} The save/error icon.
 */
export const getSaveIcon = (hasError) => {
  if (hasError) return <ErrorIcon />;
  else return <SaveIcon />;
};
