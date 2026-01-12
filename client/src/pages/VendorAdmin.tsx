import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Store, Package, ShoppingBag, BarChart3, Settings, Plus, Pencil, Trash2, 
  Clock, DollarSign, TrendingUp, ArrowLeft, Loader2, CheckCircle, XCircle
} from "lucide-react";
import { useLocation } from "wouter";
import type { Vendor, Product, Order } from "@shared/schema";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  prepTimeMinutes: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

const shopFormSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  deliveryTime: z.string().optional(),
});

function OverviewTab({ vendor, analytics }: { vendor: Vendor; analytics: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${analytics?.totalRevenue || "0.00"}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${analytics?.avgOrderValue || "0.00"}</p>
              <p className="text-sm text-muted-foreground">Avg Order</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vendor.isOpen ? "Open" : "Closed"}</p>
              <p className="text-sm text-muted-foreground">Shop Status</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Shop Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{vendor.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location</span>
            <span>{vendor.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Time</span>
            <span>{vendor.deliveryTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating</span>
            <span>{vendor.rating}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProductsTab({ products, onAdd, onEdit, onDelete }: { 
  products: Product[];
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Products ({products.length})</h3>
        <Button onClick={onAdd} size="sm" data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products yet</p>
          <p className="text-sm text-muted-foreground">Add your first product to start selling</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="p-4" data-testid={`product-item-${product.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{product.name}</h4>
                    <Badge variant={product.isAvailable ? "default" : "secondary"}>
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="font-semibold text-primary">${product.price}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {product.prepTimeMinutes} min
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)} data-testid={`button-edit-product-${product.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} data-testid={`button-delete-product-${product.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab({ orders, onUpdateStatus }: { 
  orders: Order[];
  onUpdateStatus: (orderId: number, status: string) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    accepted: "bg-blue-500",
    preparing: "bg-orange-500",
    ready: "bg-green-500",
    completed: "bg-gray-500",
    cancelled: "bg-red-500",
  };

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = {
      pending: "accepted",
      accepted: "preparing",
      preparing: "ready",
      ready: "completed",
    };
    return flow[current];
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Orders ({orders.length})</h3>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4" data-testid={`order-item-${order.id}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Order #{order.id}</span>
                  <Badge className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </div>
                <span className="font-semibold">${order.totalAmount}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="flex gap-2">
                  {getNextStatus(order.status) && (
                    <Button 
                      size="sm" 
                      onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                      data-testid={`button-advance-order-${order.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as {getNextStatus(order.status)}
                    </Button>
                  )}
                  {order.status === "pending" && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onUpdateStatus(order.id, "cancelled")}
                      data-testid={`button-cancel-order-${order.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ShopSettingsTab({ vendor, onUpdate }: { vendor: Vendor; onUpdate: (data: any) => void }) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: vendor.name,
      description: vendor.description || "",
      location: vendor.location,
      deliveryTime: vendor.deliveryTime || "",
    },
  });

  const [isOpen, setIsOpen] = useState(vendor.isOpen);

  const toggleOpenMutation = useMutation({
    mutationFn: async (open: boolean) => {
      return await apiRequest('PUT', '/api/vendor-admin/shop', { isOpen: open });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/shop'] });
      toast({ title: isOpen ? "Shop is now open" : "Shop is now closed" });
    }
  });

  const handleToggleOpen = (checked: boolean) => {
    setIsOpen(checked);
    toggleOpenMutation.mutate(checked);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Shop Status</h3>
            <p className="text-sm text-muted-foreground">Toggle your shop open or closed</p>
          </div>
          <Switch 
            checked={isOpen} 
            onCheckedChange={handleToggleOpen}
            data-testid="switch-shop-open"
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Shop Details</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-shop-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="input-shop-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-shop-location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Time</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 15-25 min" data-testid="input-delivery-time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" data-testid="button-save-shop">
              Save Changes
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default function VendorAdmin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productForm = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      prepTimeMinutes: "10",
      isAvailable: true,
    },
  });

  const { data: vendor, isLoading: vendorLoading } = useQuery<Vendor | null>({
    queryKey: ['/api/vendor-admin/shop'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/vendor-admin/products'],
    enabled: !!vendor,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/vendor-admin/orders'],
    enabled: !!vendor,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/vendor-admin/analytics'],
    enabled: !!vendor,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/vendor-admin/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/products'] });
      setProductDialogOpen(false);
      productForm.reset();
      toast({ title: "Product created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PUT', `/api/vendor-admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/products'] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/vendor-admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/products'] });
      toast({ title: "Product deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/analytics'] });
      toast({ title: "Order updated" });
    },
  });

  const updateShopMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/vendor-admin/shop', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-admin/shop'] });
      toast({ title: "Shop updated successfully" });
    },
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      name: "",
      description: "",
      price: "",
      prepTimeMinutes: "10",
      isAvailable: true,
    });
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      prepTimeMinutes: String(product.prepTimeMinutes),
      isAvailable: product.isAvailable,
    });
    setProductDialogOpen(true);
  };

  const handleProductSubmit = (data: any) => {
    const productData = {
      name: data.name,
      description: data.description || null,
      price: data.price,
      prepTimeMinutes: parseInt(data.prepTimeMinutes) || 10,
      isAvailable: data.isAvailable,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold font-display">Vendor Admin</h1>
          </div>
        </header>

        <main className="px-5 py-8">
          <Card className="p-8 text-center">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
            <p className="text-muted-foreground mb-6">
              You don't have a shop yet. Apply to become a vendor and start selling on A1 Services.
            </p>
            <Button onClick={() => navigate('/become-vendor')} data-testid="button-become-vendor">
              Become a Vendor
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/profile')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-display">{vendor.name}</h1>
            <p className="text-sm text-muted-foreground">Vendor Dashboard</p>
          </div>
        </div>
      </header>

      <main className="px-5 py-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab vendor={vendor} analytics={analytics} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab 
              products={products}
              onAdd={handleAddProduct}
              onEdit={handleEditProduct}
              onDelete={(id) => deleteProductMutation.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab 
              orders={orders}
              onUpdateStatus={(orderId, status) => updateOrderMutation.mutate({ orderId, status })}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ShopSettingsTab 
              vendor={vendor}
              onUpdate={(data) => updateShopMutation.mutate(data)}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-product-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="prepTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep Time (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-prep-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={productForm.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Available for sale</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        data-testid="switch-product-available"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  data-testid="button-save-product"
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingProduct ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
