import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tags
  const softwareTag = await prisma.tag.upsert({
    where: { name: 'Software' },
    update: {},
    create: { name: 'Software' },
  })
  
  const enterpriseTag = await prisma.tag.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: { name: 'Enterprise' },
  })

  // Companies
  const acme = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      website: 'https://acme.com',
      linkedin: 'https://linkedin.com/company/acme',
      size: '11-50',
    }
  })

  const globex = await prisma.company.create({
    data: {
      name: 'Globex',
      website: 'https://globex.com',
      size: '1-10',
    }
  })

  // Contacts
  await prisma.contact.create({
    data: {
      name: 'John Doe',
      role: 'CEO',
      email: 'john@acme.com',
      status: 'new',
      companyId: acme.id,
      tags: {
        connect: [{ id: softwareTag.id }]
      }
    }
  })

  await prisma.contact.create({
    data: {
      name: 'Jane Smith',
      role: 'CTO',
      email: 'jane@acme.com',
      status: 'contacted',
      companyId: acme.id,
      tags: {
        connect: [{ id: softwareTag.id }, { id: enterpriseTag.id }]
      }
    }
  })
  
  await prisma.contact.create({
    data: {
      name: 'Hank Scorpio',
      role: 'Founder',
      email: 'hank@globex.com',
      status: 'meeting_scheduled',
      companyId: globex.id,
    }
  })

  console.log('Seeded database successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
