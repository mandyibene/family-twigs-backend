import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { badRequest, forbidden, notFound, sendError } from "../utils/httpResponse";
import { getMessages } from "../utils/getMessages";
import { fullTreeInclude } from "../utils/prismaIncludes";
import { FamilyTreeWithRelations, TreeMembershipWithTree } from "../types/familyTree.types";

const prisma = new PrismaClient();

export const requireTreeOwner = (preload = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const t = getMessages(req.locale); // Localized messages

    const userId = req.userId;

    const treeId = req.params.treeId as string;
    if (!treeId)
      return badRequest(res, "REQUIRE TREE OWNER", "Missing treeId in req.params.", t.errors.treeIdRequired, "TREE_ID_REQUIRED");

    try {
      const tree = await prisma.familyTree.findUnique({
        where: { id: treeId },
        ...(preload && {
          include: fullTreeInclude,
        }),
      });

      if (!tree || tree.ownerId !== userId)
        return notFound(res, "REQUIRE TREE OWNER", "Didn't find the tree.", t.errors.notFound);

      if (preload) req.tree = tree as FamilyTreeWithRelations; // Preload the tree

      next();
    } catch (err) {
      return sendError({
        res,
        context: "REQUIRE TREE OWNER",
        log: err,
        message: t.errors.internal,
      });
    }
  };
};

export const requireTreeRole = (
  preload = false,
  minRole?: "READER" | "EDITOR" | "MANAGER"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const t = getMessages(req.locale); // Localized messages

    const userId = req.userId;
    
    const treeId = req.params.treeId as string;
    if (!treeId)
      return badRequest(res, "REQUIRE TREE ROLE", "Missing treeId in req.params.", t.errors.treeIdRequired, "TREE_ID_REQUIRED");

    try {
      const membership = await prisma.treeMembership.findUnique({
        where: { userId_treeId: { userId, treeId } },
        ...(preload && {
          include: {
            tree: {
              include: fullTreeInclude,
            },
          },
        }),
      });

      if (!membership) return notFound(res, "REQUIRE TREE ROLE", "User is not a member of the tree.", t.errors.notFound);

      if (minRole) {
        const rolePriority = { READER: 1, EDITOR: 2, MANAGER: 3 };

        if (rolePriority[membership.role] < rolePriority[minRole])
          return forbidden(res, "REQUIRE TREE ROLE", "User role is insufficient", t.errors.insufficientRole, "INSUFFICIENT_ROLE");
      }

      req.treeMembership = membership;

      if (preload) {
        const m = membership as TreeMembershipWithTree;
        req.tree = m.tree; // Preload the tree
      }

      next();
    } catch (err) {
      return sendError({
        res,
        context: "REQUIRE TREE ROLE",
        log: err,
        message: t.errors.internal,
      });
    }
  };
};
