import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageFeatureCardListDumbComponent } from './homepage-feature-card-list.dumb.component';
import { DebugElement } from '@angular/core';
import { FeatureCardList } from './homepage-feature-card-list.interface';
import { By } from '@angular/platform-browser';

describe('HomepageFeatureCardListDumbComponent', () => {
  let component: HomepageFeatureCardListDumbComponent;
  let fixture: ComponentFixture<HomepageFeatureCardListDumbComponent>;
  let cardList: DebugElement[];
  let cardTitleList: DebugElement[];

  const featureCardList: FeatureCardList = [
    { name: 'Feature 1', description: 'Description 1', icon: 'icon 1' },
    { name: 'Feature 2', description: 'Description 2', icon: 'icon 2' },
    { name: 'Feature 3', description: 'Description 3', icon: 'icon 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageFeatureCardListDumbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageFeatureCardListDumbComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('featureCardList', featureCardList);
    fixture.detectChanges();
  });

  beforeEach(() => {
    cardList = fixture.debugElement.queryAll(By.css('[data-testid="feature-card"]'));
    cardTitleList = fixture.debugElement.queryAll(By.css('[data-testid="feature-card-title"]'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct number of feature cards', () => {
    expect(cardList.length).toBe(3);
  });

  it('should display nothing if feature list is empty', () => {
    fixture.componentRef.setInput('featureCardList', []);
    fixture.detectChanges();
    cardList = fixture.debugElement.queryAll(
      By.css('[data-testid="feature-card"]')
    );
    expect(cardList.length).toBe(0);
  });

  it('should display correct titles in each card', () => {
    cardTitleList.forEach((title, index) => {
      expect(title.nativeElement.textContent).toContain(
        featureCardList[index].name
      );
    });
  });
});
