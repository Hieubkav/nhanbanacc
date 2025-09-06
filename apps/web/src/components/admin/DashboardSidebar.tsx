"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserCircle2,
  Tags,
  Boxes,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  SlidersHorizontal,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  Star as StarIcon,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const coreNav = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
] as const;

const resourceNav = [
  { href: "/dashboard/resources/users", label: "Người dùng", icon: Users },
  { href: "/dashboard/resources/customers", label: "Khách hàng", icon: UserCircle2 },
  { href: "/dashboard/resources/categories", label: "Danh mục", icon: Tags },
  { href: "/dashboard/resources/products", label: "Sản phẩm", icon: Boxes },
  { href: "/dashboard/resources/service_websites", label: "Dịch vụ website", icon: Boxes },
  { href: "/dashboard/resources/images", label: "Ảnh", icon: ImageIcon },
  { href: "/dashboard/resources/posts", label: "Bài viết", icon: FileText },
  { href: "/dashboard/resources/faqs", label: "FAQ", icon: HelpCircle },
  { href: "/dashboard/resources/sliders", label: "Slider", icon: SlidersHorizontal },
  { href: "/dashboard/resources/reviews", label: "Đánh giá", icon: StarIcon },
  { href: "/dashboard/resources/settings", label: "Cấu hình", icon: SettingsIcon },
] as const;

type NavItem = (typeof coreNav)[number] | (typeof resourceNav)[number];

export default function DashboardSidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} h-svh md:sticky md:top-0 shrink-0 border-r bg-sidebar text-sidebar-foreground`}
      aria-label="Sidebar"
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 p-3`}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            NB
          </div>
          {!collapsed && <span className="text-sm font-semibold">NhanBanACC</span>}
        </Link>
        {!collapsed ? (
          <Button size="icon" variant="ghost" onClick={onToggle} aria-label="Thu gọn sidebar">
            <ChevronsLeft className="size-4" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" onClick={onToggle} aria-label="Mở rộng sidebar">
            <ChevronsRight className="size-4" />
          </Button>
        )}
      </div>
      {!collapsed && (
        <div className="px-3 text-xs uppercase tracking-wide text-muted-foreground">Menu</div>
      )}
      <nav className="space-y-1 px-2">
        {coreNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>
      {!collapsed && (
        <div className="mt-4 px-3 text-xs uppercase tracking-wide text-muted-foreground">
          Quản trị
        </div>
      )}
      <nav className="space-y-1 px-2 pb-4">
        {resourceNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname?.startsWith(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active?: boolean;
  collapsed?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      className={`w-full ${collapsed ? "justify-center" : "justify-start"}`}
    >
      <Link
        href={item.href}
        className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}
        title={item.label}
        aria-label={item.label}
      >
        {Icon ? <Icon className="size-4" /> : null}
        {!collapsed && <span>{item.label}</span>}
      </Link>
    </Button>
  );
}

