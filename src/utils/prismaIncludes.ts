import { Prisma } from "@prisma/client";

export const treeWithMembersInclude = {
  members: { include: { user: true } },
};

export const fullTreeInclude: Prisma.FamilyTreeInclude = {
  owner: true,
  members: { include: { user: true } },
  people: true,
};