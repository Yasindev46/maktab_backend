import cors from 'cors';

const allowedOrigins = [
  'https://yasindev46.github.io',
  'http://localhost:5173',
  process.env.LOCAL_REACT_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

export default cors({ origin: allowedOrigins });
