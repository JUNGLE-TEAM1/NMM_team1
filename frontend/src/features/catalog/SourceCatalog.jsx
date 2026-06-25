import { TableProperties } from "lucide-react";

import { PipelineRunPanel } from "../pipeline/PipelineRunPanel";
import { CatalogDetail } from "./CatalogDetail";
import { SourceForm } from "./SourceForm";
import { SourceList } from "./SourceList";
import { useCatalog } from "./useCatalog";

export function SourceCatalog() {
  const catalog = useCatalog();

  return (
    <>
      <SourceForm
        form={catalog.sourceForm}
        onChange={catalog.setSourceForm}
        onRefresh={catalog.refreshCatalog}
        onSubmit={catalog.registerSource}
        submitting={catalog.submittingSource}
      />

      {catalog.notice ? <p className="notice">{catalog.notice}</p> : null}

      <section className="catalog-grid">
        <SourceList sources={catalog.sources} onSelectDataset={catalog.setSelectedDatasetId} />

        <div className="panel detail-panel">
          <div className="panel-title">
            <TableProperties size={18} aria-hidden="true" />
            <h2>Catalog 상세</h2>
          </div>
          {catalog.selectedDataset ? (
            <CatalogDetail dataset={catalog.selectedDataset} />
          ) : (
            <p className="empty">CSV 또는 JSON source를 등록하면 schema와 sample rows가 표시됩니다.</p>
          )}
        </div>
      </section>

      <PipelineRunPanel
        datasets={catalog.datasets}
        activeDatasetId={catalog.selectedDatasetId}
        onRunComplete={catalog.refreshCatalog}
      />
    </>
  );
}
