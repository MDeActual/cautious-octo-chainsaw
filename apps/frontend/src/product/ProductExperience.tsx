import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { evidenceRequest, type Evidence, type Connection } from "./evidenceApi";
import {
  services,
  scorePercentage,
  teiSource,
  type Language,
  type Journey,
} from "./model";
import "./product.css";
import TeiScenario from "./TeiScenario";

interface Props {
  configured?: boolean;
  authenticated?: boolean;
  tenantId?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}
const nav: { id: Journey; en: string; fr: string }[] = [
  { id: "overview", en: "Overview", fr: "Aperçu" },
  { id: "assessment", en: "Assessment", fr: "Évaluation" },
  { id: "responsibility", en: "Responsibilities", fr: "Responsabilités" },
  { id: "services", en: "Services", fr: "Services" },
  { id: "value", en: "Business value", fr: "Valeur" },
];
const path = (id: Journey): string => (id === "overview" ? "/" : `/${id}`);
const responsibilities = [
  [
    "Identity & access",
    "Identité et accès",
    "Choose who can sign in, require appropriate authentication, and review access regularly.",
    "Déterminez qui peut se connecter, exigez une authentification appropriée et révisez les accès régulièrement.",
  ],
  [
    "Devices & endpoints",
    "Appareils et terminaux",
    "Maintain device protection, updates, and clear ownership of endpoint policies.",
    "Maintenez la protection des appareils, les mises à jour et une attribution claire des politiques.",
  ],
  [
    "Data & collaboration",
    "Données et collaboration",
    "Classify information and decide how it is shared, retained, and protected.",
    "Classez les renseignements et décidez comment les partager, les conserver et les protéger.",
  ],
  [
    "Monitoring & response",
    "Surveillance et intervention",
    "Agree who reviews alerts and who acts. A dashboard does not replace an incident response plan.",
    "Convenez des responsables du suivi des alertes et des interventions. Un tableau de bord ne remplace pas un plan d’intervention.",
  ],
];
export default function ProductExperience({
  configured = false,
  authenticated = false,
  tenantId,
  onLogin,
  onLogout,
}: Props): React.ReactElement {
  const [lang, setLang] = useState<Language>(() => {
    try {
      return localStorage.getItem("securepulse-language") === "fr"
        ? "fr"
        : "en";
    } catch {
      return "en";
    }
  });
  const t = (en: string, fr: string): string => (lang === "en" ? en : fr);
  const location = useLocation();
  const segment = location.pathname.split("/")[1];
  const journey: Journey =
    segment === "app" || segment === "login"
      ? "assessment"
      : nav.some((n) => n.id === segment)
        ? (segment as Journey)
        : "overview";
  const [advisor, setAdvisor] = useState(false);
  const [advice, setAdvice] = useState<"start" | "access" | "buy">("start");
  const advisorButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [riskChoice, setRiskChoice] = useState("review");
  const [assessment, setAssessment] = useState<Evidence | null>(null);
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  useEffect(() => {
    document.documentElement.lang = lang === "fr" ? "fr-CA" : "en-CA";
    try {
      localStorage.setItem("securepulse-language", lang);
    } catch {
      /* Preferences are optional. */
    }
  }, [lang]);
  useEffect(() => {
    setSelectedService(null);
    setAdvisor(false);
  }, [location.pathname]);
  useEffect(() => {
    const id = ++requestId.current;
    setAssessment(null);
    setError(null);
    setNotice(null);
    setBusy(false);
    setConnection(null);
    if (authenticated && tenantId)
      void evidenceRequest<Connection>(tenantId, "connection").then(
        (result) => {
          if (id === requestId.current) setConnection(result.data);
        },
      );
    return () => {
      requestId.current += 1;
    };
  }, [tenantId, authenticated]);
  useEffect(() => {
    if (advisor) closeButton.current?.focus();
  }, [advisor]);
  const closeAdvisor = (): void => {
    setAdvisor(false);
    advisorButton.current?.focus();
  };
  const load = async (
    action: "current" | "connect" | "refresh" | "disconnect",
  ): Promise<void> => {
    if (!authenticated || !tenantId || busy) return;
    const id = ++requestId.current;
    setBusy(true);
    setError(null);
    setNotice(null);
    setAssessment(null);
    const result = await evidenceRequest<Evidence>(
      tenantId,
      action,
      action === "current" ? "GET" : "POST",
    );
    if (requestId.current !== id) return;
    if (result.error)
      setError(
        t(
          "The assessment could not be retrieved. Check your access and connection, then try again. No sample data has been substituted.",
          "Impossible de récupérer l’évaluation. Vérifiez vos accès et votre connexion, puis réessayez. Aucune donnée fictive n’a été substituée.",
        ),
      );
    else if (action === "disconnect") {
      setConnection((c) => (c ? { ...c, connected: false } : null));
      setNotice(
        t(
          "Disconnected from assessment collection for this account. Microsoft consent and retained findings are unchanged.",
          "Collecte désactivée pour ce compte. Le consentement Microsoft et les résultats conservés sont inchangés.",
        ),
      );
    } else {
      setAssessment(result.data);
      if (action === "connect")
        setConnection((c) => ({
          configured: c?.configured ?? true,
          storage_ready: c?.storage_ready ?? true,
          connected: true,
        }));
    }
    setBusy(false);
  };
  const score = scorePercentage(
    assessment?.secure_score.current,
    assessment?.secure_score.max,
  );
  return (
    <div className="sp">
      <a className="sp-skip" href="#main">
        {t("Skip to content", "Aller au contenu")}
      </a>
      <header className="sp-header">
        <Link to="/" className="sp-brand" aria-label="SecurePulse home">
          <span className="sp-mark" aria-hidden="true">
            ∿
          </span>
          <span>
            SecurePulse<small>BY CLOUDMATRIX</small>
          </span>
        </Link>
        <nav
          aria-label={t("Main navigation", "Navigation principale")}
          className="sp-nav"
        >
          {nav.map((n) => (
            <Link
              key={n.id}
              to={path(n.id)}
              aria-current={journey === n.id ? "page" : undefined}
            >
              {n[lang]}
            </Link>
          ))}
        </nav>
        <div className="sp-header-actions">
          <button
            className="sp-language"
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            aria-label={t("Passer en français", "Switch to English")}
          >
            {lang === "en" ? "FR" : "EN"}
          </button>
          {authenticated ? (
            <button className="sp-signin" onClick={onLogout}>
              {t("Sign out", "Déconnexion")}
            </button>
          ) : (
            <Link className="sp-signin" to="/assessment">
              {t("Sign in", "Connexion")} <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </header>
      <main id="main">
        {journey === "overview" && (
          <>
            <section className="sp-hero sp-container">
              <div className="sp-hero-copy">
                <p className="sp-eyebrow">
                  <span />
                  {t(
                    "CLARITY. CONTROL. CONFIDENCE.",
                    "CLARTÉ. CONTRÔLE. CONFIANCE.",
                  )}
                </p>
                <h1>
                  {t("Security you can", "Une sécurité")}
                  <br />
                  <em>{t("make sense of.", "qui devient claire.")}</em>
                </h1>
                <p className="sp-intro">
                  {t(
                    "Understand your Microsoft 365 security. See what matters. Choose your next step with confidence.",
                    "Comprenez la sécurité de votre Microsoft 365. Voyez ce qui compte. Choisissez la suite en toute confiance.",
                  )}
                </p>
                <div className="sp-actions">
                  <Link className="sp-button" to="/assessment">
                    {t("Explore your assessment", "Explorer votre évaluation")}{" "}
                    <span>↗</span>
                  </Link>
                  <Link className="sp-text-link" to="/services">
                    {t("Explore services", "Explorer les services")}{" "}
                    <span>→</span>
                  </Link>
                </div>
                <p className="sp-fine">
                  {t(
                    "A read-only approach. Your decisions. Your pace.",
                    "Une approche en lecture seule. Vos décisions. À votre rythme.",
                  )}
                </p>
              </div>
              <div
                className="sp-hero-art"
                aria-label={t(
                  "Illustration of connected security layers",
                  "Illustration de couches de sécurité reliées",
                )}
                role="img"
              >
                <div className="sp-flow sp-flow-a" />
                <div className="sp-flow sp-flow-b" />
                <div className="sp-flow sp-flow-c" />
                <div className="sp-orbit sp-orbit-one" />
                <div className="sp-orbit sp-orbit-two" />
                <div className="sp-art-center">
                  <span className="sp-art-icon">∿</span>
                  <span>SecurePulse</span>
                  <small>{t("A clearer view", "Une vision plus claire")}</small>
                </div>
                <span className="sp-art-label sp-label-one">
                  {t("Identity", "Identité")}
                </span>
                <span className="sp-art-label sp-label-two">
                  {t("Data", "Données")}
                </span>
                <span className="sp-art-label sp-label-three">
                  {t("People", "Équipes")}
                </span>
              </div>
            </section>
            <div className="sp-principles sp-container">
              <span>
                {t(
                  "Built around Microsoft 365",
                  "Conçu autour de Microsoft 365",
                )}
              </span>
              <span>
                {t(
                  "Evidence before recommendations",
                  "Les données avant les recommandations",
                )}
              </span>
              <span>{t("English & français", "Français et anglais")}</span>
            </div>
            <section className="sp-section sp-container">
              <div className="sp-section-heading">
                <p className="sp-eyebrow">
                  {t(
                    "FROM COMPLEXITY TO CLARITY",
                    "DE LA COMPLEXITÉ À LA CLARTÉ",
                  )}
                </p>
                <h2>
                  {t("A clear path forward.", "Une voie claire pour avancer.")}
                </h2>
                <p>
                  {t(
                    "You don’t need to become a security expert to make an informed decision.",
                    "Pas besoin de devenir spécialiste en sécurité pour prendre une décision éclairée.",
                  )}
                </p>
              </div>
              <div className="sp-three-grid">
                {[
                  {
                    no: "01",
                    title: t("Understand", "Comprendre"),
                    body: t(
                      "Know what Microsoft protects and what remains your responsibility.",
                      "Sachez ce que Microsoft protège et ce qui demeure votre responsabilité.",
                    ),
                    to: "/responsibility",
                  },
                  {
                    no: "02",
                    title: t("See the evidence", "Voir les données"),
                    body: t(
                      "Connect an authorized account for a read-only assessment. Missing evidence stays visible.",
                      "Connectez un compte autorisé pour une évaluation en lecture seule. Les données manquantes restent visibles.",
                    ),
                    to: "/assessment",
                  },
                  {
                    no: "03",
                    title: t("Choose your support", "Choisir votre soutien"),
                    body: t(
                      "Take action yourself, with your IT provider, or with CloudMatrix.",
                      "Agissez vous-même, avec votre fournisseur TI ou avec CloudMatrix.",
                    ),
                    to: "/services",
                  },
                ].map((c) => (
                  <Link to={c.to} className="sp-path-card" key={c.no}>
                    <span className="sp-step">{c.no}</span>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                    <span className="sp-card-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="sp-callout sp-container">
              <div>
                <p className="sp-eyebrow">
                  {t("YOUR CLOUD. YOUR CHOICES.", "VOTRE NUAGE. VOS CHOIX.")}
                </p>
                <h2>
                  {t(
                    "Start with a question.",
                    "Tout commence par une question.",
                  )}
                </h2>
                <p>
                  {t(
                    "Explore the approach with SecurePulse Advisor. No account needed.",
                    "Explorez l’approche avec SecurePulse Advisor. Aucun compte requis.",
                  )}
                </p>
              </div>
              <button
                className="sp-button"
                onClick={() => {
                  setAdvice("start");
                  setAdvisor(true);
                }}
              >
                {t("Meet your guide", "Rencontrer votre guide")} ↗
              </button>
            </section>
          </>
        )}
        {journey !== "overview" && (
          <div className="sp-container sp-inner">
            <p className="sp-eyebrow">
              SECUREPULSE /{" "}
              {nav.find((n) => n.id === journey)?.[lang].toUpperCase()}
            </p>
            {journey === "assessment" && (
              <>
                <h1>
                  {t("Start with the evidence.", "Commencez par les données.")}
                </h1>
                <p className="sp-intro">
                  {t(
                    "A read-only view of Microsoft Secure Score, with clear boundaries around access and interpretation.",
                    "Une vue en lecture seule du Microsoft Secure Score, avec des limites claires quant aux accès et à l’interprétation.",
                  )}
                </p>
                <div className="sp-two-grid">
                  <section className="sp-panel">
                    <span className="sp-pill">
                      {authenticated
                        ? t("SIGNED IN", "CONNECTÉ")
                        : t("NOT CONNECTED", "NON CONNECTÉ")}
                    </span>
                    <h2>{t("Your assessment", "Votre évaluation")}</h2>
                    {!authenticated ? (
                      <>
                        <p>
                          {t(
                            "Sign-in identifies you. Access to security data also requires administrator consent, an appropriate Microsoft security role, and explicit SecurePulse authorization.",
                            "La connexion vous identifie. L’accès aux données de sécurité exige aussi le consentement d’un administrateur, un rôle de sécurité Microsoft approprié et une autorisation SecurePulse explicite.",
                          )}
                        </p>
                        <button
                          className="sp-button"
                          disabled={!configured}
                          onClick={onLogin}
                        >
                          {t(
                            "Continue with Microsoft",
                            "Continuer avec Microsoft",
                          )}{" "}
                          ↗
                        </button>
                        {!configured && (
                          <p className="sp-notice">
                            {t(
                              "Sign-in is not configured in this preview. No tenant is connected and no security data is being collected.",
                              "La connexion n’est pas configurée dans cet aperçu. Aucun environnement n’est connecté et aucune donnée de sécurité n’est recueillie.",
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p>
                          {t(
                            "Only explicitly authorized assessment members can retrieve stored results. Signing in does not automatically grant access.",
                            "Seuls les membres explicitement autorisés peuvent consulter les résultats enregistrés. La connexion n’accorde pas automatiquement cet accès.",
                          )}
                        </p>
                        <div className="sp-actions">
                          <button
                            className="sp-button"
                            disabled={busy}
                            onClick={() => void load("current")}
                          >
                            {busy
                              ? t("Loading…", "Chargement…")
                              : t(
                                  "Retrieve assessment",
                                  "Consulter l’évaluation",
                                )}
                          </button>
                          <button
                            className="sp-secondary"
                            disabled={busy}
                            onClick={() =>
                              void load(
                                connection?.connected ? "refresh" : "connect",
                              )
                            }
                          >
                            {connection?.connected
                              ? t(
                                  "Refresh assessment",
                                  "Actualiser l’évaluation",
                                )
                              : t("Connect & assess", "Connecter et évaluer")}
                          </button>
                          {connection?.connected && (
                            <button
                              className="sp-secondary"
                              disabled={busy}
                              onClick={() => void load("disconnect")}
                            >
                              {t("Disconnect", "Déconnecter")}
                            </button>
                          )}
                        </div>
                        {connection &&
                          (!connection.configured ||
                            !connection.storage_ready) && (
                            <p className="sp-notice">
                              {t(
                                "Live collection is not ready: Graph or durable storage configuration is missing.",
                                "La collecte réelle n’est pas prête : la configuration Graph ou du stockage durable est manquante.",
                              )}
                            </p>
                          )}
                      </>
                    )}
                    {notice && (
                      <p className="sp-notice" role="status">
                        {notice}
                      </p>
                    )}
                    {error && (
                      <p role="alert" className="sp-notice sp-error">
                        {error}
                      </p>
                    )}
                    <div className="sp-evidence" aria-live="polite">
                      <span>
                        {t("Microsoft Secure Score", "Microsoft Secure Score")}
                      </span>
                      <strong>{score === null ? "—" : `${score}%`}</strong>
                      <p>
                        {score === null
                          ? t(
                              "No verified result available. This does not mean your score is zero.",
                              "Aucun résultat vérifié disponible. Cela ne signifie pas que votre score est nul.",
                            )
                          : t(
                              "Based on the retrieved assessment. Secure Score is not a breach probability or a compliance certification.",
                              "Selon l’évaluation récupérée. Secure Score n’est ni une probabilité de violation ni une certification de conformité.",
                            )}
                      </p>
                      {assessment && (
                        <small>
                          {t("Assessed", "Évalué")} :{" "}
                          {new Date(assessment.collected_at).toLocaleString(
                            lang === "fr" ? "fr-CA" : "en-CA",
                          )}
                        </small>
                      )}
                      {assessment && (
                        <>
                          <p>
                            {t(
                              "Source: Microsoft Graph. Control profiles describe Microsoft guidance, not automatically verified deficiencies.",
                              "Source : Microsoft Graph. Les profils de contrôle décrivent les conseils de Microsoft, et non des lacunes automatiquement vérifiées.",
                            )}
                          </p>
                          {assessment.controls.slice(0, 8).map((control) => (
                            <details className="sp-control" key={control.id}>
                              <summary>{control.title}</summary>
                              <p>{control.description}</p>
                              <small>
                                {control.category} ·{" "}
                                {control.score_gap === null
                                  ? t(
                                      "No observed score gap",
                                      "Écart de points non observé",
                                    )
                                  : `${t("Observed point gap", "Écart de points observé")} : ${control.score_gap}`}
                              </small>
                            </details>
                          ))}
                        </>
                      )}
                    </div>
                  </section>
                  <aside className="sp-panel sp-panel-muted">
                    <h2>{t("What you control", "Ce que vous contrôlez")}</h2>
                    <ul className="sp-list">
                      <li>
                        {t(
                          "Read-only collection, not automatic remediation.",
                          "Collecte en lecture seule, sans correction automatique.",
                        )}
                      </li>
                      <li>
                        {t(
                          "No claim that missing data is a security failure.",
                          "Les données manquantes ne sont pas présentées comme une défaillance de sécurité.",
                        )}
                      </li>
                      <li>
                        {t(
                          "Security posture does not determine your buying intent.",
                          "Votre posture de sécurité ne détermine pas votre intention d’achat.",
                        )}
                      </li>
                      <li>
                        {t(
                          "You choose your next step and your provider.",
                          "Vous choisissez la prochaine étape et votre fournisseur.",
                        )}
                      </li>
                    </ul>
                    <p className="sp-fine">
                      {t(
                        "Signing out ends this app session; it does not revoke Microsoft tenant consent. An administrator manages that consent in Microsoft Entra.",
                        "La déconnexion termine cette session; elle ne révoque pas le consentement Microsoft. Un administrateur gère ce consentement dans Microsoft Entra.",
                      )}
                    </p>
                    <a
                      href="https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t(
                        "Manage application permissions",
                        "Gérer les autorisations des applications",
                      )}{" "}
                      ↗
                    </a>
                  </aside>
                </div>
              </>
            )}
            {journey === "responsibility" && (
              <>
                <h1>{t("Security is shared.", "La sécurité se partage.")}</h1>
                <p className="sp-intro">
                  {t(
                    "Make ownership explicit, before a gap becomes a problem.",
                    "Clarifiez les responsabilités avant qu’une lacune devienne un problème.",
                  )}
                </p>
                <p className="sp-notice">
                  {t(
                    "Working responsibility guide, not a contract or compliance determination. The original CloudMatrix matrix and its rules still need validation.",
                    "Guide de travail, et non un contrat ou une conclusion de conformité. La matrice CloudMatrix originale et ses règles doivent encore être validées.",
                  )}
                </p>
                <div className="sp-responsibilities">
                  {responsibilities.map((r, i) => (
                    <details key={r[0]} open={i === 0}>
                      <summary>
                        <span className="sp-step">0{i + 1}</span>
                        <h2>{r[lang === "en" ? 0 : 1]}</h2>
                        <span className="sp-plus" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <div className="sp-responsibility-body">
                        <p>{r[lang === "en" ? 2 : 3]}</p>
                        <div className="sp-three-grid">
                          <div>
                            <h3>Microsoft</h3>
                            <p>
                              {t(
                                "Operates the underlying cloud service according to its applicable terms and service model.",
                                "Exploite le service infonuagique sous-jacent selon ses modalités et son modèle de service.",
                              )}
                            </p>
                          </div>
                          <div>
                            <h3>
                              {t("Your organization", "Votre organisation")}
                            </h3>
                            <p>
                              {t(
                                "Owns decisions about accounts, data, access, and the configuration it controls.",
                                "Prend les décisions concernant les comptes, les données, les accès et la configuration qu’elle contrôle.",
                              )}
                            </p>
                          </div>
                          <div>
                            <h3>CloudMatrix</h3>
                            <p>
                              {t(
                                "Can support only the responsibilities explicitly included in an approved service scope.",
                                "Peut soutenir uniquement les responsabilités incluses dans un mandat de service approuvé.",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
                <section className="sp-panel">
                  <h2>
                    {t(
                      "How would you approach an open issue?",
                      "Comment aborderiez-vous un enjeu non résolu?",
                    )}
                  </h2>
                  <p>
                    {t(
                      "This local planning choice changes no permissions, score, contract, or liability.",
                      "Ce choix de planification local ne modifie aucune autorisation, note, obligation contractuelle ni responsabilité juridique.",
                    )}
                  </p>
                  <fieldset className="sp-choices">
                    <legend>
                      {t("Planning preference", "Préférence de planification")}
                    </legend>
                    {[
                      [
                        "review",
                        "Review with my IT team",
                        "Revoir avec mon équipe TI",
                      ],
                      [
                        "help",
                        "Explore professional help",
                        "Explorer l’aide professionnelle",
                      ],
                      [
                        "defer",
                        "Defer for a documented review",
                        "Reporter pour une révision documentée",
                      ],
                    ].map((c) => (
                      <label key={c[0]}>
                        <input
                          type="radio"
                          name="risk"
                          value={c[0]}
                          checked={riskChoice === c[0]}
                          onChange={() => setRiskChoice(c[0])}
                        />
                        {c[lang === "en" ? 1 : 2]}
                      </label>
                    ))}
                  </fieldset>
                </section>
              </>
            )}
            {journey === "services" && (
              <>
                <h1>
                  {t("Your next step, your way.", "La suite, à votre façon.")}
                </h1>
                <p className="sp-intro">
                  {t(
                    "Explore support directly. An assessment is optional, not a gate to browsing services.",
                    "Explorez le soutien directement. L’évaluation est facultative et n’est pas un préalable à la consultation des services.",
                  )}
                </p>
                <p className="sp-notice">
                  {t(
                    "Service concepts for review. Package scope, exclusions, prerequisites, pricing, billing and terms require approval before purchase is available.",
                    "Concepts de services à examiner. Les mandats, exclusions, préalables, prix, modalités de facturation et conditions doivent être approuvés avant tout achat.",
                  )}
                </p>
                <div className="sp-three-grid">
                  {services.map((s, i) => (
                    <section className="sp-service-card" key={s.id}>
                      <span className="sp-step">0{i + 1}</span>
                      <h2>{s.title[lang]}</h2>
                      <p>{s.description[lang]}</p>
                      <span className="sp-pill">
                        {t(
                          "NOT YET AVAILABLE TO BUY",
                          "ACHAT NON ENCORE DISPONIBLE",
                        )}
                      </span>
                      <button
                        className="sp-secondary"
                        onClick={() => setSelectedService(s.id)}
                      >
                        {t("Review details", "Voir les détails")} →
                      </button>
                    </section>
                  ))}
                </div>
                {selectedService && (
                  <section
                    className="sp-panel sp-service-detail"
                    aria-live="polite"
                  >
                    <button
                      className="sp-close"
                      onClick={() => setSelectedService(null)}
                      aria-label={t(
                        "Close service details",
                        "Fermer les détails",
                      )}
                    >
                      ×
                    </button>
                    <p className="sp-eyebrow">
                      {t("BEFORE YOU COMMIT", "AVANT DE VOUS ENGAGER")}
                    </p>
                    <h2>
                      {
                        services.find((s) => s.id === selectedService)?.title[
                          lang
                        ]
                      }
                    </h2>
                    <p>
                      {t(
                        "No order has been created. This package is not configured for sale.",
                        "Aucune commande n’a été créée. Ce forfait n’est pas configuré pour la vente.",
                      )}
                    </p>
                    <dl className="sp-definition">
                      {[
                        t("Scope & exclusions", "Mandat et exclusions"),
                        t(
                          "Prerequisites & onboarding",
                          "Préalables et intégration",
                        ),
                        t(
                          "Price, currency & recurrence",
                          "Prix, devise et récurrence",
                        ),
                        t("Terms & cancellation", "Conditions et annulation"),
                      ].map((label) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>
                            {t("Awaiting approval", "En attente d’approbation")}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <button disabled className="sp-button">
                      {t("Checkout unavailable", "Paiement non disponible")}
                    </button>
                  </section>
                )}
                <div className="sp-section-heading sp-space">
                  <h2>
                    {t("Prefer another path?", "Vous préférez une autre voie?")}
                  </h2>
                  <p>
                    {t(
                      "Use Microsoft’s guidance yourself, work with your current IT provider, or explore CloudMatrix. Your findings should support your decision, not pressure it.",
                      "Utilisez les conseils de Microsoft, collaborez avec votre fournisseur TI actuel ou explorez CloudMatrix. Vos résultats doivent éclairer votre décision, sans pression.",
                    )}
                  </p>
                  <a
                    className="sp-text-link"
                    href="https://learn.microsoft.com/en-us/defender-xdr/microsoft-secure-score"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Microsoft Learn ↗
                  </a>
                </div>
              </>
            )}
            {journey === "value" && (
              <>
                <h1>
                  {t(
                    "Value, without the guesswork.",
                    "La valeur, sans improvisation.",
                  )}
                </h1>
                <p className="sp-intro">
                  {t(
                    "A transparent business case starts with a source, not a promise.",
                    "Une analyse de rentabilité transparente commence par une source, pas une promesse.",
                  )}
                </p>
                <div className="sp-two-grid">
                  <section className="sp-panel">
                    <p className="sp-eyebrow">FORRESTER / FEBRUARY 2025</p>
                    <h2>
                      The Total Economic Impact™ Of Microsoft 365 For Business
                    </h2>
                    <p>
                      {t(
                        "This Microsoft-commissioned study examines Microsoft 365 adoption economics. Its composite organization is not your organization, and its results are not a SecurePulse ROI guarantee.",
                        "Cette étude commandée par Microsoft porte sur la valeur économique de l’adoption de Microsoft 365. Son organisation composite n’est pas la vôtre, et ses résultats ne garantissent pas le rendement de SecurePulse.",
                      )}
                    </p>
                    <a
                      className="sp-button"
                      href={teiSource}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("Read the source report", "Lire le rapport source")} ↗
                    </a>
                  </section>
                  <TeiScenario lang={lang} />
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <footer className="sp-footer sp-container">
        <Link className="sp-brand" to="/">
          SecurePulse<small>BY CLOUDMATRIX</small>
        </Link>
        <p>
          {t(
            "Evidence-led decisions. Human control.",
            "Des décisions éclairées. Un contrôle humain.",
          )}
        </p>
        <span>
          {t(
            "Product preview · Live commerce disabled",
            "Aperçu du produit · Vente en ligne désactivée",
          )}
        </span>
      </footer>
      <button
        ref={advisorButton}
        className="sp-advisor-launch"
        onClick={() => {
          setAdvice("start");
          setAdvisor(true);
        }}
        aria-expanded={advisor}
        aria-controls="advisor-panel"
      >
        <span aria-hidden="true">✧</span>{" "}
        {t("Ask SecurePulse", "Demander à SecurePulse")}
      </button>
      {advisor && (
        <div
          className="sp-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAdvisor();
          }}
        >
          <section
            id="advisor-panel"
            className="sp-advisor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisor-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeAdvisor();
              if (e.key === "Tab") {
                const nodes =
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    "button, a[href]",
                  );
                const first = nodes[0];
                const last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <button
              className="sp-close"
              ref={closeButton}
              onClick={closeAdvisor}
              aria-label={t("Close advisor", "Fermer le guide")}
            >
              ×
            </button>
            <p className="sp-eyebrow">SECUREPULSE ADVISOR</p>
            <h2 id="advisor-title">
              {t("A little clarity?", "Un peu de clarté?")}
            </h2>
            <p className="sp-fine">
              {t(
                "Guided preview using reviewed product guidance. Not a live AI conversation. No tenant data is sent to an AI service.",
                "Aperçu guidé à partir de conseils produit révisés. Il ne s’agit pas d’une conversation IA en direct. Aucune donnée n’est envoyée à un service d’IA.",
              )}
            </p>
            <div className="sp-advisor-options">
              {[
                ["start", "Where should I start?", "Par où commencer?"],
                [
                  "access",
                  "What access is needed?",
                  "Quels accès sont requis?",
                ],
                ["buy", "Can I buy directly?", "Puis-je acheter directement?"],
              ].map((a) => (
                <button
                  key={a[0]}
                  className={advice === a[0] ? "active" : ""}
                  onClick={() => setAdvice(a[0] as typeof advice)}
                >
                  {a[lang === "en" ? 1 : 2]}
                </button>
              ))}
            </div>
            <div className="sp-advice" aria-live="polite">
              {advice === "start" ? (
                <>
                  <p>
                    {t(
                      "Start with responsibilities if you want context, or the read-only assessment if you have authorized Microsoft access. You can browse services without connecting your tenant.",
                      "Commencez par les responsabilités pour mieux comprendre, ou par l’évaluation si vous disposez des accès Microsoft autorisés. Vous pouvez consulter les services sans connecter votre environnement.",
                    )}
                  </p>
                  <Link to="/responsibility">
                    {t(
                      "Explore responsibilities",
                      "Explorer les responsabilités",
                    )}{" "}
                    →
                  </Link>
                </>
              ) : advice === "access" ? (
                <>
                  <p>
                    {t(
                      "Sign-in alone is not enough. The assessment requires administrator consent, an appropriate Microsoft security role, and explicit access to SecurePulse findings. No write permissions are requested for the read-only assessment.",
                      "La connexion seule ne suffit pas. L’évaluation exige le consentement d’un administrateur, un rôle de sécurité Microsoft approprié et un accès explicite aux résultats SecurePulse. L’évaluation en lecture seule ne demande aucune autorisation d’écriture.",
                    )}
                  </p>
                  <Link to="/assessment">
                    {t("Review assessment access", "Voir les accès requis")} →
                  </Link>
                </>
              ) : (
                <>
                  <p>
                    {t(
                      "The direct purchase path is being prepared. Today, package details and commercial terms are not approved, so checkout is disabled. No order or payment can be placed in this preview.",
                      "Le parcours d’achat direct est en préparation. Les forfaits et conditions commerciales ne sont pas encore approuvés; le paiement est donc désactivé. Aucune commande ni aucun paiement n’est possible dans cet aperçu.",
                    )}
                  </p>
                  <Link to="/services">
                    {t(
                      "Explore service concepts",
                      "Explorer les concepts de services",
                    )}{" "}
                    →
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
