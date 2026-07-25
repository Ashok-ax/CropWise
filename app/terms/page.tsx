import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-semibold text-foreground">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By creating an account or using this application, you agree to these
                Terms of Service and our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">2. Nature of the Service</h2>
              <p>
                This platform provides farm management tools, tracking features, and
                AI-assisted guidance for informational purposes only. Recommendations
                (crop suggestions, fertilizer guidance, AI assistant responses,
                government scheme information) are estimates and general guidance —
                they are not professional agricultural, financial, or legal advice.
                Always verify critical decisions with a qualified local expert or
                relevant authority.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">3. Your Account</h2>
              <p>
                You are responsible for maintaining the confidentiality of your login
                credentials and for all activity under your account. Notify us
                immediately if you suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">4. Your Content</h2>
              <p>
                You retain ownership of the data you enter (farm records, crop data,
                financial entries, marketplace listings). You are responsible for the
                accuracy of information you post, especially in the public marketplace section.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">5. Marketplace Listings</h2>
              <p>
                Marketplace listings are created by users. We do not verify the
                accuracy of listings or guarantee any transaction between users. Use
                caution and independent judgment before buying or selling.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
              <p>
                This service is provided &quot;as is&quot; without warranties of any
                kind. We are not liable for losses arising from decisions made based
                on information or recommendations provided by the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-foreground">7. Changes to These Terms</h2>
              <p>
                We may update these terms periodically. Continued use of the platform
                after changes constitutes acceptance of the updated terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
