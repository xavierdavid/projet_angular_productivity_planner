import { TestBed } from '@angular/core/testing';

import { LoginUserUseCase } from './login-user.use-case';

describe('LoginUserUseCase', () => {
  let service: LoginUserUseCase;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginUserUseCase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
