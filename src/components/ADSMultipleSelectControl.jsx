//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Multiple Select component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001   12.07.21 Sean Flook                  Initial Revision.
//    002   27.06.23 Sean Flook          WI40729 Correctly handle if errorText is a string rather then an array.
//    003   06.10.23 Sean Flook                  Use colour variables.
//    004   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    005   05.01.24 Sean Flook                  Use CSS shortcuts.
//    006   28.08.24 Sean Flook        IMANN-961 Use a TextField when user is read only.
//#endregion Version 1.0.0.0
//#region Version 1.0.2.0
//    007   12.11.24 Sean Flook                  Various changes to improve the control.
//#endregion Version 1.0.2.0
//#region Version 1.0.5.0
//    008   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports

import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Grid2,
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { lookupToTitleCase } from "../utils/HelperUtils";

import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import {
  PRoWIcon,
  StartToEndIcon,
  EndToStartIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";

import { adsBlueA, adsWhite, adsBlack, adsYellow, adsTheme, getAsdThemColourString } from "../utils/ADSColours";
import {
  FormBoxRowStyle,
  FormRowStyle,
  FormSelectInputStyle,
  menuItemStyle,
  controlLabelStyle,
  tooltipStyle,
  FormInputStyle,
} from "../utils/ADSStyles";
import { ThemeProvider } from "@mui/material/styles";
import GetClassificationIcon from "../utils/ADSClassificationIcons";

//#endregion imports

ADSMultipleSelectControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isClassification: PropTypes.bool,
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
  isClassification: false,
  useRounded: false,
  indicateChange: false,
};

function ADSMultipleSelectControl({
  label,
  isEditable,
  isRequired,
  isClassification,
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
   * @param {Object} event The event object.
   */
  const handleChangeEvent = (event) => {
    setFilterData(event.target.value);

    if (onChange) onChange(event.target.value);
  };

  /**
   * Event to handle the removal of items.
   *
   * @param {Object} value The item to be removed.
   */
  const handleRemoveItem = (value) => {
    const newFilterData = filterData.filter((x) => x !== value);

    setFilterData(newFilterData);

    if (onChange) onChange(newFilterData);
  };

  /**
   * Method to get the selected item details.
   *
   * @param {String} value The description of the selected item.
   * @returns {Array} The lookup filtered by the value.
   */
  function getSelectedItem(value) {
    return lookupData.filter((x) =>
      isClassification ? `${x[`${lookupId}`]} - ${x[`${lookupLabel}`]}` === value : x[`${lookupLabel}`] === value
    );
  }

  /**
   * Method to get the chip icon.
   *
   * @param {String} value The description of the item.
   * @returns {JSX.Element} The icon to be used in the chip.
   */
  function getChipIcon(value) {
    const selectedItem = getSelectedItem(value);

    if (isClassification && lookupIcon === "useId") {
      return GetClassificationIcon(selectedItem[0][lookupId]);
    } else {
      switch (selectedItem[0][lookupIcon]) {
        case "TwoWay":
          return <SyncAltIcon sx={getAvatarStyle(value)} />;

        case "StartToEnd":
          return <StartToEndIcon sx={getAvatarStyle(value)} />;

        case "EndToStart":
          return <EndToStartIcon sx={getAvatarStyle(value)} />;

        case "PRoW":
          return <PRoWIcon sx={getAvatarStyle(value)} />;

        case "NCR":
          return <DirectionsBikeIcon sx={getAvatarStyle(value)} />;

        case "QuietRoute":
          return <QuietRouteIcon sx={getAvatarStyle(value)} />;

        case "Obstruction":
          return <ObstructionIcon sx={getAvatarStyle(value)} />;

        case "PlanningOrder":
          return <PlanningOrderIcon sx={getAvatarStyle(value)} />;

        case "WorksProhibited":
          return <VehiclesProhibitedIcon sx={getAvatarStyle(value)} />;

        default:
          return null;
      }
    }
  }

  /**
   * Method to get the avatar text styling.
   *
   * @param {Array} selectedItem The selected item.
   * @returns {Object} The styling to be used for the avatar text.
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
   * Method to get the chip colour.
   *
   * @param {String} value The description of the item.
   * @returns {String} The colour to be used for the chip.
   */
  const getChipColour = (value) => {
    const selectedItem = getSelectedItem(value);

    if (selectedItem) {
      return getAsdThemColourString(selectedItem[0][`${lookupColour}`]);
    } else return "primary";
  };

  /**
   * Method to get the chip avatar.
   *
   * @param {String} value The description of the item.
   * @returns {JSX.Element} The avatar for the chip.
   */
  function getChipAvatar(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem) {
      return (
        <Avatar variant={useRounded ? "rounded" : "circular"} sx={getAvatarStyle(value)}>
          <Typography variant="caption" sx={getAvatarTextStyle(selectedItem)}>
            {selectedItem[0][`${lookupId}`]}
          </Typography>
        </Avatar>
      );
    }
  }

  /**
   * Method to get the avatar style.
   *
   * @param {String} value The description of the item.
   * @returns {Object} The style to set the avatar.
   */
  function getAvatarStyle(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem) {
      const avatarColour = lookupColour.includes("#") ? lookupColour : selectedItem[0][lookupColour];
      const avatarIdLength = selectedItem[0][lookupId].toString().length;
      const avatarWidth = avatarIdLength <= 2 ? "24px" : avatarIdLength <= 3 ? "36px" : "48px";

      if (lookupIcon)
        return {
          color: avatarColour,
          height: "24px",
          width: "24px",
        };
      else
        return {
          backgroundColor: avatarColour,
          height: "24px",
          width: avatarWidth,
        };
    } else {
      if (lookupIcon)
        return {
          color: adsBlueA,
          width: "24px",
          height: "24px",
        };
      else
        return {
          backgroundColor: adsBlueA,
          width: "24px",
          height: "24px",
        };
    }
  }

  /**
   * Method to get the display label for the chip.
   *
   * @param {String} value The description for the item.
   * @returns {String}
   */
  function getChipDisplayLabel(value) {
    if (displayLabel) {
      const selectedItem = getSelectedItem(value);

      if (selectedItem) {
        if (isClassification) {
          return `${selectedItem[0][`${lookupId}`]} - ${selectedItem[0][`${displayLabel}`]}`;
        } else {
          return selectedItem[0][`${displayLabel}`];
        }
      }
    } else return value;
  }

  /**
   * Method to get the lookup information.
   *
   * @param {Number} value The id for the item.
   * @returns {JSX.Element} The lookup information.
   */
  function getLookupInfo(value) {
    if (lookupData) {
      const currentRow = lookupData.filter((x) => x[lookupId] === value);

      if (currentRow) {
        if (lookupIcon && currentRow[0][lookupIcon] && currentRow[0][lookupIcon].length !== 0) {
          return (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-lookup-info`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              fullWidth
              disabled
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={lookupToTitleCase(currentRow[0][lookupLabel], false)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <img src={currentRow[0][lookupIcon]} alt="" width="20" height="20" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          );
        } else {
          return (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-lookup-info`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              rows={1}
              fullWidth
              disabled
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={lookupToTitleCase(currentRow[0][lookupLabel], false)}
            />
          );
        }
      } else {
        return (
          <TextField
            id={`${label.toLowerCase().replaceAll(" ", "-")}-lookup-info`}
            sx={FormInputStyle(hasError.current)}
            error={hasError.current}
            rows={1}
            fullWidth
            disabled
            required={isRequired}
            variant="outlined"
            margin="dense"
            size="small"
            value={""}
          />
        );
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
      setAllData(
        lookupData.map((a) => (isClassification ? `${a[`${lookupId}`]} - ${a[`${lookupLabel}`]}` : a[`${lookupLabel}`]))
      );

      if (lookupDefault) {
        setDefaultData(
          lookupData
            .filter((x) => x[`${lookupDefault}`])
            .map((a) => (isClassification ? `${a[`${lookupId}`]} - ${a[`${lookupLabel}`]}` : a[`${lookupLabel}`]))
        );
        setHiddenData(
          lookupData
            .filter((x) => !x[`${lookupDefault}`])
            .map((a) => (isClassification ? `${a[`${lookupId}`]} - ${a[`${lookupLabel}`]}` : a[`${lookupLabel}`]))
        );
      }
    }
  }, [lookupData, lookupLabel, lookupDefault, isClassification, lookupId]);

  useEffect(() => {
    setFilterData(value);
  }, [value]);

  return (
    <ThemeProvider theme={adsTheme}>
      <Box sx={FormBoxRowStyle(hasError.current)}>
        <Grid2 container alignItems="center" sx={FormRowStyle(hasError.current)}>
          <Grid2 size={3}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mr: "16px" }}>
              <Typography
                variant="body2"
                align="left"
                id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                sx={controlLabelStyle}
              >
                {`${label}${isRequired ? "*" : ""}`}
              </Typography>
              <Badge color="error" variant="dot" invisible={!indicateChange} />
            </Stack>
          </Grid2>
          <Grid2 size={9}>
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
                                color={getChipColour(value)}
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
                                color={getChipColour(value)}
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
                              color={getChipColour(value)}
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
                              color={getChipColour(value)}
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
          </Grid2>
          <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-language-error`} />
        </Grid2>
      </Box>
    </ThemeProvider>
  );
}

export default ADSMultipleSelectControl;
