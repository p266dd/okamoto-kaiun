import Image from "next/image";
import Link from "next/link";
import CompanyLogo from "@/assets/company_logo.png";
import HeaderArch from "@/assets/header-arch.png";

// Shadcn
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default async function Header() {
  return (
    <div className="relative z-40">
      <header className="py-10 bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-8 flex gap-10 items-center justify-between">
          <div className="w-52 sm:max-w-[250px]">
            <Image src={CompanyLogo} alt="Okamoto Kaiun" />
          </div>
          <div>
            <NavigationMenu className="hidden sm:flex">
              <NavigationMenuList className="gap-4">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="#">Schedule</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="#">Manage Staff</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="#">Manage Ship</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="#">Calculate Payroll</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger>Open</SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription className="sr-only">Navigation</SheetDescription>
                  </SheetHeader>
                  <ul className="flex flex-col gap-4 mx-4">
                    <li>
                      <Link href="#">Schedule</Link>
                    </li>
                    <li>
                      <Link href="#">Manage Staff</Link>
                    </li>
                    <li>
                      <Link href="#">Manage Ship</Link>
                    </li>
                    <li>
                      <Link href="#">Calculate Payroll</Link>
                    </li>
                  </ul>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className="mb-12 sm:mb-16">
        <Image src={HeaderArch} alt="Header Arch" className="h-10" />
      </div>
    </div>
  );
}
