import { 
  createFamilyTree,
  createTestUser, 
  deleteTree, 
  disconnectDatabase, 
  getTreeById, 
  getUserTrees, 
  registerAndGetToken, 
  resetDatabase,
  updateTreeName, 
} from '../utils/testHelpers';

beforeAll(() => {
  process.env.DISABLE_RATE_LIMIT = 'true';
});

afterAll(async () => {
  await disconnectDatabase();
  process.env.DISABLE_RATE_LIMIT = 'false';
});

describe('Test CRUD operations on family trees', () => {
  let accessToken: string;
  let treeId: string;
  const treeName1 = "Joestar Family";
  const treeName2 = "Moomin Family";
  const treeName3 = "Addams Family";
  
  beforeAll(async () => {
    await resetDatabase(); // Clean the db
    const user = createTestUser('tree-tests');
    const registerRes = await registerAndGetToken(user);
    accessToken = registerRes.accessToken;
  });

  it('should create a tree', async () => {
    const res = await createFamilyTree(accessToken, treeName1);
    treeId = res.body.data.tree.id;
    expect(res.statusCode).toBe(201);
    expect(res.body.data.tree.name).toBe(treeName1); // Tree 1 = Joestar Family
  });

  it('should reject tree creation if name is already used', async () => {
    const res = await createFamilyTree(accessToken, treeName1);
    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('TREE_NAME_TAKEN');
  });

  it('should update tree name', async () => {
    const res = await updateTreeName(accessToken, treeName2, treeId); // Tree 1 = Moomin Family
    expect(res.statusCode).toBe(200);
    expect(res.body.data.tree.name).toBe(treeName2);
  });

  it('should reject tree name updating if name is already used', async () => {
    await createFamilyTree(accessToken, treeName3); // Tree 2 =  Addams Family
    const res = await updateTreeName(accessToken, treeName3, treeId) // Try to update name of first tree
    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('TREE_NAME_TAKEN');
  });

  it('should fetch trees user is a member of', async () => {
    const res = await getUserTrees(accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.trees.length).toBe(2);
  });

  it('should fetch trees owned by the user', async () => {
    const res = await getUserTrees(accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.trees.length).toBe(2);
  });

  it('should fetch a tree the user is a member of', async () => {
    const res = await getTreeById(accessToken, treeId);
    expect(res.statusCode).toBe(200);
  });

  it('should not fetch a tree when user is not member or if the tree doesn\'t exist', async () => {
    const res = await getTreeById(accessToken, 'madeUpId');
    expect(res.statusCode).toBe(404);
  });

  it('should delete the tree', async () => {
    const res = await deleteTree(accessToken, treeId); // delete Tree 1 = Moomin Family
    expect(res.statusCode).toBe(200);
  });
});