import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth';
import { provideRouter } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { SessionService } from '../../core/services/session.service';
import { of } from 'rxjs';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    const authApiMock = {
      login: () => of({ userId: 1 }),
      register: () => of({ userId: 1 }),
      getProfile: () => of({}),
      googleConfig: () => of({ clientId: 'test' })
    };
    const sessionMock = {
      isLoggedIn: () => false,
      setProfile: () => {},
      userId: () => 1
    };

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideRouter([]),
        { provide: AuthApiService, useValue: authApiMock },
        { provide: SessionService, useValue: sessionMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
