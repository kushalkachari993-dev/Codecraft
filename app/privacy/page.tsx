import Link from "next/link";

export const metadata = {
  title: "Privacy — CodeCraft",
  description: "How CodeCraft handles learner identity, progress, analytics, feedback, submissions, and AI lab data.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">← Return to CodeCraft</Link>
      <header className="legal-hero">
        <p>CODECRAFT · PLAYER DATA CHARTER</p>
        <h1>Privacy</h1>
        <span>Effective August 26, 2026 · Early public beta</span>
      </header>

      <section>
        <h2>What CodeCraft stores</h2>
        <p>When you sign in, CodeCraft stores your Clerk user identifier, display name, email address, XP, completed topics, badges, projects, saved code submissions, and daily AI-review count. Signed-out progress stays in your browser.</p>
      </section>
      <section>
        <h2>Beta analytics</h2>
        <p>CodeCraft records a small set of first-party learning events such as selecting a track, opening a lesson, passing or retrying a checkpoint, completing a lab, using a world power, and restoring a world. Events may contain a random browser session identifier plus the current track, pace, topic number, world number, and whether a project was required.</p>
        <p>Analytics events never contain your code, prompts, answers, feedback text, name, or email address. Signed-in events may be linked to your Clerk user identifier so progress through the beta can be understood across sessions. Raw analytics events are automatically removed after 90 days.</p>
      </section>
      <section>
        <h2>Feedback</h2>
        <p>The beta feedback form stores your rating, category, message, optional difficulty response, learning context, and whether you allowed a follow-up. CodeCraft does not store your email inside the feedback record. If you are signed in and explicitly allow contact, the owner can use your Clerk account to follow up. Do not include personal or confidential information in feedback.</p>
      </section>
      <section>
        <h2>Why it is used</h2>
        <p>This information restores learning progress across devices, displays your profile, saves optional challenge attempts, prevents GenAI cost abuse, measures whether the learning journey works, prioritizes beta improvements, and helps operate the service safely.</p>
      </section>
      <section>
        <h2>Code execution and GenAI labs</h2>
        <p>Python and SQL practice runs inside an isolated browser runtime. GenAI submissions first receive deterministic checks. Eligible signed-in submissions may be sent to the configured hosted model for educational feedback. Do not place secrets or sensitive personal information in lab submissions.</p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>CodeCraft currently relies on Clerk for authentication and Cloudflare-backed hosting, database storage, operational logs, first-party analytics, and optional AI evaluation. No third-party advertising analytics SDK is embedded in the learning interface.</p>
      </section>
      <section>
        <h2>Retention and deletion</h2>
        <p>Cloud progress, submissions, and beta feedback are retained while your account exists or while they are needed to operate the beta. Raw analytics events expire after 90 days. Deleting your account removes your CodeCraft profile, cloud progress, submissions, AI-review usage, linked analytics and feedback, and Clerk identity. Anonymous events cannot identify you directly and expire automatically.</p>
        <Link className="legal-danger-link" href="/account/delete">Open account deletion controls →</Link>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You may learn without signing in and keep progress only on the current device. You may dismiss the contextual feedback question, skip the feedback form, sign out, edit your Clerk profile, or delete the account. CodeCraft is an early beta; avoid submitting confidential, regulated, or third-party personal data.</p>
      </section>
    </main>
  );
}
