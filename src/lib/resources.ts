export const RESOURCE_LINKS = {
  code: {
    label: "Code",
    href: "https://github.com/OpenWAM-Official/OpenWAM",
  },
  arxiv: {
    label: "arXiv",
    href: "https://arxiv.org/abs/2609.07398",
  },
  huggingFace: {
    label: "Model & Data",
    href: "https://huggingface.co/OpenWAM",
  },
  /* The RoboDojo-facing port of the policy, maintained in XPolicyLab
     alongside the other manipulation policies it is benchmarked against.
     It carries the batched inference the official checkpoint does not. */
  xPolicyLab: {
    label: "XPolicyLab",
    href: "https://github.com/XPolicyLab/XPolicyLab/tree/main/policy/OpenWAM",
  },
} as const;

export type ResourceLink = {
  label: string;
  href: string;
  pending?: boolean;
};
