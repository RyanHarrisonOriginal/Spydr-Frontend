# Ontology use case (Spydr)

This document describes the product purpose, user flows, and mapping to screens and domain components for the ontology (Spydr) feature.

## Product purpose

**Spydr — Structured Thinking Engine:** A note-taking and organization app where users define **hierarchical ontologies** and create **nodes** that follow type rules (parent/child, lifecycle). Users organize thoughts, ideas, and projects in a tree/graph and can attach rich notes (document editor) to nodes.

## Main entities

- **Ontology:** A named container (id, name, description, createdAt, updatedAt) that holds nodes and custom node types.
- **OntologyNode:** A node in the tree (id, type, title, parentId, fields, notes, lifecycleState, position, isExpanded, etc.). Tree relationship is via `parentId`; edges in the UI are derived from parent-child.
- **NodeSchema (built-in):** Fixed types (e.g. thought, idea, project, article, article-section, paragraph, question) with label, allowedParents, allowedChildren, lifecycleStates. Not stored per ontology; served from config or API.
- **CustomNodeType:** User-defined types per ontology (id, label, color, allowedParents, allowedChildren, lifecycleStates).

## User flows

1. **Dashboard** (`/`): List all ontologies; create new; edit or delete existing; open one by id → navigate to `/ontology/:ontologyId`.
2. **Ontology canvas** (`/ontology/:ontologyId`): View tree/graph of nodes (React Flow); add, move, merge, delete nodes; expand/collapse; open document editor for a node’s notes (TipTap). Optional directory tree and command bar.

## Mapping to screens and domain components

| Flow / area        | Screen                         | Domain components (in `domain/ontology/components/`) |
|--------------------|--------------------------------|------------------------------------------------------|
| Dashboard           | `OntologyDashboardScreen`      | OntologyListHeader, OntologyCard, OntologyEmptyState, create/edit/delete dialogs |
| Canvas              | `OntologyCanvasScreen`         | OntologyFlowCanvas, OntologyNode, OntologyEdge, NodeDocumentEditor, NodeTypeSelector, CustomNodeTypeModal, DirectoryTree, CommandBar, CanvasNavigator |

Data and mutations are provided by `useOntologyApi()` (queries and mutations); screens own route state and pass data/callbacks to domain components. Display and state are kept separate per [screens-and-components-guidelines.md](screens-and-components-guidelines.md).
