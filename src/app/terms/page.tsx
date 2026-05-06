import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-xs mb-6">
            Last updated: February 2026
          </p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm text-muted-foreground">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using FlashGenius, you agree to be bound by
                these Terms of Service. If you do not agree to these terms,
                please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                2. Description of Service
              </h2>
              <p>
                FlashGenius is a flashcard-based learning platform that uses AI
                to help you create and study content. We provide tools for
                creating, organizing, and studying flashcard decks.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                3. User Accounts
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You must provide accurate information when creating an
                account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                4. User Content
              </h2>
              <p>
                You retain ownership of the content you create on FlashGenius.
                By using our service, you grant us a limited license to store
                and process your content to provide the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                5. Acceptable Use
              </h2>
              <p>
                You agree not to use FlashGenius for any unlawful purpose or in
                any way that could damage, disable, or impair the service. You
                must not upload malicious content or attempt to gain
                unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                6. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account if you
                violate these terms. You may also delete your account at any
                time through the settings page.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">
                7. Changes to Terms
              </h2>
              <p>
                We may update these terms from time to time. We will notify you
                of significant changes via email or through the service.
                Continued use of FlashGenius after changes constitutes
                acceptance of the updated terms.
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
