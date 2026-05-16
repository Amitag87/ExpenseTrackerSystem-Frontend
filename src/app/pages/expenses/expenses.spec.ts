import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpensesComponent } from './expenses';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ExpensesApiService } from '../../core/services/expenses-api.service';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { SessionService } from '../../core/services/session.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;

  beforeEach(async () => {
    const expensesApiMock = {
      listByUser: () => of([]),
      create: () => of({}),
      update: () => of({}),
      remove: () => of({})
    };
    const categoriesApiMock = {
      listByType: () => of([])
    };
    const sessionMock = {
      userId: () => 1,
      profile: signal({ currency: 'USD' })
    };
    const activatedRouteMock = {
      queryParamMap: of({ get: () => null })
    };

    await TestBed.configureTestingModule({
      imports: [ExpensesComponent],
      providers: [
        provideRouter([]),
        { provide: ExpensesApiService, useValue: expensesApiMock },
        { provide: CategoriesApiService, useValue: categoriesApiMock },
        { provide: SessionService, useValue: sessionMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
