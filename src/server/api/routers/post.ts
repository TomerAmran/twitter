import { User } from "@clerk/nextjs/dist/server/clerk";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const addInput = z.object({
  postContent: z.string().max(256)
})

const filterUserForClient = (user: User) => {
  return { id: user.id, userName: user.username, profileImageUrl: user.profileImageUrl }
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })

    const usersDataForClient = users.map(filterUserForClient)

    return posts.map(post => {
      const author = usersDataForClient.find(user => user.id === post.authorId)
      if (!author) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author not found" })
      }

      return ({
        post,
        author
      })
    })
  }),
  add: publicProcedure.input(addInput).mutation(({ ctx, input }) => {
    ctx.prisma.post.create({
      data: {
        authorId: 'how do I get that?',
        createdAt: new Date(),
        content: input.postContent,
        id: randomUUID()
      }
    })
  })
});
