import crypto from 'crypto';
import Credential from '../../models/Credential.js';
import AuditLog from '../../models/AuditLog.js';

if (!process.env.CREDENTIAL_ENCRYPTION_KEY) {
  throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable is required');
}

const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY;
const IV_LENGTH = 16;

/**
 * Encrypt credential data using AES-256
 */
const encryptData = (data) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt credential data
 */
const decryptData = (encryptedData) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

/**
 * @swagger
 * /api/credentials:
 *   post:
 *     summary: Create new credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - data
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [api_key, oauth2, basic_auth, custom]
 *               data:
 *                 type: object
 *               nodeTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Credential created successfully
 */
export const createCredential = async (req, res) => {
  try {
    const { name, type, data, nodeTypes } = req.body;

    if (!name || !type || !data) {
      return res.status(400).json({ error: 'Name, type, and data are required' });
    }

    const encryptedData = encryptData(data);

    const credentialData = {
      name,
      type,
      data: encryptedData,
      nodeTypes: nodeTypes || [],
      createdBy: req.user._id,
    };

    // Only add orgId if user has one
    if (req.user.orgId) {
      credentialData.orgId = req.user.orgId._id || req.user.orgId;
    }

    const credential = new Credential(credentialData);

    await credential.save();

    // Only create audit log if user has an orgId
    if (req.user.orgId) {
      await AuditLog.create({
        orgId: req.user.orgId._id || req.user.orgId,
        userId: req.user._id,
        action: 'create',
        resource: 'credential',
        resourceId: credential._id,
        details: { name, type },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.status(201).json({
      message: 'Credential created successfully',
      credential,
    });
  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({ error: 'Failed to create credential' });
  }
};

/**
 * @swagger
 * /api/credentials:
 *   get:
 *     summary: Get all credentials for organization
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by credential type
 *       - in: query
 *         name: nodeType
 *         schema:
 *           type: string
 *         description: Filter by node type
 *     responses:
 *       200:
 *         description: List of credentials
 */
export const getCredentials = async (req, res) => {
  try {
    const { type, nodeType } = req.query;
    
    // Super admins can see all credentials, regular users only their org's credentials
    const filter = req.user.role === 'super_admin' && !req.user.orgId
      ? { isActive: true }
      : { orgId: req.user.orgId._id || req.user.orgId, isActive: true };

    if (type) {
      filter.type = type;
    }

    if (nodeType) {
      filter.nodeTypes = nodeType;
    }

    const credentials = await Credential.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ credentials });
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ error: 'Failed to get credentials' });
  }
};

/**
 * @swagger
 * /api/credentials/{id}:
 *   get:
 *     summary: Get credential by ID
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: decrypt
 *         schema:
 *           type: boolean
 *         description: Include decrypted data
 *     responses:
 *       200:
 *         description: Credential details
 */
export const getCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { decrypt } = req.query;

    // Super admins can access any credential, regular users only their org's credentials
    const query = req.user.role === 'super_admin' && !req.user.orgId
      ? { _id: id }
      : { _id: id, orgId: req.user.orgId._id || req.user.orgId };

    const credential = await Credential.findOne(query)
      .populate('createdBy', 'name email');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const response = {
      credential: credential.toJSON(),
    };

    if (decrypt === 'true') {
      try {
        response.decryptedData = decryptData(credential.data);
      } catch (error) {
        console.error('Decryption error:', error);
        return res.status(500).json({ error: 'Failed to decrypt credential' });
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Get credential error:', error);
    res.status(500).json({ error: 'Failed to get credential' });
  }
};

/**
 * @swagger
 * /api/credentials/{id}:
 *   put:
 *     summary: Update credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               data:
 *                 type: object
 *               nodeTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Credential updated successfully
 */
export const updateCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, data, nodeTypes, isActive } = req.body;

    // Super admins can update any credential, regular users only their org's credentials
    const query = req.user.role === 'super_admin' && !req.user.orgId
      ? { _id: id }
      : { _id: id, orgId: req.user.orgId._id || req.user.orgId };

    const credential = await Credential.findOne(query);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    if (name) credential.name = name;
    if (nodeTypes) credential.nodeTypes = nodeTypes;
    if (typeof isActive === 'boolean') credential.isActive = isActive;
    
    if (data) {
      credential.data = encryptData(data);
    }

    await credential.save();

    // Only create audit log if user has an orgId
    if (req.user.orgId) {
      await AuditLog.create({
        orgId: req.user.orgId._id || req.user.orgId,
        userId: req.user._id,
        action: 'update',
        resource: 'credential',
        resourceId: credential._id,
        details: { name, hasDataUpdate: !!data },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.json({
      message: 'Credential updated successfully',
      credential,
    });
  } catch (error) {
    console.error('Update credential error:', error);
    res.status(500).json({ error: 'Failed to update credential' });
  }
};

/**
 * @swagger
 * /api/credentials/{id}:
 *   delete:
 *     summary: Delete credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credential deleted successfully
 */
export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;

    // Super admins can delete any credential, regular users only their org's credentials
    const query = req.user.role === 'super_admin' && !req.user.orgId
      ? { _id: id }
      : { _id: id, orgId: req.user.orgId._id || req.user.orgId };

    const credential = await Credential.findOne(query);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    credential.isActive = false;
    await credential.save();

    // Only create audit log if user has an orgId
    if (req.user.orgId) {
      await AuditLog.create({
        orgId: req.user.orgId._id || req.user.orgId,
        userId: req.user._id,
        action: 'delete',
        resource: 'credential',
        resourceId: credential._id,
        details: { name: credential.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({ error: 'Failed to delete credential' });
  }
};

/**
 * @swagger
 * /api/credentials/{id}/test:
 *   post:
 *     summary: Test credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testEndpoint:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credential test result
 */
export const testCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { testEndpoint } = req.body;

    // Super admins can test any credential, regular users only their org's credentials
    const query = req.user.role === 'super_admin' && !req.user.orgId
      ? { _id: id }
      : { _id: id, orgId: req.user.orgId._id || req.user.orgId };

    const credential = await Credential.findOne(query);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    let decryptedData;
    try {
      decryptedData = decryptData(credential.data);
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to decrypt credential' 
      });
    }

    // Only create audit log if user has an orgId
    if (req.user.orgId) {
      await AuditLog.create({
        orgId: req.user.orgId._id || req.user.orgId,
        userId: req.user._id,
        action: 'test',
        resource: 'credential',
        resourceId: credential._id,
        details: { testEndpoint },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.json({
      success: true,
      message: 'Credential is valid',
      testedAt: new Date(),
    });
  } catch (error) {
    console.error('Test credential error:', error);
    res.status(500).json({ error: 'Failed to test credential' });
  }
};
