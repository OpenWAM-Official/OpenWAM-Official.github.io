export const RESOURCE_LINKS = {
  code: {
    label: "Code",
    href: "https://github.com/OpenWAM-Official/OpenWAM",
  },
  arxiv: {
    label: "arXiv",
    /* Paper is not on arXiv yet. `pending` renders the button dimmed and
       non-clickable instead of linking somewhere broken. Drop the flag and
       fill in `href` once the preprint is up. */
    href: "",
    pending: true,
  },
  huggingFace: {
    label: "Model & Data",
    href: "https://huggingface.co/OpenWAM",
  },
} as const;

export type ResourceLink = {
  label: string;
  href: string;
  pending?: boolean;
};
