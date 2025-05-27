import jwt from 'jsonwebtoken'
import Cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const allowedOrigins = [
  'http://localhost:3000', // Remove trailing slash
  'https://ecommerce-backend-seven-bice.vercel.app', // Remove trailing slash
  'https://theredwoodfarms.com', // Remove trailing slash
];

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman or curl) for development
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowedOrigins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Deny requests from non-allowed origins
    return callback(new Error('Not allowed by CORS'));
  },
});

// Helper function to run middleware
export function corsMiddleware(handler) {
  return async (req, res) => {
    await new Promise((resolve, reject) => {
      cors(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
    return handler(req, res);
  };
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '1d',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function authMiddleware(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    return handler(req, res);
  };
}