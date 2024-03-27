//#region header */
/**************************************************************************************************
//
//  Description: Tab to display all the operational district information
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
//    002   27.03.24 Sean Flook                 Further changes to fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import { FormatDate } from "../utils/HelperUtils";

import {
  Divider,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  Card,
  CardHeader,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import Masonry from "@mui/lab/Masonry";
import ADSActionButton from "../components/ADSActionButton";

import EditDistrictLookupDialog from "../dialogs/EditDistrictLookupDialog";

import OperationalDistrictFunction from "../data/OperationalDistrictFunction";

import EditIcon from "@mui/icons-material/Edit";

import {
  settingsCardStyle,
  tooltipStyle,
  ActionIconStyle,
  getTitleStyle,
  settingsCardContentStyle,
} from "./../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { GetAuthorityLabel } from "../utils/StreetUtils";
import { addressToTitleCase } from "./../utils/PropertyUtils";
import { lookupToTitleCase } from "./../utils/HelperUtils";

DistrictLookupTab.propTypes = {
  data: PropTypes.object.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onUpdateData: PropTypes.func.isRequired,
};

DistrictLookupTab.defaultProps = {
  dataUpdated: false,
};

function DistrictLookupTab({ data, onHomeClick, onUpdateData }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [editDistrict, setEditDistrict] = useState(false);
  const [editFtp, setEditFtp] = useState(false);
  const [editFpnDelivery, setEditFpnDelivery] = useState(false);
  const [editFpnPayment, setEditFpnPayment] = useState(false);
  const [editFpnContact, setEditFpnContact] = useState(false);

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

  const [editVariant, setEditVariant] = useState("unknown");
  const [editData, setEditData] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  /**
   * Event to handle when the mouse enters the District card.
   */
  const doMouseEnterDistrict = () => {
    setEditDistrict(true);
  };

  /**
   * Event to handle when the mouse leaves the District card.
   */
  const doMouseLeaveDistrict = () => {
    setEditDistrict(false);
  };

  /**
   * Event to handle when the mouse enters the FTP card.
   */
  const doMouseEnterFtp = () => {
    setEditFtp(true);
  };

  /**
   * Event to handle when the mouse leaves the FTP card.
   */
  const doMouseLeaveFtp = () => {
    setEditFtp(false);
  };

  /**
   * Event to handle when the mouse enters the fixed penalty notice delivery card.
   */
  const doMouseEnterFpnDelivery = () => {
    setEditFpnDelivery(true);
  };

  /**
   * Event to handle when the mouse leaves the fixed penalty notice delivery card.
   */
  const doMouseLeaveFpnDelivery = () => {
    setEditFpnDelivery(false);
  };

  /**
   * Event to handle when the mouse enters the fixed penalty notice payment card.
   */
  const doMouseEnterFpnPayment = () => {
    setEditFpnPayment(true);
  };

  /**
   * Event to handle when the mouse leaves the fixed penalty notice payment card.
   */
  const doMouseLeaveFpnPayment = () => {
    setEditFpnPayment(false);
  };

  /**
   * Event to handle when the mouse enters the fixed penalty notice contact card.
   */
  const doMouseEnterFpnContact = () => {
    setEditFpnContact(true);
  };

  /**
   * Event to handle when the mouse leaves the fixed penalty notice contact card.
   */
  const doMouseLeaveFpnContact = () => {
    setEditFpnContact(false);
  };

  /**
   * Event to handle when the district data is edited.
   */
  const doEditDistrict = () => {
    setEditVariant("district");
    setEditData({
      id: data.id,
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
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the FTP data is edited.
   */
  const doEditFtp = () => {
    setEditVariant("ftp");
    setEditData({
      id: data.id,
      districtFtpServerName: districtFtpServerName,
      districtServerIpAddress: districtServerIpAddress,
      districtFtpDirectory: districtFtpDirectory,
      districtNotificationsUrl: districtNotificationsUrl,
      attachmentUrlPrefix: attachmentUrlPrefix,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the fixed penalty notice delivery data is edited.
   */
  const doEditFpnDelivery = () => {
    setEditVariant("fpnDelivery");
    setEditData({
      id: data.id,
      fpnDeliveryUrl: fpnDeliveryUrl,
      fpnFaxNumber: fpnFaxNumber,
      fpnDeliveryPostcode: fpnDeliveryPostcode,
      fpnDeliveryAddress1: fpnDeliveryAddress1,
      fpnDeliveryAddress2: fpnDeliveryAddress2,
      fpnDeliveryAddress3: fpnDeliveryAddress3,
      fpnDeliveryAddress4: fpnDeliveryAddress4,
      fpnDeliveryAddress5: fpnDeliveryAddress5,
      fpnDeliveryEmailAddress: fpnDeliveryEmailAddress,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the fixed penalty notice payment data is edited.
   */
  const doEditFpnPayment = () => {
    setEditVariant("fpnPayment");
    setEditData({
      id: data.id,
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
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the fixed penalty notice contact data is edited.
   */
  const doEditFpnContact = () => {
    setEditVariant("fpnContact");
    setEditData({
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
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the data has been edited.
   *
   * @param {object} updatedData The data that has been edited.
   */
  const handleDoneEditDistrict = (updatedData) => {
    if (updatedData) {
      const newData = {
        id: data.id,
        organisationId: editVariant === "district" ? updatedData.organisationId : organisationId,
        districtName: editVariant === "district" ? updatedData.districtName : districtName,
        districtId: editVariant === "district" ? updatedData.districtId : districtId,
        districtFunction: editVariant === "district" ? updatedData.districtFunction : districtFunction,
        districtClosed: editVariant === "district" ? updatedData.districtClosed : districtClosed,
        districtFtpServerName: editVariant === "ftp" ? updatedData.districtFtpServerName : districtFtpServerName,
        districtServerIpAddress: editVariant === "ftp" ? updatedData.districtServerIpAddress : districtServerIpAddress,
        districtFtpDirectory: editVariant === "ftp" ? updatedData.districtFtpDirectory : districtFtpDirectory,
        districtNotificationsUrl:
          editVariant === "ftp" ? updatedData.districtNotificationsUrl : districtNotificationsUrl,
        attachmentUrlPrefix: editVariant === "ftp" ? updatedData.attachmentUrlPrefix : attachmentUrlPrefix,
        districtFaxNo: editVariant === "district" ? updatedData.districtFaxNo : districtFaxNo,
        districtPostcode: editVariant === "district" ? updatedData.districtPostcode : districtPostcode,
        districtTelNo: editVariant === "district" ? updatedData.districtTelNo : districtTelNo,
        outOfHoursArrangements:
          editVariant === "fpnContact" ? updatedData.outOfHoursArrangements : outOfHoursArrangements,
        fpnDeliveryUrl: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryUrl : fpnDeliveryUrl,
        fpnFaxNumber: editVariant === "fpnDelivery" ? updatedData.fpnFaxNumber : fpnFaxNumber,
        fpnDeliveryPostcode: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryPostcode : fpnDeliveryPostcode,
        fpnPaymentUrl: editVariant === "fpnPayment" ? updatedData.fpnPaymentUrl : fpnPaymentUrl,
        fpnPaymentTelNo: editVariant === "fpnPayment" ? updatedData.fpnPaymentTelNo : fpnPaymentTelNo,
        fpnPaymentBankName: editVariant === "fpnPayment" ? updatedData.fpnPaymentBankName : fpnPaymentBankName,
        fpnPaymentSortCode: editVariant === "fpnPayment" ? updatedData.fpnPaymentSortCode : fpnPaymentSortCode,
        fpnPaymentAccountNo: editVariant === "fpnPayment" ? updatedData.fpnPaymentAccountNo : fpnPaymentAccountNo,
        fpnPaymentAccountName: editVariant === "fpnPayment" ? updatedData.fpnPaymentAccountName : fpnPaymentAccountName,
        fpnPaymentPostcode: editVariant === "fpnPayment" ? updatedData.fpnPaymentPostcode : fpnPaymentPostcode,
        fpnContactName: editVariant === "fpnContact" ? updatedData.fpnContactName : fpnContactName,
        fpnContactPostcode: editVariant === "fpnContact" ? updatedData.fpnContactPostcode : fpnContactPostcode,
        fpnContactTelNo: editVariant === "fpnContact" ? updatedData.fpnContactTelNo : fpnContactTelNo,
        districtPostalAddress1:
          editVariant === "district" ? updatedData.districtPostalAddress1 : districtPostalAddress1,
        districtPostalAddress2:
          editVariant === "district" ? updatedData.districtPostalAddress2 : districtPostalAddress2,
        districtPostalAddress3:
          editVariant === "district" ? updatedData.districtPostalAddress3 : districtPostalAddress3,
        districtPostalAddress4:
          editVariant === "district" ? updatedData.districtPostalAddress4 : districtPostalAddress4,
        districtPostalAddress5:
          editVariant === "district" ? updatedData.districtPostalAddress5 : districtPostalAddress5,
        fpnDeliveryAddress1: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryAddress1 : fpnDeliveryAddress1,
        fpnDeliveryAddress2: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryAddress2 : fpnDeliveryAddress2,
        fpnDeliveryAddress3: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryAddress3 : fpnDeliveryAddress3,
        fpnDeliveryAddress4: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryAddress4 : fpnDeliveryAddress4,
        fpnDeliveryAddress5: editVariant === "fpnDelivery" ? updatedData.fpnDeliveryAddress5 : fpnDeliveryAddress5,
        fpnContactAddress1: editVariant === "fpnContact" ? updatedData.fpnContactAddress1 : fpnContactAddress1,
        fpnContactAddress2: editVariant === "fpnContact" ? updatedData.fpnContactAddress2 : fpnContactAddress2,
        fpnContactAddress3: editVariant === "fpnContact" ? updatedData.fpnContactAddress3 : fpnContactAddress3,
        fpnContactAddress4: editVariant === "fpnContact" ? updatedData.fpnContactAddress4 : fpnContactAddress4,
        fpnContactAddress5: editVariant === "fpnContact" ? updatedData.fpnContactAddress5 : fpnContactAddress5,
        fpnPaymentAddress1: editVariant === "fpnPayment" ? updatedData.fpnPaymentAddress1 : fpnPaymentAddress1,
        fpnPaymentAddress2: editVariant === "fpnPayment" ? updatedData.fpnPaymentAddress2 : fpnPaymentAddress2,
        fpnPaymentAddress3: editVariant === "fpnPayment" ? updatedData.fpnPaymentAddress3 : fpnPaymentAddress3,
        fpnPaymentAddress4: editVariant === "fpnPayment" ? updatedData.fpnPaymentAddress4 : fpnPaymentAddress4,
        fpnPaymentAddress5: editVariant === "fpnPayment" ? updatedData.fpnPaymentAddress5 : fpnPaymentAddress5,
        fpnDeliveryEmailAddress:
          editVariant === "fpnDelivery" ? updatedData.fpnDeliveryEmailAddress : fpnDeliveryEmailAddress,
        districtPermitSchemeId:
          editVariant === "fpnContact" ? updatedData.districtPermitSchemeId : districtPermitSchemeId,
      };

      if (onUpdateData) onUpdateData(newData);
    }
  };

  /**
   * Event to handle when the edit district dialog is closed.
   */
  const handleCloseEditDistrict = () => {
    setShowEditDialog(false);
  };

  const getFunction = () => {
    const rec = OperationalDistrictFunction.find((x) => x.id === districtFunction);

    if (rec) return rec.gpText;
    else return "";
  };

  const getDistrictAddress = () => {
    const districtAddress = [];
    if (districtPostalAddress1) districtAddress.push(districtPostalAddress1);
    if (districtPostalAddress2) districtAddress.push(districtPostalAddress2);
    if (districtPostalAddress3) districtAddress.push(districtPostalAddress3);
    if (districtPostalAddress4) districtAddress.push(districtPostalAddress4);
    if (districtPostalAddress5) districtAddress.push(districtPostalAddress5);
    return addressToTitleCase(districtAddress.join(", "));
  };

  const getFpnDeliveryAddress = () => {
    const deliveryAddress = [];
    if (fpnDeliveryAddress1) deliveryAddress.push(fpnDeliveryAddress1);
    if (fpnDeliveryAddress2) deliveryAddress.push(fpnDeliveryAddress2);
    if (fpnDeliveryAddress3) deliveryAddress.push(fpnDeliveryAddress3);
    if (fpnDeliveryAddress4) deliveryAddress.push(fpnDeliveryAddress4);
    if (fpnDeliveryAddress5) deliveryAddress.push(fpnDeliveryAddress5);
    return addressToTitleCase(deliveryAddress.join(", "));
  };

  const getFpnPaymentAddress = () => {
    const paymentAddress = [];
    if (fpnPaymentAddress1) paymentAddress.push(fpnPaymentAddress1);
    if (fpnPaymentAddress2) paymentAddress.push(fpnPaymentAddress2);
    if (fpnPaymentAddress3) paymentAddress.push(fpnPaymentAddress3);
    if (fpnPaymentAddress4) paymentAddress.push(fpnPaymentAddress4);
    if (fpnPaymentAddress5) paymentAddress.push(fpnPaymentAddress5);
    return addressToTitleCase(paymentAddress.join(", "));
  };

  const getFpnContactAddress = () => {
    const contactAddress = [];
    if (fpnContactAddress1) contactAddress.push(fpnContactAddress1);
    if (fpnContactAddress2) contactAddress.push(fpnContactAddress2);
    if (fpnContactAddress3) contactAddress.push(fpnContactAddress3);
    if (fpnContactAddress4) contactAddress.push(fpnContactAddress4);
    if (fpnContactAddress5) contactAddress.push(fpnContactAddress5);
    return addressToTitleCase(contactAddress.join(", "));
  };

  useEffect(() => {
    if (data) {
      setOrganisationId(data.organisationId);
      setDistrictName(data.districtName);
      setDistrictId(data.districtId);
      setDistrictFunction(data.districtFunction);
      setDistrictClosed(data.districtClosed);
      setDistrictFtpServerName(data.districtFtpServerName);
      setDistrictServerIpAddress(data.districtServerIpAddress);
      setDistrictFtpDirectory(data.districtFtpDirectory);
      setDistrictNotificationsUrl(data.districtNotificationsUrl);
      setAttachmentUrlPrefix(data.attachmentUrlPrefix);
      setDistrictFaxNo(data.districtFaxNo);
      setDistrictPostcode(data.districtPostcode);
      setDistrictTelNo(data.districtTelNo);
      setOutOfHoursArrangements(data.outOfHoursArrangements);
      setFpnDeliveryUrl(data.fpnDeliveryUrl);
      setFpnFaxNumber(data.fpnFaxNumber);
      setFpnDeliveryPostcode(data.fpnDeliveryPostcode);
      setFpnPaymentUrl(data.fpnPaymentUrl);
      setFpnPaymentTelNo(data.fpnPaymentTelNo);
      setFpnPaymentBankName(data.fpnPaymentBankName);
      setFpnPaymentSortCode(data.fpnPaymentSortCode);
      setFpnPaymentAccountNo(data.fpnPaymentAccountNo);
      setFpnPaymentAccountName(data.fpnPaymentAccountName);
      setFpnPaymentPostcode(data.fpnPaymentPostcode);
      setFpnContactName(data.fpnContactName);
      setFpnContactPostcode(data.fpnContactPostcode);
      setFpnContactTelNo(data.fpnContactTelNo);
      setDistrictPostalAddress1(data.districtPostalAddress1);
      setDistrictPostalAddress2(data.districtPostalAddress2);
      setDistrictPostalAddress3(data.districtPostalAddress3);
      setDistrictPostalAddress4(data.districtPostalAddress4);
      setDistrictPostalAddress5(data.districtPostalAddress5);
      setFpnDeliveryAddress1(data.fpnDeliveryAddress1);
      setFpnDeliveryAddress2(data.fpnDeliveryAddress2);
      setFpnDeliveryAddress3(data.fpnDeliveryAddress3);
      setFpnDeliveryAddress4(data.fpnDeliveryAddress4);
      setFpnDeliveryAddress5(data.fpnDeliveryAddress5);
      setFpnContactAddress1(data.fpnContactAddress1);
      setFpnContactAddress2(data.fpnContactAddress2);
      setFpnContactAddress3(data.fpnContactAddress3);
      setFpnContactAddress4(data.fpnContactAddress4);
      setFpnContactAddress5(data.fpnContactAddress5);
      setFpnPaymentAddress1(data.fpnPaymentAddress1);
      setFpnPaymentAddress2(data.fpnPaymentAddress2);
      setFpnPaymentAddress3(data.fpnPaymentAddress3);
      setFpnPaymentAddress4(data.fpnPaymentAddress4);
      setFpnPaymentAddress5(data.fpnPaymentAddress5);
      setFpnDeliveryEmailAddress(data.fpnDeliveryEmailAddress);
      setDistrictPermitSchemeId(data.districtPermitSchemeId);
    }
  }, [data]);

  useEffect(() => {
    if (lookupContext.districtUpdated) {
      setShowEditDialog(false);
      lookupContext.onDistrictUpdated(false);
    }
  }, [lookupContext]);

  return (
    <Box
      sx={{
        ml: theme.spacing(1),
        mr: theme.spacing(4.5),
        mt: theme.spacing(2),
      }}
    >
      <Stack direction="column" spacing={2}>
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="flex-start"
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem />}
        >
          <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
          <Typography variant="h6">{`${lookupToTitleCase(districtName, false)} district settings`}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: theme.spacing(5.75) }}>
          <Typography variant="subtitle2">Set basic, FTP and FPN details for the district</Typography>
        </Stack>
      </Stack>
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3 }}
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ pl: theme.spacing(5.75), pt: theme.spacing(2) }}
      >
        {/* District */}
        <Card
          variant="outlined"
          elevation={0}
          onMouseEnter={doMouseEnterDistrict}
          onMouseLeave={doMouseLeaveDistrict}
          sx={settingsCardStyle(editDistrict)}
        >
          <CardHeader
            action={
              editDistrict && (
                <Tooltip title="Edit District information" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={doEditDistrict} sx={{ pr: "16px", pb: "16px" }}>
                    <EditIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )
            }
            title="District"
            titleTypographyProps={{
              sx: getTitleStyle(editDistrict),
            }}
            sx={{ height: "66px" }}
          />
          <CardActionArea onClick={doEditDistrict}>
            <CardContent sx={settingsCardContentStyle("district")}>
              <>
                <Grid container rowSpacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="body2">Authority</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {GetAuthorityLabel(organisationId, settingsContext.isScottish)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Name</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {lookupToTitleCase(districtName, false)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">ID</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {districtId}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Function</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {getFunction()}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Address</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {getDistrictAddress()}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Postcode</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {districtPostcode}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Telephone no.</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {districtTelNo}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Fax no.</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {districtFaxNo}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">Closed date</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {FormatDate(districtClosed)}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            </CardContent>
          </CardActionArea>
        </Card>
        {/* FTP */}
        <Card
          variant="outlined"
          elevation={0}
          onMouseEnter={doMouseEnterFtp}
          onMouseLeave={doMouseLeaveFtp}
          sx={settingsCardStyle(editFtp)}
        >
          <CardHeader
            action={
              editFtp && (
                <Tooltip title="Edit FTP information" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={doEditFtp} sx={{ pr: "16px", pb: "16px" }}>
                    <EditIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )
            }
            title="FTP"
            titleTypographyProps={{
              sx: getTitleStyle(editFtp),
            }}
            sx={{ height: "66px" }}
          />
          <CardActionArea onClick={doEditFtp}>
            <CardContent sx={settingsCardContentStyle("districtFtp")}>
              <Grid container rowSpacing={1}>
                <Grid item xs={3}>
                  <Typography variant="body2">FTP server name</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {districtFtpServerName}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Server IP address</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {districtServerIpAddress}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">FTP directory</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {districtFtpDirectory}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Notification URL</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {districtNotificationsUrl}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Attachment URL prefix</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {attachmentUrlPrefix}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Card>
        {/* Fixed penalty notice: delivery */}
        <Card
          variant="outlined"
          elevation={0}
          onMouseEnter={doMouseEnterFpnDelivery}
          onMouseLeave={doMouseLeaveFpnDelivery}
          sx={settingsCardStyle(editFpnDelivery)}
        >
          <CardHeader
            action={
              editFpnDelivery && (
                <Tooltip title="Edit fixed penalty notice: delivery information" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={doEditFpnDelivery} sx={{ pr: "16px", pb: "16px" }}>
                    <EditIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )
            }
            title="Fixed penalty notice: delivery"
            titleTypographyProps={{
              sx: getTitleStyle(editFpnDelivery),
            }}
            sx={{ height: "66px" }}
          />
          <CardActionArea onClick={doEditFpnDelivery}>
            <CardContent sx={settingsCardContentStyle("districtFpnDelivery")}>
              <Grid container rowSpacing={1}>
                <Grid item xs={3}>
                  <Typography variant="body2">Delivery URL</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnDeliveryUrl}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Address</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getFpnDeliveryAddress()}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Postcode</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnDeliveryPostcode}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Email address</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnDeliveryEmailAddress}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Card>
        {/* Fixed penalty notice: payment */}
        <Card
          variant="outlined"
          elevation={0}
          onMouseEnter={doMouseEnterFpnPayment}
          onMouseLeave={doMouseLeaveFpnPayment}
          sx={settingsCardStyle(editFpnPayment)}
        >
          <CardHeader
            action={
              editFpnPayment && (
                <Tooltip title="Edit fixed penalty notice: payment information" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={doEditFpnPayment} sx={{ pr: "16px", pb: "16px" }}>
                    <EditIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )
            }
            title="Fixed penalty notice: payment"
            titleTypographyProps={{
              sx: getTitleStyle(editFpnPayment),
            }}
            sx={{ height: "66px" }}
          />
          <CardActionArea onClick={doEditFpnPayment}>
            <CardContent sx={settingsCardContentStyle("districtFpnPayment")}>
              <Grid container rowSpacing={1}>
                <Grid item xs={3}>
                  <Typography variant="body2">Payment URL</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentUrl}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Bank name</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentBankName}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Account name</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentAccountName}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Account no.</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentAccountNo}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Sort code</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentSortCode}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Payment address</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getFpnPaymentAddress()}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Postcode</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentPostcode}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Telephone no.</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnPaymentTelNo}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Card>
        {/* Fixed penalty notice: contact */}
        <Card
          variant="outlined"
          elevation={0}
          onMouseEnter={doMouseEnterFpnContact}
          onMouseLeave={doMouseLeaveFpnContact}
          sx={settingsCardStyle(editFpnContact)}
        >
          <CardHeader
            action={
              editFpnContact && (
                <Tooltip title="Edit fixed penalty notice: contact information" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={doEditFpnContact} sx={{ pr: "16px", pb: "16px" }}>
                    <EditIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )
            }
            title="Fixed penalty notice: contact"
            titleTypographyProps={{
              sx: getTitleStyle(editFpnContact),
            }}
            sx={{ height: "66px" }}
          />
          <CardActionArea onClick={doEditFpnContact}>
            <CardContent sx={settingsCardContentStyle("districtFpnContact")}>
              <Grid container rowSpacing={1}>
                <Grid item xs={3}>
                  <Typography variant="body2">Contact name</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnContactName}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Contact address</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getFpnContactAddress()}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Postcode</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnContactPostcode}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Telephone no.</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fpnContactTelNo}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Permit scheme ID</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {districtPermitSchemeId}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">Out of hours arrangements made</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {`${outOfHoursArrangements ? "Yes" : "No"}`}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Card>
      </Masonry>
      <EditDistrictLookupDialog
        isOpen={showEditDialog}
        variant={editVariant}
        data={editData}
        onDone={(data) => handleDoneEditDistrict(data)}
        onClose={handleCloseEditDistrict}
      />
    </Box>
  );
}

export default DistrictLookupTab;
