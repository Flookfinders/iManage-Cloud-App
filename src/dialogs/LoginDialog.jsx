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
//    008   23.04.24 Sean Flook       IMANN-366 If we are running on an Edge Chromium browser do not display our show password icon button.
//    009   01.05.24 Sean Flook       IMANN-142 Removed the cancel button.
//    010   10.06.24 Sean Flook       IMANN-509 Changes required for v2 of the security API and the multi-factor authentication.
//    011   18.06.24 Sean Flook       IMANN-601 Display message when authentication code does not match.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import UserContext from "./../context/userContext";
import {
  PostUserLoginUrl,
  GetWhoAmIUrl,
  GetAuthenticateUserUrl,
  GetPasswordValidateUrl,
  GetPasswordResetCodeUrl,
  GetResetMyPasswordUrl,
  UpdateMyPasswordUrl,
  GetResendEmailUrl,
} from "../configuration/ADSConfig";

import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ADSTextControl from "../components/ADSTextControl";

import LoginIcon from "@mui/icons-material/Login";
import LockResetIcon from "@mui/icons-material/LockReset";
import CircleIcon from "@mui/icons-material/Circle";
import CloseIcon from "@mui/icons-material/Close";

import { adsBlueA, adsWhite } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

LoginDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  changePassword: PropTypes.bool,
};

LoginDialog.defaultProps = {
  changePassword: false,
};

function LoginDialog({ isOpen, title, message, changePassword }) {
  const theme = useTheme();

  const userContext = useContext(UserContext);

  const [apiUrl, setApiUrl] = useState(null);
  const [step, setStep] = useState(0);

  const [showDialog, setShowDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authorizeId, setAuthorizeId] = useState("");
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [resetId, setResetId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [loginError, setLoginError] = useState([]);
  const [authenticationError, setAuthenticationError] = useState([]);
  const [newPasswordError, setNewPasswordError] = useState([]);
  const [retypePasswordError, setRetypePasswordError] = useState([]);

  const getUsersInfo = async (token) => {
    const userUrl = GetWhoAmIUrl(token);

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
            token: token,
            ...userInfo,
          };
          userContext.onUserChange(loggedInUser);
        } else {
          userContext.onUserChange(null);
          if (!userInfo.active) setLoginError(["You are not an active user on this system."]);
          else setLoginError(["This user has been deleted."]);
          setUsername("");
          setPassword("");
        }
      } else {
        userContext.onUserChange(null);
        setLoginError(["Unable to get user information."]);
      }
    } else {
      userContext.onUserChange(null);
      setLoginError(["Unable to get user information URL."]);
    }
  };

  /**
   * Method used to check that a password is valid.
   *
   * @param {String} newPassword The password that we want to validate.
   * @returns {Array|null} The array of validation errors for the password, or null if it is a valid password.
   */
  const checkPassword = async (newPassword) => {
    const validateUrl = GetPasswordValidateUrl();
    let validationErrors = [];

    if (validateUrl) {
      const encodedUri = new URL(validateUrl.url);
      encodedUri.searchParams.append("strPassword", newPassword);

      console.log("[DEBUG] Validate password", encodedUri.href);
      const validPassword = await fetch(encodedUri.href, {
        headers: validateUrl.headers,
        crossDomain: true,
        method: "GET",
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          switch (res.status) {
            case 200:
              return true;

            case 400:
              res.json().then((body) => {
                validationErrors = body;
              });
              return false;

            default:
              validationErrors = [`[${res.status} ERROR] ${res.statusText}`];
              return false;
          }
        })
        .then(
          (result) => {
            return result;
          },
          (error) => {
            switch (error.status) {
              case 400:
                error.json().then((body) => {
                  validationErrors = body;
                });
                break;

              default:
                validationErrors = [`[${error.status} ERROR] ${error.statusText}`];
                break;
            }
            return false;
          }
        );

      if (validPassword) {
        return null;
      } else {
        return validationErrors;
      }
    } else return ["Unable to get validate password URL"];
  };

  /**
   * Event to handle changing the username.
   *
   * @param {string} newValue The new username.
   */
  const handleUsernameChangeEvent = (newValue) => {
    setUsername(newValue);
  };

  /**
   * Event to handle changing the password.
   *
   * @param {object} newValue The new password.
   */
  const handlePasswordChangeEvent = (newValue) => {
    setPassword(newValue);
  };

  /**
   * Event to handle changing the authentication code.
   *
   * @param {object} newValue The new authentication code.
   */
  const handleAuthenticationCodeChangeEvent = (newValue) => {
    setAuthenticationCode(newValue);
  };

  /**
   * Event to handle changing the new password.
   *
   * @param {object} newValue The new password.
   */
  const handleNewPasswordChangeEvent = (newValue) => {
    setNewPassword(newValue);
  };

  /**
   * Event to handle changing the retyped password.
   *
   * @param {object} newValue The new retyped password.
   */
  const handleRetypePasswordChangeEvent = (newValue) => {
    setRetypePassword(newValue);
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
              setLoginError(["You need to enter a valid username and password."]);
              break;

            case 401:
              setLoginError(["Unknown username or password."]);
              break;

            default:
              setLoginError(["An unknown error occurred, please report to support."]);
              break;
          }
          setUsername("");
          setPassword("");
          return null;
        });

      if (!!loginRes) {
        if (!!loginRes.authorizeId) {
          setAuthorizeId(loginRes.authorizeId);
          setStep(1);
        } else if (!!loginRes.token) {
          getUsersInfo(loginRes.token);
        }
      } else {
        userContext.onUserChange(null);
        setLoginError(["Unable to login with the supplied credentials."]);
        setUsername("");
        setPassword("");
      }
    } else console.error("[ERROR] Security apiUrl is null");
  };

  /**
   * Method to handle when user has forgotten their password
   */
  const handleForgotPasswordClick = async () => {
    if (!username) {
      setLoginError(["Enter the username you want to reset the password for."]);
    } else {
      const resetCodeUrl = GetPasswordResetCodeUrl();

      if (resetCodeUrl) {
        console.log("[DEBUG] Forgot password", `${resetCodeUrl.url}?audit_name=${username}`);
        await fetch(`${resetCodeUrl.url}?audit_name=${username}`, {
          headers: resetCodeUrl.headers,
          crossDomain: true,
          method: "POST",
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              setResetId(result.authorizeId);
              setStep(2);
            },
            (error) => {
              setLoginError([`[${error.status} ERROR] ${error.statusText}`]);
            }
          );
      }
    }
  };

  /**
   * Method to handle authenticating the user
   */
  const handleAuthenticateClick = async () => {
    setAuthenticationError([]);

    if (!authenticationCode) {
      setAuthenticationError(["Enter your authentication code and try again."]);
    } else {
      const authenticateUrl = GetAuthenticateUserUrl();

      if (authenticateUrl) {
        await fetch(`${authenticateUrl.url}/${authorizeId}/${authenticationCode}`, {
          headers: authenticateUrl.headers,
          crossDomain: true,
          method: "POST",
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              if (!!result && !!result.token) getUsersInfo(result.token);
              else setAuthenticationError(["No user token was returned."]);
            },
            (error) => {
              switch (error.status) {
                case 401:
                  setAuthenticationError(["The authentication code entered does not match"]);
                  break;

                default:
                  setAuthenticationError([`[${error.status} ERROR] ${error.statusText}`]);
                  console.error("[ERROR] Getting user authentication information", error);
                  break;
              }
            }
          );
      } else {
        userContext.onUserChange(null);
        setAuthenticationError(["Unable to get user authentication URL."]);
      }
    }
  };

  /**
   * Method to handle resending the authentication email
   */
  const handleResendEmailClick = async () => {
    const resendEmailUrl = GetResendEmailUrl();

    if (resendEmailUrl) {
      await fetch(`${resendEmailUrl.url}/${authorizeId}`, {
        headers: resendEmailUrl.headers,
        crossDomain: true,
        method: "POST",
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then(
          (result) => {
            if (!result) setAuthenticationError(["Unable to resend the authentication email."]);
          },
          (error) => {
            setAuthenticationError([`[${error.status} ERROR] ${error.statusText}`]);
            console.error("[ERROR] Unable to resend authentication email.", error);
          }
        );
    } else {
      setAuthenticationError(["Unable to get resend email URL."]);
    }
  };

  /**
   * Method to handle when user resets their password
   */
  const handleResetPasswordClick = async () => {
    setNewPasswordError([]);
    setRetypePasswordError([]);

    if (!newPassword) {
      setNewPasswordError(["Enter a new password and try again."]);
    } else if (!retypePassword) {
      setRetypePasswordError(["Retype your new password and try again."]);
    } else if (newPassword !== retypePassword) {
      setNewPasswordError(["The passwords do not match, try again."]);
    } else if (!authenticationCode) {
      setAuthenticationError(["Enter the code that was emailed to you."]);
    } else {
      const passwordErrors = checkPassword(newPassword);

      if (passwordErrors && passwordErrors.length > 0) {
        setNewPasswordError(passwordErrors);
      } else {
        const resetPasswordUrl = GetResetMyPasswordUrl();

        if (resetPasswordUrl) {
          const resetBody = {
            resetId: resetId,
            code: authenticationCode,
            password: newPassword,
            confirmPassword: retypePassword,
          };

          await fetch(`${resetPasswordUrl.url}`, {
            headers: resetPasswordUrl.headers,
            crossDomain: true,
            method: "POST",
            body: JSON.stringify(resetBody),
          })
            .then((res) => (res.ok ? res : Promise.reject(res)))
            .then((res) => {
              switch (res.status) {
                case 200:
                  setAuthenticationCode("");
                  return true;

                case 400:
                  res.json().then((body) => {
                    setNewPasswordError([body.toString()]);
                  });
                  return false;

                default:
                  setNewPasswordError([`Unknown status: ${res.status}`]);
                  return false;
              }
            })
            .then(
              (result) => {
                if (result) setStep(0);
              },
              (error) => {
                switch (error.status) {
                  case 400:
                    error.json().then((body) => {
                      if (body && body.errors) {
                        const resetErrors = [];
                        for (const [key, value] of Object.entries(body.errors)) {
                          resetErrors.push(`${key}: ${value}`);
                        }
                        setNewPasswordError(resetErrors);
                      }
                    });
                    break;

                  default:
                    setNewPasswordError([`[${error.status} ERROR] ${error.statusText}`]);
                    break;
                }
                return false;
              }
            );
        }
      }
    }
  };

  /**
   * Method to handle when user changes their password
   */
  const handleChangePasswordClick = async () => {
    setNewPasswordError([]);
    setRetypePasswordError([]);

    if (!newPassword) {
      setNewPasswordError(["Enter a new password and try again."]);
    } else if (!retypePassword) {
      setRetypePasswordError(["Retype your new password and try again."]);
    } else if (newPassword !== retypePassword) {
      setNewPasswordError(["The passwords do not match, try again."]);
    } else {
      const passwordErrors = checkPassword(newPassword);

      if (passwordErrors && passwordErrors.length > 0) {
        setNewPasswordError(passwordErrors);
      } else {
        const changePasswordUrl = UpdateMyPasswordUrl(userContext.currentUser.token);

        if (changePasswordUrl) {
          const changeBody = {
            password: newPassword,
          };

          console.log("[DEBUG] Change password", changePasswordUrl.url, JSON.stringify(changeBody));

          await fetch(`${changePasswordUrl.url}`, {
            headers: changePasswordUrl.headers,
            crossDomain: true,
            method: "PUT",
            body: JSON.stringify(changeBody),
          })
            .then((res) => (res.ok ? res : Promise.reject(res)))
            .then((res) => {
              switch (res.status) {
                case 200:
                  return true;

                case 400:
                  res.text().then((body) => {
                    setNewPasswordError([body]);
                  });
                  return false;

                case 401:
                  setNewPasswordError(["The user token is invalid."]);
                  return false;

                case 403:
                  setNewPasswordError(["User is not logged in."]);
                  return false;

                default:
                  setNewPasswordError([`Unknown status: ${res.status}`]);
                  return false;
              }
            })
            .then(
              (result) => {
                if (result) setShowDialog(false);
              },
              (error) => {
                switch (error.status) {
                  case 400:
                    error.text().then((body) => {
                      setNewPasswordError([body]);
                    });
                    break;

                  case 401:
                    setNewPasswordError(["The user token is invalid."]);
                    break;

                  case 403:
                    setNewPasswordError(["User is not logged in."]);
                    break;

                  default:
                    setNewPasswordError([`[${error.status} ERROR] ${error.statusText}`]);
                    break;
                }
                return false;
              }
            );
        }
      }
    }
  };

  /**
   * Method to handle when user cancels resetting their password
   */
  const handleCancelClick = () => {
    if (changePassword) setShowDialog(false);
    else setStep(0);
  };

  /**
   * Method to get the title for the dialog.
   *
   * @returns {string} The title for the dialog.
   */
  const getTitle = () => {
    switch (step) {
      case 1:
        return `${!!title ? title : "Login"} Authentication`;

      case 2:
        return "Reset Password";

      case 3:
        return "Change Password";

      default:
        return `${!!title ? title : "Login"}`;
    }
  };

  /**
   * Method to get the controls for the content section of the dialog.
   *
   * @returns {JSX.Element} The controls that need to be displayed in the content section of the dialog.
   */
  const getContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            {loginError ? (
              <Typography variant="body1" color="error">
                {loginError}
              </Typography>
            ) : (
              <Typography variant="body1">{message}</Typography>
            )}
            <ADSTextControl
              label="Username"
              isEditable
              isRequired
              value={username}
              id="username"
              maxLength={30}
              onChange={handleUsernameChangeEvent}
            />
            <ADSTextControl
              label="Password"
              isEditable
              isRequired
              isHidden={true}
              value={password}
              id="password"
              maxLength={20}
              onChange={handlePasswordChangeEvent}
            />
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="body1">Enter authentication code</Typography>
            <ADSTextControl
              label="Code"
              isEditable
              isRequired
              value={authenticationCode}
              errorText={authenticationError}
              id="authentication-code"
              maxLength={10}
              onChange={handleAuthenticationCodeChangeEvent}
            />
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="body2">Passwords must be:</Typography>
            <List dense>
              <ListItem key="passwordInfo1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="between 5 and 20 characters long." />
              </ListItem>
              <ListItem key="passwordInfo2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have at least 4 unique characters." />
              </ListItem>
              <ListItem key="passwordInfo3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have uppercase and lowercase characters." />
              </ListItem>
              <ListItem key="passwordInfo4">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have numbers." />
              </ListItem>
              <ListItem key="passwordInfo5">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have special characters." />
              </ListItem>
            </List>
            <ADSTextControl
              label="New password"
              isEditable
              isRequired
              isHidden
              value={newPassword}
              errorText={newPasswordError}
              id="new-password"
              maxLength={20}
              onChange={handleNewPasswordChangeEvent}
            />
            <ADSTextControl
              label="Retype password"
              isEditable
              isRequired
              isHidden
              value={retypePassword}
              errorText={retypePasswordError}
              id="retype-password"
              maxLength={20}
              onChange={handleRetypePasswordChangeEvent}
            />
            <ADSTextControl
              label="Code"
              isEditable
              isRequired
              value={authenticationCode}
              errorText={authenticationError}
              id="authentication-code"
              maxLength={10}
              onChange={handleAuthenticationCodeChangeEvent}
            />
          </>
        );

      case 3:
        return (
          <>
            <Typography variant="body2">Passwords must be:</Typography>
            <List dense>
              <ListItem key="passwordInfo1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="between 5 and 20 characters long." />
              </ListItem>
              <ListItem key="passwordInfo2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have at least 4 unique characters." />
              </ListItem>
              <ListItem key="passwordInfo3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have uppercase and lowercase characters." />
              </ListItem>
              <ListItem key="passwordInfo4">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have numbers." />
              </ListItem>
              <ListItem key="passwordInfo5">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="have special characters." />
              </ListItem>
            </List>
            <ADSTextControl
              label="New password"
              isEditable
              isRequired
              isHidden
              value={newPassword}
              errorText={newPasswordError}
              id="new-password"
              maxLength={20}
              onChange={handleNewPasswordChangeEvent}
            />
            <ADSTextControl
              label="Retype password"
              isEditable
              isRequired
              isHidden
              value={retypePassword}
              errorText={retypePasswordError}
              id="retype-password"
              maxLength={20}
              onChange={handleRetypePasswordChangeEvent}
            />{" "}
          </>
        );

      default:
        break;
    }
  };

  /**
   * Method to get the controls for the actions section of the dialog.
   *
   * @returns {JSX.Element} The controls that need to be displayed in the action section of the dialog.
   */
  const getActions = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Button
              onClick={handleLoginClick}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
            <Button onClick={handleForgotPasswordClick} variant="contained" sx={whiteButtonStyle}>
              Forgot password
            </Button>
          </>
        );

      case 1:
        return (
          <>
            <Button
              onClick={handleAuthenticateClick}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<LoginIcon />}
            >
              Authenticate
            </Button>
            <Button onClick={handleResendEmailClick} variant="contained" sx={whiteButtonStyle}>
              Resend email
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <Button
              onClick={handleResetPasswordClick}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<LockResetIcon />}
            >
              Reset password
            </Button>
            <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
              Cancel
            </Button>
          </>
        );

      case 3:
        return (
          <>
            <Button
              onClick={handleChangePasswordClick}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<LockResetIcon />}
            >
              Change password
            </Button>
            <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
              Cancel
            </Button>
          </>
        );

      default:
        break;
    }
  };

  useEffect(() => {
    if (!apiUrl) {
      const userUrl = PostUserLoginUrl();
      setApiUrl(userUrl);
    }

    setLoginError([]);
    setAuthenticationError([]);
    setNewPasswordError([]);
    setRetypePasswordError([]);

    return () => {};
  }, [apiUrl]);

  useEffect(() => {
    if (changePassword) setStep(3);
  }, [changePassword]);

  useEffect(() => {
    setShowDialog(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={showDialog} aria-labelledby="user-login-dialog" fullWidth maxWidth="xs">
      <DialogTitle id="user-login-dialog" sx={{ color: adsWhite, backgroundColor: adsBlueA }}>
        {getTitle()}
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(1) }}>{getContent()}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), pl: theme.spacing(3) }}>
        {getActions()}
      </DialogActions>
    </Dialog>
  );
}

export default LoginDialog;
