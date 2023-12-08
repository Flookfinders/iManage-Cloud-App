/* #region header */
/**************************************************************************************************
//
//  Description: Latest Edits control for homepage
//
//  Copyright:    © 2021-23 Idox Software Limited
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.06.23 Joel Benford       WI40689 Initial Revision.
//    002          ? Sean Flook                 Various layout changes
//    003   05.07.23 Joel Benford       WI40762 Add lastUser to latest edits grid
//    004   24.07.23 Sean Flook                 Corrected spelling mistake.
//    005   07.09.23 Sean Flook                 Removed unnecessary code.
//    006   06.10.23 Sean Flook                 Use colour variables and added some error trapping.
//    007   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required and corrected display of user avatar.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and removed a couple of warnings.
//    009   08.12.23 Sean Flook                 Migrated DataGrid to v6.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { React, useContext, useState, useRef } from "react";
import PropTypes from "prop-types";

import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import MapContext from "../context/mapContext";

import { GetStreetMapData, streetToTitleCase } from "../utils/StreetUtils";
import { GetPropertyMapData, addressToTitleCase } from "../utils/PropertyUtils";
import { GetWktCoordinates, FormatDate, StringAvatar } from "../utils/HelperUtils";
import { HasASD } from "../configuration/ADSConfig";

import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import { AppBar, Tabs, Tab, Typography, Avatar, Tooltip } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";

import { adsBlueA, adsWhite } from "../utils/ADSColours";
import { gridRowStyle, tabStyle, tabLabelStyle, tooltipStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`street-tabpanel-${index}`}
      aria-labelledby={`street-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
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
    id: `street-tab-${index}`,
    "aria-controls": `street-tabpanel-${index}`,
  };
}

function ADSHomepageLatestEditsControl({ data }) {
  const defaultTheme = createTheme();
  const useStyles = makeStyles(
    (theme) => {
      return gridRowStyle;
    },
    { defaultTheme }
  );
  const classes = useStyles();

  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);

  const [value, setValue] = useState(1);
  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);

  const historicRec = useRef(null);

  /**
   * Method to format the address to title case.
   *
   * @param {string} address The address to set the case for.
   * @returns {string} The address in title case.
   */
  const casedAddress = (address) => {
    const lastPart = address.split(", ").reverse()[0];
    const regexp = /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/;
    const postcode = regexp.test(lastPart) ? lastPart : "";
    return addressToTitleCase(address, postcode);
  };

  /**
   * Method to get the last users avatar.
   *
   * @param {string} lastUser The name of the last user.
   * @returns {JSX.Element} The avatar for the last user.
   */
  const lastEditAvatar = (lastUser) => {
    return (
      <Tooltip title={lastUser} sx={tooltipStyle}>
        <Avatar {...StringAvatar(lastUser, true)} />
      </Tooltip>
    );
  };

  /**
   * Method to render the contents of the last edit cell in the grid.
   *
   * @param {object} params The parameters object
   * @returns {JSX.Element} The contents of the last edit cell in the grid.
   */
  const renderLastEditCell = (params) => {
    return (
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{FormatDate(params.row.lastUpdated)}</Typography>
        {lastEditAvatar(params.row.lastUser || "Undefined Last User")}
      </Stack>
    );
  };

  const columns = [
    { field: "uprn" },
    { field: "usrn" },
    { field: "displayId", headerName: "Reference", flex: 15 },
    {
      field: "displayText",
      headerName: "Description",
      flex: 70,
      valueGetter: (d) => (d.row.usrn ? streetToTitleCase(d.row.displayText) : casedAddress(d.row.displayText)),
    },
    {
      field: "latestEdit",
      headerName: "Last edited",
      flex: 15,
      renderCell: renderLastEditCell,
      align: "right",
      headerAlign: "right",
    },
  ];

  /**
   * Event to handle when a user changes tabs on the form
   *
   * @param {object} event - the event object.
   * @param {number} newValue - The index of the tab the user wants to switch to.
   */
  const handleTabChange = (event, newValue) => {
    // setValue(newValue);
    // At the moment do not allow the user to change tabs
    setValue(1);
  };

  /**
   * Event to handle editing a street.
   *
   * @param {number} usrn The USRN of the street to be edited.
   * @param {string} description The description for the street to be edited.
   */
  const doEditStreet = async (usrn, description) => {
    // show the street tab
    streetContext.onStreetChange(usrn, description, false);

    const foundStreet = // do we have right bit of map loaded already?
      MapContext.currentLayers &&
      MapContext.currentSearchData.streets &&
      MapContext.currentSearchData.streets.find(({ usrn }) => usrn.toString() === usrn);

    if (foundStreet) {
      //if so tell map to reuse it
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.properties,
        usrn,
        null
      );
    } else {
      //else fetch what we need and pass to map
      const streetData = await GetStreetMapData(usrn, userContext.currentUser.token, settingsContext.isScottish);
      const esus = streetData
        ? streetData.esus.map((rec) => ({
            esuId: rec.esuId,
            geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
          }))
        : undefined;
      const engDescriptor = streetData.streetDescriptors.filter((sd) => sd.language === "ENG")[0];
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
      const searchStreets = [
        {
          usrn: usrn,
          description: description,
          language: "ENG",
          locality: engDescriptor.locality,
          town: engDescriptor.town,
          state: streetData ? streetData.state : undefined,
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
      mapContext.onSearchDataChange(searchStreets, [], usrn, null);
    }
  };

  /**
   * Event to handle editing a property.
   *
   * @param {number} uprn The UPRN of the property to be edited.
   * @param {string} address The address of the property to be edited.
   * @param {string} postcode The postcode of the property to be edited.
   * @param {number} easting The easting of the property to be edited.
   * @param {number} northing The northing of the property to be edited.
   * @param {number} logicalStatus The logical status of the property to be edited.
   * @param {string} classificationCode The classification code of the property to be edited.
   */
  const doEditProperty = (uprn, address, postcode, easting, northing, logicalStatus, classificationCode) => {
    propertyContext.onPropertyChange(uprn, 0, address, address, postcode, null, null, false, null);

    const foundProperty = mapContext.currentSearchData.properties.find((x) => x.uprn === uprn.toString());
    if (foundProperty) {
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.properties,
        null,
        uprn
      );
    } else {
      const searchProperties = [
        {
          uprn: uprn,
          address: address,
          postcode: postcode,
          easting: easting,
          northing: northing,
          logicalStatus: logicalStatus,
          classificationCode: classificationCode ? classificationCode.substring(0, 1) : "U",
        },
      ];
      mapContext.onSearchDataChange([], searchProperties, null, uprn);
    }
    mapContext.onHighlightStreetProperty(null, [uprn.toString()]);
  };

  /**
   * Method called when a property is to be edited.
   *
   * @param {number} uprn The UPRN of the property to be edited.
   */
  const EditProperty = async (uprn) => {
    // fetch data we will need
    const propertyData = await GetPropertyMapData(uprn, userContext.currentUser.token, settingsContext.isScottish);
    const lpi = propertyData.lpis
      .filter((l) => l.language === "ENG")
      .sort((a, b) => a.logicalStatus - b.logicalStatus)[0];
    if (lpi.logicalStatus && lpi.logicalStatus === 8) {
      historicRec.current = {
        uprn: uprn,
        address: lpi.address,
        postcode: lpi.postcode,
        easting: propertyData.xcoordinate,
        northing: propertyData.ycoordinate,
        logicalStatus: lpi.logicalStatus,
        classificationCode: propertyData.blpuClass ? propertyData.blpuClass.substring(0, 1) : "U",
      };
      setOpenHistoricProperty(true);
    } else
      doEditProperty(
        uprn,
        lpi.address,
        lpi.postcode,
        propertyData.xcoordinate,
        propertyData.ycoordinate,
        lpi.logicalStatus,
        propertyData.blpuClass ? propertyData.blpuClass.substring(0, 1) : "U"
      );
  };

  /**
   * Event to handle closing a historic property.
   */
  const handleHistoricPropertyClose = () => {
    setOpenHistoricProperty(false);
    if (historicRec.current) {
      doEditProperty(
        historicRec.current.uprn,
        historicRec.current.address,
        historicRec.current.postcode,
        historicRec.current.easting,
        historicRec.current.northing,
        historicRec.current.logicalStatus,
        historicRec.current.classificationCode
      );
    }
  };

  /**
   * Event to handle when a row is clicked.
   *
   * @param {object} params The parameters object
   * @param {object} e The event object
   * @param {object} details The details object
   */
  const handleRowClick = async (params, e, details) => {
    e.preventDefault();
    if (params.row.usrn) await doEditStreet(params.row.usrn, params.row.displayText);
    else await EditProperty(params.row.uprn);
  };

  return (
    <Box
      id="home-page-tables"
      sx={{
        width: "92vw",
      }}
    >
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { background: adsBlueA, height: "2px" },
          }}
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          selectionFollowsFocus
          aria-label="home-page-tabs"
          sx={{ backgroundColor: adsWhite }}
        >
          {process.env.NODE_ENV === "development" && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                    Edits in progress
                  </Typography>
                </Stack>
              }
              {...a11yProps(0)}
            />
          )}
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                  Last updated
                </Typography>
              </Stack>
            }
            {...a11yProps(1)}
          />
          {process.env.NODE_ENV === "development" && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 2)}>
                    Viewed recently
                  </Typography>
                </Stack>
              }
              {...a11yProps(2)}
            />
          )}
          {process.env.NODE_ENV === "development" && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 3)}>
                    Received recently
                  </Typography>
                </Stack>
              }
              {...a11yProps(3)}
            />
          )}
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Typography variant="body1" sx={{ pt: "4px" }}>
          No edits in progress
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box
          sx={{
            height: "41.1vh",
            mb: "20px",
          }}
          className={classes.root}
        >
          <DataGrid
            getRowId={(row) => row.uprn + "_" + row.usrn}
            sx={{ backgroundColor: adsWhite }}
            rows={data}
            columns={columns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  uprn: false,
                  usrn: false,
                },
              },
            }}
            density="compact"
            editMode="row"
            autoPageSize
            hideFooterSelectedRowCount
            showColumnVerticalBorder={false}
            isRowSelectable={(params) => false}
            onRowClick={handleRowClick}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography variant="body1" sx={{ pt: "4px" }}>
          No records viewed recently
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Typography variant="body1" sx={{ pt: "4px" }}>
          No records received recently
        </Typography>
      </TabPanel>
      <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
    </Box>
  );
}

export default ADSHomepageLatestEditsControl;
