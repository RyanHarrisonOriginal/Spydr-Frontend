import { Link } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { useOntologyCanvas } from "@/domain/ontology/hooks/useOntologyCanvas";
import {
  OntologyFlowCanvasView,
  CommandBar,
  CanvasNavigator,
  NodeDocumentEditor,
} from "@/domain/ontology/components";
import { OntologyFlowProvider } from "@/domain/ontology/context/OntologyFlowContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthControls } from "@/components/AuthControls";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function OntologyCanvasScreen() {
  const {
    ontologyId,
    ontology,
    flowContextValue,
    editingNodeId,
    setEditingNodeId,
    editingNode,
    onSaveNotes,
    isLoading,
    isError,
  } = useOntologyCanvas();

  if (isLoading || !ontologyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError || !ontology) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load ontology.</p>
        <Button asChild variant="link">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 border-b border-border/40 flex items-center justify-between px-6 md:px-8 bg-card/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/">← Dashboard</Link>
          </Button>
          <div className="h-4 w-px bg-border/60" />
          <h1 className="text-lg font-semibold truncate max-w-[240px] tracking-tight">
            {ontology.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AuthControls />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <ReactFlowProvider>
          <OntologyFlowProvider value={flowContextValue}>
            {/* Panel order: 1st = Navigator (left), 2nd = Main (canvas). Use STRING sizes for % (library treats numbers as pixels). */}
            <ResizablePanelGroup
              orientation="horizontal"
              className="flex-1 min-h-0"
            >
              <ResizablePanel
                id="navigator-panel"
                defaultSize="15"
                minSize="10"
                maxSize="50"
                className="flex flex-col overflow-hidden"
              >
                <div className="p-2 flex-1 min-h-0 overflow-auto">
                  <CanvasNavigator />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel id="main-content-panel" defaultSize="85" minSize="50" className="min-w-0">
                {editingNodeId ? (
                  <ResizablePanelGroup
                    orientation="horizontal"
                    className="h-full min-h-0"
                  >
                    <ResizablePanel defaultSize="85" minSize="50">
                      <div className="h-full w-full relative min-w-0">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                          <CommandBar />
                        </div>
                        <OntologyFlowCanvasView />
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="15" minSize="10" maxSize="50" className="min-w-0">
                      <NodeDocumentEditor
                        node={editingNode}
                        onClose={() => setEditingNodeId(null)}
                        onSaveNotes={onSaveNotes}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ) : (
                  <div className="h-full w-full relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                      <CommandBar />
                    </div>
                    <OntologyFlowCanvasView />
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </OntologyFlowProvider>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
