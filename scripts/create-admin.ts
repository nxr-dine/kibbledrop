import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@kibbledrop.com'
      }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Role:', existingAdmin.role)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('AdminKibble2025!', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Kibbledrop Admin',
        email: 'admin@kibbledrop.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1-555-ADMIN',
        address: 'Admin Office, Kibbledrop HQ'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', adminUser.email)
    console.log('Name:', adminUser.name)
    console.log('Role:', adminUser.role)
    console.log('ID:', adminUser.id)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
