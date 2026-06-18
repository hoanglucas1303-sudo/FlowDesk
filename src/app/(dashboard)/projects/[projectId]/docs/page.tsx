import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UI } from "@/lib/constants";

interface DocsPageProps {
  params: Promise<{ projectId: string }>;
}

interface PageNode {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
  isPinned: boolean;
  children?: PageNode[];
}

function buildTree(pages: PageNode[]): PageNode[] {
  const map = new Map<string, PageNode>();
  const roots: PageNode[] = [];

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;

  const pages = await prisma.page.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      icon: true,
      parentId: true,
      isPinned: true,
    },
  });

  const tree = buildTree(pages as PageNode[]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          📄 {UI.documents}
        </h2>
        <CreatePageButton projectId={projectId} />
      </div>

      {tree.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📄</p>
          <p>{UI.empty}</p>
          <p className="text-sm mt-1">Tạo trang đầu tiên cho dự án</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-xl divide-y divide-border">
          {tree.map((page) => (
            <PageTreeItem
              key={page.id}
              page={page}
              projectId={projectId}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PageTreeItem({
  page,
  projectId,
  depth,
}: {
  page: PageNode;
  projectId: string;
  depth: number;
}) {
  return (
    <>
      <Link
        href={`/projects/${projectId}/docs/${page.id}`}
        className="flex items-center gap-2 px-4 py-3 hover:bg-bg-elevated transition-colors"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        <span className="text-base">{page.icon}</span>
        <span className="text-sm text-text-primary flex-1">
          {page.title}
        </span>
        {page.isPinned && (
          <span className="text-xs text-amber-500" title="Đã ghim">
            📌
          </span>
        )}
      </Link>
      {page.children &&
        page.children.map((child) => (
          <PageTreeItem
            key={child.id}
            page={child}
            projectId={projectId}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

function CreatePageButton({ projectId }: { projectId: string }) {
  async function createPage() {
    "use server";
    const session = await getSession();
    if (!session) return;

    const maxSort = await prisma.page.aggregate({
      where: { projectId, parentId: null },
      _max: { sortOrder: true },
    });

    const page = await prisma.page.create({
      data: {
        title: "Trang mới",
        projectId,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    const { redirect: doRedirect } = await import("next/navigation");
    doRedirect(`/projects/${projectId}/docs/${page.id}`);
  }

  return (
    <form action={createPage}>
      <button
        type="submit"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        + {UI.newPage}
      </button>
    </form>
  );
}
