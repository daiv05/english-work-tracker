import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">
      <Link to="/" className="text-sm text-[#3980f4] font-medium hover:underline mb-8 inline-block">
        ← Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-[#191c1e] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#76777d] mb-8">Last updated: April 2026</p>

      <div className="prose prose-sm max-w-none text-[#191c1e] space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-[#191c1e] mb-2">Overview</h2>
          <p className="text-[#45464d] leading-relaxed">
            English Work Tracker is a Progressive Web App designed to help professionals
            track their English language learning progress. We are committed to protecting
            your privacy. This policy describes how data is handled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#191c1e] mb-2">Data Storage</h2>
          <p className="text-[#45464d] leading-relaxed">
            <strong>All data is stored locally on your device.</strong> English Work Tracker
            uses IndexedDB — a browser-based database — to store your activity logs, writing
            entries, and resources. No data is transmitted to any external server.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#191c1e] mb-2">Data We Do Not Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-[#45464d]">
            <li>We do not collect personal identification information.</li>
            <li>We do not use analytics or tracking services.</li>
            <li>We do not share data with third parties.</li>
            <li>We do not require an account or login.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#191c1e] mb-2">Your Data Control</h2>
          <p className="text-[#45464d] leading-relaxed">
            Since all data lives in your browser's local storage, you have full control.
            You can clear all app data at any time by clearing your browser's site data
            or uninstalling the app. There is no account to delete.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#191c1e] mb-2">Offline Capability</h2>
          <p className="text-[#45464d] leading-relaxed">
            This app works fully offline. The service worker caches the application
            assets locally so the app functions without an internet connection.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#191c1e] mb-2">Contact</h2>
          <p className="text-[#45464d] leading-relaxed">
            If you have questions about this privacy policy, please reach out via the
            app's repository or contact page.
          </p>
        </section>
      </div>
    </div>
  )
}
