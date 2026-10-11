/* openGym 1.4.1 · Progression Engine v2. Local demo bundle from the app exports; AGPL-3.0-or-later. */
var EditorEngine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <stdin>
  var stdin_exports = {};
  __export(stdin_exports, {
    INCREMENT_TYPES: () => INCREMENT_TYPES,
    MAX_GROUPS: () => MAX_GROUPS,
    PRESETS: () => PRESETS,
    PRESET_IDS: () => PRESET_IDS,
    REPS_MAX: () => REPS_MAX,
    SET_REPS_MAX: () => SET_REPS_MAX,
    WENDLER_CYCLE: () => WENDLER_CYCLE,
    cardioParameters: () => cardioParameters,
    defaultDeload: () => defaultDeload,
    defaultPlanRule: () => defaultPlanRule,
    editPlan: () => editPlan,
    failureSetRange: () => failureSetRange,
    failureSetSelected: () => failureSetSelected,
    failureSetsOf: () => failureSetsOf,
    failureSuffix: () => failureSuffix,
    generatePrescription: () => generatePrescription,
    isTemplateRule: () => isTemplateRule,
    needsOneRm: () => needsOneRm,
    planOptions: () => planOptions,
    rptOffsets: () => rptOffsets,
    supports: () => supports,
    validatePlanRule: () => validatePlanRule,
    validateWarmup: () => validateWarmup,
    warmupMaxCount: () => warmupMaxCount,
    warmupSteps: () => warmupSteps
  });

  // openGym-motore-generico/api/engine/canonical.js
  function canonicalJSON(v) {
    if (v === null || typeof v !== "object") {
      if (typeof v === "number" && !Number.isFinite(v)) throw new Error("ENGINE_NON_FINITE");
      return JSON.stringify(v);
    }
    if (Array.isArray(v)) return "[" + v.map(canonicalJSON).join(",") + "]";
    const keys2 = Object.keys(v).filter((k) => v[k] !== void 0).sort();
    return "{" + keys2.map((k) => JSON.stringify(k) + ":" + canonicalJSON(v[k])).join(",") + "}";
  }
  var FNV_OFFSET = 0xcbf29ce484222325n;
  var FNV_PRIME = 0x100000001b3n;
  var MASK64 = 0xffffffffffffffffn;
  function contentHash(value) {
    const bytes = new TextEncoder().encode(canonicalJSON(value));
    let h = FNV_OFFSET;
    for (let i = 0; i < bytes.length; i++) h = (h ^ BigInt(bytes[i])) * FNV_PRIME & MASK64;
    return h.toString(16).padStart(16, "0");
  }
  function deepFreeze(value) {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const k of Object.keys(value)) deepFreeze(value[k]);
    return value;
  }

  // openGym-motore-generico/api/engine/load.js
  var clean = (v) => Number(v.toFixed(6));
  function roundLoad(value, rounding) {
    if (rounding.mode === "allowed_values") {
      return rounding.allowedValues.reduce((best, v) => Math.abs(v - value) < Math.abs(best - value) ? v : best);
    }
    const snap = { nearest: Math.round, up: Math.ceil, down: Math.floor }[rounding.mode];
    return clean(snap(clean(value / rounding.step)) * rounding.step);
  }
  function resolveExpression(expression, snapshot1RM) {
    if (expression?.mode === "absolute") return expression.value;
    if (expression?.mode === "percent_1rm") return snapshot1RM ? snapshot1RM.value * expression.percent / 100 : null;
    return null;
  }
  function resolveLoad(expression, { snapshot1RM = null, rounding, cap = null, assisted = false }) {
    const raw = resolveExpression(expression, snapshot1RM);
    if (raw == null) return null;
    const value = roundLoad(raw, rounding);
    const unit = expression.mode === "absolute" ? expression.unit : snapshot1RM.unit;
    const beyond = cap != null && (assisted ? value < cap : value > cap);
    return { value: beyond ? cap : value, unit };
  }

  // openGym-motore-generico/api/engine/deload.js
  var DELOAD_FACTOR = 0.9;
  var DELOAD_FACTOR_MIN = 0.5;
  var DELOAD_FACTOR_MAX = 0.95;
  var DELOAD_AFTER = { linear: 3, greyskull: 1, double: 3, hold_seconds: 3 };
  var isValidDeloadFactor = (v) => Number.isFinite(v) && v >= DELOAD_FACTOR_MIN && v <= DELOAD_FACTOR_MAX;
  var defaultDeload = (preset) => DELOAD_AFTER[preset] ? { after: DELOAD_AFTER[preset], factor: DELOAD_FACTOR } : void 0;

  // openGym-motore-generico/api/engine/rules.js
  var INCREMENT_TYPES = ["absolute", "current_load_percent", "snapshot_1rm_percent", "target_load_percent", "percentage_points"];
  var COMPLETION_METRICS = ["target_load", "max_sets", "max_reps", "max_duration", "cycle_count", "training_max", "difficulty_rung", "rest_floor"];
  var OPERATOR_METRICS = ["load", "reps", "sets", "durationSeconds", "restSeconds", "difficulty"];
  var RECOVERY_METHODS = ["factor", "epley", "epley_reps"];
  var MAX_PHASES = 32;
  var MAX_GROUPS = 50;
  var MAX_ROWS = 50;
  var MAX_OPERATORS = 8;
  var STRENGTH = ["target_load", "max_sets", "max_reps"];
  var ranges = (sets, reps = sets, durationSeconds = sets, load = sets) => ({ sets, reps, durationSeconds, load });
  var PRESETS = {
    autoregulated: { metrics: [...STRENGTH, "max_duration"], ranges: ranges("either"), steps: null, stalls: false },
    linear: { metrics: ["target_load"], ranges: ranges("fixed"), steps: "load", stalls: true },
    greyskull: { metrics: ["target_load"], ranges: ranges("fixed"), steps: "load", stalls: true },
    double: { metrics: ["target_load", "max_reps"], ranges: ranges("fixed", "range", "range", "fixed"), steps: "load", stalls: true },
    triple: { metrics: STRENGTH, ranges: ranges("range", "range", "range", "fixed"), steps: "load", stalls: true },
    hold_seconds: { metrics: ["max_sets", "max_duration"], ranges: ranges("either", "fixed", "either", "fixed"), steps: "seconds", stalls: true },
    bodyweight_ladder: { metrics: ["max_sets", "max_reps", "difficulty_rung"], ranges: ranges("range", "range", "fixed", "fixed"), steps: null, stalls: false },
    pyramid_reps: { metrics: [], ranges: ranges("fixed"), steps: null, stalls: false },
    pyramid: { metrics: ["target_load"], ranges: ranges("either", "fixed", "fixed", "fixed"), steps: "load", stalls: true },
    five_three_one: { metrics: ["cycle_count", "training_max"], ranges: ranges("fixed"), steps: null, stalls: false },
    top_set_backoff: { metrics: ["target_load"], ranges: ranges("fixed"), steps: "load", stalls: true },
    accumulation_intensification: { metrics: ["cycle_count", "training_max"], ranges: ranges("fixed"), steps: null, stalls: false },
    density: { metrics: ["rest_floor"], ranges: ranges("fixed"), steps: null, stalls: false }
  };
  var PRESET_IDS = Object.keys(PRESETS);
  var SET_REPS_MAX = 10;
  var REPS_MAX = "max";
  var WENDLER_CYCLE = [
    [[65, 5], [75, 5], [85, 5, true]],
    [[70, 3], [80, 3], [90, 3, true]],
    [[75, 5], [85, 3], [95, 1, true]],
    [[40, 5], [50, 5], [60, 5]]
  ].map((week) => week.map(([percentOfTM, reps, amrap]) => ({ percentOfTM, reps, ...amrap ? { amrap } : {} })));
  var PYRAMID_OFFSETS = { ascending: [70, 85, 100], descending: [100, 90, 80] };
  var rptOffsets = (sets, anchorReps = 6) => Array.from({ length: sets }, (_, i) => i === 0 ? { percentOfAnchor: 100 } : { percentOfAnchor: Math.max(50, 100 - 10 * i), reps: anchorReps + 2 * i });
  var UNIT = { kg: { start: 20, step: 2.5, target: 100, tm: 100 }, lb: { start: 45, step: 5, target: 225, tm: 225 } };
  var range = (min, max = min) => ({ min, max });
  var copy = (v) => v === void 0 ? void 0 : JSON.parse(JSON.stringify(v));
  var NONE = { mode: "none" };
  var LADDER_SETS = 6;
  function templateDefaults(preset, unit, direction) {
    const u = UNIT[unit];
    const steps2 = PRESETS[preset].steps;
    const o = {
      sets: range(3),
      reps: range(8),
      load: steps2 === "load" ? { mode: "absolute", value: u.start, unit } : { mode: "empty" },
      restSeconds: 90,
      target: ["linear", "greyskull", "double", "triple", "pyramid"].includes(preset) ? { mode: "absolute", value: u.target, unit } : NONE,
      step: steps2 === "seconds" ? { type: "seconds", value: 5 } : { type: "absolute", value: u.step, unit },
      completion: { linear: ["target_load"], greyskull: ["target_load"], double: ["max_reps", "target_load"], triple: ["max_sets", "max_reps", "target_load"], bodyweight_ladder: ["max_sets", "max_reps"], pyramid: ["target_load"], reverse_pyramid: ["target_load"] }[preset]?.map((metric) => ({ metric, target: null })) ?? [],
      rounding: { mode: "nearest", step: u.step },
      deload: defaultDeload(preset)
    };
    const more = {
      linear: { reps: range(5), restSeconds: 180 },
      greyskull: { reps: range(5), restSeconds: 180 },
      double: { reps: range(8, 12), restSeconds: 120 },
      triple: { sets: range(3, 5), reps: range(8, 12), restSeconds: 120 },
      hold_seconds: { reps: range(1), durationSeconds: range(20, 30), completion: [{ metric: "max_duration", target: 120 }] },
      bodyweight_ladder: { sets: range(3, 5), reps: range(5, 10), rungs: [] },
      pyramid_reps: { sets: range(4), reps: range(12), setReps: [12, 10, 8, 6] },
      pyramid: { reps: range(8), restSeconds: 150, offsets: (PYRAMID_OFFSETS[direction] ?? PYRAMID_OFFSETS.ascending).map((percentOfAnchor) => ({ percentOfAnchor })) },
      five_three_one: {
        reps: range(5),
        restSeconds: 180,
        trainingMax: { mode: "ninety_percent_1rm" },
        cycleSets: copy(WENDLER_CYCLE),
        cycleIncrement: { value: u.step, unit },
        completion: [{ metric: "cycle_count", target: 4 }]
      },
      top_set_backoff: { sets: range(4), reps: range(6), restSeconds: 180, scope: "top", backoff: { sets: 3, reps: 8, percent: 90, restSeconds: 120 } },
      accumulation_intensification: {
        sets: range(3),
        reps: range(8, 12),
        restSeconds: 120,
        trainingMax: { mode: "ninety_percent_1rm" },
        cycleIncrement: { value: u.step, unit },
        end: "repeat",
        accumulation: { percent: 65 },
        intensification: { sets: 3, reps: 4, percent: 80, successes: 4 }
      },
      density: { reps: range(10), restSeconds: 90, restStep: 5, restFloor: 45 }
    }[preset];
    return { ...o, ...more };
  }
  var params = (o) => ({
    sets: copy(o.sets),
    reps: copy(o.reps),
    ...o.durationSeconds ? { durationSeconds: copy(o.durationSeconds) } : {},
    ...o.speed ? { speed: o.speed } : {},
    load: copy(o.load),
    ...o.loadTo ? { loadTo: copy(o.loadTo) } : {},
    ...o.rir ? { rir: copy(o.rir) } : {},
    restSeconds: o.restSeconds
  });
  var anchor = (percent = 100) => ({ basis: "anchor", percent });
  var plain = (more = {}) => ({ id: "sets", count: "parameters", reps: "parameters", load: anchor(), ...more });
  var V1_SUCCESS = { scope: "all", load: "ignore", effort: "rir_floor" };
  var NEW_SUCCESS = { scope: "all", load: "prescribed", effort: "rir_floor" };
  var phase = (id, o, more = {}) => ({ id, parameters: params(o), target: copy(o.target ?? NONE), groups: [plain()], success: V1_SUCCESS, progression: [], exit: null, ...more });
  var loadOp = (o, more = {}) => ({ id: "load", metric: "load", when: "success", basis: "last_actual", step: copy(o.step), ...more });
  var stallOf = (o, method, count = "misses") => o.deload ? { stall: { after: o.deload.after, count, recovery: { method, factor: o.deload.factor } } } : {};
  var program = (o, phases, more = {}) => ({ phases, end: "complete", completion: copy(o.completion), ...more });
  function ladderPhase(o, id = "ladder") {
    const climb = [
      { id: "reps", metric: "reps", when: "success", basis: "current", step: 1, resetOnCarry: true },
      { id: "sets", metric: "sets", when: "success", step: 1, resetOnCarry: true },
      ...o.rungs?.length ? [{ id: "rung", metric: "difficulty", when: "success", step: 1, min: 0, max: o.rungs.length - 1, rungs: copy(o.rungs) }] : []
    ];
    return phase(id, { ...o, load: { mode: "empty" }, target: NONE }, { progression: climb });
  }
  function policyPhase(policy, o, id = "plan") {
    if (policy === "greyskull") {
      const n = o.sets.min;
      return phase(id, o, {
        groups: [plain({ count: range(n - 1) }), plain({ id: "amrap", count: range(1), amrap: true })],
        success: { ...V1_SUCCESS, effort: "ignore" },
        progression: [loadOp(o, { amrapDoubleAt: 2 })],
        ...stallOf(o, "factor")
      });
    }
    if (policy === "double") {
      return phase(id, o, {
        progression: [{ id: "reps", metric: "reps", when: "worked", basis: "last_actual", step: 1, resetOnCarry: true }, loadOp(o, { when: "maximum" })],
        ...stallOf(o, "epley_reps", "misses_without_improvement")
      });
    }
    if (policy === "triple") {
      return phase(id, o, {
        progression: [{ id: "reps", metric: "reps", when: "success", step: 1, resetOnCarry: true, addedSetOnly: true }, { id: "sets", metric: "sets", when: "success", step: 1, resetOnCarry: true }, loadOp(o)],
        ...stallOf(o, "factor", "misses_without_improvement")
      });
    }
    return phase(id, o, { progression: [loadOp(o)], ...stallOf(o, "epley") });
  }
  function regimes(o, policy, ladderFirst) {
    const ladder = ladderPhase({
      ...o,
      rungs: [],
      sets: range(o.sets.min, Math.max(o.sets.min, ladderFirst ? o.sets.max : LADDER_SETS)),
      reps: ladderFirst ? o.reps : range(o.reps.min, Math.max(o.reps.min, o.repCeiling ?? 20))
    });
    const loadedReps = policy === "double" ? copy(o.loadedReps ?? o.reps) : range(o.reps.min);
    const loaded = policyPhase(policy, ladderFirst ? { ...o, sets: range(o.sets.min), reps: loadedReps, load: { mode: "absolute", value: 0, unit: o.step.unit ?? "kg" }, target: NONE, deload: defaultDeload(policy) } : o, policy);
    loaded.entry = { load: "previous", reps: "declared" };
    ladder.entry = { load: "declared", reps: "previous" };
    ladder.exit = { type: "load_present", to: policy };
    loaded.exit = { type: "load_absent", to: "ladder" };
    return ladderFirst ? [ladder, loaded] : [loaded, ladder];
  }
  var BUILD = {
    autoregulated: (o) => program(o, [phase("plan", o)]),
    linear: (o) => program(o, o.unloadedLadder ? regimes(o, "linear", false) : [policyPhase("linear", o)]),
    greyskull: (o) => program(o, o.unloadedLadder ? regimes(o, "greyskull", false) : [policyPhase("greyskull", o)]),
    double: (o) => program(o, o.unloadedLadder ? regimes(o, "double", false) : [policyPhase("double", o)]),
    triple: (o) => program(o, [policyPhase("triple", o)]),
    hold_seconds: (o) => program(o, [phase("plan", o, {
      progression: [{ id: "seconds", metric: "durationSeconds", when: "maximum", step: o.step.value }],
      ...stallOf(o, "factor")
    })]),
    bodyweight_ladder: (o) => program(o, o.loadedPreset ? regimes(o, o.loadedPreset, true) : [ladderPhase(o)]),
    pyramid_reps: (o) => program(o, [phase("plan", o, {
      groups: o.setReps.map((n, i) => ({
        id: `s${i + 1}`,
        count: range(1),
        reps: n === REPS_MAX ? range(0) : range(n),
        load: o.setWeights ? { basis: "absolute", value: o.setWeights[i] || 0, unit: o.load.unit || o.step.unit || "kg" } : anchor(),
        ...n === REPS_MAX ? { max: true } : {},
        ...o.setRest?.[i] > 0 ? { restSeconds: o.setRest[i] } : {}
      }))
    })]),
    pyramid: (o) => offsetsProgram(o),
    five_three_one: (o) => program(o, o.cycleSets.map((week, w) => ({
      ...phase(`w${w + 1}`, { ...o, sets: range(week.length), target: NONE }),
      groups: week.map((s, i) => ({ id: `s${i + 1}`, count: range(1), reps: range(s.reps), load: { basis: "training_max", percent: s.percentOfTM }, ...s.amrap ? { amrap: true } : {} })),
      exit: { type: "exposures", count: 1 }
    })), { end: "repeat", trainingMax: copy(o.trainingMax), cycleIncrement: copy(o.cycleIncrement) }),
    top_set_backoff: (o) => program(o, [phase("plan", { ...o, sets: range(1 + o.backoff.sets) }, {
      groups: [
        { id: "top", count: range(1), reps: "parameters", load: anchor(), restSeconds: o.restSeconds },
        { id: "backoff", count: range(o.backoff.sets), reps: range(o.backoff.reps), load: anchor(o.backoff.percent), restSeconds: o.backoff.restSeconds }
      ],
      success: o.scope === "top" ? { ...NEW_SUCCESS, scope: "groups", groupIds: ["top"] } : NEW_SUCCESS,
      progression: [loadOp(o, { basis: "current" })],
      ...stallOf(o, "factor")
    })]),
    density: (o) => program(o, [phase("plan", o, {
      success: NEW_SUCCESS,
      progression: [{ id: "rest", metric: "restSeconds", when: "success", step: o.restStep, direction: "down", min: o.restFloor, max: o.restSeconds }]
    })]),
    accumulation_intensification: (o) => {
      const tmPhase = (id, sets, reps, percent, more) => ({
        ...phase(id, { ...o, sets: range(sets), reps, load: { mode: "empty" }, target: NONE }, { success: NEW_SUCCESS }),
        groups: [{ id: "sets", count: "parameters", reps: "parameters", load: { basis: "training_max", percent } }],
        ...more
      });
      const i = o.intensification;
      return program(o, [
        tmPhase("accumulation", o.sets.min, o.reps, o.accumulation.percent, { progression: [{ id: "reps", metric: "reps", when: "success", step: 1 }], exit: { type: "goal", metric: "reps", target: o.reps.max } }),
        tmPhase("intensification", i.sets, range(i.reps), i.percent, { exit: { type: "successes", count: i.successes } })
      ], { end: o.end, trainingMax: copy(o.trainingMax), cycleIncrement: copy(o.cycleIncrement) });
    }
  };
  function offsetsProgram(o) {
    const groups = o.offsets.map((x, i) => ({ id: `s${i + 1}`, count: range(1), reps: x.reps ? range(x.reps) : "parameters", load: anchor(x.percentOfAnchor) }));
    return program(o, [phase("plan", o, {
      groups,
      // The anchor sets (100 %) decide the session; the lighter ones ride along.
      success: { ...V1_SUCCESS, scope: "groups", groupIds: groups.filter((g) => g.load.percent === 100).map((g) => g.id) },
      progression: [loadOp(o)],
      ...stallOf(o, "factor")
    })]);
  }
  var defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== void 0));
  function defaultPlanRule(preset, { id, exerciseId, routineId = null, unit = "kg", ...options } = {}) {
    const o = { ...templateDefaults(preset, unit, options.direction), ...defined(options) };
    return { id, revision: 1, routineId, exerciseId, preset, rounding: copy(o.rounding), program: BUILD[preset](o) };
  }
  var op = (ph, metric) => ph.progression.find((x) => x.metric === metric) ?? null;
  function planOptions(rule) {
    const pr = rule.program;
    const regime = pr.phases.length === 2 && pr.phases.some((ph) => ph.exit?.type === "load_present");
    const ladderFirst = regime && pr.phases[0].exit.type === "load_present";
    const main = pr.phases[0];
    const p = main.parameters;
    const o = { durationSeconds: null, speed: null, loadTo: null, rir: null, ...copy(p), target: copy(main.target), completion: copy(pr.completion), rounding: copy(rule.rounding) };
    const loadStep = op(main, "load") ?? (regime ? op(pr.phases[1], "load") : null);
    if (loadStep) o.step = copy(loadStep.step);
    if (op(main, "durationSeconds")) o.step = { type: "seconds", value: op(main, "durationSeconds").step };
    o.deload = main.stall ? { after: main.stall.after, factor: main.stall.recovery.factor } : null;
    const preset = rule.preset;
    if (preset === "bodyweight_ladder") {
      o.rungs = copy(op(main, "difficulty")?.rungs ?? []);
      if (regime) {
        const loaded = pr.phases[1];
        o.loadedPreset = loaded.id;
        if (loaded.id === "double" && canonicalJSON(loaded.parameters.reps) !== canonicalJSON(p.reps)) o.loadedReps = copy(loaded.parameters.reps);
        o.step = copy(op(loaded, "load").step);
      }
    }
    if (regime && !ladderFirst) {
      o.unloadedLadder = true;
      o.repCeiling = pr.phases[1].parameters.reps.max;
    }
    if (preset === "pyramid_reps") {
      o.setReps = main.groups.map((g) => g.max ? REPS_MAX : g.reps.min);
      if (main.groups.some((g) => g.load.basis === "absolute")) o.setWeights = main.groups.map((g) => g.load.value || 0);
      if (main.groups.some((g) => g.restSeconds > 0)) o.setRest = main.groups.map((g) => g.restSeconds ?? 0);
    }
    if (preset === "pyramid") o.offsets = main.groups.map((g) => ({ percentOfAnchor: g.load.percent, ...g.reps !== "parameters" ? { reps: g.reps.min } : {} }));
    if (preset === "five_three_one") {
      o.cycleSets = pr.phases.map((ph) => ph.groups.map((g) => ({ percentOfTM: g.load.percent, reps: g.reps.min, ...g.amrap ? { amrap: true } : {} })));
    }
    if (pr.trainingMax) {
      o.trainingMax = copy(pr.trainingMax);
      o.cycleIncrement = copy(pr.cycleIncrement);
    }
    if (preset === "top_set_backoff") {
      const [top, back] = main.groups;
      o.scope = main.success.scope === "groups" ? "top" : "all";
      o.restSeconds = top.restSeconds;
      o.backoff = { sets: back.count.min, reps: back.reps.min, percent: back.load.percent, restSeconds: back.restSeconds };
    }
    if (preset === "density") {
      const r = op(main, "restSeconds");
      o.restStep = r.step;
      o.restFloor = r.min;
      o.restSeconds = r.max;
    }
    if (preset === "accumulation_intensification") {
      const [a, i] = pr.phases;
      Object.assign(o, { sets: copy(a.parameters.sets), reps: copy(a.parameters.reps), end: pr.end, accumulation: { percent: a.groups[0].load.percent } });
      o.intensification = { sets: i.parameters.sets.min, reps: i.parameters.reps.min, percent: i.groups[0].load.percent, successes: i.exit.count };
    }
    return defined(o);
  }
  var isTemplateRule = (rule) => {
    try {
      return canonicalJSON({ ...defaultPlanRule(rule.preset, { id: rule.id, exerciseId: rule.exerciseId, routineId: rule.routineId, ...planOptions(rule) }), revision: rule.revision }) === canonicalJSON(rule);
    } catch {
      return false;
    }
  };
  var editPlan = (rule, patch) => ({ ...defaultPlanRule(rule.preset, { id: rule.id, exerciseId: rule.exerciseId, routineId: rule.routineId, ...planOptions(rule), ...patch }), revision: rule.revision });
  var planPhase = (rule) => rule.program.phases[0];
  var cardioParameters = ({ sets, min, speed }) => ({
    sets: range(sets),
    reps: range(1),
    durationSeconds: range(min * 60),
    ...speed > 0 ? { speed } : {}
  });
  var needsOneRm = (rule) => rule.program.trainingMax?.mode === "ninety_percent_1rm" || rule.program.phases.some((ph) => ph.parameters.load.mode === "percent_1rm" || ph.target.mode === "percent_1rm" || op(ph, "load")?.step.type === "snapshot_1rm_percent");
  var UNITS = ["kg", "lb"];
  var finite = Number.isFinite;
  var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  var isRange = (v) => isObj(v) && finite(v.min) && finite(v.max);
  function checkRange(errors, path, r, { min = 0, max = Infinity, integer = false } = {}) {
    if (!isRange(r)) {
      errors.push(`${path}: min and max must be finite numbers`);
      return;
    }
    if (r.min > r.max) errors.push(`${path}: min is above max`);
    if (r.min < min) errors.push(`${path}: must be at least ${min}`);
    if (r.max > max) errors.push(`${path}: must be at most ${max}`);
    if (integer && !(Number.isInteger(r.min) && Number.isInteger(r.max))) errors.push(`${path}: must be whole numbers`);
  }
  function checkExpression(errors, path, e, allowed) {
    if (!isObj(e) || !allowed.includes(e.mode)) {
      errors.push(`${path}.mode must be one of ${allowed.join(", ")}`);
      return;
    }
    if (e.mode === "absolute") {
      if (!finite(e.value) || e.value < 0) errors.push(`${path}.value must be a finite number \u2265 0`);
      if (!UNITS.includes(e.unit)) errors.push(`${path}.unit must be kg or lb`);
    }
    if (e.mode === "percent_1rm" && !(finite(e.percent) && e.percent > 0)) errors.push(`${path}.percent must be a finite number > 0`);
  }
  function checkRounding(errors, r) {
    if (r?.mode === "allowed_values") {
      const vs = r.allowedValues;
      if (!Array.isArray(vs) || !vs.length || !vs.every(finite) || vs.some((v, i) => i > 0 && v <= vs[i - 1])) errors.push("rounding.allowedValues must be finite, strictly ascending and non-empty");
    } else if (!["nearest", "up", "down"].includes(r?.mode) || !(finite(r.step) && r.step > 0)) {
      errors.push("rounding needs mode nearest/up/down and a step > 0, or mode allowed_values");
    }
  }
  var amount = (v) => isObj(v) && finite(v.value) && v.value >= 0 && UNITS.includes(v.unit);
  function checkParameters(errors, at, p) {
    if (!isObj(p)) {
      errors.push(`${at}.parameters is required`);
      return;
    }
    checkRange(errors, `${at}.parameters.sets`, p.sets, { min: 1, integer: true });
    checkRange(errors, `${at}.parameters.reps`, p.reps, { integer: true });
    if (p.durationSeconds !== void 0) checkRange(errors, `${at}.parameters.durationSeconds`, p.durationSeconds);
    if (p.rir !== void 0) checkRange(errors, `${at}.parameters.rir`, p.rir, { max: 10 });
    if (!(finite(p.restSeconds) && p.restSeconds >= 0)) errors.push(`${at}.parameters.restSeconds is required and must be \u2265 0`);
    checkExpression(errors, `${at}.parameters.load`, p.load, ["absolute", "percent_1rm", "empty"]);
    if (p.loadTo !== void 0) {
      const n = errors.length;
      checkExpression(errors, `${at}.parameters.loadTo`, p.loadTo, ["absolute", "percent_1rm"]);
      if (errors.length === n) {
        if (p.load?.mode !== p.loadTo.mode) errors.push(`${at}.parameters.loadTo needs a load of the same mode`);
        else if (p.loadTo.mode === "absolute" && p.loadTo.unit !== p.load.unit) errors.push(`${at}.parameters.loadTo.unit must match parameters.load.unit`);
        else if (p.loadTo.mode === "absolute" ? p.loadTo.value < p.load.value : p.loadTo.percent < p.load.percent) errors.push(`${at}.parameters.loadTo must not be below parameters.load`);
      }
    }
    if (p.speed !== void 0) {
      if (!(finite(p.speed) && p.speed > 0)) errors.push(`${at}.parameters.speed must be a number > 0`);
      else if (!p.durationSeconds) errors.push(`${at}.parameters.speed needs parameters.durationSeconds`);
    }
  }
  function checkGroups(errors, at, ph, hasTM) {
    const groups = ph.groups;
    if (!Array.isArray(groups) || !groups.length || groups.length > MAX_GROUPS) {
      errors.push(`${at}.groups must hold 1 to ${MAX_GROUPS} groups`);
      return;
    }
    const ids = /* @__PURE__ */ new Set();
    let rows = 0;
    groups.forEach((g, i) => {
      const gat = `${at}.groups[${i}]`;
      if (!isObj(g) || typeof g.id !== "string" || !g.id) {
        errors.push(`${gat}.id is required`);
        return;
      }
      if (ids.has(g.id)) errors.push(`${gat}.id "${g.id}" is duplicated`);
      ids.add(g.id);
      if (g.count !== "parameters") checkRange(errors, `${gat}.count`, g.count, { integer: true });
      if (g.reps !== "parameters") checkRange(errors, `${gat}.reps`, g.reps, { integer: true, max: 1e3 });
      rows += g.count === "parameters" ? isRange(ph.parameters?.sets) ? ph.parameters.sets.max : 0 : isRange(g.count) ? g.count.max : 0;
      const l = g.load;
      const okLoad = isObj(l) && (l.basis === "empty" || l.basis === "absolute" && finite(l.value) && l.value >= 0 && UNITS.includes(l.unit) || ["anchor", "training_max"].includes(l.basis) && finite(l.percent) && l.percent > 0 && l.percent <= 1e3);
      if (!okLoad) errors.push(`${gat}.load must be anchor/training_max with percent > 0, absolute with value \u2265 0 and unit, or empty`);
      else if (l.basis === "training_max" && !hasTM) errors.push(`${gat}.load needs program.trainingMax`);
      if (g.restSeconds !== void 0 && !(Number.isInteger(g.restSeconds) && g.restSeconds >= 0 && g.restSeconds <= 3600)) errors.push(`${gat}.restSeconds must be 0 to 3600 seconds`);
      for (const k of ["amrap", "max"]) if (g[k] !== void 0 && typeof g[k] !== "boolean") errors.push(`${gat}.${k} must be boolean`);
      if (g.reps !== "parameters" || g.max) {
        if (ph.parameters?.durationSeconds) errors.push(`${gat}: reps of its own are for reps work, not timed work`);
        else if (!g.max && isRange(g.reps) && g.reps.min < 1) errors.push(`${gat}.reps must ask for at least one rep`);
      }
    });
    if (rows < 1 || rows > MAX_ROWS) errors.push(`${at}.groups must resolve to 1 to ${MAX_ROWS} rows`);
    const s = ph.success;
    if (!isObj(s) || !["all", "groups"].includes(s.scope) || !["ignore", "prescribed"].includes(s.load) || !["ignore", "rir_floor"].includes(s.effort)) {
      errors.push(`${at}.success needs scope all|groups, load ignore|prescribed and effort ignore|rir_floor`);
    } else if (s.scope === "groups" && !(Array.isArray(s.groupIds) && s.groupIds.length && s.groupIds.every((id) => ids.has(id)))) {
      errors.push(`${at}.success.groupIds must name groups of this phase`);
    }
  }
  function checkOperators(errors, at, ph) {
    const ops = ph.progression;
    if (!Array.isArray(ops) || ops.length > MAX_OPERATORS) {
      errors.push(`${at}.progression must hold at most ${MAX_OPERATORS} operators`);
      return;
    }
    const p = ph.parameters || {};
    const metrics = /* @__PURE__ */ new Set();
    ops.forEach((o, i) => {
      const oat = `${at}.progression[${i}]`;
      if (!isObj(o) || !OPERATOR_METRICS.includes(o.metric)) {
        errors.push(`${oat}.metric must be one of ${OPERATOR_METRICS.join(", ")}`);
        return;
      }
      if (metrics.has(o.metric)) errors.push(`${oat}: ${o.metric} is progressed twice`);
      metrics.add(o.metric);
      if (!["success", "maximum", "worked"].includes(o.when)) errors.push(`${oat}.when must be success, maximum or worked`);
      if (o.basis !== void 0 && !["current", "last_actual"].includes(o.basis)) errors.push(`${oat}.basis must be current or last_actual`);
      if (o.direction !== void 0 && !["up", "down"].includes(o.direction)) errors.push(`${oat}.direction must be up or down`);
      if (o.addedSetOnly !== void 0 && (o.metric !== "reps" || typeof o.addedSetOnly !== "boolean")) errors.push(`${oat}.addedSetOnly is a boolean for a reps step`);
      if (o.resetOnCarry !== void 0 && typeof o.resetOnCarry !== "boolean") errors.push(`${oat}.resetOnCarry must be boolean`);
      for (const k of ["min", "max"]) if (o[k] !== void 0 && !(finite(o[k]) && o[k] >= 0)) errors.push(`${oat}.${k} must be a finite number \u2265 0`);
      if (finite(o.min) && finite(o.max) && o.min > o.max) errors.push(`${oat}: min is above max`);
      if (o.metric === "load") {
        const inc = o.step;
        if (!isObj(inc) || !INCREMENT_TYPES.includes(inc.type)) errors.push(`${oat}.step.type is not supported`);
        else {
          if (!(finite(inc.value) && inc.value >= 0)) errors.push(`${oat}.step.value must be a finite number \u2265 0`);
          if (inc.type === "absolute" && !UNITS.includes(inc.unit)) errors.push(`${oat}.step.unit must be kg or lb`);
          if (inc.type === "percentage_points" !== (p.load?.mode === "percent_1rm")) errors.push("a percent_1rm load progresses in percentage_points, and only it");
          if (inc.type === "target_load_percent" && ph.target?.mode === "none") errors.push("target_load_percent needs a target");
        }
        if (p.load?.mode === "empty") errors.push(`${at}: a load step needs a starting load`);
        if (p.loadTo !== void 0) errors.push(`${at}.parameters.loadTo: a load range cannot be stepped automatically`);
        if (o.amrapDoubleAt !== void 0 && !(finite(o.amrapDoubleAt) && o.amrapDoubleAt > 1)) errors.push(`${oat}.amrapDoubleAt must be a number > 1`);
      } else {
        if (!(finite(o.step) && o.step >= 0)) errors.push(`${oat}.step must be a finite number \u2265 0`);
        if (o.amrapDoubleAt !== void 0) errors.push(`${oat}.amrapDoubleAt is for a load step`);
      }
      if (o.metric === "durationSeconds" && !p.durationSeconds) errors.push(`${oat}: seconds need parameters.durationSeconds`);
      if ((o.metric === "restSeconds" || o.metric === "difficulty") && !(finite(o.min) && finite(o.max))) errors.push(`${oat}: ${o.metric} needs min and max`);
      if (o.metric === "difficulty") {
        if (!(Array.isArray(o.rungs) && o.rungs.length && o.rungs.every((x) => typeof x === "string" && x.trim()))) errors.push(`${oat}.rungs must be non-empty names`);
        else if (o.max !== o.rungs.length - 1) errors.push(`${oat}.max must be the last rung`);
      } else if (o.rungs !== void 0) errors.push(`${oat}.rungs belong to a difficulty step`);
    });
  }
  function checkPhase(errors, at, ph, hasTM) {
    if (!isObj(ph)) {
      errors.push(`${at} must be an object`);
      return;
    }
    if (typeof ph.id !== "string" || !ph.id) errors.push(`${at}.id is required`);
    checkParameters(errors, at, ph.parameters);
    checkExpression(errors, `${at}.target`, ph.target, ["absolute", "percent_1rm", "none"]);
    if (ph.parameters?.load?.mode === "absolute" && ph.target?.mode === "absolute" && ph.parameters.load.unit !== ph.target.unit) errors.push(`${at}.target.unit must match parameters.load.unit`);
    checkGroups(errors, at, ph, hasTM);
    checkOperators(errors, at, ph);
    if (ph.prefill !== void 0 && !["plan", "last"].includes(ph.prefill)) errors.push(`${at}.prefill must be plan or last`);
    if (ph.entry !== void 0 && !(isObj(ph.entry) && ["declared", "previous"].includes(ph.entry.load) && ["declared", "last_actual", "previous"].includes(ph.entry.reps))) errors.push(`${at}.entry needs load declared|previous and reps declared|last_actual|previous`);
    const s = ph.stall;
    if (s !== void 0) {
      if (!isObj(s) || !isObj(s.recovery)) errors.push(`${at}.stall must be { after, count, recovery }`);
      else {
        if (!(Number.isInteger(s.after) && s.after >= 1 && s.after <= 10)) errors.push(`${at}.stall.after must be a whole number of sessions from 1 to 10`);
        if (!["misses", "misses_without_improvement"].includes(s.count)) errors.push(`${at}.stall.count must be misses or misses_without_improvement`);
        if (!RECOVERY_METHODS.includes(s.recovery.method)) errors.push(`${at}.stall.recovery.method must be one of ${RECOVERY_METHODS.join(", ")}`);
        if (!isValidDeloadFactor(s.recovery.factor)) errors.push(`${at}.stall.recovery.factor must be between ${DELOAD_FACTOR_MIN} and ${DELOAD_FACTOR_MAX}`);
        if (!ph.progression?.some((o) => o.metric === "load" || o.metric === "durationSeconds")) errors.push(`${at}: only a phase that steps load or seconds can back off`);
      }
    }
  }
  function checkExit(errors, at, exit, ids, last) {
    if (exit == null) {
      if (!last) errors.push(`${at}.exit is required: a phase before the last must end`);
      return;
    }
    const types = ["exposures", "successes", "goal", "load_present", "load_absent"];
    if (!isObj(exit) || !types.includes(exit.type)) {
      errors.push(`${at}.exit.type must be one of ${types.join(", ")}`);
      return;
    }
    if (["exposures", "successes"].includes(exit.type) && !(Number.isInteger(exit.count) && exit.count >= 1)) errors.push(`${at}.exit.count must be a whole number \u2265 1`);
    if (exit.type === "goal" && !(["reps", "sets", "durationSeconds"].includes(exit.metric) && finite(exit.target) && exit.target >= 0)) errors.push(`${at}.exit goal needs metric reps|sets|durationSeconds and a target \u2265 0`);
    if (exit.to !== void 0 && !ids.includes(exit.to)) errors.push(`${at}.exit.to must name a phase`);
  }
  function validatePlanRule(rule) {
    if (!isObj(rule) || !PRESETS[rule.preset]) return { ok: false, errors: [`preset "${rule?.preset}" is not a preset`] };
    const errors = [];
    if (typeof rule.id !== "string" || !rule.id) errors.push("id is required");
    if (!Number.isInteger(rule.revision) || rule.revision < 1) errors.push("revision must be a positive integer");
    if (typeof rule.exerciseId !== "string" || !rule.exerciseId) errors.push("exerciseId is required");
    checkRounding(errors, rule.rounding);
    const pr = rule.program;
    if (!isObj(pr) || !Array.isArray(pr.phases) || !pr.phases.length || pr.phases.length > MAX_PHASES) {
      errors.push(`program.phases must hold 1 to ${MAX_PHASES} phases`);
      return { ok: false, errors };
    }
    if (!["complete", "repeat"].includes(pr.end)) errors.push("program.end must be complete or repeat");
    const tm = pr.trainingMax;
    if (tm !== void 0 && !(tm?.mode === "ninety_percent_1rm" || tm?.mode === "direct" && finite(tm.value) && tm.value > 0 && UNITS.includes(tm.unit))) errors.push("program.trainingMax must be direct {value, unit} or ninety_percent_1rm");
    if (pr.cycleIncrement !== void 0 && !amount(pr.cycleIncrement)) errors.push("program.cycleIncrement must be {value \u2265 0, unit}");
    const ids = pr.phases.map((ph) => ph?.id);
    ids.forEach((id, i) => {
      if (ids.indexOf(id) !== i) errors.push(`program.phases[${i}].id "${id}" is duplicated`);
    });
    pr.phases.forEach((ph, i) => {
      checkPhase(errors, `program.phases[${i}]`, ph, !!tm);
      if (isObj(ph)) checkExit(errors, `program.phases[${i}]`, ph.exit, ids, i === pr.phases.length - 1);
    });
    if (!Array.isArray(pr.completion)) errors.push("program.completion must be a list");
    const completion = Array.isArray(pr.completion) ? pr.completion : [];
    const metrics = completion.map((c) => c?.metric);
    metrics.filter((m, i) => metrics.indexOf(m) !== i).forEach((m) => errors.push(`completion metric "${m}" is listed twice`));
    const phases = pr.phases.filter(isObj);
    completion.forEach((c) => {
      if (!COMPLETION_METRICS.includes(c?.metric)) {
        errors.push(`completion metric "${c?.metric}" is not supported`);
        return;
      }
      if (c.metric === "target_load" && phases.every((ph) => ph.target?.mode === "none")) errors.push("target_load needs a target");
      if (c.metric === "max_duration" && !phases.some((ph) => ph.parameters?.durationSeconds)) errors.push("max_duration needs parameters.durationSeconds");
      const slides = phases.some((ph) => ph.progression?.some((o) => o.metric === "durationSeconds"));
      if (c.metric === "max_duration" && (c.target != null || slides) && !(finite(c.target) && c.target > 0)) errors.push("max_duration target must be a number > 0");
      if (c.metric === "cycle_count" && !(Number.isInteger(c.target) && c.target >= 1)) errors.push("cycle_count needs a whole target \u2265 1");
      if (c.metric === "training_max" && !(finite(c.target) && c.target > 0 && tm)) errors.push("training_max needs a target > 0 and a training max");
      if (c.metric === "difficulty_rung" && !phases.some((ph) => ph.progression?.some((o) => o.metric === "difficulty"))) errors.push("difficulty_rung needs named rungs");
      if (c.metric === "rest_floor" && !(finite(c.target) && c.target >= 0 && phases.some((ph) => ph.progression?.some((o) => o.metric === "restSeconds")))) errors.push("rest_floor needs a rest step and a target \u2265 0");
    });
    return { ok: errors.length === 0, errors };
  }
  function supports(rule) {
    const pr = rule.program, ph = pr.phases[0];
    const usable = !ph.parameters.durationSeconds && (ph.parameters.load.mode !== "empty" || !!pr.trainingMax || ph.groups.some((g) => g.load.basis === "absolute" && g.load.value > 0));
    const ladder = pr.phases.some((x) => x.progression.some((o) => o.metric === "sets" || o.metric === "difficulty") || x.exit?.type === "load_present");
    const perSet = ph.groups.length > 1 && ph.groups.every((g) => g.load.basis === "anchor" && g.load.percent === 100 || g.load.basis === "absolute") && ph.groups.some((g) => g.reps !== "parameters" || g.max);
    const single = ph.groups.length === 1 && pr.phases.length === 1 && ph.groups[0].count === "parameters" && !ph.groups[0].amrap && ph.groups[0].load.basis === "anchor" && ph.groups[0].load.percent === 100;
    const failure = !perSet && pr.phases.every((x) => !x.parameters.speed && !x.groups.some((g) => g.amrap || g.max) && !x.progression.some((o) => o.metric === "restSeconds") && (!x.exit || ["load_present", "load_absent"].includes(x.exit.type)));
    return { warmup: usable, dropset: usable && !perSet && !ladder, restpause: usable && single && !ladder, failure };
  }

  // openGym-motore-generico/api/engine/program.js
  var copy2 = (v) => v === void 0 ? void 0 : JSON.parse(JSON.stringify(v));
  var phaseById = (program2, id) => program2.phases.find((ph) => ph.id === id) ?? null;
  var operatorFor = (phase2, metric) => phase2.progression.find((op2) => op2.metric === metric) ?? null;
  var phaseOf = (p) => phaseById(p.ruleSnapshot.program, p.phaseId);
  function initialValues(phase2) {
    const p = phase2.parameters;
    return {
      // Reps climbed from what was done (v1 double progression) open at the plan's own: the top.
      load: copy2(p.load),
      sets: p.sets.min,
      reps: operatorFor(phase2, "reps")?.basis === "last_actual" ? p.reps.max : p.reps.min,
      durationSeconds: copy2(p.durationSeconds) ?? null,
      restSeconds: p.restSeconds,
      difficulty: 0,
      trainingMax: null
    };
  }
  var frozenValues = (phase2, values, { sets, reps, durationSeconds, restSeconds }) => ({
    sets,
    reps,
    ...values.rowReps ? { rowReps: copy2(values.rowReps) } : {},
    ...durationSeconds ? { durationSeconds: copy2(durationSeconds) } : {},
    ...operatorFor(phase2, "restSeconds") ? { restSeconds } : {},
    ...operatorFor(phase2, "difficulty") ? { difficulty: values.difficulty } : {},
    ...values.trainingMax ? { trainingMax: copy2(values.trainingMax) } : {}
  });
  var startOf = (phase2, op2) => op2.direction === "down" ? op2.max ?? phase2.parameters[op2.metric]?.max : op2.min ?? phase2.parameters[op2.metric]?.min;
  function valueOf(phase2, values, metric) {
    const p = phase2.parameters;
    const op2 = operatorFor(phase2, metric);
    if (op2) return values[metric] ?? startOf(phase2, op2);
    if (metric === "reps" && phase2.entry?.reps === "last_actual") return values.reps ?? p.reps.min;
    return { sets: p.sets.min, reps: p.reps.min, durationSeconds: p.durationSeconds ?? null, restSeconds: p.restSeconds }[metric];
  }
  var starts = (rule) => canonicalJSON(rule.program.phases.map((ph) => [ph.id, ph.parameters.load, operatorFor(ph, "load")?.step.type ?? null]));
  var sameStart = (a, b) => starts(a) === starts(b);
  function regimeExit(program2, phase2, load) {
    const exit = phase2.exit;
    const loaded = load > 0;
    if (exit?.type === "load_present" && loaded || exit?.type === "load_absent" && !loaded) return phaseById(program2, exit.to);
    return null;
  }
  function entryValues(phase2, values, { load = null, reps = null, previous = null } = {}) {
    const v = { ...initialValues(phase2), trainingMax: copy2(values?.trainingMax ?? null) };
    if (phase2.entry?.load === "previous" && load?.value > 0 && phase2.parameters.load.mode === "absolute") v.load = { mode: "absolute", value: load.value, unit: load.unit ?? phase2.parameters.load.unit };
    if (phase2.entry?.reps === "last_actual" && reps > 0) v.reps = Math.floor(reps);
    if (phase2.entry?.reps === "previous" && previous > 0) v.reps = previous;
    return v;
  }
  var isWork = (row) => row.status === "completed" && row.role !== "warmup";
  function bestLoad(x, assisted) {
    const work = (x?.performance?.sets || []).filter(isWork);
    const own = work.some((r) => r.prescribed) ? work.filter((r) => r.prescribed) : work;
    const loads = own.filter((r) => r.resistance?.kind === "external-load").map((r) => r.resistance.value);
    return loads.length ? assisted ? Math.min(...loads) : Math.max(...loads) : x?.actual?.load?.value ?? null;
  }
  var bestLoadOf = (x, assisted, unit) => {
    const value = bestLoad(x, assisted);
    return value == null ? null : { value, unit: x?.actual?.load?.unit ?? x?.performance?.sets?.find((r) => r.resistance?.unit)?.resistance.unit ?? unit };
  };
  function unweightedLog(p, log) {
    return !!operatorFor(phaseOf(p), "load") && !p.assisted && !((bestLoad(log, p.assisted) ?? 0) > 0);
  }
  var perRowLoads = (phase2) => phase2.groups.some((g) => g.load.basis === "training_max" || g.load.basis === "absolute" || g.load.basis === "anchor" && g.load.percent !== 100);
  function rowsFor(phase2, { sets, reps, repsMax, anchor: anchor2, loadTo, trainingMax, rounding, rest, lastWork = [], lastLoads = [] }) {
    const percentOf = (base, percent) => base ? { value: roundLoad(base.value * percent / 100, rounding), unit: base.unit } : null;
    const rows = [];
    for (const g of phase2.groups) {
      const n = g.count === "parameters" ? sets : g.count.min;
      for (let k = 0; k < n; k++) {
        const i = rows.length;
        const load = g.load.basis === "absolute" ? g.load.value > 0 ? { value: roundLoad(g.load.value, rounding), unit: g.load.unit } : lastLoads[i] || anchor2 : g.load.basis === "training_max" ? percentOf(trainingMax, g.load.percent) : g.load.basis === "anchor" ? percentOf(anchor2, g.load.percent) : null;
        const seed = Math.max(0, lastWork[i] ?? 0);
        rows.push({
          // The group and the rest after the set, written only where they say something the
          // prescription does not already say (one group; the exercise's rest).
          ...phase2.groups.length > 1 ? { groupId: g.id } : {},
          reps: g.max ? { min: seed, max: seed } : g.reps === "parameters" ? { min: reps, max: repsMax } : copy2(g.reps),
          load,
          ...loadTo !== void 0 && g.load.basis === "anchor" && g.load.percent === 100 ? { loadTo: copy2(loadTo) } : {},
          ...g.restSeconds != null && g.restSeconds !== rest ? { restSeconds: g.restSeconds } : {},
          ...g.amrap ? { amrap: true } : {},
          ...g.max ? { max: true } : {}
        });
      }
    }
    return rows;
  }

  // openGym-motore-generico/api/engine/context.js
  function planFingerprint(rule) {
    return canonicalJSON(rule.program.phases.map((ph) => ({
      id: ph.id,
      sets: ph.parameters.sets,
      reps: ph.parameters.reps,
      durationSeconds: ph.parameters.durationSeconds ?? null,
      groups: ph.groups.map((g) => [g.count, g.reps, !!g.amrap, !!g.max]),
      exit: ph.exit ?? null
    })));
  }

  // openGym-motore-generico/api/engine/failure.js
  function failureSetRange(rule) {
    const phase2 = planPhase(rule);
    return phase2.groups.reduce((total, group) => {
      const count = group.count === "parameters" ? phase2.parameters.sets : group.count;
      return { min: total.min + count.min, max: total.max + count.max };
    }, { min: 0, max: 0 });
  }
  function failureSetsOf(cfg = {}) {
    const value = cfg.failureSets ?? (cfg.lastToFailure === true ? "last" : []);
    if (value === "all" || value === "last") return value;
    if (!Array.isArray(value) || value.length > MAX_ROWS || value.some((n) => !Number.isInteger(n) || n < 1 || n > MAX_ROWS)) throw new Error("invalid failure sets");
    return [...new Set(value)].sort((a, b) => a - b);
  }
  function failureSetSelected(cfg, index, count) {
    if (index < 0 || index >= count) return false;
    const selected = failureSetsOf(cfg);
    return selected === "all" || (selected === "last" ? index === count - 1 : selected.includes(index + 1));
  }
  function failureSuffix(cfg, count) {
    const selected = Array.from({ length: count }, (_, i) => failureSetSelected(cfg, i, count));
    return selected.some(Boolean) ? selected.every(Boolean) ? "+" : "(+)" : "";
  }

  // openGym-motore-generico/api/engine/warmup.js
  var steps = (list) => list.map(([percent, reps]) => ({ percent, reps }));
  var RECIPES = {
    heavy: steps([[25, 8], [40, 5], [60, 3], [75, 1], [85, 1]]),
    standard: steps([[40, 8], [60, 5], [75, 2], [85, 1]]),
    light: steps([[50, 8], [70, 4], [85, 1]])
  };
  var HEAVY = /* @__PURE__ */ new Set(["barbell", "smith machine"]);
  var STANDARD = /* @__PURE__ */ new Set(["dumbbell", "machine", "leverage machine", "leverage", "cable", "body weight"]);
  var warmupClass = (eq) => !eq ? "standard" : HEAVY.has(eq) ? "heavy" : STANDARD.has(eq) ? "standard" : "light";
  var warmupMaxCount = (eq) => RECIPES[warmupClass(eq)].length;
  function warmupSteps(warmup, eq) {
    if (warmup?.mode === "template") return warmup.steps;
    if (warmup?.mode === "smart") return RECIPES[warmupClass(eq)].slice(-warmup.count);
    return [];
  }
  function planWarmupRows({ rows, warmup, eq, rounding, floor = 0 }) {
    const work = rows.find((r) => r.load?.value > 0)?.load;
    if (!work) return [];
    const down = { mode: "down", step: rounding?.step || (work.unit === "lb" ? 5 : 2.5) };
    const out = [];
    for (const { percent, reps } of warmupSteps(warmup, eq)) {
      const ideal = work.value * percent / 100;
      const allowed = eq === "dumbbell" && rounding?.mode === "allowed_values" ? rounding.allowedValues.filter((v) => v <= ideal) : null;
      const value = Math.max(floor, allowed ? allowed.at(-1) ?? rounding.allowedValues[0] : roundLoad(ideal, down));
      if (value <= 0 || value >= work.value || value === out.at(-1)?.load.value) continue;
      out.push({ load: { value, unit: work.unit }, reps, phase: "warmup" });
    }
    return out;
  }
  var int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  var keys = (o) => Object.keys(o).sort().join();
  var stepOk = (s, decimals) => !!s && typeof s === "object" && keys(s) === "percent,reps" && Number.isFinite(s.percent) && s.percent >= 1 && s.percent <= 100 && Number(s.percent.toFixed(decimals)) === s.percent && int(s.reps, 1, 30);
  function validateWarmup(w, decimals = 1) {
    if (w === void 0) return true;
    if (!w || typeof w !== "object" || Array.isArray(w)) return false;
    if (w.mode === "off") return keys(w) === "mode";
    if (w.mode === "smart") return keys(w) === "count,mode" && int(w.count, 1, 5);
    if (w.mode === "template") return keys(w) === "mode,steps" && Array.isArray(w.steps) && w.steps.length >= 1 && w.steps.length <= 5 && w.steps.every((s) => stepOk(s, decimals));
    return false;
  }

  // openGym-motore-generico/api/engine/generate.js
  var copy3 = (v) => v === void 0 ? void 0 : JSON.parse(JSON.stringify(v));
  var same = (a, b) => canonicalJSON(a ?? null) === canonicalJSON(b ?? null);
  function trainingMaxFor(program2, snapshot1RM, rounding) {
    const tm = program2.trainingMax;
    if (tm.mode === "direct") return { value: tm.value, unit: tm.unit };
    return snapshot1RM ? { value: roundLoad(snapshot1RM.value * 0.9, rounding), unit: snapshot1RM.unit } : null;
  }
  function generatePrescription({ id, now, trackId, rule, state = null, lastPrescription = null, lastLog = null, oneRm = null, warmup = null, equipment = null, reset = null, heldLoad = null, startFrom = "plan", fingerprint, perSide = false, restPause = false, restPauseReps = null, bodyweight = false, assisted = void 0, at = null, backoff = false, warmupFloor = 0, failureSets = void 0, lastToFailure = false }) {
    if (Number.isFinite(lastLog?.actual?.reps) && !Number.isInteger(lastLog.actual.reps)) lastLog = { ...lastLog, actual: { ...lastLog.actual, reps: Math.floor(lastLog.actual.reps) } };
    const check = validatePlanRule(rule);
    if (!check.ok) throw new Error(`invalid plan rule ${rule?.id}: ${check.errors.join("; ")}`);
    if (reset) state = null;
    const selection = failureSetsOf({ failureSets, lastToFailure });
    const planFailure = !rule.program.phases[0].parameters.speed && (failureSets == null && lastToFailure || supports(rule).failure && !restPause);
    const program2 = rule.program;
    const reopened = state?.status === "completed" && state.planRuleRevision !== rule.revision;
    const status = state && !reopened ? state.status : "active";
    const snapshot1RM = needsOneRm(rule) && oneRm ? copy3(oneRm) : null;
    const before = lastPrescription?.ruleSnapshot ?? null;
    const carry = !!state?.values && !!before && sameStart(before, rule);
    let phase2 = carry && phaseById(program2, state.phaseId) || program2.phases[0];
    let values = carry ? copy3(state.values) : initialValues(phase2);
    if (at) {
      phase2 = phaseById(program2, at.phaseId) || phase2;
      values = { ...initialValues(phase2), ...copy3(at.values) };
    }
    if (reset && heldLoad && phase2.parameters.load.mode === "absolute" && (!before || sameStart(before, rule))) values.load = { mode: "absolute", value: heldLoad.value, unit: heldLoad.unit };
    if (!carry && !at) {
      const opening = bestLoad(lastLog, assisted) ?? (values.load.mode === "absolute" ? values.load.value : 0);
      const to = regimeExit(program2, phase2, opening);
      if (to) {
        values = entryValues(to, values, { load: bestLoadOf(lastLog, assisted, values.load.unit) ?? heldLoad, reps: lastLog?.actual?.reps, previous: lastPrescription?.values?.reps ?? lastPrescription?.prefill?.reps });
        phase2 = to;
      }
    }
    const p = phase2.parameters;
    const trainingMax = !program2.trainingMax ? null : carry && values.trainingMax && same(before.program.trainingMax, program2.trainingMax) ? copy3(values.trainingMax) : trainingMaxFor(program2, snapshot1RM, rule.rounding);
    values.trainingMax = trainingMax;
    const targetExpression = phase2.target.mode === "none" ? null : copy3(phase2.target);
    const target = status === "completed" ? { expression: targetExpression, resolved: copy3(state.terminalTarget) } : { expression: targetExpression, resolved: targetExpression ? resolveLoad(targetExpression, { snapshot1RM, rounding: rule.rounding }) : null };
    const resolve = (e) => resolveLoad(e, { snapshot1RM, rounding: rule.rounding, cap: target.resolved?.value ?? null, assisted });
    const load = { expression: copy3(values.load), resolved: resolve(values.load) };
    const loadTo = p.loadTo ? { expression: copy3(p.loadTo), resolved: resolve(p.loadTo) } : null;
    const duration = valueOf(phase2, values, "durationSeconds");
    const rest = valueOf(phase2, values, "restSeconds");
    const deload = carry ? state.deload ?? null : null;
    const unweighted = !!lastLog && !reset && !!before && lastPrescription.phaseId === phase2.id && unweightedLog(lastPrescription, lastLog);
    const moved = !carry || lastPrescription.phaseId !== phase2.id || !same(lastPrescription.parameters.load.expression, values.load) || !same(lastPrescription.values.durationSeconds, duration) || (lastPrescription.values.difficulty ?? 0) !== (values.difficulty ?? 0);
    const fresh = !!reset || !lastLog || moved || unweighted;
    const fromLast = !fresh && phase2.prefill === "last";
    const last = lastLog?.actual || {};
    const owns = (metric) => !!operatorFor(phase2, metric);
    const pinned = phase2.entry?.reps === "last_actual";
    const sets = valueOf(phase2, values, "sets");
    const reps = deload?.reps ?? valueOf(phase2, values, "reps");
    const lastWork = (lastLog?.performance?.sets || []).filter((r) => r.status === "completed" && r.role !== "warmup").map((r) => ({ side: r.side, r: r.observations?.find((o) => o.metric === "repetitions")?.value })).flatMap((x, i, xs) => x.side === "R" && xs[i - 1]?.side === "L" ? [] : x.side === "L" && xs[i + 1]?.side === "R" ? [(x.r ?? 0) + (xs[i + 1].r ?? 0)] : [x.r]);
    const seeds = lastWork.some((r) => r > 0) ? lastWork : last.reps > 0 ? [last.reps] : [];
    const lastRows = startFrom === "last" && !reset && phase2.progression.length > 0 && (!owns("reps") || unweighted) && seeds.length ? Array.from({ length: sets }, (_, i) => {
      const r = seeds[i] ?? seeds.at(-1);
      return r > 0 ? r : reps;
    }) : null;
    const prefill = {
      sets: owns("sets") ? sets : fromLast ? last.sets || sets : sets,
      // A deload under a rep window may trade reps for load (deload.js): those reps open the session.
      reps: deload?.reps ?? (lastRows ? lastRows[0] : owns("reps") || pinned ? reps : fromLast ? last.reps ?? reps : reps),
      ...lastRows && deload?.reps == null && lastRows.some((r) => r !== lastRows[0]) ? { rowReps: lastRows } : {},
      ...duration ? { durationSeconds: fromLast ? last.durationSeconds ?? duration.min : duration.min } : {},
      ...p.speed ? { speed: fromLast ? last.speed ?? p.speed : p.speed } : {},
      ...!fresh && last.rir != null ? { rir: last.rir } : {},
      // A v1 policy that steps the load is already where its last finish left it (advance.js holds
      // what was lifted). One that names no weight (a timed hold) opens at what was lifted last time;
      // a bodyweight climb at none. A phase with no progression opens at its own declared load, or at
      // what was lifted when it declares none (v1 'off'); any other at what was done last time.
      load: perRowLoads(phase2) || reset || !lastLog || p.load.mode === "empty" && phase2.progression.length ? null : owns("load") ? fresh || operatorFor(phase2, "load").basis === "last_actual" || !last.load ? null : copy3(last.load) : owns("durationSeconds") || !(p.load.mode === "absolute" && p.load.value > 0) ? bestLoadOf(lastLog, assisted, values.load.unit) : null
    };
    if (duration && p.speed && lastLog?.performance?.sets?.length) {
      const observed = (row, metric) => row.observations?.find((o) => o.metric === metric)?.value;
      const prior = lastLog.performance.sets.filter((row) => row.status === "completed" && row.role !== "warmup");
      if (prior.length) prefill.cardioRows = Array.from({ length: sets }, (_, i) => {
        const row = prior[i] || prior.at(-1), incline = observed(row, "incline");
        return { min: (observed(row, "duration") ?? duration.min) / 60, speed: observed(row, "speed") ?? p.speed, ...incline != null ? { incline } : {} };
      });
    }
    if (lastRows && (prefill.rowReps || prefill.reps !== reps)) prefill.carried = true;
    if (restPause) {
      prefill.sets = 1;
      prefill.reps = restPauseReps ?? prefill.reps;
      delete prefill.rowReps;
    }
    const lastLoads = (lastLog?.performance?.sets || []).filter((r) => r.status === "completed" && r.role !== "warmup" && r.side !== "R").map((r) => r.resistance?.kind === "external-load" ? { value: r.resistance.value, unit: r.resistance.unit || values.load.unit || "kg" } : null);
    const rows = rowsFor(phase2, {
      // A rest-pause row aims at its burst total (the prefill) but is judged, as v1 did, against the plan's reps.
      sets: restPause ? 1 : sets,
      reps,
      repsMax: pinned ? reps : Math.max(reps, p.reps.max),
      anchor: load.resolved,
      loadTo: loadTo ? loadTo.resolved : void 0,
      trainingMax,
      rounding: rule.rounding,
      rest,
      lastWork,
      lastLoads
    });
    if (operatorFor(phase2, "reps")?.addedSetOnly) {
      const aims = values.rowReps || Array(sets).fill(reps);
      rows.forEach((row, i) => {
        row.reps = { min: aims[i] ?? reps, max: p.reps.max };
      });
      prefill.rowReps = rows.map((row) => row.reps.min);
    }
    if (planFailure) rows.forEach((row, i) => {
      if (failureSetSelected({ failureSets: selection }, i, rows.length)) row.failure = true;
    });
    const backoffStep = backoff && !assisted && !duration && !restPause && !perRowLoads(phase2) && phase2.groups.length === 1 ? operatorFor(phase2, "load")?.step.value ?? rule.rounding.step : 0;
    if (backoffStep > 0 && rows[0]?.load) {
      const top = prefill.load?.value ?? rows[0].load.value;
      rows.forEach((row, i) => {
        row.load = { ...row.load, value: Math.max(Math.min(top, backoffStep), Number((top - i * backoffStep).toFixed(6))) };
      });
      prefill.load = null;
    }
    const stepOp = operatorFor(phase2, "load")?.step;
    const warmupRows = duration ? [] : planWarmupRows({ rows, warmup, eq: equipment, floor: warmupFloor, rounding: stepOp?.type === "absolute" && rule.rounding.mode !== "allowed_values" ? { mode: "nearest", step: stepOp.value } : rule.rounding });
    const body = {
      id,
      generatedAt: now,
      planRuleId: rule.id,
      planRuleRevision: rule.revision,
      planFingerprint: fingerprint === void 0 ? planFingerprint(rule) : fingerprint,
      exerciseId: rule.exerciseId,
      trackId,
      preset: rule.preset,
      // Frozen with the prescription: finishing it (advance.js, audit.js) reads the movement the same way.
      ...typeof assisted === "boolean" ? { assisted } : {},
      ...perSide ? { perSide: true } : {},
      ...restPause ? { restPause: true } : {},
      ...bodyweight ? { bodyweight: true } : {},
      ...backoffStep > 0 ? { backoffStep } : {},
      statusAtGeneration: status,
      snapshot1RM,
      ruleSnapshot: copy3(rule),
      phaseId: phase2.id,
      values: frozenValues(phase2, values, { sets, reps, durationSeconds: duration, restSeconds: rest }),
      parameters: {
        sets: restPause ? { min: 1, max: 1 } : copy3(p.sets),
        reps: copy3(p.reps),
        ...duration ? { durationSeconds: copy3(duration) } : {},
        ...p.speed ? { speed: p.speed } : {},
        load,
        ...loadTo ? { loadTo } : {},
        ...p.rir ? { rir: copy3(p.rir) } : {},
        restSeconds: rest
      },
      target,
      trainingMax,
      rows,
      ...planFailure && (typeof selection === "string" || selection.length) ? { failureSets: selection } : {},
      ...warmupRows.length ? { warmupRows } : {},
      prefill,
      provenance: { derivedFromOutOfPlan: !!lastLog?.audit?.some((f) => f.code !== "completed_track"), sourceLogId: lastLog?.id ?? null, ...deload ? { deload: copy3(deload) } : {} }
    };
    return deepFreeze({ ...body, contentHash: contentHash(body) });
  }
  return __toCommonJS(stdin_exports);
})();
