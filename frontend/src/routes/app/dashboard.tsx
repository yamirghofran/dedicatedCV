import { createFileRoute, Link } from "@tanstack/react-router";
import { useCVs, useCreateCV, useDeleteCV } from "@/hooks/use-cvs";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CV } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: cvs, isLoading, isError } = useCVs();
  const { mutate: deleteCV } = useDeleteCV();
  const { mutate: createCV, isPending: isDuplicating } = useCreateCV();
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteCV(id);
    }
  };

  const handleDuplicate = (cv: CV) => {
    createCV(
      {
        title: `${cv.title} (Copy)`,
        full_name: cv.full_name,
        email: cv.email,
        phone: cv.phone ?? "",
        location: cv.location ?? "",
        summary: cv.summary ?? "",
      },
      {
        onSuccess: () => {
          setMessage(`Duplicated "${cv.title}"`);
          setTimeout(() => setMessage(null), 2500);
        },
        onError: () => {
          setMessage("Could not duplicate CV");
          setTimeout(() => setMessage(null), 2500);
        },
      },
    );
  };

  const emptyState = useMemo(() => {
    if (isError) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-destructive">
            Unable to load CVs. Please retry.
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-muted rounded-full mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No CVs yet</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-sm">
            Create your first professional resume to get started. It only takes
            a few minutes!
          </p>
          <Link to="/app/cvs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First CV
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }, [isError]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            {user?.full_name || user?.email?.split("@")[0] || "there"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional resumes
          </p>
        </div>
        <Link to="/app/cvs/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create New CV
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your CVs</h2>
          {message && (
            <span className="text-sm text-muted-foreground">{message}</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cvs && cvs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv) => (
              <Card key={cv.id} className="transition-none">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{cv.title}</CardTitle>
                        <CardDescription className="truncate">
                          {cv.full_name}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link
                            to="/app/cvs/$id/preview"
                            params={{ id: cv.id.toString() }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(cv)}
                          disabled={isDuplicating}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 " />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            to="/app/cvs/$id/edit"
                            params={{ id: cv.id.toString() }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(cv.id, cv.title)}
                          className="text-destructive cursor-pointer hover:!text-destructive"
                        >
                          <Trash2 className="h-4 w-4 text-destructive " />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="truncate">{cv.email}</p>
                    {cv.summary && (
                      <p className="line-clamp-2 text-xs">{cv.summary}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link
                    to="/app/cvs/$id/edit"
                    params={{ id: cv.id.toString() }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full bg-[#fafafa] border-zinc-200"
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link
                    to="/app/cvs/$id/preview"
                    params={{ id: cv.id.toString() }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full bg-[#fafafa] border-zinc-200"
                    >
                      Preview
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>
    </div>
  );
}
