import { createContext, useState, useEffect, type ReactNode } from "react";
import type {
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
  BedStatus,
  FacilityExpense,
} from "../types/index.ts";
import type { ContractDocumentRecord, ContractRecord, OnboardingInput, OnboardingResult, TenantVehicle } from "../types/tenant.ts";
import { dormService } from "../services/dormService.ts";
import { useToast } from "../hooks/useToast.ts";

export type DormDataContextType = {
  rooms: RoomRecord[];
  tenants: TenantRecord[];
  invoices: Invoice[];
  tickets: Ticket[];
  contracts: ContractRecord[];
  vehicles: TenantVehicle[];
  expenses: FacilityExpense[];
  onCreateExpense: (expense: FacilityExpense) => Promise<void>;
  onUpdateExpense: (id: string, expense: FacilityExpense) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onRegisterVehicle: (vehicle: TenantVehicle) => Promise<void>;
  onIssueVehicleCard: (id: string, cardCode: string) => Promise<void>;
  onRevokeVehicle: (id: string) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onOnboard: (input: OnboardingInput) => Promise<OnboardingResult>;
  onRenewContract: (id: string, endDate: string) => Promise<void>;
  onCheckoutContract: (id: string, status: "AVAILABLE" | "MAINTENANCE") => Promise<void>;
  onAddContractDocuments: (id: string, documents: ContractDocumentRecord[]) => Promise<void>;
  onDeleteContractDocument: (id: string, documentId: string) => Promise<void>;
  onUpdateTenantProfile: (id: string, profile: Pick<TenantRecord, "name" | "cccd" | "email" | "phone" | "address" | "gender">) => Promise<TenantRecord>;
  loading: boolean;
  reload: () => Promise<void>;
  onCreateTicket: (ticket: Omit<Ticket, "id">) => Promise<Ticket>;
  onUpdateTicket: (id: string, patch: Partial<Ticket>, actorStaffId?: string) => Promise<Ticket>;
  onCreateRoom: (room: RoomRecord) => Promise<RoomRecord>;
  onUpdateRoom: (id: string, room: RoomRecord) => Promise<RoomRecord>;
  onDeleteRoom: (id: string) => Promise<void>;
  onUpdateBedStatus: (bedId: string, status: BedStatus) => Promise<void>;
  onRoomsChange: (rooms: RoomRecord[]) => Promise<void>;
  onSubmitInvoiceProof: (id: string, tenantId: string, proof: NonNullable<Invoice["proof"]>) => Promise<void>;
  onRejectInvoiceProof: (id: string) => Promise<void>;
  onConfirmInvoiceProof: (id: string, manager: string) => Promise<void>;
  onConfirmPayment: (invoiceId: string, manager: string) => Promise<Invoice>;
};

export const DormDataContext = createContext<DormDataContextType | undefined>(undefined);

export function DormDataProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [vehicles, setVehicles] = useState<TenantVehicle[]>([]);
  const [expenses, setExpenses] = useState<FacilityExpense[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [contractData, vehicleData, expenseData] = await Promise.allSettled([dormService.getContracts(), dormService.getVehicles(), dormService.getExpenses()]);
      if (contractData.status === "fulfilled") setContracts(contractData.value);
      else showToast(contractData.reason instanceof Error ? contractData.reason.message : "Không thể tải hợp đồng.");
      if (vehicleData.status === "fulfilled") setVehicles(vehicleData.value);
      else showToast(vehicleData.reason instanceof Error ? vehicleData.reason.message : "Không thể tải phương tiện.");
      if (expenseData.status === "fulfilled") setExpenses(expenseData.value);
      else {
        setExpenses([]);
        showToast(expenseData.reason instanceof Error ? expenseData.reason.message : "Không thể tải chi phí.");
      }
    } catch {
      showToast("Không thể tải dữ liệu. Vui lòng thử lại.");
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

  const onUpdateTicket = async (id: string, patch: Partial<Ticket>, actorStaffId?: string): Promise<Ticket> => {
    const persisted = await dormService.updateTicket(id, patch, actorStaffId);
    setTickets((prev) => prev.map((ticket) => ticket.id === id ? persisted : ticket));
    return persisted;
  };
  const onCreateExpense = async (expense: FacilityExpense) => {
    const created = await dormService.createExpense(expense);
    setExpenses((current) => [created, ...current]);
  };
  const onUpdateExpense = async (id: string, expense: FacilityExpense) => {
    const updated = await dormService.updateExpense(id, expense);
    setExpenses((current) => current.map((item) => item.id === id ? updated : item));
  };
  const onDeleteExpense = async (id: string) => {
    await dormService.deleteExpense(id);
    setExpenses((current) => current.filter((item) => item.id !== id));
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
    const saved = await dormService.saveRooms(newRooms);
    setRooms(saved);
  };

  const onSubmitInvoiceProof = async (id: string, tenantId: string, proof: NonNullable<Invoice["proof"]>) => {
    const updated = await dormService.submitInvoiceProof(id, tenantId, proof);
    setInvoices((current) => current.map((invoice) => invoice.id === id ? updated : invoice));
  };
  const onRejectInvoiceProof = async (id: string) => {
    const updated = await dormService.rejectInvoiceProof(id);
    setInvoices((current) => current.map((invoice) => invoice.id === id ? updated : invoice));
  };
  const onConfirmInvoiceProof = async (id: string, manager: string) => {
    const updated = await dormService.confirmInvoiceProof(id, manager);
    setInvoices((current) => current.map((invoice) => invoice.id === id ? updated : invoice));
  };

  const onConfirmPayment = async (invoiceId: string, manager: string): Promise<Invoice> => {
    const confirmed = await dormService.confirmPayment(invoiceId, manager);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? confirmed : inv)));
    return confirmed;
  };
  const refreshLifecycle = async () => {
    const [nextRooms, nextTenants, nextInvoices, nextContracts, nextVehicles] = await Promise.all([
      dormService.getRooms(), dormService.getTenants(), dormService.getInvoices(), dormService.getContracts(), dormService.getVehicles(),
    ]);
    setRooms(nextRooms); setTenants(nextTenants); setInvoices(nextInvoices); setContracts(nextContracts); setVehicles(nextVehicles);
  };
  const onOnboard = async (input: OnboardingInput) => {
    const result = await dormService.onboard(input);
    await refreshLifecycle();
    return result;
  };
  const onRenewContract = async (id: string, endDate: string) => {
    await dormService.renewContract(id, endDate);
    await refreshLifecycle();
  };
  const onCheckoutContract = async (id: string, status: "AVAILABLE" | "MAINTENANCE") => {
    await dormService.checkoutContract(id, status);
    await refreshLifecycle();
  };
  const onRegisterVehicle = async (vehicle: TenantVehicle) => {
    const created = await dormService.registerVehicle(vehicle);
    setVehicles((current) => [...current, created]);
  };
  const onIssueVehicleCard = async (id: string, cardCode: string) => {
    const updated = await dormService.issueVehicleCard(id, cardCode);
    setVehicles((current) => current.map((vehicle) => vehicle.id === id ? updated : vehicle));
  };
  const onRevokeVehicle = async (id: string) => {
    const updated = await dormService.revokeVehicle(id);
    setVehicles((current) => current.map((vehicle) => vehicle.id === id ? updated : vehicle));
  };
  const onResetDemo = async () => {
    await dormService.resetMockData();
    await reload();
  };
  const onAddContractDocuments = async (id: string, documents: ContractDocumentRecord[]) => {
    await dormService.addContractDocuments(id, documents);
    setContracts(await dormService.getContracts());
  };
  const onDeleteContractDocument = async (id: string, documentId: string) => {
    await dormService.deleteContractDocument(id, documentId);
    setContracts(await dormService.getContracts());
  };
  const onUpdateTenantProfile = async (id: string, profile: Pick<TenantRecord, "name" | "cccd" | "email" | "phone" | "address" | "gender">) => {
    const updated = await dormService.updateTenantProfile(id, profile);
    setTenants((current) => current.map((tenant) => tenant.id === id ? updated : tenant));
    return updated;
  };

  return (
    <DormDataContext.Provider
      value={{
        rooms,
        tenants,
        invoices,
        tickets,
        contracts,
        vehicles,
        expenses,
        onCreateExpense,
        onUpdateExpense,
        onDeleteExpense,
        onRegisterVehicle,
        onIssueVehicleCard,
        onRevokeVehicle,
        onResetDemo,
        onOnboard,
        onRenewContract,
        onCheckoutContract,
        onAddContractDocuments,
        onDeleteContractDocument,
        onUpdateTenantProfile,
        loading,
        reload,
        onCreateTicket,
        onUpdateTicket,
        onCreateRoom,
        onUpdateRoom,
        onDeleteRoom,
        onUpdateBedStatus,
        onRoomsChange,
        onSubmitInvoiceProof,
        onRejectInvoiceProof,
        onConfirmInvoiceProof,
        onConfirmPayment,
      }}
    >
      {children}
    </DormDataContext.Provider>
  );
}
