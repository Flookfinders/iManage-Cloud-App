//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to edit an existing lookup
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
//    002   29.06.23 Sean Flook                 Added ability to set enabled flag for cross reference records.
//    003   07.09.23 Sean Flook                 Removed unnecessary awaits.
//    004   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    005   01.12.23 Sean Flook       IMANN-194 Modified UpdateLookups to use the new LookupContext.onUpdateLookup event.
//    006   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    007   05.01.24 Sean Flook                 Changes to sort out warnings.
//    008   10.01.24 Sean Flook                 Fix warnings.
//    009   25.01.24 Sean Flook       IMANN-253 Include historic when checking for changes.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import { Snackbar, Alert } from "@mui/material";
import { Box } from "@mui/system";
import {
  GetPostcodeUrl,
  GetPostTownUrl,
  GetSubLocalityUrl,
  GetAppCrossRefUrl,
  GetLocalityUrl,
  GetTownUrl,
  GetIslandUrl,
  GetAdministrativeAreaUrl,
  GetWardsForAuthorityUrl,
  GetParishesForAuthorityUrl,
} from "../configuration/ADSConfig";

import LookupTableGridTab from "../tabs/LookupTableGridTab";
import AuthorityLookupTableTab from "../tabs/AuthorityLookupTableTab";

import AddLookupDialog from "../dialogs/AddLookupDialog";
import EditLookupDialog from "../dialogs/EditLookupDialog";
import DeleteLookupDialog from "../dialogs/DeleteLookupDialog";

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

function LookupTablesDataForm({ nodeId }) {
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
      } else if (settingsContext.isScottish) {
        const gaeData = lookupContext.currentLookups.postTowns.filter((x) => x.language === "GAE");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const gaeRecord = gaeData.find((x) => x.postTownRef === engRecord.linkedRef);
          if (gaeRecord)
            postTownData.push({
              id: engRecord.postTownRef,
              postTownEng: engRecord.postTown,
              postTownGae: gaeRecord.postTown,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            postTownData.push({
              id: engRecord.postTownRef,
              postTownEng: engRecord.postTown,
              postTownGae: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < gaeData.length; i++) {
          const gaeRecord = gaeData[i];
          const engRecord = engData.find((x) => x.postTownRef === gaeRecord.linkedRef);
          if (!engRecord)
            postTownData.push({
              id: gaeRecord.postTownRef,
              postTownEng: "",
              postTownGae: gaeRecord.postTown,
              historic: gaeRecord.historic,
              linkedRef: gaeRecord.linkedRef,
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
      const subLocalityData = [];
      const engData = lookupContext.currentLookups.subLocalities.filter((x) => x.language === "ENG");
      const gaeData = lookupContext.currentLookups.subLocalities.filter((x) => x.language === "GAE");

      for (let i = 0; i < engData.length; i++) {
        const engRecord = engData[i];
        const gaeRecord = gaeData.find((x) => x.subLocalityRef === engRecord.linkedRef);
        if (gaeRecord)
          subLocalityData.push({
            id: engRecord.subLocalityRef,
            subLocalityEng: engRecord.subLocality,
            subLocalityGae: gaeRecord.subLocality,
            historic: engRecord.historic,
            linkedRef: engRecord.linkedRef,
          });
        else
          subLocalityData.push({
            id: engRecord.subLocalityRef,
            subLocalityEng: engRecord.subLocality,
            subLocalityGae: "",
            historic: engRecord.historic,
            linkedRef: engRecord.linkedRef,
          });
      }

      for (let i = 0; i < gaeData.length; i++) {
        const gaeRecord = gaeData[i];
        const engRecord = engData.find((x) => x.subLocalityRef === gaeRecord.linkedRef);
        if (!engRecord)
          subLocalityData.push({
            id: gaeRecord.subLocalityRef,
            subLocalityEng: "",
            subLocalityGae: gaeRecord.subLocality,
            historic: gaeRecord.historic,
            linkedRef: gaeRecord.linkedRef,
          });
      }

      return subLocalityData;
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
      } else if (settingsContext.isScottish) {
        const gaeData = lookupContext.currentLookups.localities.filter((x) => x.language === "GAE");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const gaeRecord = gaeData.find((x) => x.localityRef === engRecord.linkedRef);
          if (gaeRecord)
            localityData.push({
              id: engRecord.localityRef,
              localityEng: engRecord.locality,
              localityGae: gaeRecord.locality,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            localityData.push({
              id: engRecord.localityRef,
              localityEng: engRecord.locality,
              localityGae: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < gaeData.length; i++) {
          const gaeRecord = gaeData[i];
          const engRecord = engData.find((x) => x.localityRef === gaeRecord.linkedRef);
          if (!engRecord)
            localityData.push({
              id: gaeRecord.localityRef,
              localityEng: "",
              localityGae: gaeRecord.locality,
              historic: gaeRecord.historic,
              linkedRef: gaeRecord.linkedRef,
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
      } else if (settingsContext.isScottish) {
        const gaeData = lookupContext.currentLookups.towns.filter((x) => x.language === "GAE");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const gaeRecord = gaeData.find((x) => x.townRef === engRecord.linkedRef);
          if (gaeRecord)
            townData.push({
              id: engRecord.townRef,
              townEng: engRecord.town,
              townGae: gaeRecord.town,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            townData.push({
              id: engRecord.townRef,
              townEng: engRecord.town,
              townGae: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < gaeData.length; i++) {
          const gaeRecord = gaeData[i];
          const engRecord = engData.find((x) => x.townRef === gaeRecord.linkedRef);
          if (!engRecord)
            townData.push({
              id: gaeRecord.townRef,
              townEng: "",
              townGae: gaeRecord.town,
              historic: gaeRecord.historic,
              linkedRef: gaeRecord.linkedRef,
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
      const islandData = [];
      const engData = lookupContext.currentLookups.islands.filter((x) => x.language === "ENG");
      const gaeData = lookupContext.currentLookups.islands.filter((x) => x.language === "GAE");

      for (let i = 0; i < engData.length; i++) {
        const engRecord = engData[i];
        const gaeRecord = gaeData.find((x) => x.islandRef === engRecord.linkedRef);
        if (gaeRecord)
          islandData.push({
            id: engRecord.islandRef,
            islandEng: engRecord.island,
            islandGae: gaeRecord.island,
            historic: engRecord.historic,
            linkedRef: engRecord.linkedRef,
          });
        else
          islandData.push({
            id: engRecord.islandRef,
            islandEng: engRecord.island,
            islandGae: "",
            historic: engRecord.historic,
            linkedRef: engRecord.linkedRef,
          });
      }

      for (let i = 0; i < gaeData.length; i++) {
        const gaeRecord = gaeData[i];
        const engRecord = engData.find((x) => x.islandRef === gaeRecord.linkedRef);
        if (!engRecord)
          islandData.push({
            id: gaeRecord.islandRef,
            islandEng: "",
            islandGae: gaeRecord.island,
            historic: gaeRecord.historic,
            linkedRef: gaeRecord.linkedRef,
          });
      }

      return islandData;
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
      } else if (settingsContext.isScottish) {
        const gaeData = lookupContext.currentLookups.adminAuthorities.filter((x) => x.language === "GAE");

        for (let i = 0; i < engData.length; i++) {
          const engRecord = engData[i];
          const gaeRecord = gaeData.find((x) => x.administrativeAreaRef === engRecord.linkedRef);
          if (gaeRecord)
            administrativeAreaData.push({
              id: engRecord.administrativeAreaRef,
              administrativeAreaEng: engRecord.administrativeArea,
              administrativeAreaGae: gaeRecord.administrativeArea,
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
          else
            administrativeAreaData.push({
              id: engRecord.administrativeAreaRef,
              administrativeAreaEng: engRecord.administrativeArea,
              administrativeAreaGae: "",
              historic: engRecord.historic,
              linkedRef: engRecord.linkedRef,
            });
        }

        for (let i = 0; i < gaeData.length; i++) {
          const gaeRecord = gaeData[i];
          const engRecord = engData.find((x) => x.administrativeAreaRef === gaeRecord.linkedRef);
          if (!engRecord)
            administrativeAreaData.push({
              id: gaeRecord.administrativeAreaRef,
              administrativeAreaEng: "",
              administrativeAreaGae: gaeRecord.town,
              historic: gaeRecord.historic,
              linkedRef: gaeRecord.linkedRef,
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

  const getAuthoritiesData = () => {
    return [];
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

  const isLookupInUse = async (variant, id) => {
    const lookupUrl = GetLookupUrl(variant, "GET");

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
                console.error(`[400 ERROR] Getting ${GetVariantString(variant)} object`, body.errors);
              });
              break;

            case 401:
              res.json().then((body) => {
                console.error(`[401 ERROR] Getting ${GetVariantString(variant)} object`, body);
              });
              break;

            case 500:
              console.error(`[500 ERROR] Getting ${GetVariantString(variant)} object`, res);
              break;

            default:
              console.error(`[${res.status} ERROR] Getting ${GetVariantString(variant)} object`, res);
              break;
          }
        });

      if (lookupRecord && lookupRecord.length > 0) {
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
    isLookupInUse("crossReference", id);
    setShowEditDialog(true);
  };

  const handleDeleteCrossReference = (id) => {
    setLookupId(id);
    setLookupType("crossReference");
    isLookupInUse("crossReference", id);
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
    isLookupInUse("ward", id);
    setShowEditDialog(true);
  };

  const handleDeleteWard = (id) => {
    setLookupId(id);
    setLookupType("ward");
    isLookupInUse("ward", id);
    setShowDeleteDialog(true);
  };

  const handleAddParish = () => {
    setLookupType("parish");
    setShowAddDialog(true);
  };

  const handleEditParish = (id) => {
    setLookupId(id);
    setLookupType("parish");
    isLookupInUse("parish", id);
    setShowEditDialog(true);
  };

  const handleDeleteParish = (id) => {
    setLookupId(id);
    setLookupType("parish");
    isLookupInUse("parish", id);
    setShowDeleteDialog(true);
  };

  function GetLookupUrl(variant, endPointType) {
    switch (variant) {
      case "postcode":
        return GetPostcodeUrl(endPointType, userContext.currentUser.token);

      case "postTown":
        return GetPostTownUrl(endPointType, userContext.currentUser.token);

      case "subLocality":
        return GetSubLocalityUrl(endPointType, userContext.currentUser.token);

      case "crossReference":
        return GetAppCrossRefUrl(endPointType, userContext.currentUser.token);

      case "locality":
        return GetLocalityUrl(endPointType, userContext.currentUser.token);

      case "town":
        return GetTownUrl(endPointType, userContext.currentUser.token);

      case "island":
        return GetIslandUrl(endPointType, userContext.currentUser.token);

      case "administrativeArea":
        return GetAdministrativeAreaUrl(endPointType, userContext.currentUser.token);

      case "ward":
        return GetWardsForAuthorityUrl(endPointType, userContext.currentUser.token, settingsContext.authorityCode);

      case "parish":
        return GetParishesForAuthorityUrl(endPointType, userContext.currentUser.token, settingsContext.authorityCode);

      default:
        return null;
    }
  }

  function GetVariantString(variant) {
    switch (variant) {
      case "postTown":
        return "post town";

      case "subLocality":
        return "sub-locality";

      case "crossReference":
        return "cross reference";

      case "administrativeArea":
        return "administrative area";

      default:
        return variant;
    }
  }

  function GetOldLookups(variant) {
    switch (variant) {
      case "postcode":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.postcodes));

      case "postTown":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.postTowns));

      case "subLocality":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.subLocalities));

      case "crossReference":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.appCrossRefs));

      case "locality":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.localities));

      case "town":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.towns));

      case "island":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.islands));

      case "administrativeArea":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.adminAuthorities));

      case "ward":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.wards));

      case "parish":
        return JSON.parse(JSON.stringify(lookupContext.currentLookups.parishes));

      default:
        return null;
    }
  }

  function UpdateLookups(variant, newLookups) {
    lookupContext.onUpdateLookup(variant, newLookups);
  }

  function GetLinkedRef(variant, lookupId) {
    if (settingsContext.isWelsh || settingsContext.isScottish) {
      switch (variant) {
        case "postTown":
          const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
          if (postTownRecord) return postTownRecord.linkedRef;
          else return null;

        case "subLocality":
          const subLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === lookupId
          );
          if (subLocalityRecord) return subLocalityRecord.linkedRef;
          else return null;

        case "locality":
          const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
          if (localityRecord) return localityRecord.linkedRef;
          else return null;

        case "town":
          const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
          if (townRecord) return townRecord.linkedRef;
          else return null;

        case "island":
          const islandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
          if (islandRecord) return islandRecord.linkedRef;
          else return null;

        case "administrativeArea":
          const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeAreaRef === lookupId
          );
          if (administrativeAreaRecord) return administrativeAreaRecord.linkedRef;
          else return null;

        default:
          return null;
      }
    } else return null;
  }

  const handleDoneAddLookup = async (data) => {
    let lookupAdded = false;

    currentVariant.current = GetVariantString(data.variant);

    const getEngPostData = () => {
      if (data.lookupData) {
        switch (data.variant) {
          case "postcode":
            return { postcode: data.lookupData.postcode, historic: data.lookupData.historic };

          case "postTown":
            return {
              postTown: data.lookupData.english,
              historic: data.lookupData.historic,
              language: "ENG",
              linkedRef: -1,
            };

          case "subLocality":
            return {
              subLocality: data.lookupData.english,
              historic: data.lookupData.historic,
              language: "ENG",
              linkedRef: -1,
            };

          case "crossReference":
            return {
              xrefSourceRef: null,
              altXrefSourceRef: null,
              xrefSourceRef73: data.lookupData.xrefSourceRef73,
              iSearchWebLinkUrl: null,
              enabled: data.lookupData.enabled,
              historic: data.lookupData.historic,
              showSourceiSearchWeb: null,
              showXrefiSearchWeb: null,
              export: data.lookupData.export,
            };

          case "locality":
            return {
              locality: data.lookupData.english,
              historic: data.lookupData.historic,
              language: "ENG",
              linkedRef: -1,
            };

          case "town":
            return {
              town: data.lookupData.english,
              historic: data.lookupData.historic,
              language: "ENG",
              linkedRef: -1,
            };

          case "island":
            return {
              island: data.lookupData.english,
              historic: data.lookupData.historic,
              language: "ENG",
              linkedRef: -1,
            };

          case "administrativeArea":
            return {
              administrativeArea: data.lookupData.english,
              historic: data.lookupData.historic,
              language: "ENG",
              linkedRef: -1,
            };

          case "ward":
            return {
              wardCode: data.lookupData.wardCode,
              ward: data.lookupData.ward,
              detrCode: settingsContext ? settingsContext.authorityCode : null,
              historic: data.lookupData.historic,
            };

          case "parish":
            return {
              parishCode: data.lookupData.parishCode,
              parish: data.lookupData.parish,
              detrCode: settingsContext ? settingsContext.authorityCode : null,
              historic: data.lookupData.historic,
            };

          default:
            return null;
        }
      } else return null;
    };

    const getCymPostData = (newEngLookup) => {
      if (data.lookupData && data.lookupData.welsh) {
        switch (data.variant) {
          case "postTown":
            return {
              postTown: data.lookupData.welsh,
              historic: data.lookupData.historic,
              language: "CYM",
              linkedRef: newEngLookup && newEngLookup.postTownRef ? newEngLookup.postTownRef : -1,
            };

          case "locality":
            return {
              locality: data.lookupData.welsh,
              historic: data.lookupData.historic,
              language: "CYM",
              linkedRef: newEngLookup && newEngLookup.localityRef ? newEngLookup.localityRef : -1,
            };

          case "town":
            return {
              town: data.lookupData.welsh,
              historic: data.lookupData.historic,
              language: "CYM",
              linkedRef: newEngLookup && newEngLookup.townRef ? newEngLookup.townRef : -1,
            };

          case "administrativeArea":
            return {
              administrativeArea: data.lookupData.welsh,
              historic: data.lookupData.historic,
              language: "CYM",
              linkedRef: newEngLookup && newEngLookup.administrativeAreaRef ? newEngLookup.administrativeAreaRef : -1,
            };

          default:
            return null;
        }
      } else return null;
    };

    const getGaePostData = (newEngLookup) => {
      if (data.lookupData && data.lookupData.gaelic) {
        switch (data.variant) {
          case "postTown":
            return {
              postTown: data.lookupData.gaelic,
              historic: data.lookupData.historic,
              language: "GAE",
              linkedRef: newEngLookup && newEngLookup.postTownRef ? newEngLookup.postTownRef : -1,
            };

          case "subLocality":
            return {
              subLocality: data.lookupData.gaelic,
              historic: data.lookupData.historic,
              language: "GAE",
              linkedRef: newEngLookup && newEngLookup.subLocalityRef ? newEngLookup.subLocalityRef : -1,
            };

          case "locality":
            return {
              locality: data.lookupData.gaelic,
              historic: data.lookupData.historic,
              language: "GAE",
              linkedRef: newEngLookup && newEngLookup.localityRef ? newEngLookup.localityRef : -1,
            };

          case "town":
            return {
              town: data.lookupData.gaelic,
              historic: data.lookupData.historic,
              language: "GAE",
              linkedRef: newEngLookup && newEngLookup.townRef ? newEngLookup.townRef : -1,
            };

          case "island":
            return {
              island: data.lookupData.gaelic,
              historic: data.lookupData.historic,
              language: "GAE",
              linkedRef: newEngLookup && newEngLookup.islandRef ? newEngLookup.islandRef : -1,
            };

          case "administrativeArea":
            return {
              administrativeArea: data.lookupData.gaelic,
              historic: data.lookupData.historic,
              language: "GAE",
              linkedRef: newEngLookup && newEngLookup.administrativeAreaRef ? newEngLookup.administrativeAreaRef : -1,
            };

          default:
            return null;
        }
      } else return null;
    };

    function UpdateEngLinkedRef(engLookup, linkedLookup) {
      if (engLookup && linkedLookup) {
        switch (data.variant) {
          case "postTown":
            return { ...engLookup, linkedRef: linkedLookup.postTownRef };

          case "subLocality":
            return { ...engLookup, linkedRef: linkedLookup.subLocalityRef };

          case "locality":
            return { ...engLookup, linkedRef: linkedLookup.localityRef };

          case "town":
            return { ...engLookup, linkedRef: linkedLookup.townRef };

          case "island":
            return { ...engLookup, linkedRef: linkedLookup.islandRef };

          case "administrativeArea":
            return { ...engLookup, linkedRef: linkedLookup.administrativeAreaRef };

          default:
            return engLookup;
        }
      } else return engLookup;
    }

    if (data) {
      const lookupUrl = GetLookupUrl(data.variant, "POST");

      // if (process.env.NODE_ENV === "development")
      console.log("[DEBUG] handleDoneAddLookup", {
        lookupUrl: lookupUrl,
        language: "ENG",
        JSON: JSON.stringify(getEngPostData()),
      });
      let newEngLookup = null;
      let newCymLookup = null;
      let newGaeLookup = null;

      if (lookupUrl) {
        await fetch(lookupUrl.url, {
          headers: lookupUrl.headers,
          crossDomain: true,
          method: lookupUrl.type,
          body: JSON.stringify(getEngPostData()),
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            newEngLookup = result;
            lookupAdded = true;
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  console.error(`[400 ERROR] Creating ${GetVariantString(data.variant)} object`, body.errors);
                  let lookupEngErrors = [];
                  for (const [key, value] of Object.entries(body.errors)) {
                    lookupEngErrors.push({ key: key, value: value });
                  }

                  if (lookupEngErrors.length > 0) setEngError(lookupEngErrors[0].value);
                  else setEngError(null);
                });
                break;

              case 401:
                res.json().then((body) => {
                  console.error(`[401 ERROR] Creating ${GetVariantString(data.variant)} object`, body);
                });
                break;

              case 500:
                console.error(`[500 ERROR] Creating ${GetVariantString(data.variant)} object`, res);
                break;

              default:
                console.error(`[${res.status} ERROR] Creating ${GetVariantString(data.variant)} object`, res);
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
            lookupAdded = false;
            const cymData = getCymPostData(newEngLookup);
            // if (process.env.NODE_ENV === "development")
            console.log("[DEBUG] handleDoneAddLookup", {
              lookupUrl: lookupUrl,
              language: "CYM",
              JSON: JSON.stringify(cymData),
            });
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
                  lookupAdded = true;
                })
                .catch((res) => {
                  switch (res.status) {
                    case 400:
                      res.json().then((body) => {
                        console.error(`[400 ERROR] Creating ${GetVariantString(data.variant)} object`, body.errors);
                        let lookupCymErrors = [];
                        for (const [key, value] of Object.entries(body.errors)) {
                          lookupCymErrors.push({ key: key, value: value });
                        }

                        if (lookupCymErrors.length > 0) setAltLanguageError(lookupCymErrors[0].value);
                        else setAltLanguageError(null);
                      });
                      break;

                    case 401:
                      res.json().then((body) => {
                        console.error(`[401 ERROR] Creating ${GetVariantString(data.variant)} object`, body);
                      });
                      break;

                    case 500:
                      console.error(`[500 ERROR] Creating ${GetVariantString(data.variant)} object`, res);
                      break;

                    default:
                      console.error(`[${res.status} ERROR] Creating ${GetVariantString(data.variant)} object`, res);
                      break;
                  }
                });
            }

            if (newCymLookup) newEngLookup = UpdateEngLinkedRef(newEngLookup, newCymLookup);
          }

          if (canHaveMultiLanguage && settingsContext.isScottish) {
            lookupAdded = false;
            const gaeData = getGaePostData(newEngLookup);
            // if (process.env.NODE_ENV === "development")
            console.log("[DEBUG] handleDoneAddLookup", {
              lookupUrl: lookupUrl,
              language: "GAE",
              JSON: JSON.stringify(gaeData),
            });
            if (gaeData) {
              await fetch(lookupUrl.url, {
                headers: lookupUrl.headers,
                crossDomain: true,
                method: lookupUrl.type,
                body: JSON.stringify(gaeData),
              })
                .then((res) => (res.ok ? res : Promise.reject(res)))
                .then((res) => res.json())
                .then((result) => {
                  newGaeLookup = result;
                  lookupAdded = true;
                })
                .catch((res) => {
                  switch (res.status) {
                    case 400:
                      res.json().then((body) => {
                        console.error(`[400 ERROR] Creating ${GetVariantString(data.variant)} object`, body.errors);
                        let lookupGaeErrors = [];
                        for (const [key, value] of Object.entries(body.errors)) {
                          lookupGaeErrors.push({ key: key, value: value });
                        }

                        if (lookupGaeErrors.length > 0) setAltLanguageError(lookupGaeErrors[0].value);
                        else setAltLanguageError(null);
                      });
                      break;

                    case 401:
                      res.json().then((body) => {
                        console.error(`[401 ERROR] Creating ${GetVariantString(data.variant)} object`, body);
                      });
                      break;

                    case 500:
                      console.error(`[500 ERROR] Creating ${GetVariantString(data.variant)} object`, res);
                      break;

                    default:
                      console.error(`[${res.status} ERROR] Creating ${GetVariantString(data.variant)} object`, res);
                      break;
                  }
                });
            }

            if (newGaeLookup) newEngLookup = UpdateEngLinkedRef(newEngLookup, newGaeLookup);
          }

          if (lookupAdded) {
            const updatedLookups = GetOldLookups(data.variant);

            if (updatedLookups) {
              if (newEngLookup) updatedLookups.push(newEngLookup);
              if (newCymLookup) updatedLookups.push(newCymLookup);
              if (newGaeLookup) updatedLookups.push(newGaeLookup);

              if (updatedLookups.length > 0) UpdateLookups(data.variant, updatedLookups);
            }
            addResult.current = true;
          } else addResult.current = false;
        }
      }
    }

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

              return updatedHistoricPostcode.push(updatedLookup);
            } else return lookupContext.currentLookups.postcodes.push(updatedLookup);
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

              return updatedHistoricPostTown.push(updatedLookup);
            } else return lookupContext.currentLookups.postTowns.push(updatedLookup);
          } else
            return lookupContext.currentLookups.postTowns.map(
              (x) => [updatedLookup].find((rec) => rec.postTownRef === x.postTownRef) || x
            );

        case "subLocalities":
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

              return updatedHistoricSubLocality.push(updatedLookup);
            } else return lookupContext.currentLookups.subLocalities.push(updatedLookup);
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

              return updatedHistoricLocality.push(updatedLookup);
            } else return lookupContext.currentLookups.localities.push(updatedLookup);
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

              return updatedHistoricTown.push(updatedLookup);
            } else return lookupContext.currentLookups.towns.push(updatedLookup);
          } else
            return lookupContext.currentLookups.towns.map(
              (x) => [updatedLookup].find((rec) => rec.townRef === x.townRef) || x
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

              return updatedHistoricIsland.push(updatedLookup);
            } else return lookupContext.currentLookups.islands.push(updatedLookup);
          } else
            return lookupContext.currentLookups.islands.map(
              (x) => [updatedLookup].find((rec) => rec.islandRef === x.islandRef) || x
            );

        case "ward":
          return lookupContext.currentLookups.wards.map((x) => [updatedLookup].find((rec) => rec.pkId === x.pkId) || x);

        case "parish":
          return lookupContext.currentLookups.parishes.map(
            (x) => [updatedLookup].find((rec) => rec.pkId === x.pkId) || x
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedCymLookup);
                }
              }
            } else return lookupContext.currentLookups.postTowns.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedCymLookup);
                }
              }
            } else return lookupContext.currentLookups.localities.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedCymLookup);
                }
              }
            } else return lookupContext.currentLookups.towns.push(updatedEngLookup, updatedCymLookup);
          } else
            return lookupContext.currentLookups.towns.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.townRef === x.townRef) ||
                [updatedCymLookup].find((rec) => rec.townRef === x.townRef) ||
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

  const updateGaeLookups = (variant, originalId, updatedEngLookup, updatedGaeLookup) => {
    if (updatedEngLookup && updatedGaeLookup) {
      switch (variant) {
        case "postTown":
          if (lookupInUse) {
            const originalPostTown = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === originalId);
            if (originalPostTown) {
              if (originalPostTown.language === "ENG") {
                const gaeHistoricPostTown = lookupContext.currentLookups.postTowns.find(
                  (x) => x.postTownRef === originalPostTown.linkedRef
                );
                if (gaeHistoricPostTown) {
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
                          postTownRef: gaeHistoricPostTown.postTownRef,
                          postTown: gaeHistoricPostTown.postTown,
                          language: gaeHistoricPostTown.language,
                          historic: true,
                          linkedRef: gaeHistoricPostTown.linkedRef,
                        },
                      ].find((rec) => rec.postTownRef === x.postTownRef) ||
                      x
                  );

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricPostTown.push(updatedEngLookup, updatedGaeLookup);
                }
              }
            } else return lookupContext.currentLookups.postTowns.push(updatedEngLookup, updatedGaeLookup);
          } else
            return lookupContext.currentLookups.postTowns.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.postTownRef === x.postTownRef) ||
                [updatedGaeLookup].find((rec) => rec.postTownRef === x.postTownRef) ||
                x
            );

        case "subLocality":
          if (lookupInUse) {
            const originalSubLocality = lookupContext.currentLookups.subLocalities.find(
              (x) => x.subLocalityRef === originalId
            );
            if (originalSubLocality) {
              if (originalSubLocality.language === "ENG") {
                const gaeHistoricSubLocality = lookupContext.currentLookups.subLocalities.find(
                  (x) => x.subLocalityRef === originalSubLocality.linkedRef
                );
                if (gaeHistoricSubLocality) {
                  const updatedHistoricSubLocality = lookupContext.currentLookups.subLocalities.map(
                    (x) =>
                      [
                        {
                          subLocalityRef: originalSubLocality.subLocalityRef,
                          subLocality: originalSubLocality.subLocality,
                          language: originalSubLocality.language,
                          historic: true,
                          linkedRef: originalSubLocality.linkedRef,
                        },
                      ].find((rec) => rec.subLocalityRef === x.subLocalityRef) ||
                      [
                        {
                          subLocalityRef: gaeHistoricSubLocality.subLocalityRef,
                          subLocality: gaeHistoricSubLocality.subLocality,
                          language: gaeHistoricSubLocality.language,
                          historic: true,
                          linkedRef: gaeHistoricSubLocality.linkedRef,
                        },
                      ].find((rec) => rec.subLocalityRef === x.subLocalityRef) ||
                      x
                  );

                  return updatedHistoricSubLocality.push(updatedEngLookup, updatedGaeLookup);
                } else {
                  const updatedHistoricSubLocality = lookupContext.currentLookups.subLocalities.map(
                    (x) =>
                      [
                        {
                          subLocalityRef: originalSubLocality.subLocalityRef,
                          subLocality: originalSubLocality.subLocality,
                          language: originalSubLocality.language,
                          historic: true,
                          linkedRef: originalSubLocality.linkedRef,
                        },
                      ].find((rec) => rec.subLocalityRef === x.subLocalityRef) || x
                  );

                  return updatedHistoricSubLocality.push(updatedEngLookup, updatedGaeLookup);
                }
              } else {
                const engHistoricSubLocality = lookupContext.currentLookups.subLocalities.find(
                  (x) => x.subLocalityRef === originalSubLocality.linkedRef
                );
                if (engHistoricSubLocality) {
                  const updatedHistoricSubLocality = lookupContext.currentLookups.subLocalities.map(
                    (x) =>
                      [
                        {
                          subLocalityRef: originalSubLocality.subLocalityRef,
                          subLocality: originalSubLocality.subLocality,
                          language: originalSubLocality.language,
                          historic: true,
                          linkedRef: originalSubLocality.linkedRef,
                        },
                      ].find((rec) => rec.subLocalityRef === x.subLocalityRef) ||
                      [
                        {
                          subLocalityRef: engHistoricSubLocality.subLocalityRef,
                          subLocality: engHistoricSubLocality.subLocality,
                          language: engHistoricSubLocality.language,
                          historic: true,
                          linkedRef: engHistoricSubLocality.linkedRef,
                        },
                      ].find((rec) => rec.subLocalityRef === x.subLocalityRef) ||
                      x
                  );

                  return updatedHistoricSubLocality.push(updatedEngLookup, updatedGaeLookup);
                } else {
                  const updatedHistoricSubLocality = lookupContext.currentLookups.subLocalities.map(
                    (x) =>
                      [
                        {
                          subLocalityRef: originalSubLocality.subLocalityRef,
                          subLocality: originalSubLocality.subLocality,
                          language: originalSubLocality.language,
                          historic: true,
                          linkedRef: originalSubLocality.linkedRef,
                        },
                      ].find((rec) => rec.subLocalityRef === x.subLocalityRef) || x
                  );

                  return updatedHistoricSubLocality.push(updatedEngLookup, updatedGaeLookup);
                }
              }
            } else return lookupContext.currentLookups.subLocalities.push(updatedEngLookup, updatedGaeLookup);
          } else
            return lookupContext.currentLookups.subLocalities.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.subLocalityRef === x.subLocalityRef) ||
                [updatedGaeLookup].find((rec) => rec.subLocalityRef === x.subLocalityRef) ||
                x
            );

        case "locality":
          if (lookupInUse) {
            const originalLocality = lookupContext.currentLookups.localities.find((x) => x.localityRef === originalId);
            if (originalLocality) {
              if (originalLocality.language === "ENG") {
                const gaeHistoricLocality = lookupContext.currentLookups.localities.find(
                  (x) => x.localityRef === originalLocality.linkedRef
                );
                if (gaeHistoricLocality) {
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
                          localityRef: gaeHistoricLocality.localityRef,
                          locality: gaeHistoricLocality.locality,
                          language: gaeHistoricLocality.language,
                          historic: true,
                          linkedRef: gaeHistoricLocality.linkedRef,
                        },
                      ].find((rec) => rec.localityRef === x.localityRef) ||
                      x
                  );

                  return updatedHistoricLocality.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricLocality.push(updatedEngLookup, updatedGaeLookup);
                }
              }
            } else return lookupContext.currentLookups.localities.push(updatedEngLookup, updatedGaeLookup);
          } else
            return lookupContext.currentLookups.localities.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.localityRef === x.localityRef) ||
                [updatedGaeLookup].find((rec) => rec.localityRef === x.localityRef) ||
                x
            );

        case "town":
          if (lookupInUse) {
            const originalTown = lookupContext.currentLookups.towns.find((x) => x.townRef === originalId);
            if (originalTown) {
              if (originalTown.language === "ENG") {
                const gaeHistoricTown = lookupContext.currentLookups.towns.find(
                  (x) => x.townRef === originalTown.linkedRef
                );
                if (gaeHistoricTown) {
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
                          townRef: gaeHistoricTown.townRef,
                          town: gaeHistoricTown.town,
                          language: gaeHistoricTown.language,
                          historic: true,
                          linkedRef: gaeHistoricTown.linkedRef,
                        },
                      ].find((rec) => rec.townRef === x.townRef) ||
                      x
                  );

                  return updatedHistoricTown.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedGaeLookup);
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

                  return updatedHistoricTown.push(updatedEngLookup, updatedGaeLookup);
                }
              }
            } else return lookupContext.currentLookups.towns.push(updatedEngLookup, updatedGaeLookup);
          } else
            return lookupContext.currentLookups.towns.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.townRef === x.townRef) ||
                [updatedGaeLookup].find((rec) => rec.townRef === x.townRef) ||
                x
            );

        case "island":
          if (lookupInUse) {
            const originalIsland = lookupContext.currentLookups.islands.find((x) => x.islandRef === originalId);
            if (originalIsland) {
              if (originalIsland.language === "ENG") {
                const gaeHistoricIsland = lookupContext.currentLookups.islands.find(
                  (x) => x.islandRef === originalIsland.linkedRef
                );
                if (gaeHistoricIsland) {
                  const updatedHistoricIsland = lookupContext.currentLookups.islands.map(
                    (x) =>
                      [
                        {
                          islandRef: originalIsland.islandRef,
                          island: originalIsland.island,
                          language: originalIsland.language,
                          historic: true,
                          linkedRef: originalIsland.linkedRef,
                        },
                      ].find((rec) => rec.islandRef === x.islandRef) ||
                      [
                        {
                          islandRef: gaeHistoricIsland.islandRef,
                          island: gaeHistoricIsland.island,
                          language: gaeHistoricIsland.language,
                          historic: true,
                          linkedRef: gaeHistoricIsland.linkedRef,
                        },
                      ].find((rec) => rec.islandRef === x.islandRef) ||
                      x
                  );

                  return updatedHistoricIsland.push(updatedEngLookup, updatedGaeLookup);
                } else {
                  const updatedHistoricIsland = lookupContext.currentLookups.islands.map(
                    (x) =>
                      [
                        {
                          islandRef: originalIsland.islandRef,
                          island: originalIsland.island,
                          language: originalIsland.language,
                          historic: true,
                          linkedRef: originalIsland.linkedRef,
                        },
                      ].find((rec) => rec.islandRef === x.islandRef) || x
                  );

                  return updatedHistoricIsland.push(updatedEngLookup, updatedGaeLookup);
                }
              } else {
                const engHistoricIsland = lookupContext.currentLookups.islands.find(
                  (x) => x.islandRef === originalIsland.linkedRef
                );
                if (engHistoricIsland) {
                  const updatedHistoricIsland = lookupContext.currentLookups.islands.map(
                    (x) =>
                      [
                        {
                          islandRef: originalIsland.islandRef,
                          island: originalIsland.island,
                          language: originalIsland.language,
                          historic: true,
                          linkedRef: originalIsland.linkedRef,
                        },
                      ].find((rec) => rec.islandRef === x.islandRef) ||
                      [
                        {
                          islandRef: engHistoricIsland.islandRef,
                          island: engHistoricIsland.island,
                          language: engHistoricIsland.language,
                          historic: true,
                          linkedRef: engHistoricIsland.linkedRef,
                        },
                      ].find((rec) => rec.islandRef === x.islandRef) ||
                      x
                  );

                  return updatedHistoricIsland.push(updatedEngLookup, updatedGaeLookup);
                } else {
                  const updatedHistoricIsland = lookupContext.currentLookups.islands.map(
                    (x) =>
                      [
                        {
                          islandRef: originalIsland.islandRef,
                          island: originalIsland.island,
                          language: originalIsland.language,
                          historic: true,
                          linkedRef: originalIsland.linkedRef,
                        },
                      ].find((rec) => rec.islandRef === x.islandRef) || x
                  );

                  return updatedHistoricIsland.push(updatedEngLookup, updatedGaeLookup);
                }
              }
            } else return lookupContext.currentLookups.islands.push(updatedEngLookup, updatedGaeLookup);
          } else
            return lookupContext.currentLookups.islands.map(
              (x) =>
                [updatedEngLookup].find((rec) => rec.islandRef === x.islandRef) ||
                [updatedGaeLookup].find((rec) => rec.islandRef === x.islandRef) ||
                x
            );

        default:
          return null;
      }
    } else if (updatedEngLookup && !updatedGaeLookup) {
      return updateSingleLookups(variant, originalId, updatedEngLookup);
    } else if (!updatedEngLookup && updatedGaeLookup) {
      return updateSingleLookups(variant, originalId, updatedGaeLookup);
    }
  };

  const handleDoneEditLookup = async (data) => {
    const linkedRef = GetLinkedRef(data.variant, data.lookupData.lookupId);
    const lookupUrl = GetLookupUrl(data.variant, "PUT");
    let lookupEdited = false;

    currentVariant.current = GetVariantString(data.variant);

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
                wardCode: data.lookupData.wardCode,
                ward: data.lookupData.ward,
                detrCode: settingsContext ? settingsContext.authorityCode : null,
                historic: data.lookupData.historic,
              };
            } else return null;

          case "parish":
            const parishRecord = lookupContext.currentLookups.parishes.find((x) => x.pkId === data.lookupData.lookupId);
            if (parishRecord) {
              return {
                pkId: data.lookupData.lookupId,
                parishCode: data.lookupData.parishCode,
                parish: data.lookupData.parish,
                detrCode: settingsContext ? settingsContext.authorityCode : null,
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

    const getGaePutData = () => {
      if (data.lookupData && data.lookupData.gaelic) {
        switch (data.variant) {
          case "postTown":
            const postTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTownRef === data.lookupData.lookupId
            );
            if (postTownRecord) {
              if (postTownRecord.language === "ENG") {
                return {
                  postTownRef: linkedRef,
                  postTown: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  postTownRef: data.lookupData.lookupId,
                  postTown: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: linkedRef,
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
                  subLocalityRef: linkedRef,
                  subLocality: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  subLocalityRef: data.lookupData.lookupId,
                  subLocality: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
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
                  locality: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  localityRef: data.lookupData.lookupId,
                  locality: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
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
                  town: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  townRef: data.lookupData.lookupId,
                  town: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: linkedRef,
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
                  islandRef: linkedRef,
                  island: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  islandRef: data.lookupData.lookupId,
                  island: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
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
                  administrativeArea: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
                  linkedRef: data.lookupData.lookupId,
                };
              } else {
                return {
                  administrativeAreaRef: data.lookupData.lookupId,
                  administrativeArea: data.lookupData.gaelic,
                  historic: data.lookupData.historic,
                  language: "GAE",
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
      let newGaeLookup = null;

      if (lookupUrl) {
        await fetch(lookupUrl.url, {
          headers: lookupUrl.headers,
          crossDomain: true,
          method: lookupUrl.type,
          body: JSON.stringify(getEngPutData()),
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
                  console.error(`[400 ERROR] Updating ${GetVariantString(data.variant)} object`, body.errors);
                  let lookupEngErrors = [];
                  for (const [key, value] of Object.entries(body.errors)) {
                    lookupEngErrors.push({ key: key, value: value });
                  }

                  if (lookupEngErrors.length > 0) setEngError(lookupEngErrors[0].value);
                  else setEngError(null);
                });
                break;

              case 401:
                res.json().then((body) => {
                  console.error(`[401 ERROR] Updating ${GetVariantString(data.variant)} object`, body);
                });
                break;

              case 500:
                console.error(`[500 ERROR] Updating ${GetVariantString(data.variant)} object`, res);
                break;

              default:
                console.error(`[${res.status} ERROR] Updating ${GetVariantString(data.variant)} object`, res);
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
                        console.error(`[400 ERROR] Updating ${GetVariantString(data.variant)} object`, body.errors);
                        let lookupCymErrors = [];
                        for (const [key, value] of Object.entries(body.errors)) {
                          lookupCymErrors.push({ key: key, value: value });
                        }

                        if (lookupCymErrors.length > 0) setAltLanguageError(lookupCymErrors[0].value);
                        else setAltLanguageError(null);
                      });
                      break;

                    case 401:
                      res.json().then((body) => {
                        console.error(`[401 ERROR] Updating ${GetVariantString(data.variant)} object`, body);
                      });
                      break;

                    case 500:
                      console.error(`[500 ERROR] Updating ${GetVariantString(data.variant)} object`, res);
                      break;

                    default:
                      console.error(`[${res.status} ERROR] Updating ${GetVariantString(data.variant)} object`, res);
                      break;
                  }
                });
            }
          }

          if (canHaveMultiLanguage && settingsContext.isScottish) {
            lookupEdited = false;
            const gaeData = getGaePutData();

            if (gaeData) {
              await fetch(lookupUrl.url, {
                headers: lookupUrl.headers,
                crossDomain: true,
                method: lookupUrl.type,
                body: JSON.stringify(gaeData),
              })
                .then((res) => (res.ok ? res : Promise.reject(res)))
                .then((res) => res.json())
                .then((result) => {
                  newGaeLookup = result;
                  lookupEdited = true;
                })
                .catch((res) => {
                  switch (res.status) {
                    case 400:
                      res.json().then((body) => {
                        console.error(`[400 ERROR] Updating ${GetVariantString(data.variant)} object`, body.errors);
                        let lookupGaeErrors = [];
                        for (const [key, value] of Object.entries(body.errors)) {
                          lookupGaeErrors.push({ key: key, value: value });
                        }

                        if (lookupGaeErrors.length > 0) setAltLanguageError(lookupGaeErrors[0].value);
                        else setAltLanguageError(null);
                      });
                      break;

                    case 401:
                      res.json().then((body) => {
                        console.error(`[401 ERROR] Updating ${GetVariantString(data.variant)} object`, body);
                      });
                      break;

                    case 500:
                      console.error(`[500 ERROR] Updating ${GetVariantString(data.variant)} object`, res);
                      break;

                    default:
                      console.error(`[${res.status} ERROR] Updating ${GetVariantString(data.variant)} object`, res);
                      break;
                  }
                });
            }
          }

          if (lookupEdited) {
            const oldLookups = GetOldLookups(data.variant);
            let updatedLookups = null;

            if (oldLookups) {
              if (settingsContext.isWelsh) {
                updatedLookups = updateCymLookups(data.variant, data.lookupData.lookupId, newEngLookup, newCymLookup);
              } else if (settingsContext.isScottish) {
                updatedLookups = updateGaeLookups(data.variant, data.lookupData.lookupId, newEngLookup, newGaeLookup);
              } else {
                updatedLookups = updateSingleLookups(data.variant, data.lookupData.lookupId, newEngLookup);
              }

              if (updatedLookups && updatedLookups.length > 0) UpdateLookups(data.variant, updatedLookups);
            }
            editResult.current = true;
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
    const lookupUrl = GetLookupUrl(variant, "DELETE");
    let lookupDeleted = false;

    currentVariant.current = GetVariantString(variant);

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
          console.log(`Successfully deleted the ${currentVariant.current} record.`);
          lookupDeleted = true;
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
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
              res.json().then((body) => {
                console.error(`[401 ERROR] Deleting ${currentVariant.current} object`, body);
              });
              break;

            case 500:
              console.error(`[500 ERROR] Deleting ${currentVariant.current} object`, res);
              break;

            default:
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
            console.log(`Successfully deleted the ${currentVariant.current} record.`);
            lookupDeleted = true;
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
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
                res.json().then((body) => {
                  console.error(`[401 ERROR] Deleting ${currentVariant.current} object`, body);
                });
                break;

              case 500:
                console.error(`[500 ERROR] Deleting ${currentVariant.current} object`, res);
                break;

              default:
                console.error(`[${res.status} ERROR] Deleting ${GetVariantString(variant)} object`, res);
                break;
            }
          });
      }

      if (lookupDeleted) {
        const oldLookups = GetOldLookups(variant);
        let updatedLookups;

        if (oldLookups) {
          if (linkedRef) {
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

              default:
                updatedLookups = oldLookups;
                break;
            }
          }

          if (updatedLookups.length > 0) UpdateLookups(variant, updatedLookups);
        }
        deleteResult.current = true;
      } else deleteResult.current = false;
    }

    setDeleteOpen(deleteResult.current);
    setShowDeleteDialog(!deleteResult.current);
  };

  const handleHistoricLookup = async (variant, lookupId) => {
    const linkedRef = GetLinkedRef(variant, lookupId);
    const lookupUrl = GetLookupUrl(variant, "PUT");
    let lookupEdited = false;

    currentVariant.current = GetVariantString(variant);

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
                linkedRef: linkedRef,
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
            if (subLocalityRecord.language === "ENG") {
              return {
                subLocalityRef: lookupId,
                subLocality: subLocalityRecord.subLocality,
                historic: true,
                language: "ENG",
                linkedRef: linkedRef,
              };
            } else {
              const engSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
                (x) => x.subLocalityRef === linkedRef
              );
              if (engSubLocalityRecord) {
                return {
                  subLocalityRef: linkedRef,
                  subLocality: engSubLocalityRecord.subLocality,
                  historic: true,
                  language: "ENG",
                  linkedRef: lookupId,
                };
              } else return null;
            }
          } else return null;

        case "crossReference":
          const crossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === lookupId);
          if (crossReferenceRecord)
            return {
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
                linkedRef: linkedRef,
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
                linkedRef: linkedRef,
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
          if (islandRecord) {
            if (islandRecord.language === "ENG") {
              return {
                islandRef: lookupId,
                island: islandRecord.island,
                historic: true,
                language: "ENG",
                linkedRef: linkedRef,
              };
            } else {
              const engIslandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === linkedRef);
              if (engIslandRecord)
                return {
                  islandRef: linkedRef,
                  island: engIslandRecord.island,
                  historic: true,
                  language: "ENG",
                  linkedRef: lookupId,
                };
              else return null;
            }
          } else return null;

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
                linkedRef: linkedRef,
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
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                postTownRef: lookupId,
                postTown: postTownRecord.postTown,
                historic: true,
                language: "CYM",
                linkedRef: linkedRef,
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
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                localityRef: lookupId,
                locality: localityRecord.locality,
                historic: true,
                language: "CYM",
                linkedRef: linkedRef,
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
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                townRef: lookupId,
                town: townRecord.town,
                historic: true,
                language: "CYM",
                linkedRef: linkedRef,
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
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                administrativeAreaRef: lookupId,
                administrativeArea: administrativeAreaRecord.administrativeArea,
                historic: true,
                language: "CYM",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        default:
          return null;
      }
    };

    const getGaePutData = () => {
      switch (variant) {
        case "postTown":
          const postTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lookupId);
          if (postTownRecord) {
            if (postTownRecord.language === "ENG") {
              const gaePostTownRecord = lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === linkedRef);
              if (gaePostTownRecord)
                return {
                  postTownRef: linkedRef,
                  postTown: gaePostTownRecord.postTown,
                  historic: true,
                  language: "GAE",
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                postTownRef: lookupId,
                postTown: postTownRecord.postTown,
                historic: true,
                language: "GAE",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        case "subLocality":
          const subLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocalityRef === lookupId
          );
          if (subLocalityRecord) {
            if (subLocalityRecord.language === "ENG") {
              const gaeSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
                (x) => x.subLocalityRef === linkedRef
              );
              if (gaeSubLocalityRecord)
                return {
                  subLocalityRef: linkedRef,
                  subLocality: gaeSubLocalityRecord.subLocality,
                  historic: true,
                  language: "GAE",
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                subLocalityRef: lookupId,
                subLocality: subLocalityRecord.subLocality,
                historic: true,
                language: "GAE",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        case "locality":
          const localityRecord = lookupContext.currentLookups.localities.find((x) => x.localityRef === lookupId);
          if (localityRecord) {
            if (localityRecord.language === "ENG") {
              const gaeLocalityRecord = lookupContext.currentLookups.localities.find(
                (x) => x.localityRef === linkedRef
              );
              if (gaeLocalityRecord)
                return {
                  localityRef: linkedRef,
                  locality: gaeLocalityRecord.locality,
                  historic: true,
                  language: "GAE",
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                localityRef: lookupId,
                locality: localityRecord.locality,
                historic: true,
                language: "GAE",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        case "town":
          const townRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === lookupId);
          if (townRecord) {
            if (townRecord.language === "ENG") {
              const gaeTownRecord = lookupContext.currentLookups.towns.find((x) => x.townRef === linkedRef);
              if (gaeTownRecord)
                return {
                  townRef: linkedRef,
                  town: gaeTownRecord.town,
                  historic: true,
                  language: "GAE",
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                townRef: lookupId,
                town: townRecord.town,
                historic: true,
                language: "GAE",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        case "island":
          const islandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === lookupId);
          if (islandRecord) {
            if (islandRecord.language === "ENG") {
              const gaeIslandRecord = lookupContext.currentLookups.islands.find((x) => x.islandRef === linkedRef);
              if (gaeIslandRecord)
                return {
                  islandRef: linkedRef,
                  island: gaeIslandRecord.island,
                  historic: true,
                  language: "GAE",
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                islandRef: lookupId,
                island: islandRecord.island,
                historic: true,
                language: "GAE",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        case "administrativeArea":
          const administrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeAreaRef === lookupId
          );
          if (administrativeAreaRecord) {
            if (administrativeAreaRecord.language === "ENG") {
              const gaeAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
                (x) => x.administrativeAreaRef === linkedRef
              );
              if (gaeAdministrativeAreaRecord)
                return {
                  administrativeAreaRef: linkedRef,
                  administrativeArea: gaeAdministrativeAreaRecord.administrativeArea,
                  historic: true,
                  language: "GAE",
                  linkedRef: lookupId,
                };
              else return null;
            } else {
              return {
                administrativeAreaRef: lookupId,
                administrativeArea: administrativeAreaRecord.administrativeArea,
                historic: true,
                language: "GAE",
                linkedRef: linkedRef,
              };
            }
          } else return null;

        default:
          return null;
      }
    };

    let newEngLookup = null;
    let newCymLookup = null;
    let newGaeLookup = null;

    if (lookupUrl) {
      await fetch(lookupUrl.url, {
        headers: lookupUrl.headers,
        crossDomain: true,
        method: lookupUrl.type,
        body: JSON.stringify(getEngPutData()),
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
                console.error(`[400 ERROR] Updating ${GetVariantString(variant)} object`, body.errors);
                let lookupEngErrors = [];
                for (const [key, value] of Object.entries(body.errors)) {
                  lookupEngErrors.push({ key: key, value: value });
                }

                if (lookupEngErrors.length > 0) setEngError(lookupEngErrors[0].value);
                else setEngError(null);
              });
              break;

            case 401:
              res.json().then((body) => {
                console.error(`[401 ERROR] Updating ${GetVariantString(variant)} object`, body);
              });
              break;

            case 500:
              console.error(`[500 ERROR] Updating ${GetVariantString(variant)} object`, res);
              break;

            default:
              console.error(`[${res.status} ERROR] Updating ${GetVariantString(variant)} object`, res);
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
        ].includes(variant);

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
                      console.error(`[400 ERROR] Updating ${GetVariantString(variant)} object`, body.errors);
                      let lookupCymErrors = [];
                      for (const [key, value] of Object.entries(body.errors)) {
                        lookupCymErrors.push({ key: key, value: value });
                      }

                      if (lookupCymErrors.length > 0) setAltLanguageError(lookupCymErrors[0].value);
                      else setAltLanguageError(null);
                    });
                    break;

                  case 401:
                    res.json().then((body) => {
                      console.error(`[401 ERROR] Updating ${GetVariantString(variant)} object`, body);
                    });
                    break;

                  case 500:
                    console.error(`[500 ERROR] Updating ${GetVariantString(variant)} object`, res);
                    break;

                  default:
                    console.error(`[${res.status} ERROR] Updating ${GetVariantString(variant)} object`, res);
                    break;
                }
              });
          }
        }

        if (canHaveMultiLanguage && settingsContext.isScottish) {
          lookupEdited = false;
          const gaeData = getGaePutData();

          if (gaeData) {
            await fetch(lookupUrl.url, {
              headers: lookupUrl.headers,
              crossDomain: true,
              method: lookupUrl.type,
              body: JSON.stringify(gaeData),
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => res.json())
              .then((result) => {
                newGaeLookup = result;
                lookupEdited = true;
              })
              .catch((res) => {
                switch (res.status) {
                  case 400:
                    res.json().then((body) => {
                      console.error(`[400 ERROR] Updating ${GetVariantString(variant)} object`, body.errors);
                      let lookupGaeErrors = [];
                      for (const [key, value] of Object.entries(body.errors)) {
                        lookupGaeErrors.push({ key: key, value: value });
                      }

                      if (lookupGaeErrors.length > 0) setAltLanguageError(lookupGaeErrors[0].value);
                      else setAltLanguageError(null);
                    });
                    break;

                  case 401:
                    res.json().then((body) => {
                      console.error(`[401 ERROR] Updating ${GetVariantString(variant)} object`, body);
                    });
                    break;

                  case 500:
                    console.error(`[500 ERROR] Updating ${GetVariantString(variant)} object`, res);
                    break;

                  default:
                    console.error(`[${res.status} ERROR] Updating ${GetVariantString(variant)} object`, res);
                    break;
                }
              });
          }
        }

        if (lookupEdited) {
          const oldLookups = GetOldLookups(variant);
          let updatedLookups = null;

          if (oldLookups) {
            if (settingsContext.isWelsh) {
              updatedLookups = updateCymLookups(variant, lookupId, newEngLookup, newCymLookup);
            } else if (settingsContext.isScottish) {
              updatedLookups = updateGaeLookups(variant, lookupId, newEngLookup, newGaeLookup);
            } else {
              updatedLookups = updateSingleLookups(variant, lookupId, newEngLookup);
            }

            if (updatedLookups && updatedLookups.length > 0) UpdateLookups(variant, updatedLookups);
          }
          editResult.current = true;
        } else editResult.current = false;
      }
    }
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

      default:
        setCurrentTab(0);
        break;
    }
  }, [nodeId]);

  return (
    <div id="lookup-tables-data-form">
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
        <AuthorityLookupTableTab data={getAuthoritiesData()} />
      </TabPanel>
      <TabPanel value={currentTab} index={10}>
        <LookupTableGridTab
          variant="ward"
          data={getWardsData()}
          onAddLookup={handleAddWard}
          onEditLookup={(id) => handleEditWard(id)}
          onDeleteLookup={(id) => handleDeleteWard(id)}
        />
      </TabPanel>
      <TabPanel value={currentTab} index={11}>
        <LookupTableGridTab
          variant="parish"
          data={getParishesData()}
          onAddLookup={handleAddParish}
          onEditLookup={(id) => handleEditParish(id)}
          onDeleteLookup={(id) => handleDeleteParish(id)}
        />
      </TabPanel>
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
