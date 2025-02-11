//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Information Context
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001   19.01.24 Sean Flook                 Initial Revision.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports

import React from "react";

//#endregion imports

const InformationContext = React.createContext();
InformationContext.displayName = "InformationContext";

export default InformationContext;
