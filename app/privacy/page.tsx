import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-semibold text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                When you create an account, we collect your name, email address, and
                any farm-related information you choose to enter, such as farm details,
                crop records, soil data, livestock records, and financial entries you
                add to track expenses and revenue.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>
                Your data is used solely to provide the features of this application:
                displaying your dashboard, generating recommendations, tracking your
                records over time, and enabling the AI assistant to answer your
                questions with relevant context. We do not sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">3. Data Storage &amp; Security</h2>
              <p>
                Your data is stored using Supabase (PostgreSQL) with Row Level Security
                enabled, meaning your records are only accessible to your own account.
                No other user can view or modify your data.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">4. Third-Party Services</h2>
              <p>
                If enabled, the AI Assistant feature may send your message text to
                OpenAI to generate a response. No other personal data is shared with
                third parties. If the AI service is not configured, the assistant uses
                built-in rule-based responses only.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">5. Your Rights</h2>
              <p>
                You can update or delete your farm data at any time from within the
                app. To request full account deletion, contact us using the details on
                our Contact page.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">6. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Continued use of the app
                after changes means you accept the revised policy.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
