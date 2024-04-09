/* #region header */
/**************************************************************************************************
//
//  Description: Navigation Bar component
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
//    002   17.08.23 Sean Flook       IMANN-156 Modified to allow the login dialog to be displayed again after user has clicked cancel.
//    003   07.09.23 Sean Flook                 Changed function name and cleaned the code.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//    007   09.04.24 Sean Flook                 Changed to use auditname for new security.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import UserContext from "./../context/userContext";
import { PostUserLoginUrl, GetWhoAmIUrl } from "../configuration/ADSConfig";
import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";
import { adsBlueA, adsWhite, adsLightBlue } from "../utils/ADSColours";
import { FormRowStyle, FormInputStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

LoginDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

function LoginDialog({ isOpen, title, message }) {
  const theme = useTheme();

  const userContext = useContext(UserContext);

  const [apiUrl, setApiUrl] = useState(null);

  const [showDialog, setShowDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  /**
   * Event to handle changing the username.
   *
   * @param {object} event The event object.
   */
  const handleUsernameChangeEvent = (event) => {
    setUsername(event.target.value);
  };

  /**
   * Event to handle changing the password.
   *
   * @param {object} event The event object.
   */
  const handlePasswordChangeEvent = (event) => {
    setPassword(event.target.value);
  };

  /**
   * Event to handle showing the password.
   */
  const handleShowPasswordClick = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Event to handle when the mouse is clicked on the password.
   *
   * @param {object} event The event object.
   */
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  /**
   * Method to handle when the login button is clicked.
   */
  const handleLoginClick = async () => {
    const loginDetails = {
      auditName: username,
      password: password,
    };

    if (apiUrl) {
      const loginRes = await fetch(`${apiUrl.url}`, {
        cache: "no-cache",
        headers: apiUrl.headers,
        crossDomain: true,
        method: apiUrl.type,
        body: JSON.stringify(loginDetails),
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then((result) => {
          return result;
        })
        .catch((error) => {
          switch (error.status) {
            case 400:
              setLoginError("You need to enter a valid username and password.");
              break;

            case 401:
              setLoginError("Unknown username or password.");
              break;

            default:
              setLoginError("An unknown error occurred, please report to support.");
              break;
          }
          setUsername("");
          setPassword("");
          return null;
        });

      if (loginRes) {
        const userUrl = GetWhoAmIUrl(loginRes.token);

        if (userUrl) {
          const userInfo = await fetch(`${userUrl.url}`, {
            headers: userUrl.headers,
            crossDomain: true,
            method: "GET",
          })
            .then((res) => (res.ok ? res : Promise.reject(res)))
            .then((res) => res.json())
            .then(
              (result) => {
                return result;
              },
              (error) => {
                console.error("[ERROR] Get user information", error);
                return null;
              }
            );

          if (userInfo) {
            if (userInfo.active && !userInfo.isDeleted) {
              const loggedInUser = {
                token: loginRes.token,
                ...userInfo,
              };
              userContext.onUserChange(loggedInUser);
            } else {
              userContext.onUserChange(null);
              if (!userInfo.active) setLoginError("You are not an active user on this system.");
              else setLoginError("This user has been deleted.");
              setUsername("");
              setPassword("");
            }
          } else {
            userContext.onUserChange(null);
            setLoginError("Unable to get user information.");
          }
        } else {
          userContext.onUserChange(null);
          setLoginError("Unable to get user information URL.");
        }
      } else {
        userContext.onUserChange(null);
        setLoginError("Unable to login with the supplied credentials.");
        setUsername("");
        setPassword("");
      }
    } else console.error("[ERROR] Security apiUrl is null");
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    // setShowDialog(false);
    userContext.onUserChange(null);
  };

  useEffect(() => {
    if (!apiUrl) {
      const userUrl = PostUserLoginUrl();
      setApiUrl(userUrl);
    }

    setLoginError("");

    return () => {};
  }, [apiUrl]);

  useEffect(() => {
    setShowDialog(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={showDialog} aria-labelledby="user-login-dialog" fullWidth maxWidth="xs">
      <DialogTitle id="user-login-dialog" sx={{ color: adsWhite, backgroundColor: adsBlueA }}>
        {title ? title : "Login"}
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(1) }}>
        {loginError ? (
          <Typography variant="body1" color="error">
            {loginError}
          </Typography>
        ) : (
          <Typography variant="body1">{message}</Typography>
        )}
        <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle()}>
          <Grid item xs={3}>
            <Typography id="ads-text-label-username" variant="body2" color="initial" align="left">
              Username*
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField
              id="ads-text-textfield-username"
              sx={FormInputStyle()}
              fullWidth
              required
              variant="outlined"
              margin="dense"
              size="small"
              value={username}
              onChange={handleUsernameChangeEvent}
              aria-labelledby="ads-text-label-username"
            />
          </Grid>
          <Grid item xs={3}>
            <Typography id="ads-text-label-password" variant="body2" color="initial" align="left">
              Password*
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField
              id="ads-text-textfield-password"
              sx={FormInputStyle()}
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              variant="outlined"
              margin="dense"
              size="small"
              value={password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleShowPasswordClick}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{
                        "&:hover": {
                          color: adsBlueA,
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={handlePasswordChangeEvent}
              aria-labelledby="ads-text-label-password"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), pl: theme.spacing(3) }}>
        <Button
          onClick={handleLoginClick}
          autoFocus
          variant="contained"
          sx={{
            color: adsWhite,
            backgroundColor: adsBlueA,
            "&:hover": {
              backgroundColor: adsLightBlue,
              color: adsWhite,
            },
          }}
          startIcon={<LoginIcon />}
        >
          Login
        </Button>
        <Button
          onClick={handleCancelClick}
          sx={{
            color: adsBlueA,
            "&:hover": {
              backgroundColor: adsLightBlue,
              color: adsWhite,
            },
          }}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LoginDialog;
