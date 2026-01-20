import User from '../models/User.js';

/**
 * Seed a super admin user for testing
 */
const seedSuperAdmin = async () => {
  try {
    console.log('🌱 Seeding super admin user...');

    const superAdminEmail = 'admin@antigravity.dev';
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: superAdminEmail,
      role: 'super_admin' 
    });

    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists');
      return existingSuperAdmin;
    }

    // Create super admin user (without orgId)
    const superAdmin = new User({
      name: 'Super Admin',
      email: superAdminEmail,
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      role: 'super_admin',
      emailVerified: true,
      isActive: true,
    });

    await superAdmin.save();

    console.log('✅ Super admin user created successfully');
    console.log('📧 Email: admin@antigravity.dev');
    console.log('🔑 Password: admin123');
    console.log('⚠️  IMPORTANT: Change this password in production!');

    return superAdmin;
  } catch (error) {
    console.error('❌ Failed to seed super admin:', error);
    throw error;
  }
};

export { seedSuperAdmin };
export default seedSuperAdmin;
