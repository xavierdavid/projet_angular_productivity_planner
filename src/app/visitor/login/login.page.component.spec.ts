import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login.page.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { LoginUserUseCase } from './domain/login-user.use-case';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let loginUserUseCase: LoginUserUseCase;
  let email: DebugElement;
  let password: DebugElement;
  let submitButton: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: LoginUserUseCase, useValue: {execute: jest.fn()}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    loginUserUseCase = TestBed.inject(LoginUserUseCase);
    email = fixture.debugElement.query(By.css('[data-testid="email"]'));
    password = fixture.debugElement.query(By.css('[data-testid="password"]'));
    submitButton = fixture.debugElement.query(By.css('[data-testid="submit-button"]'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when page load', ()=> {
    it('should display email field', () => {
      // Assert - Vérifier que l'email est bien présent
      expect(email).toBeTruthy();
    });
    
    it('should display password field', () => {
      // Assert - Vérifier que le password est bien présent
      expect(password).toBeTruthy();
    });
  });

  describe('when user interact with email field', () => {
    it('should display error message when field is empty', () => {
      // Act - On lance une action sur le champ 'email' 
      email.nativeElement.value = ''; // On vide la valeur du champ
      email.nativeElement.dispatchEvent(new Event('input')); // On interagit avec le champ à l'aide de l'évènement 'input'
      fixture.detectChanges(); // On détecte les changements sur le champ
      const error = fixture.debugElement.query(By.css('[data-testid="error-email-required"]')); // On récupère l'erreur 'email requis' dans le DOM
      const errorMessage = error.nativeElement.textContent // On récupère le contenu texte de l'erreur
      // Assert - On vérifie que lorsque le champ est vidé par l'utilisateur, un bloc s'affiche avec un message d'erreur
      expect(errorMessage).toContain('Email is required.'); 
    });
     
    it('should display error message when field do not contain a valid HTML5 email', () => {
      // Act
      email.nativeElement.value = 'invalid-email';
      email.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const error = fixture.debugElement.query(By.css('[data-testid="error-email-pattern"]'));
      const errorMessage = error.nativeElement.textContent;
      // Assert
      expect(errorMessage).toContain('Email must be valid.');
    });
  });  
  
  describe('when user interact with password field', () => {
    it('should display error message when field is empty', () => {
      // Act
      password.nativeElement.value = '';
      password.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const error = fixture.debugElement.query(By.css('[data-testid="error-password-required"]'));
      const errorMessage = error.nativeElement.textContent;
      // Assert
      expect(errorMessage).toContain('Password is required.');
    });

    it('should hide error message when field is empty', () => {
      // Act
      password.nativeElement.value = 'password-1234';
      password.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const error = fixture.debugElement.query(By.css('[data-testid="error-password-required"]'));
      // Assert
      expect(error).toBeNull();
    });
  });

  describe('when user submit a valid login form', () => {
    it('should call login use case with email and password', () => {
      // Arrange
      email.nativeElement.value = 'john.doe@acme.com';
      email.nativeElement.dispatchEvent(new Event('input'));
      password.nativeElement.value = 'password-1234';
      password.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Act
      submitButton.nativeElement.click();
      fixture.detectChanges();

      // Assert
      expect(loginUserUseCase.execute).toHaveBeenCalledTimes(1);
      expect(loginUserUseCase.execute).toHaveBeenCalledWith(
        email.nativeElement.value,
        password.nativeElement.value
      );
    });
  });

  describe('when user submit an invalid login form', () => {
    it('should not call login use case', () => {
      // Arrange
      email.nativeElement.value = 'invlid-email';
      email.nativeElement.dispatchEvent(new Event('input'));
      password.nativeElement.value = 'invalid-password';
      password.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Act
      submitButton.nativeElement.click();
      fixture.detectChanges();

      // Assert
      expect(loginUserUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
