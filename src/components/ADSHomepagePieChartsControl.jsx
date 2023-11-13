/* #region header */
/**************************************************************************************************
//
//  Description: Doughnut Charts array for Homepage
//
//  Copyright:    © 2023 Idox Software Limited
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.06.23 Joel Benford        WI40689 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { Box, Grid, Card, CardContent } from "@mui/material";
import ADSDoughnutChart from "./ADSDoughnutChart";
import { adsMidGreyA30 } from "../utils/ADSColours";

function ADSHomepagePieChartsControl({ data }) {
  return (
    <Box>
      <Grid container direction="row" spacing={4} sx={{ pt: "8px" }}>
        {data.map((chart, index) => (
          <Grid item align="center">
            <Card
              id={`pie-chart-${index}`}
              variant="outlined"
              raised
              sx={{ height: "18.5vw", width: "16vw", borderStyle: "solid", borderColor: adsMidGreyA30 }}
            >
              <CardContent>
                <ADSDoughnutChart chartData={chart.slices} title={chart.title} label="label" value="value" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ADSHomepagePieChartsControl;
