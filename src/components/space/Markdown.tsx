import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Renders Logbook Markdown: GitHub-flavoured Markdown plus $inline$ and $$block$$ maths.
// Raw HTML is not rendered, and react-markdown strips unsafe link protocols.
export default function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div
      className={`prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-12 prose-a:text-mint prose-a:no-underline hover:prose-a:underline prose-strong:text-star prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-line prose-pre:bg-deep prose-blockquote:border-mint/50 prose-blockquote:font-normal prose-blockquote:text-haze [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none prose-img:rounded-2xl prose-img:border prose-img:border-line prose-hr:border-line prose-th:text-star prose-p:text-star/85 prose-li:text-star/85 prose-li:marker:text-mint ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ href = "", children }) => {
            const external = /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src = "", alt = "" }) => <img src={typeof src === "string" ? src : ""} alt={alt} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
