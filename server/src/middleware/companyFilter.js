// Middleware to add company filtering to requests
// Since models don't have companyName field, we filter by user relationships

const getCompanyUsers = async (prisma, companyName) => {
  // Get all users from the same company
  const users = await prisma.user.findMany({
    where: { companyName },
    select: { id: true }
  });
  return users.map(u => u.id);
};

module.exports = { getCompanyUsers };
