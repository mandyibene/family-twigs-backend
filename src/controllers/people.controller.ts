import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getMessages } from '../utils/getMessages';
import { sendError, sendSuccess } from '../utils/httpResponse';
import { CreatePersonParams, PersonInput } from '../types/people.types';

const prisma = new PrismaClient();

export const createPerson = async (req: Request<CreatePersonParams>, res: Response) => {
  const t = getMessages(req.locale); // Localized messages
  const { treeId } = req.params;
  const data = req.validatedData as PersonInput;

  try {

    // TODO: Check if userId exist in db (if no error)
    // TODO: Check if userId already exist in tree (if yes error)

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
    return sendError({
      res,
      code: 'INTERNAL_SERVER_ERROR',
      message: t.errors.internal,
      context: 'CREATE PERSON',
      log: err,
    });
  }
};