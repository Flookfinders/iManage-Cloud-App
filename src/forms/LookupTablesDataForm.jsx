//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to edit an existing lookup
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   29.06.23 Sean Flook                  Added ability to set enabled flag for cross reference records.
//    003   07.09.23 Sean Flook                  Removed unnecessary awaits.
//    004   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    005   01.12.23 Sean Flook        IMANN-194 Modified UpdateLookups to use the new LookupContext.onUpdateLookup event.
//    006   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    007   05.01.24 Sean Flook                  Changes to sort out warnings.
//    008   10.01.24 Sean Flook                  Fix warnings.
//    009   25.01.24 Sean Flook        IMANN-253 Include historic when checking for changes.
//    010   01.02.24 Sean Flook                  Initial changes required for operational districts.
//    011   05.02.24 Sean Flook                  Further changes required for operational districts.
//    012   29.02.24 Joel Benford      IMANN-242 Add DbAuthority.
//    013   27.03.24 Sean Flook                  Further changes to fix warnings.
//    014   09.04.24 Sean Flook        IMANN-376 Changes required to allow lookups to be added on the fly.
//    015   26.04.24 Sean Flook        IMANN-413 Removed Gaelic option.
//    016   09.02.24 Joel Benford     IM-227/228 Fix ward/parish URL calls
//    017   17.05.24 Sean Flook        IMANN-176 Display dialog to allow for spatially updating BLPU ward and parish codes.
//    018   09.02.24 Joel Benford     IM-227/228 Fix ward/parish update, and various array pushes
//    019   06.06.24 Joel Benford      IMANN-497 Interim check-in
//    020   13.06.24 Joel Benford      IMANN-497 Various fixes mostly on making historic
//    021   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    022   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0
//#region Version 1.0.1.0
//    023   01.10.24 Sean Flook        IMANN-431 Change the default returned in GetLinkedRef to -1.
//    024   02.10.24 Sean Flook        IMANN-994 Include the PKId in the update data for App Cross References.
//    025   07.10.24 Sean Flook        IMANN-995 Corrected check for linked records when refreshing data after a delete.
//#endregion Version 1.0.1.0
//#region Version 1.0.5.0
//    022   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import { GetCurrentDate, GetLookupUrl, GetOldLookups, addLookup, getLookupVariantString } from "../utils/HelperUtils";

import { Snackbar, Alert } from "@mui/material";
import { Box } from "@mui/system";

import LookupTableGridTab from "../tabs/LookupTableGridTab";

import AddLookupDialog from "../dialogs/AddLookupDialog";
import EditLookupDialog from "../dialogs/EditLookupDialog";
import DeleteLookupDialog from "../dialogs/DeleteLookupDialog";
import UpdateWardParishBoundariesDialog from "../dialogs/UpdateWardParishBoundariesDialog";

import { GetAlertStyle, GetAlertIcon, GetAlertSeverity } from "../utils/ADSStyles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

LookupTablesDataForm.propTypes = {
  nodeId: PropTypes.oneOf([
    "POSTCODES",
    "SUB_LOCALITIES",
    "POST_TOWNS",
    "CROSS_REFERENCES",
    "LOCALITIES",
    "TOWNS",
    "ISLANDS",
    "ADMINISTRATIVE_AREAS",
    "AUTHORITIES",
    "WARDS",
    "PARISHES",
    "OPERATIONAL_DISTRICTS",
  ]).isRequired,
  onViewOperationalDistrict: PropTypes.func.isRequired,
  onAddOperationalDistrict: PropTypes.func.isRequired,
};

function LookupTablesDataForm({ nodeId, onViewOperationalDistrict, onAddOperationalDistrict }) {
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [currentTab, setCurrentTab] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [lookupId, setLookupId] = useState(0);
  const [lookupInUse, setLookupInUse] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [openUpdateWardParishBoundariesDialog, setOpenUpdateWardParishBoundariesDialog] = useState(false);
  const [updateWardParishBoundariesVariant, setUpdateWardParishBoundariesVariant] = useState("Ward");

  const [engError, setEngError] = useState(null);
  const [altLanguageError, setAltLanguageError] = useState(null);

  const addResult = useRef(null);
  const editResult = useRef(null);
  const deleteResult = useRef(null);
  const currentVariant = useRef(null);

  const getPostcodeData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.postcodes &&
      lookupContext.currentLookups.postcodes.length > 0
    )
      return lookupContext.currentLookups.postcodes.map(function (x) {
        return {
          id: x.postcodeRef,
          postcode: x.postcode,
          historic: x.historic,
        };
      });
    else return [];
  };

  const getPostTownData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.postTowns &&
      lookupContext.currentLookups.postTowns.length > 0
    ) {
      const postTownData = [];
      const engData = lookupContext.currentLookups.postTowns.filter((x) => x.language === "ENG");

      if (settingsContext.isWelsh) {
        const cymData = lookupContext.currentLookups.postTowns.filter((x) => x.language === "CYM");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const cymRecord = cymData.find((x) => x.postTownRef === engRecord.linkedRef);
          if (cymRecord)
            postTownData.push({
              id: engRecord.postTownRef,
              postTownEng: engRecord.postTown,
              postTownCym: cymRecord.postTown,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            postTownData.push({
              id: engRecord.postTownRef,
              postTownEng: engRecord.postTown,
              postTownCym: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < cymData.length; i++) {
          const cymRecord = cymData[i];
          const engRecord = engData.find((x) => x.postTownRef === cymRecord.linkedRef);
          if (!engRecord)
            postTownData.push({
              id: cymRecord.postTownRef,
              postTownEng: "",
              postTownCym: cymRecord.postTown,
              historic: cymRecord.historic,
              linkedRef: cymRecord.linkedRef,
            });
        }

        return postTownData;
      } else {
        return lookupContext.currentLookups.postTowns.map(function (x) {
          return {
            id: x.postTownRef,
            postTownEng: x.postTown,
            historic: x.historic,
            linkedRef: x.linkedRef,
          };
        });
      }
    } else return [];
  };

  const getSubLocalitiesData = () => {
    if (
      settingsContext.isScottish &&
      lookupContext.currentLookups &&
      lookupContext.currentLookups.subLocalities &&
      lookupContext.currentLookups.subLocalities.length > 0
    ) {
      return lookupContext.currentLookups.subLocalities.map(function (x) {
        return {
          id: x.subLocalityRef,
          subLocalityEng: x.subLocality,
          historic: x.historic,
          linkedRef: x.linkedRef,
        };
      });
    } else return [];
  };

  const getCrossReferencesData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.appCrossRefs &&
      lookupContext.currentLookups.appCrossRefs.length > 0
    )
      return lookupContext.currentLookups.appCrossRefs.map(function (x) {
        return {
          id: x.pkId,
          xrefSourceRef73: x.xrefSourceRef73,
          xrefDescription: x.xrefDescription,
          historic: x.historic,
          export: x.export,
        };
      });
    else return [];
  };

  const getLocalitiesData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.localities &&
      lookupContext.currentLookups.localities.length > 0
    ) {
      const localityData = [];
      const engData = lookupContext.currentLookups.localities.filter((x) => x.language === "ENG");

      if (settingsContext.isWelsh) {
        const cymData = lookupContext.currentLookups.localities.filter((x) => x.language === "CYM");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const cymRecord = cymData.find((x) => x.localityRef === engRecord.linkedRef);
          if (cymRecord)
            localityData.push({
              id: engRecord.localityRef,
              localityEng: engRecord.locality,
              localityCym: cymRecord.locality,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            localityData.push({
              id: engRecord.localityRef,
              localityEng: engRecord.locality,
              localityCym: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < cymData.length; i++) {
          const cymRecord = cymData[i];
          const engRecord = engData.find((x) => x.localityRef === cymRecord.linkedRef);
          if (!engRecord)
            localityData.push({
              id: cymRecord.localityRef,
              localityEng: "",
              localityCym: cymRecord.locality,
              historic: cymRecord.historic,
              linkedRef: cymRecord.linkedRef,
            });
        }

        return localityData;
      } else {
        return lookupContext.currentLookups.localities.map(function (x) {
          return {
            id: x.localityRef,
            localityEng: x.locality,
            historic: x.historic,
            linkedRef: x.linkedRef,
          };
        });
      }
    } else return [];
  };

  const getTownsData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.towns &&
      lookupContext.currentLookups.towns.length > 0
    ) {
      const townData = [];
      const engData = lookupContext.currentLookups.towns.filter((x) => x.language === "ENG");

      if (settingsContext.isWelsh) {
        const cymData = lookupContext.currentLookups.towns.filter((x) => x.language === "CYM");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const cymRecord = cymData.find((x) => x.townRef === engRecord.linkedRef);
          if (cymRecord)
            townData.push({
              id: engRecord.townRef,
              townEng: engRecord.town,
              townCym: cymRecord.town,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            townData.push({
              id: engRecord.townRef,
              townEng: engRecord.town,
              townCym: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < cymData.length; i++) {
          const cymRecord = cymData[i];
          const engRecord = engData.find((x) => x.townRef === cymRecord.linkedRef);
          if (!engRecord)
            townData.push({
              id: cymRecord.townRef,
              townEng: "",
              townCym: cymRecord.town,
              historic: cymRecord.historic,
              linkedRef: cymRecord.linkedRef,
            });
        }

        return townData;
      } else {
        return lookupContext.currentLookups.towns.map(function (x) {
          return {
            id: x.townRef,
            townEng: x.town,
            historic: x.historic,
            linkedRef: x.linkedRef,
          };
        });
      }
    } else return [];
  };

  const getIslandsData = () => {
    if (
      settingsContext.isScottish &&
      lookupContext.currentLookups &&
      lookupContext.currentLookups.islands &&
      lookupContext.currentLookups.islands.length > 0
    ) {
      return lookupContext.currentLookups.islands.map(function (x) {
        return {
          id: x.islandRef,
          islandEng: x.island,
          historic: x.historic,
          linkedRef: x.linkedRef,
        };
      });
    } else return [];
  };

  const getAdministrativeAreasData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.adminAuthorities &&
      lookupContext.currentLookups.adminAuthorities.length > 0
    ) {
      const administrativeAreaData = [];
      const engData = lookupContext.currentLookups.adminAuthorities.filter((x) => x.language === "ENG");

      if (settingsContext.isWelsh) {
        const cymData = lookupContext.currentLookups.adminAuthorities.filter((x) => x.language === "CYM");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const cymRecord = cymData.find((x) => x.administrativeAreaRef === engRecord.linkedRef);
          if (cymRecord)
            administrativeAreaData.push({
              id: engRecord.administrativeAreaRef,
              administrativeAreaEng: engRecord.administrativeArea,
              administrativeAreaCym: cymRecord.administrativeArea,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            administrativeAreaData.push({
              id: engRecord.administrativeAreaRef,
              administrativeAreaEng: engRecord.administrativeArea,
              administrativeAreaCym: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < cymData.length; i++) {
          const cymRecord = cymData[i];
          const engRecord = engData.find((x) => x.administrativeAreaRef === cymRecord.linkedRef);
          if (!engRecord)
            administrativeAreaData.push({
              id: cymRecord.administrativeAreaRef,
              administrativeAreaEng: "",
              administrativeAreaCym: cymRecord.administrativeArea,
              historic: cymRecord.historic,
              linkedRef: cymRecord.linkedRef,
            });
        }

        return administrativeAreaData;
      } else {
        return lookupContext.currentLookups.adminAuthorities.map(function (x) {
          return {
            id: x.administrativeAreaRef,
            administrativeAreaEng: x.administrativeArea,
            historic: x.historic,
            linkedRef: x.linkedRef,
          };
        });
      }
    } else return [];
  };

  const getDbAuthoritiesData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.dbAuthorities &&
      lookupContext.currentLookups.dbAuthorities.length > 0
    )
      return lookupContext.currentLookups.dbAuthorities.map(function (x) {
        return {
          id: x.authorityRef,
          dbAuthorityRef: x.authorityRef,
          dbAuthorityName: x.authorityName,
          dbAuthorityMinUsrn: x.minUsrn,
          dbAuthorityMaxUsrn: x.maxUsrn,
        };
      });
    else return [];
  };

  const getWardsData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.wards &&
      lookupContext.currentLookups.wards.length > 0
    )
      return lookupContext.currentLookups.wards.map(function (x) {
        return {
          id: x.pkId,
          wardCode: x.wardCode,
          ward: x.ward,
          detrCode: x.detrCode,
          historic: x.historic,
        };
      });
    else return [];
  };

  const getParishesData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.parishes &&
      lookupContext.currentLookups.parishes.length > 0
    )
      return lookupContext.currentLookups.parishes.map(function (x) {
        return {
          id: x.pkId,
          parishCode: x.parishCode,
          parish: x.parish,
          detrCode: x.detrCode,
          historic: x.historic,
        };
      });
    else return [];
  };

  const getOperationalDistrictsData = () => {
    if (
      lookupContext.currentLookups &&
      lookupContext.currentLookups.operationalDistricts &&
      lookupContext.currentLookups.operationalDistricts.length > 0
    )
      return lookupContext.currentLookups.operationalDistricts.map(function (x) {
        return {
          id: x.operationalDistrictId,
          organisationId: x.organisationId,
          districtName: x.districtName,
          lastUpdateDate: x.lastUpdateDate,
          districtId: x.districtId,
          districtFunction: x.districtFunction,
          districtClosed: x.districtClosed,
          districtFtpServerName: x.districtFtpServerName,
          districtServerIpAddress: x.districtServerIpAddress,
          districtFtpDirectory: x.districtFtpDirectory,
          districtNotificationsUrl: x.districtNotificationsUrl,
          attachmentUrlPrefix: x.attachmentUrlPrefix,
          districtFaxNo: x.districtFaxNo,
          districtPostcode: x.districtPostcode,
          districtTelNo: x.districtTelNo,
          outOfHoursArrangements: x.outOfHoursArrangements,
          fpnDeliveryUrl: x.fpnDeliveryUrl,
          fpnFaxNumber: x.fpnFaxNumber,
          fpnDeliveryPostcode: x.fpnDeliveryPostcode,
          fpnPaymentUrl: x.fpnPaymentUrl,
          fpnPaymentTelNo: x.fpnPaymentTelNo,
          fpnPaymentBankName: x.fpnPaymentBankName,
          fpnPaymentSortCode: x.fpnPaymentSortCode,
          fpnPaymentAccountNo: x.fpnPaymentAccountNo,
          fpnPaymentAccountName: x.fpnPaymentAccountName,
          fpnPaymentPostcode: x.fpnPaymentPostcode,
          fpnContactName: x.fpnContactName,
          fpnContactPostcode: x.fpnContactPostcode,
          fpnContactTelNo: x.fpnContactTelNo,
          districtPostalAddress1: x.districtPostalAddress1,
          districtPostalAddress2: x.districtPostalAddress2,
          districtPostalAddress3: x.districtPostalAddress3,
          districtPostalAddress4: x.districtPostalAddress4,
          districtPostalAddress5: x.districtPostalAddress5,
          fpnDeliveryAddress1: x.fpnDeliveryAddress1,
          fpnDeliveryAddress2: x.fpnDeliveryAddress2,
          fpnDeliveryAddress3: x.fpnDeliveryAddress3,
          fpnDeliveryAddress4: x.fpnDeliveryAddress4,
          fpnDeliveryAddress5: x.fpnDeliveryAddress5,
          fpnContactAddress1: x.fpnContactAddress1,
          fpnContactAddress2: x.fpnContactAddress2,
          fpnContactAddress3: x.fpnContactAddress3,
          fpnContactAddress4: x.fpnContactAddress4,
          fpnContactAddress5: x.fpnContactAddress5,
          fpnPaymentAddress1: x.fpnPaymentAddress1,
          fpnPaymentAddress2: x.fpnPaymentAddress2,
          fpnPaymentAddress3: x.fpnPaymentAddress3,
          fpnPaymentAddress4: x.fpnPaymentAddress4,
          fpnPaymentAddress5: x.fpnPaymentAddress5,
          fpnDeliveryEmailAddress: x.fpnDeliveryEmailAddress,
          districtPermitSchemeId: x.districtPermitSchemeId,
          historic: x.historic,
        };
      });
    else return [];
  };

  const isLookupInUse = async (variant, id) => {
    const lookupUrl = GetLookupUrl(variant, "GET", userContext.currentUser, settingsContext.authorityCode);

    if (lookupUrl) {
      let lookupRecord = null;

      await fetch(`${lookupUrl.url}/${id}`, {
        headers: lookupUrl.headers,
        crossDomain: true,
        method: lookupUrl.type,
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then((result) => {
          lookupRecord = result;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                if (userContext.currentUser.showMessages)
                  console.error(`[400 ERROR] Getting ${getLookupVariantString(variant)} object`, body.errors);
              });
              break;

            case 401:
              userContext.onExpired();
              break;

            case 500:
              if (userContext.currentUser.showMessages)
                console.error(`[500 ERROR] Getting ${getLookupVariantString(variant)} object`, res);
              break;

            default:
              if (userContext.currentUser.showMessages)
                console.error(`[${res.status} ERROR] Getting ${getLookupVariantString(variant)} object`, res);
              break;
          }
        });

      if (lookupRecord && lookupRecord.length > 0 && variant !== "crossReference") {
        setLookupInUse(lookupRecord[0].isUsed);
      } else setLookupInUse(false);
    }
  };

  const handleAddPostcode = () => {
    setLookupType("postcode");
    setShowAddDialog(true);
  };

  const handleEditPostcode = (id) => {
    setLookupId(id);
    setLookupType("postcode");
    isLookupInUse("postcode", id);
    setShowEditDialog(true);
  };

  const handleDeletePostcode = (id) => {
    setLookupId(id);
    setLookupType("postcode");
    isLookupInUse("postcode", id);
    setShowDeleteDialog(true);
  };

  const handleAddPostTown = () => {
    setLookupType("postTown");
    setShowAddDialog(true);
  };

  const handleEditPostTown = (id) => {
    setLookupId(id);
    setLookupType("postTown");
    isLookupInUse("postTown", id);
    setShowEditDialog(true);
  };

  const handleDeletePostTown = (id) => {
    setLookupId(id);
    setLookupType("postTown");
    isLookupInUse("postTown", id);
    setShowDeleteDialog(true);
  };

  const handleAddSubLocality = () => {
    setLookupType("subLocality");
    setShowAddDialog(true);
  };

  const handleEditSubLocality = (id) => {
    setLookupId(id);
    setLookupType("subLocality");
    isLookupInUse("subLocality", id);
    setShowEditDialog(true);
  };

  const handleDeleteSubLocality = (id) => {
    setLookupId(id);
    setLookupType("subLocality");
    isLookupInUse("subLocality", id);
    setShowDeleteDialog(true);
  };

  const handleAddCrossReference = () => {
    setLookupType("crossReference");
    setShowAddDialog(true);
  };

  const handleEditCrossReference = (id) => {
    setLookupId(id);
    setLookupType("crossReference");
    // isLookupInUse("crossReference", id);
    setLookupInUse(false);
    setShowEditDialog(true);
  };

  const handleDeleteCrossReference = (id) => {
    setLookupId(id);
    setLookupType("crossReference");
    // isLookupInUse("crossReference", id);
    setLookupInUse(false);
    setShowDeleteDialog(true);
  };

  const handleAddLocality = () => {
    setLookupType("locality");
    setShowAddDialog(true);
  };

  const handleEditLocality = (id) => {
    setLookupId(id);
    setLookupType("locality");
    isLookupInUse("locality", id);
    setShowEditDialog(true);
  };

  const handleDeleteLocality = (id) => {
    setLookupId(id);
    setLookupType("locality");
    isLookupInUse("locality", id);
    setShowDeleteDialog(true);
  };

  const handleAddTown = () => {
    setLookupType("town");
    setShowAddDialog(true);
  };

  const handleEditTown = (id) => {
    setLookupId(id);
    setLookupType("town");
    isLookupInUse("town", id);
    setShowEditDialog(true);
  };

  const handleDeleteTown = (id) => {
    setLookupId(id);
    setLookupType("town");
    isLookupInUse("town", id);
    setShowDeleteDialog(true);
  };

  const handleAddIsland = () => {
    setLookupType("island");
    setShowAddDialog(true);
  };

  const handleEditIsland = (id) => {
    setLookupId(id);
    setLookupType("island");
    isLookupInUse("island", id);
    setShowEditDialog(true);
  };

  const handleDeleteIsland = (id) => {
    setLookupId(id);
    setLookupType("island");
    isLookupInUse("island", id);
    setShowDeleteDialog(true);
  };

  const handleAddAdministrativeArea = () => {
    setLookupType("administrativeArea");
    setShowAddDialog(true);
  };

  const handleEditAdministrativeArea = (id) => {
    setLookupId(id);
    setLookupType("administrativeArea");
    isLookupInUse("administrativeArea", id);
    setShowEditDialog(true);
  };

  const handleDeleteAdministrativeArea = (id) => {
    setLookupId(id);
    setLookupType("administrativeArea");
    isLookupInUse("administrativeArea", id);
    setShowDeleteDialog(true);
  };

  const handleAddWard = () => {
    setLookupType("ward");
    setShowAddDialog(true);
  };

  const handleEditWard = (id) => {
    setLookupId(id);
    setLookupType("ward");
    // isLookupInUse("ward", id);
    setLookupInUse(false);
    setShowEditDialog(true);
  };

  const handleUpdateWardSpatialData = () => {
    setUpdateWardParishBoundariesVariant("Ward");
    setOpenUpdateWardParishBoundariesDialog(true);
  };

  const handleDeleteWard = (id) => {
    setLookupId(id);
    setLookupType("ward");
    // isLookupInUse("ward", id);
    setLookupInUse(false);
    setShowDeleteDialog(true);
  };

  const handleAddParish = () => {
    setLookupType("parish");
    setShowAddDialog(true);
  };

  const handleEditParish = (id) => {
    setLookupId(id);
    setLookupType("parish");
    // isLookupInUse("parish", id);
    setLookupInUse(false);
    setShowEditDialog(true);
  };

  const handleUpdateParishSpatialData = () => {
    setUpdateWardParishBoundariesVariant("Parish");
    setOpenUpdateWardParishBoundariesDialog(true);
  };

  const handleDeleteParish = (id) => {
    setLookupId(id);
    setLookupType("parish");
    // isLookupInUse("parish", id);
    setLookupInUse(false);
    setShowDeleteDialog(true);
  };

  const handleAddDbAuthority = () => {
    setLookupType("dbAuthority");
    setShowAddDialog(true);
  };

  const handleEditDbAuthority = (id) => {
    setLookupId(id);
    setLookupType("dbAuthority");
    setShowEditDialog(true);
  };

  const handleDeleteDbAuthority = (id) => {
    setLookupId(id);
    setLookupType("dbAuthority");
    setShowDeleteDialog(true);
  };

  const handleAddOperationalDistrict = () => {
    setLookupType("operationalDistrict");
    if (onAddOperationalDistrict) onAddOperationalDistrict();
  };

  const handleEditOperationalDistrict = (id) => {
    setLookupId(id);
    setLookupType("operationalDistrict");
    // isLookupInUse("operationalDistrict", id);
    setLookupInUse(false);
    if (onViewOperationalDistrict) onViewOperationalDistrict(id);
  };

  const handleDeleteOperationalDistrict = (id) => {
    setLookupId(id);
    setLookupType("operationalDistrict");
    // isLookupInUse("operationalDistrict", id);
    setLookupInUse(false);
    setShowDeleteDialog(true);
  };

  function GetLinkedRef(variant, lookupId) {
    if (settingsContext.isWelsh) {
      switch (variant) {
        case "postTown":
          const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
          if (postTownRecord) return postTownRecord.linkedRef;
          else return -1;

        case "subLocality":
          const subLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === lookupId
          );
          if (subLocalityRecord) return subLocalityRecord.linkedRef;
          else return -1;

        case "locality":
          const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
          if (localityRecord) return localityRecord.linkedRef;
          else return -1;

        case "town":
          const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
          if (townRecord) return townRecord.linkedRef;
          else return -1;

        case "island":
          const islandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
          if (islandRecord) return islandRecord.linkedRef;
          else return -1;

        case "administrativeArea":
          const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeAreaRef === lookupId
          );
          if (administrativeAreaRecord) return administrativeAreaRecord.linkedRef;
          else return -1;

        default:
          return -1;
      }
    } else return -1;
  }

  /**
   * Method to handle adding lookups.
   *
   * @param {object} data The data returned from the add lookup dialog.
   */
  const handleDoneAddLookup = async (data) => {
    currentVariant.current = getLookupVariantString(data.variant);

    const addResults = await addLookup(
      data,
      settingsContext.authorityCode,
      userContext,
      settingsContext.isWelsh,
      lookupContext.currentLookups
    );

    if (addResults && addResults.result) {
      if (addResults.updatedLookups && addResults.updatedLookups.length > 0)
        lookupContext.onUpdateLookup(data.variant, addResults.updatedLookups);
      addResult.current = true;
    } else addResult.current = false;
    setEngError(addResults ? addResults.engError : null);
    setAltLanguageError(addResults ? addResults.altLanguageError : null);

    setAddOpen(addResult.current);
    setShowAddDialog(!addResult.current);
  };

  const handleCloseAddLookup = () => {
    setShowAddDialog(false);
  };

  const updateSingleLookups = (variant, originalId, updatedLookup) => {
    if (updatedLookup) {
      switch (variant) {
        case "postcode":
          if (lookupInUse) {
            const historicPostcode = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === originalId);
            if (historicPostcode) {
              const updatedHistoricPostcode = lookupContext.currentLookups.postcodes.map(
                (x) =>
                  [
                    {
                      postcodeRef: historicPostcode.postcodeRef,
                      postcode: historicPostcode.postcode,
                      historic: true,
                      linkedRef: historicPostcode.linkedRef,
                    },
                  ].find((rec) => rec.postcodeRef === x.postcodeRef) || x
              );
              updatedHistoricPostcode.push(updatedLookup);
              return updatedHistoricPostcode;
            } else {
              lookupContext.currentLookups.postcodes.push(updatedLookup);
              return lookupContext.currentLookups.postcodes;
            }
          } else
            return lookupContext.currentLookups.postcodes.map(
              (x) => [updatedLookup].find((rec) => rec.postcodeRef === x.postcodeRef) || x
            );

        case "postTown":
          if (lookupInUse) {
            const historicPostTown = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === originalId);
            if (historicPostTown) {
              const updatedHistoricPostTown = lookupContext.currentLookups.postTowns.map(
                (x) =>
                  [
                    {
                      postTownRef: historicPostTown.postTownRef,
                      postTown: historicPostTown.postTown,
                      language: historicPostTown.language,
                      historic: true,
                      linkedRef: historicPostTown.linkedRef,
                    },
                  ].find((rec) => rec.postTownRef === x.postTownRef) || x
              );
              updatedHistoricPostTown.push(updatedLookup);
              return updatedHistoricPostTown;
            } else {
              lookupContext.currentLookups.postTowns.push(updatedLookup);
              return lookupContext.currentLookups.postTowns;
            }
          } else
            return lookupContext.currentLookups.postTowns.map(
              (x) => [updatedLookup].find((rec) => rec.postTownRef === x.postTownRef) || x
            );

        case "subLocality":
          if (lookupInUse) {
            const historicSubLocality = lookupContext.currentLookups.subLocalities.find(
              (x) => x.subLocalityRef === originalId
            );
            if (historicSubLocality) {
              const updatedHistoricSubLocality = lookupContext.currentLookups.subLocalities.map(
                (x) =>
                  [
                    {
                      subLocalityRef: historicSubLocality.subLocalityRef,
                      subLocality: historicSubLocality.subLocality,
                      language: historicSubLocality.language,
                      historic: true,
                      linkedRef: historicSubLocality.linkedRef,
                    },
                  ].find((rec) => rec.subLocalityRef === x.subLocalityRef) || x
              );
              updatedHistoricSubLocality.push(updatedLookup);
              return updatedHistoricSubLocality;
            } else {
              lookupContext.currentLookups.subLocalities.push(updatedLookup);
              return lookupContext.currentLookups.subLocalities;
            }
          } else
            return lookupContext.currentLookups.subLocalities.map(
              (x) => [updatedLookup].find((rec) => rec.subLocalityRef === x.subLocalityRef) || x
            );

        case "crossReference":
          return lookupContext.currentLookups.appCrossRefs.map(
            (x) => [updatedLookup].find((rec) => rec.pkId === x.pkId) || x
          );

        case "locality":
          if (lookupInUse) {
            const historicLocality = lookupContext.currentLookups.localities.find((x) => x.localityRef === originalId);
            if (historicLocality) {
              const updatedHistoricLocality = lookupContext.currentLookups.localities.map(
                (x) =>
                  [
                    {
                      localityRef: historicLocality.localityRef,
                      locality: historicLocality.locality,
                      language: historicLocality.language,
                      historic: true,
                      linkedRef: historicLocality.linkedRef,
                    },
                  ].find((rec) => rec.localityRef === x.localityRef) || x
              );
              updatedHistoricLocality.push(updatedLookup);
              return updatedHistoricLocality;
            } else {
              lookupContext.currentLookups.localities.push(updatedLookup);
              return lookupContext.currentLookups.localities;
            }
          } else
            return lookupContext.currentLookups.localities.map(
              (x) => [updatedLookup].find((rec) => rec.localityRef === x.localityRef) || x
            );

        case "town":
          if (lookupInUse) {
            const historicTown = lookupContext.currentLookups.towns.find((x) => x.townRef === originalId);
            if (historicTown) {
              const updatedHistoricTown = lookupContext.currentLookups.towns.map(
                (x) =>
                  [
                    {
                      townRef: historicTown.townRef,
                      town: historicTown.town,
                      language: historicTown.language,
                      historic: true,
                      linkedRef: historicTown.linkedRef,
                    },
                  ].find((rec) => rec.townRef === x.townRef) || x
              );
              updatedHistoricTown.push(updatedLookup);
              return updatedHistoricTown;
            } else {
              lookupContext.currentLookups.towns.push(updatedLookup);
              return lookupContext.currentLookups.towns;
            }
          } else
            return lookupContext.currentLookups.towns.map(
              (x) => [updatedLookup].find((rec) => rec.townRef === x.townRef) || x
            );

        case "administrativeArea":
          if (lookupInUse) {
            const historicArea = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeAreaRefRef === originalId
            );
            if (historicArea) {
              const updatedHistoricArea = lookupContext.currentLookups.adminAuthorities.map(
                (x) =>
                  [
                    {
                      administrativeAreaRef: historicArea.administrativeAreaRef,
                      administrativeArea: historicArea.administrativeArea,
                      language: historicArea.language,
                      historic: true,
                      linkedRef: historicArea.linkedRef,
                    },
                  ].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) || x
              );
              updatedHistoricArea.push(updatedLookup);
              return updatedHistoricArea;
            } else {
              lookupContext.currentLookups.adminAuthorities.push(updatedLookup);
              return lookupContext.currentLookups.adminAuthorities;
            }
          } else
            return lookupContext.currentLookups.adminAuthorities.map(
              (x) => [updatedLookup].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) || x
            );

        case "island":
          if (lookupInUse) {
            const historicIsland = lookupContext.currentLookups.islands.find((x) => x.islandRef === originalId);
            if (historicIsland) {
              const updatedHistoricIsland = lookupContext.currentLookups.islands.map(
                (x) =>
                  [
                    {
                      islandRef: historicIsland.islandRef,
                      island: historicIsland.island,
                      language: historicIsland.language,
                      historic: true,
                      linkedRef: historicIsland.linkedRef,
                    },
                  ].find((rec) => rec.islandRef === x.islandRef) || x
              );
              updatedHistoricIsland.push(updatedLookup);
              return updatedHistoricIsland;
            } else {
              lookupContext.currentLookups.islands.push(updatedLookup);
              return lookupContext.currentLookups.islands;
            }
          } else
            return lookupContext.currentLookups.islands.map(
              (x) => [updatedLookup].find((rec) => rec.islandRef === x.islandRef) || x
            );

        case "ward":
          if (originalId !== updatedLookup.pkId) {
            const historicWard = lookupContext.currentLookups.wards.find((x) => x.pkId === originalId);
            if (historicWard) {
              const updatedHistoricWard = lookupContext.currentLookups.wards.map(
                (x) =>
                  [
                    {
                      pkId: historicWard.pkId,
                      wardCode: historicWard.wardCode,
                      wardLegacyCode: historicWard.wardLegacyCode,
                      ward: historicWard.ward,
                      detrCode: historicWard.detrCode,
                      historic: true,
                    },
                  ].find((rec) => rec.pkId === x.pkId) || x
              );
              updatedHistoricWard.push(updatedLookup);
              return updatedHistoricWard;
            } else {
              lookupContext.currentLookups.wards.push(updatedLookup);
              return lookupContext.currentLookups.wards;
            }
          } else
            return lookupContext.currentLookups.wards.map(
              (x) => [updatedLookup].find((rec) => rec.pkId === x.pkId) || x
            );

        case "parish":
          if (originalId !== updatedLookup.pkId) {
            const historicParish = lookupContext.currentLookups.parishes.find((x) => x.pkId === originalId);
            if (historicParish) {
              const updatedHistoricParish = lookupContext.currentLookups.parishes.map(
                (x) =>
                  [
                    {
                      pkId: historicParish.pkId,
                      parishCode: historicParish.parishCode,
                      parishLegacyCode: historicParish.parishLegacyCode,
                      parish: historicParish.parish,
                      detrCode: historicParish.detrCode,
                      historic: true,
                    },
                  ].find((rec) => rec.pkId === x.pkId) || x
              );
              updatedHistoricParish.push(updatedLookup);
              return updatedHistoricParish;
            } else {
              lookupContext.currentLookups.parishes.push(updatedLookup);
              return lookupContext.currentLookups.parishes;
            }
          } else
            return lookupContext.currentLookups.parishes.map(
              (x) => [updatedLookup].find((rec) => rec.pkId === x.pkId) || x
            );

        case "dbAuthority":
          return lookupContext.currentLookups.dbAuthorities.map(
            (x) => [updatedLookup].find((rec) => rec.authorityRef === x.authorityRef) || x
          );

        case "operationalDistrict":
          return lookupContext.currentLookups.operationalDistricts.map(
            (x) => [updatedLookup].find((rec) => rec.operationalDistrictId === x.operationalDistrictId) || x
          );

        default:
          return null;
      }
    }
  };

  const updateCymLookups = (variant, originalId, updatedEngLookup, updatedCymLookup) => {
    if (updatedEngLookup && updatedCymLookup) {
      switch (variant) {
        case "postTown":
          if (lookupInUse) {
            const originalPostTown = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === originalId);
            if (originalPostTown) {
              if (originalPostTown.language === "ENG") {
                const cymHistoricPostTown = lookupContext.currentLookups.postTowns.find(
                  (x) => x.postTownRef === originalPostTown.linkedRef
                );
                if (cymHistoricPostTown) {
                  const updatedHistoricPostTown = lookupContext.currentLookups.postTowns.map(
                    (x) =>
                      [
                        {
                          postTownRef: originalPostTown.postTownRef,
                          postTown: originalPostTown.postTown,
                          language: originalPostTown.language,
                          historic: true,
                          linkedRef: originalPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) ||
                      [
                        {
                          postTownRef: cymHistoricPostTown.postTownRef,
                          postTown: cymHistoricPostTown.postTown,
                          language: cymHistoricPostTown.language,
                          historic: true,
                          linkedRef: cymHistoricPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) ||
                      x
                  );
                  updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricPostTown;
                } else {
                  const updatedHistoricPostTown = lookupContext.currentLookups.postTowns.map(
                    (x) =>
                      [
                        {
                          postTownRef: originalPostTown.postTownRef,
                          postTown: originalPostTown.postTown,
                          language: originalPostTown.language,
                          historic: true,
                          linkedRef: originalPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) || x
                  );
                  updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricPostTown;
                }
              } else {
                const engHistoricPostTown = lookupContext.currentLookups.postTowns.find(
                  (x) => x.postTownRef === originalPostTown.linkedRef
                );
                if (engHistoricPostTown) {
                  const updatedHistoricPostTown = lookupContext.currentLookups.postTowns.map(
                    (x) =>
                      [
                        {
                          postTownRef: originalPostTown.postTownRef,
                          postTown: originalPostTown.postTown,
                          language: originalPostTown.language,
                          historic: true,
                          linkedRef: originalPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) ||
                      [
                        {
                          postTownRef: engHistoricPostTown.postTownRef,
                          postTown: engHistoricPostTown.postTown,
                          language: engHistoricPostTown.language,
                          historic: true,
                          linkedRef: engHistoricPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) ||
                      x
                  );
                  updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricPostTown;
                } else {
                  const updatedHistoricPostTown = lookupContext.currentLookups.postTowns.map(
                    (x) =>
                      [
                        {
                          postTownRef: originalPostTown.postTownRef,
                          postTown: originalPostTown.postTown,
                          language: originalPostTown.language,
                          historic: true,
                          linkedRef: originalPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) || x
                  );
                  updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricPostTown;
                }
              }
            } else {
              lookupContext.currentLookups.postTowns.push(updatedEngLookup, updatedCymLookup);
              return lookupContext.currentLookups.postTowns;
            }
          } else
            return lookupContext.currentLookups.postTowns.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.postTownRef === x.postTownRef) ||
                [updatedCymLookup].find((rec) => rec.postTownRef === x.postTownRef) ||
                x
            );

        case "locality":
          if (lookupInUse) {
            const originalLocality = lookupContext.currentLookups.localities.find((x) => x.localityRef === originalId);
            if (originalLocality) {
              if (originalLocality.language === "ENG") {
                const cymHistoricLocality = lookupContext.currentLookups.localities.find(
                  (x) => x.localityRef === originalLocality.linkedRef
                );
                if (cymHistoricLocality) {
                  const updatedHistoricLocality = lookupContext.currentLookups.localities.map(
                    (x) =>
                      [
                        {
                          localityRef: originalLocality.localityRef,
                          locality: originalLocality.locality,
                          language: originalLocality.language,
                          historic: true,
                          linkedRef: originalLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) ||
                      [
                        {
                          localityRef: cymHistoricLocality.localityRef,
                          locality: cymHistoricLocality.locality,
                          language: cymHistoricLocality.language,
                          historic: true,
                          linkedRef: cymHistoricLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) ||
                      x
                  );
                  updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricLocality;
                } else {
                  const updatedHistoricLocality = lookupContext.currentLookups.localities.map(
                    (x) =>
                      [
                        {
                          localityRef: originalLocality.localityRef,
                          locality: originalLocality.locality,
                          language: originalLocality.language,
                          historic: true,
                          linkedRef: originalLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) || x
                  );
                  updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricLocality;
                }
              } else {
                const engHistoricLocality = lookupContext.currentLookups.localities.find(
                  (x) => x.localityRef === originalLocality.linkedRef
                );
                if (engHistoricLocality) {
                  const updatedHistoricLocality = lookupContext.currentLookups.localities.map(
                    (x) =>
                      [
                        {
                          localityRef: originalLocality.localityRef,
                          locality: originalLocality.locality,
                          language: originalLocality.language,
                          historic: true,
                          linkedRef: originalLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) ||
                      [
                        {
                          localityRef: engHistoricLocality.localityRef,
                          locality: engHistoricLocality.locality,
                          language: engHistoricLocality.language,
                          historic: true,
                          linkedRef: engHistoricLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) ||
                      x
                  );
                  updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricLocality;
                } else {
                  const updatedHistoricLocality = lookupContext.currentLookups.localities.map(
                    (x) =>
                      [
                        {
                          localityRef: originalLocality.localityRef,
                          locality: originalLocality.locality,
                          language: originalLocality.language,
                          historic: true,
                          linkedRef: originalLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) || x
                  );
                  updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricLocality;
                }
              }
            } else {
              lookupContext.currentLookups.localities.push(updatedEngLookup, updatedCymLookup);
              return lookupContext.currentLookups.localities;
            }
          } else
            return lookupContext.currentLookups.localities.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.localityRef === x.localityRef) ||
                [updatedCymLookup].find((rec) => rec.localityRef === x.localityRef) ||
                x
            );

        case "town":
          if (lookupInUse) {
            const originalTown = lookupContext.currentLookups.towns.find((x) => x.townRef === originalId);
            if (originalTown) {
              if (originalTown.language === "ENG") {
                const cymHistoricTown = lookupContext.currentLookups.towns.find(
                  (x) => x.townRef === originalTown.linkedRef
                );
                if (cymHistoricTown) {
                  const updatedHistoricTown = lookupContext.currentLookups.towns.map(
                    (x) =>
                      [
                        {
                          townRef: originalTown.townRef,
                          town: originalTown.town,
                          language: originalTown.language,
                          historic: true,
                          linkedRef: originalTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) ||
                      [
                        {
                          townRef: cymHistoricTown.townRef,
                          town: cymHistoricTown.town,
                          language: cymHistoricTown.language,
                          historic: true,
                          linkedRef: cymHistoricTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) ||
                      x
                  );
                  updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricTown;
                } else {
                  const updatedHistoricTown = lookupContext.currentLookups.towns.map(
                    (x) =>
                      [
                        {
                          townRef: originalTown.townRef,
                          town: originalTown.town,
                          language: originalTown.language,
                          historic: true,
                          linkedRef: originalTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) || x
                  );
                  updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricTown;
                }
              } else {
                const engHistoricTown = lookupContext.currentLookups.towns.find(
                  (x) => x.townRef === originalTown.linkedRef
                );
                if (engHistoricTown) {
                  const updatedHistoricTown = lookupContext.currentLookups.towns.map(
                    (x) =>
                      [
                        {
                          townRef: originalTown.townRef,
                          town: originalTown.town,
                          language: originalTown.language,
                          historic: true,
                          linkedRef: originalTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) ||
                      [
                        {
                          townRef: engHistoricTown.townRef,
                          town: engHistoricTown.town,
                          language: engHistoricTown.language,
                          historic: true,
                          linkedRef: engHistoricTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) ||
                      x
                  );
                  updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricTown;
                } else {
                  const updatedHistoricTown = lookupContext.currentLookups.towns.map(
                    (x) =>
                      [
                        {
                          townRef: originalTown.townRef,
                          town: originalTown.town,
                          language: originalTown.language,
                          historic: true,
                          linkedRef: originalTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) || x
                  );
                  updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricTown;
                }
              }
            } else {
              lookupContext.currentLookups.towns.push(updatedEngLookup, updatedCymLookup);
              return lookupContext.currentLookups.towns;
            }
          } else
            return lookupContext.currentLookups.towns.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.townRef === x.townRef) ||
                [updatedCymLookup].find((rec) => rec.townRef === x.townRef) ||
                x
            );

        case "administrativeArea":
          if (lookupInUse) {
            const originalArea = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeAreaRef === originalId
            );
            if (originalArea) {
              if (originalArea.language === "ENG") {
                const cymHistoricArea = lookupContext.currentLookups.adminAuthorities.find(
                  (x) => x.administrativeAreaRef === originalArea.linkedRef
                );
                if (cymHistoricArea) {
                  const updatedHistoricArea = lookupContext.currentLookups.adminAuthorities.map(
                    (x) =>
                      [
                        {
                          administrativeAreaRef: originalArea.administrativeAreaRef,
                          administrativeArea: originalArea.administrativeArea,
                          language: originalArea.language,
                          historic: true,
                          linkedRef: originalArea.linkedRef,
                        },
                      ].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) ||
                      [
                        {
                          administrativeAreaRef: cymHistoricArea.administrativeAreaRef,
                          administrativeArea: cymHistoricArea.administrativeArea,
                          language: cymHistoricArea.language,
                          historic: true,
                          linkedRef: cymHistoricArea.linkedRef,
                        },
                      ].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) ||
                      x
                  );
                  updatedHistoricArea.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricArea;
                } else {
                  const updatedHistoricArea = lookupContext.currentLookups.adminAuthorities.map(
                    (x) =>
                      [
                        {
                          administrativeAreaRef: originalArea.administrativeAreaRef,
                          administrativeArea: originalArea.administrativeArea,
                          language: originalArea.language,
                          historic: true,
                          linkedRef: originalArea.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) || x
                  );
                  updatedHistoricArea.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricArea;
                }
              } else {
                const engHistoricArea = lookupContext.currentLookups.adminAuthorities.find(
                  (x) => x.administrativeAreaRef === originalArea.linkedRef
                );
                if (engHistoricArea) {
                  const updatedHistoricArea = lookupContext.currentLookups.adminAuthorities.map(
                    (x) =>
                      [
                        {
                          administrativeAreaRef: originalArea.administrativeAreaRef,
                          administrativeArea: originalArea.administrativeArea,
                          language: originalArea.language,
                          historic: true,
                          linkedRef: originalArea.linkedRef,
                        },
                      ].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) ||
                      [
                        {
                          administrativeAreaRef: engHistoricArea.administrativeAreaRef,
                          administrativeArea: engHistoricArea.administrativeArea,
                          language: engHistoricArea.language,
                          historic: true,
                          linkedRef: engHistoricArea.linkedRef,
                        },
                      ].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) ||
                      x
                  );
                  updatedHistoricArea.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricArea;
                } else {
                  const updatedHistoricArea = lookupContext.currentLookups.adminAuthorities.map(
                    (x) =>
                      [
                        {
                          administrativeAreaRef: originalArea.administrativeAreaRef,
                          administrativeArea: originalArea.administrativeArea,
                          language: originalArea.language,
                          historic: true,
                          linkedRef: originalArea.linkedRef,
                        },
                      ].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) || x
                  );
                  updatedHistoricArea.push(updatedEngLookup, updatedCymLookup);
                  return updatedHistoricArea;
                }
              }
            } else {
              lookupContext.currentLookups.adminAuthorities.push(updatedEngLookup, updatedCymLookup);
              return lookupContext.currentLookups.adminAuthorities;
            }
          } else
            return lookupContext.currentLookups.adminAuthorities.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) ||
                [updatedCymLookup].find((rec) => rec.administrativeAreaRef === x.administrativeAreaRef) ||
                x
            );

        default:
          return null;
      }
    } else if (updatedEngLookup && !updatedCymLookup) {
      return updateSingleLookups(variant, originalId, updatedEngLookup);
    } else if (!updatedEngLookup && updatedCymLookup) {
      return updateSingleLookups(variant, originalId, updatedCymLookup);
    }
  };

  const handleDoneEditLookup = async (data) => {
    const linkedRef = GetLinkedRef(data.variant, data.lookupData.lookupId);
    const lookupUrl = GetLookupUrl(data.variant, "PUT", userContext.currentUser, settingsContext.authorityCode);
    let lookupEdited = false;

    currentVariant.current = getLookupVariantString(data.variant);

    const getEngPutData = () => {
      if (data.lookupData) {
        switch (data.variant) {
          case "postcode":
            return {
              postcodeRef: data.lookupData.lookupId,
              postcode: data.lookupData.postcode,
              historic: data.lookupData.historic,
            };

          case "postTown":
            const postTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTownRef === data.lookupData.lookupId
            );
            if (postTownRecord) {
              if (postTownRecord.language === "ENG") {
                return {
                  postTownRef: data.lookupData.lookupId,
                  postTown: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: linkedRef,
                };
              } else {
                return {
                  postTownRef: linkedRef,
                  postTown: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: data.lookupData.lookupId,
                };
              }
            } else return null;

          case "subLocality":
            const subLocalityRecord = lookupContext.currentLookups.subLocalities.find(
              (x) => x.subLocalityRef === data.lookupData.lookupId
            );
            if (subLocalityRecord) {
              if (subLocalityRecord.language === "ENG") {
                return {
                  subLocalityRef: data.lookupData.lookupId,
                  subLocality: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: linkedRef,
                };
              } else {
                return {
                  subLocalityRef: linkedRef,
                  subLocality: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: data.lookupData.lookupId,
                };
              }
            } else return null;

          case "crossReference":
            const crossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find(
              (x) => x.pkId === data.lookupData.lookupId
            );
            if (crossReferenceRecord)
              return {
                pkId: crossReferenceRecord.pkId,
                xrefSourceRef: crossReferenceRecord.xrefSourceRef,
                altXrefSourceRef: crossReferenceRecord.altXrefSourceRef,
                xrefSourceRef73: data.lookupData.xrefSourceRef73,
                xrefDescription: data.lookupData.xrefDescription,
                iSearchWebLinkUrl: crossReferenceRecord.iSearchWebLinkUrl,
                enabled: data.lookupData.enabled,
                historic: data.lookupData.historic,
                showSourceiSearchWeb: crossReferenceRecord.showSourceiSearchWeb,
                showXrefiSearchWeb: crossReferenceRecord.showXrefiSearchWeb,
                export: data.lookupData.export,
              };
            else return null;

          case "locality":
            const localityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.localityRef === data.lookupData.lookupId
            );
            if (localityRecord) {
              if (localityRecord.language === "ENG") {
                return {
                  localityRef: data.lookupData.lookupId,
                  locality: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: linkedRef,
                };
              } else {
                return {
                  localityRef: linkedRef,
                  locality: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: data.lookupData.lookupId,
                };
              }
            } else return null;

          case "town":
            const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === data.lookupData.lookupId);
            if (townRecord) {
              if (townRecord.language === "ENG") {
                return {
                  townRef: data.lookupData.lookupId,
                  town: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: linkedRef,
                };
              } else {
                return {
                  townRef: linkedRef,
                  town: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: data.lookupData.lookupId,
                };
              }
            } else return null;

          case "island":
            const islandRecord = lookupContext.currentLookups.islands.find(
              (x) => x.islandRef === data.lookupData.lookupId
            );
            if (islandRecord) {
              if (islandRecord.language === "ENG") {
                return {
                  islandRef: data.lookupData.lookupId,
                  island: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: linkedRef,
                };
              } else {
                return {
                  islandRef: linkedRef,
                  island: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: data.lookupData.lookupId,
                };
              }
            } else return null;

          case "administrativeArea":
            const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeAreaRef === data.lookupData.lookupId
            );
            if (administrativeAreaRecord) {
              if (administrativeAreaRecord.language === "ENG") {
                return {
                  administrativeAreaRef: data.lookupData.lookupId,
                  administrativeArea: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: linkedRef,
                };
              } else {
                return {
                  administrativeAreaRef: linkedRef,
                  administrativeArea: data.lookupData.english,
                  historic: data.lookupData.historic,
                  language: "ENG",
                  linkedRef: data.lookupData.lookupId,
                };
              }
            } else return null;

          case "ward":
            const wardRecord = lookupContext.currentLookups.wards.find((x) => x.pkId === data.lookupData.lookupId);
            if (wardRecord) {
              return {
                pkId: data.lookupData.lookupId,
                wardCode: "from pkId",
                newWardCode: data.lookupData.wardCode,
                ward: data.lookupData.ward,
                detrCode: settingsContext ? settingsContext.authorityCode.toString() : null,
                historic: data.lookupData.historic,
                updateType: data.lookupData.historic ? "HISTORIC" : "ALL",
              };
            } else return null;

          case "parish":
            const parishRecord = lookupContext.currentLookups.parishes.find((x) => x.pkId === data.lookupData.lookupId);
            if (parishRecord) {
              return {
                pkId: data.lookupData.lookupId,
                parishCode: "from pkId",
                newParishCode: data.lookupData.parishCode,
                parish: data.lookupData.parish,
                detrCode: settingsContext ? settingsContext.authorityCode.toString() : null,
                historic: data.lookupData.historic,
                updateType: data.lookupData.historic ? "HISTORIC" : "ALL",
              };
            } else return null;

          case "dbAuthority":
            const dbAuthorityRecord = lookupContext.currentLookups.dbAuthorities.find(
              (x) => x.authorityRef === data.lookupData.lookupId
            );
            if (dbAuthorityRecord) {
              return {
                authorityRef: data.lookupData.lookupId,
                authorityName: data.lookupData.dbAuthorityName,
                minUsrn: data.lookupData.dbAuthorityMinUsrn,
                maxUsrn: data.lookupData.dbAuthorityMaxUsrn,
                currentAuthorityRef: data.lookupData.dbAuthorityRefCurrent,
              };
            } else return null;

          case "operationalDistrict":
            const operationalDistrictRecord = lookupContext.currentLookups.operationalDistricts.find(
              (x) => x.operationalDistrictId === data.lookupData.lookupId
            );
            if (operationalDistrictRecord) {
              return {
                operationalDistrictId: data.lookupData.lookupId,
                organisationId: data.lookupData.organisationId,
                districtName: data.lookupData.districtName,
                lastUpdateDate: data.lookupData.lastUpdateDate,
                districtId: data.lookupData.districtId,
                districtFunction: data.lookupData.districtFunction,
                districtClosed: data.lookupData.districtClosed,
                districtFtpServerName: data.lookupData.districtFtpServerName,
                districtServerIpAddress: data.lookupData.districtServerIpAddress,
                districtFtpDirectory: data.lookupData.districtFtpDirectory,
                districtNotificationsUrl: data.lookupData.districtNotificationsUrl,
                attachmentUrlPrefix: data.lookupData.attachmentUrlPrefix,
                districtFaxNo: data.lookupData.districtFaxNo,
                districtPostcode: data.lookupData.districtPostcode,
                districtTelNo: data.lookupData.districtTelNo,
                outOfHoursArrangements: data.lookupData.outOfHoursArrangements,
                fpnDeliveryUrl: data.lookupData.fpnDeliveryUrl,
                fpnFaxNumber: data.lookupData.fpnFaxNumber,
                fpnDeliveryPostcode: data.lookupData.fpnDeliveryPostcode,
                fpnPaymentUrl: data.lookupData.fpnPaymentUrl,
                fpnPaymentTelNo: data.lookupData.fpnPaymentTelNo,
                fpnPaymentBankName: data.lookupData.fpnPaymentBankName,
                fpnPaymentSortCode: data.lookupData.fpnPaymentSortCode,
                fpnPaymentAccountNo: data.lookupData.fpnPaymentAccountNo,
                fpnPaymentAccountName: data.lookupData.fpnPaymentAccountName,
                fpnPaymentPostcode: data.lookupData.fpnPaymentPostcode,
                fpnContactName: data.lookupData.fpnContactName,
                fpnContactPostcode: data.lookupData.fpnContactPostcode,
                fpnContactTelNo: data.lookupData.fpnContactTelNo,
                districtPostalAddress1: data.lookupData.districtPostalAddress1,
                districtPostalAddress2: data.lookupData.districtPostalAddress2,
                districtPostalAddress3: data.lookupData.districtPostalAddress3,
                districtPostalAddress4: data.lookupData.districtPostalAddress4,
                districtPostalAddress5: data.lookupData.districtPostalAddress5,
                fpnDeliveryAddress1: data.lookupData.fpnDeliveryAddress1,
                fpnDeliveryAddress2: data.lookupData.fpnDeliveryAddress2,
                fpnDeliveryAddress3: data.lookupData.fpnDeliveryAddress3,
                fpnDeliveryAddress4: data.lookupData.fpnDeliveryAddress4,
                fpnDeliveryAddress5: data.lookupData.fpnDeliveryAddress5,
                fpnContactAddress1: data.lookupData.fpnContactAddress1,
                fpnContactAddress2: data.lookupData.fpnContactAddress2,
                fpnContactAddress3: data.lookupData.fpnContactAddress3,
                fpnContactAddress4: data.lookupData.fpnContactAddress4,
                fpnContactAddress5: data.lookupData.fpnContactAddress5,
                fpnPaymentAddress1: data.lookupData.fpnPaymentAddress1,
                fpnPaymentAddress2: data.lookupData.fpnPaymentAddress2,
                fpnPaymentAddress3: data.lookupData.fpnPaymentAddress3,
                fpnPaymentAddress4: data.lookupData.fpnPaymentAddress4,
                fpnPaymentAddress5: data.lookupData.fpnPaymentAddress5,
                fpnDeliveryEmailAddress: data.lookupData.fpnDeliveryEmailAddress,
                districtPermitSchemeId: data.lookupData.districtPermitSchemeId,
                historic: data.lookupData.historic,
              };
            } else return null;

          default:
            return null;
        }
      } else return null;
    };

    const getCymPutData = () => {
      if (data.lookupData && data.lookupData.welsh) {
        switch (data.variant) {
          case "postTown":
            const postTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTownRef === data.lookupData.lookupId
            );
            if (postTownRecord) {
              if (postTownRecord.language === "ENG") {
                return {
                  postTownRef: linkedRef,
                  postTown: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  postTownRef: data.lookupData.lookupId,
                  postTown: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: linkedRef,
                };
              }
            } else return null;

          case "locality":
            const localityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.localityRef === data.lookupData.lookupId
            );
            if (localityRecord) {
              if (localityRecord.language === "ENG") {
                return {
                  localityRef: linkedRef,
                  locality: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  localityRef: data.lookupData.lookupId,
                  locality: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: linkedRef,
                };
              }
            } else return null;

          case "town":
            const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === data.lookupData.lookupId);
            if (townRecord) {
              if (townRecord.language === "ENG") {
                return {
                  townRef: linkedRef,
                  town: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  townRef: data.lookupData.lookupId,
                  town: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: linkedRef,
                };
              }
            } else return null;

          case "administrativeArea":
            const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.administrativeAreaRef === data.lookupData.lookupId
            );
            if (administrativeAreaRecord) {
              if (administrativeAreaRecord.language === "ENG") {
                return {
                  administrativeAreaRef: linkedRef,
                  administrativeArea: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  administrativeAreaRef: data.lookupData.lookupId,
                  administrativeArea: data.lookupData.welsh,
                  historic: data.lookupData.historic,
                  language: "CYM",
                  linkedRef: linkedRef,
                };
              }
            } else return null;

          default:
            return null;
        }
      } else return null;
    };

    if (data) {
      let newEngLookup = null;
      let newCymLookup = null;

      const engPutData = getEngPutData();
      if (lookupUrl) {
        await fetch(lookupUrl.url, {
          headers: lookupUrl.headers,
          crossDomain: true,
          method: lookupUrl.type,
          body: JSON.stringify(engPutData),
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            newEngLookup = result;
            lookupEdited = true;
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[400 ERROR] Updating ${getLookupVariantString(data.variant)} object`, body.errors);
                  let lookupEngErrors = [];
                  for (const [key, value] of Object.entries(body.errors)) {
                    lookupEngErrors.push({ key: key, value: value });
                  }

                  if (lookupEngErrors.length > 0) setEngError(lookupEngErrors[0].value);
                  else setEngError(null);
                });
                break;

              case 401:
                userContext.onExpired();
                break;

              case 500:
                if (userContext.currentUser.showMessages)
                  console.error(`[500 ERROR] Updating ${getLookupVariantString(data.variant)} object`, res);
                break;

              default:
                if (userContext.currentUser.showMessages)
                  console.error(`[${res.status} ERROR] Updating ${getLookupVariantString(data.variant)} object`, res);
                break;
            }
          });

        if (newEngLookup) {
          const canHaveMultiLanguage = [
            "postTown",
            "subLocality",
            "locality",
            "town",
            "island",
            "administrativeArea",
          ].includes(data.variant);

          if (canHaveMultiLanguage && settingsContext.isWelsh) {
            lookupEdited = false;

            const cymData = getCymPutData();
            if (cymData) {
              await fetch(lookupUrl.url, {
                headers: lookupUrl.headers,
                crossDomain: true,
                method: lookupUrl.type,
                body: JSON.stringify(cymData),
              })
                .then((res) => (res.ok ? res : Promise.reject(res)))
                .then((res) => res.json())
                .then((result) => {
                  newCymLookup = result;
                  lookupEdited = true;
                })
                .catch((res) => {
                  switch (res.status) {
                    case 400:
                      res.json().then((body) => {
                        if (userContext.currentUser.showMessages)
                          console.error(
                            `[400 ERROR] Updating ${getLookupVariantString(data.variant)} object`,
                            body.errors
                          );
                        let lookupCymErrors = [];
                        for (const [key, value] of Object.entries(body.errors)) {
                          lookupCymErrors.push({ key: key, value: value });
                        }

                        if (lookupCymErrors.length > 0) setAltLanguageError(lookupCymErrors[0].value);
                        else setAltLanguageError(null);
                      });
                      break;

                    case 401:
                      userContext.onExpired();
                      break;

                    case 500:
                      if (userContext.currentUser.showMessages)
                        console.error(`[500 ERROR] Updating ${getLookupVariantString(data.variant)} object`, res);
                      break;

                    default:
                      if (userContext.currentUser.showMessages)
                        console.error(
                          `[${res.status} ERROR] Updating ${getLookupVariantString(data.variant)} object`,
                          res
                        );
                      break;
                  }
                });
            }
          }

          if (lookupEdited) {
            if (data.variant !== "dbAuthority") {
              const oldLookups = GetOldLookups(data.variant, lookupContext.currentLookups);
              let updatedLookups = null;

              if (oldLookups) {
                if (settingsContext.isWelsh) {
                  updatedLookups = updateCymLookups(data.variant, data.lookupData.lookupId, newEngLookup, newCymLookup);
                } else {
                  updatedLookups = updateSingleLookups(data.variant, data.lookupData.lookupId, newEngLookup);
                }

                if (updatedLookups && updatedLookups.length > 0)
                  lookupContext.onUpdateLookup(data.variant, updatedLookups);
              }
              editResult.current = true;
            }
            //dbAuthority can edit the Id so handle separately
            else {
              const oldLookups = GetOldLookups(data.variant, lookupContext.currentLookups);
              const updatedLookups = oldLookups.filter((x) => x.authorityRef !== data.lookupData.lookupId);
              updatedLookups.push({
                authorityRef: data.lookupData.dbAuthorityRefCurrent,
                authorityName: data.lookupData.dbAuthorityName,
                minUsrn: data.lookupData.dbAuthorityMinUsrn,
                maxUsrn: data.lookupData.dbAuthorityMaxUsrn,
              });
              lookupContext.onUpdateLookup(data.variant, updatedLookups);
              editResult.current = true;
            }
          } else editResult.current = false;
        }
      }
    }

    setEditOpen(editResult.current);
    setShowEditDialog(!editResult.current);
  };

  const handleCloseEditLookup = () => {
    setShowEditDialog(false);
  };

  const handleDeleteLookup = async (variant, lookupId) => {
    const linkedRef = GetLinkedRef(variant, lookupId);
    const lookupUrl = GetLookupUrl(variant, "DELETE", userContext.currentUser, settingsContext.authorityCode);
    let lookupDeleted = false;

    currentVariant.current = getLookupVariantString(variant);

    if (lookupUrl) {
      await fetch(`${lookupUrl.url}/${lookupId}`, {
        headers: lookupUrl.headers,
        crossDomain: true,
        method: lookupUrl.type,
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          if (res.status === 204) return null;
          else return res.json();
        })
        .then((result) => {
          if (userContext.currentUser.showMessages)
            console.log(`Successfully deleted the ${currentVariant.current} record.`);
          lookupDeleted = true;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                if (userContext.currentUser.showMessages)
                  console.error(`[400 ERROR] Deleting ${currentVariant.current} object`, body.errors);
                let lookupEngErrors = [];
                for (const [key, value] of Object.entries(body.errors)) {
                  lookupEngErrors.push({ key: key, value: value });
                }

                if (lookupEngErrors.length > 0) setEngError(lookupEngErrors[0].value);
                else setEngError(null);
              });
              break;

            case 401:
              userContext.onExpired();
              break;

            case 500:
              if (userContext.currentUser.showMessages)
                console.error(`[500 ERROR] Deleting ${currentVariant.current} object`, res);
              break;

            default:
              if (userContext.currentUser.showMessages)
                console.error(`[${res.status} ERROR] Deleting ${currentVariant.current} object`, res);
              break;
          }
        });

      if (lookupDeleted && linkedRef && linkedRef !== -1) {
        lookupDeleted = false;
        await fetch(`${lookupUrl.url}/${linkedRef}`, {
          headers: lookupUrl.headers,
          crossDomain: true,
          method: lookupUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => {
            if (res.status === 204) return null;
            else return res.json();
          })
          .then((result) => {
            if (userContext.currentUser.showMessages)
              console.log(`Successfully deleted the ${currentVariant.current} record.`);
            lookupDeleted = true;
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[400 ERROR] Deleting ${currentVariant.current} object`, body.errors);
                  let lookupAltErrors = [];
                  for (const [key, value] of Object.entries(body.errors)) {
                    lookupAltErrors.push({ key: key, value: value });
                  }

                  if (lookupAltErrors.length > 0) setAltLanguageError(lookupAltErrors[0].value);
                  else setAltLanguageError(null);
                });
                break;

              case 401:
                userContext.onExpired();
                break;

              case 500:
                if (userContext.currentUser.showMessages)
                  console.error(`[500 ERROR] Deleting ${currentVariant.current} object`, res);
                break;

              default:
                if (userContext.currentUser.showMessages)
                  console.error(`[${res.status} ERROR] Deleting ${getLookupVariantString(variant)} object`, res);
                break;
            }
          });
      }

      if (lookupDeleted) {
        const oldLookups = GetOldLookups(variant, lookupContext.currentLookups);
        let updatedLookups;

        if (oldLookups) {
          if (linkedRef && linkedRef !== -1) {
            switch (variant) {
              case "postTown":
                updatedLookups = oldLookups.filter((x) => x.postTownRef !== lookupId && x.postTownRef !== linkedRef);
                break;

              case "subLocality":
                updatedLookups = oldLookups.filter(
                  (x) => x.subLocalityRef !== lookupId && x.subLocalityRef !== linkedRef
                );
                break;

              case "locality":
                updatedLookups = oldLookups.filter((x) => x.localityRef !== lookupId && x.localityRef !== linkedRef);
                break;

              case "town":
                updatedLookups = oldLookups.filter((x) => x.townRef !== lookupId && x.townRef !== linkedRef);
                break;

              case "island":
                updatedLookups = oldLookups.filter((x) => x.islandRef !== lookupId && x.islandRef !== linkedRef);
                break;

              case "administrativeArea":
                updatedLookups = oldLookups.filter(
                  (x) => x.administrativeAreaRef !== lookupId && x.administrativeAreaRef !== linkedRef
                );
                break;

              default:
                updatedLookups = oldLookups;
                break;
            }
          } else {
            switch (variant) {
              case "postcode":
                updatedLookups = oldLookups.filter((x) => x.postcodeRef !== lookupId);
                break;

              case "postTown":
                updatedLookups = oldLookups.filter((x) => x.postTownRef !== lookupId);
                break;

              case "subLocality":
                updatedLookups = oldLookups.filter((x) => x.subLocalityRef !== lookupId);
                break;

              case "crossReference":
                updatedLookups = oldLookups.filter((x) => x.pkId !== lookupId);
                break;

              case "locality":
                updatedLookups = oldLookups.filter((x) => x.localityRef !== lookupId);
                break;

              case "town":
                updatedLookups = oldLookups.filter((x) => x.townRef !== lookupId);
                break;

              case "island":
                updatedLookups = oldLookups.filter((x) => x.islandRef !== lookupId);
                break;

              case "administrativeArea":
                updatedLookups = oldLookups.filter((x) => x.administrativeAreaRef !== lookupId);
                break;

              case "ward":
                updatedLookups = oldLookups.filter((x) => x.pkId !== lookupId);
                break;

              case "parish":
                updatedLookups = oldLookups.filter((x) => x.pkId !== lookupId);
                break;

              case "dbAuthority":
                updatedLookups = oldLookups.filter((x) => x.authorityRef !== lookupId);
                break;

              case "operationalDistrict":
                updatedLookups = oldLookups.filter((x) => x.operationalDistrictId !== lookupId);
                break;

              default:
                updatedLookups = oldLookups;
                break;
            }
          }

          if (updatedLookups.length > 0) lookupContext.onUpdateLookup(variant, updatedLookups);
        }
        deleteResult.current = true;
      } else deleteResult.current = false;
    }

    setDeleteOpen(deleteResult.current);
    setShowDeleteDialog(!deleteResult.current);
  };

  const handleHistoricLookup = async (variant, lookupId) => {
    const linkedRef = GetLinkedRef(variant, lookupId);
    const lookupUrl = GetLookupUrl(variant, "PUT", userContext.currentUser, settingsContext.authorityCode);
    let lookupEdited = false;

    currentVariant.current = getLookupVariantString(variant);

    const getEngPutData = () => {
      switch (variant) {
        case "postcode":
          const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === lookupId);
          if (postcodeRecord) {
            return {
              postcodeRef: lookupId,
              postcode: postcodeRecord.postcode,
              historic: true,
            };
          } else return null;

        case "postTown":
          const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
          if (postTownRecord) {
            if (postTownRecord.language === "ENG")
              return {
                postTownRef: lookupId,
                postTown: postTownRecord.postTown,
                historic: true,
                language: "ENG",
                linkedRef: postTownRecord.linkedRef === 0 ? 0 : -1,
              };
            else {
              const engPostTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === linkedRef);
              if (engPostTownRecord) {
                return {
                  postTownRef: linkedRef,
                  postTown: engPostTownRecord.postTown,
                  historic: true,
                  language: "ENG",
                  linkedRef: lookupId,
                };
              } else return null;
            }
          } else return null;

        case "subLocality":
          const subLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === lookupId
          );
          if (subLocalityRecord) {
            return {
              subLocalityRef: lookupId,
              subLocality: subLocalityRecord.subLocality,
              historic: true,
              language: "ENG",
              linkedRef: subLocalityRecord.linkedRef === 0 ? 0 : -1,
            };
          } else return null;

        case "crossReference":
          const crossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === lookupId);
          if (crossReferenceRecord)
            return {
              pkId: crossReferenceRecord.pkId,
              xrefSourceRef: crossReferenceRecord.xrefSourceRef,
              altXrefSourceRef: crossReferenceRecord.altXrefSourceRef,
              xrefSourceRef73: crossReferenceRecord.xrefSourceRef73,
              xrefDescription: crossReferenceRecord.xrefDescription,
              iSearchWebLinkUrl: crossReferenceRecord.iSearchWebLinkUrl,
              enabled: crossReferenceRecord.enabled,
              historic: true,
              showSourceiSearchWeb: crossReferenceRecord.showSourceiSearchWeb,
              showXrefiSearchWeb: crossReferenceRecord.showXrefiSearchWeb,
              export: crossReferenceRecord.export,
            };
          else return null;

        case "locality":
          const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
          if (localityRecord) {
            if (localityRecord.language === "ENG") {
              return {
                localityRef: lookupId,
                locality: localityRecord.locality,
                historic: true,
                language: "ENG",
                linkedRef: localityRecord.linkedRef === 0 ? 0 : -1,
              };
            } else {
              const engLocalityRecord = lookupContext.currentLookups.localities.find(
                (x) => x.localityRef === linkedRef
              );
              if (engLocalityRecord)
                return {
                  localityRef: linkedRef,
                  locality: engLocalityRecord.locality,
                  historic: true,
                  language: "ENG",
                  linkedRef: lookupId,
                };
              else return null;
            }
          } else return null;

        case "town":
          const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
          if (townRecord) {
            if (townRecord.language === "ENG") {
              return {
                townRef: lookupId,
                town: townRecord.town,
                historic: true,
                language: "ENG",
                linkedRef: townRecord.linkedRef === 0 ? 0 : -1,
              };
            } else {
              const engTownRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === linkedRef);
              if (engTownRecord)
                return {
                  townRef: linkedRef,
                  town: engTownRecord.town,
                  historic: true,
                  language: "ENG",
                  linkedRef: lookupId,
                };
              else return null;
            }
          } else return null;

        case "island":
          const islandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
          if (islandRecord)
            return {
              islandRef: lookupId,
              island: islandRecord.island,
              historic: true,
              language: "ENG",
              linkedRef: islandRecord.linkedRef === 0 ? 0 : -1,
            };
          else return null;

        case "administrativeArea":
          const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeAreaRef === lookupId
          );
          if (administrativeAreaRecord) {
            if (administrativeAreaRecord.language === "ENG") {
              return {
                administrativeAreaRef: lookupId,
                administrativeArea: administrativeAreaRecord.administrativeArea,
                historic: true,
                language: "ENG",
                linkedRef: administrativeAreaRecord.linkedRef === 0 ? 0 : -1,
              };
            } else {
              const engAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
                (x) => x.administrativeAreaRef === linkedRef
              );
              if (engAdministrativeAreaRecord)
                return {
                  administrativeAreaRef: linkedRef,
                  administrativeArea: engAdministrativeAreaRecord.administrativeArea,
                  historic: true,
                  language: "ENG",
                  linkedRef: lookupId,
                };
              else return null;
            }
          } else return null;

        case "ward":
          const wardRecord = lookupContext.currentLookups.wards.find((x) => x.pkId === lookupId);
          if (wardRecord) {
            return {
              pkId: lookupId,
              wardCode: wardRecord.wardCode,
              ward: wardRecord.ward,
              detrCode: wardRecord.detrCode,
              historic: true,
            };
          } else return null;

        case "parish":
          const parishRecord = lookupContext.currentLookups.parishes.find((x) => x.pkId === lookupId);
          if (parishRecord) {
            return {
              pkId: lookupId,
              parishCode: parishRecord.parishCode,
              parish: parishRecord.parish,
              detrCode: parishRecord.detrCode,
              historic: true,
            };
          } else return null;

        case "dbAuthority":
          const dbAuthorityRecord = lookupContext.currentLookups.dbAuthorities.find((x) => x.authorityRef === lookupId);
          if (dbAuthorityRecord) {
            return {
              authorityRef: lookupId,
              authorityName: dbAuthorityRecord.authorityName,
              minUsrn: dbAuthorityRecord.minUsrn,
              maxUsrn: dbAuthorityRecord.maxUsrn,
              currentAuthorityRef: lookupId,
            };
          } else return null;

        case "operationalDistrict":
          const operationalDistrictRecord = lookupContext.currentLookups.operationalDistricts.find(
            (x) => x.operationalDistrictId === lookupId
          );
          if (operationalDistrictRecord) {
            return {
              operationalDistrictId: lookupId,
              organisationId: operationalDistrictRecord.organisationId,
              districtName: operationalDistrictRecord.districtName,
              lastUpdateDate: operationalDistrictRecord.lastUpdateDate,
              districtId: operationalDistrictRecord.districtId,
              districtFunction: operationalDistrictRecord.districtFunction,
              districtClosed: GetCurrentDate(),
              districtFtpServerName: operationalDistrictRecord.districtFtpServerName,
              districtServerIpAddress: operationalDistrictRecord.districtServerIpAddress,
              districtFtpDirectory: operationalDistrictRecord.districtFtpDirectory,
              districtNotificationsUrl: operationalDistrictRecord.districtNotificationsUrl,
              attachmentUrlPrefix: operationalDistrictRecord.attachmentUrlPrefix,
              districtFaxNo: operationalDistrictRecord.districtFaxNo,
              districtPostcode: operationalDistrictRecord.districtPostcode,
              districtTelNo: operationalDistrictRecord.districtTelNo,
              outOfHoursArrangements: operationalDistrictRecord.outOfHoursArrangements,
              fpnDeliveryUrl: operationalDistrictRecord.fpnDeliveryUrl,
              fpnFaxNumber: operationalDistrictRecord.fpnFaxNumber,
              fpnDeliveryPostcode: operationalDistrictRecord.fpnDeliveryPostcode,
              fpnPaymentUrl: operationalDistrictRecord.fpnPaymentUrl,
              fpnPaymentTelNo: operationalDistrictRecord.fpnPaymentTelNo,
              fpnPaymentBankName: operationalDistrictRecord.fpnPaymentBankName,
              fpnPaymentSortCode: operationalDistrictRecord.fpnPaymentSortCode,
              fpnPaymentAccountNo: operationalDistrictRecord.fpnPaymentAccountNo,
              fpnPaymentAccountName: operationalDistrictRecord.fpnPaymentAccountName,
              fpnPaymentPostcode: operationalDistrictRecord.fpnPaymentPostcode,
              fpnContactName: operationalDistrictRecord.fpnContactName,
              fpnContactPostcode: operationalDistrictRecord.fpnContactPostcode,
              fpnContactTelNo: operationalDistrictRecord.fpnContactTelNo,
              districtPostalAddress1: operationalDistrictRecord.districtPostalAddress1,
              districtPostalAddress2: operationalDistrictRecord.districtPostalAddress2,
              districtPostalAddress3: operationalDistrictRecord.districtPostalAddress3,
              districtPostalAddress4: operationalDistrictRecord.districtPostalAddress4,
              districtPostalAddress5: operationalDistrictRecord.districtPostalAddress5,
              fpnDeliveryAddress1: operationalDistrictRecord.fpnDeliveryAddress1,
              fpnDeliveryAddress2: operationalDistrictRecord.fpnDeliveryAddress2,
              fpnDeliveryAddress3: operationalDistrictRecord.fpnDeliveryAddress3,
              fpnDeliveryAddress4: operationalDistrictRecord.fpnDeliveryAddress4,
              fpnDeliveryAddress5: operationalDistrictRecord.fpnDeliveryAddress5,
              fpnContactAddress1: operationalDistrictRecord.fpnContactAddress1,
              fpnContactAddress2: operationalDistrictRecord.fpnContactAddress2,
              fpnContactAddress3: operationalDistrictRecord.fpnContactAddress3,
              fpnContactAddress4: operationalDistrictRecord.fpnContactAddress4,
              fpnContactAddress5: operationalDistrictRecord.fpnContactAddress5,
              fpnPaymentAddress1: operationalDistrictRecord.fpnPaymentAddress1,
              fpnPaymentAddress2: operationalDistrictRecord.fpnPaymentAddress2,
              fpnPaymentAddress3: operationalDistrictRecord.fpnPaymentAddress3,
              fpnPaymentAddress4: operationalDistrictRecord.fpnPaymentAddress4,
              fpnPaymentAddress5: operationalDistrictRecord.fpnPaymentAddress5,
              fpnDeliveryEmailAddress: operationalDistrictRecord.fpnDeliveryEmailAddress,
              districtPermitSchemeId: operationalDistrictRecord.districtPermitSchemeId,
              historic: true,
            };
          } else return null;

        default:
          return null;
      }
    };

    const getCymPutData = () => {
      switch (variant) {
        case "postTown":
          const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
          if (postTownRecord) {
            if (postTownRecord.language === "ENG") {
              const cymPostTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === linkedRef);
              if (cymPostTownRecord)
                return {
                  postTownRef: linkedRef,
                  postTown: cymPostTownRecord.postTown,
                  historic: true,
                  language: "CYM",
                  linkedRef: -1,
                };
              else return null;
            } else {
              return {
                postTownRef: lookupId,
                postTown: postTownRecord.postTown,
                historic: true,
                language: "CYM",
                linkedRef: -1,
              };
            }
          } else return null;

        case "locality":
          const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
          if (localityRecord) {
            if (localityRecord.language === "ENG") {
              const cymLocalityRecord = lookupContext.currentLookups.localities.find(
                (x) => x.localityRef === linkedRef
              );
              if (cymLocalityRecord)
                return {
                  localityRef: linkedRef,
                  locality: cymLocalityRecord.locality,
                  historic: true,
                  language: "CYM",
                  linkedRef: -1,
                };
              else return null;
            } else {
              return {
                localityRef: lookupId,
                locality: localityRecord.locality,
                historic: true,
                language: "CYM",
                linkedRef: -1,
              };
            }
          } else return null;

        case "town":
          const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
          if (townRecord) {
            if (townRecord.language === "ENG") {
              const cymTownRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === linkedRef);
              if (cymTownRecord)
                return {
                  townRef: linkedRef,
                  town: cymTownRecord.town,
                  historic: true,
                  language: "CYM",
                  linkedRef: -1,
                };
              else return null;
            } else {
              return {
                townRef: lookupId,
                town: townRecord.town,
                historic: true,
                language: "CYM",
                linkedRef: -1,
              };
            }
          } else return null;

        case "administrativeArea":
          const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeAreaRef === lookupId
          );
          if (administrativeAreaRecord) {
            if (administrativeAreaRecord.language === "ENG") {
              const cymAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
                (x) => x.administrativeAreaRef === linkedRef
              );
              if (cymAdministrativeAreaRecord)
                return {
                  administrativeAreaRef: linkedRef,
                  administrativeArea: cymAdministrativeAreaRecord.administrativeArea,
                  historic: true,
                  language: "CYM",
                  linkedRef: -1,
                };
              else return null;
            } else {
              return {
                administrativeAreaRef: lookupId,
                administrativeArea: administrativeAreaRecord.administrativeArea,
                historic: true,
                language: "CYM",
                linkedRef: -1,
              };
            }
          } else return null;

        default:
          return null;
      }
    };

    let newEngLookup = null;
    let newCymLookup = null;

    const engPutData = getEngPutData();
    if (lookupUrl) {
      await fetch(lookupUrl.url, {
        headers: lookupUrl.headers,
        crossDomain: true,
        method: lookupUrl.type,
        body: JSON.stringify(engPutData),
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then((result) => {
          newEngLookup = result;
          lookupEdited = true;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                if (userContext.currentUser.showMessages)
                  console.error(`[400 ERROR] Updating ${getLookupVariantString(variant)} object`, body.errors);
                let lookupEngErrors = [];
                for (const [key, value] of Object.entries(body.errors)) {
                  lookupEngErrors.push({ key: key, value: value });
                }

                if (lookupEngErrors.length > 0) setEngError(lookupEngErrors[0].value);
                else setEngError(null);
              });
              break;

            case 401:
              userContext.onExpired();
              break;

            case 500:
              if (userContext.currentUser.showMessages)
                console.error(`[500 ERROR] Updating ${getLookupVariantString(variant)} object`, res);
              break;

            default:
              if (userContext.currentUser.showMessages)
                console.error(`[${res.status} ERROR] Updating ${getLookupVariantString(variant)} object`, res);
              break;
          }
        });

      if (newEngLookup) {
        const canHaveMultiLanguage = ["postTown", "locality", "town", "administrativeArea"].includes(variant);

        if (canHaveMultiLanguage && settingsContext.isWelsh) {
          lookupEdited = false;

          const cymPutData = getCymPutData();
          if (cymPutData) {
            await fetch(lookupUrl.url, {
              headers: lookupUrl.headers,
              crossDomain: true,
              method: lookupUrl.type,
              body: JSON.stringify(cymPutData),
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => res.json())
              .then((result) => {
                newCymLookup = result;
                lookupEdited = true;
              })
              .catch((res) => {
                switch (res.status) {
                  case 400:
                    res.json().then((body) => {
                      if (userContext.currentUser.showMessages)
                        console.error(`[400 ERROR] Updating ${getLookupVariantString(variant)} object`, body.errors);
                      let lookupCymErrors = [];
                      for (const [key, value] of Object.entries(body.errors)) {
                        lookupCymErrors.push({ key: key, value: value });
                      }

                      if (lookupCymErrors.length > 0) setAltLanguageError(lookupCymErrors[0].value);
                      else setAltLanguageError(null);
                    });
                    break;

                  case 401:
                    userContext.onExpired();
                    break;

                  case 500:
                    if (userContext.currentUser.showMessages)
                      console.error(`[500 ERROR] Updating ${getLookupVariantString(variant)} object`, res);
                    break;

                  default:
                    if (userContext.currentUser.showMessages)
                      console.error(`[${res.status} ERROR] Updating ${getLookupVariantString(variant)} object`, res);
                    break;
                }
              });
          }
        }

        if (lookupEdited) {
          const oldLookups = GetOldLookups(variant, lookupContext.currentLookups);
          let updatedLookups = null;

          if (oldLookups) {
            if (settingsContext.isWelsh) {
              updatedLookups = updateCymLookups(variant, lookupId, newEngLookup, newCymLookup);
            } else {
              updatedLookups = updateSingleLookups(variant, lookupId, newEngLookup);
            }

            if (updatedLookups && updatedLookups.length > 0) lookupContext.onUpdateLookup(variant, updatedLookups);
          }
          editResult.current = true;
        } else editResult.current = false;
      }
    }
    setShowDeleteDialog(!editResult.current);
  };

  const handleCloseDeleteLookup = () => {
    setShowDeleteDialog(false);
  };

  const handleAddClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAddOpen(false);
  };

  const handleEditClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setEditOpen(false);
  };

  const handleDeleteClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setDeleteOpen(false);
  };

  /**
   * Event to handle when the message dialog closes.
   */
  const handleMessageDialogClose = () => {
    setOpenUpdateWardParishBoundariesDialog(false);
  };

  useEffect(() => {
    setEngError(null);
    setAltLanguageError(null);

    switch (nodeId) {
      case "POSTCODES":
        setCurrentTab(1);
        break;

      case "POST_TOWNS":
        setCurrentTab(2);
        break;

      case "SUB_LOCALITIES":
        setCurrentTab(3);
        break;

      case "CROSS_REFERENCES":
        setCurrentTab(4);
        break;

      case "LOCALITIES":
        setCurrentTab(5);
        break;

      case "TOWNS":
        setCurrentTab(6);
        break;

      case "ISLANDS":
        setCurrentTab(7);
        break;

      case "ADMINISTRATIVE_AREAS":
        setCurrentTab(8);
        break;

      case "AUTHORITIES":
        setCurrentTab(9);
        break;

      case "WARDS":
        setCurrentTab(10);
        break;

      case "PARISHES":
        setCurrentTab(11);
        break;

      case "OPERATIONAL_DISTRICTS":
        setCurrentTab(12);
        break;

      default:
        setCurrentTab(0);
        break;
    }
  }, [nodeId]);

  return (
    <div id="lookup-tables-data-form">
      <Fragment>
        <TabPanel value={currentTab} index={1}>
          <LookupTableGridTab
            variant="postcode"
            data={getPostcodeData()}
            onAddLookup={handleAddPostcode}
            onEditLookup={(id) => handleEditPostcode(id)}
            onDeleteLookup={(id) => handleDeletePostcode(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <LookupTableGridTab
            variant="postTown"
            data={getPostTownData()}
            onAddLookup={handleAddPostTown}
            onEditLookup={(id) => handleEditPostTown(id)}
            onDeleteLookup={(id) => handleDeletePostTown(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <LookupTableGridTab
            variant="subLocality"
            data={getSubLocalitiesData()}
            onAddLookup={handleAddSubLocality}
            onEditLookup={(id) => handleEditSubLocality(id)}
            onDeleteLookup={(id) => handleDeleteSubLocality(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={4}>
          <LookupTableGridTab
            variant="crossReference"
            data={getCrossReferencesData()}
            onAddLookup={handleAddCrossReference}
            onEditLookup={(id) => handleEditCrossReference(id)}
            onDeleteLookup={(id) => handleDeleteCrossReference(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={5}>
          <LookupTableGridTab
            variant="locality"
            data={getLocalitiesData()}
            onAddLookup={handleAddLocality}
            onEditLookup={(id) => handleEditLocality(id)}
            onDeleteLookup={(id) => handleDeleteLocality(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={6}>
          <LookupTableGridTab
            variant="town"
            data={getTownsData()}
            onAddLookup={handleAddTown}
            onEditLookup={(id) => handleEditTown(id)}
            onDeleteLookup={(id) => handleDeleteTown(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={7}>
          <LookupTableGridTab
            variant="island"
            data={getIslandsData()}
            onAddLookup={handleAddIsland}
            onEditLookup={(id) => handleEditIsland(id)}
            onDeleteLookup={(id) => handleDeleteIsland(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={8}>
          <LookupTableGridTab
            variant="administrativeArea"
            data={getAdministrativeAreasData()}
            onAddLookup={handleAddAdministrativeArea}
            onEditLookup={(id) => handleEditAdministrativeArea(id)}
            onDeleteLookup={(id) => handleDeleteAdministrativeArea(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={9}>
          <LookupTableGridTab
            variant="dbAuthority"
            data={getDbAuthoritiesData()}
            onAddLookup={handleAddDbAuthority}
            onEditLookup={(id) => handleEditDbAuthority(id)}
            onDeleteLookup={(id) => handleDeleteDbAuthority(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={10}>
          <LookupTableGridTab
            variant="ward"
            data={getWardsData()}
            onAddLookup={handleAddWard}
            onEditLookup={(id) => handleEditWard(id)}
            onUpdateSpatialData={handleUpdateWardSpatialData}
            onDeleteLookup={(id) => handleDeleteWard(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={11}>
          <LookupTableGridTab
            variant="parish"
            data={getParishesData()}
            onAddLookup={handleAddParish}
            onEditLookup={(id) => handleEditParish(id)}
            onUpdateSpatialData={handleUpdateParishSpatialData}
            onDeleteLookup={(id) => handleDeleteParish(id)}
          />
        </TabPanel>
        <TabPanel value={currentTab} index={12}>
          <LookupTableGridTab
            variant="operationalDistrict"
            data={getOperationalDistrictsData()}
            onAddLookup={handleAddOperationalDistrict}
            onEditLookup={(id) => handleEditOperationalDistrict(id)}
            onDeleteLookup={(id) => handleDeleteOperationalDistrict(id)}
          />
        </TabPanel>
      </Fragment>
      <AddLookupDialog
        isOpen={showAddDialog}
        variant={lookupType}
        errorEng={engError}
        errorAltLanguage={altLanguageError}
        onDone={(data) => handleDoneAddLookup(data)}
        onClose={handleCloseAddLookup}
      />
      <EditLookupDialog
        isUsed={lookupInUse}
        isOpen={showEditDialog}
        variant={lookupType}
        lookupId={lookupId}
        errorEng={engError}
        errorAltLanguage={altLanguageError}
        onDone={(data) => handleDoneEditLookup(data)}
        onClose={handleCloseEditLookup}
      />
      <DeleteLookupDialog
        isOpen={showDeleteDialog}
        variant={lookupType}
        lookupId={lookupId}
        canDelete={!lookupInUse}
        errorEng={engError}
        errorAltLanguage={altLanguageError}
        onDelete={(variant, lookupId) => handleDeleteLookup(variant, lookupId)}
        onHistoric={(variant, lookupId) => handleHistoricLookup(variant, lookupId)}
        onClose={handleCloseDeleteLookup}
      />
      <UpdateWardParishBoundariesDialog
        isOpen={openUpdateWardParishBoundariesDialog}
        variant={updateWardParishBoundariesVariant}
        onClose={handleMessageDialogClose}
      />
      <div>
        <Snackbar
          open={addOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleAddClose}
        >
          <Alert
            sx={GetAlertStyle(addResult.current)}
            icon={GetAlertIcon(addResult.current)}
            onClose={handleAddClose}
            severity={GetAlertSeverity(addResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            addResult.current
              ? `The ${currentVariant.current} has been successfully created.`
              : `Failed to create the ${currentVariant.current}.`
          }`}</Alert>
        </Snackbar>
      </div>
      <div>
        <Snackbar
          open={editOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleEditClose}
        >
          <Alert
            sx={GetAlertStyle(editResult.current)}
            icon={GetAlertIcon(editResult.current)}
            onClose={handleEditClose}
            severity={GetAlertSeverity(editResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            editResult.current
              ? `The ${currentVariant.current} has been successfully updated.`
              : `Failed to update the ${currentVariant.current}.`
          }`}</Alert>
        </Snackbar>
      </div>
      <div>
        <Snackbar
          open={deleteOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleDeleteClose}
        >
          <Alert
            sx={GetAlertStyle(deleteResult.current)}
            icon={GetAlertIcon(deleteResult.current)}
            onClose={handleDeleteClose}
            severity={GetAlertSeverity(deleteResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            deleteResult.current
              ? `The ${currentVariant.current} has been successfully deleted.`
              : `Failed to delete the ${currentVariant.current}.`
          }`}</Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default LookupTablesDataForm;
