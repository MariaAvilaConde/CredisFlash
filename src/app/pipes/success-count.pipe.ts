import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Pipe({ name: 'successCount', standalone: true })
export class SuccessCountPipe implements PipeTransform {
  transform(transactions: Transaction[]): number {
    return transactions.filter((t) => t.status === 'success').length;
  }
}
