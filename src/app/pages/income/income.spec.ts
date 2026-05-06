import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeComponent } from './income';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { IncomeApiService } from '../../core/services/income-api.service';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { SessionService } from '../../core/services/session.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let fixture: ComponentFixture<IncomeComponent>;

  beforeEach(async () => {
    const incomeApiMock = {
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
      imports: [IncomeComponent],
      providers: [
        provideRouter([]),
        { provide: IncomeApiService, useValue: incomeApiMock },
        { provide: CategoriesApiService, useValue: categoriesApiMock },
        { provide: SessionService, useValue: sessionMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
