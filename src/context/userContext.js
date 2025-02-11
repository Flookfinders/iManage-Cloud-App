//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: user Context
//
//  Copyright:    © 2022 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001   28.01.22 Sean Flook         WI39??? Initial Revision.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React from "react";

//endregion imports

const userContext = React.createContext();
userContext.displayName = "userContext";

export default userContext;
