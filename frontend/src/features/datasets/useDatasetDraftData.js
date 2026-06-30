import { useCallback, useEffect, useState } from "react";

import { getCatalogDatasetManagementPolicy, listCatalogDatasets } from "../../api/catalogApi";
import { getExternalConnectionCredentialPolicy, listExternalConnections } from "../../api/externalConnectionApi";
import { listSilverDatasets } from "../../api/silverDatasetApi";
import { listProductHealthSourceInventory, listSourceDatasets } from "../../api/sourceDatasetApi";
import { listTargetDatasetDrafts, listTargetDatasetJobRuns } from "../../api/targetDatasetDraftApi";

export function useDatasetDraftData({ setNotice, mapExternalConnectionRecord }) {
  const [savedExternalConnections, setSavedExternalConnections] = useState([]);
  const [credentialPolicy, setCredentialPolicy] = useState(null);
  const [productHealthSourceInventory, setProductHealthSourceInventory] = useState(null);
  const [savedSourceDatasets, setSavedSourceDatasets] = useState([]);
  const [savedSilverDatasets, setSavedSilverDatasets] = useState([]);
  const [savedTargetDatasetDrafts, setSavedTargetDatasetDrafts] = useState([]);
  const [savedTargetJobRuns, setSavedTargetJobRuns] = useState([]);
  const [publishedCatalogDatasets, setPublishedCatalogDatasets] = useState([]);
  const [catalogDatasetPolicy, setCatalogDatasetPolicy] = useState(null);
  const [datasetDraftListState, setDatasetDraftListState] = useState({ loading: true, error: "" });

  const refreshDatasetDraftLists = useCallback(async () => {
    setDatasetDraftListState({ loading: true, error: "" });
    try {
      const [
        connections,
        sourceDatasets,
        silverDatasets,
        targetDrafts,
        catalogDatasets,
        catalogPolicy,
        nextCredentialPolicy,
        nextProductHealthInventory,
      ] = await Promise.all([
        listExternalConnections(),
        listSourceDatasets(),
        listSilverDatasets(),
        listTargetDatasetDrafts(),
        listCatalogDatasets(),
        getCatalogDatasetManagementPolicy(),
        getExternalConnectionCredentialPolicy(),
        listProductHealthSourceInventory(),
      ]);
      setSavedExternalConnections(connections.map(mapExternalConnectionRecord));
      setCredentialPolicy(nextCredentialPolicy);
      setProductHealthSourceInventory(nextProductHealthInventory);
      setSavedSourceDatasets(sourceDatasets);
      setSavedSilverDatasets(silverDatasets);
      setSavedTargetDatasetDrafts(targetDrafts);
      setPublishedCatalogDatasets(catalogDatasets);
      setCatalogDatasetPolicy(catalogPolicy);
      setDatasetDraftListState({ loading: false, error: "" });
    } catch (error) {
      setDatasetDraftListState({ loading: false, error: error.message });
      setNotice(`Dataset draft 목록 조회 실패: ${error.message}`);
    }
  }, [mapExternalConnectionRecord, setNotice]);

  const refreshTargetJobRuns = useCallback(async () => {
    try {
      const jobRuns = await listTargetDatasetJobRuns();
      setSavedTargetJobRuns(jobRuns);
    } catch (error) {
      setNotice(`Job Run 목록 조회 실패: ${error.message}`);
    }
  }, [setNotice]);

  useEffect(() => {
    refreshDatasetDraftLists();
    refreshTargetJobRuns();
  }, [refreshDatasetDraftLists, refreshTargetJobRuns]);

  return {
    savedExternalConnections,
    setSavedExternalConnections,
    credentialPolicy,
    productHealthSourceInventory,
    savedSourceDatasets,
    setSavedSourceDatasets,
    savedSilverDatasets,
    setSavedSilverDatasets,
    savedTargetDatasetDrafts,
    setSavedTargetDatasetDrafts,
    savedTargetJobRuns,
    setSavedTargetJobRuns,
    publishedCatalogDatasets,
    catalogDatasetPolicy,
    datasetDraftListState,
    refreshDatasetDraftLists,
  };
}
