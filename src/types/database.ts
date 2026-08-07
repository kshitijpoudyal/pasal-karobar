export type TransactionType = "INCOME" | "EXPENSE";

export type PaymentMethod =
  | "CASH"
  | "ESEWA"
  | "KHALTI"
  | "FONEPAY"
  | "BANK_TRANSFER";

export type BusinessType =
  | "BARBER"
  | "SALON"
  | "GROCERY"
  | "PHARMACY"
  | "RESTAURANT"
  | "OTHER";

export type BusinessRecord = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

/** Shop row plus profile fields loaded from `business_settings`. */
export type Business = BusinessRecord & {
  business_type: BusinessType;
  currency: string;
  timezone: string;
};

export type BusinessInsert = {
  name: string;
  business_type?: BusinessType;
  currency?: string;
  timezone?: string;
};

export type BusinessUpdate = Partial<{
  name: string;
  business_type: BusinessType;
  currency: string;
  timezone: string;
}>;

export type ServiceRecord = {
  id: string;
  business_id: string;
  name: string;
  default_price: number;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceInsert = Pick<
  ServiceRecord,
  "business_id" | "name" | "default_price"
> &
  Partial<
    Pick<ServiceRecord, "icon" | "color" | "display_order" | "is_active">
  >;

export type ServiceUpdate = Partial<
  Pick<
    ServiceRecord,
    "name" | "default_price" | "icon" | "color" | "display_order" | "is_active"
  >
>;

export type ExpenseCategory = {
  id: string;
  business_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExpenseCategoryInsert = Pick<
  ExpenseCategory,
  "business_id" | "name"
> &
  Partial<
    Pick<
      ExpenseCategory,
      "icon" | "color" | "display_order" | "is_active"
    >
  >;

export type ExpenseCategoryUpdate = Partial<
  Pick<
    ExpenseCategory,
    "name" | "icon" | "color" | "display_order" | "is_active"
  >
>;

export type Customer = {
  id: string;
  business_id: string;
  phone: string;
  phone_normalized: string;
  name: string | null;
  first_visit_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInsert = Pick<
  Customer,
  "business_id" | "phone" | "phone_normalized"
> &
  Partial<Pick<Customer, "name" | "first_visit_at">>;

export type CustomerUpdate = Partial<
  Pick<Customer, "phone" | "phone_normalized" | "name" | "first_visit_at">
>;

export type Transaction = {
  id: string;
  business_id: string;
  type: TransactionType;
  service_id: string | null;
  expense_category_id: string | null;
  customer_id: string | null;
  subtotal: number;
  tip: number;
  total: number;
  payment_method: PaymentMethod;
  note: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
};

export type IncomeTransactionInsert = {
  business_id: string;
  type: "INCOME";
  service_id: string;
  customer_id?: string | null;
  subtotal: number;
  tip?: number;
  total: number;
  payment_method: PaymentMethod;
  note?: string | null;
  transaction_date: string;
};

export type ExpenseTransactionInsert = {
  business_id: string;
  type: "EXPENSE";
  expense_category_id: string;
  subtotal: number;
  total: number;
  payment_method: PaymentMethod;
  note?: string | null;
  transaction_date: string;
};

export type TransactionRowInsert = {
  business_id: string;
  type: TransactionType;
  service_id?: string | null;
  expense_category_id?: string | null;
  customer_id?: string | null;
  subtotal: number;
  tip?: number;
  total: number;
  payment_method: PaymentMethod;
  note?: string | null;
  transaction_date: string;
};

export type TransactionInsert =
  | IncomeTransactionInsert
  | ExpenseTransactionInsert;

export type TransactionUpdate = Partial<
  Pick<
    Transaction,
    | "service_id"
    | "expense_category_id"
    | "customer_id"
    | "subtotal"
    | "tip"
    | "total"
    | "payment_method"
    | "note"
    | "transaction_date"
  >
>;

export type BusinessSetting = {
  business_id: string;
  setting_key: string;
  setting_value: string;
};

export type BusinessMember = {
  id: string;
  business_id: string;
  user_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      business: {
        Row: BusinessRecord;
        Insert: Pick<BusinessRecord, "name"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<BusinessRecord, "name">>;
        Relationships: [];
      };
      services: {
        Row: ServiceRecord;
        Insert: ServiceInsert & { id?: string };
        Update: ServiceUpdate;
        Relationships: [];
      };
      expense_categories: {
        Row: ExpenseCategory;
        Insert: ExpenseCategoryInsert & { id?: string };
        Update: ExpenseCategoryUpdate;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert & { id?: string };
        Update: CustomerUpdate;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionRowInsert & { id?: string };
        Update: TransactionUpdate;
        Relationships: [];
      };
      business_settings: {
        Row: BusinessSetting;
        Insert: BusinessSetting;
        Update: Partial<Pick<BusinessSetting, "setting_value">>;
        Relationships: [];
      };
      business_members: {
        Row: BusinessMember;
        Insert: Omit<BusinessMember, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_business_member: {
        Args: { p_business_id: string };
        Returns: boolean;
      };
      create_business_for_owner: {
        Args: {
          p_name: string;
          p_business_type?: BusinessType;
          p_currency?: string;
          p_timezone?: string;
        };
        Returns: BusinessRecord;
      };
    };
    Enums: {
      transaction_type: TransactionType;
      payment_method: PaymentMethod;
      business_type: BusinessType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
