const usersQueries = {
  findByEmail: (email) => {
    return (query = {
      name: "fetch-user",
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    });
  },
};

module.exports = usersQueries;
