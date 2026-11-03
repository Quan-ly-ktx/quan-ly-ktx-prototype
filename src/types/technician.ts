export type TechnicianAccount = {
  name: string;
  user: string;
  active: boolean;
};

export type TechnicianProfile = {
  name: string;
  role: string;
  phone: string;
  email: string;
  certs: string[];
  shift: string;
};
