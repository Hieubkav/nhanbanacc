vẫn lỗi 


## Error Type

Runtime TypeError

## Error Message

Cannot convert undefined or null to object

    at Object.getPrototypeOf (`<anonymous>`:null:null)
    at ReviewsSection (src/components/marketing/reviews-section.tsx:19:29)
    at Home (src/app/(site)/page.tsx:67:13)

## Code Frame

  17 |   // Lấy thông tin khách hàng cho các reviews
  18 |   const customerIds = reviews?.items?.map((r: any) => r.customerId).filter(Boolean) || [];

> 19 |   const customers = useQuery(
> |                             ^
> 20 |     api.customers.list,
> 21 |     customerIds.length > 0
> 22 |       ? {

Next.js version: 15.5.0 (Turbopack)
