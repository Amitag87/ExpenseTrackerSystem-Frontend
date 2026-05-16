import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout';
import { provideRouter } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { SessionService } from '../../core/services/session.service';
import { NotificationsApiService } from '../../core/services/notifications-api.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    const authApiMock = { 
      getProfile: () => of({}),
      logout: () => of({})
    };
    const sessionMock = { 
      userId: () => 1, 
      profile: signal(null), 
      setProfile: () => {},
      session: signal({ fullName: 'Test User' }),
      clear: () => {}
    };
    const notificationsMock = { 
      unreadCount: () => of(0),
      listByRecipient: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthApiService, useValue: authApiMock },
        { provide: SessionService, useValue: sessionMock },
        { provide: NotificationsApiService, useValue: notificationsMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
