import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "../AppShell";
import { SourceBadge, formatDateTime } from "./primitives";
import { patchSettings } from "@/lib/admin-api";
import { settingsQuery } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const mutation = useMutation({
    mutationFn: (updates: Record<string, string>) => patchSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Setting saved as tenant override");
      setEditing(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <PageHeader
        title="Platform settings"
        description="Tunables resolve from environment defaults unless a tenant override exists. Saving a value creates an override."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setting</TableHead>
                <TableHead className="w-[190px]">Value</TableHead>
                <TableHead className="w-[110px]">Source</TableHead>
                <TableHead className="w-[210px] text-right">Last change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((setting) => {
                const isEditing = editing === setting.key;
                return (
                  <TableRow key={setting.key}>
                    <TableCell>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">
                        {setting.key}
                      </p>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className="h-9 font-mono"
                            aria-label={`Value for ${setting.key}`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Save"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ [setting.key]: draft })}
                          >
                            <Check className="size-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Cancel"
                            onClick={() => setEditing(null)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-md px-2 py-1 font-mono text-sm transition-colors hover:bg-muted"
                          onClick={() => {
                            setEditing(setting.key);
                            setDraft(setting.value);
                          }}
                        >
                          {setting.value}
                          <Pencil className="size-3.5 text-muted-foreground" aria-hidden />
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <SourceBadge source={setting.source} />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {setting.updatedAt ? (
                        <>
                          {formatDateTime(setting.updatedAt)}
                          <br />
                          {setting.updatedBy}
                        </>
                      ) : (
                        "Environment default"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
