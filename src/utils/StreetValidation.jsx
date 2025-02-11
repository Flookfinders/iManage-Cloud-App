//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Street validation
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Street:                     1100066
//  ESU:                        1300041
//  Descriptor:                 1500045
//  One Way Exemption:          1600025
//  Highway Dedication:         1700031
//  Successor Cross Reference:  3000017
//  Maintenance Responsibility: 5100034
//  Reinstatement Category:     5200033
//  OS Special Designation:     5300036
//  Interest:                   6100058
//  Construction:               6200064
//  Special Designation:        6300054
//  Height Width Weight:        6400049
//  Public Right of Way:        6600064
//  Note:                       7200012
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   19.04.23 Sean Flook         WI40653 use includeCheck to determine if a check should be run.
//    003   10.08.23 Sean Flook                 Corrected object name.
//    004   20.09.23 Sean Flook                 Added holder for ValidateStreetSuccessorData.
//    005   24.11.23 Sean Flook                 Renamed successor to successorCrossRef.
//    006   15.12.23 Sean Flook                 Added new checks and comments.
//    007   19.12.23 Sean Flook                 Various bug fixes.
//    008   29.01.24 Sean Flook                 Added new checks.
//    009   29.01.24 Sean Flook                 Added more new checks.
//    010   01.02.24 Sean Flook                 Changes required for differences in field names between GeoPlace and OneScotland.
//    011   02.02.24 Sean Flook       IMANN-269 Use isIso885914 to determine if the various texts are compliant to the ISO 8859-14 (Celtic-8) character set.
//    012   02.02.24 Sean Flook       IMANN-264 Correctly call includeCheck for GeoPlace ASD records.
//    013   07.02.24 Sean Flook       IMANN-284 Added missing OneScotland ESU checks.
//    014   12.02.24 Sean Flook                 Added new GeoPlace special designation checks.
//    015   14.03.24 Sean Flook                 Added new checks.
//    016   18.03.24 Sean Flook         ESU2_GP Added check for missing geometry on ESU record.
//    017   28.03.24 Sean Flook                 Fixed check 6200016.
//    018   16.04.24 Sean Flook       IMANN-388 Corrected bug.
//    019   23.05.24 Joshua McCormick IMANN-478 Removed 6600052 PRoW district ref consultant is missing. as not used in API or GUI
//    020   20.04.24 Sean Flook       IMANN-221 Use the correct table when checking Scottish ASD custodian and authorities.
//    021   29.05.24 Sean Flook       IMANN-221 Added new checks.
//    031   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    032   04.07.24 Sean Flook       IMANN-221 Added new checks and updated messages.
//    033   04.07.24 Sean Flook       IMANN-221 Further updated messages.
//    034   04.07.24 Sean Flook       IMANN-221 Further updated messages.
//    035   18.07.24 Sean Flook       IMANN-772 Corrected field name.
//    036   19.07.24 Sean Flook       IMANN-812 Removed check 1600021.
//    037   22.07.24 Sean Flook       IMANN-813 Report check 1700007 on the correct field.
//    038   23.07.24 Sean Flook       IMANN-816 Fixed check 1600011.
//    039   23.07.24 Sean Flook       IMANN-812 Removed check 6600031.
//    040   26.07.24 Sean Flook       IMANN-854 Handle 0 in check 5200013.
//    041   26.07.24 Sean Flook       IMANN-860 Report check 3000012 on the correct field.
//    042   06.08.24 Sean Flook       IMANN-876 Removed check 6600018 as not required.
//    043   22.08.24 Sean Flook       IMANN-951 Corrected field names.
//    044   02.09.24 Sean Flook       IMANN-976 Handle "Unassigned" in lookups.
//#endregion Version 1.0.0.0
//#region Version 1.0.2.0
//    045   31.10.24 Sean Flook       IMANN-1012 Changed to use new checks to prevent duplicating check code.
//    046   25.11.24 Sean Flook       IMANN-1076 Added check for a valid date in date fields.
//    047   26.11.24 Sean Flook       IMANN-1089 Updated checks 6100023, 6200028 and 6300033.
//    048   04.12.24 Sean Flook       IMANN-1087 Corrected the order of parameters for check 6300012.
//    049   05.12.24 Sean Flook       IMANN-1087 Include the currentLookups in call to failsCheck6300051.
//#endregion Version 1.0.2.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import { failsCheck1000020 } from "./Type10ValidationChecks";
import {
  failsCheck1100004,
  failsCheck1100009,
  failsCheck1100010,
  failsCheck1100011,
  failsCheck1100012,
  failsCheck1100013,
  failsCheck1100014,
  failsCheck1100016,
  failsCheck1100019,
  failsCheck1100021,
  failsCheck1100022,
  failsCheck1100024,
  failsCheck1100025,
  failsCheck1100027,
  failsCheck1100028,
  failsCheck1100029,
  failsCheck1100030,
  failsCheck1100031,
  failsCheck1100032,
  failsCheck1100033,
  failsCheck1100035,
  failsCheck1100037,
  failsCheck1100041,
  failsCheck1100042,
  failsCheck1100043,
  failsCheck1100048,
} from "./Type11ValidationChecks";
import {
  failsCheck1300002,
  failsCheck1300011,
  failsCheck1300012,
  failsCheck1300013,
  failsCheck1300014,
  failsCheck1300015,
  failsCheck1300016,
  failsCheck1300017,
  failsCheck1300020,
  failsCheck1300021,
  failsCheck1300022,
  failsCheck1300023,
  failsCheck1300024,
  failsCheck1300025,
  failsCheck1300026,
  failsCheck1300028,
  failsCheck1300030,
  failsCheck1300031,
  failsCheck1300036,
  failsCheck1300037,
} from "./Type13ValidationChecks";
import {
  failsCheck1500002,
  failsCheck1500003,
  failsCheck1500004,
  failsCheck1500005,
  failsCheck1500006,
  failsCheck1500007,
  failsCheck1500008,
  failsCheck1500009,
  failsCheck1500010,
  failsCheck1500023,
  failsCheck1500024,
  failsCheck1500025,
  failsCheck1500026,
  failsCheck1500033,
  failsCheck1500034,
  failsCheck1500035,
  failsCheck1500038,
  failsCheck1500042,
  failsCheck1500043,
  failsCheck1500045,
} from "./Type15ValidationChecks";
import {
  failsCheck1600001,
  failsCheck1600002,
  failsCheck1600004,
  failsCheck1600005,
  failsCheck1600006,
  failsCheck1600011,
  failsCheck1600014,
  failsCheck1600015,
  failsCheck1600016,
  failsCheck1600018,
} from "./Type16ValidationChecks";
import {
  failsCheck1700002,
  failsCheck1700004,
  failsCheck1700006,
  failsCheck1700007,
  failsCheck1700008,
  failsCheck1700009,
  failsCheck1700012,
  failsCheck1700029,
} from "./Type17ValidationChecks";
import {
  failsCheck3000004,
  failsCheck3000008,
  failsCheck3000009,
  failsCheck3000010,
  failsCheck3000012,
} from "./Type30ValidationChecks";
import {
  failsCheck5100008,
  failsCheck5100009,
  failsCheck5100010,
  failsCheck5100011,
  failsCheck5100012,
  failsCheck5100013,
  failsCheck5100014,
  failsCheck5100015,
  failsCheck5100016,
  failsCheck5100017,
  failsCheck5100018,
  failsCheck5100019,
  failsCheck5100020,
  failsCheck5100021,
  failsCheck5100022,
  failsCheck5100023,
  failsCheck5100026,
  failsCheck5100029,
  failsCheck5100030,
  failsCheck5100032,
  failsCheck5100033,
  failsCheck5100034,
} from "./Type51ValidationChecks";
import {
  failsCheck5200008,
  failsCheck5200009,
  failsCheck5200010,
  failsCheck5200011,
  failsCheck5200012,
  failsCheck5200013,
  failsCheck5200014,
  failsCheck5200015,
  failsCheck5200016,
  failsCheck5200018,
  failsCheck5200019,
  failsCheck5200020,
  failsCheck5200021,
  failsCheck5200022,
  failsCheck5200025,
  failsCheck5200026,
  failsCheck5200027,
  failsCheck5200030,
  failsCheck5200031,
  failsCheck5200032,
  failsCheck5200033,
} from "./Type52ValidationChecks";
import {
  failsCheck5300007,
  failsCheck5300008,
  failsCheck5300011,
  failsCheck5300012,
  failsCheck5300013,
  failsCheck5300014,
  failsCheck5300015,
  failsCheck5300016,
  failsCheck5300017,
  failsCheck5300018,
  failsCheck5300019,
  failsCheck5300020,
  failsCheck5300021,
  failsCheck5300022,
  failsCheck5300023,
  failsCheck5300024,
  failsCheck5300025,
  failsCheck5300027,
  failsCheck5300028,
  failsCheck5300029,
  failsCheck5300032,
  failsCheck5300033,
  failsCheck5300034,
  failsCheck5300035,
  failsCheck5300036,
} from "./Type53ValidationChecks";
import {
  failsCheck6100006,
  failsCheck6100007,
  failsCheck6100008,
  failsCheck6100009,
  failsCheck6100011,
  failsCheck6100012,
  failsCheck6100013,
  failsCheck6100014,
  failsCheck6100021,
  failsCheck6100022,
  failsCheck6100023,
  failsCheck6100027,
  failsCheck6100029,
  failsCheck6100030,
  failsCheck6100031,
  failsCheck6100035,
  failsCheck6100036,
  failsCheck6100037,
  failsCheck6100038,
  failsCheck6100040,
  failsCheck6100041,
  failsCheck6100042,
  failsCheck6100043,
  failsCheck6100044,
  failsCheck6100046,
  failsCheck6100047,
  failsCheck6100049,
  failsCheck6100050,
  failsCheck6100051,
  failsCheck6100052,
} from "./Type61ValidationChecks";
import {
  failsCheck6200006,
  failsCheck6200007,
  failsCheck6200008,
  failsCheck6200009,
  failsCheck6200014,
  failsCheck6200015,
  failsCheck6200016,
  failsCheck6200017,
  failsCheck6200018,
  failsCheck6200019,
  failsCheck6200020,
  failsCheck6200022,
  failsCheck6200023,
  failsCheck6200024,
  failsCheck6200025,
  failsCheck6200026,
  failsCheck6200027,
  failsCheck6200028,
  failsCheck6200030,
  failsCheck6200033,
  failsCheck6200038,
  failsCheck6200046,
  failsCheck6200047,
  failsCheck6200048,
  failsCheck6200050,
  failsCheck6200051,
  failsCheck6200052,
  failsCheck6200053,
  failsCheck6200055,
} from "./Type62ValidationChecks";
import {
  failsCheck6300006,
  failsCheck6300007,
  failsCheck6300008,
  failsCheck6300009,
  failsCheck6300010,
  failsCheck6300011,
  failsCheck6300012,
  failsCheck6300013,
  failsCheck6300014,
  failsCheck6300015,
  failsCheck6300016,
  failsCheck6300017,
  failsCheck6300018,
  failsCheck6300019,
  failsCheck6300025,
  failsCheck6300029,
  failsCheck6300030,
  failsCheck6300031,
  failsCheck6300032,
  failsCheck6300033,
  failsCheck6300037,
  failsCheck6300038,
  failsCheck6300040,
  failsCheck6300042,
  failsCheck6300043,
  failsCheck6300044,
  failsCheck6300045,
  failsCheck6300046,
  failsCheck6300047,
  failsCheck6300049,
  failsCheck6300050,
  failsCheck6300051,
  failsCheck6300052,
  failsCheck6300053,
} from "./Type63ValidationChecks";
import {
  failsCheck6400005,
  failsCheck6400006,
  failsCheck6400009,
  failsCheck6400010,
  failsCheck6400011,
  failsCheck6400012,
  failsCheck6400016,
  failsCheck6400018,
  failsCheck6400019,
  failsCheck6400021,
  failsCheck6400022,
  failsCheck6400023,
  failsCheck6400025,
  failsCheck6400026,
  failsCheck6400027,
  failsCheck6400028,
  failsCheck6400029,
  failsCheck6400030,
  failsCheck6400031,
  failsCheck6400032,
  failsCheck6400039,
  failsCheck6400040,
  failsCheck6400043,
  failsCheck6400044,
  failsCheck6400045,
  failsCheck6400046,
  failsCheck6400047,
  failsCheck6400048,
  failsCheck6400049,
} from "./Type64ValidationChecks";
import {
  failsCheck6600011,
  failsCheck6600012,
  failsCheck6600013,
  failsCheck6600014,
  failsCheck6600017,
  failsCheck6600019,
  failsCheck6600027,
  failsCheck6600028,
  failsCheck6600029,
  failsCheck6600030,
  failsCheck6600032,
  failsCheck6600033,
  failsCheck6600034,
  failsCheck6600035,
  failsCheck6600036,
  failsCheck6600037,
  failsCheck6600040,
  failsCheck6600041,
  failsCheck6600042,
  failsCheck6600043,
  failsCheck6600044,
  failsCheck6600046,
  failsCheck6600047,
  failsCheck6600048,
  failsCheck6600049,
  failsCheck6600050,
  failsCheck6600051,
  failsCheck6600053,
  failsCheck6600054,
  failsCheck6600055,
  failsCheck6600056,
  failsCheck6600058,
} from "./Type66ValidationChecks";
import { failsCheck7200005 } from "./Type72ValidationChecks";

import { includeCheck, GetErrorMessage, GetCheck } from "./HelperUtils";

const showDebugMessages = false;

/**
 * Validates a street record
 *
 * @param {object} data The street record data that needs to be validated
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {number} authorityCode The current authorities DETR code.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateStreetData(data, currentLookups, isScottish, authorityCode) {
  const methodName = "ValidateStreetData";
  let validationErrors = [];
  let currentCheck;
  let endDateErrors = [];
  let startCoordErrors = [];
  let endCoordErrors = [];
  let toleranceErrors = [];
  let stateErrors = [];
  let surfaceErrors = [];
  let startDateErrors = [];
  let usrnErrors = [];
  let swaOrgRefNamingErrors = [];
  let recordTypeErrors = [];
  let stateDateErrors = [];
  let streetClassificationErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.streetStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.streetEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the street start date.
    currentCheck = GetCheck(1100004, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100004(data.streetStartDate, data.streetEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Coordinates must be within the valid coordinate range.
    currentCheck = GetCheck(1100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100009(data.streetStartX, data.streetStartY)) {
      startCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (includeCheck(currentCheck, isScottish) && failsCheck1100009(data.streetEndX, data.streetEndY)) {
      endCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Tolerance must be within the accepted tolerance range (0-99).
    currentCheck = GetCheck(1100010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100010(data.streetTolerance)) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date is set but state is not 4.
    currentCheck = GetCheck(1100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100011(data.streetEndDate, data.state)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is supplied but state date not set.
    currentCheck = GetCheck(1100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100012(data.state, data.stateDate)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(1100013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100013(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Surface is invalid.
    currentCheck = GetCheck(1100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100014(data.streetSurface)) {
      surfaceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(1100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100016(data.streetStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a tolerance.
    currentCheck = GetCheck(1100019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100019(data.streetTolerance)) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(1100021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100021(data.streetStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is 4 but end date is not set.
    currentCheck = GetCheck(1100022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100022(data.state, data.streetEndDate)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a USRN.
    currentCheck = GetCheck(1100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100024(data.usrn)) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an authority code.
    currentCheck = GetCheck(1100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100025(data.swaOrgRefNaming)) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter start and/or end coordinates.
    currentCheck = GetCheck(1100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100027(data.esus, data.streetStartX, data.streetStartY)) {
      startCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1100027(data.esus, data.streetEndX, data.streetEndY)) {
      endCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Authority code is invalid.
    currentCheck = GetCheck(1100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100028(data.swaOrgRefNaming)) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Record type is invalid.
    currentCheck = GetCheck(1100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100029(data.recordType)) {
      recordTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State dates prior to 1990 are not allowed.
    currentCheck = GetCheck(1100030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100030(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(1100031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100031(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification is invalid.
    currentCheck = GetCheck(1100032, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100032(data.streetClassification)) {
      streetClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a record type.
    currentCheck = GetCheck(1100033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100033(data.recordType)) {
      recordTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1100035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100035(data.streetEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(1100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100037(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Street types 2, 3 & 4 must not have a state of 5.
    currentCheck = GetCheck(1100041, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100041(data.recordType, data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state date.
    currentCheck = GetCheck(1100042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100042(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a surface.
    currentCheck = GetCheck(1100043, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100043(data.streetSurface)) {
      surfaceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Street creation and maintenance is restricted to your assigned authority.
    currentCheck = GetCheck(1100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100048(data.swaOrgRefNaming, authorityCode)) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateStreetData - Finished checks");

    if (endDateErrors.length > 0)
      validationErrors.push({
        field: "StreetEndDate",
        errors: endDateErrors,
      });

    if (startCoordErrors.length > 0)
      validationErrors.push({
        field: "StreetStartX",
        errors: startCoordErrors,
      });

    if (endCoordErrors.length > 0)
      validationErrors.push({
        field: "StreetEndX",
        errors: endCoordErrors,
      });

    if (toleranceErrors.length > 0)
      validationErrors.push({
        field: "StreetTolerance",
        errors: toleranceErrors,
      });

    if (stateErrors.length > 0)
      validationErrors.push({
        field: "State",
        errors: stateErrors,
      });

    if (surfaceErrors.length > 0)
      validationErrors.push({
        field: "StreetSurface",
        errors: surfaceErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        field: "StreetStartDate",
        errors: startDateErrors,
      });

    if (usrnErrors.length > 0)
      validationErrors.push({
        field: "Usrn",
        errors: usrnErrors,
      });

    if (swaOrgRefNamingErrors.length > 0)
      validationErrors.push({
        field: "SwaOrgRefNaming",
        errors: swaOrgRefNamingErrors,
      });

    if (recordTypeErrors.length > 0)
      validationErrors.push({
        field: "RecordType",
        errors: recordTypeErrors,
      });

    if (stateDateErrors.length > 0)
      validationErrors.push({
        field: "StateDate",
        errors: stateDateErrors,
      });

    if (streetClassificationErrors.length > 0)
      validationErrors.push({
        field: "StreetClassification",
        errors: streetClassificationErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a street descriptor record
 *
 * @param {object} data The street descriptor record data that needs to be validated
 * @param {number} index The index for the street descriptor record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateDescriptorData(data, index, currentLookups, isScottish, isWelsh) {
  const methodName = "ValidateDescriptorData";
  let validationErrors = [];
  let currentCheck;
  let descriptorErrors = [];
  let languageErrors = [];
  let townRefErrors = [];
  let adminAreaRefErrors = [];
  let locRefErrors = [];
  let islandRefErrors = [];

  const townData = currentLookups.towns.find((x) => x.townRef === data.townRef);
  const adminAreaData = currentLookups.adminAuthorities.find((x) => x.administrativeAreaRef === data.adminAreaRef);
  const localityData = currentLookups.localities.find((x) => x.localityRef === data.locRef);
  const islandData = isScottish ? currentLookups.islands.find((x) => x.islandRef === data.islandRef) : null;

  if (data) {
    // Enter a descriptor.
    currentCheck = GetCheck(1500002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500002(data.streetDescriptor)) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a language.
    currentCheck = GetCheck(1500003, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500003(data.language)) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a town name.
    currentCheck = GetCheck(1500004, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500004(data.townRef, townData)) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an administrative area.
    currentCheck = GetCheck(1500005, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500005(data.adminAreaRef, adminAreaData)) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Descriptor is too long.
    currentCheck = GetCheck(1500006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500006(data.streetDescriptor)) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality name is too long.
    currentCheck = GetCheck(1500007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500007(data.locRef, localityData)) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Town name is too long.
    currentCheck = GetCheck(1500008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500008(data.townRef, townData)) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Administrative area is too long.
    currentCheck = GetCheck(1500009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500009(data.adminAreaRef, adminAreaData)) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Language is invalid.
    currentCheck = GetCheck(1500010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500010(data.language, isScottish, isWelsh)) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality does not exist in the lookup table.
    currentCheck = GetCheck(1500023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500023(data.locRef, localityData)) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Town does not exist in the lookup table.
    currentCheck = GetCheck(1500024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500024(data.townRef, townData)) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Administrative area does not exist in the lookup table.
    currentCheck = GetCheck(1500025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500025(data.adminAreaRef, adminAreaData)) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality and town must not be the same.
    currentCheck = GetCheck(1500026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1500026(data.locRef, localityData, data.townRef, townData)
    ) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Island does not exist in the lookup table.
    currentCheck = GetCheck(1500033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500033(data.islandRef, islandData)) {
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Island name is too long.
    currentCheck = GetCheck(1500034, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500034(data.islandRef, islandData)) {
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality, town and island must not be the same.
    currentCheck = GetCheck(1500035, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1500035(data.locRef, localityData, data.townRef, townData, data.islandRef, islandData)
    ) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // A street descriptor must have a town when a locality has been entered.
    currentCheck = GetCheck(1500038, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1500038(data.locRef, localityData, data.townRef, townData)
    ) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Descriptor should not begin with a space.
    currentCheck = GetCheck(1500042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500042(data.streetDescriptor)) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Descriptor should not end with a space (open streets).
    currentCheck = GetCheck(1500043, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1500043(data.streetDescriptor)) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Island and administrative area should not be the same.
    currentCheck = GetCheck(1500045, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1500045(data.islandRef, islandData, data.adminAreaRef, adminAreaData)
    ) {
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateDescriptorData - Finished checks");

    if (descriptorErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetDescriptor",
        errors: descriptorErrors,
      });

    if (languageErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Language",
        errors: languageErrors,
      });

    if (townRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "TownRef",
        errors: townRefErrors,
      });

    if (adminAreaRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AdminAreaRef",
        errors: adminAreaRefErrors,
      });

    if (locRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "LocRef",
        errors: locRefErrors,
      });

    if (islandRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "IslandRef",
        errors: islandRefErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an ESU record
 *
 * @param {object} data The ESU record data that needs to be validated
 * @param {number} index The index for the ESU record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateEsuData(data, index, currentLookups, isScottish) {
  const methodName = "ValidateEsuData";
  let startDateErrors = [];
  let endDateErrors = [];
  let classificationErrors = [];
  let classificationDateErrors = [];
  let stateErrors = [];
  let stateDateErrors = [];
  let toleranceErrors = [];
  let directionErrors = [];
  let geometryErrors = [];
  let validationErrors = [];
  let currentCheck;

  if (data) {
    const esuStartDate = isScottish ? data.startDate : data.esuStartDate;
    const esuEndDate = isScottish ? data.endDate : data.esuEndDate;

    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(esuStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(esuEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.classificationDate)) {
      classificationDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter geometry.
    currentCheck = GetCheck(1300002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300002(data.wktGeometry)) {
      geometryErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(1300011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300011(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state date.
    currentCheck = GetCheck(1300012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300012(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(1300013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300013(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(1300014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300014(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be before the start date.
    currentCheck = GetCheck(1300015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300015(data.state, data.stateDate, esuStartDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is 4 but ESU end date is not set.
    currentCheck = GetCheck(1300016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300016(data.state, esuEndDate)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(1300017, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300017(esuStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(1300020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300020(esuStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1300021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300021(esuEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(1300022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300022(esuStartDate, esuEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification.
    currentCheck = GetCheck(1300023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300023(data.classification)) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification is invalid.
    currentCheck = GetCheck(1300024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300024(data.classification)) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification date.
    currentCheck = GetCheck(1300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300025(data.classificationDate)) {
      classificationDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification date cannot be before the start date.
    currentCheck = GetCheck(1300026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300026(esuStartDate, data.classificationDate)) {
      classificationDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date is set but state is not 4.
    currentCheck = GetCheck(1300028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300028(esuEndDate, data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a tolerance.
    currentCheck = GetCheck(1300030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300030(data.esuTolerance)) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Tolerance is invalid.
    currentCheck = GetCheck(1300031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300031(data.esuTolerance)) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a direction.
    currentCheck = GetCheck(1300036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300036(data.esuDirection)) {
      directionErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Direction is invalid.
    currentCheck = GetCheck(1300037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1300037(data.esuDirection)) {
      directionErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (showDebugMessages) console.log("[DEBUG] ValidateEsuData - Finished checks");

  if (geometryErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "Geometry",
      errors: geometryErrors,
    });

  if (startDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuStartDate",
      errors: startDateErrors,
    });

  if (endDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuEndDate",
      errors: endDateErrors,
    });

  if (classificationErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "Classification",
      errors: classificationErrors,
    });

  if (classificationDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "ClassificationDate",
      errors: classificationDateErrors,
    });

  if (stateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "State",
      errors: stateErrors,
    });

  if (stateDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "StateDate",
      errors: stateDateErrors,
    });

  if (toleranceErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuTolerance",
      errors: toleranceErrors,
    });

  if (directionErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuDirection",
      errors: directionErrors,
    });

  return validationErrors;
}

/**
 * Validates an one way exemption record
 *
 * @param {object} data The one way exemption record data that needs to be validated
 * @param {number} index The index for the one way exemption record.
 * @param {number} esuIndex The index for the ESU record that this one way exemption record is attached to.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateOneWayExemptionData(data, index, esuIndex, currentLookups, isScottish) {
  const methodName = "ValidateOneWayExemptionData";
  let validationErrors = [];
  let currentCheck;
  let oweTypeErrors = [];
  let recordEndDateErrors = [];
  let oweEndDateErrors = [];
  let oweEndTimeErrors = [];
  let owePeriodicityCodeErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.oneWayExemptionEndDate)) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Type is invalid.
    currentCheck = GetCheck(1600001, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1600001(data.oneWayExemptionType)) {
      oweTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1600002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1600002(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(1600004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1600004(data.oneWayExemptionStartDate, data.oneWayExemptionEndDate)
    ) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a periodicity.
    currentCheck = GetCheck(1600005, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1600005(data.oneWayExemptionPeriodicityCode)) {
      owePeriodicityCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Periodicity is invalid.
    currentCheck = GetCheck(1600006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1600006(data.oneWayExemptionPeriodicityCode)) {
      owePeriodicityCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date and end date must either both be blank or both have a value.
    currentCheck = GetCheck(1600011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1600011(data.oneWayExemptionStartDate, data.oneWayExemptionEndDate)
    ) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start time and end time must either both be blank or both have a value.
    currentCheck = GetCheck(1600014, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1600014(data.oneWayExemptionStartTime, data.oneWayExemptionEndTime)
    ) {
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End time cannot be before start time.
    currentCheck = GetCheck(1600015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1600015(data.oneWayExemptionEndTime, data.oneWayExemptionStartTime)
    ) {
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date, start time, end date and end time must be present when periodicity is 15.
    currentCheck = GetCheck(1600016, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck1600016(
        data.oneWayExemptionPeriodicityCode,
        data.oneWayExemptionStartDate,
        data.oneWayExemptionEndDate,
        data.oneWayExemptionStartTime,
        data.oneWayExemptionEndTime
      )
    ) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a type.
    currentCheck = GetCheck(1600018, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1600018(data.oneWayExemptionType)) {
      oweTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOneWayExemptionData - Finished checks");

    if (oweTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "oneWayExemptionType",
        errors: oweTypeErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (oweEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionEndDate",
        errors: oweEndDateErrors,
      });

    if (oweEndTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionEndTime",
        errors: oweEndTimeErrors,
      });

    if (owePeriodicityCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionPeriodicityCode",
        errors: owePeriodicityCodeErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a highway dedication record
 *
 * @param {object} data The highway dedication record data that needs to be validated
 * @param {number} index The index for the highway dedication record.
 * @param {number} esuIndex The index for the ESU record that this highway dedication record is attached to.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateHighwayDedicationData(data, index, esuIndex, currentLookups, isScottish) {
  const methodName = "ValidateHighwayDedicationData";
  let validationErrors = [];
  let currentCheck;
  let hdCodeErrors = [];
  let hdStartDateErrors = [];
  let hdEndDateErrors = [];
  let hdEndTimeErrors = [];
  let hdSeasonalEndDateErrors = [];
  let recordEndDateErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.hdStartDate)) {
      hdStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.hdEndDate)) {
      hdEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.hdSeasonalEndDate)) {
      hdSeasonalEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a type.
    currentCheck = GetCheck(1700002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700002(data.highwayDedicationCode)) {
      hdCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Type is invalid.
    currentCheck = GetCheck(1700004, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700004(data.highwayDedicationCode)) {
      hdCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(1700006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700006(data.hdStartDate, data.hdEndDate)) {
      hdEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Record end date cannot be before the start date.
    currentCheck = GetCheck(1700007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700007(data.hdStartDate, data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start time and end time must either both be blank or both have a value.
    currentCheck = GetCheck(1700008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700008(data.hdStartTime, data.hdEndTime)) {
      hdEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End time cannot be before start time.
    currentCheck = GetCheck(1700009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700009(data.hdStartTime, data.hdEndTime)) {
      hdEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Seasonal start date and seasonal end date must either both be blank or both have a value.
    currentCheck = GetCheck(1700012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700012(data.hdSeasonalStartDate, data.hdSeasonalEndDate)) {
      hdSeasonalEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Seasonal end date cannot be before the seasonal start date.
    currentCheck = GetCheck(1700029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1700029(data.hdSeasonalStartDate, data.hdSeasonalEndDate)) {
      hdSeasonalEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateHighwayDedicationData - Finished checks");

    if (hdCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HighwayDedicationCode",
        errors: hdCodeErrors,
      });

    if (hdStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdStartDate",
        errors: hdStartDateErrors,
      });

    if (hdEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdEndDate",
        errors: hdEndDateErrors,
      });

    if (hdEndTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdEndTime",
        errors: hdEndTimeErrors,
      });

    if (hdSeasonalEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdSeasonalEndDate",
        errors: hdSeasonalEndDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a successor cross reference record
 *
 * @param {object} data - The successor cross reference record data that needs to be validated
 * @param {number} index - The index for the successor cross reference record.
 * @param {object} currentLookups - The lookup context object.
 * @return {array}
 */
export function ValidateStreetSuccessorCrossRefData(data, index, currentLookups) {
  const methodName = "ValidateStreetSuccessorCrossRefData";
  let validationErrors = [];
  let currentCheck;
  let successorErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let predecessorErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a successor.
    currentCheck = GetCheck(3000004, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000004(data.successor)) {
      successorErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(3000008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000008(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3000009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000009(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3000010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000010(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a predecessor.
    currentCheck = GetCheck(3000012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000012(data.predecessor)) {
      predecessorErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateStreetSuccessorCrossRefData - Finished checks");

    if (successorErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Successor",
        errors: successorErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (predecessorErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Predecessor",
        errors: predecessorErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a maintenance responsibility record
 *
 * @param {object} data The maintenance responsibility record data that needs to be validated
 * @param {number} index The index for the maintenance responsibility record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateMaintenanceResponsibilityData(data, index, currentLookups) {
  const methodName = "ValidateMaintenanceResponsibilityData";
  let validationErrors = [];
  let currentCheck;
  let specificLocationErrors = [];
  let custodianErrors = [];
  let maintainingAuthorityErrors = [];
  let streetStatusErrors = [];
  let stateErrors = [];
  let endDateErrors = [];
  let startDateErrors = [];
  let wholeRoadErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location is too long.
    currentCheck = GetCheck(5100008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100008(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a custodian.
    currentCheck = GetCheck(5100009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100009(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian is invalid.
    currentCheck = GetCheck(5100010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100010(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority is invalid.
    currentCheck = GetCheck(5100011, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100011(data.maintainingAuthorityCode)) {
      maintainingAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an authority.
    currentCheck = GetCheck(5100012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100012(data.maintainingAuthorityCode)) {
      maintainingAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a street status.
    currentCheck = GetCheck(5100013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100013(data.streetStatus)) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Street status is invalid.
    currentCheck = GetCheck(5100014, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100014(data.streetStatus)) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a state.
    currentCheck = GetCheck(5100015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100015(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is invalid.
    currentCheck = GetCheck(5100016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100016(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 2 but end date is not set.
    currentCheck = GetCheck(5100017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100017(data.state, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 1 but end date is set.
    currentCheck = GetCheck(5100018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100018(data.state, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(5100019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100019(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(5100020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100020(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(5100021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100021(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(5100022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100022(data.wholeRoad, data.specificLocation)) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(5100023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100023(data.wholeRoad, data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(5100026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100026(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(5100029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100029(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority does not exist in the RAUCS SWA org ref table.
    currentCheck = GetCheck(5100030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100030(data.maintainingAuthorityCode)) {
      maintainingAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(5100032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100032(data.wktGeometry)) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a backslash (\\).
    currentCheck = GetCheck(5100033, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100033(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a hyphen (-).
    currentCheck = GetCheck(5100034, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5100034(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateMaintenanceResponsibilityData - Finished checks");

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (custodianErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "CustodianCode",
        errors: custodianErrors,
      });

    if (maintainingAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "MaintainingAuthorityCode",
        errors: maintainingAuthorityErrors,
      });

    if (streetStatusErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetStatus",
        errors: streetStatusErrors,
      });

    if (stateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "State",
        errors: stateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a reinstatement designation record
 *
 * @param {object} data The reinstatement designation record data that needs to be validated
 * @param {number} index The index for the reinstatement designation record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateReinstatementCategoryData(data, index, currentLookups) {
  const methodName = "ValidateReinstatementCategoryData";
  let validationErrors = [];
  let currentCheck;
  let specificLocationErrors = [];
  let custodianErrors = [];
  let reinstatementAuthorityErrors = [];
  let reinstatementCategoryErrors = [];
  let stateErrors = [];
  let endDateErrors = [];
  let startDateErrors = [];
  let wholeRoadErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location is too long.
    currentCheck = GetCheck(5200008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200008(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a custodian.
    currentCheck = GetCheck(5200009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200009(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian is invalid.
    currentCheck = GetCheck(5200010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200010(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority is invalid.
    currentCheck = GetCheck(5200011, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200011(data.reinstatementAuthorityCode)) {
      reinstatementAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an authority.
    currentCheck = GetCheck(5200012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200012(data.reinstatementAuthorityCode)) {
      reinstatementAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a reinstatement category.
    currentCheck = GetCheck(5200013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200013(data.reinstatementCategoryCode)) {
      reinstatementCategoryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Reinstatement category is invalid.
    currentCheck = GetCheck(5200014, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200014(data.reinstatementCategoryCode)) {
      reinstatementCategoryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a state.
    currentCheck = GetCheck(5200015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200015(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is invalid.
    currentCheck = GetCheck(5200016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200016(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 2 but end date is not set.
    currentCheck = GetCheck(5200017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 2 && !data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(5200018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200018(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(5200019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200019(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(5200020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200020(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(5200021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200021(data.wholeRoad, data.specificLocation)) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(5200022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200022(data.wholeRoad, data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(5200025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200025(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(5200026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200026(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian does not exist in the RAUCS SWA org ref table.
    currentCheck = GetCheck(5200027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200027(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 1 but end date is set.
    currentCheck = GetCheck(5200030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200030(data.state, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(5200031, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200031(data.wktGeometry)) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a backslash (\\).
    currentCheck = GetCheck(5200032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200032(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a hyphen (-).
    currentCheck = GetCheck(5200033, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5200033(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateReinstatementCategoryData - Finished checks");

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (custodianErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "CustodianCode",
        errors: custodianErrors,
      });

    if (reinstatementAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ReinstatementAuthorityCode",
        errors: reinstatementAuthorityErrors,
      });

    if (reinstatementCategoryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ReinstatementCategoryCode",
        errors: reinstatementCategoryErrors,
      });

    if (stateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "State",
        errors: stateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an OneScotland special designation record
 *
 * @param {object} data The special designation record data that needs to be validated
 * @param {number} index The index for the special designation record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateOSSpecialDesignationData(data, index, currentLookups) {
  const methodName = "ValidateOSSpecialDesignationData";
  let validationErrors = [];
  let currentCheck;
  let custodianErrors = [];
  let authorityErrors = [];
  let specialDesignationErrors = [];
  let descriptionErrors = [];
  let stateErrors = [];
  let endDateErrors = [];
  let startDateErrors = [];
  let specificLocationErrors = [];
  let wholeRoadErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (includeCheck(currentCheck, true) && failsCheck1000020(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a custodian.
    currentCheck = GetCheck(5300007, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300007(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian is invalid.
    currentCheck = GetCheck(5300008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300008(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority is invalid.
    currentCheck = GetCheck(5300011, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300011(data.authorityCode)) {
      authorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an authority.
    currentCheck = GetCheck(5300012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300012(data.authorityCode)) {
      authorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a special designation.
    currentCheck = GetCheck(5300013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300013(data.specialDesignationCode)) {
      specialDesignationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Type is invalid.
    currentCheck = GetCheck(5300014, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300014(data.specialDesignationCode)) {
      specialDesignationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a description.
    currentCheck = GetCheck(5300015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300015(data.description)) {
      descriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description is too long.
    currentCheck = GetCheck(5300016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300016(data.description)) {
      descriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a state.
    currentCheck = GetCheck(5300017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300017(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is invalid.
    currentCheck = GetCheck(5300018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300018(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 2 but end date is not set.
    currentCheck = GetCheck(5300019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300019(data.state, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(5300020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(5300021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300021(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(5300022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300022(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location is too long.
    currentCheck = GetCheck(5300023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300023(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(5300024, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300024(data.wholeRoad, data.specificLocation)) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(5300025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300025(data.wholeRoad, data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(5300027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300027(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(5300028, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300028(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian does not exist in the RAUCS SWA org ref table.
    currentCheck = GetCheck(5300029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300029(data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description contains invalid characters.
    currentCheck = GetCheck(5300032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300032(data.description)) {
      descriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(5300033, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300033(data.wktGeometry)) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a backslash (\\).
    currentCheck = GetCheck(5300034, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300034(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a hyphen (-).
    currentCheck = GetCheck(5300035, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300035(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 1 but end date is set.
    currentCheck = GetCheck(5300036, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck5300036(data.state, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOSSpecialDesignationData - Finished checks");

    if (custodianErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "CustodianCode",
        errors: custodianErrors,
      });

    if (authorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AuthorityCode",
        errors: authorityErrors,
      });

    if (specialDesignationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesignationCode",
        errors: specialDesignationErrors,
      });

    if (descriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Description",
        errors: descriptionErrors,
      });

    if (stateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "State",
        errors: stateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an interest record
 *
 * @param {object} data The interest record data that needs to be validated
 * @param {number} index The index for the interest record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateInterestData(data, index, currentLookups) {
  const methodName = "ValidateInterestData";
  let validationErrors = [];
  let currentCheck;
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let swaOrgRefAuthorityErrors = [];
  let districtRefAuthorityErrors = [];
  let specificLocationErrors = [];
  let wholeRoadErrors = [];
  let streetStatusErrors = [];
  let interestTypeErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6100006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100006(data.startX)) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6100007, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100007(data.startY)) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6100008, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100008(data.endX)) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6100009, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100009(data.endY)) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Authority is invalid.
    currentCheck = GetCheck(6100011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100011(data.swaOrgRefAuthority)) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter an authority.
    currentCheck = GetCheck(6100012, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100012(data.swaOrgRefAuthority)) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a district.
    currentCheck = GetCheck(6100013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100013(data.districtRefAuthority)) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // District is invalid.
    currentCheck = GetCheck(6100014, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100014(data.districtRefAuthority, currentLookups)) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6100021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100021(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(6100022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100022(data.specificLocation, data.wholeRoad)) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location and coordinates must be set.
    currentCheck = GetCheck(6100023, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6100023(data.specificLocation, data.wholeRoad, data.startX, data.startY, data.endX, data.endY)
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains an invalid character.
    currentCheck = GetCheck(6100027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100027(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Street status is invalid.
    currentCheck = GetCheck(6100029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100029(data.streetStatus)) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an interest type.
    currentCheck = GetCheck(6100030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100030(data.interestType)) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interest type is invalid.
    currentCheck = GetCheck(6100031, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100031(data.interestType)) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // An interest type of 8 or 9 must not have street status of 1, 2, 3 or 5.
    currentCheck = GetCheck(6100035, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100035(data.interestType, data.streetStatus)) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Maintaining organisation is invalid.
    currentCheck = GetCheck(6100036, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100036(data.swaOrgRefAuthority)) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interested organisation code must not be 0011, 0012, 0013, 0014, 0016, 0020 or 7093.
    currentCheck = GetCheck(6100037, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100037(data.swaOrgRefAuthority)) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interested organisation street status of 4 must have an interest type of 8 or 9.
    currentCheck = GetCheck(6100038, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100038(data.interestType, data.streetStatus)) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(6100040, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100040(data.recordStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(6100041, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100041(data.recordEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(6100042, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100042(data.recordStartDate, data.recordEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date prior to 1990 is not allowed.
    currentCheck = GetCheck(6100043, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100043(data.recordStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(6100044, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100044(data.wktGeometry)) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interested organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6100046, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100046(data.swaOrgRefAuthority)) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6100047, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100047(data.districtRefAuthority, currentLookups)) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a start date.
    currentCheck = GetCheck(6100049, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100049(data.recordStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Interest type of 1 must have a street status of 1, 2, 3 or 5.
    currentCheck = GetCheck(6100050, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100050(data.interestType, data.streetStatus)) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set then specify location must not contain "WHOLE ROAD".
    currentCheck = GetCheck(6100051, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100051(data.wholeRoad, data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If maintaining organisation is 0011, 0012, 0014, 0016, or 0020, street status must be 4.
    currentCheck = GetCheck(6100052, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6100052(data.swaOrgRefAuthMaintaining, data.streetStatus)) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateInterestData - Finished checks");

    if (swaOrgRefAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefAuthority",
        errors: swaOrgRefAuthorityErrors,
      });

    if (districtRefAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefAuthority",
        errors: districtRefAuthorityErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndY",
        errors: endYErrors,
      });

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (streetStatusErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetStatus",
        errors: streetStatusErrors,
      });

    if (interestTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "InterestType",
        errors: interestTypeErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: endDateErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an construction record
 *
 * @param {object} data The construction record data that needs to be validated
 * @param {number} index The index for the construction record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateConstructionData(data, index, currentLookups) {
  const methodName = "ValidateConstructionData";
  let validationErrors = [];
  let currentCheck;
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let swaOrgRefConsultantErrors = [];
  let districtRefConsultantErrors = [];
  let reinstatementTypeCodeErrors = [];
  let constructionTypeErrors = [];
  let aggregateAbrasionValErrors = [];
  let polishedStoneValErrors = [];
  let specificLocationErrors = [];
  let recordStartDateErrors = [];
  let recordEndDateErrors = [];
  let wholeRoadErrors = [];
  let constructionDescriptionErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6200006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200006(data.constructionStartX)) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6200007, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200007(data.constructionStartY)) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6200008, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200008(data.constructionEndX)) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6200009, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200009(data.constructionEndY)) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6200014, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200014(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // District is invalid.
    currentCheck = GetCheck(6200015, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200015(data.districtRefConsultant, currentLookups)) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a construction reinstatement type.
    currentCheck = GetCheck(6200016, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200016(data.constructionType, data.reinstatementTypeCode)) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Reinstatement type is invalid.
    currentCheck = GetCheck(6200017, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200017(data.reinstatementTypeCode)) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a construction type.
    currentCheck = GetCheck(6200018, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200018(data.constructionType)) {
      constructionTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Construction type is invalid.
    currentCheck = GetCheck(6200019, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200019(data.constructionType)) {
      constructionTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Aggregate abrasion value is invalid.
    currentCheck = GetCheck(6200020, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200020(data.aggregateAbrasionVal, data.reinstatementTypeCode)) {
      aggregateAbrasionValErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Polished stone value invalid.
    currentCheck = GetCheck(6200022, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200022(data.polishedStoneVal, data.reinstatementTypeCode)) {
      polishedStoneValErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6200023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200023(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(6200024, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200024(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(6200025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200025(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(6200026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200026(data.recordStartDate, data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(6200027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200027(data.wholeRoad, data.specificLocation)) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location and coordinates must be set.
    currentCheck = GetCheck(6200028, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6200028(
        data.wholeRoad,
        data.specificLocation,
        data.constructionStartX,
        data.constructionStartY,
        data.constructionEndX,
        data.constructionEndY
      )
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(6200030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200030(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // When construction type is 1, description must be blank.
    currentCheck = GetCheck(6200033, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200033(data.constructionType, data.constructionDescription)) {
      constructionDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6200038, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200038(data.swaOrgRefConsultant, data.districtRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description contains an invalid character.
    currentCheck = GetCheck(6200046, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200046(data.constructionDescription)) {
      constructionDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description is too long.
    currentCheck = GetCheck(6200047, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200047(data.constructionDescription)) {
      constructionDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6200048, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200048(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation code of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
    currentCheck = GetCheck(6200050, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200050(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6200051, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200051(data.districtRefConsultant, currentLookups)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Reinstatement type must not be present when construction type is 2 or 3.
    currentCheck = GetCheck(6200052, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200052(data.constructionType, data.reinstatementTypeCode)) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set then specify location must not contain "WHOLE ROAD".
    currentCheck = GetCheck(6200053, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200053(data.wholeRoad, data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(6200055, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6200055(data.wktGeometry)) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateConstructionData - Finished checks");

    if (reinstatementTypeCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ReinstatementTypeCode",
        errors: reinstatementTypeCodeErrors,
      });

    if (constructionTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionType",
        errors: constructionTypeErrors,
      });

    if (swaOrgRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefConsultant",
        errors: swaOrgRefConsultantErrors,
      });

    if (districtRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefConsultant",
        errors: districtRefConsultantErrors,
      });

    if (aggregateAbrasionValErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AggregateAbrasionVal",
        errors: aggregateAbrasionValErrors,
      });

    if (polishedStoneValErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PolishedStoneVal",
        errors: polishedStoneValErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionStartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionStartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionEndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionEndY",
        errors: endYErrors,
      });

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });

    if (constructionDescriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionDescription",
        errors: constructionDescriptionErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a GeoPlace special designation record
 *
 * @param {object} data The special designation record data that needs to be validated
 * @param {number} index The index for the special designation record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateSpecialDesignationData(data, index, currentLookups) {
  const methodName = "ValidateSpecialDesignationData";
  let validationErrors = [];
  let currentCheck;
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let recordStartDateErrors = [];
  let recordEndDateErrors = [];
  let specialDesigStartDateErrors = [];
  let specialDesigEndDateErrors = [];
  let streetSpecialDesigCodeErrors = [];
  let specialDesigDescriptionErrors = [];
  let specialDesigPeriodicityCodeErrors = [];
  let specialDesigStartTimeErrors = [];
  let specialDesigEndTimeErrors = [];
  let specificLocationErrors = [];
  let wholeRoadErrors = [];
  let swaOrgRefConsultantCodeErrors = [];
  let districtRefConsultantErrors = [];
  let specialDesigSourceTextErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.specialDesigStartDate)) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.specialDesigEndDate)) {
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6300006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300006(data.specialDesigStartX)) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6300007, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300007(data.specialDesigStartY)) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6300008, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300008(data.specialDesigEndX)) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6300009, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300009(data.specialDesigEndY)) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record start date cannot be in the future.
    currentCheck = GetCheck(6300010, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300010(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date cannot be in the future.
    currentCheck = GetCheck(6300011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300011(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(6300012, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300012(data.recordStartDate, data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a record start date.
    currentCheck = GetCheck(6300013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300013(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End date cannot be before the special designation start date.
    currentCheck = GetCheck(6300014, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300014(data.specialDesigEndDate, data.specialDesigStartDate)) {
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start date cannot be before the record start date.
    currentCheck = GetCheck(6300015, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300015(data.recordStartDate, data.specialDesigStartDate)) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Type is invalid.
    currentCheck = GetCheck(6300016, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300016(data.streetSpecialDesigCode)) {
      streetSpecialDesigCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a type.
    currentCheck = GetCheck(6300017, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300017(data.streetSpecialDesigCode)) {
      streetSpecialDesigCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a description.
    currentCheck = GetCheck(6300018, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300018(data.recordStartDate, data.specialDesigDescription)) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Description is too long.
    currentCheck = GetCheck(6300019, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300019(data.specialDesigDescription)) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Periodicity is invalid.
    currentCheck = GetCheck(6300025, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300025(data.specialDesigPeriodicityCode)) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start time and end time must either both be blank or both have a value.
    currentCheck = GetCheck(6300029, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300029(data.specialDesigStartTime, data.specialDesigEndTime)) {
      specialDesigStartTimeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End time cannot be before start time.
    currentCheck = GetCheck(6300030, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300030(data.specialDesigStartTime, data.specialDesigEndTime)) {
      specialDesigEndTimeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6300031, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300031(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(6300032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300032(data.wholeRoad, data.specificLocation)) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location and coordinates must be set.
    currentCheck = GetCheck(6300033, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300033(
        data.wholeRoad,
        data.specificLocation,
        data.specialDesigStartX,
        data.specialDesigStartY,
        data.specialDesigEndX,
        data.specialDesigEndY
      )
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6300037, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300037(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // When periodicity is 16, description is mandatory.
    currentCheck = GetCheck(6300038, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300038(data.specialDesigPeriodicityCode, data.specialDesigDescription)
    ) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record start date prior to 1990 is not allowed.
    currentCheck = GetCheck(6300040, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300040(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a periodicity.
    currentCheck = GetCheck(6300042, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300042(data.specialDesigPeriodicityCode)) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation codes of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
    currentCheck = GetCheck(6300043, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300043(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6300044, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300044(data.swaOrgRefConsultant, data.districtRefConsultant)) {
      swaOrgRefConsultantCodeErrors.push(GetErrorMessage(currentCheck, true));
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6300045, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300045(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If type is 1,3,6,8,9,10,12,20,22,or 28 then the periodicity must be 1.
    currentCheck = GetCheck(6300046, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300046(data.streetSpecialDesigCode, data.specialDesigPeriodicityCode)
    ) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set then specify location must not contain "WHOLE ROAD".
    currentCheck = GetCheck(6300047, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300047(data.wholeRoad, data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Source contains invalid characters.
    currentCheck = GetCheck(6300049, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300049(data.specialDesigSourceText)) {
      specialDesigSourceTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Periodicity of 15 must have special designation start date and time and end date and time.
    currentCheck = GetCheck(6300050, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300050(data.specialDesigPeriodicityCode, data.specialDesigStartDate)
    ) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300050(data.specialDesigPeriodicityCode, data.specialDesigEndDate)
    ) {
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300050(data.specialDesigPeriodicityCode, data.specialDesigStartTime)
    ) {
      specialDesigStartTimeErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300050(data.specialDesigPeriodicityCode, data.specialDesigEndTime)
    ) {
      specialDesigEndTimeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6300051, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300051(data.districtRefConsultant, currentLookups)) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(6300052, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6300052(data.wktGeometry)) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If type is 2 to 18, 20 or 22 to 30 and either operational start date or operational end date is present, both must be present.
    currentCheck = GetCheck(6300053, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6300053(data.streetSpecialDesigCode, data.specialDesigStartDate, data.specialDesigEndDate)
    ) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, true));
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateSpecialDesignationData - Finished checks");

    if (streetSpecialDesigCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetSpecialDesigCode",
        errors: streetSpecialDesigCodeErrors,
      });

    if (specialDesigDescriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigDescription",
        errors: specialDesigDescriptionErrors,
      });

    if (specialDesigPeriodicityCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigPeriodicityCode",
        errors: specialDesigPeriodicityCodeErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndY",
        errors: endYErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (specialDesigStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartDate",
        errors: specialDesigStartDateErrors,
      });

    if (specialDesigEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndDate",
        errors: specialDesigEndDateErrors,
      });

    if (specialDesigStartTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartTime",
        errors: specialDesigStartTimeErrors,
      });

    if (specialDesigEndTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndTime",
        errors: specialDesigEndTimeErrors,
      });

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });

    if (swaOrgRefConsultantCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefConsultant",
        errors: swaOrgRefConsultantCodeErrors,
      });

    if (districtRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefConsultant",
        errors: districtRefConsultantErrors,
      });

    if (specialDesigSourceTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigSourceText",
        errors: specialDesigSourceTextErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a height, width and weight restriction record
 *
 * @param {object} data The height, width and weight restriction record data that needs to be validated
 * @param {number} index The index for the height, width and weight restriction record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateHeightWidthWeightData(data, index, currentLookups) {
  const methodName = "ValidateHeightWidthWeightData";
  let validationErrors = [];
  let currentCheck;
  let restrictionCodeErrors = [];
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let specificLocationErrors = [];
  let recordEndDateErrors = [];
  let recordStartDateErrors = [];
  let wholeRoadErrors = [];
  let troTextErrors = [];
  let featureDescriptionErrors = [];
  let swaOrgRefConsultantErrors = [];
  let districtRefConsultantErrors = [];
  let sourceTextErrors = [];
  let valueMetricErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Type is invalid.
    currentCheck = GetCheck(6400005, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400005(data.hwwRestrictionCode)) {
      restrictionCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a type.
    currentCheck = GetCheck(6400006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400006(data.hwwRestrictionCode)) {
      restrictionCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6400009, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400009(data.wholeRoad, data.hwwStartX)) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6400010, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400010(data.wholeRoad, data.hwwStartY)) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6400011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400011(data.wholeRoad, data.hwwEndX)) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6400012, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400012(data.wholeRoad, data.hwwEndY)) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6400016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400016(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record end date cannot be before the record start date.
    currentCheck = GetCheck(6400018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400018(data.recordStartDate, data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record end date cannot be in the future.
    currentCheck = GetCheck(6400019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400019(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location and coordinates must be blank.
    currentCheck = GetCheck(6400021, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6400021(
        data.wholeRoad,
        data.specificLocation,
        data.hwwStartX,
        data.hwwStartY,
        data.hwwEndX,
        data.hwwEndY
      )
    ) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location and coordinates must be set.
    currentCheck = GetCheck(6400022, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6400022(
        data.wholeRoad,
        data.specificLocation,
        data.hwwStartX,
        data.hwwStartY,
        data.hwwEndX,
        data.hwwEndY
      )
    ) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6400023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400023(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Value is invalid.
    currentCheck = GetCheck(6400025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400025(data.valueMetric)) {
      valueMetricErrors.push(GetErrorMessage(currentCheck, true));
    }

    // TRO text is too long.
    currentCheck = GetCheck(6400026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400026(data.troText)) {
      troTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // TRO text contains invalid characters.
    currentCheck = GetCheck(6400027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400027(data.troText)) {
      troTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description is too long.
    currentCheck = GetCheck(6400028, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400028(data.featureDescription)) {
      featureDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description contains invalid characters.
    currentCheck = GetCheck(6400029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400029(data.featureDescription)) {
      featureDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation code of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
    currentCheck = GetCheck(6400030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400030(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6400031, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400031(data.swaOrgRefConsultant, data.districtRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District is invalid.
    currentCheck = GetCheck(6400032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400032(data.districtRefConsultant, currentLookups)) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Source is too long.
    currentCheck = GetCheck(6400039, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400039(data.sourceText)) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Source contains invalid characters.
    currentCheck = GetCheck(6400040, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400040(data.sourceText)) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(6400043, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400043(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(6400044, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400044(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date prior to 1990 are not allowed.
    currentCheck = GetCheck(6400045, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400045(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a value.
    currentCheck = GetCheck(6400046, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400046(data.valueMetric)) {
      valueMetricErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6400047, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400047(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6400048, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400048(data.districtRefConsultant, currentLookups)) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation is invalid.
    currentCheck = GetCheck(6400049, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6400049(data.swaOrgRefConsultant)) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateHeightWidthWeightData - Finished checks");

    if (restrictionCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwRestrictionCode",
        errors: restrictionCodeErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwStartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwStartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwEndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwEndY",
        errors: endYErrors,
      });

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (troTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "TroText",
        errors: troTextErrors,
      });

    if (featureDescriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "FeatureDescription",
        errors: featureDescriptionErrors,
      });

    if (swaOrgRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefConsultant",
        errors: swaOrgRefConsultantErrors,
      });

    if (districtRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefConsultant",
        errors: districtRefConsultantErrors,
      });

    if (sourceTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SourceText",
        errors: sourceTextErrors,
      });

    if (valueMetricErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ValueMetric",
        errors: valueMetricErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a public rights of way record
 *
 * @param {object} data The public rights of way record data that needs to be validated
 * @param {number} index The index for the public rights of way record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidatePublicRightOfWayData(data, index, currentLookups) {
  const methodName = "ValidatePublicRightOfWayData";
  let validationErrors = [];
  let currentCheck;
  let prowRightsErrors = [];
  let prowStatusErrors = [];
  let prowLengthErrors = [];
  let defMapGeometryTypeErrors = [];
  let recordStartDateErrors = [];
  let relevantStartDateErrors = [];
  let recordEndDateErrors = [];
  let prowLocationErrors = [];
  let prowDetailsErrors = [];
  let sourceTextErrors = [];
  let prowOrgRefConsultantErrors = [];
  let prowDistrictRefConsultantErrors = [];
  let appealDetailsErrors = [];
  let appealRefErrors = [];
  let consultRefErrors = [];
  let consultDetailsErrors = [];
  let consultStartDateErrors = [];
  let consultEndDateErrors = [];
  let appealDateErrors = [];
  let divRelatedUsrnErrors = [];

  if (data) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.relevantStartDate)) {
      relevantStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.consultStartDate)) {
      consultStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.consultEndDate)) {
      consultEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }
    if (includeCheck(currentCheck, false) && failsCheck1000020(data.appealDate)) {
      appealDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a dedication.
    currentCheck = GetCheck(6600011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600011(data.prowRights)) {
      prowRightsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Dedication is invalid.
    currentCheck = GetCheck(6600012, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600012(data.prowRights)) {
      prowRightsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a status.
    currentCheck = GetCheck(6600013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600013(data.prowStatus)) {
      prowStatusErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Status is invalid.
    currentCheck = GetCheck(6600014, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600014(data.prowStatus)) {
      prowStatusErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Length is invalid.
    currentCheck = GetCheck(6600017, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600017(data.prowLength)) {
      prowLengthErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a length.
    currentCheck = GetCheck(6600019, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600019(data.prowLength)) {
      prowLengthErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a start date.
    currentCheck = GetCheck(6600027, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600027(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(6600028, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600028(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start date prior to 1990 are not allowed.
    currentCheck = GetCheck(6600029, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600029(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Relevant start date prior to 1990 are not allowed.
    currentCheck = GetCheck(6600030, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600030(data.relevantStartDate)) {
      relevantStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date prior to 1990 are not allowed.
    currentCheck = GetCheck(6600032, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600032(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date cannot be in the future.
    currentCheck = GetCheck(6600033, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600033(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Location is too long.
    currentCheck = GetCheck(6600034, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600034(data.prowLocation)) {
      prowLocationErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Location contains an invalid character.
    currentCheck = GetCheck(6600035, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600035(data.prowLocation)) {
      prowLocationErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Details is too long.
    currentCheck = GetCheck(6600036, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600036(data.prowDetails)) {
      prowDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Details contains an invalid character.
    currentCheck = GetCheck(6600037, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600037(data.prowDetails)) {
      prowDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Source is too long.
    currentCheck = GetCheck(6600040, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600040(data.sourceText)) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Source contains an invalid character.
    currentCheck = GetCheck(6600041, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600041(data.sourceText)) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, false));
    }

    // PRoW org ref consultant is invalid.
    currentCheck = GetCheck(6600042, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600042(data.prowOrgRefConsultant)) {
      prowOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6600043, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      failsCheck6600043(data.prowOrgRefConsultant, data.prowDistrictRefConsultant)
    ) {
      prowOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
      prowDistrictRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // District is invalid.
    currentCheck = GetCheck(6600044, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600044(data.prowDistrictRefConsultant, currentLookups)) {
      prowDistrictRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a location.
    currentCheck = GetCheck(6600046, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600046(data.prowLocation)) {
      prowLocationErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter details.
    currentCheck = GetCheck(6600047, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600047(data.prowDetails)) {
      prowDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Appeal details is too long.
    currentCheck = GetCheck(6600048, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600048(data.appealDetails)) {
      appealDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Appeal reference is too long.
    currentCheck = GetCheck(6600049, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600049(data.appealRef)) {
      appealRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Consultation reference is too long.
    currentCheck = GetCheck(6600050, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600050(data.consultRef)) {
      consultRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Consultation details is too long.
    currentCheck = GetCheck(6600051, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600051(data.consultDetails)) {
      consultDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Status of 'C' the consultation start date, end date, reference and details must be present.
    currentCheck = GetCheck(6600053, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600053(data.prowStatus, data.consultStartDate)) {
      consultStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && failsCheck6600053(data.prowStatus, data.consultEndDate)) {
      consultEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && failsCheck6600053(data.prowStatus, data.consultRef)) {
      consultRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && failsCheck6600053(data.prowStatus, data.consultDetails)) {
      consultDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Consultation end date must be the same as or after the consultation start date.
    currentCheck = GetCheck(6600054, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600054(data.consultStartDate, data.consultEndDate)) {
      consultEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Status of 'A' the Appeal reference, date and details must be present.
    currentCheck = GetCheck(6600055, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600055(data.prowStatus, data.appealDate)) {
      appealDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && failsCheck6600055(data.prowStatus, data.appealRef)) {
      appealRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && failsCheck6600055(data.prowStatus, data.appealDetails)) {
      appealDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Status of 'D' the diversion USRN must be present.
    currentCheck = GetCheck(6600056, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600056(data.prowStatus, data.divRelatedUsrn)) {
      divRelatedUsrnErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6600058, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && failsCheck6600058(data.prowOrgRefConsultant)) {
      prowOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidatePublicRightOfWayData - Finished checks");

    if (prowRightsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwRights",
        errors: prowRightsErrors,
      });

    if (prowStatusErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwStatus",
        errors: prowStatusErrors,
      });

    if (prowLengthErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwLength",
        errors: prowLengthErrors,
      });

    if (defMapGeometryTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "defMapGeometryType",
        errors: defMapGeometryTypeErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (relevantStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RelevantStartDate",
        errors: relevantStartDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (prowLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwLocation",
        errors: prowLocationErrors,
      });

    if (prowDetailsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwDetails",
        errors: prowDetailsErrors,
      });

    if (sourceTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SourceText",
        errors: sourceTextErrors,
      });

    if (prowOrgRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwOrgRefConsultant",
        errors: prowOrgRefConsultantErrors,
      });

    if (prowDistrictRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwDistrictRefConsultant",
        errors: prowDistrictRefConsultantErrors,
      });

    if (appealDetailsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AppealDetails",
        errors: appealDetailsErrors,
      });

    if (appealRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AppealRef",
        errors: appealRefErrors,
      });

    if (consultRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultRef",
        errors: consultRefErrors,
      });

    if (consultDetailsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultDetails",
        errors: consultDetailsErrors,
      });

    if (consultStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultStartDate",
        errors: consultStartDateErrors,
      });

    if (consultEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultEndDate",
        errors: consultEndDateErrors,
      });

    if (appealDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AppealDate",
        errors: appealDateErrors,
      });

    if (divRelatedUsrnErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DivRelatedUsrn",
        errors: divRelatedUsrnErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a street note record
 *
 * @param {object} data The street note record data that needs to be validated
 * @param {number} index The index for the street note record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateStreetNoteData(data, index, currentLookups, isScottish) {
  const methodName = "ValidateStreetNoteData";
  let validationErrors = [];
  let currentCheck;
  let noteErrors = [];

  if (data) {
    // Note does not exist.
    currentCheck = GetCheck(7200005, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck7200005(data.note)) {
      noteErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateStreetNoteData - Finished checks");

    if (noteErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Note",
        errors: noteErrors,
      });
  }

  return validationErrors;
}
