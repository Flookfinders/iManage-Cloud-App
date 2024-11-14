/* #region header */
/**************************************************************************************************
//
//  Description: Plot to Postal Addresses Page
//
//  Copyright:   © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.1.0 changes
//    001   15.10.24 Sean Flook      IMANN-1012 Initial Revision.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    002   13.11.24 Sean Flook      IMANN-1012 Use the correct validation.
//    003   14.11.24 Sean Flook      IMANN-1012 Only create the gaelic record if required.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";

import { AppBar, Box, Button, Divider, Grid, Stack, Tab, Tabs, Toolbar, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSAddressableObjectControl from "../components/ADSAddressableObjectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import AddLookupDialog from "../dialogs/AddLookupDialog";

import {
  addLookup,
  filteredLookup,
  GetAvatarColour,
  GetAvatarTooltip,
  GetLookupLabel,
  getLookupVariantString,
} from "../utils/HelperUtils";
import {
  addressToTitleCase,
  FilteredLPILogicalStatus,
  GetPropertyMapData,
  GetTempAddress,
} from "../utils/PropertyUtils";
import { ValidatePlotToPostalAddress } from "../utils/WizardValidation";

import OfficialAddress from "./../data/OfficialAddress";
import PostallyAddressable from "./../data/PostallyAddressable";

import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import GetClassificationIcon from "../utils/ADSClassificationIcons";

import {
  dataFormStyle,
  dataFormToolbarHeight,
  offWhiteButtonStyle,
  tabLabelStyle,
  tooltipStyle,
  wizardTabStyle,
} from "../utils/ADSStyles";
import {
  adsBlueA,
  adsLightGreyB,
  adsMidGreyA,
  adsOffWhite,
  adsPaleBlueA,
  adsPaleBlueB,
  adsRed,
  adsRed10,
  adsRed20,
} from "../utils/ADSColours";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";
import ADSErrorDisplay from "../components/ADSErrorDisplay";

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return {
      root: {
        "& .normal-row": {
          "&:hover": {
            backgroundColor: adsPaleBlueA,
            color: adsBlueA,
            cursor: "pointer",
          },
        },
        "& .selected-row": {
          backgroundColor: adsPaleBlueB,
          color: adsBlueA,
          boxShadow: `inset 4px 0px 0px 0px ${adsBlueA}`,
          "&:hover": {
            backgroundColor: adsPaleBlueA,
            color: adsBlueA,
            boxShadow: `inset 4px 0px 0px 0px ${adsBlueA}`,
            cursor: "pointer",
          },
        },
        "& .error-row": {
          backgroundColor: adsRed10,
          color: adsBlueA,
          boxShadow: `inset 4px 0px 0px 0px ${adsRed}`,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
            boxShadow: `inset 4px 0px 0px 0px ${adsRed}`,
            cursor: "pointer",
          },
        },
      },
    };
  },
  { defaultTheme }
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`plot-address-details-tabpanel-${index}`}
      aria-labelledby={`plot-address-details-tab-${index}`}
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
    id: `plot-address-details-tab-${index}`,
    "aria-controls": `plot-address-details-tabpanel-${index}`,
  };
}

PlotToPostalAddressesPage.propTypes = {
  addresses: PropTypes.array.isRequired,
  createGaelic: PropTypes.bool,
  errors: PropTypes.object,
  onDataChanged: PropTypes.func.isRequired,
  onCreateGaelicChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

PlotToPostalAddressesPage.defaultProps = {
  createGaelic: false,
};

function PlotToPostalAddressesPage({
  addresses,
  createGaelic,
  errors,
  onDataChanged,
  onCreateGaelicChanged,
  onErrorChanged,
}) {
  const theme = useTheme();
  const classes = useStyles();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);

  const [logicalStatusLookup, setLogicalStatusLookup] = useState(
    FilteredLPILogicalStatus(settingsContext.isScottish, addresses.newLpiLogicalStatus)
  );

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [selectionModel, setSelectionModel] = useState(-1);
  const [sortModel, setSortModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(-1);
  const [paoStartNumberFocused, setPaoStartNumberFocused] = useState(false);
  const [gridPageSize, setGridPageSize] = useState(10);
  const [currentGridPage, setCurrentGridPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("ENG");
  const [logicalStatus, setLogicalStatus] = useState(null);
  const [saoStartNumber, setSaoStartNumber] = useState("");
  const [saoStartSuffix, setSaoStartSuffix] = useState("");
  const [saoEndNumber, setSaoEndNumber] = useState("");
  const [saoEndSuffix, setSaoEndSuffix] = useState("");
  const [saoText, setSaoText] = useState("");
  const [paoStartNumber, setPaoStartNumber] = useState("");
  const [paoStartSuffix, setPaoStartSuffix] = useState("");
  const [paoEndNumber, setPaoEndNumber] = useState("");
  const [paoEndSuffix, setPaoEndSuffix] = useState("");
  const [paoText, setPaoText] = useState("");
  const [usrn, setUsrn] = useState(null);
  const [postTownRef, setPostTownRef] = useState(null);
  const [subLocalityRef, setSubLocalityRef] = useState(null);
  const [postcodeRef, setPostcodeRef] = useState(null);
  const [level, setLevel] = useState("");
  const [officialFlag, setOfficialFlag] = useState(null);
  const [postalAddress, setPostalAddress] = useState(null);
  const [startDate, setStartDate] = useState(null);

  const [streetLookup, setStreetLookup] = useState([]);
  const [postTownLookup, setPostTownLookup] = useState([]);
  const [subLocalityLookup, setSubLocalityLookup] = useState([]);
  const [postcodeLookup, setPostcodeLookup] = useState([]);

  const [logicalStatusError, setLogicalStatusError] = useState(null);
  const [saoStartNumError, setSaoStartNumError] = useState(null);
  const [saoStartSuffixError, setSaoStartSuffixError] = useState(null);
  const [saoEndNumError, setSaoEndNumError] = useState(null);
  const [saoEndSuffixError, setSaoEndSuffixError] = useState(null);
  const [saoTextError, setSaoTextError] = useState(null);
  const [paoStartNumError, setPaoStartNumError] = useState(null);
  const [paoStartSuffixError, setPaoStartSuffixError] = useState(null);
  const [paoEndNumError, setPaoEndNumError] = useState(null);
  const [paoEndSuffixError, setPaoEndSuffixError] = useState(null);
  const [paoTextError, setPaoTextError] = useState(null);
  const [usrnError, setUsrnError] = useState(null);
  const [postTownRefError, setPostTownRefError] = useState(null);
  const [subLocalityRefError, setSubLocalityRefError] = useState(null);
  const [postcodeRefError, setPostcodeRefError] = useState(null);
  const [levelError, setLevelError] = useState(null);
  const [officialFlagError, setOfficialFlagError] = useState(null);
  const [postalAddressError, setPostalAddressError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [altLangSaoStartNumError, setAltLangSaoStartNumError] = useState(null);
  const [altLangSaoTextError, setAltLangSaoTextError] = useState(null);
  const [altLangPaoStartNumError, setAltLangPaoStartNumError] = useState(null);
  const [altLangPaoTextError, setAltLangPaoTextError] = useState(null);
  const [displaySaoStartNumError, setDisplaySaoStartNumError] = useState(null);
  const [displaySaoTextError, setDisplaySaoTextError] = useState(null);
  const [displayPaoStartNumError, setDisplayPaoStartNumError] = useState(null);
  const [displayPaoTextError, setDisplayPaoTextError] = useState(null);
  const [otherError, setOtherError] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const selectedId = useRef(-1);
  const postalAddresses = useRef([]);
  const haveErrors = useRef(false);

  const currentAddress = useRef(null);
  const addResult = useRef(null);
  const currentVariant = useRef(null);

  const [value, setValue] = useState(0);
  const [createGaelicRecords, setCreateGaelicRecords] = useState(false);

  const columns = [
    {
      field: "id",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "uprn",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalAddress",
      headerName: "Existing LPI",
      headerClassName: "idox-data-grid-header",
      flex: 10,
      sortable: false,
      filterable: false,
      renderCell: GetOriginalAddress,
    },
    {
      field: "rightArrow",
      headerName: "",
      headerClassName: "idox-data-grid-header",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: GetRightArrow,
      renderHeader: GetRightArrow,
    },
    {
      field: "originalLpiLogicalStatus",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalSaoStartSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalSaoEndSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalSaoText",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalPaoStartSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalPaoEndSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalPaoText",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "originalPostcode",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "newAddress",
      headerName: "New LPI",
      headerClassName: "idox-data-grid-header",
      flex: 30,
      sortable: false,
      filterable: false,
      renderCell: GetNewAddress,
    },
    {
      field: "currentIndicator",
      headerName: "",
      headerClassName: "idox-data-grid-header",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: GetCurrentIndicator,
    },
    {
      field: "newLpiLogicalStatus",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "classification",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "language",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "saoStartNumber",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "saoStartSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "saoEndNumber",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "saoEndSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "saoText",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "paoStartNumber",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "paoStartSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "paoEndNumber",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "paoEndSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "paoText",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "usrn",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "postTownRef",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "postcodeRef",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "subLocalityRef",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "officialAddress",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "postallyAddressable",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "startDate",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangLanguage",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangSaoStartSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangSaoEndSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangSaoText",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangPaoStartSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangPaoEndSuffix",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangPaoText",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "altLangPostTownRef",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
    {
      field: "addressUpdated",
      headerClassName: "idox-data-grid-header",
      hide: true,
      sortable: false,
      filterable: false,
    },
  ];

  const initialState = {
    columns: {
      columnVisibilityModel: {
        id: false,
        uprn: false,
        originalLpiLogicalStatus: false,
        originalSaoStartSuffix: false,
        originalSaoEndSuffix: false,
        originalSaoText: false,
        originalPaoStartSuffix: false,
        originalPaoEndSuffix: false,
        originalPaoText: false,
        originalPostcode: false,
        newLpiLogicalStatus: false,
        classification: false,
        language: false,
        saoStartNumber: false,
        saoStartSuffix: false,
        saoEndNumber: false,
        saoEndSuffix: false,
        saoText: false,
        paoStartNumber: false,
        paoStartSuffix: false,
        paoEndNumber: false,
        paoEndSuffix: false,
        paoText: false,
        usrn: false,
        postTownRef: false,
        postcodeRef: false,
        subLocalityRef: false,
        officialAddress: false,
        postallyAddressable: false,
        startDate: false,
        altLangLanguage: false,
        altLangSaoStartSuffix: false,
        altLangSaoEndSuffix: false,
        altLangSaoText: false,
        altLangPaoStartSuffix: false,
        altLangPaoEndSuffix: false,
        altLangPaoText: false,
        altLangPostTownRef: false,
        addressUpdated: false,
      },
    },
  };

  /**
   * Method to get the original address to be displayed in the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the original address.
   */
  function GetOriginalAddress(params) {
    if (params && params.row.originalAddress) {
      return (
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
          <Tooltip
            title={GetAvatarTooltip(
              24,
              params.row.originalLpiLogicalStatus,
              params.row.classification,
              null,
              settingsContext.isScottish
            )}
            arrow
            placement="bottom"
            sx={tooltipStyle}
          >
            {GetClassificationIcon(
              params.row.classification ? params.row.classification : "U",
              GetAvatarColour(params.row.originalLpiLogicalStatus)
            )}
          </Tooltip>
          <Tooltip title={addressToTitleCase(params.row.originalAddress, params.row.originalPostcode)}>
            <Typography variant="subtitle1" noWrap>
              {addressToTitleCase(params.row.originalAddress, params.row.originalPostcode).substring(
                0,
                params.row.originalAddress.indexOf(",")
              )}
            </Typography>
          </Tooltip>
        </Stack>
      );
    }
  }

  /**
   * Method to get the right arrow to be displayed in the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the right arrow.
   */
  function GetRightArrow(params) {
    return <ArrowRightAltIcon />;
  }

  /**
   * Method to get the new address to be displayed in the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the new address.
   */
  function GetNewAddress(params) {
    if (params && params.row) {
      return (
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
          <Tooltip
            title={GetAvatarTooltip(
              24,
              params.row.newLpiLogicalStatus,
              params.row.classification,
              null,
              settingsContext.isScottish
            )}
            arrow
            placement="bottom"
            sx={tooltipStyle}
          >
            {GetClassificationIcon(
              params.row.classification ? params.row.classification : "U",
              GetAvatarColour(params.row.newLpiLogicalStatus)
            )}
          </Tooltip>
          <Tooltip title={addressToTitleCase(params.row.newAddress, null)}>
            <Typography variant="subtitle1" noWrap>
              {addressToTitleCase(params.row.newAddress, null)}
            </Typography>
          </Tooltip>
        </Stack>
      );
    }
  }

  /**
   * Method to get the current indicator to be displayed in the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the current indicator.
   */
  function GetCurrentIndicator(params) {
    if (params && params.row) {
      if (params.id === selectedRow) {
        return <KeyboardArrowRightIcon />;
      }
    }
  }

  /**
   * Method used to update the current address with any changes that have been made.
   */
  const updateCurrentAddress = async () => {
    const oldAddress = currentAddress.current;

    const tempAddress = await GetTempAddress(
      settingsContext.isScottish
        ? {
            usrn: usrn,
            language: "ENG",
            saoStartNumber: saoStartNumber,
            saoStartSuffix: saoStartSuffix,
            saoEndNumber: saoEndNumber,
            saoEndSuffix: saoEndSuffix,
            saoText: saoText,
            paoStartNumber: paoStartNumber,
            paoStartSuffix: paoStartSuffix,
            paoEndNumber: paoEndNumber,
            paoEndSuffix: paoEndSuffix,
            paoText: paoText,
            postTownRef: postTownRef,
            postcodeRef: postcodeRef,
            subLocalityRef: subLocalityRef,
            postalAddress: postalAddress,
          }
        : {
            usrn: usrn,
            language: "ENG",
            saoStartNumber: saoStartNumber,
            saoStartSuffix: saoStartSuffix,
            saoEndNumber: saoEndNumber,
            saoEndSuffix: saoEndSuffix,
            saoText: saoText,
            paoStartNumber: paoStartNumber,
            paoStartSuffix: paoStartSuffix,
            paoEndNumber: paoEndNumber,
            paoEndSuffix: paoEndSuffix,
            paoText: paoText,
            postTownRef: postTownRef,
            postcodeRef: postcodeRef,
            postalAddress: postalAddress,
          },
      null,
      lookupContext,
      userContext,
      settingsContext.isScottish
    );

    currentAddress.current = {
      id: oldAddress.id,
      uprn: oldAddress.uprn,
      originalAddress: oldAddress.originalAddress,
      originalLpiLogicalStatus: oldAddress.originalLpiLogicalStatus,
      originalSaoStartSuffix: oldAddress.originalSaoStartSuffix,
      originalSaoEndSuffix: oldAddress.originalSaoEndSuffix,
      originalSaoText: oldAddress.originalSaoText,
      originalPaoStartSuffix: oldAddress.originalPaoStartSuffix,
      originalPaoEndSuffix: oldAddress.originalPaoEndSuffix,
      originalPaoText: oldAddress.originalPaoText,
      originalPostcode: oldAddress.originalPostcode,
      newAddress: tempAddress,
      newLpiLogicalStatus: logicalStatus,
      classification: oldAddress.classification,
      language: oldAddress.language,
      saoStartNumber: value === 0 ? saoStartNumber : oldAddress.saoStartNumber,
      saoStartSuffix: value === 0 ? saoStartSuffix : oldAddress.saoStartSuffix,
      saoEndNumber: value === 0 ? saoEndNumber : oldAddress.saoEndNumber,
      saoEndSuffix: value === 0 ? saoEndSuffix : oldAddress.saoEndSuffix,
      saoText: value === 0 ? saoText : oldAddress.saoText,
      paoStartNumber: value === 0 ? paoStartNumber : oldAddress.paoStartNumber,
      paoStartSuffix: value === 0 ? paoStartSuffix : oldAddress.paoStartSuffix,
      paoEndNumber: value === 0 ? paoEndNumber : oldAddress.paoEndNumber,
      paoEndSuffix: value === 0 ? paoEndSuffix : oldAddress.paoEndSuffix,
      paoText: value === 0 ? paoText : oldAddress.paoText,
      usrn: usrn,
      postTownRef: value === 0 ? postTownRef : oldAddress.postTownRef,
      postcodeRef: postcodeRef,
      subLocalityRef: value === 0 ? subLocalityRef : oldAddress.subLocalityRef,
      officialAddress: officialFlag,
      postallyAddressable: postalAddress,
      startDate: startDate,
      altLangLanguage: settingsContext.isWelsh
        ? "CYM"
        : settingsContext.isScottish && createGaelicRecords
        ? "GAE"
        : null,
      altLangSaoStartSuffix:
        value === 1
          ? saoStartSuffix
          : oldAddress.altLangSaoStartSuffix === oldAddress.originalSaoStartSuffix &&
            oldAddress.saoStartSuffix !== saoStartSuffix
          ? saoStartSuffix
          : oldAddress.originalSaoStartSuffix,
      altLangSaoEndSuffix:
        value === 1
          ? saoEndSuffix
          : oldAddress.altLangSaoEndSuffix === oldAddress.originalSaoEndSuffix &&
            oldAddress.saoEndSuffix !== saoEndSuffix
          ? saoEndSuffix
          : oldAddress.altLangSaoEndSuffix,
      altLangSaoText:
        value === 1
          ? saoText
          : oldAddress.altLangSaoText === oldAddress.originalSaoText && oldAddress.saoText !== saoText
          ? saoText
          : oldAddress.altLangSaoText,
      altLangPaoStartSuffix:
        value === 1
          ? paoStartSuffix
          : oldAddress.altLangPaoStartSuffix === oldAddress.originalPaoStartSuffix &&
            oldAddress.paoStartSuffix !== paoStartSuffix
          ? paoStartSuffix
          : oldAddress.altLangPaoStartSuffix,
      altLangPaoEndSuffix:
        value === 1
          ? paoEndSuffix
          : oldAddress.altLangPaoEndSuffix === oldAddress.originalPaoEndSuffix &&
            oldAddress.paoEndSuffix !== paoEndSuffix
          ? paoEndSuffix
          : oldAddress.altLangPaoEndSuffix,
      altLangPaoText:
        value === 1
          ? paoText
          : oldAddress.altLangPaoText === oldAddress.originalPaoText && oldAddress.paoText !== paoText
          ? paoText
          : oldAddress.altLangPaoText,
      altLangPostTownRef: value === 1 ? postTownRef : oldAddress.altLangPostTownRef,
      addressUpdated:
        oldAddress.addressUpdated ||
        oldAddress.saoStartNumber !== saoStartNumber ||
        (value === 0 && oldAddress.saoStartSuffix !== saoStartSuffix) ||
        (value === 1 && oldAddress.altLangSaoStartSuffix !== saoStartSuffix) ||
        oldAddress.saoEndNumber !== saoEndNumber ||
        (value === 0 && oldAddress.saoEndSuffix !== saoEndSuffix) ||
        (value === 1 && oldAddress.altLangSaoEndSuffix !== saoEndSuffix) ||
        (value === 0 && oldAddress.saoText !== saoText) ||
        (value === 1 && oldAddress.altLangSaoText !== saoText) ||
        oldAddress.paoStartNumber !== paoStartNumber ||
        (value === 0 && oldAddress.paoStartSuffix !== paoStartSuffix) ||
        (value === 1 && oldAddress.altLangPaoStartSuffix !== paoStartSuffix) ||
        oldAddress.paoEndNumber !== paoEndNumber ||
        (value === 0 && oldAddress.paoEndSuffix !== paoEndSuffix) ||
        (value === 1 && oldAddress.altLangPaoEndSuffix !== paoEndSuffix) ||
        (value === 0 && oldAddress.paoText !== paoText) ||
        (value === 1 && oldAddress.altLangPaoText !== paoText),
    };

    const validationErrors = ValidatePlotToPostalAddress(
      currentAddress.current,
      lookupContext.currentLookups,
      settingsContext.isScottish,
      settingsContext.isWelsh,
      settingsContext.isWelsh || (settingsContext.isScottish && createGaelicRecords)
    );

    haveErrors.current = validationErrors && validationErrors.length > 0;

    if (validationErrors.length === 0) {
      const updatedAddresses = addresses.map((x) => [currentAddress.current].find((rec) => rec.id === x.id) || x);
      postalAddresses.current = updatedAddresses;
      if (onDataChanged) onDataChanged(updatedAddresses);
    }

    if (onErrorChanged) onErrorChanged(validationErrors);
  };

  /**
   * Method to get the required information for the given address.
   *
   * @param {Number} id The id for the address that we want to edit.
   * @param {Number} tabValue The value for the currently selected language tab, if there is one.
   */
  const getCurrentAddress = async (id, tabValue) => {
    try {
      setLoading(true);

      if (currentAddress.current && (currentAddress.current.id !== id || selectedRow !== id || value !== tabValue)) {
        await updateCurrentAddress();
      }

      if (!haveErrors.current) {
        currentAddress.current = postalAddresses.current.find((x) => x.id === id);

        if (currentAddress.current) {
          if (!currentAddress.current.paoStartNumber && !currentAddress.current.paoText) {
            // User has not created a new address yet so get information from existing one to use as a starting point
            const propertyData = await GetPropertyMapData(currentAddress.current.uprn, userContext);
            if (propertyData) {
              const engLpi = propertyData.lpis.filter((x) => x.language === "ENG");

              const tempAddress = await GetTempAddress(
                settingsContext.isScottish
                  ? {
                      usrn: currentAddress.current.usrn,
                      language: "ENG",
                      saoStartNumber: engLpi[0].saoStartNumber ? engLpi[0].saoStartNumber : null,
                      saoStartSuffix: engLpi[0].saoStartSuffix ? engLpi[0].saoStartSuffix : null,
                      saoEndNumber: engLpi[0].saoEndNumber ? engLpi[0].saoEndNumber : null,
                      saoEndSuffix: engLpi[0].saoEndSuffix ? engLpi[0].saoEndSuffix : null,
                      saoText: engLpi[0].saoText ? engLpi[0].saoText : null,
                      paoStartNumber: engLpi[0].paoStartNumber ? engLpi[0].paoStartNumber : null,
                      paoStartSuffix: engLpi[0].paoStartSuffix ? engLpi[0].paoStartSuffix : null,
                      paoEndNumber: engLpi[0].paoEndNumber ? engLpi[0].paoEndNumber : null,
                      paoEndSuffix: engLpi[0].paoEndSuffix ? engLpi[0].paoEndSuffix : null,
                      paoText: engLpi[0].paoText ? engLpi[0].paoText : null,
                      postTownRef: currentAddress.current.postTownRef,
                      postcodeRef: currentAddress.current.postcodeRef,
                      subLocalityRef: currentAddress.current.subLocalityRef,
                      postalAddress: currentAddress.current.postallyAddressable,
                    }
                  : {
                      usrn: currentAddress.current.usrn,
                      language: "ENG",
                      saoStartNumber: engLpi[0].saoStartNumber ? engLpi[0].saoStartNumber : null,
                      saoStartSuffix: engLpi[0].saoStartSuffix ? engLpi[0].saoStartSuffix : null,
                      saoEndNumber: engLpi[0].saoEndNumber ? engLpi[0].saoEndNumber : null,
                      saoEndSuffix: engLpi[0].saoEndSuffix ? engLpi[0].saoEndSuffix : null,
                      saoText: engLpi[0].saoText ? engLpi[0].saoText : null,
                      paoStartNumber: engLpi[0].paoStartNumber ? engLpi[0].paoStartNumber : null,
                      paoStartSuffix: engLpi[0].paoStartSuffix ? engLpi[0].paoStartSuffix : null,
                      paoEndNumber: engLpi[0].paoEndNumber ? engLpi[0].paoEndNumber : null,
                      paoEndSuffix: engLpi[0].paoEndSuffix ? engLpi[0].paoEndSuffix : null,
                      paoText: engLpi[0].paoText ? engLpi[0].paoText : null,
                      postTownRef: currentAddress.current.postTownRef,
                      postcodeRef: currentAddress.current.postcodeRef,
                      postalAddress: currentAddress.current.postallyAddressable,
                    },
                null,
                lookupContext,
                userContext,
                settingsContext.isScottish
              );

              currentAddress.current = {
                id: id,
                uprn: currentAddress.current.uprn,
                originalAddress: currentAddress.current.originalAddress,
                originalLpiLogicalStatus: currentAddress.current.originalLpiLogicalStatus,
                originalSaoStartSuffix: currentAddress.current.originalSaoStartSuffix,
                originalSaoEndSuffix: currentAddress.current.originalSaoEndSuffix,
                originalSaoText: currentAddress.current.originalSaoText,
                originalPaoStartSuffix: currentAddress.current.originalPaoStartSuffix,
                originalPaoEndSuffix: currentAddress.current.originalPaoEndSuffix,
                originalPaoText: currentAddress.current.originalPaoText,
                originalPostcode: currentAddress.current.originalPostcode,
                newAddress: addressToTitleCase(tempAddress, null),
                newLpiLogicalStatus: currentAddress.current.newLpiLogicalStatus,
                classification: currentAddress.current.classification,
                language: currentAddress.current.language,
                saoStartNumber: engLpi[0].saoStartNumber ? engLpi[0].saoStartNumber : null,
                saoStartSuffix: engLpi[0].saoStartSuffix ? engLpi[0].saoStartSuffix : null,
                saoEndNumber: engLpi[0].saoEndNumber ? engLpi[0].saoEndNumber : null,
                saoEndSuffix: engLpi[0].saoEndSuffix ? engLpi[0].saoEndSuffix : null,
                saoText: engLpi[0].saoText ? engLpi[0].saoText : null,
                paoStartNumber: engLpi[0].paoStartNumber ? engLpi[0].paoStartNumber : null,
                paoStartSuffix: engLpi[0].paoStartSuffix ? engLpi[0].paoStartSuffix : null,
                paoEndNumber: engLpi[0].paoEndNumber ? engLpi[0].paoEndNumber : null,
                paoEndSuffix: engLpi[0].paoEndSuffix ? engLpi[0].paoEndSuffix : null,
                paoText: engLpi[0].paoText ? engLpi[0].paoText : null,
                usrn: currentAddress.current.usrn,
                postTownRef: currentAddress.current.postTownRef,
                postcodeRef: currentAddress.current.postcodeRef,
                subLocalityRef: currentAddress.current.subLocalityRef,
                officialAddress: currentAddress.current.officialAddress,
                postallyAddressable: currentAddress.current.postallyAddressable,
                startDate: currentAddress.current.startDate,
                altLangLanguage: currentAddress.current.altLangLanguage,
                altLangSaoStartSuffix: currentAddress.current.altLangSaoStartSuffix,
                altLangSaoEndSuffix: currentAddress.current.altLangSaoEndSuffix,
                altLangSaoText: currentAddress.current.altLangSaoText,
                altLangPaoStartSuffix: currentAddress.current.altLangPaoStartSuffix,
                altLangPaoEndSuffix: currentAddress.current.altLangPaoEndSuffix,
                altLangPaoText: currentAddress.current.altLangPaoText,
                altLangPostTownRef: currentAddress.current.altLangPostTownRef,
                addressUpdated: false,
              };

              if (settingsContext.isWelsh) {
                const cymLpi = propertyData.lpis.filter((x) => x.language === "CYM");
                currentAddress.current = {
                  id: id,
                  uprn: currentAddress.current.uprn,
                  originalAddress: currentAddress.current.originalAddress,
                  originalLpiLogicalStatus: currentAddress.current.originalLpiLogicalStatus,
                  originalSaoStartSuffix: currentAddress.current.originalSaoStartSuffix,
                  originalSaoEndSuffix: currentAddress.current.originalSaoEndSuffix,
                  originalSaoText: currentAddress.current.originalSaoText,
                  originalPaoStartSuffix: currentAddress.current.originalPaoStartSuffix,
                  originalPaoEndSuffix: currentAddress.current.originalPaoEndSuffix,
                  originalPaoText: currentAddress.current.originalPaoText,
                  originalPostcode: currentAddress.current.originalPostcode,
                  newAddress: currentAddress.current.newAddress,
                  newLpiLogicalStatus: currentAddress.current.newLpiLogicalStatus,
                  classification: currentAddress.current.classification,
                  language: currentAddress.current.language,
                  saoStartNumber: currentAddress.current.saoStartNumber,
                  saoStartSuffix: currentAddress.current.saoStartSuffix,
                  saoEndNumber: currentAddress.current.saoEndNumber,
                  saoEndSuffix: currentAddress.current.saoEndSuffix,
                  saoText: currentAddress.current.saoText,
                  paoStartNumber: currentAddress.current.paoStartNumber,
                  paoStartSuffix: currentAddress.current.paoStartSuffix,
                  paoEndNumber: currentAddress.current.paoEndNumber,
                  paoEndSuffix: currentAddress.current.paoEndSuffix,
                  paoText: currentAddress.current.paoText,
                  usrn: currentAddress.current.usrn,
                  postTownRef: currentAddress.current.postTownRef,
                  postcodeRef: currentAddress.current.postcodeRef,
                  subLocalityRef: currentAddress.current.subLocalityRef,
                  officialAddress: currentAddress.current.officialAddress,
                  postallyAddressable: currentAddress.current.postallyAddressable,
                  startDate: currentAddress.current.startDate,
                  altLangLanguage: currentAddress.current.altLangLanguage,
                  altLangSaoStartSuffix: cymLpi[0].saoStartSuffix ? cymLpi[0].saoStartSuffix : null,
                  altLangSaoEndSuffix: cymLpi[0].saoEndSuffix ? cymLpi[0].saoEndSuffix : null,
                  altLangSaoText: cymLpi[0].saoText ? cymLpi[0].saoText : null,
                  altLangPaoStartSuffix: cymLpi[0].paoStartSuffix ? cymLpi[0].paoStartSuffix : null,
                  altLangPaoEndSuffix: cymLpi[0].paoEndSuffix ? cymLpi[0].paoEndSuffix : null,
                  altLangPaoText: cymLpi[0].paoText ? cymLpi[0].paoText : null,
                  altLangPostTownRef: currentAddress.current.altLangPostTownRef,
                  addressUpdated: false,
                };
              } else if (settingsContext.isScottish && createGaelicRecords) {
                const gaeLpi = propertyData.lpis.filter((x) => x.language === "GAE");
                if (gaeLpi) {
                  currentAddress.current = {
                    id: id,
                    uprn: currentAddress.current.uprn,
                    originalAddress: currentAddress.current.originalAddress,
                    originalLpiLogicalStatus: currentAddress.current.originalLpiLogicalStatus,
                    originalSaoStartSuffix: currentAddress.current.originalSaoStartSuffix,
                    originalSaoEndSuffix: currentAddress.current.originalSaoEndSuffix,
                    originalSaoText: currentAddress.current.originalSaoText,
                    originalPaoStartSuffix: currentAddress.current.originalPaoStartSuffix,
                    originalPaoEndSuffix: currentAddress.current.originalPaoEndSuffix,
                    originalPaoText: currentAddress.current.originalPaoText,
                    originalPostcode: currentAddress.current.originalPostcode,
                    newAddress: currentAddress.current.newAddress,
                    newLpiLogicalStatus: currentAddress.current.newLpiLogicalStatus,
                    classification: currentAddress.current.classification,
                    language: currentAddress.current.language,
                    saoStartNumber: currentAddress.current.saoStartNumber,
                    saoStartSuffix: currentAddress.current.saoStartSuffix,
                    saoEndNumber: currentAddress.current.saoEndNumber,
                    saoEndSuffix: currentAddress.current.saoEndSuffix,
                    saoText: currentAddress.current.saoText,
                    paoStartNumber: currentAddress.current.paoStartNumber,
                    paoStartSuffix: currentAddress.current.paoStartSuffix,
                    paoEndNumber: currentAddress.current.paoEndNumber,
                    paoEndSuffix: currentAddress.current.paoEndSuffix,
                    paoText: currentAddress.current.paoText,
                    usrn: currentAddress.current.usrn,
                    postTownRef: currentAddress.current.postTownRef,
                    postcodeRef: currentAddress.current.postcodeRef,
                    subLocalityRef: currentAddress.current.subLocalityRef,
                    officialAddress: currentAddress.current.officialAddress,
                    postallyAddressable: currentAddress.current.postallyAddressable,
                    startDate: currentAddress.current.startDate,
                    altLangLanguage: currentAddress.current.altLangLanguage,
                    altLangSaoStartSuffix: gaeLpi[0].saoStartSuffix ? gaeLpi[0].saoStartSuffix : null,
                    altLangSaoEndSuffix: gaeLpi[0].saoEndSuffix ? gaeLpi[0].saoEndSuffix : null,
                    altLangSaoText: gaeLpi[0].saoText ? gaeLpi[0].saoText : null,
                    altLangPaoStartSuffix: gaeLpi[0].paoStartSuffix ? gaeLpi[0].paoStartSuffix : null,
                    altLangPaoEndSuffix: gaeLpi[0].paoEndSuffix ? gaeLpi[0].paoEndSuffix : null,
                    altLangPaoText: gaeLpi[0].paoText ? gaeLpi[0].paoText : null,
                    altLangPostTownRef: currentAddress.current.altLangPostTownRef,
                    addressUpdated: false,
                  };
                }
              }

              const updatedAddresses = postalAddresses.current.map(
                (x) => [currentAddress.current].find((rec) => rec.id === x.id) || x
              );
              postalAddresses.current = updatedAddresses;
              if (onDataChanged) onDataChanged(updatedAddresses);
            }
          }

          const useAltLangValues =
            (settingsContext.isWelsh || (settingsContext.isScottish && createGaelicRecords)) && tabValue === 1;

          setLanguage(!useAltLangValues ? currentAddress.current.language : currentAddress.current.altLangLanguage);
          setLogicalStatus(currentAddress.current.newLpiLogicalStatus);
          setSaoStartNumber(currentAddress.current.saoStartNumber);
          setSaoStartSuffix(
            !useAltLangValues ? currentAddress.current.saoStartSuffix : currentAddress.current.altLangSaoStartSuffix
          );
          setSaoEndNumber(currentAddress.current.saoEndNumber);
          setSaoEndSuffix(
            !useAltLangValues ? currentAddress.current.saoEndSuffix : currentAddress.current.altLangSaoEndSuffix
          );
          setSaoText(!useAltLangValues ? currentAddress.current.saoText : currentAddress.current.altLangSaoText);
          setPaoStartNumber(currentAddress.current.paoStartNumber);
          setPaoStartSuffix(
            !useAltLangValues ? currentAddress.current.paoStartSuffix : currentAddress.current.altLangPaoStartSuffix
          );
          setPaoEndNumber(currentAddress.current.paoEndNumber);
          setPaoEndSuffix(
            !useAltLangValues ? currentAddress.current.paoEndSuffix : currentAddress.current.altLangPaoEndSuffix
          );
          setPaoText(!useAltLangValues ? currentAddress.current.paoText : currentAddress.current.altLangPaoText);
          setUsrn(currentAddress.current.usrn);
          setPostTownRef(
            !useAltLangValues ? currentAddress.current.postTownRef : currentAddress.current.altLangPostTownRef
          );
          if (settingsContext.isScottish) setSubLocalityRef(currentAddress.current.subLocalityRef);
          setPostcodeRef(currentAddress.current.postcodeRef);
          if (!settingsContext.isScottish) setLevel(currentAddress.current.level ? currentAddress.current.level : "");
          setOfficialFlag(currentAddress.current.officialAddress);
          setPostalAddress(currentAddress.current.postallyAddressable);
          setStartDate(currentAddress.current.startDate);

          setDisplaySaoStartNumError(
            haveErrors.current ? (useAltLangValues ? altLangSaoStartNumError : saoStartNumError) : null
          );
          setDisplaySaoTextError(haveErrors.current ? (useAltLangValues ? altLangSaoTextError : saoTextError) : null);
          setDisplayPaoStartNumError(
            haveErrors.current ? (useAltLangValues ? altLangPaoStartNumError : paoStartNumError) : null
          );
          setDisplayPaoTextError(haveErrors.current ? (useAltLangValues ? altLangPaoTextError : paoTextError) : null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Method to set the various variables to the new row id.
   *
   * @param {Number} rowId The id of the selected row in the grid
   */
  const updateRowId = (rowId) => {
    setSelectionModel(rowId);
    setSelectedRow(rowId);
    selectedId.current = rowId;
  };

  /**
   * Method to set the various models used by the grid to ensure the correct row is selected and can be seen.
   *
   * @param {Number} rowId The id of the selected row in the grid
   */
  const updateGridModels = (rowId) => {
    updateRowId(rowId);

    if (!currentAddress.current.addressUpdated) {
      setPaoStartNumberFocused(true);
    }

    if (gridPageSize > 0) {
      if (rowId === -1) {
        setPaginationModel({ page: 0, pageSize: gridPageSize });
      } else if (rowId >= gridPageSize || currentGridPage > 0) {
        const rowOnPage = Math.trunc(rowId / gridPageSize);
        if (!isNaN(rowOnPage) && rowOnPage !== currentGridPage) {
          setCurrentGridPage(rowOnPage);
          setPaginationModel({ page: rowOnPage, pageSize: gridPageSize });
        }
      }
    }
  };

  /**
   * Event to handle when a cell is clicked.
   *
   * @param {object} param The parameters passed from the grid.
   * @param {object} event The event object.
   */
  const handleCellClicked = (param, event) => {
    event.stopPropagation();
    if (
      param &&
      param.field !== "__check__" &&
      param.field !== "" &&
      param.field !== "actions" &&
      param.id >= 0 &&
      selectedRow !== param.id
    ) {
      if ((settingsContext.isWelsh || createGaelicRecords) && value === 1) {
        setValue(0);
      }
      getCurrentAddress(param.id, 0).then(() => {
        if (currentAddress.current && !haveErrors.current) {
          updateGridModels(param.id);
        }
      });
    }
  };

  /**
   * Event to handle when the logical status is changed.
   *
   * @param {number|null} newValue The new logical status.
   */
  const handleLogicalStatusChangeEvent = (newValue) => {
    setLogicalStatus(newValue);
  };

  /**
   * Event to handle when the SAO start number is changed.
   *
   * @param {number|null} newValue The new SAO start number.
   */
  const handleSaoStartNumberChangeEvent = (newValue) => {
    setSaoStartNumber(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the SAO start suffix is changed.
   *
   * @param {string|null} newValue The new SAO start suffix.
   */
  const handleSaoStartSuffixChangeEvent = (newValue) => {
    setSaoStartSuffix(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the SAO end number is changed.
   *
   * @param {number|null} newValue The new SAO end number.
   */
  const handleSaoEndNumberChangeEvent = (newValue) => {
    setSaoEndNumber(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the SAO end suffix is changed.
   *
   * @param {string|null} newValue The new SAO end suffix.
   */
  const handleSaoEndSuffixChangeEvent = (newValue) => {
    setSaoEndSuffix(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the SAO text is changed.
   *
   * @param {string|null} newValue The new SAO text.
   */
  const handleSaoTextChangeEvent = (newValue) => {
    setSaoText(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the PAO start number is changed.
   *
   * @param {number|null} newValue The new PAO start number.
   */
  const handlePaoStartNumberChangeEvent = (newValue) => {
    setPaoStartNumber(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the PAO start suffix is changed.
   *
   * @param {string|null} newValue The new PAO start number.
   */
  const handlePaoStartSuffixChangeEvent = (newValue) => {
    setPaoStartSuffix(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the PAO end number is changed.
   *
   * @param {number|null} newValue The new PAO end number.
   */
  const handlePaoEndNumberChangeEvent = (newValue) => {
    setPaoEndNumber(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the PAO end suffix is changed.
   *
   * @param {string|null} newValue The new PAO end suffix.
   */
  const handlePaoEndSuffixChangeEvent = (newValue) => {
    setPaoEndSuffix(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the PAO text is changed.
   *
   * @param {string|null} newValue The new PAO text.
   */
  const handlePaoTextChangeEvent = (newValue) => {
    setPaoText(newValue);
    if (paoStartNumberFocused) setPaoStartNumberFocused(false);
  };

  /**
   * Event to handle when the USRN is changed.
   *
   * @param {number|null} newValue The new USRN.
   */
  const handleUsrnChangeEvent = (newValue) => {
    setUsrn(newValue);
  };

  /**
   * Event to handle when the post town is changed.
   *
   * @param {number|null} newValue The new post town.
   */
  const handlePostTownRefChangeEvent = (newValue) => {
    setPostTownRef(newValue);
  };

  /**
   * Event to handle when a new post town is added.
   */
  const handleAddPostTownEvent = () => {
    setLookupType("postTown");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the sub-locality is changed.
   *
   * @param {number|null} newValue The new sub-locality.
   */
  const handleSubLocalityRefChangeEvent = (newValue) => {
    setSubLocalityRef(newValue);
  };

  /**
   * Event to handle when a new sub-locality is added.
   */
  const handleAddSubLocalityEvent = () => {
    setLookupType("subLocality");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the postcode is changed.
   *
   * @param {number|null} newValue The new postcode.
   */
  const handlePostcodeRefChangeEvent = (newValue) => {
    setPostcodeRef(newValue);
  };

  /**
   * Event to handle when a new postcode is added.
   */
  const handleAddPostcodeEvent = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
  };

  /**
   * Event to handle when the level is changed.
   *
   * @param {number|string|null} newValue The new level.
   */
  const handleLevelChangeEvent = (newValue) => {
    setLevel(newValue);
  };

  /**
   * Event to handle when the official flag is changed.
   *
   * @param {string|null} newValue The new official flag.
   */
  const handleOfficialFlagChangeEvent = (newValue) => {
    setOfficialFlag(newValue);
  };

  /**
   * Event to handle when the postally addressable is changed.
   *
   * @param {string|null} newValue The new postally addressable.
   */
  const handlePostalAddressChangeEvent = (newValue) => {
    setPostalAddress(newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
  };

  /**
   * Method used to add the new lookup.
   *
   * @param {object} data The data returned from the add lookup dialog.
   */
  const handleDoneAddLookup = async (data) => {
    currentVariant.current = getLookupVariantString(data.variant);

    const addResults = await addLookup(
      data,
      settingsContext.authorityCode,
      userContext,
      settingsContext.isWelsh,
      lookupContext.currentLookups
    );

    if (addResults && addResults.result) {
      if (addResults.updatedLookups && addResults.updatedLookups.length > 0)
        lookupContext.onUpdateLookup(data.variant, addResults.updatedLookups);

      switch (data.variant) {
        case "postcode":
          setPostcodeRef(addResults.newLookup.postcodeRef);
          break;

        case "postTown":
          setPostTownRef(addResults.newLookup.postTownRef);
          break;

        case "subLocality":
          setSubLocalityRef(addResults.newLookup.subLocalityRef);
          break;

        default:
          break;
      }

      addResult.current = true;
    } else addResult.current = false;
    setEngError(addResults ? addResults.engError : null);
    setAltLanguageError(addResults ? addResults.altLanguageError : null);

    setShowAddDialog(!addResult.current);
  };

  /**
   * Event to handle when the add lookup dialog is closed.
   */
  const handleCloseAddLookup = () => {
    setShowAddDialog(false);
  };

  /**
   * Method to get the required LPI details.
   *
   * @returns {JSX.Element} The required LPI details.
   */
  const getLpiDetailsForm = () => {
    return (
      <Box
        sx={dataFormStyle(
          `${
            (settingsContext.isScottish && createGaelicRecords) || settingsContext.isWelsh
              ? "AltLangPlotLPIDetails"
              : "PlotLPIDetails"
          }`
        )}
      >
        <ADSSelectControl
          label="LPI logical status"
          isEditable
          isRequired
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={logicalStatusLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          value={logicalStatus}
          errorText={logicalStatusError}
          onChange={handleLogicalStatusChangeEvent}
          helperText="Logical status of this Record."
        />
        <ADSAddressableObjectControl
          displayCharactersLeft
          variant="SAO"
          isEditable
          loading={loading}
          helperText="The secondary addressable object."
          startNumberValue={saoStartNumber}
          startSuffixValue={saoStartSuffix}
          endNumberValue={saoEndNumber}
          endSuffixValue={saoEndSuffix}
          textValue={saoText}
          startNumberErrorText={displaySaoStartNumError}
          startSuffixErrorText={saoStartSuffixError}
          endNumberErrorText={saoEndNumError}
          endSuffixErrorText={saoEndSuffixError}
          textErrorText={displaySaoTextError}
          onStartNumberChange={handleSaoStartNumberChangeEvent}
          onStartSuffixChange={handleSaoStartSuffixChangeEvent}
          onEndNumberChange={handleSaoEndNumberChangeEvent}
          onEndSuffixChange={handleSaoEndSuffixChangeEvent}
          onTextChange={handleSaoTextChangeEvent}
        />
        <ADSAddressableObjectControl
          displayCharactersLeft
          variant="PAO"
          isEditable
          isRequired
          isStartNumberFocused={paoStartNumberFocused}
          loading={loading}
          helperText="The primary addressable object."
          startNumberValue={paoStartNumber}
          startSuffixValue={paoStartSuffix}
          endNumberValue={paoEndNumber}
          endSuffixValue={paoEndSuffix}
          textValue={paoText}
          startNumberErrorText={displayPaoStartNumError}
          startSuffixErrorText={paoStartSuffixError}
          endNumberErrorText={paoEndNumError}
          endSuffixErrorText={paoEndSuffixError}
          textErrorText={displayPaoTextError}
          onStartNumberChange={handlePaoStartNumberChangeEvent}
          onStartSuffixChange={handlePaoStartSuffixChangeEvent}
          onEndNumberChange={handlePaoEndNumberChangeEvent}
          onEndSuffixChange={handlePaoEndSuffixChangeEvent}
          onTextChange={handlePaoTextChangeEvent}
        />
        <ADSSelectControl
          label="Street"
          isEditable
          isRequired
          loading={loading}
          useRounded
          lookupData={streetLookup}
          lookupId="usrn"
          lookupLabel="address"
          value={usrn}
          errorText={usrnError}
          onChange={handleUsrnChangeEvent}
          helperText="Unique Street reference number."
        />
        <ADSSelectControl
          label="Post town"
          isEditable
          loading={loading}
          useRounded
          allowAddLookup
          lookupData={postTownLookup}
          lookupId="postTownRef"
          lookupLabel="postTown"
          value={postTownRef}
          errorText={postTownRefError}
          onChange={handlePostTownRefChangeEvent}
          onAddLookup={handleAddPostTownEvent}
          helperText="Allocated by the Royal Mail to assist in delivery of mail."
        />
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="Sub-locality"
            isEditable
            loading={loading}
            useRounded
            allowAddLookup
            lookupData={subLocalityLookup}
            lookupId="subLocalityRef"
            lookupLabel="subLocality"
            value={subLocalityRef}
            errorText={subLocalityRefError}
            onChange={handleSubLocalityRefChangeEvent}
            onAddLookup={handleAddSubLocalityEvent}
            helperText="Third level of geographic area name. e.g. to record an island name or property group."
          />
        )}
        <ADSSelectControl
          label="Postcode"
          isEditable
          loading={loading}
          useRounded
          doNotSetTitleCase
          allowAddLookup
          lookupData={postcodeLookup}
          lookupId="postcodeRef"
          lookupLabel="postcode"
          value={postcodeRef}
          errorText={postcodeRefError}
          onChange={handlePostcodeRefChangeEvent}
          onAddLookup={handleAddPostcodeEvent}
          helperText="Allocated by the Royal Mail to assist in delivery of mail."
        />
        {!settingsContext.isScottish && (
          <ADSTextControl
            label="Level"
            isEditable
            loading={loading}
            value={level}
            id="lpi_level"
            maxLength={30}
            displayCharactersLeft
            errorText={levelError}
            helperText="Memorandum of the vertical position of the BLPU."
            onChange={handleLevelChangeEvent}
          />
        )}
        <ADSSelectControl
          label="Official address"
          isEditable
          isRequired={settingsContext.isScottish}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={filteredLookup(OfficialAddress, settingsContext.isScottish)}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          value={officialFlag}
          errorText={officialFlagError}
          onChange={handleOfficialFlagChangeEvent}
          helperText="Status of address."
        />
        <ADSSelectControl
          label={`${settingsContext.isScottish ? "Postally addressable" : "Postal address"}`}
          isEditable
          isRequired
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={filteredLookup(PostallyAddressable, settingsContext.isScottish)}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          value={postalAddress}
          errorText={postalAddressError}
          onChange={handlePostalAddressChangeEvent}
          helperText="Flag to show that BLPU receives a delivery from the Royal Mail or other postal delivery service."
        />
        <ADSDateControl
          label="Start date"
          isEditable
          isRequired
          loading={loading}
          value={startDate}
          helperText="Date this Record was created."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {otherError && <ADSErrorDisplay errorText={otherError.errors.join(", ")} id={`${otherError.field}-error`} />}
        <Box sx={{ height: "24px" }} />
      </Box>
    );
  };

  /**
   * Event to handle changing the tab.
   *
   * @param {object} event The event object.
   * @param {number} newValue The index number of the new tab.
   */
  const handleTabChange = (event, newValue) => {
    getCurrentAddress(selectedRow, newValue);
    setValue(newValue);
  };

  /**
   * Event to handle when the First button is clicked.
   */
  const handleFirstClicked = () => {
    if ((settingsContext.isWelsh || createGaelicRecords) && value === 1) {
      setValue(0);
    }
    const newSelectedRow = 0;
    getCurrentAddress(newSelectedRow, 0).then(() => {
      if (currentAddress.current && !haveErrors.current) {
        updateGridModels(newSelectedRow);
      }
    });
  };

  /**
   * Event to handle when the previous button is clicked.
   */
  const handlePreviousClicked = () => {
    if ((settingsContext.isWelsh || createGaelicRecords) && value === 1) {
      setValue(0);
    }
    const newSelectedRow = selectedRow > 0 ? selectedRow - 1 : addresses.length - 1;
    getCurrentAddress(newSelectedRow, 0).then(() => {
      if (currentAddress.current && !haveErrors.current) {
        updateGridModels(newSelectedRow);
      }
    });
  };

  /**
   * Event to handle when the next button is clicked.
   */
  const handleNextClicked = () => {
    if ((settingsContext.isWelsh || createGaelicRecords) && value === 1) {
      setValue(0);
    }
    const newSelectedRow = selectedRow < addresses.length - 1 ? selectedRow + 1 : 0;
    getCurrentAddress(newSelectedRow, 0).then(() => {
      if (currentAddress.current && !haveErrors.current) {
        updateGridModels(newSelectedRow);
      }
    });
  };

  /**
   * Event to handle when the last button is clicked.
   */
  const handleLastClicked = () => {
    if ((settingsContext.isWelsh || createGaelicRecords) && value === 1) {
      setValue(0);
    }
    const newSelectedRow = addresses.length - 1;
    getCurrentAddress(newSelectedRow, 0).then(() => {
      if (currentAddress.current && !haveErrors.current) {
        updateGridModels(newSelectedRow);
      }
    });
  };

  /**
   *
   * @param {Object} model The pagination model for the grid.
   */
  const handlePaginationModelChange = (model) => {
    setGridPageSize(model.pageSize);

    if (!isNaN(model.page)) {
      setCurrentGridPage(model.page);
      setPaginationModel(model);
      updateRowId(-1);
      setPaoStartNumberFocused(false);
    }
  };

  useEffect(() => {
    setStreetLookup(
      lookupContext.currentLookups.streetDescriptors.filter(
        (x) => x.language === (settingsContext.isWelsh ? language : "ENG")
      )
    );
  }, [lookupContext.currentLookups.streetDescriptors, settingsContext.isWelsh, language]);

  useEffect(() => {
    const newLookups = lookupContext.currentLookups.postTowns
      .filter((x) => x.language === (settingsContext.isWelsh ? language : "ENG") && !x.historic)
      .sort(function (a, b) {
        return a.postTown.localeCompare(b.postTown, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    setPostTownLookup(newLookups);
  }, [lookupContext.currentLookups.postTowns, settingsContext.isWelsh, language]);

  useEffect(() => {
    setSubLocalityLookup(
      lookupContext.currentLookups.subLocalities
        .filter((x) => !x.historic)
        .sort(function (a, b) {
          return a.subLocality.localeCompare(b.subLocality, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.subLocalities]);

  useEffect(() => {
    setPostcodeLookup(
      lookupContext.currentLookups.postcodes
        .filter((x) => !x.historic)
        .sort(function (a, b) {
          return a.postcode.localeCompare(b.postcode, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.postcodes]);

  useEffect(() => {
    setSortModel([{ field: "originalAddress", sort: "asc" }]);
  }, []);

  useEffect(() => {
    postalAddresses.current = addresses;
    if (addresses && addresses.length > 0) {
      setLogicalStatusLookup(FilteredLPILogicalStatus(settingsContext.isScottish, addresses[0].newLpiLogicalStatus));

      const updatedAddresses = addresses.filter((x) => x.addressUpdated);

      if (!updatedAddresses || updatedAddresses.length === 0 || !currentAddress.current) {
        currentAddress.current = addresses[0];

        setLanguage(addresses[0].language);
        setLogicalStatus(addresses[0].newLpiLogicalStatus);
        setSaoStartNumber(addresses[0].saoStartNumber);
        setSaoStartSuffix(addresses[0].saoStartSuffix);
        setSaoEndNumber(addresses[0].saoEndNumber);
        setSaoEndSuffix(addresses[0].saoEndSuffix);
        setSaoText(addresses[0].saoText);
        setPaoStartNumber(addresses[0].paoStartNumber);
        setPaoStartSuffix(addresses[0].paoStartSuffix);
        setPaoEndNumber(addresses[0].paoEndNumber);
        setPaoEndSuffix(addresses[0].paoEndSuffix);
        setPaoText(addresses[0].paoText);
        setUsrn(addresses[0].usrn);
        setPostTownRef(addresses[0].postTownRef);
        setSubLocalityRef(addresses[0].subLocalityRef);
        setPostcodeRef(addresses[0].postcodeRef);
        setLevel(addresses[0].level);
        setOfficialFlag(addresses[0].officialAddress);
        setPostalAddress(addresses[0].postallyAddressable);
        setStartDate(addresses[0].startDate);

        if (selectedId.current === -1) {
          updateRowId(0);
        }
        setPaoStartNumberFocused(!addresses[0].addressUpdated);
      }
    }
  }, [addresses, settingsContext.isScottish]);

  useEffect(() => {
    setCreateGaelicRecords(createGaelic);
  }, [createGaelic]);

  useEffect(() => {
    setLogicalStatusError(null);
    setSaoStartNumError(null);
    setSaoStartSuffixError(null);
    setSaoEndNumError(null);
    setSaoEndSuffixError(null);
    setSaoTextError(null);
    setPaoStartNumError(null);
    setPaoStartSuffixError(null);
    setPaoEndNumError(null);
    setPaoEndSuffixError(null);
    setPaoTextError(null);
    setUsrnError(null);
    setPostTownRefError(null);
    setSubLocalityRefError(null);
    setPostcodeRefError(null);
    setLevelError(null);
    setOfficialFlagError(null);
    setPostalAddressError(null);
    setStartDateError(null);
    setAltLangSaoStartNumError(null);
    setAltLangSaoTextError(null);
    setAltLangPaoStartNumError(null);
    setAltLangPaoTextError(null);
    setDisplaySaoStartNumError(null);
    setDisplaySaoTextError(null);
    setDisplayPaoStartNumError(null);
    setDisplayPaoTextError(null);
    setOtherError(null);

    haveErrors.current = errors && errors.length > 0;

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "lpistatus":
            setLogicalStatusError(error.errors);
            break;

          case "saostartnumber":
            setSaoStartNumError(error.errors);
            if (value === 0) setDisplaySaoStartNumError(error.errors);
            break;

          case "saostartsuffix":
            setSaoStartSuffixError(error.errors);
            break;

          case "saoendnumber":
            setSaoEndNumError(error.errors);
            break;

          case "saoendsuffix":
            setSaoEndSuffixError(error.errors);
            break;

          case "saotext":
            setSaoTextError(error.errors);
            if (value === 0) setDisplaySaoTextError(error.errors);
            break;

          case "paostartnumber":
            setPaoStartNumError(error.errors);
            if (value === 0) setDisplayPaoStartNumError(error.errors);
            break;

          case "paostartsuffix":
            setPaoStartSuffixError(error.errors);
            break;

          case "paoendnumber":
            setPaoEndNumError(error.errors);
            break;

          case "paoendsuffix":
            setPaoEndSuffixError(error.errors);
            break;

          case "paotext":
            setPaoTextError(error.errors);
            if (value === 0) setDisplayPaoTextError(error.errors);
            break;

          case "usrn":
            setUsrnError(error.errors);
            break;

          case "posttown":
          case "posttownref":
            setPostTownRefError(error.errors);
            break;

          case "sublocality":
          case "sublocalityref":
            setSubLocalityRefError(error.errors);
            break;

          case "postcode":
          case "postcoderef":
            setPostcodeRefError(error.errors);
            break;

          case "level":
            setLevelError(error.errors);
            break;

          case "officialaddress":
            setOfficialFlagError(error.errors);
            break;

          case "postaladdress":
          case "postallyaddressable":
            setPostalAddressError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "altlangsaostartnumber":
            setAltLangSaoStartNumError(error.errors);
            if (value === 1) setDisplaySaoStartNumError(error.errors);
            break;

          case "altlangsaotext":
            setAltLangSaoTextError(error.errors);
            if (value === 1) setDisplaySaoTextError(error.errors);
            break;

          case "altlangpaostartnumber":
            setAltLangPaoStartNumError(error.errors);
            if (value === 1) setDisplayPaoStartNumError(error.errors);
            break;

          case "altlangpaotext":
            setAltLangPaoTextError(error.errors);
            if (value === 1) setDisplayPaoTextError(error.errors);
            break;

          default:
            setOtherError(error);
            break;
        }
      }
    }
  }, [errors, value]);

  return (
    <>
      <Box id="plot-to-postal-addresses-page" sx={{ ml: "auto", mr: "auto", width: "100%" }}>
        <Stack direction="column" spacing={2} sx={{ mt: theme.spacing(1), width: "100%" }}>
          <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(0) }}>New addresses</Typography>
          <Grid container sx={{ pl: theme.spacing(4), pr: theme.spacing(7) }} spacing={0}>
            <Grid item xs={8}>
              <Box sx={dataFormStyle("PlotToPostalAddressDataGrid")} className={classes.root}>
                {addresses && addresses.length > 0 && (
                  <DataGrid
                    rows={addresses}
                    columns={columns}
                    initialState={initialState}
                    autoPageSize
                    columnHeaderHeight={dataFormToolbarHeight}
                    disableColumnMenu
                    disableColumnSelector
                    disableDensitySelector
                    hideFooterSelectedRowCount
                    editMode="row"
                    pagination
                    paginationModel={paginationModel}
                    rowSelectionModel={selectionModel}
                    sortModel={sortModel}
                    getRowClassName={(params) =>
                      `${
                        params.id === selectedRow ? (haveErrors.current ? "error-row" : "selected-row") : "normal-row"
                      }`
                    }
                    onCellClick={handleCellClicked}
                    onPaginationModelChange={handlePaginationModelChange}
                    onSortModelChange={(model) => setSortModel(model)}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={4}>
              {selectedRow >= 0 && (
                <Box sx={dataFormStyle("PlotLPI")}>
                  <AppBar
                    position="static"
                    color="default"
                    sx={{
                      borderStyle: "none",
                      borderBottom: `2px solid ${adsLightGreyB}`,
                      boxShadow: "none",
                      height: `${dataFormToolbarHeight}px`,
                    }}
                  >
                    {((settingsContext.isScottish && createGaelicRecords) || settingsContext.isWelsh) && (
                      <Tabs
                        value={value}
                        onChange={handleTabChange}
                        TabIndicatorProps={{ style: { background: adsBlueA, height: "3px" } }}
                        aria-label="address-tabs"
                        sx={{ backgroundColor: adsOffWhite, color: adsMidGreyA, height: "50px" }}
                      >
                        <Tab
                          sx={wizardTabStyle}
                          label={
                            <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                              English
                            </Typography>
                          }
                          {...a11yProps(0)}
                        />
                        <Tab
                          sx={wizardTabStyle}
                          label={
                            <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                              {settingsContext.isWelsh ? "Welsh" : "Gaelic"}
                            </Typography>
                          }
                          {...a11yProps(1)}
                        />
                      </Tabs>
                    )}
                  </AppBar>
                  {((settingsContext.isScottish && createGaelicRecords) || settingsContext.isWelsh) && (
                    <>
                      <TabPanel value={value} index={0}>
                        {getLpiDetailsForm()}
                      </TabPanel>
                      <TabPanel value={value} index={1}>
                        {getLpiDetailsForm()}
                      </TabPanel>
                    </>
                  )}
                  {(!settingsContext.isScottish || !createGaelicRecords) &&
                    !settingsContext.isWelsh &&
                    getLpiDetailsForm()}
                  <AppBar
                    position="static"
                    color="default"
                    elevation={0}
                    sx={{
                      top: "auto",
                      bottom: 0,
                      height: 54,
                      backgroundColor: adsOffWhite,
                      borderTop: `1px solid ${adsLightGreyB}`,
                      borderRight: `1px solid ${adsLightGreyB}`,
                      borderBottom: `1px solid ${adsLightGreyB}`,
                    }}
                  >
                    <Toolbar
                      variant="dense"
                      disableGutters
                      sx={{
                        pl: theme.spacing(1),
                        pr: theme.spacing(2),
                        pt: theme.spacing(0),
                        pb: theme.spacing(0),
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        divider={<Divider orientation="vertical" flexItem />}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Button
                          id={`lpi-details-first-button`}
                          sx={offWhiteButtonStyle}
                          variant="text"
                          startIcon={<FirstPageIcon />}
                          onClick={handleFirstClicked}
                        >
                          First
                        </Button>
                        <Button
                          id={`lpi-details-previous-button`}
                          sx={offWhiteButtonStyle}
                          variant="text"
                          startIcon={<KeyboardArrowLeftIcon />}
                          onClick={handlePreviousClicked}
                        >
                          Previous
                        </Button>
                      </Stack>
                      <Box sx={{ flexGrow: 1 }} />
                      <Stack
                        direction="row"
                        spacing={1}
                        divider={<Divider orientation="vertical" flexItem />}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Button
                          id={`lpi-details-next-button`}
                          sx={offWhiteButtonStyle}
                          variant="text"
                          endIcon={<KeyboardArrowRightIcon />}
                          onClick={handleNextClicked}
                        >
                          Next
                        </Button>
                        <Button
                          id={`lpi-details-last-button`}
                          sx={offWhiteButtonStyle}
                          variant="text"
                          endIcon={<LastPageIcon />}
                          onClick={handleLastClicked}
                        >
                          Last
                        </Button>
                      </Stack>
                    </Toolbar>
                  </AppBar>
                </Box>
              )}
            </Grid>
          </Grid>
        </Stack>
      </Box>
      <div>
        <AddLookupDialog
          isOpen={showAddDialog}
          variant={lookupType}
          errorEng={engError}
          errorAltLanguage={altLanguageError}
          onDone={(data) => handleDoneAddLookup(data)}
          onClose={handleCloseAddLookup}
        />
      </div>
    </>
  );
}

export default PlotToPostalAddressesPage;
