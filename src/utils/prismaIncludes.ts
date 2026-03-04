import { Prisma } from "@prisma/client";

// ============== SELECT ==============

const publicUserSelect = {
  id: true,
  pseudo: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;


// ============== INCLUDE ==============

export const treeWithMembersInclude = {
  members: { 
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  },
};

export const fullTreeInclude: Prisma.FamilyTreeInclude = {
  owner: {
    select: publicUserSelect,
  },
  members: { 
    include: { 
      user: {
        select: publicUserSelect,
      },
    },
  },
  people: true,
};