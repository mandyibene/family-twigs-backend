export interface PersonInput {
  fullName: string;
  birthDate?: Date;
  deathDate?: Date;
  gender?: string;
  photoUrl?: string;
  userId?: string;
}

export type CreatePersonParams = {
  treeId: string;
};