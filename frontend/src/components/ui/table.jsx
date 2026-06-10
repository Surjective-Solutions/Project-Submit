import { cn } from '@/lib/utils';

function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-indigo-50/40',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-3 text-left align-middle text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-border',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-3 py-2.5 align-middle', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
