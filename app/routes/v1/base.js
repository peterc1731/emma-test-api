module.exports = (app) => {
  app.get('/', (req, res) => res.json({
    message: 'Welcome to the Emma Test API 🖐',
    data: {
      enviroment: process.env.NODE_ENV,
    },
  }));
};
