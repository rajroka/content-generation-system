"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Key,
  Trash2,
  Save,
  Loader2,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState("FREE");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: false,
    generationComplete: true,
    usageAlerts: true,
    newFeatures: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  // Fetch user data from database
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
      });

      // Fetch user plan from database
      fetchUserPlan();
    }
  }, [user]);

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/plan");
      const data = await response.json();
      if (response.ok) {
        setUserPlan(data.plan);
      }
    } catch (error) {
      console.error("Failed to fetch plan:", error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await user?.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      // Save to database
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      if (response.ok) {
        toast.success("Notification preferences saved");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    router.push("/pricing");
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to Pro features.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Subscription cancelled. You'll be downgraded to Free at the end of your billing period.");
        setUserPlan("FREE");
      } else {
        throw new Error("Failed to cancel");
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete all your content and cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted");
        await user?.delete();
        router.push("/");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avatar is managed through Clerk
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Account Plan</Label>
                <div className="flex items-center gap-3">
                  <Badge variant={userPlan === "PRO" ? "default" : "secondary"} className="text-sm px-3 py-1">
                    {userPlan} Plan
                  </Badge>
                  {userPlan === "FREE" && (
                    <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
                {userPlan === "FREE" ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Get unlimited generations, all platforms, and priority support with Pro.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    You're on the Pro plan. Enjoy unlimited access to all features.
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important account updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailUpdates: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive tips, product updates, and offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Generation Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when content generation is finished
                    </p>
                  </div>
                  <Switch
                    checked={notifications.generationComplete}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, generationComplete: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when you're approaching your daily limits
                    </p>
                  </div>
                  <Switch
                    checked={notifications.usageAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, usageAlerts: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new features and improvements
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newFeatures}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newFeatures: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdateNotifications} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {userPlan === "PRO" ? "Pro Plan - Unlimited Access" : "Free Plan - Limited Features"}
                    </p>
                  </div>
                  <Badge variant={userPlan === "PRO" ? "default" : "secondary"}>
                    {userPlan}
                  </Badge>
                </div>

                {userPlan === "PRO" ? (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next billing date</span>
                        <span>April 26, 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span>$9.99/month</span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleManageSubscription}>
                        Manage Subscription
                      </Button>
                      <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                        Cancel Subscription
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Pro to get unlimited generations, all platforms, and priority support.
                    </p>
                    <Button onClick={handleManageSubscription}>
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Payment Methods</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No payment methods on file. Add a payment method to upgrade.
                </p>
                <Button variant="outline">Add Payment Method</Button>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Billing History</h3>
                <p className="text-sm text-muted-foreground">
                  No invoices yet. Your first invoice will appear here after upgrading.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how BanamSathi looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="w-6 h-6" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="w-6 h-6" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="w-6 h-6" />
                    <span>System</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Accent Color</Label>
                <div className="grid grid-cols-6 gap-3">
                  {["#2563EB", "#7C3AED", "#DC2626", "#10B981", "#F59E0B", "#EC4899"].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-full border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => toast.info("Coming soon!")}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Custom accent colors coming soon</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Font Size</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => toast.info("Coming soon!")}>
                    Small
                  </Button>
                  <Button variant="default" size="sm" onClick={() => toast.info("Coming soon!")}>
                    Medium
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Coming soon!")}>
                    Large
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your security settings and account protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorAuth: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Active Sessions</Label>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome on Windows</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active Now</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Sign out all other devices
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Connected Accounts</Label>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-xs text-muted-foreground">{formData.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Connected</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Connect Google
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-destructive">Danger Zone</Label>
                  <div className="rounded-lg border border-destructive/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all your content
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}