import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from Vite environment variables (or localStorage config fallback)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem("ww_supabase_url") || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem("ww_supabase_anon_key") || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-project"));

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ── Auth Helpers ─────────────────────────────────────────────────────────────

export async function supabaseSignUp(email, password, name) {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name.trim() },
    },
  });
  if (error) throw error;

  // Initialize fresh, non-hardcoded profile for the new user
  if (data?.user) {
    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        name: name.trim(),
        eco_coins: 0,
        scan_count: 0,
        badges: [],
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Profile init warning:", e);
    }
  }

  return data;
}

export async function supabaseSignIn(email, password) {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error);
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// ── Data Sync Helpers (Real database, no hardcoded values) ───────────────────

export async function fetchUserData(userId, email) {
  if (!supabase || !userId) {
    return {
      ecoCoins: 0,
      scanCount: 0,
      badges: [],
      history: [],
      earnings: [],
      redeemed: [],
    };
  }

  try {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // 2. Fetch Scans
    const { data: scans } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    // 3. Fetch Earnings
    const { data: earnings } = await supabase
      .from("earnings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    // 4. Fetch Redemptions
    const { data: redeemed } = await supabase
      .from("redeemed")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    return {
      ecoCoins: profile?.eco_coins ?? 0,
      scanCount: profile?.scan_count ?? (scans?.length || 0),
      badges: profile?.badges || [],
      history: (scans || []).map(s => ({
        itemName: s.item_name,
        category: s.category,
        carbonPercent: s.carbon_percent,
        points: s.points,
        date: s.created_at,
      })),
      earnings: (earnings || []).map(e => ({
        date: e.date,
        buyer: e.buyer_name,
        totalKg: e.total_kg,
        totalEarned: e.total_earned,
        items: e.items || [],
      })),
      redeemed: (redeemed || []).map(r => r.reward_id),
    };
  } catch (err) {
    console.error("Error fetching user data from Supabase:", err);
    return {
      ecoCoins: 0,
      scanCount: 0,
      badges: [],
      history: [],
      earnings: [],
      redeemed: [],
    };
  }
}

export async function syncScanToSupabase(userId, scanData, newTotalPts, newScanCount, badges) {
  if (!supabase || !userId) return;
  try {
    // Insert scan entry
    await supabase.from("scans").insert({
      user_id: userId,
      item_name: scanData.itemName,
      category: scanData.category,
      carbon_percent: scanData.carbonPercent || 0,
      points: scanData.points || 10,
      created_at: scanData.date || new Date().toISOString(),
    });

    // Update profile
    await supabase.from("profiles").upsert({
      id: userId,
      eco_coins: newTotalPts,
      scan_count: newScanCount,
      badges: badges,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error syncing scan to Supabase:", err);
  }
}

export async function syncSpendToSupabase(userId, newPts, rewardId, cost) {
  if (!supabase || !userId) return;
  try {
    await supabase.from("profiles").update({
      eco_coins: newPts,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    if (rewardId) {
      await supabase.from("redeemed").insert({
        user_id: userId,
        reward_id: rewardId,
        cost: cost || 0,
        date: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Error syncing spend to Supabase:", err);
  }
}

export async function syncEarningToSupabase(userId, logData) {
  if (!supabase || !userId) return;
  try {
    await supabase.from("earnings").insert({
      user_id: userId,
      date: logData.date,
      buyer_name: logData.buyer,
      total_kg: logData.totalKg,
      total_earned: logData.totalEarned,
      items: logData.items || [],
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error syncing earning to Supabase:", err);
  }
}
