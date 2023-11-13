/* #region header */
/**************************************************************************************************
//
//  Description: Sandbox Context
//
//  Copyright:    © 2022 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   19.01.22 Sean Flook         WI39??? Initial Revision.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React from "react";

/* #endregion imports */

const SandboxContext = React.createContext();
SandboxContext.displayName = "SandboxContext";

export default SandboxContext;
