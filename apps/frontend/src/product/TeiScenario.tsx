import { useState } from "react";
import { calculateTei, type TeiInputs } from "../lib/tei";
import type { Language } from "./model";
type ScalarKey = Exclude<keyof TeiInputs, "licenses">;
const fields: {
  key: ScalarKey;
  en: string;
  fr: string;
  max?: number;
  step?: number;
}[] = [
  { key: "users", en: "Users", fr: "Utilisateurs", step: 1 },
  {
    key: "userHourly",
    en: "Loaded user hourly cost (USD)",
    fr: "Coût horaire chargé par utilisateur (USD)",
  },
  {
    key: "itHourly",
    en: "Loaded IT hourly cost (USD)",
    fr: "Coût horaire chargé TI (USD)",
  },
  {
    key: "retiredConference",
    en: "Annual retired conferencing cost (USD)",
    fr: "Coût annuel de conférence éliminé (USD)",
  },
  {
    key: "retiredAntivirus",
    en: "Annual retired antivirus cost (USD)",
    fr: "Coût annuel d’antivirus éliminé (USD)",
  },
  {
    key: "amortizedServers",
    en: "Annual amortized server savings (USD)",
    fr: "Économies annuelles de serveurs amortis (USD)",
  },
  {
    key: "amortizedStorage",
    en: "Annual amortized storage savings (USD)",
    fr: "Économies annuelles de stockage amorti (USD)",
  },
  {
    key: "retiredMsp",
    en: "Annual retired MSP cost (USD)",
    fr: "Coût annuel de fournisseur TI éliminé (USD)",
  },
  {
    key: "licenseHoursMonthly",
    en: "Monthly license administration hours saved",
    fr: "Heures mensuelles économisées : licences",
  },
  {
    key: "serverHoursMonthly",
    en: "Monthly server maintenance hours saved",
    fr: "Heures mensuelles économisées : serveurs",
  },
  {
    key: "collaborationHoursWeekly",
    en: "Weekly collaboration hours saved per user",
    fr: "Heures hebdomadaires économisées par utilisateur : collaboration",
  },
  {
    key: "storageHoursWeekly",
    en: "Weekly file-storage hours saved per user",
    fr: "Heures hebdomadaires économisées par utilisateur : fichiers",
  },
  {
    key: "productivityRecapture",
    en: "Productivity recapture fraction (0–1)",
    fr: "Fraction de productivité récupérée (0–1)",
    max: 1,
  },
  {
    key: "onboardingHoursAnnual",
    en: "Annual onboarding hours saved",
    fr: "Heures annuelles économisées : intégration",
  },
  {
    key: "managementHoursAnnual",
    en: "Annual user-management hours saved",
    fr: "Heures annuelles économisées : gestion des utilisateurs",
  },
  {
    key: "helpdeskHoursAnnual",
    en: "Annual helpdesk hours saved",
    fr: "Heures annuelles économisées : soutien",
  },
  {
    key: "patchHoursAnnual",
    en: "Annual patching hours saved",
    fr: "Heures annuelles économisées : correctifs",
  },
  {
    key: "consultancy",
    en: "Initial consultancy cost (USD)",
    fr: "Coût initial de consultation (USD)",
  },
  {
    key: "migrationHours",
    en: "Initial IT migration hours",
    fr: "Heures TI initiales de migration",
  },
  {
    key: "setupHours",
    en: "Initial IT setup hours",
    fr: "Heures TI initiales de configuration",
  },
  {
    key: "trainingHours",
    en: "Initial training hours per user",
    fr: "Heures initiales de formation par utilisateur",
  },
  { key: "itStaff", en: "IT staff count", fr: "Nombre de membres TI", step: 1 },
  {
    key: "managementFraction",
    en: "Ongoing management time fraction (0–1)",
    fr: "Fraction de temps de gestion continue (0–1)",
    max: 1,
  },
  {
    key: "annualItSalary",
    en: "Loaded annual IT salary (USD)",
    fr: "Salaire annuel chargé TI (USD)",
  },
];
export default function TeiScenario({
  lang,
}: {
  lang: Language;
}): React.ReactElement {
  const t = (en: string, fr: string): string => (lang === "en" ? en : fr);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof calculateTei> | null>(
    null,
  );
  const [error, setError] = useState(false);
  const change = (key: string, value: string): void => {
    setValues((v) => ({ ...v, [key]: value }));
    setResult(null);
    setError(false);
  };
  const calculate = (event: React.FormEvent): void => {
    event.preventDefault();
    try {
      const input = Object.fromEntries(
        fields.map((f) => [f.key, Number(values[f.key])]),
      ) as unknown as TeiInputs;
      if (
        [...fields.map((f) => f.key), "licenseCount", "licensePrice"].some(
          (k) => values[k] === undefined || values[k].trim() === "",
        )
      )
        throw new Error("All inputs required");
      input.licenses = [
        {
          count: Number(values["licenseCount"]),
          monthlyPrice: Number(values["licensePrice"]),
        },
      ];
      setResult(calculateTei(input));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  };
  const money = (value: number): string =>
    new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  return (
    <section className="sp-panel sp-panel-muted">
      <span className="sp-pill">
        {t("SOURCE-BASED SCENARIO · USD", "SCÉNARIO BASÉ SUR LA SOURCE · USD")}
      </span>
      <h2>
        {t("Build your adoption scenario", "Créer votre scénario d’adoption")}
      </h2>
      <p>
        {t(
          "Microsoft 365 adoption only, not SecurePulse service ROI. All inputs are your scenario assumptions. Enter zero explicitly where a category does not apply. Nothing is sent or saved.",
          "Adoption de Microsoft 365 uniquement, et non rendement des services SecurePulse. Toutes les données sont vos hypothèses. Inscrivez zéro lorsqu’une catégorie ne s’applique pas. Rien n’est envoyé ni enregistré.",
        )}
      </p>
      <details>
        <summary>
          {t(
            "Source assumptions & limitations",
            "Hypothèses de la source et limites",
          )}
        </summary>
        <p>
          {t(
            "Three-year horizon; 10% annual discount rate; constant annual inputs. Report adjustments: technology and productivity benefits −15%, administration benefits −10%, licensing costs +5%, initial and ongoing management costs +10%. These are study uncertainty adjustments, not cyber-risk premiums. License pricing is supplied by you, not current Microsoft pricing. This form supports one blended license price. No currency conversion or tax estimate. Include retired MSP cost only when genuinely displaced; do not double-count labor savings. New MSSP package fees are excluded, so this is not justification for a package purchase.",
            "Horizon de trois ans; taux d’actualisation annuel de 10 %; données annuelles constantes. Ajustements du rapport : avantages technologiques et de productivité −15 %, administration −10 %, licences +5 %, coûts initiaux et gestion continue +10 %. Il s’agit d’ajustements d’incertitude, et non de primes de cyberrisque. Vous fournissez le prix des licences; ce n’est pas un tarif Microsoft actuel. Ce formulaire utilise un prix moyen unique de licence. Aucune conversion de devise ni estimation fiscale. Incluez les coûts du fournisseur TI uniquement s’ils sont réellement éliminés; évitez le double comptage des économies de main-d’œuvre. Les nouveaux frais MSSP sont exclus : ce modèle ne justifie donc pas l’achat d’un forfait.",
          )}
        </p>
      </details>
      <details className="sp-scenario-form">
        <summary>
          {t("Enter your assumptions", "Saisir vos hypothèses")}
        </summary>
        <form onSubmit={calculate}>
          <div className="sp-input-grid">
            {fields.map((f) => (
              <label key={f.key} htmlFor={`tei-${f.key}`}>
                {f[lang]}
                <input
                  id={`tei-${f.key}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={f.max}
                  step={f.step ?? "any"}
                  required
                  value={values[f.key] ?? ""}
                  onChange={(e) => change(f.key, e.target.value)}
                />
              </label>
            ))}
            <label htmlFor="tei-licenseCount">
              {t("License count", "Nombre de licences")}
              <input
                id="tei-licenseCount"
                type="number"
                min="0"
                step="1"
                required
                value={values["licenseCount"] ?? ""}
                onChange={(e) => change("licenseCount", e.target.value)}
              />
            </label>
            <label htmlFor="tei-licensePrice">
              {t(
                "Monthly blended license price (USD)",
                "Prix mensuel moyen de licence (USD)",
              )}
              <input
                id="tei-licensePrice"
                type="number"
                min="0"
                step="any"
                required
                value={values["licensePrice"] ?? ""}
                onChange={(e) => change("licensePrice", e.target.value)}
              />
            </label>
          </div>
          <button className="sp-button" type="submit">
            {t("Calculate scenario", "Calculer le scénario")}
          </button>
          <button
            className="sp-secondary"
            type="button"
            onClick={() => {
              setValues({});
              setResult(null);
              setError(false);
            }}
          >
            {t("Reset", "Réinitialiser")}
          </button>
        </form>
      </details>
      {error && (
        <p role="alert">
          {t(
            "Check all inputs. Use nonnegative finite values, whole people counts, and fractions from 0 to 1.",
            "Vérifiez les données : valeurs finies positives ou nulles, nombres entiers de personnes et fractions de 0 à 1.",
          )}
        </p>
      )}
      <div className="sp-evidence" aria-live="polite">
        <span>
          {t(
            "Scenario net present value",
            "Valeur actualisée nette du scénario",
          )}
        </span>
        <strong className="sp-financial-result">
          {result ? money(result.netPresentValue) : "—"}
        </strong>
        {result ? (
          <>
            <small>
              {t("Benefits present value", "Valeur actualisée des avantages")} :{" "}
              {money(result.presentBenefits)}
            </small>
            <small>
              {t("Costs present value", "Valeur actualisée des coûts")} :{" "}
              {money(result.presentCosts)}
            </small>
            <small>
              ROI :{" "}
              {result.roi === null
                ? t("Undefined: zero costs", "Indéfini : coûts nuls")
                : `${(result.roi * 100).toFixed(1)}%`}
            </small>
            <p>
              {t(
                "Illustrative scenario, not a quote or guarantee. Validate inputs and applicability before making an investment decision.",
                "Scénario illustratif, ni devis ni garantie. Validez les données et leur pertinence avant toute décision d’investissement.",
              )}
            </p>
          </>
        ) : (
          <small>
            {t(
              "No result until your inputs are supplied.",
              "Aucun résultat sans vos données.",
            )}
          </small>
        )}
      </div>
    </section>
  );
}
