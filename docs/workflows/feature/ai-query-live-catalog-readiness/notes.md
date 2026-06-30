# AI query live catalog readiness notes

- `selected_datasets[0].dataset_id`가 live CatalogDataset에 있으면 해당 dataset을 우선 표시한다.
- selected dataset이 Product Health fixed catalog이거나 live catalog가 없으면 기존 Week2 Product Health readiness를 유지한다.
- component 이름은 기존 `ProductHealthReadinessPanel`을 유지하되 eyebrow는 readiness 객체가 제공한다.
