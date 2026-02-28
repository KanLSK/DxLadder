import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  caseId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null;
  voterKey: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // For threaded replies
  voterKey: { type: String, required: true },
  body: { type: String, required: true },
}, { timestamps: true });

// Index for efficiently loading a case's root comments
CommentSchema.index({ caseId: 1, parentId: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
