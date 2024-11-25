// Assuming you have a Mongoose model for quizzes
import { connectDB } from '../db/mongoose';
import Quiz from '../models/FlashcardSet';

export default defineEventHandler(async (event) => {

  try {


    const result = await Quiz.updateMany(
      { statushistory: { $exists: true } },
      [
        {
          $set: {
            statusHistory: {
              $map: {
                input: "$statushistory",
                as: "status",
                in: {
                  status: "$$status.status",
                  at: { $toDate: "$$status.at" }
                }
              }
            }
          }
        },
        {
          $unset: 'statushistory'
        }
      ]
    );

    return {
      message: 'Fields updated successfully',
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    console.error('Error updating fields:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating fields'
    });
  }
});