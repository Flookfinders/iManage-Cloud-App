/* #region header */
/**************************************************************************************************
//
//  Description: ESU Data tab
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
//    002   07.09.23 Sean Flook                 Removed unnecessary awaits.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    006   03.01.24 Sean Flook                 For Scottish authorities force Create Street BLPU to true.
//    007   05.01.24 Sean Flook                 Use CSS shortcuts.
//    008   10.01.24 Sean Flook                 Fix warnings.
//    009   25.01.24 Sean Flook                 Changes required after UX review.
//    010   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    011   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    012   10.09.24 Sean Flook       IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Typography, Tooltip, Grid, Card, CardHeader, CardActionArea, CardContent, IconButton } from "@mui/material";
import { Box, Stack } from "@mui/system";

import EditAuthorityDetailsDialog from "../dialogs/EditAuthorityDetailsDialog";

import { GetAuthorityDetailsUrl } from "../configuration/ADSConfig";
import { getAuthorityText, getDisplayLanguage } from "../utils/HelperUtils";

import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";

import { adsLightBlue } from "../utils/ADSColours";
import {
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
  getTitleStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function AuthorityDetailsSettingsTab() {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [data, setData] = useState(null);

  const [name, setName] = useState(null);
  const [code, setCode] = useState(null);
  const [msaText, setMsaText] = useState(null);
  const [tabText, setTabText] = useState(null);
  const [minUsrn, setMinUsrn] = useState(null);
  const [maxUsrn, setMaxUsrn] = useState(null);
  const [minUprn, setMinUprn] = useState(null);
  const [maxUprn, setMaxUprn] = useState(null);
  const [minEsu, setMinEsu] = useState(null);
  const [maxEsu, setMaxEsu] = useState(null);
  const [createStreetBlpu, setCreateStreetBlpu] = useState(settingsContext.isScottish);
  const [displayLanguage, setDisplayLanguage] = useState(null);
  const [uppercase, setUppercase] = useState(false);

  const [editAuthority, setEditAuthority] = useState(false);
  const [editData, setEditData] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [hasProperty, setHasProperty] = useState(false);

  /**
   * Event to handle when the mouse enters the card.
   */
  const doMouseEnter = () => {
    setEditAuthority(true);
  };

  /**
   * Event to handle when the mouse leaves the card.
   */
  const doMouseLeave = () => {
    setEditAuthority(false);
  };

  /**
   * Event to handle when the edit button is clicked.
   */
  const doEditAuthority = () => {
    setEditData(data);
    setShowEditDialog(true);
  };

  /**
   * Method to get the check icon if required.
   *
   * @param {boolean} value True if a check is required; otherwise false.
   * @returns {JSX.Element|null} The check icon.
   */
  const getCheck = (value) => {
    if (value) return <DoneIcon fontSize="small" sx={{ color: adsLightBlue }} />;
    else return null;
  };

  /**
   * Event to handle when the authority data has been edited.
   *
   * @param {object} updatedData The updated authority data.
   */
  const handleDoneEditAuthority = async (updatedData) => {
    const newRecord = !settingsContext.authorityDetails;
    const authorityApiUrl = GetAuthorityDetailsUrl(newRecord ? "POST" : "PUT", userContext.currentUser.token);

    if (authorityApiUrl && updatedData) {
      if (userContext.currentUser.showMessages)
        console.log("[DEBUG] handleDoneEditAuthority", authorityApiUrl, JSON.stringify(updatedData));

      await fetch(authorityApiUrl.url, {
        headers: authorityApiUrl.headers,
        crossDomain: true,
        method: authorityApiUrl.type,
        body: JSON.stringify(updatedData),
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then((result) => {
          settingsContext.onAuthorityDetailsChange(result);
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res
                .json()
                .then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[400 ERROR] ${newRecord ? "Creating" : "Updating"} authority details object`,
                      body.errors
                    );
                })
                .catch((err400) => {
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[400 ERROR] ${newRecord ? "Creating" : "Updating"} authority details object.`,
                      err400
                    );
                });
              break;

            case 401:
              userContext.onExpired();
              break;

            case 500:
              if (userContext.currentUser.showMessages)
                console.error(`[500 ERROR] ${newRecord ? "Creating" : "Updating"} authority details`, res);
              break;

            default:
              if (userContext.currentUser.showMessages)
                console.error(
                  `[${res.status} ERROR] handleDoneEditAuthority - ${
                    newRecord ? "Creating" : "Updating"
                  } authority details.`,
                  res
                );
              break;
          }
        });
    }

    setShowEditDialog(false);
  };

  /**
   * Event to handle closing the edit authority dialog.
   */
  const handleCloseEditAuthority = () => {
    setShowEditDialog(false);
  };

  useEffect(() => {
    if (settingsContext.authorityDetails) {
      setData(settingsContext.authorityDetails);
    }
  }, [settingsContext.authorityDetails]);

  useEffect(() => {
    if (data) {
      setName(data.userOrgName);
      setCode(Number(data.dataProviderCode));
      setMsaText(data.msaLicenceNumber);
      setTabText(data.tabText);
      setMinUsrn(data.minUsrn);
      setMaxUsrn(data.maxUsrn);
      setMinUprn(data.minUprn);
      setMaxUprn(data.maxUprn);
      setMinEsu(data.minEsuId);
      setMaxEsu(data.maxEsuId);
      setCreateStreetBlpu(data.streetBlpu);
      setDisplayLanguage(data.displayLanguage);
      setUppercase(data.uppercase);
    }
  }, [data]);

  useEffect(() => {
    setHasProperty(userContext.currentUser && userContext.currentUser.hasProperty);
  }, [userContext]);

  return (
    <Box sx={{ ml: theme.spacing(1), mr: theme.spacing(4.5) }}>
      <Stack direction="column" spacing={0.5}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3) }}>Authority details</Typography>
        <Grid container sx={{ pr: theme.spacing(3.5) }} spacing={3}>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnter}
              onMouseLeave={doMouseLeave}
              sx={settingsCardStyle(editAuthority)}
            >
              <CardHeader
                action={
                  editAuthority && (
                    <Tooltip title="Edit authority settings" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditAuthority} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Authority details"
                titleTypographyProps={{ sx: getTitleStyle(editAuthority) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditAuthority}>
                <CardContent sx={settingsCardContentStyle("authority")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="body2">Name</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {name}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Code</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getAuthorityText(code)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">MSA text</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {msaText}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Tab text</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {tabText}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">USRN range</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${minUsrn ? minUsrn : 0} - ${maxUsrn ? maxUsrn : 0}`}
                      </Typography>
                    </Grid>
                    {hasProperty && (
                      <Grid item xs={3}>
                        <Typography variant="body2">UPRN range</Typography>
                      </Grid>
                    )}
                    {hasProperty && (
                      <Grid item xs={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {`${minUprn ? minUprn : 0} - ${maxUprn ? maxUprn : 0}`}
                        </Typography>
                      </Grid>
                    )}
                    {settingsContext.isScottish && (
                      <Grid item xs={3}>
                        <Typography variant="body2">ESU range</Typography>
                      </Grid>
                    )}
                    {settingsContext.isScottish && (
                      <Grid item xs={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {`${minEsu ? minEsu : 0} - ${maxEsu ? maxEsu : 0}`}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Create street BLPU</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {getCheck(settingsContext.isScottish ? true : createStreetBlpu)}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Display language</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getDisplayLanguage(displayLanguage)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Address fields uppercase</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      {getCheck(uppercase)}
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Stack>
      <EditAuthorityDetailsDialog
        isOpen={showEditDialog}
        data={editData}
        onDone={(updatedData) => handleDoneEditAuthority(updatedData)}
        onClose={handleCloseEditAuthority}
      />
    </Box>
  );
}

export default AuthorityDetailsSettingsTab;
