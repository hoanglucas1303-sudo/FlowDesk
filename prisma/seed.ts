import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FlowDesk database...");

  // ── Create default user ────────────────────────────────────────
  const passwordHash = await bcrypt.hash("flowdesk123", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@flowdesk.vn" },
    update: {},
    create: {
      email: "admin@flowdesk.vn",
      name: "Admin",
      passwordHash,
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // ── Create labels for projects ─────────────────────────────────
  const labelData = [
    { name: "Bug", color: "#EF4444" },
    { name: "Feature", color: "#3B82F6" },
    { name: "Urgent", color: "#F97316" },
    { name: "Improvement", color: "#10B981" },
  ];

  // ── Create Project 1: Website Công ty ──────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name: "🚀 Website Công ty",
      description: "Dự án xây dựng website công ty mới với thiết kế hiện đại và tối ưu SEO.",
      icon: "🚀",
      color: "#3B82F6",
      sortOrder: 0,
      userId: user.id,
    },
  });

  console.log(`✅ Project created: ${project1.name}`);

  // Create labels for project 1
  const labels1 = await Promise.all(
    labelData.map((l) =>
      prisma.label.create({
        data: { ...l, projectId: project1.id },
      })
    )
  );

  // Create pages for project 1
  const page1_1 = await prisma.page.create({
    data: {
      title: "Yêu cầu dự án",
      icon: "📋",
      projectId: project1.id,
      sortOrder: 0,
      isPinned: true,
      content: [
        {
          id: "1",
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Yêu cầu dự án Website Công ty" }],
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Xây dựng website công ty với đầy đủ tính năng: trang chủ, giới thiệu, dịch vụ, blog, và liên hệ.",
            },
          ],
        },
      ],
    },
  });

  const page1_2 = await prisma.page.create({
    data: {
      title: "Thiết kế UI/UX",
      icon: "🎨",
      projectId: project1.id,
      sortOrder: 1,
      content: [
        {
          id: "1",
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Thiết kế UI/UX" }],
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sử dụng Figma để thiết kế giao diện. Phong cách: hiện đại, tối giản, responsive.",
            },
          ],
        },
      ],
    },
  });

  const page1_3 = await prisma.page.create({
    data: {
      title: "Tiến độ triển khai",
      icon: "📊",
      projectId: project1.id,
      sortOrder: 2,
      isPinned: true,
      content: [
        {
          id: "1",
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Tiến độ triển khai" }],
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sprint 1: Setup project, thiết kế database, landing page. Deadline: cuối tuần 2.",
            },
          ],
        },
      ],
    },
  });

  console.log(`✅ Pages created for: ${project1.name}`);

  // Create tasks for project 1
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Setup Next.js project",
        description: "Khởi tạo dự án Next.js 16 với TypeScript, Tailwind CSS",
        status: "DONE",
        priority: "HIGH",
        sortOrder: 0,
        projectId: project1.id,
        pageId: page1_1.id,
      },
      {
        title: "Thiết kế database schema",
        description: "Thiết kế Prisma schema cho users, products, blog posts",
        status: "DONE",
        priority: "HIGH",
        sortOrder: 1,
        projectId: project1.id,
        pageId: page1_1.id,
      },
      {
        title: "Thiết kế trang chủ (Figma)",
        description: "Thiết kế giao diện trang chủ trên Figma",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        sortOrder: 0,
        projectId: project1.id,
        pageId: page1_2.id,
        dueDate: nextWeek,
      },
      {
        title: "Code landing page",
        description: "Implement trang chủ từ design Figma",
        status: "TODO",
        priority: "MEDIUM",
        sortOrder: 0,
        projectId: project1.id,
        dueDate: nextWeek,
      },
      {
        title: "Fix responsive menu mobile",
        description: "Menu dropdown không hoạt động trên màn hình nhỏ",
        status: "TODO",
        priority: "URGENT",
        sortOrder: 1,
        projectId: project1.id,
        dueDate: yesterday,
      },
      {
        title: "Tối ưu SEO meta tags",
        status: "BACKLOG",
        priority: "LOW",
        sortOrder: 0,
        projectId: project1.id,
      },
      {
        title: "Viết unit tests",
        status: "BACKLOG",
        priority: "MEDIUM",
        sortOrder: 1,
        projectId: project1.id,
      },
      {
        title: "Review code trang giới thiệu",
        status: "REVIEW",
        priority: "MEDIUM",
        sortOrder: 0,
        projectId: project1.id,
        pageId: page1_3.id,
      },
    ],
  });

  // Connect some tasks to labels
  const project1Tasks = await prisma.task.findMany({
    where: { projectId: project1.id },
  });

  // "Fix responsive menu mobile" -> Bug, Urgent
  const fixTask = project1Tasks.find((t) => t.title.includes("Fix responsive"));
  if (fixTask) {
    await prisma.task.update({
      where: { id: fixTask.id },
      data: {
        labels: {
          connect: [
            { id: labels1.find((l) => l.name === "Bug")!.id },
            { id: labels1.find((l) => l.name === "Urgent")!.id },
          ],
        },
      },
    });
  }

  // "Code landing page" -> Feature
  const codeTask = project1Tasks.find((t) => t.title.includes("Code landing"));
  if (codeTask) {
    await prisma.task.update({
      where: { id: codeTask.id },
      data: {
        labels: {
          connect: [{ id: labels1.find((l) => l.name === "Feature")!.id }],
        },
      },
    });
  }

  console.log(`✅ Tasks created for: ${project1.name}`);

  // ── Create Project 2: App Mobile ───────────────────────────────
  const project2 = await prisma.project.create({
    data: {
      name: "📱 App Mobile",
      description: "Phát triển ứng dụng mobile đa nền tảng bằng React Native.",
      icon: "📱",
      color: "#10B981",
      sortOrder: 1,
      userId: user.id,
    },
  });

  console.log(`✅ Project created: ${project2.name}`);

  // Create labels for project 2
  const labels2 = await Promise.all(
    labelData.map((l) =>
      prisma.label.create({
        data: { ...l, projectId: project2.id },
      })
    )
  );

  // Create pages for project 2
  const page2_1 = await prisma.page.create({
    data: {
      title: "Tài liệu API",
      icon: "📘",
      projectId: project2.id,
      sortOrder: 0,
      isPinned: true,
      content: [
        {
          id: "1",
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Tài liệu API" }],
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Danh sách các API endpoints cho ứng dụng mobile. Base URL: https://api.example.com/v1",
            },
          ],
        },
      ],
    },
  });

  await prisma.page.create({
    data: {
      title: "Wireframe",
      icon: "📐",
      projectId: project2.id,
      sortOrder: 1,
      content: [
        {
          id: "1",
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Wireframe App Mobile" }],
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Wireframe các màn hình chính: Login, Home, Profile, Settings.",
            },
          ],
        },
      ],
    },
  });

  await prisma.page.create({
    data: {
      title: "Kế hoạch Sprint",
      icon: "📅",
      projectId: project2.id,
      sortOrder: 2,
      isPinned: true,
      content: [
        {
          id: "1",
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Kế hoạch Sprint" }],
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sprint 1 (2 tuần): Authentication, Home screen, Navigation. Sprint 2: Profile, Settings, Push notifications.",
            },
          ],
        },
      ],
    },
  });

  console.log(`✅ Pages created for: ${project2.name}`);

  // Create tasks for project 2
  await prisma.task.createMany({
    data: [
      {
        title: "Setup React Native project",
        description: "Khởi tạo dự án React Native với Expo",
        status: "DONE",
        priority: "HIGH",
        sortOrder: 0,
        projectId: project2.id,
      },
      {
        title: "Implement authentication flow",
        description: "Đăng nhập, đăng ký, quên mật khẩu",
        status: "IN_PROGRESS",
        priority: "HIGH",
        sortOrder: 0,
        projectId: project2.id,
        pageId: page2_1.id,
        dueDate: nextWeek,
      },
      {
        title: "Thiết kế Home screen",
        status: "TODO",
        priority: "MEDIUM",
        sortOrder: 0,
        projectId: project2.id,
      },
      {
        title: "Tích hợp push notification",
        status: "BACKLOG",
        priority: "LOW",
        sortOrder: 0,
        projectId: project2.id,
      },
      {
        title: "Viết API documentation",
        description: "Viết tài liệu cho tất cả endpoints",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        sortOrder: 1,
        projectId: project2.id,
        pageId: page2_1.id,
      },
      {
        title: "Fix crash khi offline",
        description: "App bị crash khi không có kết nối mạng",
        status: "TODO",
        priority: "URGENT",
        sortOrder: 1,
        projectId: project2.id,
        dueDate: yesterday,
      },
    ],
  });

  // Connect labels to project 2 tasks
  const project2Tasks = await prisma.task.findMany({
    where: { projectId: project2.id },
  });

  const crashTask = project2Tasks.find((t) => t.title.includes("crash"));
  if (crashTask) {
    await prisma.task.update({
      where: { id: crashTask.id },
      data: {
        labels: {
          connect: [
            { id: labels2.find((l) => l.name === "Bug")!.id },
            { id: labels2.find((l) => l.name === "Urgent")!.id },
          ],
        },
      },
    });
  }

  const authTask = project2Tasks.find((t) => t.title.includes("authentication"));
  if (authTask) {
    await prisma.task.update({
      where: { id: authTask.id },
      data: {
        labels: {
          connect: [{ id: labels2.find((l) => l.name === "Feature")!.id }],
        },
      },
    });
  }

  console.log(`✅ Tasks created for: ${project2.name}`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log(`\n📧 Login: admin@flowdesk.vn`);
  console.log(`🔑 Password: flowdesk123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
