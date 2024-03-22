//#region header */
/**************************************************************************************************
//
//  Description: Organisation Tab
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   19.09.23 Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record.
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings.
//    006   11.01.24 Sean Flook                 Fix warnings.
//    007   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    008   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    009   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    010   18.03.24 Sean Flook      STRFRM4_OS Set the nullString parameter for the key.
//    011   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ConvertDate } from "../utils/HelperUtils";
import ObjectComparison, { organisationKeysToIgnore } from "./../utils/ObjectComparison";
import ADSActionButton from "../components/ADSActionButton";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

PropertyOrganisationTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function PropertyOrganisationTab({ data, errors, loading, focusedField, onHomeClick, onDelete }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);

  const [dataChanged, setDataChanged] = useState(false);
  const currentId = useRef(0);

  const [organisation, setOrganisation] = useState("");
  const [legalName, setLegalName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [organisationError, setOrganisationError] = useState(null);
  const [legalNameError, setLegalNameError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newOrganisation = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("organisation", newOrganisation);
  };

  /**
   * Event to handle when the organisation is changed.
   *
   * @param {string|null} newValue The new organisation.
   */
  const handleOrganisationChangeEvent = (newValue) => {
    setOrganisation(newValue);
    UpdateSandbox("organisation", newValue);
  };

  /**
   * Event to handle when the legal name is changed.
   *
   * @param {string|null} newValue The new legal name.
   */
  const handleLegalNameChangeEvent = (newValue) => {
    setLegalName(newValue);
    UpdateSandbox("legalName", newValue);
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
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceOrganisation =
      data.id > 0 && sandboxContext.currentSandbox.sourceProperty
        ? sandboxContext.currentSandbox.sourceProperty.organisations.find((x) => x.pkId === data.id)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentPropertyRecords.organisation
            ? "check"
            : "discard"
          : "discard",
        sourceOrganisation,
        sandboxContext.currentSandbox.currentPropertyRecords.organisation
      );
  };

  /**
   * Event to handle when the user selects to delete the provenance.
   */
  const handleDeleteClick = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentPropertyRecords.organisation);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.organisationData) {
        setOrganisation(data.organisationData.organisation ? data.organisationData.organisation : "");
        setLegalName(data.organisationData.legalName ? data.organisationData.legalName : "");
        setStartDate(data.organisationData.startDate);
        setEndDate(data.organisationData.endDate);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.organisationData, null);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const id = data && data.id ? data.id : -1;

    if (deleteConfirmed && id && id > 0) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(id);
    }
  };

  /**
   * Method to return the current organisation record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|Date|null} newValue The value used to update the given field.
   * @returns {object} The current organisation record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.organisationData.orgKey ? "I" : "U",
      organisation: field && field === "organisation" ? newValue : organisation,
      endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      entryDate: data.organisationData.entryDate,
      pkId: data.organisationData.id,
      lastUpdateDate: data.organisationData.lastUpdateDate,
      legalName: field && field === "legalName" ? newValue : legalName,
      orgKey: data.organisationData.orgKey,
      startDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      uprn: data.organisationData.uprn,
    };
  }

  useEffect(() => {
    if (data && data.organisationData) {
      setOrganisation(data.organisationData.organisation ? data.organisationData.organisation : "");
      setLegalName(data.organisationData.legalName ? data.organisationData.legalName : "");
      setStartDate(data.organisationData.startDate);
      setEndDate(data.organisationData.endDate);
    }
  }, [data]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceProperty &&
      sandboxContext.currentSandbox.currentPropertyRecords.organisation
    ) {
      const sourceOrganisation = sandboxContext.currentSandbox.sourceProperty.organisations.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId
      );

      if (sourceOrganisation) {
        setDataChanged(
          !ObjectComparison(
            sourceOrganisation,
            sandboxContext.currentSandbox.currentPropertyRecords.organisation,
            organisationKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.currentPropertyRecords.organisation, sandboxContext.currentSandbox.sourceProperty]);

  useEffect(() => {
    if (
      data &&
      data.id < 0 &&
      !sandboxContext.currentSandbox.currentPropertyRecords.organisation &&
      currentId.current !== data.id
    ) {
      sandboxContext.onSandboxChange("organisation", data.organisationData);
      currentId.current = data.id;
    }
  }, [data, sandboxContext, sandboxContext.currentSandbox.currentPropertyRecords.organisation]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setOrganisationError(null);
    setLegalNameError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "organisation":
            setOrganisationError(error.errors);
            break;

          case "legalName":
            setLegalNameError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "enddate":
            setEndDateError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.5} justifyContent="flex-start" alignItems="center">
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
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
              {`| Organisation (${data.index + 1} of ${data.totalRecords}): ${organisation ? organisation : ""}`}
            </Typography>
            {errors && errors.length > 0 && <ErrorIcon sx={errorIconStyle} />}
          </Stack>
          <ADSActionButton
            variant="delete"
            disabled={!userCanEdit}
            tooltipTitle="Delete"
            tooltipPlacement="right"
            onClick={handleDeleteClick}
          />
        </Stack>
      </Box>
      <Box sx={dataFormStyle("PropertyOrganisationTab")}>
        <ADSTextControl
          label="Organisation"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Organisation" : false}
          loading={loading}
          value={organisation}
          id="organisation"
          maxLength={60}
          errorText={organisationError}
          helperText="Trading name used by organisation at the property."
          onChange={handleOrganisationChangeEvent}
        />
        <ADSTextControl
          label="Legal name"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "LegalName" : false}
          loading={loading}
          value={legalName}
          id="legal_name"
          maxLength={60}
          errorText={legalNameError}
          helperText="Registered legal name of organisation."
          onChange={handleLegalNameChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date of start of this organisation record."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "EndDate" : false}
          loading={loading}
          value={endDate}
          helperText="Date on which this organisation ceased to occupy the property."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSReadOnlyControl
          label="Organisation key"
          loading={loading}
          value={data.organisationData.orgKey}
          nullString="Key set on save"
        />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="organisation"
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default PropertyOrganisationTab;
