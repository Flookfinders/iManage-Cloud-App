/* #region header */
/**************************************************************************************************
//
//  Description: Multiple Select component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   12.07.21 Sean Flook                 Initial Revision.
//    002   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    005   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Select,
  Chip,
  Input,
  Typography,
  Tooltip,
  MenuItem,
  ListSubheader,
  Avatar,
  Badge,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import {
  SyncAlt as TwoWayIcon,
  DirectionsWalk as PRoWIcon,
  DirectionsBike as NationalCycleRouteIcon,
} from "@mui/icons-material";
import {
  StartToEndIcon,
  EndToStartIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";
import {
  adsBlueA,
  adsWhite,
  adsLightBlue,
  adsMagenta,
  adsBlack,
  adsYellow,
  adsGreenA,
  adsLightPurple,
  adsMidBlueA,
  adsLightPink,
  adsLightBrown,
  adsOrange,
  adsMidBrownA,
  adsRoyalBlue,
  adsMidBlueB,
  adsBlueB,
  adsGreenB,
  adsPink,
  adsMidRed,
  adsDarkBlue,
} from "../utils/ADSColours";
import {
  FormBoxRowStyle,
  FormRowStyle,
  FormSelectInputStyle,
  menuItemStyle,
  controlLabelStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSMultipleSelectControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  useRounded: PropTypes.bool,
  indicateChange: PropTypes.bool,
  lookupData: PropTypes.array.isRequired,
  lookupId: PropTypes.string.isRequired,
  lookupLabel: PropTypes.string.isRequired,
  lookupColour: PropTypes.string,
  lookupIcon: PropTypes.string,
  lookupDefault: PropTypes.string,
  displayLabel: PropTypes.string,
  helperText: PropTypes.string,
  value: PropTypes.array,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSMultipleSelectControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  useRounded: false,
  indicateChange: false,
};

function ADSMultipleSelectControl({
  label,
  isEditable,
  isRequired,
  useRounded,
  indicateChange,
  lookupData,
  lookupId,
  lookupLabel,
  lookupColour,
  lookupIcon,
  lookupDefault,
  displayLabel,
  helperText,
  value,
  errorText,
  onChange,
}) {
  const theme = useTheme();
  const [displayError, setDisplayError] = useState("");
  const hasError = useRef(false);
  const [filterData, setFilterData] = useState(value);
  const [allData, setAllData] = useState(lookupData && lookupData.map((a) => a[`${lookupLabel}`]));
  const [defaultData, setDefaultData] = useState(
    lookupData && lookupDefault && lookupData.filter((x) => x[`${lookupDefault}`]).map((a) => a[`${lookupLabel}`])
  );
  const [hiddenData, setHiddenData] = useState(
    lookupData && lookupDefault && lookupData.filter((x) => !x[`${lookupDefault}`]).map((a) => a[`${lookupLabel}`])
  );

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  /**
   * Event to handle when the control changes.
   *
   * @param {object} event The event object.
   */
  const handleChangeEvent = (event) => {
    setFilterData(event.target.value);

    if (onChange) onChange(event.target.value);
  };

  /**
   * Event to handle the removal of items.
   *
   * @param {object} value The item to be removed.
   */
  const handleRemoveItem = (value) => {
    const newFilterData = filterData.filter((x) => x !== value);

    setFilterData(newFilterData);

    if (onChange) onChange(newFilterData);
  };

  /**
   * Method to get the selected item details.
   *
   * @param {string} value The description of the selected item.
   * @returns {array} The lookup filtered by the value.
   */
  function getSelectedItem(value) {
    return lookupData.filter((x) => x[`${lookupLabel}`] === value);
  }

  /**
   * Method to get the chip icon.
   *
   * @param {string} value The description of the item.
   * @returns {JSX.Element} The icon to be used in the chip.
   */
  function getChipIcon(value) {
    const selectedItem = getSelectedItem(value);

    switch (selectedItem[0][lookupIcon]) {
      case "TwoWay":
        return <TwoWayIcon sx={getAvatarColour(value)} />;

      case "StartToEnd":
        return <StartToEndIcon sx={getAvatarColour(value)} />;

      case "EndToStart":
        return <EndToStartIcon sx={getAvatarColour(value)} />;

      case "PRoW":
        return <PRoWIcon sx={getAvatarColour(value)} />;

      case "NCR":
        return <NationalCycleRouteIcon sx={getAvatarColour(value)} />;

      case "Obstruction":
        return <ObstructionIcon sx={getAvatarColour(value)} />;

      case "PlanningOrder":
        return <PlanningOrderIcon sx={getAvatarColour(value)} />;

      case "WorksProhibited":
        return <VehiclesProhibitedIcon sx={getAvatarColour(value)} />;

      default:
        return null;
    }
  }

  /**
   * Method to get the avatar text styling.
   *
   * @param {array} selectedItem The selected item.
   * @returns {object} The styling to be used for the avatar text.
   */
  function getAvatarTextStyle(selectedItem) {
    if (selectedItem[0][lookupColour] === adsYellow)
      return {
        color: adsBlack,
        fontWeight: 500,
        fontFamily: "Open Sans",
      };
    else
      return {
        color: adsWhite,
        fontWeight: 500,
        fontFamily: "Open Sans",
      };
  }

  /**
   * Method to get the chip avatar.
   *
   * @param {string} value The description of the item.
   * @returns {JSX.Element} The avatar for the chip.
   */
  function getChipAvatar(value) {
    const selectedItem = getSelectedItem(value);

    if (useRounded) {
      return (
        <Avatar variant="rounded" sx={getAvatarColour(value)}>
          <Typography variant="caption" sx={getAvatarTextStyle(selectedItem)}>
            {getChipAvatarValue(value)}
          </Typography>
        </Avatar>
      );
    } else {
      return (
        <Avatar sx={getAvatarColour(value)}>
          <Typography variant="caption" sx={getAvatarTextStyle(selectedItem)}>
            {getChipAvatarValue(value)}
          </Typography>
        </Avatar>
      );
    }
  }

  /**
   * Method to get the avatar colour.
   *
   * @param {string} value The description of the item.
   * @returns {object} The colour to set the avatar.
   */
  function getAvatarColour(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem) {
      switch (selectedItem[0][`${lookupColour}`]) {
        case adsGreenA:
          return {
            color: adsWhite,
            backgroundColor: adsGreenA,
          };

        case adsLightPurple:
          return {
            color: adsWhite,
            backgroundColor: adsLightPurple,
          };

        case adsMidBlueA:
          return {
            color: adsWhite,
            backgroundColor: adsMidBlueA,
          };

        case adsLightPink:
          return {
            color: adsWhite,
            backgroundColor: adsLightPink,
          };

        case adsLightBrown:
          return {
            color: adsWhite,
            backgroundColor: adsLightBrown,
          };

        case adsOrange:
          return {
            color: adsWhite,
            backgroundColor: adsOrange,
          };

        case adsMagenta:
          return {
            color: adsWhite,
            backgroundColor: adsMagenta,
          };

        case adsMidBrownA:
          return {
            color: adsWhite,
            backgroundColor: adsMidBrownA,
          };

        case adsRoyalBlue:
          return {
            color: adsWhite,
            backgroundColor: adsRoyalBlue,
          };

        case adsYellow:
          return {
            color: adsBlack,
            backgroundColor: adsYellow,
          };

        case adsMidBlueB:
          return {
            color: adsWhite,
            backgroundColor: adsMidBlueB,
          };

        case adsBlueB:
          return {
            color: adsWhite,
            backgroundColor: adsBlueB,
          };

        case adsLightBlue:
          return {
            color: adsWhite,
            backgroundColor: adsLightBlue,
          };

        case adsGreenB:
          return {
            color: adsWhite,
            backgroundColor: adsGreenB,
          };

        case adsPink:
          return {
            color: adsWhite,
            backgroundColor: adsPink,
          };

        case adsMidRed:
          return {
            color: adsWhite,
            backgroundColor: adsMidRed,
          };

        case adsDarkBlue:
          return {
            color: adsWhite,
            backgroundColor: adsDarkBlue,
          };

        default:
          return {
            color: adsWhite,
            backgroundColor: adsBlueA,
          };
      }
    } else
      return {
        color: adsWhite,
        backgroundColor: adsBlueA,
      };
  }

  /**
   * Method to get the chip avatar value.
   *
   * @param {string} value The description for the item.
   * @returns {number|null}
   */
  function getChipAvatarValue(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem) return selectedItem[0][`${lookupId}`];
    else return null;
  }

  /**
   * Method to get the display label for the chip.
   *
   * @param {string} value The description for the item.
   * @returns {string}
   */
  function getChipDisplayLabel(value) {
    if (displayLabel) {
      const selectedItem = getSelectedItem(value);

      if (selectedItem) return selectedItem[0][`${displayLabel}`];
    } else return value;
  }

  /**
   * Method to get the lookup information.
   *
   * @param {number} value The id for the item.
   * @returns {JSX.Element} The lookup information.
   */
  function getLookupInfo(value) {
    if (lookupData) {
      const currentRow = lookupData.filter((x) => x[lookupId] === value);

      if (currentRow) {
        if (lookupIcon && currentRow[0][lookupIcon] && currentRow[0][lookupIcon].length !== 0) {
          return (
            <Box
              sx={{
                pl: theme.spacing(2),
                pt: theme.spacing(1.75),
                pb: theme.spacing(1.75),
              }}
            >
              <img src={currentRow[0][lookupIcon]} alt="" width="20" height="20" />
              <Typography
                variant="body1"
                align="left"
                color="textPrimary"
                aria-labelledby={`${label.replace(" ", "-")}-label`}
              >
                {currentRow[0][lookupLabel]}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Typography
              variant="body1"
              align="left"
              sx={{
                pl: theme.spacing(2),
                pt: theme.spacing(1.75),
                pb: theme.spacing(1.75),
              }}
            >
              {currentRow[0][lookupLabel]}
            </Typography>
          );
        }
      }
    }
  }

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

  useEffect(() => {
    if (lookupData) {
      setAllData(lookupData.map((a) => a[`${lookupLabel}`]));

      if (lookupDefault) {
        setDefaultData(lookupData.filter((x) => x[`${lookupDefault}`]).map((a) => a[`${lookupLabel}`]));
        setHiddenData(lookupData.filter((x) => !x[`${lookupDefault}`]).map((a) => a[`${lookupLabel}`]));
      }
    }
  }, [lookupData, lookupLabel, lookupDefault]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={controlLabelStyle}
          >
            <Badge color="secondary" variant="dot" invisible={!indicateChange}>
              {`${label}${isRequired ? "*" : ""}`}
            </Badge>
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <FormControl
            sx={FormSelectInputStyle(hasError.current)}
            variant="outlined"
            margin="dense"
            fullWidth
            size="small"
            disabled={!isEditable}
            error={hasError.current}
            required={isRequired}
          >
            {isEditable ? (
              helperText && helperText.length > 0 ? (
                <Tooltip
                  title={isRequired ? helperText + " This is a required field." : helperText}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <Select
                    sx={FormSelectInputStyle(hasError.current)}
                    labelId={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-multiselect`}
                    multiple
                    value={filterData}
                    onChange={handleChangeEvent}
                    InputProps={{
                      alignItems: "center",
                    }}
                    input={<Input id={`${label}-chip`} />}
                    renderValue={(selected) => (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                        }}
                      >
                        {selected.map((value) =>
                          lookupIcon ? (
                            <Chip
                              key={value}
                              size="small"
                              icon={getChipIcon(value)}
                              label={getChipDisplayLabel(value)}
                              sx={{
                                m: "2px",
                              }}
                              onDelete={() => handleRemoveItem(value)}
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                            />
                          ) : (
                            <Chip
                              key={value}
                              size="small"
                              avatar={getChipAvatar(value)}
                              label={getChipDisplayLabel(value)}
                              sx={{
                                m: "2px",
                              }}
                              onDelete={() => handleRemoveItem(value)}
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                            />
                          )
                        )}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                          width: 250,
                        },
                      },
                    }}
                  >
                    {defaultData &&
                      defaultData.map((lookupText) => (
                        <MenuItem key={lookupText} dense value={lookupText} sx={menuItemStyle(false)}>
                          <Checkbox checked={filterData.indexOf(lookupText) > -1} />
                          <ListItemText primary={lookupText} />
                        </MenuItem>
                      ))}
                    {hiddenData && <ListSubheader disableSticky>Hidden by default</ListSubheader>}
                    {hiddenData &&
                      hiddenData.map((lookupText) => (
                        <MenuItem key={lookupText} dense value={lookupText} sx={menuItemStyle(false)}>
                          <Checkbox checked={filterData.indexOf(lookupText) > -1} />
                          <ListItemText primary={lookupText} />
                        </MenuItem>
                      ))}
                    {!defaultData &&
                      allData.map((lookupText) => (
                        <MenuItem key={lookupText} dense value={lookupText} sx={menuItemStyle(false)}>
                          <Checkbox checked={filterData.indexOf(lookupText) > -1} />
                          <ListItemText primary={lookupText} />
                        </MenuItem>
                      ))}
                  </Select>
                </Tooltip>
              ) : (
                <Select
                  sx={FormSelectInputStyle(hasError.current)}
                  labelId={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                  id={`${label.toLowerCase().replaceAll(" ", "-")}-multiselect`}
                  multiple
                  value={filterData}
                  onChange={handleChangeEvent}
                  InputProps={{
                    alignItems: "center",
                  }}
                  input={<Input disableUnderline id={`${label}-chip`} />}
                  renderValue={(selected) => (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                      }}
                    >
                      {selected.map((value) =>
                        lookupIcon ? (
                          <Chip
                            key={value}
                            size="small"
                            icon={getChipIcon(value)}
                            label={getChipDisplayLabel(value)}
                            sx={{
                              m: "2px",
                            }}
                            onDelete={() => handleRemoveItem(value)}
                            onMouseDown={(event) => {
                              event.stopPropagation();
                            }}
                          />
                        ) : (
                          <Chip
                            key={value}
                            size="small"
                            avatar={getChipAvatar(value)}
                            label={getChipDisplayLabel(value)}
                            sx={{
                              m: "2px",
                            }}
                            onDelete={() => handleRemoveItem(value)}
                            onMouseDown={(event) => {
                              event.stopPropagation();
                            }}
                          />
                        )
                      )}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                        width: 250,
                      },
                    },
                  }}
                >
                  {defaultData &&
                    defaultData.map((lookupText) => (
                      <MenuItem key={lookupText} dense value={lookupText} sx={menuItemStyle(false)}>
                        <Checkbox checked={filterData.indexOf(lookupText) > -1} />
                        <ListItemText primary={lookupText} />
                      </MenuItem>
                    ))}
                  {hiddenData && <ListSubheader disableSticky>Hidden by default</ListSubheader>}
                  {hiddenData &&
                    hiddenData.map((lookupText) => (
                      <MenuItem key={lookupText} dense value={lookupText} sx={menuItemStyle(false)}>
                        <Checkbox checked={filterData.indexOf(lookupText) > -1} />
                        <ListItemText primary={lookupText} />
                      </MenuItem>
                    ))}
                  {!defaultData &&
                    allData.map((lookupText) => (
                      <MenuItem key={lookupText} dense value={lookupText} sx={menuItemStyle(false)}>
                        <Checkbox checked={filterData.indexOf(lookupText) > -1} />
                        <ListItemText primary={lookupText} />
                      </MenuItem>
                    ))}
                </Select>
              )
            ) : (
              getLookupInfo(value)
            )}
          </FormControl>
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-language-error`} />
      </Grid>
    </Box>
  );
}

export default ADSMultipleSelectControl;
