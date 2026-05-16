import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';
import { provideRouter } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { NotificationsApiService } from '../../core/services/notifications-api.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    const sessionMock = {
      userId: () => 1,
      profile: signal({ fullName: 'Test User', currency: 'USD' }),
      session: signal({ fullName: 'Test User' })
    };
    const notificationsMock = {
      unreadCount: () => of(5)
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionMock },
        { provide: NotificationsApiService, useValue: notificationsMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
