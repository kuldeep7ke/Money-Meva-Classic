import { Transaction } from '@/modules/transactions/types';
import { TRANSACTION_TYPE_LABELS } from '@/constants';
import { formatCurrency, formatDate } from '@/utils';

export const exportService = {
  toCSV: (transactions: Transaction[]): string => {
    const headers = [
      'Date',
      'Type',
      'Description',
      'Amount',
      'Category',
      'Partner',
      'Tags',
      'Notes',
    ];

    const rows = transactions.map((t) => [
      formatDate(t.date),
      TRANSACTION_TYPE_LABELS[t.type],
      t.description,
      t.amount.toString(),
      t.categoryId,
      t.partnerId || '',
      t.tags?.join(', ') || '',
      t.notes || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    return csvContent;
  },

  downloadCSV: (transactions: Transaction[], filename: string = 'transactions') => {
    const csv = exportService.toCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  },

  toJSON: (transactions: Transaction[]): string => {
    return JSON.stringify(transactions, null, 2);
  },

  downloadJSON: (transactions: Transaction[], filename: string = 'transactions') => {
    const json = exportService.toJSON(transactions);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },

  toExcel: async (transactions: Transaction[], filename: string = 'transactions') => {
    const XLSX = await import('xlsx');
    const data = transactions.map((t) => ({
      Date: formatDate(t.date),
      Type: TRANSACTION_TYPE_LABELS[t.type],
      Description: t.description,
      Amount: t.amount,
      Category: t.categoryId,
      Partner: t.partnerId || '',
      Tags: t.tags?.join(', ') || '',
      Notes: t.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  toPDF: async (transactions: Transaction[], filename: string = 'transactions') => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Money Meva - Transactions Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

    const tableData = transactions.map((t) => [
      formatDate(t.date),
      TRANSACTION_TYPE_LABELS[t.type],
      t.description,
      formatCurrency(t.amount),
    ]);

    autoTable(doc, {
      head: [['Date', 'Type', 'Description', 'Amount']],
      body: tableData,
      startY: 35,
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  },
};
