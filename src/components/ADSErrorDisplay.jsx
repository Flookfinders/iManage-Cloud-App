/* #region header */
/**************************************************************************************************
//
//  Description: Error Display component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.04.21 Sean Flook          WI39345 Initial Revision.
//    002   22.04.21 Sean Flook          WI39345 Removed extra label as not required any more.
//    003   18.06.21 Sean Flook          WI39345 Corrected spelling.
//    004   05.04.23 Sean Flook          WI40669 Replace holding character ¬ with a comma.
//    005   06.04.23 Sean Flook          WI40677 Allow errorText to be a string or an array of strings.
//    006   06.10.23 Sean Flook                  Use colour variables.
//    007   24.11.23 Sean Flook                  Moved Stack to @mui/system.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.5.0 changes
//    008   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useEffect } from "react";
import { Typography, Grid2 } from "@mui/material";
import { Stack } from "@mui/system";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { adsRed } from "../utils/ADSColours";

/* #endregion imports */

const ADSErrorDisplay = ({ errorText, id }) => {
  const [errorString, setErrorString] = useState(null);

  useEffect(() => {
    setErrorString(Array.isArray(errorText) ? errorText.join(", ") : errorText);
  }, [errorText]);

  return errorString && errorString.length > 0 ? (
    <React.Fragment>
      <Grid2 size={3} />
      <Grid2 size={9}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={0.25} sx={{ pl: "4px" }}>
          <PriorityHighIcon sx={{ color: adsRed, height: "16px", width: "16px" }} />
          <Stack direction="column">
            {errorString.split(", ").map((rec, idx) => (
              <Typography
                id={`${id}-${idx}`}
                variant="caption"
                align="left"
                key={`error-${id}-${idx}`}
                sx={{ fontWeight: 600, fontSize: "14px", color: adsRed }}
              >
                {`${rec.replace("¬", ",")}`}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Grid2>
    </React.Fragment>
  ) : (
    ""
  );
};

export default ADSErrorDisplay;
