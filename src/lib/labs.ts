// Interactive labs that sit beside a Logbook post (safe to import from server and client code).
// A post picks a lab in the editor, then places markers like {lab:noise} on their own line in its
// Markdown: as the reader scrolls past a marker, the lab switches to that frame.

export type LabFigure = { src: string; alt: string; caption?: string; pixelated?: boolean; narrow?: boolean };

export type LabFrame = {
  id: string; // the marker name: {lab:<id>}
  step: number; // index into the lab's steps
  title: string;
  figures: LabFigure[];
  note?: string;
};

export type Lab = {
  title: string;
  media: string; // folder in /public holding the figures
  repo: string;
  steps: { short: string; github: string; githubLabel: string }[];
  frames: LabFrame[];
};

const DIFFUSION_REPO = "https://github.com/RohitCds/diffusion-from-scratch";
const nb = (file: string) => `${DIFFUSION_REPO}/blob/main/notebooks/${file}`;

export const LABS: Record<string, Lab> = {
  diffusion: {
    title: "Diffusion, step by step",
    media: "/lab/diffusion",
    repo: DIFFUSION_REPO,
    steps: [
      { short: "Numbers", github: nb("01_images_and_noise.ipynb"), githubLabel: "Notebook 01" },
      { short: "Noise", github: nb("01_images_and_noise.ipynb"), githubLabel: "Notebook 01" },
      { short: "Training", github: nb("02_training.ipynb"), githubLabel: "Notebook 02" },
      { short: "Generating", github: nb("03_generating.ipynb"), githubLabel: "Notebook 03" },
      { short: "Questions", github: nb("03_generating.ipynb"), githubLabel: "Notebook 03" },
      { short: "Facts", github: DIFFUSION_REPO, githubLabel: "The whole repo" },
    ],
    frames: [
      {
        id: "numbers",
        step: 0,
        title: "Images are numbers",
        figures: [
          { src: "01_pixels.png", alt: "Blip, with an 8 by 8 patch zoomed in to show its pixel numbers", caption: "An 8 × 8 patch where Blip's arm meets the saucer, printed as numbers." },
          { src: "01_rgb_channels.png", alt: "Blip split into red, green and blue grids", caption: "The same image as its three colour grids." },
        ],
      },
      {
        id: "noise",
        step: 1,
        title: "Adding noise, a little at a time",
        figures: [
          { src: "02_forward_noise.gif", alt: "Animation of Blip dissolving into static", pixelated: true, narrow: true },
          { src: "02_forward_strip.png", alt: "Blip at steps 0 to 1000, getting noisier", caption: "Snapshots along the way. By step 1,000 nothing of Blip is left." },
        ],
      },
      {
        id: "training",
        step: 2,
        title: "Training: guess the noise",
        figures: [
          { src: "03_the_quiz.png", alt: "A real digit, the noise added, and the noisy image the model sees", caption: "The quiz: the model only sees the noisy image on the right." },
          { src: "03_noise_guess.png", alt: "After training, the model's noise guess closely matches the real noise", caption: "After training, its guess is close, and removing it brings the digit back." },
        ],
        note: "This model learns handwritten digits, in about 10 minutes on a laptop.",
      },
      {
        id: "generating",
        step: 3,
        title: "Generating: static to a digit",
        figures: [
          { src: "04_generate_7.gif", alt: "Animation of a 7 emerging from static", pixelated: true, narrow: true },
          { src: "04_coarse_to_fine.png", alt: "The image at each step, and the model's best guess of the final image", caption: "Bottom row: the model's best guess of the finished image. A blur first, sharp at the end." },
        ],
        note: "Here we asked for a \"7\".",
      },
      {
        id: "small-steps",
        step: 4,
        title: "Why only part of the guess?",
        figures: [{ src: "05_one_jump_vs_steps.png", alt: "The model's early guess of a 4 is a blurry average; after all the small steps it is sharp" }],
      },
      {
        id: "randomness",
        step: 4,
        title: "Different static, different image",
        figures: [{ src: "05_different_static.png", alt: "Eight different 7s from eight different starting static", caption: "Eight starting statics, eight different 7s." }],
      },
      {
        id: "blur",
        step: 4,
        title: "Why the first guess is a blur",
        figures: [{ src: "04_coarse_to_fine.png", alt: "The model's best guess of the final image at each step, blurry first and sharp at the end", caption: "Bottom row: the blur shrinks as the picture commits to a shape." }],
      },
      {
        id: "labels",
        step: 4,
        title: "Nobody explained a 7",
        figures: [{ src: "04_all_digits.png", alt: "A grid of generated digits 0 to 9", caption: "Brand new digits, none copied from the training set. It learned which label goes with which shapes." }],
      },
      {
        id: "words",
        step: 4,
        title: "Words steer every step",
        figures: [{ src: "05_guidance.png", alt: "The same static with no label, and when asked for a 3", caption: "The same static, with no label and when asked for a 3." }],
      },
      {
        id: "facts",
        step: 5,
        title: "Run it yourself",
        figures: [],
        note: "Three notebooks: images and noise, training, and generating. Each runs on a laptop.",
      },
    ],
  },
};

export const labFor = (key: string | null | undefined) => (key && key in LABS ? LABS[key] : null);

export type LabChunk = { frame: string | null; markdown: string };

const MARKER = /^\s*\{lab:([a-z0-9-]+)\}\s*$/;

// Splits a post's Markdown at its {lab:…} marker lines (ignoring any inside code blocks)
export function splitLabMarkers(markdown: string): LabChunk[] {
  const chunks: LabChunk[] = [{ frame: null, markdown: "" }];
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const m = fenced ? null : line.match(MARKER);
    if (m) chunks.push({ frame: m[1], markdown: "" });
    else chunks[chunks.length - 1].markdown += line + "\n";
  }
  return chunks.filter((c) => c.frame || c.markdown.trim());
}

// The Markdown without its markers, for posts shown without a lab
export const stripLabMarkers = (markdown: string) => splitLabMarkers(markdown).map((c) => c.markdown).join("");
