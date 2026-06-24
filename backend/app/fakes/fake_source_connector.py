from app.domain.schemas import ColumnSchema
from app.domain.target_contracts import SourceConnection, SchemaSnapshot


class FakeSourceConnector:
    source_type = "fixture"

    def __init__(self) -> None:
        self._connections: dict[str, SourceConnection] = {}

    def connect(self, display_name: str) -> SourceConnection:
        connection = SourceConnection(
            type=self.source_type,
            display_name=display_name,
            connection_status="connected",
        )
        self._connections[connection.id] = connection
        return connection

    def discover_schema(self, source_id: str) -> SchemaSnapshot:
        if source_id not in self._connections:
            raise KeyError(f"Unknown fake source: {source_id}")

        return SchemaSnapshot(
            source_id=source_id,
            dataset_id=f"dataset_{source_id}",
            columns=[
                ColumnSchema(name="order_id", type="string"),
                ColumnSchema(name="amount", type="integer"),
            ],
            sample_ref="fixture://orders",
            row_count=2,
        )
