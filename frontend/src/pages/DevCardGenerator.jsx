import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, Check, CreditCard, ExternalLink } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const THEMES = [
  { id: 'dark',   label: '🌙 Dark',   desc: 'GitHub-native dark' },
  { id: 'light',  label: '☀️ Light',  desc: 'Clean minimal' },
  { id: 'matrix', label: '🟩 Matrix', desc: 'Hacker aesthetic' },
];

const DevCardGenerator = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [copied, setCopied] = useState(false);

  // The username is the user's display name (SkillForge uses "name" as the identifier)
  const username = user?.name || '';

  // URLs — route accepts both /name and /name.svg — we use no extension to avoid encoding edge-cases
  const cardUrl  = `${API_BASE}/api/cards/${encodeURIComponent(username)}?theme=${theme}`;
  const previewUrl = `${cardUrl}&t=${Date.now()}`; // Bypass local browser caching for live preview
  const profileUrl = `${window.location.origin}/dashboard`;
  // GitHub Markdown snippet
  const markdownSnippet = `[![SkillForge Dev Card](${cardUrl})](${profileUrl})`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = markdownSnippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [markdownSnippet]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-purple-400" />
          Dev Card Generator
        </h1>
        <p className="text-gray-400 mt-1">
          Embed your live SkillForge stats in any GitHub README.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Preview ──────────────────────────────────────── */}
        <div className="glass-card flex flex-col gap-4">
          <h2 className="text-base font-semibold text-white">Live Preview</h2>

          {/* Card render */}
          <div
            className="w-full flex items-center justify-center rounded-xl p-6"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <img
              src={previewUrl}
              alt="SkillForge Dev Card"
              key={`${theme}-${username}`}         // force re-fetch on change
              className="rounded-lg shadow-xl max-w-full"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Theme selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Theme</p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    theme === th.id
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {th.label}
                  <span className="block text-[10px] opacity-60 font-normal">{th.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Embed & Instructions ─────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Markdown snippet */}
          <div className="glass-card flex flex-col gap-3">
            <h2 className="text-base font-semibold text-white">GitHub Markdown Snippet</h2>
            <p className="text-xs text-gray-400">
              Paste this into your GitHub profile <code className="bg-white/10 px-1 py-0.5 rounded text-purple-300">README.md</code>:
            </p>

            <div className="relative">
              <textarea
                readOnly
                rows={3}
                value={markdownSnippet}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs text-gray-300 font-mono resize-none focus:outline-none focus:border-purple-500/50"
                onClick={e => e.target.select()}
              />
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  copied
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                    : 'bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/15'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Direct card URL */}
          <div className="glass-card flex flex-col gap-3">
            <h2 className="text-base font-semibold text-white">Direct SVG URL</h2>
            <p className="text-xs text-gray-400">View or share your card directly:</p>
            <a
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 font-mono break-all transition-colors"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              {cardUrl}
            </a>
          </div>

          {/* Instructions */}
          <div className="glass-card flex flex-col gap-3">
            <h2 className="text-base font-semibold text-white">How to Use</h2>
            <ol className="space-y-2 text-xs text-gray-400 list-none">
              {[
                'Sync your platforms via the Dashboard to load fresh data.',
                'Pick a theme above — the card updates in real time.',
                'Copy the Markdown snippet and paste it into your GitHub profile README.md.',
                'GitHub will automatically display and cache your live card.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevCardGenerator;
