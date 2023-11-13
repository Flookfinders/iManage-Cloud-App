/* #region header */
/**************************************************************************************************
//
//  Description: Task Drawer component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   06.07.21 Sean Flook         WI39??? Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React from "react";
import PropTypes from "prop-types";
import ADSActionButton from "../components/ADSActionButton";
import { Box, Drawer, Typography, Grid } from "@mui/material";
import { adsMidGreyB } from "../utils/ADSColours";
import { drawerWidth } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSTaskDrawer.propTypes = {
  handleDrawerClose: PropTypes.func.isRequired,
};

function ADSTaskDrawer(props) {
  const theme = useTheme();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        anchor: "right",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
        },
      }}
      variant="persistent"
      anchor="right"
      open={props.open}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: theme.spacing(0, 1),
          // necessary for content to be below app bar
          ...theme.mixins.toolbar,
          justifyContent: "flex-start",
        }}
      >
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: adsMidGreyB,
              }}
            >
              Tasks
            </Typography>
          </Grid>
          <Grid item>
            <ADSActionButton
              variant="close"
              tooltipTitle="Close tasks"
              tooltipPlacement="left"
              onClick={props.handleDrawerClose}
            />
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
}

export default ADSTaskDrawer;
