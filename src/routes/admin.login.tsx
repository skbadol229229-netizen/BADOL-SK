import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { checkAdmin, signInAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Trikon Clothing" },
      { name: "description", content: "Staff sign in for the Trikon Clothing store admin." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin sign in — Trikon Clothing" },
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
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signInAdmin(email.trim(), password);
      toast.success("Signed in");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  return (
    <div className="admin-theme grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 [box-shadow:var(--admin-shadow-md)]">
        <p className="font-serif-display text-2xl">TRIKON</p>
        <p className="mt-1 text-xs text-muted-foreground">Store admin</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="a-section-title">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="a-input mt-2"
            />
          </label>
          <label className="block">
            <span className="a-section-title">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="a-input mt-2"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={submitting} className="a-btn a-btn-primary w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Admin accounts are created by the store owner. There is no public registration.
        </p>
      </div>
    </div>
  );
}
