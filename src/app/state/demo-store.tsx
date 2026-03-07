import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ChannelStatus = "connected" | "warning" | "disconnected";

export interface Channel {
  id: string;
  name: string;
  status: ChannelStatus;
  tokenExpiresAt: string | null;
  syncedAt: string | null;
  productsSynced: number;
  ordersSynced: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  channelId: string;
  channelName: string;
  category: string;
  mappedCategory: string;
  price: number;
  cost: number | null;
  stock: number;
  safetyStock: number;
  feeRate: number;
  updatedAt: string;
  status: "active" | "draft";
}

export type OrderStatus = "paid" | "preparing" | "shipping" | "delivered" | "cancelled";

export interface Order {
  id: string;
  channelId: string;
  channelName: string;
  customerName: string;
  status: OrderStatus;
  items: number;
  amount: number;
  feeRate: number;
  placedAt: string;
  invoiceNumber: string | null;
  carrier: string | null;
}

export type ListingStatus = "draft" | "published";
export type SourceType = "offline" | "online";
export type ProcurementStatus = "pending" | "ordered" | "received";
export type PackingStatus = "pending" | "packing" | "packed";

export interface ListingRecord {
  id: string;
  title: string;
  sku: string;
  brand: string;
  sourceType: SourceType;
  sourceLabel: string;
  detail: string;
  imageNames: string[];
  price: number;
  cost: number;
  countryCount: number;
  status: ListingStatus;
  savedAt: string;
  publishedAt: string | null;
}

export interface ListingInput {
  title: string;
  sku: string;
  brand: string;
  sourceType: SourceType;
  sourceLabel: string;
  detail: string;
  imageNames: string[];
  price: number;
  cost: number;
}

export interface OrderWorkflowState {
  procurementStatus: ProcurementStatus;
  packingStatus: PackingStatus;
}

interface DemoDataContextValue {
  channels: Channel[];
  products: Product[];
  orders: Order[];
  listings: ListingRecord[];
  orderWorkflowStates: Record<string, OrderWorkflowState>;
  lastOrderSyncAt: string;
  lastProductSyncAt: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  connectChannel: (channelId: string) => Promise<void>;
  refreshChannel: (channelId: string) => Promise<void>;
  syncOrders: () => Promise<void>;
  syncProducts: () => Promise<void>;
  bulkUploadCosts: () => Promise<void>;
  updateProductCost: (productId: string, cost: number) => Promise<void>;
  assignInvoice: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  saveListingDraft: (input: ListingInput) => Promise<void>;
  saveAndPublishListing: (input: ListingInput) => Promise<void>;
  publishListing: (listingId: string) => Promise<void>;
  updateOrderWorkflowState: (orderId: string, patch: Partial<OrderWorkflowState>) => void;
}

interface ApiErrorPayload {
  message?: string;
}

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  return `${API_BASE_URL}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    throw new Error(payload?.message ?? `${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function fetchChannels() {
  return request<Channel[]>("/channels");
}

async function fetchProducts() {
  return request<Product[]>("/products");
}

async function fetchOrders() {
  return request<Order[]>("/orders");
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "API 요청 중 알 수 없는 오류가 발생했습니다.";
}

function buildListingId() {
  return `LST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createListingRecord(input: ListingInput, status: ListingStatus): ListingRecord {
  const now = new Date().toISOString();

  return {
    id: buildListingId(),
    title: input.title,
    sku: input.sku,
    brand: input.brand,
    sourceType: input.sourceType,
    sourceLabel: input.sourceLabel,
    detail: input.detail,
    imageNames: input.imageNames,
    price: input.price,
    cost: input.cost,
    countryCount: status === "published" ? 8 : 0,
    status,
    savedAt: now,
    publishedAt: status === "published" ? now : null,
  };
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [orderWorkflowStates, setOrderWorkflowStates] = useState<Record<string, OrderWorkflowState>>({});
  const [lastOrderSyncAt, setLastOrderSyncAt] = useState("");
  const [lastProductSyncAt, setLastProductSyncAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async (showInitialLoading = false) => {
    if (showInitialLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [nextChannels, nextProducts, nextOrders] = await Promise.all([
        fetchChannels(),
        fetchProducts(),
        fetchOrders(),
      ]);

      setChannels(nextChannels);
      setProducts(nextProducts);
      setOrders(nextOrders);

      const latestOrderSync = nextOrders
        .map((order) => order.placedAt)
        .sort((left, right) => right.localeCompare(left))[0] ?? "";
      const latestProductSync = nextProducts
        .map((product) => product.updatedAt)
        .sort((left, right) => right.localeCompare(left))[0] ?? "";

      setLastOrderSyncAt(latestOrderSync);
      setLastProductSyncAt(latestProductSync);
      setError(null);
    } catch (nextError) {
      setError(normalizeError(nextError));
      setChannels([]);
      setProducts([]);
      setOrders([]);
      setLastOrderSyncAt("");
      setLastProductSyncAt("");
    } finally {
      if (showInitialLoading) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAll(true);
  }, [loadAll]);

  useEffect(() => {
    setOrderWorkflowStates((current) => {
      const nextState = { ...current };

      orders.forEach((order) => {
        if (!nextState[order.id]) {
          nextState[order.id] = {
            procurementStatus: "pending",
            packingStatus: "pending",
          };
        }
      });

      return nextState;
    });
  }, [orders]);

  const mutate = useCallback(async (run: () => Promise<void>, reloadTarget?: "orders" | "products" | "all") => {
    setIsRefreshing(true);

    try {
      await run();

      if (reloadTarget === "orders") {
        const nextOrders = await fetchOrders();
        setOrders(nextOrders);
        setLastOrderSyncAt(
          nextOrders.map((order) => order.placedAt).sort((left, right) => right.localeCompare(left))[0] ?? "",
        );
      } else if (reloadTarget === "products") {
        const nextProducts = await fetchProducts();
        setProducts(nextProducts);
        setLastProductSyncAt(
          nextProducts.map((product) => product.updatedAt).sort((left, right) => right.localeCompare(left))[0] ?? "",
        );
      } else {
        await loadAll(false);
      }

      setError(null);
    } catch (nextError) {
      setError(normalizeError(nextError));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAll]);

  const connectChannel = useCallback(
    async (channelId: string) => {
      await mutate(
        () => request<void>(`/channels/${channelId}/connect`, { method: "POST" }),
        "all",
      );
    },
    [mutate],
  );

  const refreshChannel = useCallback(
    async (channelId: string) => {
      await mutate(
        () => request<void>(`/channels/${channelId}/refresh`, { method: "POST" }),
        "all",
      );
    },
    [mutate],
  );

  const syncOrders = useCallback(async () => {
    await mutate(() => request<void>("/orders/sync", { method: "POST" }), "orders");
  }, [mutate]);

  const syncProducts = useCallback(async () => {
    await mutate(() => request<void>("/products/sync", { method: "POST" }), "products");
  }, [mutate]);

  const bulkUploadCosts = useCallback(async () => {
    await mutate(() => request<void>("/products/bulk-upload-costs", { method: "POST" }), "products");
  }, [mutate]);

  const updateProductCost = useCallback(
    async (productId: string, cost: number) => {
      await mutate(
        () =>
          request<void>(`/products/${productId}/cost`, {
            method: "PATCH",
            body: JSON.stringify({ cost }),
          }),
        "products",
      );
    },
    [mutate],
  );

  const assignInvoice = useCallback(
    async (orderId: string) => {
      await mutate(
        () => request<void>(`/orders/${orderId}/invoice`, { method: "POST" }),
        "orders",
      );
    },
    [mutate],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await mutate(
        () =>
          request<void>(`/orders/${orderId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          }),
        "orders",
      );
    },
    [mutate],
  );

  const saveListingDraft = useCallback(async (input: ListingInput) => {
    setListings((current) => [createListingRecord(input, "draft"), ...current]);
  }, []);

  const saveAndPublishListing = useCallback(async (input: ListingInput) => {
    setListings((current) => [createListingRecord(input, "published"), ...current]);
  }, []);

  const publishListing = useCallback(async (listingId: string) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: "published",
              countryCount: 8,
              publishedAt: new Date().toISOString(),
            }
          : listing,
      ),
    );
  }, []);

  const updateOrderWorkflowState = useCallback((orderId: string, patch: Partial<OrderWorkflowState>) => {
    setOrderWorkflowStates((current) => ({
      ...current,
      [orderId]: {
        procurementStatus: current[orderId]?.procurementStatus ?? "pending",
        packingStatus: current[orderId]?.packingStatus ?? "pending",
        ...patch,
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      channels,
      listings,
      orderWorkflowStates,
      products,
      orders,
      lastOrderSyncAt,
      lastProductSyncAt,
      isLoading,
      isRefreshing,
      error,
      connectChannel,
      refreshChannel,
      syncOrders,
      syncProducts,
      bulkUploadCosts,
      updateProductCost,
      assignInvoice,
      updateOrderStatus,
      saveListingDraft,
      saveAndPublishListing,
      publishListing,
      updateOrderWorkflowState,
    }),
    [
      assignInvoice,
      bulkUploadCosts,
      channels,
      connectChannel,
      error,
      isLoading,
      isRefreshing,
      lastOrderSyncAt,
      lastProductSyncAt,
      listings,
      orders,
      orderWorkflowStates,
      publishListing,
      products,
      refreshChannel,
      saveAndPublishListing,
      saveListingDraft,
      syncOrders,
      syncProducts,
      updateOrderWorkflowState,
      updateOrderStatus,
      updateProductCost,
    ],
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoDataContext);

  if (!context) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }

  return context;
}

export function getMarginRate(product: Product) {
  if (product.cost === null || product.price === 0) {
    return null;
  }

  const feeAmount = product.price * product.feeRate;
  return ((product.price - product.cost - feeAmount) / product.price) * 100;
}

export function getExpectedSettlement(order: Order) {
  return order.amount * (1 - order.feeRate);
}

export function getExpectedProductSettlement(product: Product) {
  return product.price * (1 - product.feeRate);
}

export function getExpectedNetProfit(product: Product) {
  if (product.cost === null) {
    return null;
  }

  return getExpectedProductSettlement(product) - product.cost;
}

export function getLowStockProducts(products: Product[]) {
  return products.filter((product) => product.stock <= product.safetyStock);
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  paid: "결제 완료",
  preparing: "배송 준비",
  shipping: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소",
};

export const orderStatusColor: Record<OrderStatus, string> = {
  paid: "bg-blue-50 text-blue-700",
  preparing: "bg-amber-50 text-amber-700",
  shipping: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

export const channelStatusLabel: Record<ChannelStatus, string> = {
  connected: "정상 연동",
  warning: "토큰 만료 임박",
  disconnected: "미연동",
};

export const channelStatusColor: Record<ChannelStatus, string> = {
  connected: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  disconnected: "bg-slate-100 text-slate-600",
};
