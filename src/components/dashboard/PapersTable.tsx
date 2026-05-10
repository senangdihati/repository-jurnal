"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

import { deletePaperAction, updatePaperAction } from "@/app/actions/papers";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type MyPaperRow = {
  id: string;
  title: string;
  paper_author?: string | null;
  /** Shown in table: `paper_author` or uploader profile name */
  listing_author?: string;
  abstract: string | null;
  file_url: string;
  created_at: string;
  status?: string | null;
  keywords?: string | null;
  doi?: string | null;
  view_count?: number | null;
  download_count?: number | null;
};

export function PapersTable({ papers }: { papers: MyPaperRow[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-hidden rounded-xl border border-forest/15 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-sage-muted/50 hover:bg-sage-muted/50">
              <TableHead className="text-foreground">Title</TableHead>
              <TableHead className="max-w-[200px] text-foreground">Author</TableHead>
              <TableHead className="w-[120px] text-foreground">Status</TableHead>
              <TableHead className="w-[160px] text-foreground">Date</TableHead>
              <TableHead className="w-[140px] text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papers.map((paper) => {
              const status = paper.status === "draft" ? "draft" : "published";
              return (
                <TableRow key={paper.id} className="hover:bg-sage-muted/25">
                  <TableCell className="max-w-[320px]">
                    <p className="truncate font-medium text-foreground">{paper.title}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={status === "published" ? "default" : "secondary"}
                      className={cn(
                        status === "published" &&
                          "border border-forest/25 bg-sage-muted text-forest",
                      )}
                    >
                      {status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(paper.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <a
                        href={paper.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-sm" }),
                          "text-muted-foreground hover:text-forest",
                        )}
                        aria-label="Open PDF"
                      >
                        <ExternalLink className="size-4" />
                      </a>

                      <Dialog
                        open={activeId === paper.id}
                        onOpenChange={(open) => setActiveId(open ? paper.id : null)}
                      >
                        <DialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-forest"
                              aria-label="Edit paper"
                            />
                          }
                        >
                          <Pencil className="size-4" aria-hidden />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit paper</DialogTitle>
                            <DialogDescription>Perbarui metadata publikasi.</DialogDescription>
                          </DialogHeader>

                          <form
                            action={(formData) => {
                              setError(null);
                              startTransition(async () => {
                                const res = await updatePaperAction(formData);
                                if (!res.ok) setError(res.error);
                                else setActiveId(null);
                              });
                            }}
                            className="space-y-4"
                          >
                            <input type="hidden" name="id" value={paper.id} />
                            <div className="space-y-2">
                              <Label htmlFor={`title-${paper.id}`}>Title</Label>
                              <Input
                                id={`title-${paper.id}`}
                                name="title"
                                defaultValue={paper.title}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`paper_author-${paper.id}`}>Author</Label>
                              <Input
                                id={`paper_author-${paper.id}`}
                                name="paper_author"
                                defaultValue={paper.paper_author ?? ""}
                                placeholder="Nama penulis di publikasi"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`abstract-${paper.id}`}>Abstract</Label>
                              <Textarea
                                id={`abstract-${paper.id}`}
                                name="abstract"
                                rows={5}
                                defaultValue={paper.abstract ?? ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`keywords-${paper.id}`}>Keywords</Label>
                              <Input
                                id={`keywords-${paper.id}`}
                                name="keywords"
                                defaultValue={paper.keywords ?? ""}
                                placeholder="kata1; kata2"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`doi-${paper.id}`}>DOI</Label>
                              <Input id={`doi-${paper.id}`} name="doi" defaultValue={paper.doi ?? ""} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`status-${paper.id}`}>Status</Label>
                              <select
                                id={`status-${paper.id}`}
                                name="status"
                                defaultValue={status}
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                              </select>
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-forest font-semibold text-primary-foreground hover:bg-forest-hover"
                              disabled={isPending}
                            >
                              {isPending ? "Saving..." : "Save changes"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <form
                        action={(formData) => {
                          setError(null);
                          startTransition(async () => {
                            const res = await deletePaperAction(formData);
                            if (!res.ok) setError(res.error);
                          });
                        }}
                        className="inline"
                      >
                        <input type="hidden" name="id" value={paper.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          disabled={isPending}
                          aria-label="Delete paper"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {papers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada paper. Gunakan tombol upload untuk menambahkan.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
