import * as React from "react";
import { Root, Item, Indicator } from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const radioGroupVariants = cva(
	"group flex gap-2",
	{
		variants: {
			orientation: {
				horizontal: "flex-row",
				vertical: "flex-col",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
		},
	}
);

const RadioGroup = React.forwardRef<
	React.ElementRef<typeof Root>,
	React.ComponentPropsWithoutRef<typeof Root> &
	VariantProps<typeof radioGroupVariants>
>(({ className, orientation, ...props }, ref) => {
	return (
		<Root
			ref={ref}
			className={cn(radioGroupVariants({ orientation, className }))}
			{...props}
		/>
	);
});
RadioGroup.displayName = Root.displayName;

const radioGroupItemVariants = cva(
	"aspect-square size-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "border border-input",
				primary: "border-primary",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof Item>,
	React.ComponentPropsWithoutRef<typeof Item> &
	VariantProps<typeof radioGroupItemVariants>
>(({ className, variant, ...props }, ref) => {
	return (
		<Item
			ref={ref}
			className={cn(radioGroupItemVariants({ variant, className }))}
			{...props}
		>
			<Indicator className="flex items-center justify-center">
				<div className="size-2 rounded-full bg-primary" />
			</Indicator>
		</Item>
	);
});
RadioGroupItem.displayName = Item.displayName;

export { RadioGroup, RadioGroupItem };