export type Language = "en" | "fr";
export type Journey =
  | "overview"
  | "assessment"
  | "responsibility"
  | "services"
  | "value";
export type Service = {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  status: "configuration-required";
  price: null;
  checkoutEnabled: boolean;
};
export const services: Service[] = [
  {
    id: "assessment",
    title: { en: "Understand your posture", fr: "Comprendre votre posture" },
    description: {
      en: "Explore a read-only Microsoft 365 assessment and the evidence behind your next steps.",
      fr: "Explorez une évaluation Microsoft 365 en lecture seule et les données qui orientent vos prochaines étapes.",
    },
    status: "configuration-required",
    price: null,
    checkoutEnabled: false,
  },
  {
    id: "improvement",
    title: { en: "Plan your improvements", fr: "Planifier vos améliorations" },
    description: {
      en: "Clarify priorities with your IT team or discuss a defined scope with CloudMatrix.",
      fr: "Précisez les priorités avec votre équipe TI ou discutez d’un mandat défini avec CloudMatrix.",
    },
    status: "configuration-required",
    price: null,
    checkoutEnabled: false,
  },
  {
    id: "managed",
    title: { en: "Explore managed support", fr: "Explorer le soutien géré" },
    description: {
      en: "Consider ongoing support around your needs, responsibilities, and existing providers.",
      fr: "Envisagez un soutien continu selon vos besoins, vos responsabilités et vos fournisseurs actuels.",
    },
    status: "configuration-required",
    price: null,
    checkoutEnabled: false,
  },
];
export function canPurchase(service: Service): boolean {
  return service.checkoutEnabled === true && service.price !== null;
}
export function scorePercentage(
  raw: number | undefined,
  max: number | undefined,
): number | null {
  if (
    raw === undefined ||
    max === undefined ||
    !Number.isFinite(raw) ||
    !Number.isFinite(max) ||
    max <= 0 ||
    raw < 0 ||
    raw > max
  )
    return null;
  return Math.round((raw / max) * 100);
}
export const teiSource =
  "https://tei.forrester.com/go/Microsoft/365Business/docs/TheTEIOfMicrosoft365ForBusiness.pdf";
