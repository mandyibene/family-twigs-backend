import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { badRequest, forbidden, sendError } from "../utils/httpResponse";
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
      return badRequest(res, t.errors.treeIdRequired, "TREE_ID_REQUIRED");

    try {
      const tree = await prisma.familyTree.findUnique({
        where: { id: treeId },
        ...(preload && {
          include: fullTreeInclude,
        }),
      });

      if (!tree || tree.ownerId !== userId)
        return forbidden(res, t.errors.forbidden);

      if (preload) req.tree = tree as FamilyTreeWithRelations; // Preload the tree

      next();
    } catch (err) {
      return sendError({
        res,
        code: "INTERNAL_SERVER_ERROR",
        message: t.errors.internal,
        context: 'REQUIRE TREE OWNER',
        log: err,
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
      return badRequest(res, t.errors.treeIdRequired, "TREE_ID_REQUIRED");

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

      if (!membership) return forbidden(res, t.errors.forbidden);

      if (minRole) {
        const rolePriority = { READER: 1, EDITOR: 2, MANAGER: 3 };

        if (rolePriority[membership.role] < rolePriority[minRole])
          return forbidden(res, t.errors.insufficientRole, "INSUFFICIENT_ROLE");
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
        code: "INTERNAL_SERVER_ERROR",
        message: t.errors.internal,
        context: 'REQUIRE TREE ROLE',
        log: err,
      });
    }
  };
};
