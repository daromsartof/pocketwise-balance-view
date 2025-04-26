import React, { useState, useEffect } from "react"
import { useFinance } from "../context/FinanceContext"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  Calendar,
  Wallet,
  Settings,
  LogOut,
  Home,
} from "lucide-react"
import { TransactionType } from "../types"
import { useAuth } from "../components/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "./ui/use-toast"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { accounts, currentAccount, setCurrentAccount, summary } = useFinance()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { session } = useAuth()

  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopView = window.innerWidth >= 1024 // lg breakpoint
      setIsDesktop(isDesktopView)

      // Auto-open sidebar on desktop
      if (isDesktopView && !sidebarOpen) {
        setSidebarOpen(true)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isDesktop])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged out successfully",
        description: "You have been disconnected from your account",
      })
      navigate("/auth")
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "An error occurred while trying to log out",
        variant: "destructive",
      })
    }
  }

  const handleAddTransaction = (type: TransactionType) => {
    navigate("/transactions", { state: { addingTransaction: type } })
  }

  const navigationItems = [
    { path: "/", icon: <Home size={20} />, label: "Dashboard" },
    {
      path: "/transactions",
      icon: <BarChart3 size={20} />,
      label: "Transactions",
    },
    { path: "/budgets", icon: <Wallet size={20} />, label: "Budgets" },
    { path: "/categories", icon: <Calendar size={20} />, label: "Categories" },
    { path: "/reports", icon: <PieChart size={20} />, label: "Reports" },
  ]

  return (
    <div className="flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
          isDesktop
            ? "translate-x-0"
            : sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        )}
      >
        {/* Brand & Close button */}
        <div
          className={cn(
            "fflex items-center  p-0 bg-finance-blue text-white",
            isDesktop ? "justify-center" : "justify-between"
          )}
        >
          <div
            className="flex items-center justify-center"
            style={{ height: "100px" }}
          >
            <img
              src="/logo2.png"
              alt="PicPocket Logo"
              className="max-h-full object-contain"
            />
          </div>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Balance Summary */}
        <div className="bg-finance-blue text-white p-5 pb-6">
          <h2 className="text-sm uppercase tracking-wider opacity-80 mb-2">
            Balance
          </h2>
          <div className="text-3xl font-bold mb-4">
            ${summary.balance.toFixed(2)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/10 p-2">
              <div className="text-xs opacity-80">Income</div>
              <div className="text-green-300 font-medium">
                ${summary.totalIncome.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <div className="text-xs opacity-80">Expenses</div>
              <div className="text-red-300 font-medium">
                ${summary.totalExpense.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto pb-24">
          {/* Account Selector */}
          <div className="p-4 border-b">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              Accounts
            </h3>
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  className={cn(
                    "flex items-center justify-between w-full p-3 rounded-lg border transition-all",
                    currentAccount?.id === account.id
                      ? "bg-blue-50 border-blue-200"
                      : "border-transparent hover:bg-gray-100"
                  )}
                  onClick={() => setCurrentAccount(account)}
                >
                  <div className="flex items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: account.color }}
                    >
                      <Wallet size={14} className="text-white" />
                    </div>
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      account.balance >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    ${account.balance.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-3">
              Menu
            </h3>
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition-colors",
                      location.pathname === item.path
                        ? "bg-blue-50 text-finance-blue font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Links */}
          <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-3">
            <Link
              to="/settings"
              className="flex items-center p-2.5 text-gray-700 hover:bg-gray-100 rounded-lg mb-1"
            >
              <Settings size={18} className="mr-3" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2.5 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={18} className="mr-3" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all",
          isDesktop && sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "mr-3 p-1.5 rounded-lg hover:bg-gray-100",
                isDesktop && sidebarOpen ? "hidden" : "flex"
              )}
            >
              <Menu size={22} />
            </button>

            {currentAccount && (
              <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                <span className="font-medium">{currentAccount.name}</span>
                <ChevronDown size={14} className="ml-1 opacity-60" />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-20">
          {children}
        </main>

        {/* Bottom Action Bar */}
        <div
          className="fixed bottom-0 right-0 h-16 bg-white border-t flex items-center justify-around shadow-lg z-20"
          style={{ left: isDesktop && sidebarOpen ? "16rem" : 0 }}
        >
          <button
            className="w-1/2 h-full flex items-center justify-center space-x-2 bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
            onClick={() => handleAddTransaction(TransactionType.INCOME)}
          >
            <Plus size={20} />
            <span>Income</span>
          </button>
          <button
            className="w-1/2 h-full flex items-center justify-center space-x-2 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            onClick={() => handleAddTransaction(TransactionType.EXPENSE)}
          >
            <Minus size={20} />
            <span>Expense</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
