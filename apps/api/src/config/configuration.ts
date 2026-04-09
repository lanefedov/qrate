export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/qrate',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiration: process.env.JWT_EXPIRATION || '15m',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  calcGrpcUrl: process.env.CALC_GRPC_URL || 'localhost:50051',
});
