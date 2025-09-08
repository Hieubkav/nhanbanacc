lỗi 


## Error Type

Runtime ReferenceError

## Error Message

faqs is not defined

    at Home (src/app/(site)/page.tsx:66:13)

## Code Frame

  64 |
  65 |           {/* FAQ Section */}

> 66 |           {(faqs?.items ?? []).length > 0 && (
> |             ^
> 67 |             `<section className="animate-fade-in-up animation-delay-400" id="faq">`
> 68 |               `<div className="mb-8 flex items-center justify-between">`
> 69 |                 `<h2 className="text-3xl font-bold text-gray-900 dark:text-white">`Câu Hỏi Thường Gặp`</h2>`

Next.js version: 15.5.0 (Turbopack)
