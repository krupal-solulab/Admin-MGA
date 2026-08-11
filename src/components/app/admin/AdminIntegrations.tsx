import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Nango from "@nangohq/frontend";
import { toast } from "sonner";

import { PageHeader } from "../AppShell";
import { StatusDot } from "./primitives";
import {
  confirmConnection,
  createConnectSession,
  disconnectIntegration,
  listConnections,
} from "@/lib/api/admin";
import { CONNECTORS } from "@/lib/admin-settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ConnectorId = (typeof CONNECTORS)[number]["id"];

export function AdminIntegrations() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "connections"], queryFn: listConnections });
  const [disconnecting, setDisconnecting] = useState<ConnectorId | null>(null);

  // Real Nango Connect UI popup — same flow already live in
  // IndustryAI-Insaurance-ES-Brokers and Admin-ES-Brokers.
  const connectMutation = useMutation({
    mutationFn: async (provider: ConnectorId) => {
      const session = await createConnectSession(provider);
      await new Promise<void>((resolve, reject) => {
        const nango = new Nango({});
        const connectUI = nango.openConnectUI({
          sessionToken: session.session_token,
          onEvent: (event) => {
            if (event.type === "connect") {
              confirmConnection(event.payload.providerConfigKey, event.payload.connectionId)
                .then(() => resolve())
                .catch((err: unknown) =>
                  reject(err instanceof Error ? err : new Error("Failed to save connection")),
                );
            } else if (event.type === "close") {
              resolve();
            } else if (event.type === "error") {
              reject(new Error(event.payload.errorMessage));
            }
          },
        });
        connectUI.open();
      });
    },
    onSuccess: async () => {
      toast.success("Connector connected for this tenant.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "connections"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Connect failed"),
  });

  const disconnectMutation = useMutation({
    mutationFn: (provider: ConnectorId) => disconnectIntegration(provider),
    onSuccess: async () => {
      toast.success("Connector disconnected. Workflows using it will fail loudly.");
      setDisconnecting(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "connections"] });
    },
    onError: (error) => {
      setDisconnecting(null);
      toast.error(error instanceof Error ? error.message : "Disconnect failed");
    },
  });

  const byProvider = new Map((query.data ?? []).map((row) => [row.provider, row]));

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Tenant-scoped connector inventory. Connecting opens the real Google OAuth popup; disconnecting is confirm-gated."
      />

      {query.isPending ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading connectors…
          </CardContent>
        </Card>
      ) : null}
      {query.isError ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-destructive">
              {query.error instanceof Error ? query.error.message : "Failed to load connectors."}
            </p>
            <Button size="sm" variant="outline" onClick={() => query.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {query.data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {CONNECTORS.map((connector) => {
            const row = byProvider.get(connector.id);
            const connected = row?.status === "connected";
            return (
              <Card key={connector.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-sm font-semibold">{connector.label}</h2>
                      <p className="text-xs text-muted-foreground">{connector.description}</p>
                    </div>
                    <StatusDot status={connected ? "connected" : "disconnected"} />
                  </div>

                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisconnecting(connector.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => connectMutation.mutate(connector.id)}
                      disabled={connectMutation.isPending}
                    >
                      {connectMutation.isPending ? "Connecting…" : `Connect ${connector.label}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(disconnecting)}
        onOpenChange={(open) => {
          if (!open) setDisconnecting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect this connector?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Every workflow step that reads{" "}
                  <span className="font-mono font-semibold text-foreground">{disconnecting}</span>{" "}
                  will stop working for this tenant until it is reconnected.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={disconnectMutation.isPending}
              onClick={() => disconnecting && disconnectMutation.mutate(disconnecting)}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
