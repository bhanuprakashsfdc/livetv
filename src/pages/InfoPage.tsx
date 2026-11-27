import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { AppRoute } from '../types/channel';

interface InfoPageProps {
  page: 'about' | 'contact' | 'privacy' | 'terms';
  onNavigate: (route: AppRoute) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ page, onNavigate }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <button
        type="button"
        onClick={() => onNavigate({ view: 'home' })}
        className="self-start inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {page === 'about' && (
        <article className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
              Mana Telugu Entertainment
            </p>
            <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
              About Telugu Live TV
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed">
            Telugu Live TV is a clean, lightweight television discovery and streaming interface designed for Telugu-speaking families across Andhra Pradesh, Telangana, and the global Telugu diaspora.
          </p>
          <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed">
            Built for desktop browsers, laptops, tablets, smartphones, and Smart TVs, the platform focuses on effortless channel discovery with zero forced login, zero subscriptions, and no cluttered paywalls.
          </p>
          <div className="pt-4 border-t border-[#1F2937]">
            <h2 className="text-base font-semibold text-white">
              Broadcaster Licensing Commitment
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-2 leading-relaxed">
              Telugu Live TV strictly supports legally authorized free-to-air HLS broadcasts and official broadcaster embeds. No pirated IPTV playlists or unauthorized stream links are bundled in this application.
            </p>
          </div>
        </article>
      )}

      {page === 'privacy' && (
        <article className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
              Privacy First
            </p>
            <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-[#D1D5DB] leading-relaxed">
            Telugu Live TV does not require user registration, login accounts, or personal profile creation.
          </p>
          <div className="space-y-4 text-sm text-[#9CA3AF] leading-relaxed">
            <div>
              <h2 className="text-white font-semibold mb-1">Local Browser Storage</h2>
              <p>
                Your favorite channels, recently watched history, Smart TV display preferences, and any authorized HLS stream URLs you configure are stored exclusively in your browser&apos;s <code className="font-mono text-[#D1D5DB]">localStorage</code>. You can clear all stored preferences at any time from Settings.
              </p>
            </div>
            <div>
              <h2 className="text-white font-semibold mb-1">Third-Party Broadcaster Streams</h2>
              <p>
                When you play an official broadcaster-authorized stream URL, your browser connects directly to that broadcaster&apos;s media delivery server under their respective privacy terms.
              </p>
            </div>
          </div>
        </article>
      )}

      {page === 'terms' && (
        <article className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
              Platform Guidelines
            </p>
            <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
              Terms of Service
            </h1>
          </div>
          <div className="space-y-4 text-sm text-[#9CA3AF] leading-relaxed">
            <p className="text-[#D1D5DB]">
              Telugu Live TV provides a directory and browser-based HLS player interface intended solely for free-to-air and broadcaster-authorized Telugu television channels.
            </p>
            <div>
              <h2 className="text-white font-semibold mb-1">Authorized Content Only</h2>
              <p>
                Users configuring custom stream URLs agree to load only legally authorized HLS feeds or official broadcaster streams to which they have lawful viewing access.
              </p>
            </div>
            <div>
              <h2 className="text-white font-semibold mb-1">Trademarks &amp; Channel Marks</h2>
              <p>
                All television channel names, program titles, and broadcaster references shown in the directory belong to their respective owners and are displayed for informational directory purposes.
              </p>
            </div>
          </div>
        </article>
      )}

      {page === 'contact' && (
        <article className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
              Broadcaster &amp; Viewer Support
            </p>
            <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
              Contact Telugu Live TV
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Broadcasters wishing to list an official free-to-air HLS stream or viewers reporting a channel listing issue can reach out below.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-6 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-white">Message received</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Thank you, {name}. Your broadcaster inquiry or feedback has been recorded for review.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="mt-3 text-xs font-semibold text-[#F5B942] hover:underline"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[#D1D5DB] mb-1.5"
                  >
                    Name or Broadcaster
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#111827] border border-[#1F2937] focus:border-[#E50914] text-sm text-white placeholder-[#6B7280] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-[#D1D5DB] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#111827] border border-[#1F2937] focus:border-[#E50914] text-sm text-white placeholder-[#6B7280] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-msg"
                  className="block text-xs font-medium text-[#D1D5DB] mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share broadcaster stream details or feedback..."
                  className="w-full p-3.5 rounded-lg bg-[#111827] border border-[#1F2937] focus:border-[#E50914] text-sm text-white placeholder-[#6B7280] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-sm font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </article>
      )}
    </div>
  );
};
