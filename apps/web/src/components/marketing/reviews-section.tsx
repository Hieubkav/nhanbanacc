"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";

export default function ReviewsSection() {
  // Lấy danh sách reviews được hiển thị, sắp xếp theo sortOrder
  const reviews = useQuery(api.reviews.list, { 
    filters: [{ field: "isVisible", value: true }], 
    sort: { field: "sortOrder", direction: "asc" }, 
    pageSize: 6 
  } as any);
  
  // Lấy tất cả khách hàng (sẽ được tối ưu hóa sau)
  const customers = useQuery(api.customers.list, { pageSize: 1000 } as any);
  
  // Lấy tất cả sản phẩm (sẽ được tối ưu hóa sau)
  const products = useQuery(api.products.list, { pageSize: 1000 } as any);

  if (!reviews) {
    // Hiển thị skeleton loading
    return (
      <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Khách Hàng Nói Gì</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent ml-4 dark:via-gray-700"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-24 animate-pulse rounded bg-muted/50" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (reviews.items.length === 0) return null;

  // Hàm lấy thông tin khách hàng từ customerId
  const getCustomer = (customerId: string) => {
    if (!customerId || !customers?.items) return null;
    return customers.items.find((c: any) => String(c._id) === String(customerId));
  };
  
  // Hàm lấy thông tin sản phẩm từ productId
  const getProduct = (productId: string) => {
    if (!productId || !products?.items) return null;
    return products.items.find((p: any) => String(p._id) === String(productId));
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Khách Hàng Nói Gì</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent ml-4 dark:via-gray-700"></div>
      </div>
      
      <div className="mb-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          Khám phá những trải nghiệm thực tế từ khách hàng đã sử dụng sản phẩm của chúng tôi. 
          Những đánh giá chân thực giúp bạn đưa ra quyết định mua hàng thông minh hơn.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.items.map((review: any) => {
          const customer = getCustomer(review.customerId);
          const product = getProduct(review.productId);
          
          return (
            <Card key={String(review._id)} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={customer?.avatarUrl} alt={customer?.name} />
                  <AvatarFallback>{customer?.name?.charAt(0) || 'K'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{customer?.name || 'Khách hàng'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product ? `Về ${product.name}` : 'Khách hàng'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{review.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{review.content}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}