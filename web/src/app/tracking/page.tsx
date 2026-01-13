"use client";

import FlashButton from "@/components/FlashButton";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

type ApiRecipe = {
  id?: string;
  name?: string;
  servings?: string | null;
  method?: string | null;
  tags?: string | null;
  ingredients?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
};

type ApiMealLog = {
  id?: string;
  meal?: string | null;
  items?: string[] | string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  log_date?: string | null;
  created_at?: string | null;
};

type ApiBodyEntry = {
  id?: string;
  log_date?: string | null;
  weight?: number | null;
  body_fat?: number | null;
  waist?: number | null;
  sleep?: number | null;
  created_at?: string | null;
};

type ApiProfile = {
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  sex?: string | null;
  activity_level?: string | null;
  goal_weight?: number | null;
};

type MealLog = {
  id: string;
  meal: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logDate?: string;
  createdAt?: string;
};

type Recipe = {
  id: string;
  name: string;
  servings: string;
  method: string;
  tags: string;
  ingredients: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type BodyEntry = {
  id: string;
  logDate?: string;
  dateLabel: string;
  weight?: number;
  bodyFat?: number;
  waist?: number;
  sleep?: number;
  createdAt?: string;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const parseItems = (value: string) =>
  value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "--";

const formatDateLabel = (logDate?: string) => {
  if (!logDate) {
    return "--";
  }
  const parts = logDate.split("-");
  if (parts.length >= 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return logDate;
};

const toNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
};

const activityOptions = [
  { label: "久坐办公", factor: 1.2 },
  { label: "每周轻度运动", factor: 1.375 },
  { label: "每周 3-5 次运动", factor: 1.55 },
  { label: "高强度训练者", factor: 1.725 },
];

const mealOrder = ["早餐", "午餐", "晚餐", "加餐"];

const compareByDate = (a?: string, b?: string) =>
  (a ?? "").localeCompare(b ?? "");

const buildWeightPath = (weights: number[]) => {
  if (weights.length === 0) {
    return { path: "", points: [] as Array<[number, number]> };
  }
  const width = 320;
  const height = 120;
  const pad = 12;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(max - min, 0.8);
  const step =
    weights.length > 1 ? (width - pad * 2) / (weights.length - 1) : 0;
  const points = weights.map((value, index) => {
    const x = pad + index * step;
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });
  const path = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`
    )
    .join(" ");
  return { path, points };
};

const seedMealLogs = (logDate: string): MealLog[] => [
  {
    id: createId(),
    meal: "早餐",
    logDate,
    calories: 410,
    protein: 22,
    carbs: 48,
    fat: 12,
    createdAt: `${logDate}T08:00:00Z`,
    items: ["燕麦 40g + 牛奶", "水煮蛋 2 颗", "蓝莓 1 小碗"],
  },
  {
    id: createId(),
    meal: "午餐",
    logDate,
    calories: 520,
    protein: 38,
    carbs: 52,
    fat: 14,
    createdAt: `${logDate}T12:00:00Z`,
    items: ["鸡胸 120g", "藜麦 80g", "混合蔬菜沙拉"],
  },
  {
    id: createId(),
    meal: "晚餐",
    logDate,
    calories: 360,
    protein: 28,
    carbs: 24,
    fat: 16,
    createdAt: `${logDate}T18:30:00Z`,
    items: ["三文鱼 100g", "烤南瓜", "西兰花"],
  },
  {
    id: createId(),
    meal: "加餐",
    logDate,
    calories: 160,
    protein: 6,
    carbs: 10,
    fat: 8,
    createdAt: `${logDate}T15:30:00Z`,
    items: ["无糖气泡水", "杏仁 8 颗"],
  },
];

const seedRecipes = (): Recipe[] => [
  {
    id: createId(),
    name: "轻食鸡胸沙拉",
    servings: "1 份",
    method: "煎 / 烤",
    tags: "高蛋白 / 低脂",
    ingredients: "鸡胸 120g，生菜 50g，西兰花 80g",
    calories: 420,
    protein: 38,
    carbs: 28,
    fat: 12,
  },
];

const seedBodyEntries = (year: number): BodyEntry[] => {
  const seeds = [
    { date: `${year}-01-06`, weight: 62.1 },
    { date: `${year}-01-08`, weight: 61.9 },
    { date: `${year}-01-10`, weight: 61.5 },
    { date: `${year}-01-11`, weight: 61.3 },
  ];
  return seeds.map((entry) => ({
    id: createId(),
    logDate: entry.date,
    dateLabel: formatDateLabel(entry.date),
    weight: entry.weight,
    createdAt: `${entry.date}T08:00:00Z`,
  }));
};

const normalizeRecipe = (row: ApiRecipe): Recipe => ({
  id: row.id ?? createId(),
  name: row.name ?? "未命名食谱",
  servings: row.servings ?? "1 份",
  method: row.method ?? "煎 / 烤",
  tags: row.tags ?? "",
  ingredients: row.ingredients ?? "",
  calories: Number(row.calories ?? 0),
  protein: Number(row.protein ?? 0),
  carbs: Number(row.carbs ?? 0),
  fat: Number(row.fat ?? 0),
});

const normalizeMealLog = (row: ApiMealLog): MealLog => {
  const items = Array.isArray(row.items)
    ? row.items
    : parseItems(String(row.items ?? ""));
  return {
    id: row.id ?? createId(),
    meal: row.meal ?? "自定义",
    items,
    calories: Number(row.calories ?? 0),
    protein: Number(row.protein ?? 0),
    carbs: Number(row.carbs ?? 0),
    fat: Number(row.fat ?? 0),
    logDate: row.log_date ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
};

const normalizeBodyEntry = (row: ApiBodyEntry): BodyEntry => {
  const logDate = row.log_date ?? undefined;
  return {
    id: row.id ?? createId(),
    logDate,
    dateLabel: formatDateLabel(logDate),
    weight: row.weight ?? undefined,
    bodyFat: row.body_fat ?? undefined,
    waist: row.waist ?? undefined,
    sleep: row.sleep ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
};

const normalizeProfile = (row: ApiProfile) => {
  const activityIndex = activityOptions.findIndex(
    (option) => option.label === row.activity_level
  );
  return {
    height: row.height_cm ? String(row.height_cm) : "",
    weight: row.weight_kg ? String(row.weight_kg) : "",
    age: row.age ? String(row.age) : "",
    sex: row.sex ?? "女性",
    activityIndex: activityIndex === -1 ? 1 : activityIndex,
  };
};

export default function TrackingPage() {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() =>
    seedMealLogs(todayIso)
  );
  const [recipes, setRecipes] = useState<Recipe[]>(() => seedRecipes());
  const [mealForm, setMealForm] = useState({
    meal: "早餐",
    items: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [recipeForm, setRecipeForm] = useState({
    name: "",
    servings: "1 份",
    method: "煎 / 烤",
    tags: "",
    ingredients: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [bodyForm, setBodyForm] = useState({
    weight: "",
    bodyFat: "",
    waist: "",
    sleep: "",
  });
  const [bodyEntries, setBodyEntries] = useState<BodyEntry[]>(() =>
    seedBodyEntries(new Date().getFullYear())
  );
  const [latestWeight, setLatestWeight] = useState("");
  const [profile, setProfile] = useState({
    height: "",
    weight: "",
    age: "",
    sex: "女性",
    activityIndex: 1,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [apiStatus, setApiStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [savingBody, setSavingBody] = useState(false);
  const [savingLatestWeight, setSavingLatestWeight] = useState(false);

  const accessToken = session?.access_token;
  const isAuthenticated = Boolean(accessToken);

  const canSaveRecipe =
    isAuthenticated &&
    recipeForm.name.trim().length > 0 &&
    recipeForm.ingredients.trim().length > 0 &&
    !savingRecipe;
  const canAddMeal =
    isAuthenticated &&
    mealForm.items.trim().length > 0 &&
    Number.isFinite(Number(mealForm.calories)) &&
    Number(mealForm.calories) > 0 &&
    !savingMeal;
  const canSaveBody =
    isAuthenticated &&
    (Boolean(bodyForm.weight) ||
      Boolean(bodyForm.bodyFat) ||
      Boolean(bodyForm.waist) ||
      Boolean(bodyForm.sleep)) &&
    !savingBody;
  const canSaveLatestWeight =
    isAuthenticated &&
    Number.isFinite(Number(latestWeight)) &&
    Number(latestWeight) > 0 &&
    !savingLatestWeight;

  const todayCalories = useMemo(() => {
    return mealLogs
      .filter((log) => (log.logDate ?? todayIso) === todayIso)
      .reduce((sum, meal) => sum + meal.calories, 0);
  }, [mealLogs, todayIso]);

  const weightSeries = useMemo(() => {
    const weights = [...bodyEntries]
      .filter((entry): entry is BodyEntry & { weight: number } =>
        typeof entry.weight === "number"
      )
      .sort((a, b) => {
        const dateCompare = compareByDate(a.logDate, b.logDate);
        if (dateCompare !== 0) {
          return dateCompare;
        }
        return compareByDate(a.createdAt, b.createdAt);
      })
      .map((entry) => entry.weight);
    return weights.slice(-7);
  }, [bodyEntries]);

  const weightChart = useMemo(
    () => buildWeightPath(weightSeries),
    [weightSeries]
  );

  const calorieHistory = useMemo(() => {
    const totals = new Map<string, number>();
    mealLogs.forEach((log) => {
      const logDate = log.logDate ?? todayIso;
      totals.set(logDate, (totals.get(logDate) ?? 0) + log.calories);
    });
    return Array.from(totals.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, value]) => ({ date, value: Math.round(value) }));
  }, [mealLogs, todayIso]);

  const maxCalorie = Math.max(
    ...calorieHistory.map((entry) => entry.value),
    1
  );

  const orderedMealLogs = useMemo(() => {
    return [...mealLogs].sort((a, b) => {
      const dateCompare = compareByDate(b.logDate, a.logDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      const indexA = mealOrder.indexOf(a.meal);
      const indexB = mealOrder.indexOf(b.meal);
      const safeA = indexA === -1 ? mealOrder.length : indexA;
      const safeB = indexB === -1 ? mealOrder.length : indexB;
      if (safeA !== safeB) {
        return safeA - safeB;
      }
      return compareByDate(a.createdAt, b.createdAt);
    });
  }, [mealLogs]);

  const activityLabel =
    activityOptions[profile.activityIndex]?.label ?? "未设置";

  const nutritionTargets = useMemo(() => {
    const weightKg = Number(latestWeight) || Number(profile.weight);
    const heightCm = Number(profile.height);
    const ageYears = Number(profile.age);
    const activityFactor =
      activityOptions[profile.activityIndex]?.factor ?? 1.2;
    if (!weightKg || !heightCm || !ageYears) {
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        water: 0,
      };
    }
    const bmr =
      profile.sex === "男性"
        ? 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    const tdee = bmr * activityFactor;
    const calories = Math.round(tdee * 0.85);
    const protein = Math.round(weightKg * 1.5);
    const fat = Math.round(weightKg * 0.8);
    const carbs = Math.round(weightKg * 2.5);
    return { calories, protein, fat, carbs };
  }, [latestWeight, profile]);

  const { consumedProtein, consumedFat, consumedCarbs } = useMemo(() => {
    const todaysLogs = mealLogs.filter(
      (log) => (log.logDate ?? todayIso) === todayIso
    );
    return {
      consumedProtein: Math.round(
        todaysLogs.reduce((sum, log) => sum + log.protein, 0)
      ),
      consumedFat: Math.round(
        todaysLogs.reduce((sum, log) => sum + log.fat, 0)
      ),
      consumedCarbs: Math.round(
        todaysLogs.reduce((sum, log) => sum + log.carbs, 0)
      ),
    };
  }, [mealLogs, todayIso]);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setSession(data.session ?? null);
        setAuthReady(true);
      })
      .catch(() => {
        if (active) {
          setAuthReady(true);
        }
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!authReady) {
        return;
      }
      if (!accessToken) {
        setApiStatus("idle");
        setApiNotice("请先登录，当前显示为本地示例数据。");
        setRecipes(seedRecipes());
        setMealLogs(seedMealLogs(todayIso));
        setBodyEntries(seedBodyEntries(new Date().getFullYear()));
        setProfile({
          height: "",
          weight: "",
          age: "",
          sex: "女性",
          activityIndex: 1,
        });
        setLatestWeight("");
        return;
      }
      setApiStatus("loading");
      try {
        const [recipesData, mealData, bodyData, profileData] =
          await Promise.all([
            apiGet<ApiRecipe[]>("/recipes", undefined, accessToken),
            apiGet<ApiMealLog[]>("/meal-logs", undefined, accessToken),
            apiGet<ApiBodyEntry[]>("/body-entries", undefined, accessToken),
            apiGet<ApiProfile | null>("/profiles/me", undefined, accessToken),
          ]);

        if (ignore) {
          return;
        }
        setRecipes(recipesData.map((row) => normalizeRecipe(row)));
        setMealLogs(mealData.map((row) => normalizeMealLog(row)));
        setBodyEntries(bodyData.map((row) => normalizeBodyEntry(row)));
        if (profileData) {
          const normalized = normalizeProfile(profileData);
          setProfile(normalized);
          setLatestWeight((prev) => prev || normalized.weight);
        }
        setApiStatus("ready");
        setApiNotice(null);
      } catch (error) {
        if (ignore) {
          return;
        }
        setApiStatus("error");
        setApiNotice("后端未连接，当前为本地示例数据。");
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [accessToken, authReady]);

  const handleAddMeal = async () => {
    if (!canAddMeal) {
      return;
    }
    if (!accessToken) {
      setApiNotice("请先登录后再添加记录。");
      return;
    }
    setSavingMeal(true);
    const payload = {
      meal: mealForm.meal,
      items: parseItems(mealForm.items),
      calories: Number(mealForm.calories),
      protein: toNumber(mealForm.protein) ?? 0,
      carbs: toNumber(mealForm.carbs) ?? 0,
      fat: toNumber(mealForm.fat) ?? 0,
      log_date: todayIso,
    };
    const fallback: MealLog = {
      id: createId(),
      meal: payload.meal,
      items: payload.items,
      calories: payload.calories,
      protein: payload.protein,
      carbs: payload.carbs,
      fat: payload.fat,
      logDate: payload.log_date,
      createdAt: new Date().toISOString(),
    };
    try {
      const data = await apiPost<ApiMealLog[]>(
        "/meal-logs",
        payload,
        accessToken
      );
      const record = Array.isArray(data) ? data[0] : data;
      setMealLogs((prev) => [
        record ? normalizeMealLog(record) : fallback,
        ...prev,
      ]);
      setApiNotice(null);
    } catch (error) {
      setMealLogs((prev) => [fallback, ...prev]);
      setApiNotice("后端未连接，记录已暂存在本地（刷新会丢失）。");
    } finally {
      setSavingMeal(false);
    }
    setMealForm({
      meal: mealForm.meal,
      items: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  const handleDeleteMeal = async (id: string) => {
    setMealLogs((prev) => prev.filter((meal) => meal.id !== id));
    try {
      if (!accessToken) {
        setApiNotice("请先登录后再删除记录。");
        return;
      }
      await apiDelete(`/meal-logs/${id}`, accessToken);
      setApiNotice(null);
    } catch (error) {
      setApiNotice("后端未连接，删除操作未同步。");
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    try {
      if (!accessToken) {
        setApiNotice("请先登录后再删除食谱。");
        return;
      }
      await apiDelete(`/recipes/${id}`, accessToken);
      setApiNotice(null);
    } catch (error) {
      setApiNotice("后端未连接，删除操作未同步。");
    }
  };

  const handleSaveRecipe = async () => {
    if (!canSaveRecipe) {
      return;
    }
    if (!accessToken) {
      setApiNotice("请先登录后再保存食谱。");
      return;
    }
    setSavingRecipe(true);
    const payload = {
      name: recipeForm.name,
      servings: recipeForm.servings,
      method: recipeForm.method,
      tags: recipeForm.tags,
      ingredients: recipeForm.ingredients,
      calories: toNumber(recipeForm.calories) ?? 0,
      protein: toNumber(recipeForm.protein) ?? 0,
      carbs: toNumber(recipeForm.carbs) ?? 0,
      fat: toNumber(recipeForm.fat) ?? 0,
    };
    const fallback = normalizeRecipe({
      id: createId(),
      ...payload,
    });
    try {
      const data = await apiPost<ApiRecipe[]>(
        "/recipes",
        payload,
        accessToken
      );
      const record = Array.isArray(data) ? data[0] : data;
      setRecipes((prev) => [
        record ? normalizeRecipe(record) : fallback,
        ...prev,
      ]);
      setApiNotice(null);
    } catch (error) {
      setRecipes((prev) => [fallback, ...prev]);
      setApiNotice("后端未连接，食谱已暂存在本地（刷新会丢失）。");
    } finally {
      setSavingRecipe(false);
    }
    setRecipeForm({
      name: "",
      servings: "1 份",
      method: "煎 / 烤",
      tags: "",
      ingredients: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  const handleUseRecipe = async (recipe: Recipe, meal: string) => {
    const payload = {
      meal,
      items: parseItems(recipe.ingredients),
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      log_date: todayIso,
    };
    const fallback: MealLog = {
      id: createId(),
      meal,
      items: payload.items.length ? payload.items : [recipe.name],
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      logDate: todayIso,
      createdAt: new Date().toISOString(),
    };
    try {
      if (!accessToken) {
        setApiNotice("请先登录后再添加记录。");
        setMealLogs((prev) => [fallback, ...prev]);
        return;
      }
      const data = await apiPost<ApiMealLog[]>(
        "/meal-logs",
        payload,
        accessToken
      );
      const record = Array.isArray(data) ? data[0] : data;
      setMealLogs((prev) => [
        record ? normalizeMealLog(record) : fallback,
        ...prev,
      ]);
      setApiNotice(null);
    } catch (error) {
      setMealLogs((prev) => [fallback, ...prev]);
      setApiNotice("后端未连接，记录已暂存在本地（刷新会丢失）。");
    }
  };

  const handleSaveBody = async () => {
    if (!canSaveBody) {
      return;
    }
    if (!accessToken) {
      setApiNotice("请先登录后再保存记录。");
      return;
    }
    setSavingBody(true);
    const payload = {
      log_date: todayIso,
      weight: toNumber(bodyForm.weight),
      body_fat: toNumber(bodyForm.bodyFat),
      waist: toNumber(bodyForm.waist),
      sleep: toNumber(bodyForm.sleep),
    };
    const fallback: BodyEntry = normalizeBodyEntry({
      id: createId(),
      log_date: payload.log_date,
      weight: payload.weight ?? null,
      body_fat: payload.body_fat ?? null,
      waist: payload.waist ?? null,
      sleep: payload.sleep ?? null,
      created_at: new Date().toISOString(),
    });
    try {
      const data = await apiPost<ApiBodyEntry[]>(
        "/body-entries",
        payload,
        accessToken
      );
      const record = Array.isArray(data) ? data[0] : data;
      setBodyEntries((prev) => [
        record ? normalizeBodyEntry(record) : fallback,
        ...prev,
      ]);
      setApiNotice(null);
    } catch (error) {
      setBodyEntries((prev) => [fallback, ...prev]);
      setApiNotice("后端未连接，记录已暂存在本地（刷新会丢失）。");
    } finally {
      setSavingBody(false);
    }
    setBodyForm({ weight: "", bodyFat: "", waist: "", sleep: "" });
  };

  const handleSaveLatestWeight = async () => {
    if (!canSaveLatestWeight) {
      return;
    }
    if (!accessToken) {
      setApiNotice("请先登录后再保存体重。");
      return;
    }
    setSavingLatestWeight(true);
    const profilePayload = {
      height_cm: toNumber(profile.height),
      weight_kg: toNumber(latestWeight),
      age: toNumber(profile.age),
      sex: profile.sex,
      activity_level: activityOptions[profile.activityIndex]?.label,
    };
    try {
      await apiPost("/profiles", profilePayload, accessToken);
      const bodyPayload = {
        log_date: todayIso,
        weight: toNumber(latestWeight),
      };
      const data = await apiPost<ApiBodyEntry[]>(
        "/body-entries",
        bodyPayload,
        accessToken
      );
      const record = Array.isArray(data) ? data[0] : data;
      if (record) {
        setBodyEntries((prev) => [
          normalizeBodyEntry(record),
          ...prev,
        ]);
      } else {
        setBodyEntries((prev) => [
          normalizeBodyEntry({
            id: createId(),
            log_date: bodyPayload.log_date,
            weight: bodyPayload.weight ?? null,
            created_at: new Date().toISOString(),
          }),
          ...prev,
        ]);
      }
      setProfile((prev) => ({ ...prev, weight: latestWeight }));
      setApiNotice(null);
    } catch (error) {
      setApiNotice("后端未连接，基础信息未同步。");
    } finally {
      setSavingLatestWeight(false);
    }
  };

  const features = [
    { title: "食谱库与收藏", desc: "收藏常用菜式，一键加入今日记录。" },
    { title: "条码扫描", desc: "识别包装食品营养信息，快速录入。" },
    { title: "智能备餐提醒", desc: "根据计划提前提醒准备食材。" },
    { title: "断食窗口", desc: "设置 12/14/16 小时断食节奏。" },
    { title: "运动库与计划", desc: "训练动作库与视频示范。" },
    { title: "每日打卡", desc: "饮食、训练、睡眠、饮水统一记录。" },
    { title: "进度复盘", desc: "每周总结，自动微调热量与训练。" },
    { title: "生成报告", desc: "导出图表与周报给教练或自己。" },
  ];

  const recentBodyEntries = [...bodyEntries]
    .sort((a, b) => {
      const dateCompare = compareByDate(b.logDate, a.logDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return compareByDate(b.createdAt, a.createdAt);
    })
    .slice(0, 5);

  return (
    <div className="page-shell min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
              执行中面板
            </p>
            <h1 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
              轻盈计划 · 今日执行
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              记录饮食、体重和训练，把趋势收进你的节奏里。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <FlashButton variant="outline" href="/plan">
              返回计划
            </FlashButton>
            <FlashButton href="/daily">查看日程</FlashButton>
          </div>
        </div>

        {(apiStatus === "loading" || apiNotice) && (
          <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-3 text-xs text-[var(--ink-soft)]">
            {apiStatus === "loading"
              ? "正在连接后端数据..."
              : apiNotice}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "今日热量",
              value: `${todayCalories} / ${
                nutritionTargets.calories || "--"
              } kcal`,
            },
            {
              label: "蛋白摄入",
              value: `${consumedProtein} / ${
                nutritionTargets.protein || "--"
              } g`,
            },
            {
              label: "脂肪摄入",
              value: `${consumedFat} / ${nutritionTargets.fat || "--"} g`,
            },
            {
              label: "碳水摄入",
              value: `${consumedCarbs} / ${nutritionTargets.carbs || "--"} g`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/70 bg-white/80 px-4 py-4 text-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                {item.label}
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink)]">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  自定义食谱
                </p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">
                  添加自己的菜式并自动计算营养。
                </p>
              </div>
              <FlashButton
                variant="ghost"
                onClick={handleSaveRecipe}
                disabled={!canSaveRecipe}
              >
                保存食谱
              </FlashButton>
            </div>
            <p className="mt-3 text-xs text-[var(--ink-soft)]">
              {!isAuthenticated
                ? "请先登录后保存食谱。"
                : canSaveRecipe
                  ? "填写完成后保存即可加入食谱库。"
                  : "请先填写食谱名称与食材。"}
            </p>
            <div className="mt-6 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              <label className="space-y-2">
                <span>食谱名称</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="轻食鸡胸沙拉"
                  value={recipeForm.name}
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>份量</span>
                <select
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  value={recipeForm.servings}
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      servings: event.target.value,
                    }))
                  }
                >
                  <option>1 份</option>
                  <option>2 份</option>
                  <option>3 份</option>
                </select>
              </label>
              <label className="space-y-2">
                <span>烹饪方式</span>
                <select
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  value={recipeForm.method}
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      method: event.target.value,
                    }))
                  }
                >
                  <option>煎 / 烤</option>
                  <option>水煮</option>
                  <option>气炸</option>
                </select>
              </label>
              <label className="space-y-2">
                <span>标签</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="高蛋白 / 低脂"
                  value={recipeForm.tags}
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      tags: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span>食材与重量</span>
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="鸡胸 120g，西兰花 80g，生菜 50g..."
                  value={recipeForm.ingredients}
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      ingredients: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>热量 (kcal)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="420"
                  value={recipeForm.calories}
                  inputMode="decimal"
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      calories: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>蛋白 (g)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="38"
                  value={recipeForm.protein}
                  inputMode="decimal"
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      protein: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>碳水 (g)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="28"
                  value={recipeForm.carbs}
                  inputMode="decimal"
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      carbs: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>脂肪 (g)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="12"
                  value={recipeForm.fat}
                  inputMode="decimal"
                  onChange={(event) =>
                    setRecipeForm((prev) => ({
                      ...prev,
                      fat: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-5 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs text-[var(--ink-soft)]">
              当前食谱：热量 {recipeForm.calories || "--"} kcal · 蛋白{" "}
              {recipeForm.protein || "--"}g · 碳水 {recipeForm.carbs || "--"}g ·
              脂肪 {recipeForm.fat || "--"}g
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  今日饮食记录
                </p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">
                  按餐次快速编辑与替换。
                </p>
              </div>
              <FlashButton
                variant="ghost"
                onClick={handleAddMeal}
                disabled={!canAddMeal}
              >
                添加记录
              </FlashButton>
            </div>
            <div className="mt-5 space-y-4 text-sm text-[var(--ink-soft)]">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                  快速添加
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="space-y-2 text-xs">
                    <span>餐次</span>
                    <select
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      value={mealForm.meal}
                      onChange={(event) =>
                        setMealForm((prev) => ({
                          ...prev,
                          meal: event.target.value,
                        }))
                      }
                    >
                      <option>早餐</option>
                      <option>午餐</option>
                      <option>加餐</option>
                      <option>晚餐</option>
                      <option>自定义</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-xs">
                    <span>热量 (kcal)</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="320"
                      inputMode="decimal"
                      value={mealForm.calories}
                      onChange={(event) =>
                        setMealForm((prev) => ({
                          ...prev,
                          calories: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-xs">
                    <span>蛋白 (g)</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="20"
                      inputMode="decimal"
                      value={mealForm.protein}
                      onChange={(event) =>
                        setMealForm((prev) => ({
                          ...prev,
                          protein: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-xs">
                    <span>碳水 (g)</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="35"
                      inputMode="decimal"
                      value={mealForm.carbs}
                      onChange={(event) =>
                        setMealForm((prev) => ({
                          ...prev,
                          carbs: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-xs">
                    <span>脂肪 (g)</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="12"
                      inputMode="decimal"
                      value={mealForm.fat}
                      onChange={(event) =>
                        setMealForm((prev) => ({
                          ...prev,
                          fat: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-xs sm:col-span-3">
                    <span>食物内容（用逗号分隔）</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="香蕉 1 根，低脂酸奶"
                      value={mealForm.items}
                      onChange={(event) =>
                        setMealForm((prev) => ({
                          ...prev,
                          items: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              {!canAddMeal && (
                <p className="text-xs text-[var(--ink-soft)]">
                  {!isAuthenticated
                    ? "请先登录后再添加记录。"
                    : "填写热量与食物内容后即可添加。"}
                </p>
              )}

              {orderedMealLogs.length === 0 && (
                <p className="text-xs text-[var(--ink-soft)]">
                  今天还没有饮食记录。
                </p>
              )}

              {orderedMealLogs.map((meal) => (
                <div
                  key={meal.id}
                  className="rounded-3xl border border-white/70 bg-white/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {meal.meal}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--mint-5)]">
                      <span>{meal.calories} kcal</span>
                      <button
                        className={`rounded-full border border-[var(--mint-3)] px-3 py-1 text-[10px] text-[var(--ink-soft)] transition hover:text-[var(--ink)] ${
                          isAuthenticated ? "" : "cursor-not-allowed opacity-60"
                        }`}
                        disabled={!isAuthenticated}
                        onClick={() => handleDeleteMeal(meal.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--ink-soft)]">
                    蛋白 {meal.protein}g · 碳水 {meal.carbs}g · 脂肪 {meal.fat}g
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {meal.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--mint-4)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass-card rounded-[28px] p-6">
            <p className="text-sm font-semibold text-[var(--ink)]">
              食谱库
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              保存的食谱可直接加入餐次。
            </p>
            <div className="mt-5 space-y-4">
              {recipes.length === 0 && (
                <p className="text-xs text-[var(--ink-soft)]">
                  暂无食谱，先在左侧保存一个吧。
                </p>
              )}
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="rounded-3xl border border-white/70 bg-white/80 p-4 text-sm text-[var(--ink-soft)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {recipe.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--mint-5)]">
                      <span>{recipe.calories} kcal</span>
                      <button
                        className={`rounded-full border border-[var(--mint-3)] px-3 py-1 text-[10px] text-[var(--ink-soft)] transition hover:text-[var(--ink)] ${
                          isAuthenticated ? "" : "cursor-not-allowed opacity-60"
                        }`}
                        disabled={!isAuthenticated}
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs">
                    {recipe.servings} · {recipe.method} · {recipe.tags || "无标签"}
                  </p>
                  <p className="mt-2 text-xs">{recipe.ingredients}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[var(--mint-2)] px-3 py-1 text-[var(--mint-5)]">
                      蛋白 {recipe.protein}g
                    </span>
                    <span className="rounded-full bg-[var(--mint-2)] px-3 py-1 text-[var(--mint-5)]">
                      碳水 {recipe.carbs}g
                    </span>
                    <span className="rounded-full bg-[var(--mint-2)] px-3 py-1 text-[var(--mint-5)]">
                      脂肪 {recipe.fat}g
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {["早餐", "午餐", "加餐", "晚餐"].map((meal) => (
                      <button
                        key={`${recipe.id}-${meal}`}
                        className={`rounded-full border border-[var(--mint-3)] px-3 py-1 text-[10px] text-[var(--ink-soft)] transition hover:text-[var(--ink)] ${
                          isAuthenticated ? "" : "cursor-not-allowed opacity-60"
                        }`}
                        disabled={!isAuthenticated}
                        onClick={() => handleUseRecipe(recipe, meal)}
                      >
                        加入{meal}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  更新最新体重
                </p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">
                  默认值来自注册档案，可随时更新。
                </p>
              </div>
              <FlashButton
                variant="ghost"
                onClick={handleSaveLatestWeight}
                disabled={!canSaveLatestWeight}
              >
                保存最新体重
              </FlashButton>
            </div>
            <div className="mt-5 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span>最新体重 (kg)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="62"
                  value={latestWeight}
                  inputMode="decimal"
                  onChange={(event) => setLatestWeight(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              {[
                { label: "身高", value: profile.height ? `${profile.height}cm` : "--" },
                { label: "注册体重", value: profile.weight ? `${profile.weight}kg` : "--" },
                { label: "年龄", value: profile.age ? `${profile.age} 岁` : "--" },
                { label: "性别", value: profile.sex || "--" },
                { label: "活动量", value: activityLabel },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card rounded-[28px] p-6">
            <p className="text-sm font-semibold text-[var(--ink)]">
              体重与围度记录
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              建议晨起空腹称重。
            </p>
            <div className="mt-5 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              <label className="space-y-2">
                <span>今日体重 (kg)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="61.8"
                  value={bodyForm.weight}
                  inputMode="decimal"
                  onChange={(event) =>
                    setBodyForm((prev) => ({
                      ...prev,
                      weight: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>体脂率 (%)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="24.5"
                  value={bodyForm.bodyFat}
                  inputMode="decimal"
                  onChange={(event) =>
                    setBodyForm((prev) => ({
                      ...prev,
                      bodyFat: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>腰围 (cm)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="68"
                  value={bodyForm.waist}
                  inputMode="decimal"
                  onChange={(event) =>
                    setBodyForm((prev) => ({
                      ...prev,
                      waist: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>睡眠 (小时)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="7.2"
                  value={bodyForm.sleep}
                  inputMode="decimal"
                  onChange={(event) =>
                    setBodyForm((prev) => ({
                      ...prev,
                      sleep: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <FlashButton onClick={handleSaveBody} disabled={!canSaveBody}>
                同步体重
              </FlashButton>
              <FlashButton
                variant="outline"
                onClick={handleSaveBody}
                disabled={!canSaveBody}
              >
                保存记录
              </FlashButton>
            </div>
            {!canSaveBody && (
              <p className="mt-4 text-xs text-[var(--ink-soft)]">
                {!isAuthenticated
                  ? "请先登录后保存体重记录。"
                  : "填写任意一项后即可保存。"}
              </p>
            )}
            <div className="mt-6 space-y-3 text-xs text-[var(--ink-soft)]">
              {recentBodyEntries.length === 0 && (
                <p className="text-xs text-[var(--ink-soft)]">
                  暂无体重记录。
                </p>
              )}
              {recentBodyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-2"
                >
                  <span>{entry.dateLabel}</span>
                  <span>
                    {typeof entry.weight === "number"
                      ? `${formatNumber(entry.weight)}kg`
                      : "--"}{" "}
                    · 体脂 {formatNumber(entry.bodyFat)}% · 腰围{" "}
                    {formatNumber(entry.waist)}cm
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  趋势图表
                </p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">
                  7 天体重与热量趋势。
                </p>
              </div>
              <FlashButton variant="ghost">导出周报</FlashButton>
            </div>
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                  体重曲线
                </p>
                <svg
                  className="mt-3 h-[120px] w-full"
                  viewBox="0 0 320 120"
                  role="img"
                  aria-label="体重趋势"
                >
                  <defs>
                    <linearGradient
                      id="weightLine"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#39c78b" />
                      <stop offset="100%" stopColor="#148a61" />
                    </linearGradient>
                  </defs>
                  {weightChart.path ? (
                    <>
                      <path
                        d={weightChart.path}
                        fill="none"
                        stroke="url(#weightLine)"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {weightChart.points.map((point) => (
                        <circle
                          key={point.join("-")}
                          cx={point[0]}
                          cy={point[1]}
                          r="4.5"
                          fill="#39c78b"
                        />
                      ))}
                    </>
                  ) : (
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill="#315446"
                      fontSize="12"
                    >
                      还没有体重记录
                    </text>
                  )}
                </svg>
                <div className="mt-2 flex justify-between text-xs text-[var(--ink-soft)]">
                  <span>
                    {weightSeries.length
                      ? `${Math.min(...weightSeries).toFixed(1)}kg`
                      : "--"}
                  </span>
                  <span>
                    {weightSeries.length
                      ? `${Math.max(...weightSeries).toFixed(1)}kg`
                      : "--"}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                  热量条形
                </p>
                {calorieHistory.length === 0 ? (
                  <p className="mt-4 text-xs text-[var(--ink-soft)]">
                    暂无热量记录。
                  </p>
                ) : (
                  <div className="mt-4 flex items-end justify-between gap-2">
                    {calorieHistory.map((entry) => (
                      <div
                        key={`${entry.date}-${entry.value}`}
                        className="flex w-full flex-col items-center gap-2"
                        title={`${formatDateLabel(entry.date)} ${entry.value} kcal`}
                      >
                        <div
                          className="w-full rounded-full bg-[var(--mint-3)]"
                          style={{ height: `${(entry.value / maxCalorie) * 96}px` }}
                        />
                        <span className="text-[10px] text-[var(--ink-soft)]">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                还可以扩展的功能
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                参考主流 App 的高频需求。
              </p>
            </div>
            <FlashButton variant="ghost">进入功能设置</FlashButton>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/70 bg-white/80 p-4 text-sm"
              >
                <p className="font-semibold text-[var(--ink)]">
                  {feature.title}
                </p>
                <p className="mt-2 text-xs text-[var(--ink-soft)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
