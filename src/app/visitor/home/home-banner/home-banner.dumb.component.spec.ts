import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBannerDumbComponent } from './home-banner.dumb.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('HomeBannerDumbComponent', () => {
  let component: HomeBannerDumbComponent;
  let fixture: ComponentFixture<HomeBannerDumbComponent>;
  let title: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBannerDumbComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(HomeBannerDumbComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'expectedTitle');
    fixture.componentRef.setInput('description', 'expectedTDescription');
    fixture.componentRef.setInput('button', 'expectedButton');
    fixture.detectChanges();
  });

  beforeEach(() => {
    title = fixture.debugElement.query(By.css('[data-testid=banner-title]'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', ()=> {
    expect(title.nativeElement.textContent).toContain('expectedTitle');
  });
  
  it.todo('should display description');
  it.todo('should display button');
  it.todo('should trigger event on button click');
});
