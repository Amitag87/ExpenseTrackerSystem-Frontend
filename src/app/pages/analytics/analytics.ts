import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, PLATFORM_ID, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AnalyticsApiService } from '../../core/services/analytics-api.service';
import { SessionService } from '../../core/services/session.service';
import { formatCurrency, monthName } from '../../core/utils/formatters';

declare const Chart: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly session = inject(SessionService);
  private readonly analyticsApi = inject(AnalyticsApiService);

  loading = true;
  errorMessage = '';
  
  // Summary Stats
  annualIncome = 0;
  annualExpense = 0;
  annualSavings = 0;
  healthScore = 0;

  private comparisonChart: any;
  private distributionChart: any;
  private healthTrendChart: any;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.loadData();
  }

  private loadData(): void {
    const userId = this.session.userId();
    if (!userId) {
      this.errorMessage = 'Session expired. Please login again.';
      this.loading = false;
      return;
    }

    const now = new Date();
    
    this.analyticsApi.createSnapshot(userId, now.getFullYear(), now.getMonth() + 1).pipe(
      catchError(() => of(null)),
      switchMap(() => forkJoin({
        summary: this.analyticsApi.yearly(userId, now.getFullYear()).pipe(catchError(() => of({ income: 0, expense: 0 }))),
        health: this.analyticsApi.health(userId).pipe(catchError(() => of(0))),
        trends: this.analyticsApi.incomeExpenseTrend(userId).pipe(catchError(() => of([]))),
        categories: this.analyticsApi.categoryBreakdown(userId).pipe(catchError(() => of({}))),
        savingsTrend: this.analyticsApi.savingsRateTrend(userId).pipe(catchError(() => of([])))
      }))
    ).subscribe({
      next: (data) => {
        this.annualIncome = data.summary.income;
        this.annualExpense = data.summary.expense;
        this.annualSavings = this.annualIncome - this.annualExpense;
        this.healthScore = data.health;

        this.renderCharts(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Analytics load error:', err);
        this.errorMessage = 'Unable to load analytics data. Please try again later.';
        this.loading = false;
      }
    });
  }

  private renderCharts(data: any): void {
    if (!this.viewReady || !isPlatformBrowser(this.platformId) || typeof Chart === 'undefined') {
      return;
    }

    // Destroy existing charts to prevent memory leaks and overlay issues
    this.comparisonChart?.destroy();
    this.distributionChart?.destroy();
    this.healthTrendChart?.destroy();

    // 1. Comparison Chart (Inflow vs Outflow Trend)
    const trendLabels = data.trends.map((t: any) => monthName(t.month - 1));
    const incomeData = data.trends.map((t: any) => t.income);
    const expenseData = data.trends.map((t: any) => t.expense);

    const ctxComparison = document.getElementById('comparisonChart') as HTMLCanvasElement;
    if (ctxComparison) {
      this.comparisonChart = new Chart(ctxComparison, {
        type: 'bar',
        data: {
          labels: trendLabels.length ? trendLabels : ['Jan', 'Feb', 'Mar'],
          datasets: [
            { label: 'Inflow', data: incomeData.length ? incomeData : [0, 0, 0], backgroundColor: 'rgba(29, 158, 117, 0.7)', borderRadius: 4 },
            { label: 'Outflow', data: expenseData.length ? expenseData : [0, 0, 0], backgroundColor: 'rgba(226, 75, 74, 0.7)', borderRadius: 4 }
          ]
        },
        options: this.getChartOptions('Income vs Expense')
      });
    }

    // 2. Distribution Chart (Category Breakdown)
    const catLabels = Object.keys(data.categories);
    const catValues = Object.values(data.categories);

    const ctxDistribution = document.getElementById('distributionChart') as HTMLCanvasElement;
    if (ctxDistribution) {
      this.distributionChart = new Chart(ctxDistribution, {
        type: 'doughnut',
        data: {
          labels: catLabels.length ? catLabels : ['No Data'],
          datasets: [{
            data: catValues.length ? catValues : [1],
            backgroundColor: ['#1D9E75', '#E24B4A', '#F1C40F', '#3498DB', '#9B59B6', '#E67E22'],
            borderWidth: 0
          }]
        },
        options: {
          ...this.getChartOptions('Expense by Category'),
          cutout: '70%',
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
        }
      });
    }

    // 3. Health Trend Chart (Savings Rate)
    const ctxHealth = document.getElementById('healthTrendChart') as HTMLCanvasElement;
    if (ctxHealth) {
      this.healthTrendChart = new Chart(ctxHealth, {
        type: 'line',
        data: {
          labels: trendLabels.length ? trendLabels : ['Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Savings Rate %',
            data: data.savingsTrend.length ? data.savingsTrend : [0, 0, 0],
            borderColor: '#1D9E75',
            backgroundColor: 'rgba(29, 158, 117, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4
          }]
        },
        options: this.getChartOptions('Savings Rate Trend')
      });
    }
  }

  private getChartOptions(title: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 15 } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8 }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } }
      }
    };
  }

  formatAmount(amount: number): string {
    return formatCurrency(amount, this.session.profile()?.currency ?? 'INR');
  }
}
