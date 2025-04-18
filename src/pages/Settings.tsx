
import React from 'react';
import MainLayout from '../components/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFinance, FinanceProvider } from '../context/FinanceContext';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

// This component needs to be inside the FinanceProvider
const SettingsContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { currentAccount } = useFinance();

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

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
            </div>
            <div>
              <Label>Current Account</Label>
              <p className="text-sm text-gray-600">{currentAccount?.name || 'No account selected'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>Customize how your financial information is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Currency Display</Label>
                <p className="text-sm text-gray-600">Choose your preferred currency format</p>
              </div>
              <Select defaultValue="USD">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Numbers</Label>
                <p className="text-sm text-gray-600">Show abbreviated numbers (e.g., 1K instead of 1,000)</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-600">Enable dark mode for the application</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Budget Alerts</Label>
                <p className="text-sm text-gray-600">Receive notifications when approaching budget limits</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Reports</Label>
                <p className="text-sm text-gray-600">Get monthly spending analysis reports</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log Out</Label>
                <p className="text-sm text-gray-600">Sign out from your account</p>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

// Wrapper component that provides the FinanceContext
const Settings = () => {
  return (
    <FinanceProvider>
      <SettingsContent />
    </FinanceProvider>
  );
};

export default Settings;
