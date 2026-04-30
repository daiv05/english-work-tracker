import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">
      <Link
        to="/"
        className="text-sm text-tertiary font-medium hover:underline mb-8 inline-block"
      >
        ← Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-on-surface mb-2">Privacy Policy</h1>
      <p className="text-sm text-outline mb-8">Last updated: April 2026</p>

      <div className="prose prose-sm max-w-none text-on-surface space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Overview</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Engrow is a web application designed to help professionals track their
            English language learning progress. We are committed to protecting your
            privacy. This policy describes what data is collected and how it is handled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Account & Authentication</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Using Engrow requires creating an account with an email address and password.
            Your credentials are used solely to authenticate your session. Passwords are
            never stored in plain text.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Data Storage</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Your activity logs, writing entries, study plans, and resources are stored on
            our servers and associated with your account. This allows your data to be
            accessible across devices and sessions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Administrator Access</h2>
          <p className="text-on-surface-variant leading-relaxed">
            A superadmin role exists for platform management purposes. Superadmins can view
            basic account information (such as email address) and aggregate usage time data.
            This information is used exclusively for platform oversight and is never shared
            with third parties, sold, or used for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Data We Do Not Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
            <li>We do not use analytics or third-party tracking services.</li>
            <li>We do not share your data with third parties.</li>
            <li>We do not sell your personal information.</li>
            <li>We do not use your data for advertising purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Your Data Control</h2>
          <p className="text-on-surface-variant leading-relaxed">
            You may request deletion of your account and all associated data at any time by
            contacting us. Upon deletion, your data will be permanently removed from our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Contact</h2>
          <p className="text-on-surface-variant leading-relaxed">
            If you have questions about this privacy policy, please reach out via the
            app's repository or contact page.
          </p>
        </section>
      </div>
    </div>
  )
}
