export type ReservationWorkflow = 'check-in' | 'check-out';

export type ReservationSearchMode = 'reservation' | 'last-name';

export interface ReservationRecord {
  id: number;
  primaryGuestId: number;
  roomId: number;
  checkinDate: string;
  checkoutDate: string;
  numberAdults: number;
  numberChildren: number;
  reservationNumber: string;
  statusId: number;
  createdDate?: string;
  updatedDate?: string;
  actualCheckin?: string;
  actualCheckout?: string;
  actualCheckinBy?: number;
  actualCheckoutBy?: number;
}

export interface GuestRecord {
  id: number;
  firstName: string;
  lastName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestAdut?: boolean;
  createdBy?: number;
  createdDate?: string;
  updatedBy?: number;
  updatedDate?: string;
}

export interface RoomRecord {
  id: number;
  floor: number;
  roomNumber: number;
  roomName: string;
  roomDescription?: string;
  roomStatusId?: number;
  occupants?: number;
  bedTypeId?: number;
  createdBy?: number;
  createdDate?: string;
  updatedBy?: number;
  udpatedDate?: string;
}

export interface ReservationSummary {
  reservation: ReservationRecord;
  guest?: GuestRecord;
  room?: RoomRecord;
}
