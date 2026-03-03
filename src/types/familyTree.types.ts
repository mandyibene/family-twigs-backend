import { Prisma } from "@prisma/client";
import { fullTreeInclude } from "../utils/prismaIncludes";

export interface FamilyTreeInput {
  name: string;
}

export type UpdateTreeNameParams = {
  treeId: string;
};

export type DeleteTreeParams = {
  treeId: string;
};

export type FamilyTreeWithRelations = Prisma.FamilyTreeGetPayload<{
  include: typeof fullTreeInclude;
}>;

export type TreeMembershipWithTree = Prisma.TreeMembershipGetPayload<{
  include: {
    tree: {
      include: typeof fullTreeInclude;
    };
  };
}>;
