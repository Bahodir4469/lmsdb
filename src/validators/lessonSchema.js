const { z } = require('zod');

const lessonSchema = z.object({
  title: z.string().min(3, 'title majburiy'),
  description: z.string().min(5, 'description majburiy'),
  video_url: z.string().url('video_url noto‘g‘ri formatda').optional(),
  material_names: z
    .string()
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return (
            Array.isArray(parsed) &&
            parsed.every((name) => typeof name === 'string')
          );
        } catch {
          return false;
        }
      },
      {
        message: 'material_names JSON massivda bo‘lishi kerak'
      }
    )
    .optional()
});

module.exports = { lessonSchema };
