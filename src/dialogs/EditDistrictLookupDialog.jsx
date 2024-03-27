//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to edit an existing operational district record
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   01.02.24 Sean Flook                 Initial Revision.
//    002   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    003   27.03.24 Sean Flook                 Added ADSDialogTitle.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";

import { GetLookupLabel, filteredLookup, isFutureDate, isPriorTo1990 } from "../utils/HelperUtils";

import { Dialog, DialogActions, DialogContent, Button } from "@mui/material";
import { Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import SwaOrgRef from "../data/SwaOrgRef";
import OperationalDistrictFunction from "../data/OperationalDistrictFunction";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditDistrictLookupDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(["district", "ftp", "fpnDelivery", "fpnPayment", "fpnContact", "unknown"]).isRequired,
  data: PropTypes.object.isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditDistrictLookupDialog({ isOpen, variant, data, onDone, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);

  const [showDialog, setShowDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");

  const [organisationId, setOrganisationId] = useState(0);
  const [districtName, setDistrictName] = useState("");
  const [districtId, setDistrictId] = useState(0);
  const [districtFunction, setDistrictFunction] = useState(0);
  const [districtClosed, setDistrictClosed] = useState(null);
  const [districtFtpServerName, setDistrictFtpServerName] = useState("");
  const [districtServerIpAddress, setDistrictServerIpAddress] = useState("");
  const [districtFtpDirectory, setDistrictFtpDirectory] = useState("");
  const [districtNotificationsUrl, setDistrictNotificationsUrl] = useState("");
  const [attachmentUrlPrefix, setAttachmentUrlPrefix] = useState("");
  const [districtFaxNo, setDistrictFaxNo] = useState("");
  const [districtPostcode, setDistrictPostcode] = useState("");
  const [districtTelNo, setDistrictTelNo] = useState("");
  const [outOfHoursArrangements, setOutOfHoursArrangements] = useState(false);
  const [fpnDeliveryUrl, setFpnDeliveryUrl] = useState("");
  const [fpnFaxNumber, setFpnFaxNumber] = useState("");
  const [fpnDeliveryPostcode, setFpnDeliveryPostcode] = useState("");
  const [fpnPaymentUrl, setFpnPaymentUrl] = useState("");
  const [fpnPaymentTelNo, setFpnPaymentTelNo] = useState("");
  const [fpnPaymentBankName, setFpnPaymentBankName] = useState("");
  const [fpnPaymentSortCode, setFpnPaymentSortCode] = useState("");
  const [fpnPaymentAccountNo, setFpnPaymentAccountNo] = useState("");
  const [fpnPaymentAccountName, setFpnPaymentAccountName] = useState("");
  const [fpnPaymentPostcode, setFpnPaymentPostcode] = useState("");
  const [fpnContactName, setFpnContactName] = useState("");
  const [fpnContactPostcode, setFpnContactPostcode] = useState("");
  const [fpnContactTelNo, setFpnContactTelNo] = useState("");
  const [districtPostalAddress1, setDistrictPostalAddress1] = useState("");
  const [districtPostalAddress2, setDistrictPostalAddress2] = useState("");
  const [districtPostalAddress3, setDistrictPostalAddress3] = useState("");
  const [districtPostalAddress4, setDistrictPostalAddress4] = useState("");
  const [districtPostalAddress5, setDistrictPostalAddress5] = useState("");
  const [fpnDeliveryAddress1, setFpnDeliveryAddress1] = useState("");
  const [fpnDeliveryAddress2, setFpnDeliveryAddress2] = useState("");
  const [fpnDeliveryAddress3, setFpnDeliveryAddress3] = useState("");
  const [fpnDeliveryAddress4, setFpnDeliveryAddress4] = useState("");
  const [fpnDeliveryAddress5, setFpnDeliveryAddress5] = useState("");
  const [fpnContactAddress1, setFpnContactAddress1] = useState("");
  const [fpnContactAddress2, setFpnContactAddress2] = useState("");
  const [fpnContactAddress3, setFpnContactAddress3] = useState("");
  const [fpnContactAddress4, setFpnContactAddress4] = useState("");
  const [fpnContactAddress5, setFpnContactAddress5] = useState("");
  const [fpnPaymentAddress1, setFpnPaymentAddress1] = useState("");
  const [fpnPaymentAddress2, setFpnPaymentAddress2] = useState("");
  const [fpnPaymentAddress3, setFpnPaymentAddress3] = useState("");
  const [fpnPaymentAddress4, setFpnPaymentAddress4] = useState("");
  const [fpnPaymentAddress5, setFpnPaymentAddress5] = useState("");
  const [fpnDeliveryEmailAddress, setFpnDeliveryEmailAddress] = useState("");
  const [districtPermitSchemeId, setDistrictPermitSchemeId] = useState("");

  const [organisationIdError, setOrganisationIdError] = useState(null);
  const [districtNameError, setDistrictNameError] = useState(null);
  const [districtIdError, setDistrictIdError] = useState(null);
  const [districtFunctionError, setDistrictFunctionError] = useState(null);
  const [districtClosedError, setDistrictClosedError] = useState(null);
  const [districtFtpServerNameError, setDistrictFtpServerNameError] = useState(null);
  const [districtServerIpAddressError, setDistrictServerIpAddressError] = useState(null);
  const [districtFtpDirectoryError, setDistrictFtpDirectoryError] = useState(null);
  const [districtNotificationsUrlError, setDistrictNotificationsUrlError] = useState(null);
  const [attachmentUrlPrefixError, setAttachmentUrlPrefixError] = useState(null);
  const [districtFaxNoError, setDistrictFaxNoError] = useState(null);
  const [districtPostcodeError, setDistrictPostcodeError] = useState(null);
  const [districtTelNoError, setDistrictTelNoError] = useState(null);
  const [outOfHoursArrangementsError, setOutOfHoursArrangementsError] = useState(null);
  const [fpnDeliveryUrlError, setFpnDeliveryUrlError] = useState(null);
  const [fpnFaxNumberError, setFpnFaxNumberError] = useState(null);
  const [fpnDeliveryPostcodeError, setFpnDeliveryPostcodeError] = useState(null);
  const [fpnPaymentUrlError, setFpnPaymentUrlError] = useState(null);
  const [fpnPaymentTelNoError, setFpnPaymentTelNoError] = useState(null);
  const [fpnPaymentBankNameError, setFpnPaymentBankNameError] = useState(null);
  const [fpnPaymentSortCodeError, setFpnPaymentSortCodeError] = useState(null);
  const [fpnPaymentAccountNoError, setFpnPaymentAccountNoError] = useState(null);
  const [fpnPaymentAccountNameError, setFpnPaymentAccountNameError] = useState(null);
  const [fpnPaymentPostcodeError, setFpnPaymentPostcodeError] = useState(null);
  const [fpnContactNameError, setFpnContactNameError] = useState(null);
  const [fpnContactPostcodeError, setFpnContactPostcodeError] = useState(null);
  const [fpnContactTelNoError, setFpnContactTelNoError] = useState(null);
  const [districtPostalAddress1Error, setDistrictPostalAddress1Error] = useState(null);
  const [districtPostalAddress2Error, setDistrictPostalAddress2Error] = useState(null);
  const [districtPostalAddress3Error, setDistrictPostalAddress3Error] = useState(null);
  const [districtPostalAddress4Error, setDistrictPostalAddress4Error] = useState(null);
  const [districtPostalAddress5Error, setDistrictPostalAddress5Error] = useState(null);
  const [fpnDeliveryAddress1Error, setFpnDeliveryAddress1Error] = useState(null);
  const [fpnDeliveryAddress2Error, setFpnDeliveryAddress2Error] = useState(null);
  const [fpnDeliveryAddress3Error, setFpnDeliveryAddress3Error] = useState(null);
  const [fpnDeliveryAddress4Error, setFpnDeliveryAddress4Error] = useState(null);
  const [fpnDeliveryAddress5Error, setFpnDeliveryAddress5Error] = useState(null);
  const [fpnContactAddress1Error, setFpnContactAddress1Error] = useState(null);
  const [fpnContactAddress2Error, setFpnContactAddress2Error] = useState(null);
  const [fpnContactAddress3Error, setFpnContactAddress3Error] = useState(null);
  const [fpnContactAddress4Error, setFpnContactAddress4Error] = useState(null);
  const [fpnContactAddress5Error, setFpnContactAddress5Error] = useState(null);
  const [fpnPaymentAddress1Error, setFpnPaymentAddress1Error] = useState(null);
  const [fpnPaymentAddress2Error, setFpnPaymentAddress2Error] = useState(null);
  const [fpnPaymentAddress3Error, setFpnPaymentAddress3Error] = useState(null);
  const [fpnPaymentAddress4Error, setFpnPaymentAddress4Error] = useState(null);
  const [fpnPaymentAddress5Error, setFpnPaymentAddress5Error] = useState(null);
  const [fpnDeliveryEmailAddressError, setFpnDeliveryEmailAddressError] = useState(null);
  const [districtPermitSchemeIdError, setDistrictPermitSchemeIdError] = useState(null);

  /**
   * Method to get the lookup data.
   *
   * @returns {object} The lookup data object.
   */
  const getLookupData = () => {
    switch (variant) {
      case "district":
        return {
          organisationId: organisationId,
          districtName: districtName,
          districtId: districtId,
          districtFunction: districtFunction,
          districtClosed: districtClosed,
          districtFaxNo: districtFaxNo,
          districtPostcode: districtPostcode,
          districtTelNo: districtTelNo,
          districtPostalAddress1: districtPostalAddress1,
          districtPostalAddress2: districtPostalAddress2,
          districtPostalAddress3: districtPostalAddress3,
          districtPostalAddress4: districtPostalAddress4,
          districtPostalAddress5: districtPostalAddress5,
        };

      case "ftp":
        return {
          districtFtpServerName: districtFtpServerName,
          districtServerIpAddress: districtServerIpAddress,
          districtFtpDirectory: districtFtpDirectory,
          districtNotificationsUrl: districtNotificationsUrl,
          attachmentUrlPrefix: attachmentUrlPrefix,
        };

      case "fpnDelivery":
        return {
          fpnDeliveryUrl: fpnDeliveryUrl,
          fpnFaxNumber: fpnFaxNumber,
          fpnDeliveryPostcode: fpnDeliveryPostcode,
          fpnDeliveryAddress1: fpnDeliveryAddress1,
          fpnDeliveryAddress2: fpnDeliveryAddress2,
          fpnDeliveryAddress3: fpnDeliveryAddress3,
          fpnDeliveryAddress4: fpnDeliveryAddress4,
          fpnDeliveryAddress5: fpnDeliveryAddress5,
          fpnDeliveryEmailAddress: fpnDeliveryEmailAddress,
        };

      case "fpnPayment":
        return {
          fpnPaymentUrl: fpnPaymentUrl,
          fpnPaymentTelNo: fpnPaymentTelNo,
          fpnPaymentBankName: fpnPaymentBankName,
          fpnPaymentSortCode: fpnPaymentSortCode,
          fpnPaymentAccountNo: fpnPaymentAccountNo,
          fpnPaymentAccountName: fpnPaymentAccountName,
          fpnPaymentPostcode: fpnPaymentPostcode,
          fpnPaymentAddress1: fpnPaymentAddress1,
          fpnPaymentAddress2: fpnPaymentAddress2,
          fpnPaymentAddress3: fpnPaymentAddress3,
          fpnPaymentAddress4: fpnPaymentAddress4,
          fpnPaymentAddress5: fpnPaymentAddress5,
        };

      case "fpnContact":
        return {
          fpnContactName: fpnContactName,
          fpnContactPostcode: fpnContactPostcode,
          fpnContactTelNo: fpnContactTelNo,
          fpnContactAddress1: fpnContactAddress1,
          fpnContactAddress2: fpnContactAddress2,
          fpnContactAddress3: fpnContactAddress3,
          fpnContactAddress4: fpnContactAddress4,
          fpnContactAddress5: fpnContactAddress5,
          outOfHoursArrangements: outOfHoursArrangements,
          districtPermitSchemeId: districtPermitSchemeId,
        };

      default:
        break;
    }
  };

  /**
   * Method to determine if the data has been changed or not.
   *
   * @returns {boolean} True if the data has been changed; otherwise false.
   */
  const hasDataChanged = () => {
    let dataChanged = false;

    switch (variant) {
      case "district":
        dataChanged =
          organisationId !== data.organisationId ||
          districtName !== data.districtName ||
          districtId !== data.districtId ||
          districtFunction !== data.districtFunction ||
          districtClosed !== data.districtClosed ||
          districtFaxNo !== data.districtFaxNo ||
          districtPostcode !== data.districtPostcode ||
          districtTelNo !== data.districtTelNo ||
          districtPostalAddress1 !== data.districtPostalAddress1 ||
          districtPostalAddress2 !== data.districtPostalAddress2 ||
          districtPostalAddress3 !== data.districtPostalAddress3 ||
          districtPostalAddress4 !== data.districtPostalAddress4 ||
          districtPostalAddress5 !== data.districtPostalAddress5;
        break;

      case "ftp":
        dataChanged =
          districtFtpServerName !== data.districtFtpServerName ||
          districtServerIpAddress !== data.districtServerIpAddress ||
          districtFtpDirectory !== data.districtFtpDirectory ||
          districtNotificationsUrl !== data.districtNotificationsUrl ||
          attachmentUrlPrefix !== data.attachmentUrlPrefix;
        break;

      case "fpnDelivery":
        dataChanged =
          fpnDeliveryUrl !== data.fpnDeliveryUrl ||
          fpnFaxNumber !== data.fpnFaxNumber ||
          fpnDeliveryPostcode !== data.fpnDeliveryPostcode ||
          fpnDeliveryAddress1 !== data.fpnDeliveryAddress1 ||
          fpnDeliveryAddress2 !== data.fpnDeliveryAddress2 ||
          fpnDeliveryAddress3 !== data.fpnDeliveryAddress3 ||
          fpnDeliveryAddress4 !== data.fpnDeliveryAddress4 ||
          fpnDeliveryAddress5 !== data.fpnDeliveryAddress5 ||
          fpnDeliveryEmailAddress !== data.fpnDeliveryEmailAddress;
        break;

      case "fpmPayment":
        dataChanged =
          fpnPaymentUrl !== data.fpnPaymentUrl ||
          fpnPaymentTelNo !== data.fpnPaymentTelNo ||
          fpnPaymentBankName !== data.fpnPaymentBankName ||
          fpnPaymentSortCode !== data.fpnPaymentSortCode ||
          fpnPaymentAccountNo !== data.fpnPaymentAccountNo ||
          fpnPaymentAccountName !== data.fpnPaymentAccountName ||
          fpnPaymentPostcode !== data.fpnPaymentPostcode ||
          fpnPaymentAddress1 !== data.fpnPaymentAddress1 ||
          fpnPaymentAddress2 !== data.fpnPaymentAddress2 ||
          fpnPaymentAddress3 !== data.fpnPaymentAddress3 ||
          fpnPaymentAddress4 !== data.fpnPaymentAddress4 ||
          fpnPaymentAddress5 !== data.fpnPaymentAddress5;
        break;

      case "fpnContact":
        dataChanged =
          fpnContactName !== data.fpnContactName ||
          fpnContactPostcode !== data.fpnContactPostcode ||
          fpnContactTelNo !== data.fpnContactTelNo ||
          fpnContactAddress1 !== data.fpnContactAddress1 ||
          fpnContactAddress2 !== data.fpnContactAddress2 ||
          fpnContactAddress3 !== data.fpnContactAddress3 ||
          fpnContactAddress4 !== data.fpnContactAddress4 ||
          fpnContactAddress5 !== data.fpnContactAddress5 ||
          outOfHoursArrangements !== data.outOfHoursArrangements ||
          districtPermitSchemeId !== data.districtPermitSchemeId;
        break;

      default:
        break;
    }
    return dataChanged;
  };

  /**
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    let validData = true;

    const postcodeRegEx = /^([A-Z][A-HJ-Y]?[0-9][A-Z0-9]? ?[0-9][A-Z]{2}|GIR ?0A{2})$/;
    const phoneRegEx =
      /^(((\+44\s?|0044\s?)?|(\(?0))((2[03489]\)?\s?\d{4}\s?\d{4})|(1[23456789]1\)?\s?\d{3}\s?\d{4})|(1[23456789][234578][0234679]\)?\s?\d{6})|(1[2579][0245][0467]\)?\s?\d{5})|(11[345678]\)?\s?\d{3}\s?\d{4})|(1[35679][234689]\s?[46789][234567]\)?\s?\d{4,5})|([389]\d{2}\s?\d{3}\s?\d{4})|([57][0-9]\s?\d{4}\s?\d{4})|(500\s?\d{6})|(7[456789]\d{2}\s?\d{6})))$/;
    const urlRegEx =
      /((http|ftp|https):\/\/w{3}[\d]*.|(http|ftp|https):\/\/|w{3}[\d]*.)([\w\d._\-#()[\]\\,;:]+@[\w\d._\-#()[\]\\,;:])?([a-z0-9]+.)*[a-z\-0-9]+.([a-z]{2,3})?[a-z]{2,6}(:[0-9]+)?(\/[/a-z0-9._\-,]+)*[a-z0-9\-_.\s%]+(\?[a-z0-9=%&amp;.\-,#]+)?/;
    const ipRegEx =
      /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    const emailRegEx =
      /^([a-z0-9])(([-.]|[_]+)?([a-z0-9]+))*(@)([a-z0-9])((([-]+)?([a-z0-9]+))?)*((.[a-z]{2,3})?(.[a-z]{2,6}))$/i;
    const sortCodeRegEx = /^(\d){6}$/;
    const bankAccountRegEx = /^(\d){7,8}$/;

    switch (variant) {
      case "district":
        let organisationIdErrors = [];
        let districtNameErrors = [];
        let districtIdErrors = [];
        let districtFunctionErrors = [];
        let districtClosedErrors = [];
        let districtFaxNoErrors = [];
        let districtPostcodeErrors = [];
        let districtTelNoErrors = [];
        let districtPostalAddress1Errors = [];
        let districtPostalAddress2Errors = [];
        let districtPostalAddress3Errors = [];
        let districtPostalAddress4Errors = [];
        let districtPostalAddress5Errors = [];

        if (organisationId) {
          if (!filteredLookup(SwaOrgRef, false).find((x) => x.id === organisationId)) {
            organisationIdErrors.push("Organisation does not exist in the SWA organisation table.");
            validData = false;
          }
        } else {
          organisationIdErrors.push("Organisation is a mandatory field.");
          validData = false;
        }

        if (!districtName) {
          districtNameErrors.push("Name is a required field.");
          validData = false;
        }

        if (districtId) {
          if (
            organisationId &&
            lookupContext.currentLookups.operationalDistricts.find(
              (x) =>
                x.organisationId === organisationId &&
                x.districtId === districtId &&
                x.operationalDistrictId !== data.id
            )
          ) {
            districtIdErrors.push("ID is not unique for this organisation.");
            validData = false;
          }

          if (districtId < 0 || districtId > 999) {
            districtIdErrors.push("ID is not within the valid range (1-999).");
            validData = false;
          }
        } else {
          districtIdErrors.push("ID is a required field.");
          validData = false;
        }

        if (districtClosed) {
          if (isFutureDate(districtClosed)) {
            districtClosedErrors.push("Closed date cannot be in the future.");
            validData = false;
          }

          if (isPriorTo1990(districtClosed)) {
            districtClosedErrors.push("Closed date prior to January 1st 1990.");
            validData = false;
          }
        }

        if (districtPostcode) {
          if (!postcodeRegEx.test(districtPostcode)) {
            districtPostcodeErrors.push("This postcode does not have a valid format.");
            validData = false;
          }
        }

        if (districtTelNo) {
          if (!phoneRegEx.test(districtTelNo)) {
            districtTelNoErrors.push("This telephone number is not valid.");
            validData = false;
          }
        }

        if (districtFaxNo) {
          if (!phoneRegEx.test(districtFaxNo)) {
            districtFaxNoErrors.push("This fax number is not valid.");
            validData = false;
          }
        }

        setOrganisationIdError(organisationIdErrors.length ? organisationIdErrors : null);
        setDistrictNameError(districtNameErrors.length ? districtNameErrors : null);
        setDistrictIdError(districtIdErrors.length ? districtIdErrors : null);
        setDistrictFunctionError(districtFunctionErrors.length ? districtFunctionErrors : null);
        setDistrictClosedError(districtClosedErrors.length ? districtClosedErrors : null);
        setDistrictFaxNoError(districtFaxNoErrors.length ? districtFaxNoErrors : null);
        setDistrictPostcodeError(districtPostcodeErrors.length ? districtPostcodeErrors : null);
        setDistrictTelNoError(districtTelNoErrors.length ? districtTelNoErrors : null);
        setDistrictPostalAddress1Error(districtPostalAddress1Errors.length ? districtPostalAddress1Errors : null);
        setDistrictPostalAddress2Error(districtPostalAddress2Errors.length ? districtPostalAddress2Errors : null);
        setDistrictPostalAddress3Error(districtPostalAddress3Errors.length ? districtPostalAddress3Errors : null);
        setDistrictPostalAddress4Error(districtPostalAddress4Errors.length ? districtPostalAddress4Errors : null);
        setDistrictPostalAddress5Error(districtPostalAddress5Errors.length ? districtPostalAddress5Errors : null);
        break;

      case "ftp":
        let districtFtpServerNameErrors = [];
        let districtServerIpAddressErrors = [];
        let districtFtpDirectoryErrors = [];
        let districtNotificationsUrlErrors = [];
        let attachmentUrlPrefixErrors = [];

        if (districtFtpServerName) {
          if (!urlRegEx.test(districtFtpServerName)) {
            districtFtpServerNameErrors.push("This FTP server name is not valid.");
            validData = false;
          }
        }

        if (districtServerIpAddress) {
          if (!ipRegEx.test(districtServerIpAddress)) {
            districtServerIpAddressErrors.push("This IP address is not valid.");
            validData = false;
          }
        }

        if (districtNotificationsUrl) {
          if (!urlRegEx.test(districtNotificationsUrl)) {
            districtNotificationsUrlErrors.push("This URL is not valid.");
            validData = false;
          }
        }

        setDistrictFtpServerNameError(districtFtpServerNameErrors.length ? districtFtpServerNameErrors : null);
        setDistrictServerIpAddressError(districtServerIpAddressErrors.length ? districtServerIpAddressErrors : null);
        setDistrictFtpDirectoryError(districtFtpDirectoryErrors.length ? districtFtpDirectoryErrors : null);
        setDistrictNotificationsUrlError(districtNotificationsUrlErrors.length ? districtNotificationsUrlErrors : null);
        setAttachmentUrlPrefixError(attachmentUrlPrefixErrors.length ? attachmentUrlPrefixErrors : null);
        break;

      case "fpnDelivery":
        let fpnDeliveryUrlErrors = [];
        let fpnFaxNumberErrors = [];
        let fpnDeliveryPostcodeErrors = [];
        let fpnDeliveryAddress1Errors = [];
        let fpnDeliveryAddress2Errors = [];
        let fpnDeliveryAddress3Errors = [];
        let fpnDeliveryAddress4Errors = [];
        let fpnDeliveryAddress5Errors = [];
        let fpnDeliveryEmailAddressErrors = [];

        if (fpnDeliveryUrl) {
          if (!urlRegEx.test(fpnDeliveryUrl)) {
            fpnDeliveryUrlErrors.push("This URL is not valid.");
            validData = false;
          }
        }

        if (fpnFaxNumber) {
          if (!phoneRegEx.test(fpnFaxNumber)) {
            fpnFaxNumberErrors.push("This fax number is not valid.");
            validData = false;
          }
        }

        if (fpnDeliveryPostcode) {
          if (!postcodeRegEx.test(fpnDeliveryPostcode)) {
            fpnDeliveryPostcodeErrors.push("This postcode does not have a valid format.");
            validData = false;
          }
        }

        if (fpnDeliveryEmailAddress) {
          if (!emailRegEx.test(fpnDeliveryEmailAddress)) {
            fpnDeliveryEmailAddressErrors.push("This email address is not valid.");
            validData = false;
          }
        }

        setFpnDeliveryUrlError(fpnDeliveryUrlErrors.length ? fpnDeliveryUrlErrors : null);
        setFpnFaxNumberError(fpnFaxNumberErrors.length ? fpnFaxNumberErrors : null);
        setFpnDeliveryPostcodeError(fpnDeliveryPostcodeErrors.length ? fpnDeliveryPostcodeErrors : null);
        setFpnDeliveryAddress1Error(fpnDeliveryAddress1Errors.length ? fpnDeliveryAddress1Errors : null);
        setFpnDeliveryAddress2Error(fpnDeliveryAddress2Errors.length ? fpnDeliveryAddress2Errors : null);
        setFpnDeliveryAddress3Error(fpnDeliveryAddress3Errors.length ? fpnDeliveryAddress3Errors : null);
        setFpnDeliveryAddress4Error(fpnDeliveryAddress4Errors.length ? fpnDeliveryAddress4Errors : null);
        setFpnDeliveryAddress5Error(fpnDeliveryAddress5Errors.length ? fpnDeliveryAddress5Errors : null);
        setFpnDeliveryEmailAddressError(fpnDeliveryEmailAddressErrors.length ? fpnDeliveryEmailAddressErrors : null);
        break;

      case "fpnPayment":
        let fpnPaymentUrlErrors = [];
        let fpnPaymentTelNoErrors = [];
        let fpnPaymentBankNameErrors = [];
        let fpnPaymentSortCodeErrors = [];
        let fpnPaymentAccountNoErrors = [];
        let fpnPaymentAccountNameErrors = [];
        let fpnPaymentPostcodeErrors = [];
        let fpnPaymentAddress1Errors = [];
        let fpnPaymentAddress2Errors = [];
        let fpnPaymentAddress3Errors = [];
        let fpnPaymentAddress4Errors = [];
        let fpnPaymentAddress5Errors = [];

        if (fpnPaymentUrl) {
          if (!urlRegEx.test(fpnPaymentUrl)) {
            fpnPaymentUrlErrors.push("This URL is not valid.");
            validData = false;
          }
        }

        if (fpnPaymentTelNo) {
          if (!phoneRegEx.test(fpnPaymentTelNo)) {
            fpnPaymentTelNoErrors.push("This telephone number is not valid.");
            validData = false;
          }
        }

        if (fpnPaymentSortCode) {
          if (!sortCodeRegEx.test(fpnPaymentSortCode)) {
            fpnPaymentSortCodeErrors.push("This sort code is not valid.");
            validData = false;
          }
        }

        if (fpnPaymentAccountNo) {
          if (!bankAccountRegEx.test(fpnPaymentAccountNo)) {
            fpnPaymentAccountNoErrors.push("This bank account number is not valid.");
            validData = false;
          }
        }

        if (fpnPaymentPostcode) {
          if (!postcodeRegEx.test(fpnPaymentPostcode)) {
            fpnPaymentPostcodeErrors.push("This postcode does not have a valid format.");
            validData = false;
          }
        }

        setFpnPaymentUrlError(fpnPaymentUrlErrors.length ? fpnPaymentUrlErrors : null);
        setFpnPaymentTelNoError(fpnPaymentTelNoErrors.length ? fpnPaymentTelNoErrors : null);
        setFpnPaymentBankNameError(fpnPaymentBankNameErrors.length ? fpnPaymentBankNameErrors : null);
        setFpnPaymentSortCodeError(fpnPaymentSortCodeErrors.length ? fpnPaymentSortCodeErrors : null);
        setFpnPaymentAccountNoError(fpnPaymentAccountNoErrors.length ? fpnPaymentAccountNoErrors : null);
        setFpnPaymentAccountNameError(fpnPaymentAccountNameErrors.length ? fpnPaymentAccountNameErrors : null);
        setFpnPaymentPostcodeError(fpnPaymentPostcodeErrors.length ? fpnPaymentPostcodeErrors : null);
        setFpnPaymentAddress1Error(fpnPaymentAddress1Errors.length ? fpnPaymentAddress1Errors : null);
        setFpnPaymentAddress2Error(fpnPaymentAddress2Errors.length ? fpnPaymentAddress2Errors : null);
        setFpnPaymentAddress3Error(fpnPaymentAddress3Errors.length ? fpnPaymentAddress3Errors : null);
        setFpnPaymentAddress4Error(fpnPaymentAddress4Errors.length ? fpnPaymentAddress4Errors : null);
        setFpnPaymentAddress5Error(fpnPaymentAddress5Errors.length ? fpnPaymentAddress5Errors : null);
        break;

      case "fpnContact":
        let fpnContactNameErrors = [];
        let fpnContactPostcodeErrors = [];
        let fpnContactTelNoErrors = [];
        let fpnContactAddress1Errors = [];
        let fpnContactAddress2Errors = [];
        let fpnContactAddress3Errors = [];
        let fpnContactAddress4Errors = [];
        let fpnContactAddress5Errors = [];
        let outOfHoursArrangementsErrors = [];
        let districtPermitSchemeIdErrors = [];

        if (fpnContactPostcode) {
          if (!postcodeRegEx.test(fpnContactPostcode)) {
            fpnContactPostcodeErrors.push("This postcode does not have a valid format.");
            validData = false;
          }
        }

        if (fpnContactTelNo) {
          if (!phoneRegEx.test(fpnContactTelNo)) {
            fpnContactTelNoErrors.push("This telephone number is not valid.");
            validData = false;
          }
        }

        setFpnContactNameError(fpnContactNameErrors.length ? fpnContactNameErrors : null);
        setFpnContactPostcodeError(fpnContactPostcodeErrors.length ? fpnContactPostcodeErrors : null);
        setFpnContactTelNoError(fpnContactTelNoErrors.length ? fpnContactTelNoErrors : null);
        setFpnContactAddress1Error(fpnContactAddress1Errors.length ? fpnContactAddress1Errors : null);
        setFpnContactAddress2Error(fpnContactAddress2Errors.length ? fpnContactAddress2Errors : null);
        setFpnContactAddress3Error(fpnContactAddress3Errors.length ? fpnContactAddress3Errors : null);
        setFpnContactAddress4Error(fpnContactAddress4Errors.length ? fpnContactAddress4Errors : null);
        setFpnContactAddress5Error(fpnContactAddress5Errors.length ? fpnContactAddress5Errors : null);
        setOutOfHoursArrangementsError(outOfHoursArrangementsErrors.length ? outOfHoursArrangementsErrors : null);
        setDistrictPermitSchemeIdError(districtPermitSchemeIdErrors.length ? districtPermitSchemeIdErrors : null);
        break;

      default:
        break;
    }

    return validData;
  };

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {string} newValue The new .
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (dataValid()) {
      if (hasDataChanged()) {
        if (onDone) onDone(getLookupData());
      } else handleCancelClick();
    }
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the district name changes.
   *
   * @param {string} newValue The new district name.
   */
  const handleDistrictNameChangeEvent = (newValue) => {
    setDistrictName(newValue);
  };

  /**
   * Event to handle when the organisation id changes.
   *
   * @param {number} newValue The new organisation id.
   */
  const handleOrganisationIdChangeEvent = (newValue) => {
    setOrganisationId(newValue);
  };

  /**
   * Event to handle when the district id changes.
   *
   * @param {number} newValue The new district id.
   */
  const handleDistrictIdChangeEvent = (newValue) => {
    setDistrictId(newValue);
  };

  /**
   * Event to handle when the district function changes.
   *
   * @param {number} newValue The new district function.
   */
  const handleDistrictFunctionChangeEvent = (newValue) => {
    setDistrictFunction(newValue);
  };

  /**
   * Event to handle when the district closed changes.
   *
   * @param {Date} newValue The new district closed date.
   */
  const handleDistrictClosedChangeEvent = (newValue) => {
    setDistrictClosed(newValue);
  };

  /**
   * Event to handle when the district FTP server name changes.
   *
   * @param {string} newValue The new district FTP server name.
   */
  const handleDistrictFtpServerNameChangeEvent = (newValue) => {
    setDistrictFtpServerName(newValue);
  };

  /**
   * Event to handle when the district server IP address changes.
   *
   * @param {string} newValue The new .
   */
  const handleDistrictServerIpAddressChangeEvent = (newValue) => {
    setDistrictServerIpAddress(newValue);
  };

  /**
   * Event to handle when the district FTP directory changes.
   *
   * @param {string} newValue The new district FTP directory.
   */
  const handleDistrictFtpDirectoryChangeEvent = (newValue) => {
    setDistrictFtpDirectory(newValue);
  };

  /**
   * Event to handle when the district notifications URL changes.
   *
   * @param {string} newValue The new district notifications URL.
   */
  const handleDistrictNotificationsUrlChangeEvent = (newValue) => {
    setDistrictNotificationsUrl(newValue);
  };

  /**
   * Event to handle when the attachment URL prefix changes.
   *
   * @param {string} newValue The new attachment URL prefix.
   */
  const handleAttachmentUrlPrefixChangeEvent = (newValue) => {
    setAttachmentUrlPrefix(newValue);
  };

  /**
   * Event to handle when the district fax number changes.
   *
   * @param {string} newValue The new district fax number.
   */
  const handleDistrictFaxNoChangeEvent = (newValue) => {
    setDistrictFaxNo(newValue);
  };

  /**
   * Event to handle when the district postcode changes.
   *
   * @param {string} newValue The new district postcode.
   */
  const handleDistrictPostcodeChangeEvent = (newValue) => {
    setDistrictPostcode(newValue);
  };

  /**
   * Event to handle when the district telephone number changes.
   *
   * @param {string} newValue The new district telephone number.
   */
  const handleDistrictTelNoChangeEvent = (newValue) => {
    setDistrictTelNo(newValue);
  };

  /**
   * Event to handle when the out of hours agreements changes.
   *
   * @param {string} newValue The new out of hours agreements.
   */
  const handleOutOfHoursArrangementsChangeEvent = (newValue) => {
    setOutOfHoursArrangements(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery URL changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery URL.
   */
  const handleFpnDeliveryUrlChangeEvent = (newValue) => {
    setFpnDeliveryUrl(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice fax number changes.
   *
   * @param {string} newValue The new fixed penalty notice fax number.
   */
  const handleFpnFaxNumberChangeEvent = (newValue) => {
    setFpnFaxNumber(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery postcode changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery postcode.
   */
  const handleFpnDeliveryPostcodeChangeEvent = (newValue) => {
    setFpnDeliveryPostcode(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment URL changes.
   *
   * @param {string} newValue The new fixed penalty notice payment URL.
   */
  const handleFpnPaymentUrlChangeEvent = (newValue) => {
    setFpnPaymentUrl(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment telephone number changes.
   *
   * @param {string} newValue The new fixed penalty notice payment telephone number.
   */
  const handleFpnPaymentTelNoChangeEvent = (newValue) => {
    setFpnPaymentTelNo(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment bank name changes.
   *
   * @param {string} newValue The new fixed penalty notice payment bank name.
   */
  const handleFpnPaymentBankNameChangeEvent = (newValue) => {
    setFpnPaymentBankName(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment sort code changes.
   *
   * @param {string} newValue The new fixed penalty notice payment sort code.
   */
  const handleFpnPaymentSortCodeChangeEvent = (newValue) => {
    setFpnPaymentSortCode(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment account number changes.
   *
   * @param {string} newValue The new fixed penalty notice payment account number.
   */
  const handleFpnPaymentAccountNoChangeEvent = (newValue) => {
    setFpnPaymentAccountNo(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment account name changes.
   *
   * @param {string} newValue The new fixed penalty notice payment account name.
   */
  const handleFpnPaymentAccountNameChangeEvent = (newValue) => {
    setFpnPaymentAccountName(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment postcode changes.
   *
   * @param {string} newValue The new fixed penalty notice payment postcode.
   */
  const handleFpnPaymentPostcodeChangeEvent = (newValue) => {
    setFpnPaymentPostcode(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact name changes.
   *
   * @param {string} newValue The new fixed penalty notice contact name.
   */
  const handleFpnContactNameChangeEvent = (newValue) => {
    setFpnContactName(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact postcode changes.
   *
   * @param {string} newValue The new fixed penalty notice contact postcode.
   */
  const handleFpnContactPostcodeChangeEvent = (newValue) => {
    setFpnContactPostcode(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact telephone number changes.
   *
   * @param {string} newValue The new fixed penalty notice contact telephone number.
   */
  const handleFpnContactTelNoChangeEvent = (newValue) => {
    setFpnContactTelNo(newValue);
  };

  /**
   * Event to handle when the district postal address 1 changes.
   *
   * @param {string} newValue The new district postal address 1.
   */
  const handleDistrictPostalAddress1ChangeEvent = (newValue) => {
    setDistrictPostalAddress1(newValue);
  };

  /**
   * Event to handle when the district postal address 2 changes.
   *
   * @param {string} newValue The new district postal address 2.
   */
  const handleDistrictPostalAddress2ChangeEvent = (newValue) => {
    setDistrictPostalAddress2(newValue);
  };

  /**
   * Event to handle when the district postal address 3 changes.
   *
   * @param {string} newValue The new district postal address 3.
   */
  const handleDistrictPostalAddress3ChangeEvent = (newValue) => {
    setDistrictPostalAddress3(newValue);
  };

  /**
   * Event to handle when the district postal address 4 changes.
   *
   * @param {string} newValue The new district postal address 4.
   */
  const handleDistrictPostalAddress4ChangeEvent = (newValue) => {
    setDistrictPostalAddress4(newValue);
  };

  /**
   * Event to handle when the district postal address 5 changes.
   *
   * @param {string} newValue The new district postal address 5.
   */
  const handleDistrictPostalAddress5ChangeEvent = (newValue) => {
    setDistrictPostalAddress5(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery address 1 changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery address 1.
   */
  const handleFpnDeliveryAddress1ChangeEvent = (newValue) => {
    setFpnDeliveryAddress1(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery address 2 changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery address 2.
   */
  const handleFpnDeliveryAddress2ChangeEvent = (newValue) => {
    setFpnDeliveryAddress2(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery address 3 changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery address 3.
   */
  const handleFpnDeliveryAddress3ChangeEvent = (newValue) => {
    setFpnDeliveryAddress3(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery address 4 changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery address 4.
   */
  const handleFpnDeliveryAddress4ChangeEvent = (newValue) => {
    setFpnDeliveryAddress4(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery address 5 changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery address 5.
   */
  const handleFpnDeliveryAddress5ChangeEvent = (newValue) => {
    setFpnDeliveryAddress5(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact address 1 changes.
   *
   * @param {string} newValue The new fixed penalty notice contact address 1.
   */
  const handleFpnContactAddress1ChangeEvent = (newValue) => {
    setFpnContactAddress1(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact address 2 changes.
   *
   * @param {string} newValue The new fixed penalty notice contact address 2.
   */
  const handleFpnContactAddress2ChangeEvent = (newValue) => {
    setFpnContactAddress2(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact address 3 changes.
   *
   * @param {string} newValue The new fixed penalty notice contact address 3.
   */
  const handleFpnContactAddress3ChangeEvent = (newValue) => {
    setFpnContactAddress3(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact address 4 changes.
   *
   * @param {string} newValue The new fixed penalty notice contact address 4.
   */
  const handleFpnContactAddress4ChangeEvent = (newValue) => {
    setFpnContactAddress4(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice contact address 5 changes.
   *
   * @param {string} newValue The new fixed penalty notice contact address 5.
   */
  const handleFpnContactAddress5ChangeEvent = (newValue) => {
    setFpnContactAddress5(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment address 1 changes.
   *
   * @param {string} newValue The new fixed penalty notice payment address 1.
   */
  const handleFpnPaymentAddress1ChangeEvent = (newValue) => {
    setFpnPaymentAddress1(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment address 2 changes.
   *
   * @param {string} newValue The new fixed penalty notice payment address 2.
   */
  const handleFpnPaymentAddress2ChangeEvent = (newValue) => {
    setFpnPaymentAddress2(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment address 3 changes.
   *
   * @param {string} newValue The new fixed penalty notice payment address 3.
   */
  const handleFpnPaymentAddress3ChangeEvent = (newValue) => {
    setFpnPaymentAddress3(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment address 4 changes.
   *
   * @param {string} newValue The new fixed penalty notice payment address 4.
   */
  const handleFpnPaymentAddress4ChangeEvent = (newValue) => {
    setFpnPaymentAddress4(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice payment address 5 changes.
   *
   * @param {string} newValue The new fixed penalty notice payment address 5.
   */
  const handleFpnPaymentAddress5ChangeEvent = (newValue) => {
    setFpnPaymentAddress5(newValue);
  };

  /**
   * Event to handle when the fixed penalty notice delivery email address changes.
   *
   * @param {string} newValue The new fixed penalty notice delivery email address.
   */
  const handleFpnDeliveryEmailAddressChangeEvent = (newValue) => {
    setFpnDeliveryEmailAddress(newValue);
  };

  /**
   * Event to handle when the district permit scheme id changes.
   *
   * @param {string} newValue The new district permit scheme id.
   */
  const handleDistrictPermitSchemeIdChangeEvent = (newValue) => {
    setDistrictPermitSchemeId(newValue);
  };

  const getDialogContent = () => {
    if (!variant) return null;

    switch (variant) {
      case "district":
        return (
          <Stack direction="column">
            <ADSSelectControl
              label="Organisation"
              isEditable
              isRequired
              useRounded
              lookupData={filteredLookup(SwaOrgRef, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              lookupColour="colour"
              value={organisationId}
              errorText={organisationIdError}
              onChange={handleOrganisationIdChangeEvent}
              helperText="The SWA organisation as assigned by the NSG custodian."
            />
            <ADSTextControl
              label="Name"
              isEditable
              isRequired
              displayCharactersLeft
              value={districtName}
              id="district-name"
              maxLength={60}
              errorText={districtNameError}
              onChange={handleDistrictNameChangeEvent}
              helperText="The name of the district."
            />
            <ADSNumberControl
              label="ID"
              isEditable
              isRequired
              value={districtId}
              maximum={999}
              errorText={districtIdError}
              onChange={handleDistrictIdChangeEvent}
              helperText="Unique district reference number created by the organisation."
            />
            <ADSSelectControl
              label="Function"
              isEditable
              useRounded
              lookupData={filteredLookup(OperationalDistrictFunction, false)}
              lookupId="id"
              lookupLabel={GetLookupLabel(false)}
              value={districtFunction}
              errorText={districtFunctionError}
              onChange={handleDistrictFunctionChangeEvent}
              helperText="The function of the district involved in exchange of street works information."
            />
            <ADSTextControl
              label="Address"
              isEditable
              displayCharactersLeft
              value={districtPostalAddress1}
              id="district-address-1"
              maxLength={35}
              errorText={districtPostalAddress1Error}
              onChange={handleDistrictPostalAddress1ChangeEvent}
              helperText="The first line of the postal address for the district."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={districtPostalAddress2}
              id="district-address-2"
              maxLength={35}
              errorText={districtPostalAddress2Error}
              onChange={handleDistrictPostalAddress2ChangeEvent}
              helperText="The second line of the postal address for the district."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={districtPostalAddress3}
              id="district-address-3"
              maxLength={35}
              errorText={districtPostalAddress3Error}
              onChange={handleDistrictPostalAddress3ChangeEvent}
              helperText="The third line of the postal address for the district."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={districtPostalAddress4}
              id="district-address-4"
              maxLength={35}
              errorText={districtPostalAddress4Error}
              onChange={handleDistrictPostalAddress4ChangeEvent}
              helperText="The fourth line of the postal address for the district."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={districtPostalAddress5}
              id="district-address-5"
              maxLength={35}
              errorText={districtPostalAddress5Error}
              onChange={handleDistrictPostalAddress5ChangeEvent}
              helperText="The fifth line of the postal address for the district."
            />
            <ADSTextControl
              label="Postcode"
              isEditable
              value={districtPostcode}
              id="district-postcode"
              maxLength={8}
              errorText={districtPostcodeError}
              onChange={handleDistrictPostcodeChangeEvent}
              helperText="Postcode for the district."
            />
            <ADSTextControl
              label="Telephone no."
              isEditable
              value={districtTelNo}
              id="district-telephone"
              maxLength={20}
              errorText={districtTelNoError}
              onChange={handleDistrictTelNoChangeEvent}
              helperText="Telephone number for the district."
            />
            <ADSTextControl
              label="Fax no."
              isEditable
              value={districtFaxNo}
              id="district-fax"
              maxLength={20}
              errorText={districtFaxNoError}
              onChange={handleDistrictFaxNoChangeEvent}
              helperText="Fax number for the district, used solely for receiving notifications in the event of system failure etc."
            />
            <ADSDateControl
              label="Closed date"
              isEditable
              value={districtClosed}
              errorText={districtClosedError}
              onChange={handleDistrictClosedChangeEvent}
              helperText="The date on which the district was closed."
            />
          </Stack>
        );

      case "ftp":
        return (
          <Stack direction="column">
            <ADSTextControl
              label="FTP server name"
              isEditable
              displayCharactersLeft
              value={districtFtpServerName}
              id="district-ftp-server-name"
              maxLength={100}
              errorText={districtFtpServerNameError}
              onChange={handleDistrictFtpServerNameChangeEvent}
              helperText="FTP address for receiving batch file transfers (still required for inspections data)."
            />
            <ADSTextControl
              label="Server IP address"
              isEditable
              value={districtServerIpAddress}
              id="district-server-ip-address"
              maxLength={15}
              errorText={districtServerIpAddressError}
              onChange={handleDistrictServerIpAddressChangeEvent}
              helperText="The IP address for service of notifications (still required for inspections data)."
            />
            <ADSTextControl
              label="FTP directory"
              isEditable
              displayCharactersLeft
              value={districtFtpDirectory}
              id="district-ftp-directory"
              maxLength={50}
              errorText={districtFtpDirectoryError}
              onChange={handleDistrictFtpDirectoryChangeEvent}
              helperText="The directory name on the FTP server (still required for inspections data)."
            />
            <ADSTextControl
              label="Notification URL"
              isEditable
              displayCharactersLeft
              value={districtNotificationsUrl}
              id="district-notification-url"
              maxLength={256}
              errorText={districtNotificationsUrlError}
              onChange={handleDistrictNotificationsUrlChangeEvent}
              helperText="Web service URL for exchange of notifications using XML."
            />
            <ADSTextControl
              label="Attachment URL prefix"
              isEditable
              displayCharactersLeft
              value={attachmentUrlPrefix}
              id="attachment-url-prefix"
              maxLength={256}
              errorText={attachmentUrlPrefixError}
              onChange={handleAttachmentUrlPrefixChangeEvent}
              helperText="The base URL of the FTP site used for viewing and downloading of documents that are ‘attached’ to notifications."
            />
          </Stack>
        );

      case "fpnDelivery":
        return (
          <Stack direction="column">
            <ADSTextControl
              label="Delivery URL"
              isEditable
              displayCharactersLeft
              value={fpnDeliveryUrl}
              id="fpn-delivery-url"
              maxLength={256}
              errorText={fpnDeliveryUrlError}
              onChange={handleFpnDeliveryUrlChangeEvent}
              helperText="Web service URL for receiving FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label="Address"
              isEditable
              displayCharactersLeft
              value={fpnDeliveryAddress1}
              id="fpn-delivery-address-1"
              maxLength={35}
              errorText={fpnDeliveryAddress1Error}
              onChange={handleFpnDeliveryAddress1ChangeEvent}
              helperText="The first line of the postal address for the delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnDeliveryAddress2}
              id="fpn-delivery-address-2"
              maxLength={35}
              errorText={fpnDeliveryAddress2Error}
              onChange={handleFpnDeliveryAddress2ChangeEvent}
              helperText="The second line of the postal address for the delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnDeliveryAddress3}
              id="fpn-delivery-address-3"
              maxLength={35}
              errorText={fpnDeliveryAddress3Error}
              onChange={handleFpnDeliveryAddress3ChangeEvent}
              helperText="The third line of the postal address for the delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnDeliveryAddress4}
              id="fpn-delivery-address-4"
              maxLength={35}
              errorText={fpnDeliveryAddress4Error}
              onChange={handleFpnDeliveryAddress4ChangeEvent}
              helperText="The fourth line of the postal address for the delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnDeliveryAddress5}
              id="fpn-delivery-address-5"
              maxLength={35}
              errorText={fpnDeliveryAddress5Error}
              onChange={handleFpnDeliveryAddress5ChangeEvent}
              helperText="The fifth line of the postal address for the delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label="Postcode"
              isEditable
              value={fpnDeliveryPostcode}
              id="fpn-delivery-postcode"
              maxLength={8}
              errorText={fpnDeliveryPostcodeError}
              onChange={handleFpnDeliveryPostcodeChangeEvent}
              helperText="Post code for the delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label="Email address"
              isEditable
              displayCharactersLeft
              value={fpnDeliveryEmailAddress}
              id="fpn-delivery-email-address"
              maxLength={255}
              errorText={fpnDeliveryEmailAddressError}
              onChange={handleFpnDeliveryEmailAddressChangeEvent}
              helperText="Email address for delivery of FPNs. Applies to works promoters only."
            />
            <ADSTextControl
              label="Fax no."
              isEditable
              value={fpnFaxNumber}
              id="fpn-fax-number"
              maxLength={20}
              errorText={fpnFaxNumberError}
              onChange={handleFpnFaxNumberChangeEvent}
              helperText="Fax number for the delivery of FPNs. Applies to works promoters only."
            />
          </Stack>
        );

      case "fpnPayment":
        return (
          <Stack direction="column">
            <ADSTextControl
              label="Payment URL"
              isEditable
              displayCharactersLeft
              value={fpnPaymentUrl}
              id="fpn-payment-url"
              maxLength={256}
              errorText={fpnPaymentUrlError}
              onChange={handleFpnPaymentUrlChangeEvent}
              helperText="URL for payment of FPNs by credit card via the authority’s website. Applies to street authorities only."
            />
            <ADSTextControl
              label="Bank name"
              isEditable
              displayCharactersLeft
              value={fpnPaymentBankName}
              id="fpn-payment-bank-name"
              maxLength={40}
              errorText={fpnPaymentBankNameError}
              onChange={handleFpnPaymentBankNameChangeEvent}
              helperText="Bank name for payment of FPNs by BACS. Applies to street authorities only."
            />
            <ADSTextControl
              label="Account name"
              isEditable
              displayCharactersLeft
              value={fpnPaymentAccountName}
              id="fpn-payment-account-name"
              maxLength={40}
              errorText={fpnPaymentAccountNameError}
              onChange={handleFpnPaymentAccountNameChangeEvent}
              helperText="Account name for payment of FPNs by cheque (post or in person). Applies to street authorities only."
            />
            <ADSTextControl
              label="Account no."
              isEditable
              value={fpnPaymentAccountNo}
              id="fpn-payment-account-number"
              maxLength={8}
              errorText={fpnPaymentAccountNoError}
              onChange={handleFpnPaymentAccountNoChangeEvent}
              helperText="Account number for payment of FPNs by BACS. Applies to street authorities only."
            />
            <ADSTextControl
              label="Sort code"
              isEditable
              value={fpnPaymentSortCode}
              id="fpn-payment-sort-code"
              maxLength={8}
              errorText={fpnPaymentSortCodeError}
              onChange={handleFpnPaymentSortCodeChangeEvent}
              helperText="Sort code for payment of FPNs by BACS. Applies to street authorities only. Numeric values in the format nnnnnn"
            />
            <ADSTextControl
              label="Address"
              isEditable
              displayCharactersLeft
              value={fpnPaymentAddress1}
              id="fpn-payment-address-1"
              maxLength={35}
              errorText={fpnPaymentAddress1Error}
              onChange={handleFpnPaymentAddress1ChangeEvent}
              helperText="The first line of the postal address for payment of FPNs by cheque (by post). Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnPaymentAddress2}
              id="fpn-payment-address-2"
              maxLength={35}
              errorText={fpnPaymentAddress2Error}
              onChange={handleFpnPaymentAddress2ChangeEvent}
              helperText="The second line of the postal address for payment of FPNs by cheque (by post). Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnPaymentAddress3}
              id="fpn-payment-address-3"
              maxLength={35}
              errorText={fpnPaymentAddress3Error}
              onChange={handleFpnPaymentAddress3ChangeEvent}
              helperText="The third line of the postal address for payment of FPNs by cheque (by post). Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnPaymentAddress4}
              id="fpn-payment-address-4"
              maxLength={35}
              errorText={fpnPaymentAddress4Error}
              onChange={handleFpnPaymentAddress4ChangeEvent}
              helperText="The fourth line of the postal address for payment of FPNs by cheque (by post). Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnPaymentAddress5}
              id="fpn-payment-address-5"
              maxLength={35}
              errorText={fpnPaymentAddress5Error}
              onChange={handleFpnPaymentAddress5ChangeEvent}
              helperText="The fifth line of the postal address for payment of FPNs by cheque (by post). Applies to street authorities only."
            />
            <ADSTextControl
              label="Postcode"
              isEditable
              value={fpnPaymentPostcode}
              id="fpn-payment-postcode"
              maxLength={8}
              errorText={fpnPaymentPostcodeError}
              onChange={handleFpnPaymentPostcodeChangeEvent}
              helperText="Post code for payment of FPNs by cheque (by post). Applies to street authorities only."
            />
            <ADSTextControl
              label="Telephone no."
              isEditable
              value={fpnPaymentTelNo}
              id="fpn-payment-telephone-number"
              maxLength={20}
              errorText={fpnPaymentTelNoError}
              onChange={handleFpnPaymentTelNoChangeEvent}
              helperText="Contact telephone number for payment by credit or debit card. Applies to street authorities only."
            />
          </Stack>
        );

      case "fpnContact":
        return (
          <Stack direction="column">
            <ADSTextControl
              label="Contact name"
              isEditable
              displayCharactersLeft
              value={fpnContactName}
              id="fpn-contact-name"
              maxLength={30}
              errorText={fpnContactNameError}
              onChange={handleFpnContactNameChangeEvent}
              helperText="Name of the department, section or officer to whom representations should be made. Applies to street authorities only."
            />
            <ADSTextControl
              label="Address"
              isEditable
              displayCharactersLeft
              value={fpnContactAddress1}
              id="fpn-contact-address-1"
              maxLength={35}
              errorText={fpnContactAddress1Error}
              onChange={handleFpnContactAddress1ChangeEvent}
              helperText="The first line of the postal address for representations in writing. Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnContactAddress2}
              id="fpn-contact-address-2"
              maxLength={35}
              errorText={fpnContactAddress2Error}
              onChange={handleFpnContactAddress2ChangeEvent}
              helperText="The second line of the postal address for representations in writing. Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnContactAddress3}
              id="fpn-contact-address-3"
              maxLength={35}
              errorText={fpnContactAddress3Error}
              onChange={handleFpnContactAddress3ChangeEvent}
              helperText="The third line of the postal address for representations in writing. Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnContactAddress4}
              id="fpn-contact-address-4"
              maxLength={35}
              errorText={fpnContactAddress4Error}
              onChange={handleFpnContactAddress4ChangeEvent}
              helperText="The fourth line of the postal address for representations in writing. Applies to street authorities only."
            />
            <ADSTextControl
              label=""
              isEditable
              displayCharactersLeft
              value={fpnContactAddress5}
              id="fpn-contact-address-5"
              maxLength={35}
              errorText={fpnContactAddress5Error}
              onChange={handleFpnContactAddress5ChangeEvent}
              helperText="The fifth line of the postal address for representations in writing. Applies to street authorities only."
            />
            <ADSTextControl
              label="Postcode"
              isEditable
              value={fpnContactPostcode}
              id="fpn-contact-postcode"
              maxLength={8}
              errorText={fpnContactPostcodeError}
              onChange={handleFpnContactPostcodeChangeEvent}
              helperText="Post code for representations in writing. Applies to street authorities only."
            />
            <ADSTextControl
              label="Telephone no."
              isEditable
              value={fpnContactTelNo}
              id="fpn-contact-telephone-number"
              maxLength={20}
              errorText={fpnContactTelNoError}
              onChange={handleFpnContactTelNoChangeEvent}
              helperText="Telephone number for department, section or officer to whom representations should be made. Applies to street authorities only."
            />
            <ADSTextControl
              label="Permit scheme ID"
              isEditable
              value={districtPermitSchemeId}
              id="district-permit-scheme-id"
              maxLength={20}
              errorText={districtPermitSchemeIdError}
              onChange={handleDistrictPermitSchemeIdChangeEvent}
              helperText="The national permit scheme reference"
            />
            <ADSSwitchControl
              label="Out of hours arrangements made"
              isEditable
              checked={outOfHoursArrangements}
              trueLabel="Yes"
              falseLabel="No"
              errorText={outOfHoursArrangementsError}
              onChange={handleOutOfHoursArrangementsChangeEvent}
              helperText="Applies to street authorities only. Indicates if the authority can receive and respond to notifications during non-working hours."
            />
          </Stack>
        );

      default:
        break;
    }
  };

  useEffect(() => {
    switch (variant) {
      case "district":
        setLookupType("district");
        if (data) {
          setOrganisationId(data.organisationId);
          setDistrictName(data.districtName);
          setDistrictId(data.districtId);
          setDistrictFunction(data.districtFunction);
          setDistrictClosed(data.districtClosed);
          setDistrictFaxNo(data.districtFaxNo);
          setDistrictPostcode(data.districtPostcode);
          setDistrictTelNo(data.districtTelNo);
          setDistrictPostalAddress1(data.districtPostalAddress1);
          setDistrictPostalAddress2(data.districtPostalAddress2);
          setDistrictPostalAddress3(data.districtPostalAddress3);
          setDistrictPostalAddress4(data.districtPostalAddress4);
          setDistrictPostalAddress5(data.districtPostalAddress5);
        }
        break;

      case "ftp":
        setLookupType("FTP");
        if (data) {
          setDistrictFtpServerName(data.districtFtpServerName);
          setDistrictServerIpAddress(data.districtServerIpAddress);
          setDistrictFtpDirectory(data.districtFtpDirectory);
          setDistrictNotificationsUrl(data.districtNotificationsUrl);
          setAttachmentUrlPrefix(data.attachmentUrlPrefix);
        }
        break;

      case "fpnDelivery":
        setLookupType("fixed penalty notice: delivery");
        if (data) {
          setFpnDeliveryUrl(data.fpnDeliveryUrl);
          setFpnFaxNumber(data.fpnFaxNumber);
          setFpnDeliveryPostcode(data.fpnDeliveryPostcode);
          setFpnDeliveryAddress1(data.fpnDeliveryAddress1);
          setFpnDeliveryAddress2(data.fpnDeliveryAddress2);
          setFpnDeliveryAddress3(data.fpnDeliveryAddress3);
          setFpnDeliveryAddress4(data.fpnDeliveryAddress4);
          setFpnDeliveryAddress5(data.fpnDeliveryAddress5);
          setFpnDeliveryEmailAddress(data.fpnDeliveryEmailAddress);
        }
        break;

      case "fpnPayment":
        setLookupType("fixed penalty notice: payment");
        if (data) {
          setFpnPaymentUrl(data.fpnPaymentUrl);
          setFpnPaymentTelNo(data.fpnPaymentTelNo);
          setFpnPaymentBankName(data.fpnPaymentBankName);
          setFpnPaymentSortCode(data.fpnPaymentSortCode);
          setFpnPaymentAccountNo(data.fpnPaymentAccountNo);
          setFpnPaymentAccountName(data.fpnPaymentAccountName);
          setFpnPaymentPostcode(data.fpnPaymentPostcode);
          setFpnPaymentAddress1(data.fpnPaymentAddress1);
          setFpnPaymentAddress2(data.fpnPaymentAddress2);
          setFpnPaymentAddress3(data.fpnPaymentAddress3);
          setFpnPaymentAddress4(data.fpnPaymentAddress4);
          setFpnPaymentAddress5(data.fpnPaymentAddress5);
        }
        break;

      case "fpnContact":
        setLookupType("fixed penalty notice: contact");
        if (data) {
          setOutOfHoursArrangements(data.outOfHoursArrangements);
          setFpnContactName(data.fpnContactName);
          setFpnContactPostcode(data.fpnContactPostcode);
          setFpnContactTelNo(data.fpnContactTelNo);
          setFpnContactAddress1(data.fpnContactAddress1);
          setFpnContactAddress2(data.fpnContactAddress2);
          setFpnContactAddress3(data.fpnContactAddress3);
          setFpnContactAddress4(data.fpnContactAddress4);
          setFpnContactAddress5(data.fpnContactAddress5);
          setDistrictPermitSchemeId(data.districtPermitSchemeId);
        }
        break;

      default:
        break;
    }

    setShowDialog(isOpen);
  }, [variant, data, isOpen]);

  return (
    <Dialog open={showDialog} aria-labelledby="edit-lookup-dialog" fullWidth maxWidth="md" onClose={handleDialogClose}>
      <ADSDialogTitle title={`Edit ${lookupType} information`} closeTooltip="Cancel" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>{getDialogContent()}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
          Done
        </Button>
        <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDistrictLookupDialog;
