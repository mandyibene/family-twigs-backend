import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { getMessages } from '../utils/getMessages';
import { notFound, sendError, sendSuccess } from '../utils/httpResponse';
import { CreatePersonParams, DeletePersonParams, GetPeopleParams, GetPersonParams, PersonInput, UpdatePersonInput, UpdatePersonParams, UpdatePersonUserInput } from '../types/people.types';

const prisma = new PrismaClient();

const isUserInDb = async (userId: string) =>{
  return await prisma.user.findUnique({ where: { id: userId } });
}

const isUserLinkedInTree = async (userId: string, treeId: string) =>{
  return await prisma.person.findUnique({
      where: { userId_treeId: { userId, treeId } }
    });
}

export const createPerson = async (req: Request<CreatePersonParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { treeId } = req.params;
  const data = req.validatedData as PersonInput;
  const userId = data.userId

  try {
    if (userId) {
      // Check if user exists in db
      const userInDb = await isUserInDb(userId);
      
      if (!userInDb) {
        return sendError({
          res,
          status: 422,
          context: 'CREATE PERSON',
          message: t.errors.invalidUserReference,
          code: 'INVALID_USER_REFERENCE',
        });
      }

      // Check if user is already linked to someone in the tree
      const userLinkedInTree = await isUserLinkedInTree(userId, treeId);

      if (userLinkedInTree) {
        return sendError({
          res,
          status: 409,
          context: 'CREATE PERSON',
          message: t.errors.userAlreadyLinked,
          code: 'USER_ALREADY_LINKED',
        });
      }
    }

    const newPerson = await prisma.person.create({
      data: {
        ...data,
        treeId
      }
    });
    
    return sendSuccess({ 
      res, 
      status: 201, 
      message: t.successes.personCreated, 
      data: { person: newPerson } 
    });

  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002' // Unique constraint failed (because of race condition on userId)
    ) {
      return sendError({
        res,
        status: 409,
        context: 'CREATE PERSON',
        message: t.errors.userAlreadyLinked,
        code: 'USER_ALREADY_LINKED',
      });
    }

    return sendError({
      res,
      context: 'CREATE PERSON',
      log: err,
      message: t.errors.internal,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

export const updatePerson = async (req: Request<UpdatePersonParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { personId } = req.params;
  const data = req.validatedData as UpdatePersonInput;

  try {
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        ...data
      }
    });
    
    return sendSuccess({ 
      res, 
      message: t.successes.personUpdated, 
      data: { person: updatedPerson } 
    });

  } catch (err) {
    return sendError({
      res,
      context: 'CREATE PERSON',
      log: err,
      message: t.errors.internal,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

export const updatePersonUser = async (req: Request<UpdatePersonParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { personId, treeId } = req.params;
  const data = req.validatedData as UpdatePersonUserInput;
  const userId = data.userId

  try {
    // Check if user exists in db
    const userInDb = await isUserInDb(userId);
    
    if (!userInDb) {
      return sendError({
        res,
        status: 422,
        context: 'CREATE PERSON',
        message: t.errors.invalidUserReference,
        code: 'INVALID_USER_REFERENCE',
      });
    }

    // Check if user is already linked to someone in the tree
    const person = await prisma.person.findUnique({ where: { id: personId } });

    if (person?.userId != userId) {
      const userLinkedInTree = await isUserLinkedInTree(userId, treeId);
  
      if (userLinkedInTree) {
        return sendError({
          res,
          status: 409,
          context: 'CREATE PERSON',
          message: t.errors.userAlreadyLinked,
          code: 'USER_ALREADY_LINKED',
        });
      }
    }

    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: { userId }
    });
    
    return sendSuccess({ 
      res, 
      message: t.successes.personUpdated, 
      data: { person: updatedPerson } 
    });

  } catch (err) {
    return sendError({
      res,
      context: 'CREATE PERSON',
      log: err,
      message: t.errors.internal,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

// TODO : UPDATE PERSON PHOTO URL

export const getPeople = async (req: Request<GetPeopleParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { treeId } = req.params;

  try {
    const people = await prisma.person.findMany({
      where: { treeId },
    });

    return sendSuccess({ 
      res, 
      status: 200, 
      message: t.successes.peopleFetched, 
      data: { people } 
    });
  } catch (err) {
    return sendError({
      res,
      context: 'GET PEOPLE',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const getPersonById = async (req: Request<GetPersonParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { personId } = req.params;

  try {
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    return sendSuccess({ 
      res, 
      status: 200, 
      message: t.successes.personFetched, 
      data: { person } 
    });
  } catch (err) {
    return sendError({
      res,
      context: 'GET PERSON',
      log: err,
      message: t.errors.internal,
    });
  }
};

export const deletePerson = async (req: Request<DeletePersonParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { personId } = req.params;

  try {
    const result = await prisma.person.deleteMany({ 
      where: { id: personId } 
    });

    if (result.count === 0) {
      return notFound(res, "DELETE PERSON", "Person not found.", t.errors.notFound);
    }

    return sendSuccess({ res, message: t.successes.personDeleted });
  } catch (err) {
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'DELETE PERSON',
      log: err,
    });
  }
};