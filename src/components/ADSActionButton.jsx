//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Action Button component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001   02.07.21 Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   05.01.24 Sean Flook                 Use CSS shortcuts.
//    004   10.01.24 Sean Flook                 Fix warnings.
//    005   04.04.24 Sean Flook                 Added propType for missing parameter.
//    006   10.06.24 Sean Flook       IMANN-509 Added the password variant.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PreviousIcon from "@mui/icons-material/ChevronLeft";
import NextIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PasswordIcon from "@mui/icons-material/Password";
import { CopyIcon, MoveIcon } from "../utils/ADSIcons";
import { adsBlueA, adsMidGreyA, adsWhite } from "../utils/ADSColours";
import { tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

//endregion imports

ADSActionButton.propTypes = {
  variant: PropTypes.oneOf([
    "add",
    "close",
    "copy",
    "delete",
    "deleteForever",
    "edit",
    "export",
    "home",
    "import",
    "logout",
    "move",
    "moveDown",
    "moveUp",
    "next",
    "previous",
    "return",
    "save",
    "settings",
    "user",
    "users",
    "password",
  ]),
  buttonLabel: PropTypes.string,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool,
  inheritBackground: PropTypes.bool,
  tooltipTitle: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  fontSize: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

function ADSActionButton({
  variant,
  buttonLabel,
  disabled,
  hidden,
  inheritBackground,
  tooltipTitle,
  tooltipPlacement,
  fontSize,
  onClick,
}) {
  const theme = useTheme();

  /**
   * Method to get the styling for the action button.
   *
   * @returns {object} The styling for the action button.
   */
  function getActionStyle() {
    if (hidden) {
      return { display: "none" };
    } else if (disabled) return { color: theme.palette.text.disabled };
    else if (inheritBackground)
      return {
        backgroundColor: "inherit",
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: adsWhite,
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
  }

  /**
   * Event to handle the click event of the button.
   *
   * @param {object} event The event object.
   */
  const handleClickEvent = (event) => {
    if (onClick) onClick(event);
  };

  /**
   * Method to get the icon to be displayed on the button.
   *
   * @returns {JSX.Element} The icon to be displayed on the button.
   */
  const renderIcon = () => {
    let iconComp = null;

    switch (variant) {
      case "previous":
        if (fontSize && fontSize !== "") {
          iconComp = <PreviousIcon fontSize={fontSize} />;
        } else {
          iconComp = <PreviousIcon />;
        }
        break;

      case "next":
        if (fontSize && fontSize !== "") {
          iconComp = <NextIcon fontSize={fontSize} />;
        } else {
          iconComp = <NextIcon />;
        }
        break;

      case "save":
        if (fontSize && fontSize !== "") {
          iconComp = <SaveIcon fontSize={fontSize} />;
        } else {
          iconComp = <SaveIcon />;
        }
        break;

      case "delete":
        if (fontSize && fontSize !== "") {
          iconComp = <DeleteIcon fontSize={fontSize} />;
        } else {
          iconComp = <DeleteIcon />;
        }
        break;

      case "deleteForever":
        if (fontSize && fontSize !== "") {
          iconComp = <DeleteForeverOutlinedIcon fontSize={fontSize} />;
        } else {
          iconComp = <DeleteForeverOutlinedIcon />;
        }
        break;

      case "return":
      case "home":
        if (fontSize && fontSize !== "") {
          iconComp = <HomeIcon fontSize={fontSize} />;
        } else {
          iconComp = <HomeIcon />;
        }
        break;

      case "close":
        if (fontSize && fontSize !== "") {
          iconComp = <CloseIcon fontSize={fontSize} />;
        } else {
          iconComp = <CloseIcon />;
        }
        break;

      case "copy":
        if (fontSize && fontSize !== "") {
          iconComp = <CopyIcon fontSize={fontSize} />;
        } else {
          iconComp = <CopyIcon />;
        }
        break;

      case "move":
        if (fontSize && fontSize !== "") {
          iconComp = <MoveIcon fontSize={fontSize} />;
        } else {
          iconComp = <MoveIcon />;
        }
        break;

      case "moveDown":
        if (fontSize && fontSize !== "") {
          iconComp = <ExpandMoreIcon fontSize={fontSize} />;
        } else {
          iconComp = <ExpandMoreIcon />;
        }
        break;

      case "moveUp":
        if (fontSize && fontSize !== "") {
          iconComp = <ExpandLessIcon fontSize={fontSize} />;
        } else {
          iconComp = <ExpandLessIcon />;
        }
        break;

      case "user":
        if (fontSize && fontSize !== "") {
          iconComp = <PersonOutlineIcon fontSize={fontSize} />;
        } else {
          iconComp = <PersonOutlineIcon />;
        }
        break;

      case "settings":
        if (fontSize && fontSize !== "") {
          iconComp = <SettingsOutlinedIcon fontSize={fontSize} />;
        } else {
          iconComp = <SettingsOutlinedIcon />;
        }
        break;

      case "logout":
        if (fontSize && fontSize !== "") {
          iconComp = <LogoutIcon fontSize={fontSize} />;
        } else {
          iconComp = <LogoutIcon />;
        }
        break;

      case "users":
        if (fontSize && fontSize !== "") {
          iconComp = <PeopleOutlineIcon fontSize={fontSize} />;
        } else {
          iconComp = <PeopleOutlineIcon />;
        }
        break;

      case "import":
        if (fontSize && fontSize !== "") {
          iconComp = <FileUploadOutlinedIcon fontSize={fontSize} />;
        } else {
          iconComp = <FileUploadOutlinedIcon />;
        }
        break;

      case "export":
        if (fontSize && fontSize !== "") {
          iconComp = <FileDownloadOutlinedIcon fontSize={fontSize} />;
        } else {
          iconComp = <FileDownloadOutlinedIcon />;
        }
        break;

      case "edit":
        if (fontSize && fontSize !== "") {
          iconComp = <EditIcon fontSize={fontSize} />;
        } else {
          iconComp = <EditIcon />;
        }
        break;

      case "password":
        if (fontSize && fontSize !== "") {
          iconComp = <PasswordIcon fontSize={fontSize} />;
        } else {
          iconComp = <PasswordIcon />;
        }
        break;

      default:
        if (fontSize && fontSize !== "") {
          iconComp = <AddCircleOutlineIcon fontSize={fontSize} />;
        } else {
          iconComp = <AddCircleOutlineIcon />;
        }
        break;
    }

    return (
      <Tooltip title={tooltipTitle} arrow placement={tooltipPlacement} sx={tooltipStyle}>
        <span>
          <IconButton
            sx={getActionStyle()}
            id={`ads-action-button-${buttonLabel ? buttonLabel.toLowerCase().replaceAll(" ", "-") : ""}`}
            size="small"
            disabled={disabled}
            onClick={handleClickEvent}
            aria-label={variant}
          >
            {iconComp}
            {buttonLabel && buttonLabel.length > 0 && (
              <Typography
                variant="body2"
                sx={{
                  pl: theme.spacing(0.5),
                  pr: theme.spacing(1),
                }}
              >
                {buttonLabel}
              </Typography>
            )}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  return renderIcon();
}

export default ADSActionButton;
