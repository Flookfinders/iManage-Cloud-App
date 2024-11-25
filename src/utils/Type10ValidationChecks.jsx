/* #region header */
/**************************************************************************************************
//
//  Description: Type 10 validation checks
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.2.0 changes
//    001   25.11.24 Sean Flook      IMANN-1076 Initial Revision.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { isValid } from "date-fns";

/**
 * Check 1100004 - End date cannot be before the street start date.
 *
 * @param {any} date The date to check.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1000020 = (date) => {
  return date && !isValid(date);
};
