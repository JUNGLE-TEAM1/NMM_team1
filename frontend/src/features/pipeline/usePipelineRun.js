import { useEffect, useMemo, useState } from "react";

import { createPipeline, runPipeline } from "../../api/pipelineApi";
import { makePipelineForm } from "../catalog/demoNames";

export function usePipelineRun({ activeDatasetId, datasets, onRunComplete }) {
  const sourceDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.source_type !== "pipeline_result"),
    [datasets],
  );
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const selectedDataset =
    sourceDatasets.find((dataset) => dataset.id === selectedDatasetId) || sourceDatasets[0];
  const defaultFields = selectedDataset?.schema.slice(0, 2).map((column) => column.name).join(", ") || "";
  const [form, setForm] = useState(() => makePipelineForm());
  const [run, setRun] = useState(null);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const activeSource = sourceDatasets.find((dataset) => dataset.id === activeDatasetId);
    if (activeSource) {
      setSelectedDatasetId(activeSource.id);
    } else if (!selectedDatasetId && sourceDatasets.length > 0) {
      setSelectedDatasetId(sourceDatasets[0].id);
    }
  }, [activeDatasetId, selectedDatasetId, sourceDatasets]);

  async function submitPipeline(event) {
    event.preventDefault();
    if (!selectedDataset) {
      setNotice("먼저 source dataset을 등록하세요.");
      return;
    }

    setSubmitting(true);
    setNotice("");
    setRun(null);

    try {
      const fields = (form.selectFields || defaultFields)
        .split(",")
        .map((field) => field.trim())
        .filter(Boolean);
      const pipeline = await createPipeline({
        name: form.name,
        sourceDatasetId: selectedDataset.id,
        selectFields: fields,
        targetName: form.targetName,
      });
      const nextRun = await runPipeline(pipeline.id);
      setRun(nextRun);
      setNotice(`${pipeline.name} 실행 ${nextRun.status}`);
      setForm(makePipelineForm(selectedDataset?.name));
      await onRunComplete?.(nextRun.result_dataset_id || selectedDataset.id);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    defaultFields,
    form,
    notice,
    run,
    selectedDataset,
    selectedDatasetId,
    setForm,
    setSelectedDatasetId,
    sourceDatasets,
    submitPipeline,
    submitting,
  };
}
