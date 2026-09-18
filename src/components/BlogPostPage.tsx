import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, User, Share2, Link as LinkIcon, Mail, MessageCircle, Check, ChevronRight } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';
import { Lazy, ModalLoading } from '../lib/lazyModules';
import { responsiveImg } from '../lib/images';
import { SITE_URL, postSeoTitle, clampDescription } from '../lib/seo';

interface BlogPostPageProps {
  slug: string;
}

// Related reading: other posts from the same planner first, starting just
// after this one so every article links to different neighbours (not the
// same three everywhere), then the newest posts from the other planners.
function pickRelated(post: BlogPost, count = 3): BlogPost[] {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const rotated = [...BLOG_POSTS.slice(idx + 1), ...BLOG_POSTS.slice(0, idx)];
  const same = rotated.filter((p) => p.pathway === post.pathway);
  const others = [...BLOG_POSTS].reverse().filter((p) => p.slug !== post.slug && p.pathway !== post.pathway);
  return [...same, ...others].slice(0, count);
}

// Standalone article page. Routed at /blog/:slug (see App.tsx + vercel.json
// rewrite). Each post gets its own real, shareable URL instead of living
// inside a modal, so a link posted anywhere lands directly on that article.
export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  const post = useMemo(() => BLOG_POSTS.find((p) => p.slug === slug) || null, [slug]);
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [isSelfCareOpen, setIsSelfCareOpen] = useState(false);
  const [inquireOpened, setInquireOpened] = useState(false);
  const [selfCareOpened, setSelfCareOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const postUrl = post ? `${SITE_URL}/blog/${post.slug}` : SITE_URL;

  // Per-article title, description and canonical. The same values ship in
  // the prerendered HTML (scripts/prerender-blog.mjs, along with the
  // BlogPosting/FAQPage/BreadcrumbList JSON-LD), so this only keeps the
  // live document in sync. Structured data is NOT re-injected here: doing so
  // used to leave duplicate Article and FAQPage blocks on every article.
  useEffect(() => {
    if (!post) return;
    const prevTitle = document.title;
    document.title = postSeoTitle(post);

    const metaDescription = document.querySelector('meta[name="description"]');
    const prevDescription = metaDescription ? metaDescription.getAttribute('content') : null;
    if (metaDescription) metaDescription.setAttribute('content', clampDescription(post.summary));

    let canonical = document.querySelector('link[rel="canonical"]');
    const hadCanonical = !!canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', postUrl);

    return () => {
      document.title = prevTitle;
      if (metaDescription && prevDescription !== null) metaDescription.setAttribute('content', prevDescription);
      if (!hadCanonical && canonical) canonical.remove();
    };
  }, [post, postUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = postUrl;
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (!post) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.summary, url: postUrl });
      } catch {
        /* user cancelled share sheet, non-fatal */
      }
    } else {
      copyLink();
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-serif italic">Article not found</h1>
          <a
            href="/"
            className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  const emailHref = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Thought you'd like this: ${postUrl}`)}`;
  const smsHref = `sms:?&body=${encodeURIComponent(`${post.title} ${postUrl}`)}`;
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const related = pickRelated(post);
  const openDatePlanner = () => {
    setInquireOpened(true);
    setIsInquireOpen(true);
  };
  const openSelfCarePlanner = () => {
    setSelfCareOpened(true);
    setIsSelfCareOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816]">
      <header className="border-b border-[#E8E2D9] bg-[#FAF8F5]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Swoon Plans
          </a>
          <a
            href="/blog"
            className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
          >
            The Journal
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <article>
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377] font-bold">
            {post.category} • {post.readTime}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif italic font-light text-[#1A1816] mt-3 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#8C8377] font-sans italic mt-4">
            <User className="w-3.5 h-3.5 text-[#D5C29F]" />
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>

          {/* Share row */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pb-6 border-b border-[#E8E2D9]">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#8C8377] font-bold flex items-center gap-1.5 mr-1">
              <Share2 className="w-3.5 h-3.5" /> Share
            </span>
            <button
              onClick={nativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] text-[10px] uppercase tracking-[0.15em] font-sans font-bold rounded cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E8E2D9] hover:bg-[#F1E7D6] text-[#1A1816] text-[10px] uppercase tracking-[0.15em] font-sans font-bold rounded cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
            {isMobile && (
              <a
                href={smsHref}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E8E2D9] hover:bg-[#F1E7D6] text-[#1A1816] text-[10px] uppercase tracking-[0.15em] font-sans font-bold rounded cursor-pointer transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Text
              </a>
            )}
            <a
              href={emailHref}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E8E2D9] hover:bg-[#F1E7D6] text-[#1A1816] text-[10px] uppercase tracking-[0.15em] font-sans font-bold rounded cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          </div>

          <div className="relative rounded overflow-hidden h-64 sm:h-96 border border-[#E8E2D9] mt-8">
            <img
              {...responsiveImg(post.image, '(min-width: 768px) 704px, 100vw')}
              alt={post.title}
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-[#1A1816] text-[#FAF8F5] p-5 rounded border-l-4 border-[#D5C29F] space-y-1 mt-8">
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#D5C29F] font-bold">
              KEY TAKEAWAY
            </p>
            <p className="text-sm sm:text-base font-serif italic text-white/90">
              "{post.keyTakeaway}"
            </p>
          </div>

          <div className="space-y-4 font-sans text-sm sm:text-base text-[#38332E] leading-relaxed font-light mt-8">
            {post.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#E8E2D9]">
              <h2 className="text-xl font-serif italic text-[#1A1816] mb-5">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white/60 border border-[#E8E2D9] rounded p-4">
                    <p className="text-sm font-bold font-sans text-[#1A1816]">{faq.question}</p>
                    <p className="text-sm font-sans font-light text-[#6E675F] mt-1.5 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End-of-article CTA, matched to the planner the post is about. */}
          <div className="mt-12 pt-8 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#EFEDEB]/60 rounded p-6">
            {post.pathway === 'kidPlans' ? (
              <>
                <div>
                  <p className="text-sm font-serif italic text-[#1A1816]">Planning family time?</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#8C8377] mt-1">12 quick questions about your kid's personality, not just their age.</p>
                </div>
                <a
                  href="/kid-plans"
                  className="px-6 py-3 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer whitespace-nowrap"
                >
                  START A KID PLAN
                </a>
              </>
            ) : post.pathway === 'selfCare' ? (
              <>
                <div>
                  <p className="text-sm font-serif italic text-[#1A1816]">Want a day that's just yours?</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#8C8377] mt-1">Curated solo itineraries built around your vibe.</p>
                </div>
                <button
                  onClick={openSelfCarePlanner}
                  className="px-6 py-3 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer whitespace-nowrap"
                >
                  PLAN MY DAY
                </button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-serif italic text-[#1A1816]">Ready for a curated date plan?</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#8C8377] mt-1">Answer 20 short questions today.</p>
                </div>
                <button
                  onClick={openDatePlanner}
                  className="px-6 py-3 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer whitespace-nowrap"
                >
                  FIRST PLAN FREE
                </button>
              </>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-serif italic text-[#1A1816] mb-5">More From the Journal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <a
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block bg-[#EFEDEB]/60 border border-[#E8E2D9] rounded-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      {...responsiveImg(p.image, '(min-width: 640px) 224px, 100vw')}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-serif italic text-[#1A1816] leading-snug group-hover:text-[#8C8377] transition-colors">
                      {p.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#1A1816]">
                      Read <ChevronRight className="w-3 h-3 text-[#D5C29F]" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Planners are code-split and load on first open. */}
      <Lazy
        k="date"
        load={inquireOpened}
        fallback={isInquireOpen ? <ModalLoading /> : null}
        isOpen={isInquireOpen}
        onClose={() => setIsInquireOpen(false)}
      />
      <Lazy
        k="selfCare"
        load={selfCareOpened}
        fallback={isSelfCareOpen ? <ModalLoading /> : null}
        isOpen={isSelfCareOpen}
        onClose={() => setIsSelfCareOpen(false)}
      />
    </div>
  );
};
