import mongoose, { Schema, Document } from "mongoose";

export type EventCategory =
  | "CONCERT"
  | "CONFERENCE"
  | "SPORTS"
  | "THEATER"
  | "OTHER";

export type EventStatus = "ACTIVE" | "CANCELLED" | "COMPLETED";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: EventCategory;
  price: number;
  totalTickets: number;
  availableTickets: number;
  status: EventStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: EventCategory;
  price: number;
  totalTickets: number;
  availableTickets: number;
  status: EventStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["CONCERT", "CONFERENCE", "SPORTS", "THEATER", "OTHER"],
      default: "OTHER",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    totalTickets: {
      type: Number,
      required: [true, "Total tickets is required"],
      min: [1, "Total tickets must be at least 1"],
    },
    availableTickets: {
      type: Number,
      required: [true, "Available tickets is required"],
      min: [0, "Available tickets cannot be negative"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "COMPLETED"],
      default: "ACTIVE",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator (createdBy) is required"],
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return obj;
  },
});

export function toEventDTO(event: IEvent): EventDTO {
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    category: event.category,
    price: event.price,
    totalTickets: event.totalTickets,
    availableTickets: event.availableTickets,
    status: event.status,
    createdBy: event.createdBy ? event.createdBy.toString() : "",
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export const Event = mongoose.model<IEvent>("Event", eventSchema);
