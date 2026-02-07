import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create owner user
  const passwordHash = await bcrypt.hash("password123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {},
    create: {
      email: "owner@demo.com",
      name: "Jane Owner",
      passwordHash,
    },
  });

  // Create member user
  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: {
      email: "member@demo.com",
      name: "John Member",
      passwordHash,
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-inc" },
    update: {},
    create: {
      name: "Acme Inc.",
      slug: "acme-inc",
      accessCode: "12345",
    },
  });

  // Add members
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: owner.id },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: owner.id,
      role: "OWNER",
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: member.id },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: member.id,
      role: "MEMBER",
    },
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: owner.id,
      authorDisplayName: "Jane Owner",
      isAnonymous: false,
      title: "Welcome to Acme Inc. on sortir!",
      body: "Hey team! We are now using sortir for our internal updates and questions. Feel free to post anything — updates, questions, or just share what you are working on.\n\nCheck in when you want, no pressure.",
      postType: "UPDATE",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: member.id,
      authorDisplayName: "John Member",
      isAnonymous: false,
      title: "What's the best way to share files?",
      body: "I have some documents to share with the team. Should we use a shared drive or just link them in posts here?",
      postType: "QUESTION",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: null,
      authorDisplayName: null,
      isAnonymous: true,
      body: "Just want to say I appreciate how calm this tool is compared to Slack. 🙏",
      postType: "UPDATE",
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      workspaceId: workspace.id,
      authorId: member.id,
      authorDisplayName: "John Member",
      isAnonymous: false,
      body: "Awesome! Looking forward to using this.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      workspaceId: workspace.id,
      authorId: owner.id,
      authorDisplayName: "Jane Owner",
      isAnonymous: false,
      body: "I'd suggest linking files in posts for now. We might add attachments later.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      workspaceId: workspace.id,
      authorId: null,
      authorDisplayName: null,
      isAnonymous: true,
      body: "+1 to this!",
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Workspace: ${workspace.name} (slug: ${workspace.slug})`);
  console.log(`   Access code: ${workspace.accessCode}`);
  console.log(`   Owner: ${owner.email} (password: password123)`);
  console.log(`   Member: ${member.email} (password: password123)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
