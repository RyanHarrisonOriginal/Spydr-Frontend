# Ontology API contract (frontend expectations)

This document lists the endpoints and payloads the frontend expects from the backend. Align with the backend `api.md`; update this stub when the backend API is fixed.

## Base

- Assume a REST API with JSON request/response bodies. Base URL TBD (e.g. `/api` or env `VITE_API_URL`).

## Ontologies

- `GET /ontologies` → `200` body: list of `{ id, name, description, createdAt, updatedAt }`.
- `POST /ontologies` body: `{ name, description? }` → `201` body: created ontology (with id, timestamps).
- `GET /ontologies/:id` → `200` body: ontology + `nodes` (record or array) + `customNodeTypes` (record or array). Or separate endpoints for nodes/custom-types.
- `PATCH /ontologies/:id` body: `{ name?, description? }` → `200` body: updated ontology.
- `DELETE /ontologies/:id` → `204` or `200`.

## Nodes

- `GET /ontologies/:ontologyId/nodes` → `200` body: array of nodes (flat or tree shape TBD). Node shape: `{ id, type, title, parentId, fields, notes, lifecycleState, createdAt, position: { x, y } or positionX/positionY, isExpanded }`.
- `POST /ontologies/:ontologyId/nodes` body: `{ type, parentId?, title?, position? }` → `201` body: created node.
- `PATCH /ontologies/:ontologyId/nodes/:nodeId` body: partial node (e.g. title, notes, position, isExpanded, lifecycleState) → `200` body: updated node.
- `DELETE /ontologies/:ontologyId/nodes/:nodeId` → `204` or `200`.
- `POST /ontologies/:ontologyId/nodes/:nodeId/move` body: `{ newParentId: string | null }` → `200` body: updated node or list.
- `POST /ontologies/:ontologyId/nodes/merge` body: `{ sourceId, targetId }` → `200` body: result (merged node or updated tree).

## Custom node types

- `GET /ontologies/:ontologyId/custom-types` → `200` body: array or record of custom node types.
- `POST /ontologies/:ontologyId/custom-types` body: `{ label, color, allowedParents, allowedChildren, lifecycleStates }` → `201` body: created custom type (with id).
- `PATCH /ontologies/:ontologyId/custom-types/:id` body: partial custom type → `200` body: updated type.
- `DELETE /ontologies/:ontologyId/custom-types/:id` → `204` or `200`.

## Node schemas (built-in)

- `GET /node-schemas` → `200` body: list of built-in types with `type`, `label`, `allowedParents`, `allowedChildren`, `lifecycleStates`. Read-only.

## Errors

- `4xx` / `5xx`: JSON body with `message` or `error` (and optional `code`). Frontend will surface these in toasts or inline.
