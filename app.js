const form = document.querySelector("#calculatorForm");

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0
});

const stateChurchTax = {
  bw: 0.08,
  by: 0.08,
  be: 0.09,
  bb: 0.09,
  hb: 0.09,
  hh: 0.09,
  he: 0.09,
  mv: 0.09,
  ni: 0.09,
  nw: 0.09,
  rp: 0.09,
  sl: 0.09,
  sn: 0.09,
  st: 0.09,
  sh: 0.09,
  th: 0.09
};

const defaults = {
  mainIncome: 48000,
  spouseIncome: 0,
  sideRevenue: 12000,
  expenses: 3500,
  hours: 8,
  targetHourly: 25,
  state: "by",
  maritalStatus: "single",
  activityType: "service",
  customerType: "private",
  inputVatMode: "none",
  tradeTaxRate: "",
  churchTaxMode: "none",
  customChurchTaxRate: "",
  insurance: "public",
  smallBusiness: "yes",
  foundingYear: "no"
};

const resetDefaults = {
  ...defaults,
  mainIncome: "",
  spouseIncome: "",
  sideRevenue: "",
  expenses: "",
  hours: "",
  tradeTaxRate: ""
};

const fields = {
  mainIncome: document.querySelector("#mainIncome"),
  spouseIncome: document.querySelector("#spouseIncome"),
  spouseIncomeGroup: document.querySelector("#spouseIncomeGroup"),
  sideRevenue: document.querySelector("#sideRevenue"),
  expenses: document.querySelector("#expenses"),
  profit: document.querySelector("#profit"),
  hours: document.querySelector("#hours"),
  targetHourly: document.querySelector("#targetHourly"),
  state: document.querySelector("#state"),
  maritalStatus: document.querySelector("#maritalStatus"),
  activityType: document.querySelector("#activityType"),
  customerType: document.querySelector("#customerType"),
  inputVatMode: document.querySelector("#inputVatMode"),
  inputVatGroup: document.querySelector("#inputVatGroup"),
  revenueHint: document.querySelector("#revenueHint"),
  tradeTaxRate: document.querySelector("#tradeTaxRate"),
  churchTaxMode: document.querySelector("#churchTaxMode"),
  customChurchTaxRate: document.querySelector("#customChurchTaxRate"),
  customChurchTaxGroup: document.querySelector("#customChurchTaxGroup"),
  ratingTitle: document.querySelector("#ratingTitle"),
  ratingBadge: document.querySelector("#ratingBadge"),
  resultSummary: document.querySelector("#resultSummary"),
  summaryMonthlyNet: document.querySelector("#summaryMonthlyNet"),
  summaryHourlyNet: document.querySelector("#summaryHourlyNet"),
  resultProfit: document.querySelector("#resultProfit"),
  vatResultGroup: document.querySelector("#vatResultGroup"),
  vatCompactInfo: document.querySelector("#vatCompactInfo"),
  resultRevenueGross: document.querySelector("#resultRevenueGross"),
  resultRevenueNet: document.querySelector("#resultRevenueNet"),
  resultOutputVat: document.querySelector("#resultOutputVat"),
  resultInputVat: document.querySelector("#resultInputVat"),
  resultVatPayable: document.querySelector("#resultVatPayable"),
  resultTax: document.querySelector("#resultTax"),
  churchTaxRow: document.querySelector("#churchTaxRow"),
  resultChurchTax: document.querySelector("#resultChurchTax"),
  tradeTaxRow: document.querySelector("#tradeTaxRow"),
  resultTradeTax: document.querySelector("#resultTradeTax"),
  resultTotalTax: document.querySelector("#resultTotalTax"),
  resultTaxRate: document.querySelector("#resultTaxRate"),
  resultYearlyNet: document.querySelector("#resultYearlyNet"),
  resultMonthlyNet: document.querySelector("#resultMonthlyNet"),
  resultHourlyNet: document.querySelector("#resultHourlyNet"),
  resultYearlyHours: document.querySelector("#resultYearlyHours"),
  resultRevenueHourly: document.querySelector("#resultRevenueHourly"),
  resultTaxReserve: document.querySelector("#resultTaxReserve"),
  resultVatReserve: document.querySelector("#resultVatReserve"),
  resultReserve: document.querySelector("#resultReserve"),
  resultMonthlyReserve: document.querySelector("#resultMonthlyReserve"),
  resultTargetGap: document.querySelector("#resultTargetGap"),
  meaningText: document.querySelector("#meaningText"),
  improvementList: document.querySelector("#improvementList"),
  taxChoiceBox: document.querySelector("#taxChoiceBox"),
  vatExampleBox: document.querySelector("#vatExampleBox"),
  warnings: document.querySelector("#warnings"),
  moreWarnings: document.querySelector("#moreWarnings"),
  extraWarnings: document.querySelector("#extraWarnings"),
  scenarioGrid: document.querySelector("#scenarioGrid"),
  targetIntro: document.querySelector("#targetIntro"),
  targetYearlyRevenue: document.querySelector("#targetYearlyRevenue"),
  targetMonthlyRevenue: document.querySelector("#targetMonthlyRevenue"),
  targetDifference: document.querySelector("#targetDifference"),
  targetMessage: document.querySelector("#targetMessage"),
  copyStatus: document.querySelector("#copyStatus")
};

let lastResult = null;

function formatEuro(value) {
  return euroFormatter.format(Math.round(value || 0));
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${percentFormatter.format(value)} %`;
}

function getRadioValue(name) {
  return new FormData(form).get(name);
}

function setRadioValue(name, value) {
  const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function readNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const value = String(el.value || "").replace(",", ".");
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function getAutoChurchTaxRate(state) {
  return state === "by" || state === "bw" ? 8 : 9;
}

function getChurchTaxRate(data) {
  if (data.churchTaxMode === "auto") return getAutoChurchTaxRate(data.state);
  if (data.churchTaxMode === "custom") return data.customChurchTaxRate;
  return 0;
}

function getFormData() {
  const maritalStatus = fields.maritalStatus.value;
  return {
    mainIncome: readNumber("mainIncome"),
    spouseIncome: maritalStatus === "married" ? readNumber("spouseIncome") : 0,
    sideRevenue: readNumber("sideRevenue"),
    expenses: readNumber("expenses"),
    hours: readNumber("hours"),
    targetHourly: readNumber("targetHourly"),
    state: fields.state.value,
    maritalStatus,
    activityType: fields.activityType.value,
    customerType: fields.customerType.value,
    inputVatMode: fields.inputVatMode.value,
    tradeTaxRate: fields.tradeTaxRate.value === "" ? null : readNumber("tradeTaxRate"),
    churchTaxMode: fields.churchTaxMode.value,
    customChurchTaxRate: readNumber("customChurchTaxRate"),
    insurance: getRadioValue("insurance"),
    smallBusiness: getRadioValue("smallBusiness"),
    foundingYear: getRadioValue("foundingYear")
  };
}

function estimateBasicIncomeTax(income) {
  const taxableIncome = Math.max(income, 0);
  const bands = [
    { upTo: 12000, rate: 0 },
    { upTo: 20000, rate: 0.14 },
    { upTo: 40000, rate: 0.24 },
    { upTo: 65000, rate: 0.32 },
    { upTo: 100000, rate: 0.38 },
    { upTo: Infinity, rate: 0.42 }
  ];
  let previousLimit = 0;
  let tax = 0;

  for (const band of bands) {
    const taxableInBand = Math.max(Math.min(taxableIncome, band.upTo) - previousLimit, 0);
    tax += taxableInBand * band.rate;
    previousLimit = band.upTo;
    if (taxableIncome <= band.upTo) break;
  }

  return Math.max(tax, 0);
}

function estimateIncomeTax(income, mode) {
  if (mode === "splitting") {
    return estimateBasicIncomeTax(income / 2) * 2;
  }

  return estimateBasicIncomeTax(income);
}

function calculateAdditionalIncomeTax(mainIncome, spouseIncome, profit, maritalStatus) {
  const taxableProfit = Math.max(profit, 0);
  if (taxableProfit <= 0) {
    return {
      incomeTaxWithoutChurch: 0,
      taxWithoutSideBusiness: 0,
      taxWithSideBusiness: 0,
      taxMode: maritalStatus === "married" ? "splitting" : "single",
      incomeWithoutSideBusiness: mainIncome + (maritalStatus === "married" ? spouseIncome : 0),
      incomeWithSideBusiness: mainIncome + (maritalStatus === "married" ? spouseIncome : 0)
    };
  }

  if (maritalStatus === "married") {
    const incomeWithoutSideBusiness = mainIncome + spouseIncome;
    const incomeWithSideBusiness = incomeWithoutSideBusiness + taxableProfit;
    const taxWithoutSideBusiness = estimateIncomeTax(incomeWithoutSideBusiness, "splitting");
    const taxWithSideBusiness = estimateIncomeTax(incomeWithSideBusiness, "splitting");
    return {
      incomeTaxWithoutChurch: Math.max(0, taxWithSideBusiness - taxWithoutSideBusiness),
      taxWithoutSideBusiness,
      taxWithSideBusiness,
      taxMode: "splitting",
      incomeWithoutSideBusiness,
      incomeWithSideBusiness
    };
  }

  const incomeWithoutSideBusiness = mainIncome;
  const incomeWithSideBusiness = mainIncome + taxableProfit;
  const taxWithoutSideBusiness = estimateIncomeTax(incomeWithoutSideBusiness, "single");
  const taxWithSideBusiness = estimateIncomeTax(incomeWithSideBusiness, "single");
  return {
    incomeTaxWithoutChurch: Math.max(0, taxWithSideBusiness - taxWithoutSideBusiness),
    taxWithoutSideBusiness,
    taxWithSideBusiness,
    taxMode: "single",
    incomeWithoutSideBusiness,
    incomeWithSideBusiness
  };
}

function calculateTradeTax(profit, tradeTaxRate) {
  const taxableTradeIncome = Math.max(0, profit - 24500);
  if (!tradeTaxRate || taxableTradeIncome <= 0) {
    return {
      tradeTax: 0,
      taxableTradeIncome,
      hasTradeTaxEstimate: false
    };
  }

  const assessmentAmount = taxableTradeIncome * 0.035;
  return {
    tradeTax: assessmentAmount * (tradeTaxRate / 100),
    taxableTradeIncome,
    hasTradeTaxEstimate: true
  };
}

function evaluateStatus(result, targetHourly) {
  if (result.profit <= 0) {
    return {
      key: "critical",
      label: "Kritisch",
      badge: "Rot",
      text: "Dein Nebengewerbe erwirtschaftet nach Ausgaben keinen positiven Gewinn."
    };
  }

  if (!result.hasHours) {
    if (result.monthlyNet < 100) {
      return {
        key: "critical",
        label: "Kritisch",
        badge: "Rot",
        text: "Der monatliche Netto-Zusatz ist sehr niedrig."
      };
    }
    if (result.monthlyNet < 300) {
      return {
        key: "medium",
        label: "Grenzwertig",
        badge: "Gelb",
        text: "Der monatliche Netto-Zusatz ist noch ueberschaubar."
      };
    }
    if (result.monthlyNet < 800) {
      return {
        key: "good",
        label: "Lohnt sich",
        badge: "Gruen",
        text: "Der monatliche Netto-Zusatz wirkt grundsaetzlich attraktiv."
      };
    }
    return {
      key: "very-good",
      label: "Sehr gut",
      badge: "Dunkelgruen",
      text: "Der monatliche Netto-Zusatz wirkt stark."
    };
  }

  if (result.hourlyNet < 12) {
    return {
      key: "critical",
      label: "Kritisch",
      badge: "Rot",
      text: "Der Aufwand ist im Verhaeltnis zum Netto-Ergebnis sehr hoch."
    };
  }

  if (result.hourlyNet < 20) {
    return {
      key: "medium",
      label: "Grenzwertig",
      badge: "Gelb",
      text: "Der Aufwand ist grenzwertig bezahlt. Das kann fuer den Start okay sein, sollte aber nicht dauerhaft dein Ziel bleiben."
    };
  }

  if (result.hourlyNet < targetHourly) {
    return {
      key: "good",
      label: "Lohnt sich",
      badge: "Gruen",
      text: "Das Nebengewerbe wirkt grundsaetzlich attraktiv, liegt aber noch unter deinem persoenlichen Ziel-Stundenlohn."
    };
  }

  return {
    key: "very-good",
    label: "Sehr gut",
    badge: "Dunkelgruen",
    text: "Dein Nebengewerbe erreicht dein gewuenschtes Stundenlohn-Ziel und wirkt wirtschaftlich attraktiv."
  };
}

function computeResult(data, overrides = {}) {
  const values = { ...data, ...overrides };
  const revenueGross = Math.max(values.sideRevenue, 0);
  const expenseGross = Math.max(values.expenses, 0);
  const isSmallBusiness = values.smallBusiness === "yes";
  const revenueNet = isSmallBusiness ? revenueGross : revenueGross / 1.19;
  const outputVat = isSmallBusiness ? 0 : revenueGross - revenueNet;
  const inputVat = !isSmallBusiness && values.inputVatMode === "flat19" ? expenseGross - expenseGross / 1.19 : 0;
  const expenseNet = !isSmallBusiness && values.inputVatMode === "flat19" ? expenseGross / 1.19 : expenseGross;
  const vatPayable = Math.max(0, outputVat - inputVat);
  const revenue = revenueNet;
  const expenses = expenseNet;
  const profit = revenueNet - expenseNet;
  const spouseIncome = values.maritalStatus === "married" ? Math.max(values.spouseIncome || 0, 0) : 0;
  const incomeTaxEstimate = calculateAdditionalIncomeTax(values.mainIncome, spouseIncome, profit, values.maritalStatus);
  const incomeTaxWithoutChurch = incomeTaxEstimate.incomeTaxWithoutChurch;
  const churchTaxRate = getChurchTaxRate(values);
  const churchTax = incomeTaxWithoutChurch * (churchTaxRate / 100);
  const trade = calculateTradeTax(profit, values.tradeTaxRate);
  const totalTax = Math.max(incomeTaxWithoutChurch + churchTax + trade.tradeTax, 0);
  const yearlyNet = profit - totalTax;
  const monthlyNet = yearlyNet / 12;
  const yearlyHours = Math.max(values.hours, 0) * 52;
  const hasHours = yearlyHours > 0;
  const hourlyNet = hasHours ? yearlyNet / yearlyHours : null;
  const revenueHourly = hasHours ? revenueGross / yearlyHours : null;
  const taxQuote = profit > 0 ? (totalTax / profit) * 100 : 0;
  const taxReserve = totalTax * 1.1;
  const vatReserve = vatPayable;
  const reserve = taxReserve + vatReserve;
  const monthlyReserve = reserve / 12;

  const result = {
    ...values,
    spouseIncome,
    taxBasis: incomeTaxEstimate.incomeWithoutSideBusiness,
    taxRate: profit > 0 ? incomeTaxWithoutChurch / profit : 0,
    taxWithoutSideBusiness: incomeTaxEstimate.taxWithoutSideBusiness,
    taxWithSideBusiness: incomeTaxEstimate.taxWithSideBusiness,
    taxMode: incomeTaxEstimate.taxMode,
    incomeWithoutSideBusiness: incomeTaxEstimate.incomeWithoutSideBusiness,
    incomeWithSideBusiness: incomeTaxEstimate.incomeWithSideBusiness,
    revenueGross,
    revenueNet,
    expenseGross,
    expenseNet,
    outputVat,
    inputVat,
    vatPayable,
    isSmallBusiness,
    revenue,
    expenses,
    profit,
    incomeTax: incomeTaxWithoutChurch,
    churchTax,
    churchTaxRate,
    totalTax,
    tradeTax: trade.tradeTax,
    taxableTradeIncome: trade.taxableTradeIncome,
    hasTradeTaxEstimate: trade.hasTradeTaxEstimate,
    yearlyNet,
    monthlyNet,
    yearlyHours,
    hasHours,
    hourlyNet,
    revenueHourly,
    taxQuote,
    taxReserve,
    vatReserve,
    reserve,
    monthlyReserve
  };

  result.status = evaluateStatus(result, Math.max(values.targetHourly, 0));
  return result;
}

function addWarning(message, type = "") {
  const item = document.createElement("div");
  item.className = `warning ${type}`.trim();
  item.textContent = message;
  fields.warnings.appendChild(item);
}

function createWarning(message, type = "") {
  const item = document.createElement("div");
  item.className = `warning ${type}`.trim();
  item.textContent = message;
  return item;
}

function getMeaningText(result) {
  const byStatus = {
    "very-good": result.hasHours
      ? "Deine Angaben sehen wirtschaftlich stark aus. Nach grober Steuer bleibt ein sinnvoller Netto-Zusatz uebrig und dein Ziel-Stundenlohn wird erreicht."
      : "Deine Angaben sehen wirtschaftlich stark aus. Nach grober Steuer bleibt ein sinnvoller monatlicher Netto-Zusatz uebrig.",
    good: "Dein Nebengewerbe kann sich lohnen. Achte darauf, Steuern zurueckzulegen und den Aufwand im Blick zu behalten.",
    medium: "Das Ergebnis ist nicht schlecht, aber der Aufwand ist nur grenzwertig bezahlt. Fuer den Start kann das okay sein. Langfristig solltest du Preise erhoehen, Ausgaben senken oder Zeit sparen.",
    critical: "Mit diesen Angaben lohnt sich das Nebengewerbe wahrscheinlich noch nicht. Pruefe, ob du mehr Umsatz erzielen, weniger Ausgaben haben oder weniger Zeit benoetigen kannst."
  };

  return `${byStatus[result.status.key]} Lege monatlich mindestens die empfohlene Steuerruecklage zurueck, damit dich Nachzahlungen nicht ueberraschen.`;
}

function getImprovementTips(result) {
  const tips = [];

  if (result.hasHours && result.hourlyNet < result.targetHourly) {
    tips.push("Erhoehe deine Preise oder reduziere deinen Zeitaufwand, um naeher an deinen Ziel-Stundenlohn zu kommen.");
  }
  if (result.revenue > 0 && result.expenses / result.revenue > 0.4) {
    tips.push("Deine Ausgaben sind im Verhaeltnis zum Umsatz hoch. Pruefe, welche Kosten wirklich notwendig sind.");
  }
  if (result.hours > 8) {
    tips.push("Der woechentliche Aufwand ist hoch. Ueberlege, ob du Ablaeufe automatisieren oder pauschal abrechnen kannst.");
  }
  if (result.revenue >= 22000 && result.revenue <= 25000) {
    tips.push("Du liegst nahe an der Grenze der Kleinunternehmerregelung. Plane fruehzeitig, was passiert, wenn du darueber kommst.");
  }
  if (result.revenue > 25000 && result.smallBusiness === "yes") {
    tips.push("Achtung: Dein geplanter Umsatz liegt ueber 25.000 EUR. Pruefe genau, ob die Kleinunternehmerregelung noch passt.");
  }
  if (result.profit > 24500) {
    tips.push("Dein Gewinn liegt ueber dem Gewerbesteuer-Freibetrag fuer Einzelunternehmen und Personengesellschaften. Gewerbesteuer kann relevant werden.");
  }
  if (result.insurance === "public" && (result.profit > 18000 || result.hours > 15)) {
    tips.push("Bei gesetzlicher Krankenversicherung kann ein umfangreicher Nebenerwerb relevant werden. Klaere mit deiner Krankenkasse, ob deine Taetigkeit noch nebenberuflich gilt.");
  }
  if (result.hasHours && result.monthlyNet < 100 && result.hourlyNet >= 20) {
    tips.push("Der Stundenlohn ist okay, aber der monatliche Effekt ist noch klein.");
  }
  if (result.hasHours && result.hours > 10 && result.hourlyNet < 20) {
    tips.push("Der Zeitaufwand ist relativ hoch. Pruefe Preise, Pauschalen oder effizientere Ablaeufe.");
  }

  if (tips.length === 0) {
    tips.push("Deine Werte wirken ordentlich. Behalte Ruecklagen, Zeitaufwand und Preisentwicklung trotzdem regelmaessig im Blick.");
  }

  return tips;
}

function renderWarnings(result) {
  fields.warnings.innerHTML = "";
  fields.extraWarnings.innerHTML = "";
  const items = [];
  const push = (message, type = "") => items.push({ message, type });

  if (result.yearlyHours <= 0) {
    push("Du hast keinen Zeitaufwand angegeben. Deshalb wird kein Netto-Stundenlohn berechnet. Fuer eine realistische Einschaetzung solltest du deine ungefaehren Wochenstunden ergaenzen.", "caution");
  }

  if (result.profit < 0) {
    push("Deine Ausgaben liegen ueber dem Umsatz. Der Rechner zeigt den Verlust an und setzt die Einkommensteuer auf 0 EUR.", "urgent");
  }

  if (result.maritalStatus === "married") {
    push("Die Steuer wurde grob mit einer vereinfachten Splitting-Logik geschaetzt. Die tatsaechliche Steuer haengt von weiteren Einkuenften, Abzuegen und individuellen Faktoren ab.", "note");
  }

  push("Die zusaetzliche Steuer wird als Differenz zwischen Einkommen ohne und mit Nebengewerbe geschaetzt. Bei Zusammenveranlagung wird vereinfacht der Splittingtarif nachgebildet.", "note");

  if (result.churchTax > 0) {
    push(`Kirchensteuer: Es wurden grob ${formatPercent(result.churchTaxRate)} auf die geschaetzte Einkommensteuer angesetzt.`, "note");
  }

  if (result.smallBusiness === "yes") {
    if (result.revenue <= 25000) {
      const founding = result.foundingYear === "yes" ? "Im Gruendungsjahr ist die 25.000-EUR-Grenze besonders wichtig." : "Pruefe trotzdem den Vorjahresumsatz und die laufende Jahresgrenze.";
      push(`Kleinunternehmerregelung wahrscheinlich moeglich. Vorteil: Du weist meist keine Umsatzsteuer aus. Nachteil: Du kannst in der Regel keine Vorsteuer aus Eingangsrechnungen ziehen. ${founding}`, "positive");
    } else {
      push("Achtung: Dein geplanter Umsatz liegt ueber 25.000 EUR. Pruefe genau, ob die Kleinunternehmerregelung noch anwendbar ist. Im laufenden Jahr kann zusaetzlich die 100.000-EUR-Grenze relevant werden.", result.revenue > 100000 ? "urgent" : "caution");
    }

    if (result.activityType === "trade") {
      push("Beim Handel kann der fehlende Vorsteuerabzug besonders relevant sein, wenn du viele Waren einkaufst.", "caution");
    }
    if (result.activityType === "service") {
      push("Bei Dienstleistungen mit wenigen Eingangsrechnungen kann die Kleinunternehmerregelung fuer den Start besonders einfach sein.", "positive");
    }
    if (result.customerType === "b2b") {
      push("Bei B2B-Kunden kann Kleinunternehmer weniger wichtig sein, weil Geschaeftskunden Umsatzsteuer haeufig als Vorsteuer ziehen koennen. Dafuer bleibt die Kleinunternehmerregelung einfacher.", "note");
    }
  } else {
    push("Da du Regelbesteuerung gewaehlt hast, enthaelt dein eingegebener Brutto-Umsatz Umsatzsteuer. Diese gehoert wirtschaftlich nicht dir und muss nach Abzug moeglicher Vorsteuer ans Finanzamt abgefuehrt werden.", "caution");
    if (result.customerType === "private") {
      push("Bei Privatkunden ist der Bruttopreis entscheidend. Wenn du 119 EUR verlangst, sind bei Regelbesteuerung nur 100 EUR Netto-Umsatz und 19 EUR Umsatzsteuer enthalten.", "urgent");
      push("Pruefe genau, ob Regelbesteuerung fuer dein Nebengewerbe sinnvoll ist. Bei Privatkunden zaehlt oft der Endpreis. Dann kann die Umsatzsteuer deine Marge deutlich senken.", "caution");
    }
    if (result.customerType === "b2b") {
      push("Bei B2B-Kunden ist Regelbesteuerung oft weniger problematisch, weil Geschaeftskunden die Umsatzsteuer haeufig als Vorsteuer ziehen koennen.", "note");
    }
  }

  if (result.insurance === "public") {
    push("Bei gesetzlicher Krankenversicherung kann ein umfangreiches Nebengewerbe relevant werden. Entscheidend sind unter anderem Gewinn, Zeitaufwand und ob der Hauptjob weiterhin im Vordergrund steht.", "note");
    if (result.hours > 15) {
      push("Du gibst mehr als 15 Stunden pro Woche an. Klaere mit deiner Krankenkasse, ob deine Taetigkeit noch als nebenberuflich gilt.", "urgent");
    }
    if (result.profit > result.mainIncome * 0.5) {
      push("Der Gewinn aus dem Nebengewerbe ist im Verhaeltnis zum Hauptjob hoch. Das kann fuer die sozialversicherungsrechtliche Einordnung relevant sein.", "urgent");
    }
  } else {
    push("Bei privater Krankenversicherung koennen andere Regeln gelten. Pruefe deine Tarifbedingungen und moegliche Auswirkungen individuell.", "note");
  }

  if (result.profit <= 24500) {
    push("Gewerbesteuer: Der Gewinn liegt unter dem Freibetrag von 24.500 EUR fuer Einzelunternehmen und Personengesellschaften. Meist faellt darunter keine Gewerbesteuer an.", "positive");
  } else if (result.hasTradeTaxEstimate) {
    push(`Gewerbesteuer grob geschaetzt: ${formatEuro(result.tradeTax)}. Der Rechner beruecksichtigt die moegliche Anrechnung auf die Einkommensteuer nur vereinfacht beziehungsweise nicht vollstaendig.`, "caution");
  } else {
    push("Gewerbesteuer: Der Gewinn liegt ueber dem Freibetrag von 24.500 EUR. Gewerbesteuer kann relevant werden. Die tatsaechliche Hoehe haengt vom Hebesatz deiner Gemeinde ab.", "caution");
  }

  push("Keine Steuerberatung: Das Ergebnis ist nur eine grobe, unverbindliche Schaetzung fuer die erste Orientierung.");

  items.slice(0, 3).forEach(({ message, type }) => fields.warnings.appendChild(createWarning(message, type)));
  items.slice(3).forEach(({ message, type }) => fields.extraWarnings.appendChild(createWarning(message, type)));
  fields.moreWarnings.hidden = items.length <= 3;
}

function renderImprovementTips(result) {
  fields.improvementList.innerHTML = "";
  getImprovementTips(result).forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    fields.improvementList.appendChild(item);
  });
}

function renderScenarioCards(baseData) {
  const scenarios = [
    { name: "Vorsichtig", revenue: baseData.sideRevenue * 0.75, expenses: baseData.expenses * 0.9, hours: baseData.hours },
    { name: "Realistisch", revenue: baseData.sideRevenue, expenses: baseData.expenses, hours: baseData.hours },
    { name: "Optimistisch", revenue: baseData.sideRevenue * 1.25, expenses: baseData.expenses * 1.1, hours: baseData.hours }
  ];

  fields.scenarioGrid.innerHTML = "";

  scenarios.forEach((scenario) => {
    const result = computeResult(baseData, {
      sideRevenue: scenario.revenue,
      expenses: scenario.expenses,
      hours: scenario.hours
    });

    const card = document.createElement("article");
    card.className = "scenario-card";
    card.innerHTML = `
      <div class="scenario-head">
        <h3>${scenario.name}</h3>
        <span class="status-pill ${result.status.key}">${result.status.label}</span>
      </div>
      <dl>
        <div><dt>Umsatz pro Jahr</dt><dd>${formatEuro(result.revenue)}</dd></div>
        <div><dt>Gewinn pro Jahr</dt><dd>${formatEuro(result.profit)}</dd></div>
        <div><dt>Netto pro Monat</dt><dd>${formatEuro(result.monthlyNet)}</dd></div>
        <div><dt>Netto-Stundenlohn</dt><dd>${result.hasHours ? `${formatEuro(result.hourlyNet)} / Std.` : "Nicht berechnet"}</dd></div>
      </dl>
    `;
    fields.scenarioGrid.appendChild(card);
  });
}

function renderTargetCard(result) {
  if (!result.hasHours) {
    fields.targetIntro.textContent = "Gib deine Wochenstunden ein, um den benoetigten Umsatz fuer dein Stundenlohn-Ziel zu berechnen.";
    fields.targetYearlyRevenue.textContent = "-";
    fields.targetMonthlyRevenue.textContent = "-";
    fields.targetDifference.textContent = "-";
    fields.targetMessage.textContent = "Ohne Zeitangabe ist diese Zielrechnung nicht sinnvoll. Grobe Modellrechnung, keine Steuerberatung.";
    return;
  }

  const currentTaxQuote = result.profit > 0 ? result.incomeTax / result.profit : 0.25;
  const boundedTaxQuote = Math.min(Math.max(currentTaxQuote, 0.25), 0.45);
  const targetNetPerYear = result.targetHourly * result.yearlyHours;
  const requiredProfit = targetNetPerYear > 0 ? targetNetPerYear / (1 - boundedTaxQuote) : 0;
  const requiredRevenue = requiredProfit + result.expenses;
  const difference = requiredRevenue - result.revenue;
  const monthlyDifference = difference / 12;
  const currentYearlyNet = Math.max(result.yearlyNet, 0);
  const targetHoursPerWeekAtCurrentNet = result.targetHourly > 0 ? currentYearlyNet / result.targetHourly / 52 : 0;

  fields.targetIntro.textContent = `Du moechtest mindestens ${formatEuro(result.targetHourly)} netto pro Stunde verdienen.`;
  fields.targetYearlyRevenue.textContent = formatEuro(requiredRevenue);
  fields.targetMonthlyRevenue.textContent = formatEuro(requiredRevenue / 12);
  fields.targetDifference.textContent = formatEuro(Math.abs(difference));
  fields.targetMessage.textContent =
    difference <= 0
      ? `Mit deinen Angaben erreichst du dein Ziel voraussichtlich. Alternativ duerftest du bei gleichem Netto grob bis zu ${numberFormatter.format(targetHoursPerWeekAtCurrentNet)} Wochenstunden arbeiten, um dein Ziel zu halten. Grobe Modellrechnung, keine Steuerberatung.`
      : `Du muesstest deinen Jahresumsatz grob um ca. ${formatEuro(difference)} erhoehen. Das entspricht ca. ${formatEuro(monthlyDifference)} mehr Umsatz pro Monat. Alternativ muesstest du deine Wochenstunden von ${numberFormatter.format(result.hours)} auf ca. ${numberFormatter.format(targetHoursPerWeekAtCurrentNet)} senken, um dein Ziel zu erreichen. Grobe Modellrechnung, keine Steuerberatung.`;
}

function renderResults(result) {
  fields.profit.value = formatEuro(result.profit);
  fields.ratingTitle.textContent = result.status.label;
  fields.ratingBadge.textContent = result.status.badge;
  fields.ratingBadge.className = `traffic-light ${result.status.key}`;
  fields.resultSummary.textContent =
    result.hasHours
      ? `Nach grober Steuer bleiben dir ca. ${formatEuro(result.monthlyNet)} pro Monat. Das entspricht etwa ${formatEuro(result.hourlyNet)} netto pro Arbeitsstunde.`
      : `Nach grober Steuer bleiben dir ca. ${formatEuro(result.monthlyNet)} pro Monat. Gib deine Wochenstunden ein, um den Netto-Stundenlohn zu berechnen.`;
  fields.summaryMonthlyNet.textContent = formatEuro(result.monthlyNet);
  fields.summaryHourlyNet.textContent = result.hasHours ? formatEuro(result.hourlyNet) : "Nicht berechnet";
  fields.resultProfit.textContent = formatEuro(result.profit);
  fields.vatResultGroup.hidden = false;
  fields.vatResultGroup.classList.toggle("small-business", result.isSmallBusiness);
  fields.vatCompactInfo.innerHTML = result.isSmallBusiness
    ? "<strong>Keine Umsatzsteuer-Ausweisung wegen Kleinunternehmerregelung.</strong><span>Umsatzsteuer-Zahllast: 0 €.</span><span>Der eingegebene Umsatz wird als Einnahme ohne ausgewiesene Umsatzsteuer behandelt.</span>"
    : "";
  fields.resultRevenueGross.textContent = formatEuro(result.revenueGross);
  fields.resultRevenueNet.textContent = formatEuro(result.revenueNet);
  fields.resultOutputVat.textContent = formatEuro(result.outputVat);
  fields.resultInputVat.textContent = formatEuro(result.inputVat);
  fields.resultVatPayable.textContent = result.isSmallBusiness ? "0 € wegen Kleinunternehmerregelung" : formatEuro(result.vatPayable);
  fields.resultTax.textContent = formatEuro(result.incomeTax);
  fields.resultChurchTax.textContent = formatEuro(result.churchTax);
  fields.churchTaxRow.hidden = result.churchTax <= 0;
  fields.resultTradeTax.textContent = formatEuro(result.tradeTax);
  fields.tradeTaxRow.hidden = result.tradeTax <= 0;
  fields.resultTotalTax.textContent = formatEuro(result.totalTax);
  fields.resultTaxRate.textContent = result.profit > 0 ? formatPercent(result.taxQuote) : "-";
  fields.resultYearlyNet.textContent = formatEuro(result.yearlyNet);
  fields.resultMonthlyNet.textContent = formatEuro(result.monthlyNet);
  fields.resultHourlyNet.textContent = result.hasHours ? `${formatEuro(result.hourlyNet)} / Std.` : "Nicht berechnet";
  fields.resultYearlyHours.textContent = result.hasHours
    ? `${numberFormatter.format(result.yearlyHours)} Std.`
    : "Zeitaufwand nicht angegeben";
  fields.resultRevenueHourly.textContent = result.hasHours ? `${formatEuro(result.revenueHourly)} / Std.` : "Nicht berechnet";
  fields.resultTaxReserve.textContent = formatEuro(result.taxReserve);
  fields.resultVatReserve.textContent = formatEuro(result.vatReserve);
  fields.resultReserve.textContent = formatEuro(result.reserve);
  fields.resultMonthlyReserve.textContent = formatEuro(result.monthlyReserve);

  if (!result.hasHours) {
    fields.resultTargetGap.textContent = "Nicht berechnet";
  } else if (result.hourlyNet >= result.targetHourly) {
    fields.resultTargetGap.textContent = "Ziel erreicht";
  } else {
    fields.resultTargetGap.textContent = `Noch ca. ${formatEuro(result.targetHourly - result.hourlyNet)} / Std. unter deinem Ziel`;
  }

  fields.meaningText.textContent = getMeaningText(result);
  renderTaxChoiceBox(result);
  renderImprovementTips(result);
  renderWarnings(result);
}

function renderTaxChoiceBox(result) {
  if (result.isSmallBusiness) {
    fields.taxChoiceBox.innerHTML = `
      <h3>Kleinunternehmerregelung</h3>
      <p>Fuer viele Nebengewerbe mit Privatkunden ist die Kleinunternehmerregelung oft attraktiv: Du musst keine Umsatzsteuer auf deinen Rechnungen ausweisen und keine Umsatzsteuer aus deinen Einnahmen abfuehren. Dafuer kannst du in der Regel keine Vorsteuer aus Eingangsrechnungen ziehen.</p>
      <p>Besonders sinnvoll ist das oft bei Dienstleistungen mit wenigen Ausgaben oder wenn deine Kunden Privatpersonen sind.</p>
    `;
    fields.vatExampleBox.hidden = true;
    fields.vatExampleBox.innerHTML = "";
    return;
  }

  fields.taxChoiceBox.innerHTML = `
    <h3>Regelbesteuerung</h3>
    <p>Du hast Regelbesteuerung gewaehlt. Bei Privatkunden kann das unattraktiver sein, weil von deinem Brutto-Preis 19 % Umsatzsteuer enthalten sind, die du grundsaetzlich ans Finanzamt abfuehren musst. Dadurch bleibt dir bei gleichem Endpreis weniger uebrig.</p>
    <p>Regelbesteuerung kann sinnvoll sein, wenn du vor allem B2B-Kunden hast, hohe Investitionen oder viel Vorsteuer aus Eingangsrechnungen. Geschaeftskunden koennen die ausgewiesene Umsatzsteuer haeufig als Vorsteuer ziehen.</p>
  `;
  fields.vatExampleBox.hidden = false;
  fields.vatExampleBox.innerHTML = `
    <h3>Umsatzsteuer-Beispiel</h3>
    <p>Beispiel: Wenn du 1.190 EUR brutto abrechnest, sind darin 190 EUR Umsatzsteuer enthalten. Dein Netto-Umsatz betraegt 1.000 EUR. Die Umsatzsteuer gehoert nicht zu deinem Gewinn.</p>
    ${result.customerType === "private" ? "<p>Bei Privatkunden kannst du den Preis oft nicht einfach um 19 % erhoehen, ohne teurer zu wirken.</p>" : ""}
  `;
}

function calculate() {
  syncSpouseField();
  syncChurchTaxField();
  syncVatFields();
  const data = getFormData();
  const result = computeResult(data);
  lastResult = result;
  renderResults(result);
  renderScenarioCards(data);
  renderTargetCard(result);
  fields.copyStatus.textContent = "";
}

function applyValues(values) {
  fields.mainIncome.value = values.mainIncome;
  fields.spouseIncome.value = values.spouseIncome || "";
  fields.sideRevenue.value = values.sideRevenue;
  fields.expenses.value = values.expenses;
  fields.hours.value = values.hours;
  fields.targetHourly.value = values.targetHourly;
  fields.state.value = values.state;
  fields.maritalStatus.value = values.maritalStatus;
  fields.activityType.value = values.activityType;
  fields.customerType.value = values.customerType;
  fields.inputVatMode.value = values.inputVatMode;
  fields.tradeTaxRate.value = values.tradeTaxRate;
  fields.churchTaxMode.value = values.churchTaxMode;
  fields.customChurchTaxRate.value = values.customChurchTaxRate || "";
  setRadioValue("insurance", values.insurance);
  setRadioValue("smallBusiness", values.smallBusiness);
  setRadioValue("foundingYear", values.foundingYear);
  form.querySelectorAll("input, select").forEach((field) => {
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
  calculate();
}

function syncSpouseField() {
  const isMarried = fields.maritalStatus.value === "married";
  fields.spouseIncomeGroup.hidden = !isMarried;
  if (!isMarried) {
    fields.spouseIncome.value = "";
  }
}

function syncChurchTaxField() {
  const isCustom = fields.churchTaxMode.value === "custom";
  fields.customChurchTaxGroup.hidden = !isCustom;
  if (!isCustom) {
    fields.customChurchTaxRate.value = "";
  }
}

function syncVatFields() {
  const smallBusiness = getRadioValue("smallBusiness") === "yes";
  fields.inputVatGroup.hidden = smallBusiness;
  if (smallBusiness) {
    fields.inputVatMode.value = "none";
    fields.revenueHint.textContent = "Bei Kleinunternehmern entspricht der Rechnungsbetrag in der Regel deinem Umsatz ohne ausgewiesene Umsatzsteuer.";
  } else {
    fields.revenueHint.textContent = "Bei Regelbesteuerung wird dieser Betrag als Brutto-Umsatz inkl. 19 % Umsatzsteuer behandelt.";
  }
}

async function copyResult() {
  if (!lastResult) return;

  const text = `Nebenerwerbsrechner Ergebnis:
Umsatz: ${formatEuro(lastResult.revenue)}
Gewinn: ${formatEuro(lastResult.profit)}
Grobe zusaetzliche Steuer gesamt: ${formatEuro(lastResult.totalTax)}
Netto pro Monat: ${formatEuro(lastResult.monthlyNet)}
Netto-Stundenlohn: ${lastResult.hasHours ? `${formatEuro(lastResult.hourlyNet)} / Std.` : "Nicht berechnet"}
Status: ${lastResult.status.label}
Hinweis: grobe Schaetzung, keine Steuerberatung.`;

  try {
    await navigator.clipboard.writeText(text);
    fields.copyStatus.textContent = "Ergebnis kopiert.";
  } catch (error) {
    fields.copyStatus.textContent = "Kopieren ist in diesem Browser nicht erlaubt.";
  }
}

form.addEventListener("input", calculate);
form.addEventListener("change", calculate);
document.querySelector("#loadExample").addEventListener("click", () => applyValues(defaults));
document.querySelector("#resetForm").addEventListener("click", () => applyValues(resetDefaults));
document.querySelector("#copyResult").addEventListener("click", copyResult);

window.nebenerwerbTest = {
  computeResult,
  getFormData,
  applyValues
};

calculate();
