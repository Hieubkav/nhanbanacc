lỗi 


## Error Type

Console Error

## Error Message

`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog

    at _c1 (src/components/ui/sheet.tsx:60:5)
    at _c1 (src/components/ui/sheet.tsx:58:3)
    at Navbar (src/components/site/navbar.tsx:167:13)
    at SiteLayout (src\app\(site)\layout.tsx:34:15)

## Code Frame

  58 |   `<SheetPortal>`
  59 |     `<SheetOverlay />`

> 60 |     <SheetPrimitive.Content
> |     ^
> 61 |       ref={ref}
> 62 |       className={cn(sheetVariants({ side }), className)}
> 63 |       {...props}

Next.js version: 15.5.0 (Turbopack)
