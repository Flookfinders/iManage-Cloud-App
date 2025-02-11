//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Entity history list component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Stack to @mui/system and use StringAvatar to display the user initials.
//    004   05.01.24 Sean Flook                 use CSS shortcuts.
//    005   20.06.24 Sean Flook       IMANN-634 Added error trapping.
//    006   04.07.24 Sean Flook       IMANN-705 Use displayName if lastUser is the same as auditName.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useContext, Fragment } from "react";

import UserContext from "./../context/userContext";

import { Typography, Avatar } from "@mui/material";
import { Stack } from "@mui/system";

import { StringAvatar } from "../utils/HelperUtils";

import { useTheme } from "@mui/styles";
import { adsLightGreyA } from "../utils/ADSColours";

const ADSEntityHistoryList = ({ historySummaryData }) => {
  const theme = useTheme();

  const userContext = useContext(UserContext);

  let keySeq = 0;

  /**
   * Method to display the history entry data.
   *
   * @param {object} historyEntry The history entry data
   * @returns {JSX.Element} The history entry display.
   */
  const HistoryEntry = (historyEntry) => {
    return (
      <Stack direction="row" spacing={1} key={keySeq++}>
        <Avatar
          {...StringAvatar(
            historyEntry.auditUser === userContext.currentUser.auditName
              ? userContext.currentUser.displayName
              : historyEntry.auditUser,
            false
          )}
        />
        <Stack spacing={0} key={keySeq++}>
          <Typography variant="subtitle2" sx={{ mt: theme.spacing(0.5) }}>
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
            ml: theme.spacing(1),
            mt: theme.spacing(1),
            mb: theme.spacing(1),
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
    <Stack sx={{ ml: theme.spacing(2), mt: theme.spacing(1) }}>
      {historySummaryData && historySummaryData.map((day) => DayGroup(day))}
    </Stack>
  );
};

export default ADSEntityHistoryList;
