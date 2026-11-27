"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Moon, 
  Sun, 
  Laptop, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  LayoutDashboard 
} from "lucide-react"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/base/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Avatar from "@radix-ui/react-avatar"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { QRScannerModal } from "@/components/shared/qr-scanner-modal"
import { ScanLine } from "lucide-react"

export interface NavbarUser {
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
  role?: string | null
}

export interface NavbarProps {
  user?: NavbarUser | null
  pendingConsultationsCount?: number
  activeRole?: string | null
  staffTitle?: string | null
}

export function Navbar({ 
  user: propsUser, 
  pendingConsultationsCount,
  activeRole,
  staffTitle 
}: NavbarProps = {}) {
  const { setTheme } = useTheme()
  const { data: authSession } = authClient.useSession()
  const router = useRouter()
  const pathname = usePathname() || ""

  const [avatarOverride, setAvatarOverride] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setAvatarOverride(customEvent.detail)
      }
    }
    window.addEventListener("avatar-updated", handleAvatarUpdate)
    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate)
    }
  }, [])

  const activeUser = authSession?.user || propsUser

  const getIdentifier = (user: NavbarUser) => {
    if (!user.username) return user.email || "";
    const isDigits = /^\d+$/.test(user.username);
    if (!isDigits) return user.username;

    const role = user.role || "";
    const isStaffOrLecturer = role.includes("lecturer") || role.includes("dosen") || role.includes("staff") || user.username.length >= 15;
    const label = isStaffOrLecturer ? "NIP" : "NIM";
    return `${label}. ${user.username}`;
  };

  const getProfileHref = (user?: NavbarUser | null) => {
    if (!user || !user.username) return "/login";
    const role = user.role || "";
    if (role.includes("student")) return `/mahasiswa/${user.username}`;
    if (role.includes("lecturer") || role.includes("dosen")) return `/dosen/${user.username}`;
    if (role.includes("staff")) return `/staff/${user.username}`;
    if (/^\d{9,12}$/.test(user.username)) return `/mahasiswa/${user.username}`;
    return `/dosen/${user.username}`;
  };

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mobileKegiatanOpen, setMobileKegiatanOpen] = React.useState(false)
  const [mobileStakeholderOpen, setMobileStakeholderOpen] = React.useState(false)
  const [isScannerOpen, setIsScannerOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false)
  const [kegiatanMenuOpen, setKegiatanMenuOpen] = React.useState(false)
  const [stakeholderMenuOpen, setStakeholderMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setProfileMenuOpen(false)
    setKegiatanMenuOpen(false)
    setStakeholderMenuOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        },
      },
    })
  }

  // Active state helpers
  const isKegiatanActive =
    pathname.startsWith("/konsultasi") ||
    pathname.startsWith("/seminar-proposal") ||
    pathname.startsWith("/seminar-hasil") ||
    pathname.startsWith("/sidang-skripsi")

  const isStakeholderActive =
    pathname.startsWith("/mahasiswa") ||
    pathname.startsWith("/dosen") ||
    pathname.startsWith("/staff")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-all">
      <nav className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6 max-w-7xl">
        {/* Brand Logo & Name -> "/" */}
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-85 shrink-0"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Image
              src="/unmul-small.png"
              alt="UNMUL Logo"
              width={34}
              height={34}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-sm"
            />
            <Image
              src="/pendikom_logo.png"
              alt="Pendikom Logo"
              width={34}
              height={34}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="font-heading font-bold text-base sm:text-xl tracking-tight text-foreground">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">SIMTA</span> Pendikom
          </h1>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          <Link
            href="/dashboard"
            className={`relative py-2 text-sm font-semibold transition-colors hover:text-primary ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span>Dashboard</span>
            {pathname === "/dashboard" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          
          <Link
            href="/skripsi"
            className={`relative py-2 text-sm font-semibold transition-colors hover:text-primary ${
              pathname.startsWith("/skripsi") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span>Skripsi</span>
            {pathname.startsWith("/skripsi") && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>


          {/* Kegiatan Dropdown */}
          <DropdownMenu.Root open={kegiatanMenuOpen} onOpenChange={setKegiatanMenuOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                className={`group relative flex items-center gap-1 py-2 text-sm font-semibold outline-none transition-colors hover:text-primary ${
                  isKegiatanActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span>Kegiatan</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                {isKegiatanActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="start"
              sideOffset={8}
              className="z-50 min-w-[13rem] overflow-hidden rounded-2xl border bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95"
            >
              <DropdownMenu.Item asChild>
                <Link 
                  href="/konsultasi" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setKegiatanMenuOpen(false)}
                >
                  <span>Konsultasi</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/seminar-proposal" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setKegiatanMenuOpen(false)}
                >
                  <span>Seminar Proposal</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/seminar-hasil" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setKegiatanMenuOpen(false)}
                >
                  <span>Seminar Hasil</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/sidang-skripsi" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setKegiatanMenuOpen(false)}
                >
                  <span>Sidang Skripsi</span>
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <Link
            href="/kalender"
            className={`relative py-2 text-sm font-semibold transition-colors hover:text-primary ${
              pathname.startsWith("/kalender") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span>Kalender</span>
            {pathname.startsWith("/kalender") && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          {/* Stakeholder Dropdown */}
          <DropdownMenu.Root open={stakeholderMenuOpen} onOpenChange={setStakeholderMenuOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                className={`group relative flex items-center gap-1 py-2 text-sm font-semibold outline-none transition-colors hover:text-primary ${
                  isStakeholderActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span>Stakeholder</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                {isStakeholderActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="start"
              sideOffset={8}
              className="z-50 min-w-[12rem] overflow-hidden rounded-2xl border bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95"
            >
              <DropdownMenu.Item asChild>
                <Link 
                  href="/mahasiswa" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setStakeholderMenuOpen(false)}
                >
                  <span>Mahasiswa</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/dosen" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setStakeholderMenuOpen(false)}
                >
                  <span>Dosen</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/staff" 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  onClick={() => setStakeholderMenuOpen(false)}
                >
                  <span>Staff</span>
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>


          <Link
            href="/tentang"
            className={`relative py-2 text-sm font-semibold transition-colors hover:text-primary ${
              pathname.startsWith("/tentang") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span>Tentang</span>
            {pathname.startsWith("/tentang") && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Theme Switcher */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted/50">
                <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="end"
              className="z-50 min-w-[8rem] overflow-hidden rounded-2xl border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in zoom-in-95"
            >
              <DropdownMenu.Item
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary"
                onClick={() => setTheme("system")}
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* User Profile / Auth Button */}
          {activeUser ? (
            <DropdownMenu.Root open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all overflow-hidden p-0"
                >
                  <Avatar.Root className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary/10">
                    <Avatar.Image
                      src={avatarOverride || activeUser.image || ""}
                      alt={activeUser.name || "User avatar"}
                      className="aspect-square h-full w-full object-cover"
                    />
                    <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full text-xs font-semibold text-primary">
                      {activeUser.name?.charAt(0) || activeUser.username?.charAt(0) || <User className="h-4 w-4" />}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-[14rem] overflow-hidden rounded-2xl border bg-popover p-2 text-popover-foreground shadow-lg animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-start gap-3 p-2">
                  <div className="flex flex-col space-y-0.5 min-w-0">
                    <p className="text-sm font-heading font-semibold truncate">
                      {activeUser.name || activeUser.username}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {getIdentifier(activeUser)}
                    </p>
                  </div>
                </div>
                <DropdownMenu.Separator className="-mx-2 my-2 h-px bg-border" />
                <DropdownMenu.Item asChild>
                  <Link 
                    href="/dashboard" 
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link 
                    href={getProfileHref(activeUser)} 
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="-mx-2 my-2 h-px bg-border" />
                <DropdownMenu.Item 
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary"
                  onSelect={() => {
                    setProfileMenuOpen(false)
                    setIsScannerOpen(true)
                  }}
                >
                  <div className="flex w-full items-center">
                    <ScanLine className="mr-2 h-4 w-4" />
                    <span>Scan QR Code</span>
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="-mx-2 my-2 h-px bg-border" />
                <DropdownMenu.Item
                  className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus:bg-destructive/10 focus:text-destructive text-destructive"
                  onSelect={() => {
                    setProfileMenuOpen(false)
                    handleLogout()
                  }}
                >
                  <div className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex rounded-full px-5 text-sm h-9 font-medium shadow-sm transition-transform hover:scale-105"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Sheet / Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 border-b bg-background/95 backdrop-blur-xl shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-4 space-y-2 max-w-7xl">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                href="/skripsi"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  pathname.startsWith("/skripsi")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Skripsi
              </Link>


              {/* Kegiatan Mobile Collapsible */}
              <div className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileKegiatanOpen(!mobileKegiatanOpen)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isKegiatanActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span>Kegiatan</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      mobileKegiatanOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {(mobileKegiatanOpen || isKegiatanActive) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 pr-2 py-1 space-y-1 bg-muted/30 border-l-2 border-primary/20 ml-4 my-1 rounded-r-xl"
                    >
                      <Link
                        href="/konsultasi"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/konsultasi")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Konsultasi
                      </Link>
                      <Link
                        href="/seminar-proposal"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/seminar-proposal")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Seminar Proposal
                      </Link>
                      <Link
                        href="/seminar-hasil"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/seminar-hasil")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Seminar Hasil
                      </Link>
                      <Link
                        href="/sidang-skripsi"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/sidang-skripsi")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Sidang Skripsi
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/kalender"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  pathname.startsWith("/kalender")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Kalender
              </Link>

              {/* Stakeholder Mobile Collapsible */}
              <div className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileStakeholderOpen(!mobileStakeholderOpen)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isStakeholderActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span>Stakeholder</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      mobileStakeholderOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {(mobileStakeholderOpen || isStakeholderActive) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 pr-2 py-1 space-y-1 bg-muted/30 border-l-2 border-primary/20 ml-4 my-1 rounded-r-xl"
                    >
                      <Link
                        href="/mahasiswa"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/mahasiswa")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Mahasiswa
                      </Link>
                      <Link
                        href="/dosen"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/dosen")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Dosen
                      </Link>
                      <Link
                        href="/staff"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/staff")
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Staff
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


              <Link
                href="/tentang"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  pathname.startsWith("/tentang")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Tentang
              </Link>

              {!activeUser && (
                <div className="pt-2 border-t border-border/60">
                  <Button asChild className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QRScannerModal open={isScannerOpen} onOpenChange={setIsScannerOpen} />
    </header>
  )
}

export default Navbar
