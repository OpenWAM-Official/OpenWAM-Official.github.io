/* OpenWAM-α: what the model is, what it was trained on, how it runs.
 *
 * Transcribed from Sections 5.1 and 5.2 and Table 4. Every number here is the
 * paper's; nothing is rounded except where the paper itself rounds (the
 * abstract's "roughly 6,400 hours" is Table 4's 6,369). */

/* The composition C(E, S, M) of Section 5.1.1, in the order a forward pass
 * touches it. This is the recipe of Section 4 instantiated — each stage names
 * the study question that chose it. */
export const ARCHITECTURE = [
  {
    stage: "Visual encoder",
    value: "Wan2.2-VAE",
    detail:
      "Frozen. Encodes causally: the first frame alone, then groups of four. The first latent frame therefore stays a clean anchor of the present.",
    from: "Q3",
    frozen: true,
  },
  {
    stage: "World stream",
    value: "Wan2.2-TI2V-5B",
    detail:
      "Pretrained DiT, width 3072, 3D RoPE over the (frame, height, width) grid. Denoises the future frames of the video window in latent space.",
    from: "Q2",
    frozen: false,
  },
  {
    stage: "Action stream",
    value: "ActionDiT",
    detail:
      "Dedicated backbone, width 1024, 1D RoPE over the chunk index. One token per noised action step.",
    from: "Q1",
    frozen: false,
  },
  {
    stage: "Coupling",
    value: "Joint self-attention",
    detail:
      "All 30 paired layers act as bridge layers, projecting both residual widths into a shared 24-head × 128-dim attention space.",
    from: "Q1",
    frozen: false,
  },
  {
    stage: "Visibility",
    value: "Mutual mask",
    detail:
      "Both streams read each other freely; clean first-frame rows attend to neither noised future frames nor actions.",
    from: "Q4",
    frozen: false,
  },
  {
    stage: "Language",
    value: "umT5",
    detail:
      "Frozen. Maps the instruction into a 4096-dim context that both streams consume through their own cross-attention.",
    from: "—",
    frozen: true,
  },
] as const;

/* Table 4. `share` is the per-epoch sample share under proportional sampling,
 * which is why it is not simply curated frames over the total. */
export const DATA_SOURCES = [
  {
    source: "Egocentric data",
    ours: true,
    type: "Human video",
    embodiments: 1,
    fps: 30,
    coverage: ["in-the-wild human manipulation"],
    fullFrames: 744.9,
    fullHours: 6897,
    frames: 155.7,
    hours: 1442,
    share: 30.1,
  },
  {
    source: "AgiBotWorld-Beta",
    ours: false,
    type: "Real robot",
    embodiments: 1,
    fps: 15,
    coverage: ["Bimanual", "Mobile", "Dexterous"],
    fullFrames: 124.5,
    fullHours: 2306,
    frames: 96.9,
    hours: 1794,
    share: 18.6,
  },
  {
    source: "RoboCOIN",
    ours: false,
    type: "Real robot",
    embodiments: 15,
    fps: 30,
    coverage: ["Bimanual", "Mobile", "Dexterous"],
    fullFrames: 104.5,
    fullHours: 956,
    frames: 74.1,
    hours: 686,
    share: 14.3,
  },
  {
    source: "DROID",
    ours: false,
    type: "Real robot",
    embodiments: 1,
    fps: 10,
    coverage: ["Single"],
    fullFrames: 46.3,
    fullHours: 1285,
    frames: 36.3,
    hours: 1007,
    share: 7.0,
  },
  {
    source: "InternData-A1",
    ours: false,
    type: "Simulation",
    embodiments: 4,
    fps: 30,
    coverage: ["Single", "Bimanual"],
    fullFrames: 313.7,
    fullHours: 2904,
    frames: 155.5,
    hours: 1440,
    share: 30.0,
  },
] as const;

export const DATA_TOTALS = {
  embodiments: 21,
  fullFrames: 1333.9,
  fullHours: 14348,
  frames: 518.5,
  hours: 6369,
} as const;

/* The three data types the mixture combines, which is the axis the co-training
 * finding is about — not the same grouping as the source list. */
export const DATA_TYPES = [
  { type: "Human video", share: 30.1, color: "#62A932" },
  { type: "Real robot", share: 39.9, color: "#1B6FD4" },
  { type: "Simulation", share: 30.0, color: "#8B9AAF" },
] as const;

/* Section 5.1.2 / 5.1.3. */
export const TRAINING = [
  {
    label: "Action space",
    value: "80-D unified",
    detail:
      "Two mirrored 34-D arm blocks — end-effector position (3), 6D rotation (6), gripper (1), dexterous hand (24) — plus 12 slots for embodiment-specific channels. A validity mask confines supervision to the populated coordinates.",
  },
  {
    label: "Objective",
    value: "Joint flow matching",
    detail:
      "λv = λa = 1, bell-shaped timestep weighting peaked at intermediate noise. Per-stream timesteps drawn independently, both warped with ρ = 5 to bias toward high noise.",
  },
  {
    label: "Schedule",
    value: "One-stage co-training",
    detail:
      "Video DiT (from pretrained Wan2.2-TI2V-5B weights), ActionDiT and the proprioception encoder all update; umT5 and the VAE stay frozen.",
  },
] as const;

export const DEPLOYMENT = [
  {
    label: "Denoising",
    value: "Synchronized, 10 steps",
    detail:
      "Both streams advance in lockstep along the diagonal of the joint noise plane, so neither leads. The first latent frame is clamped to the current observation and re-pinned after every step.",
  },
  {
    label: "Latency",
    value: "≈170 ms / chunk",
    detail:
      "The loop is compiled to a fixed-shape graph replayed under CUDA graphs, stable velocity predictions are reused across adjacent steps, prompt embeddings are cached, and no VAE decode runs in the control path.",
  },
  {
    label: "Inference mode",
    value: "Synchronous",
    detail:
      "Every reported evaluation pauses execution until the next chunk is predicted, then executes it exactly as predicted — so the numbers reflect the model itself rather than a scheduling policy.",
  },
] as const;
