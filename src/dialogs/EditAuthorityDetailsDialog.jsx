/* #region header */
/**************************************************************************************************
//
//  Description: Edit authority details dialog
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    004   03.01.24 Sean Flook                 Fixed warning.
//    006   03.01.24 Sean Flook                 For Scottish authorities force Create Street BLPU to true and prevent the user from changing it.
//    007   05.01.24 Sean Flook                 Use CSS shortcuts.
//    008   10.01.24 Sean Flook                 Fix warnings.
//    009   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    010   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    011   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    012   02.10.24 Sean Flook       IMANN-997 Removed display language.
//    013   08.10.24 Sean Flook       IMANN-986 Changes required for updating USRN, UPRN and ESU Id ranges.
//#endregion Version 1.0.1.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Dialog, DialogActions, DialogContent, Grid, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSMinMaxControl from "../components/ADSMinMaxControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import MinMaxDialog from "../dialogs/MinMaxDialog";

import { GetEsuByIdUrl, GetUprnRangeUrl, GetUsrnRangeUrl } from "../configuration/ADSConfig";

import DETRCodes from "../data/DETRCodes";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditAuthorityDetailsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditAuthorityDetailsDialog({ isOpen, data, onDone, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [showDialog, setShowDialog] = useState(false);

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
  const [minMaxError, setMinMaxError] = useState("");
  const [createStreetBlpu, setCreateStreetBlpu] = useState(settingsContext.isScottish);
  const [uppercase, setUppercase] = useState(false);

  const [showMinMaxDialog, setShowMinMaxDialog] = useState(false);
  const [minMaxType, setMinMaxType] = useState("usrn");
  const minValue = useRef(0);
  const maxValue = useRef(0);
  const [maximum, setMaximum] = useState(99999999);

  const [hasProperty, setHasProperty] = useState(false);

  const custodianCodes = DETRCodes.map(function (x) {
    return { id: x.id, text: `${x.id} - ${x.text}` };
  });

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Method to get the updated authority details data.
   *
   * @returns {object} The current authority details data.
   */
  const getUpdatedData = () => {
    return {
      dataProviderCode: code,
      userOrgName: name,
      minEsuId: minEsu,
      maxEsuId: maxEsu,
      minUsrn: minUsrn,
      maxUsrn: maxUsrn,
      minUprn: minUprn,
      maxUprn: maxUprn,
      uppercase: uppercase,
      msaLicenceNumber: msaText,
      streetBlpu: settingsContext.isScottish ? true : createStreetBlpu,
      tabText: tabText,
    };
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onDone) onDone(getUpdatedData());
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the name changes.
   *
   * @param {string} newValue The new name.
   */
  const handleNameChangeEvent = (newValue) => {
    setName(newValue);
  };

  /**
   * Event to handle when the code changes.
   *
   * @param {number} newValue The new code.
   */
  const handleCodeChangeEvent = (newValue) => {
    setCode(newValue);
  };

  /**
   * Event to handle when the MSA text changes.
   *
   * @param {string} newValue The new MSA text.
   */
  const handleMsaTextChangeEvent = (newValue) => {
    setMsaText(newValue);
  };

  /**
   * Event to handle when the tab text changes.
   *
   * @param {string} newValue The new tab text.
   */
  const handleTabTextChangeEvent = (newValue) => {
    setTabText(newValue);
    document.title = newValue;
  };

  /**
   * Event to handle when the minimum and maximum USRN changes.
   */
  const handleMinMaxUsrnChangeEvent = () => {
    setMinMaxType("usrn");
    minValue.current = minUsrn ? minUsrn : 0;
    maxValue.current = maxUsrn ? maxUsrn : 0;
    setMaximum(99999999);
    setShowMinMaxDialog(true);
  };

  /**
   * Event to handle when the minimum and maximum UPRN changes.
   */
  const handleMinMaxUprnChangeEvent = () => {
    setMinMaxType("uprn");
    minValue.current = minUprn ? minUprn : 0;
    maxValue.current = maxUprn ? maxUprn : 0;
    setMaximum(999999999999);
    setShowMinMaxDialog(true);
  };

  /**
   * Event to handle when the minimum and maximum ESU id changes.
   */
  const handleMinMaxEsuChangeEvent = () => {
    setMinMaxType("esu");
    minValue.current = minEsu ? minEsu : Number(`${code}0000000000`);
    maxValue.current = maxEsu ? maxEsu : Number(`${code}0000000000`);
    setMaximum(99999999999999);
    setShowMinMaxDialog(true);
  };

  /**
   * Event to handle when the create street BLPU flag changes.
   *
   * @param {boolean} newValue The new create street BLPU flag.
   */
  const handleCreateStreetBlpuChangeEvent = (newValue) => {
    setCreateStreetBlpu(newValue);
  };

  /**
   * Event to handle when the uppercase flag changes.
   *
   * @param {boolean} newValue The new uppercase flag.
   */
  const handleUppercaseChangeEvent = (newValue) => {
    setUppercase(newValue);
  };

  /**
   * Event to handle when the minimum and maximum values change.
   *
   * @param {object} data The new minimum and maximum values.
   */
  const handleNewMinMax = async (data) => {
    if (data) {
      minValue.current = data.min;
      maxValue.current = data.max;
      let updateRangeUrl = null;
      let fetchUrl = null;
      let endpointName = "Unknown endpoint";

      switch (data.variant) {
        case "usrn":
          endpointName = "UsrnRange";
          if (data.type === "new") {
            setMinUsrn(data.min);
            setMaxUsrn(data.max);
          } else if (data.type === "full") {
            if (data.min < minUsrn) {
              setMinUsrn(data.min);
            }
            if (data.max > maxUsrn) {
              setMaxUsrn(data.max);
            }
          }
          updateRangeUrl = GetUsrnRangeUrl(userContext.currentUser.token, settingsContext.isScottish);
          if (updateRangeUrl) {
            fetchUrl = `${updateRangeUrl.url}?firstUsrn=${data.min}&lastUsrn=${data.max}&authorityRef=${
              settingsContext.authorityCode
            }&fullRange=${data.type === "full" ? true : false}`;
          }
          break;

        case "uprn":
          endpointName = "UprnRange";
          if (data.type === "new") {
            setMinUprn(data.min);
            setMaxUprn(data.max);
          } else if (data.type === "full") {
            if (data.min < minUprn) {
              setMinUprn(data.min);
            }
            if (data.max > maxUprn) {
              setMaxUprn(data.max);
            }
          }
          updateRangeUrl = GetUprnRangeUrl(userContext.currentUser.token, settingsContext.isScottish);
          if (updateRangeUrl) {
            fetchUrl = `${updateRangeUrl.url}?firstUprn=${data.min}&lastUprn=${data.max}&fullRange=${
              data.type === "full" ? true : false
            }`;
          }
          break;

        case "esu":
          endpointName = "EsuIdRange";
          if (data.type === "new") {
            setMinEsu(data.min);
            setMaxEsu(data.max);
          } else if (data.type === "full") {
            if (data.min < minEsu) {
              setMinEsu(data.min);
            }
            if (data.max > maxEsu) {
              setMaxEsu(data.max);
            }
          }
          updateRangeUrl = GetEsuByIdUrl(userContext.currentUser.token);
          if (updateRangeUrl) {
            fetchUrl = `${updateRangeUrl.url}?firstEsuId=${data.min}&lastEsuId=${data.max}&authorityRef=${
              settingsContext.authorityCode
            }&fullRange=${data.type === "full" ? true : false}`;
          }
          break;

        default:
          break;
      }

      if (updateRangeUrl && fetchUrl) {
        const updateResult = await fetch(fetchUrl, {
          headers: updateRangeUrl.headers,
          crossDomain: true,
          method: updateRangeUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => {
            let errorStr = "";
            switch (res.status) {
              case 200:
                return res.text();

              case 400:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[400 ERROR] ${endpointName}: Bad Request.`, body);
                  errorStr = body;
                });
                return errorStr;

              case 401:
                userContext.onExpired();
                return null;

              case 403:
                if (userContext.currentUser.showMessages)
                  console.error(`[403 ERROR] ${endpointName}: You do not have database access.`);
                return "You do not have database access.";

              default:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[${res.status} ERROR] ${endpointName}: Unexpected error.`, body);
                  errorStr = `Unexpected error. ${body}`;
                });
                return errorStr;
            }
          })
          .then(
            (result) => {
              if (userContext.currentUser.showMessages) console.error(`Updating ${endpointName} data`, result);
              return null;
            },
            (error) => {
              let errorStr = "";
              switch (error.status) {
                case 400:
                  error.json().then((body) => {
                    if (userContext.currentUser.showMessages)
                      console.error(`[400 ERROR] ${endpointName}: Bad Request.`, body);
                    errorStr = body;
                  });
                  return errorStr;

                case 401:
                  userContext.onExpired();
                  return null;

                case 403:
                  if (userContext.currentUser.showMessages)
                    console.error(`[403 ERROR] ${endpointName}: You do not have database access.`);
                  return "You do not have database access.";

                case 404:
                  if (userContext.currentUser.showMessages)
                    console.error(`[404 ERROR] ${endpointName}: Endpoint does not exist.`);
                  return `${endpointName} endpoint does not exist.`;

                default:
                  const contentType = error && error.headers ? error.headers.get("content-type") : null;
                  if (contentType && contentType.indexOf("application/json") !== -1) {
                    error.json().then((body) => {
                      if (userContext.currentUser.showMessages)
                        console.error(`[ERROR] Updating ${endpointName} data`, body);
                      return body;
                    });
                  } else if (contentType && contentType.indexOf("text")) {
                    error.text().then((response) => {
                      const responseData = response.replace("[{", "").replace("}]", "").split(',"');

                      let errorTitle = "";
                      let errorDescription = "";

                      for (const errorData of responseData) {
                        if (errorData.includes("errorTitle")) errorTitle = errorData.substr(13).replace('"', "");
                        else if (errorData.includes("errorDescription"))
                          errorDescription = errorData.substr(19).replace('"', "");

                        if (errorTitle && errorTitle.length > 0 && errorDescription && errorDescription.length > 0)
                          break;
                      }

                      return `[${error.status}] ${errorTitle}: ${errorDescription}. Please report this error to support.`;
                    });
                  } else {
                    return `[${error.status} Error] ${error}`;
                  }
                  break;
              }
            }
          );

        setMinMaxError(updateResult);

        if (!updateResult) {
          setShowMinMaxDialog(false);
        }
      }
    }
  };

  /**
   * Event to handle closing the minimum and maximum dialog.
   */
  const handleCloseMinMax = () => {
    setShowMinMaxDialog(false);
  };

  useEffect(() => {
    if (data) {
      setName(data.userOrgName);
      setCode(data.dataProviderCode);
      setMsaText(data.msaLicenceNumber);
      setTabText(data.tabText);
      setMinUsrn(data.minUsrn);
      setMaxUsrn(data.maxUsrn);
      setMinUprn(data.minUprn);
      setMaxUprn(data.maxUprn);
      setMinEsu(data.minEsuId);
      setMaxEsu(data.maxEsuId);
      setCreateStreetBlpu(data.streetBlpu);
      setUppercase(data.uppercase);
    }

    setShowDialog(isOpen);
  }, [data, isOpen]);

  useEffect(() => {
    setHasProperty(userContext.currentUser && userContext.currentUser.hasProperty);
  }, [userContext]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-authority-details-dialog"
        fullWidth
        maxWidth="md"
        onClose={handleDialogClose}
      >
        <ADSDialogTitle title="Edit authority details" closeTooltip="Cancel" onClose={handleCancelClick} />
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          <Grid container justifyContent="flex-start" spacing={0} sx={{ pl: theme.spacing(3.5) }}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <Typography sx={{ fontSize: 24, flexGrow: 1 }}>Authority details</Typography>
                <Box>
                  <ADSTextControl
                    label="Name"
                    isEditable
                    maxLength={510}
                    required
                    value={name}
                    id={"authority_name"}
                    onChange={handleNameChangeEvent}
                  />
                  <ADSSelectControl
                    label="Code"
                    isEditable
                    isRequired
                    useRounded
                    lookupData={custodianCodes}
                    lookupId="id"
                    lookupLabel="text"
                    value={code}
                    onChange={handleCodeChangeEvent}
                  />
                  <ADSTextControl
                    label="MSA text"
                    isEditable
                    maxLength={100}
                    isRequired
                    value={msaText}
                    id={"authority_msa_text"}
                    onChange={handleMsaTextChangeEvent}
                  />
                  <ADSTextControl
                    label="Tab text"
                    isEditable
                    maxLength={40}
                    value={tabText}
                    id={"authority_tab_text"}
                    onChange={handleTabTextChangeEvent}
                  />
                  <ADSMinMaxControl
                    label="USRN range"
                    isEditable
                    isRequired
                    minValue={minUsrn}
                    maxValue={maxUsrn}
                    onChange={handleMinMaxUsrnChangeEvent}
                  />
                  {hasProperty && (
                    <ADSMinMaxControl
                      label="UPRN range"
                      isEditable
                      isRequired
                      minValue={minUprn}
                      maxValue={maxUprn}
                      onChange={handleMinMaxUprnChangeEvent}
                    />
                  )}
                  {settingsContext.isScottish && (
                    <ADSMinMaxControl
                      label="ESU range"
                      isEditable
                      isRequired
                      minValue={minEsu}
                      maxValue={maxEsu}
                      onChange={handleMinMaxEsuChangeEvent}
                    />
                  )}
                  {hasProperty && (
                    <ADSSwitchControl
                      label="Create street BLPU"
                      isEditable={!settingsContext.isScottish}
                      checked={settingsContext.isScottish ? true : createStreetBlpu}
                      trueLabel="Yes"
                      falseLabel="No"
                      helperText="Set this if you want to create a new street BLPU when creating a new street."
                      onChange={handleCreateStreetBlpuChangeEvent}
                    />
                  )}
                  <ADSSwitchControl
                    label="Address fields uppercase"
                    isEditable
                    checked={uppercase}
                    trueLabel="Yes"
                    falseLabel="No"
                    helperText="Set this if you want to force the address text fields to uppercase."
                    onChange={handleUppercaseChangeEvent}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
          <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <MinMaxDialog
        isOpen={showMinMaxDialog}
        variant={minMaxType}
        minValue={minValue.current}
        maxValue={maxValue.current}
        maximum={maximum}
        error={minMaxError}
        onNewMinMax={(data) => handleNewMinMax(data)}
        onClose={handleCloseMinMax}
      />
    </div>
  );
}

export default EditAuthorityDetailsDialog;
