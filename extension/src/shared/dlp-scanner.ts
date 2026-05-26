import { DlpResult } from "./types";

// Maximum text length to scan (100KB) to avoid blocking the UI thread
const MAX_SCAN_LENGTH = 100_000;

// Flagging threshold — risk_score >= this value triggers a flag
const FLAG_THRESHOLD = 20;

interface PatternDef {
  name: string;
  regex: RegExp;
  weight: number;
  validate?: (match: string) => boolean;
}

const PATTERNS: PatternDef[] = [
  // ═══════════════════════════════════════════════════════
  // PII — Personally Identifiable Information
  // ═══════════════════════════════════════════════════════
  {
    name: "email",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    weight: 10,
  },
  {
    name: "phone",
    regex: /(?:\+?[1-9]\d{0,2}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\b/g,
    weight: 10,
  },
  {
    name: "ssn",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    weight: 40,
  },
  {
    name: "ssn_no_dashes",
    regex: /\b(?:SSN|social\s*security)\s*[#:\-]?\s*\d{9}\b/gi,
    weight: 40,
  },
  {
    name: "passport",
    regex: /\b(?:passport\s*[#:\-]?\s*)?[A-Z]{1,2}\d{6,9}\b/g,
    weight: 35,
  },
  {
    name: "date_of_birth",
    regex: /\b(?:DOB|Date of Birth|born|birthday|birthdate|d\.o\.b)\s*[:\-=]?\s*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/gi,
    weight: 20,
  },
  {
    name: "drivers_license",
    regex: /\b(?:DL|driver'?s?\s*license|license\s*(?:no|num|number|#))\s*[:\-=]?\s*[A-Z0-9]{5,15}\b/gi,
    weight: 30,
  },
  {
    name: "address",
    regex: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Rd|Road|Ct|Court|Way|Pl|Place|Pkwy|Parkway|Cir|Circle|Terr|Terrace)\.?(?:\s*(?:#|Apt|Suite|Unit|Ste|Fl)\s*\w+)?\b/g,
    weight: 15,
  },
  {
    name: "national_id",
    regex: /\b(?:national\s*ID|citizen\s*ID|ID\s*number|personal\s*ID|NIN|NIE|DNI|Aadhar|Aadhaar)\s*[:\-#]?\s*[A-Z0-9\-]{6,15}\b/gi,
    weight: 35,
  },
  {
    name: "full_name_context",
    regex: /\b(?:full\s*name|patient\s*name|client\s*name|employee\s*name|customer\s*name|applicant)\s*[:\-=]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/gi,
    weight: 15,
  },
  {
    name: "gender_ethnicity",
    regex: /\b(?:gender|sex|race|ethnicity)\s*[:\-=]\s*\w+/gi,
    weight: 10,
  },

  // ═══════════════════════════════════════════════════════
  // Financial — Payment & Banking Data
  // ═══════════════════════════════════════════════════════
  {
    name: "credit_card",
    regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b/g,
    weight: 30,
    validate: luhnCheck,
  },
  {
    name: "iban",
    regex: /\b[A-Z]{2}\d{2}\s?[A-Z0-9]{4}\s?(?:\d{4}\s?){2,7}\d{1,4}\b/g,
    weight: 30,
  },
  {
    name: "swift_bic",
    regex: /\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    weight: 20,
  },
  {
    name: "bank_routing",
    regex: /\b(?:routing|ABA|transit|sort\s*code)\s*[#:\-]?\s*\d{6,9}\b/gi,
    weight: 25,
  },
  {
    name: "bank_account",
    regex: /\b(?:account|acct|IBAN)\s*[#:\-]?\s*\d{8,17}\b/gi,
    weight: 25,
  },
  {
    name: "cvv",
    regex: /\b(?:CVV|CVC|CVV2|CVC2|security\s*code)\s*[:\-=]?\s*\d{3,4}\b/gi,
    weight: 35,
  },
  {
    name: "expiry_date",
    regex: /\b(?:exp(?:iry|iration)?(?:\s*date)?)\s*[:\-=]?\s*\d{2}\s*[\/\-]\s*\d{2,4}\b/gi,
    weight: 20,
  },
  {
    name: "crypto_wallet",
    regex: /\b(?:0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}|[LM][a-km-zA-HJ-NP-Z1-9]{26,33})\b/g,
    weight: 25,
  },
  {
    name: "crypto_seed",
    regex: /\b(?:seed\s*phrase|mnemonic|recovery\s*phrase)\s*[:\-=]?\s*(?:[a-z]+\s+){11,23}[a-z]+\b/gi,
    weight: 50,
  },

  // ═══════════════════════════════════════════════════════
  // Credentials, Secrets & Keys
  // ═══════════════════════════════════════════════════════
  {
    name: "aws_key",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    weight: 40,
  },
  {
    name: "aws_secret",
    regex: /\b(?:aws_secret_access_key|AWS_SECRET)\s*[=:]\s*["']?[a-zA-Z0-9\/+=]{40}["']?/gi,
    weight: 45,
  },
  {
    name: "github_token",
    regex: /\b(?:ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{22,}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36})\b/g,
    weight: 40,
  },
  {
    name: "openai_key",
    regex: /\bsk-[a-zA-Z0-9]{20,}T3BlbkFJ[a-zA-Z0-9]{20,}\b/g,
    weight: 40,
  },
  {
    name: "stripe_key",
    regex: /\b(?:sk_live_|sk_test_|pk_live_|pk_test_|rk_live_|rk_test_)[a-zA-Z0-9]{20,}\b/g,
    weight: 40,
  },
  {
    name: "slack_token",
    regex: /\bxox[bpas]-[a-zA-Z0-9\-]{10,250}\b/g,
    weight: 35,
  },
  {
    name: "slack_webhook",
    regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/g,
    weight: 35,
  },
  {
    name: "gcp_key",
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    weight: 35,
  },
  {
    name: "gcp_service_account",
    regex: /"type"\s*:\s*"service_account"/g,
    weight: 40,
  },
  {
    name: "azure_key",
    regex: /\b[a-zA-Z0-9+\/]{86}==\b/g,
    weight: 30,
  },
  {
    name: "azure_connection",
    regex: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+/g,
    weight: 40,
  },
  {
    name: "jwt",
    regex: /\beyJ[a-zA-Z0-9\-_]+\.eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_.+\/=]+\b/g,
    weight: 30,
  },
  {
    name: "oauth_token",
    regex: /\b(?:ya29\.[a-zA-Z0-9_\-]{50,}|1\/[a-zA-Z0-9_\-]{43}|1\/[a-zA-Z0-9_\-]{64})\b/g,
    weight: 35,
  },
  {
    name: "generic_secret",
    regex:
      /(?:api[_-]?key|api[_-]?secret|access[_-]?token|auth[_-]?token|secret[_-]?key|client[_-]?secret|password|passwd|credentials|private[_-]?key|encryption[_-]?key|signing[_-]?key|master[_-]?key)\s*[=:]\s*["']?[a-zA-Z0-9\-_.\/+=]{16,}["']?/gi,
    weight: 30,
  },
  {
    name: "private_key",
    regex: /-----BEGIN\s(?:RSA\s|EC\s|DSA\s|OPENSSH\s|PGP\s|ENCRYPTED\s)?PRIVATE\sKEY(?:\sBLOCK)?-----/g,
    weight: 50,
  },
  {
    name: "certificate",
    regex: /-----BEGIN\s(?:CERTIFICATE|X509\sCRL|PKCS7)-----/g,
    weight: 25,
  },
  {
    name: "ssh_key",
    regex: /\bssh-(?:rsa|ed25519|dss|ecdsa)\s+[A-Za-z0-9+\/=]{50,}/g,
    weight: 40,
  },
  {
    name: "connection_string",
    regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqps?|mssql|sqlite|mariadb|cockroachdb):\/\/[^\s"']{10,}/gi,
    weight: 40,
  },
  {
    name: "dsn",
    regex: /https:\/\/[a-f0-9]{32}@(?:o\d+|[a-z]+)\.ingest\.sentry\.io\/\d+/g,
    weight: 25,
  },
  {
    name: "env_variable",
    regex: /^[A-Z][A-Z0-9_]{2,50}=["']?[^\s"']{8,}["']?$/gm,
    weight: 20,
  },
  {
    name: "password_plain",
    regex: /\b(?:password|passwd|pwd)\s*[=:]\s*["']?[^\s"']{6,}["']?/gi,
    weight: 35,
  },
  {
    name: "sendgrid_key",
    regex: /\bSG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}\b/g,
    weight: 35,
  },
  {
    name: "twilio_key",
    regex: /\bSK[a-f0-9]{32}\b/g,
    weight: 35,
  },
  {
    name: "firebase_key",
    regex: /\b(?:FIREBASE_|firebase[_-])(?:API_KEY|TOKEN|SECRET|CREDENTIALS)\s*[=:]\s*\S+/gi,
    weight: 35,
  },
  {
    name: "npm_token",
    regex: /\bnpm_[a-zA-Z0-9]{36}\b/g,
    weight: 35,
  },
  {
    name: "docker_auth",
    regex: /\b(?:"auth"\s*:\s*"[A-Za-z0-9+\/=]{20,}")/g,
    weight: 30,
  },
  {
    name: "heroku_key",
    regex: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/g,
    weight: 15,
  },

  // ═══════════════════════════════════════════════════════
  // Network & Infrastructure
  // ═══════════════════════════════════════════════════════
  {
    name: "ip_private",
    regex:
      /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    weight: 15,
  },
  {
    name: "ipv6",
    regex: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    weight: 10,
  },
  {
    name: "internal_url",
    regex: /https?:\/\/(?:[a-z0-9-]+\.)?(?:internal|local|corp|intranet|staging|dev|test|sandbox|preprod|uat)\.[a-z0-9.-]+/gi,
    weight: 20,
  },
  {
    name: "mac_address",
    regex: /\b(?:[0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}\b/g,
    weight: 10,
  },
  {
    name: "server_path",
    regex: /(?:\/(?:etc|var|home|root|usr|opt|srv|mnt)\/[^\s"']{5,}|[A-Z]:\\(?:Users|Windows|Program Files|System32)\\[^\s"']{5,})/g,
    weight: 15,
  },
  {
    name: "kubernetes_secret",
    regex: /\bkind:\s*Secret\b|\bkubectl\s+(?:create|get|describe)\s+secret\b/gi,
    weight: 30,
  },
  {
    name: "cidr_range",
    regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}\b/g,
    weight: 15,
  },

  // ═══════════════════════════════════════════════════════
  // Health, Legal & Compliance
  // ═══════════════════════════════════════════════════════
  {
    name: "medical_record",
    regex: /\b(?:MRN|patient\s*ID|medical\s*record|health\s*ID|NHI|NHS)\s*[#:\-]?\s*[A-Z0-9]{5,15}\b/gi,
    weight: 40,
  },
  {
    name: "health_info",
    regex: /\b(?:diagnosis|medication|prescription|treatment|blood\s*type|allergy|ICD[\-\s]?10|CPT\s*code|condition|symptom|prognosis)\s*[:\-=]\s*.{3,}/gi,
    weight: 35,
  },
  {
    name: "health_insurance",
    regex: /\b(?:insurance\s*ID|policy\s*number|member\s*ID|group\s*number|subscriber\s*ID)\s*[:\-#]?\s*[A-Z0-9\-]{5,20}\b/gi,
    weight: 30,
  },
  {
    name: "tax_id",
    regex: /\b(?:EIN|TIN|tax\s*ID|VAT|GST|ABN)\s*[:\-#]?\s*[A-Z0-9\-]{6,15}\b/gi,
    weight: 35,
  },
  {
    name: "legal_case",
    regex: /\b(?:case\s*(?:no|number|#)|docket|filing|court\s*order)\s*[:\-#]?\s*[A-Z0-9\-]{4,20}\b/gi,
    weight: 25,
  },
  {
    name: "gdpr_data",
    regex: /\b(?:data\s*subject|right\s*to\s*erasure|consent\s*withdrawal|personal\s*data\s*breach|GDPR\s*article)\b/gi,
    weight: 20,
  },
  {
    name: "biometric",
    regex: /\b(?:fingerprint|biometric|retina|facial\s*recognition|voiceprint|iris\s*scan)\s*[:\-=]?\s*\S+/gi,
    weight: 40,
  },

  // ═══════════════════════════════════════════════════════
  // Source Code, IP & Business Intelligence
  // ═══════════════════════════════════════════════════════
  {
    name: "code",
    regex:
      /(?:^|\n)\s*(?:function\s+\w+|def\s+\w+|class\s+\w+|import\s+[\w{]|from\s+\S+\s+import|#include\s*[<"]|export\s+(?:default\s+)?(?:function|class|const|interface)|package\s+\w+|using\s+\w+|namespace\s+\w+|pub\s+(?:fn|struct|enum)|impl\s+\w+|func\s+\w+)/gm,
    weight: 5,
  },
  {
    name: "sql_query",
    regex: /\b(?:SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|GRANT\s+|REVOKE\s+)\s+/gi,
    weight: 15,
  },
  {
    name: "database_schema",
    regex: /\b(?:CREATE\s+(?:TABLE|INDEX|VIEW|SCHEMA|DATABASE)|ADD\s+COLUMN|FOREIGN\s+KEY|PRIMARY\s+KEY|REFERENCES)\b/gi,
    weight: 20,
  },
  {
    name: "proprietary_marker",
    regex: /\b(?:CONFIDENTIAL|PROPRIETARY|INTERNAL\s+ONLY|DO\s+NOT\s+DISTRIBUTE|TRADE\s+SECRET|NDA|RESTRICTED|TOP\s+SECRET|CLASSIFIED|SENSITIVE|EMBARGO|UNDER\s+NDA|NOT\s+FOR\s+PUBLIC)\b/gi,
    weight: 25,
  },
  {
    name: "revenue_financials",
    regex: /\b(?:revenue|profit|EBITDA|gross\s*margin|net\s*income|ARR|MRR|burn\s*rate|runway|valuation|cap\s*table)\s*[:\-=]?\s*\$?[\d,]+(?:\.\d+)?(?:\s*[MBKmk](?:illion)?)?\b/gi,
    weight: 30,
  },
  {
    name: "customer_data_bulk",
    regex: /(?:(?:name|email|phone|address|ssn|dob|account)\s*[,|;\t]){3,}/gi,
    weight: 35,
  },
  {
    name: "salary_compensation",
    regex: /\b(?:salary|compensation|bonus|equity|stock\s*options|RSU|base\s*pay|OTE)\s*[:\-=]?\s*\$?[\d,]+/gi,
    weight: 25,
  },
  {
    name: "meeting_notes",
    regex: /\b(?:board\s*meeting|exec\s*meeting|all\s*hands|standup|sprint\s*retro|1:1|one-on-one)\s*(?:notes|minutes|summary|recap)\b/gi,
    weight: 15,
  },
  {
    name: "merger_acquisition",
    regex: /\b(?:merger|acquisition|M&A|due\s*diligence|LOI|letter\s*of\s*intent|term\s*sheet|acqui-?hire)\b/gi,
    weight: 30,
  },
  {
    name: "infrastructure_config",
    regex: /\b(?:terraform|ansible|cloudformation|helm|docker-compose)\b.*(?:resource|module|service|provider)/gi,
    weight: 20,
  },
];

/**
 * Scan text for sensitive data patterns.
 * Runs entirely in the browser — no data leaves the extension.
 */
export function scanForSensitiveData(text: string): DlpResult {
  if (!text || text.length === 0) {
    return {
      patterns_detected: [],
      pattern_counts: {},
      risk_score: 0,
      content_length: 0,
      flagged: false,
    };
  }

  const fullLength = text.length;

  // Truncate for performance on large pastes
  const scanText = text.length > MAX_SCAN_LENGTH
    ? text.slice(0, MAX_SCAN_LENGTH)
    : text;

  const patternCounts: Record<string, number> = {};
  let riskScore = 0;

  for (const pattern of PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0;

    const matches = scanText.match(pattern.regex);
    if (!matches || matches.length === 0) continue;

    // Apply validation if defined (e.g., Luhn check for credit cards)
    const validMatches = pattern.validate
      ? matches.filter(pattern.validate)
      : matches;

    if (validMatches.length === 0) continue;

    patternCounts[pattern.name] = validMatches.length;
    riskScore += validMatches.length * pattern.weight;
  }

  riskScore = Math.min(100, riskScore);

  const patternsDetected = Object.keys(patternCounts);

  return {
    patterns_detected: patternsDetected,
    pattern_counts: patternCounts,
    risk_score: riskScore,
    content_length: fullLength,
    flagged: riskScore >= FLAG_THRESHOLD,
  };
}

/**
 * Luhn algorithm to validate credit card numbers.
 * Filters out random digit sequences that look like card numbers but aren't.
 */
function luhnCheck(value: string): boolean {
  const digits = value.replace(/[-\s]/g, "");

  // Must be 13-19 digits
  if (digits.length < 13 || digits.length > 19) return false;
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}
