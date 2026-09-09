import { getLessonDepth } from "../lesson-depth";
export default function LessonDepthPanel({ trackId, paceId, title }: { trackId: string; paceId: string; title: string }) {
  const depth = getLessonDepth(trackId, paceId, title);
  if (!depth) return null;
  return <section className="lesson-depth-panel" aria-label="Worked scenario">
    <p className="pixel-kicker">APPLY THE IDEA</p><h2>A worked scenario</h2>
    <p>{depth.explanation}</p><pre><code>{depth.example}</code></pre>
    <h3>Why this result follows</h3><p>{depth.reasoning}</p>
    <a href={depth.source} target="_blank" rel="noreferrer">Read the reference ↗</a>
  </section>;
}

