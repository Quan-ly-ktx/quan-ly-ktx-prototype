import { createContext, useState, useEffect, type ReactNode } from "react";
import type {
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
  BedStatus,
} from "../types/index.ts";
import { dormService } from "../services/dormService.ts";
import {
  initialRooms,
  initialTenants,
  initialInvoices,
  initialTickets,
} from "../services/mock/mockData.ts";

export type DormDataContextType = {
  rooms: RoomRecord[];
  tenants: TenantRecord[];
  invoices: Invoice[];
  tickets: Ticket[];
  loading: boolean;
  reload: () => Promise<void>;
  onCreateTicket: (ticket: Omit<Ticket, "id">) => Promise<Ticket>;
  onUpdateTicket: (id: string, patch: Partial<Ticket>) => Promise<Ticket>;
  onCreateRoom: (room: RoomRecord) => Promise<RoomRecord>;
  onUpdateRoom: (id: string, room: RoomRecord) => Promise<RoomRecord>;
  onDeleteRoom: (id: string) => Promise<void>;
  onUpdateBedStatus: (bedId: string, status: BedStatus) => Promise<void>;
  onRoomsChange: (rooms: RoomRecord[]) => Promise<void>;
  onTenantsChange: (tenants: TenantRecord[]) => Promise<void>;
  onInvoicesChange: (invoices: Invoice[]) => Promise<void>;
  onConfirmPayment: (invoiceId: string, manager: string) => Promise<Invoice>;
};

export const DormDataContext = createContext<DormDataContextType | undefined>(undefined);

export function DormDataProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<RoomRecord[]>([...initialRooms]);
  const [tenants, setTenants] = useState<TenantRecord[]>([...initialTenants]);
  const [invoices, setInvoices] = useState<Invoice[]>([...initialInvoices]);
  const [tickets, setTickets] = useState<Ticket[]>([...initialTickets]);
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [r, t, inv, tck] = await Promise.all([
        dormService.getRooms(),
        dormService.getTenants(),
        dormService.getInvoices(),
        dormService.getTickets(),
      ]);
      setRooms(r);
      setTenants(t);
      setInvoices(inv);
      setTickets(tck);
    } catch {
      // Keep existing data on network/fetch failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onCreateTicket = async (ticketData: Omit<Ticket, "id">): Promise<Ticket> => {
    const created = await dormService.createTicket(ticketData);
    setTickets((prev) => [created, ...prev]);
    return created;
  };

  const onUpdateTicket = async (id: string, patch: Partial<Ticket>): Promise<Ticket> => {
    const updated = await dormService.updateTicket(id, patch);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };
  const onCreateRoom = async (roomData: RoomRecord): Promise<RoomRecord> => {
    const created = await dormService.createRoom(roomData);
    setRooms((prev) => [created, ...prev]);
    return created;
  };

  const onUpdateRoom = async (id: string, roomData: RoomRecord): Promise<RoomRecord> => {
    const updated = await dormService.updateRoom(id, roomData);
    setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const onDeleteRoom = async (id: string): Promise<void> => {
    await dormService.deleteRoom(id);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, deletedAt: new Date().toISOString() } : r,
      ),
    );
  };

  const onUpdateBedStatus = async (bedId: string, status: BedStatus): Promise<void> => {
    await dormService.updateBedStatus(bedId, status);
    // Refresh rooms or update local state
    const refreshed = await dormService.getRooms();
    setRooms(refreshed);
  };

  const onRoomsChange = async (newRooms: RoomRecord[]): Promise<void> => {
    setRooms(newRooms);
    await dormService.saveRooms(newRooms);
  };

  const onTenantsChange = async (newTenants: TenantRecord[]): Promise<void> => {
    setTenants(newTenants);
    await dormService.saveTenants(newTenants);
  };

  const onInvoicesChange = async (newInvoices: Invoice[]): Promise<void> => {
    setInvoices(newInvoices);
    await dormService.saveInvoices(newInvoices);
  };

  const onConfirmPayment = async (invoiceId: string, manager: string): Promise<Invoice> => {
    const confirmed = await dormService.confirmPayment(invoiceId, manager);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? confirmed : inv)));
    return confirmed;
  };

  return (
    <DormDataContext.Provider
      value={{
        rooms,
        tenants,
        invoices,
        tickets,
        loading,
        reload,
        onCreateTicket,
        onUpdateTicket,
        onCreateRoom,
        onUpdateRoom,
        onDeleteRoom,
        onUpdateBedStatus,
        onRoomsChange,
        onTenantsChange,
        onInvoicesChange,
        onConfirmPayment,
      }}
    >
      {children}
    </DormDataContext.Provider>
  );
}
