import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Expense } from '@/types/expense';

export async function exportToCSV(expenses: Expense[]) {
  const csvHeader = 'Date,Store,Category,Amount,Notes\n';
  const csvRows = expenses
    .map(expense => {
      const notes = (expense.notes || '').replace(/,/g, ';');
      return `${expense.date},"${expense.storeName}",${expense.category},${expense.amount},"${notes}"`;
    })
    .join('\n');
  
  const csvContent = csvHeader + csvRows;

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const fileName = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    const file = new File(Paths.cache, fileName);
    
    file.write(csvContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }
}
