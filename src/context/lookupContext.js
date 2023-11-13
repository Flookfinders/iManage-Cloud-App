/* #region header */
/**************************************************************************************************
//
//  Description: Lookup Context
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.08.21 Sean Flook         WI39??? Initial Revision.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React from "react";

/* #endregion imports */

const LookupContext = React.createContext();
LookupContext.displayName = "LookupContext";

export default LookupContext;
