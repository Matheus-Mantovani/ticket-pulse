import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  ticketCode: string;
  purchasePrice: number;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDTO {
  id: string;
  eventId: string;
  userId: string;
  ticketCode: string;
  purchasePrice: number;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    ticketCode: {
      type: String,
      required: [true, "Ticket code is required"],
      unique: true,
      index: true,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return obj;
  },
});

export function toTicketDTO(ticket: ITicket): TicketDTO {
  return {
    id: ticket._id ? ticket._id.toString() : "",
    eventId: ticket.event ? ticket.event.toString() : "",
    userId: ticket.user ? ticket.user.toString() : "",
    ticketCode: ticket.ticketCode,
    purchasePrice: ticket.purchasePrice,
    purchasedAt: ticket.purchasedAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

export class Ticket {
  _id!: mongoose.Types.ObjectId;
  event!: mongoose.Types.ObjectId;
  user!: mongoose.Types.ObjectId;
  ticketCode!: string;
  purchasePrice!: number;
  purchasedAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  toTicketDTO(): TicketDTO {
    return {
      id: this._id ? this._id.toString() : "",
      eventId: this.event ? this.event.toString() : "",
      userId: this.user ? this.user.toString() : "",
      ticketCode: this.ticketCode,
      purchasePrice: this.purchasePrice,
      purchasedAt: this.purchasedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

ticketSchema.loadClass(Ticket);

export const TicketModel = mongoose.model<ITicket>("Ticket", ticketSchema);
