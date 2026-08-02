import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Trikon Clothing — Support in Bangladesh" },
      {
        name: "description",
        content:
          "Call, email or message Trikon Clothing for order support, sizing help and exchanges. Saturday to Thursday, 10am–8pm.",
      },
      { property: "og:title", content: "Contact Trikon Clothing — Support in Bangladesh" },
      { property: "og:description", content: "Order support, sizing help and exchange requests." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, { message: "Please enter your name." }).max(80),
  email: z.string().trim().email({ message: "Enter a valid email address." }).max(255),
  message: z
    .string()
    .trim()
    .min(10, { message: "Tell us a little more (at least 10 characters)." })
    .max(1000, { message: "Message must be under 1000 characters." }),
});

type Values = z.infer<typeof contactSchema>;

function ContactPage() {
  const storeSettings = useSettings();
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof Values, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSent(true);
    setValues({ name: "", email: "", message: "" });
    toast.success("Message sent", { description: "We usually reply within one working day." });
  }

  const inputClass = (invalid?: string) =>
    `field-input ${invalid ? "field-invalid" : ""}`;

  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Contact"
        title="We're here to help"
        description="Order status, sizing, exchanges or wholesale — reach us any working day between 10am and 8pm."
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-6">
          <div className="flex gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Phone &amp; WhatsApp</p>
              <a
                href={`tel:${storeSettings.supportPhone}`}
                className="mt-1 block text-sm text-muted-foreground underline underline-offset-4"
              >
                {storeSettings.supportPhone}
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Email</p>
              <a
                href={`mailto:${storeSettings.supportEmail}`}
                className="mt-1 block break-words text-sm text-muted-foreground underline underline-offset-4"
              >
                {storeSettings.supportEmail}
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Studio</p>
              <p className="mt-1 text-sm text-muted-foreground">{storeSettings.address}</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="border border-border p-5 md:p-6">
          <h2 className="type-h3">Send a message</h2>

          <div className="mt-6">
            <label htmlFor="name" className="field-label">
              Your name
            </label>
            <input
              id="name"
              value={values.name}
              maxLength={80}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className={inputClass(errors.name)}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={values.email}
              maxLength={255}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              className={inputClass(errors.email)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="message" className="field-label">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              maxLength={1000}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              className={`field-textarea ${errors.message ? "field-invalid" : ""}`}
              aria-invalid={!!errors.message}
            />
            {errors.message && <p className="field-error">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-solid btn-block mt-6"
          >
            {submitting ? "Sending…" : "Send message"}
          </button>

          {sent && (
            <p className="mt-4 text-sm text-success">
              Thanks — your message is with our team. We reply within one working day.
            </p>
          )}
        </form>
      </div>
    </Container>
  );
}
