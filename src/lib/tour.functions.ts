import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TourStateSchema = z.object({
  tour_prompted: z.boolean().optional(),
  tour_completed: z.boolean().optional(),
});

export const getTourState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("tour_prompted, tour_completed, onboarded_at")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      tour_prompted: data?.tour_prompted ?? false,
      tour_completed: data?.tour_completed ?? false,
      onboarded: Boolean(data?.onboarded_at),
    };
  });

export const setTourState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TourStateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: Record<string, boolean> = {};
    if (data.tour_prompted !== undefined) patch.tour_prompted = data.tour_prompted;
    if (data.tour_completed !== undefined) patch.tour_completed = data.tour_completed;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
