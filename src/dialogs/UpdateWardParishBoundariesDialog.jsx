/* #region header */
/**************************************************************************************************
//
//  Description: Dialog used to step through the spatially update BLPU ward and parish codes.
//
//  Copyright:    © 2024 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   17.05.24 Sean Flook        IMANN-176 Initial version.
//    002   20.05.24 Sean Flook        IMANN-176 Handle when there are no invalid codes found.
//    003   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    004   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.5.0 changes
//    005   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";

import { CircularProgress, Button, Typography, Dialog, DialogActions, DialogContent, Backdrop } from "@mui/material";
import { Stack } from "@mui/system";
import ADSDialogTitle from "../components/ADSDialogTitle";

import { GetIncorrectBoundariesCountUrl, GetUpdateBlpuBoundaryCodesUrl } from "../configuration/ADSConfig";

import CloseIcon from "@mui/icons-material/Close";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import { blueButtonStyle, redButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { adsRed } from "../utils/ADSColours";

UpdateWardParishBoundariesDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(["Ward", "Parish"]),
  onClose: PropTypes.func.isRequired,
};

function UpdateWardParishBoundariesDialog({ isOpen, variant, onClose }) {
  const theme = useTheme();

  const userContext = useContext(UserContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [count, setCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");

  /**
   * Event to handle when the continue button is clicked
   */
  const handleContinueClick = async () => {
    switch (currentStep) {
      case 0:
        setCount(0);
        setProcessing(true);
        const countUrl = GetIncorrectBoundariesCountUrl(userContext.currentUser);

        if (countUrl) {
          if (userContext.currentUser.showMessages)
            console.log("[DEBUG] IncorrectBoundariesCount", `${countUrl.url}/${variant}`);
          await fetch(`${countUrl.url}/${variant}`, {
            headers: countUrl.headers,
            crossDomain: true,
            method: countUrl.type,
          })
            .then((res) => (res.ok ? res : Promise.reject(res)))
            .then((res) => {
              switch (res.status) {
                case 200:
                  res.json().then((count) => {
                    setCount(count);
                    setCurrentStep(1);
                  });
                  break;

                case 400:
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[400 ERROR] Getting" : "Error getting"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription("Validation of the boundary type has failed.");
                  setCurrentStep(-1);
                  break;

                case 401:
                  userContext.onExpired();
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[401 ERROR] Getting" : "Error getting"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription("Your authorisation details are not valid or have expired.");
                  setCurrentStep(-1);
                  break;

                case 500:
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[500 ERROR] Getting" : "Error getting"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription(JSON.stringify(res.json()));
                  setCurrentStep(-1);
                  break;

                default:
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[Unknown ERROR] Getting" : "Error getting"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription(res.toString());
                  setCurrentStep(-1);
                  break;
              }
            })
            .catch((res) => {
              switch (res.status) {
                case 400:
                  setCurrentStep(-1);
                  res.json().then((body) => {
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[400 ERROR] Getting incorrect boundaries count for ${
                          variant === "Ward" ? "wards" : "parishes"
                        }`,
                        body.errors
                      );
                  });
                  break;

                case 401:
                  setCurrentStep(-1);
                  res.json().then((body) => {
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[401 ERROR] Getting incorrect boundaries count for ${
                          variant === "Ward" ? "wards" : "parishes"
                        }`,
                        body
                      );
                  });
                  break;

                case 500:
                  setCurrentStep(-1);
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[500 ERROR] Getting incorrect boundaries count for ${variant === "Ward" ? "wards" : "parishes"}`,
                      res
                    );
                  break;

                default:
                  setCurrentStep(-1);
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[${res.status} ERROR] Getting incorrect boundaries count for ${
                        variant === "Ward" ? "wards" : "parishes"
                      }`,
                      res
                    );
                  break;
              }
            });
        }
        setProcessing(false);
        break;

      case 1:
        setProcessing(true);

        const updateUrl = GetUpdateBlpuBoundaryCodesUrl(userContext.currentUser);

        if (updateUrl) {
          if (userContext.currentUser.showMessages)
            console.log("[DEBUG] UpdateBlpuBoundaryCodes", `${updateUrl.url}/${variant}`);
          await fetch(`${updateUrl.url}/${variant}`, {
            headers: updateUrl.headers,
            crossDomain: true,
            method: updateUrl.type,
          })
            .then((res) => (res.ok ? res : Promise.reject(res)))
            .then((res) => {
              switch (res.status) {
                case 200:
                  setCurrentStep(2);
                  break;

                case 400:
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[400 ERROR] Updating" : "Error updating"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription("Validation of the boundary type has failed.");
                  setCurrentStep(-1);
                  break;

                case 401:
                  userContext.onExpired();
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[401 ERROR] Updating" : "Error updating"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription("Your authorisation details are not valid or have expired.");
                  setCurrentStep(-1);
                  break;

                case 500:
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[500 ERROR] Updating" : "Error updating"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription(JSON.stringify(res.json()));
                  setCurrentStep(-1);
                  break;

                default:
                  setErrorTitle(
                    `${
                      process.env.NODE_ENV === "development" ? "[Unknown ERROR] Updating" : "Error updating"
                    } incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setErrorDescription(res.toString());
                  setCurrentStep(-1);
                  break;
              }
            })
            .catch((res) => {
              switch (res.status) {
                case 400:
                  setCurrentStep(-1);
                  res.json().then((body) => {
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[400 ERROR] Updating incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`,
                        body.errors
                      );
                  });
                  break;

                case 401:
                  setCurrentStep(-1);
                  res.json().then((body) => {
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[401 ERROR] Updating incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`,
                        body
                      );
                  });
                  break;

                case 500:
                  setCurrentStep(-1);
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[500 ERROR] Updating incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`,
                      res
                    );
                  break;

                default:
                  setErrorTitle(
                    `[ERROR] Updating incorrect boundaries for ${variant === "Ward" ? "wards" : "parishes"}`
                  );
                  setCurrentStep(-1);
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[${res.status} ERROR] Updating incorrect boundaries for ${
                        variant === "Ward" ? "wards" : "parishes"
                      }`,
                      res
                    );
                  break;
              }
            });
        }
        setProcessing(false);
        break;

      default:
        break;
    }
  };

  /**
   * Event to handle when the close button is clicked
   */
  const handleCloseClick = () => {
    if (onClose) onClose();
  };

  /**
   * Method to get the title for the dialog.
   *
   * @returns {string} The title of the dialog.
   */
  const getDialogTitle = () => {
    switch (variant) {
      case "Ward":
        return "Spatially update BLPU ward codes";

      case "Parish":
        return "Spatially update BLPU parish codes";

      default:
        return `Unknown variant: ${variant}`;
    }
  };

  /**
   * Method to get the content for the dialog.
   *
   * @returns {JSX.Element} The content of the dialog.
   */
  const getDialogContent = () => {
    switch (currentStep) {
      case -1:
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
            <Typography variant="body2" sx={{ color: adsRed }}>
              {errorTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: adsRed }}>
              {errorDescription}
            </Typography>
          </Stack>
        );

      case 0:
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
            <Typography variant="body2">This operation can take sometime to run.</Typography>
            <Typography variant="body2">Are you sure you want to continue?</Typography>
          </Stack>
        );

      case 1:
        if (count > 0) {
          return (
            <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
              <Typography variant="body2">{`Found ${count} incorrect ${variant.toLowerCase()} codes.`}</Typography>
              <Typography variant="body2">Are you sure you want to continue and update them?</Typography>
            </Stack>
          );
        } else {
          return (
            <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
              <Typography variant="body2">{`No incorrect ${variant.toLowerCase()} codes were found.`}</Typography>
            </Stack>
          );
        }

      case 2:
        return <Typography variant="body2">{`Finished updating the ${variant.toLowerCase()} codes.`}</Typography>;

      default:
        return null;
    }
  };

  /**
   * Method to get the actions for the dialog.
   *
   * @returns {JSX.Element} The actions of the dialog.
   */
  const getDialogActions = () => {
    switch (currentStep) {
      case -1:
        return (
          <Button
            variant="contained"
            onClick={handleCloseClick}
            autoFocus
            sx={redButtonStyle}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        );

      case 0:
        return (
          <>
            <Button
              variant="contained"
              disabled={processing}
              onClick={handleContinueClick}
              sx={blueButtonStyle}
              startIcon={<ArrowRightIcon />}
            >
              Continue
            </Button>
            <Button
              variant="contained"
              onClick={handleCloseClick}
              disabled={processing}
              autoFocus
              sx={whiteButtonStyle}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
          </>
        );

      case 1:
        if (count > 0) {
          return (
            <>
              <Button
                variant="contained"
                disabled={processing}
                onClick={handleContinueClick}
                sx={blueButtonStyle}
                startIcon={<ArrowRightIcon />}
              >
                Continue
              </Button>
              <Button
                variant="contained"
                onClick={handleCloseClick}
                disabled={processing}
                autoFocus
                sx={whiteButtonStyle}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
            </>
          );
        } else {
          return (
            <Button
              variant="contained"
              onClick={handleCloseClick}
              autoFocus
              sx={blueButtonStyle}
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          );
        }

      default:
        return (
          <Button
            variant="contained"
            onClick={handleCloseClick}
            autoFocus
            sx={blueButtonStyle}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        );
    }
  };

  useEffect(() => {
    if (isOpen) {
      // initialise states of variables.
      setCount(0);
      setCurrentStep(0);
      setProcessing(false);
      setErrorTitle("");
      setErrorDescription("");
    }

    setDialogOpen(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={dialogOpen} aria-labelledby="message-dialog" fullWidth maxWidth="sm" onClose={handleCloseClick}>
      <ADSDialogTitle title={getDialogTitle()} closeTooltip="Cancel operation" onClose={handleCloseClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>{getDialogContent()}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(2.25) }}>
        {getDialogActions()}
      </DialogActions>
      {processing && (
        <Backdrop open={processing}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Dialog>
  );
}

export default UpdateWardParishBoundariesDialog;
