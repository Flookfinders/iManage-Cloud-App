//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Task Drawer component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   06.07.21 Sean Flook          WI39??? Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    004   05.01.24 Sean Flook                  Use CSS shortcuts.
//    005   11.03.24 Sean Flook            GLB12 Correctly set width.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    006   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports

import React from "react";
import PropTypes from "prop-types";
import ADSActionButton from "../components/ADSActionButton";
import { Drawer, Typography, Grid2 } from "@mui/material";
import { Box } from "@mui/system";
import { adsMidGreyB } from "../utils/ADSColours";
import { drawerWidth } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

//#endregion imports

ADSTaskDrawer.propTypes = {
  handleDrawerClose: PropTypes.func.isRequired,
};

function ADSTaskDrawer(props) {
  const theme = useTheme();

  return (
    <Drawer
      sx={{
        width: `${drawerWidth}px`,
        anchor: "right",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: `${drawerWidth}px`,
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
          p: theme.spacing(0, 1),
          // necessary for content to be below app bar
          ...theme.mixins.toolbar,
          justifyContent: "flex-start",
        }}
      >
        <Grid2 container direction="row" justifyContent="space-between" alignItems="center">
          <Grid2>
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: adsMidGreyB,
              }}
            >
              Tasks
            </Typography>
          </Grid2>
          <Grid2>
            <ADSActionButton
              variant="close"
              tooltipTitle="Close tasks"
              tooltipPlacement="left"
              onClick={props.handleDrawerClose}
            />
          </Grid2>
        </Grid2>
      </Box>
    </Drawer>
  );
}

export default ADSTaskDrawer;
