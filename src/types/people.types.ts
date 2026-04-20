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

export interface UpdatePersonInput {
  fullName: string;
  birthDate?: Date;
  deathDate?: Date;
  gender?: string;
}

export interface UpdatePersonUserInput {
  userId: string;
}

// export interface UpdatePersonPhotoInput {
//   photoUrl: string;
// }

export type UpdatePersonParams = {
  treeId: string;
  personId: string;
};

export type GetPeopleParams = {
  treeId: string;
};

export type GetPersonParams = {
  personId: string;
};

export type DeletePersonParams = {
  personId: string;
};