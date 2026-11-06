import type { DormService } from "../dormService.ts";
import type {
  RoomRecord,
  BedStatus,
  TenantRecord,
  Invoice,
  Ticket,
} from "../../types/index.ts";
import {
  initialRooms,
  initialTenants,
  initialInvoices,
  initialTickets,
} from "./mockData.ts";

const STORAGE_KEYS = {
  ROOMS: "dorm_mock_rooms",
  TENANTS: "dorm_mock_tenants",
  INVOICES: "dorm_mock_invoices",
  TICKETS: "dorm_mock_tickets",
};

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

class MockDormServiceImpl implements DormService {
  private rooms: RoomRecord[] = loadStorage(STORAGE_KEYS.ROOMS, [...initialRooms]);
  private tenants: TenantRecord[] = loadStorage(STORAGE_KEYS.TENANTS, [...initialTenants]);
  private invoices: Invoice[] = loadStorage(STORAGE_KEYS.INVOICES, [...initialInvoices]);
  private tickets: Ticket[] = loadStorage(STORAGE_KEYS.TICKETS, [...initialTickets]);

  async getRooms(): Promise<RoomRecord[]> {
    return [...this.rooms];
  }

  async createRoom(room: RoomRecord): Promise<RoomRecord> {
    const created: RoomRecord = {
      ...room,
      id: room.id || `RM-${Date.now().toString().slice(-4)}`,
    };
    this.rooms = [created, ...this.rooms];
    saveStorage(STORAGE_KEYS.ROOMS, this.rooms);
    return created;
  }

  async updateRoom(id: string, room: RoomRecord): Promise<RoomRecord> {
    const idx = this.rooms.findIndex((r) => r.id === id);
    const updated: RoomRecord = {
      ...(idx !== -1 ? this.rooms[idx] : {}),
      ...room,
      id,
    };
    if (idx !== -1) {
      this.rooms = this.rooms.map((r) => (r.id === id ? updated : r));
    } else {
      this.rooms = [updated, ...this.rooms];
    }
    saveStorage(STORAGE_KEYS.ROOMS, this.rooms);
    return updated;
  }

  async deleteRoom(id: string): Promise<void> {
    this.rooms = this.rooms.map((r) =>
      r.id === id ? { ...r, deletedAt: new Date().toISOString() } : r,
    );
    saveStorage(STORAGE_KEYS.ROOMS, this.rooms);
  }

  async updateBedStatus(bedId: string, status: BedStatus): Promise<void> {
    let matched = false;
    this.rooms = this.rooms.map((r) => {
      const currentOverrides = r.bedOverrides ?? {};
      // Check if bedId is a bedCode or slotKey or exists in overrides
      if (currentOverrides[bedId]) {
        matched = true;
        return {
          ...r,
          bedOverrides: {
            ...currentOverrides,
            [bedId]: {
              ...currentOverrides[bedId],
              status,
            },
          },
        };
      }
      for (const [code, override] of Object.entries(currentOverrides)) {
        const hasBedId = override && typeof override === "object" && "id" in override && override.id === bedId;
        if (hasBedId || code === bedId) {
          return {
            ...r,
            bedOverrides: {
              ...currentOverrides,
              [code]: {
                ...override,
                status,
              },
            },
          };
        }
      }
      return r;
    });
    if (!matched) {
      // If bedId is like "G01" or slotKey or raw ID, try matching across all rooms
      for (const r of this.rooms) {
        const currentOverrides = r.bedOverrides ?? {};
        if (bedId in currentOverrides || bedId.startsWith("G0")) {
          this.rooms = this.rooms.map((room) =>
            room.id === r.id
              ? {
                  ...room,
                  bedOverrides: {
                    ...(room.bedOverrides ?? {}),
                    [bedId]: {
                      ...(room.bedOverrides?.[bedId] ?? {}),
                      status,
                    },
                  },
                }
              : room,
          );
          break;
        }
      }
    }
    saveStorage(STORAGE_KEYS.ROOMS, this.rooms);
  }

  async getTenants(): Promise<TenantRecord[]> {
    return [...this.tenants];
  }

  async getInvoices(): Promise<Invoice[]> {
    return [...this.invoices];
  }

  async getTickets(): Promise<Ticket[]> {
    return [...this.tickets];
  }

  async createTicket(ticketData: Omit<Ticket, "id">): Promise<Ticket> {
    const newId = `SC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      ...ticketData,
      status: ticketData.status || (ticketData.assignee ? "Mới giao" : "Chưa phân công"),
      id: newId,
    };
    this.tickets = [newTicket, ...this.tickets];
    saveStorage(STORAGE_KEYS.TICKETS, this.tickets);
    return newTicket;
  }

  async updateTicket(id: string, patch: Partial<Ticket>): Promise<Ticket> {
    const idx = this.tickets.findIndex((t) => t.id === id);
    if (idx === -1) {
      const fallback = { id, ...patch } as Ticket;
      this.tickets = [fallback, ...this.tickets];
      saveStorage(STORAGE_KEYS.TICKETS, this.tickets);
      return fallback;
    }
    const updated = { ...this.tickets[idx], ...patch };
    this.tickets = this.tickets.map((t) => (t.id === id ? updated : t));
    saveStorage(STORAGE_KEYS.TICKETS, this.tickets);
    return updated;
  }

  async saveRooms(rooms: RoomRecord[]): Promise<RoomRecord[]> {
    this.rooms = [...rooms];
    saveStorage(STORAGE_KEYS.ROOMS, this.rooms);
    return this.rooms;
  }

  async saveTenants(tenants: TenantRecord[]): Promise<TenantRecord[]> {
    this.tenants = [...tenants];
    saveStorage(STORAGE_KEYS.TENANTS, this.tenants);
    return this.tenants;
  }

  async saveInvoices(invoices: Invoice[]): Promise<Invoice[]> {
    this.invoices = [...invoices];
    saveStorage(STORAGE_KEYS.INVOICES, this.invoices);
    return this.invoices;
  }

  async confirmPayment(invoiceId: string, manager: string): Promise<Invoice> {
    const idx = this.invoices.findIndex((inv) => inv.id === invoiceId);
    if (idx === -1) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    const target = this.invoices[idx];
    const updated: Invoice = {
      ...target,
      status: "Đã thu",
      payment: {
        amount: target.amount,
        method: "Tiền mặt",
        paidAt: new Date().toISOString(),
        confirmedBy: manager,
      },
    };
    this.invoices = this.invoices.map((inv) => (inv.id === invoiceId ? updated : inv));
    saveStorage(STORAGE_KEYS.INVOICES, this.invoices);
    return updated;
  }
}

export const mockDormService = new MockDormServiceImpl();
