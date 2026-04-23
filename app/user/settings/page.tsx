"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Trash2,
  Save,
  Loader2,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Camera,
  Settings,
  Sparkles,
  Zap,
  Clock,
  ExternalLink,
  MessageSquare,
  SlidersHorizontal,
  Pencil,
  Lock,
} from "lucide-react";
import { useTheme } from "next-themes";

type Tab = "profile" | "security" | "chat" | "preferences" | "notifications";

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "security", label: "Security Options", icon: Lock },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
];

function Field({ label, value, colSpan = 1 }: { label: string; value: string; colSpan?: number }) {
  return (
    <div className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
        {value || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="text-sm"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState("FREE");
  const [usageStats, setUsageStats] = useState({ captionCount: 0, imageCount: 0 });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    gender: "",
    dob: "",
    nationalId: "",
    country: "",
    cityState: "",
    postalCode: "",
    taxId: "",
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: false,
    generationComplete: true,
    usageAlerts: true,
    newFeatures: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
      }));
      fetchUserPlan();
      fetchUsageStats();
    }
  }, [user]);

  const fetchUserPlan = async () => {
    try {
      const res = await fetch("/api/user/plan");
      const data = await res.json();
      if (res.ok) setUserPlan(data.plan);
    } catch {}
  };

  const fetchUsageStats = async () => {
    try {
      const res = await fetch("/api/user/usage");
      const data = await res.json();
      if (res.ok) setUsageStats(data);
    } catch {}
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await user?.update({ firstName: formData.firstName, lastName: formData.lastName });
      toast.success("Profile updated successfully", {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      });
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted");
        await user?.delete();
        router.push("/");
      } else throw new Error();
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ") || "User";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
              <p className="text-base font-semibold text-foreground">Settings</p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                You can find all settings here
              </p>
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full text-left ${
                      activeTab === id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="flex-1 min-w-0">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <h2 className="text-base font-semibold">Profile Information</h2>
                  {editing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={loading} className="gap-1">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(true)}
                      className="gap-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  )}
                </div>

                <div className="p-6 space-y-8">
                  {/* Avatar row */}
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <Avatar className="w-16 h-16 border-2 border-border shadow">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {(formData.firstName?.[0] || formData.email?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <button className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full shadow">
                          <Camera className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{formData.bio || "No bio set"}</p>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <section>
                    <h3 className="text-sm font-semibold mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {editing ? (
                        <>
                          <EditableField label="First Name" value={formData.firstName} onChange={(v) => setFormData({ ...formData, firstName: v })} />
                          <EditableField label="Last Name" value={formData.lastName} onChange={(v) => setFormData({ ...formData, lastName: v })} />
                          <EditableField label="Email address" value={formData.email} disabled />
                          <EditableField label="Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                          <EditableField label="Bio" value={formData.bio} onChange={(v) => setFormData({ ...formData, bio: v })} />
                          <EditableField label="Gender" value={formData.gender} onChange={(v) => setFormData({ ...formData, gender: v })} />
                          <EditableField label="Date of Birth" value={formData.dob} onChange={(v) => setFormData({ ...formData, dob: v })} type="date" />
                          <EditableField label="National ID" value={formData.nationalId} onChange={(v) => setFormData({ ...formData, nationalId: v })} />
                        </>
                      ) : (
                        <>
                          <Field label="First Name" value={formData.firstName} />
                          <Field label="Last Name" value={formData.lastName} />
                          <Field label="Email address" value={formData.email} />
                          <Field label="Phone" value={formData.phone} />
                          <Field label="Bio" value={formData.bio} />
                          <Field label="Gender" value={formData.gender} />
                          <Field label="Date of Birth" value={formData.dob} />
                          <Field label="National ID" value={formData.nationalId} />
                        </>
                      )}
                    </div>
                  </section>

                  <Separator />

                  {/* Address */}
                  <section>
                    <h3 className="text-sm font-semibold mb-4">Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {editing ? (
                        <>
                          <EditableField label="Country" value={formData.country} onChange={(v) => setFormData({ ...formData, country: v })} />
                          <EditableField label="City/State" value={formData.cityState} onChange={(v) => setFormData({ ...formData, cityState: v })} />
                          <EditableField label="Postal Code" value={formData.postalCode} onChange={(v) => setFormData({ ...formData, postalCode: v })} />
                          <EditableField label="TAX ID" value={formData.taxId} onChange={(v) => setFormData({ ...formData, taxId: v })} />
                        </>
                      ) : (
                        <>
                          <Field label="Country" value={formData.country} />
                          <Field label="City/State" value={formData.cityState} />
                          <Field label="Postal Code" value={formData.postalCode} />
                          <Field label="TAX ID" value={formData.taxId} />
                        </>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-semibold">Security Options</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your account security</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={security.twoFactorAuth}
                      onCheckedChange={(v) => setSecurity({ ...security, twoFactorAuth: v })}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Session Timeout</Label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Active Sessions</p>
                    <div className="rounded-xl border border-border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome on Windows</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                        Active Now
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">Sign out all other devices</Button>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-destructive mb-3">Danger Zone</p>
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-destructive">Delete Account</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all content</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={loading} className="gap-2 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-semibold">Notification Preferences</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose what notifications you want to receive</p>
                </div>
                <div className="p-6 space-y-1">
                  {[
                    { id: "emailUpdates", label: "Email Updates", desc: "Receive important account updates via email" },
                    { id: "marketingEmails", label: "Marketing Emails", desc: "Receive tips, product updates, and offers" },
                    { id: "generationComplete", label: "Generation Complete", desc: "Notify when content generation is finished" },
                    { id: "usageAlerts", label: "Usage Alerts", desc: "Alert when approaching your daily limits" },
                    { id: "newFeatures", label: "New Features", desc: "Get notified about new features and improvements" },
                  ].map((item, i, arr) => (
                    <div key={item.id}>
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.id as keyof typeof notifications]}
                          onCheckedChange={(v) => setNotifications({ ...notifications, [item.id]: v })}
                        />
                      </div>
                      {i < arr.length - 1 && <Separator />}
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <Button size="sm" onClick={() => toast.success("Preferences saved")} className="gap-2">
                      <Save className="w-3.5 h-3.5" />
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "preferences" && (
              <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-semibold">Preferences</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize your experience</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", icon: Sun, label: "Light" },
                        { value: "dark", icon: Moon, label: "Dark" },
                        { value: "system", icon: Monitor, label: "System" },
                      ].map((opt) => (
                        <Button
                          key={opt.value}
                          variant={theme === opt.value ? "default" : "outline"}
                          className="flex flex-col gap-2 h-auto py-4 transition-all"
                          onClick={() => setTheme(opt.value)}
                        >
                          <opt.icon className="w-5 h-5" />
                          <span className="text-xs">{opt.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Accent Color</Label>
                    <div className="flex flex-wrap gap-3">
                      {["#2563EB", "#7C3AED", "#DC2626", "#10B981", "#F59E0B", "#EC4899"].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-all"
                          style={{ backgroundColor: color }}
                          onClick={() => toast.info("Custom accent colors coming soon!")}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Custom accent colors coming soon</p>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === "chat" && (
              <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-semibold">Chat Settings</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your chat preferences</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">Chat settings coming soon.</p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}