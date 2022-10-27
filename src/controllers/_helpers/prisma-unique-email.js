import prisma from "./prisma.js";
export async function isUniqueUserEmail(value) {
  try {
    await prisma.user.findUniqueOrThrow({
      where: { email: value },
    });
    return false;
  } catch (err) {
    return true;
  }
}
