import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { checkAdmin, signInAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — PureBengal Organic" },
      { name: "description", content: "Staff sign in for PureBengal Organic Store admin." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin sign in — PureBengal Organic" },
      { property: "og:description", content: "Staff access only." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin().then((ok) => {
      if (ok) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your admin email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signInAdmin(email.trim(), password);
      toast.success("Signed in successfully");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  return (
    <div className="admin-theme grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
            P
          </div>
          <div>
            <p className="font-serif-display text-xl font-bold text-foreground">PureBengal</p>
            <p className="text-xs text-muted-foreground">Organic Store Admin Panel</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="a-section-title">Admin Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="skbadol229229@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="a-input mt-1"
            />
          </label>
          <label className="block">
            <span className="a-section-title">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="a-input mt-1"
            />
          </label>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="a-btn a-btn-primary w-full bg-primary text-primary-foreground"
          >
            {submitting ? "Signing in…" : "Sign in to Dashboard"}
          </button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground text-center">
          Restricted access for PureBengal Organic Store administrators.
        </p>
      </div>
    </div>
  );
}
