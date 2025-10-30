function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={"ics-bg-neutral-700 ics-animate-pulse ics-rounded-md" + ' ' + className}
      {...props}
    />
  );
}

export { Skeleton };
