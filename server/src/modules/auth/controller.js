import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Organization from '../../models/Organization.js';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user and organization
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - orgName
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               orgName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, orgName } = req.body;

    // Validate input
    if (!name || !email || !password || !orgName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create organization
    const organization = new Organization({
      name: orgName,
    });
    await organization.save();

    // Create user as org admin
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role: 'org_admin',
      orgId: organization._id,
    });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toJSON(),
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('orgId');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
      organization: user.orgId ? {
        id: user.orgId._id,
        name: user.orgId.name,
        slug: user.orgId.slug,
      } : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('orgId');
    
    res.json({
      user: user.toJSON(),
      organization: user.orgId ? {
        id: user.orgId._id,
        name: user.orgId.name,
        slug: user.orgId.slug,
        subscriptionStatus: user.orgId.subscriptionStatus,
        planType: user.orgId.planType,
        credits: user.orgId.credits,
      } : null,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};
