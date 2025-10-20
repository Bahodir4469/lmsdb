const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAssignments = async () => {
  return prisma.assignment.findMany({
    include: {
      submissions: true
    }
  });
};

const createAssignment = async (data) => {
  return prisma.assignment.create({ data });
};

const submitAssignment = async (assignmentId, userId, fileUrl, description) => {
  return prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      userId,
      fileUrl,
      description
    }
  });
};

const updateSubmission = async (submissionId, userId, fileUrl, description) => {
  const existing = await prisma.assignmentSubmission.findUnique({ where: { id: submissionId } });
  if (!existing || existing.userId !== userId) return null;

  return prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { fileUrl, description }
  });
};

const updateAssignmentStatus = async (assignmentId, status) => {
  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { status }
  });
};

const deleteSubmission = async (submissionId, userId) => {
  const existing = await prisma.assignmentSubmission.findFirst({
    where: {
      id: submissionId,
      userId
    }
  });

  if (!existing) return null;

  await prisma.assignmentSubmission.delete({
    where: { id: submissionId }
  });

  return true;
};

const getAssignmentById = async (id) => {
  return prisma.assignment.findUnique({
    where: { id },
    include: {
      submissions: {
        include: {
          user: {
            select: { id: true, name: true, surname: true }
          }
        }
      },
      lesson: {
        select: { id: true, title: true }
      }
    }
  });
};
const deleteAssignment = async (assignmentId) => {
  const existing = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!existing) return null;

  await prisma.assignment.delete({
    where: { id: assignmentId }
  });

  return true;
};

const updateAssignment = async (assignmentId, data) => {
  const existing = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!existing) throw new Error("Topshiriq topilmadi");

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      lessonId: data.lessonId,
      description: data.description,
      fileUrls: data.fileUrls
    }
  });
};

module.exports = {
  getAllAssignments,
  createAssignment,
  submitAssignment,
  updateSubmission,
  updateAssignmentStatus, 
  getAssignmentById, 
  deleteSubmission,
  deleteAssignment,
  updateAssignment
};
