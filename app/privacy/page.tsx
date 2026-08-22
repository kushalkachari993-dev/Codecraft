import Link from "next/link";

export const metadata = {
  title: "Privacy — CodeCraft",
  description: "How CodeCraft handles learner identity, progress, submissions, and AI lab data.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">← Return to CodeCraft</Link>
      <header className="legal-hero">
        <p>CODECRAFT · PLAYER DATA CHARTER</p>
        <h1>Privacy</h1>
        <span>Effective August 22, 2026 · Early public beta</span>
      </header>

      <section>
        <h2>What CodeCraft stores</h2>
        <p>When you sign in, CodeCraft stores your Clerk user identifier, display name, email address, XP, completed topics, badges, projects, saved code submissions, and daily AI-review count. Signed-out progress stays in your browser.</p>
      </section>
      <section>
        <h2>Why it is used</h2>
        <p>This information restores your learning progress across devices, displays your profile, saves optional challenge attempts, prevents GenAI cost abuse, and helps operate the service safely.</p>
      </section>
      <section>
        <h2>Code execution and GenAI labs</h2>
        <p>Python and SQL practice runs inside an isolated browser runtime. GenAI submissions first receive deterministic checks. Eligible signed-in submissions may be sent to the configured hosted model for educational feedback. Do not place secrets or sensitive personal information in lab submissions.</p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>CodeCraft currently relies on Clerk for authentication and Cloudflare-backed hosting, database storage, operational logs, and optional AI evaluation. These providers process information under their own service terms and security controls.</p>
      </section>
      <section>
        <h2>Retention and deletion</h2>
        <p>Cloud progress and submissions are retained while your account exists. Operational logs follow the hosting provider’s configured retention. You can permanently delete your CodeCraft data and Clerk identity from the account deletion page.</p>
        <Link className="legal-danger-link" href="/account/delete">Open account deletion controls →</Link>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You may learn without signing in and keep progress only on the current device. You may also sign out, edit your Clerk profile, or delete the account. CodeCraft is an early beta; avoid submitting confidential, regulated, or third-party personal data.</p>
      </section>
    </main>
  );
}
