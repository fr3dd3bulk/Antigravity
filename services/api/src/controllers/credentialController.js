import { Credential } from '@n8n-clone/shared';
import { encrypt, decrypt } from '@n8n-clone/shared';

export async function createCredential(req, res) {
  try {
    const { name, type, data } = req.body;
    const { organizationId } = req.params;

    const encryptedData = encrypt(JSON.stringify(data));

    const credential = await Credential.create({
      name,
      type,
      data: encryptedData,
      organizationId,
      createdBy: req.userId
    });

    res.status(201).json({
      _id: credential._id,
      name: credential.name,
      type: credential.type,
      organizationId: credential.organizationId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCredentials(req, res) {
  try {
    const { organizationId } = req.params;

    const credentials = await Credential.find({
      organizationId,
      deletedAt: null
    }).select('-data');

    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCredential(req, res) {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const decryptedData = JSON.parse(decrypt(credential.data));

    res.json({
      _id: credential._id,
      name: credential.name,
      type: credential.type,
      data: decryptedData,
      organizationId: credential.organizationId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCredential(req, res) {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    credential.deletedAt = new Date();
    await credential.save();

    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
