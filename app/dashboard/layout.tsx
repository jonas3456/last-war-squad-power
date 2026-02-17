import { signOut } from "@/lib/actions/auth";
import { getAuthContext } from "@/lib/queries/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ChangePasswordDialog } from "@/components/dashboard/change-password-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, Menu, Shield } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  const allianceName = auth?.allianceName ?? "My Alliance";

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-5 w-5" />
          <span className="font-semibold truncate">{allianceName}</span>
        </div>
        <div className="p-4">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {allianceName}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold md:hidden">{allianceName}</span>
          </div>
          <div className="flex items-center gap-2">
            <ChangePasswordDialog />
            <ThemeToggle />
            <form action={signOut}>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
