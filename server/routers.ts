import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { 
  createEnquiry, 
  createMenuItem, 
  createReview, 
  deleteReview, 
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
    
    create: publicProcedure.input(z.object({ 
      name: z.string().min(1), 
      description: z.string().optional().default(""), 
      category: z.string().optional(),
      categoryId: z.union([z.number(), z.string()]).optional(), 
      price: z.string().optional().default("Ask us"), 
      imageUrl: z.string().optional().default(""), 
      available: z.union([z.number(), z.boolean()]).optional(), 
      featured: z.number().optional() 
    })).mutation(({ input }: any) => createMenuItem(input)),
    
    update: publicProcedure.input(z.object({ 
      id: z.union([z.number(), z.string()]).transform(v => Number(v)), 
      name: z.string().optional(), 
      description: z.string().optional(), 
      category: z.string().optional(),
      categoryId: z.union([z.number(), z.string()]).optional(), 
      price: z.string().optional(), 
      imageUrl: z.string().optional(), 
      available: z.union([z.number(), z.boolean()]).optional(), 
      featured: z.number().optional() 
    })).mutation(({ input }: any) => { 
      const { id, ...changes } = input; 
      return updateMenuItem(id, changes); 
    }),
    
    // 🟢 Flexibly handles both string/number IDs from front-end
    remove: publicProcedure.input(z.object({ 
      id: z.union([z.number(), z.string()]).transform(v => Number(v)) 
    })).mutation(({ input }) => deleteMenuItem(input.id)),
  }),

  enquiries: router({
    create: publicProcedure.input(z.object({ 
      name: z.string().min(2), 
      phone: z.string().min(7), 
      message: z.string().max(1000).optional() 
    })).mutation(({ input }) => createEnquiry(input)),
  }),

  reviews: router({ 
    list: publicProcedure
      .input(z.object({ approvedOnly: z.boolean().optional() }).optional())
      .query(({ input }) => listReviews(input?.approvedOnly ?? true)),
      
    create: publicProcedure.input(z.object({
      name: z.string().min(1),
      quote: z.string().min(1),
      rating: z.number().min(1).max(5),
    })).mutation(({ input }) => createReview(input)),

    remove: publicProcedure
      .input(z.object({ id: z.union([z.number(), z.string()]).transform(v => Number(v)) }))
      .mutation(({ input }) => deleteReview(input.id)),
  }),

  business: router({
    info: publicProcedure.query(() => getBusinessSettings()),
    update: publicProcedure.input(z.object({ 
      id: z.union([z.number(), z.string()]).optional().default(1).transform(v => Number(v)), 
      businessName: z.string().min(1).optional(), 
      phone: z.string().min(1).optional(), 
      location: z.string().optional(), 
      hours: z.string().optional(), 
      pureVegetarian: z.union([z.number(), z.boolean()]).transform(v => typeof v === 'boolean' ? (v ? 1 : 0) : v).optional(), 
      takeawayAvailable: z.union([z.number(), z.boolean()]).transform(v => typeof v === 'boolean' ? (v ? 1 : 0) : v).optional(), 
      orderingNote: z.string().optional().nullable(), 
      zomatoUrl: z.union([z.string().url(), z.string().length(0)]).optional().nullable(), 
      swiggyUrl: z.union([z.string().url(), z.string().length(0)]).optional().nullable() 
    })).mutation(({ input }: any) => { 
      const { id = 1, ...changes } = input; 
      return updateBusinessSettings(id, changes); 
    }),
  }),
});

export type AppRouter = typeof appRouter;