/* #region header */
/**************************************************************************************************
//
//  Description: Edit Cross Reference Dialog
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial version.
//    002   04.04.23 Sean Flook         WI40669 Implemented.
//    003   13.04.23 Sean Flook         WI40681 Added validation of cross references.
//    004   13.04.23 Sean Flook         WI40681 Handle when we do not have any existing errors.
//    005   27.10.23 Sean Flook                 Use new dataFormStyle.
//    006   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    007   08.12.23 Sean Flook                 Migrated DataGrid to v6.
//    008   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    009   18.03.24 Sean Flook      STRFRM3_OS Set the styling for the header row of the data grid.
//    052   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import { Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import ADSActionButton from "../components/ADSActionButton";
import EditCrossReferenceDialog from "../dialogs/EditCrossReferenceDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import { GetCrossRefAvatar, getMonthString } from "../utils/HelperUtils";

import AddIcon from "@mui/icons-material/Add";

import { adsLightGreyC, adsMidGreyA } from "../utils/ADSColours";
import { blueButtonStyle, dataFormStyle, gridRowStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

WizardCrossReferencesPage.propTypes = {
  data: PropTypes.array.isRequired,
  errors: PropTypes.array,
  templateVariant: PropTypes.oneOf(["property", "child", "range", "rangeChildren"]),
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return gridRowStyle;
  },
  { defaultTheme }
);

function WizardCrossReferencesPage({ data, errors, templateVariant, onDataChanged, onErrorChanged }) {
  const theme = useTheme();
  const classes = useStyles();

  const [sortModel, setSortModel] = useState([{ field: "sourceId", sort: "asc" }]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editData, setEditData] = useState(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [deleteType, setDeleteType] = useState(null);

  const deleteCrossRefId = useRef(null);
  const addingCrossRef = useRef(false);

  /**
   * Method to display the action buttons for each row of the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The actions buttons for the row.
   */
  const displayActionButtons = (params) => {
    const onEditClick = (event) => {
      event.stopPropagation();
      handleEditCrossReference(params.row);
    };

    const onDeleteClick = (event) => {
      event.stopPropagation();
      deleteCrossRefId.current = params.id;
      setOpenDeleteConfirmation(true);
    };

    return (
      selectedRow &&
      params.id === selectedRow && (
        <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
          <ADSActionButton
            id={`edit-cross-ref-${params.id}`}
            variant="edit"
            inheritBackground
            tooltipTitle="Edit cross reference"
            tooltipPlacement="bottom"
            onClick={onEditClick}
          />
          <ADSActionButton
            id={`delete-cross-ref-${params.id}`}
            variant="delete"
            inheritBackground
            tooltipTitle="Delete cross reference"
            tooltipPlacement="bottom"
            onClick={onDeleteClick}
          />
        </Stack>
      )
    );
  };

  /**
   * Method to get the start date.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {string} The start date.
   */
  const getStartDate = (params) => {
    if (params) {
      const paramsDate = new Date(params.value);
      return `${paramsDate.getDate()} ${getMonthString(paramsDate.getMonth())} ${String(paramsDate.getFullYear())}`;
    } else return "";
  };

  const columns = [
    { field: "id" },
    {
      field: "sourceId",
      headerClassName: "idox-wizard-cross-ref-data-grid-header",
      headerName: "Source",
      flex: 30,
      renderCell: GetCrossRefAvatar,
    },
    {
      field: "crossReference",
      headerClassName: "idox-wizard-cross-ref-data-grid-header",
      headerName: "Cross reference",
      flex: 25,
    },
    {
      field: "startDate",
      headerClassName: "idox-wizard-cross-ref-data-grid-header",
      headerName: "Start date",
      flex: 10,
      renderCell: getStartDate,
    },
    {
      field: "",
      headerClassName: "idox-wizard-cross-ref-data-grid-header",
      sortable: false,
      headerName: "",
      renderCell: displayActionButtons,
    },
  ];

  /**
   * Event to handle adding a new cross reference.
   */
  const handleAddCrossReference = () => {
    setEditData({
      id: data ? data.length + 1 : 1,
      sourceId: null,
      crossReference: null,
      startDate: new Date(),
      errors: null,
    });
    addingCrossRef.current = true;
    setShowEditDialog(true);
  };

  /**
   * Event to handle when a cross reference record is selected to be edited.
   *
   * @param {object} crossRef The cross reference record to be edited.
   */
  const handleEditCrossReference = (crossRef) => {
    addingCrossRef.current = false;
    const crossRefData = { ...crossRef, errors: errors ? errors.filter((x) => x.index === crossRef.id) : null };
    setEditData(crossRefData);
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    if (deleteConfirmed) {
      const updatedData = data.filter((x) => x.id !== deleteCrossRefId.current);
      if (onDataChanged) onDataChanged(updatedData);
      deleteCrossRefId.current = null;
    }
  };

  /**
   * Event to handle when the mouse enters a row.
   *
   * @param {object} event The event object.
   */
  const handleRowMouseEnter = (event) => {
    event.preventDefault();
    setSelectedRow(Number(event.currentTarget.getAttribute("data-id")));
  };

  /**
   * Event to handle when the mouse leaves a row.
   */
  const handleRowMouseLeave = () => {
    setSelectedRow(null);
  };

  /**
   * Event to handle when a cross reference record has been edited.
   *
   * @param {object} updatedData The updated cross reference record.
   */
  const handleDoneEditCrossReference = (updatedData) => {
    if (updatedData) {
      if (!data || data.length === 0) {
        if (onDataChanged) onDataChanged([updatedData]);
      } else {
        let newData = data.map((x) => x);
        if (addingCrossRef.current) newData.push(updatedData);
        else {
          newData = data.map((x) => [updatedData].find((rec) => rec.id === x.id) || x);
        }
        if (onDataChanged) onDataChanged(newData);
      }

      if (onErrorChanged && errors && errors.length > 0)
        onErrorChanged(errors.filter((x) => x.index !== updatedData.id));
    }
    setShowEditDialog(false);
  };

  /**
   * Event to handle when the edit cross reference dialog is closed.
   */
  const handleCloseEditCrossReference = () => {
    setShowEditDialog(false);
  };

  /**
   * Method to determine if a row is valid or not.
   *
   * @param {number} id The id of the row.
   * @returns {boolean} True if the row is valid; otherwise false.
   */
  const isRowInvalid = (id) => {
    if (errors && errors.length > 0) {
      const rowErrors = errors.filter((x) => x.index === id);
      return rowErrors && rowErrors.length > 0;
    } else return false;
  };

  useEffect(() => {
    if (templateVariant) {
      switch (templateVariant) {
        case "property":
          setDeleteType("wizard app cross ref property");
          break;

        case "range":
          setDeleteType("wizard app cross ref range");
          break;

        case "child":
          setDeleteType("wizard app cross ref child");
          break;

        case "rangeChildren":
          setDeleteType("wizard app cross ref children");
          break;

        default:
          break;
      }
    }
  }, [templateVariant]);

  return (
    <Fragment>
      <Box id="wizard-cross-references-page" sx={{ ml: "auto", mr: "auto", width: "900px" }}>
        <Stack direction="column" spacing={2} alignItems="flex-start" sx={{ mt: theme.spacing(1), width: "100%" }}>
          <Stack direction="row" spacing={4} alignItems="center" justifyContent="flex-start">
            <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(0) }}>Cross references</Typography>
            <Button
              onClick={handleAddCrossReference}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Stack>
          <Box
            sx={{
              ...dataFormStyle("WizardCrossReferencePage"),
              "& .idox-wizard-cross-ref-data-grid-header": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
            }}
            className={classes.root}
          >
            {data && data.length > 0 ? (
              <DataGrid
                rows={data}
                columns={columns}
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                  },
                }}
                autoPageSize
                disableColumnMenu
                disableSelectionOnClick
                pagination
                sortModel={sortModel}
                slotProps={{
                  row: {
                    onMouseEnter: handleRowMouseEnter,
                    onMouseLeave: handleRowMouseLeave,
                  },
                }}
                getRowClassName={(params) => `${isRowInvalid(params.id) ? "invalid-row" : "valid-row"}`}
                onCellClick={(params) => handleEditCrossReference(params.row)}
                onSortModelChange={(model) => setSortModel(model)}
              />
            ) : (
              ""
            )}
          </Box>
        </Stack>
        <ConfirmDeleteDialog
          variant={deleteType}
          recordCount={0}
          open={openDeleteConfirmation}
          associatedRecords={null}
          onClose={handleCloseDeleteConfirmation}
        />
        <EditCrossReferenceDialog
          isOpen={showEditDialog}
          isNew={addingCrossRef.current}
          data={editData}
          onDone={(data) => handleDoneEditCrossReference(data)}
          onClose={handleCloseEditCrossReference}
        />
      </Box>
    </Fragment>
  );
}

export default WizardCrossReferencesPage;
