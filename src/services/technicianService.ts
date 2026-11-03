import { httpClient } from "./httpClient.ts";
import { env } from "../config/env.ts";
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

// In-memory / localStorage storage keys for mock mode
const STORAGE_KEY = "dorm_mock_technicians";

const initialMockTechnicians: TechnicianResponse[] = [
  {
    id: "tech-1",
    fullName: "Võ Văn Thịnh",
    email: "thinh.vv@ktxhub.vn",
    phone: "0908 112 245",
    active: true,
    userStatus: "ACTIVE",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "tech-2",
    fullName: "Lâm Quốc Huy",
    email: "huy.lq@ktxhub.vn",
    phone: "0912 334 556",
    active: false,
    userStatus: "INACTIVE",
    createdAt: "2024-02-10T09:30:00Z",
  },
];

function loadMockStorage(): TechnicianResponse[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [...initialMockTechnicians];
  }
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? (JSON.parse(item) as TechnicianResponse[]) : [...initialMockTechnicians];
  } catch {
    return [...initialMockTechnicians];
  }
}

function saveMockStorage(data: TechnicianResponse[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota or disabled storage error
  }
}

// Mock Implementation
class MockTechnicianServiceImpl implements TechnicianService {
  private inMemoryTechs: TechnicianResponse[] = loadMockStorage();

  private getTechs(): TechnicianResponse[] {
    return this.inMemoryTechs;
  }

  private saveTechs(data: TechnicianResponse[]): void {
    this.inMemoryTechs = data;
    saveMockStorage(data);
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
    const techs = this.getTechs();
    const newTech: TechnicianResponse = {
      id: `tech-${Date.now()}`,
      fullName: req.fullName,
      email: req.email,
      phone: req.phone,
      active: true,
      userStatus: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    const updated = [...techs, newTech];
    this.saveTechs(updated);
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
    const techs = this.getTechs();
    const idx = techs.findIndex((t) => t.id === id || t.email === id);
    if (idx === -1) {
      throw new Error(`Technician with id ${id} not found`);
    }
    const current = techs[idx];
    const updatedTech: TechnicianResponse = {
      ...current,
      fullName: req.fullName ?? current.fullName,
      email: req.email ?? current.email,
      phone: req.phone ?? current.phone,
    };
    const nextTechs = [...techs];
    nextTechs[idx] = updatedTech;
    this.saveTechs(nextTechs);
    return updatedTech;
  }

  async toggleStatus(id: string, active: boolean): Promise<TechnicianResponse> {
    const techs = this.getTechs();
    const idx = techs.findIndex((t) => t.id === id || t.email === id);
    if (idx === -1) {
      throw new Error(`Technician with id ${id} not found`);
    }
    const current = techs[idx];
    const updatedTech: TechnicianResponse = {
      ...current,
      active,
      userStatus: active ? "ACTIVE" : "INACTIVE",
    };
    const nextTechs = [...techs];
    nextTechs[idx] = updatedTech;
    this.saveTechs(nextTechs);
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
