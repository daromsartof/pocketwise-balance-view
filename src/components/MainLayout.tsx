
import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Menu,
  BarChart3,
  PieChart,
  Clock,
  Calendar,
  Wallet,
  Settings,
  LogOut
} from 'lucide-react';
import { TransactionType } from '../types';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { accounts, currentAccount, setCurrentAccount, summary } = useFinance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  // Check if screen is large on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      const largScreen = window.innerWidth >= 1024; // lg breakpoint
      setIsLargeScreen(largScreen);

      // Only set menuOpen to true on large screens at initial load
      if (largScreen) {
        setMenuOpen(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been disconnected from your account",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "An error occurred while trying to log out",
        variant: "destructive",
      });
    }
  };

  // Add this handler for transaction creation
  const handleAddTransaction = (type: TransactionType) => {
    // Navigate to transactions page with state
    navigate('/transactions', { state: { addingTransaction: type } });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-finance-blue py-4 px-5 text-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="mr-3 lg:hidden">
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <h1 className="font-semibold text-lg">PocketWise</h1>
            {currentAccount && (
              <div className="flex items-center ml-2 text-sm bg-white/10 rounded-full px-3 py-1">
                <span>{currentAccount.name}</span>
                <ChevronDown size={16} className="ml-1" />
              </div>
            )}
          </div>
        </div>
        <button className="relative">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      {/* Side Menu Drawer */}
      {menuOpen && (
        <div className={`fixed z-50 bg-black bg-opacity-30 lg:bg-opacity-0`} >
          <div
            className={`absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg transform transition-transform ${isLargeScreen ? 'lg:relative lg:w-64 lg:shadow-none' : ''
              }`}
          >
            <div className="flex flex-col h-full" style={{ overflow: "scroll", maxHeight: "100vh" }}>
              {/* Menu Header with Account Balance */}
              <div className="bg-finance-blue text-white p-5">
                <h2 className="text-lg mb-3">Balance</h2>
                <div className="text-3xl font-bold">${summary.balance.toFixed(2)}</div>
                <div className="flex justify-between mt-3">
                  <div>
                    <div className="text-green-300 text-xs">Income</div>
                    <div className="text-green-300 font-medium">${summary.totalIncome.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-red-300 text-xs">Expenses</div>
                    <div className="text-red-300 font-medium">${summary.totalExpense.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Account Selector */}
              <div className="p-4 border-b">
                <h3 className="text-sm text-gray-500 mb-2">Accounts</h3>
                <div className="space-y-2">
                  {accounts.map(account => (
                    <button
                      key={account.id}
                      className={`flex items-center justify-between w-full p-2 rounded ${currentAccount?.id === account.id ? 'bg-blue-50' : ''
                        }`}
                      onClick={() => {
                        setCurrentAccount(account);
                      }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: account.color }}
                        >
                          <Wallet size={16} className="text-white" />
                        </div>
                        <span>{account.name}</span>
                      </div>
                      <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${account.balance.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 flex-1">
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/"
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <PieChart size={20} className="mr-3 text-finance-blue" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/transactions"
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <BarChart3 size={20} className="mr-3 text-finance-blue" />
                      <span>Transactions</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/budgets"
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <Wallet size={20} className="mr-3 text-finance-blue" />
                      <span>Budgets</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/categories"
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <Calendar size={20} className="mr-3 text-finance-blue" />
                      <span>Categories</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <Clock size={20} className="mr-3 text-finance-blue" />
                      <span>Reports</span>
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Bottom Settings and Logout Links */}
              <div className="p-4 border-t">
                <Link
                  to="/settings"
                  className="flex items-center p-2 hover:bg-gray-100 rounded mb-2"
                >
                  <Settings size={20} className="mr-3 text-gray-500" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-2 hover:bg-gray-100 rounded text-red-600"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto pb-20`}>
        <div className="flex">
          {/* This creates space for the sidebar on large screens */}
          {isLargeScreen && menuOpen && <div className="hidden lg:block w-64 shrink-0"></div>}

          {/* Actual content */}
          <div className="flex-1">
            {children}
          </div>
          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-64 right-0 h-16 bg-white border-t flex items-center justify-around">
            <button
              className="w-1/2 h-full flex flex-col items-center justify-center bg-green-500 text-white"
              onClick={() => handleAddTransaction(TransactionType.INCOME)}
            >
              <span className="text-xl">+</span>
              <span className="text-xs">Income</span>
            </button>
            <button
              className="w-1/2 h-full flex flex-col items-center justify-center bg-red-500 text-white"
              onClick={() => handleAddTransaction(TransactionType.EXPENSE)}
            >
              <span className="text-xl">-</span>
              <span className="text-xs">Expense</span>
            </button>
          </div>
        </div>
      </main>


    </div>
  );
};

export default MainLayout;
