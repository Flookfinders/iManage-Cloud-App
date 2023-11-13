/* #region header */
/**************************************************************************************************
//
//  Description: Entity history list component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { /*useContext, useState, useEffect,*/ Fragment } from "react";
import { StringToColour } from "../utils/HelperUtils";
import { Typography, Stack, Chip } from "@mui/material";
import { useTheme } from "@mui/styles";
import { adsWhite, adsLightGreyA } from "../utils/ADSColours";

const ADSEntityHistoryList = ({ historySummaryData }) => {
  const theme = useTheme();
  let keySeq = 0;

  /**
   * Method to display the history entry data.
   *
   * @param {object} historyEntry The history entry data
   * @returns {JSX.Element} The history entry display.
   */
  const HistoryEntry = (historyEntry) => {
    const userColour = StringToColour(historyEntry.auditUser);

    return (
      <Stack direction="row" spacing={1} key={keySeq++}>
        <Chip
          sx={{
            ml: theme.spacing(5),
            mr: theme.spacing(1),
            mt: theme.spacing(0),
            color: adsWhite,
            background: userColour,
          }}
          label={historyEntry.auditUserInitials}
        />
        <Stack spacing={0} key={keySeq++}>
          <Typography variant="subtitle2" sx={{ marginTop: theme.spacing(0.5) }}>
            {historyEntry.entryDescription}
          </Typography>
          <Typography variant="caption">{historyEntry.displayDateTime}</Typography>
          <Typography variant="caption">{historyEntry.auditUser}</Typography>
        </Stack>
      </Stack>
    );
  };

  /**
   * Method to display the day group data.
   *
   * @param {object} dayGroup The day group.
   * @returns {JSON.Element} The day group display.
   */
  const DayGroup = (dayGroup) => {
    return (
      <Fragment key={keySeq++}>
        <Typography
          variant="body2"
          align="center"
          sx={{
            marginLeft: theme.spacing(1),
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            width: "17%",
            backgroundColor: adsLightGreyA,
          }}
        >
          {dayGroup.displayDate}
        </Typography>
        <Stack spacing={2}>{dayGroup.entries.map((entry) => HistoryEntry(entry))}</Stack>
      </Fragment>
    );
  };

  return (
    <Stack sx={{ marginLeft: theme.spacing(2), marginTop: theme.spacing(1) }}>
      {historySummaryData.map((day) => DayGroup(day))}
    </Stack>
  );
};

export default ADSEntityHistoryList;
