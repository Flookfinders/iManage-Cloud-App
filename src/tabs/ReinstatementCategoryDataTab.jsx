/* #region header */
/**************************************************************************************************
//
//  Description: Reinstatement category data tab
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
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings.
//    006   11.01.24 Sean Flook                 Fix warnings.
//    007   16.01.24 Sean Flook                 Changes required to fix warnings.
//    008   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    009   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    010   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    011   07.02.24 Sean Flook       IMANN-289 Corrected error field name.
//    012   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    013   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
//    014   13.02.24 Sean Flook                 Updated to new colour.
//    015   20.02.24 Joel Benford     IMANN-299 Toolbar changes
//    016   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    017   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    018   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    019   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    020   27.03.24 Sean Flook                 Clear specific location if going back to whole road.
//    021   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    022   26.07.24 Sean Flook       IMANN-856 Correctly handle deleting newly added record.
//    023   20.08.24 Sean Flook       IMANN-941 Corrected field name used for focused field.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "./../context/mapContext";
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { ConvertDate } from "../utils/HelperUtils";
import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { GetLookupLabel, filteredLookup } from "../utils/HelperUtils";
import ObjectComparison, { reinstatementCategoryKeysToIgnore } from "../utils/ObjectComparison";

import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSTextToggleControl from "../components/ADSTextToggleControl";
import ADSInformationControl from "../components/ADSInformationControl";
// import ADSSwitchControl from "../components/ADSSwitchControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import SwaOrgRef from "../data/SwaOrgRef";
import ReinstatementType from "../data/ReinstatementType";

import { Texture } from "@mui/icons-material";

import { adsWhite, adsDarkPurple } from "../utils/ADSColours";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

ReinstatementCategoryDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function ReinstatementCategoryDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, true));
  const [reinstatementTypeLookup, setReinstatementTypeLookup] = useState(filteredLookup(ReinstatementType, true));

  const [reinstatementCategory, setReinstatementCategory] = useState(null);
  const [custodian, setCustodian] = useState(null);
  const [authority, setAuthority] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [state, setState] = useState(null);
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specificLocation, setSpecificLocation] = useState("");

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

  const [reinstatementCategoryError, setReinstatementCategoryError] = useState(null);
  const [custodianError, setCustodianError] = useState(null);
  const [authorityError, setAuthorityError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specifyLocationError, setSpecifyLocationError] = useState(null);

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "asd-information-popper" : undefined;

  /**
   * Method to return the current reinstatement category record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current reinstatement category record.
   */
  function GetCurrentData(field, newValue) {
    return {
      lastUpdated: data.reinstatementCategoryData.lastUpdated,
      lastUser: data.reinstatementCategoryData.lastUser,
      pkId: data.reinstatementCategoryData.pkId,
      changeType:
        field && field === "changeType"
          ? newValue
          : !data.reinstatementCategoryData.pkId || data.reinstatementCategoryData.pkId < 0
          ? "I"
          : "U",
      usrn: data.reinstatementCategoryData.usrn,
      seqNum: data.reinstatementCategoryData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation:
        field && field === "specificLocation"
          ? newValue
          : field && field === "wholeRoad" && newValue
          ? ""
          : specificLocation,
      neverExport: data.reinstatementCategoryData.neverExport,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      lastUpdateDate: data.reinstatementCategoryData.lastUpdateDate,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      isLocal: data.reinstatementCategoryData.isLocal,
      reinstatementCategoryCode: field && field === "reinstatementCategory" ? newValue : reinstatementCategory,
      entryDate: data.reinstatementCategoryData.entryDate,
      custodianCode: field && field === "custodian" ? newValue : custodian,
      reinstatementAuthorityCode: field && field === "authority" ? newValue : authority,
      state: field && field === "state" ? newValue : state,
      wktGeometry: data.reinstatementCategoryData.wktGeometry,
    };
  }

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newReinstatementCategoryData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("reinstatementCategory", newReinstatementCategoryData);
  };

  /**
   * Event to handle when the reinstatement category is changed.
   *
   * @param {number|null} newValue The new reinstatement category.
   */
  const handleReinstatementCategoryChangeEvent = (newValue) => {
    setReinstatementCategory(newValue);
    UpdateSandbox("reinstatementCategory", newValue);
  };

  /**
   * Event to handle when the custodian is changed.
   *
   * @param {number|null} newValue The new custodian.
   */
  const handleCustodianChangeEvent = (newValue) => {
    setCustodian(newValue);
    UpdateSandbox("custodian", newValue);
  };

  /**
   * Event to handle when the authority is changed.
   *
   * @param {number|null} newValue The new authority.
   */
  const handleAuthorityChangeEvent = (newValue) => {
    setAuthority(newValue);
    UpdateSandbox("authority", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number|null} newValue The new state.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    UpdateSandbox("state", newValue);
  };

  /**
   * Event to handle when the whole road flag is changed.
   *
   * @param {boolean} newValue The new whole road flag.
   */
  const handleWholeRoadChangeEvent = (newValue) => {
    if (newValue && !wholeRoad) {
      setShowWholeRoadWarning(true);
    } else {
      setWholeRoad(newValue);
      UpdateSandbox("wholeRoad", newValue);
      if (newValue) {
        mapContext.onEditMapObject(null, null);
        informationContext.onClearInformation();
      } else {
        mapContext.onEditMapObject(52, data && data.reinstatementCategoryData && data.reinstatementCategoryData.pkId);
        informationContext.onDisplayInformation("partRoadASD", "ReinstatementCategoryDataTab");
      }
    }
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecificLocationChangeEvent = (newValue) => {
    setSpecificLocation(newValue);
    UpdateSandbox("specificLocation", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceReinstatementCategory =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.reinstatementCategories.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
            ? "check"
            : "discard"
          : "discard",
        sourceReinstatementCategory,
        sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.reinstatementCategoryData) {
        setReinstatementCategory(data.reinstatementCategoryData.reinstatementCategory);
        setCustodian(data.reinstatementCategoryData.custodianCode);
        setAuthority(data.reinstatementCategoryData.reinstatementAuthorityCode);
        setStartDate(data.reinstatementCategoryData.startDate);
        setEndDate(data.reinstatementCategoryData.endDate);
        setState(data.reinstatementCategoryData.state);
        setWholeRoad(data.reinstatementCategoryData.wholeRoad);
        setSpecificLocation(
          data.reinstatementCategoryData.specificLocation ? data.reinstatementCategoryData.specificLocation : ""
        );
      }
    }
    if (onHomeClick) onHomeClick("discard", data.reinstatementCategoryData, null);
  };

  /**
   * Event to handle when the add reinstatement category button is clicked.
   */
  const handleAddReinstatementCategory = () => {
    if (onAdd) onAdd();
  };

  /**
   * Event to handle when the delete reinstatement category button is clicked.
   */
  const handleDeleteReinstatementCategory = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && pkId) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
  };

  /**
   * Event to handle when the message dialog is closed.
   *
   * @param {string} action The action taken from the message dialog.
   */
  const handleCloseMessageDialog = (action) => {
    if (action === "continue") {
      setWholeRoad(true);
      setSpecificLocation("");
      UpdateSandbox("wholeRoad", true);

      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();
    }

    setShowWholeRoadWarning(false);
  };

  useEffect(() => {
    if (!loading && data && data.reinstatementCategoryData) {
      setReinstatementCategory(data.reinstatementCategoryData.reinstatementCategoryCode);
      setCustodian(data.reinstatementCategoryData.custodianCode);
      setAuthority(data.reinstatementCategoryData.reinstatementAuthorityCode);
      setStartDate(data.reinstatementCategoryData.startDate);
      setEndDate(data.reinstatementCategoryData.endDate);
      setState(data.reinstatementCategoryData.state);
      setWholeRoad(data.reinstatementCategoryData.wholeRoad);
      setSpecificLocation(
        data.reinstatementCategoryData.specificLocation ? data.reinstatementCategoryData.specificLocation : ""
      );

      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, true));
      setReinstatementTypeLookup(filteredLookup(ReinstatementType, true));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "ReinstatementCategoryDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
    ) {
      const sourceReinstatementCategory = sandboxContext.currentSandbox.sourceStreet.reinstatementCategories.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory.pkId
      );

      if (sourceReinstatementCategory) {
        setDataChanged(
          !ObjectComparison(
            sourceReinstatementCategory,
            sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory,
            reinstatementCategoryKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory.pkId < 0)
        setDataChanged(true);
    }
  }, [
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editASD);
  }, [userContext]);

  useEffect(() => {
    if (
      informationContext.informationSource &&
      informationContext.informationSource === "ReinstatementCategoryDataTab"
    ) {
      setInformationAnchorEl(document.getElementById("reinstatement-category-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setReinstatementCategoryError(null);
    setCustodianError(null);
    setAuthorityError(null);
    setStartDateError(null);
    setEndDateError(null);
    setStateError(null);
    setWholeRoadError(null);
    setSpecifyLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "reinstatementcategorycode":
            setReinstatementCategoryError(error.errors);
            break;

          case "custodiancode":
            setCustodianError(error.errors);
            break;

          case "reinstatementauthoritycode":
            setAuthorityError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "enddate":
            setEndDateError(error.errors);
            break;

          case "state":
            setStateError(error.errors);
            break;

          case "wholeroad":
            setWholeRoadError(error.errors);
            break;

          case "specificlocation":
            setSpecifyLocationError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id={"reinstatement-category-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 52 && streetContext.currentRecord.newRecord ? (
              <ADSActionButton
                variant="close"
                tooltipTitle="Close"
                tooltipPlacement="bottom"
                onClick={handleCancelClicked}
              />
            ) : (
              <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            )}
            <Typography
              sx={{
                flexGrow: 1,
                display: "none",
                [theme.breakpoints.up("sm")]: {
                  display: "block",
                },
              }}
              variant="subtitle1"
              noWrap
              align="left"
            >
              |
            </Typography>
            <Avatar
              variant="square"
              sx={{
                height: theme.spacing(2),
                width: theme.spacing(2),
                backgroundColor: adsDarkPurple,
                color: adsWhite,
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            >
              <Texture
                sx={{
                  height: theme.spacing(2),
                  width: theme.spacing(2),
                }}
              />
            </Avatar>
            <Typography
              sx={{
                flexGrow: 1,
                display: "none",
                [theme.breakpoints.up("sm")]: {
                  display: "block",
                },
              }}
              variant="subtitle1"
              noWrap
              align="left"
            >
              {streetContext.currentRecord.type === 52 && streetContext.currentRecord.newRecord
                ? "Add new reinstatement category"
                : `Reinstatement category (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 52 && streetContext.currentRecord.newRecord) && (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <ADSActionButton
                variant="delete"
                disabled={!userCanEdit}
                tooltipTitle="Delete reinstatement category record"
                tooltipPlacement="right"
                onClick={handleDeleteReinstatementCategory}
              />
              <ADSActionButton
                variant="add"
                disabled={!userCanEdit}
                tooltipTitle="Add new reinstatement category record"
                tooltipPlacement="right"
                onClick={handleAddReinstatementCategory}
              />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("ReinstatementCategoryDataTab")}>
        <ADSSelectControl
          label="Reinstatement category"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ReinstatementCategoryCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={reinstatementTypeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={reinstatementCategory}
          errorText={reinstatementCategoryError}
          onChange={handleReinstatementCategoryChangeEvent}
          helperText="A code to indicate the reinstatement category of the street, footpath etc."
        />
        <ADSSelectControl
          label="Custodian"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "CustodianCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={custodian}
          errorText={custodianError}
          onChange={handleCustodianChangeEvent}
          helperText="Code for the organisation providing the data."
        />
        <ADSSelectControl
          label="Authority"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ReinstatementAuthorityCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(true)}
          lookupColour="colour"
          value={authority}
          errorText={authorityError}
          onChange={handleAuthorityChangeEvent}
          helperText="Code for the organisation specifying the reinstatement category of the street."
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "startDate" : false}
          loading={loading}
          value={startDate}
          helperText="The date on which the reinstatement category took effect in the real world."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {state === 2 && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "endDate" : false}
            loading={loading}
            value={endDate}
            helperText="Date on which this reinstatement category ceased to exist in the real world."
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
        <ADSTextToggleControl
          label="State"
          button1Text="Current"
          button2Text="Historic"
          button1Value={1}
          button2Value={2}
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "State" : false}
          loading={loading}
          errorText={stateError}
          helperText="Current state of the reinstatement category record."
          value={state}
          onChange={handleStateChangeEvent}
        />
        <ADSWholeRoadControl
          variant="WholeRoad"
          label="Applied to"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "WholeRoad" : false}
          loading={loading}
          value={wholeRoad}
          helperText="A code to indicate if this category applies to the whole street."
          errorText={wholeRoadError}
          onChange={handleWholeRoadChangeEvent}
        />
        {!wholeRoad && (
          <ADSTextControl
            label="Specify location"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "SpecificLocation" : false}
            loading={loading}
            value={specificLocation}
            maxLength={250}
            minLines={3}
            maxLines={5}
            id="reinstatement_category_specify_location"
            characterSet="GeoPlaceStreet1"
            errorText={specifyLocationError}
            helperText="Description of the section of street covered by this category."
            onChange={handleSpecificLocationChangeEvent}
          />
        )}
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="interested organisation"
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
        <MessageDialog isOpen={showWholeRoadWarning} variant="cancelASDPartRoad" onClose={handleCloseMessageDialog} />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"partRoadASD"} />
      </Popper>
    </Fragment>
  );
}

export default ReinstatementCategoryDataTab;
