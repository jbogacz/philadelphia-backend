import { Profile } from './trace.types';

// TODO: Consider providing schemas like
// const traceSchema = new Schema<Trace>({
//     timestamp: { type: Date, default: Date.now },
//     serviceId: { type: String, required: true },
//     spanId: { type: String, required: true },
//     parentSpanId: String,
//     duration: { type: Number, required: true },
//     metadata: { type: Schema.Types.Mixed }
//   });

export type ProfileDocument = Omit<Profile, 'id'> & {
  _id: string;
};
