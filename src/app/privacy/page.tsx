import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-6 sm:mb-8"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl sm:text-2xl">
            FlashGenius
          </span>
        </Link>

        <div className="bg-card rounded-2xl p-5 sm:p-8 card-shadow-elevated">
          <h1 className="font-display text-xl sm:text-2xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-xs mb-6">
            Last updated: February 2026
          </p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm text-muted-foreground">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide when creating an account
                (name, email), the flashcard content you create, and usage data
                such as study sessions and progress.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                2. How We Use Your Information
              </h2>
              <p>
                Your information is used to provide and improve the FlashGenius
                service, personalize your experience, send important
                notifications about your account, and generate AI-powered
                flashcard suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                3. Data Storage and Security
              </h2>
              <p>
                Your data is stored securely using Supabase infrastructure. We
                use industry-standard encryption and security practices to
                protect your personal information and content.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                4. Third-Party Services
              </h2>
              <p>
                We use third-party services including Supabase for
                authentication and data storage, and AI providers for flashcard
                generation. When you sign in with Google, Google&apos;s privacy
                policy also applies to the data shared during authentication.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                5. Cookies and Tracking
              </h2>
              <p>
                We use essential cookies for authentication and session
                management. We do not use third-party tracking cookies or sell
                your data to advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                6. Your Rights
              </h2>
              <p>
                You have the right to access, update, or delete your personal
                data. You can export your flashcard data or delete your account
                entirely through the settings page.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                7. Data Sharing
              </h2>
              <p>
                We do not sell, rent, or share your personal information with
                third parties except as required to provide the service or as
                required by law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                8. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of significant changes via email or through the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                9. Contact Us
              </h2>
              <p>
                If you have questions about this privacy policy or your data,
                please contact us through the application.
              </p>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
