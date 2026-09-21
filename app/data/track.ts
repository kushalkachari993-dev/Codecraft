export type DataPaceId = "beginner" | "intermediate" | "expert";
export type DataWorld = { id: number; name: string; start: number; end: number; summary: string; focus: string };

export const DATA_PATH_TOTAL = 21;
export const DATA_TRACK = { id: "data" as const, label: "Data Engineering", icon: "DE", world: "Data Grid", total: 63, title: "Data Engineering" };

export const DATA_PATHS = [
  { id: "beginner", label: "Beginner", title: "Data Foundations", tagline: "Turn raw files into trustworthy analytics data", description: "Learn formats, schemas, modeling, ETL, storage, scheduling, quality, and recovery through complete batch-pipeline scenarios.", estimatedLevel: "NEW TO DATA", recommendedFor: "Learners who know basic programming or SQL and want to understand how reliable data pipelines work." },
  { id: "intermediate", label: "Intermediate", title: "Production Data Pipelines", tagline: "Build observable, incremental, efficient data workflows", description: "Practice orchestration, object storage, distributed execution, CDC, contracts, lineage, tests, and cost-aware operations.", estimatedLevel: "BUILDING PIPELINES", recommendedFor: "Engineers who can transform data and want production-grade workflow, scale, and reliability skills." },
  { id: "expert", label: "Expert", title: "Data Platform Architecture", tagline: "Design governed real-time platforms at organizational scale", description: "Reason about streaming, lakehouse tables, governance, quality systems, self-service platforms, SLOs, recovery, and capacity.", estimatedLevel: "DESIGNING PLATFORMS", recommendedFor: "Senior data engineers and platform owners responsible for architecture, trust, governance, and operations." },
] as const satisfies ReadonlyArray<{ id: DataPaceId; label: string; title: string; tagline: string; description: string; estimatedLevel: string; recommendedFor: string }>;

export const DATA_WORLDS_BY_PACE: Record<DataPaceId, DataWorld[]> = {
  beginner: [
    { id: 1, name: "Ingestion Dock", start: 1, end: 5, focus: "Data systems, formats, types, and encoding", summary: "Inspect raw inputs and repair a file-ingestion boundary without silently changing records." },
    { id: 2, name: "Modeling Foundry", start: 6, end: 10, focus: "Schemas, constraints, keys, and analytical models", summary: "Turn business grain and relationships into testable tables for analytics." },
    { id: 3, name: "Batch Pipeline Works", start: 11, end: 15, focus: "ETL, extraction, transformation, and replay safety", summary: "Build a repeatable batch flow that can fail, retry, and rerun safely." },
    { id: 4, name: "Warehouse Observatory", start: 16, end: 21, focus: "Storage, scheduling, quality, and operations", summary: "Load a warehouse while controlling partitions, dependencies, quality, logs, and recovery." },
  ],
  intermediate: [
    { id: 1, name: "Orchestration Control", start: 1, end: 5, focus: "DAGs, windows, configuration, retries, and backfills", summary: "Repair a failed workflow while preserving dependency and time-window correctness." },
    { id: 2, name: "Lake Storage Yard", start: 6, end: 10, focus: "Object storage, columnar files, partitions, and compaction", summary: "Organize an efficient data lake and prove that pruning and file sizing work." },
    { id: 3, name: "Distributed Compute Lab", start: 11, end: 15, focus: "Execution, shuffles, joins, and skew", summary: "Use execution evidence to diagnose and repair a slow distributed transformation." },
    { id: 4, name: "Incremental Reliability Hub", start: 16, end: 21, focus: "Watermarks, CDC, contracts, lineage, and cost", summary: "Operate an incremental analytics platform with trustworthy data and bounded spend." },
  ],
  expert: [
    { id: 1, name: "Streaming Exchange", start: 1, end: 5, focus: "Events, partitions, consumers, time, and replay", summary: "Recover an event stream without losing ordering, duplicates, or late records." },
    { id: 2, name: "Lakehouse Core", start: 6, end: 10, focus: "Transactional tables, compatibility, metadata, and layout", summary: "Design a reliable lakehouse table across writes, evolution, compaction, and reads." },
    { id: 3, name: "Trust Governance Center", start: 11, end: 15, focus: "PII, access, ownership, lineage, and quality", summary: "Investigate a data-trust incident and connect policy to technical enforcement." },
    { id: 4, name: "Platform Command", start: 16, end: 21, focus: "Tenancy, self-service, SLOs, recovery, and capacity", summary: "Design and defend a governed real-time data platform for many teams." },
  ],
};

export const isDataPaceId = (value: string): value is DataPaceId => value === "beginner" || value === "intermediate" || value === "expert";
export const getDataPath = (paceId: DataPaceId) => DATA_PATHS.find((path) => path.id === paceId) ?? DATA_PATHS[0];
export const getDataWorlds = (paceId: DataPaceId) => DATA_WORLDS_BY_PACE[paceId];
export const isDataWorldProject = (paceId: DataPaceId, lessonId: number) => getDataWorlds(paceId).some((world) => world.end === lessonId);
export const dataProgressKey = (paceId: DataPaceId) => "data-" + paceId;
