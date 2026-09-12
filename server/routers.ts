import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { 
  createEnquiry, 
  createMenuItem, 
  createReview, 
  deleteMenuItem, 
  getBusinessSettings, 
  listMenuItems, 
  listReviews, 
  updateBusinessSettings, 
  updateMenuItem 
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  menu: router({
    list: publicProcedure.query(() => listMenuItems()),
    create: adminProcedure.input(z.object({ 
      name: z.string().min(1), 
      description: z.string().min(1), 
      categoryId: z.number().optional(), 
      price: z.string().optional(), 
      imageUrl: z.string().optional(), 
      available: z.number().optional(), 
      featured: z.number().optional() 
    })).mutation(({ input }) => createMenuItem(input)),
    update: adminProcedure.input(z.object({ 
      id: z.number(), 
      name: z.string().optional(), 
      description: z.string().optional(), 
      categoryId: z.number().optional(), 
      price: z.string().optional(), 
      imageUrl: z.string().optional(), 
      available: z.number().optional(), 
      featured: z.number().optional() 
    })).mutation(({ input }) => { const { id, ...changes } = input; return updateMenuItem(id, changes); }),
    remove: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteMenuItem(input.id)),
  }),
  enquiries: router({
    create: publicProcedure.input(z.object({ 
      name: z.string().min(2), 
      phone: z.string().min(7), 
      message: z.string().max(1000).optional() 
    })).mutation(({ input }) => createEnquiry(input)),
  }),
  reviews: router({ 
    list: publicProcedure.query(() => listReviews(true)),
    create: publicProcedure.input(z.object({
      name: z.string().min(1),
      quote: z.string().min(1),
      rating: z.number().min(1).max(5),
    })).mutation(({ input }) => createReview(input)),
  }),
  business: router({
    info: publicProcedure.query(() => getBusinessSettings()),
    update: adminProcedure.input(z.object({ 
      id: z.number(), 
      businessName: z.string().min(2), 
      phone: z.string().min(7), 
      location: z.string().min(2), 
      hours: z.string().min(3), 
      pureVegetarian: z.number().min(0).max(1), 
      takeawayAvailable: z.number().min(0).max(1), 
      orderingNote: z.string().max(240).optional(), 
      zomatoUrl: z.string().url().optional(), 
      swiggyUrl: z.string().url().optional() 
    })).mutation(({ input }) => { const { id, ...changes } = input; return updateBusinessSettings(id, changes); }),
  }),
});

export type AppRouter = typeof appRouter;