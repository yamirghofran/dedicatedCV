import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Home,
  LogOut,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/animate-ui/components/radix/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../components/animate-ui/components/radix/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/animate-ui/primitives/radix/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import { useCurrentUser, useLogout } from "../hooks/use-auth";
import { useIsMobile } from "../hooks/use-mobile";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface MyRouterContext {
  queryClient: QueryClient;
}

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  params?: Record<string, string>;
  items?: NavItem[];
};

const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: Home,
  },
  {
    title: "CVs",
    url: "/app/cvs/",
    icon: FileText,
    isActive: true,
    items: [
      {
        title: "All CVs",
        url: "/app/cvs/",
      },
      {
        title: "Create New",
        url: "/app/cvs/new",
      },
    ],
  },
  {
    title: "Help",
    url: "/app/help/",
    icon: Sparkles,
    items: [
      {
        title: "Getting Started",
        url: "/app/help/getting-started",
      },
      {
        title: "FAQ",
        url: "/app/help/faq",
      },
    ],
  },
];

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email || "";
  const parts = source
    .replace(/[^a-zA-Z0-9@ ]/g, "")
    .split(/[\s@]+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const isMobile = useIsMobile();
  const routerState = useRouterState();
  const { mutate: logout } = useLogout();
  const { data: currentUser } = useCurrentUser();

  // Check if we're on an auth page (login/register)
  const isAuthPage = routerState.location.pathname.startsWith("/auth");

  // If no current user, we should not be showing anything
  // The route protection should have already redirected to login
  const displayName = currentUser?.full_name || currentUser?.email?.split("@")[0] || "";
  const displayEmail = currentUser?.email || "";
  const initials = currentUser ? getInitials(displayName, displayEmail) : "";

  const breadcrumbMap: Record<string, string> = {
    "/": "Home",
    "/app": "App",
    "/app/dashboard": "Dashboard",
    "/app/cvs/": "My CVs",
    "/app/cvs/new": "Create CV",
    "/app/cvs/$id/edit": "Edit CV",
    "/app/cvs/$id/preview": "Preview",
    "/app/cvs/$id/export": "Export",
    "/app/account/profile": "Profile",
    "/app/help/": "Help",
    "/app/help/getting-started": "Getting Started",
    "/app/help/faq": "FAQ",
  };

  const breadcrumbs = (() => {
    const crumbs: Array<{ label: string; to: string; isLast?: boolean }> = [];
    const cvTitleFromState = (routerState.location.state as any)?.cvTitle;

    routerState.matches
      ?.filter((match) => match.routeId !== "__root__")
      .forEach((match) => {
        const id =
          (match as { routeId?: string; id?: string }).routeId ??
          (match as { id?: string }).id ??
          "";
        const params =
          (match as { params?: Record<string, string> }).params ?? {};
        const to =
          (match as { pathname?: string }).pathname ??
          routerState.location.pathname;

        const isCvChild = params.id && id.includes("/cvs/$id/");

        if (isCvChild) {
          const cvLabel = cvTitleFromState || `CV ${params.id}`;
          crumbs.push({ label: cvLabel, to: `/app/cvs/${params.id}/edit` });
        }

        const label =
          breadcrumbMap[id] ||
          (isCvChild ? cvTitleFromState || `CV ${params.id}` : "Page");

        crumbs.push({ label, to });
      });

    return crumbs.map((crumb, idx) => ({
      ...crumb,
      isLast: idx === crumbs.length - 1,
    }));
  })();

  const handleLogout = () => {
    logout();
  };

  // If on auth page, just show the content without sidebar
  if (isAuthPage) {
    return (
      <>
        <Outlet />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      </>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground"></div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">DedicatedCV</span>
                    <span className="truncate text-xs">
                      Professional Resumes
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navMain.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link to={subItem.url} params={subItem.params}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link to={item.url} params={item.params}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt={displayName} />
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {displayName}
                      </span>
                      <span className="truncate text-xs">{displayEmail}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback className="rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {displayName}
                        </span>
                        <span className="truncate text-xs">{displayEmail}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Link to="/app/account/profile">
                        <span className="flex items-center gap-2">
                          <span>Account</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.to}>
                    <BreadcrumbItem
                      className={idx === 0 ? "hidden md:block" : undefined}
                    >
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.to}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && (
                      <BreadcrumbSeparator
                        className={idx === 0 ? "hidden md:block" : undefined}
                      />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>

      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </SidebarProvider>
  );
}
