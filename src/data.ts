export type Role = "manager" | "student" | "technician";

export type TicketStatus = "Mới giao" | "Đang xử lý" | "Hoàn thành";

export type Priority = "Khẩn cấp" | "Cao" | "Bình thường";
export const PRIORITIES: Priority[] = ["Khẩn cấp", "Cao", "Bình thường"];
export const priorityRank: Record<Priority, number> = { "Khẩn cấp": 0, Cao: 1, "Bình thường": 2 };

export type Ticket = {
  id: string;
  room: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  bed?: string;
  status: TicketStatus;
  reporter: string;
  phone: string;
  createdAt: string;
  deadline: string;
  hasPhoto: boolean;
  assignee?: string;
  resolution?: string;
  cost?: number;
};

export const TECHNICIANS = ["Võ Văn Thịnh", "Lâm Quốc Huy"];
export const CURRENT_TECH = "Võ Văn Thịnh";

export const initialTickets: Ticket[] = [
  {
    id: "SC-1049",
    room: "P.401",
    title: "Rò rỉ nước dưới bồn rửa",
    description: "Ống cấp nước dưới bồn rửa mặt bị rỉ liên tục, nước chảy ra sàn nhà vệ sinh. Cần xử lý trước khi nước lan sang phòng bên.",
    category: "Điện nước",
    priority: "Khẩn cấp",
    bed: "G02",
    status: "Mới giao",
    reporter: "Lê Hoàng Nam",
    phone: "0903 456 118",
    createdAt: "Hôm nay, 08:20",
    deadline: "Trước 12:00 hôm nay",
    assignee: "Võ Văn Thịnh",
    hasPhoto: true,
  },
  {
    id: "SC-1047",
    room: "P.205",
    title: "Điều hòa không lạnh",
    description: "Máy lạnh chạy nhưng chỉ ra gió thường, đã vệ sinh lưới lọc vẫn không cải thiện.",
    category: "Điều hòa",
    priority: "Cao",
    bed: "G01",
    status: "Đang xử lý",
    reporter: "Trần Quốc Bảo",
    phone: "0912 330 779",
    createdAt: "Hôm qua, 21:05",
    deadline: "Trước 17:00 hôm nay",
    assignee: "Võ Văn Thịnh",
    hasPhoto: false,
  },
  {
    id: "SC-1046",
    room: "P.302",
    title: "Quạt trần kêu to khi quay",
    description: "Quạt trần phát ra tiếng lạch cạch khi chạy tốc độ 2 và 3, ảnh hưởng giấc ngủ của cả phòng.",
    category: "Điện",
    priority: "Bình thường",
    bed: "G02",
    status: "Đang xử lý",
    reporter: "Nguyễn Hoàng Nam",
    phone: "0987 214 506",
    createdAt: "22/10, 19:40",
    deadline: "Trước 26/10",
    assignee: "Võ Văn Thịnh",
    hasPhoto: true,
  },
  {
    id: "SC-1044",
    room: "P.103",
    title: "Khóa tủ cá nhân bị kẹt",
    description: "Ổ khóa tủ giường G03 không xoay được chìa.",
    category: "Nội thất",
    priority: "Bình thường",
    bed: "G03",
    status: "Mới giao",
    reporter: "Phạm Đức Anh",
    phone: "0935 771 220",
    createdAt: "23/10, 10:12",
    deadline: "Trước 27/10",
    hasPhoto: false,
  },
  {
    id: "SC-1041",
    room: "P.204",
    title: "Bóng đèn hành lang tầng 2 cháy",
    description: "Hai bóng đèn đầu hành lang tầng 2 không sáng.",
    category: "Điện",
    priority: "Bình thường",
    status: "Hoàn thành",
    reporter: "Đỗ Anh Tuấn",
    phone: "0977 120 330",
    createdAt: "20/10, 18:00",
    deadline: "Đã đóng",
    assignee: "Võ Văn Thịnh",
    hasPhoto: false,
    resolution: "Đã thay 2 bóng LED 12W, kiểm tra nguồn ổn định.",
    cost: 70000,
  },
];

export const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export type Person = {
  name: string;
  gender: "Nam" | "Nữ";
  phone: string;
  cccd: string;
  email: string;
  address: string;
};

export const people: Person[] = [
  { name: "Nguyễn Hoàng Nam", gender: "Nam", phone: "0987 214 506", cccd: "079203001187", email: "student@gmail.com", address: "Quận Bình Thạnh, TP.HCM" },
  { name: "Lê Hoàng Nam", gender: "Nam", phone: "0903 456 118", cccd: "079204009106", email: "lehoangnam@gmail.com", address: "TP. Thủ Đức, TP.HCM" },
  { name: "Trần Quốc Bảo", gender: "Nam", phone: "0912 330 779", cccd: "079205017025", email: "tranquocbao@gmail.com", address: "Quận 7, TP.HCM" },
  { name: "Phạm Đức Anh", gender: "Nam", phone: "0935 771 220", cccd: "079203024944", email: "phamducanh@gmail.com", address: "Quận Gò Vấp, TP.HCM" },
  { name: "Đỗ Anh Tuấn", gender: "Nam", phone: "0977 120 330", cccd: "079204032863", email: "doanhtuan@gmail.com", address: "Quận 12, TP.HCM" },
  { name: "Võ Thị Mai", gender: "Nữ", phone: "0944 118 902", cccd: "079205040782", email: "vothimai@gmail.com", address: "Quận Tân Bình, TP.HCM" },
  { name: "Bùi Khánh Linh", gender: "Nữ", phone: "0966 402 117", cccd: "079203048701", email: "buikhanhlinh@gmail.com", address: "Quận 3, TP.HCM" },
  { name: "Hồ Minh Khoa", gender: "Nam", phone: "0918 512 640", cccd: "079204056620", email: "hominhkhoa@gmail.com", address: "Quận Phú Nhuận, TP.HCM" },
  { name: "Nguyễn Minh Tuấn", gender: "Nam", phone: "0909 056 321", cccd: "079205064539", email: "nguyenminhtuan@gmail.com", address: "Quận 10, TP.HCM" },
  { name: "Trần Ngọc Hân", gender: "Nữ", phone: "0988 291 045", cccd: "079203072458", email: "tranngochan@gmail.com", address: "Quận 4, TP.HCM" },
  { name: "Lê Gia Bảo", gender: "Nam", phone: "0937 140 288", cccd: "079204080377", email: "legiabao@gmail.com", address: "Quận 11, TP.HCM" },
  { name: "Nguyễn Văn Nam", gender: "Nam", phone: "0912 345 678", cccd: "079205088296", email: "nguyenvannam@gmail.com", address: "Quận Bình Tân, TP.HCM" },
  { name: "Trần Thị Thảo", gender: "Nữ", phone: "0987 654 321", cccd: "079203096215", email: "tranthithao@gmail.com", address: "Quận Tân Phú, TP.HCM" },
  { name: "Lê Minh Tuấn", gender: "Nam", phone: "0903 112 233", cccd: "079204104134", email: "leminhtuan@gmail.com", address: "Huyện Bình Chánh, TP.HCM" },
  { name: "Hoàng Anh Quân", gender: "Nam", phone: "0933 445 566", cccd: "079205112053", email: "hoanganhquan@gmail.com", address: "Quận 8, TP.HCM" },
  { name: "Phạm Ngọc Linh", gender: "Nữ", phone: "0968 220 155", cccd: "079203119972", email: "phamngoclinh@gmail.com", address: "Quận 5, TP.HCM" },
  { name: "Nguyễn Thị Mai", gender: "Nữ", phone: "0905 125 774", cccd: "079204127891", email: "nguyenthimai@gmail.com", address: "Quận 6, TP.HCM" },
  { name: "Trần Văn Hùng", gender: "Nam", phone: "0906 188 245", cccd: "079205135810", email: "tranvanhung@gmail.com", address: "Quận 1, TP.HCM" },
  { name: "Phạm Thu Hương", gender: "Nữ", phone: "0907 224 913", cccd: "079203143729", email: "phamthuhuong@gmail.com", address: "Huyện Hóc Môn, TP.HCM" },
  { name: "Đỗ Hoàng Minh", gender: "Nam", phone: "0908 056 667", cccd: "079204151648", email: "dohoangminh@gmail.com", address: "Huyện Nhà Bè, TP.HCM" },
  { name: "Vũ Ngọc Anh", gender: "Nữ", phone: "0909 291 350", cccd: "079205159567", email: "vungocanh@gmail.com", address: "Quận Bình Thạnh, TP.HCM" },
  { name: "Phạm Văn Hùng", gender: "Nam", phone: "0905 118 442", cccd: "079203167486", email: "phamvanhung@gmail.com", address: "TP. Thủ Đức, TP.HCM" },
  { name: "Lê Quang Minh", gender: "Nam", phone: "0932 667 081", cccd: "079204175405", email: "lequangminh@gmail.com", address: "Quận 7, TP.HCM" },
];

export const person = (name: string): Person =>
  people.find((p) => p.name === name) ?? { name, gender: "Nam", phone: "—", cccd: "—", email: "—", address: "—" };

export type TenantRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "Nam" | "Nữ";
  cccd: string;
  address: string;
  room: string;
  bed: string;
  start: string;
  end: string;
  monthlyRent: number;
  deposit: number;
  status: "Đang thuê" | "Sắp hết HĐ" | "Đã trả phòng";
};

export const initialTenants: TenantRecord[] = [
  { id: "NT-0187", name: "Nguyễn Hoàng Nam", email: "student@gmail.com", phone: "0987 214 506", gender: "Nam", cccd: "079203001187", address: "Quận Bình Thạnh, TP.HCM", room: "P.302", bed: "G02", start: "01/09/2026", end: "01/09/2027", monthlyRent: 1500000, deposit: 1500000, status: "Đang thuê" },
  { id: "NT-0188", name: "Nguyễn Văn Nam", email: "nguyenvannam@gmail.com", phone: "0912 345 678", gender: "Nam", cccd: "079205088296", address: "Quận Bình Tân, TP.HCM", room: "P.302", bed: "G01", start: "01/09/2026", end: "01/09/2027", monthlyRent: 1500000, deposit: 1500000, status: "Đang thuê" },
  { id: "NT-0189", name: "Trần Thị Thảo", email: "tranthithao@gmail.com", phone: "0987 654 321", gender: "Nữ", cccd: "079203096215", address: "Quận Tân Phú, TP.HCM", room: "P.102", bed: "G04", start: "15/01/2026", end: "15/01/2027", monthlyRent: 1600000, deposit: 1600000, status: "Sắp hết HĐ" },
  { id: "NT-0190", name: "Lê Minh Tuấn", email: "leminhtuan@gmail.com", phone: "0903 112 233", gender: "Nam", cccd: "079204104134", address: "Huyện Bình Chánh, TP.HCM", room: "P.302", bed: "G04", start: "01/09/2026", end: "01/09/2027", monthlyRent: 1500000, deposit: 1500000, status: "Đang thuê" },
  { id: "NT-0191", name: "Phạm Ngọc Linh", email: "phamngoclinh@gmail.com", phone: "0968 220 155", gender: "Nữ", cccd: "079203119972", address: "Quận 5, TP.HCM", room: "P.301", bed: "G05", start: "01/09/2026", end: "01/09/2027", monthlyRent: 1500000, deposit: 1500000, status: "Đang thuê" },
];

export type RoomType = "4 giường" | "6 giường" | "8 giường";
export type RoomGender = "Nam" | "Nữ";
export type BedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface AmenityItem {
  name: string;
  quantity: number;
}

export interface BedRecord {
  bedCode: string;
  slotKey: string;
  price: number;
  status: BedStatus;
}

export interface RoomRecord {
  id: string;
  code: string;
  floor: number;
  type: RoomType;
  gender: RoomGender;
  total: number;
  basePrice: number;
  amenities: AmenityItem[];
  bedOverrides?: Record<string, { status?: BedStatus; price?: number }>;
  deletedAt?: string | null;
}

export const initialRooms: RoomRecord[] = [
  // TẦNG 1
  {
    id: "RM-101",
    code: "P.101",
    floor: 1,
    type: "4 giường",
    gender: "Nữ",
    total: 4,
    basePrice: 1600000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Tủ sắt", quantity: 4 },
      { name: "Wifi riêng", quantity: 1 },
    ],
  },
  {
    id: "RM-102",
    code: "P.102",
    floor: 1,
    type: "6 giường",
    gender: "Nữ",
    total: 6,
    basePrice: 1400000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Tủ cá nhân", quantity: 6 },
    ],
  },
  {
    id: "RM-103",
    code: "P.103",
    floor: 1,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1400000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Quạt trần", quantity: 1 },
      { name: "Tủ cá nhân", quantity: 4 },
    ],
  },
  // TẦNG 2
  {
    id: "RM-201",
    code: "P.201",
    floor: 2,
    type: "6 giường",
    gender: "Nam",
    total: 6,
    basePrice: 1400000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Ban công", quantity: 1 },
      { name: "Tủ sắt", quantity: 6 },
    ],
  },
  {
    id: "RM-202",
    code: "P.202",
    floor: 2,
    type: "4 giường",
    gender: "Nữ",
    total: 4,
    basePrice: 1600000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Tủ lạnh", quantity: 1 },
    ],
  },
  {
    id: "RM-205",
    code: "P.205",
    floor: 2,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1500000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Quạt trần", quantity: 1 },
      { name: "Bàn học", quantity: 2 },
    ],
  },
  // TẦNG 3
  {
    id: "RM-301",
    code: "P.301",
    floor: 3,
    type: "6 giường",
    gender: "Nữ",
    total: 6,
    basePrice: 1500000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Tủ lạnh", quantity: 1 },
      { name: "Tủ cá nhân", quantity: 6 },
    ],
  },
  {
    id: "RM-302",
    code: "P.302",
    floor: 3,
    type: "6 giường",
    gender: "Nam",
    total: 6,
    basePrice: 1500000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Tủ sắt", quantity: 6 },
      { name: "Wifi riêng", quantity: 1 },
    ],
  },
  {
    id: "RM-303",
    code: "P.303",
    floor: 3,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1700000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Ban công", quantity: 1 },
    ],
  },
  {
    id: "RM-304",
    code: "P.304",
    floor: 3,
    type: "6 giường",
    gender: "Nữ",
    total: 6,
    basePrice: 1400000,
    amenities: [
      { name: "Quạt trần", quantity: 2 },
      { name: "Tủ cá nhân", quantity: 6 },
    ],
    bedOverrides: {
      G01: { status: "MAINTENANCE" },
      G02: { status: "MAINTENANCE" },
    },
  },
  // TẦNG 4
  {
    id: "RM-401",
    code: "P.401",
    floor: 4,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1500000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Ban công", quantity: 1 },
    ],
  },
  {
    id: "RM-402",
    code: "P.402",
    floor: 4,
    type: "4 giường",
    gender: "Nữ",
    total: 4,
    basePrice: 1500000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Bình nóng lạnh", quantity: 1 },
      { name: "Tủ sắt", quantity: 4 },
    ],
  },
];

export type RentalSlot = {
  room: string;
  bed: string;
  floor: number;
  monthlyRent: number;
  status: "Sẵn sàng" | "Bảo trì";
};

export const rentalSlots: RentalSlot[] = initialRooms.flatMap((room) =>
  Array.from({ length: room.total }, (_, i) => {
    const bed = `G0${i + 1}`;
    return {
      room: room.code,
      bed,
      floor: room.floor,
      monthlyRent: room.basePrice,
      status: room.bedOverrides?.[bed]?.status === "MAINTENANCE" ? ("Bảo trì" as const) : ("Sẵn sàng" as const),
    };
  }),
);

export type PaymentRecord = {
  amount: number;
  method: "Trực tuyến" | "Tiền mặt";
  paidAt: string;
  confirmedBy: string;
};

export type InvoiceStatus = "Đã thu" | "Nợ" | "Chờ xác nhận";
export type PaymentProof = {
  fileName: string;
  submittedAt: string;
};
export type Invoice = {
  id: string;
  tenant: string;
  room: string;
  bed: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
  payment?: PaymentRecord;
  proof?: PaymentProof;
  late?: number;
  kind?: string;
};

export const initialInvoices: Invoice[] = [
  { id: "HD-2610-0001", tenant: "Nguyễn Hoàng Nam", room: "P.302", bed: "G02", amount: 1200000, due: "05/10/2026", status: "Đã thu", payment: { amount: 1200000, method: "Trực tuyến", paidAt: "03/10/2026 09:15", confirmedBy: "Hệ thống VietQR" } },
  { id: "HD-2610-0002", tenant: "Lê Hoàng Nam", room: "P.401", bed: "G01", amount: 1500000, due: "05/10/2026", status: "Đã thu", payment: { amount: 1500000, method: "Trực tuyến", paidAt: "04/10/2026 14:20", confirmedBy: "Hệ thống VietQR" } },
  { id: "HD-2610-0003", tenant: "Trần Quốc Bảo", room: "P.205", bed: "G03", amount: 1200000, due: "05/10/2026", status: "Nợ" },
  { id: "HD-2610-0004", tenant: "Phạm Đức Anh", room: "P.103", bed: "G03", amount: 900000, due: "05/10/2026", status: "Nợ", late: 1 },
  { id: "HD-2610-0005", tenant: "Đỗ Anh Tuấn", room: "P.204", bed: "G04", amount: 1200000, due: "05/10/2026", status: "Đã thu", payment: { amount: 1200000, method: "Trực tuyến", paidAt: "02/10/2026 08:40", confirmedBy: "Hệ thống VietQR" } },
  { id: "HD-2610-0006", tenant: "Võ Thị Mai", room: "P.108", bed: "G01", amount: 1500000, due: "05/10/2026", status: "Nợ", late: 1 },
  { id: "HD-2610-0007", tenant: "Bùi Khánh Linh", room: "P.210", bed: "G02", kind: "Dịch vụ giặt ủi + gửi xe", amount: 350000, due: "05/10/2026", status: "Nợ" },
  { id: "HD-2609-0011", tenant: "Hồ Minh Khoa", room: "P.312", bed: "G04", amount: 900000, due: "05/09/2026", status: "Nợ", late: 31, kind: "Tiền phòng tháng 9" },
  { id: "HD-2611-0187", tenant: "Nguyễn Hoàng Nam", room: "P.302", bed: "G02", amount: 1500000, due: "05/11/2026", status: "Chờ xác nhận", kind: "Tiền phòng tháng 11", proof: { fileName: "bien-lai-mb-bank-19-10.png", submittedAt: "14:20 19/10/2026" } },
];
