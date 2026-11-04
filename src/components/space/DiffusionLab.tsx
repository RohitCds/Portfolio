"use client";

import { useCallback, useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { SectionHeading } from "./shared";

const REPO = "https://github.com/RohitCds/diffusion-from-scratch";
const NB = (file: string) => `${REPO}/blob/main/notebooks/${file}`;
const MEDIA = "/lab/diffusion";

type Figure = { src: string; alt: string; caption?: string; pixelated?: boolean; narrow?: boolean };
type Question = { q: string; a: string; figure?: Figure };
type Step = { title: string; short: string; body: string[]; figures: Figure[]; questions?: Question[]; facts?: string[]; github: string; githubLabel: string };

const STEPS: Step[] = [
  {
    title: "Images are numbers",
    short: "Numbers",
    body: [
      "A black-and-white image is a grid of numbers. Each number is one pixel's brightness, from 0 (black) to 255 (white).",
      "A colour image is three grids stacked on top of each other: one for red, one for green, one for blue. That's all a computer ever sees.",
    ],
    figures: [
      { src: "01_pixels.png", alt: "Blip, with an 8 by 8 patch zoomed in to show its pixel numbers", caption: "An 8 × 8 patch where Blip's arm meets the saucer, printed as numbers." },
      { src: "01_rgb_channels.png", alt: "Blip split into red, green and blue grids", caption: "The same image as its three colour grids." },
    ],
    github: NB("01_images_and_noise.ipynb"),
    githubLabel: "Notebook 01",
  },
  {
    title: "Adding noise, a little at a time",
    short: "Noise",
    body: [
      "Add a tiny bit of random static to every pixel. Then do it again, about a thousand times, until the image is pure static.",
      "This is a fixed recipe, with no AI involved. Because we choose the noise ourselves, we always know exactly how much went in at each step. That becomes the answer key for training.",
    ],
    figures: [
      { src: "02_forward_noise.gif", alt: "Animation of Blip dissolving into static", pixelated: true, narrow: true },
      { src: "02_forward_strip.png", alt: "Blip at steps 0 to 1000, getting noisier", caption: "Snapshots along the way. By step 1,000 nothing of Blip is left." },
    ],
    github: NB("01_images_and_noise.ipynb"),
    githubLabel: "Notebook 01",
  },
  {
    title: "Training: guess the noise",
    short: "Training",
    body: [
      "Show the model a noisy image and ask it to predict the noise that was added. We hold the answer key, because we added the noise ourselves. The error is the gap between its guess and the true noise.",
      "Gradient descent and backpropagation nudge the model's internal numbers (its \"dials\") in the direction that shrinks the error. Repeat that millions of times.",
      "Over time it learns what real images tend to look like: loose patterns, not exact pixel values. Here it learns handwritten digits, in about 10 minutes on a laptop.",
    ],
    figures: [
      { src: "03_the_quiz.png", alt: "A real digit, the noise added, and the noisy image the model sees", caption: "The quiz: the model only sees the noisy image on the right." },
      { src: "03_noise_guess.png", alt: "After training, the model's noise guess closely matches the real noise", caption: "After training, its guess is close, and removing it brings the digit back." },
    ],
    github: NB("02_training.ipynb"),
    githubLabel: "Notebook 02",
  },
  {
    title: "Generating: static to a digit",
    short: "Generating",
    body: [
      "Start from pure random static. There's no hidden image inside it.",
      "The model treats the static as a real image buried under noise and guesses the noise. We remove only a small slice of that guess, then repeat.",
      "Early steps decide the big layout, middle steps fill in the shape, and late steps add fine detail. Here we asked for a \"7\".",
    ],
    figures: [
      { src: "04_generate_7.gif", alt: "Animation of a 7 emerging from static", pixelated: true, narrow: true },
      { src: "04_coarse_to_fine.png", alt: "The image at each step, and the model's best guess of the final image", caption: "Bottom row: the model's best guess of the finished image. A blur first, sharp at the end." },
      { src: "04_all_digits.png", alt: "A grid of generated digits 0 to 9", caption: "Brand new digits, none copied from the training set." },
    ],
    github: NB("03_generating.ipynb"),
    githubLabel: "Notebook 03",
  },
  {
    title: "I wondered…",
    short: "Questions",
    body: ["The questions I had while learning this, and the answers I reached."],
    figures: [],
    questions: [
      {
        q: "I wondered why we remove only part of the guess.",
        a: "From pure static the guess is poor. The model can't tell which image is underneath, so it predicts the average of all the possibilities, which is a blur. Removing a small slice lets it look again once there's some structure.",
        figure: { src: "05_one_jump_vs_steps.png", alt: "The model's early guess of a 4 is a blurry average; after all the small steps it is sharp" },
      },
      {
        q: "I wondered whether the structure is just its own random output.",
        a: "Yes, nothing outside steers it except what we ask for. But each guess is pulled toward realistic images it learned in training, like a ball rolling downhill. Fresh randomness at each step is why different static gives different images.",
        figure: { src: "05_different_static.png", alt: "Eight different 7s from eight different starting static" },
      },
      {
        q: "I wondered why the first guess isn't sharp, if every training image was sharp.",
        a: "The model was trained to predict noise, not to output finished images. The blur is its uncertainty, averaged over many possible sharp images, and it shrinks as the picture commits to a shape.",
      },
      {
        q: "I wondered whether someone told it what a cat (or a 7) is.",
        a: "No. Real image generators train on billions of image and caption pairs. Nobody explains anything; the model learns that certain words go with certain pixel patterns. Our small model did the same with digit labels.",
      },
      {
        q: "I wondered whether it understands words.",
        a: "Not like a human. Words become embeddings: lists of numbers where similar meanings sit close together. The text embedding guides the model at every denoising step.",
        figure: { src: "05_guidance.png", alt: "The same static with no label, and when asked for a 3" },
      },
    ],
    github: NB("03_generating.ipynb"),
    githubLabel: "Notebook 03",
  },
  {
    title: "Related facts",
    short: "Facts",
    body: [],
    figures: [],
    facts: [
      "Embeddings were made famous by Word2vec (Google, Tomas Mikolov and colleagues, 2013). The idea goes back to a 1950s linguistics saying: \"you shall know a word by the company it keeps.\"",
      "The text-to-image link in many image generators comes from CLIP (OpenAI, 2021), which trains text and image embeddings to land close together.",
      "Stable Diffusion grew out of academic research on diffusion models and was released openly in 2022.",
    ],
    github: REPO,
    githubLabel: "The whole repo",
  },
];

const stepFromHash = () => {
  const m = typeof window !== "undefined" ? window.location.hash.match(/^#step-(\d+)$/) : null;
  const n = m ? Number(m[1]) - 1 : 0;
  return n >= 0 && n < STEPS.length ? n : 0;
};

export default function DiffusionLab() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  useEffect(() => {
    setIndex(stepFromHash());
    const onHash = () => setIndex(stepFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, i));
    setIndex(next);
    history.replaceState(null, "", `#step-${next + 1}`);
    document.getElementById("lab-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  return (
    <section className="relative px-6 pb-24 pt-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading compact index="Lab" eyebrow="Diffusion models, step by step" title={<>How static <span className="text-aurora">becomes a picture.</span></>}>
          Six short steps, from &ldquo;an image is numbers&rdquo; to generating new ones. Every step links to runnable code on GitHub.
        </SectionHeading>

        {/* step dots */}
        <ol className="no-scrollbar -mx-6 mb-8 flex gap-2 overflow-x-auto px-6" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                onClick={() => go(i)}
                aria-current={i === index ? "step" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  i === index ? "border-mint/60 bg-mint/10 text-star" : i < index ? "border-line text-haze" : "border-line text-dim hover:text-haze"
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] ${i <= index ? "bg-mint text-void" : "bg-white/10"}`}>{i + 1}</span>
                {s.short}
              </button>
            </li>
          ))}
        </ol>

        <article id="lab-step" key={index} className="glass scroll-mt-28 rounded-3xl p-6 sm:p-8" aria-live="polite">
          <p className="hud text-mint">Step {index + 1} of {STEPS.length}</p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-star sm:text-4xl">{step.title}</h3>

          <div className="mt-5 space-y-4 text-lg leading-relaxed text-star/85">
            {step.body.map((p) => <p key={p}>{p}</p>)}
          </div>

          {step.figures.length > 0 && (
            <div className="mt-8 space-y-6">
              {step.figures.map((f) => <LabFigure key={f.src} figure={f} />)}
            </div>
          )}

          {step.questions && (
            <div className="mt-8 space-y-6">
              {step.questions.map((q) => (
                <div key={q.q} className="rounded-2xl border border-line bg-white/[0.02] p-5">
                  <p className="font-display text-lg text-mint">{q.q}</p>
                  <p className="mt-2 leading-relaxed text-star/85">{q.a}</p>
                  {q.figure && <div className="mt-4"><LabFigure figure={q.figure} /></div>}
                </div>
              ))}
            </div>
          )}

          {step.facts && (
            <ul className="mt-6 space-y-3">
              {step.facts.map((f) => (
                <li key={f} className="flex gap-3 text-lg leading-relaxed text-star/85">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <a href={step.github} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2">
              <FaGithub /> Open this step on GitHub <span className="hud !text-[10px]">· {step.githubLabel}</span>
            </a>
            <div className="flex gap-2">
              <button onClick={() => go(index - 1)} disabled={index === 0} className="btn-ghost !px-4 !py-2 disabled:pointer-events-none disabled:opacity-30">
                <HiArrowLeft /> Back
              </button>
              {index < STEPS.length - 1 ? (
                <button onClick={() => go(index + 1)} className="btn-primary !px-4 !py-2">
                  Next: {STEPS[index + 1].short} <HiArrowRight />
                </button>
              ) : (
                <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2">
                  <FaGithub /> See all the code
                </a>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function LabFigure({ figure: f }: { figure: Figure }) {
  return (
    <figure className={f.narrow ? "mx-auto max-w-xs" : ""}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${MEDIA}/${f.src}`}
        alt={f.alt}
        loading="lazy"
        className="w-full rounded-2xl border border-line"
        style={f.pixelated ? { imageRendering: "pixelated" } : undefined}
      />
      {f.caption && <figcaption className="mt-2 text-center text-sm text-haze">{f.caption}</figcaption>}
    </figure>
  );
}
