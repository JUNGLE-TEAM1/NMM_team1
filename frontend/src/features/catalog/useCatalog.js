import { useEffect, useMemo, useState } from "react";

import { listCatalogDatasets } from "../../api/catalogApi";
import { createSource, listSources } from "../../api/sourceApi";
import { makeDemoSourceName } from "./demoNames";

export function useCatalog() {
  const [sources, setSources] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [sourceForm, setSourceForm] = useState(() => ({
    name: makeDemoSourceName(),
    type: "csv",
    path: "samples/orders.csv",
  }));
  const [notice, setNotice] = useState("");
  const [submittingSource, setSubmittingSource] = useState(false);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === selectedDatasetId) || datasets[0],
    [datasets, selectedDatasetId],
  );

  useEffect(() => {
    refreshCatalog();
  }, []);

  async function refreshCatalog(preferredDatasetId = selectedDatasetId) {
    try {
      const [nextSources, nextDatasets] = await Promise.all([listSources(), listCatalogDatasets()]);
      setSources(nextSources);
      setDatasets(nextDatasets);
      const hasPreferred = nextDatasets.some((dataset) => dataset.id === preferredDatasetId);
      if (hasPreferred) {
        setSelectedDatasetId(preferredDatasetId);
      } else if (nextDatasets.length > 0) {
        setSelectedDatasetId(nextDatasets[0].id);
      }
    } catch (error) {
      setNotice(error.message || "Catalog를 불러오지 못했습니다.");
    }
  }

  async function registerSource(event) {
    event.preventDefault();
    setSubmittingSource(true);
    setNotice("");

    try {
      const payload = await createSource(sourceForm);
      setSelectedDatasetId(payload.dataset.id);
      setNotice(`${payload.source.name} 등록 완료`);
      setSourceForm({ ...sourceForm, name: makeDemoSourceName() });
      await refreshCatalog(payload.dataset.id);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmittingSource(false);
    }
  }

  return {
    datasets,
    notice,
    refreshCatalog,
    registerSource,
    selectedDataset,
    selectedDatasetId,
    setSelectedDatasetId,
    setSourceForm,
    sourceForm,
    sources,
    submittingSource,
  };
}
