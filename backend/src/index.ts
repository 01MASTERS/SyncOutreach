import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 8081;

app.use(cors());
app.use(express.json());

const formatContact = (contact: any) => ({
  id: contact.id,
  name: contact.name,
  role: contact.role,
  email: contact.email,
  linkedin: contact.linkedin,
  twitter: contact.twitter,
  status: contact.status,
  createdAt: contact.createdAt.toISOString(),
  companyId: contact.companyId,
  companyName: contact.company?.name || null,
  tagIds: contact.tags.map((t: any) => t.id)
});

// --- Companies API ---

app.get('/api/companies', async (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const search = (req.query.search as string) || '';

  const where = search ? {
    OR: [
      { name: { contains: search } },
      { website: { contains: search } }
    ]
  } : {};

  const totalElements = await prisma.company.count({ where });
  const companies = await prisma.company.findMany({
    where,
    skip: page * size,
    take: size,
    include: { _count: { select: { contacts: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    content: companies.map(c => ({
      id: c.id,
      name: c.name,
      website: c.website,
      linkedin: c.linkedin,
      size: c.size,
      createdAt: c.createdAt.toISOString(),
      contactCount: c._count.contacts
    })),
    page,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size)
  });
});

app.get('/api/companies/:id', async (req, res) => {
  const c = await prisma.company.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { contacts: true } } }
  });
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: c.id,
    name: c.name,
    website: c.website,
    linkedin: c.linkedin,
    size: c.size,
    createdAt: c.createdAt.toISOString(),
    contactCount: c._count.contacts
  });
});

app.post('/api/companies', async (req, res) => {
  const { name, website, linkedin, size } = req.body;
  const c = await prisma.company.create({
    data: { name, website, linkedin, size }
  });
  res.json({ ...c, contactCount: 0, createdAt: c.createdAt.toISOString() });
});

app.put('/api/companies/:id', async (req, res) => {
  const { name, website, linkedin, size } = req.body;
  const c = await prisma.company.update({
    where: { id: req.params.id },
    data: { name, website, linkedin, size },
    include: { _count: { select: { contacts: true } } }
  }).catch(() => null);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: c.id,
    name: c.name,
    website: c.website,
    linkedin: c.linkedin,
    size: c.size,
    createdAt: c.createdAt.toISOString(),
    contactCount: c._count.contacts
  });
});

app.delete('/api/companies/:id', async (req, res) => {
  await prisma.company.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).send();
});

// --- Contacts API ---

app.get('/api/contacts', async (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const search = req.query.search as string;
  const companyId = req.query.companyId as string;
  const role = req.query.role as string;
  const status = req.query.status as string;

  const where: any = {};
  if (companyId) where.companyId = companyId;
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ];
  }

  const totalElements = await prisma.contact.count({ where });
  const contacts = await prisma.contact.findMany({
    where,
    skip: page * size,
    take: size,
    include: { company: true, tags: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    content: contacts.map(formatContact),
    page,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size)
  });
});

app.get('/api/contacts/:id', async (req, res) => {
  const c = await prisma.contact.findUnique({
    where: { id: req.params.id },
    include: { company: true, tags: true }
  });
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(formatContact(c));
});

app.get('/api/contacts/by-company/:companyId', async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { companyId: req.params.companyId },
    include: { company: true, tags: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(contacts.map(formatContact));
});

app.post('/api/contacts', async (req, res) => {
  const { name, role, email, linkedin, twitter, status, companyId, tagIds } = req.body;
  const tagsConnect = tagIds ? tagIds.map((id: string) => ({ id })) : [];
  
  const c = await prisma.contact.create({
    data: {
      name, role, email, linkedin, twitter, status, companyId,
      tags: { connect: tagsConnect }
    },
    include: { company: true, tags: true }
  });
  res.json(formatContact(c));
});

app.put('/api/contacts/:id', async (req, res) => {
  const { name, role, email, linkedin, twitter, status, companyId, tagIds } = req.body;
  const tagsConnect = tagIds ? tagIds.map((id: string) => ({ id })) : [];

  const c = await prisma.contact.update({
    where: { id: req.params.id },
    data: {
      name, role, email, linkedin, twitter, status, companyId,
      tags: { set: tagsConnect }
    },
    include: { company: true, tags: true }
  }).catch(() => null);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(formatContact(c));
});

app.delete('/api/contacts/:id', async (req, res) => {
  await prisma.contact.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).send();
});

// --- Tags API ---

app.get('/api/tags', async (req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  res.json(tags);
});

app.post('/api/tags', async (req, res) => {
  const t = await prisma.tag.create({ data: { name: req.body.name } });
  res.json(t);
});

app.delete('/api/tags/:id', async (req, res) => {
  await prisma.tag.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).send();
});

// --- Outreaches API ---

app.get('/api/outreaches/by-contact/:contactId', async (req, res) => {
  const outreaches = await prisma.outreach.findMany({
    where: { contactId: req.params.contactId },
    orderBy: { date: 'desc' }
  });
  res.json(outreaches.map(o => ({
    ...o,
    date: o.date.toISOString(),
    nextFollowupDate: o.nextFollowupDate?.toISOString() || null,
    followupCompleted: o.followupCompleted,
    createdAt: o.createdAt.toISOString()
  })));
});

app.get('/api/outreaches', async (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const hasFollowup = req.query.hasFollowup === 'true';

  const where: any = {};
  if (hasFollowup) {
    where.nextFollowupDate = { not: null };
  }

  const totalElements = await prisma.outreach.count({ where });
  const outreaches = await prisma.outreach.findMany({
    where,
    skip: page * size,
    take: size,
    include: { contact: { include: { company: true } } },
    orderBy: { date: 'desc' }
  });

  res.json({
    content: outreaches.map(o => ({
      ...o,
      contactName: o.contact.name,
      companyName: o.contact.company?.name || null,
      date: o.date.toISOString(),
      nextFollowupDate: o.nextFollowupDate?.toISOString() || null,
      followupCompleted: o.followupCompleted,
      createdAt: o.createdAt.toISOString()
    })),
    page,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size)
  });
});

app.post('/api/outreaches', async (req, res) => {
  const { contactId, platform, type, date, nextFollowupDate, referenceUrl } = req.body;
  const o = await prisma.outreach.create({
    data: {
      contactId,
      platform,
      type,
      date: new Date(date),
      nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
      referenceUrl
    }
  });
  res.json({
    ...o,
    date: o.date.toISOString(),
    nextFollowupDate: o.nextFollowupDate?.toISOString() || null,
    followupCompleted: o.followupCompleted,
    createdAt: o.createdAt.toISOString()
  });
});

app.put('/api/outreaches/:id', async (req, res) => {
  const { platform, type, date, nextFollowupDate, referenceUrl } = req.body;
  const o = await prisma.outreach.update({
    where: { id: req.params.id },
    data: {
      platform,
      type,
      date: new Date(date),
      nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
      referenceUrl
    }
  }).catch(() => null);
  if (!o) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...o,
    date: o.date.toISOString(),
    nextFollowupDate: o.nextFollowupDate?.toISOString() || null,
    followupCompleted: o.followupCompleted,
    createdAt: o.createdAt.toISOString()
  });
});

app.put('/api/outreaches/:id/complete', async (req, res) => {
  const o = await prisma.outreach.update({
    where: { id: req.params.id },
    data: { followupCompleted: true }
  }).catch(() => null);
  if (!o) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...o,
    date: o.date.toISOString(),
    nextFollowupDate: o.nextFollowupDate?.toISOString() || null,
    followupCompleted: o.followupCompleted,
    createdAt: o.createdAt.toISOString()
  });
});

app.delete('/api/outreaches/:id', async (req, res) => {
  await prisma.outreach.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).send();
});

// --- Start ---

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
