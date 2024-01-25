//#region header */
/**************************************************************************************************
//
//  Description: Wizard select template page
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
//    002   05.04.23 Sean Flook         WI40669 Fixed warnings.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    006   10.01.24 Sean Flook                 Fix warnings.
//    007   25.01.24 Sean Flook                 Changes required after UX review.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";

import { Typography, AppBar, Tabs, Tab, Paper, Card, CardActionArea, CardContent, Avatar } from "@mui/material";
import { Box, Stack } from "@mui/system";
import Masonry from "@mui/lab/Masonry";

import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import DomainIcon from "@mui/icons-material/Domain";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";
import {
  PlotDevelopmentIcon,
  OfficialDevelopmentIcon,
  IndustrialEstateIcon,
  PropertyShellIcon,
} from "../utils/ADSIcons";

import {
  adsBlueA,
  adsMidGreyA,
  adsWhite,
  adsLightGreyB,
  adsLightBlue,
  adsMagenta,
  adsDarkBlue,
} from "../utils/ADSColours";
import { templateTabStyle, tabLabelStyle, settingsCardStyle, getTitleStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wizard-select-template-tabpanel-${index}`}
      aria-labelledby={`wizard-select-template-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `wizard-select-template-tab-${index}`,
    "aria-controls": `wizard-select-template-tabpanel-${index}`,
  };
}

WizardSelectTemplatePage.propTypes = {
  variant: PropTypes.oneOf(["property", "range", "child", "rangeChildren"]).isRequired,
  onTemplateSelected: PropTypes.func.isRequired,
};

function WizardSelectTemplatePage({ variant, onTemplateSelected }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [data, setData] = useState(null);
  const [value, setValue] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  /**
   * Event to handle when the tabs change.
   *
   * @param {object} event The event object.
   * @param {number} newValue The index of the new tab.
   */
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  /**
   * Method to get the styling for the avatar.
   *
   * @param {number} type The type of template.
   * @param {boolean} highlighted True if the avatar ifs highlighted; otherwise false.
   * @returns {object} The styling to be used for the avatar.
   */
  const getAvatarStyle = (type, highlighted) => {
    if (highlighted)
      return {
        backgroundColor: adsBlueA,
        width: "24px",
        height: "24px",
        mt: "2px",
      };
    else
      switch (type) {
        case 2: // Library
          return {
            backgroundColor: adsLightBlue,
            width: "24px",
            height: "24px",
            mt: "2px",
          };

        case 3: // User
          return {
            backgroundColor: adsDarkBlue,
            width: "24px",
            height: "24px",
            mt: "2px",
          };

        default:
          return {
            backgroundColor: adsMagenta,
            width: "24px",
            height: "24px",
            mt: "2px",
          };
      }
  };

  /**
   * Method to get the avatar icon.
   *
   * @param {number} system The numbering system.
   * @returns {JSX.Element} The icon to be displayed in the avatar.
   */
  const getAvatarIcon = (system) => {
    switch (system) {
      case 2: // Range
        return <ListIcon />;

      case 3: // Plot
        return PlotDevelopmentIcon();

      case 4: // Official
        return OfficialDevelopmentIcon();

      case 5: // Flats
        return <DomainIcon />;

      case 6: // Bedsits
        return <LocationCityIcon />;

      case 7: // Industrial
        return IndustrialEstateIcon();

      case 8: // Offices
        return <BusinessCenterIcon />;

      case 9: // Property shell
        return PropertyShellIcon();

      case 10: // User
        return <PersonIcon />;

      default: // Single
        return <HomeIcon />;
    }
  };

  /**
   * Method to get the template card.
   *
   * @param {object} rec The record data.
   * @param {number} index The index of the record.
   * @returns {JSX.Element} The card for the record.
   */
  const getTemplateCard = (rec, index) => {
    return (
      <Box>
        <Card
          id={`template-${index}-card`}
          variant="outlined"
          onMouseEnter={() => handleMouseEnterCard(rec.templatePkId)}
          onMouseLeave={handleMouseLeaveCard}
          sx={settingsCardStyle(selectedCard && selectedCard === rec.templatePkId)}
        >
          <CardActionArea onClick={(event) => doTemplateSelected(event, rec.templatePkId)}>
            <CardContent>
              <Stack direction="row" spacing={1}>
                <Avatar
                  variant={rec.templateType === 3 ? "rounded" : "circular"}
                  sx={getAvatarStyle(rec.templateType, selectedCard && selectedCard === rec.templatePkId)}
                >
                  {getAvatarIcon(rec.numberingSystem)}
                </Avatar>
                <Typography
                  variant="h6"
                  align="left"
                  sx={getTitleStyle(selectedCard && selectedCard === rec.templatePkId)}
                >
                  {rec.templateName}
                </Typography>
              </Stack>
              <Typography variant="body2" align="left" sx={{ mt: theme.spacing(1) }}>
                {rec.templateDescription}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    );
  };

  /**
   * Event to handle when the mouse enters a card.
   *
   * @param {number} pkId The id of the record.
   */
  const handleMouseEnterCard = (pkId) => {
    setSelectedCard(pkId);
  };

  /**
   * Event to handle when the mouse leaves a card.
   *
   * @param {object} event The event object.
   */
  const handleMouseLeaveCard = (event) => {
    event.stopPropagation();
    setSelectedCard(null);
  };

  /**
   * Event to handle when a template is selected.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the record.
   */
  const doTemplateSelected = (event, pkId) => {
    event.stopPropagation();
    if (onTemplateSelected) onTemplateSelected(pkId);
  };

  useEffect(() => {
    if (settingsContext.propertyTemplates) {
      switch (variant) {
        case "property":
          setData(settingsContext.propertyTemplates.filter((x) => x.templateUseType === 1));
          break;

        case "range":
          setData(settingsContext.propertyTemplates.filter((x) => x.templateUseType === 2));
          break;

        case "child":
          setData(settingsContext.propertyTemplates.filter((x) => x.templateUseType === 3));
          break;

        case "rangeChildren":
          setData(settingsContext.propertyTemplates.filter((x) => x.templateUseType === 4));
          break;

        default:
          setData(null);
          break;
      }
    }

    return () => {};
  }, [settingsContext.propertyTemplates, variant]);

  return (
    <div id="wizard-select-template-page">
      <Stack direction="column" spacing={2} sx={{ ml: theme.spacing(2), mt: theme.spacing(1), width: "100%" }}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(0) }}>Select template</Typography>
        <AppBar
          position="static"
          color="default"
          sx={{
            borderStyle: "none",
            borderBottom: `2px solid ${adsLightGreyB}`,
            boxShadow: "none",
          }}
        >
          <Tabs
            value={value}
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { background: adsBlueA, height: "2px" } }}
            variant="scrollable"
            scrollButtons="auto"
            selectionFollowsFocus
            aria-label="property-tabs"
            sx={{ backgroundColor: adsWhite, color: adsMidGreyA }}
          >
            <Tab
              sx={templateTabStyle}
              label={
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                  All templates
                </Typography>
              }
              {...a11yProps(0)}
            />
            <Tab
              sx={templateTabStyle}
              label={
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                  User templates
                </Typography>
              }
              {...a11yProps(1)}
            />
            <Tab
              sx={templateTabStyle}
              label={
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 2)}>
                  Library templates
                </Typography>
              }
              {...a11yProps(2)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          {data && data.length > 0 && (
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={{ xs: 1, sm: 2, md: 3 }}>
              {data.map((rec, index) => (
                <Paper key={index}>{getTemplateCard(rec, index)}</Paper>
              ))}
            </Masonry>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          {data && data.filter((x) => [1, 3].includes(x.templateType)).length > 0 && (
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={{ xs: 1, sm: 2, md: 3 }}>
              {data
                .filter((x) => [1, 3].includes(x.templateType))
                .map((rec, index) => (
                  <Paper key={index}>{getTemplateCard(rec, index)}</Paper>
                ))}
            </Masonry>
          )}
        </TabPanel>
        <TabPanel value={value} index={2}>
          {data && data.filter((x) => [1, 2].includes(x.templateType)).length > 0 && (
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={{ xs: 1, sm: 2, md: 3 }}>
              {data
                .filter((x) => [1, 2].includes(x.templateType))
                .map((rec, index) => (
                  <Paper key={index}>{getTemplateCard(rec, index)}</Paper>
                ))}
            </Masonry>
          )}
        </TabPanel>
      </Stack>
    </div>
  );
}

export default WizardSelectTemplatePage;
