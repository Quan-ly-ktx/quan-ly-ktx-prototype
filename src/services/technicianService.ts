import { httpClient } from "./httpClient.ts";
import { env } from "../config/env.ts";
import { getMockSnapshot, updateMockSnapshot, type MockStaff } from "./mock/mockStore.ts";
import { demoEmailAvailable } from "./mock/mockAuth.ts";
import type {
  TechnicianResponse,
  CreateTechnicianRequest,
  UpdateTechnicianRequest,
  UpdateTechnicianStatusRequest,
  SingleResponse,
  PageResponse,
  SuccessResponse,
} from "../types/api/endpoints.ts";

export interface GetTechniciansParams {
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface TechnicianService {
  getTechnicians(
    params?: GetTechniciansParams,
  ): Promise<PageResponse<TechnicianResponse> | TechnicianResponse[]>;
  createTechnician(req: CreateTechnicianRequest): Promise<TechnicianResponse>;
  getTechnician(id: string): Promise<TechnicianResponse>;
  updateTechnician(
    id: string,
    req: UpdateTechnicianRequest,
  ): Promise<TechnicianResponse>;
  toggleStatus(id: string, active: boolean): Promise<TechnicianResponse>;
}


// Mock Implementation
class MockTechnicianServiceImpl implements TechnicianService {
  private getTechs(): MockStaff[] {
    const state = getMockSnapshot();
    return state.staff.filter((staff) => state.accounts.some((account) => account.id === staff.userId && account.role === "technician"));
  }
  async getTechnicians(
    params?: GetTechniciansParams,
  ): Promise<PageResponse<TechnicianResponse> | TechnicianResponse[]> {
    let list = this.getTechs();

    if (params?.active !== undefined) {
      list = list.filter((t) => t.active === params.active);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          t.phone.includes(q),
      );
    }

    if (params?.page !== undefined || params?.size !== undefined) {
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      const start = page * size;
      const paginated = list.slice(start, start + size);
      const totalElements = list.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      return {
        items: paginated,
        page,
        size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
      };
    }

    return list;
  }

  async createTechnician(req: CreateTechnicianRequest): Promise<TechnicianResponse> {
    if (!demoEmailAvailable(req.email)) throw new Error("Email đã được sử dụng.");
    const id = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const newTech = {
      id, userId, fullName: req.fullName, email: req.email, phone: req.phone,
      active: true, userStatus: "ACTIVE" as const, createdAt: new Date().toISOString(),
    };
    updateMockSnapshot((state) => ({
      ...state,
      staff: [...state.staff, newTech],
      accounts: [...state.accounts, { id: userId, staffId: id, identifier: req.email, email: req.email, name: req.fullName, password: req.password, role: "technician" }],
    }));
    return newTech;
  }

  async getTechnician(id: string): Promise<TechnicianResponse> {
    const techs = this.getTechs();
    const found = techs.find((t) => t.id === id || t.email === id);
    if (!found) {
      throw new Error(`Technician with id ${id} not found`);
    }
    return found;
  }

  async updateTechnician(
    id: string,
    req: UpdateTechnicianRequest,
  ): Promise<TechnicianResponse> {
    const current = this.getTechs().find((t) => t.id === id || t.email === id);
    if (!current) throw new Error(`Technician with id ${id} not found`);
    if (!demoEmailAvailable(req.email ?? current.email ?? "", current.id)) throw new Error("Email đã được sử dụng.");
    const updatedTech = {
      ...current,
      fullName: req.fullName ?? current.fullName,
      email: req.email ?? current.email,
      phone: req.phone ?? current.phone,
    };
    updateMockSnapshot((state) => ({
      ...state,
      staff: state.staff.map((item) => item.id === current.id ? updatedTech : item),
      accounts: state.accounts.map((account) => account.id === current.userId
        ? { ...account, identifier: updatedTech.email ?? account.identifier, email: updatedTech.email ?? account.email, name: updatedTech.fullName }
        : account),
    }));
    return updatedTech;
  }

  async toggleStatus(id: string, active: boolean): Promise<TechnicianResponse> {
    const current = this.getTechs().find((t) => t.id === id || t.email === id);
    if (!current) throw new Error(`Technician with id ${id} not found`);
    const updatedTech = { ...current, active, userStatus: active ? "ACTIVE" as const : "INACTIVE" as const };
    updateMockSnapshot((state) => ({
      ...state,
      staff: state.staff.map((item) => item.id === current.id ? updatedTech : item),
      accounts: state.accounts.map((account) => account.id === current.userId ? { ...account, status: active ? "ACTIVE" : "INACTIVE" } : account),
    }));
    return updatedTech;
  }
}

// API Implementation
class ApiTechnicianServiceImpl implements TechnicianService {
  async getTechnicians(
    params?: GetTechniciansParams,
  ): Promise<PageResponse<TechnicianResponse> | TechnicianResponse[]> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.active !== undefined) queryParams.active = params.active;
    if (params?.search) queryParams.search = params.search;
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;

    const res = await httpClient.get<
      | SingleResponse<PageResponse<TechnicianResponse>>
      | PageResponse<TechnicianResponse>
      | SingleResponse<TechnicianResponse[]>
      | TechnicianResponse[]
    >("/users/technicians", {
      params: queryParams,
    });

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data as PageResponse<TechnicianResponse> | TechnicianResponse[];
    }
    return res as PageResponse<TechnicianResponse> | TechnicianResponse[];
  }

  async createTechnician(req: CreateTechnicianRequest): Promise<TechnicianResponse> {
    const res = await httpClient.post<
      SingleResponse<TechnicianResponse> | TechnicianResponse
    >("/users/technicians", req);

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data as TechnicianResponse;
    }
    return res as TechnicianResponse;
  }

  async getTechnician(id: string): Promise<TechnicianResponse> {
    const res = await httpClient.get<
      SingleResponse<TechnicianResponse> | TechnicianResponse
    >(`/users/technicians/${id}`);

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data as TechnicianResponse;
    }
    return res as TechnicianResponse;
  }

  async updateTechnician(
    id: string,
    req: UpdateTechnicianRequest,
  ): Promise<TechnicianResponse> {
    const res = await httpClient.put<
      SingleResponse<TechnicianResponse> | TechnicianResponse
    >(`/users/technicians/${id}`, req);

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data as TechnicianResponse;
    }
    return res as TechnicianResponse;
  }

  async toggleStatus(id: string, active: boolean): Promise<TechnicianResponse> {
    const payload: UpdateTechnicianStatusRequest = { active };
    const res = await httpClient.patch<
      SingleResponse<TechnicianResponse> | TechnicianResponse | SuccessResponse
    >(`/users/technicians/${id}/status`, payload);

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data as TechnicianResponse;
    }
    return res as TechnicianResponse;
  }
}

export const mockTechnicianService: TechnicianService = new MockTechnicianServiceImpl();
export const apiTechnicianService: TechnicianService = new ApiTechnicianServiceImpl();

export const technicianService: TechnicianService = env.USE_MOCK
  ? mockTechnicianService
  : apiTechnicianService;
